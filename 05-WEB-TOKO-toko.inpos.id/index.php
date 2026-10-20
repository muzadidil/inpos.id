<?php
declare(strict_types=1);
require __DIR__.'/inpos-core.php';
$path=(string)(parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH)??'/');
if($path!=='/' && $path!=='/index.php') {
 $slug=trim($path,'/');
 if(!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$slug) || strlen($slug)>40) {
  http_response_code(404);header('Content-Type: text/plain; charset=utf-8');echo 'Alamat toko tidak valid.';exit;
 }
 if(str_ends_with($path,'/')) {
  header('Location: /'.$slug,true,301);exit;
 }
}
inpos_page();
