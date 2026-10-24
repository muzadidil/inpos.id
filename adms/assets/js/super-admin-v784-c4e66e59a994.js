
(()=>{'use strict';

/* v730 — Akun Super Admin tetap; pemeriksaan lokal sampai API Node.js tersedia. */
if(document.documentElement.dataset.saAuth!=='ready'){
 const f=document.getElementById('saLoginForm'),u=document.getElementById('saUsername'),p=document.getElementById('saPin'),msg=document.getElementById('saLoginError');
 const consent=document.getElementById('saLoginConfirm'),submit=document.getElementById('saLoginSubmit');
 function syncConsent(){submit.disabled=!consent.checked;if(consent.checked&&msg.dataset.reason==='confirm'){msg.textContent='';delete msg.dataset.reason;}}
 consent.addEventListener('change',syncConsent);
 syncConsent();
 document.getElementById('saTogglePin').addEventListener('click',e=>{const showing=p.type==='password';p.type=showing?'text':'password';e.currentTarget.setAttribute('aria-pressed',showing?'true':'false');e.currentTarget.setAttribute('aria-label',showing?'Sembunyikan PIN':'Tampilkan PIN');});
 f.addEventListener('submit',async event=>{event.preventDefault();if(!consent.checked){msg.dataset.reason='confirm';msg.textContent='Centang konfirmasi akses Super Admin terlebih dahulu.';consent.focus();syncConsent();return;}msg.textContent='';delete msg.dataset.reason;try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({username:u.value.trim(),pin:p.value})});const d=await r.json();if(!r.ok){msg.textContent=d.error||'Login gagal.';return;}location.reload()}catch(e){msg.textContent='Server lokal tidak dapat dihubungi.'}});
 return;
}
const KEY='inpos_super_admin_subscriptions_demo_v3', INPOS_REG_KEY='myposid_demo_v3';
// UI-only state, scoped per tab. No PIN, token or tenant data is persisted here.
const INPOS_ADMIN_PAGE_KEY='inpos_admin_current_page_v773';
const INPOS_ADMIN_ALLOWED_PAGES=['home','tenants','payments','settings'];
function inposRestoreAdminPage(){try{const s=sessionStorage.getItem(INPOS_ADMIN_PAGE_KEY);return INPOS_ADMIN_ALLOWED_PAGES.includes(s)?s:'home'}catch(_){return 'home'}}
function inposRememberAdminPage(page){try{if(INPOS_ADMIN_ALLOWED_PAGES.includes(page))sessionStorage.setItem(INPOS_ADMIN_PAGE_KEY,page)}catch(_){}}

