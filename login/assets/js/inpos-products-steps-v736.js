/* INPOS v742 • Tambah/Edit Produk tanpa navigasi wizard lama; data toko tidak berubah. */
(function(){
 'use strict';
 const rootId='screen-productform',cssRoot='#'+rootId;
 const byId=id=>document.getElementById(id);
 const root=()=>byId(rootId);
 const sections=()=>Array.from(root()?.querySelectorAll('.v94-section')||[]).filter(el=>{
   if(el.hidden||el.classList.contains('v95-global-feature-hidden'))return false;
   const style=getComputedStyle(el);
   return style.display!=='none'&&style.visibility!=='hidden';
 });
 const input=id=>byId(id);
 const value=id=>String(input(id)?.value??'').trim();
 const visible=el=>!!el&&!el.hidden&&getComputedStyle(el).display!=='none';
 function activate(section,focus=null){
   if(!section)return;
   const list=sections();
   for(const item of list){
     const show=item===section;
     item.classList.toggle('v99-open',show);
     item.querySelector('.v94-section-head')?.setAttribute('aria-expanded',String(show));
   }
   root().dataset.inposStep736=String(list.indexOf(section)+1);
   paint();
   if(focus){setTimeout(()=>{if(document.activeElement?.closest(cssRoot)&&!root()?.contains(document.activeElement))return;focus.focus({preventScroll:true});focus.scrollIntoView({block:'center',behavior:'smooth'})},30)}
   else setTimeout(()=>section.scrollIntoView({block:'start',behavior:'smooth'}),25);
 }
 function fail(id,message){
   const el=input(id),section=el?.closest('.v94-section');
   if(section)activate(section,el);
   if(el){el.setAttribute('aria-invalid','true');el.setCustomValidity?.('');}
   if(typeof window.toast==='function')window.toast(message,'error');
   return false;
 }
 function positiveWhole(id){
   const txt=value(id);
   return txt!==''&&/^\d+$/.test(txt)&&Number.isSafeInteger(Number(txt));
 }
 function priceOk(id){
   const raw=value(id);
   if(!raw)return false;
   const stripped=raw.replace(/[\s.,Rp]/gi,'');
   return /^\d+$/.test(stripped)&&Number.isSafeInteger(Number(stripped));
 }
 function isEnabledPack(){
   return visible(input('mpPackDetailV687'));
 }
 function validate(section){
   if(!section)return true;
   if(section.classList.contains('v94-info-section')){
     if(!value('mpName'))return fail('mpName','Nama produk wajib diisi.');
     if(!value('mpCategory'))return fail('mpCategory','Pilih kategori produk.');
     if(!value('mpUnit'))return fail('mpUnit','Pilih satuan produk.');
     if(isEnabledPack()){
       if(!positiveWhole('mpPackFactorV687')||Number(value('mpPackFactorV687'))<2||Number(value('mpPackFactorV687'))>100000)return fail('mpPackFactorV687','Isi kemasan harus 2–100.000 satuan ecer.');
       if(!value('mpEcerUnitV687')||value('mpEcerUnitV687').toLowerCase()===value('mpUnit').toLowerCase())return fail('mpEcerUnitV687','Pilih satuan ecer yang berbeda dari kemasan.');
     }
   }
   if(section.classList.contains('v94-identity-section')){
     const sku=input('mpSku');if(sku&&!sku.disabled&&sku.maxLength>0&&sku.value.length>sku.maxLength)return fail('mpSku','SKU terlalu panjang.');
   }
   if(section.classList.contains('v94-price-section')){
     for(const id of ['mpCost','mpPrice']){
       const el=input(id);if(el&&!el.disabled&&visible(el.closest('.mobile-product-form-field'))&&!(id==='mpPrice'&&input('mpManualPrice')?.checked)&&!priceOk(id))return fail(id,'Masukkan nominal '+(id==='mpCost'?'harga modal':'harga jual')+' yang benar.');
     }
     if(isEnabledPack())for(const id of ['mpPackBuyV687','mpPackSaleV687']){
       if(!priceOk(id))return fail(id,'Harga beli dan harga jual kemasan harus berupa angka.');
     }
     const noStock=!!input('mpNoStock')?.checked;
     const service=input('mpProductKind')?.value==='service';
     const serviceNoStock=service&&!input('mpServiceStockEnabledV517')?.checked;
     if(!noStock&&!serviceNoStock){
       const editing=typeof mobileProductFormEditingId!=='undefined'&&mobileProductFormEditingId!==null;
       if(!editing&&!positiveWhole('mpStock'))return fail('mpStock','Stok awal harus bilangan bulat 0 atau lebih.');
       if(!positiveWhole('mpMin'))return fail('mpMin','Minimum stok harus bilangan bulat 0 atau lebih.');
     }
   }
   if(section.classList.contains('v94-variant-section')&&input('mpVariantsEnabled')?.checked){
     if(!value('mpVariants').split(',').some(v=>v.trim()))return fail('mpVariants','Isi minimal satu nama varian produk.');
   }
   if(section.classList.contains('v94-expiry-section')&&input('mpExpiryType')?.value==='expired'){
     const date=value('mpExpiry');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))return fail('mpExpiry','Pilih tanggal expired yang benar.');
   }
   return true;
 }
 function paint(){
   // Tetap rapikan nomor bagian yang aktif tanpa menampilkan footer navigasi.
   sections().forEach((section,i)=>{
     const marker=section.querySelector('.v94-step');
     if(marker&&marker.textContent!==String(i+1))marker.textContent=String(i+1);
   });
 }
