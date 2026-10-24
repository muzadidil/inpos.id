<?php
declare(strict_types=1);
require __DIR__.'/inpos-core.php';
$state=inpos_api_json('/api/admin/state',10);
if ($state['status']!==401 && $state['status']!==403 && $state['status']!==200)inpos_offline();
$bootstrap='';
if($state['status']===200 && !empty($state['data']['ok']) && is_array($state['data']['state']??null)){
 $rev=(int)($state['data']['revision']??0);
 $auth=inpos_api_json('/api/admin/me',8);
 $who=($auth['status']===200)?($auth['data']['user']??[]):[];
 $username=is_array($who)?(string)($who['username']??''):'';
 $isRoot=$username==='superinpos';
 $bootstrap='document.documentElement.dataset.saAuth="ready";window.INPOS_ADMIN_USER='.inpos_json_safe($username).';window.INPOS_ADMIN_IS_ROOT='.($isRoot?'true':'false').';window.INPOS_DB_ENGINE="mariadb";window.INPOS_ADMIN_REVISION='.$rev.';'
 .'try{localStorage.setItem("inpos_super_admin_subscriptions_demo_v3",'.inpos_json_safe(json_encode($state['data']['state'],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE)).');}catch(e){}';
} else {
 // Logged-out page must not expose a cached Super Admin state from a prior session.
 $bootstrap='try{localStorage.removeItem("inpos_super_admin_subscriptions_demo_v3");}catch(e){}';
}
inpos_page($bootstrap);