// v15 demo bridge: INPOS tenant posts a request to this same-origin key. For production use authenticated Laravel API, never client-provided tenant authority.
const BROADCAST_FEED_KEY='inpos_broadcast_feed_demo_v1'; // feed satu-origin untuk integrasi INPOS (demo)
const TENANT_REQUESTS_KEY='inpos_tenant_subscription_requests_demo_v1', TENANT_RESPONSES_KEY='inpos_tenant_subscription_results_demo_v1';
const TENANT_CONFIRMATIONS_KEY='inpos_tenant_subscription_confirmations_demo_v1', PUBLIC_STATE_KEY='inpos_demo_public_state_v1';
const icons={megaphone:'<path d="m3 11 18-7v16L3 13v-2ZM3 11H1v2h2M7 14l2 6h4l-3-5"/>',send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>',database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 2 4 3 9 3s9-1 9-3V5M3 12c0 2 4 3 9 3s9-1 9-3"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',store:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 8l2-5h14l2 5M3 8c0 2 4 3 5 0 1 3 4 3 4 0 1 3 4 3 4 0 1 3 5 2 5 0M9 21v-8h6v8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .9 1.6-2 2-1.6-.9a8 8 0 0 1-2 .8l-.5 1.8h-2.8l-.5-1.8a8 8 0 0 1-2-.8l-1.6.9-2-2 .9-1.6a8 8 0 0 1-.8-2L3.6 12l1.8-.5a8 8 0 0 1 .8-2l-.9-1.6 2-2 1.6.9a8 8 0 0 1 2-.8L11.4 4h2.8l.5 1.8a8 8 0 0 1 2 .8l1.6-.9 2 2-.9 1.6a8 8 0 0 1 .8 2l1.8.5-1.8.5a8 8 0 0 1-.8 2Z"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',check:'<path d="M5 12l4 4L19 6"/>',close:'<path d="M6 6l12 12M18 6 6 18"/>',chevron:'<path d="m9 6 6 6-6 6"/>',wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M16 12h5M3 10V5a2 2 0 0 1 2-2h13"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 5a5 5 0 0 1 4 5"/>',alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4m0 4h.01"/>',receipt:'<path d="M5 2h14v20l-3-2-4 2-4-2-3 2V2Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 2-2 6 6"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/>',edit:'<path d="M4 20h4l12-12-4-4L4 16v4ZM14 6l4 4"/>',pause:'<rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/>',play:'<path d="m7 4 13 8-13 8z"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>','globe-check':'<circle cx="11" cy="11" r="8"/><path d="M3 11h16M11 3c-2.2 2.3-3.5 5-3.5 8s1.3 5.7 3.5 8M11 3c2.2 2.3 3.5 5 3.5 8"/><path d="m16 19 2 2 4-5"/>','banknote':'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h.01M19 15h.01"/>','key':'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 10-10 2 2-3 3 2 2-3 3"/>','mail':'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',file:'<path d="M13 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10z"/><path d="M13 2v8h8"/>'};
const I=(n,s=19)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||icons.info}</svg>`;
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'Rp '+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Math.max(0,Number(n)||0));
// Rupiah menggunakan titik ribuan, tanpa pecahan sen.
// v11: diskon paket hanya untuk langganan dengan jumlah bulan tepat sesuai aturan.
const digits=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(Math.max(0,Math.floor(Number(n)||0)));
const parseNominal=v=>{let x=String(v??'').trim();return /^[0-9.]+$/.test(x)?Number(x.replace(/\./g,'')):NaN};
function formatNominalField(el){const raw=el.value,old=el.selectionStart??raw.length;const left=(raw.slice(0,old).match(/\d/g)||[]).length;const cleaned=raw.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,12);const out=cleaned?digits(cleaned):'';if(out!==raw){el.value=out;let pos=0,seen=0;while(pos<out.length&&seen<left){if(/\d/.test(out[pos]))seen++;pos++}el.setSelectionRange(pos,pos)}}
function paymentTotal(p){return num(p.amount)+num(p.uniqueCode)}
function paymentCode(p){return num(p.uniqueCode)?String(num(p.uniqueCode)).padStart(3,'0'):'—'}
// Kode tiga digit harus unik di antara tagihan menunggu. Hindari pula total bayar yang sama.
function nextUniqueCode(amount){const pend=db.payments.filter(p=>p.status==='pending');const used=new Set(pend.map(p=>num(p.uniqueCode)));const totals=new Set(pend.map(paymentTotal));for(let i=0;i<999;i++){let code=1+((num(db.nextPayment)+i)%999);if(!used.has(code)&&!totals.has(num(amount)+code))return code}return null}
function discountConfig(){const raw=db.config.subscriptionDiscount||{};return {enabled:raw.enabled===true,rules:Array.isArray(raw.rules)?raw.rules.filter(r=>r&&Number.isInteger(Number(r.months))&&Number(r.months)>=1&&Number(r.months)<=36&&['percent','fixed'].includes(r.mode)&&Number.isFinite(Number(r.value))&&Number(r.value)>=0).map(r=>({months:Number(r.months),mode:r.mode,value:Number(r.value)})):[]}}
/* v1.1.18/v781 — Paket langganan tarif NET, alternatif tahunan, komisi berbasis paket.
   Diskon promosi sesuai brief disimpan TERPISAH dari diskon aktual harga normal Rp35.000.
   Harga publik dan komisi dari backend produksi harus dihitung ulang di SERVER. */
function planConfig(){
 const raw=db.config.subscriptionPlans||{},defaults=[{months:3,monthly:30000,commission:6000},{months:6,monthly:25000,commission:5000},{months:12,monthly:20000,commission:4000}];
 const source=Array.isArray(raw.rows)?raw.rows:defaults;
 const rows=source.filter(x=>x&&Number.isInteger(Number(x.months))&&Number(x.months)>=2&&Number(x.months)<=36&&Number.isSafeInteger(Number(x.monthly))&&Number(x.monthly)>0&&Number.isSafeInteger(Number(x.commission))&&Number(x.commission)>=0).map(x=>({months:Number(x.months),monthly:Number(x.monthly),commission:Number(x.commission),discountMode:x.discountMode==='percent'?'percent':'fixed',discountValue:Number(x.discountValue)||0}));
 return {enabled:raw.enabled!==false,rows:rows.sort((a,b)=>a.months-b.months)};
}
function annualConfig(){const v=db.config.annualAlternative||{},d={enabled:true,firstPrice:150000,renewPrice:20000,firstCommission:50000,renewCommission:5000};return {enabled:v.enabled!==false,...Object.fromEntries(['firstPrice','renewPrice','firstCommission','renewCommission'].map(k=>[k,Number.isSafeInteger(+v[k])&&+v[k]>=0?+v[k]:d[k]]))}}
function taxYearlyPrice(){const v=Number(db.config.taxYearlyPrice);return Number.isSafeInteger(v)&&v>=0?v:num(db.config.tax)*12}
function taxAnnualConfig(){const t=db.config.taxAnnual||{};return {enabled:t.enabled!==false,mode:t.mode==='percent'?'percent':'fixed',value:Number.isFinite(+t.value)&&+t.value>=0?+t.value:0}}
function hasPaidAnnual(t){return db.payments.some(p=>p.tenantId===t?.id&&p.type==='sub'&&p.status==='approved'&&['annual_first','annual_renewal'].includes(p.planType))}
/* v782 — satu editor paket + komisi, durasi dinamis (2–36 bulan). */
function parseUnifiedPercent(raw){const v=String(raw??'').trim().replace(',','.');return /^\d+(?:\.\d{1,4})?$/.test(v)?Number(v):NaN}
function planDiscountUI(month){
 const normal=num(db.config.monthly),row=planConfig().rows.find(r=>r.months===month),old=db.config.subscriptionPlans?.rows?.find(r=>Number(r.months)===month)||{},c=referralConfig();
 if(month===1)return {mode:'normal',value:0,commission:c.mode==='percent'?Math.round(normal*c.value/100):Math.floor(c.value)};
 const cut=Math.max(0,normal-(row?.monthly??normal)),mode=old.discountMode==='percent'?'percent':'fixed';
 const value=mode==='percent'?(normal?Number((cut*100/normal).toFixed(4)):0):cut;
 return {mode,value:mode==='percent'&&Number.isFinite(Number(old.discountValue))&&Math.round(normal*Number(old.discountValue)/100)===cut?Number(old.discountValue):value,commission:row?.commission||0};
}
function unifiedRowMarkup(month){
 const v=planDiscountUI(month),normal=month===1;
 return `<div class="inpos-unified-row" data-plan-month="${month}">
 <label class="inpos-unified-field inpos-month-field"><span class="inpos-mobile-head">Bulan</span><input class="unified-month" type="number" min="${normal?1:2}" max="${normal?1:36}" value="${month}" ${normal?'readonly':''} aria-label="Durasi paket dalam bulan" required></label>
 <label class="inpos-unified-field"><span class="inpos-mobile-head">Jenis</span><select class="unified-discount-mode" data-prev-mode="${v.mode}" ${normal?'disabled':''} aria-label="Jenis diskon"><option value="normal" ${normal?'selected':''} ${normal?'':'disabled'}>Normal</option>${normal?'':`<option value="fixed" ${v.mode==='fixed'?'selected':''}>Rp</option><option value="percent" ${v.mode==='percent'?'selected':''}>%</option>`}</select></label>
 <label class="inpos-unified-field"><span class="inpos-mobile-head">Potongan/bln</span><input class="unified-discount-value" type="text" ${v.mode==='fixed'?'data-rupiah':''} inputmode="${v.mode==='percent'?'decimal':'numeric'}" value="${v.mode==='fixed'?digits(v.value):v.value}" aria-label="Potongan per bulan" ${normal?'disabled':''} required></label>
 <label class="inpos-unified-field"><span class="inpos-mobile-head">Komisi</span><input class="unified-commission" type="text" data-rupiah inputmode="numeric" value="${digits(v.commission)}" aria-label="Komisi referral" required></label>
 ${normal?'<div class="inpos-unified-delete-slot"></div>':`<button class="btn smol inpos-unified-delete" type="button" data-action="unified-remove" aria-label="Hapus paket ${month} bulan" title="Hapus paket">${I('trash',15)}</button>`}
 <div class="inpos-unified-subtotal" aria-live="polite"></div></div>`;
}
function unifiedDiscountMarkup(){const config=planConfig();return `<section class="card settings-panel settings-wide" id="inposUnifiedDiscountCard"><h3 class="card-title">Diskon Paket</h3><p class="setting-help">Atur harga paket lewat potongan per bulan. Komisi diberikan satu kali untuk referral yang sah.</p>
 <form id="unifiedDiscountForm"><div class="inpos-unified-switches"><label class="referral-switch"><input type="checkbox" id="unifiedPlansEnabled" ${config.enabled?'checked':''}> Aktifkan paket</label><label class="referral-switch"><input type="checkbox" id="unifiedCommissionEnabled" ${db.config.packageCommissionEnabled!==false?'checked':''}> Komisi referral aktif</label></div>
 <div class="inpos-unified-header" aria-hidden="true"><span>Bulan</span><span>Jenis</span><span>Potongan/bln</span><span>Komisi Referral (Rp)</span><span></span></div><div class="inpos-unified-rows" id="unifiedRows">${unifiedRowMarkup(1)}${config.rows.map(r=>unifiedRowMarkup(r.months)).join('')}</div>
 <div class="inpos-unified-actions"><button type="button" class="btn" data-action="unified-add">${I('plus',15)} Tambah Bulan</button><span>1 bulan = harga normal ${money(num(db.config.monthly))}</span></div>
 <button class="btn primary full" type="submit">${I('check',17)} Simpan Paket</button></form></section>`}
function readUnifiedDiscountRow(row){
 const month=Number(row.querySelector('.unified-month')?.value),normal=num(db.config.monthly),base=month===1;
 if(!Number.isSafeInteger(month)||month<1||month>36||(base&&row.dataset.planMonth!=='1'))throw Error('Durasi paket 2–36 bulan.');
 const mode=base?'normal':row.querySelector('.unified-discount-mode').value;
 const raw=row.querySelector('.unified-discount-value').value;
 const value=base?0:mode==='percent'?parseUnifiedPercent(raw):parseNominal(raw);
 const commission=parseNominal(row.querySelector('.unified-commission').value);
 if(!Number.isSafeInteger(commission)||commission<0||commission>1000000000)throw Error('Komisi paket '+month+' bulan tidak valid.');
 if(!base&&(!['percent','fixed'].includes(mode)||!Number.isFinite(value)||value<0||mode==='percent'&&value>100||mode==='fixed'&&!Number.isSafeInteger(value)))throw Error('Potongan paket '+month+' bulan tidak valid.');
 const cut=base?0:mode==='percent'?Math.round(normal*value/100):value,monthly=normal-cut;
 if(monthly<=0||cut<0||commission>monthly*month)throw Error('Paket '+month+' bulan: diskon/komisi melebihi harga paket.');
 return {months:month,mode,value,cut,monthly,commission};
}
function readUnifiedDiscountRows(){const nodes=[...document.querySelectorAll('#unifiedRows .inpos-unified-row')],result=nodes.map(readUnifiedDiscountRow);if(result.length>21)throw Error('Maksimal 20 paket tambahan.');if(new Set(result.map(r=>r.months)).size!==result.length)throw Error('Durasi bulan tidak boleh sama.');if(result.filter(r=>r.months===1).length!==1)throw Error('Harga normal 1 bulan tidak boleh dihapus.');return result.sort((a,b)=>a.months-b.months)}
function refreshUnifiedDiscountPreview(){const enabled=$('unifiedPlansEnabled')?.checked===true;
 for(const row of document.querySelectorAll('#unifiedRows .inpos-unified-row')){const el=row.querySelector('.inpos-unified-subtotal');try{const v=readUnifiedDiscountRow(row);el.classList.remove('inpos-unified-error');el.textContent=v.months===1||enabled?`${money(v.monthly)}/bln · Total ${money(v.monthly*v.months)}`:`Nonaktif · total normal ${money(num(db.config.monthly)*v.months)}`;}catch(e){el.classList.add('inpos-unified-error');el.textContent=e.message}}
}
function changeUnifiedDiscountMode(select){const row=select.closest('.inpos-unified-row'),input=row?.querySelector('.unified-discount-value');if(!input)return;const normal=num(db.config.monthly),old=select.dataset.prevMode||'fixed',v=old==='percent'?parseUnifiedPercent(input.value):parseNominal(input.value),cut=Number.isFinite(v)?old==='percent'?Math.round(normal*v/100):v:0;
 if(select.value==='percent'){input.removeAttribute('data-rupiah');input.inputMode='decimal';input.value=normal?String(Number((cut/normal*100).toFixed(4))):'0'}else{input.setAttribute('data-rupiah','');input.inputMode='numeric';input.value=digits(cut)}select.dataset.prevMode=select.value;refreshUnifiedDiscountPreview()}
function addUnifiedDiscountRow(){const rows=$('unifiedRows');if(!rows)return;if(rows.children.length>=21)return toast('Maksimal 20 paket tambahan.','error');const taken=new Set([...rows.querySelectorAll('.unified-month')].map(x=>Number(x.value))),next=[3,6,12,2,4,5,9,18,24,36,...Array.from({length:35},(_,i)=>i+2)].find(m=>!taken.has(m));if(!next)return toast('Semua durasi terpakai.','error');rows.insertAdjacentHTML('beforeend',unifiedRowMarkup(next));const latest=rows.lastElementChild;latest.querySelector('.unified-month').focus();refreshUnifiedDiscountPreview()}
function saveUnifiedDiscountSettings(){try{const values=readUnifiedDiscountRows(),enabled=$('unifiedPlansEnabled').checked,commissionEnabled=$('unifiedCommissionEnabled').checked,before=JSON.stringify(db.config);db.config.subscriptionPlans={enabled,rows:values.filter(r=>r.months!==1).map(r=>({months:r.months,monthly:r.monthly,commission:r.commission,discountMode:r.mode,discountValue:r.value}))};db.config.referralCommission={enabled:commissionEnabled,mode:'fixed',value:values.find(r=>r.months===1).commission};db.config.packageCommissionEnabled=commissionEnabled;db.config.subscriptionDiscount={enabled:false,rules:[]};if(save()){draw();toast('Paket dan komisi tersimpan untuk tagihan baru.')}else db.config=JSON.parse(before)}catch(e){toast(e.message,'error')}}
function pricingPanelsMarkup(){const a=annualConfig(),t=taxAnnualConfig();return `${unifiedDiscountMarkup()}<section class="card settings-panel settings-wide"><h3 class="card-title">Tahunan Alternatif</h3><p class="setting-help">Pilihan selain paket 12 bulan; harga perpanjangan berlaku setelah tahun pertama disetujui.</p><form id="inposAnnualForm"><label class="referral-switch"><input type="checkbox" id="annualEnabled" ${a.enabled?'checked':''}> Aktifkan pilihan tahunan</label><div class="inpos-annual-grid">${[['annualFirstPrice','Harga tahun pertama',a.firstPrice],['annualFirstFee','Komisi tahun pertama',a.firstCommission],['annualRenewPrice','Harga perpanjangan',a.renewPrice],['annualRenewFee','Komisi perpanjangan',a.renewCommission]].map(([id,label,val])=>`<label class="field"><span class="sa-inline-caption">${label} (Rp)</span><input id="${id}" type="text" data-rupiah inputmode="numeric" value="${digits(val)}" required></label>`).join('')}</div><button type="submit" class="btn primary full">${I('check',17)} Simpan Tahunan</button></form></section>`}
function yearlyTaxPanelsMarkup(){const t=taxAnnualConfig();return `<section class="card settings-panel settings-wide"><h3 class="card-title">Tarif Layanan Pajak</h3><p class="setting-help">Hanya 12 bulan. Diskon Pajak dihitung sekali dari harga tahunan, terpisah dari diskon paket INPOS.</p><form id="inposTaxAnnualForm"><div class="inpos-annual-grid"><label class="field"><span class="sa-inline-caption">Tarif Pajak / tahun (Rp)</span><input id="taxYearlyPrice" type="text" data-rupiah inputmode="numeric" value="${digits(taxYearlyPrice())}" required></label><label class="field"><span class="sa-inline-caption">Jenis diskon</span><select id="taxAnnualMode"><option value="fixed" ${t.mode==='fixed'?'selected':''}>Rupiah (Rp)</option><option value="percent" ${t.mode==='percent'?'selected':''}>Persentase (%)</option></select></label><label class="field"><span class="sa-inline-caption">Nilai diskon</span><input id="taxAnnualValue" type="text" ${t.mode==='fixed'?'data-rupiah':''} inputmode="${t.mode==='fixed'?'numeric':'decimal'}" value="${t.mode==='fixed'?digits(t.value):t.value}" required></label></div><div class="inpos-tax-year-preview" id="taxAnnualPreview"></div><button type="submit" class="btn primary full">${I('check',17)} Simpan Pajak Tahunan</button></form></section>`}
function validateMoneyFields(pairs){const out={};for(const [k,id] of pairs){const v=parseNominal($(id)?.value);if(!Number.isSafeInteger(v)||v<0||v>1000000000)throw Error('Periksa nominal '+k+' (Rp).');out[k]=v}return out}
function saveAnnualForm(){try{const v=validateMoneyFields([['tahunPertama','annualFirstPrice'],['komisiPertama','annualFirstFee'],['perpanjangan','annualRenewPrice'],['komisiPerpanjangan','annualRenewFee']]);if(($('annualEnabled')?.checked&&(v.tahunPertama<=0||v.perpanjangan<=0))||v.komisiPertama>v.tahunPertama||v.komisiPerpanjangan>v.perpanjangan)throw Error('Tarif tahunan harus lebih dari Rp0 dan komisi tidak boleh lebih besar daripada tarif.');const previous=db.config.annualAlternative;db.config.annualAlternative={enabled:$('annualEnabled').checked,firstPrice:v.tahunPertama,renewPrice:v.perpanjangan,firstCommission:v.komisiPertama,renewCommission:v.komisiPerpanjangan};if(save()){draw();toast('Paket tahunan alternatif tersimpan.')}else db.config.annualAlternative=previous}catch(e){toast(e.message,'error')}}
function readTaxAnnualDraft(){const mode=$('taxAnnualMode')?.value||'fixed';let value=mode==='fixed'?parseNominal($('taxAnnualValue')?.value):parsePercent($('taxAnnualValue')?.value);return {enabled:true,mode,value}}
function updateTaxAnnualPreview(){const el=$('taxAnnualPreview');if(!el)return;const t=readTaxAnnualDraft(),gross=parseNominal($('taxYearlyPrice')?.value),cut=Number.isFinite(t.value)?(t.mode==='percent'?Math.round(gross*t.value/100):t.value):0;el.textContent=Number.isFinite(cut)&&cut>=0&&cut<=gross?`Harga awal ${money(gross)} · Potongan ${money(t.enabled?cut:0)} · Total Pajak 12 bulan ${money(gross-(t.enabled?cut:0))}`:'Periksa nilai diskon.'}
function saveTaxAnnualForm(){const t=readTaxAnnualDraft(),gross=parseNominal($('taxYearlyPrice')?.value);if(!Number.isSafeInteger(gross)||gross<=0||gross>1000000000){toast('Tarif Pajak tahunan tidak valid.','error');return}if(!['fixed','percent'].includes(t.mode)||!Number.isFinite(t.value)||t.value<0||(t.mode==='percent'&&t.value>100)||(t.mode==='fixed'&&(!Number.isSafeInteger(t.value)||t.value>gross))){toast('Diskon Pajak maksimal 100% atau sebesar total pajak 12 bulan.','error');return}const old={taxAnnual:db.config.taxAnnual,taxYearlyPrice:db.config.taxYearlyPrice};db.config.taxAnnual=t;db.config.taxYearlyPrice=gross;if(save()){draw();toast('Tarif dan diskon Pajak tahunan tersimpan untuk tagihan baru.')}else Object.assign(db.config,old)}
function validReferralForTenantV729(tenant){const code=String(tenant?.referral||'').trim().toUpperCase();if(!code)return false;if(code==='DEMO1234')return true;return db.tenants.some(m=>m.id!==tenant.id&&(ownedReferralCode(m)===code||('INP'+String(m.code).padStart(3,'0'))===code))}
function quoteSubscription(type,months,tenant,choice='monthly'){
 const regular=num(db.config.monthly),tax=num(db.config.tax);
 if(type==='tax'){
  if(months!==12)throw Error('Layanan Pajak hanya tersedia tahunan (12 bulan).');const gross=taxYearlyPrice(),t=taxAnnualConfig();let cut=0;
  if(months===12&&t.enabled)cut=Math.min(gross,t.mode==='percent'?Math.round(gross*t.value/100):num(t.value));
  return {gross,amount:gross-cut,discount:cut?{months,mode:t.mode,value:t.value,amount:cut,packageAmount:cut}:null,planType:'tax_annual',planCommission:0};
 }
 const a=annualConfig();
 if(choice==='annual'&&months===12&&a.enabled){const renew=hasPaidAnnual(tenant),amount=renew?a.renewPrice:a.firstPrice;return {gross:amount,amount,discount:null,planType:renew?'annual_renewal':'annual_first',planCommission:renew?a.renewCommission:a.firstCommission};}
 const c=planConfig(),r=c.enabled?c.rows.find(r=>r.months===months):null;
 if(r){const amount=r.monthly*months,gross=regular*months,cut=Math.max(0,gross-amount);return {gross:Math.max(amount,gross),amount,discount:cut>0?{months,mode:'fixed',value:cut,amount:cut,packageAmount:cut}:null,planType:'term_'+months,planCommission:r.commission};}
 const gross=regular*months,d=discountConfig(),eligible=validReferralForTenantV729(tenant),rule=eligible&&d.enabled?d.rules.find(r=>r.months===months):null;
 const cut=rule?Math.min(gross,Math.max(0,rule.mode==='percent'?Math.round(gross*rule.value/100):Math.floor(rule.value))):0;
 return {gross,amount:gross-cut,discount:cut>0?{months,mode:rule.mode,value:rule.value,amount:cut,packageAmount:cut}:null,planType:'standard',planCommission:0};
}
function breakdown(amount,code,quote){
 const hasCode=num(code)>0,off=num(quote?.discount?.amount),original=off?num(quote?.gross)||num(amount)+off:num(amount);
 return `<div class="amount-breakdown">${off?`<div class="amount-line"><span>Harga awal</span><b>${money(original)}</b></div><div class="amount-line discount-saved"><span>Diskon paket ${num(quote?.discount?.months)} bulan</span><b>− ${money(off)}</b></div>`:''}<div class="amount-line"><span>${off?'Setelah diskon':'Harga langganan / fitur'}</span><b>${money(amount)}</b></div><div class="amount-line"><span>Kode unik</span><b>${hasCode?`+ ${money(code)} <small>(${String(code).padStart(3,'0')})</small>`:'— (transaksi lama)'}</b></div><div class="amount-line amount-total"><span>Total bayar</span><b>${money(num(amount)+num(code))}</b></div></div>`;
}


const nowISO=()=>new Date().toISOString();
function wibDate(d=new Date()){let parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);let o=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${o.year}-${o.month}-${o.day}`}
function plusDays(iso,n){let d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function plusMonths(iso,months){const [y,m,day]=iso.split('-').map(Number);const base=new Date(Date.UTC(y,m-1+months,1));const end=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+1,0)).getUTCDate();base.setUTCDate(Math.min(day,end));return base.toISOString().slice(0,10)}
function diffDays(end){if(!end)return -9999;const today=wibDate();return Math.round((new Date(end+'T00:00:00Z')-new Date(today+'T00:00:00Z'))/86400000)}
const date=id=>id?new Intl.DateTimeFormat('id-ID',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(new Date(id+'T12:00:00Z')):'—';
const stamp=s=>s?new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(s)):'—';
const num=s=>Math.max(0,Math.floor(Number(s)||0));
function inposDemoTenantV726(code='001'){
 const t=wibDate();return {id:'T'+code,code,name:'Inpos',owner:'Belum diatur',wa:'087890000023',email:'',referral:'',source:'demo-inpos-v726',registeredAt:nowISO(),subdomain:'inpos',username:'inpos',demoPin:'321123',address:'',end:plusDays(t,60),taxEnd:'',suspended:false,created:nowISO(),subdomainValidation:{ok:true,mode:'demo',slug:'inpos',checkedAt:nowISO()}};
}
function initial(){return {version:1,config:{monthly:35000,tax:25000,taxYearlyPrice:300000,subscriptionPlans:{enabled:true,rows:[{months:3,monthly:30000,commission:6000,promoSaving:10000},{months:6,monthly:25000,commission:5000,promoSaving:15000},{months:12,monthly:20000,commission:4000,promoSaving:20000}]},packageCommissionEnabled:true,annualAlternative:{enabled:true,firstPrice:150000,renewPrice:20000,firstCommission:50000,renewCommission:5000},taxAnnual:{enabled:true,mode:'fixed',value:0},reminder:7,trialDays:60,merchant:'INPOS • Pembayaran Langganan',confirmationWhatsapp:'',minimumPayout:0,qris:''},nextTenant:2,nextPayment:1,nextNote:1,commissionPayouts:[],broadcasts:[],tenants:[inposDemoTenantV726()],payments:[],notifications:[]}}
// Migrasi data demo v725. Pertahankan mitra yang dibuat pengguna, jangan menghapus data nyata.
function migrateInposDemoV726(x){
 if(window.INPOS_LOCAL_SERVER)return false; // Mitra wajib dari database, bukan seed demo.
 if(x.inposDemoSeedV726===true)return false;
 let changed=false;
 const legacy={T001:['081234567801','Warung Berkah','Budi'],T002:['081234567802','Resto Seruni','Sinta'],T003:['081234567803','Kopi Tengah','Rafi'],T004:['081234567804','Toko Sahabat','Dina'],T005:['081234567805','Laundry Maju','Ardi'],T006:['081234567806','Booth Sari','Sari']};
 const removed=new Set();
 x.tenants=x.tenants.filter(t=>{
  const old=Array.isArray(legacy[t.id])&&legacy[t.id][0]===t.wa&&legacy[t.id][1]===t.name&&legacy[t.id][2]===t.owner&&t.source==='demo';
  if(old){removed.add(t.id);changed=true;return false}
  return true;
 });
 if(removed.size){
  const dropped=new Set(x.payments.filter(p=>removed.has(p.tenantId)).map(p=>p.id));
  x.payments=x.payments.filter(p=>!removed.has(p.tenantId));
  x.notifications=x.notifications.filter(n=>!dropped.has(n.paymentId)&&!(n.id==='N004'&&n.title==='Data demonstrasi siap'));
 }
 const existing=x.tenants.find(t=>t.subdomain==='inpos'||normalizeWA(t.wa)==='6287890000023');
 if(!existing){
  let n=1;const used=new Set(x.tenants.map(t=>t.code));while(used.has(String(n).padStart(3,'0')))n++;
  x.tenants.push(inposDemoTenantV726(String(n).padStart(3,'0')));changed=true
 }else if(existing.source==='demo-inpos-v726'){
  if(existing.username!=='inpos'||existing.demoPin!=='321123'||existing.wa!=='087890000023'){
   existing.username='inpos';existing.demoPin='321123';existing.wa='087890000023';changed=true;
  }
 }
 const maxCode=Math.max(0,...x.tenants.map(t=>Number(t.code)||0));
 if(x.nextTenant<=maxCode){x.nextTenant=maxCode+1;changed=true}
 if(x.nextPayment<1){x.nextPayment=1;changed=true}
 if(x.nextNote<1){x.nextNote=1;changed=true}
 x.inposDemoSeedV726=true;return true;
}
function migrateCodes(x){
 const used=new Set(),totals=new Set();let changed=false;
 for(const p of x.payments){
  const old=Number(p.uniqueCode);if(p.status!=='pending'){if(!Number.isInteger(old)||old<0||old>999){p.uniqueCode=0;changed=true}continue}
  if(Number.isInteger(old)&&old>=1&&old<=999&&!used.has(old)&&!totals.has(num(p.amount)+old)){used.add(old);totals.add(num(p.amount)+old);continue}
  let code=null;for(let i=1;i<=999;i++){if(!used.has(i)&&!totals.has(num(p.amount)+i)){code=i;break}}
  if(code==null){throw Error('Kode unik pembayaran aktif sudah penuh')}
  p.uniqueCode=code;used.add(code);totals.add(num(p.amount)+code);changed=true;
 }
 return changed;
}
let storageCorrupt=false;
function load(){
 let raw=null;
 try{raw=localStorage.getItem(KEY);if(!raw){storageCorrupt=false;return initial()}const x=JSON.parse(raw);if(!valid(x))throw Error('Skema tidak cocok');if(!Array.isArray(x.commissionPayouts))x.commissionPayouts=[];if(!Array.isArray(x.broadcasts))x.broadcasts=[];const demoMigrated=migrateInposDemoV726(x);const codesMigrated=migrateCodes(x);const planMigrated=!Object.prototype.hasOwnProperty.call(x.config,'subscriptionPlans');if(planMigrated){if(Number(x.config.monthly)===49000)x.config.monthly=35000;const defaults=initial().config;x.config.subscriptionPlans=defaults.subscriptionPlans;x.config.annualAlternative=defaults.annualAlternative;x.config.taxAnnual=defaults.taxAnnual;x.config.packageCommissionEnabled=true;}const pricingMigrated=Object.prototype.hasOwnProperty.call(x.config,'referralPricing');if(pricingMigrated)delete x.config.referralPricing;if(demoMigrated||codesMigrated||pricingMigrated||planMigrated){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){console.warn('Gagal menyimpan migrasi data mitra:',e)}}storageCorrupt=false;return x}
 catch(e){console.warn('Data Super Admin tidak dapat dibaca; penyimpanan diblokir untuk melindungi cadangan lama.',e);if(raw!==null)storageCorrupt=true;return initial()}
}
function valid(x){
 if(!x||x.version!==1||!Array.isArray(x.tenants)||!Array.isArray(x.payments)||!Array.isArray(x.notifications)||!x.config||typeof x.config!=='object'||Array.isArray(x.config)||!Number.isSafeInteger(Number(x.nextTenant))||!Number.isSafeInteger(Number(x.nextPayment))||Number(x.nextTenant)<1||Number(x.nextPayment)<0)return false;
 const tenants=new Set(),codes=new Set(),payments=new Set();
 for(const t of x.tenants){if(!t||typeof t!=='object'||Array.isArray(t)||typeof t.id!=='string'||!/^T\d{3,}$/.test(t.id)||typeof t.code!=='string'||!/^\d{3,}$/.test(t.code)||typeof t.name!=='string'||typeof t.owner!=='string'||tenants.has(t.id)||codes.has(t.code))return false;tenants.add(t.id);codes.add(t.code)}
 for(const p of x.payments){if(!p||typeof p!=='object'||Array.isArray(p)||typeof p.id!=='string'||!/^P\d{3,}$/.test(p.id)||payments.has(p.id)||!tenants.has(p.tenantId)||!['pending','approved','rejected'].includes(p.status)||!['sub','tax'].includes(p.type)||!Number.isSafeInteger(Number(p.amount))||Number(p.amount)<0||Number(p.amount)>36000000000||!Number.isInteger(Number(p.months))||Number(p.months)<1||Number(p.months)>36)return false;payments.add(p.id)}
 if(!x.notifications.every(n=>n&&typeof n==='object'&&!Array.isArray(n)&&typeof n.title==='string'&&typeof n.body==='string'))return false;
 if(x.commissionPayouts!=null&&!Array.isArray(x.commissionPayouts))return false;
 if(x.broadcasts!=null&&!Array.isArray(x.broadcasts))return false;
 return true;
}
let db=load();if(!Array.isArray(db.broadcasts))db.broadcasts=[];let broadcastDraft={title:'',body:'',image:''};let view=inposRestoreAdminPage(),navHistory=[],tenantFilter='all',tenantSearch='',tenantVisibleLimit=50,payVisibleLimit=50,unbilledVisibleLimit=50,payTab='pending',paymentSection='subscriptions',payCategory='all',paySearch='',payPeriod='all',payPeriodDate=wibDate(),payPeriodMonth=wibDate().slice(0,7),payPeriodYear=wibDate().slice(0,4),modal='',selectedTenant=null,formState={};
function save(){
 if(storageCorrupt){toast('Data tersimpan sebelumnya tidak valid. Impor cadangan yang benar atau pulihkan data lokal terlebih dahulu.','error');return false}
 try{localStorage.setItem(KEY,JSON.stringify(db));if(!syncDemoPublicState())toast('Data utama tersimpan, tetapi sinkronisasi lokal belum berhasil.','error');return true}
 catch(e){toast('Gagal menyimpan. Ruang penyimpanan browser mungkin penuh.','error');return false}
}
// Data demonstrasi yang dipublikasikan ke kasir pada ORIGIN sama. Tanpa PIN/email/rekening.
// Jangan gunakan objek ini untuk autentikasi maupun akses tenant pada server produksi.
function syncDemoPublicState(){
 if(window.INPOS_LOCAL_SERVER)return true;
 const c=db.config||{};
 const publicData={v:1,updatedAt:nowISO(),config:{monthly:num(c.monthly),tax:num(c.tax),taxYearlyPrice:Number.isSafeInteger(c.taxYearlyPrice)?c.taxYearlyPrice:num(c.tax)*12,trialDays:num(c.trialDays||60),reminder:num(c.reminder||7),qris:c.qris||'',merchant:c.merchant||'',confirmationWhatsapp:c.confirmationWhatsapp||'',subscriptionDiscount:c.subscriptionDiscount||{enabled:false,rules:[]},subscriptionPlans:c.subscriptionPlans||planConfig(),annualAlternative:c.annualAlternative||annualConfig(),taxAnnual:c.taxAnnual||taxAnnualConfig(),packageCommissionEnabled:c.packageCommissionEnabled!==false},
 tenants:db.tenants.map(t=>({id:t.id,code:t.code,name:t.name,wa:t.wa,referral:t.referral||'',subdomain:t.subdomain||'',end:t.end||'',taxEnd:t.taxEnd||'',subscriptionType:t.subscriptionType||(t.lifetime?'lifetime':'monthly'),suspended:!!t.suspended})),
 payments:db.payments.filter(p=>p.source==='tenant-request-demo').slice(0,150).map(p=>({id:p.id,requestId:p.requestId,tenantId:p.tenantId,type:p.type,months:p.months,amount:p.amount,gross:p.gross||p.amount,discount:p.discount||null,uniqueCode:p.uniqueCode,status:p.status,created:p.created,confirmedAt:p.confirmedAt||'',handledAt:p.handledAt||''}))};
 try{localStorage.setItem(PUBLIC_STATE_KEY,JSON.stringify(publicData));return true}catch(e){console.warn('State publik demo tidak tersimpan. Ukuran QRIS terlalu besar?',e);return false}
}
// Auto-impor registrasi hanya pada localhost / origin demo yang sama. PIN tidak dibaca.
function syncLocalRegistration(){
 if(window.INPOS_LOCAL_SERVER)return; // Data Owner pada server tidak boleh diimpor dari browser admin.
 const profile=localRegistration();if(!profile)return;
 const existing=db.tenants.find(t=>normalizeWA(t.wa)===normalizeWA(profile.wa));
 if(existing){
  if(existing.source!=='inpos-local')return;
  const keys=['name','owner','wa','email','referral','address','registeredAt'];
  if(!keys.some(key=>String(existing[key]||'')!==String(profile[key]||'')))return;
  const before=JSON.stringify(db);for(const key of keys)existing[key]=profile[key];
  if(!save())db=JSON.parse(before);else{draw();toast('Profil Mitra diperbarui dari INPOS.')}
  return;
 }
 if(!Number.isSafeInteger(db.nextTenant)||db.nextTenant<1)return;
 const before=JSON.stringify(db),code=String(db.nextTenant).padStart(3,'0');
 let sub=slug(profile.name)||'mitra-'+code;if(db.tenants.some(x=>x.subdomain===sub))sub=(sub.slice(0,33)+'-'+code).slice(0,40);
 const since=Number.isFinite(Date.parse(profile.registeredAt))?wibDate(new Date(profile.registeredAt)):wibDate();
 db.tenants.push({...profile,id:'T'+code,code,subdomain:sub,end:plusDays(since,num(db.config.trialDays||60)),taxEnd:'',suspended:false,created:nowISO(),source:'inpos-local'});
 db.nextTenant++;addNote('Registrasi Mitra otomatis',profile.name+' • '+code);
 if(!save())db=JSON.parse(before);else{draw();toast('Registrasi INPOS ditambahkan ke Data Usaha.')}
}
function processTenantConfirmations(){
 if(window.INPOS_LOCAL_SERVER)return;
 let entries=[];try{const raw=JSON.parse(localStorage.getItem(TENANT_CONFIRMATIONS_KEY)||'[]');entries=Array.isArray(raw)?raw:[]}catch(_){return}
 if(!entries.length)return;
 const prior=JSON.stringify(db);let changed=0;
 for(const r of entries.slice(-300)){
  const p=db.payments.find(x=>x.requestId===r?.requestId&&x.id===r?.paymentId&&x.tenantId===r?.tenantId&&x.source==='tenant-request-demo'&&x.status==='pending');
  if(!p||p.confirmedAt)continue;
  p.confirmedAt=nowISO();changed++;
  const t=getTenant(p.tenantId);addNote('Konfirmasi pembayaran Mitra',`${t?.name||'Mitra'} • ${money(paymentTotal(p))}`,p.id);
 }
 if(changed){if(!save()){db=JSON.parse(prior);return}draw();toast(changed+' konfirmasi pembayaran diterima.')}
}