function removeOldProgress(){
   const page=root();if(!page)return;
   // Hapus SEMUA markup wizard bawaan versi lama; tetap aman saat form dirender ulang.
   const legacySelector='#inposStepsBar736,.inpos-products-step-bar-v736,#inposStepsLabel736,#inposStepPrev736,#inposStepNext736,.inpos-steps-progress,.product-step-progress,.mobile-product-step-progress,.product-form-step-progress,.inpos-wizard-progress,[data-product-step-progress]';
   page.querySelectorAll(legacySelector).forEach(el=>el.remove());
   // Jika versi lama masih menulis indikator terpisah, hapus labelnya tanpa menyentuh isian form.
   const oldLabel=/^\s*Langkah\s+\d+\s+dari\s+\d+(?:\s*[•·|\-]\s*.*)?\s*$/i;
   const heading=byId('mobileProductFormSubheading');
   if(heading&&oldLabel.test(heading.textContent||''))heading.textContent='Ketuk bagian yang ingin diisi atau diubah.';
   page.querySelectorAll('span,small,p,div').forEach(el=>{
     if(el!==heading&&!el.children.length&&oldLabel.test(el.textContent||''))el.remove();
   });
 }
 function watchOldProgress(){
   const page=root();if(!page||page.dataset.inposOldWizardObserver742==='1')return;
   page.dataset.inposOldWizardObserver742='1';
   // Versi lama dapat memasukkan ulang navigasi saat Tambah/Edit atau pergantian fitur.
   const selector='#inposStepsBar736,.inpos-products-step-bar-v736,#inposStepsLabel736,#inposStepPrev736,#inposStepNext736,[data-product-step-progress],.inpos-wizard-progress';
   const watcher=new MutationObserver(records=>{
     for(const record of records){
       for(const node of record.addedNodes){
         if(node.nodeType!==1)continue;
         if(node.matches?.(selector)||node.querySelector?.(selector)){
           removeOldProgress();
           return;
         }
         if(node.matches?.('span,small,p,div')&&/^\s*Langkah\s+\d+\s+dari\s+\d+/i.test(node.textContent||'')){
           removeOldProgress();return;
         }
       }
     }
   });
   watcher.observe(page,{childList:true,subtree:true});
 }

 function attach(){
   const page=root();if(!page)return;
   // Hilangkan footer wizard lama jika masih ada setelah update/hot reload.
   byId('inposStepsBar736')?.remove();
   removeOldProgress();
   watchOldProgress();
   if(page.dataset.inposStepBound736!=='1'){
     page.dataset.inposStepBound736='1';
     page.addEventListener('click',ev=>{
       const head=ev.target.closest('.v94-section-head');
       if(head&&page.contains(head))setTimeout(paint,0);
     });
     page.addEventListener('change',()=>setTimeout(paint,0));
     page.addEventListener('input',ev=>{
       if(ev.target?.hasAttribute('aria-invalid'))ev.target.removeAttribute('aria-invalid');
     });
   }
   paint();
   removeOldProgress();
 }
 function afterOpen(){
   attach();
   const all=sections();if(!all.length)return;
   activate(all[0]);
   [60,180].forEach(ms=>setTimeout(()=>{attach();paint()},ms));
 }
 const beforeOpen=window.openMobileProductForm;
 if(typeof beforeOpen==='function'){
   window.openMobileProductForm=function(){const result=beforeOpen.apply(this,arguments);setTimeout(afterOpen,90);return result};
   try{openMobileProductForm=window.openMobileProductForm}catch(_){}
 }
 const beforeSave=window.saveMobileProductForm;
 if(typeof beforeSave==='function'){
   window.saveMobileProductForm=function(){
     for(const section of sections())if(!validate(section))return false;
     return beforeSave.apply(this,arguments);
   };
   try{saveMobileProductForm=window.saveMobileProductForm}catch(_){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
 window.inposProductStepsV736={sections,validate,paint};
})();
