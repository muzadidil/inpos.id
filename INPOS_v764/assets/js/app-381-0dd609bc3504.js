
(function(){
'use strict';
const VERSION='INPOS v343 employee modules v7';
const LEGACY=['cashier','sales','stock','purchases','expenses','customers','reports','settings'];
const MODULES=[
{key:'cashier',group:'TRANSAKSI',title:'Kasir',sub:'Transaksi penjualan',legacy:'cashier',screens:['cashier','productpicker']},
{key:'sales',group:'TRANSAKSI',title:'Riwayat Transaksi',sub:'Riwayat, detail & retur',legacy:'sales',screens:['sales','sale-detail']},
{key:'shift',group:'TRANSAKSI',title:'Shift Kasir',sub:'Buka & tutup shift',legacy:'cashier',screens:['shift']},
{key:'cashier-sound',group:'TRANSAKSI',title:'Nada Kasir',sub:'Volume dan suara transaksi',legacy:'cashier'},
{key:'payments',group:'TRANSAKSI',title:'Pembayaran',sub:'Tunai, QRIS & lainnya',legacy:'settings',screens:['payments']},
{key:'sales-settings',group:'TRANSAKSI',title:'Pengaturan Penjualan',sub:'Data & pengiriman transaksi',legacy:'sales',screens:['sales-settings']},
{key:'purchases',group:'PEMBELIAN & KEUANGAN',title:'Pembelian',sub:'Barang masuk & pembelian',legacy:'purchases',screens:['purchases','purchase-form','purchase-detail']},
{key:'suppliers',group:'PEMBELIAN & KEUANGAN',title:'Supplier',sub:'Data pemasok',legacy:'purchases',screens:['suppliers']},
{key:'finance',group:'PEMBELIAN & KEUANGAN',title:'Keuangan',sub:'Pemasukan, pengeluaran & saldo',legacy:'expenses',screens:['finance']},
{key:'expenses',group:'PEMBELIAN & KEUANGAN',title:'Pengeluaran',sub:'Biaya operasional',legacy:'expenses',screens:['expenses']},
{key:'debts',group:'PEMBELIAN & KEUANGAN',title:'Piutang & Hutang',sub:'Tagihan pelanggan / supplier',legacy:'customers',screens:['debts']},
{key:'customers',group:'PELANGGAN',title:'Pelanggan',sub:'Data, poin & histori',legacy:'customers',screens:['customers']},
{key:'points-settings',group:'PELANGGAN',title:'Fitur Poin',sub:'Poin & hadiah pelanggan',legacy:'settings',screens:['points-settings']},
{key:'stock',group:'PRODUK & INVENTORI',title:'Produk & Stok',sub:'Produk, harga & persediaan',legacy:'stock',screens:['stock','productform']},
{key:'stock-data',group:'PRODUK & INVENTORI',title:'Data Stok',sub:'Nilai, status & mutasi',legacy:'stock',screens:['stock-data']},
{key:'stock-opname',group:'PRODUK & INVENTORI',title:'Stok Opname',sub:'Stok sistem & fisik',legacy:'stock',screens:['stock-opname']},
{key:'categories',group:'PRODUK & INVENTORI',title:'Kategori & Satuan',sub:'Kategori dan satuan produk',legacy:'stock',screens:['categories']},
{key:'labels',group:'PRODUK & INVENTORI',title:'Label & Barcode',sub:'Cetak label produk',legacy:'stock',screens:['labels']},
{key:'consignment',group:'PRODUK & INVENTORI',title:'Konsinyasi',sub:'Titipan, komisi & settlement',legacy:'stock',screens:['consignment']},
{key:'discount-settings',group:'PROMO & HARGA',title:'Setting Diskon',sub:'Diskon per produk',legacy:'sales',screens:['discount-settings']},
{key:'wholesale-settings',group:'PROMO & HARGA',title:'Grosir',sub:'Harga & minimum grosir',legacy:'sales',screens:['wholesale-settings']},
{key:'mass-price-settings',group:'PROMO & HARGA',title:'Harga Massal',sub:'Ubah banyak harga',legacy:'sales',screens:['mass-price-settings']},
{key:'bundle-settings',group:'PROMO & HARGA',title:'Bundling',sub:'Paket produk',legacy:'sales',screens:['bundle-settings']},

{key:'production',group:'FITUR TAMBAHAN',title:'Produksi',sub:'Resep, BOM & produksi',legacy:'stock',screens:['production']},
{key:'market-online',group:'FITUR TAMBAHAN',title:'Market Online',sub:'Web toko & pesanan',legacy:'settings',screens:['market-online']},
{key:'market-orders',group:'FITUR TAMBAHAN',title:'Pesanan Online',sub:'Pesanan dari Web Toko',legacy:'settings',screens:['market-orders']},
{key:'market-preview',group:'FITUR TAMBAHAN',title:'Preview Web Toko',sub:'Pratinjau katalog',legacy:'settings',screens:['market-preview']},
{key:'courier',group:'FITUR TAMBAHAN',title:'Kurir',sub:'Pengiriman & status antar',legacy:'settings',screens:['courier']},
{key:'reports',group:'LAPORAN',title:'Laporan',sub:'Penjualan & performa usaha',legacy:'reports',screens:['reports','report-general','report-cashflow','report-finance','report-detail']},
{key:'printer',group:'SISTEM & PENGATURAN',title:'Printer & Struk',sub:'Thermal 58/80 & struk',legacy:'settings',screens:['printer']},
{key:'notification-settings',group:'SISTEM & PENGATURAN',title:'Notifikasi',sub:'Pusat & pengaturan notifikasi',legacy:'settings',screens:['notifications','notification-settings']},
{key:'pwa',group:'SISTEM & PENGATURAN',title:'Fitur PWA',sub:'Instal aplikasi ke perangkat',legacy:'settings',accountType:'pwa'},
{key:'dashboard-menu',group:'SISTEM & PENGATURAN',title:'Menu Dashboard',sub:'Pilih menu halaman Home',legacy:'settings',accountType:'dashboard-menu'},
{key:'employee-admin',group:'SISTEM & PENGATURAN',title:'Karyawan & PIN',sub:'Akun, PIN & hak akses',legacy:'settings',accountType:'employee'},
{key:'referral',group:'SISTEM & PENGATURAN',title:'Program Referral',sub:'Kode, pengguna & reward',legacy:'settings',accountType:'referral'},
{key:'backup',group:'SISTEM & PENGATURAN',title:'Backup & Restore',sub:'Cadangkan & pulihkan data',legacy:'settings',accountType:'backup'},
{key:'settings',group:'SISTEM & PENGATURAN',title:'Pengaturan',sub:'Profil toko & aplikasi',legacy:'settings',accountType:'settings'},
{key:'about',group:'SISTEM & PENGATURAN',title:'About',sub:'Privasi & syarat penggunaan',legacy:'settings',screens:['about']}
];
const BY_KEY=Object.fromEntries(MODULES.map(m=>[m.key,m]));
const SCREEN_MAP={};MODULES.forEach(m=>(m.screens||[]).forEach(s=>SCREEN_MAP[s]=m.key));
const BASE_EMPLOYEE_CAN=window.employeeCan;
const BASE_SCREEN_ALLOWED=window.employeeScreenAllowed;
function moduleStore(){
db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
if(!db.settings.employeeModuleAccessV7||typeof db.settings.employeeModuleAccessV7!=='object'||Array.isArray(db.settings.employeeModuleAccessV7))db.settings.employeeModuleAccessV7={};
return db.settings.employeeModuleAccessV7;
}
function legacyDefault(role,key){
try{return!!employeeRoleDefaults(role)[key]}catch(e){
if(role==='owner')return true;
if(role==='supervisor')return key!=='settings';
return['cashier','sales','customers'].includes(key);
}
}
function accessFor(emp,moduleKey){
const m=BY_KEY[moduleKey];if(!m)return true;if(!emp)return false;if(emp.role==='owner')return true;
const p=emp.permissions&&typeof emp.permissions==='object'?emp.permissions:{};
if(Object.prototype.hasOwnProperty.call(p,moduleKey))return p[moduleKey]!==false;
if(Object.prototype.hasOwnProperty.call(p,m.legacy))return p[m.legacy]!==false;
return legacyDefault(emp.role,m.legacy);
}
function moduleDefaults(role){const out={};MODULES.forEach(m=>out[m.key]=role==='owner'?true:legacyDefault(role,m.legacy));return out}
function actionConfig(emp,roleOverride,accessOverride){
const role=roleOverride||emp?.role||'cashier',access=accessOverride||Object.fromEntries(MODULES.map(m=>[m.key,emp?accessFor(emp,m.key):(role==='owner'||legacyDefault(role,m.legacy))]));
const edit={},del={};
if(role==='owner'){MODULES.forEach(m=>{edit[m.key]=true;del[m.key]=true});return{edit,delete:del,showGrossProfit:true}}
const raw=emp?moduleStore()[String(emp.id)]||{}:{};
const old=emp?(db.settings?.employeeAccessV5?.[String(emp.id)]||{}):{};
MODULES.forEach(m=>{
const a=!!access[m.key];
edit[m.key]=a&&(raw.edit&&raw.edit[m.key]!==undefined?!!raw.edit[m.key]:(old.edit&&old.edit[m.legacy]!==undefined?!!old.edit[m.legacy]:(emp?a:(role==='supervisor'||['cashier','customers'].includes(m.key)))));
del[m.key]=a&&(raw.delete&&raw.delete[m.key]!==undefined?!!raw.delete[m.key]:(old.delete&&old.delete[m.legacy]!==undefined?!!old.delete[m.legacy]:(emp?a:false)));
});
const show=raw.showGrossProfit!==undefined?!!raw.showGrossProfit:(old.showGrossProfit!==undefined?!!old.showGrossProfit:role!=='cashier');
return{edit,delete:del,showGrossProfit:show};
}
function editorAccess(current,role){const out={};MODULES.forEach(m=>out[m.key]=current?accessFor(current,m.key):(role==='owner'||legacyDefault(role,m.legacy)));return out}
function escV7(v){try{return esc(String(v??''))}catch(e){return String(v??'')}}
function actionChip(type,key,on,disabled){const attr=type==='edit'?'data-employee-edit':'data-employee-delete';return`<button class="employee-action-chip-v5 ${on?'on':''}" type="button" ${attr}="${escV7(key)}" ${disabled?'disabled':''} onclick="toggleEmployeeActionV5(this,'${type}')">${type==='edit'?'Edit':'Hapus'}</button>`}
function rowHtml(m,access,role,cfg){
const owner=role==='owner',on=!!access[m.key];
return`<div class="employee-module-row-v7" data-employee-permission-row="${escV7(m.key)}" data-v556-group="${escV7(m.group)}"><div class="employee-module-copy-v7"><b>${escV7(m.title)}</b><small>${escV7(m.sub)}</small></div><div class="employee-module-access-v7"><button class="switch ${on?'on':''}" type="button" data-employee-permission="${escV7(m.key)}" ${owner?'disabled':''} onclick="toggleEmployeePermissionAccessV5(this)"></button><span class="employee-module-state-v7 ${on?'on':''}" data-module-state-v7>${on?'Aktif':'Nonaktif'}</span></div><div class="employee-module-actions-v7">${actionChip('edit',m.key,on&&!!cfg.edit[m.key],owner)}${actionChip('delete',m.key,on&&!!cfg.delete[m.key],owner)}</div></div>`;
}
function rowsHtml(access,role,cfg){
const owner=role==='owner',all=MODULES.every(m=>!!access[m.key]),allEdit=MODULES.every(m=>!access[m.key]||!!cfg.edit[m.key]),allDelete=MODULES.every(m=>!access[m.key]||!!cfg.delete[m.key]);
let html=`<div class="employee-module-row-v7 master"><div class="employee-module-copy-v7"><b>Semua Modul <span class="employee-module-count-v7">${MODULES.length}</span></b><small>Aktif/nonaktif semua menu</small></div><div class="employee-module-access-v7"><button class="switch ${all?'on':''}" type="button" data-employee-all-access ${owner?'disabled':''} onclick="toggleEmployeeAllAccessV5(this)"></button><span class="employee-module-state-v7 ${all?'on':''}" data-module-master-state-v7>${all?'Aktif':'Nonaktif'}</span></div><div class="employee-module-actions-v7"><button class="employee-action-chip-v5 ${allEdit?'on':''}" type="button" data-employee-all-edit ${owner?'disabled':''} onclick="toggleEmployeeAllActionV5('edit')">Bisa Edit</button><button class="employee-action-chip-v5 ${allDelete?'on':''}" type="button" data-employee-all-delete ${owner?'disabled':''} onclick="toggleEmployeeAllActionV5('delete')">Bisa Hapus</button></div></div>`;
let last='';MODULES.forEach(m=>{if(m.group!==last){last=m.group;html+=`<div class="employee-module-group-v7">${escV7(last)}</div>`}html+=rowHtml(m,access,role,cfg)});return html;
}
function syncMaster(){
const grid=document.getElementById('employeePermissionGrid');if(!grid)return;
const access=[...grid.querySelectorAll('[data-employee-permission]')],edit=[...grid.querySelectorAll('[data-employee-edit]')],del=[...grid.querySelectorAll('[data-employee-delete]')];
grid.querySelector('[data-employee-all-access]')?.classList.toggle('on',access.length>0&&access.every(x=>x.classList.contains('on')));
grid.querySelector('[data-employee-all-edit]')?.classList.toggle('on',edit.filter(x=>!x.disabled).every(x=>!x.closest('[data-employee-permission-row]')?.querySelector('[data-employee-permission]')?.classList.contains('on')||x.classList.contains('on')));
grid.querySelector('[data-employee-all-delete]')?.classList.toggle('on',del.filter(x=>!x.disabled).every(x=>!x.closest('[data-employee-permission-row]')?.querySelector('[data-employee-permission]')?.classList.contains('on')||x.classList.contains('on')));
const all=access.length>0&&access.every(x=>x.classList.contains('on')),state=grid.querySelector('[data-module-master-state-v7]');if(state){state.textContent=all?'Aktif':'Nonaktif';state.classList.toggle('on',all)}
access.forEach(btn=>{const on=btn.classList.contains('on'),state=btn.closest('[data-employee-permission-row]')?.querySelector('[data-module-state-v7]');if(state){state.textContent=on?'Aktif':'Nonaktif';state.classList.toggle('on',on)}});
if(typeof window.filterEmployeeModulesV556==='function')window.filterEmployeeModulesV556();
}
window.filterEmployeeModulesV556=function(){
const grid=document.getElementById('employeePermissionGrid');if(!grid)return;
const q=String(document.getElementById('employeeModuleSearchV556')?.value||'').trim().toLowerCase();
let group='';const seen=new Set();
grid.querySelectorAll('.employee-module-row-v7:not(.master)').forEach(row=>{
const match=!q||row.textContent.toLowerCase().includes(q);
row.hidden=!match;if(match)seen.add(row.getAttribute('data-v556-group')||'');
});
grid.querySelectorAll('.employee-module-group-v7').forEach(header=>{
group=(header.querySelector('.employee-module-group-title-v9')?.textContent||header.textContent).trim();header.hidden=!!q&&!seen.has(group);
});
const count=[...grid.querySelectorAll('[data-employee-permission]')].filter(x=>x.classList.contains('on')).length;
const sum=document.getElementById('employeeModuleSummaryV556');if(sum)sum.textContent=count+' dari '+grid.querySelectorAll('[data-employee-permission]').length+' modul aktif';
};
window.toggleEmployeePermissionAccessV5=function(btn){if(!btn||btn.disabled)return;const on=!btn.classList.contains('on');btn.classList.toggle('on',on);const row=btn.closest('[data-employee-permission-row]');if(!on)row?.querySelectorAll('[data-employee-edit],[data-employee-delete]').forEach(x=>x.classList.remove('on'));syncMaster()};
window.toggleEmployeeActionV5=function(btn,type){if(!btn||btn.disabled)return;const key=type==='edit'?btn.dataset.employeeEdit:btn.dataset.employeeDelete,on=!btn.classList.contains('on');btn.classList.toggle('on',on);if(on)document.querySelector(`#employeePermissionGrid [data-employee-permission="${CSS.escape(key)}"]`)?.classList.add('on');syncMaster()};
window.toggleEmployeeAllAccessV5=function(btn){if(!btn||btn.disabled)return;const grid=document.getElementById('employeePermissionGrid'),items=[...(grid?.querySelectorAll('[data-employee-permission]')||[])],on=!items.every(x=>x.classList.contains('on'));items.forEach(x=>x.classList.toggle('on',on));if(!on)grid?.querySelectorAll('[data-employee-edit],[data-employee-delete]').forEach(x=>x.classList.remove('on'));syncMaster()};
window.toggleEmployeeAllActionV5=function(type){const grid=document.getElementById('employeePermissionGrid'),sel=type==='edit'?'[data-employee-edit]':'[data-employee-delete]',items=[...(grid?.querySelectorAll(sel)||[])].filter(x=>!x.disabled),on=!items.filter(x=>x.closest('[data-employee-permission-row]')?.querySelector('[data-employee-permission]')?.classList.contains('on')).every(x=>x.classList.contains('on'));items.forEach(x=>{const access=x.closest('[data-employee-permission-row]')?.querySelector('[data-employee-permission]');if(on)access?.classList.add('on');x.classList.toggle('on',on)});syncMaster()};
window.renderEmployeeEditor=function(){
const current=accountSystemState.editingEmployeeId?employeeById(accountSystemState.editingEmployeeId):null,role=current?.role||'cashier',access=editorAccess(current,role),cfg=actionConfig(current,role,access),isActive=current?.active!==false;
accountSystemHeader(current?'Edit Karyawan':'Tambah Karyawan',current?'Akun, PIN & hak akses modul':'Buat akun karyawan');accountSystemToolbarAction(false);
const owners=employeeList().filter(x=>x.role==='owner').length,isLastOwner=current?.role==='owner'&&owners<=1,isCurrent=String(current?.id||'')===String(activeEmployee()?.id||''),owner=role==='owner';
return`<div class="account-system-section"><div class="account-system-section-title">DATA KARYAWAN</div><div class="account-system-card"><div class="account-system-card-body"><div class="employee-editor"><div class="employee-editor-grid"><div class="field full employee-field-name"><label>Nama Karyawan</label><input id="employeeName" value="${escV7(current?.name||'')}" placeholder="Contoh: Siti Aminah"></div><div class="employee-editor-pair-row"><div class="field employee-field-username"><label>Username</label><input id="employeeUsername" value="${escV7(current?.username||'')}" placeholder="Contoh: siti.aminah" autocapitalize="none" autocomplete="username" oninput="this.value=this.value.toLowerCase().replace(/\\s+/g,'').replace(/[^a-z0-9._-]/g,'')"></div><div class="field employee-field-phone"><label>Nomor WhatsApp</label><input id="employeePhone" inputmode="tel" value="${escV7(current?.phone||'')}" placeholder="08xxxxxxxxxx" autocomplete="tel"></div></div><div class="employee-editor-compact-row"><div class="field employee-field-role"><label>Role</label><select id="employeeRole" onchange="applyEmployeeRolePreset(this.value)"><option value="owner" ${role==='owner'?'selected':''}>Owner</option><option value="supervisor" ${role==='supervisor'?'selected':''}>Supervisor</option><option value="cashier" ${role==='cashier'?'selected':''}>Kasir</option></select></div><div class="field employee-field-pin"><label>PIN baru 5–6 digit</label><input id="employeePin" type="password" inputmode="numeric" maxlength="6" value="${escV7(current?.pin||'')}" placeholder="••••" autocomplete="new-password"></div><div class="field employee-field-status"><label>Status</label><select id="employeeStatus" ${isCurrent||isLastOwner?'disabled':''}><option value="active" ${isActive?'selected':''}>Aktif</option><option value="inactive" ${!isActive?'selected':''}>Nonaktif</option></select></div></div></div><div class="employee-account-note-v644"><b>Akun Login</b><span>Username/WhatsApp + PIN.</span></div><div><div class="account-system-section-title" style="padding:0 0 6px">HAK AKSES SEMUA MODUL</div><div class="employee-module-toolbar-v556"><input type="search" id="employeeModuleSearchV556" class="input" placeholder="Cari modul / menu..." oninput="filterEmployeeModulesV556()" autocomplete="off"><span id="employeeModuleSummaryV556" aria-live="polite">—</span></div><div class="employee-permissions-v7" id="employeePermissionGrid">${rowsHtml(access,role,cfg)}</div><div class="employee-gross-row-v5"><div><b>Tampil Laba Kotor</b><small>Lihat laba & margin transaksi.</small></div><div class="employee-gross-control-v5"><button id="employeeGrossToggleV5" class="switch ${cfg.showGrossProfit?'on':''}" type="button" ${owner?'disabled':''} onclick="toggleEmployeeGrossProfitV5(this)"></button><span class="employee-gross-state-v5" id="employeeGrossStateV5">${cfg.showGrossProfit?'Aktif':'Nonaktif'}</span></div></div></div><div class="account-system-note">Lihat = membuka modul • Edit = menambah/mengubah • Hapus = menghapus. Izin disimpan per karyawan; perubahan berlaku setelah menekan Simpan.</div><div class="account-system-actions employee-editor-actions">${current&&!isCurrent?'<button class="btn btn-danger employee-delete-btn" type="button" onclick="requestDeleteEmployee()">Hapus</button>':''}<button class="btn" type="button" onclick="cancelEmployeeEditor()">Batal</button><button class="btn btn-primary" type="button" onclick="saveEmployeeRecord()">Simpan</button></div><div id="employeeDeleteConfirm"></div></div></div></div></div>`;
};
try{renderEmployeeEditor=window.renderEmployeeEditor}catch(e){}
window.applyEmployeeRolePreset=function(role){const access=moduleDefaults(role),cfg=actionConfig(null,role,access),grid=document.getElementById('employeePermissionGrid');if(grid)grid.innerHTML=rowsHtml(access,role,cfg);const gross=document.getElementById('employeeGrossToggleV5'),state=document.getElementById('employeeGrossStateV5');if(gross){gross.classList.toggle('on',cfg.showGrossProfit);gross.disabled=role==='owner'}if(state)state.textContent=cfg.showGrossProfit?'Aktif':'Nonaktif';syncMaster()};
try{applyEmployeeRolePreset=window.applyEmployeeRolePreset}catch(e){}
function collectActionConfig(role){const edit={},del={};if(role==='owner'){MODULES.forEach(m=>{edit[m.key]=true;del[m.key]=true});return{edit,delete:del,showGrossProfit:true}}MODULES.forEach(m=>{const access=!!document.querySelector(`#employeePermissionGrid [data-employee-permission="${CSS.escape(m.key)}"]`)?.classList.contains('on');edit[m.key]=access&&!!document.querySelector(`#employeePermissionGrid [data-employee-edit="${CSS.escape(m.key)}"]`)?.classList.contains('on');del[m.key]=access&&!!document.querySelector(`#employeePermissionGrid [data-employee-delete="${CSS.escape(m.key)}"]`)?.classList.contains('on')});return{edit,delete:del,showGrossProfit:!!document.getElementById('employeeGrossToggleV5')?.classList.contains('on')}}
const baseSave=window.saveEmployeeRecord;
if(typeof baseSave==='function'&&!baseSave.__v7Modules){const wrapped=function(){const editingId=String(accountSystemState.editingEmployeeId||''),username=employeeUsernameKey(document.getElementById('employeeUsername')?.value||''),role=String(document.getElementById('employeeRole')?.value||'cashier'),cfg=collectActionConfig(role),before=employeeList().length;if(!accessFor(activeEmployee(),'employee-admin')||!actionAllowed('edit','employee-admin')){try{toast('Tidak memiliki izin Edit Karyawan & PIN.','error')}catch(e){};return}const r=baseSave.apply(this,arguments);const ok=accountSystemState.employeeMode==='list'&&(editingId?!!employeeById(editingId):employeeList().length>=before);if(ok){const row=editingId?employeeById(editingId):employeeList().find(e=>employeeUsernameKey(e.username)===username);if(row){moduleStore()[String(row.id)]=cfg;try{save()}catch(e){};syncEmployeeModuleMenusV7()}}return r};wrapped.__v7Modules=true;window.saveEmployeeRecord=wrapped;try{saveEmployeeRecord=wrapped}catch(e){}}
const originalRenderAccountSystemPageV556=window.renderAccountSystemPage;
if(typeof originalRenderAccountSystemPageV556==='function'&&!originalRenderAccountSystemPageV556.__v556AccessUI){
const wrapped=function(){const result=originalRenderAccountSystemPageV556.apply(this,arguments);if(accountSystemState?.type==='employee'&&accountSystemState?.employeeMode==='edit')window.filterEmployeeModulesV556?.();return result};
wrapped.__v556AccessUI=true;window.renderAccountSystemPage=wrapped;try{renderAccountSystemPage=wrapped}catch(e){}
}
const baseDelete=window.confirmDeleteEmployee;if(typeof baseDelete==='function'&&!baseDelete.__v7Modules){const wrapped=function(){const id=String(accountSystemState.editingEmployeeId||'');const r=baseDelete.apply(this,arguments);if(id&&!employeeById(id)){delete moduleStore()[id];try{save()}catch(e){}}return r};wrapped.__v7Modules=true;window.confirmDeleteEmployee=wrapped;try{confirmDeleteEmployee=wrapped}catch(e){}}
function moduleForScreen(screen){const s=String(screen||'');if(s==='dashboard'||s==='more')return null;if(s==='account-system'){if(db?.settings?.employeeLoggedOut)return null;const t=String(accountSystemState?.type||'employee');return({employee:'employee-admin','dashboard-menu':'dashboard-menu',pwa:'pwa',backup:'backup',settings:'settings',referral:'referral'})[t]||'employee-admin'}return SCREEN_MAP[s]||null}
window.employeeModuleForScreenV7=moduleForScreen;
window.employeeCanModuleV7=function(key){return accessFor(activeEmployee(),key)};
function groupAllowed(permission){const emp=activeEmployee();if(!emp)return false;if(emp.role==='owner')return true;const mods=MODULES.filter(m=>m.legacy===permission);if(mods.length)return mods.some(m=>accessFor(emp,m.key));return typeof BASE_EMPLOYEE_CAN==='function'?BASE_EMPLOYEE_CAN(permission):true}
window.employeeCan=function(permission){return LEGACY.includes(String(permission))?groupAllowed(String(permission)):(BY_KEY[String(permission)]?accessFor(activeEmployee(),String(permission)):(typeof BASE_EMPLOYEE_CAN==='function'?BASE_EMPLOYEE_CAN(permission):true))};
try{employeeCan=window.employeeCan}catch(e){}
window.employeeScreenAllowed=function(screen){if(db?.settings?.employeeLoggedOut&&String(screen)==='account-system')return true;const key=moduleForScreen(screen);if(key)return accessFor(activeEmployee(),key);return typeof BASE_SCREEN_ALLOWED==='function'?BASE_SCREEN_ALLOWED(screen):true};
try{employeeScreenAllowed=window.employeeScreenAllowed}catch(e){}
function currentModule(){return moduleForScreen(document.body?.dataset?.mobileScreen||document.querySelector('.screen.active')?.id?.replace(/^screen-/,''))}
function actionAllowed(kind,moduleKey){const emp=activeEmployee();if(!emp)return false;if(emp.role==='owner')return true;if(!accessFor(emp,moduleKey))return false;const raw=moduleStore()[String(emp.id)]||{},m=BY_KEY[moduleKey],old=db.settings?.employeeAccessV5?.[String(emp.id)]||{};if(kind==='edit'){if(raw.edit&&raw.edit[moduleKey]!==undefined)return!!raw.edit[moduleKey];if(old.edit&&m&&old.edit[m.legacy]!==undefined)return!!old.edit[m.legacy];return true}if(raw.delete&&raw.delete[moduleKey]!==undefined)return!!raw.delete[moduleKey];if(old.delete&&m&&old.delete[m.legacy]!==undefined)return!!old.delete[m.legacy];return true}
window.employeeCanEditV5=function(permission){const explicit=BY_KEY[String(permission)]?String(permission):null;const key=explicit||currentModule();return key?actionAllowed('edit',key):groupAllowed(String(permission))};
window.employeeCanDeleteV5=function(permission){const explicit=BY_KEY[String(permission)]?String(permission):null;const key=explicit||currentModule();return key?actionAllowed('delete',key):groupAllowed(String(permission))};
window.employeeCanActionModuleV556=function(moduleKey,kind){return!!BY_KEY[String(moduleKey)]&&actionAllowed(kind==='delete'?'delete':'edit',String(moduleKey))};
window.employeeCanViewGrossProfitV5=function(){const emp=activeEmployee();if(!emp)return false;if(emp.role==='owner')return true;const raw=moduleStore()[String(emp.id)]||{},old=db.settings?.employeeAccessV5?.[String(emp.id)]||{};return raw.showGrossProfit!==undefined?!!raw.showGrossProfit:(old.showGrossProfit!==undefined?!!old.showGrossProfit:emp.role!=='cashier')};
function moduleFromAction(action,id){const a=String(action||''),i=String(id||'');let m=a.match(/go\(['"]([^'"]+)['"]\)/);if(m){const k=moduleForScreen(m[1]);if(k)return k}if(/openCategoryManager/.test(a))return'categories';if(/openStockOpname/.test(a))return'stock-opname';if(/openLabels/.test(a))return'labels';if(/openConsignmentPage/.test(a))return'consignment';if(/openPrinter/.test(a))return'printer';if(/openNotificationSettings/.test(a))return'notification-settings';if(/openPWASettings/.test(a))return'pwa';if(/openDashboardMenu/.test(a))return'dashboard-menu';if(/openEmployeeModal/.test(a))return'employee-admin';if(/openReferralProgramV339/.test(a)||i==='referralProgramMenuV339')return'referral';if(/openBackupModal/.test(a))return'backup';if(/openSettings/.test(a))return'settings';if(/openProductModal/.test(a))return'stock';if(/openShiftModal|toggleShiftFeature/.test(a))return'shift';if(/toggleServiceProductFeature|toggleSKUFeature/.test(a))return'stock';if(/openCashierSoundSettingsV14|toggleCashierSound/.test(a))return'cashier-sound';if(/openMarketOrders/.test(a))return'market-orders';if(/openTodayActionFilter\(['"]low-stock|openTodayActionFilter\(['"]expiry/.test(a))return'stock';if(/openTodayActionFilter\(['"]overdue-debt/.test(a))return'debts';m=a.match(/(?:openOptionalFeature|toggleOptionalFeature)\(['"]([^'"]+)['"]\)/);if(m)return({production:'production',marketOnline:'market-online'})[m[1]]||null;return null}
function syncEmployeeModuleMenusV7(){
try{
document.querySelectorAll('[data-screen]').forEach(el=>{const key=moduleForScreen(el.dataset.screen);el.classList.toggle('employee-module-hidden-v7',!!key&&!accessFor(activeEmployee(),key))});
document.querySelectorAll('#screen-more .more-list-item,#screen-dashboard button,#mobileHuffaadzHome button').forEach(el=>{const key=moduleFromAction(el.getAttribute('onclick'),el.id);if(key)el.classList.toggle('employee-module-hidden-v7',!accessFor(activeEmployee(),key))});
document.querySelectorAll('#screen-more .more-section').forEach(sec=>{const btns=[...sec.querySelectorAll(':scope .more-list-item')];sec.classList.toggle('employee-module-hidden-v7',btns.length>0&&btns.every(b=>b.hidden||b.classList.contains('employee-module-hidden-v7')))});
}catch(e){console.warn(VERSION,'menu sync',e)}
}
window.syncEmployeeModuleMenusV7=syncEmployeeModuleMenusV7;
const baseDashAvailable=window.dashboardMenuItemAvailable;if(typeof baseDashAvailable==='function'&&!baseDashAvailable.__v7Modules){const wrapped=function(item){if(!baseDashAvailable.apply(this,arguments))return false;const key=moduleForScreen(item?.screen);return!key||accessFor(activeEmployee(),key)};wrapped.__v7Modules=true;window.dashboardMenuItemAvailable=wrapped;try{dashboardMenuItemAvailable=wrapped}catch(e){}}
function guard(name,keyResolver){const fn=window[name];if(typeof fn!=='function'||fn.__v7ModuleGuard)return;const wrapped=function(){const key=typeof keyResolver==='function'?keyResolver.apply(this,arguments):keyResolver;if(key&&!accessFor(activeEmployee(),key)){try{toast('Modul ini dinonaktifkan untuk karyawan aktif.','error')}catch(e){};return}return fn.apply(this,arguments)};wrapped.__v7ModuleGuard=true;window[name]=wrapped;try{eval(name+'=window["'+name+'"]')}catch(e){}}
guard('openCategoryManager','categories');guard('openStockOpname','stock-opname');guard('openLabels','labels');guard('openConsignmentPage','consignment');guard('openPrinter','printer');guard('openNotificationSettings','notification-settings');guard('openPWASettings','pwa');guard('openDashboardMenu','dashboard-menu');guard('openEmployeeModal','employee-admin');guard('openReferralProgramV339','referral');guard('openBackupModal','backup');guard('openSettings','settings');guard('openProductModal','stock');guard('openShiftModal','shift');guard('toggleShiftFeature','shift');guard('toggleServiceProductFeature','stock');guard('toggleSKUFeature','stock');guard('toggleCashierSound','cashier-sound');guard('openCashierSoundSettingsV14','cashier-sound');
guard('openOptionalFeature',function(k){return({production:'production',marketOnline:'market-online'})[String(k)]||null});
guard('toggleOptionalFeature',function(k){return({production:'production',marketOnline:'market-online'})[String(k)]||null});
const baseOpenAccountSystemV556=window.openAccountSystemPage;
if(typeof baseOpenAccountSystemV556==='function'&&!baseOpenAccountSystemV556.__v556SpecificAccess){
const guarded=function(type){
const next=String(type||'employee'),key=({employee:'employee-admin','dashboard-menu':'dashboard-menu',pwa:'pwa',backup:'backup',settings:'settings',referral:'referral'})[next]||'employee-admin';
if(!db?.settings?.employeeLoggedOut&&!accessFor(activeEmployee(),key)){try{toast('Akses modul ini tidak diizinkan untuk akun aktif.','error')}catch(e){};return}
return baseOpenAccountSystemV556.apply(this,arguments);
};
guarded.__v556SpecificAccess=true;window.openAccountSystemPage=guarded;try{openAccountSystemPage=guarded}catch(e){}
}
window.employeeV556ModuleKeys=MODULES.map(x=>x.key);
const baseSyncUI=window.syncActiveEmployeeUI;if(typeof baseSyncUI==='function'&&!baseSyncUI.__v7Modules){const wrapped=function(){const r=baseSyncUI.apply(this,arguments);syncEmployeeModuleMenusV7();return r};wrapped.__v7Modules=true;window.syncActiveEmployeeUI=wrapped;try{syncActiveEmployeeUI=wrapped}catch(e){}}
const baseRenderAll=window.renderAll;if(typeof baseRenderAll==='function'&&!baseRenderAll.__v7Modules){const wrapped=function(){const r=baseRenderAll.apply(this,arguments);setTimeout(syncEmployeeModuleMenusV7,0);return r};wrapped.__v7Modules=true;window.renderAll=wrapped;try{renderAll=wrapped}catch(e){}}
let timer=0;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(syncEmployeeModuleMenusV7,45)});
const employeeModuleHostsV7=[document.getElementById('screen-more'),document.getElementById('screen-dashboard'),document.getElementById('mobileHuffaadzHome')].filter(Boolean);
employeeModuleHostsV7.forEach(host=>obs.observe(host,{subtree:true,childList:true}));
function init(){try{moduleStore();syncEmployeeModuleMenusV7();if(typeof syncGrossProfitVisibilityV5==='function')syncGrossProfitVisibilityV5()}catch(e){console.warn(VERSION,'init',e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