function resetAll(){if(window.INPOS_LOCAL_SERVER)return toast('Reset keseluruhan hanya tersedia pada mode demo. Database server tidak dihapus.','error');const before=db,blocked=storageCorrupt;db=initial();db.broadcasts=[];storageCorrupt=false;if(!save()){db=before;storageCorrupt=blocked;return}syncBroadcastFeed();closeSheet();goto('home');toast('Data lokal dikembalikan ke pengaturan awal.')}
function getTenant(id){return db.tenants.find(t=>t.id===id)}
// INPxxx adalah kode referral milik tenant (berbeda dari kode referral yang dipakai saat daftar).
function ownedReferralCode(t){return t?String(t.referralCode||('INP'+String(t.code).padStart(3,'0'))).toUpperCase():''}
function commissionEntries(t){
 const code=ownedReferralCode(t);
 return db.payments.filter(p=>p.status==='approved'&&num(p.referralCommission?.amount)>0&&(Number(p.referralCommission?.referrerId)===Number(String(t.id).replace(/^T/,''))||String(p.referralCommission?.referralCode||'').trim().toUpperCase()===code)&&p.tenantId!==t.id)
   .map(p=>({id:p.id,amount:num(p.referralCommission.amount),date:p.handledAt||p.created,source:getTenant(p.tenantId)?.name||'Usaha tidak tersedia'}));
}
function commissionPaid(t){return (db.commissionPayouts||[]).filter(x=>x.tenantId===t.id).reduce((a,x)=>a+num(x.amount),0)}
function commissionSummary(t){const earned=commissionEntries(t).reduce((a,x)=>a+x.amount,0),paid=commissionPaid(t);return {earned,paid,available:Math.max(0,earned-paid)}}
function minimumPayout(){return Number.isSafeInteger(Number(db.config.minimumPayout))?Math.max(0,num(db.config.minimumPayout)):0}
function payoutBank(t){const v=t?.payoutBank||{};return {name:String(v.name||'').trim(),number:String(v.number||'').trim(),holder:String(v.holder||'').trim()}}
function hasPayoutBank(t){const b=payoutBank(t);return b.name.length>=2&&/^[0-9]{6,24}$/.test(b.number)&&b.holder.length>=3}
function payoutReason(t){if(window.INPOS_LOCAL_SERVER)return 'Cairkan melalui Pengajuan Pencairan Referral';if(!t)return 'Mitra tidak ditemukan';const amount=commissionSummary(t).available,min=minimumPayout();if(amount<=0)return 'Belum ada komisi';if(min>0&&amount<min)return 'Minimal pencairan '+money(min);if(!hasPayoutBank(t))return 'Lengkapi rekening melalui Edit Usaha';return ''}
function payoutBankMarkup(t){const b=payoutBank(t);return hasPayoutBank(t)?`<div class="payout-bank-box"><b>${I('banknote',14)} ${esc(b.name)}</b><small>${esc(b.number)} · a.n. ${esc(b.holder)}</small></div>`:`<div class="payout-bank-box"><b>Rekening belum diatur</b><small>Isi bank, nomor rekening, dan nama pemilik melalui Edit Usaha.</small></div>`}

function commissionHistory(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 const sum=commissionSummary(t),earned=commissionEntries(t).map(x=>({kind:'earned',...x}));
 const paid=(db.commissionPayouts||[]).filter(x=>x.tenantId===id).map(x=>({kind:'paid',id:x.id,amount:x.amount,date:x.created,note:x.note||''}));
 const events=[...earned,...paid].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const summary=`<div class="commission-totals"><div class="mini-box"><small>Komisi masuk</small><b>${money(sum.earned)}</b></div><div class="mini-box"><small>Dicairkan</small><b>${money(sum.paid)}</b></div><div class="mini-box"><small>Sisa</small><b>${money(sum.available)}</b></div></div><p class="setting-help">Minimal pencairan: ${money(minimumPayout())}. ${payoutReason(t)?esc(payoutReason(t)): 'Siap dicatat untuk pencairan.'}</p>`;
 const body=`<div class="detail-banner"><h3>${esc(t.name)}</h3><p>Kode referral ${esc(ownedReferralCode(t))} • Catatan lokal</p></div>${summary}<h3 class="card-title" style="margin-top:15px">Histori Komisi</h3>${events.length?events.map(x=>`<div class="commission-row"><div><b>${x.kind==='paid'?'Pencairan dicatat':'Komisi langganan'}</b><small>${x.kind==='paid'?esc(x.note||'Dibayar di luar aplikasi'):esc(x.source)+' • #'+esc(x.id)}</small><small>${stamp(x.date)}</small></div><strong style="color:${x.kind==='paid'?'var(--red)':'var(--green)'}">${x.kind==='paid'?'− ':'+ '}${money(x.amount)}</strong></div>`).join(''):empty('Belum ada komisi','Komisi tercatat saat pembayaran mitra yang memakai kode ini disetujui.')}`;
 showSheet('Histori Komisi',`Mitra #${t.code}`,body,`<button class="btn" data-action="tenant-detail" data-id="${esc(id)}">Kembali</button><button class="btn primary" data-action="commission-ask" data-id="${esc(id)}" title="${esc(payoutReason(t)||'Cairkan komisi')}" ${payoutReason(t)?'disabled':''}>${I('banknote',16)} Cair</button>`);
}
function commissionAsk(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 const reason=payoutReason(t);if(reason)return toast(reason+'.','error');
 const sum=commissionSummary(t);
 showSheet('Cairkan Komisi',`Mitra #${t.code}`,`<div class="detail-banner"><div class="item-top"><h3>${esc(t.name)}</h3><b>${money(sum.available)}</b></div><p>Komisi dari kode ${esc(ownedReferralCode(t))}</p></div>${payoutBankMarkup(t)}<div class="info-line">Minimal pencairan ${money(minimumPayout())}. Catat hanya setelah transfer ke rekening di atas selesai.</div><div class="field" style="margin-top:12px"><input id="commissionPayoutNote" maxlength="140" placeholder="Referensi transfer / tanggal *" aria-label="Referensi transfer atau catatan pencairan *"></div><label class="checklabel"><input type="checkbox" id="commissionPayoutVerified"> Saya telah mentransfer komisi ke rekening di atas.</label><div class="info-line" style="margin-top:10px">Pencairan hanya dicatat. Transfer dana harus dilakukan terlebih dahulu.</div>`,`<button class="btn" data-action="commission-history" data-id="${esc(id)}">Batal</button><button class="btn primary" data-action="commission-confirm" data-id="${esc(id)}">${I('check',16)} Catat Cair</button>`);
}
function commissionConfirm(id){
 if(window.INPOS_LOCAL_SERVER)return toast('Gunakan verifikasi pengajuan penarikan referral dari server.','error');
 const t=getTenant(id),sum=t?commissionSummary(t):null;
 if(!t||!sum?.available)return toast('Tidak ada komisi yang tersedia.','error');
 const reason=payoutReason(t);if(reason)return toast(reason+'.','error');
 if(!$('commissionPayoutVerified')?.checked)return toast('Konfirmasi pembayaran komisi terlebih dahulu.','error');
 const note=String($('commissionPayoutNote')?.value||'').trim();
 if(!note)return toast('Isi catatan pencairan untuk audit.','error');
 const prev=Array.isArray(db.commissionPayouts)?db.commissionPayouts.slice():[];
 if(!Array.isArray(db.commissionPayouts))db.commissionPayouts=[];
 let n=1;const ids=new Set(db.commissionPayouts.map(x=>x.id));while(ids.has('C'+String(n).padStart(4,'0')))n++;
 db.commissionPayouts.unshift({id:'C'+String(n).padStart(4,'0'),tenantId:id,amount:sum.available,created:nowISO(),note,bank:payoutBank(t)});
 if(!save()){db.commissionPayouts=prev;return}
 draw();commissionHistory(id);toast('Pencairan komisi dicatat.');
}
function tenantStatus(t){if(t.suspended)return 'suspended';if(!t.end)return 'none';let days=diffDays(t.end);return days<0?'expired':days<=db.config.reminder?'expiring':'active'}
function statusBadge(status){let m={active:['ok','Aktif'],expiring:['warn','Segera habis'],expired:['bad','Kedaluwarsa'],none:['neutral','Belum aktif'],suspended:['neutral','Ditangguhkan'],pending:['warn','Menunggu'],approved:['ok','Disetujui'],rejected:['bad','Ditolak']};let x=m[status]||m.none;return `<span class="badge ${x[0]}">${x[1]}</span>`}
function tenantCount(status){return db.tenants.filter(t=>tenantStatus(t)===status).length}
// QRIS checkout only reserves an invoice. It is NOT a payment request until confirmation.
function visibleToAdmin(p){return !!p&&p.status!=='draft'&&!(p.status==='pending'&&['server-sub','server-tax','tenant-request-demo'].includes(p.source)&&!p.confirmedAt)}
const pending=()=>db.payments.filter(p=>p.status==='pending'&&visibleToAdmin(p));
function unread(){return db.notifications.filter(n=>!n.read).length+pinRequestUnread()}
function labelType(t){return t==='tax'?'Fitur Pajak':'Langganan INPOS'}
function paymentPlanLabel(p){if(p?.planType==='annual_first')return 'Tahunan alternatif • tahun pertama';if(p?.planType==='annual_renewal')return 'Tahunan alternatif • perpanjangan';if(p?.planType==='tax_annual')return 'Pajak tahunan';if(/^term_([2-9]|[12][0-9]|3[0-6])$/.test(String(p?.planType||'')))return 'Paket '+p.months+' bulan';return p?.type==='tax'?'Pajak':'Standar'}
function toast(message,type){if(window.INPOS_LOCAL_SERVER&&window.INPOS_ADMIN_SYNC_PENDING&&type!=='error')message='Perubahan sedang disimpan ke server. Tunggu konfirmasi sinkronisasi.';let el=document.createElement('div');el.className='toast'+(type==='error'?' error':'');el.textContent=message;$('toastRoot').appendChild(el);setTimeout(()=>el.remove(),3200)}
function mobileBackIcon(){return '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg>'}
function hasOpenSheet(){return !!document.querySelector('#sheetRoot [role="dialog"],#sheetRoot .sheet')}
function renderMobileBack(){let b=$('mobileBackButton');if(!b)return;let mobile=window.matchMedia&&window.matchMedia('(max-width: 768px)').matches;let active=hasOpenSheet()||navHistory.length>0;b.hidden=!mobile;b.disabled=!active;b.innerHTML=mobileBackIcon();let txt=hasOpenSheet()?'Tutup tampilan':'Kembali ke menu sebelumnya';b.setAttribute('aria-label',txt);b.setAttribute('title',active?txt:'Tidak ada menu sebelumnya')}
function goBackMobile(){if(hasOpenSheet()){closeSheet();renderMobileBack();return}if(!navHistory.length)return;view=navHistory.pop()||'home';inposRememberAdminPage(view);closeSheet();draw();$('page').scrollTop=0;}
function setTop(){let subtitle={home:'Ringkasan langganan',tenants:'Data usaha & masa aktif',payments:'Konfirmasi pembayaran',settings:'Tarif dan konfigurasi'};$('topSubtitle').textContent=subtitle[view];let u=unread();$('broadcastButton').innerHTML=I('megaphone',20);$('bellButton').innerHTML=I('bell',20)+(u?`<span class="count-dot">${u>9?'9+':u}</span>`:'');renderMobileBack()}
function drawNav(){let items=[['home','Beranda','home'],['tenants','Mitra','store'],['payments','Langganan','receipt'],['settings','Pengaturan','settings']];$('bottomNav').innerHTML=items.map(([id,tx,ic])=>`<button class="nav-btn ${view===id?'active':''}" data-action="goto" data-id="${id}" ${view===id?'aria-current="page"':''}>${I(ic)}<span>${tx}</span></button>`).join('')}
function goto(v,options){let target=['home','tenants','payments','settings'].includes(v)?v:'home',opts=options||{};if(opts.push!==false&&target!==view){navHistory.push(view);if(navHistory.length>25)navHistory=navHistory.slice(-25)}view=target;inposRememberAdminPage(view);closeSheet();draw();$('page').scrollTop=0;}
// Sinkron revisi referral dari server tanpa memaksa admin keluar dari halaman.
window.INPOS_ADMIN_CAN_RECEIVE_STATE=()=>!document.querySelector('#sheetRoot [role="dialog"],#sheetRoot .sheet')&&
 !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName||'')&&
 !document.querySelector('[data-refwithdraw-form]');
window.INPOS_ADMIN_APPLY_REMOTE_STATE=(state)=>{if(!valid(state))return false;db=state;storageCorrupt=false;draw();return true;};
function draw(){setTop();drawNav();$('page').innerHTML=(storageCorrupt?`<div class="notice" role="alert">${I('alert',18)}<div><b>Data lama tidak valid.</b> Penyimpanan diblokir agar data yang tersimpan tidak tertimpa. Silakan gunakan Impor JSON yang valid atau Reset Data melalui Pengaturan.</div></div>`:'')+({home:renderHome,tenants:renderTenants,payments:renderPayments,settings:renderSettings})[view]();if(view==='settings'){refreshUnifiedDiscountPreview();updateTaxAnnualPreview();}}
function title(text,sub,button){return `<div class="view-head"><div><h2>${text}</h2><p>${sub}</p></div>${button||''}</div>`}
function notice(){return `<div class="notice">${I('info',17)}<div>${window.INPOS_LOCAL_SERVER?'<b>Data terhubung ke server lokal.</b> Perubahan dikirim ke database dan dapat memerlukan beberapa saat untuk sinkronisasi.':'<b>Data tersimpan pada browser ini.</b> Perubahan belum tersinkronisasi ke perangkat lain.'}</div></div>`}
function pCard(p,compact=false){let t=getTenant(p.tenantId),status=statusBadge(p.status);return `<article class="item"><div class="item-icon">${I(p.type==='tax'?'file':'wallet',20)}</div><div class="item-body"><div class="item-top"><div class="item-title">${esc(t?.name||'Mitra tidak ditemukan')}</div>${status}</div><div class="item-sub">${labelType(p.type)} · ${paymentPlanLabel(p)} · ${num(p.months)} bulan · ${esc(p.method)}</div><div class="meta"><span>${I('clock',12)} ${stamp(p.created)}</span><span>#${esc(p.id)}</span>${num(p.uniqueCode)?`<span class="code-inline">Kode unik ${paymentCode(p)}</span>`:''}${p.status==='pending'&&['server-sub','server-tax','tenant-request-demo'].includes(p.source)?`<span class="badge ${p.confirmedAt?'ok':'warn'}">${p.confirmedAt?'Konfirmasi diterima':'Menunggu konfirmasi'}</span>`:''}</div><div class="item-top" style="margin-top:8px;align-items:center"><strong class="money" style="font-size:14px">${money(paymentTotal(p))}</strong>${p.status==='pending'?`<button class="btn smol primary" data-action="payment-detail" data-id="${esc(p.id)}">Periksa ${I('chevron',13)}</button>`:!compact?`<button class="btn smol" data-action="payment-detail" data-id="${esc(p.id)}">Detail ${I('chevron',13)}</button>`:''}</div></div></article>`}
// v18: hasil verifikasi simulasi tidak sama dengan DNS / provisioning hosting.
// Backend produksi harus memverifikasi kepemilikan subdomain, DNS, TLS dan routing tenant di server.
function subdomainIsVerified(t){
 return !!(t&&t.subdomainValidation?.ok===true&&t.subdomainValidation.slug===t.subdomain&&
   (window.INPOS_LOCAL_SERVER?t.subdomainValidation.mode==='server':['demo','server'].includes(t.subdomainValidation.mode)));
}
function subdomainValidationAsk(id){
 const t=getTenant(id);if(!t)return toast('Mitra tidak ditemukan.','error');
 if(subdomainIsVerified(t))return toast('URL Toko sudah online dan pernah diverifikasi.');
 const full='toko.inpos.id/'+String(t.subdomain||'').trim();
 showSheet('Validasi Nama URL Toko',`Mitra #${t.code}`,`<div class="detail-banner"><h3>${esc(t.name)}</h3><p>${esc(full)}</p></div><div class="notice">${I('info',16)}<div>Super Admin akan memeriksa akses HTTPS toko.inpos.id dan memastikan URL terhubung ke toko mitra yang tepat. Hasil berhasil disimpan di server, tanpa perlu validasi ulang selama URL tidak berubah.</div></div><p class="subdomain-validation-note">Setelah validasi, tombol akan otomatis hilang. Jika nama URL toko diganti, validasi harus diulang.</p>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="subdomain-validate-confirm" data-id="${esc(id)}">${I('check',16)} Validasi Nama URL</button>`);
}
async function subdomainValidationConfirm(id){
 const t=getTenant(id);if(!t)return toast('Mitra tidak ditemukan.','error');
 const slug=String(t.subdomain||'').trim().toLowerCase();
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>40)return toast('Nama URL toko tidak valid.','error');
 if(db.tenants.some(other=>other.id!==t.id&&String(other.subdomain).toLowerCase()===slug))return toast('URL dipakai mitra lain.','error');
 if(subdomainIsVerified(t))return toast('URL Toko sudah online.');
 if(window.INPOS_LOCAL_SERVER){
   if(!window.INPOS_ADMIN_SYNC_READY?.())return toast('Tunggu sinkronisasi data sebelum validasi.','error');
   try{
     const r=await fetch('/api/admin/store-url/verify',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({code:t.code,slug})});
     const x=await r.json();if(!r.ok||x.ok!==true)throw Error(x.error||'URL toko tidak dapat diverifikasi.');
     const fresh=await fetch('/api/admin/state',{credentials:'same-origin',cache:'no-store'});const data=await fresh.json();
     if(!fresh.ok||!data.ok||!window.INPOS_ADMIN_ACCEPT_REMOTE?.(data.state,data.revision))throw Error('Status telah tersimpan tetapi panel perlu dimuat ulang.');
     if(!window.INPOS_ADMIN_APPLY_REMOTE_STATE?.(data.state))throw Error('Panel perlu dimuat ulang untuk membaca validasi.');
     closeSheet();draw();toast('URL Toko Online ✓. Validasi tersimpan permanen di server selama URL tidak berubah.');
   }catch(err){toast('Validasi gagal: '+String(err.message||err),'error');}
   return;
 }
 // Mode demo bukan bukti bahwa website publik telah online.
 toast('Validasi Online memerlukan koneksi backend Super Admin.','error');
}


function tenantPlanLabel(t){if(t?.lifetime===true||t?.subscriptionType==='lifetime'||t?.end==='9999-12-31')return 'Lifetime';let v=t?.subscriptionType;if(v!=='annual'&&v!=='monthly'){
 const paid=db.payments.filter(p=>p.tenantId===t?.id&&p.type==='sub'&&p.status==='approved').sort((a,b)=>String(b.handledAt||b.created||'').localeCompare(String(a.handledAt||a.created||'')))[0];
 v=paid&&(['annual_first','annual_renewal'].includes(paid.planType)||Number(paid.months)>=12&&Number(paid.months)%12===0)?'annual':'monthly';
 }return v==='annual'?'Tahunan':'Bulanan'}
function tenantPlanDescription(t){let plan=String(t?.subscriptionPlan||''),m=Number(t?.subscriptionMonths)||0;if(!plan){const p=db.payments.filter(p=>p.tenantId===t?.id&&p.type==='sub'&&p.status==='approved').sort((a,b)=>String(b.handledAt||b.created||'').localeCompare(String(a.handledAt||a.created||'')))[0];plan=String(p?.planType||'');m=Number(p?.months)||0;}return plan==='manual_extend'&&m>0?' · Manual '+m+' bulan':/^term_\d+$/.test(plan)&&m>0?' · Paket '+m+' bulan':['annual_first','annual_renewal'].includes(plan)?' · Paket tahunan':''}
function showTenantPlan(id){const t=getTenant(id);if(!t)return;const kind=tenantPlanLabel(t),annual=kind==='Tahunan',life=kind==='Lifetime';showSheet('Jenis Langganan',esc(t.name),`<div class="field"><span class="sa-inline-caption">Jenis langganan</span><select id="tenantPlanSelect" aria-label="Jenis langganan"><option value="monthly" ${kind==='Bulanan'?'selected':''}>Bulanan</option><option value="annual" ${annual?'selected':''}>Tahunan</option><option value="lifetime" ${life?'selected':''}>Lifetime</option></select></div><div class="info-line">Lifetime berlaku tanpa tanggal kedaluwarsa. Saat berpindah kembali ke Bulanan/Tahunan, tanggal sebelum Lifetime dipulihkan. Perubahan ini tidak membuat tagihan atau komisi.</div><label class="field"><span class="sa-inline-caption">Alasan perubahan *</span><input id="tenantPlanNote" maxlength="140" placeholder="Contoh: koreksi jenis langganan"></label>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="tenant-plan-save" data-id="${esc(t.id)}">Simpan</button>`)}
function manualRenewalOpen(id){const t=getTenant(id);if(!t)return;if(t.lifetime||tenantPlanLabel(t)==='Lifetime')return toast('Paket Lifetime tidak perlu diperpanjang. Ubah jenis langganan jika ingin kembali ke paket berjangka.','error');const annual=tenantPlanLabel(t)==='Tahunan';showSheet('Perpanjang Manual',esc(t.name),`<div class="notice">Perpanjangan manual tidak membuat tagihan, pembayaran, atau komisi referral. Pastikan otorisasi sebelum melanjutkan.</div><div class="field"><span class="sa-inline-caption">Jenis langganan</span><select id="renewPlanType"><option value="monthly" ${annual?'':'selected'}>Bulanan</option><option value="annual" ${annual?'selected':''}>Tahunan</option></select></div><label class="field"><span class="sa-inline-caption">Durasi (bulan)</span><input type="number" id="renewMonths" min="1" max="36" step="1" value="${annual?12:1}" required></label><div class="info-line">Berakhir saat ini: ${esc(t.end?date(t.end):'Belum aktif')}. Perpanjangan dihitung dari masa aktif tersisa atau hari ini.</div><label class="field"><span class="sa-inline-caption">Alasan perpanjangan *</span><input id="renewNote" maxlength="140" placeholder="Contoh: pembayaran manual sudah diverifikasi" required></label><label class="checklabel"><input id="renewConfirmed" type="checkbox"> Saya sudah memverifikasi alasan perpanjangan.</label>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="tenant-renew-confirm" data-id="${esc(t.id)}">${I('calendar',16)} Perpanjang</button>`)}
async function submitTenantSubscription(id,action){const t=getTenant(id);if(!t)return;const isPlan=action==='set_plan',type=String($(isPlan?'tenantPlanSelect':'renewPlanType')?.value||''),months=isPlan?0:Number($('renewMonths')?.value),note=String($(isPlan?'tenantPlanNote':'renewNote')?.value||'').trim();if(!(isPlan?['monthly','annual','lifetime']:['monthly','annual']).includes(type))return toast('Jenis langganan tidak valid.','error');if(!isPlan&&(!Number.isSafeInteger(months)||months<1||months>36||type==='annual'&&months%12!==0))return toast('Tahunan harus 12, 24, atau 36 bulan; Bulanan 1–36 bulan.','error');if(note.length<3)return toast('Isi alasan minimal 3 karakter.','error');if(!isPlan&&!$('renewConfirmed')?.checked)return toast('Centang verifikasi perpanjangan dahulu.','error');if(!isPlan&&t.lifetime)return toast('Langganan Lifetime tidak dapat diperpanjang.','error');
 if(window.INPOS_LOCAL_SERVER){const b=document.querySelector('[data-action="tenant-'+(isPlan?'plan-save':'renew-confirm')+'"]');if(b)b.disabled=true;try{
  const bytes=new Uint8Array(16);if(!b?.dataset.requestId)crypto.getRandomValues(bytes);const request_id=b?.dataset.requestId||[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');if(b)b.dataset.requestId=request_id;
  const r=await fetch('/api/admin/tenants/'+encodeURIComponent(t.code)+'/subscription',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({request_id,action,service:'sub',months,plan_type:type,note})});const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error||'Server menolak perubahan.');const latest=await fetch('/api/admin/state',{credentials:'same-origin',cache:'no-store'}),state=await latest.json();if(!latest.ok||!state.ok||!window.INPOS_ADMIN_ACCEPT_REMOTE?.(state.state,state.revision)||!window.INPOS_ADMIN_APPLY_REMOTE_STATE?.(state.state))throw Error('Perubahan tersimpan, namun panel perlu dimuat ulang.');closeSheet();draw();toast(isPlan?'Jenis langganan diperbarui.':'Masa aktif diperpanjang.');
 }catch(e){toast(e.message||'Gagal memperbarui langganan. Periksa status server sebelum mencoba lagi.','error');if(b)b.disabled=false}return}
 const prev=JSON.stringify(db);if(isPlan){if(type==='lifetime'&&!t.lifetime){t.previousSubscriptionEnd=t.end||'';t.end='9999-12-31';t.lifetime=true;}else if(type!=='lifetime'&&t.lifetime){t.end=t.previousSubscriptionEnd||'';t.lifetime=false;}t.subscriptionType=type;}else{t.subscriptionType=type;const today=wibDate();t.end=plusMonths(t.end&&t.end>=today?t.end:today,months)}db.manualSubscriptionHistory=[{requestId:'LOCAL-'+nowISO(),code:t.code,tenantName:t.name,action,months,planType:type,note,at:nowISO(),end:t.end,actor:'Super Admin (demo)'},...(db.manualSubscriptionHistory||[])].slice(0,500);if(save()){closeSheet();draw();toast(isPlan?'Jenis langganan diperbarui.':'Perpanjangan manual tersimpan (demo).')}else db=JSON.parse(prev)
}

