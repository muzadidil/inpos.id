/* INPOS Login v793: presentation-only enhancement for native biometric controls.
   This file does not read, submit, store, or change login credentials. */
(function(){'use strict';
 if(window.__INPOS_HOST_LOGIN_793__)return;
 window.__INPOS_HOST_LOGIN_793__=true;
 var fingerprint='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10a8 8 0 0 1 16 0M2 14v-4a10 10 0 0 1 20 0v3M7 11a5 5 0 0 1 10 0v3M10 12v5c0 2-.5 3.4-1 4m5-8v4c0 1.7-.4 3.1-1 4m-8-6c0 2-.3 3.7-1 5m13-2c.2.8.5 1.5.9 2"/></svg>';
 var icons={
  plus:'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
  refresh:'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 11a8 8 0 1 1-2-6M20 4v6h-6"/></svg>',
  trash:'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M10 4h4m4 3-1 14H7L6 7m4 4v7m4-7v7"/></svg>',
  check:'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m5 12 5 5L20 7"/></svg>'
 };
 function version(){
  var el=document.getElementById('inposLoginVersionV793');if(!el)return;
  var ua=navigator.userAgent||'';
  var match=ua.match(/INPOSCapacitor\/([0-9]+(?:\.[0-9]+){2})/i);
  // Never infer installed APK version from static website release or URL.
  el.textContent=match?'Versi '+match[1]:'Versi Web v793';
 }
 function visible(el){return !!el&&el.style.display!=='none'&&getComputedStyle(el).display!=='none';}
 function repaint(el,key,label,tag){
  if(!el)return;
  if(!el.querySelector('svg[data-inpos-host-v793]')||el.dataset.hostIcon793!==key){
   el.innerHTML=icons[key]||fingerprint;
   el.querySelector('svg').setAttribute('data-inpos-host-v793','1');
   el.dataset.hostIcon793=key;
  }
  el.setAttribute('aria-label',label);el.title=label;
  if(tag)el.classList.add(tag);
 }
 function linkBiometric(){
  var panel=document.getElementById('inposBiometricPanel122');
  var action=document.getElementById('inposBiometricInlineMount');
  var tools=document.getElementById('inposBiometricToolsMount');
  if(!panel||!action||!tools)return false;
  var unlock=document.getElementById('inposBiometricUnlock122');
  var enroll=document.getElementById('inposBiometricEnroll122');
  var disable=document.getElementById('inposBiometricDisable122');
  var status=document.getElementById('inposBiometricStatus122');
  if(!unlock||!enroll||!disable||!status)return false;
  if(unlock.parentNode!==action)action.appendChild(unlock);
  if(enroll.parentNode!==tools)tools.appendChild(enroll);
  if(disable.parentNode!==tools)tools.appendChild(disable);
  if(status.parentNode!==tools)tools.appendChild(status);
  panel.classList.add('inpos-host-panel-v793');
  var performing=false;
  function sync(){
   if(performing)return;
   performing=true;
   try {
    repaint(unlock,'finger','Masuk dengan sidik jari','inpos-biometric-icon-btn');
    unlock.classList.add('inpos-biometric-pulse');
    // Native bridge sets inline display according to biometric availability/enrollment.
    action.classList.toggle('ready',unlock.style.display!=='none');
    var hasSaved=unlock.style.display!=='none';
    repaint(enroll,hasSaved?'refresh':'plus',hasSaved?'Perbarui PIN untuk sidik jari':'Aktifkan sidik jari','inpos-biometric-tool');
    repaint(disable,'trash','Hapus login sidik jari dari perangkat ini','inpos-biometric-tool');
    var txt=(status.textContent||'').trim();
    if(/^login sidik jari aktif di perangkat ini\.?$/i.test(txt)){
     status.classList.add('inpos-bio-active-v793');
     status.setAttribute('aria-label',txt);status.title=txt;
     status.innerHTML=icons.check;
    } else if(!status.querySelector('svg')){
     status.classList.remove('inpos-bio-active-v793');
     status.removeAttribute('title');
     status.removeAttribute('aria-label');
    }
    status.classList.add('inpos-biometric-status');
    tools.classList.toggle('ready',enroll.style.display!=='none'||disable.style.display!=='none'||!!status.textContent.trim()||!!status.querySelector('svg'));
   }finally{performing=false;}
  }
  sync();
  if(!panel.__inposHostObserver793){
   var obs=new MutationObserver(sync);
   [unlock,enroll,disable,status].forEach(function(b){obs.observe(b,{attributes:true,attributeFilter:['style'],childList:true,characterData:true,subtree:true});});
   panel.__inposHostObserver793=obs;
  }
  return true;
 }
 function boot(){
  version();
  var year=document.getElementById('inposCopyrightYear');if(year)year.textContent=String(new Date().getFullYear());
  if(linkBiometric())return;
  var observer=new MutationObserver(function(){if(linkBiometric())observer.disconnect();});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){observer.disconnect();},20000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
