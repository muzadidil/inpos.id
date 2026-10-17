(function(){'use strict';
 const controls=Array.from(document.querySelectorAll('[data-inpos-browser-fullscreen]'));
 if(!controls.length)return;
 const expand="<svg viewBox=\"0 0 24 24\" width=\"19\" height=\"19\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5\"/></svg>",collapse="<svg viewBox=\"0 0 24 24\" width=\"19\" height=\"19\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 9h6V3M21 9h-6V3M3 15h6v6M21 15h-6v6\"/></svg>";
 const isFull=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement);
 let noteTimer=0;
 function feedback(message){
  let box=document.getElementById('inposFullscreenFeedback');
  if(!box){box=document.createElement('div');box.id='inposFullscreenFeedback';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.appendChild(box)}
  box.textContent=message;box.hidden=false;
  clearTimeout(noteTimer);noteTimer=setTimeout(()=>{box.hidden=true},4000);
 }
 function render(){
  const on=isFull();document.documentElement.classList.toggle('inpos-browser-fullscreen-on',on);
  controls.forEach(button=>{
   button.innerHTML=on?collapse:expand;
   button.setAttribute('aria-label',on?'Keluar Layar Penuh':'Masuk Layar Penuh');
   button.setAttribute('title',on?'Keluar Layar Penuh':'Layar Penuh');
   button.setAttribute('aria-pressed',String(on));
  });
 }
 async function toggle(){
  try{
   if(isFull()){
    if(document.exitFullscreen)await document.exitFullscreen();
    else if(document.webkitExitFullscreen)await document.webkitExitFullscreen();
    else feedback('Keluar dari layar penuh lewat kontrol browser.');
   }else{
    const element=document.documentElement;
    if(element.requestFullscreen)await element.requestFullscreen({navigationUI:'hide'});
    else if(element.webkitRequestFullscreen)await element.webkitRequestFullscreen();
    else {feedback('Browser ini belum mendukung Layar Penuh. Gunakan mode aplikasi/PWA dari menu browser.');return}
   }
  }catch(err){feedback('Layar Penuh tidak diizinkan oleh browser atau halaman sematan.');}
  render();
 }
 controls.forEach(button=>button.addEventListener('click',toggle));
 document.addEventListener('fullscreenchange',render);
 document.addEventListener('webkitfullscreenchange',render);
 render();
})();