function tCard(t){let status=tenantStatus(t),sum=commissionSummary(t);return `<article class="item tenant-card"><div class="item-icon">${I('store',19)}</div><div class="item-body"><div class="item-top"><div class="item-title">${esc(t.name)}</div>${statusBadge(status)}</div><div class="item-sub">#${esc(t.code)} · ${esc(t.owner)}</div><div class="meta"><span>${I('calendar',12)} ${tenantPlanLabel(t)==='Lifetime'?'Lifetime · tanpa masa berakhir':t.end?'Aktif sampai '+date(t.end):'Belum ada langganan'}</span><span class="tenant-plan-tag">${I('receipt',12)} ${t.end?tenantPlanLabel(t)+tenantPlanDescription(t):'Belum berlangganan'}</span><button class="tenant-plan-edit" type="button" data-action="tenant-plan-edit" data-id="${esc(t.id)}" aria-label="Ubah jenis langganan ${esc(t.name)}" title="Ubah jenis langganan">${I('edit',13)}</button></div><div class="tenant-commission-row"><div class="tenant-commission-amount"><small>Komisi tersedia</small><strong>${money(sum.available)}</strong></div><button class="btn smol tenant-quick-btn" data-action="tenant-renew" data-id="${esc(t.id)}" title="Perpanjang manual" aria-label="Perpanjang manual ${esc(t.name)}">${I('calendar',17)}</button><button class="btn smol tenant-manage" data-action="tenant-detail" data-id="${esc(t.id)}">Kelola ${I('chevron',13)}</button></div></div></article>`}
function renderHome(){let act=tenantCount('active')+tenantCount('expiring'),exp=tenantCount('expiring'),pr=pending().length,monthlyRevenue=db.payments.filter(p=>p.status==='approved'&&p.handledAt&&new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit'}).format(new Date(p.handledAt))===wibDate().slice(0,7)).reduce((s,p)=>s+paymentTotal(p),0);let flagged=db.tenants.filter(t=>['expiring','expired'].includes(tenantStatus(t))).sort((a,b)=>diffDays(a.end)-diffDays(b.end)).slice(0,4);return `${title('Ringkasan','Status usaha & pembayaran')}${notice()}<div class="stats">
<button class="stat" data-action="filter-tenant" data-filter="active"><div class="stat-line"><span class="stat-label">Mitra aktif</span><span class="stat-ico">${I('store',18)}</span></div><strong>${act}</strong><span class="stat-foot">Dari ${db.tenants.length} usaha</span></button>
<button class="stat" data-kind="warn" data-action="filter-tenant" data-filter="expiring"><div class="stat-line"><span class="stat-label">Segera habis</span><span class="stat-ico">${I('clock',18)}</span></div><strong>${exp}</strong><span class="stat-foot">Dalam ${num(db.config.reminder)} hari</span></button>
<button class="stat" data-kind="blue" data-action="pending"><div class="stat-line"><span class="stat-label">Perlu konfirmasi</span><span class="stat-ico">${I('receipt',18)}</span></div><strong>${pr}</strong><span class="stat-foot">Pembayaran menunggu</span></button>
<button class="stat" data-kind="ok" data-action="pay-history"><div class="stat-line"><span class="stat-label">Diterima bulan ini</span><span class="stat-ico">${I('wallet',18)}</span></div><strong style="font-size:${monthlyRevenue>99999999?15:19}px">${money(monthlyRevenue)}</strong><span class="stat-foot">Pembayaran disetujui</span></button></div>
<div class="dashboard-grids"><div class="section"><div class="section-head"><h3>Pembayaran masuk</h3><button class="linkbtn" data-action="pending">Lihat semua ${I('chevron',12)}</button></div><div class="list">${pending().slice(0,4).map(p=>pCard(p,true)).join('')||empty('Tidak ada tagihan menunggu','Semua permintaan sudah ditangani.')}</div></div>
<div class="section"><div class="section-head"><h3>Perlu perhatian</h3><button class="linkbtn" data-action="filter-tenant" data-filter="all">Semua mitra ${I('chevron',12)}</button></div><div class="list">${flagged.map(t=>tCard(t)).join('')||empty('Tidak ada masa aktif kritis','Belum ada mitra yang mendekati batas.')}</div></div></div>
`}
function empty(a,b){return `<div class="empty"><div class="empty-icon">${I('check',24)}</div><strong>${a}</strong>${b}</div>`}
function renderTenants(){let arr=db.tenants.filter(t=>{let s=tenantStatus(t);let sf=tenantFilter==='active'?['active','expiring'].includes(s):tenantFilter==='all'||s===tenantFilter;return sf&&[t.name,t.owner,t.code,t.wa,t.email,t.referral,t.subdomain].join(' ').toLowerCase().includes(tenantSearch.toLowerCase())}).sort((a,b)=>Number(a.code)-Number(b.code));return `${title('Data Usaha',`${db.tenants.length} usaha terdaftar`,`<button class="btn primary smol" data-action="add-tenant">${I('plus',16)} Mitra</button>`)}<div class="toolbar"><div class="search">${I('search',17)}<input id="tenantSearch" placeholder="Cari toko, kode, WhatsApp..." value="${esc(tenantSearch)}" autocomplete="off" aria-label="Cari mitra"></div><select class="filter" id="tenantFilter" aria-label="Filter status mitra"><option value="all" ${tenantFilter==='all'?'selected':''}>Semua</option><option value="active" ${tenantFilter==='active'?'selected':''}>Aktif</option><option value="expiring" ${tenantFilter==='expiring'?'selected':''}>Segera habis</option><option value="expired" ${tenantFilter==='expired'?'selected':''}>Kedaluwarsa</option><option value="suspended" ${tenantFilter==='suspended'?'selected':''}>Ditangguhkan</option><option value="none" ${tenantFilter==='none'?'selected':''}>Belum aktif</option></select></div><div class="reg-hint">${I('info',15)} Data registrasi INPOS. PIN tidak ditampilkan.</div><div class="btnwrap" style="margin-bottom:12px">${window.INPOS_LOCAL_SERVER?'':`<button class="btn smol" data-action="import-registration">${I('upload',15)} Ambil Registrasi INPOS</button>`}<button class="btn smol" data-action="export-tenants">${I('download',15)} Ekspor CSV</button></div><div class="list wide-grid" id="tenantList">${arr.slice(0,tenantVisibleLimit).map(tCard).join('')||empty('Tidak ditemukan','Coba gunakan filter atau kata kunci lain.')}</div>${arr.length>tenantVisibleLimit?`<button type="button" class="btn full" data-action="tenant-more">Tampilkan 50 lagi (${arr.length-tenantVisibleLimit} tersisa)</button>`:''}`}
// v10: periode tagihan memakai waktu dibuat dalam zona Asia/Jakarta, bukan waktu browser.
function paymentDateWIB(p){try{const d=new Date(p.created);return Number.isNaN(d.getTime())?'':wibDate(d)}catch(_){return ''}}
function paymentMatchesPeriod(p){let d=paymentDateWIB(p);return payPeriod==='all'||(!!d&&(payPeriod==='day'?d===payPeriodDate:payPeriod==='month'?d.slice(0,7)===payPeriodMonth:d.slice(0,4)===payPeriodYear))}
function visiblePayments(){if(payTab==='none')return [];return db.payments.filter(p=>visibleToAdmin(p)&&(payTab==='all'||p.status===payTab)&&(payCategory==='all'||p.type===payCategory)&&paymentMatchesPeriod(p)&&[getTenant(p.tenantId)?.name,p.id,p.note,paymentCode(p),String(paymentTotal(p)),digits(paymentTotal(p))].join(' ').toLowerCase().includes(paySearch.toLowerCase())).sort((a,b)=>b.created.localeCompare(a.created))}
function periodLabel(){if(payPeriod==='day')return 'Harian · '+date(payPeriodDate);if(payPeriod==='month')return 'Bulanan · '+new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(payPeriodMonth+'-01T12:00:00Z'));if(payPeriod==='year')return 'Tahunan · '+payPeriodYear;return 'Semua waktu'}
function periodInput(){if(payPeriod==='day')return `<input class="period-picker" id="paymentPeriodValue" type="date" aria-label="Tanggal transaksi" value="${esc(payPeriodDate)}">`;if(payPeriod==='month')return `<input class="period-picker" id="paymentPeriodValue" type="month" aria-label="Bulan transaksi" value="${esc(payPeriodMonth)}">`;if(payPeriod==='year'){let current=Number(wibDate().slice(0,4)),years=new Set([current,Number(payPeriodYear),...db.payments.map(p=>Number(paymentDateWIB(p).slice(0,4))).filter(y=>y>=2000&&y<=2100)]);return `<select class="period-picker" id="paymentPeriodValue" aria-label="Tahun transaksi">${[...years].sort((a,b)=>b-a).map(y=>`<option value="${y}" ${String(y)===payPeriodYear?'selected':''}>${y}</option>`).join('')}</select>`}return ''}
function parsePercent(v){const raw=String(v??'').trim().replace(',','.');return /^\d+(?:\.\d{1,2})?$/.test(raw)?Number(raw):NaN}
function referralConfig(){let c=db.config.referralCommission||{};return {enabled:c.enabled===true,mode:c.mode==='fixed'?'fixed':'percent',value:Number.isFinite(+c.value)?Math.max(0,Number(c.value)):10}}
function calculateReferralCommission(p,t){const c=referralConfig();if(p.type!=='sub'||!t?.referral||!num(p.amount))return null;const byPlan=db.config.packageCommissionEnabled!==false&&p.planType&&p.planType!=='standard'&&num(p.planCommission)>0;if(!byPlan&&(!c.enabled||!(c.value>0)))return null;const owner=db.tenants.find(m=>m.id!==t.id&&(ownedReferralCode(m)===String(t.referral).trim().toUpperCase()||('INP'+String(m.code).padStart(3,'0'))===String(t.referral).trim().toUpperCase()));if(!owner)return null;let amount=(db.config.packageCommissionEnabled!==false&&p.planType&&p.planType!=='standard'&&p.planType!=='tax_annual'&&p.planType!=='tax_monthly')?Math.min(num(p.amount),num(p.planCommission)):c.mode==='percent'?Math.round(num(p.amount)*c.value/100):Math.min(num(p.amount),Math.floor(c.value));if(amount<=0)return null;return {referralCode:ownedReferralCode(owner),mode:c.mode,value:c.value,amount};}
function filteredPaymentNominal(arr){return arr.reduce((sum,p)=>sum+(p.status==='rejected'?0:paymentTotal(p)),0)}

/* ALUR TAGIHAN OTOMATIS (DEMO):
 Mitra menulis array permintaan ke localStorage[TENANT_REQUESTS_KEY], contoh:
 [{"requestId":"REQ-unik-123", "tenantId":"T001", "type":"sub", "months":3, "method":"QRIS"}]
 Ketika panel Super Admin dibuka / tab fokus / storage berubah, permintaan diproses.
 Balasan: localStorage[TENANT_RESPONSES_KEY] = {"REQ-unik-123":{status:"created",paymentId:"P005",total:...,uniqueCode:...}}.
 Produksi WAJIB menggunakan server autentikasi, penentuan tenant dari sesi, transaksi atomik,
 pembatasan request dan webhook/gateway terverifikasi, bukan localStorage atau perhitungan klien.
*/
function processTenantRequests(){
 if(window.INPOS_LOCAL_SERVER)return;
 let requests,results;
 try{
  const raw=JSON.parse(localStorage.getItem(TENANT_REQUESTS_KEY)||'[]');
  requests=Array.isArray(raw)?raw:(Array.isArray(raw?.requests)?raw.requests:[]);
  if(!requests.length)return;
  const prev=JSON.parse(localStorage.getItem(TENANT_RESPONSES_KEY)||'{}');
  results=prev&&typeof prev==='object'&&!Array.isArray(prev)?prev:{};
 }catch(e){console.warn('Permintaan mitra demo tidak valid',e);return}
 // Pulihkan hasil jika data tagihan tersimpan tetapi balasan belum ditulis (mis. browser ditutup).
 const snapshot=JSON.stringify(db);let created=0,changed=false;
 const addResponse=(requestId,p,status)=>{results[requestId]={status,paymentId:p.id,amount:num(p.amount),uniqueCode:num(p.uniqueCode),total:paymentTotal(p),type:p.type,months:p.months,updatedAt:nowISO()};changed=true};
 for(const req of requests.slice(-500)){
  if(!req||typeof req!=='object')continue;
  const rid=String(req.requestId||'').trim();
  if(!/^[a-zA-Z0-9_-]{8,90}$/.test(rid)||Object.hasOwn(results,rid))continue;
  const former=db.payments.find(p=>p.requestId===rid);
  if(former){addResponse(rid,former,'existing');continue}
  const tenantId=String(req.tenantId||'').trim();
  const tenant=db.tenants.find(t=>t.id===tenantId);
  const type=String(req.type||''),months=Number(req.months);
  let reason='';
  if(!tenant)reason='Mitra tidak ditemukan';
  else if(tenant.suspended)reason='Usaha ditangguhkan';
  else if(!['sub','tax'].includes(type))reason='Jenis tagihan tidak valid';
  else if(!Number.isInteger(months)||months<1||months>36)reason='Durasi harus 1–36 bulan';
  else if(!Number.isSafeInteger(num(type==='tax'?db.config.tax:db.config.monthly))||num(type==='tax'?db.config.tax:db.config.monthly)<=0)reason='Tarif belum tersedia';
  if(reason){results[rid]={status:'error',message:reason,updatedAt:nowISO()};changed=true;continue}
  // Satu tagihan tertunda per tenant + fitur. Pengajuan ulang mengembalikan tagihan yang sama.
  const pendingInvoice=db.payments.find(p=>p.tenantId===tenant.id&&p.type===type&&p.status==='pending');
  if(pendingInvoice){addResponse(rid,pendingInvoice,'existing');continue}
  const choice=type==='sub'&&req.plan==='annual'?'annual':'monthly';if(choice==='annual'&&(!annualConfig().enabled||months!==12)){results[rid]={status:'error',message:'Paket tahunan tidak tersedia',updatedAt:nowISO()};changed=true;continue}const quote=quoteSubscription(type,months,tenant,choice),uniqueCode=nextUniqueCode(quote.amount);
  if(uniqueCode==null){results[rid]={status:'error',message:'Kode unik sedang penuh',updatedAt:nowISO()};changed=true;continue}
  const method=['QRIS','Transfer'].includes(req.method)?req.method:'QRIS';
  db.nextPayment=num(db.nextPayment)+1;
  const id='P'+String(db.nextPayment).padStart(3,'0');
  const p={id,requestId:rid,source:'tenant-request-demo',tenantId:tenant.id,type,months,amount:quote.amount,gross:quote.gross,discount:quote.discount,planType:quote.planType,planCommission:quote.planCommission,uniqueCode,method,status:'pending',created:nowISO(),handledAt:'',note:'Permintaan otomatis dari mitra'};
  db.payments.unshift(p);
  addNote('Permintaan pembayaran otomatis',tenant.name+' • '+labelType(type)+' '+months+' bulan • '+money(paymentTotal(p)),id);
  addResponse(rid,p,'created');created++;
 }
 if(!changed)return;
 // Persist the invoice before returning a response to the tenant.
 if(created&&!save()){db=JSON.parse(snapshot);return}
 try{localStorage.setItem(TENANT_RESPONSES_KEY,JSON.stringify(results))}
 catch(e){console.warn('Balasan permintaan mitra tidak dapat disimpan',e)}
 if(created){draw();toast(created+' tagihan otomatis diterima dari mitra.')} 
}

function unbilledTenants(){
 const billed=new Set(db.payments.filter(p=>visibleToAdmin(p)&&(payCategory==='all'||p.type===payCategory)).map(p=>p.tenantId));
 const query=paySearch.toLowerCase();
 return db.tenants.filter(t=>!billed.has(t.id)&&[t.name,t.owner,t.code,t.wa].join(' ').toLowerCase().includes(query)).sort((a,b)=>Number(a.code)-Number(b.code));
}
function renderUnbilledTenants(arr){
 return arr.slice(0,unbilledVisibleLimit).map(t=>`<article class="item"><div class="item-body"><div class="item-top"><b class="item-title">${esc(t.name)}</b>${statusBadge('none')}</div><div class="item-sub">Mitra #${esc(t.code)} · ${esc(t.owner)}</div><div class="item-top" style="margin-top:8px"><small>Belum ada tagihan ${payCategory==='all'?'':payCategory==='tax'?'Pajak':'INPOS'}.</small><button class="btn smol" type="button" data-action="tenant-detail" data-id="${esc(t.id)}">Lihat Mitra</button></div></div></article>`).join('')||empty('Belum ada data','Tidak ditemukan mitra tanpa tagihan untuk filter ini.');
}
function renderPayments(){
 const top=`${title('Pembayaran','Tagihan dan komisi mitra')}<nav class="sa-payment-main-tabs" aria-label="Tab Langganan"><button type="button" class="sa-payment-main-tab ${paymentSection==='subscriptions'?'active':''}" data-action="payment-section" data-id="subscriptions" aria-current="${paymentSection==='subscriptions'?'page':'false'}" aria-pressed="${paymentSection==='subscriptions'}">${I('receipt',16)}<span>Langganan</span></button><button type="button" class="sa-payment-main-tab ${paymentSection==='referral'?'active':''}" data-action="payment-section" data-id="referral" aria-current="${paymentSection==='referral'?'page':'false'}" aria-pressed="${paymentSection==='referral'}">${I('wallet',16)}<span>Pencairan Referral</span></button></nav>`;
 if(paymentSection==='referral')return top+(window.INPOS_LOCAL_SERVER?`<section class="sa-referral-payment-section" id="inpos-referral-withdrawals-slot" aria-label="Daftar pengajuan pencairan referral"><div class="settings-cards"></div></section>`:`<div class="sa-referral-offline">Pengajuan pencairan tersedia saat terhubung ke server INPOS.</div>`);
 const arr=visiblePayments(),vacant=payTab==='none'?unbilledTenants():[];
 const statusTabs=[['pending','Menunggu'],['approved','Disetujui'],['rejected','Ditolak'],['none','Belum Ada'],['all','Semua']];
 const periodTabs=[['all','Semua'],['day','Harian'],['month','Bulanan'],['year','Tahunan']];
 const statusFilter=`<div class="payment-filter-group"><span class="payment-filter-label">Status</span><div class="segments payment-status-tabs" aria-label="Status pembayaran">${statusTabs.map(([k,v])=>`<button class="seg ${payTab===k?'active':''}" data-action="paytab" data-id="${k}" aria-pressed="${payTab===k}">${v}</button>`).join('')}</div></div>`;
 const searchFilter=`<div class="payment-query sa-payment-query"><div class="search">${I('search',17)}<input id="paymentSearch" type="search" placeholder="Cari mitra atau tagihan" value="${esc(paySearch)}" aria-label="Cari mitra atau tagihan" autocomplete="off"></div><select class="filter" id="payCategory" aria-label="Jenis pembayaran"><option value="all" ${payCategory==='all'?'selected':''}>Semua jenis</option><option value="sub" ${payCategory==='sub'?'selected':''}>INPOS</option><option value="tax" ${payCategory==='tax'?'selected':''}>Pajak</option></select></div>`;
 const periodFilter=payTab==='none'?'':`<div class="payment-filter-group"><span class="payment-filter-label">Periode</span><div class="payment-period" aria-label="Periode pembayaran"><div class="period-tabs">${periodTabs.map(([k,v])=>`<button class="period-tab ${payPeriod===k?'active':''}" data-action="pay-period" data-id="${k}" aria-pressed="${payPeriod===k}">${v}</button>`).join('')}</div>${periodInput()}</div></div>`;
 const list=payTab==='none'?renderUnbilledTenants(vacant):arr.slice(0,payVisibleLimit).map(p=>pCard(p)).join('')||empty('Tidak ada transaksi','Coba filter lain.');
 return `${top}<section class="payment-filter-card" aria-label="Filter pembayaran">${statusFilter}${searchFilter}${periodFilter}</section>
 <div class="payment-result-bar"><div class="payment-result-data" aria-live="polite"><span class="payment-count-badge" id="paymentCount">${payTab==='none'?vacant.length+' mitra belum ada tagihan':arr.length+' transaksi'}</span>${payTab==='none'?'':`<span class="payment-total-badge" id="paymentTotalBadge">Total ${money(filteredPaymentNominal(arr))}</span>`}</div>${payTab==='none'?'':`<button class="btn smol payment-export" data-action="export-payments" aria-label="Ekspor CSV sesuai filter">${I('download',14)} CSV</button>${window.INPOS_LOCAL_SERVER&&payTab==='pending'?`<button class="btn smol" type="button" data-action="payment-clear-preview" aria-label="Bersihkan pembayaran menunggu">Bersihkan Menunggu</button>`:''}`}</div>
 <div class="list" id="paymentList">${list}</div>
 ${(payTab==='none'?vacant.length>unbilledVisibleLimit:arr.length>payVisibleLimit)?`<button type="button" class="btn full" data-action="payment-more">Tampilkan 50 lagi (${payTab==='none'?vacant.length-unbilledVisibleLimit:arr.length-payVisibleLimit} tersisa)</button>`:''}`;
}
function renderSettings(){return `${title('Pengaturan','Tarif, komisi, pembayaran & sistem')}${notice()}<div class="settings-layout"><section class="settings-group" aria-labelledby="settings-langganan"><div class="settings-group-head"><h3 id="settings-langganan">Langganan</h3><p>Tarif dan masa aktif layanan.</p></div><div class="settings-cards"><section class="card settings-panel"><h3 class="card-title">Tarif INPOS</h3><p class="setting-help">Tarif dasar langganan INPOS.</p><form id="settingsForm"><div class="field"><span class="sa-inline-caption" aria-hidden="true">INPOS/bulan</span><input type="text" id="setMonthly" class="rupiah-input" data-rupiah value="${digits(db.config.monthly)}" required inputmode="numeric" autocomplete="off" maxlength="15" placeholder="35.000" aria-label="Langganan INPOS / bulan (Rp)"></div><button class="btn primary full" type="submit">${I('check',17)} Simpan Tarif</button></form></section>${pricingPanelsMarkup()}<section class="card settings-panel"><h3 class="card-title">Trial & Pengingat</h3><p class="setting-help">Atur masa percobaan mitra baru dan batas pengingat.</p><form id="cycleForm"><div class="field"><span class="sa-inline-caption" aria-hidden="true">Masa trial</span><input type="number" min="1" max="365" id="setTrialDays" value="${num(db.config.trialDays||60)}" required inputmode="numeric" placeholder="Jumlah hari masa percobaan" aria-label="Masa percobaan mitra baru (hari)"></div><div class="field"><span class="sa-inline-caption" aria-hidden="true">Pengingat</span><input type="number" min="1" max="90" id="setReminder" value="${num(db.config.reminder)}" required inputmode="numeric" placeholder="Jumlah hari pengingat" aria-label="Pengingat sebelum berakhir (hari)"></div><button class="btn primary full" type="submit">${I('check',17)} Simpan Masa Aktif</button></form></section></div></section><section class="settings-group" aria-labelledby="settings-pajak"><div class="settings-group-head"><h3 id="settings-pajak">Pajak</h3><p>Tarif tahunan dan diskon khusus Pajak, terpisah dari paket INPOS.</p></div><div class="settings-cards">${yearlyTaxPanelsMarkup()}</div></section><section class="settings-group" aria-labelledby="settings-referral"><div class="settings-group-head"><h3 id="settings-referral">Pencairan</h3><p>Atur batas saldo yang dapat dicairkan mitra.</p></div><div class="settings-cards"><section class="card settings-panel"><h3 class="card-title">Minimal Pencairan</h3><p class="setting-help">Batas saldo komisi sebelum mitra bisa mencairkan.</p><form id="payoutSettingsForm"><div class="field"><input id="setMinimumPayout" type="text" data-rupiah inputmode="numeric" autocomplete="off" maxlength="15" value="${digits(minimumPayout())}" required placeholder="Minimal pencairan komisi (Rp)" aria-label="Minimal pencairan komisi (Rp)"><small>Rp 0 = tanpa minimum. Berlaku untuk pencairan berikutnya.</small></div><button type="submit" class="btn primary full">${I('check',17)} Simpan Minimal Pencairan</button></form><div class="info-line" style="margin-top:11px">Pencairan memerlukan rekening lengkap dan konfirmasi transfer. Tidak mengirim uang otomatis.</div></section></div></section><section class="settings-group" aria-labelledby="settings-pembayaran"><div class="settings-group-head"><h3 id="settings-pembayaran">Pembayaran</h3><p>QRIS, WhatsApp konfirmasi & kode unik.</p></div><div class="settings-cards settings-single"><section class="card settings-panel"><div class="settings-payment-grid"><div><h3 class="card-title">QRIS Pembayaran</h3><p class="setting-help">Unggah QRIS penerima. Persetujuan pembayaran manual.</p><div class="field"><input id="merchantName" value="${esc(db.config.merchant)}" maxlength="70" placeholder="Nama penerima QRIS" aria-label="Nama penerima QRIS"></div><div class="field"><input type="tel" inputmode="tel" autocomplete="tel" maxlength="24" id="confirmationWhatsapp" value="${esc(displayConfirmWhatsapp(db.config.confirmationWhatsapp))}" aria-describedby="confirmationWhatsappHelp" placeholder="Nomor WhatsApp konfirmasi" aria-label="WhatsApp konfirmasi pembayaran"><small id="confirmationWhatsappHelp" class="setting-whatsapp-help">Nomor admin untuk konfirmasi pembayaran mitra.</small></div>${db.config.qris?`<img class="preview-qris" alt="QRIS yang tersimpan" src="${esc(db.config.qris)}">`:`<div class="preview-qris qris-placeholder">${I('image',28)}<span>Belum ada gambar QRIS</span></div>`}<div class="btnwrap"><label class="btn" for="qrisUpload" style="cursor:pointer">${I('upload',16)} Unggah QRIS</label><input type="file" accept="image/png,image/jpeg,image/webp" id="qrisUpload" class="hidden"><button class="btn ${db.config.qris?'':'hidden'}" data-action="remove-qris" type="button">Hapus</button><button class="btn primary" data-action="save-merchant" type="button">Simpan Pembayaran</button></div></div><div class="settings-unique-info"><h4 class="settings-subtitle">Kode Unik</h4><p class="setting-help">Otomatis 001–999, ditambahkan setelah diskon. Tagihan lama tidak berubah.</p><div class="mini-box"><small>Perhitungan</small><b>${money(db.config.monthly)} + Rp 125 = ${money(num(db.config.monthly)+125)}</b></div></div></div></section></div></section><section class="settings-group" aria-labelledby="settings-sistem"><div class="settings-group-head"><h3 id="settings-sistem">Data & Sistem</h3><p>Cadangan data dan status koneksi.</p></div><div class="settings-cards"><section class="card settings-panel"><h3 class="card-title">Cadangan Data</h3><p class="setting-help">Ekspor cadangan sebelum impor atau mengatur ulang data.</p><div class="btnwrap"><button class="btn" data-action="export-json">${I('download',16)} Ekspor JSON</button>${window.INPOS_LOCAL_SERVER?"":`<button class="btn" data-action="import-json">${I('upload',16)} Impor JSON</button>`}</div>${window.INPOS_LOCAL_SERVER?"<p class=\"setting-help\">Cadangan database utama dibuat melalui skrip Termux, bukan Ekspor JSON browser.</p>":`<div class="mini-hr"></div><button class="btn danger" data-action="reset-ask">${I('trash',16)} Reset Data</button>`}</section><section class="card settings-panel"><h3 class="card-title">Status Integrasi</h3><div class="valuebar"><div><b>Server multi-usaha</b><br><span>API INPOS / ${window.INPOS_DB_ENGINE==='mariadb'?'MariaDB':'SQLite lokal'}</span></div><span class="badge ${window.INPOS_LOCAL_SERVER?'ok':'warn'}">${window.INPOS_LOCAL_SERVER?'Terhubung lokal':'Belum terhubung'}</span></div><div class="valuebar"><div><b>Notifikasi Mitra</b><br><span>${window.INPOS_LOCAL_SERVER?'Tersedia melalui API INPOS lokal':'Perlu server untuk lintas perangkat'}</span></div><span class="badge ${window.INPOS_LOCAL_SERVER?'ok':'warn'}">${window.INPOS_LOCAL_SERVER?'Terhubung lokal':'Belum terhubung'}</span></div><div class="valuebar"><div><b>Verifikasi QRIS</b><br><span>Gateway/webhook pembayaran</span></div><span class="badge warn">Belum terhubung</span></div><div class="info-line">${window.INPOS_LOCAL_SERVER?'Perubahan tersimpan ke database lokal melalui API. Akses lintas perangkat memerlukan server yang dapat dijangkau pada jaringan.':'Penyimpanan pada browser ini tidak terhubung antardomain atau perangkat. Aktifkan API INPOS untuk sinkronisasi secara online.'}</div><button type="button" class="btn light full" data-action="sync-demo-now">${I('check',15)} ${window.INPOS_LOCAL_SERVER?'Muat Ulang Data Server':'Sinkronkan Data Lokal'}</button></section></div></section></div>`}
// v19 — Broadcast seluruh Mitra. Pengiriman sungguhan memerlukan API + auth server.
function broadcastList(){return Array.isArray(db.broadcasts)?db.broadcasts:[]}
function safeBroadcastImage(raw){return typeof raw==='string'&&raw.length<280000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw)?raw:''}
function syncBroadcastFeed(){
 // Jembatan demo: INPOS yang memakai origin browser sama bisa membaca feed ini.
 // Belum ada push, penyebaran lintas subdomain, atau pengiriman online.
 try{localStorage.setItem(BROADCAST_FEED_KEY,JSON.stringify(broadcastList().slice(0,12).map(b=>({id:b.id,title:b.title,body:b.body,image:safeBroadcastImage(b.image),createdAt:b.createdAt,target:'all',popup:true,status:'demo-published'}))));return true}
 catch(err){console.warn('Broadcast demo feed tidak dapat disimpan:',err);return false}
}
function captureBroadcastDraft(){
 if($('broadcastTitle'))broadcastDraft.title=$('broadcastTitle').value;
 if($('broadcastBody'))broadcastDraft.body=$('broadcastBody').value;
}
function broadcastRecent(){return broadcastList().slice(0,5).map(b=>`<button type="button" class="broadcast-history-item" data-action="broadcast-history" data-id="${esc(b.id)}"><span>${I('megaphone',16)}</span><span class="history-main"><strong>${esc(b.title)}</strong><small>${stamp(b.createdAt)} · ${num(b.audienceCount)} Mitra · ${window.INPOS_LOCAL_SERVER?'Server lokal':'Tersimpan lokal'}</small></span>${I('chevron',14)}</button>`).join('')}
function broadcastOpen(){
 const {title='',body='',image=''}=broadcastDraft;
 const cnt=db.tenants.length;
 const markup=`<div class="broadcast-audience"><div><b>${I('users',15)} Semua Mitra INPOS</b><small>Pengumuman untuk seluruh usaha terdaftar</small></div><span class="badge blue">${cnt} Mitra</span></div>
 <div class="field"><input id="broadcastTitle" type="text" maxlength="80" autocomplete="off" value="${esc(title)}" placeholder="Judul pengumuman *" aria-label="Judul pengumuman *"><span id="broadcastTitleCount" class="broadcast-label-count">${title.length}/80</span></div>
 <div class="field"><textarea id="broadcastBody" maxlength="600" rows="4" placeholder="Isi pengumuman *" aria-label="Isi pengumuman *">${esc(body)}</textarea><span id="broadcastBodyCount" class="broadcast-label-count">${body.length}/600</span></div>
 <div class="field" style="margin-bottom:6px"><label class="broadcast-image-upload ${image?'is-filled':''}" for="broadcastImageUpload" id="broadcastImageLabel">${image?`<img id="broadcastImagePreview" src="${esc(safeBroadcastImage(image))}" alt="Pratinjau gambar Broadcast">`:`<span class="broadcast-upload-placeholder">${I('image',27)}<b>Tambahkan gambar pengumuman</b><small>JPG, PNG, WebP · maks. 3 MB</small></span>`}</label><input type="file" class="hidden" id="broadcastImageUpload" accept="image/png,image/jpeg,image/webp"></div>
 <div class="broadcast-upload-actions"><small>Gambar otomatis diperkecil agar cepat dimuat.</small><button type="button" class="btn smol ${image?'':'hidden'}" id="broadcastRemoveImage" data-action="broadcast-remove-image">${I('trash',14)} Hapus Gambar</button></div>
 <div class="mini-box"><b>${I('bell',15)} Notifikasi + Popup</b><div class="broadcast-short-info">Pesan tampil di notifikasi aplikasi serta popup saat Mitra membuka INPOS. Setiap popup cukup ditampilkan sekali per Mitra dan perangkat oleh aplikasi penerima.</div></div>
 <div class="broadcast-history"><h3>Riwayat Broadcast (${broadcastList().length})</h3>${broadcastRecent()||'<p class="muted" style="font-size:11px">Belum ada broadcast.</p>'}</div>
 <p class="broadcast-short-info">${window.INPOS_LOCAL_SERVER?'Pengumuman tersedia bagi Mitra yang mengakses server INPOS ini.':'Pengumuman hanya tersimpan pada browser ini.'}</p>`;
 showSheet('Broadcast Mitra','Pengumuman ke semua Mitra INPOS',markup,`<button type="button" class="btn" data-action="broadcast-preview">${I('image',16)} Pratinjau</button><button type="button" class="btn primary" data-action="broadcast-ask">${I('send',15)} Terbitkan</button>`);
}
function handleBroadcastImage(file){
 if(!file)return;
 captureBroadcastDraft();
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>3*1024*1024){toast('Gambar harus JPG, PNG atau WebP, maksimal 3 MB.','error');return}
 const fr=new FileReader();
 fr.onerror=()=>toast('Gagal membaca gambar.','error');
 fr.onload=()=>{
  const img=new Image();img.onerror=()=>toast('File gambar tidak dapat dibuka.','error');
  img.onload=()=>{
   try{
    const scale=Math.min(1,960/img.naturalWidth,540/img.naturalHeight);
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    let out='';for(const q of [.76,.61,.46,.33]){out=canvas.toDataURL('image/jpeg',q);if(out.length<240000)break}
    if(!safeBroadcastImage(out))throw Error('too large');broadcastDraft.image=out;broadcastOpen();toast('Gambar broadcast ditambahkan.');
   }catch(err){toast('Gambar terlalu besar untuk disimpan.','error')}
  };img.src=fr.result;
 };
 fr.readAsDataURL(file);
}
function broadcastPreviewMarkup(b){
 let image=safeBroadcastImage(b.image);
 return `<div class="broadcast-preview-outer"><h3>Pratinjau Notifikasi INPOS</h3><div class="broadcast-inapp-note"><div class="item-icon" style="height:34px;width:34px">${I('bell',19)}</div><div style="min-width:0"><b>${esc(b.title||'Judul Broadcast')}</b><p>${esc(b.body||'Isi pesan akan tampil di sini.')}</p></div></div></div><div class="broadcast-preview-outer"><h3>Pratinjau Popup INPOS</h3><div class="broadcast-popup-card">${image?`<img src="${esc(image)}" alt="Gambar pengumuman">`:''}<div class="broadcast-popup-content"><h3>${esc(b.title||'Judul Broadcast')}</h3><p>${esc(b.body||'Isi pesan akan tampil di sini.')}</p><div class="btn primary full" style="margin-top:14px;pointer-events:none">OK</div></div></div></div>`;
}
function broadcastPreview(){captureBroadcastDraft();showSheet('Pratinjau Broadcast','Tampilan pengumuman untuk Mitra',broadcastPreviewMarkup(broadcastDraft),`<button type="button" class="btn primary full" data-action="broadcast-open">${I('back',16)} Kembali Edit</button>`)}
function broadcastAsk(){
 captureBroadcastDraft();const title=broadcastDraft.title.trim(),body=broadcastDraft.body.trim();
 if(title.length<3)return toast('Isi judul minimal 3 karakter.','error');
 if(body.length<5)return toast('Isi pesan minimal 5 karakter.','error');
 if(!db.tenants.length)return toast('Belum ada Mitra penerima.','error');
 showSheet('Konfirmasi Broadcast','Terbitkan untuk seluruh Mitra',`<div class="broadcast-audience"><b>${I('users',16)} Target Broadcast</b><span class="badge blue">${db.tenants.length} Mitra</span></div>${broadcastPreviewMarkup(broadcastDraft)}<div class="notice">${I('info',16)}<div>${window.INPOS_LOCAL_SERVER?'Pengumuman akan dikirim ke seluruh Mitra aktif melalui database server.':'Pengumuman hanya tersedia pada browser ini.'}</div></div>`,`<button type="button" class="btn" data-action="broadcast-open">Batal</button><button type="button" class="btn primary" data-action="broadcast-confirm">${I('send',16)} Terbitkan</button>`);
}
async function broadcastConfirm(){
 const title=broadcastDraft.title.trim(),body=broadcastDraft.body.trim();if(title.length<3||body.length<5||!db.tenants.length)return toast('Lengkapi judul, pesan dan penerima.','error');
 if(window.INPOS_LOCAL_SERVER){
  if(!window.INPOS_ADMIN_SYNC_READY?.())return toast('Tunggu pengaturan sebelumnya selesai tersimpan, lalu coba kembali.','error');
  try{const r=await fetch('/api/admin/broadcasts',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({title,body,image:safeBroadcastImage(broadcastDraft.image),revision:window.INPOS_ADMIN_SERVER_REVISION()})});const x=await r.json();if(!r.ok)throw Error(x.error||'Gagal mengirim pengumuman.');
   db.broadcasts=[x.broadcast,...broadcastList()].slice(0,100);
   if(!window.INPOS_ADMIN_ACCEPT_REMOTE(db,x.revision)){location.reload();return}
   broadcastDraft={title:'',body:'',image:''};draw();broadcastDetail(x.broadcast.id);toast('Pengumuman telah tersimpan dan tersedia untuk Mitra.');
  }catch(e){toast(e.message,'error')}
  return;
 }
 let id='B'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
 const entry={id,title,body,image:safeBroadcastImage(broadcastDraft.image),createdAt:nowISO(),audienceCount:db.tenants.length,target:'all',popup:true,status:'demo-published'};
 const original=broadcastList().slice();db.broadcasts=[entry,...original].slice(0,15);
 if(!save()){db.broadcasts=original;return}
 const mirrored=syncBroadcastFeed();broadcastDraft={title:'',body:'',image:''};draw();broadcastDetail(id);toast(mirrored?'Pengumuman tersimpan pada browser ini.':'Pengumuman tersimpan, tetapi penyimpanan pengumuman sudah penuh.','success');
}

