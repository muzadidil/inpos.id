<?php
declare(strict_types=1);
require __DIR__.'/inpos-core.php';
$me=inpos_api_json('/api/auth/me',8);
if ($me['status']===401 || $me['status']===403) {header('Cache-Control: no-store');header('Location: https://login.inpos.id/',true,302);exit;}
if ($me['status']!==200 || empty($me['data']['ok'])) inpos_offline();
if (($me['data']['role']??'')==='superadmin') {header('Location: https://adms.inpos.id/',true,302);exit;}
$state=inpos_api_json('/api/tenant/state',15);
if ($state['status']===401) {header('Location: https://login.inpos.id/',true,302);exit;}
if ($state['status']!==200 || empty($state['data']['ok']) || !is_array($state['data']['state']??null)) inpos_offline();
$data=$state['data']['state'];
if (!is_array($data['settings']??null))$data['settings']=[];
$user=$me['data']['user']??[];
$data['settings']['activeEmployeeId']=(string)($user['id']??$state['data']['user_id']??'');
$data['settings']['cashier']=(string)($user['display_name']??$user['name']??'Kasir');
$data['settings']['employeeLoggedOut']=false;
$rev=(int)($state['data']['revision']??0);
$tenant=(int)($state['data']['tenant_id']??0);
$uid=(string)($state['data']['user_id']??$user['id']??'');
$bootstrap='window.INPOS_BOOT_REVISION='.$rev.';window.INPOS_BOOT_TENANT='.$tenant.';window.INPOS_BOOT_USER='.inpos_json_safe($uid).';'
.'try{localStorage.removeItem("myposid_demo_v3");localStorage.setItem("myposid_demo_v3",'.inpos_json_safe(json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE)).');'
.'localStorage.setItem("inpos_device_login_v633",JSON.stringify({v:1,mode:"remember",employeeId:'.inpos_json_safe($uid).'}));}catch(e){console.error("Gagal memuat data INPOS dari API",e);}';
inpos_page($bootstrap);
