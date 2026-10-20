
(function(){
'use strict';
const VERSION='INPOS v92';
const EPS=1e-9;
let mobileVariantStockDraftV92={};
let desktopVariantStockDraftV92={};
let mobileOriginalVariantStocksV92={};
let desktopOriginalVariantStocksV92={};
let desktopEditingProductIdV92=null;
function n92(v){
const n=Number(v);
return Number.isFinite(n)?Math.max(0,n):0;
}
function key92(v){
return String(v||'Default').trim()||'Default';
}
function esc92(v){
try{return esc(v)}catch(e){return String(v??'')}
}
function rp92(v){
try{return rupiah(v)}catch(e){return'Rp'+Math.round(n92(v)).toLocaleString('id-ID')}
}
function qtyText92(v){
try{
if(typeof qtyTextV314==='function')return qtyTextV314(v);
if(typeof stockQtyTextV227==='function')return stockQtyTextV227(v);
}catch(e){}
return n92(v).toLocaleString('id-ID',{maximumFractionDigits:3});
}
function qtyNorm92(p,v){
try{
if(typeof qtyNormalizeProductV314==='function')return qtyNormalizeProductV314(p,v,0);
if(typeof stockQtyIntV227==='function')return stockQtyIntV227(v);
}catch(e){}
return Math.round(n92(v)*1000)/1000;
}
function variantNames92(p){
const rows=Array.isArray(p?.variants)
?p.variants.map(v=>key92(v)).filter(Boolean)
:[];
return rows.length?[...new Set(rows)]:['Default'];
}
function hasRealVariants92(p){
try{return typeof productVariantsActive==='function'?productVariantsActive(p):variantNames92(p).some(v=>v!=='Default')}
catch(e){return variantNames92(p).some(v=>v!=='Default')}
}
function variantMode92(p){
if(p?.variantPriceMode==='price'||p?.variantPriceMode==='extra')return p.variantPriceMode;
try{
if(typeof productVariantPriceModeV91==='function')return productVariantPriceModeV91(p);
}catch(e){}
return Object.values(p?.variantPrices||{}).some(v=>n92(v)>0)?'price':'extra';
}
function variantStockEnabled92(p){
return!!(p&&!p.noStock&&hasRealVariants92(p)&&variantMode92(p)==='price');
}
function variantKey92(p,variant){
const names=variantNames92(p);
const raw=key92(variant);
if(names.includes(raw))return raw;
if(names.includes('Default'))return'Default';
return names[0]||'Default';
}
function variantBuyPrice92(p,variant){
const k=variantKey92(p,variant);
const direct=n92(p?.variantBuyPrices?.[k]);
return direct>0?direct:n92(p?.cost);
}
function variantSalePrice92(p,variant){
try{return n92(productPriceWithVariant(p,variantKey92(p,variant)))}
catch(e){return n92(p?.price)}
}
function ensureVariantStocks92(p,{seed=true}={}){
if(!p||!variantStockEnabled92(p))return false;
const names=variantNames92(p);
const old=(p.variantStocks&&typeof p.variantStocks==='object'&&!Array.isArray(p.variantStocks))
?p.variantStocks:{};
const next={};
let changed=false;
names.forEach(v=>next[v]=qtyNorm92(p,old[v]??0));
let orphan=0;
Object.keys(old).forEach(k=>{
if(!names.includes(k))orphan+=n92(old[k]);
});
const initialized=p.variantStockInitializedV92===true;
const mappedTotal=Object.values(next).reduce((a,b)=>a+n92(b),0);
if(seed&&!initialized&&mappedTotal<=EPS&&n92(p.stock)>EPS){
next[names[0]]=qtyNorm92(p,n92(p.stock));
changed=true;
}
if(orphan>EPS){
next[names[0]]=qtyNorm92(p,n92(next[names[0]])+orphan);
changed=true;
}
if(JSON.stringify(old)!==JSON.stringify(next))changed=true;
p.variantStocks=next;
p.variantStockInitializedV92=true;
syncVariantAggregate92(p);
return changed;
}
function variantStock92(p,variant){
if(!variantStockEnabled92(p))return n92(p?.stock);
ensureVariantStocks92(p);
return n92(p.variantStocks?.[variantKey92(p,variant)]);
}
function syncVariantAggregate92(p){
if(!p||!variantStockEnabled92(p))return n92(p?.stock);
const names=variantNames92(p);
const total=names.reduce((t,v)=>t+n92(p.variantStocks?.[v]),0);
p.stock=qtyNorm92(p,total);
if(total>EPS){
let value=0;
names.forEach(v=>value+=n92(p.variantStocks?.[v])*variantBuyPrice92(p,v));
if(value>EPS)p.cost=Math.max(0,Math.round(value/total));
}
return p.stock;
}
function setVariantStock92(p,variant,value){
if(!variantStockEnabled92(p))return;
ensureVariantStocks92(p);
const k=variantKey92(p,variant);
p.variantStocks[k]=qtyNorm92(p,value);
syncVariantAggregate92(p);
}
function adjustVariantStock92(p,variant,delta){
if(!variantStockEnabled92(p))return;
ensureVariantStocks92(p);
const k=variantKey92(p,variant);
p.variantStocks[k]=qtyNorm92(p,Math.max(0,n92(p.variantStocks[k])+Number(delta||0)));
syncVariantAggregate92(p);
}
function normalizeAllVariantStocks92(){
let changed=false;
try{
(db.products||[]).forEach(p=>{
if(variantStockEnabled92(p)){
const before=JSON.stringify([p.variantStocks,p.stock,p.cost,p.variantStockInitializedV92]);
ensureVariantStocks92(p);
if(before!==JSON.stringify([p.variantStocks,p.stock,p.cost,p.variantStockInitializedV92]))changed=true;
}
});
}catch(e){console.error(VERSION,'normalize',e)}
return changed;
}
function variantModeFromDOM92(kind){
const wrap=document.querySelector(`.variant-mode-wrap-v91[data-variant-mode-kind="${kind}"]`);
if(!wrap)return'extra';
const buttons=[...wrap.querySelectorAll('.variant-mode-switch-v91 button')];
return buttons[0]?.classList.contains('active')?'price':'extra';
}
function variantNamesFromForm92(kind){
const id=kind==='desktop'?'pVariants':'mpVariants';
const raw=String(document.getElementById(id)?.value||'');
try{
if(typeof variantNamesFromValue==='function')return variantNamesFromValue(raw);
}catch(e){}
const rows=[...new Set(raw.split(',').map(v=>v.trim()).filter(Boolean))];
return rows.length?rows:['Default'];
}
function productFormNoStock92(kind){
if(kind==='mobile')return!!document.getElementById('mpNoStock')?.checked;
const p=desktopEditingProductIdV92!=null?getProduct(Number(desktopEditingProductIdV92)):null;
return!!p?.noStock;
}
function productFormFractional92(kind){
if(kind==='mobile'){
const sw=document.getElementById('mpFractionalQtyV314');
if(sw)return!!sw.checked;
}
const id=kind==='desktop'?desktopEditingProductIdV92:(typeof mobileProductFormEditingId!=='undefined'?mobileProductFormEditingId:null);
const p=id!=null?getProduct(Number(id)):null;
try{return!!productFractionalQtyEnabledV314?.(p)}catch(e){return!!p?.fractionalQty}
}
function stockDraft92(kind){
return kind==='desktop'?desktopVariantStockDraftV92:mobileVariantStockDraftV92;
}
function originalStockDraft92(kind){
return kind==='desktop'?desktopOriginalVariantStocksV92:mobileOriginalVariantStocksV92;
}
function captureVariantStockDraft92(kind){
const sel=kind==='desktop'
?'#pVariantCostList [data-variant-stock-v92]'
:'#mpVariantCostList [data-variant-stock-v92]';
const draft=stockDraft92(kind);
document.querySelectorAll(sel).forEach(input=>{
let name='';
try{name=decodeURIComponent(input.dataset.variantStockV92||'')}catch(e){name=input.dataset.variantStockV92||''}
if(name)draft[name]=n92(String(input.value||'').replace(',','.'));
});
}
function totalDraftStock92(kind,names=null){
captureVariantStockDraft92(kind);
const draft=stockDraft92(kind);
const rows=names||variantNamesFromForm92(kind);
return rows.reduce((t,v)=>t+n92(draft[v]),0);
}
function updateVariantStockTotalUI92(kind){
const wrap=document.querySelector(`.variant-mode-wrap-v91[data-variant-mode-kind="${kind}"]`);
if(!wrap)return;
let row=wrap.querySelector('.variant-stock-total-v92');
const mode=variantModeFromDOM92(kind);
const noStock=productFormNoStock92(kind);
const total=totalDraftStock92(kind);
if(mode!=='price'||noStock){
row?.remove();
return;
}
if(!row){
row=document.createElement('div');
row.className='variant-stock-total-v92';
wrap.appendChild(row);
}
row.innerHTML=`<span>Total Stok Otomatis</span><b>${qtyText92(total)}</b>`;
}
function setBaseStockVisibility92(kind){
const mode=variantModeFromDOM92(kind);
const names=variantNamesFromForm92(kind);
const hasVariants=names.length>1||(names.length===1&&names[0]!=='Default');
const noStock=productFormNoStock92(kind);
const useVariant=mode==='price'&&hasVariants&&!noStock;
if(kind==='mobile'){
const wrap=document.getElementById('mpStockWrap');
if(wrap)wrap.hidden=noStock||useVariant;
const base=document.getElementById('mpStock');
if(base&&useVariant)base.value=String(totalDraftStock92(kind,names));
}else{
const input=document.getElementById('pStock');
const field=input?.closest('.field');
if(field)field.style.display=(noStock||useVariant)?'none':'';
if(input&&useVariant)input.value=String(totalDraftStock92(kind,names));
}
}
function seedFormDraft92(kind){
const mode=variantModeFromDOM92(kind);
if(mode!=='price')return;
const names=variantNamesFromForm92(kind);
const draft=stockDraft92(kind);
if(names.some(v=>draft[v]!==undefined))return;
const input=document.getElementById(kind==='desktop'?'pStock':'mpStock');
const total=n92(input?.value);
names.forEach((v,i)=>draft[v]=i===0?total:0);
}
function injectVariantStockFields92(kind){
const list=document.getElementById(kind==='desktop'?'pVariantCostList':'mpVariantCostList');
if(!list)return;
captureVariantStockDraft92(kind);
seedFormDraft92(kind);
const mode=variantModeFromDOM92(kind);
const noStock=productFormNoStock92(kind);
const enabled=mode==='price'&&!noStock;
const fractional=productFormFractional92(kind);
const draft=stockDraft92(kind);
const rowSelector=kind==='desktop'?'.desktop-variant-price-row-v89':'.variant-price-row-v89';
list.querySelectorAll(rowSelector).forEach(row=>{
const priceInput=row.querySelector(kind==='desktop'?'[data-desktop-variant-price-v89]':'[data-variant-price-v89]');
const costInput=row.querySelector(kind==='desktop'?'[data-desktop-variant-cost]':'[data-variant-cost]');
const source=priceInput||costInput;
let name='';
if(kind==='desktop')name=priceInput?.dataset.desktopVariantPriceV89||costInput?.dataset.desktopVariantCost||'';
else name=priceInput?.dataset.variantPriceV89||costInput?.dataset.variantCost||'';
if(!name)return;
const fields=row.querySelector('.variant-price-fields-v89');
if(!fields)return;
fields.classList.toggle('has-stock-v92',enabled);
let stockField=fields.querySelector('.variant-stock-field-v92');
if(enabled){
if(draft[name]===undefined)draft[name]=0;
const encoded=encodeURIComponent(name);
if(!stockField){
stockField=document.createElement('label');
stockField.className='variant-price-field-v89 variant-stock-field-v92';
stockField.innerHTML=`<span>Stok</span>
           <span class="variant-stock-shell-v92">
             <input type="text" inputmode="${fractional?'decimal':'numeric'}"
               data-variant-stock-v92="${encoded}"
               value="${qtyText92(draft[name]).replace(/\./g,'').replace(',','.')}"
               oninput="setVariantStockDraftInputV92('${kind}',this.dataset.variantStockV92,this.value)">
             <em>${esc92(document.getElementById(kind==='desktop'?'pUnit':'mpUnit')?.value||'pcs')}</em>
           </span>`;
fields.appendChild(stockField);
}else{
const input=stockField.querySelector('input');
if(input){
input.inputMode=fractional?'decimal':'numeric';
if(document.activeElement!==input)input.value=qtyText92(draft[name]).replace(/\./g,'').replace(',','.');
}
}
}else{
stockField?.remove();
}
});
updateVariantStockTotalUI92(kind);
setBaseStockVisibility92(kind);
}
function setVariantStockDraftInput92(kind,encoded,value){
let name='';
try{name=decodeURIComponent(encoded||'')}catch(e){name=encoded||''}
if(!name)return;
stockDraft92(kind)[name]=Math.max(0,Number(String(value||'').replace(',','.'))||0);
updateVariantStockTotalUI92(kind);
setBaseStockVisibility92(kind);
}
window.setVariantStockDraftInputV92=setVariantStockDraftInput92;
const baseSetVariantModeV92=window.setVariantModeV91;
if(typeof baseSetVariantModeV92==='function'){
window.setVariantModeV91=function(kind,next){
captureVariantStockDraft92(kind);
const r=baseSetVariantModeV92.apply(this,arguments);
requestAnimationFrame(()=>injectVariantStockFields92(kind));
setTimeout(()=>injectVariantStockFields92(kind),30);
return r;
};
}
const baseMobileRowsV92=window.renderMobileVariantCostRows;
if(typeof baseMobileRowsV92==='function'){
const wrapped=function(){
captureVariantStockDraft92('mobile');
const r=baseMobileRowsV92.apply(this,arguments);
requestAnimationFrame(()=>injectVariantStockFields92('mobile'));
return r;
};
wrapped.__v92Stock=true;
window.renderMobileVariantCostRows=wrapped;
try{renderMobileVariantCostRows=wrapped}catch(e){}
}
const baseDesktopRowsV92=window.renderDesktopVariantCostRows;
if(typeof baseDesktopRowsV92==='function'){
const wrapped=function(){
captureVariantStockDraft92('desktop');
const r=baseDesktopRowsV92.apply(this,arguments);
requestAnimationFrame(()=>injectVariantStockFields92('desktop'));
return r;
};
wrapped.__v92Stock=true;
window.renderDesktopVariantCostRows=wrapped;
try{renderDesktopVariantCostRows=wrapped}catch(e){}
}
const oldToggleVariantsV92=window.toggleMobileProductVariants;
if(typeof oldToggleVariantsV92==='function'){
window.toggleMobileProductVariants=function(){
const r=oldToggleVariantsV92.apply(this,arguments);
setTimeout(()=>injectVariantStockFields92('mobile'),0);
return r;
};
try{toggleMobileProductVariants=window.toggleMobileProductVariants}catch(e){}
}
const oldToggleStocklessV92=window.toggleMobileProductStockless;
if(typeof oldToggleStocklessV92==='function'){
window.toggleMobileProductStockless=function(){
const r=oldToggleStocklessV92.apply(this,arguments);
setTimeout(()=>injectVariantStockFields92('mobile'),0);
return r;
};
try{toggleMobileProductStockless=window.toggleMobileProductStockless}catch(e){}
}
const baseOpenMobileFormV92=window.openMobileProductForm;
if(typeof baseOpenMobileFormV92==='function'){
const wrapped=function(id=null){
const p=id!=null?getProduct(Number(id)):null;
if(p&&variantStockEnabled92(p))ensureVariantStocks92(p);
mobileOriginalVariantStocksV92=p?structuredClone(p.variantStocks||{}):{};
mobileVariantStockDraftV92=p?structuredClone(p.variantStocks||{}):{};
const r=baseOpenMobileFormV92.apply(this,arguments);
setTimeout(()=>{
seedFormDraft92('mobile');
injectVariantStockFields92('mobile');
},0);
return r;
};
wrapped.__v92Stock=true;
window.openMobileProductForm=wrapped;
try{openMobileProductForm=wrapped}catch(e){}
}
function mapForSavedProduct92(p,names,draft,oldMap){
const out={};
names.forEach(v=>out[v]=qtyNorm92(p,draft[v]??oldMap?.[v]??0));
let orphan=0;
Object.keys(oldMap||{}).forEach(k=>{
if(!names.includes(k))orphan+=n92(oldMap[k]);
});
if(orphan>EPS&&names.length)out[names[0]]=qtyNorm92(p,n92(out[names[0]])+orphan);
return out;
}
const baseSaveMobileFormV92=window.saveMobileProductForm;
if(typeof baseSaveMobileFormV92==='function'){
const wrapped=function(){
captureVariantStockDraft92('mobile');
const editId=typeof mobileProductFormEditingId!=='undefined'?mobileProductFormEditingId:null;
const beforeIds=new Set((db.products||[]).map(p=>Number(p.id)));
const mode=variantModeFromDOM92('mobile');
const names=variantNamesFromForm92('mobile');
const draft={...mobileVariantStockDraftV92};
const oldMap={...mobileOriginalVariantStocksV92};
const noStock=!!document.getElementById('mpNoStock')?.checked;
const variantsOn=!!document.getElementById('mpVariantsEnabled')?.checked;
const baseStock=document.getElementById('mpStock');
if(baseStock&&mode==='price'&&variantsOn&&!noStock)baseStock.value=String(names.reduce((t,v)=>t+n92(draft[v]),0));
const r=baseSaveMobileFormV92.apply(this,arguments);
setTimeout(()=>{
if(document.getElementById('screen-productform')?.classList.contains('active'))return;
let p=editId!=null?getProduct(Number(editId)):null;
if(!p)p=(db.products||[]).find(x=>!beforeIds.has(Number(x.id)))||null;
if(!p)return;
p.variantPriceMode=mode;
if(mode==='price'&&hasRealVariants92(p)&&!p.noStock){
p.variantStocks=mapForSavedProduct92(p,variantNames92(p),draft,oldMap);
p.variantStockInitializedV92=true;
syncVariantAggregate92(p);
}else if(mode==='extra'&&Object.keys(oldMap).length){
const total=Object.values(oldMap).reduce((t,v)=>t+n92(v),0);
if(total>EPS)p.stock=qtyNorm92(p,total);
}
save();
renderAll();
},10);
return r;
};
wrapped.__v92Stock=true;
window.saveMobileProductForm=wrapped;
try{saveMobileProductForm=wrapped}catch(e){}
}
const baseOpenDesktopFormV92=window.openProductModal;
if(typeof baseOpenDesktopFormV92==='function'){
const wrapped=function(id=null){
desktopEditingProductIdV92=id;
const p=id!=null?getProduct(Number(id)):null;
if(p&&variantStockEnabled92(p))ensureVariantStocks92(p);
desktopOriginalVariantStocksV92=p?structuredClone(p.variantStocks||{}):{};
desktopVariantStockDraftV92=p?structuredClone(p.variantStocks||{}):{};
const beforeIds=new Set((db.products||[]).map(x=>Number(x.id)));
const r=baseOpenDesktopFormV92.apply(this,arguments);
setTimeout(()=>{
seedFormDraft92('desktop');
injectVariantStockFields92('desktop');
const saveBtn=document.querySelector('#modalBox .modal-foot .btn-primary');
if(saveBtn&&!saveBtn.__v92VariantStock){
saveBtn.__v92VariantStock=true;
saveBtn.addEventListener('click',()=>{
captureVariantStockDraft92('desktop');
const mode=variantModeFromDOM92('desktop');
const names=variantNamesFromForm92('desktop');
const draft={...desktopVariantStockDraftV92};
const oldMap={...desktopOriginalVariantStocksV92};
const baseStock=document.getElementById('pStock');
if(baseStock&&mode==='price')baseStock.value=String(names.reduce((t,v)=>t+n92(draft[v]),0));
setTimeout(()=>{
if(document.getElementById('pName'))return;
let target=id!=null?getProduct(Number(id)):null;
if(!target)target=(db.products||[]).find(x=>!beforeIds.has(Number(x.id)))||null;
if(!target)return;
target.variantPriceMode=mode;
if(mode==='price'&&hasRealVariants92(target)&&!target.noStock){
target.variantStocks=mapForSavedProduct92(target,variantNames92(target),draft,oldMap);
target.variantStockInitializedV92=true;
syncVariantAggregate92(target);
}else if(mode==='extra'&&Object.keys(oldMap).length){
const total=Object.values(oldMap).reduce((t,v)=>t+n92(v),0);
if(total>EPS)target.stock=qtyNorm92(target,total);
}
save();
renderAll();
},45);
},{capture:true});
}
},0);
return r;
};
wrapped.__v92Stock=true;
window.openProductModal=wrapped;
try{openProductModal=wrapped}catch(e){}
}
function cartVariantQty92(productId,variant,excludeIndex=-1){
const p=getProduct(Number(productId));
const k=p?variantKey92(p,variant):key92(variant);
return(cart||[]).reduce((t,x,i)=>{
if(i===Number(excludeIndex))return t;
if(Number(x?.productId)!==Number(productId))return t;
if(!p||!variantStockEnabled92(p))return t+n92(x.qty);
return variantKey92(p,x.variant||'Default')===k?t+n92(x.qty):t;
},0);
}
window.availableProductStock=function(productId,excludeIndex=-1){
const p=getProduct(Number(productId));
if(!p)return 0;
if(p.noStock)return 999999;
if(variantStockEnabled92(p)){
ensureVariantStocks92(p);
let variant=null;
if(Number(excludeIndex)>=0&&cart?.[Number(excludeIndex)]){
variant=cart[Number(excludeIndex)].variant||'Default';
}else{
const modal=document.getElementById('modalBox');
const sel=modal?.classList.contains('product-variant-modal')
?document.getElementById('mobileProductVariant'):null;
if(sel)variant=sel.value||'Default';
}
if(variant!==null){
return Math.max(0,variantStock92(p,variant)-cartVariantQty92(p.id,variant,excludeIndex));
}
}
const used=(cart||[]).reduce((t,x,i)=>i===Number(excludeIndex)||Number(x.productId)!==Number(productId)?t:t+n92(x.qty),0);
return Math.max(0,n92(p.stock)-used);
};
try{availableProductStock=window.availableProductStock}catch(e){}
window.validateCartStock=function(){
const groups=new Map();
for(const x of(cart||[])){
const p=getProduct(Number(x.productId));
if(!p)return{ok:false,product:null,qty:x.qty,stock:0};
if(!(Number(x.qty)>0))return{ok:false,product:p,qty:x.qty,stock:p.stock||0};
if(p.noStock)continue;
if(variantStockEnabled92(p)){
ensureVariantStocks92(p);
const k=variantKey92(p,x.variant||'Default');
const id=`${p.id}::${k}`;
groups.set(id,{p,variant:k,qty:(groups.get(id)?.qty||0)+n92(x.qty)});
}else{
const id=`${p.id}`;
groups.set(id,{p,variant:null,qty:(groups.get(id)?.qty||0)+n92(x.qty)});
}
}
for(const g of groups.values()){
const stock=g.variant!==null?variantStock92(g.p,g.variant):n92(g.p.stock);
if(g.qty>stock+EPS)return{ok:false,product:g.p,variant:g.variant,qty:g.qty,stock};
}
return{ok:true};
};
try{validateCartStock=window.validateCartStock}catch(e){}
function decorateSaleVariantStock92(id){
const p=getProduct(Number(id));
if(!p||!variantStockEnabled92(p))return;
ensureVariantStocks92(p);
const select=document.getElementById('mobileProductVariant');
if(!select)return;
[...select.options].forEach(opt=>{
const v=variantKey92(p,opt.value);
const price=variantSalePrice92(p,v);
opt.textContent=`${v} • ${rp92(price)} • Stok ${qtyText92(variantStock92(p,v))}`;
});
const variant=select.value||variantNames92(p)[0];
const stock=variantStock92(p,variant);
const available=window.availableProductStock(p.id);
const meta=document.querySelector('#modalBox.product-variant-modal .sale-product-info-copy-v91 small');
if(meta){
meta.innerHTML=`${esc92(p.barcode||'-')} • <span class="variant-live-stock-v92 ${stock<=EPS?'out':''}">Stok ${esc92(variant)} ${qtyText92(stock)}</span> • Total ${qtyText92(p.stock)}`;
}
const qty=document.getElementById('mobileProductQty');
if(qty){
qty.max=String(available);
if(n92(qty.value)>available)qty.value=String(Math.max(0,available));
}
}
const baseOpenSaleVariantV92=window.openMobileProductQtyVariant;
if(typeof baseOpenSaleVariantV92==='function'){
window.openMobileProductQtyVariant=function(id){
const p=getProduct(Number(id));if(p&&variantStockEnabled92(p))ensureVariantStocks92(p);
const r=baseOpenSaleVariantV92.apply(this,arguments);
setTimeout(()=>decorateSaleVariantStock92(id),0);
return r;
};
}
const baseUpdateSaleVariantV92=window.updateMobileProductVariantPrice;
if(typeof baseUpdateSaleVariantV92==='function'){
window.updateMobileProductVariantPrice=function(id){
const r=baseUpdateSaleVariantV92.apply(this,arguments);
decorateSaleVariantStock92(id);
return r;
};
}
function saleCost92(items){
return(items||[]).reduce((t,x)=>{
const p=getProduct(Number(x.productId));if(!p)return t;
const unit=variantStockEnabled92(p)?variantBuyPrice92(p,x.variant||'Default'):n92(p.cost);
return t+unit*n92(x.qty);
},0);
}
const baseProcessPaymentV92=window.processPayment;
if(typeof baseProcessPaymentV92==='function'){
const wrapped=function(){
normalizeAllVariantStocks92();
const beforeIds=new Set((db.sales||[]).map(s=>String(s.id)));
const snapshot=(cart||[]).map(x=>({...x}));
const r=baseProcessPaymentV92.apply(this,arguments);
const sale=(db.sales||[]).find(s=>!beforeIds.has(String(s.id)));
if(!sale)return r;
(sale.items||snapshot).forEach(x=>{
const p=getProduct(Number(x.productId));
if(!p||!variantStockEnabled92(p))return;
adjustVariantStock92(p,x.variant||'Default',-n92(x.qty));
x.buyCost=variantBuyPrice92(p,x.variant||'Default');
});
sale.cost=saleCost92(sale.items||snapshot);
save();
renderAll();
return r;
};
wrapped.__v92VariantStock=true;
window.processPayment=wrapped;
try{processPayment=wrapped}catch(e){}
}
const baseSaleReturnV92=window.executeReturnV206;
if(typeof baseSaleReturnV92==='function'){
window.executeReturnV206=function(id,selected,allMode){
const sale=(db.sales||[]).find(s=>String(s.id)===String(id));
const before=(sale?.items||[]).map(x=>n92(x.returnedQty));
const r=baseSaleReturnV92.apply(this,arguments);
if(!sale)return r;
let changed=false;
(sale.items||[]).forEach((item,i)=>{
const delta=Math.max(0,n92(item.returnedQty)-n92(before[i]));
if(delta<=EPS)return;
const p=getProduct(Number(item.productId));
if(p&&variantStockEnabled92(p)){
adjustVariantStock92(p,item.variant||'Default',delta);
changed=true;
}
});
if(changed){
save();
renderAll();
if(document.getElementById('screen-sale-detail')?.classList.contains('active')&&String(activeSaleDetailId)===String(id))renderSaleDetailPage?.();
}
return r;
};
}
function decoratePurchaseVariantStock92(id){
const p=getProduct(Number(id));
if(!p||!variantStockEnabled92(p))return;
ensureVariantStocks92(p);
const selectedInput=document.getElementById('purchasePickerVariantV90');
if(!selectedInput)return;
document.querySelectorAll('#modalBox.purchase-qty-modal-v90 .purchase-variant-choice-v531').forEach(btn=>{
const v=variantKey92(p,btn.dataset.variantName);
const detail=btn.querySelector('.purchase-variant-detail-v531');
if(detail)detail.textContent=`Beli ${rp92(variantBuyPrice92(p,v))} • Stok ${qtyText92(variantStock92(p,v))}`;
const selected=v===selectedInput.value;
btn.classList.toggle('selected',selected);
btn.setAttribute('aria-pressed',String(selected));
});
const v=selectedInput.value||variantNames92(p)[0];
const meta=document.querySelector('#modalBox.purchase-qty-modal-v90 .purchase-picker-product-v90 small:not(.purchase-picker-total-v90)');
if(meta){
meta.innerHTML=`${esc92(p.barcode||p.sku||'-')} • <span class="variant-live-stock-v92 ${variantStock92(p,v)<=EPS?'out':''}">Stok ${esc92(v)} ${qtyText92(variantStock92(p,v))}</span> • Total ${qtyText92(p.stock)} ${esc92(p.unit||'pcs')}`;
}
}
const basePurchaseOpenV92=window.openPurchasePickerQtyV90;
if(typeof basePurchaseOpenV92==='function'){
const wrapped=function(id){
const p=getProduct(Number(id));if(p&&variantStockEnabled92(p))ensureVariantStocks92(p);
const r=basePurchaseOpenV92.apply(this,arguments);
setTimeout(()=>decoratePurchaseVariantStock92(id),0);
return r;
};
wrapped.__v92VariantStock=true;
window.openPurchasePickerQtyV90=wrapped;
window.tapPurchasePickerProductV76=wrapped;
window.openPurchasePickerQtyV77=wrapped;
}
const basePurchaseChangeVariantV92=window.changePurchaseVariantV90;
if(typeof basePurchaseChangeVariantV92==='function'){
window.changePurchaseVariantV90=function(id){
const r=basePurchaseChangeVariantV92.apply(this,arguments);
decoratePurchaseVariantStock92(id);
return r;
};
}
const baseSavePurchaseV92=window.savePurchaseProductForm;
if(typeof baseSavePurchaseV92==='function'){
const wrapped=function(){
const snapshotV614=structuredClone(db);
const captured=(purchaseFormDraft?.lines||[]).map(r=>({
productId:Number(r.productId),
variant:String(r.variant||''),
qty:n92(r.qty),
cost:n92(r.cost)
}));
// Initialize stock buckets BEFORE the base purchase increases the aggregate stock.
// Otherwise a newly configured variant can seed from an already-incremented quantity.
captured.forEach(line=>{const p=getProduct(line.productId);if(p&&variantStockEnabled92(p))ensureVariantStocks92(p)});
const existingId=purchaseFormDraft?.purchaseId?String(purchaseFormDraft.purchaseId):null;
const beforeIds=new Set((db.purchases||[]).map(p=>String(p.id)));
const beforeWasDraft=existingId?!!purchaseIsDraft(purchaseById(existingId)):false;
const oldSave=window.save;
let storageFailed=false, variantApplied=false, r;
// Apply variant totals just before the ONE persistent commit in the base purchase.
// Validation errors do not modify variant stock or buy-price settings.
window.save=function(){
 if(!variantApplied){
  captured.forEach(line=>{
   const p=getProduct(line.productId);
   if(!p||!variantStockEnabled92(p))return;
   ensureVariantStocks92(p);
   const key=variantKey92(p,line.variant||'Default');
   adjustVariantStock92(p,key,line.qty);
   if(!p.variantBuyPrices||typeof p.variantBuyPrices!=='object')p.variantBuyPrices={};
   if(line.cost>0)p.variantBuyPrices[key]=line.cost;
   syncVariantAggregate92(p);
  });
  variantApplied=true;
 }
 const ok=oldSave.apply(this,arguments);
 if(!ok)storageFailed=true;
 return ok;
};
try{r=baseSavePurchaseV92.apply(this,arguments)}
finally{window.save=oldSave}
const success=existingId
?(beforeWasDraft&&purchaseById(existingId)&&!purchaseIsDraft(purchaseById(existingId)))
:(db.purchases||[]).some(p=>!beforeIds.has(String(p.id))&&!purchaseIsDraft(p));
if(!success){
 // Covers the earlier v90 price-map changes as well as any failed save.
 Object.keys(db).forEach(key=>delete db[key]);Object.assign(db,snapshotV614);
 if(storageFailed)toast('Pembelian belum tersimpan. Seluruh perubahan stok, varian, dan kas dibatalkan.','error');
}
return r;
};
wrapped.__v92VariantStock=true;
window.savePurchaseProductForm=wrapped;
try{savePurchaseProductForm=wrapped}catch(e){}
}
const basePurchaseReturnV92=window.executePurchaseReturnV208;
if(typeof basePurchaseReturnV92==='function'){
window.executePurchaseReturnV208=function(id,selected,allMode){
const purchase=(db.purchases||[]).find(p=>String(p.id)===String(id));
if(!purchase)return basePurchaseReturnV92.apply(this,arguments);
const picks=(selected||[]).map(x=>({index:Number(x.index),qty:n92(x.qty)}))
.filter(x=>Number.isInteger(x.index)&&x.index>=0&&x.index<(purchase.lines||[]).length&&x.qty>EPS);
for(const pick of picks){
const line=purchase.lines[pick.index],prod=getProduct(Number(line.productId));
if(!prod||!variantStockEnabled92(prod))continue;
ensureVariantStocks92(prod);
const remaining=Math.max(0,n92(line.qty)-n92(line.returnedQty));
const q=Math.min(remaining,pick.qty);
const have=variantStock92(prod,line.variant||'Default');
if(q>have+EPS){
return toast(`Stok varian ${variantKey92(prod,line.variant||'Default')} pada ${prod.name} tidak cukup. Tersedia ${qtyText92(have)}.`,'error');
}
}
const before=(purchase.lines||[]).map(x=>n92(x.returnedQty));
const beforeReturnCount=Array.isArray(purchase.returns)?purchase.returns.length:0;
const r=basePurchaseReturnV92.apply(this,arguments);
let changed=false;
(purchase.lines||[]).forEach((line,i)=>{
const delta=Math.max(0,n92(line.returnedQty)-n92(before[i]));
if(delta<=EPS)return;
const prod=getProduct(Number(line.productId));
if(prod&&variantStockEnabled92(prod)){
adjustVariantStock92(prod,line.variant||'Default',-delta);
changed=true;
}
});
if(changed){
const newest=(purchase.returns||[])[0];
if((purchase.returns||[]).length>beforeReturnCount&&newest?.items){
newest.items.forEach(item=>{
const line=purchase.lines?.[Number(item.index)];
if(line)item.variant=String(line.variant||'');
});
}
save();
renderAll();
if(String(activePurchaseDetailId)===String(id)&&document.getElementById('screen-purchase-detail')?.classList.contains('active'))renderPurchaseDetailPage?.();
}
return r;
};
}
const baseDeletePurchaseV92=window.executeDeletePurchaseV84;
if(typeof baseDeletePurchaseV92==='function'){
window.executeDeletePurchaseV84=function(id){
const purchase=(db.purchases||[]).find(p=>String(p.id)===String(id));
const rows=(purchase?.lines||[]).map(line=>({
productId:Number(line.productId),
variant:String(line.variant||''),
qty:Math.max(0,n92(line.qty)-n92(line.returnedQty))
}));
for(const row of rows){
const p=getProduct(row.productId);
if(!p||!variantStockEnabled92(p)||row.qty<=EPS)continue;
const have=variantStock92(p,row.variant||'Default');
if(have+EPS<row.qty)return toast(`Stok varian ${variantKey92(p,row.variant||'Default')} ${p.name} tidak cukup untuk menghapus pembelian.`,'error');
}
const r=baseDeletePurchaseV92.apply(this,arguments);
const deleted=purchase&&!(db.purchases||[]).some(p=>String(p.id)===String(id));
if(deleted&&!purchaseIsDraft(purchase)){
rows.forEach(row=>{
const p=getProduct(row.productId);
if(p&&variantStockEnabled92(p))adjustVariantStock92(p,row.variant||'Default',-row.qty);
});
save();
renderAll();
}
return r;
};
}
function opnameKey92(p,variant=null){
if(variantStockEnabled92(p)&&variant!==null)return`v:${p.id}:${encodeURIComponent(variantKey92(p,variant))}`;
return`p:${p.id}`;
}
function opnameSystem92(p,variant=null){
return variantStockEnabled92(p)&&variant!==null?variantStock92(p,variant):n92(p.stock);
}
function opnameValue92(p,variant=null){
if(!stockOpnameWorking)stockOpnameWorking={};
const key=opnameKey92(p,variant);
if(stockOpnameWorking[key]===undefined)stockOpnameWorking[key]=qtyNorm92(p,opnameSystem92(p,variant));
return qtyNorm92(p,stockOpnameWorking[key]);
}
function opnameAllItems92(){
const rows=[];
(db.products||[]).filter(p=>!p.noStock).forEach(p=>{
if(variantStockEnabled92(p)){
ensureVariantStocks92(p);
variantNames92(p).forEach(v=>{
const system=qtyNorm92(p,variantStock92(p,v));
const physical=opnameValue92(p,v);
rows.push({
productId:p.id,
variant:v,
name:`${p.name} • ${v}`,
productName:p.name,
barcode:p.barcode||'',
unit:p.unit||'pcs',
system,physical,diff:qtyNorm92(p,physical-system)
});
});
}else{
const system=qtyNorm92(p,p.stock),physical=opnameValue92(p,null);
rows.push({
productId:p.id,variant:'',
name:p.name,productName:p.name,
barcode:p.barcode||'',unit:p.unit||'pcs',
system,physical,diff:qtyNorm92(p,physical-system)
});
}
});
return rows;
}
function opnameChangedCount92(){
return opnameAllItems92().filter(x=>Math.abs(n92(x.diff))>EPS).length;
}
window.stockOpnameValue=function(id,variant=null){
const p=getProduct(Number(id));if(!p)return 0;
return opnameValue92(p,variant);
};
try{stockOpnameValue=window.stockOpnameValue}catch(e){}
window.stockOpnameCurrentItems=function(){return opnameAllItems92()};
try{stockOpnameCurrentItems=window.stockOpnameCurrentItems}catch(e){}
function refreshStockOpnameRowV171(p,variant=null){
if(!p)return;
const v=variant&&variant!=='__NONE__'?variant:null;
const system=opnameSystem92(p,v),physical=opnameValue92(p,v),diff=physical-system;
const cls=diff>EPS?'plus':diff<-EPS?'minus':'zero',changed=Math.abs(diff)>EPS;
let row=null;
if(v!==null&&variantStockEnabled92(p)){
const names=variantNames92(p);
let idx=names.findIndex(name=>String(name)===String(v));
if(idx<0){
const target=variantKey92(p,v);
idx=names.findIndex(name=>variantKey92(p,name)===target);
}
if(idx>=0)row=document.getElementById(`stockOpnameVariantRow-${p.id}-${idx}`);
}else row=document.getElementById(`stockOpnameRow-${p.id}`);
if(row){
row.classList.toggle('is-changed',changed);
const old=row.querySelector('.stock-opname-diff');
if(old)old.outerHTML=`<div class="stock-opname-cell stock-opname-diff ${cls}"><small>SELISIH</small><strong>${diff>EPS?'+':''}${qtyText92(diff)}</strong></div>`;
}
const changedEl=document.getElementById('stockOpnameChanged');
if(changedEl)changedEl.textContent=String(opnameChangedCount92());
}
window.updateStockOpnameValue=function(id,value,variant=null){
const p=getProduct(Number(id));if(!p)return;
if(!stockOpnameWorking)stockOpnameWorking={};
const v=variant&&variant!=='__NONE__'?variant:null;
const key=opnameKey92(p,v);
stockOpnameWorking[key]=qtyNorm92(p,value);
refreshStockOpnameRowV171(p,v);
};
try{updateStockOpnameValue=window.updateStockOpnameValue}catch(e){}
window.updateStockOpnameVariantV92=function(id,encoded,value){
let variant='';
try{variant=decodeURIComponent(encoded||'')}catch(e){variant=encoded||''}
window.updateStockOpnameValue(id,value,variant);
};
window.resetStockOpnameWorking=function(){
stockOpnameWorking={};
opnameAllItems92();
renderStockOpnamePage();
toast('Stok fisik direset mengikuti stok sistem.');
};
try{resetStockOpnameWorking=window.resetStockOpnameWorking}catch(e){}
window.renderStockOpnamePage=function(){
const list=document.getElementById('stockOpnameList');if(!list)return;
if(!stockOpnameWorking)stockOpnameWorking={};
const q=(document.getElementById('stockOpnameSearch')?.value||'').trim().toLowerCase();
let category='';
try{category=syncStockOpnameCategoryFilter()}catch(e){category=''}
const products=(db.products||[]).filter(p=>!p.noStock)
.filter(p=>!category||String(p.category||'Umum')===category)
.filter(p=>!q||[p.name,p.barcode,p.category,p.unit,...variantNames92(p)].some(v=>String(v||'').toLowerCase().includes(q)));
const itemCount=products.reduce((t,p)=>t+(variantStockEnabled92(p)?variantNames92(p).length:1),0);
const changed=opnameChangedCount92();
const count=document.getElementById('stockOpnameCount');
const changedEl=document.getElementById('stockOpnameChanged');
if(count)count.textContent=String(itemCount);
if(changedEl)changedEl.textContent=String(changed);
list.innerHTML=products.map(p=>{
if(variantStockEnabled92(p)){
ensureVariantStocks92(p);
const variantRows=variantNames92(p).map((v,i)=>{
const system=variantStock92(p,v),physical=opnameValue92(p,v),diff=physical-system;
const cls=diff>EPS?'plus':diff<-EPS?'minus':'zero';
const changed=Math.abs(diff)>EPS;
const enc=encodeURIComponent(v);
return`<div class="stock-opname-row${changed?' is-changed':''}" id="stockOpnameVariantRow-${p.id}-${i}">
           <div class="stock-opname-product">
             <div class="stock-opname-product-main">
               <b><span class="stock-opname-variant-name-v92">${esc92(v)}</span></b>
               <span>${esc92(p.barcode||'Tanpa barcode')} · ${esc92(p.unit||'pcs')}</span>
             </div>
           </div>
           <div class="stock-opname-values">
             <div class="stock-opname-cell"><small>SYSTEM</small><strong>${qtyText92(system)}</strong></div>
             <div class="stock-opname-cell stock-opname-physical"><small>FISIK</small><div class="stock-opname-input-line">
               <input type="text" inputmode="${productFormFractional92('desktop')?'decimal':'numeric'}"
                value="${String(physical)}"
                oninput="updateStockOpnameVariantV92(${p.id},'${enc}',this.value)">
             </div></div>
             <div class="stock-opname-cell stock-opname-diff ${cls}"><small>SELISIH</small><strong>${diff>EPS?'+':''}${qtyText92(diff)}</strong></div>
           </div>
         </div>`;
}).join('');
return`<div class="stock-opname-variant-group-v92">
         <div class="stock-opname-variant-head-v92">
           <div><b>${esc92(p.name)}</b><small>${esc92(p.category||'Umum')} • ${variantNames92(p).length} varian</small></div>
           <strong>Total ${qtyText92(p.stock)}</strong>
         </div>${variantRows}
       </div>`;
}
const system=n92(p.stock),physical=opnameValue92(p,null),diff=physical-system,changed=Math.abs(diff)>EPS,cls=diff>EPS?'plus':diff<-EPS?'minus':'zero';
return`<div class="stock-opname-row${changed?' is-changed':''}" id="stockOpnameRow-${p.id}">
       <div class="stock-opname-product"><div class="stock-opname-product-main"><b>${esc92(p.name)}</b><span>${esc92(p.barcode||'Tanpa barcode')} · ${esc92(p.category||'Umum')}</span></div></div>
       <div class="stock-opname-values">
         <div class="stock-opname-cell"><small>SYSTEM</small><strong>${qtyText92(system)}</strong></div>
         <div class="stock-opname-cell stock-opname-physical"><small>FISIK</small><div class="stock-opname-input-line">
           <input type="text" inputmode="${p.fractionalQty?'decimal':'numeric'}" value="${String(physical)}" oninput="updateStockOpnameValue(${p.id},this.value)">
         </div></div>
         <div class="stock-opname-cell stock-opname-diff ${cls}"><small>SELISIH</small><strong>${diff>EPS?'+':''}${qtyText92(diff)}</strong></div>
       </div>
     </div>`;
}).join('')||'<div class="stock-opname-empty">Produk tidak ditemukan.</div>';
};
try{renderStockOpnamePage=window.renderStockOpnamePage}catch(e){}
function applyOpnameReport92(report){
const touched=new Set();
(report.items||[]).forEach(x=>{
const p=getProduct(Number(x.productId));if(!p||p.noStock)return;
if(variantStockEnabled92(p)&&x.variant){
setVariantStock92(p,x.variant,x.physical);
touched.add(p.id);
}else if(!variantStockEnabled92(p)){
p.stock=qtyNorm92(p,x.physical);
}
});
touched.forEach(id=>syncVariantAggregate92(getProduct(id)));
}
const baseOpenStockOpnameV92=window.openStockOpname;
window.openStockOpname=function(){
 normalizeAllVariantStocks92();
 const current=document.body.dataset.mobileScreen||currentScreenName?.()||'stock';
 mobileStockOpnameReturnScreen=current!=='stock-opname'&&document.getElementById('screen-'+current)?current:'stock';
 window.__stockOpnameReturnScreenV170=mobileStockOpnameReturnScreen;
 stockOpnameWorking={};
 opnameAllItems92();
 if(db.settings.stockOpnameDraft){delete db.settings.stockOpnameDraft;save()}
 go('stock-opname');
};
try{openStockOpname=window.openStockOpname}catch(e){}
window.commitStockOpname=function(){
const report=stockOpnameReportFromForm();
if(!report.officer)return toast('Nama petugas wajib diisi.','error');
applyOpnameReport92(report);
if(!Array.isArray(db.settings.stockOpnameHistory))db.settings.stockOpnameHistory=[];
db.settings.stockOpnameHistory.unshift(report);
db.settings.stockOpnameHistory=db.settings.stockOpnameHistory.slice(0,50);
delete db.settings.stockOpnameDraft;
stockOpnameLastSavedReport=JSON.parse(JSON.stringify(report));
save();closeModal();stockOpnameWorking=null;renderAll();
toast('Stok opname berhasil disimpan.');
openStockOpnameSavedActions(stockOpnameLastSavedReport);
};
try{commitStockOpname=window.commitStockOpname}catch(e){}
function variantChips92(p,limit=6){
if(!variantStockEnabled92(p))return'';
ensureVariantStocks92(p);
const names=variantNames92(p);
const rows=names.slice(0,limit).map(v=>{
const q=variantStock92(p,v);
return`<span class="variant-stock-chip-v92 ${q<=EPS?'out':''}">${esc92(v)} <b>${qtyText92(q)}</b></span>`;
}).join('');
return`<div class="variant-stock-mini-v92">${rows}${names.length>limit?`<span class="variant-stock-chip-v92">+${names.length-limit}</span>`:''}</div>`;
}
function enhanceStockScreen92(){
normalizeAllVariantStocks92();
document.querySelectorAll('#stockTable tr').forEach(tr=>{
const edit=tr.querySelector('button[onclick^="openProductModal("]');
const m=String(edit?.getAttribute('onclick')||'').match(/openProductModal\((\d+)\)/);
if(!m)return;
const p=getProduct(Number(m[1]));
if(!p||!variantStockEnabled92(p))return;
const cell=tr.querySelector('td[data-label="Stok"]');
if(cell){
cell.innerHTML=`<b class="${p.stock<=p.min?'text-danger':''}">${qtyText92(p.stock)}</b><span class="stock-min-detail"> / min ${qtyText92(p.min)}</span><span class="variant-stock-total-label-v92">Total stok otomatis</span>${variantChips92(p)}`;
}
const modalCell=tr.querySelector('td[data-label="Modal"]');
if(modalCell)modalCell.innerHTML=`<span class="pill">Per Varian</span>`;
const saleCell=tr.querySelector('td[data-label="Ecer"]');
if(saleCell)saleCell.innerHTML=`<span class="pill blue">Varian Harga</span>`;
});
document.querySelectorAll('#stockMobileList .stock-mobile-card').forEach(card=>{
const m=String(card.getAttribute('onclick')||'').match(/openProductModal\((\d+)\)/);
if(!m)return;
const p=getProduct(Number(m[1]));
if(!p||!variantStockEnabled92(p))return;
const stock=card.querySelector('.stock-mobile-stock');
if(stock)stock.textContent=`Total Stok ${qtyText92(p.stock)}`;
const info=card.querySelector('.stock-mobile-info');
if(info&&!info.querySelector('.variant-stock-mini-v92')){
const tmp=document.createElement('div');
tmp.innerHTML=variantChips92(p,4);
if(tmp.firstElementChild)info.appendChild(tmp.firstElementChild);
}
const cost=card.querySelector('.stock-mobile-cost');
if(cost)cost.innerHTML=`<small>Modal</small>Per Varian`;
const price=card.querySelector('.stock-mobile-price');
if(price)price.innerHTML=`<small>Jual</small>Per Varian`;
});
}
const baseRenderStockV92=window.renderStock;
if(typeof baseRenderStockV92==='function'){
const wrapped=function(){
const r=baseRenderStockV92.apply(this,arguments);
enhanceStockScreen92();
return r;
};
wrapped.__v92VariantStock=true;
window.renderStock=wrapped;
try{renderStock=wrapped}catch(e){}
}
function stockValue92(p){
if(!p||p.noStock)return 0;
if(!variantStockEnabled92(p))return n92(p.stock)*n92(p.cost);
ensureVariantStocks92(p);
return variantNames92(p).reduce((t,v)=>t+variantStock92(p,v)*variantBuyPrice92(p,v),0);
}
function stockRetailValue92(p){
if(!p||p.noStock)return 0;
if(!variantStockEnabled92(p))return n92(p.stock)*n92(p.price);
ensureVariantStocks92(p);
return variantNames92(p).reduce((t,v)=>t+variantStock92(p,v)*variantSalePrice92(p,v),0);
}
function stockSummary92(){
const inv=(db.products||[]).filter(p=>!p.noStock);
return{
sku:inv.length,
totalQty:inv.reduce((t,p)=>t+n92(p.stock),0),
costValue:inv.reduce((t,p)=>t+stockValue92(p),0),
retailValue:inv.reduce((t,p)=>t+stockRetailValue92(p),0)
};
}
function movePush92(rows,m){
const qty=n92(m.qty);if(qty<=EPS)return;
rows.push({...m,qty,variant:String(m.variant||'')});
}
function stockMovements92(productId){
productId=Number(productId);
const rows=[];
(db.sales||[]).forEach(s=>{
(s.items||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
movePush92(rows,{id:`sale:${s.id}:${i}`,date:s.date,direction:'out',qty:x.qty,variant:x.variant||'',source:'Penjualan',ref:s.id,note:s.customerId?(getCustomer(s.customerId)?.name||''):''});
});
const returns=Array.isArray(s.returns)?s.returns:[];
if(returns.length){
returns.forEach((r,ri)=>(r.items||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
movePush92(rows,{id:`sale-return:${s.id}:${r.id||ri}:${i}`,date:r.date||s.returnedAt||s.date,direction:'in',qty:x.qty,variant:x.variant||'',source:'Retur Penjualan',ref:s.id,note:r.note||''});
}));
}else if(s.returned){
(s.items||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
movePush92(rows,{id:`sale-return-legacy:${s.id}:${i}`,date:s.returnedAt||s.date,direction:'in',qty:x.qty,variant:x.variant||'',source:'Retur Penjualan',ref:s.id,note:''});
});
}
});
(db.purchases||[]).filter(p=>!purchaseIsDraft(p)&&p.stockApplied!==false).forEach(p=>{
(p.lines||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
movePush92(rows,{id:`purchase:${p.id}:${i}`,date:p.date,direction:'in',qty:x.qty,variant:x.variant||'',source:'Pembelian',ref:p.id,note:getSupplier(p.supplierId)?.name||''});
});
(p.returns||[]).forEach((r,ri)=>(r.items||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
const line=p.lines?.[Number(x.index)];
movePush92(rows,{id:`purchase-return:${p.id}:${r.id||ri}:${i}`,date:r.date||p.purchaseReturnedAt||p.date,direction:'out',qty:x.qty,variant:x.variant??line?.variant??'',source:'Retur Pembelian',ref:p.id,note:r.note||''});
}));
});
(db.settings.stockOpnameHistory||[]).forEach(op=>(op.items||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
const diff=Number(x.diff)||0;
if(Math.abs(diff)<=EPS)return;
movePush92(rows,{id:`opname:${op.id}:${i}`,date:op.date,direction:diff<0?'out':'in',qty:Math.abs(diff),variant:x.variant||'',source:'Stok Opname',ref:op.id,note:op.note||op.officer||''});
}));
(db.settings.stockAdjustmentHistory||[]).forEach((x,i)=>{
if(Number(x.productId)!==productId)return;
movePush92(rows,{id:`adjust:${x.id||i}`,date:x.date,direction:Number(x.delta)<0?'out':'in',qty:Math.abs(Number(x.delta)||0),variant:x.variant||'',source:'Koreksi Stok Lama',ref:x.id||'',note:x.note||x.officer||''});
});
return rows.sort((a,b)=>new Date(b.date)-new Date(a.date)||String(b.id).localeCompare(String(a.id)));
}
window.stockDataMovementsV92=stockMovements92;
function enhanceStockData92(){
normalizeAllVariantStocks92();
const st=stockSummary92();
const summary=document.getElementById('stockDataSummaryV219');
if(summary){
const cards=summary.querySelectorAll('.stock-data-stat');
if(cards[1])cards[1].querySelector('b').textContent=qtyText92(st.totalQty);
if(cards[2])cards[2].querySelector('b').textContent=rp92(st.costValue);
if(cards[3])cards[3].querySelector('b').textContent=rp92(st.retailValue);
}
document.querySelectorAll('#stockDataTableV219 tr[onclick]').forEach(tr=>{
const m=String(tr.getAttribute('onclick')||'').match(/openStockDataDetailV219\((\d+)\)/);
if(!m)return;
const p=getProduct(Number(m[1]));
if(!p||!variantStockEnabled92(p))return;
const td=tr.children;
if(td[0]&&!td[0].querySelector('.variant-stock-mini-v92'))td[0].querySelector('.stock-data-product')?.insertAdjacentHTML('beforeend',variantChips92(p,4));
if(td[3])td[3].innerHTML=`${qtyText92(p.stock)}<span class="variant-stock-total-label-v92">Total</span>`;
if(td[5])td[5].innerHTML='<span class="stock-data-status">Per Varian</span>';
if(td[6])td[6].textContent=rp92(stockValue92(p));
if(td[7])td[7].innerHTML='<span class="stock-data-status ok">Varian Harga</span>';
});
document.querySelectorAll('#stockDataListV219 .stock-data-card').forEach(card=>{
const m=String(card.getAttribute('onclick')||'').match(/openStockDataDetailV219\((\d+)\)/);
if(!m)return;
const p=getProduct(Number(m[1]));
if(!p||!variantStockEnabled92(p))return;
const main=card.querySelector('.stock-data-picker-main');
if(main&&!main.querySelector('.variant-stock-mini-v92'))main.insertAdjacentHTML('beforeend',variantChips92(p,4));
const stock=card.querySelector('.stock-data-picker-stock-value');
if(stock)stock.textContent=qtyText92(p.stock);
const price=card.querySelector('.stock-data-picker-price');
if(price)price.textContent=rp92(stockValue92(p));
});
}
const baseRenderStockDataV92=window.renderStockDataV219;
if(typeof baseRenderStockDataV92==='function'){
window.renderStockDataV219=function(){
const r=baseRenderStockDataV92.apply(this,arguments);
enhanceStockData92();
return r;
};
}
const baseOpenStockDataDetailV92=window.openStockDataDetailV219;
window.openStockDataDetailV219=function(id){
const p=getProduct(Number(id));
if(!p)return toast('Produk tidak ditemukan.','error');
if(!variantStockEnabled92(p)){
return typeof baseOpenStockDataDetailV92==='function'?baseOpenStockDataDetailV92.apply(this,arguments):undefined;
}
ensureVariantStocks92(p);
const moves=stockMovements92(p.id).slice(0,100);
const variants=variantNames92(p);
const variantHtml=variants.map(v=>`<div class="stock-data-variant-card-v92">
     <div class="variant-name-v92"><span>Varian</span><b>${esc92(v)}</b></div>
     <div><span>Stok</span><b>${qtyText92(variantStock92(p,v))}</b></div>
     <div><span>Harga Beli</span><b>${rp92(variantBuyPrice92(p,v))}</b></div>
     <div class="variant-sale-v92"><span>Harga Jual</span><b>${rp92(variantSalePrice92(p,v))}</b></div>
   </div>`).join('');
const moveHtml=moves.length?moves.map(m=>{
const variant=m.variant?`Varian ${m.variant}`:'';
return`<div class="stock-data-mutation">
       <time>${new Date(m.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'2-digit'})}<br>${new Date(m.date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</time>
       <div class="stock-data-mutation-copy"><b>${esc92(m.source)}${variant?` • ${esc92(variant)}`:''}</b><small>${esc92([m.ref,m.note].filter(Boolean).join(' • ')||'-')}</small></div>
       <div class="stock-data-mutation-qty ${m.direction}">${m.direction==='out'?'−':'+'}${qtyText92(m.qty)}</div>
     </div>`;
}).join(''):'<div class="stock-data-empty">Belum ada riwayat mutasi.</div>';
openStockDataDetailPageV512(p,`
     <div class="stock-data-detail-summary">
       <div class="stock-data-detail-stat"><span>Mode</span><b>Varian Harga</b></div>
       <div class="stock-data-detail-stat"><span>Total Stok</span><b>${qtyText92(p.stock)} ${esc92(p.unit||'pcs')}</b></div>
       <div class="stock-data-detail-stat"><span>Nilai Modal</span><b>${rp92(stockValue92(p))}</b></div>
       <div class="stock-data-detail-stat"><span>Estimasi Jual</span><b>${rp92(stockRetailValue92(p))}</b></div>
     </div>
     <div class="stock-data-mutation-head"><b>Stok per Varian</b><span>${variants.length} varian • total otomatis</span></div>
     <div class="stock-data-variant-grid-v92">${variantHtml}</div>
     <div class="stock-data-mutation-head"><b>Riwayat Mutasi</b><span>${moves.length} catatan terbaru</span></div>
     <div class="stock-data-mutations">${moveHtml}</div>
     <div class="stock-data-adjust-note">Setiap varian memiliki stok sendiri. Ubah stok lewat Stok Opname.</div>`,
);
};
const baseRenderPurchaseDetailV92=window.renderPurchaseDetailPage;
if(typeof baseRenderPurchaseDetailV92==='function'){
window.renderPurchaseDetailPage=function(){
const r=baseRenderPurchaseDetailV92.apply(this,arguments);
const purchase=(db.purchases||[]).find(p=>String(p.id)===String(activePurchaseDetailId));
if(!purchase)return r;
document.querySelectorAll('#purchaseDetailMobileBody .sale-detail-item-table tbody tr').forEach((tr,i)=>{
const line=purchase.lines?.[i];
const variant=String(line?.variant||'').trim();
if(!variant)return;
const prod=tr.querySelector('.sale-detail-item-product');
if(prod&&!prod.dataset.variantV92){
prod.dataset.variantV92='1';
prod.insertAdjacentHTML('beforeend',` <span class="pill blue">${esc92(variant)}</span>`);
}
});
return r;
};
}
function initV92(){
const changed=normalizeAllVariantStocks92();
if(changed){
try{save()}catch(e){}
}
try{enhanceStockScreen92()}catch(e){}
try{
if(document.getElementById('screen-stock-data')?.classList.contains('active'))enhanceStockData92();
}catch(e){}
}
window.variantStockEnabledV92=variantStockEnabled92;
window.variantStockV92=variantStock92;
window.variantStockTotalV92=p=>variantStockEnabled92(p)?syncVariantAggregate92(p):n92(p?.stock);
window.variantStockAdjustV92=adjustVariantStock92;
window.variantStockSyncV92=syncVariantAggregate92;
window.INPOS_VARIANT_STOCK_VERSION='v92-end-to-end';
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',()=>setTimeout(initV92,0),{once:true});
}else setTimeout(initV92,0);
})();