function broadcastDetail(id){
 const b=broadcastList().find(x=>x.id===id);if(!b)return toast('Broadcast tidak ditemukan.','error');
 const info=`<div class="broadcast-meta"><span class="badge blue">${num(b.audienceCount)} Mitra</span><span class="badge neutral">Notifikasi + popup</span><span class="badge neutral">${window.INPOS_LOCAL_SERVER?'Server lokal':'Tersimpan lokal'}</span></div><p class="broadcast-short-info">Dibuat ${stamp(b.createdAt)}. Jumlah penerima adalah Mitra terdaftar saat broadcast dibuat. ${window.INPOS_LOCAL_SERVER?'Tersedia pada perangkat yang mengakses server INPOS ini.':'Pengiriman lintas perangkat belum tersedia.'}</p>`;
 showSheet('Histori Broadcast',`#${b.id}`,broadcastPreviewMarkup(b)+info,`<button type="button" class="btn" data-action="broadcast-open">${I('back',16)} Kembali</button>${window.INPOS_LOCAL_SERVER&&b.status==='server-published'?`<button type="button" class="btn primary" data-inpos-broadcast-resend="${esc(b.id)}" aria-label="Kirim ulang Broadcast">${I('send',16)} Kirim Ulang</button>`:''}`);
}

function showSheet(heading,description,content,footer=''){modal=heading;$('sheetRoot').innerHTML=`<div class="sheetbg" id="sheetBackdrop"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(heading)}"><div class="sheet-handle"></div><header class="sheet-top"><div><h2>${esc(heading)}</h2>${description?`<p>${esc(description)}</p>`:''}</div><button class="round-btn" data-action="close" aria-label="Tutup">${I('close',19)}</button></header><div class="sheet-content">${content}</div>${footer?`<footer class="sheet-foot">${footer}</footer>`:''}</div></div>`;renderMobileBack();}
function closeSheet(){if(!modal)return;modal='';$('sheetRoot').innerHTML='';renderMobileBack();}
const closeBtn=`<button class="btn" data-action="close">Tutup</button>`;
// v7: ukuran data JSON terserialisasi terkait mitra di browser, BUKAN ukuran database server.
function tenantLocalBytes(id){
 const t=getTenant(id);if(!t)return 0;
 const payments=db.payments.filter(p=>p.tenantId===id&&visibleToAdmin(p));
 const paymentIds=new Set(payments.map(p=>p.id));
 const notifications=db.notifications.filter(n=>n.paymentId&&paymentIds.has(n.paymentId));
  const payouts=(db.commissionPayouts||[]).filter(x=>x.tenantId===id);
  return new TextEncoder().encode(JSON.stringify({tenant:t,payments,notifications,payouts})).byteLength;
}
function readableBytes(bytes){
 const fmt=new Intl.NumberFormat('id-ID',{maximumFractionDigits:1,minimumFractionDigits:1});
 return bytes<1024?digits(bytes)+' B':fmt.format(bytes/1024)+' KB';
}
function tenantDetail(id){let t=getTenant(id);if(!t)return toast('Mitra tidak ditemukan','error');selectedTenant=id;let s=tenantStatus(t);let days=diffDays(t.end),taxDays=diffDays(t.taxEnd);let content=`<div class="detail-banner"><div class="item-top"><h3>${esc(t.name)}</h3>${statusBadge(s)}</div><p>#${esc(t.code)} · toko.inpos.id/${esc(t.subdomain)} <span class="reg-chip">${subdomainIsVerified(t)?'Online ✓':'Belum Online'}</span></p></div><div class="two-col"><div class="mini-box"><small>Langganan ${tenantPlanLabel(t)}</small><b>${tenantPlanLabel(t)==='Lifetime'?'Berlaku selamanya':t.end?date(t.end):'Belum aktif'}</b><div class="subtle">${tenantPlanLabel(t)==='Lifetime'?'Tanpa tanggal berakhir':t.end?(days>=0?`${days} hari lagi`:`Lewat ${Math.abs(days)} hari`):'Belum ada masa aktif'}</div></div><div class="mini-box"><small>Fitur Pajak</small><b>${taxDays>=0?date(t.taxEnd):'Tidak aktif'}</b><div class="subtle">${taxDays>=0?`${taxDays} hari lagi`:'Belum aktif / habis'}</div></div></div><div class="section" style="margin-top:14px"><div class="valuebar"><div><span>Validasi Nama URL</span></div><b class="value">${subdomainIsVerified(t)?`Online ✓ · ${stamp(t.subdomainValidation.checkedAt)}`:'Belum diverifikasi'}</b></div><div class="valuebar"><div><span>Nama pemilik</span></div><b class="value">${esc(t.owner)}</b></div><div class="valuebar"><div><span>WhatsApp</span></div><b class="value">${esc(t.wa)}</b></div>${t.source==='demo-inpos-v726'?`<div class="valuebar"><div><span>Username Owner</span></div><b class="value">${esc(t.username||'inpos')}</b></div><div class="valuebar"><div><span>PIN Owner</span></div><b class="value">${esc(t.demoPin||'321123')}</b></div><div class="info-line">Akun Owner pada alamat aplikasi dan data Super Admin belum tersinkronisasi secara online.</div>`:''}<div class="valuebar"><div><span>Email</span></div><b class="value" style="overflow-wrap:anywhere">${esc(t.email||'—')}</b></div><div class="valuebar"><div><span>Kode referral saat daftar</span></div><b class="value">${esc(t.referral||'—')}</b></div><div class="valuebar"><div><span>Kode referral usaha</span></div><b class="value">${esc(ownedReferralCode(t))}</b></div><div class="valuebar"><div><span>Komisi tersedia</span></div><b class="value">${money(commissionSummary(t).available)}</b></div><div class="payout-bank-section"><h3>Rekening Pencairan</h3><p>Rekening tujuan untuk pembayaran komisi referral.</p>${payoutBankMarkup(t)}${minimumPayout()>0?`<div class="payout-alert">Minimal pencairan: ${money(minimumPayout())}</div>`:''}</div>${t.address?`<div class="valuebar"><div><span>Alamat</span></div><b class="value" style="max-width:67%;overflow-wrap:anywhere">${esc(t.address)}</b></div>`:''}<div class="valuebar"><div><span>Terdaftar</span></div><b class="value">${stamp(t.registeredAt||t.created)}</b></div><div class="valuebar"><div><span>Sumber</span></div><b class="value">${esc(t.source==='inpos-local'?'Impor INPOS lokal':t.source==='manual'?'Input Super Admin':'Contoh data')}</b></div><div class="valuebar"><div><span>${I('database',14)} Ukuran Database</span><small class="tenant-storage-hint">Estimasi data lokal • bukan ukuran server</small></div><b class="value">≈ ${readableBytes(tenantLocalBytes(t.id))}</b></div></div><div class="section" style="margin-top:14px"><div class="tenant-detail-actions"><button class="btn" data-action="tenant-plan-edit" data-id="${esc(t.id)}">${I('edit',16)} Jenis</button><button class="btn" data-action="tenant-renew" data-id="${esc(t.id)}">${I('calendar',16)} Perpanjang</button><button class="btn" data-action="edit-tenant" data-id="${esc(t.id)}">${I('edit',16)} Edit Usaha</button><button class="btn reset-pass-btn" data-action="password-reset-ask" data-id="${esc(t.id)}" aria-label="Reset password melalui email pemilik">${I('key',16)} Reset Password</button><button class="btn ${t.suspended?'light':'danger'}" data-action="toggle-suspend" data-id="${esc(t.id)}">${I(t.suspended?'play':'pause',16)} ${t.suspended?'Aktifkan':'Tangguhkan'}</button></div></div>`;
let footer=`<button type="button" class="btn danger delete-tenant-icon" data-action="tenant-delete-ask" data-id="${esc(t.id)}" title="Hapus Usaha" aria-label="Hapus Usaha">${I('trash',17)}</button><button class="btn" data-action="commission-history" data-id="${esc(t.id)}">Histori Komisi</button><button class="btn primary" data-action="tenant-payments" data-id="${esc(t.id)}">${I('receipt',16)} Tagihan</button>`;showSheet('Detail Usaha',`Mitra ${t.code}`,content,footer)}
function tenantForm(id){let t=id?getTenant(id):null;let isEdit=!!t;let code=isEdit?t.code:String(db.nextTenant).padStart(3,'0');showSheet(isEdit?'Edit Data Usaha':'Tambah Mitra',isEdit?`Kode #${code}`:'Sesuai formulir registrasi INPOS',`<form id="tenantForm"><input type="hidden" name="id" value="${esc(t?.id||'')}"><div class="registration-grid"><div class="field sa-value-row"><span class="sa-inline-caption">Kode Mitra</span><input value="${esc(code)}" aria-label="Kode Mitra" disabled></div><div class="field"><input id="tenantReferral" name="referral" maxlength="40" autocomplete="off" value="${esc(t?.referral||'')}" placeholder="Kode referral (opsional)" aria-label="Kode referral (opsional)"></div></div><div class="field"><input id="tenantName" name="name" minlength="2" maxlength="70" required value="${esc(t?.name||'')}" placeholder="Nama usaha *" aria-label="Nama usaha *"></div><div class="field"><input id="tenantOwner" name="owner" minlength="2" maxlength="60" required value="${esc(t?.owner||'')}" placeholder="Nama pemilik *" aria-label="Nama pemilik *"></div><div class="registration-grid"><div class="field"><input id="tenantWa" name="wa" maxlength="17" inputmode="tel" type="tel" pattern="[0-9+]{8,17}" required value="${esc(t?.wa||'')}" placeholder="Nomor WhatsApp *" aria-label="Nomor WhatsApp *"></div><div class="field"><input id="tenantEmail" name="email" type="email" maxlength="130" required value="${esc(t?.email||'')}" placeholder="Email usaha *" aria-label="Email usaha *"></div></div><div class="field"><textarea id="tenantAddress" name="address" maxlength="280" placeholder="Alamat usaha (opsional)" aria-label="Alamat usaha (opsional)">${esc(t?.address||'')}</textarea></div><div class="field"><input id="tenantSub" name="subdomain" maxlength="40" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value="${esc(t?.subdomain||'')}" placeholder="Nama URL toko, contoh: namatoko" aria-label="Nama URL toko"><small>Alamat toko: https://toko.inpos.id/namatoko</small></div>${isEdit?`<div class="payout-bank-section"><h3>Rekening Pencairan</h3><p>Isi untuk mencatat transfer komisi referral. Data ini tidak berasal dari registrasi INPOS.</p><div class="payout-bank-fields"><div class="field"><input id="payoutBankName" name="bankName" maxlength="50" value="${esc(payoutBank(t).name)}" placeholder="Nama bank, contoh: BCA" aria-label="Nama bank"></div><div class="field"><input id="payoutAccountNumber" name="bankNumber" type="text" inputmode="numeric" autocomplete="off" maxlength="24" value="${esc(payoutBank(t).number)}" placeholder="Nomor rekening" aria-label="Nomor rekening"></div><div class="field"><input id="payoutAccountHolder" name="bankHolder" maxlength="80" value="${esc(payoutBank(t).holder)}" placeholder="Atas nama rekening" aria-label="Atas nama rekening"></div></div><small class="tenant-storage-hint">Kosongkan ketiganya jika belum ada rekening. Pencairan hanya dapat dicatat jika rekening lengkap.</small></div>`:''}<div class="info-line">PIN login tetap berada pada sistem autentikasi INPOS, tidak dikelola melalui daftar mitra ini.</div>${!isEdit?`<label class="checklabel"><input type="checkbox" name="trial" value="1" checked> Trial gratis ${num(db.config.trialDays||60)} hari</label>`:''}</form>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="save-tenant">${I('check',17)} Simpan</button>`)}
function paymentDetail(id){let p=db.payments.find(x=>x.id===id);if(!p)return toast('Transaksi tidak ditemukan','error');let t=getTenant(p.tenantId);let body=`<div class="detail-banner"><div class="item-top"><h3>${money(paymentTotal(p))}</h3>${statusBadge(p.status)}</div><p>${labelType(p.type)} · ${paymentPlanLabel(p)} · ${p.months} bulan</p></div>${breakdown(p.amount,num(p.uniqueCode),p)}<div class="valuebar"><div><span>Mitra</span></div><b class="value">${esc(t?.name||'Tidak ditemukan')}</b></div><div class="valuebar"><div><span>Kode transaksi</span></div><b class="value">${esc(p.id)}</b></div><div class="valuebar"><div><span>Metode</span></div><b class="value">${esc(p.method)}</b></div>${p.source==='tenant-request-demo'?`<div class="valuebar"><div><span>Sumber tagihan</span></div><b class="value">Otomatis dari mitra</b></div>`:''}<div class="valuebar"><div><span>Diajukan</span></div><b class="value">${stamp(p.created)}</b></div><div class="valuebar"><div><span>Diproses</span></div><b class="value">${stamp(p.handledAt)}</b></div>${p.note?`<div class="info-line">${esc(p.note)}</div>`:''}${p.referralCommission?.amount?`<div class="valuebar"><div><span>Komisi referral (catatan)</span><br><small>${esc(p.referralCommission.referralCode||'—')}</small></div><b class="value">${money(p.referralCommission.amount)}</b></div>`:''}${p.status==='pending'?`<div class="notice" style="margin-top:11px">${I('alert',16)}<div>Pastikan pembayaran benar-benar diterima sebelum menyetujui. Pastikan pembayaran masuk; pemeriksaan mutasi QRIS belum tersedia.</div></div>`:''}`;
let foot=p.status==='pending'?`<button class="btn danger" data-action="reject-ask" data-id="${esc(id)}">Tolak</button><button class="btn primary" data-action="approve-ask" data-id="${esc(id)}">${I('check',16)} Setujui</button>`:`<button class="btn" data-action="close">Tutup</button>${p.status==='approved'?`<button class="btn primary" data-action="receipt" data-id="${esc(id)}">${I('download',16)} Struk PNG</button>`:''}`;showSheet('Detail Pembayaran',`#${p.id}`,body,foot)}
function approveAsk(id){let p=db.payments.find(x=>x.id===id),t=p&&getTenant(p.tenantId);if(!p||p.status!=='pending')return toast('Pembayaran sudah diproses','error');showSheet('Setujui Pembayaran','Konfirmasi tindakan',`<div class="detail-banner"><h3>${esc(t?.name||'Mitra tidak ditemukan')}</h3><p>${labelType(p.type)} • ${paymentPlanLabel(p)} • ${p.months} bulan</p></div><h2 style="font-size:24px;margin:12px 0">${money(paymentTotal(p))}</h2><div class="info-line">Harga ${money(p.amount)} + kode unik ${paymentCode(p)} (${money(p.uniqueCode)})</div><p class="setting-help">Persetujuan memperpanjang masa aktif pada data ini. Pembaruan perangkat lain membutuhkan sinkronisasi online.</p><label class="checklabel"><input id="approvedVerified" type="checkbox"> Saya sudah memeriksa penerimaan pembayaran</label>`,`<button class="btn" data-action="payment-detail" data-id="${esc(id)}">Kembali</button><button class="btn primary" data-action="approve" data-id="${esc(id)}">${I('check',16)} Konfirmasi</button>`)}
function rejectAsk(id){let p=db.payments.find(x=>x.id===id);if(!p||p.status!=='pending')return toast('Pembayaran sudah diproses','error');showSheet('Tolak Pembayaran','Berikan alasan penolakan',`<div class="detail-banner"><h3>${money(paymentTotal(p))}</h3><p>${esc(getTenant(p.tenantId)?.name||'Mitra')} · Kode unik ${paymentCode(p)}</p></div><div class="field"><textarea id="rejectReason" maxlength="200" required placeholder="Alasan penolakan *" aria-label="Alasan penolakan *"></textarea></div>`,`<button class="btn" data-action="payment-detail" data-id="${esc(id)}">Kembali</button><button class="btn danger" data-action="reject" data-id="${esc(id)}">Tolak Tagihan</button>`)}
function addNote(title,body,paymentId=''){db.nextNote=num(db.nextNote)+1;db.notifications.unshift({id:'N'+String(db.nextNote).padStart(3,'0'),title,body,created:nowISO(),read:false,paymentId});db.notifications=db.notifications.slice(0,100)}
// Integrasi Laravel diperlukan. Endpoint HARUS dilindungi auth Super Admin, CSRF, rate limiting,
// mengirim token sekali pakai ke email owner terverifikasi, dan tidak pernah mengembalikan token.
// POST /api/super-admin/tenants/{tenantId}/password-reset, response JSON: {"sent":true}.
// Server WAJIB menentukan penerima dari tenantId di database, bukan dari email dari browser.
const PASSWORD_RESET_API='/api/super-admin/tenants';
function passwordResetAsk(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 if(!t.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email)){
  return showSheet('Reset Password',t.name,`<div class="info-line">Email usaha belum valid. Perbarui data email melalui <b>Edit Usaha</b> sebelum mengirim reset password.</div>`,`<button class="btn" data-action="tenant-detail" data-id="${esc(id)}">Kembali</button><button class="btn primary" data-action="edit-tenant" data-id="${esc(id)}">Edit Email</button>`);
 }
 showSheet('Reset Password',`Usaha #${t.code}`,`<div class="detail-banner"><h3>${esc(t.name)}</h3><p>${esc(t.owner)} · Pemilik usaha</p></div><p class="setting-help">Kirim tautan reset password ke email pemilik yang terdaftar:</p><div class="reset-confirm-email">${I('mail',19)}<b>${esc(t.email)}</b></div><div class="info-line">Password/PIN tidak ditampilkan dan tidak diubah melalui Super Admin. Tautan reset dibuat oleh server, bersifat sekali pakai, dan memiliki batas waktu berlaku.</div><p class="subtle">Pengiriman email hanya tersedia setelah layanan server dan email INPOS aktif.</p>`,`<button class="btn" data-action="tenant-detail" data-id="${esc(id)}">Batal</button><button class="btn primary" data-action="password-reset-send" data-id="${esc(id)}" id="passwordResetSend">${I('mail',16)} Kirim Email Reset</button>`);
}
async function sendPasswordReset(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){
  toast('Email otomatis belum tersedia. Gunakan layanan INPOS melalui HTTPS.','error');return;
 }
 const btn=$('passwordResetSend');if(!btn||btn.disabled)return;
 btn.disabled=true;btn.innerHTML=`${I('clock',16)} Mengirim…`;
 const csrf=document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
 const headers={'Accept':'application/json','Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'};
 if(csrf)headers['X-CSRF-TOKEN']=csrf;
 try{
  const res=await fetch(`${PASSWORD_RESET_API}/${encodeURIComponent(id)}/password-reset`,{
   method:'POST',headers,credentials:'same-origin',redirect:'error',body:'{}'
  });
  if(!res.ok){
   const message=res.status===401||res.status===403?'Hanya Super Admin yang sudah login dapat mengirim reset password.':res.status===404||res.status===405||res.status===501?'Layanan reset password belum terpasang pada server INPOS.':res.status===419?'Sesi keamanan kedaluwarsa. Silakan login kembali.':res.status===429?'Batas pengiriman email tercapai. Coba kembali nanti.':'Email gagal dikirim. Periksa layanan server dan pengaturan email.';
   throw new Error(message);
  }
  if(!(res.headers.get('content-type')||'').includes('application/json'))throw new Error('Server tidak memberikan konfirmasi JSON. Periksa integrasi API.');
  const result=await res.json();
  if(result?.sent!==true)throw new Error('Server belum mengonfirmasi email terkirim. Periksa layanan email.');
  addNote('Email reset password diminta',`${t.name} • ${t.email}`);
  save();closeSheet();draw();toast('Permintaan reset password berhasil diproses dan email dikonfirmasi server.');
 }catch(err){
  let message=String(err?.message||'Gagal menghubungi server.');
  if(err instanceof TypeError||/Failed to fetch|NetworkError/i.test(message))message='Tidak dapat menghubungi layanan INPOS. Coba lagi nanti.';
  toast(message,'error');
 }finally{const current=$('passwordResetSend');if(current){current.disabled=false;current.innerHTML=`${I('mail',16)} Kirim Email Reset`;}}
}
function tenantDeleteAsk(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 const paymentCount=db.payments.filter(p=>p.tenantId===id&&visibleToAdmin(p)).length;
 const payoutCount=(db.commissionPayouts||[]).filter(p=>p.tenantId===id).length;
 showSheet('Hapus Usaha',`Mitra #${t.code}`,`<div class="detail-banner"><h3>${esc(t.name)}</h3><p>${esc(t.owner)} · ${esc(t.email||'Tanpa email')}</p></div><div class="notice">${I('alert',18)}<div><b>Hapus permanen.</b> Profil usaha, ${paymentCount} tagihan, ${payoutCount} catatan cair, dan notifikasi pembayaran terkait akan dihapus dari browser ini. Tindakan tidak dapat dibatalkan. Ekspor cadangan JSON terlebih dahulu bila diperlukan.</div></div><div class="field" style="margin-top:14px"><input id="confirmDeleteCode" type="text" inputmode="numeric" maxlength="16" autocomplete="off" placeholder="${esc(t.code)}" aria-label="Ketik kode mitra ${esc(t.code)} untuk konfirmasi"></div><button class="btn smol" type="button" data-action="export-json" style="margin-top:10px">${I('download',15)} Cadangkan JSON</button>`,`<button class="btn" data-action="tenant-detail" data-id="${esc(id)}">Batal</button><button class="btn danger" data-action="tenant-delete-confirm" data-id="${esc(id)}">${I('trash',16)} Hapus Permanen</button>`);
}
function tenantDeleteConfirm(id){
 const t=getTenant(id);if(!t)return toast('Usaha tidak ditemukan','error');
 const input=$('confirmDeleteCode');
 if(db.payments.some(p=>p.tenantId===id&&num(p.referralCommission?.amount)>0))return toast('Mitra memiliki komisi referral tercatat. Jangan hapus audit pembayaran; gunakan Tangguhkan.','error');
 if(!input||input.value.trim()!==String(t.code))return toast('Kode mitra tidak sesuai. Penghapusan dibatalkan.','error');
 const previous=db;
 const paymentIds=new Set(db.payments.filter(p=>p.tenantId===id).map(p=>p.id));
 db={...db,
  tenants:db.tenants.filter(x=>x.id!==id),
  payments:db.payments.filter(p=>p.tenantId!==id),
  commissionPayouts:(db.commissionPayouts||[]).filter(p=>p.tenantId!==id),
  notifications:db.notifications.filter(n=>!n.paymentId||!paymentIds.has(n.paymentId))};
 if(!save()){db=previous;return}
 selectedTenant=null;tenantSearch='';tenantFilter='all';paySearch='';
 closeSheet();goto('tenants');toast('Mitra dan tagihan terkait dihapus dari data lokal.');
}
function askSuspend(id){let t=getTenant(id);if(!t)return;showSheet(t.suspended?'Aktifkan Mitra':'Tangguhkan Mitra','Konfirmasi status akun',`<div class="detail-banner"><h3>${esc(t.name)}</h3><p>Kode #${esc(t.code)}</p></div><p class="setting-help">${t.suspended?'Akun mitra kembali diizinkan kembali secara administratif.':'Akun ditandai ditangguhkan secara administratif, tanpa menghapus data dan tanggal langganan.'}</p>`,`<button class="btn" data-action="tenant-detail" data-id="${esc(id)}">Batal</button><button class="btn ${t.suspended?'primary':'danger'}" data-action="suspend-confirm" data-id="${esc(id)}">${t.suspended?'Aktifkan':'Tangguhkan'}</button>`)}
/* v730 — Permintaan Lupa PIN: penampung HTML demo satu origin dan kontrak API untuk produksi. */
const PIN_RESET_KEY='inpos_pin_reset_requests_demo_v1';
const PIN_RESET_API='/api/admin/pin-requests';
const PIN_RESET_DEMO=location.protocol==='file:';
let remotePinQueue=[],pinPopupSeen=new Set(),pinRemotePending=false;
function pinRequestLocal(){
 try{const raw=JSON.parse(localStorage.getItem(PIN_RESET_KEY)||'[]');return Array.isArray(raw)?raw.filter(r=>r&&typeof r.id==='string'&&typeof r.username==='string').slice(-150):[]}
 catch(_){return []}
}
function pinRequests(){return PIN_RESET_DEMO?pinRequestLocal():remotePinQueue}
function pinRequestUnread(){return pinRequests().filter(r=>r.status==='pending'&&r.read!==true).length}
function pinRequestRow(r){
 const fresh=r.status==='pending'&&!r.read;
 const state=r.status==='archived'?'Diarsipkan':fresh?'Baru':'Dibaca';
 return `<article class="pin-request-item"><div class="pin-request-info"><div class="pin-request-main"><b>${esc(r.username)}</b><span class="badge ${fresh?'warn':'neutral'}">${state}</span></div><small>${esc(stamp(r.createdAt||r.created||new Date().toISOString()))}</small></div><button class="btn smol" type="button" data-action="pin-request-detail" data-id="${esc(r.id)}">Lihat</button></article>`;
}
function pinRequestListMarkup(){
 const rows=pinRequests().slice().reverse().filter(r=>r.status!=='archived').slice(0,35);
 return rows.length?`<div class="pin-request-list">${rows.map(pinRequestRow).join('')}</div>`:empty('Belum ada permintaan','Permintaan Lupa PIN akan tampil di sini.');
}
function showPinRequestList(){
 showSheet('Permintaan Lupa PIN','Pemeriksaan akun oleh Super Admin',pinRequestListMarkup(),closeBtn)
}
function showPinRequestDetail(id){
 const r=pinRequests().find(r=>r.id===id);if(!r)return showPinRequestList();
 pinPopupSeen.add(r.id);
 const detail=`<div class="pin-request-detail"><span class="detail-caption">Username</span><strong>${esc(r.username)}</strong><span class="detail-caption">Dikirim</span><b>${esc(stamp(r.createdAt||r.created||new Date().toISOString()))}</b><span class="detail-caption">Status</span><b>${r.status==='archived'?'Diarsipkan':r.read?'Dibaca':'Baru'}</b></div><div class="info-line">Verifikasi identitas pemilik akun sebelum membantu reset PIN. Tidak ada PIN yang dikirim melalui permintaan ini.</div>`;
 const action=`<button class="btn primary" data-action="pin-request-reset" data-id="${esc(r.id)}">Atur PIN Baru</button><button class="btn" data-action="pin-request-archive" data-id="${esc(r.id)}">Arsipkan</button>`;
 showSheet('Permintaan Lupa PIN','Periksa permintaan reset',detail,`<button class="btn" data-action="pin-request-list">Kembali</button>${action}`);
}
async function markPinRequest(id,action){
 const req=pinRequests().find(r=>r.id===id);if(!req)return;
 if(PIN_RESET_DEMO){
  try{const rows=pinRequestLocal(),r=rows.find(x=>x.id===id);if(!r)return;
   if(action==='archive')r.status='archived';else r.read=true;
   r.updatedAt=new Date().toISOString();localStorage.setItem(PIN_RESET_KEY,JSON.stringify(rows));
  }catch(_){toast('Status permintaan belum tersimpan.','error');return}
 }else{
  try{const res=await fetch(PIN_RESET_API,{method:'PATCH',mode:'cors',credentials:'include',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({id:Number(id),status:action==='archive'?'archived':'read'})});
   if(!res.ok)throw Error('Tidak tersimpan');
   await syncRemotePinRequests();
  }catch(_){toast('Status belum dapat diperbarui.','error');return}
 }
 setTop();showPinRequestList();toast(action==='archive'?'Permintaan diarsipkan.':'Permintaan ditandai dibaca.');
}
function checkNewPinRequest(){
 if(modal)return;
 const latest=pinRequests().filter(r=>r.status==='pending'&&!r.read&&!pinPopupSeen.has(r.id)).at(-1);
 if(!latest)return;
 pinPopupSeen.add(latest.id);showPinRequestDetail(latest.id);setTop();
}
async function syncRemotePinRequests(){
 if(PIN_RESET_DEMO||pinRemotePending)return;
 pinRemotePending=true;
 try{const res=await fetch(PIN_RESET_API,{method:'GET',mode:'cors',credentials:'include',headers:{'Accept':'application/json'}});
  if(!res.ok)return;
  const body=await res.json(),rows=Array.isArray(body)?body:Array.isArray(body.requests)?body.requests:[];
  remotePinQueue=rows.filter(r=>r&&typeof r.username==='string'&&r.id!=null).map(r=>({...r,id:String(r.id),createdAt:r.created_at||r.createdAt})).slice(-150);
  setTop();checkNewPinRequest();
 }catch(_){/* Jaringan atau endpoint belum aktif; tidak ada notifikasi pengiriman palsu. */}
 finally{pinRemotePending=false}
}
function refreshPinRequest(){if(PIN_RESET_DEMO){setTop();checkNewPinRequest()}else syncRemotePinRequests()}


