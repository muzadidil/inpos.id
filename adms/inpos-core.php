<?php
declare(strict_types=1);
/**
 * INPOS frontend PHP bridge v769. Backend URL is FIXED; never accept user-provided URLs.
 * Uses HTTPS with certificate verification; same-origin browser API via PHP -> api.inpos.id.
 * Requires PHP 8+ and ext-curl on Hostinger PHP/HTML site.
 */
const INPOS_API_URL = 'https://api.inpos.id';
const INPOS_MAX_BODY = 15728640;

function inpos_json_safe(mixed $value): string {
    return json_encode($value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
}
function inpos_backend(string $path, string $method='GET', ?string $body=null, array $headers=[], int $timeout=12): array {
    $pathname=(string)(parse_url($path,PHP_URL_PATH)??'');
    if (strlen($path)>4096 || preg_match('/[\\r\\n]/',$path) || !preg_match('~^/(?:api/[a-zA-Z0-9/_-]+|katalog/[a-z0-9-]{1,40}\\.json)$~D', $pathname)) {
        return ['status'=>400, 'body'=>'{"ok":false,"error":"Alamat API tidak valid."}', 'type'=>'application/json', 'cookies'=>[]];
    }
    if (!function_exists('curl_init')) {
        return ['status'=>503, 'body'=>'{"ok":false,"error":"Ekstensi PHP cURL belum aktif."}', 'type'=>'application/json', 'cookies'=>[]];
    }
    $ch = curl_init(INPOS_API_URL.$path);
    $cookieValues=[];
    foreach (['inpos_session','inpos_admin_session'] as $cookieName) {
        $value = $_COOKIE[$cookieName] ?? '';
        if (is_string($value) && preg_match('/^[a-f0-9]{64}$/D', $value)) {
            $cookieValues[]=$cookieName.'='.$value;
        }
    }
    if (count($cookieValues)) $headers[]='Cookie: '.implode('; ', $cookieValues);
    $cookies=[];
    $type='application/json; charset=utf-8';
    $location='';
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER=>true, CURLOPT_CUSTOMREQUEST=>$method,
        CURLOPT_CONNECTTIMEOUT=>5, CURLOPT_TIMEOUT=>$timeout,
        CURLOPT_FOLLOWLOCATION=>false,
        CURLOPT_SSL_VERIFYPEER=>true, CURLOPT_SSL_VERIFYHOST=>2,
        CURLOPT_HTTPHEADER=>$headers,
        CURLOPT_HEADERFUNCTION=>static function($ch, $line) use (&$cookies, &$type, &$location): int {
            if (stripos($line,'Set-Cookie:')===0) {
                $cookie=trim(substr($line,11));
                if (preg_match('/^(inpos_session|inpos_admin_session)=/', $cookie)) $cookies[]=$cookie;
            } elseif (stripos($line,'Content-Type:')===0) {
                $candidate=trim(substr($line,13));
                if (preg_match('~^(?:application/json|text/plain)(?:[; ]|$)~i', $candidate)) $type=$candidate;
            } elseif (stripos($line,'Location:')===0) $location=trim(substr($line,9));
            return strlen($line);
        }
    ]);
    if ($body!==null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $response=curl_exec($ch);
    $status=(int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err=curl_errno($ch);
    curl_close($ch);
    if ($response===false || $err || !$status) {
        return ['status'=>503,'body'=>'{"ok":false,"error":"Backend API INPOS tidak merespons. Periksa api.inpos.id."}','type'=>'application/json','cookies'=>[]];
    }
    if ($location!=='' && preg_match('~^https://(?:[a-z0-9-]+\\.)?inpos\\.id(?:/|$)~i',$location)) {
        $allowedLocation=$location;
    } else $allowedLocation='';
    return ['status'=>$status,'body'=>(string)$response,'type'=>$type,'cookies'=>$cookies,'location'=>$allowedLocation];
}
function inpos_api_proxy(): never {
    $path=trim((string)($_GET['__path'] ?? ''),'/');
    if (!preg_match('~^(?:api/[a-zA-Z0-9/_-]+|katalog/[a-z0-9-]{1,40}\\.json)$~D', $path)) {
        http_response_code(404); header('Content-Type: application/json'); echo '{"ok":false,"error":"Tidak ditemukan."}'; exit;
    }
    $method=$_SERVER['REQUEST_METHOD']??'GET';
    if (!in_array($method,['GET','HEAD','POST','PUT','PATCH','DELETE'],true)) {
        http_response_code(405); header('Allow: GET, HEAD, POST, PUT, PATCH, DELETE'); exit;
    }
    if ((int)($_SERVER['CONTENT_LENGTH']??0)>INPOS_MAX_BODY) {
        http_response_code(413); header('Content-Type: application/json');echo '{"ok":false,"error":"Payload terlalu besar."}';exit;
    }
    $body=in_array($method,['POST','PUT','PATCH','DELETE'],true)?file_get_contents('php://input',false,null,0,INPOS_MAX_BODY+1):null;
    if ($body!==null && strlen($body)>INPOS_MAX_BODY) {
        http_response_code(413);header('Content-Type: application/json');echo '{"ok":false,"error":"Payload terlalu besar."}';exit;
    }
    $forward=[];
    foreach (['CONTENT_TYPE'=>'Content-Type','HTTP_ACCEPT'=>'Accept','HTTP_X_INPOS_REQUEST'=>'X-INPOS-Request','HTTP_X_INPOS_TENANT'=>'X-INPOS-Tenant','HTTP_X_INPOS_USER'=>'X-INPOS-User','HTTP_IF_MATCH'=>'If-Match'] as $source=>$dest) {
        $v=$_SERVER[$source]??'';
        if (is_string($v) && $v!=='' && !preg_match('/[\\r\\n]/',$v))$forward[]=$dest.': '.$v;
    }
    // Do NOT forward browser Origin or Host. Only this controlled, same-origin PHP gateway
    // talks to the fixed HTTPS backend. Do NOT rewrite session cookies in JS.
    $query=(string)($_SERVER['QUERY_STRING']??'');
    $terms=array_filter(explode('&',$query),static function($part){return !str_starts_with($part,'__path=') && $part!=='__path';});
    $urlPath='/'.$path.(count($terms)?'?'.implode('&',$terms):'');
    $resp=inpos_backend($urlPath,$method,$body,$forward,30);
    http_response_code($resp['status']);
    header('Content-Type: '.$resp['type']);
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    foreach ($resp['cookies'] as $cookie)header('Set-Cookie: '.$cookie,false);
    if (!empty($resp['location']))header('Location: '.$resp['location']);
    if ($method!=='HEAD')echo $resp['body'];
    exit;
}
function inpos_api_json(string $path, int $timeout=8): array {
    $r=inpos_backend($path,'GET',null,['Accept: application/json'],$timeout);
    $data=json_decode($r['body'],true);
    return ['status'=>$r['status'],'data'=>is_array($data)?$data:[]];
}
function inpos_page(string $bootstrap=''): never {
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, private, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    $html=file_get_contents(__DIR__.'/page-template.html');
    if ($html===false){http_response_code(500);echo 'Template INPOS tidak ditemukan.';exit;}
    $safe='window.INPOS_FRONTEND_RELEASE='.inpos_json_safe('v785-admin-settings-compact-hosted').';window.INPOS_LOCAL_SERVER=true;'.$bootstrap;
    echo preg_replace_callback('/<head[^>]*>/i',static function($m) use ($safe){return $m[0].'<script>'.$safe.'</script>';},$html,1);
    exit;
}
function inpos_offline(int $code=503): never {
    http_response_code($code);header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');
    header('X-Frame-Options: DENY');
    echo '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>INPOS - Koneksi API</title><style>body{font:16px system-ui,sans-serif;background:#fafafa;color:#242424;max-width:580px;margin:12vh auto;padding:24px}h1{font-size:25px}p{line-height:1.6}</style><h1>INPOS belum dapat terhubung ke backend</h1><p>Website frontend sudah terpasang, tetapi sesi atau database API belum bisa diperiksa. Periksa <strong>api.inpos.id/api/health</strong> dan log runtime Hostinger. Tidak ada data demo yang dijalankan.</p></html>';
    exit;
}
