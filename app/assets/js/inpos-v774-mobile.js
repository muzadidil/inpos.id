/* INPOS v774: keep the three printer actions immediately above bottom nav. */
(()=>{'use strict';
  const ID='inposPrinterActionDock';
  let queued=false;
  function dock(){
    if(window.innerWidth>599){
      const existing=document.getElementById(ID);
      const source=document.getElementById('printerSettingBody');
      if(existing&&source&&existing.children.length){
        const last=source.querySelector('.printer-setting-card:last-of-type');
        if(last){const actions=document.createElement('div');actions.className='printer-page-actions';actions.replaceChildren(...Array.from(existing.children));last.appendChild(actions);}
        existing.remove();
      }
      return;
    }
    const origin=document.querySelector('#printerSettingBody .printer-page-actions');
    let target=document.getElementById(ID);
    if(origin){
      if(!target){target=document.createElement('div');target.id=ID;document.body.appendChild(target);}
      target.replaceChildren(...Array.from(origin.children));
      origin.remove();
    }
    const nav=document.querySelector('.mobile-bottom');
    if(nav){
      const height=Math.round(nav.getBoundingClientRect().height);
      if(height>30&&height<180)document.documentElement.style.setProperty('--inpos-printer-nav-height',height+'px');
    }
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;dock()});}
  function setup(){
    const body=document.getElementById('printerSettingBody');
    if(body)new MutationObserver(schedule).observe(body,{childList:true});
    window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

/* Capacitor 1.0.6 status bar sync. Called only if the native plugin is present. */
(()=>{'use strict';
  let previous=null;
  function sync(){
    const dark=document.documentElement.dataset.theme==='dark';
    if(dark===previous)return;
    const system=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.INPOSSystemUI;
    if(!system||typeof system.setTheme!=='function')return;
    previous=dark;
    Promise.resolve(system.setTheme({dark})).catch(()=>{previous=null});
  }
  const run=()=>{sync();new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* INPOS v775: align tablet portrait Dashboard to actual top edge of bottom navigation. */
(()=>{'use strict';
 let raf=0, previous='';
 const root=document.documentElement;
 function sync(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
  const body=document.body, nav=document.querySelector('.mobile-bottom');
  const container=document.querySelector('.main > .container');
  const dashboard=document.getElementById('screen-dashboard');
  const portrait=innerWidth>=600&&innerWidth<=1024&&innerHeight>innerWidth;
  if(!portrait||!body.classList.contains('mobile-dashboard-active')||!nav||!container||!dashboard||getComputedStyle(nav).display==='none'){
   if(previous){root.style.removeProperty('--inpos-tablet-dashboard-height');root.classList.remove('inpos-tablet-portrait-v775');previous='';}
   return;
  }
  const top=container.getBoundingClientRect().top;
  const bottom=nav.getBoundingClientRect().top;
  const available=Math.floor(bottom-top);
  if(available<200||bottom>innerHeight+4)return;
  const px=available+'px';
  if(previous!==px){previous=px;root.style.setProperty('--inpos-tablet-dashboard-height',px);root.classList.add('inpos-tablet-portrait-v775');}
 });}
 function ready(){
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',sync,{passive:true});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class','data-mobile-screen']});
  const nav=document.querySelector('.mobile-bottom');if(nav&&typeof ResizeObserver==='function')new ResizeObserver(sync).observe(nav);
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