async function resetRequestedPin(id){
 const r=pinRequests().find(x=>x.id===id);if(!r)return;
 const pin=window.prompt('Masukkan PIN baru 5–6 angka setelah verifikasi identitas pemilik usaha:');
 if(pin===null)return;if(!/^\d{5,6}$/.test(pin)){toast('PIN harus 5–6 angka.','error');return}
 try{const res=await fetch('/api/admin/reset-pin',{method:'POST',headers:{'X-INPOS-Request':'1','Content-Type':'application/json'},body:JSON.stringify({requestId:Number(id),newPin:pin})});const x=await res.json();if(!res.ok)throw Error(x.error||'Gagal mereset PIN');await syncRemotePinRequests();closeSheet();toast('PIN berhasil diperbarui. Pengguna harus login ulang.');}
 catch(e){toast(e.message,'error')}
}
function notifications(){const prior=db.notifications.map(n=>n.read);db.notifications.forEach(n=>n.read=true);if(!save())db.notifications.forEach((n,i)=>{n.read=prior[i]});setTop();let rows=db.notifications.slice(0,40).map(n=>`<div class="nrow"><div class="item-icon" style="height:32px;width:32px">${I('bell',17)}</div><div style="flex:1;min-width:0"><b>${esc(n.title)}</b><p>${esc(n.body)}</p><small>${stamp(n.created)}</small></div>${n.paymentId?`<button class="btn smol" data-action="payment-detail" data-id="${esc(n.paymentId)}">Lihat</button>`:''}</div>`).join('');showSheet('Notifikasi','Permintaan akun dan aktivitas terbaru',`<div class="pin-request-section"><div class="pin-request-heading"><b>Lupa PIN</b><span>${pinRequestUnread()} baru</span></div>${pinRequestListMarkup()}</div><div class="pin-request-section"><div class="pin-request-heading"><b>Aktivitas</b></div>${rows||empty('Belum ada aktivitas','Notifikasi lain akan tampil di sini.')}</div>`,closeBtn)}
function resetAsk(){if(window.INPOS_LOCAL_SERVER)return toast('Reset seluruh data server dinonaktifkan demi keamanan.','error');showSheet('Reset Data','Semua perubahan lokal akan dihapus',`<div class="notice">${I('alert',18)}<div>Ini akan mengganti daftar mitra, transaksi, tarif, dan QRIS dengan pengaturan awal. Unduh cadangan terlebih dahulu jika diperlukan.</div></div>`,`<button class="btn" data-action="close">Batal</button><button class="btn danger" data-action="reset-do">Ya, Reset Data</button>`)}
function downloadBlob(blob,name){let a=document.createElement('a');let url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function exportTenants(){
 const headers=['Kode','Nama Usaha','Pemilik','WhatsApp','Email','Kode Referral','Alamat','Nama URL Toko','Terdaftar','Status','Aktif Sampai','Pajak Sampai','Jenis Langganan','Sumber'];
 const protect=v=>{let x=String(v??'').replace(/\r|\n/g,' ').trim();if(/^[=+@\-\t]/.test(x)||/^0[0-9]{7,}$/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
 const rows=db.tenants.map(t=>[t.code,t.name,t.owner,t.wa,t.email||'',t.referral||'',t.address||'','toko.inpos.id/'+(t.subdomain||''),t.registeredAt||t.created||'',tenantStatus(t),t.end||'',t.taxEnd||'',tenantPlanLabel(t),t.source||'demo']);
 let csv='\uFEFF'+[headers,...rows].map(r=>r.map(protect).join(',')).join('\r\n');
 downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'INPOS-Mitra-'+wibDate()+'.csv');toast('Data mitra diekspor sebagai CSV.');
}
function exportPayments(){
 const protect=v=>{let x=String(v??'').replace(/\r|\n/g,' ').trim();if(/^[=+@\-\t]/.test(x)||/^0[0-9]{7,}$/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
 const rows=[['Transaksi','Mitra','Jenis','Paket','Bulan','Harga (Rp)','Kode Unik (Rp)','Total Bayar (Rp)','Total Tampilan','Metode','Status','Tanggal','Diproses','Kode Referral','Komisi Referral (Rp)','Harga Awal (Rp)','Diskon (Rp)','Jenis Diskon','Nilai Diskon'],...visiblePayments().map(p=>[p.id,getTenant(p.tenantId)?.name||'',labelType(p.type),paymentPlanLabel(p),p.months,num(p.amount),num(p.uniqueCode),paymentTotal(p),money(paymentTotal(p)),p.method,p.status,p.created,p.handledAt||'',p.referralCommission?.referralCode||'',num(p.referralCommission?.amount),num(p.gross)||num(p.amount),num(p.discount?.amount),p.discount?.mode||'',p.discount?.value??''])];
 const csv='\uFEFF'+rows.map(r=>r.map(protect).join(',')).join('\r\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'INPOS-Tagihan-'+wibDate()+'.csv');toast('Data transaksi telah diekspor.');
}
function exportJson(){downloadBlob(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),'INPOS-SuperAdmin-'+wibDate()+'.json');toast('Cadangan JSON diekspor.')}
function receipt(id){let p=db.payments.find(x=>x.id===id);if(!p||p.status!=='approved')return toast('Struk hanya untuk transaksi yang disetujui','error');let t=getTenant(p.tenantId);const scale=3,w=384,c=document.createElement('canvas');c.width=w*scale;c.height=780*scale;let ctx=c.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,780);ctx.fillStyle='#111';ctx.textAlign='center';ctx.font='bold 22px Arial';ctx.fillText('INPOS',w/2,39);ctx.font='13px Arial';ctx.fillText('BUKTI KONFIRMASI',w/2,62);ctx.fillText('Catatan Administrasi — Bukan Bukti Bank',w/2,84);ctx.strokeStyle='#333';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(19,103);ctx.lineTo(w-19,103);ctx.stroke();ctx.setLineDash([]);let y=137;let rows=[['Transaksi',p.id],['Mitra',t?.name||'—'],['Kode',t?.code||'—'],['Produk',labelType(p.type)],['Durasi',p.months+' bulan'],['Paket',paymentPlanLabel(p)],['Pembayaran',p.method],...(num(p.discount?.amount)?[['Harga awal',money(p.gross)],['Diskon','-'+money(p.discount.amount)]]:[]),['Harga',money(p.amount)],['Kode unik',paymentCode(p)+' / '+money(p.uniqueCode)],['Status','DISETUJUI'],['Tanggal',stamp(p.handledAt)]];ctx.font='14px Arial';for(let [k,v] of rows){ctx.textAlign='left';ctx.fillStyle='#555';ctx.fillText(k,22,y);ctx.textAlign='right';ctx.fillStyle='#111';if(ctx.measureText(String(v)).width>204){ctx.font='12px Arial'}ctx.fillText(String(v).slice(0,40),w-22,y);ctx.font='14px Arial';y+=37}ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(19,y+1);ctx.lineTo(w-19,y+1);ctx.stroke();ctx.setLineDash([]);ctx.font='bold 19px Arial';ctx.textAlign='left';ctx.fillText('TOTAL',22,y+38);ctx.textAlign='right';ctx.fillText(money(paymentTotal(p)),w-22,y+38);ctx.font='12px Arial';ctx.textAlign='center';ctx.fillStyle='#555';ctx.fillText('Dibuat oleh Super Admin INPOS',w/2,y+88);let hh=Math.min(780,y+110);let out=document.createElement('canvas');out.width=c.width;out.height=hh*scale;out.getContext('2d').drawImage(c,0,0,out.width,out.height,0,0,out.width,out.height);out.toBlob(async blob=>{if(!blob){toast('Gagal membuat PNG','error');return}let file=new File([blob],'INPOS-'+p.id+'-58mm.png',{type:'image/png'});try{if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:'Bukti INPOS '+p.id});toast('Opsi bagikan struk dibuka.');return}}catch(e){if(e.name==='AbortError')return;}downloadBlob(blob,file.name);toast('Struk 58 mm PNG berhasil dibuat.')},'image/png')}
async function copyText(value){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);else{const el=document.createElement('textarea');el.value=value;el.style.position='fixed';el.style.left='-9999px';document.body.appendChild(el);el.select();if(!document.execCommand('copy'))throw Error('Copy gagal');el.remove()}toast('Berhasil disalin.')}catch(e){toast('Gagal menyalin. Pilih teks secara manual.','error')}}
function slug(s){return String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)}
function normalizeWA(x){let v=String(x||'').replace(/[^0-9]/g,'');return v.startsWith('0')?'62'+v.slice(1):v.startsWith('8')?'62'+v:v}
function onFormTenant(){let f=$('tenantForm');if(!f||!f.reportValidity())return;let d=new FormData(f),id=String(d.get('id')||''),name=String(d.get('name')||'').trim(),owner=String(d.get('owner')||'').trim(),wa=String(d.get('wa')||'').trim(),email=String(d.get('email')||'').trim().toLowerCase(),referral=String(d.get('referral')||'').trim(),address=String(d.get('address')||'').trim();let sub=String(d.get('subdomain')||'').trim()||slug(name);if(name.length<2||owner.length<2||!/^62[0-9]{9,13}$/.test(normalizeWA(wa))||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sub))return toast('Periksa nama, WhatsApp, email, dan subdomain','error');if(db.tenants.some(t=>t.subdomain===sub&&t.id!==id))return toast('Subdomain sudah dipakai mitra lain','error');if(db.tenants.some(t=>normalizeWA(t.wa)===normalizeWA(wa)&&t.id!==id))return toast('Nomor WhatsApp telah terdaftar','error');let t=id?getTenant(id):null;if(id&&!t)return toast('Mitra tidak ditemukan','error');
 const bank={name:String(d.get('bankName')||'').trim(),number:String(d.get('bankNumber')||'').trim(),holder:String(d.get('bankHolder')||'').trim()};
 if(id&&(bank.name||bank.number||bank.holder)&&!(bank.name.length>=2&&bank.name.length<=50&&/^[0-9]{6,24}$/.test(bank.number)&&bank.holder.length>=3&&bank.holder.length<=80))return toast('Lengkapi bank, nomor rekening (6–24 angka), dan atas nama rekening.','error');
 const snapshot=JSON.stringify(db);if(t){if(t.subdomain!==sub)delete t.subdomainValidation;Object.assign(t,{name,owner,wa,email,referral,address,subdomain:sub,payoutBank:bank});addNote('Profil usaha diperbarui',name)}else{let code=String(db.nextTenant).padStart(3,'0');db.nextTenant++;t={id:'T'+code,code,name,owner,wa,email,referral,address,subdomain:sub,end:d.get('trial')?plusDays(wibDate(),Number(db.config.trialDays)||60):'',taxEnd:'',suspended:false,created:nowISO(),registeredAt:nowISO(),source:'manual'};db.tenants.push(t);addNote('Mitra baru ditambahkan',name)}if(save()){closeSheet();draw();toast(id?'Data usaha diperbarui.':'Mitra berhasil dibuat.')}else db=JSON.parse(snapshot);
}
// Import only the profile fields from the INPOS v679 local registration, never a login PIN.
function localRegistration(){try{const x=JSON.parse(localStorage.getItem(INPOS_REG_KEY)||'null');const z=x?.settings||{},r=z.inposRegistrationV632;if(r?.registered!==true||!z.store||!z.ownerName||!z.phone||!z.email)return null;const p={name:String(z.store).trim().slice(0,70),owner:String(z.ownerName).trim().slice(0,60),wa:String(z.phone).trim(),email:String(z.email).trim().toLowerCase().slice(0,130),referral:String(r.referralCode||'').trim().slice(0,40),address:String(z.address||z.storeAddress||'').trim().slice(0,280),registeredAt:String(r.registeredAt||'')};if(!/^62[0-9]{9,13}$/.test(normalizeWA(p.wa))||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))return null;return p}catch(e){return null}}
function importRegistrationAsk(){if(window.INPOS_LOCAL_SERVER)return toast('Data registrasi sudah otomatis tersedia dari database. Buka Data Usaha.','error');let reg=localRegistration();if(!reg){return showSheet('Ambil Registrasi INPOS','Tidak ada data yang cocok',`<div class="notice">${I('info',17)}<div>Belum ditemukan profil usaha dari registrasi INPOS v679 pada <b>origin browser yang sama</b>. Ini bukan sinkronisasi antarperangkat atau antar-subdomain. Silakan registrasi di INPOS pada origin yang sama, atau tambahkan mitra secara manual.</div></div>`,closeBtn)}let existing=db.tenants.find(t=>normalizeWA(t.wa)===normalizeWA(reg.wa));showSheet('Ambil Registrasi INPOS','Pratinjau profil lokal',`<div class="notice">${I('info',17)}<div>Hanya menyalin data registrasi usaha. <b>PIN login tidak dibaca, disimpan, atau dikirim.</b> Tidak ada koneksi ke database pusat.</div></div><div class="valuebar"><div><span>Nama usaha</span></div><b class="value">${esc(reg.name)}</b></div><div class="valuebar"><div><span>Pemilik</span></div><b class="value">${esc(reg.owner)}</b></div><div class="valuebar"><div><span>WhatsApp</span></div><b class="value">${esc(reg.wa)}</b></div><div class="valuebar"><div><span>Email</span></div><b class="value" style="overflow-wrap:anywhere">${esc(reg.email)}</b></div><div class="valuebar"><div><span>Referral</span></div><b class="value">${esc(reg.referral||'—')}</b></div><div class="valuebar"><div><span>Terdaftar</span></div><b class="value">${stamp(reg.registeredAt)}</b></div><div class="info-line">${existing?'Nomor WA ditemukan. Profil mitra '+esc(existing.code)+' akan diperbarui, status dan masa aktif tetap.':'Belum ada mitra dengan WA ini. Kode mitra berikutnya dibuat otomatis.'}</div>${existing?'':`<label class="checklabel"><input id="importTrial" type="checkbox" checked> Trial ${num(db.config.trialDays||60)} hari sejak tanggal registrasi</label>`}`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="import-registration-confirm">${I('check',16)} ${existing?'Perbarui Profil':'Impor Usaha'}</button>`)}
function importRegistrationConfirm(){if(window.INPOS_LOCAL_SERVER)return toast('Gunakan Data Usaha dari database server.','error');let p=localRegistration();if(!p)return toast('Profil INPOS lokal tidak ditemukan','error');const snapshot=JSON.stringify(db);let t=db.tenants.find(x=>normalizeWA(x.wa)===normalizeWA(p.wa));if(t){Object.assign(t,{name:p.name,owner:p.owner,wa:p.wa,email:p.email,referral:p.referral,address:p.address,registeredAt:p.registeredAt||t.registeredAt||t.created,source:'inpos-local'});addNote('Registrasi lokal diperbarui',t.name)}else{let code=String(db.nextTenant).padStart(3,'0'),sub=slug(p.name)||'toko-'+code;if(db.tenants.some(x=>x.subdomain===sub))sub=(sub.slice(0,34)+'-'+code).slice(0,40);t={...p,id:'T'+code,code,subdomain:sub,end:$('importTrial')?.checked?plusDays(Number.isFinite(Date.parse(p.registeredAt))?wibDate(new Date(p.registeredAt)):wibDate(),Number(db.config.trialDays)||60):'',taxEnd:'',suspended:false,created:nowISO(),source:'inpos-local'};db.nextTenant++;db.tenants.push(t);addNote('Registrasi INPOS lokal diimpor',t.name)}if(save()){tenantFilter='all';tenantSearch='';goto('tenants');toast('Profil usaha berhasil diimpor. Belum tersinkron ke server.')}else db=JSON.parse(snapshot)}
function onApprove(id){const candidate=db.payments.find(x=>x.id===id);if(['tenant-request-demo','server-tax','server-sub'].includes(candidate?.source)&&!candidate.confirmedAt)return toast('Mitra belum mengirim konfirmasi pembayaran.','error');if(!$('approvedVerified')?.checked)return toast('Centang konfirmasi setelah memeriksa pembayaran.','error');let p=db.payments.find(x=>x.id===id),t=p&&getTenant(p.tenantId);if(!p||p.status!=='pending'||!t)return toast('Transaksi tidak tersedia','error');const previous=JSON.stringify(db);let field=p.type==='tax'?'taxEnd':'end';let base=t[field]&&diffDays(t[field])>=0?t[field]:wibDate();t[field]=plusMonths(base,p.months);p.status='approved';p.handledAt=nowISO();const referralAccrual=calculateReferralCommission(p,t);if(referralAccrual)p.referralCommission=referralAccrual;addNote('Pembayaran disetujui',`${t.name} • ${labelType(p.type)} sampai ${date(t[field])}`,p.id);if(!save()){db=JSON.parse(previous);return}closeSheet();draw();toast('Pembayaran disetujui; masa aktif diperbarui.')}
function onReject(id){let reason=$('rejectReason')?.value.trim();if(!reason)return toast('Alasan penolakan wajib diisi','error');let p=db.payments.find(x=>x.id===id);if(!p||p.status!=='pending')return toast('Transaksi sudah diproses','error');const previous=JSON.stringify(db);p.status='rejected';p.handledAt=nowISO();p.note=(p.note?p.note+' • ':'')+'Ditolak: '+reason;addNote('Pembayaran ditolak',`${getTenant(p.tenantId)?.name||'Mitra'} • ${reason}`,p.id);if(!save()){db=JSON.parse(previous);return}closeSheet();draw();toast('Tagihan ditolak.')}
function saveSettings(){
 const a=parseNominal($('setMonthly')?.value);
 if(!Number.isSafeInteger(a)||a<=0||a>1000000000)return toast('Periksa nominal tarif rupiah.','error');
 if(planConfig().enabled&&planConfig().rows.some(r=>r.monthly>a))return toast('Tarif normal harus setidaknya setinggi harga paket aktif.','error');
 const before={monthly:db.config.monthly};db.config.monthly=a;
 if(save()){draw();toast('Tarif berhasil disimpan.')}else Object.assign(db.config,before);
}
function saveCycleSettings(){
 const trial=Number($('setTrialDays')?.value),c=Number($('setReminder')?.value);
 if(!Number.isInteger(c)||c<1||c>90||!Number.isInteger(trial)||trial<1||trial>365)return toast('Trial 1–365 hari, pengingat 1–90 hari.','error');
 const before={reminder:db.config.reminder,trialDays:db.config.trialDays};db.config.reminder=c;db.config.trialDays=trial;
 if(save()){draw();toast('Masa trial dan pengingat disimpan.')}else Object.assign(db.config,before);
}
function savePayoutSettings(){
 const val=parseNominal($('setMinimumPayout')?.value);
 if(!Number.isSafeInteger(val)||val<0||val>1000000000)return toast('Minimal pencairan harus Rp 0–1.000.000.000.','error');
 const previous=db.config.minimumPayout;
 db.config.minimumPayout=val;
 if(save()){draw();toast('Minimal pencairan tersimpan.')}else db.config.minimumPayout=previous;
}
function normalizeConfirmWhatsapp(raw){
 const clean=String(raw||'').trim().replace(/[\s.()-]/g,'');
 if(!clean)return '';
 if(!/^\+?\d+$/.test(clean))return null;
 let digits=clean.replace(/^\+/,'');
 if(digits.startsWith('0'))digits='62'+digits.slice(1);
 else if(digits.startsWith('8'))digits='62'+digits;
 return /^628[1-9]\d{6,11}$/.test(digits)?digits:null;
}
function displayConfirmWhatsapp(raw){
 const digits=String(raw||'');
 return digits.startsWith('62')?'0'+digits.slice(2):digits;
}
function saveMerchant(){
 const name=$('merchantName')?.value.trim()||'';
 const wa=normalizeConfirmWhatsapp($('confirmationWhatsapp')?.value||'');
 if(!name)return toast('Nama penerima wajib diisi.','error');
 if(wa===null)return toast('Nomor WhatsApp harus nomor seluler Indonesia, contoh 081234567890.','error');
 const previous={merchant:db.config.merchant,confirmationWhatsapp:db.config.confirmationWhatsapp};
 db.config.merchant=name;
 db.config.confirmationWhatsapp=wa;
 if(save()){draw();toast('Pengaturan pembayaran berhasil disimpan.')}else Object.assign(db.config,previous);
} 
function handleQris(file){
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1000000){toast('Pilih gambar PNG/JPG/WebP maksimal 1 MB.','error');return}
 const fr=new FileReader();fr.onerror=()=>toast('Gagal membaca gambar QRIS.','error');
 fr.onload=async()=>{
  const img=String(fr.result||'');if(!/^data:image\/(?:png|jpeg|webp);base64,/.test(img))return toast('Format QRIS tidak didukung.','error');
  if(window.INPOS_LOCAL_SERVER){
   if(!window.INPOS_ADMIN_SYNC_READY?.())return toast('Tunggu perubahan Super Admin sebelumnya tersimpan sebelum upload QRIS.','error');
   try{const r=await fetch('/api/admin/qris',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','X-INPOS-Request':'1'},body:JSON.stringify({image:img,revision:window.INPOS_ADMIN_SERVER_REVISION()})});const x=await r.json();if(!r.ok)throw Error(x.error||'Gagal menyimpan QRIS di database.');
    db.config.qris=img;if(!window.INPOS_ADMIN_ACCEPT_REMOTE(db,x.revision)){location.reload();return}
    draw();toast('QRIS tersimpan di server dan siap digunakan untuk Langganan serta Pajak.');
   }catch(e){toast(e.message,'error')}
   return;
  }
  const previous=db.config.qris;db.config.qris=img;if(save()){draw();toast('QRIS tersimpan pada browser ini.')}else db.config.qris=previous;
 };fr.readAsDataURL(file);
}

function importJson(file){if(window.INPOS_LOCAL_SERVER)return toast('Impor JSON ke database server tidak tersedia; gunakan migrasi dengan cadangan terverifikasi.','error');if(!file)return;if(file.size>3*1024*1024)return toast('File JSON maksimal 3 MB.','error');file.text().then(raw=>{let x=JSON.parse(raw);if(!valid(x))throw Error('Skema tidak valid');if(!Array.isArray(x.commissionPayouts))x.commissionPayouts=[];if(!Array.isArray(x.broadcasts))x.broadcasts=[];migrateCodes(x);formState.import=x;showSheet('Impor Cadangan','Konfirmasi ganti data',`<div class="notice">${I('alert',17)}<div>Impor akan <b>mengganti seluruh data</b> di browser ini termasuk mitra, tarif, QRIS, dan pembayaran. Data aktif tidak dapat dipulihkan kecuali telah diekspor.</div></div><div class="mini-box"><b>${x.tenants.length} mitra</b><br><span class="subtle">${x.payments.length} transaksi</span></div>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="import-confirm">Impor Data</button>`)}).catch(()=>toast('JSON tidak valid atau format tidak cocok','error'))}
function updateTenantResults(){let arr=db.tenants.filter(t=>{let s=tenantStatus(t);let sf=tenantFilter==='active'?['active','expiring'].includes(s):tenantFilter==='all'||s===tenantFilter;return sf&&[t.name,t.owner,t.code,t.wa,t.email,t.referral,t.subdomain].join(' ').toLowerCase().includes(tenantSearch.toLowerCase())}).sort((a,b)=>Number(a.code)-Number(b.code));if($('tenantList'))$('tenantList').innerHTML=arr.slice(0,tenantVisibleLimit).map(tCard).join('')||empty('Tidak ditemukan','Coba gunakan kata kunci lain.');const more=$('[data-action="tenant-more"]');if(more){more.hidden=arr.length<=tenantVisibleLimit;more.textContent='Tampilkan 50 lagi ('+Math.max(0,arr.length-tenantVisibleLimit)+' tersisa)'}}
function updatePaymentResults(){let arr=visiblePayments();const vacant=payTab==='none'?unbilledTenants():[];if($('paymentList'))$('paymentList').innerHTML=payTab==='none'?renderUnbilledTenants(vacant):arr.slice(0,payVisibleLimit).map(p=>pCard(p)).join('')||empty('Tidak ada transaksi','Coba ubah filter atau pencarian.');const more=$('[data-action="payment-more"]');if(more){const remain=(payTab==='none'?vacant.length-unbilledVisibleLimit:arr.length-payVisibleLimit);more.hidden=remain<=0;more.textContent='Tampilkan 50 lagi ('+Math.max(0,remain)+' tersisa)'}if($('paymentCount'))$('paymentCount').textContent=payTab==='none'?vacant.length+' mitra belum ada tagihan':arr.length+' transaksi';if($('paymentTotalBadge'))$('paymentTotalBadge').textContent=payTab==='none'?'Belum ada tagihan':'Total '+money(filteredPaymentNominal(arr))}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal)closeSheet()});

async function inposPaymentCleanupAsk(){
 if(!window.INPOS_LOCAL_SERVER)return toast('Pembersihan hanya tersedia di Super Admin yang terhubung server.','error');
 try{
  const r=await fetch('/api/admin/payments/cleanup-preview',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
  const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Gagal memeriksa pembayaran');
  showSheet('Bersihkan Pembayaran Menunggu','Tindakan Super Admin',`<p class="setting-help">Belum dikonfirmasi: <b>${num(d.draft)}</b> • Sudah dikonfirmasi: <b>${num(d.confirmed)}</b></p><div class="notice">Tagihan yang dibersihkan akan dipindahkan ke status Ditolak sebagai arsip audit, bukan dihapus secara permanen. <b>Jangan membatalkan pembayaran yang sudah ditransfer sebelum memeriksa mutasi QRIS.</b></div><label class="checklabel"><input type="checkbox" id="inposCleanupIncludeConfirmed"> Sertakan pembayaran yang sudah dikonfirmasi (berisiko sudah transfer)</label>`, `<button class="btn" data-action="close">Batal</button><button class="btn danger" data-action="payment-clear-confirm" data-revision="${Number(d.revision)}">Arsipkan Menunggu</button>`);
 }catch(e){toast(e.message,'error')}
}
async function inposPaymentCleanupConfirm(button){
 const all=!!document.getElementById('inposCleanupIncludeConfirmed')?.checked;
 const scope=all?'all':'draft',confirmText=all?'ARSIPKAN SEMUA MENUNGGU':'BERSIHKAN DRAFT';
 if(!window.confirm((all?'PERINGATAN: termasuk tagihan yang mungkin sudah dibayar. ':'')+'Lanjutkan mengarsipkan pembayaran '+(all?'SEMUA yang menunggu':'yang belum dikonfirmasi')+'? Riwayat tetap disimpan.'))return;
 button.disabled=true;
 try{
  const r=await fetch('/api/admin/payments/clear-pending',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-INPOS-Request':'1',Accept:'application/json'},body:JSON.stringify({scope,confirm:confirmText,revision:Number(button.dataset.revision)})});
  const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Gagal membersihkan');
  closeSheet();toast(d.archived+' tagihan diarsipkan; '+d.confirmed_archived+' sudah dikonfirmasi.');
  location.reload();
 }catch(e){button.disabled=false;toast(e.message,'error')}
}
document.addEventListener('click',e=>{if(e.target.id==='sheetBackdrop')closeSheet();let b=e.target.closest('[data-action]');if(!b)return;let a=b.dataset.action,id=b.dataset.id;switch(a){case'goto':if(id==='payments'&&view!=='payments')paymentSection='subscriptions';goto(id);break;case'nav-back':goBackMobile();break;case'payment-section':if(['subscriptions','referral'].includes(id)){paymentSection=id;draw()}break;case'close':closeSheet();break;case'notifications':refreshPinRequest();notifications();break;case'pin-request-list':showPinRequestList();break;case'pin-request-detail':showPinRequestDetail(id);break;case'pin-request-read':markPinRequest(id,'read');break;case'pin-request-reset':resetRequestedPin(id);break;case'pin-request-archive':markPinRequest(id,'archive');break;case'logout-ask':showSheet('Keluar Super Admin','Akhiri sesi',`<div class="info-line">Keluar dari panel? Data lokal tetap tersimpan di browser ini.</div>`,`<button class="btn" data-action="close">Batal</button><button class="btn primary" data-action="logout-confirm">Keluar</button>`);break;case'logout-confirm':fetch(window.INPOS_LOCAL_SERVER?'/api/admin/logout':'/api/auth/logout',{method:'POST',credentials:'same-origin',headers:{'X-INPOS-Request':'1'}}).finally(()=>{localStorage.removeItem('inpos_super_admin_subscriptions_demo_v3');try{sessionStorage.removeItem(INPOS_ADMIN_PAGE_KEY)}catch(_){}location.reload()});break;case'broadcast-open':broadcastOpen();break;case'broadcast-preview':broadcastPreview();break;case'broadcast-ask':broadcastAsk();break;case'broadcast-confirm':broadcastConfirm();break;case'broadcast-history':broadcastDetail(id);break;case'broadcast-remove-image':captureBroadcastDraft();broadcastDraft.image='';broadcastOpen();break;case'pending':paymentSection='subscriptions';payTab='pending';goto('payments');break;case'pay-history':paymentSection='subscriptions';payTab='approved';goto('payments');break;case'filter-tenant':tenantFilter=b.dataset.filter;goto('tenants');break;case'paytab':if(['all','pending','approved','rejected','none'].includes(id)){payTab=id;payVisibleLimit=50;unbilledVisibleLimit=50;draw()}break;case'tenant-more':tenantVisibleLimit+=50;draw();break;case'unified-add':addUnifiedDiscountRow();break;case'unified-remove':b.closest('.inpos-unified-row')?.remove();refreshUnifiedDiscountPreview();break;case'payment-more':if(payTab==='none')unbilledVisibleLimit+=50;else payVisibleLimit+=50;draw();break;case'pay-period':if(['all','day','month','year'].includes(id)){payPeriod=id;payVisibleLimit=50;draw()}break;case'add-tenant':if(window.INPOS_LOCAL_SERVER){location.href='/login';}else tenantForm();break;case'export-tenants':exportTenants();break;case'payment-clear-preview':inposPaymentCleanupAsk();break;case'payment-clear-confirm':inposPaymentCleanupConfirm(b);break;case'export-payments':exportPayments();break;case'sync-demo-now':if(window.INPOS_LOCAL_SERVER){location.reload();break}syncLocalRegistration();processTenantRequests();processTenantConfirmations();if(syncDemoPublicState()){draw();toast('Data lokal disinkronkan pada alamat browser yang sama.')}else toast('Sinkronisasi data lokal gagal. Periksa penyimpanan browser.','error');break;case'import-registration':importRegistrationAsk();break;case'import-registration-confirm':importRegistrationConfirm();break;case'edit-tenant':tenantForm(id);break;case'tenant-plan-edit':showTenantPlan(id);break;case'tenant-plan-save':submitTenantSubscription(id,'set_plan');break;case'tenant-renew':manualRenewalOpen(id);break;case'tenant-renew-confirm':submitTenantSubscription(id,'extend');break;case'password-reset-ask':passwordResetAsk(id);break;case'password-reset-send':sendPasswordReset(id);break;case'tenant-detail':tenantDetail(id);break;case'subdomain-validate-ask':subdomainValidationAsk(id);break;case'subdomain-validate-confirm':subdomainValidationConfirm(id);break;case'tenant-delete-ask':if(window.INPOS_LOCAL_SERVER){toast('Penghapusan permanen dinonaktifkan untuk melindungi data. Gunakan Tangguhkan.','error')}else tenantDeleteAsk(id);break;case'tenant-delete-confirm':tenantDeleteConfirm(id);break;case'tenant-payments':{const t=getTenant(id);if(t){payTab='all';payCategory='all';payPeriod='all';paySearch=t.name;paymentSection='subscriptions';closeSheet();goto('payments')}break;}case'payment-detail':paymentDetail(id);break;case'approve-ask':approveAsk(id);break;case'approve':onApprove(id);break;case'reject-ask':rejectAsk(id);break;case'reject':onReject(id);break;case'save-tenant':onFormTenant();break;case'toggle-suspend':askSuspend(id);break;case'suspend-confirm':{let t=getTenant(id);if(!t)return;const prior=JSON.stringify(db);t.suspended=!t.suspended;addNote('Status mitra diubah',t.name+' • '+(t.suspended?'Ditangguhkan':'Diaktifkan'));if(!save()){db=JSON.parse(prior);break}closeSheet();draw();toast('Status mitra diperbarui.');break}case'commission-history':commissionHistory(id);break;case'commission-ask':commissionAsk(id);break;case'commission-confirm':commissionConfirm(id);break;case'receipt':receipt(id);break;case'reset-ask':resetAsk();break;case'reset-do':resetAll();break;case'export-json':exportJson();break;case'import-json':if(window.INPOS_LOCAL_SERVER)toast('Impor JSON langsung ke server dinonaktifkan demi keamanan.','error');else $('importDataFile').click();break;case'import-confirm':{if(window.INPOS_LOCAL_SERVER){toast('Impor data server dinonaktifkan.','error');break}if(!valid(formState.import))return toast('Data impor tidak tersedia','error');const before=db,blocked=storageCorrupt;db=formState.import;storageCorrupt=false;if(!save()){db=before;storageCorrupt=blocked;break}delete formState.import;syncBroadcastFeed();closeSheet();goto('home');toast('Data cadangan berhasil diimpor.');break}case'save-merchant':saveMerchant();break;case'remove-qris':{const before=db.config.qris;db.config.qris='';if(!save()){db.config.qris=before;break}draw();toast('Gambar QRIS dihapus.');break;}}});
document.addEventListener('input',e=>{if(e.target.id==='broadcastTitle'||e.target.id==='broadcastBody'){captureBroadcastDraft();const count=$(e.target.id+'Count');if(count)count.textContent=e.target.value.length+'/'+(e.target.id==='broadcastTitle'?80:600)}else if(e.target.id==='tenantSearch'){tenantSearch=e.target.value;updateTenantResults()}else if(e.target.id==='paymentSearch'){paySearch=e.target.value;updatePaymentResults()}else if(e.target.matches('.unified-discount-value')){if(e.target.getAttribute('data-rupiah')!==null)formatNominalField(e.target);refreshUnifiedDiscountPreview()}else if(e.target.matches('.unified-commission')){formatNominalField(e.target);refreshUnifiedDiscountPreview()}else if(e.target.matches('.unified-month'))refreshUnifiedDiscountPreview();else if(e.target.matches('[data-rupiah]')){formatNominalField(e.target);if(['taxAnnualValue','taxYearlyPrice'].includes(e.target.id))updateTaxAnnualPreview()}else if(['taxAnnualValue','taxYearlyPrice'].includes(e.target.id))updateTaxAnnualPreview();else if(['referralPercent'].includes(e.target.id))referralPreview()});
document.addEventListener('blur',e=>{if(e.target.matches?.('[data-rupiah]'))formatNominalField(e.target)},true);
document.addEventListener('change',e=>{if(e.target.id==='broadcastImageUpload'){handleBroadcastImage(e.target.files[0]);e.target.value=''}else if(e.target.id==='tenantFilter'){tenantFilter=e.target.value;updateTenantResults()}else if(e.target.id==='renewPlanType'&&e.target.value==='annual'){$('renewMonths').value='12';$('renewMonths').step='12'}else if(e.target.id==='renewPlanType'){$('renewMonths').step='1'}else if(e.target.id==='payCategory'){payCategory=e.target.value;updatePaymentResults()}else if(e.target.id==='qrisUpload'){handleQris(e.target.files[0])}else if(e.target.id==='importDataFile'){importJson(e.target.files[0]);e.target.value=''}else if(e.target.id==='paymentPeriodValue'){let val=e.target.value;if(payPeriod==='day'&&/^\d{4}-\d{2}-\d{2}$/.test(val))payPeriodDate=val;else if(payPeriod==='month'&&/^\d{4}-\d{2}$/.test(val))payPeriodMonth=val;else if(payPeriod==='year'&&/^\d{4}$/.test(val))payPeriodYear=val;draw()}else if(e.target.matches('.unified-discount-mode'))changeUnifiedDiscountMode(e.target);else if(['unifiedPlansEnabled','unifiedCommissionEnabled'].includes(e.target.id))refreshUnifiedDiscountPreview();else if(e.target.id==='taxAnnualMode'){const el=$('taxAnnualValue');if(el){el.value='0';if(e.target.value==='fixed'){el.setAttribute('data-rupiah','');el.inputMode='numeric'}else{el.removeAttribute('data-rupiah');el.inputMode='decimal'}}updateTaxAnnualPreview()}});
document.addEventListener('submit',e=>{if(e.target.id==='unifiedDiscountForm'){e.preventDefault();saveUnifiedDiscountSettings()}else if(e.target.id==='inposAnnualForm'){e.preventDefault();saveAnnualForm()}else if(e.target.id==='inposTaxAnnualForm'){e.preventDefault();saveTaxAnnualForm()}else if(e.target.id==='settingsForm'){e.preventDefault();saveSettings()}else if(e.target.id==='cycleForm'){e.preventDefault();saveCycleSettings()}else if(e.target.id==='payoutSettingsForm'){e.preventDefault();savePayoutSettings()}else if(e.target.id==='tenantForm'){e.preventDefault();onFormTenant()}});
draw();
window.addEventListener('resize',renderMobileBack);
syncBroadcastFeed();
// Seeder awal diterbitkan untuk kasir. Registrasi/permintaan dapat datang saat panel tertutup.
if(!localStorage.getItem(KEY))save();else syncDemoPublicState();
syncLocalRegistration();
processTenantRequests();processTenantConfirmations();
refreshPinRequest();
window.addEventListener('storage',e=>{
 if(e.key===PIN_RESET_KEY)refreshPinRequest();
 else if(e.key===TENANT_REQUESTS_KEY)processTenantRequests();
 else if(e.key===TENANT_CONFIRMATIONS_KEY)processTenantConfirmations();
 else if(e.key===INPOS_REG_KEY)syncLocalRegistration();
 else if(e.key===KEY){db=load();syncDemoPublicState();draw()}
});
window.addEventListener('focus',()=>{syncLocalRegistration();processTenantRequests();processTenantConfirmations();refreshPinRequest()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncLocalRegistration();processTenantRequests();processTenantConfirmations();refreshPinRequest()}});
if(!PIN_RESET_DEMO)window.setInterval(()=>{if(!document.hidden)syncRemotePinRequests()},30000);
})();
