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
$bootstrap='(function(){try{'
    .'var tid='.inpos_json_safe((string)$tenant).',uid='.inpos_json_safe($uid).',rev='.$rev.';'
    .'var mk="inpos_offline_meta_v1",dk="myposid_demo_v3",old=null;'
    .'try{old=JSON.parse(localStorage.getItem(mk)||"null")}catch(_){}'
    .'var dirty=localStorage.getItem("inpos_sync_dirty")==="1";'
    .'var same=old&&String(old.tenantId)===tid&&String(old.userId)===uid;'
    .'var keep=dirty&&same&&Number.isSafeInteger(old.revision)&&old.revision>=0&&!!localStorage.getItem(dk);'
    .'if(dirty&&!keep){'
      .'var oldData=localStorage.getItem(dk);'
      .'if(oldData){try{localStorage.setItem("inpos_orphan_sync_backup_"+Date.now(),oldData)}catch(_){}}'
      .'localStorage.removeItem("inpos_sync_dirty");'
    .'}'
    .'window.INPOS_BOOT_REVISION=keep?old.revision:rev;'
    .'window.INPOS_BOOT_TENANT=tid;window.INPOS_BOOT_USER=uid;'
    .'window.INPOS_BOOT_LOCAL_DIRTY=!!keep;'
    .'if(!keep){localStorage.setItem(dk,'.inpos_json_safe(json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE)).');}'
    .'localStorage.setItem(mk,JSON.stringify({tenantId:tid,userId:uid,revision:keep?old.revision:rev,lastOnlineAt:Date.now()}));'
    .'localStorage.setItem("inpos_device_login_v633",JSON.stringify({v:1,mode:"remember",employeeId:uid}));'
    .'}catch(e){console.error("INPOS offline bootstrap",e)}})();';
inpos_page($bootstrap);
