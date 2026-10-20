<?php
declare(strict_types=1);
require __DIR__.'/inpos-core.php';
$public=inpos_api_json('/api/public/referrals',6);
$state=['tenants'=> $public['data']['tenants']??[], 'config'=>$public['data']['config']??[]];
$bootstrap='try{localStorage.setItem("inpos_demo_public_state_v1",'.inpos_json_safe(json_encode($state,JSON_UNESCAPED_UNICODE)).');}catch(e){}';
// No local demo credentials or sample registration are injected; /api/* uses live backend.
inpos_page($bootstrap);
