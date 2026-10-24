
const nominal=n=>Math.round(Number(n||0)).toLocaleString('id-ID',{minimumFractionDigits:0,maximumFractionDigits:0,useGrouping:true});
const stockQtyIntV227=v=>Math.max(0,Math.round(((Number(String(v??'').replace(',','.'))||0)+Number.EPSILON)*1000)/1000);
const stockQtyTextV227=v=>stockQtyIntV227(v).toLocaleString('id-ID',{minimumFractionDigits:0,maximumFractionDigits:3,useGrouping:true});
const rupiah=n=>((typeof db!=='undefined'&&db?.settings?.optionalFeatures?.showRupiah===false)?'':'Rp')+nominal(n);
function parseNominal(v){
if(typeof v==='number')return Number.isFinite(v)?v:0;
const raw=String(v??'').trim();if(!raw)return 0;
const cleaned=raw.replace(/[^\d.,-]/g,'').replace(/\./g,'').replace(',','.');
const n=Number(cleaned);return Number.isFinite(n)?n:0
}
function formatNominalInput(el){
if(!el)return;const digits=String(el.value??'').replace(/\D/g,'');
el.value=digits?Number(digits).toLocaleString('id-ID'):''
}
function setNominalInput(target,value){
const el=typeof target==='string'?document.getElementById(target):target;if(!el)return;
const n=Math.max(0,Math.round(Number(value)||0));el.value=n.toLocaleString('id-ID')
}
document.addEventListener('input',e=>{const el=e.target;if(el?.matches?.('input.nominal-input'))formatNominalInput(el)});
document.addEventListener('blur',e=>{const el=e.target;if(el?.matches?.('input.nominal-input'))setNominalInput(el,parseNominal(el.value))},true);
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));
const fmtDate=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'-':d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})};
const fmtTime=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'-':d.toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).replace('.',':')};
const dateKey=v=>{const d=v instanceof Date?v:new Date(v);if(Number.isNaN(d.getTime()))return'';return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const todayKey=()=>dateKey(new Date());
const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString()};
const futureDay=n=>{const d=new Date();d.setDate(d.getDate()+n);return dateKey(d)};
const pastDay=n=>{const d=new Date();d.setDate(d.getDate()-n);return dateKey(d)};
const sum=(a,fn)=>a.reduce((t,x)=>t+fn(x),0);
let uidStamp=0,uidSeq=0,numericUidLast=0;
const uid=p=>{const now=Date.now();if(now===uidStamp)uidSeq++;else{uidStamp=now;uidSeq=0}return`${String(p||'ID')}-${now.toString(36).toUpperCase()}-${uidSeq.toString(36).toUpperCase().padStart(2,'0')}`};
const numericUid=()=>{const now=Date.now();numericUidLast=Math.max(now,numericUidLast+1);return numericUidLast};
function localDateISO(value,fallback=todayKey()){const raw=String(value||fallback||'').trim(),d=new Date(`${raw}T12:00:00`);return Number.isNaN(d.getTime())?null:d.toISOString()}
function subdomainSlug(value){return String(value||'').toLowerCase().trim().replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,40)}
function storeSlug(value){return subdomainSlug(value)||'tokomu'}
function bundleExpiryISO(value,unit,base=new Date()){const d=new Date(base);if(Number.isNaN(d.getTime()))d.setTime(Date.now());const n=Math.max(1,Math.round(Number(value)||1));if(unit==='month')d.setMonth(d.getMonth()+n);else d.setDate(d.getDate()+n);return d.toISOString()}
function bundleIsExpired(b){if(!b?.expiresAt)return false;const t=new Date(b.expiresAt).getTime();return Number.isFinite(t)&&t<Date.now()}
function bundleDurationLabel(b){const n=Math.max(1,Math.round(Number(b?.durationValue)||1));return`${n} ${b?.durationUnit==='month'?'Bulan':'Hari'}`}
const seed={
categories:['Umum','Sembako','Makanan','Minuman','Kebutuhan'],
products:[
{id:1,name:'Beras Premium 1 Kg',barcode:'899100000001',category:'Sembako',emoji:'🌾',stock:28,min:8,cost:14500,price:16000,wholesale:15500,expiry:futureDay(120),sold:36,unit:'pcs'},
{id:2,name:'Minyak Goreng 1 L',barcode:'899100000002',category:'Sembako',emoji:'🫗',stock:7,min:10,cost:15400,price:17500,wholesale:16800,expiry:futureDay(170),sold:48,unit:'pcs'},
{id:3,name:'Gula Pasir 1 Kg',barcode:'899100000003',category:'Sembako',emoji:'🧂',stock:18,min:8,cost:15700,price:17500,wholesale:16900,expiry:futureDay(220),sold:31,unit:'pcs'},
{id:4,name:'Mie Instan Goreng',barcode:'899100000004',category:'Makanan',emoji:'🍜',stock:54,min:15,cost:2600,price:3500,wholesale:3200,expiry:futureDay(65),sold:92,unit:'pcs'},
{id:5,name:'Air Mineral 600ml',barcode:'899100000005',category:'Minuman',emoji:'💧',stock:42,min:12,cost:2200,price:3000,wholesale:2700,expiry:futureDay(200),sold:80,unit:'pcs'},
{id:6,name:'Kopi Sachet',barcode:'899100000006',category:'Minuman',emoji:'☕',stock:5,min:15,cost:1250,price:2000,wholesale:1700,expiry:futureDay(28),sold:76,unit:'pcs'},
{id:7,name:'Teh Celup 25s',barcode:'899100000007',category:'Minuman',emoji:'🍵',stock:11,min:6,cost:5200,price:6500,wholesale:6000,expiry:futureDay(95),sold:27,unit:'pcs'},
{id:8,name:'Sabun Mandi 80g',barcode:'899100000008',category:'Kebutuhan',emoji:'🧼',stock:16,min:7,cost:4100,price:5500,wholesale:5000,expiry:futureDay(400),sold:22,unit:'pcs'},
{id:9,name:'Telur Ayam / Butir',barcode:'899100000009',category:'Sembako',emoji:'🥚',stock:6,min:12,cost:1800,price:2200,wholesale:2000,expiry:futureDay(9),sold:67,unit:'butir'},
{id:10,name:'Susu UHT 250ml',barcode:'899100000010',category:'Minuman',emoji:'🥛',stock:19,min:8,cost:4800,price:6500,wholesale:6000,expiry:futureDay(48),sold:44,unit:'pcs'},
{id:11,name:'Biskuit Cokelat',barcode:'899100000011',category:'Makanan',emoji:'🍪',stock:3,min:8,cost:6100,price:8000,wholesale:7500,expiry:futureDay(19),sold:18,unit:'pcs'},
{id:12,name:'Deterjen Sachet',barcode:'899100000012',category:'Kebutuhan',emoji:'🧺',stock:30,min:10,cost:1600,price:2500,wholesale:2200,expiry:futureDay(365),sold:39,unit:'pcs'}
],
customers:[
{id:1,name:'Bu Sari',phone:'6281234567801',points:260,debt:128000,due:pastDay(2),spent:1640000,last:daysAgo(1)},
{id:2,name:'Pak Budi',phone:'6281234567802',points:145,debt:75000,due:futureDay(3),spent:980000,last:daysAgo(2)},
{id:3,name:'Mbak Rina',phone:'6281234567803',points:320,debt:0,due:null,spent:2310000,last:daysAgo(0)},
{id:4,name:'Pak Joko',phone:'6281234567804',points:80,debt:42000,due:futureDay(7),spent:540000,last:daysAgo(5)}
],
suppliers:[{id:1,name:'CV Sumber Makmur',phone:'6281333331001',address:'Malang'},{id:2,name:'UD Berkah Pangan',phone:'6281333331002',address:'Kepanjen'},{id:3,name:'Agen Sejahtera',phone:'6281333331003',address:'Batu'}],
employees:[{id:'EMP-OWNER',name:'Admin Toko',username:'admin',phone:'',role:'owner',pin:'1234',active:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true}},{id:'EMP-DEMO-V636',name:'Pengguna Demo',username:'demo',phone:'',role:'supervisor',pin:'1234',active:true,isLocalDemoV636:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:false}},{id:'EMP-OWNER-DEMO-V638',name:'Owner Demo INPOS',username:'ownerdemo',phone:'',role:'owner',pin:'1234',active:true,isLocalOwnerDemoV638:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true}}],
purchases:[
{id:'PB-260930-03',date:daysAgo(0),supplierId:1,items:12,total:740000,paid:740000},
{id:'PB-260928-02',date:daysAgo(2),supplierId:2,items:8,total:515000,paid:300000},
{id:'PB-260925-01',date:daysAgo(5),supplierId:3,items:15,total:960000,paid:960000}
],
expenses:[{id:1,date:daysAgo(0),category:'Listrik',note:'Token listrik toko',method:'Transfer',amount:100000},{id:2,date:daysAgo(1),category:'Operasional',note:'Plastik & kertas struk',method:'Tunai',amount:46500},{id:3,date:daysAgo(4),category:'Transport',note:'Ongkir belanja stok',method:'Tunai',amount:35000}],
sales:[
{id:'TRX-0930-005',date:daysAgo(0),customerId:3,method:'QRIS',total:84500,cost:69100,paid:84500,discount:0,note:'',items:[{productId:4,qty:10,price:3500},{productId:5,qty:5,price:3000},{productId:8,qty:3,price:5500},{productId:6,qty:9,price:2000}]},
{id:'TRX-0930-004',date:daysAgo(0),customerId:null,method:'Tunai',total:121000,cost:103000,paid:150000,discount:0,note:'',items:[{productId:1,qty:4,price:16000},{productId:2,qty:2,price:17500},{productId:3,qty:1,price:17500},{productId:5,qty:1.5,price:3000}]},
{id:'TRX-0930-003',date:daysAgo(0),customerId:1,method:'Bon',total:68000,cost:56100,paid:0,discount:0,note:'Jatuh tempo 7 hari',items:[{productId:1,qty:2,price:16000},{productId:4,qty:6,price:3500},{productId:6,qty:5,price:2000},{productId:9,qty:2,price:2200}]},
{id:'TRX-0929-002',date:daysAgo(1),customerId:2,method:'Tunai',total:156000,cost:130500,paid:160000,discount:0,note:'',items:[{productId:2,qty:4,price:17500},{productId:4,qty:8,price:3500},{productId:10,qty:6,price:6500},{productId:12,qty:7,price:2500}]},
{id:'TRX-0928-001',date:daysAgo(2),customerId:null,method:'Transfer',total:94000,cost:78200,paid:94000,discount:0,note:'',items:[{productId:3,qty:2,price:17500},{productId:7,qty:5,price:6500},{productId:11,qty:2,price:8000},{productId:8,qty:2,price:5500}]},
{id:'TRX-0926-001',date:daysAgo(4),customerId:4,method:'Tunai',total:132500,cost:109900,paid:150000,discount:0,note:'',items:[{productId:1,qty:3,price:16000},{productId:5,qty:10,price:3000},{productId:10,qty:4,price:6500},{productId:4,qty:5,price:3500}]},
{id:'TRX-0925-001',date:daysAgo(5),customerId:null,method:'QRIS',total:78500,cost:64200,paid:78500,discount:0,note:'',items:[{productId:6,qty:10,price:2000},{productId:4,qty:10,price:3500},{productId:12,qty:5,price:2500},{productId:8,qty:2,price:5500}]}
],
shifts:[{id:1,date:daysAgo(1),cashier:'Admin Toko',expected:821500,counted:820000,diff:-1500}],
cashEntries:[],
debtEntries:[],
debtPayments:[],
supplierDebtPayments:[],
pointRedemptions:[],
bundles:[],
notifications:[],
settings:{store:'Toko Berkah',address:'Jl. Contoh No. 10, Malang',phone:'0812-0000-0000',cashier:'Admin Toko',activeEmployeeId:'EMP-OWNER',employeeLoggedOut:false,openingCash:250000,receiptWidth:'58',autoPrint:false,cashDrawerEnabled:false,receiptFields:{storeName:true,storeAddress:true,storePhone:true,transactionNumber:true,dateTime:true,cashier:true,customer:true,orderService:true,itemNote:true,transactionNote:true,shipping:true,payment:true,footer:true},cashierSound:true,serviceProducts:false,skuEnabled:false,optionalFeatures:{production:false,marketOnline:false,courier:false,showRupiah:true},shiftEnabled:false,ppn:{enabled:false,rate:11},points:{enabled:false,mode:'global',globalPoints:1,productPoints:{},rewards:[{id:'RWD-1',name:'Hadiah Contoh',points:100}],expiryValue:12,expiryUnit:'month'},marketOnline:{subdomain:'toko-berkah',showStock:true,showOrderButton:true},production:{items:[],logs:[]},notifications:{stock:true,expiry:true,transactions:true,market:true,browser:false},salesFeatures:{wholesaleEnabled:false,wholesaleMinQty:10,wholesaleDurationValue:30,wholesaleDurationUnit:'day',wholesaleStartsAt:null,wholesaleExpiresAt:null,wholesaleBonusRules:[]},theme:'light',cashierView:'grid',footer:'Terima kasih telah berbelanja',dashboardView:{summary:true,chart:true,quick:true,bottom:true},dashboardMenu:['debts','stock','stock-data','purchases','customers','finance'],pwa:{enabled:true},printer:{type:'system',name:'Printer Sistem',connected:false,ip:'192.168.1.100',port:9100},salesConfig:{transactionPrefix:'TRX'},payments:{default:'Tunai',methods:{Tunai:true,QRIS:true,Transfer:true,Bon:true},qrisImage:'',transferAccounts:[]}},
holds:[]
};
/* INPOS v642 — Data demo memiliki ruang penyimpanan TERPISAH. */
const INPOS_V642_DEMO_MODE_KEY='inpos_v642_demo_mode';
const INPOS_V642_DEMO_DATA_KEY='inpos_v642_demo_sandbox_data';
function inposV642IsDemoWorkspace(){try{return sessionStorage.getItem(INPOS_V642_DEMO_MODE_KEY)==='1'}catch(_e){return false}}
function inposV642EffectiveStorageKey(key){return key==='myposid_demo_v3'&&inposV642IsDemoWorkspace()?INPOS_V642_DEMO_DATA_KEY:key}
function storageGet(key){try{return window.localStorage?.getItem(inposV642EffectiveStorageKey(key))||null}catch(e){return null}}
function storageSet(key,value){try{const storage=window.localStorage;if(!storage||typeof storage.setItem!=='function')return false;storage.setItem(inposV642EffectiveStorageKey(key),value);return true}catch(e){return false}}
function inposV642ExitDemo(){
 if(!inposV642IsDemoWorkspace())return;
 // Kembali ke dataset asli TANPA menghapus dan mengubah data transaksi.
 try{sessionStorage.removeItem(INPOS_V642_DEMO_MODE_KEY)}catch(_e){}
 location.reload();
}
function normalizeDB(data){
const out=data&&typeof data==='object'?data:structuredClone(seed);
const arrays=['products','customers','suppliers','employees','purchases','expenses','sales','shifts','cashEntries','debtEntries','debtPayments','supplierDebtPayments','pointRedemptions','holds','bundles','notifications'];
arrays.forEach(k=>{if(!Array.isArray(out[k]))out[k]=[]});
out.settings={...structuredClone(seed.settings),...(out.settings&&typeof out.settings==='object'?out.settings:{})};
out.settings.theme=out.settings.theme==='dark'?'dark':'light';
out.settings.skuEnabled=!!out.settings.skuEnabled;out.settings.printer={...structuredClone(seed.settings.printer),...(out.settings.printer&&typeof out.settings.printer==='object'?out.settings.printer:{})};out.settings.receiptWidth=['58','80'].includes(String(out.settings.receiptWidth))?String(out.settings.receiptWidth):'58';out.settings.cashDrawerEnabled=!!out.settings.cashDrawerEnabled;out.settings.receiptFields={...structuredClone(seed.settings.receiptFields),...(out.settings.receiptFields&&typeof out.settings.receiptFields==='object'?out.settings.receiptFields:{})};Object.keys(seed.settings.receiptFields).forEach(k=>out.settings.receiptFields[k]=out.settings.receiptFields[k]!==false);delete out.settings.productCode;out.settings.salesConfig={...structuredClone(seed.settings.salesConfig),...(out.settings.salesConfig&&typeof out.settings.salesConfig==='object'?out.settings.salesConfig:{})};out.settings.salesConfig.transactionPrefix=String(out.settings.salesConfig.transactionPrefix||'TRX').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)||'TRX';
out.settings.payments={...structuredClone(seed.settings.payments),...(out.settings.payments&&typeof out.settings.payments==='object'?out.settings.payments:{})};out.settings.payments.qrisImage=typeof out.settings.payments.qrisImage==='string'?out.settings.payments.qrisImage:'';const legacyTransfer=out.settings.payments.transfer&&typeof out.settings.payments.transfer==='object'?out.settings.payments.transfer:null;out.settings.payments.transferAccounts=Array.isArray(out.settings.payments.transferAccounts)?out.settings.payments.transferAccounts.filter(a=>a&&typeof a==='object').map((a,i)=>({id:String(a.id||('BANK-'+(i+1))),bank:String(a.bank||''),accountNumber:String(a.accountNumber||''),accountName:String(a.accountName||'')})):[];if(!out.settings.payments.transferAccounts.length&&legacyTransfer?.accountNumber)out.settings.payments.transferAccounts.push({id:'BANK-MIGRATED',bank:String(legacyTransfer.bank||''),accountNumber:String(legacyTransfer.accountNumber||''),accountName:String(legacyTransfer.accountName||'')});delete out.settings.payments.transfer;out.settings.payments.customMethods=[...new Set((Array.isArray(out.settings.payments.customMethods)?out.settings.payments.customMethods:[]).map(x=>String(x||'').trim()).filter(x=>x&&!['Tunai','QRIS','Transfer','Bon'].includes(x)).slice(0,12))];out.settings.payments.methods={...structuredClone(seed.settings.payments.methods),...(out.settings.payments.methods&&typeof out.settings.payments.methods==='object'?out.settings.payments.methods:{})};['Tunai','QRIS','Transfer','Bon'].forEach(k=>out.settings.payments.methods[k]=out.settings.payments.methods[k]!==false);out.settings.payments.customMethods.forEach(k=>out.settings.payments.methods[k]=out.settings.payments.methods[k]!==false);const normalizedPaymentNames=['Tunai','QRIS','Transfer','Bon',...out.settings.payments.customMethods];if(!normalizedPaymentNames.includes(out.settings.payments.default)||!out.settings.payments.methods[out.settings.payments.default])out.settings.payments.default=normalizedPaymentNames.find(k=>out.settings.payments.methods[k])||'Tunai';
out.settings.dashboardView={summary:true,chart:true,quick:true,bottom:true,...(out.settings.dashboardView&&typeof out.settings.dashboardView==='object'?out.settings.dashboardView:{})};
const dashboardMenuValid=['debts','stock','stock-data','purchases','customers','finance','shift','suppliers','productform','stock-opname','consignment','payments','points-settings','discount-settings','coupon-promo','wholesale-settings','mass-price-settings','bundle-settings','categories','labels','ppn-settings','production','market-online','courier','notification-settings','employee','backup','settings','about'];
const dashboardMenuRaw=Array.isArray(out.settings.dashboardMenu)?out.settings.dashboardMenu:structuredClone(seed.settings.dashboardMenu);out.settings.dashboardMenu=[...new Set(dashboardMenuRaw.map(String).filter(k=>dashboardMenuValid.includes(k)))];
out.settings.pwa={enabled:true,...(out.settings.pwa&&typeof out.settings.pwa==='object'?out.settings.pwa:{})};out.settings.pwa.enabled=out.settings.pwa.enabled!==false;
out.settings.optionalFeatures={production:false,marketOnline:false,courier:false,showRupiah:true,...(out.settings.optionalFeatures&&typeof out.settings.optionalFeatures==='object'?out.settings.optionalFeatures:{})};out.settings.optionalFeatures.production=!!out.settings.optionalFeatures.production;out.settings.optionalFeatures.marketOnline=!!out.settings.optionalFeatures.marketOnline;out.settings.optionalFeatures.courier=!!out.settings.optionalFeatures.courier;out.settings.optionalFeatures.showRupiah=out.settings.optionalFeatures.showRupiah!==false;
out.settings.shiftEnabled=out.settings.shiftEnabled!==false;if(out.settings.currentShift&&typeof out.settings.currentShift==='object'){out.settings.currentShift={id:String(out.settings.currentShift.id||uid('SHIFT')),openedAt:out.settings.currentShift.openedAt||new Date().toISOString(),openingCash:Math.max(0,Number(out.settings.currentShift.openingCash)||0),cashier:String(out.settings.currentShift.cashier||out.settings.cashier||'Kasir'),note:String(out.settings.currentShift.note||'')}}else if(out.settings.currentShift!==null){const start=new Date();start.setHours(8,0,0,0);out.settings.currentShift={id:'SHIFT-MIGRATED',openedAt:start.toISOString(),openingCash:Math.max(0,Number(out.settings.openingCash)||0),cashier:String(out.settings.cashier||'Kasir'),note:''}}out.settings.ppn={enabled:false,rate:11,...(out.settings.ppn&&typeof out.settings.ppn==='object'?out.settings.ppn:{})};out.settings.ppn.enabled=!!out.settings.ppn.enabled;out.settings.ppn.rate=Math.max(0,Math.min(100,Number(out.settings.ppn.rate)||11));out.settings.points={enabled:false,mode:'global',globalPoints:1,productPoints:{},rewards:[],expiryValue:12,expiryUnit:'month',...(out.settings.points&&typeof out.settings.points==='object'?out.settings.points:{})};out.settings.points.enabled=out.settings.points.enabled!==false;out.settings.points.mode=out.settings.points.mode==='manual'?'manual':'global';out.settings.points.globalPoints=Math.max(0,Math.round(Number(out.settings.points.globalPoints)||0));out.settings.points.expiryValue=Math.max(1,Math.min(120,Math.round(Number(out.settings.points.expiryValue)||12)));out.settings.points.expiryUnit=out.settings.points.expiryUnit==='year'?'year':'month';if(!out.settings.points.productPoints||typeof out.settings.points.productPoints!=='object'||Array.isArray(out.settings.points.productPoints))out.settings.points.productPoints={};Object.keys(out.settings.points.productPoints).forEach(k=>out.settings.points.productPoints[k]=Math.max(0,Math.round(Number(out.settings.points.productPoints[k])||0)));out.settings.points.rewards=(Array.isArray(out.settings.points.rewards)?out.settings.points.rewards:[]).filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||('RWD-'+(i+1))),name:String(x.name||'Hadiah'),points:Math.max(1,Math.round(Number(x.points)||1))}));out.pointRedemptions=(Array.isArray(out.pointRedemptions)?out.pointRedemptions:[]).filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||('RDM-'+(i+1))),date:x.date||new Date().toISOString(),customerId:Number(x.customerId),rewardId:String(x.rewardId||''),rewardName:String(x.rewardName||'Hadiah'),points:Math.max(1,Math.round(Number(x.points)||1)),cashier:String(x.cashier||out.settings.cashier||'Kasir')})).slice(0,100);
out.settings.production={items:[],logs:[],...(out.settings.production&&typeof out.settings.production==='object'?out.settings.production:{})};if(!Array.isArray(out.settings.production.items))out.settings.production.items=[];if(!Array.isArray(out.settings.production.logs))out.settings.production.logs=[];out.settings.production.items=out.settings.production.items.filter(x=>x&&typeof x==='object').map(x=>({productId:Number(x.productId),mode:x.mode==='direct'?'direct':'produce',ingredients:(Array.isArray(x.ingredients)?x.ingredients:[]).filter(i=>i&&typeof i==='object').map(i=>({productId:Number(i.productId),qty:Math.max(.01,Number(i.qty)||1)}))}));out.settings.production.logs=out.settings.production.logs.filter(x=>x&&typeof x==='object').map(x=>({id:String(x.id||uid('PRD')),time:x.time||new Date().toISOString(),productId:Number(x.productId),qty:Math.max(.01,Number(x.qty)||1),hpp:Math.max(0,Number(x.hpp)||0)})).slice(0,50);
out.settings.marketOnline={subdomain:storeSlug(out.settings.store),showStock:true,showOrderButton:true,...(out.settings.marketOnline&&typeof out.settings.marketOnline==='object'?out.settings.marketOnline:{})};out.settings.marketOnline.subdomain=storeSlug(out.settings.marketOnline.subdomain||out.settings.store);out.settings.marketOnline.showStock=out.settings.marketOnline.showStock!==false;out.settings.marketOnline.showOrderButton=out.settings.marketOnline.showOrderButton!==false;
out.settings.notifications={stock:true,expiry:true,transactions:true,market:true,browser:false,...(out.settings.notifications&&typeof out.settings.notifications==='object'?out.settings.notifications:{})};['stock','expiry','transactions','market','browser'].forEach(k=>out.settings.notifications[k]=!!out.settings.notifications[k]);
out.settings.salesFeatures={wholesaleEnabled:false,wholesaleMinQty:10,wholesaleDurationValue:30,wholesaleDurationUnit:'day',wholesaleStartsAt:null,wholesaleExpiresAt:null,wholesaleBonusRules:[],...(out.settings.salesFeatures&&typeof out.settings.salesFeatures==='object'?out.settings.salesFeatures:{})};
delete out.settings.salesFeatures.discountEnabled;delete out.settings.salesFeatures.discountType;delete out.settings.salesFeatures.discountValue;
out.settings.salesFeatures.wholesaleEnabled=!!out.settings.salesFeatures.wholesaleEnabled;
out.settings.salesFeatures.wholesaleMinQty=Math.max(2,Math.round(Number(out.settings.salesFeatures.wholesaleMinQty)||10));out.settings.salesFeatures.wholesaleDurationValue=Math.max(1,Math.round(Number(out.settings.salesFeatures.wholesaleDurationValue)||30));out.settings.salesFeatures.wholesaleDurationUnit=out.settings.salesFeatures.wholesaleDurationUnit==='month'?'month':'day';if(!out.settings.salesFeatures.wholesaleStartsAt)out.settings.salesFeatures.wholesaleStartsAt=new Date().toISOString();if(!out.settings.salesFeatures.wholesaleExpiresAt)out.settings.salesFeatures.wholesaleExpiresAt=bundleExpiryISO(out.settings.salesFeatures.wholesaleDurationValue,out.settings.salesFeatures.wholesaleDurationUnit,out.settings.salesFeatures.wholesaleStartsAt);out.settings.salesFeatures.wholesaleBonusRules=(Array.isArray(out.settings.salesFeatures.wholesaleBonusRules)?out.settings.salesFeatures.wholesaleBonusRules:[]).filter(r=>r&&typeof r==='object').map((r,i)=>({id:String(r.id||('WBG-'+(i+1))),buyProductId:Number(r.buyProductId),buyQty:Math.max(1,Math.round(Number(r.buyQty)||1)),bonusProductId:Number(r.bonusProductId),bonusQty:Math.max(1,Math.round(Number(r.bonusQty)||1))}));
if(typeof out.settings.cashierSound!=='boolean')out.settings.cashierSound=true;
out.settings.serviceProducts=!!out.settings.serviceProducts;
if(!['grid','list'].includes(out.settings.cashierView))out.settings.cashierView='list';
if(!['58','80'].includes(String(out.settings.receiptWidth)))out.settings.receiptWidth='58';else out.settings.receiptWidth=String(out.settings.receiptWidth);
const employeePermKeys=['cashier','sales','stock','purchases','expenses','customers','reports','settings'];
const employeeRoleDefaults={owner:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true},supervisor:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:false},cashier:{cashier:true,sales:true,stock:false,purchases:false,expenses:false,customers:true,reports:false,settings:false}};
if(!out.employees.length)out.employees=[{id:'EMP-OWNER',name:String(out.settings.cashier||'Admin Toko'),username:'admin',phone:'',role:'owner',pin:'1234',active:true,permissions:{...employeeRoleDefaults.owner}}];
out.employees=out.employees.filter(e=>e&&typeof e==='object').map((e,i)=>{const role=['owner','supervisor','cashier'].includes(String(e.role))?String(e.role):'cashier',base=employeeRoleDefaults[role],raw=e.permissions&&typeof e.permissions==='object'?e.permissions:{};const permissions={};employeePermKeys.forEach(k=>permissions[k]=role==='owner'?true:(raw[k]!==undefined?!!raw[k]:!!base[k]));const name=String(e.name||('Karyawan '+(i+1))),username=String(e.username||name).toLowerCase().trim().replace(/\s+/g,'.').replace(/[^a-z0-9._-]/g,'').replace(/^[._-]+|[._-]+$/g,'').slice(0,30)||('user'+(i+1));return{id:String(e.id||('EMP-'+(i+1))),name,username,phone:String(e.phone||''),role,pin:String(e.pin||'').replace(/\D/g,'').slice(0,6),active:e.active!==false,permissions}});
const usedEmployeeUsernames=new Set();out.employees.forEach((e,i)=>{const base=String(e.username||('user'+(i+1))).toLowerCase();let candidate=base,n=2;while(usedEmployeeUsernames.has(candidate)){candidate=(base.slice(0,26)||'user')+'.'+n;n++}e.username=candidate;usedEmployeeUsernames.add(candidate)});
out.settings.employeeLoggedOut=!!out.settings.employeeLoggedOut;let activeEmployee=out.employees.find(e=>String(e.id)===String(out.settings.activeEmployeeId)&&e.active);if(!activeEmployee)activeEmployee=out.employees.find(e=>e.active)||out.employees[0];out.settings.activeEmployeeId=activeEmployee?.id||'';if(activeEmployee?.name&&!out.settings.employeeLoggedOut)out.settings.cashier=activeEmployee.name;
out.categories=[...new Set(['Umum',...(Array.isArray(out.categories)?out.categories:[]),...out.products.map(p=>p?.category).filter(Boolean),...(out.settings.optionalFeatures.production?['Bahan']:[]),...(out.settings.serviceProducts?['Jasa']:[])])];
out.units=[...new Set(['pcs',...(Array.isArray(out.units)?out.units:[]),...out.products.map(p=>p?.unit).filter(Boolean),...(out.settings.serviceProducts?['layanan']:[])])];
// v694: migrasi sekali agar Box/Dus/Karton tersedia pada sakelar Ecer (tanpa mengubah stok).
if(out.settings?.multiUnitsV684?.enabled===true&&out.settings.multiUnitsV684.unitsSeededV694!==true){
  for(const pack of ['Box','Dus','Karton'])if(!out.units.some(unit=>String(unit).trim().toLowerCase()===pack.toLowerCase()))out.units.push(pack);
  out.settings.multiUnitsV684.unitsSeededV694=true;
}
out.products=out.products.filter(p=>p&&typeof p==='object').map((p,i)=>{p.id=Number.isFinite(Number(p.id))?Number(p.id):i+1;p.name=String(p.name||'Produk');p.sku=String(p.sku||p.productCode||'').trim().toUpperCase();delete p.productCode;p.barcode=String(p.barcode||'');p.ean13=String(p.ean13||'').replace(/\D/g,'').slice(0,13);p.category=p.category||'Umum';p.unit=p.unit||'pcs';p.stock=Math.max(0,Number(p.stock)||0);p.min=Math.max(0,Number(p.min)||0);p.cost=Math.max(0,Number(p.cost)||0);p.price=Math.max(0,Number(p.price)||0);p.wholesale=Math.max(0,Number(p.wholesale)||0);p.wholesaleMinQty=Number(p.wholesaleMinQty)>0?Math.max(2,Math.round(Number(p.wholesaleMinQty))):0;if(typeof p.wholesaleConfigured!=='boolean')p.wholesaleConfigured=false;p.discountType=['percent','nominal'].includes(p.discountType)?p.discountType:'percent';p.discountValue=Math.max(0,Number(p.discountValue)||0);if(p.discountType==='percent')p.discountValue=Math.min(100,p.discountValue);if(typeof p.discountConfigured!=='boolean')p.discountConfigured=p.discountValue>0;if(typeof p.discountActive!=='boolean')p.discountActive=true;if(p.wholesaleConfigured)p.discountConfigured=false;p.sold=Math.max(0,Number(p.sold)||0);if(typeof p.hasExpiry!=='boolean')p.hasExpiry=!!p.expiry;if(!p.hasExpiry)p.expiry=null;if(!Array.isArray(p.variants)||!p.variants.length)p.variants=['Default'];p.variants=[...new Set(p.variants.map(v=>String(v||'').trim()).filter(Boolean))];if(!p.variants.length)p.variants=['Default'];if(!p.variantCosts||typeof p.variantCosts!=='object'||Array.isArray(p.variantCosts))p.variantCosts={};const normalizedVariantCosts={};p.variants.forEach(v=>normalizedVariantCosts[v]=Math.max(0,Number(p.variantCosts[v])||0));p.variantCosts=normalizedVariantCosts;if(typeof p.noStock!=='boolean')p.noStock=String(p.productKind||'').toLowerCase()==='service'||String(p.category||'').trim().toLowerCase()==='jasa';if(typeof p.variantsEnabled!=='boolean')p.variantsEnabled=!(p.variants.length===1&&p.variants[0]==='Default');if(typeof p.manualPrice!=='boolean')p.manualPrice=false;if(!Array.isArray(p.barcodes))p.barcodes=[];p.barcodes=[...new Set(p.barcodes.map(v=>String(v||'').trim()).filter(Boolean))].filter(v=>v!==p.barcode);if(typeof p.multiBarcodeEnabled!=='boolean')p.multiBarcodeEnabled=p.barcodes.length>0;if(!p.variantsEnabled){p.variants=['Default'];p.variantCosts={Default:0}}return p});
out.products.forEach(p=>{const rawKind=String(p.productKind||'').toLowerCase();p.productKind=['product','service'].includes(rawKind)?rawKind:(String(p.category||'').trim().toLocaleLowerCase('id-ID')==='jasa'?'service':'product');if(p.productKind==='service'){p.hasExpiry=false;p.expiry=null;p.productionType='nonproduction'}});
out.customers=out.customers.filter(c=>c&&typeof c==='object').map((c,i)=>{const exp=c.pointsExpiresAt&&Number.isFinite(new Date(c.pointsExpiresAt).getTime())?new Date(c.pointsExpiresAt).toISOString():null;return{...c,id:Number.isFinite(Number(c.id))?Number(c.id):i+1,name:String(c.name||'Pelanggan'),phone:String(c.phone||''),points:Math.max(0,Number(c.points)||0),pointsExpiresAt:exp,debt:Math.max(0,Number(c.debt)||0),spent:Math.max(0,Number(c.spent)||0)}});
out.suppliers=out.suppliers.filter(s=>s&&typeof s==='object').map((s,i)=>({...s,id:Number.isFinite(Number(s.id))?Number(s.id):i+1,name:String(s.name||'Supplier'),phone:String(s.phone||''),address:String(s.address||'')}));
out.sales=out.sales.filter(s=>s&&typeof s==='object'&&Array.isArray(s.items)).map(s=>({...s,id:String(s.id||uid('TRX')),date:s.date||new Date().toISOString(),method:String(s.method||'Tunai'),total:Math.max(0,Number(s.total)||0),cost:Math.max(0,Number(s.cost)||0),paid:Math.max(0,Number(s.paid)||0),discount:Math.max(0,Number(s.discount)||0),fee:Math.max(0,Number(s.fee)||0),feeNote:String(s.feeNote||''),tax:Math.max(0,Number(s.tax)||0),taxRate:Math.max(0,Number(s.taxRate)||0),pointsEarned:s.pointsEarned==null?null:Math.max(0,Math.round(Number(s.pointsEarned)||0)),note:String(s.note||''),shippingAddress:String(s.shippingAddress||''),shippingNote:String(s.shippingNote||''),paymentDetail:s.paymentDetail&&typeof s.paymentDetail==='object'?{...s.paymentDetail,bank:String(s.paymentDetail.bank||''),accountNumber:String(s.paymentDetail.accountNumber||''),accountName:String(s.paymentDetail.accountName||'')}:null,returned:!!s.returned,items:s.items.filter(x=>x&&typeof x==='object').map(x=>({...x,productId:Number(x.productId),qty:Math.max(.5,Number(x.qty)||1),price:Math.max(0,Number(x.price)||0),itemFee:Math.max(0,Number(x.itemFee)||0),variant:String(x.variant||''),note:String(x.note||'')}))}));
out.purchases=out.purchases.filter(x=>x&&typeof x==='object').map((x,i)=>{const draft=!!x.draft||String(x.status||'').toLowerCase()==='draft',subtotal=Math.max(0,Number(x.subtotal??x.total)||0),taxRate=Math.max(0,Number(x.taxRate)||0),tax=Math.max(0,Number(x.tax)||0),total=Math.max(0,Number(x.total)||(subtotal+tax)||0),lines=Array.isArray(x.lines)?x.lines.filter(r=>r&&typeof r==='object').map(r=>({...r,productId:Number(r.productId),qty:Math.max(0,Number(r.qty)||0),cost:Math.max(0,Number(r.cost)||0),subtotal:Math.max(0,Number(r.subtotal??((Number(r.qty)||0)*(Number(r.cost)||0)))||0)})):[];return{...x,id:String(x.id||`PB-${i+1}`),date:x.date||new Date().toISOString(),supplierId:Number(x.supplierId)||null,items:draft?Math.max(0,Number(x.items)||sum(lines,r=>Number(r.qty)||0)):Math.max(1,Number(x.items)||sum(lines,r=>Number(r.qty)||0)||1),subtotal,taxRate,tax,taxActive:!!x.taxActive,total,paid:draft?Math.max(0,Number(x.paid)||0):Math.max(0,Math.min(total,Number(x.paid)||0)),draft,status:draft?'draft':String(x.status||'completed'),stockApplied:draft?false:x.stockApplied!==false,lines};});
out.expenses=out.expenses.filter(x=>x&&typeof x==='object').map((x,i)=>({...x,id:Number.isFinite(Number(x.id))?Number(x.id):i+1,date:x.date||new Date().toISOString(),category:String(x.category||'Operasional'),note:String(x.note||''),method:String(x.method||'Tunai'),amount:Math.max(0,Number(x.amount)||0)}));
out.cashEntries=out.cashEntries.filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||`CASH-${i+1}`),date:x.date||new Date().toISOString(),direction:x.direction==='out'?'out':'in',category:String(x.category||'Lainnya'),note:String(x.note||''),method:String(x.method||'Tunai'),amount:Math.max(0,Number(x.amount)||0),source:String(x.source||'manual'),sourceId:String(x.sourceId||'')})).filter(x=>x.amount>0);
out.debtEntries=out.debtEntries.filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||`BON-${i+1}`),date:x.date||new Date().toISOString(),customerId:Number(x.customerId)||null,amount:Math.max(0,Number(x.amount)||0),note:String(x.note||'Piutang manual'),due:x.due||null})).filter(x=>x.customerId&&x.amount>0);
out.debtPayments=out.debtPayments.filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||`DPAY-${i+1}`),date:x.date||new Date().toISOString(),customerId:Number(x.customerId)||null,amount:Math.max(0,Number(x.amount)||0),method:String(x.method||'Tunai'),balanceBefore:Math.max(0,Number(x.balanceBefore)||0),balanceAfter:Math.max(0,Number(x.balanceAfter)||0),cashEntryId:String(x.cashEntryId||''),note:String(x.note||'Cicilan piutang')})).filter(x=>x.customerId&&x.amount>0);
out.supplierDebtPayments=out.supplierDebtPayments.filter(x=>x&&typeof x==='object').map((x,i)=>({id:String(x.id||`SPAY-${i+1}`),date:x.date||new Date().toISOString(),purchaseId:String(x.purchaseId||''),supplierId:Number(x.supplierId)||null,amount:Math.max(0,Number(x.amount)||0),method:String(x.method||'Tunai'),balanceBefore:Math.max(0,Number(x.balanceBefore)||0),balanceAfter:Math.max(0,Number(x.balanceAfter)||0),cashEntryId:String(x.cashEntryId||''),note:String(x.note||'Cicilan hutang')})).filter(x=>x.purchaseId&&x.amount>0);
out.shifts=out.shifts.filter(x=>x&&typeof x==='object').map((x,i)=>{const expected=Math.max(0,Number(x.expected)||0),counted=Math.max(0,Number(x.counted)||0);return{...x,id:x.id??i+1,date:x.date||new Date().toISOString(),cashier:String(x.cashier||out.settings.cashier||'Kasir'),expected,counted,diff:counted-expected}});
out.bundles=out.bundles.filter(b=>b&&typeof b==='object').map((b,i)=>{const durationValue=Math.max(1,Math.round(Number(b.durationValue)||30)),durationUnit=['day','month'].includes(b.durationUnit)?b.durationUnit:'day',startsAt=b.startsAt||new Date().toISOString(),expiresAt=b.expiresAt||bundleExpiryISO(durationValue,durationUnit,startsAt);return{id:Number.isFinite(Number(b.id))?Number(b.id):i+1,name:String(b.name||`Bundling ${i+1}`),price:Math.max(0,Number(b.price)||0),active:b.active!==false,durationValue,durationUnit,startsAt,expiresAt,items:(Array.isArray(b.items)?b.items:[]).filter(x=>x&&typeof x==='object').map(x=>({productId:Number(x.productId),qty:Math.max(.5,Number(x.qty)||1)}))}}).filter(b=>b.items.length);
out.holds=out.holds.filter(x=>x&&typeof x==='object'&&Array.isArray(x.cart)).map(x=>({...x,id:String(x.id||uid('HOLD')),time:x.time||new Date().toISOString(),discount:Math.max(0,Number(x.discount)||0),selectedCustomerId:x.selectedCustomerId??null,transactionNote:String(x.transactionNote||''),cart:x.cart.filter(i=>i&&typeof i==='object').map(i=>({...i,productId:Number(i.productId),qty:Math.max(.5,Number(i.qty)||1),price:Math.max(0,Number(i.price)||0),itemFee:Math.max(0,Number(i.itemFee)||0),variant:String(i.variant||''),note:String(i.note||'')}))}));
// INPOS v743: migrasi fitur ke sakelar tunggal tanpa menghapus data aturan lama.
const v743=out.settings.optionalFeatures;
if(typeof v743.consignment!=='boolean')v743.consignment=!!(out.consignments?.length||out.consignors?.length||out.consignmentSettlements?.length);
if(typeof v743.bundling!=='boolean')v743.bundling=Array.isArray(out.bundles)&&out.bundles.length>0;
if(typeof v743.points!=='boolean')v743.points=out.settings.points?.enabled===true;
if(typeof v743.wholesale!=='boolean')v743.wholesale=out.settings.salesFeatures?.wholesaleEnabled===true;
if(typeof v743.discount!=='boolean')v743.discount=out.products.some(p=>p.discountConfigured===true&&p.discountActive!==false)||(out.settings.enableManualSaleDiscountV529===true)||(out.sales||[]).some(x=>Number(x.manualDiscount)>0);
out.settings.points.enabled=v743.points;
out.settings.salesFeatures.wholesaleEnabled=v743.wholesale;
out.notifications=out.notifications.filter(n=>n&&typeof n==='object').map((n,i)=>({id:String(n.id||`NTF-${Date.now()}-${i}`),type:['stock','expiry','transaction','market','system'].includes(n.type)?n.type:'system',title:String(n.title||'Notifikasi'),message:String(n.message||''),time:n.time||new Date().toISOString(),read:!!n.read,actionScreen:String(n.actionScreen||''),actionId:n.actionId??null,key:String(n.key||'')})).slice(0,100);
return out
}
function loadDB(){
 try{
  const raw=storageGet('myposid_demo_v3');
  if(inposV642IsDemoWorkspace()){
   // Sandbox disiapkan dari seed bawaan, bukan salinan data usaha aktif.
   const example=normalizeDB(raw?JSON.parse(raw):structuredClone(seed));
   if(!raw)example.settings.store='INPOS DEMO';
   example.settings.inposLocalSampleV641=true;
   delete example.settings.inposRegistrationV632;
   return example;
  }
  return normalizeDB(raw?JSON.parse(raw):structuredClone(seed));
 }catch(e){
  const fallback=normalizeDB(structuredClone(seed));
  if(inposV642IsDemoWorkspace()){fallback.settings.store='INPOS DEMO';fallback.settings.inposLocalSampleV641=true;delete fallback.settings.inposRegistrationV632;}
  return fallback;
 }
}

/* INPOS v633: pilihan sesi pada perangkat; login tetap diverifikasi dengan PIN. */
const INPOS_DEVICE_LOGIN_KEY_V633='inpos_device_login_v633';
function inposV642DeviceLoginKey(){return INPOS_DEVICE_LOGIN_KEY_V633+(inposV642IsDemoWorkspace()?'_sandbox':'')}
function inposV633RestoreDeviceSession(data){
 // Fail-closed: tidak ada atau rusaknya penanda sesi tidak boleh otomatis masuk.
 // Simpan data transaksi apa adanya; hanya status autentikasi yang dibatalkan.
 if(data?.settings)data.settings.employeeLoggedOut=true;
 try{
  const raw=localStorage.getItem(inposV642DeviceLoginKey());if(!raw)return;
  const record=JSON.parse(raw);
  if(!record||record.v!==1||!['remember','session'].includes(record.mode)||!record.employeeId)return;
  const current=String(data?.settings?.activeEmployeeId||'');
  const found=(Array.isArray(data?.employees)?data.employees:[]).some(e=>String(e.id)===record.employeeId&&e.active!==false);
  let allowed=record.employeeId===current&&found;
  if(record.mode==='session'){
   let tabId='';try{tabId=sessionStorage.getItem(inposV642DeviceLoginKey())||''}catch(_e){}
   allowed=allowed&&tabId===record.employeeId;
  }
  // Status login tab terpisah tidak boleh membatalkan sesi tab yang sah.
  data.settings.employeeLoggedOut=!allowed;
 }catch(err){console.warn('INPOS v633 sesi perangkat:',err);if(data?.settings)data.settings.employeeLoggedOut=true;}
}
function inposV633SaveDeviceChoice(employeeId,remember){
 const id=String(employeeId||'');if(!id)return false;
 try{
  if(remember){
   localStorage.setItem(inposV642DeviceLoginKey(),JSON.stringify({v:1,mode:'remember',employeeId:id}));
   try{sessionStorage.removeItem(inposV642DeviceLoginKey())}catch(_e){}
  }else{
   // Sesuaikan hanya untuk tab ini; browser baru akan meminta login ulang.
   sessionStorage.setItem(inposV642DeviceLoginKey(),id);
   localStorage.setItem(inposV642DeviceLoginKey(),JSON.stringify({v:1,mode:'session',employeeId:id}));
  }
  return true;
 }catch(err){console.warn('INPOS v633 gagal menyimpan pilihan sesi:',err);return false;}
}
function inposV633ForgetDevice(){
 try{localStorage.removeItem(inposV642DeviceLoginKey())}catch(_e){}
 try{sessionStorage.removeItem(inposV642DeviceLoginKey())}catch(_e){}
}
/* INPOS v636 — Akun demonstrasi lokal, hanya pada dataset yang belum didaftarkan. */
function inposV636EnsureDemoUser(data){
 if(!data||!data.settings||!Array.isArray(data.employees))return false;
 // Jangan menambahkan kredensial umum ke usaha yang sudah registrasi.
 if(!inposV638IsDemoDataset(data)){
  // Bersihkan akun supervisor demo bawaan lama jika data berubah menjadi usaha sebenarnya.
  // Normalisasi versi lama menghapus isLocalDemoV636. Identifikasi melalui ID internal khusus.
  data.employees=data.employees.filter(e=>!(String(e?.id)==='EMP-DEMO-V636'&&String(e.username||'').toLowerCase()==='demo'&&String(e.pin)==='1234'));
  return false;
 }
 // Jangan menimpa nama akun 'demo' yang sudah dipilih pengguna.
 if(data.employees.some(e=>String(e.id)==='EMP-DEMO-V636'||String(e.username||'').trim().toLowerCase()==='demo'))return false;
 data.employees.push({id:'EMP-DEMO-V636',name:'Pengguna Demo',username:'demo',phone:'',role:'supervisor',pin:'1234',active:true,isLocalDemoV636:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:false}});
 return true;
}
/* INPOS v638 — Owner demo untuk dataset bawaan pengujian, tidak untuk usaha registrasi. */
function inposV638IsDemoDataset(data){
 if(!data||!data.settings||!Array.isArray(data.employees))return false;
 const st=data.settings;
 // v641: nama toko dan checklist dapat diubah pada DATA CONTOH; keduanya bukan bukti registrasi.
 // Registrasi usaha selalu memblokir akun demo, termasuk jika marker lama tersisa.
 if(st.inposRegistrationV632?.registered===true||st.inposLocalSampleV641===false)return false;
 // Marker hanya dicatat untuk dataset yang telah dikenali sebagai contoh bawaan.
 if(st.inposLocalSampleV641===true)return true;
 const seedOwner=data.employees.find(e=>e&&String(e.id)==='EMP-OWNER');
 // Migrasi aman untuk dataset contoh lama: Owner seed harus masih utuh.
 // Nama toko TIDAK menjadi syarat karena dapat diganti di menu Pengaturan.
 if(seedOwner&&String(seedOwner.username||'').toLowerCase()==='admin'&&String(seedOwner.pin)==='1234'&&seedOwner.role==='owner'&&seedOwner.active!==false)return true;
 // Dataset lama dengan akun demo pernah dibuat tetap dikenali ketika Owner seed
 // diubah, asalkan nama toko masih contoh dan identitas akun demo tidak berubah.
 const sampleStore=['Toko Berkah','INPOS'].includes(String(st.store||'').trim());
 const knownDemo=data.employees.some(e=>e&&String(e.id)==='EMP-OWNER-DEMO-V638'&&String(e.username||'').toLowerCase()==='ownerdemo'&&String(e.pin)==='1234'&&e.role==='owner');
 return sampleStore&&knownDemo;
}
function inposV638EnsureOwnerDemo(data){
 if(!inposV638IsDemoDataset(data)){
  // Akun bawaan demo tidak boleh tinggal di usaha yang sudah dikonfigurasi.
  if(Array.isArray(data?.employees))data.employees=data.employees.filter(e=>!(String(e.id)==='EMP-OWNER-DEMO-V638'&&String(e.username)==='ownerdemo'&&String(e.pin)==='1234'));
  return false;
 }
 if(data.employees.some(e=>String(e.id)==='EMP-OWNER-DEMO-V638'||String(e.username||'').toLowerCase()==='ownerdemo'))return false;
 data.employees.push({id:'EMP-OWNER-DEMO-V638',name:'Owner Demo INPOS',username:'ownerdemo',phone:'',role:'owner',pin:'1234',active:true,isLocalOwnerDemoV638:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true}});
 return true;
}
function inposV638OwnerDemoAvailable(){
 return inposV638IsDemoDataset(db) && employeeList().some(e=>String(e.id)==='EMP-OWNER-DEMO-V638'&&e.active!==false&&e.role==='owner'&&e.username==='ownerdemo'&&String(e.pin)==='1234');
}
let db=loadDB();
// Cap data contoh yang jelas asalnya; tidak mengubah data transaksi atau data usaha.
if(inposV638IsDemoDataset(db)&&db.settings.inposLocalSampleV641!==true)db.settings.inposLocalSampleV641=true;
inposV636EnsureDemoUser(db);inposV638EnsureOwnerDemo(db);
(function inposV651ConsumeHandoff(){
 try{
  const raw=sessionStorage.getItem('inpos_v651_handoff');
  if(!raw)return;
  sessionStorage.removeItem('inpos_v651_handoff');
  const h=JSON.parse(raw);
  const user=Array.isArray(db.employees)&&db.employees.find(e=>e&&e.id===h.employeeId&&e.active!==false);
  const allowed=h.demo===true&&inposV642IsDemoWorkspace()&&['EMP-DEMO-V636','EMP-OWNER-DEMO-V638'].includes(h.employeeId)&&user&&inposV638IsDemoDataset(db);
  if(!allowed)return;
  db.settings.activeEmployeeId=user.id;db.settings.cashier=user.name;db.settings.employeeLoggedOut=false;
  if(!save()||!inposV633SaveDeviceChoice(user.id,!!h.remember)){
    db.settings.employeeLoggedOut=true;inposV633ForgetDevice();
    location.reload();
  }
 }catch(error){console.warn('INPOS v651 login handoff:',error);location.reload();}
})();
inposV633RestoreDeviceSession(db);if(db.settings?.serviceProducts)ensureServiceProductDefaults();
let cart=[],discount=0,activeCategory='Semua',selectedCustomerId=null,transactionNote='',paymentMethod='Tunai',selectedTransferAccountId=null,paymentFee=0,paymentFeeNote='',paymentPPNActive=false;
let usbDevice=null,bleDevice=null,bleCharacteristic=null,bleReconnectPromise=null,bleAutoReconnectTimer=null;
let cashierAudioContext=null;
let stockScanStream=null,stockBarcodeDetector=null,stockScanTimer=null,stockScanBusy=false,stockScannerMode='stock-search';
let productionEditorDraft=null;
let editingBundleId=null,wholesaleCategoryFilterValue='';
let bundleDraftState=null,bundleDraftKey='';
let massPriceState={category:'Semua',target:'price',method:'percent_up',value:0,valueMode:'percent'};
let aboutActiveTab='privacy';
function setAboutTab(tab='privacy'){
aboutActiveTab=tab==='terms'?'terms':'privacy';
const privacyTab=document.getElementById('aboutPrivacyTab'),termsTab=document.getElementById('aboutTermsTab'),privacyDoc=document.getElementById('aboutPrivacyDoc'),termsDoc=document.getElementById('aboutTermsDoc');
const isPrivacy=aboutActiveTab==='privacy';
privacyTab?.classList.toggle('active',isPrivacy);termsTab?.classList.toggle('active',!isPrivacy);
privacyTab?.setAttribute('aria-selected',String(isPrivacy));termsTab?.setAttribute('aria-selected',String(!isPrivacy));
if(privacyDoc)privacyDoc.hidden=!isPrivacy;if(termsDoc)termsDoc.hidden=isPrivacy;
const page=document.getElementById('screen-about');if(page){page.scrollTop=0;const shell=page.querySelector('.about-shell');if(shell)shell.scrollTop=0}
}
const pageMeta={'stock-waste':['Sampah Produk','Riwayat produk kadaluarsa yang dibuang'],dashboard:['Beranda','Ringkasan aktivitas toko hari ini'],cashier:['Kasir','Scan, pilih produk, lalu proses pembayaran'],productpicker:['Pilih Produk','Pilih produk untuk transaksi'],productform:['Tambah Produk','Buat produk baru dan atur stok awal'],sales:['Riwayat Transaksi','Penjualan, retur, dan cetak ulang struk'],debts:['Piutang Pelanggan','Tagihan pelanggan yang belum lunas'],stock:['Produk & Stok','Pantau harga, stok, dan masa berlaku'],'stock-data':['Data Stok','Ringkasan, nilai, status, dan mutasi persediaan'],'stock-opname':['Stok Opname','Cocokkan stok sistem & fisik'],purchases:['Pembelian','Pembelian stok, supplier & hutang supplier'],'purchase-form':['Pembelian Produk','Catat barang masuk dari supplier'],'purchase-detail':['Detail Pembelian','Rincian produk dan pembayaran pembelian'],expenses:['Pengeluaran','Catat biaya operasional toko'],shift:['Shift Kasir','Cocokkan kas laci dan penjualan tunai'],customers:['Pelanggan','Data pelanggan, poin, histori & piutang'],suppliers:['Supplier','Pemasok dalam menu Pembelian'],reports:['Laporan','Laporan penjualan, keuangan & performa usaha'],finance:['Keuangan','Kelola pemasukan, pengeluaran, saldo & mutasi usaha'],'report-general':['Laporan Umum','Grafik, arus uang, penjualan, pembelian, dan retur'],'report-cashflow':['Arus Kas','Kas masuk, keluar & saldo usaha'],'report-finance':['Laporan Keuangan','Pengeluaran, pemasukan, dan saldo usaha'],'report-detail':['Laporan','Rincian laporan'],more:['Menu','Fitur tambahan dan pengaturan'],'account-system':['Akun, Data & Sistem','Pengaturan akun, data, dan aplikasi'],'discount-settings':['Setting Diskon','Diskon per produk'],'wholesale-settings':['Grosir','Atur harga dan minimum pembelian grosir'],'mass-price-settings':['Setting Harga Masal','Ubah harga banyak produk sekaligus'],'bundle-settings':['Bundling','Kelola paket penjualan produk'],production:['Produksi','Resto, Cafe, Booth, dan Industri'],'market-online':['Market Online','Web Toko & pesanan'],'market-orders':['Pesanan Online','Kelola pesanan yang masuk dari Web Toko'],'market-preview':['Preview Web Toko','Pratinjau katalog Market Online'],courier:['Kurir','Pengiriman dan status antar'],notifications:['Pusat Notifikasi','Peringatan dan aktivitas penting toko'],'notification-settings':['Pengaturan Notifikasi','Atur jenis pemberitahuan INPOS'],categories:['Kategori & Satuan','Kelola kategori dan satuan produk'],'sale-detail':['Detail Transaksi','Rincian transaksi dan pembayaran'],printer:['Printer & Struk','Atur printer thermal dan format struk'],payments:['Pembayaran','Atur metode pembayaran kasir'],'sales-settings':['Penjualan','Pengaturan data transaksi dan pengiriman'],labels:['Label & Barcode','Cetak label & barcode produk'],'points-settings':['Fitur Poin','Atur poin & hadiah pelanggan'],'ppn-settings':['Pajak','Atur PPN di modul Pajak'],about:['About','Kebijakan Privasi dan Syarat & Ketentuan']};
function save(){const ok=storageSet('myposid_demo_v3',JSON.stringify(db));const s=document.getElementById('syncBadge');if(s)s.textContent=ok?'Data tersimpan':'Mode lokal sementara';return ok}
// INPOS v705: indikator sukses ringan pada topbar untuk produk yang ditambahkan ke transaksi.
let inposAddedTimerV705=null;
function inposProductAddedTopbarV705(message){
  const visible=el=>!!el&&!!el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
  const candidates=[
    document.querySelector('#screen-purchase-form.active .mobile-purchase-header-tools-v73'),
    document.querySelector('body.mobile-cashier-active .mobile-sale-header-tools'),
    document.querySelector('.topbar .top-actions'),
    document.querySelector('#screen-productpicker .mobile-product-page-toolbar')
  ];
  const target=candidates.find(visible)||document.body;
  let badge=document.getElementById('inposAddedTopbarV705');
  if(!badge){
    badge=document.createElement('span');badge.id='inposAddedTopbarV705';
    badge.className='inpos-added-topbar-v705';badge.setAttribute('role','status');badge.setAttribute('aria-live','polite');
    badge.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.4 4.4L19 7.5"/></svg>';
  }
  if(badge.parentElement!==target)target.prepend(badge);
  badge.setAttribute('aria-label',message);
  badge.setAttribute('title',message);
  badge.classList.remove('inpos-added-visible-v705');
  void badge.offsetWidth;
  badge.classList.add('inpos-added-visible-v705');
  if(inposAddedTimerV705!==null)clearTimeout(inposAddedTimerV705);
  inposAddedTimerV705=setTimeout(()=>{badge.remove();inposAddedTimerV705=null},1400);
}
function toast(msg,type=''){
  const message=String(msg??'');
  let productAdded=false;
  if(type!=='error'&&/\bditambahkan\.?$/i.test(message)){
    const picker=document.getElementById('screen-productpicker');
    const pickerActive=!!picker?.classList.contains('active')||document.body.classList.contains('purchase-product-picker-v76');
    const products=(typeof db!=='undefined'&&Array.isArray(db?.products))?db.products:[];
    const namedProduct=products.some(p=>p?.name&&message.toLocaleLowerCase('id-ID').includes(String(p.name).toLocaleLowerCase('id-ID')));
    productAdded=namedProduct||(pickerActive&&/^\d+(?:[.,]\d+)?\s.+\bditambahkan\.?$/i.test(message))||/\bvarian\b/i.test(message);
  }
  if(productAdded){inposProductAddedTopbarV705(message);return;}
  const wrap=document.getElementById('toastWrap');if(!wrap)return;
  const el=document.createElement('div');el.className='toast '+type;el.textContent=message;
  wrap.appendChild(el);setTimeout(()=>el.remove(),2600);
}
function cashierSoundEnabled(){return db.settings.cashierSound!==false}
function playCashierTone(type='product'){
if(!cashierSoundEnabled())return;
const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
try{
if(!cashierAudioContext)cashierAudioContext=new AudioCtx();
const ctx=cashierAudioContext;
const play=()=>{
const now=ctx.currentTime+.01;
const notes=type==='success'?[{f:659.25,t:0,d:.08,g:.045},{f:783.99,t:.09,d:.08,g:.045},{f:1046.5,t:.18,d:.13,g:.05}]:[{f:880,t:0,d:.055,g:.038},{f:1174.66,t:.055,d:.045,g:.03}];
notes.forEach(n=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(n.f,now+n.t);gain.gain.setValueAtTime(.0001,now+n.t);gain.gain.exponentialRampToValueAtTime(n.g,now+n.t+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+n.t+n.d);osc.connect(gain);gain.connect(ctx.destination);osc.start(now+n.t);osc.stop(now+n.t+n.d+.025)});
};
if(ctx.state==='suspended')ctx.resume().then(play).catch(()=>{});else play();
}catch(e){}
}
function renderCashierSoundSetting(){const on=cashierSoundEnabled(),row=document.getElementById('cashierSoundSetting'),sw=document.getElementById('cashierSoundSwitch'),status=document.getElementById('cashierSoundStatus');if(row)row.setAttribute('aria-pressed',String(on));if(sw)sw.classList.toggle('on',on);if(status){status.textContent=on?'Aktif • suara kasir':'Nonaktif • tanpa suara';status.classList.toggle('sound-on',on);status.classList.toggle('sound-off',!on)}}
function toggleCashierSound(){db.settings.cashierSound=!cashierSoundEnabled();save();renderCashierSoundSetting();if(cashierSoundEnabled()){playCashierTone('product');toast('Nada Kasir diaktifkan.')}else toast('Nada Kasir dinonaktifkan.')}
function getProduct(id){return db.products.find(x=>x.id===id)}
function naturalProductCompare(a,b){
return String(a?.name||'').localeCompare(String(b?.name||''),'id',{numeric:true,sensitivity:'base'})
}
function sortProductsNatural(list){
return[...(Array.isArray(list)?list:[])].sort(naturalProductCompare)
}
function shiftFeatureEnabled(){return db?.settings?.shiftEnabled!==false}
function skuFeatureEnabled(){return!!db?.settings?.skuEnabled}
function toggleSKUFeature(){
if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Hanya akun dengan akses Pengaturan yang dapat mengubah fitur SKU.','error');
db.settings.skuEnabled=!skuFeatureEnabled();save();renderCommerceFeatureToggles();renderStock();
if(document.body.dataset.mobileScreen==='productform'){const wrap=document.getElementById('mpSkuWrap');if(wrap)wrap.hidden=!skuFeatureEnabled()}
toast(`Fitur SKU ${skuFeatureEnabled()?'diaktifkan':'dinonaktifkan'}.`)
}
function ppnConfig(){if(!db.settings.ppn||typeof db.settings.ppn!=='object')db.settings.ppn={enabled:false,rate:11};db.settings.ppn.enabled=!!db.settings.ppn.enabled;db.settings.ppn.rate=Math.max(0,Math.min(100,Number(db.settings.ppn.rate)||11));return db.settings.ppn}
function ppnEnabled(){return ppnConfig().enabled}
function pointsConfig(){if(!db.settings.points||typeof db.settings.points!=='object')db.settings.points={enabled:false,mode:'manual',globalPoints:1,productPoints:{},rewards:[],expiryValue:12,expiryUnit:'month'};const c=db.settings.points;c.enabled=c.enabled!==false;c.globalPoints=Math.max(0,Math.round(Number(c.globalPoints)||0));c.expiryValue=Math.max(1,Math.min(120,Math.round(Number(c.expiryValue)||12)));c.expiryUnit=c.expiryUnit==='year'?'year':'month';if(!c.productPoints||typeof c.productPoints!=='object'||Array.isArray(c.productPoints))c.productPoints={};if(c.mode!=='manual'){const fallback=Math.max(0,Math.round(Number(c.globalPoints)||0));(db.products||[]).forEach(p=>{const k=String(p.id);if(c.productPoints[k]===undefined)c.productPoints[k]=fallback});c.mode='manual'}if(!Array.isArray(c.rewards))c.rewards=[];return c}
function pointExpiryISO(base=new Date(),config=null){const cfg=config||pointsConfig(),d=new Date(base);if(!Number.isFinite(d.getTime()))d.setTime(Date.now());const value=Math.max(1,Math.round(Number(cfg.expiryValue)||12));if(cfg.expiryUnit==='year'){const month=d.getMonth(),day=d.getDate();d.setDate(1);d.setFullYear(d.getFullYear()+value);d.setMonth(month);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last))}else{const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+value);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last))}return d.toISOString()}
function expireCustomerPointBalance(customer,now=Date.now()){if(!customer||Math.max(0,Number(customer.points)||0)<=0){if(customer&&customer.pointsExpiresAt)customer.pointsExpiresAt=null;return false}let changed=false;const exp=customer.pointsExpiresAt?new Date(customer.pointsExpiresAt):null;if(!exp||!Number.isFinite(exp.getTime())){customer.pointsExpiresAt=pointExpiryISO(new Date(now));changed=true}else if(exp.getTime()<=now){customer.points=0;customer.pointsExpiresAt=null;changed=true}return changed}
function applyPointExpirations(persist=false){let changed=false;(db.customers||[]).forEach(c=>{if(expireCustomerPointBalance(c))changed=true});if(changed&&persist)save();return changed}
function pointExpiryLabel(customer){if(!customer||!customer.pointsExpiresAt||Math.max(0,Number(customer.points)||0)<=0)return'';const d=new Date(customer.pointsExpiresAt);if(!Number.isFinite(d.getTime()))return'';return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
function pointsEnabled(){return optionalFeatureEnabled('points')&&pointsConfig().enabled}
function productPointValue(productId){const c=pointsConfig();if(!optionalFeatureEnabled('points')||!c.enabled)return 0;return Math.max(0,Math.round(Number(c.productPoints[String(productId)])||0))}
function calculateCartPoints(){if(!selectedCustomerId||!pointsEnabled())return 0;return Math.max(0,Math.floor(sum(cart,x=>x.wholesaleBonus?0:(Number(x.qty)||0)*productPointValue(x.productId))))}
function cartNetBeforeTax(){return Math.max(0,cartSubtotal()-transactionDiscountTotal())}
function cartPPN(){return 0}
function paymentPPN(){const c=ppnConfig();return c.enabled&&paymentPPNActive?Math.max(0,Math.round(cartNetBeforeTax()*c.rate/100)):0}
function renderPPNSettings(){
const el=document.getElementById('ppnSettingBody');if(!el)return;const c=ppnConfig();
el.innerHTML=`<div class="ppn-setting-card"><div class="ppn-setting-status"><div class="ppn-setting-icon">%</div><div class="ppn-setting-copy"><b>Fitur PPN</b><small>${c.enabled?`Aktif • PPN ${c.rate}% tersedia saat pembayaran`:'Nonaktif • PPN tidak tersedia saat pembayaran'}</small></div><button class="switch ${c.enabled?'on':''}" type="button" aria-pressed="${c.enabled?'true':'false'}" onclick="togglePPNFeature()"></button></div></div><div class="ppn-setting-card"><div class="ppn-rate-head"><div><b>Persentase PPN</b><small>Tarif PPN saat diaktifkan di pembayaran.</small></div><span class="pill ${c.enabled?'green':''}">${c.rate}%</span></div><div class="ppn-rate-form"><div class="field"><label>PPN</label><div class="ppn-rate-input"><input id="ppnRateInput" type="number" inputmode="decimal" min="0.1" max="100" step="0.1" value="${c.rate}"><span>%</span></div></div><button class="btn btn-primary" type="button" onclick="savePPNRate()">Simpan</button></div></div><div class="ppn-setting-note"><i>i</i><div><b>PPN diaktifkan manual</b><span>Transaksi baru tanpa PPN. Kasir dapat mengaktifkannya saat pembayaran.</span></div></div>`
}
function savePPNRate(){if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Hanya akun dengan akses Pengaturan yang dapat mengubah PPN.','error');const c=ppnConfig(),input=document.getElementById('ppnRateInput'),v=Number(input?.value);if(!Number.isFinite(v)||v<=0||v>100)return toast('Persentase PPN harus lebih dari 0 sampai 100.','error');const before=c.rate;c.rate=Math.round(v*100)/100;if(!save()){c.rate=before;renderPPNSettings();return toast('Tarif PPN gagal disimpan.','error')}renderCommerceFeatureToggles();if(document.getElementById('screen-tax')?.classList.contains('active')&&document.querySelector('#screen-tax [data-tax-tab="ppn"].active')){renderTaxV597()}else renderPPNSettings();toast(`Tarif PPN POS disimpan: ${c.rate}%.`)}
function renderCommerceFeatureToggles(){
const shift=shiftFeatureEnabled(),sr=document.getElementById('shiftFeatureToggle'),ss=document.getElementById('shiftFeatureSwitch'),st=document.getElementById('shiftFeatureStatus');if(sr)sr.setAttribute('aria-pressed',String(shift));if(ss)ss.classList.toggle('on',shift);if(st){st.textContent=shift?'Aktif • buka/tutup shift':'Nonaktif • menu Shift disembunyikan';st.className=shift?'feature-on':'feature-off'}
document.querySelectorAll('[data-screen="shift"]').forEach(el=>el.hidden=!shift);document.querySelectorAll('.desktop-actions button[onclick="openShiftModal()"],.cashier-status').forEach(el=>el.hidden=!shift);
const tax=ppnConfig(),pt=document.getElementById('ppnFeatureStatus');if(pt){pt.textContent=tax.enabled?`Aktif • PPN ${tax.rate}% tersedia di popup pembayaran`:'Nonaktif • PPN tidak digunakan';pt.className=tax.enabled?'feature-on':'feature-off'}
const pc=pointsConfig(),pm=document.getElementById('pointsFeatureMenuStatus');if(pm)pm.textContent=pc.enabled?`Aktif • ${pc.expiryValue} ${pc.expiryUnit==='year'?'Tahun':'Bulan'} • hadiah`:'Nonaktif • poin tidak diberikan'
const sku=skuFeatureEnabled(),skr=document.getElementById('skuFeatureToggle'),sks=document.getElementById('skuFeatureSwitch'),skt=document.getElementById('skuFeatureStatus');if(skr)skr.setAttribute('aria-pressed',String(sku));if(sks)sks.classList.toggle('on',sku);if(skt){skt.textContent=sku?'Aktif • SKU tampil di Produk & Stok':'Nonaktif • SKU disembunyikan';skt.className=sku?'feature-on':'feature-off'}
}
function toggleShiftFeature(){if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Hanya akun dengan akses Pengaturan yang dapat mengubah fitur Shift.','error');db.settings.shiftEnabled=!shiftFeatureEnabled();save();renderCommerceFeatureToggles();renderDashboard();syncDashboardMenuVisibility();if(!shiftFeatureEnabled()&&document.body.dataset.mobileScreen==='shift')go('more');toast(`Fitur Shift ${shiftFeatureEnabled()?'diaktifkan':'dinonaktifkan'}.`)}
function togglePPNFeature(){if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Hanya akun dengan akses Pengaturan yang dapat mengubah PPN.','error');const c=ppnConfig(),before=c.enabled;c.enabled=!before;if(!save()){c.enabled=before;renderPPNSettings();return toast('Status PPN gagal disimpan.','error')}if(!c.enabled)paymentPPNActive=false;renderCommerceFeatureToggles();if(document.getElementById('screen-tax')?.classList.contains('active')&&document.querySelector('#screen-tax [data-tax-tab="ppn"].active')){renderTaxV597()}else renderPPNSettings();renderCart();toast(`Fitur PPN ${c.enabled?'diaktifkan':'dinonaktifkan'}${c.enabled?` • ${c.rate}% tersedia di popup pembayaran`:''}.`)}
let pointsSettingsTab='';
function setPointsSettingsTab(tab){
const allowed=['manual','rewards','redeem'];
pointsSettingsTab=allowed.includes(tab)?tab:'manual';
if(pointsSettingsTab==='manual'){const c=pointsConfig();c.mode='manual';save();renderCommerceFeatureToggles()}
renderPointsSettings();
}
function togglePointsFeature(){toggleOptionalFeature('points');if(optionalFeatureEnabled('points'))renderPointsSettings()}
function updatePointExpirySetting(){const cfg=pointsConfig(),value=Math.max(1,Math.min(120,Math.round(Number(document.getElementById('pointExpiryValue')?.value)||cfg.expiryValue))),unit=document.getElementById('pointExpiryUnit')?.value==='year'?'year':'month';cfg.expiryValue=value;cfg.expiryUnit=unit;const base=new Date();(db.customers||[]).forEach(c=>{if(Math.max(0,Number(c.points)||0)>0)c.pointsExpiresAt=pointExpiryISO(base,cfg);else c.pointsExpiresAt=null});save();renderPointsSettings();toast(`Kadaluarsa poin diatur ${value} ${unit==='year'?'tahun':'bulan'}.`)}
function pointsResetOwnerPinValidV491(pin){
const clean=String(pin||'').trim();
if(!/^\d{4,8}$/.test(clean))return false;
return(Array.isArray(db?.employees)?db.employees:[]).some(e=>e&&e.active!==false&&String(e.role||'').toLowerCase()==='owner'&&String(e.pin||'')===clean);
}
function openPointsResetPINV491(kind){
if(!employeeCan('settings'))return toast('Hanya akun berwenang yang dapat mereset poin.','error');
const owners=(Array.isArray(db?.employees)?db.employees:[]).filter(e=>e&&e.active!==false&&String(e.role||'').toLowerCase()==='owner'&&/^\d{4,8}$/.test(String(e.pin||'')));
if(!owners.length)return toast('PIN Owner belum tersedia. Atur di menu Karyawan & PIN.','error');
const type=['product','customer','all'].includes(kind)?kind:'customer';
const count=(db.customers||[]).filter(c=>Math.max(0,Number(c.points)||0)>0).length;
const productCount=(db.products||[]).length;
const title=type==='all'?'Reset Semua Poin':type==='customer'?'Reset Poin Pelanggan':'Reset Poin Produk';
const detail=type==='all'
?`Poin ${productCount.toLocaleString('id-ID')} produk dan saldo ${count.toLocaleString('id-ID')} pelanggan akan menjadi 0. Riwayat transaksi dan penukaran hadiah tetap ada.`
:type==='customer'
?`Saldo ${count.toLocaleString('id-ID')} pelanggan akan menjadi 0 di Data Pelanggan. Poin produk tidak berubah. Riwayat penukaran tetap ada.`
:`Poin ${productCount.toLocaleString('id-ID')} produk akan menjadi 0. Saldo poin di Data Pelanggan TIDAK ikut direset. Gunakan Reset Poin Pelanggan atau Reset Semua Poin untuk itu.`;
showModal(title,'Verifikasi PIN Owner',`<div class="points-reset-confirm-v491"><div class="points-reset-summary-v491"><b>${title}</b><span>${detail}</span></div><div class="field"><label for="pointsResetPinV491">PIN Owner</label><input id="pointsResetPinV491" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="Masukkan PIN" aria-label="PIN Owner untuk reset poin" onkeydown="if(event.key==='Enter'){event.preventDefault();confirmPointsResetPINV491('${type}')}"></div><small>Reset tidak dapat dibatalkan. Cadangkan data terlebih dahulu bila diperlukan.</small></div>`,[{label:'Batal',close:true},{label:'Reset Poin',danger:true,fn:()=>confirmPointsResetPINV491(type)}]);
}
function confirmPointsResetPINV491(kind){
const input=document.getElementById('pointsResetPinV491'),pin=String(input?.value||'').trim();
if(!/^\d{4,8}$/.test(pin)){toast('Masukkan PIN Owner 4–8 digit.','error');input?.focus();return}
if(!pointsResetOwnerPinValidV491(pin)){if(input){input.value='';input.focus()}return toast('PIN Owner tidak sesuai. Poin tidak diubah.','error')}
if(kind==='product')return resetAllProductPoints(pin);
if(kind==='all')return resetAllPointsV493(pin);
return resetAllCustomerPoints(pin);
}
function resetPointsPersistentV493(kind,pin){
if(!employeeCan('settings')||!pointsResetOwnerPinValidV491(pin))return toast('Verifikasi PIN Owner diperlukan.','error');
const resetCustomers=kind==='customer'||kind==='all',resetProducts=kind==='product'||kind==='all';
if(!resetCustomers&&!resetProducts)return toast('Jenis reset tidak tersedia.','error');
const customers=Array.isArray(db.customers)?db.customers:[],cfg=pointsConfig();
const previousRaw=storageGet('myposid_demo_v3');
const snapshots=customers.map(c=>({customer:c,points:c.points,pointsExpiresAt:c.pointsExpiresAt}));
const priorGlobal=cfg.globalPoints,priorProductPoints={...cfg.productPoints};
const affected=snapshots.filter(x=>Math.max(0,Number(x.points)||0)>0).length;
const rollback=()=>{
snapshots.forEach(x=>{x.customer.points=x.points;x.customer.pointsExpiresAt=x.pointsExpiresAt});
cfg.globalPoints=priorGlobal;cfg.productPoints=priorProductPoints;
};
if(resetCustomers)snapshots.forEach(x=>{x.customer.points=0;x.customer.pointsExpiresAt=null});
if(resetProducts){cfg.globalPoints=0;Object.keys(cfg.productPoints).forEach(id=>{cfg.productPoints[id]=0});(db.products||[]).forEach(p=>{cfg.productPoints[String(p.id)]=0})}
let verified=false;
try{
if(save()){
const persisted=JSON.parse(storageGet('myposid_demo_v3')||'null');
const savedCustomers=Array.isArray(persisted?.customers)?persisted.customers:[];
const customerOK=!resetCustomers||(savedCustomers.length===customers.length&&savedCustomers.every(c=>Number(c.points)===0&&(c.pointsExpiresAt==null||c.pointsExpiresAt==='')));
const savedCfg=persisted?.settings?.points;
const productOK=!resetProducts||(savedCfg&&Number(savedCfg.globalPoints)===0&&
(db.products||[]).every(p=>Number(savedCfg.productPoints?.[String(p.id)])===0)&&
Object.values(savedCfg.productPoints||{}).every(v=>Number(v)===0));
verified=!!(customerOK&&productOK);
}
}catch(err){console.warn('Verifikasi penyimpanan Reset Poin gagal:',err)}
if(!verified){
rollback();
if(previousRaw!==null)storageSet('myposid_demo_v3',previousRaw);else save();
return toast('Reset belum tersimpan dengan benar. Saldo poin tidak diubah. Cek ruang penyimpanan lalu coba lagi.','error');
}
closeModal();
if(resetCustomers){
const editingId=typeof customerFormEditingIdV106!=='undefined'?customerFormEditingIdV106:null;
const edited=editingId!=null?customers.find(c=>String(c.id)===String(editingId)):null;
const field=document.getElementById('customerPointsV106');if(field&&edited)field.value='0';
const modalInput=document.getElementById('cPoints');if(modalInput)modalInput.value='0';
}
renderAll();
if(resetCustomers){renderCustomers();if(typeof renderPointsSettings==='function')renderPointsSettings()}
else{renderCommerceFeatureToggles();renderPointsSettings()}
const msg=kind==='all'
?`Reset Semua Poin berhasil. Poin produk dan saldo ${affected} pelanggan sudah 0 di data tersimpan.`
:kind==='customer'
?`Reset Poin Pelanggan berhasil. Saldo ${affected} pelanggan sudah 0 di Data Pelanggan.`
:'Poin produk berhasil direset. Saldo poin pelanggan tidak diubah.';
toast(msg);
return true;
}
function openResetProductPointsPopup(){openPointsResetPINV491('product')}
function openResetCustomerPointsPopup(){openPointsResetPINV491('customer')}
function openResetAllPointsPopupV493(){openPointsResetPINV491('all')}
function resetAllProductPoints(pin){return resetPointsPersistentV493('product',pin)}
function resetAllCustomerPoints(pin){return resetPointsPersistentV493('customer',pin)}
function resetAllPointsV493(pin){return resetPointsPersistentV493('all',pin)}
function setPointsMode(mode){const c=pointsConfig();c.mode='manual';pointsSettingsTab='manual';save();renderCommerceFeatureToggles();renderPointsSettings()}
function setGlobalPoints(value){const c=pointsConfig();c.globalPoints=Math.max(0,Math.round(Number(value)||0));save();renderCommerceFeatureToggles();renderPointsSettings()}
function applyGlobalProductPoints(){
const input=document.getElementById('pointGlobalSetInput'),raw=String(input?.value??'').trim();
if(raw==='')return toast('Isi poin global terlebih dahulu.','error');
const parsed=Number(raw);
if(!Number.isFinite(parsed)||parsed<0||parsed>Number.MAX_SAFE_INTEGER){
return toast('Poin global harus berupa angka 0 atau lebih.','error');
}
const value=Math.round(parsed),c=pointsConfig(),products=Array.isArray(db.products)?db.products:[];
c.globalPoints=value;c.mode='manual';
products.forEach(p=>{c.productPoints[String(p.id)]=value});
save();renderCommerceFeatureToggles();renderPointsSettings();
toast(`Poin global ${value.toLocaleString('id-ID')} diterapkan ke ${products.length} produk.`)
}
function setProductPoints(productId,value){const c=pointsConfig();c.productPoints[String(productId)]=Math.max(0,Math.round(Number(value)||0));save();const row=document.querySelector(`[data-point-product="${productId}"] small`);if(row)row.textContent=`${c.productPoints[String(productId)]} poin per Qty`}
function addPointReward(){const name=String(document.getElementById('pointRewardName')?.value||'').trim(),raw=String(document.getElementById('pointRewardCost')?.value??'').trim(),amount=Number(raw);if(!name)return toast('Nama hadiah wajib diisi.','error');if(!raw||!Number.isSafeInteger(amount)||amount<1)return toast('Poin hadiah harus bilangan bulat minimal 1.','error');const c=pointsConfig();c.rewards.push({id:uid('RWD'),name,points:amount});if(!save()){c.rewards.pop();return toast('Hadiah belum tersimpan. Periksa ruang penyimpanan perangkat.','error')}renderPointsSettings();toast('Hadiah ditambahkan.')}
function deletePointReward(id){const c=pointsConfig();c.rewards=c.rewards.filter(x=>x.id!==id);save();renderPointsSettings();toast('Hadiah dihapus.')}
function redeemPointReward(){
const customerId=Number(document.getElementById('pointRedeemCustomer')?.value||0),rewardId=String(document.getElementById('pointRedeemReward')?.value||''),c=getCustomer(customerId),cfg=pointsConfig(),reward=cfg.rewards.find(x=>String(x.id)===rewardId);
if(!c)return toast('Pilih pelanggan.','error');
const beforePoints=Math.max(0,Number(c.points)||0),beforeExpiry=c.pointsExpiresAt??null;
expireCustomerPointBalance(c);
if(beforePoints>0&&(Number(c.points)||0)===0){if(!save()){c.points=beforePoints;c.pointsExpiresAt=beforeExpiry;return toast('Perubahan poin belum tersimpan.','error')}renderPointsSettings();return toast('Poin pelanggan sudah kadaluarsa dan otomatis direset.','error')}
if(!reward)return toast('Pilih hadiah.','error');
const cost=Number(reward.points);
if(!Number.isSafeInteger(cost)||cost<1)return toast('Poin hadiah tidak valid. Perbaiki data hadiah.','error');
if((Number(c.points)||0)<cost)return toast(`Poin ${c.name} belum cukup. Dibutuhkan ${cost} poin.`,'error');
const oldPoints=c.points,oldExpiry=c.pointsExpiresAt,oldHistory=Array.isArray(db.pointRedemptions)?db.pointRedemptions:[];
c.points=Math.max(0,(Number(c.points)||0)-cost);if(c.points===0)c.pointsExpiresAt=null;
db.pointRedemptions=[{id:uid('RDM'),date:new Date().toISOString(),customerId:c.id,rewardId:reward.id,rewardName:reward.name,points:cost,cashier:String(db.settings.cashier||'Kasir')},...oldHistory].slice(0,100);
if(!save()){c.points=beforePoints;c.pointsExpiresAt=beforeExpiry;db.pointRedemptions=oldHistory;return toast('Penukaran gagal disimpan. Saldo poin tidak berubah.','error')}
renderAll();renderPointsSettings();toast(`${reward.name} berhasil ditukar oleh ${c.name}.`)
}
function renderPointProductRows(){const box=document.getElementById('pointProductList');if(!box)return;const q=String(document.getElementById('pointProductSearch')?.value||'').trim().toLowerCase(),cfg=pointsConfig(),rows=sortProductsNatural(db.products).filter(p=>!q||String(p.name||'').toLowerCase().includes(q)||String(p.barcode||'').includes(q));box.innerHTML=rows.length?rows.map(p=>`<div class="points-product-row" data-point-product="${p.id}"><div class="points-product-copy"><b>${esc(p.name)}</b><small>${Math.max(0,Math.round(Number(cfg.productPoints[String(p.id)])||0))} poin per Qty • ${esc(p.barcode||'-')}</small></div><input type="number" inputmode="numeric" min="0" value="${Math.max(0,Math.round(Number(cfg.productPoints[String(p.id)])||0))}" onchange="setProductPoints(${p.id},this.value)" aria-label="Poin ${esc(p.name)}"></div>`).join(''):'<div class="empty-state">Produk tidak ditemukan.</div>'}
function renderPointsSettings(){
const body=document.getElementById('pointsSettingsBody');if(!body)return;
const cfg=pointsConfig(),rewards=cfg.rewards,customers=[...db.customers].sort((a,b)=>String(a.name).localeCompare(String(b.name),'id')),history=(db.pointRedemptions||[]).slice(0,10);
if(!['manual','rewards','redeem'].includes(pointsSettingsTab))pointsSettingsTab='manual';
const tab=pointsSettingsTab;
let panel='';
if(tab==='manual'){
panel=`<div class="points-setting-card"><div class="points-setting-head"><div><b>Set Poin Produk</b><small>Gunakan Set Global untuk memberi poin yang sama ke semua produk, lalu ubah manual bila diperlukan.</small></div><button class="points-reset-icon" type="button" onclick="openResetProductPointsPopup()" aria-label="Reset poin produk" title="Reset Poin Produk"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6"/><path d="M5.6 9A8 8 0 1 1 4 14"/></svg></button></div><div class="points-global-set"><div class="points-global-set-copy"><b>Set Global</b><small>Semua produk</small></div><input class="input" id="pointGlobalSetInput" type="number" inputmode="numeric" min="0" value="${Math.max(0,Math.round(Number(cfg.globalPoints)||0))}" aria-label="Poin global semua produk" onkeydown="if(event.key==='Enter'){event.preventDefault();applyGlobalProductPoints()}"><button class="btn btn-primary" type="button" onclick="applyGlobalProductPoints()">Terapkan</button></div><div class="points-manual-toolbar"><input class="input" id="pointProductSearch" type="search" placeholder="Cari produk / barcode..." oninput="renderPointProductRows()"><span class="pill blue">${db.products.length} produk</span></div><div class="points-product-list" id="pointProductList"></div></div>`;
}else if(tab==='rewards'){
panel=`<div class="points-setting-card"><div class="points-setting-head"><div><b>Daftar Hadiah</b><small>Buat hadiah dan tentukan jumlah poin yang diperlukan.</small></div></div><div class="points-reward-form"><div class="field"><label>Nama Hadiah</label><input id="pointRewardName" placeholder="Contoh: Minuman Gratis"></div><div class="field"><label>Poin</label><input id="pointRewardCost" type="number" inputmode="numeric" min="1" placeholder="100"></div><button class="btn btn-primary" type="button" onclick="addPointReward()">+ Hadiah</button></div><div class="points-reward-list">${rewards.length?rewards.map(r=>`<div class="points-reward-row"><div><b>${esc(r.name)}</b><small>Hadiah penukaran poin pelanggan</small></div><span class="points-reward-cost">${r.points.toLocaleString('id-ID')} poin</span><button class="btn btn-sm" type="button" onclick="deletePointReward('${esc(r.id)}')">×</button></div>`).join(''):'<div class="empty-state">Belum ada hadiah.</div>'}</div></div>`;
}else{
panel=`<div class="points-setting-card"><div class="points-setting-head"><div><b>Tukar Hadiah</b><small>Poin pelanggan langsung dikurangi setelah penukaran berhasil.</small></div></div><div class="points-redeem-grid"><div class="field"><label>Pelanggan</label><select id="pointRedeemCustomer"><option value="">Pilih pelanggan</option>${customers.map(c=>`<option value="${c.id}">${esc(c.name)} • ${Number(c.points||0).toLocaleString('id-ID')} poin${pointExpiryLabel(c)?` • s.d. ${pointExpiryLabel(c)}`:''}</option>`).join('')}</select></div><div class="field"><label>Hadiah</label><select id="pointRedeemReward"><option value="">Pilih hadiah</option>${rewards.map(r=>`<option value="${esc(r.id)}">${esc(r.name)} • ${r.points} poin</option>`).join('')}</select></div><button class="btn btn-primary" type="button" onclick="redeemPointReward()" ${(!customers.length||!rewards.length)?'disabled':''}>Tukar Hadiah</button></div><div class="points-setting-head" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><div><b>Riwayat Penukaran</b><small>10 penukaran hadiah terbaru.</small></div></div><div class="points-history">${history.length?history.map(h=>`<div class="points-history-row"><div><b>${esc(getCustomer(h.customerId)?.name||'Pelanggan')} • ${esc(h.rewardName)}</b><small>${fmtTime(h.date)} • ${esc(h.cashier||'-')}</small></div><strong>−${Number(h.points||0).toLocaleString('id-ID')} poin</strong></div>`).join(''):'<div class="empty-state">Belum ada penukaran hadiah.</div>'}</div></div>`;
}
body.innerHTML=`
  <div class="points-setting-card points-status-card"><div class="points-setting-head"><div><b>Status Fitur Poin</b><small>${cfg.enabled?'Poin diberikan ke pelanggan terdaftar saat transaksi berhasil.':'Poin tidak diberikan pada transaksi baru.'}</small></div><div class="points-status-actions"><button class="points-reset-icon" type="button" onclick="openResetCustomerPointsPopup()" aria-label="Reset poin pelanggan" title="Reset Poin Pelanggan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M4.5 20a7.5 7.5 0 0 1 10.2-7"/><path d="M20 13v5h-5"/><path d="M20 18a5.5 5.5 0 0 0-4.5-5.3"/></svg></button></div></div><button class="points-reset-all-v493" type="button" onclick="openResetAllPointsPopupV493()" aria-label="Reset semua poin produk dan pelanggan">Reset Semua Poin <small>(Produk + Pelanggan)</small></button><div class="points-expiry-badge"><span>Kadaluarsa</span><input id="pointExpiryValue" type="number" inputmode="numeric" min="1" max="120" value="${cfg.expiryValue}" aria-label="Nilai kadaluarsa poin" onchange="updatePointExpirySetting()"><select id="pointExpiryUnit" aria-label="Satuan kadaluarsa poin" onchange="updatePointExpirySetting()"><option value="month" ${cfg.expiryUnit==='month'?'selected':''}>Bulan</option><option value="year" ${cfg.expiryUnit==='year'?'selected':''}>Tahun</option></select></div></div>
  <div class="points-main-tabs" role="tablist" aria-label="Menu Fitur Poin">
   <button type="button" class="${tab==='manual'?'active':''}" onclick="setPointsSettingsTab('manual')">Set Poin</button>
   <button type="button" class="${tab==='rewards'?'active':''}" onclick="setPointsSettingsTab('rewards')">Daftar Hadiah</button>
   <button type="button" class="${tab==='redeem'?'active':''}" onclick="setPointsSettingsTab('redeem')">Tukar Hadiah</button>
  </div>
  <div class="points-tab-panel">${panel}</div>`;
if(tab==='manual')renderPointProductRows()
}
function productCodeEnabled(){return false}
function salesConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.salesConfig||typeof db.settings.salesConfig!=='object')db.settings.salesConfig={transactionPrefix:'TRX'};
const c=db.settings.salesConfig;
c.transactionPrefix=String(c.transactionPrefix||'TRX').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)||'TRX';
return c
}
function transactionPrefix(){return salesConfig().transactionPrefix}
function transactionIdDateKey(date=new Date()){
const d=new Date(date);return String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')
}
function nextTransactionId(date=new Date(),prefixOverride=''){
const requested=String(prefixOverride||window.__transactionIdPrefixOverrideV343||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
const prefix=requested||transactionPrefix();
const base=prefix+'-'+transactionIdDateKey(date)+'-';
const seq=db.sales.reduce((max,s)=>{const id=String(s.id||'');if(!id.startsWith(base))return max;const tail=id.slice(base.length);return/^\d+$/.test(tail)?Math.max(max,Number(tail)||0):max},0)+1;
return base+String(seq).padStart(3,'0')
}
function openSalesSettingsQuickMenu(saleId=''){
window.salesQuickMenuTargetId=String(saleId||activeSaleDetailId||'');
const icon=`<span class="sales-quick-menu-icon"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg></span>`;
const rows=[
['number','Edit Nomor Transaksi'],
['note','Edit Catatan Transaksi'],
['date','Edit Tanggal Transaksi'],
['shippingAddress','Edit Alamat Pengiriman'],
['shippingNote','Edit Catatan Pengiriman'],
['prefix','Edit Prefix Nomor Transaksi']
];
showModal('Menu Penjualan','Pilih data penjualan yang ingin diedit.',`<div class="sales-quick-menu">${rows.map(([key,label])=>`<button class="sales-quick-menu-item" type="button" onclick="openSalesQuickMenuAction('${key}')">${icon}<span>${label}</span><b>›</b></button>`).join('')}</div>`,[{label:'Tutup',close:true}],true)
}
function openSalesQuickMenuAction(key){
const target=String(window.salesQuickMenuTargetId||activeSaleDetailId||'');
closeModal();
setTimeout(()=>{if(key==='prefix')openTransactionPrefixEditor();else openSalesDataEditor(key,target)},60)
}
function renderSalesSettingsPage(){
const el=document.getElementById('salesSettingsBody');if(!el)return;
const icon=`<span class="sales-settings-icon"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg></span>`;
const rows=[
['number','Edit Nomor Transaksi','Ubah nomor transaksi yang sudah tersimpan'],
['note','Edit Catatan Transaksi','Ubah catatan transaksi'],
['date','Edit Tanggal Transaksi','Ubah tanggal dan waktu transaksi'],
['shippingAddress','Edit Alamat Pengiriman','Ubah alamat pengiriman'],
['shippingNote','Edit Catatan Pengiriman','Ubah catatan pengiriman'],
['prefix','Edit Prefix Nomor Transaksi',`Prefix saat ini: ${transactionPrefix()}`]
];
el.innerHTML=`<div class="sales-settings-card">${rows.map(r=>`<button class="sales-settings-item" type="button" onclick="${r[0]==='prefix'?'openTransactionPrefixEditor()':`openSalesDataEditor('${r[0]}')`}">${icon}<span class="sales-settings-copy"><b>${r[1]}</b><small>${r[2]}</small></span><span class="sales-settings-chevron">›</span></button>`).join('')}</div>`
}
function salesEditorConfig(type){
return{
number:{title:'Edit Nomor Transaksi',field:'id',label:'Nomor Transaksi',kind:'text',placeholder:'Contoh: TRX-1002-001'},
note:{title:'Edit Catatan Transaksi',field:'note',label:'Catatan Transaksi',kind:'textarea',placeholder:'Isi catatan transaksi'},
date:{title:'Edit Tanggal Transaksi',field:'date',label:'Tanggal & Waktu',kind:'datetime',placeholder:''},
shippingAddress:{title:'Edit Alamat Pengiriman',field:'shippingAddress',label:'Alamat Pengiriman',kind:'textarea',placeholder:'Isi alamat pengiriman'},
shippingNote:{title:'Edit Catatan Pengiriman',field:'shippingNote',label:'Catatan Pengiriman',kind:'textarea',placeholder:'Isi catatan pengiriman'}
}[type]||null
}
function salesEditSortedRows(){return[...db.sales].sort((a,b)=>new Date(b.date)-new Date(a.date))}
function salesEditOptions(selected=''){
return salesEditSortedRows().map(s=>`<option value="${esc(s.id)}" ${s.id===selected?'selected':''}>${esc(s.id)} • ${fmtTime(s.date)} • ${esc(getCustomer(s.customerId)?.name||s.customerName||'Umum')}</option>`).join('')
}
function localDateTimeValue(value){
const d=new Date(value||Date.now());if(Number.isNaN(d.getTime()))return'';
const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16)
}
function loadSalesEditValue(type){
const cfg=salesEditorConfig(type),select=document.getElementById('salesEditTransactionSelect'),field=document.getElementById('salesEditValue');if(!cfg||!select||!field)return;
let sale=db.sales.find(s=>s.id===select.value);
if(!sale){sale=salesEditSortedRows()[0];if(!sale)return;if(select)select.value=sale.id}
field.value=cfg.kind==='datetime'?localDateTimeValue(sale.date):String(sale[cfg.field]||'')
}
function openSalesDataEditor(type,preferredId=''){
const cfg=salesEditorConfig(type);if(!cfg)return;
if(!db.sales.length)return toast('Belum ada transaksi untuk diedit.','error');
const sale=db.sales.find(s=>s.id===preferredId)||salesEditSortedRows()[0];
const input=cfg.kind==='textarea'?`<textarea id="salesEditValue" placeholder="${esc(cfg.placeholder)}"></textarea>`:`<input id="salesEditValue" type="${cfg.kind==='datetime'?'datetime-local':'text'}" placeholder="${esc(cfg.placeholder)}" ${type==='number'?'maxlength="40" oninput="sanitizeSalesNumberInput(this)"':''}>`;
showModal(cfg.title,'Pilih transaksi, lalu ubah data yang diperlukan.',`<div class="sales-edit-select"><label>Transaksi</label><select id="salesEditTransactionSelect" onchange="loadSalesEditValue('${type}')">${salesEditOptions(sale.id)}</select></div><div class="sales-edit-field"><label>${cfg.label}</label>${input}</div>`,[
{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>saveSalesDataEdit(type)}
],true);
setTimeout(()=>loadSalesEditValue(type),20)
}
function sanitizeSalesNumberInput(input){
if(!input)return;
const pos=input.selectionStart,value=String(input.value||'').toUpperCase().replace(/[^A-Z0-9._\/-]/g,'').slice(0,40);
if(input.value!==value){input.value=value;try{input.setSelectionRange(pos,pos)}catch(e){}}
}
function saveSalesDataEdit(type){
const cfg=salesEditorConfig(type),select=document.getElementById('salesEditTransactionSelect'),field=document.getElementById('salesEditValue');if(!cfg||!select||!field)return;
const sale=db.sales.find(s=>s.id===select.value);if(!sale)return toast('Transaksi tidak ditemukan.','error');
const raw=String(field.value||'').trim();
if(type==='number'){
if(!raw)return toast('Nomor transaksi wajib diisi.','error');
const next=raw.toUpperCase().replace(/[^A-Z0-9._\/-]/g,'').slice(0,40);
if(!next)return toast('Nomor transaksi tidak valid.','error');
if(next!==raw.toUpperCase())field.value=next;
const duplicate=db.sales.find(s=>s!==sale&&String(s.id).toUpperCase()===next);
if(duplicate)return toast('Nomor transaksi sudah digunakan.','error');
const old=sale.id;sale.id=next;
db.notifications.forEach(n=>{
if(n.actionId===old)n.actionId=next;
if(n.key===`sale-${old}`)n.key=`sale-${next}`;
if(typeof n.message==='string'&&n.message.includes(old))n.message=n.message.split(old).join(next)
});
if(activeSaleDetailId===old)activeSaleDetailId=next
}else if(type==='date'){
if(!raw)return toast('Tanggal transaksi wajib diisi.','error');
const d=new Date(raw);if(Number.isNaN(d.getTime()))return toast('Tanggal transaksi tidak valid.','error');
sale.date=d.toISOString()
}else sale[cfg.field]=raw;
save();renderAll();if(document.body.dataset.mobileScreen==='sales-settings')renderSalesSettingsPage();if(document.body.dataset.mobileScreen==='sale-detail'&&activeSaleDetailId)renderSaleDetailPage();closeModal();toast(`${cfg.title} berhasil disimpan.`)
}
function openTransactionPrefixEditor(){
const cfg=salesConfig();
showModal('Edit Prefix Nomor Transaksi','Prefix digunakan untuk transaksi baru. Nomor transaksi lama tidak berubah.',`<div class="sales-edit-field"><label>Prefix Nomor Transaksi</label><input id="salesPrefixInput" type="text" maxlength="10" value="${esc(cfg.transactionPrefix)}" placeholder="TRX" oninput="previewSalesPrefix()"><div class="sales-edit-hint">Gunakan huruf atau angka tanpa spasi. Contoh: TRX, INV, POS.</div><div class="sales-prefix-preview"><span>Contoh transaksi baru</span><b id="salesPrefixPreview">${esc(nextTransactionId())}</b></div></div>`,[
{label:'Batal',close:true},{label:'Simpan Prefix',primary:true,fn:()=>saveTransactionPrefix()}
],true)
}
function previewSalesPrefix(){
const input=document.getElementById('salesPrefixInput'),preview=document.getElementById('salesPrefixPreview');if(!input||!preview)return;
const prefix=String(input.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);if(input.value!==prefix)input.value=prefix;
const base=(prefix||'TRX')+'-'+transactionIdDateKey()+'-';
const seq=db.sales.reduce((max,s)=>{const id=String(s.id||'');if(!id.startsWith(base))return max;const tail=id.slice(base.length);return/^\d+$/.test(tail)?Math.max(max,Number(tail)||0):max},0)+1;
preview.textContent=base+String(seq).padStart(3,'0')
}
function saveTransactionPrefix(){
const input=document.getElementById('salesPrefixInput'),prefix=String(input?.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10);
if(!prefix)return toast('Prefix nomor transaksi wajib diisi.','error');
salesConfig().transactionPrefix=prefix;save();renderSalesSettingsPage();renderMobileCashier();closeModal();toast(`Prefix nomor transaksi disimpan: ${prefix}.`)
}
function getCustomer(id){return db.customers.find(x=>x.id===id)}function getSupplier(id){return db.suppliers.find(x=>x.id===id)}
function normalizeBarcodeList(value){const rows=Array.isArray(value)?value:String(value||'').split(/[\n,;]+/);return[...new Set(rows.map(v=>String(v||'').trim()).filter(Boolean))]}
function productBarcodeList(p,includeStored=false){if(!p)return[];const extra=(includeStored||p.multiBarcodeEnabled)?normalizeBarcodeList(p.barcodes):[];return[...new Set([String(p.barcode||'').trim(),String(p.ean13||'').trim(),...extra].filter(Boolean))]}
function productMatchesBarcode(p,q){const needle=String(q||'').toLowerCase();return productBarcodeList(p).some(code=>code.toLowerCase().includes(needle))}
function findProductByBarcode(code,excludeId=null){const needle=String(code||'').trim();if(!needle)return null;return db.products.find(p=>p.id!==excludeId&&productBarcodeList(p).includes(needle))||null}
function serviceProductEnabled(){if(!db.settings||typeof db.settings!=='object')db.settings={};return!!db.settings.serviceProducts}
function serviceProductCategoryLocked(name){return serviceProductEnabled()&&String(name||'').trim().toLocaleLowerCase('id-ID')==='jasa'}
function serviceProductUnitLocked(name){return serviceProductEnabled()&&String(name||'').trim().toLocaleLowerCase('id-ID')==='layanan'}
function ensureServiceProductDefaults(){
if(!serviceProductEnabled())return{categoryAdded:false,unitAdded:false};
if(!Array.isArray(db.categories))db.categories=[];if(!Array.isArray(db.units))db.units=[];
let categoryAdded=false,unitAdded=false;
if(!db.categories.some(c=>String(c||'').trim().toLocaleLowerCase('id-ID')==='jasa')){db.categories.push('Jasa');categoryAdded=true}
if(!db.units.some(u=>String(u||'').trim().toLocaleLowerCase('id-ID')==='layanan')){db.units.push('layanan');unitAdded=true}
return{categoryAdded,unitAdded}
}
function renderServiceProductSetting(){
const on=serviceProductEnabled(),row=document.getElementById('serviceProductToggle'),sw=document.getElementById('serviceProductSwitch'),status=document.getElementById('serviceProductStatus');
if(row)row.setAttribute('aria-pressed',String(on));if(sw)sw.classList.toggle('on',on);if(status){status.textContent=(on?'Aktif • Pilih Produk Fisik / Jasa saat tambah produk':'Nonaktif • produk jasa');status.classList.toggle('feature-on',on);status.classList.toggle('feature-off',!on)}
}
function toggleServiceProductFeature(){
if(!db.settings||typeof db.settings!=='object')db.settings={};db.settings.serviceProducts=!serviceProductEnabled();
const on=serviceProductEnabled(),added=on?ensureServiceProductDefaults():{categoryAdded:false,unitAdded:false};save();renderAll();
if(on)toast((added.categoryAdded||added.unitAdded)?'Produk Jasa aktif. Kategori Jasa dan satuan layanan sudah disiapkan.':'Produk Jasa aktif. Pilih Produk Fisik atau Jasa saat Tambah/Edit Produk.');
else toast('Produk Jasa dinonaktifkan. Produk jasa yang sudah tersimpan tetap dipertahankan.')
}
function productKind(p){
const raw=String(p?.productKind||'').toLowerCase();if(['product','service'].includes(raw))return raw;
return String(p?.category||'').trim().toLocaleLowerCase('id-ID')==='jasa'?'service':'product'
}
function optionalFeatureConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.optionalFeatures||typeof db.settings.optionalFeatures!=='object')db.settings.optionalFeatures={production:false,marketOnline:false,courier:false};
const c=db.settings.optionalFeatures;
c.production=!!c.production;c.marketOnline=!!c.marketOnline;c.courier=!!c.courier;c.coupon=c.coupon===true;
for(const k of ['consignment','bundling','points','wholesale','discount'])c[k]=c[k]===true;
return c;
}
function productionMaterialCategoryLocked(name){return optionalFeatureEnabled('production')&&String(name||'').trim().toLocaleLowerCase('id-ID')==='bahan'}
function ensureProductionMaterialCategory(){if(!optionalFeatureEnabled('production'))return false;if(!Array.isArray(db.categories))db.categories=[];if(db.categories.some(c=>String(c||'').trim().toLocaleLowerCase('id-ID')==='bahan'))return false;db.categories.push('Bahan');return true}
const optionalFeatureMeta={ discount:{label:'Setting Diskon',screen:'discount-settings',detail:'diskon produk & transaksi'}, consignment:{label:'Konsinyasi',screen:'consignment',detail:'titipan barang & komisi'},
bundling:{label:'Bundling',screen:'bundle-settings',detail:'paket & harga gabungan'},
points:{label:'Poin Pelanggan',screen:'points-settings',detail:'poin & penukaran hadiah'},
wholesale:{label:'Grosir',screen:'wholesale-settings',detail:'harga & bonus grosir'},
production:{label:'Produksi',screen:'production',detail:'produksi usaha'},
marketOnline:{label:'Market Online',screen:'market-online',detail:'katalog online'}
};
function optionalFeatureEnabled(key){return!!optionalFeatureConfig()[key]}
function optionalFeatureKeyForScreen(screen){if(screen==='market-preview'||screen==='market-orders')return'marketOnline';const hit=Object.entries(optionalFeatureMeta).find(([,v])=>v.screen===screen);return hit?hit[0]:null}
function renderOptionalFeatureSettings(){const c=optionalFeatureConfig();let activeCount=0;Object.entries(optionalFeatureMeta).forEach(([key,m])=>{const on=!!c[key];if(on)activeCount++;const row=document.getElementById('optionalFeatureToggle-'+key),sw=document.getElementById('optionalFeatureSwitch-'+key),status=document.getElementById('optionalFeatureStatus-'+key),menu=document.getElementById('optionalMenu-'+key);if(row)row.setAttribute('aria-pressed',String(on));if(sw)sw.classList.toggle('on',on);if(status){status.textContent=(on?'Aktif':'Nonaktif')+' • '+m.detail;status.classList.toggle('feature-on',on);status.classList.toggle('feature-off',!on)}if(menu)menu.hidden=!on});const multiOn=renderMultiUnitFeatureV685();if(multiOn)activeCount++;const sec=document.getElementById('optionalFeatureMenuSection');if(sec)sec.hidden=activeCount===0}
function multiUnitFeatureEnabledV685(){return db?.settings?.multiUnitsV684?.enabled===true}
function renderMultiUnitFeatureV685(){
 const on=multiUnitFeatureEnabledV685();
 const row=document.getElementById('multiUnitFeatureToggleV685'),sw=document.getElementById('multiUnitFeatureSwitchV685'),status=document.getElementById('multiUnitFeatureStatusV685'),menu=document.getElementById('inposMultiUnitMenuV684');
 if(row)row.setAttribute('aria-pressed',String(on));
 if(sw)sw.classList.toggle('on',on);
 if(status){status.textContent=(on?'Aktif':'Nonaktif')+' • kemasan & konversi stok';status.classList.toggle('feature-on',on);status.classList.toggle('feature-off',!on)}
 if(menu){menu.hidden=!on;menu.setAttribute('aria-hidden',String(!on));}
 return on;
}
function toggleMultiUnitFeatureV685(){
 if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Hanya pengguna dengan akses Pengaturan yang dapat mengubah fitur.','error');
 db.settings=db.settings||{};
 const previous=db.settings.multiUnitsV684;
 const next=previous&&typeof previous==='object'&&!Array.isArray(previous)?{...previous,products:{...(previous.products||{})},enabled:!multiUnitFeatureEnabledV685()}:{enabled:true,products:{}};
 const unitsBefore=[...(db.units||[])];
 db.settings.multiUnitsV684=next;
 if(next.enabled&&!next.unitsSeededV694){
   db.units=Array.isArray(db.units)?db.units:[];
   for(const pack of ['Box','Dus','Karton'])if(!db.units.some(unit=>String(unit).trim().toLowerCase()===pack.toLowerCase()))db.units.push(pack);
   next.unitsSeededV694=true;
 }
 if(!save()){db.settings.multiUnitsV684=previous;db.units=unitsBefore;renderMultiUnitFeatureV685();return toast('Status fitur gagal disimpan.','error')}
 renderOptionalFeatureSettings();renderDashboard();syncDashboardMenuVisibility();
 toast(next.enabled?'Multi Satuan aktif. Pilih Box pada Tambah/Edit Produk untuk mengatur konversi.':'Multi Satuan nonaktif. Data konversi tetap tersimpan.');
}
window.toggleMultiUnitFeatureV685=toggleMultiUnitFeatureV685;
function toggleOptionalFeature(key){
 const meta=optionalFeatureMeta[key];if(!meta)return;
 if(typeof employeeCan==='function'&&!employeeCan('settings'))return toast('Akses Pengaturan diperlukan untuk mengubah fitur.','error');
 const c=optionalFeatureConfig(),before=c[key],oldPoint=db.settings?.points?.enabled,oldWholesale=db.settings?.salesFeatures?.wholesaleEnabled;
 c[key]=!before;
 if(key==='points')pointsConfig().enabled=c[key];
 if(key==='wholesale')salesFeatureConfig().wholesaleEnabled=c[key];
 let materialAdded=false;if(c[key]&&key==='production')materialAdded=ensureProductionMaterialCategory();
 if(save()===false){c[key]=before;if(key==='points')pointsConfig().enabled=oldPoint;if(key==='wholesale')salesFeatureConfig().wholesaleEnabled=oldWholesale;renderOptionalFeatureSettings();return toast('Status fitur gagal disimpan.','error');}
 if(key==='wholesale'||key==='discount'){if(key==='discount'&&!c[key])discount=0;syncCartWholesalePrices();renderCart();if(key==='discount'){renderProducts();renderMobileProductPicker();}}
 if(key==='bundling'){if(!c[key]){cart=cart.filter(item=>!item.bundleId);renderCart();}renderProducts();renderMobileProductPicker();}
 renderOptionalFeatureSettings();renderCommerceFeatureToggles();renderDashboard();syncDashboardMenuVisibility();
 if(!c[key]&&document.getElementById('screen-'+meta.screen)?.classList.contains('active'))go('dashboard');
 if(c[key]&&key==='marketOnline')addAppNotification('market','Market Online aktif','Katalog online dan pengaturan subdomain sekarang tersedia.',{actionScreen:'market-online',key:'market-enabled-'+todayKey()});
 if(c[key]&&key==='production'){renderAll();toast(materialAdded?'Produksi diaktifkan. Kategori Bahan otomatis ditambahkan.':'Produksi diaktifkan. Kategori Bahan tersedia di Setting Kategori.');return;}
 toast(meta.label+(c[key]?' diaktifkan. Tampil di Dashboard.':' dinonaktifkan. Menu disembunyikan.'));
}
function openOptionalFeature(key){const meta=optionalFeatureMeta[key];if(!meta)return;if(!optionalFeatureEnabled(key)){toast(meta.label+' masih nonaktif. Aktifkan dari Modul Opsional.');return}go(meta.screen)}
function productionConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.production||typeof db.settings.production!=='object')db.settings.production={items:[],logs:[]};
const c=db.settings.production;if(!Array.isArray(c.items))c.items=[];if(!Array.isArray(c.logs))c.logs=[];
c.items=c.items.filter(x=>x&&getProduct(Number(x.productId))).map(x=>({productId:Number(x.productId),mode:x.mode==='direct'?'direct':'produce',ingredients:(Array.isArray(x.ingredients)?x.ingredients:[]).filter(i=>i&&getProduct(Number(i.productId))&&Number(i.productId)!==Number(x.productId)).map(i=>({productId:Number(i.productId),qty:Math.max(.01,Number(i.qty)||1)}))}));
return c
}
function productionItem(productId){return productionConfig().items.find(x=>Number(x.productId)===Number(productId))||null}
function productionModeLabel(mode){return mode==='direct'?'Tanpa Produksi':'Produksi Dulu'}
function productionIngredientSubtotal(row){const p=getProduct(Number(row?.productId));if(!p||productProductionType(p)!=='material')return 0;return Math.max(0,Number(p?.cost)||0)*Math.max(0,Number(row?.qty)||0)}
function productionMaterialProducts(outputId=null){return db.products.filter(p=>productProductionType(p)==='material'&&(outputId==null||Number(p.id)!==Number(outputId)))}
function productionHpp(item){return sum((item?.ingredients||[]).filter(row=>{const p=getProduct(Number(row?.productId));return p&&productProductionType(p)==='material'}),productionIngredientSubtotal)}
function productionDraftHpp(){return productionEditorDraft?productionHpp(productionEditorDraft):0}
function startProductionEditor(productId=null){
const cfg=productionConfig(),eligible=db.products.filter(p=>productProductionType(p)==='production'),existing=productId!=null?cfg.items.find(x=>Number(x.productId)===Number(productId)):null;
if(existing){
const p=getProduct(Number(existing.productId));if(!p||productProductionType(p)!=='production')return toast('Produk ini bukan Jenis Produk Produksi.','error');
productionEditorDraft=structuredClone(existing);productionEditorDraft.ingredients=(productionEditorDraft.ingredients||[]).filter(row=>{const ing=getProduct(Number(row.productId));return ing&&productProductionType(ing)==='material'&&Number(ing.id)!==Number(existing.productId)})
}else{
if(!eligible.length)return toast('Belum ada produk dengan Jenis Produk = Produksi. Atur Jenis Produk pada Edit Produk terlebih dahulu.','error');
const used=new Set(cfg.items.map(x=>Number(x.productId))),candidate=eligible.find(p=>!used.has(Number(p.id)));
if(!candidate)return toast('Semua produk Jenis Produk Produksi sudah ditambahkan ke Menu Produksi.');
productionEditorDraft={productId:Number(candidate.id),mode:'produce',ingredients:[]}
}
renderProductionSettings();setTimeout(()=>document.querySelector('#screen-production .feature-setting-body')?.scrollTo({top:0,behavior:'smooth'}),20)
}
function cancelProductionEditor(){productionEditorDraft=null;renderProductionSettings()}
function updateProductionDraftProduct(value){if(!productionEditorDraft)return;const id=Number(value);if(!getProduct(id))return;productionEditorDraft.productId=id;productionEditorDraft.ingredients=(productionEditorDraft.ingredients||[]).filter(x=>Number(x.productId)!==id);renderProductionSettings()}
function updateProductionDraftMode(value){if(!productionEditorDraft)return;productionEditorDraft.mode=value==='direct'?'direct':'produce';renderProductionSettings()}
function addProductionIngredient(){
if(!productionEditorDraft)return;
const used=new Set((productionEditorDraft.ingredients||[]).map(x=>Number(x.productId))),materials=productionMaterialProducts(productionEditorDraft.productId),available=materials.filter(p=>!used.has(Number(p.id)));
if(!materials.length)return toast('Belum ada produk dengan Jenis Produk = Bahan. Tambahkan atau ubah Jenis Produk menjadi Bahan terlebih dahulu.','error');
if(!available.length)return toast('Semua produk Jenis Produk Bahan sudah masuk resep.');
const list=available.map(p=>{const stock=p.noStock?'∞':nominal(Math.max(0,Number(p.stock)||0));return`<button class="production-material-option" type="button" onclick="chooseProductionIngredient(${Number(p.id)})"><span class="production-material-copy"><b>${esc(p.name||'Bahan')}</b><small>● ${nominal(Math.max(0,Number(p.cost)||0))} ● Stok ${stock}</small></span><span class="production-material-add">＋</span></button>`}).join('');
showModal('Pilih Resep Bahan','Nama Bahan ● Harga Modal ● Stok',`<div class="production-material-picker-list">${list}</div>`,[]);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('bundle-picker-overlay');modal?.classList.add('bundle-picker-modal','production-material-picker-modal');
}
function chooseProductionIngredient(productId){
if(!productionEditorDraft)return closeModal();const id=Number(productId),p=getProduct(id);
if(!p||productProductionType(p)!=='material')return toast('Bahan tidak ditemukan.','error');
if((productionEditorDraft.ingredients||[]).some(x=>Number(x.productId)===id))return toast('Bahan tersebut sudah ada di resep.','error');
productionEditorDraft.ingredients.push({productId:id,qty:1});closeModal();renderProductionSettings();
setTimeout(()=>{const list=document.querySelector('#screen-production .production-ingredient-list');list?.lastElementChild?.scrollIntoView({behavior:'smooth',block:'nearest'})},30)
}
function changeProductionIngredient(index,productId){if(!productionEditorDraft)return;const id=Number(productId),ingredient=getProduct(id);if(!ingredient||productProductionType(ingredient)!=='material')return toast('Resep hanya dapat menggunakan produk dengan Jenis Produk = Bahan.','error');if(id===Number(productionEditorDraft.productId))return toast('Produk hasil tidak bisa menjadi bahan dirinya sendiri.','error');if((productionEditorDraft.ingredients||[]).some((x,i)=>i!==index&&Number(x.productId)===id))return toast('Bahan tersebut sudah ada di resep.','error');productionEditorDraft.ingredients[index].productId=id;renderProductionSettings()}
function changeProductionIngredientQty(index,value){if(!productionEditorDraft?.ingredients?.[index])return;productionEditorDraft.ingredients[index].qty=Math.max(.01,Number(value)||.01);renderProductionHppLive()}
function removeProductionIngredient(index){if(!productionEditorDraft)return;productionEditorDraft.ingredients.splice(index,1);renderProductionSettings()}
function renderProductionHppLive(){
if(!productionEditorDraft)return;const total=productionDraftHpp(),totalEl=document.getElementById('productionDraftHpp');if(totalEl)totalEl.textContent=rupiah(total);
(productionEditorDraft.ingredients||[]).forEach((row,i)=>{const qty=document.querySelector(`[data-production-qty="${i}"]`);if(qty)row.qty=Math.max(.01,Number(qty.value)||.01);const sub=document.querySelector(`[data-production-subtotal="${i}"]`);if(sub)sub.textContent=rupiah(productionIngredientSubtotal(row))});if(totalEl)totalEl.textContent=rupiah(productionDraftHpp())
}
function saveProductionRecipe(){
if(!productionEditorDraft)return;renderProductionHppLive();const p=getProduct(Number(productionEditorDraft.productId));if(!p)return toast('Produk tidak ditemukan.','error');
if(productProductionType(p)!=='production')return toast('Hanya produk dengan Jenis Produk = Produksi yang dapat ditambahkan.','error');
const ingredients=(productionEditorDraft.ingredients||[]).filter(x=>{const ing=getProduct(Number(x.productId));return ing&&productProductionType(ing)==='material'&&Number(x.productId)!==Number(p.id)&&Number(x.qty)>0});if(!ingredients.length)return toast('Tambahkan minimal 1 produk dengan Jenis Produk = Bahan pada resep.','error');
const cfg=productionConfig(),next={productId:Number(p.id),mode:productionEditorDraft.mode==='direct'?'direct':'produce',ingredients};const idx=cfg.items.findIndex(x=>Number(x.productId)===Number(p.id));if(idx>=0)cfg.items[idx]=next;else cfg.items.push(next);p.productionType='production';
productionEditorDraft=null;save();renderProductionSettings();toast('Produk produksi dan resep disimpan.')
}
function deleteProductionProduct(productId){const p=getProduct(Number(productId));showModal('Hapus dari Produksi',p?.name||'Produk','Produk tetap ada di Produk & Stok. Hanya pengaturan produksi dan resepnya yang dihapus.',[{label:'Batal',close:true},{label:'Hapus',danger:true,fn:()=>{const cfg=productionConfig();cfg.items=cfg.items.filter(x=>Number(x.productId)!==Number(productId));save();closeModal();renderProductionSettings();toast('Pengaturan produksi dihapus.')}}])}
function productionIngredientOptions(selected,outputId){return productionMaterialProducts(outputId).map(p=>`<option value="${p.id}" ${Number(selected)===Number(p.id)?'selected':''}>${esc(p.name)} ● ${nominal(Math.max(0,Number(p.cost)||0))} ● Stok ${p.noStock?'∞':nominal(Math.max(0,Number(p.stock)||0))}</option>`).join('')}
function productionEditorHTML(){
if(!productionEditorDraft)return'';const cfg=productionConfig(),editing=cfg.items.some(x=>Number(x.productId)===Number(productionEditorDraft.productId)),used=new Set(cfg.items.map(x=>Number(x.productId))),options=db.products.filter(p=>productProductionType(p)==='production'&&(editing?Number(p.id)===Number(productionEditorDraft.productId):!used.has(Number(p.id)))).map(p=>`<option value="${p.id}" ${Number(p.id)===Number(productionEditorDraft.productId)?'selected':''}>${esc(p.name)}</option>`).join('');
const rows=(productionEditorDraft.ingredients||[]).map((row,i)=>{const p=getProduct(Number(row.productId)),subtotal=productionIngredientSubtotal(row);return`<div class="production-ingredient-row"><div class="production-ingredient-main"><select aria-label="Bahan ${i+1}" onchange="changeProductionIngredient(${i},this.value)">${productionIngredientOptions(row.productId,productionEditorDraft.productId)}</select><small>${esc(p?.unit||'pcs')} • Harga <b>${rupiah(p?.cost||0)}</b> • Stok <b>${p?.noStock?'∞':nominal(Math.max(0,Number(p?.stock)||0))}</b> • Subtotal <b data-production-subtotal="${i}">${rupiah(subtotal)}</b></small></div><div class="production-ingredient-qty"><span>Qty</span><input data-production-qty="${i}" type="number" min="0.01" step="0.01" value="${Number(row.qty)||1}" oninput="changeProductionIngredientQty(${i},this.value)"></div><button class="production-remove" type="button" onclick="removeProductionIngredient(${i})" aria-label="Hapus bahan">×</button></div>`}).join('');
return`<div class="feature-setting-card production-editor-card"><div class="production-card-head"><div><h3>${editing?'Edit Produk Produksi':'Tambah Produk Produksi'}</h3><p>Pilih alur produksi. Resep bahan tetap tersedia untuk Produksi Dulu maupun Tanpa Produksi.</p></div><button class="btn btn-sm" type="button" onclick="cancelProductionEditor()">Batal</button></div><div class="production-editor-grid"><div class="field"><label>Produk</label><select ${editing?'disabled':''} onchange="updateProductionDraftProduct(this.value)">${options}</select></div><div class="field"><label>Jenis Produksi</label><select onchange="updateProductionDraftMode(this.value)"><option value="produce" ${productionEditorDraft.mode!=='direct'?'selected':''}>Produksi Dulu</option><option value="direct" ${productionEditorDraft.mode==='direct'?'selected':''}>Tanpa Produksi</option></select></div></div><div class="production-mode-note ${productionEditorDraft.mode==='direct'?'direct':''}">${productionEditorDraft.mode==='direct'?'Tanpa Produksi: produk tidak perlu dibuat sebagai stok hasil terlebih dahulu, tetapi resep bahan dan HPP tetap tercatat.':'Produksi Dulu: bahan dikurangi dan stok produk jadi bertambah saat proses Produksi dijalankan.'}</div><div class="production-recipe-head"><div><b>Resep Bahan</b><small>Hanya produk dengan Jenis Produk = Bahan. Harga memakai Harga Modal.</small></div><button class="btn btn-sm" type="button" onclick="addProductionIngredient()">+ Bahan</button></div><div class="production-ingredient-list">${rows||'<div class="production-empty-recipe">Belum ada bahan. Tekan <b>+ Bahan</b> untuk membuat resep.</div>'}</div><div class="production-hpp-total"><span>Total HPP Resep</span><strong id="productionDraftHpp">${rupiah(productionDraftHpp())}</strong></div><div class="feature-actions"><button class="btn btn-primary" type="button" onclick="saveProductionRecipe()">Simpan Produk & Resep</button></div></div>`
}
function renderProductionSettings(){
const el=document.getElementById('productionSettingsBody');if(!el)return;const cfg=productionConfig(),items=cfg.items.filter(x=>{const p=getProduct(Number(x.productId));return p&&productProductionType(p)==='production'}),produceCount=items.filter(x=>x.mode!=='direct').length,directCount=items.length-produceCount;
const list=items.length?items.map(item=>{const p=getProduct(Number(item.productId)),hpp=productionHpp(item),mode=item.mode==='direct'?'direct':'produce';return`<div class="production-product-card"><div class="production-product-info"><div class="production-product-title"><b>${esc(p?.name||'Produk')}</b><span class="production-mode-badge ${mode}">${productionModeLabel(mode)}</span></div><small>${(item.ingredients||[]).length} bahan • Stok ${p?.noStock?'Tanpa Stok':nominal(p?.stock||0)+' '+esc(p?.unit||'pcs')}</small><div class="production-hpp-inline"><span>Total HPP</span><strong>${rupiah(hpp)}</strong></div></div><div class="production-product-actions">${mode==='produce'?`<button class="btn btn-primary btn-sm" onclick="openProductionRun(${p.id})">Produksi</button>`:''}<button class="btn btn-sm" onclick="startProductionEditor(${p.id})">Resep</button><button class="btn btn-sm production-delete-btn" onclick="deleteProductionProduct(${p.id})">Hapus</button></div></div>`}).join(''):'<div class="production-empty">Belum ada produk produksi. Tambahkan produk lalu tentukan Produksi Dulu atau Tanpa Produksi.</div>';
const today=todayKey(),todayLogs=(cfg.logs||[]).filter(x=>dateKey(x.time)===today),todayQty=sum(todayLogs,x=>x.qty||0),recent=todayLogs.map(x=>{const p=getProduct(Number(x.productId));return`<div class="production-log-row production-log-row-v513"><span><b>${esc(x.productName||p?.name||'Produk')}</b><small>${new Date(x.time).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})} • ${nominal(x.qty)} ${esc(x.unit||p?.unit||'pcs')}</small></span><strong>${rupiah(x.hpp||0)}</strong><button type="button" class="production-receipt-btn-v513" title="Cetak / Share PNG" aria-label="Cetak atau Share proses produksi" onclick="openProductionReceiptV513(decodeURIComponent('${encodeURIComponent(String(x.id||''))}'))">${productionReceiptIconV513()}</button></div>`}).join('');
el.innerHTML=`${productionEditorHTML()}<div class="production-summary"><div><span>Produk Produksi</span><b>${items.length}</b></div><div><span>Produksi Dulu</span><b>${produceCount}</b></div><div><span>Tanpa Produksi</span><b>${directCount}</b></div></div><div class="feature-setting-card"><div class="production-card-head"><div><h3>Produk Produksi & Resep</h3><p>Resep bahan tersedia pada kedua jenis produksi. Total HPP dihitung otomatis dari Harga Modal × Qty bahan.</p></div><button class="btn btn-primary btn-sm" type="button" onclick="startProductionEditor()">+ Produk</button></div><div class="production-product-list">${list}</div></div><div class="feature-setting-card"><h3>Produksi Hari Ini</h3><p>Riwayat hasil untuk produk dengan jenis Produksi Dulu.</p><div class="production-today-summary"><span>Total hasil hari ini</span><b>${nominal(todayQty)} unit</b></div><div class="production-log-list">${recent||'<div class="production-empty small">Belum ada proses produksi hari ini.</div>'}</div></div>`
}
function openProductionRun(productId){
const item=productionItem(productId),p=getProduct(Number(productId));if(!item||!p)return toast('Resep produksi tidak ditemukan.','error');if(item.mode==='direct')return toast('Produk ini menggunakan Tanpa Produksi.');const materialIngredients=(item.ingredients||[]).filter(row=>{const ing=getProduct(Number(row.productId));return ing&&productProductionType(ing)==='material'});if(!materialIngredients.length)return toast('Resep bahan masih kosong. Tambahkan produk dengan Jenis Produk = Bahan.','error');const hpp=productionHpp(item),rows=materialIngredients.map(row=>{const ing=getProduct(Number(row.productId));return`<div class="production-run-row"><span>${esc(ing?.name||'Bahan')}<small>${Number(row.qty)} ${esc(ing?.unit||'pcs')} / produk</small></span><b>${rupiah(productionIngredientSubtotal(row))}</b></div>`}).join('');showModal('Produksi Sekarang',p.name,`<div class="field"><label>Jumlah Hasil Produksi</label><input id="productionRunQty" type="number" min="0.01" step="0.01" value="1" oninput="updateProductionRunPreview(${p.id})"></div><div class="production-run-list">${rows}</div><div class="production-hpp-total"><span>Total HPP / Produk</span><strong>${rupiah(hpp)}</strong></div><div class="production-hpp-total secondary"><span>Total HPP Produksi</span><strong id="productionRunTotalHpp">${rupiah(hpp)}</strong></div>${productionRunPriceHTMLV513(p,hpp)}`,[{label:'Batal',close:true},{label:'Proses Produksi',primary:true,fn:()=>executeProduction(p.id)}],true)}
function updateProductionRunPreview(productId){const item=productionItem(productId),qty=Math.max(.01,Number(document.getElementById('productionRunQty')?.value)||.01),el=document.getElementById('productionRunTotalHpp');if(el)el.textContent=rupiah(productionHpp(item)*qty);refreshProductionRunPriceV513(productId,qty)}
function executeProduction(productId){
const item=productionItem(productId),p=getProduct(Number(productId)),qty=Math.max(.01,Number(document.getElementById('productionRunQty')?.value)||0);if(!item||!p||qty<=0)return toast('Jumlah produksi tidak valid.','error');
const ingredients=(item.ingredients||[]).filter(row=>{const ing=getProduct(Number(row.productId));return ing&&productProductionType(ing)==='material'});if(!ingredients.length)return toast('Resep belum memiliki produk dengan Jenis Produk = Bahan.','error');const shortages=ingredients.map(row=>{const ing=getProduct(Number(row.productId)),need=(Number(row.qty)||0)*qty;return{ing,need}}).filter(x=>x.ing&&!x.ing.noStock&&Number(x.ing.stock)<x.need);if(shortages.length)return toast('Stok bahan kurang: '+shortages.map(x=>x.ing.name).join(', ')+'.','error');
const materials=ingredients.map(row=>{const ing=getProduct(Number(row.productId)),used=(Number(row.qty)||0)*qty,cost=Math.max(0,Number(ing?.cost)||0);return{productId:Number(row.productId),name:String(ing?.name||'Bahan'),unit:String(ing?.unit||'pcs'),qty:used,cost,hpp:used*cost}});
const hpp=productionHpp(item),oldStock=Math.max(0,Number(p.stock)||0),oldCost=Math.max(0,Number(p.cost)||0);
const priceChoice=readProductionRunPriceV513(p,hpp,qty,oldStock,oldCost);if(!priceChoice)return;
ingredients.forEach(row=>{const ing=getProduct(Number(row.productId));if(ing&&!ing.noStock)ing.stock=Math.max(0,Number(ing.stock||0)-(Number(row.qty)||0)*qty)});if(!p.noStock)p.stock=oldStock+qty;
if(priceChoice.applyAverage)p.cost=priceChoice.averageCost;
if(priceChoice.changeSelling)p.price=priceChoice.sellingPrice;
productionConfig().logs.unshift({id:uid('PRD'),time:new Date().toISOString(),productId:Number(p.id),productName:String(p.name||'Produk'),unit:String(p.unit||'pcs'),qty,hpp:hpp*qty,materials});productionConfig().logs=productionConfig().logs.slice(0,2000);save();closeModal();renderAll();toast(`Produksi ${p.name} ${nominal(qty)} ${p.unit||'pcs'} berhasil.`)
}
function marketOnlineConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.marketOnline||typeof db.settings.marketOnline!=='object')db.settings.marketOnline={};
const c=db.settings.marketOnline;
c.subdomain=storeSlug(c.subdomain||db.settings.store);
c.showStock=c.showStock!==false;
c.showOrderButton=c.showOrderButton!==false;
c.themeColor=/^#[0-9a-f]{6}$/i.test(String(c.themeColor||''))?String(c.themeColor).toLowerCase():'#dc2626';
c.infoText=String(c.infoText||'').slice(0,180);
c.whatsapp=normalizeMarketPhone(c.whatsapp||db.settings.phone||'');
c.shippingFee=Math.max(0,Number(c.shippingFee)||0);
if(!Array.isArray(c.orders))c.orders=[];
return c
}
function marketOnlineUrl(slug){const s=storeSlug(slug||marketOnlineConfig().subdomain);return`https://toko.inpos.id/${encodeURIComponent(s)}`}
function normalizeMarketPhone(value){let n=String(value||'').replace(/\D/g,'');if(n.startsWith('0'))n='62'+n.slice(1);else if(n.startsWith('8'))n='62'+n;return n}
function marketSafeColor(value){const v=String(value||'').trim();return/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():'#dc2626'}
function marketStoreStatus(){return marketOnlineConfig().showOrderButton?'Buka':'Tutup'}
function marketProductAvailable(p){return!!p&&(p.noStock||Number(p.stock)>0)}
function marketProductOnlineEnabled(p){return!!p&&p.active!==false&&p.marketOnline!==false}
function toggleProductMarketOnline(id,event){
event?.preventDefault?.();event?.stopPropagation?.();
const p=getProduct(Number(id));if(!p)return toast('Produk tidak ditemukan.','error');
if(p.active===false)return toast('Aktifkan produk terlebih dahulu untuk menampilkannya di Toko Online.','error');
if(!optionalFeatureEnabled('marketOnline'))return toast('Fitur Market Online masih nonaktif.','error');
const previousOnline=p.marketOnline;p.marketOnline=!marketProductOnlineEnabled(p);if(!save()){p.marketOnline=previousOnline;return toast('Status Toko Online gagal disimpan. Coba lagi.','error')}renderStock();renderDashboard();
if(document.getElementById('screen-market-preview')?.classList.contains('active'))renderMarketPreview();
toast(p.marketOnline?`${p.name} tampil di Market Online.`:`${p.name} disembunyikan dari Market Online.`)
}
function setAllProductsMarketOnline(){
if(!optionalFeatureEnabled('marketOnline'))return toast('Fitur Market Online masih nonaktif.','error');
const rows=(db.products||[]).filter(p=>p&&typeof p==='object');
if(!rows.length)return toast('Belum ada produk.','error');
const allOnline=rows.every(marketProductOnlineEnabled),next=!allOnline;
const beforeOnline=rows.map(p=>p.marketOnline);rows.forEach(p=>p.marketOnline=next);if(!save()){rows.forEach((p,i)=>{if(beforeOnline[i]===undefined)delete p.marketOnline;else p.marketOnline=beforeOnline[i]});return toast('Pengaturan produk Toko Online gagal disimpan. Tidak ada perubahan.','error')}renderStock();renderDashboard();
if(document.getElementById('screen-market-preview')?.classList.contains('active'))renderMarketPreview();
toast(`${rows.length} produk diset ${next?'Online':'Offline'} di Market Online.`)
}
function marketCatalogProducts(query=''){const q=String(query||'').trim().toLowerCase();const list=(db.products||[]).filter(p=>p&&typeof p==='object'&&marketProductOnlineEnabled(p));if(!q)return list;return list.filter(p=>[p.name,p.barcode,p.category,p.unit,...(p.multiBarcodeEnabled&&Array.isArray(p.barcodes)?p.barcodes:[])].some(v=>String(v||'').toLowerCase().includes(q)))}
function updateMarketSubdomainPreview(){
const input=document.getElementById('marketSubdomainInput');if(!input)return;
const cleaned=subdomainSlug(input.value);if(input.value!==cleaned)input.value=cleaned;
const url=marketOnlineUrl(cleaned||'tokomu');
const out=document.getElementById('marketSubdomainPreview');if(out)out.textContent=url;
const valid=document.getElementById('marketSubdomainValidation');
if(valid){const ok=cleaned.length>=3;valid.textContent=ok?'Nama URL valid':'Minimal 3 karakter';valid.classList.toggle('on',ok);valid.classList.toggle('error',!ok)}
}
function syncMarketStoreStatusUI(){
const c=marketOnlineConfig(),status=marketStoreStatus(),badge=document.getElementById('marketStoreStatusBadge');
if(badge){badge.textContent=`Toko ${status}`;badge.classList.toggle('on',c.showOrderButton);badge.classList.toggle('closed',!c.showOrderButton)}
const help=document.getElementById('marketStoreStatusHelp');if(help)help.textContent=c.showOrderButton?'Tombol Pesan aktif • toko menerima pesanan':'Tombol Pesan nonaktif • toko tidak menerima pesanan';
}
function updateMarketWebSetting(key,value){
const c=marketOnlineConfig();
if(key==='themeColor')c.themeColor=marketSafeColor(value);
if(key==='infoText')c.infoText=String(value||'').slice(0,180);
if(key==='whatsapp')c.whatsapp=normalizeMarketPhone(value);
if(key==='shippingFee')c.shippingFee=Math.max(0,parseNominal(value));
save();
const colorText=document.getElementById('marketThemeColorText');if(colorText&&key==='themeColor')colorText.value=c.themeColor;
if(document.getElementById('screen-market-preview')?.classList.contains('active'))renderMarketPreview();
}
function setMarketThemeColor(value){const c=marketOnlineConfig();c.themeColor=marketSafeColor(value);save();const picker=document.getElementById('marketThemeColor'),txt=document.getElementById('marketThemeColorText');if(picker)picker.value=c.themeColor;if(txt)txt.value=c.themeColor;if(document.getElementById('screen-market-preview')?.classList.contains('active'))renderMarketPreview()}
function updateMarketCatalogSetting(key,checked){
const c=marketOnlineConfig();if(key==='showStock')c.showStock=!!checked;if(key==='showOrderButton')c.showOrderButton=!!checked;save();syncMarketStoreStatusUI();renderDashboard();
if(document.getElementById('screen-market-preview')?.classList.contains('active'))renderMarketPreview();
}
function saveMarketOnlineSettings(options={}){
const input=document.getElementById('marketSubdomainInput');
const current=marketOnlineConfig();
const slug=subdomainSlug(input?.value||current.subdomain);
if(slug.length<3){if(!options.silent)toast('Nama URL toko minimal 3 karakter.','error');updateMarketSubdomainPreview();return false}
current.subdomain=slug;
const stock=document.getElementById('marketShowStock'),order=document.getElementById('marketShowOrderButton'),color=document.getElementById('marketThemeColor'),info=document.getElementById('marketInfoText'),wa=document.getElementById('marketWhatsapp'),shipping=document.getElementById('marketShippingFee');
if(stock)current.showStock=!!stock.checked;if(order)current.showOrderButton=!!order.checked;
if(color)current.themeColor=marketSafeColor(color.value);if(info)current.infoText=String(info.value||'').trim().slice(0,180);if(wa)current.whatsapp=normalizeMarketPhone(wa.value);if(shipping)current.shippingFee=Math.max(0,parseNominal(shipping.value));
if(current.showOrderButton&&!current.whatsapp){if(!options.silent)toast('Nomor WhatsApp wajib diisi saat toko menerima pesanan.','error');return false}
save();
if(input)input.value=slug;updateMarketSubdomainPreview();syncMarketStoreStatusUI();renderDashboard();
if(!options.silent)toast('Pengaturan Web Toko disimpan.');
return true
}
function copyMarketOnlineUrl(){
const typed=subdomainSlug(document.getElementById('marketSubdomainInput')?.value);
const slug=typed.length>=3?typed:marketOnlineConfig().subdomain,url=marketOnlineUrl(slug);
const done=()=>toast('Link Web Toko disalin.');
if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(done).catch(()=>fallbackCopyText(url,done));else fallbackCopyText(url,done)
}
function marketPendingOrderCount(){return(marketOnlineConfig().orders||[]).filter(o=>!['done','completed','complete','selesai','cancelled','canceled','batal'].includes(String(o?.status||'new').toLowerCase())).length}
function renderMarketOnlineSettings(){
const el=document.getElementById('marketOnlineSettingsBody');if(!el)return;const c=marketOnlineConfig(),url=marketOnlineUrl(),status=marketStoreStatus();
el.innerHTML=`<div class="market-online-grid"><div class="feature-setting-card"><h3>Web Toko & Alamat Toko</h3><p>Buat alamat katalog online dan kelola identitas Web Toko INPOS.</p><div class="field"><label>Nama URL Toko</label><div class="market-domain-box"><span class="market-domain-suffix">toko.inpos.id/</span><input id="marketSubdomainInput" value="${esc(c.subdomain)}" placeholder="namatoko" inputmode="url" autocomplete="off" oninput="updateMarketSubdomainPreview()"></div></div><div class="market-url-preview"><span id="marketSubdomainPreview">${esc(url)}</span><button type="button" onclick="copyMarketOnlineUrl()">Salin</button></div><div class="market-status-row"><span class="market-status-pill on" id="marketSubdomainValidation">Nama URL valid</span><span class="market-status-pill">${db.products.length} produk POS</span><span class="market-status-pill ${c.showOrderButton?'on':'closed'}" id="marketStoreStatusBadge">Toko ${status}</span></div><div class="market-online-actions"><button class="btn" type="button" onclick="openMarketPreview()">Preview Web</button><button class="btn btn-primary" type="button" onclick="saveMarketOnlineSettings()">Simpan Web Toko</button></div><p class="market-note">Status toko mengikuti Tombol Pesan: dicentang = <b>Buka</b>, tidak dicentang = <b>Tutup</b>.</p></div><div class="feature-setting-card market-web-custom-card"><h3>Tampilan Web Toko</h3><p>Atur warna, info berjalan, status pesanan, dan WhatsApp penerima pesanan.</p><div class="market-theme-row"><div class="field"><label>Ganti Warna Web Toko</label><div class="market-color-field"><input id="marketThemeColor" type="color" value="${esc(c.themeColor)}" onchange="setMarketThemeColor(this.value)"><input id="marketThemeColorText" type="text" value="${esc(c.themeColor)}" maxlength="7" inputmode="text" onchange="setMarketThemeColor(this.value)"></div></div><div class="market-color-presets" aria-label="Pilihan warna"><button type="button" style="--c:#dc2626" onclick="setMarketThemeColor('#dc2626')"></button><button type="button" style="--c:#2563eb" onclick="setMarketThemeColor('#2563eb')"></button><button type="button" style="--c:#15803d" onclick="setMarketThemeColor('#15803d')"></button><button type="button" style="--c:#7c3aed" onclick="setMarketThemeColor('#7c3aed')"></button><button type="button" style="--c:#ea580c" onclick="setMarketThemeColor('#ea580c')"></button></div></div><div class="field"><label>Info • Teks Berjalan di Web Toko</label><input id="marketInfoText" type="text" maxlength="180" value="${esc(c.infoText)}" placeholder="Contoh: Gratis ongkir minimal Rp100.000" oninput="updateMarketWebSetting('infoText',this.value)"></div><div class="field"><label>Nomor WhatsApp Penerima Pesanan</label><input id="marketWhatsapp" type="tel" inputmode="tel" value="${esc(c.whatsapp)}" placeholder="08xxxxxxxxxx" onchange="updateMarketWebSetting('whatsapp',this.value)"><small class="market-field-help">Pesanan dari Web Toko disimpan ke Pesanan Online lalu detailnya dikirim ke nomor ini melalui WhatsApp.</small></div><div class="field"><label>Biaya Ongkir Web Toko</label><input id="marketShippingFee" class="nominal-input" type="text" inputmode="numeric" value="${nominal(c.shippingFee||0)}" placeholder="0" onchange="updateMarketWebSetting('shippingFee',this.value);this.value=nominal(marketOnlineConfig().shippingFee)"><small class="market-field-help">Otomatis masuk ke Detail Pesanan Web Toko. Isi 0 untuk Gratis Ongkir.</small></div><label class="more-list-item more-feature-toggle-item" style="margin-top:8px"><span class="more-list-icon">▦</span><span class="more-list-copy"><b>Tampilkan Stok</b><small>Jumlah stok tampil pada setiap produk</small></span><input id="marketShowStock" type="checkbox" ${c.showStock?'checked':''} style="width:20px;height:20px" onchange="updateMarketCatalogSetting('showStock',this.checked)"></label><label class="more-list-item more-feature-toggle-item" style="margin-top:7px"><span class="more-list-icon">↗</span><span class="more-list-copy"><b>Tombol Pesan</b><small id="marketStoreStatusHelp">${c.showOrderButton?'Tombol Pesan aktif • toko menerima pesanan':'Tombol Pesan nonaktif • toko tidak menerima pesanan'}</small></span><input id="marketShowOrderButton" type="checkbox" ${c.showOrderButton?'checked':''} style="width:20px;height:20px" onchange="updateMarketCatalogSetting('showOrderButton',this.checked)"></label></div></div>`;
updateMarketSubdomainPreview();syncMarketStoreStatusUI()
}
let marketPreviewCart=[];
let marketPreviewStep=1;
let marketPreviewCustomerDraft={name:'',phone:'',note:''};
let marketPreviewQtyProductId=null,marketPreviewQtyDraft=1;
function marketPreviewCartEntry(productId){return marketPreviewCart.find(x=>Number(x.productId)===Number(productId))||null}
function marketPreviewCartCount(){return marketPreviewCart.reduce((n,x)=>n+Math.max(1,Number(x.qty)||1),0)}
function marketPreviewCartProductCount(){return marketPreviewCart.length}
function marketPreviewCartKnownTotal(){return marketPreviewCart.reduce((n,x)=>{const p=getProduct(Number(x.productId));return n+(p&&!p.manualPrice?Math.max(0,Number(p.price)||0)*Math.max(1,Number(x.qty)||1):0)},0)}
function marketPreviewCartHasManualPrice(){return marketPreviewCart.some(x=>getProduct(Number(x.productId))?.manualPrice)}
function marketPreviewProductHTML(p){
const c=marketOnlineConfig(),visual=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:esc(p.emoji||'📦'),price=p.manualPrice?'Harga sesuai pilihan':rupiah(p.price||0),stock=p.noStock?'Tersedia':`Stok ${nominal(p.stock||0)}`,available=marketProductAvailable(p),cart=marketPreviewCartEntry(p.id),cartQty=Math.max(0,Number(cart?.qty)||0);
return`<article class="market-store-product"><div class="market-store-visual">${visual}</div><h4>${esc(p.name)}</h4><div class="cat">${esc(p.category||'Umum')} • ${esc(p.unit||'pcs')}</div><div class="price">${price}</div>${c.showStock?`<div class="stock${available?'':' out'}">${available?stock:'Stok Habis'}</div>`:''}${c.showOrderButton?`<button type="button" class="market-product-order-btn ${cartQty?'in-cart':''}" ${available?'':`disabled aria-disabled="true"`} onclick="marketOrderProduct(${Number(p.id)})">${available?'Pesan':'Habis'}${cartQty?`<span class="market-product-order-count">${cartQty}</span>`:''}</button>`:''}</article>`
}
function renderMarketPreviewProducts(query=''){
const grid=document.getElementById('marketStoreProducts'),count=document.getElementById('marketStoreProductCount');if(!grid)return;
const products=marketCatalogProducts(query).slice(0,48);if(count)count.textContent=`${products.length} produk`;
grid.innerHTML=products.length?products.map(marketPreviewProductHTML).join(''):'<div style="grid-column:1/-1;padding:30px 12px;text-align:center;color:#777">Produk tidak ditemukan.</div>'
}
function filterMarketPreviewProducts(value){renderMarketPreviewProducts(value)}
function marketPreviewCartBarHTML(){
const count=marketPreviewCartCount(),products=marketPreviewCartProductCount(),known=marketPreviewCartKnownTotal(),manual=marketPreviewCartHasManualPrice();
return`<div class="market-preview-cartbar" id="marketPreviewCartBar" ${count?'':'hidden'}><div class="market-preview-cartbar-copy"><b>${count} item • ${products} produk</b><small>${manual?`${rupiah(known)} + harga sesuai pilihan`:rupiah(known)}</small></div><button type="button" onclick="marketPreviewCheckout()">Lanjut Pesan ›</button></div>`
}
function renderMarketPreview(){
const c=marketOnlineConfig(),url=marketOnlineUrl(),target=document.getElementById('marketStorefrontPreview'),u1=document.getElementById('marketPreviewToolbarUrl'),u2=document.getElementById('marketPreviewBrowserUrl'),status=marketStoreStatus();
if(u1)u1.textContent=url;if(u2)u2.textContent=url;if(!target)return;
target.style.setProperty('--market-accent',c.themeColor);
if(marketPreviewStep===2){renderMarketPreviewCheckout();return}
target.innerHTML=`${c.infoText?`<div class="market-store-ticker"><div>${esc(c.infoText)} <span>•</span> ${esc(c.infoText)} <span>•</span> ${esc(c.infoText)}</div></div>`:''}<div class="market-store-hero"><div class="market-store-status ${c.showOrderButton?'open':'closed'}"><i></i>Toko ${status}</div><small>Belanja online lebih mudah</small><h2>${esc(db.settings.store||'Toko Online')}</h2><p>${esc(db.settings.address||'Katalog produk tersedia untuk dipesan')}</p><div class="market-store-search"><span>⌕</span><input id="marketPreviewSearch" type="search" placeholder="Cari produk di ${esc(db.settings.store||'toko')}..." oninput="filterMarketPreviewProducts(this.value)" autocomplete="off"></div></div><div class="market-store-body"><div class="market-store-section-head"><b>Produk Pilihan</b><small id="marketStoreProductCount">0 produk</small></div><div class="market-store-products" id="marketStoreProducts"></div>${marketPreviewCartBarHTML()}</div><div class="market-store-footer">${esc(db.settings.store||'INPOS Store')} • ${esc(url.replace('https://',''))}</div>`;
renderMarketPreviewProducts('')
}
function openMarketPreview(){if(!saveMarketOnlineSettings({silent:true}))return;marketPreviewStep=1;marketPreviewCart=[];marketPreviewCustomerDraft={name:'',phone:'',note:''};go('market-preview');renderMarketPreview()}
function marketOrderProduct(id){
const c=marketOnlineConfig(),p=getProduct(Number(id));if(!p)return toast('Produk tidak ditemukan.','error');if(!marketProductOnlineEnabled(p))return toast('Produk ini sedang offline dari Market Online.','error');if(!c.showOrderButton)return toast('Toko sedang tutup. Tombol Pesan dinonaktifkan.','error');if(!marketProductAvailable(p))return toast('Stok produk sedang habis.','error');if(!c.whatsapp)return toast('Nomor WhatsApp penerima pesanan belum diatur.','error');
const row=marketPreviewCartEntry(p.id),max=p.noStock?999:Math.max(1,Math.floor(Number(p.stock)||0));marketPreviewQtyProductId=Number(p.id);marketPreviewQtyDraft=Math.max(1,Math.min(max,Math.round(Number(row?.qty)||1)));renderMarketQtyPicker()
}
function marketQtyPickerMax(p){return p?.noStock?999:Math.max(1,Math.floor(Number(p?.stock)||0))}
function renderMarketQtyPicker(){
document.getElementById('marketQtyPickerOverlay')?.remove();const p=getProduct(Number(marketPreviewQtyProductId));if(!p)return;const target=document.getElementById('marketStorefrontPreview');if(!target)return;const row=marketPreviewCartEntry(p.id),max=marketQtyPickerMax(p),qty=Math.max(1,Math.min(max,Math.round(Number(marketPreviewQtyDraft)||1))),visual=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:esc(p.emoji||'📦');marketPreviewQtyDraft=qty;
target.insertAdjacentHTML('beforeend',`<div class="market-qty-overlay" id="marketQtyPickerOverlay" role="dialog" aria-modal="true" aria-label="Pilih jumlah ${esc(p.name)}" onclick="if(event.target===this)marketCloseQtyPicker()"><div class="market-qty-card"><div class="market-qty-head"><div class="market-qty-visual">${visual}</div><div><b>${esc(p.name)}</b><small>${p.manualPrice?'Harga sesuai pilihan':rupiah(p.price||0)} • ${esc(p.unit||'pcs')}</small></div><button type="button" onclick="marketCloseQtyPicker()" aria-label="Tutup">×</button></div><div class="market-qty-label">Jumlah Pesanan</div><div class="market-qty-control"><button type="button" onclick="marketQtyPickerChange(-1)" aria-label="Kurangi">−</button><strong id="marketQtyPickerValue">${qty}</strong><button type="button" onclick="marketQtyPickerChange(1)" aria-label="Tambah">+</button></div><small class="market-qty-stock">${p.noStock?'Produk selalu tersedia':`Maksimal ${max} ${esc(p.unit||'pcs')} sesuai stok`}</small><div class="market-qty-actions">${row?`<button type="button" class="danger" onclick="marketRemoveQtyProduct()">Hapus</button>`:'<span></span>'}<button type="button" class="primary" onclick="marketConfirmQtyProduct()">${row?'Simpan Qty':'Tambah Produk'}</button></div></div></div>`)
}
function marketQtyPickerChange(delta){const p=getProduct(Number(marketPreviewQtyProductId));if(!p)return;const max=marketQtyPickerMax(p);marketPreviewQtyDraft=Math.max(1,Math.min(max,Math.round(Number(marketPreviewQtyDraft)||1)+Number(delta||0)));const el=document.getElementById('marketQtyPickerValue');if(el)el.textContent=String(marketPreviewQtyDraft)}
function marketCloseQtyPicker(){document.getElementById('marketQtyPickerOverlay')?.remove();marketPreviewQtyProductId=null;marketPreviewQtyDraft=1}
function marketConfirmQtyProduct(){const p=getProduct(Number(marketPreviewQtyProductId));if(!p)return marketCloseQtyPicker();const max=marketQtyPickerMax(p),qty=Math.max(1,Math.min(max,Math.round(Number(marketPreviewQtyDraft)||1))),row=marketPreviewCartEntry(p.id);if(row)row.qty=qty;else marketPreviewCart.push({productId:Number(p.id),qty});marketCloseQtyPicker();renderMarketPreview();toast(`${p.name} • ${qty} ${p.unit||'pcs'} masuk pesanan.`)}
function marketRemoveQtyProduct(){const p=getProduct(Number(marketPreviewQtyProductId));if(p)marketPreviewCart=marketPreviewCart.filter(x=>Number(x.productId)!==Number(p.id));marketCloseQtyPicker();renderMarketPreview()}
function marketPreviewChangeQty(productId,delta){
const row=marketPreviewCartEntry(productId);if(!row)return;const p=getProduct(Number(productId)),next=(Number(row.qty)||1)+Number(delta||0);if(next<=0){marketPreviewCart=marketPreviewCart.filter(x=>Number(x.productId)!==Number(productId))}else{const max=p&&!p.noStock?Math.max(1,Math.floor(Number(p.stock)||0)):999;row.qty=Math.max(1,Math.min(999,max,next))}if(!marketPreviewCart.length)marketPreviewStep=1;renderMarketPreview()
}
function marketPreviewCheckout(){if(!marketPreviewCart.length)return toast('Pilih minimal satu produk.','error');marketPreviewStep=2;renderMarketPreview()}
function marketPreviewBackToCatalog(){marketPreviewStep=1;renderMarketPreview()}
function marketPreviewDraftInput(key,value){if(key in marketPreviewCustomerDraft)marketPreviewCustomerDraft[key]=String(value||'')}
function marketPreviewOrderItems(){return marketPreviewCart.map(x=>{const p=getProduct(Number(x.productId));if(!p)return null;const qty=Math.max(1,Math.min(999,Math.round(Number(x.qty)||1))),price=Math.max(0,Number(p.price)||0);return{productId:Number(p.id),productName:String(p.name||'Produk'),qty,unit:String(p.unit||'pcs'),price:p.manualPrice?null:price,total:p.manualPrice?null:price*qty}}).filter(Boolean)}
function renderMarketPreviewCheckout(){
const target=document.getElementById('marketStorefrontPreview');if(!target)return;const items=marketPreviewOrderItems();if(!items.length){marketPreviewStep=1;renderMarketPreview();return}const c=marketOnlineConfig(),subtotal=items.reduce((n,x)=>n+(x.total==null?0:x.total),0),shipping=Math.max(0,Number(c.shippingFee)||0),knownGrand=subtotal+shipping,manual=items.some(x=>x.total==null),count=items.reduce((n,x)=>n+x.qty,0);
target.innerHTML=`<div class="market-checkout-page"><div class="market-checkout-top"><div class="market-checkout-headrow"><button class="market-checkout-back" type="button" onclick="marketPreviewBackToCatalog()" aria-label="Kembali">‹</button><div class="market-checkout-title"><b>Pesan Produk</b><small>Detail pesanan dan data pemesan</small></div></div><div class="market-checkout-steps"><div class="market-checkout-step done"><i>✓</i><span>1. Pilih Produk</span></div><div class="market-checkout-step active"><i>2</i><span>2. Detail Pesanan</span></div></div></div><div class="market-checkout-body"><section class="market-checkout-card"><div class="market-checkout-card-title"><b>Detail Pesanan</b><small>${items.length} produk • ${count} item</small></div><div class="market-cart-lines">${items.map(x=>`<div class="market-cart-line"><div class="market-cart-line-main"><b>${esc(x.productName)}</b><small>${x.total==null?'Harga sesuai pilihan':rupiah(x.price)} • ${esc(x.unit)}</small></div><div class="market-cart-line-actions"><button type="button" onclick="marketPreviewChangeQty(${x.productId},-1)">−</button><span>${x.qty}</span><button type="button" onclick="marketPreviewChangeQty(${x.productId},1)">+</button></div></div>`).join('')}</div><div class="market-order-costs"><div><span>Subtotal${manual?' sementara':''}</span><b>${manual?`${rupiah(subtotal)} + harga sesuai pilihan`:rupiah(subtotal)}</b></div><div><span>Biaya Ongkir</span><b>${shipping?rupiah(shipping):'Gratis'}</b></div><div class="grand"><span>Total${manual?' sementara':''}</span><strong>${manual?`${rupiah(knownGrand)} + harga sesuai pilihan`:rupiah(knownGrand)}</strong></div></div></section><section class="market-checkout-card"><div class="market-checkout-card-title"><b>Data Pemesan</b><small>Step 2 dari 2</small></div><div class="market-checkout-form"><div class="market-checkout-field"><label>Nama Pemesan</label><input id="marketOrderName" type="text" maxlength="60" placeholder="Nama pemesan" value="${esc(marketPreviewCustomerDraft.name)}" oninput="marketPreviewDraftInput('name',this.value)" autocomplete="name"></div><div class="market-checkout-field"><label>WhatsApp Pemesan</label><input id="marketOrderCustomerPhone" type="tel" inputmode="tel" maxlength="18" placeholder="08xxxxxxxxxx" value="${esc(marketPreviewCustomerDraft.phone)}" oninput="marketPreviewDraftInput('phone',this.value)" autocomplete="tel"></div><div class="market-checkout-field"><label>Catatan</label><textarea id="marketOrderNote" maxlength="160" placeholder="Catatan untuk pesanan (opsional)" oninput="marketPreviewDraftInput('note',this.value)">${esc(marketPreviewCustomerDraft.note)}</textarea></div></div><div class="market-checkout-actions"><button type="button" onclick="marketPreviewBackToCatalog()">Kembali</button><button type="button" class="primary" onclick="submitMarketOrder()">Pesan & Kirim</button></div><div class="market-checkout-help">Biaya ongkir otomatis mengikuti Pengaturan Market Online.</div></section></div></div>`;
setTimeout(()=>document.getElementById('marketOrderName')?.focus(),30)
}
function submitMarketOrder(){
const c=marketOnlineConfig(),items=marketPreviewOrderItems();if(!items.length)return toast('Pilih minimal satu produk.','error');
const name=String(document.getElementById('marketOrderName')?.value||marketPreviewCustomerDraft.name||'').trim(),rawPhone=String(document.getElementById('marketOrderCustomerPhone')?.value||marketPreviewCustomerDraft.phone||''),customerPhone=normalizeMarketPhone(rawPhone),note=String(document.getElementById('marketOrderNote')?.value||marketPreviewCustomerDraft.note||'').trim();
marketPreviewCustomerDraft={name,phone:rawPhone,note};if(!name)return toast('Nama pemesan wajib diisi.','error');if(!customerPhone)return toast('WhatsApp pemesan wajib diisi.','error');if(!c.whatsapp)return toast('WhatsApp toko belum diatur.','error');
const totalQty=items.reduce((n,x)=>n+x.qty,0),subtotal=items.reduce((n,x)=>n+(x.total==null?0:x.total),0),shippingFee=Math.max(0,Number(c.shippingFee)||0),knownGrand=subtotal+shippingFee,manual=items.some(x=>x.total==null),order={id:uid('ORD'),date:new Date().toISOString(),status:'new',source:'market-online',items,productId:items[0]?.productId||null,productName:items.length===1?items[0].productName:`${items.length} produk`,qty:totalQty,unit:items.length===1?items[0].unit:'item',price:items.length===1?items[0].price:null,subtotal:manual?null:subtotal,knownSubtotal:subtotal,shippingFee,total:manual?null:knownGrand,knownTotal:knownGrand,customerName:name,customerPhone,note};
c.orders.unshift(order);c.orders=c.orders.slice(0,300);save();renderDashboard();addAppNotification('market','Pesanan Online Baru',`${name} memesan ${totalQty} item dari ${items.length} produk.`,{actionScreen:'market-orders',key:'market-order-'+order.id});
const itemLines=items.map((x,i)=>`${i+1}. ${x.productName} × ${x.qty} ${x.unit} — ${x.total==null?'Harga sesuai pilihan':rupiah(x.total)}`),subtotalText=manual?`${rupiah(subtotal)} + harga sesuai pilihan`:rupiah(subtotal),totalText=manual?`${rupiah(knownGrand)} + harga sesuai pilihan`:rupiah(knownGrand),msg=[`Halo ${db.settings.store||'Toko'}, saya ingin memesan:`,`No. Pesanan: ${order.id}`,...itemLines,`Subtotal: ${subtotalText}`,`Biaya Ongkir: ${shippingFee?rupiah(shippingFee):'Gratis'}`,`Total: ${totalText}`,`Nama Pemesan: ${name}`,`WhatsApp Pemesan: ${customerPhone}`,note?`Catatan: ${note}`:''].filter(Boolean).join('\n');
marketPreviewCart=[];marketPreviewStep=1;marketPreviewCustomerDraft={name:'',phone:'',note:''};renderMarketOnlineSettings();renderMarketPreview();toast('Pesanan masuk ke Pesanan Online. Membuka WhatsApp...');
const url=`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`,w=window.open(url,'_blank','noopener,noreferrer');if(!w)toast('Pesanan tersimpan, tetapi tab WhatsApp diblokir browser.','error')
}
function marketOrderStatusLabel(status){return({new:'Baru',processing:'Diproses',done:'Selesai',cancelled:'Batal'})[String(status||'new').toLowerCase()]||String(status||'Baru')}
function marketOrderIsActive(status){return!['done','completed','complete','selesai','cancelled','canceled','batal'].includes(String(status||'new').toLowerCase())}
function marketOrderCardHTML(o){
const st=String(o?.status||'new').toLowerCase(),active=marketOrderIsActive(st),items=Array.isArray(o?.items)&&o.items.length?o.items:[{productName:o?.productName||'Produk',qty:Math.max(1,Number(o?.qty)||1),unit:o?.unit||'pcs',total:o?.total??null}],qty=items.reduce((n,x)=>n+Math.max(1,Number(x?.qty)||1),0),phone=String(o?.customerPhone||'').trim(),note=String(o?.note||'').trim(),shipping=Math.max(0,Number(o?.shippingFee)||0),itemKnown=items.reduce((n,x)=>n+(x?.total==null?0:Number(x.total)||0),0),known=Number.isFinite(Number(o?.knownTotal))?Math.max(0,Number(o.knownTotal)):itemKnown+shipping,manual=items.some(x=>x?.total==null)||o?.total==null,itemsText=items.map(x=>`${x.productName||'Produk'} × ${Math.max(1,Number(x.qty)||1)} ${x.unit||'pcs'}`).join(' • ');
return`<article class="market-order-row"><div class="market-order-row-main"><b>${esc(o?.id||'Pesanan')} • ${esc(o?.customerName||'Pelanggan')}</b><small>${fmtTime(o?.date)} • ${items.length} produk • ${qty} item</small><span class="market-order-items-preview">${esc(itemsText)}</span><span>${manual?`${rupiah(known)} + harga sesuai pilihan`:rupiah(known)} • Ongkir ${shipping?rupiah(shipping):'Gratis'}${phone?' • '+esc(phone):''}${note?' • '+esc(note):''}</span></div><div class="market-order-row-side"><span class="market-order-status ${esc(st)}">${esc(marketOrderStatusLabel(st))}</span><div class="market-order-actions">${st==='new'?`<button type="button" onclick="setMarketOrderStatus('${esc(o.id)}','processing')">Proses</button>`:''}${st==='processing'?`<button type="button" onclick="setMarketOrderStatus('${esc(o.id)}','done')">Selesai</button>`:''}${active?`<button type="button" class="danger" onclick="setMarketOrderStatus('${esc(o.id)}','cancelled')">Batal</button>`:''}</div></div></article>`
}
function renderMarketOrdersPage(){
const el=document.getElementById('marketOrdersBody');if(!el)return;
const c=marketOnlineConfig(),orders=[...(c.orders||[])].sort((a,b)=>new Date(b?.date||0)-new Date(a?.date||0)),pending=marketPendingOrderCount(),done=orders.filter(o=>['done','completed','complete','selesai'].includes(String(o?.status||'').toLowerCase())).length;
el.innerHTML=`<div class="market-orders-content"><div class="market-order-summary market-order-page-summary"><div><span>Total Pesanan</span><b>${orders.length}</b></div><div><span>Perlu Diproses</span><b>${pending}</b></div><div><span>Selesai</span><b>${done}</b></div></div><div class="market-orders-section-head"><div><b>Daftar Pesanan</b><small>${pending?`${pending} pesanan perlu ditindaklanjuti`:'Tidak ada pesanan yang menunggu diproses'}</small></div></div><div class="market-order-list">${orders.length?orders.map(marketOrderCardHTML).join(''):'<div class="relation-history-empty market-orders-empty"><b>Belum ada pesanan online</b><span>Pesanan dari Web Toko akan tampil otomatis di halaman ini.</span></div>'}</div></div>`;
}
function openMarketOrders(){go('market-orders')}
function setMarketOrderStatus(id,status){const c=marketOnlineConfig(),o=(c.orders||[]).find(x=>String(x.id)===String(id));if(!o)return toast('Pesanan tidak ditemukan.','error');o.status=status;o.updatedAt=new Date().toISOString();save();renderDashboard();renderMarketOnlineSettings();renderMarketOrdersPage();toast(`Status pesanan: ${marketOrderStatusLabel(status)}.`)}
function marketStandaloneHTML(){
const c=marketOnlineConfig(),url=marketOnlineUrl(),products=(db.products||[]).filter(marketProductOnlineEnabled).slice(0,100),phone=c.whatsapp,status=marketStoreStatus(),accent=marketSafeColor(c.themeColor),shipping=Math.max(0,Number(c.shippingFee)||0),store=String(db.settings.store||'Toko Online'),address=String(db.settings.address||''),catalog=products.map(p=>({id:Number(p.id),name:String(p.name||'Produk'),category:String(p.category||'Umum'),unit:String(p.unit||'pcs'),price:p.manualPrice?null:Math.max(0,Number(p.price)||0),available:marketProductAvailable(p),stock:p.noStock?null:Math.max(0,Number(p.stock)||0),image:String(p.image||''),emoji:String(p.emoji||'📦'),search:`${p.name||''} ${p.barcode||''} ${p.category||''}`.toLowerCase()}));
const data=JSON.stringify(catalog).replace(/</g,'\\u003c');
return`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content"><meta name="theme-color" content="${accent}"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="${esc(store)}"><meta name="format-detection" content="telephone=no"><link rel="manifest" id="storeManifest"><title>${esc(store)}</title><style>:root{--accent:${accent};--safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px)}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#f7f7f8;color:#171717;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-tap-highlight-color:transparent}body{min-height:100dvh;overscroll-behavior-y:none}.ticker{overflow:hidden;background:#111827;color:#fff;font-size:12px;font-weight:700;white-space:nowrap;padding-top:var(--safe-t)}.ticker div{display:inline-block;padding:8px 0;min-width:200%;animation:marquee 18s linear infinite}@keyframes marquee{to{transform:translateX(-50%)}}.hero{padding:22px 14px 18px;background:linear-gradient(135deg,var(--accent),#111827);color:#fff}.wrap{width:100%;max-width:1366px;margin-inline:auto}.status{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.16);font-size:11px;font-weight:800}.status i{width:7px;height:7px;border-radius:50%;background:${c.showOrderButton?'#4ade80':'#f87171'}}.hero h1{margin:7px 0 4px;font-size:24px;line-height:1.16}.hero p{margin:0;font-size:12px;opacity:.9}.stepbar{display:flex;align-items:center;gap:6px;margin-top:12px}.stepbar span{display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border-radius:999px;background:rgba(255,255,255,.13);font-size:10px;font-weight:800}.stepbar span.active{background:#fff;color:var(--accent)}.search{margin-top:13px;background:#fff;border-radius:12px;padding:3px 10px}.search input{width:100%;border:0;outline:0;padding:10px 2px;font:inherit;font-size:16px;color:#222;background:transparent}.body{padding:13px 11px calc(92px + var(--safe-b))}.head{display:flex;justify-content:space-between;align-items:end;margin-bottom:10px}.head b{font-size:14px}.head small{font-size:11px;color:#6b7280}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.card{min-width:0;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:9px}.visual{height:112px;border-radius:11px;background:#f3f4f6;display:grid;place-items:center;font-size:40px;overflow:hidden}.visual img{width:100%;height:100%;object-fit:contain;background:#fff}.card h3{font-size:13px;line-height:1.3;margin:8px 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cat,.stock{font-size:10.5px;color:#777}.stock.out{color:#b91c1c;font-weight:700}.price{font-size:13.5px;font-weight:900;color:var(--accent);margin-top:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.btn{display:block;text-align:center;width:100%;min-height:40px;border:0;border-radius:10px;background:var(--accent);color:#fff;font-size:12px;font-weight:900;padding:9px;margin-top:8px;cursor:pointer}.btn:disabled{background:#d1d5db;color:#6b7280}.badge{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:5px;padding:0 5px;border-radius:999px;background:rgba(255,255,255,.22);font-size:10px}.cartbar{position:fixed;z-index:20;left:50%;transform:translateX(-50%);bottom:calc(8px + var(--safe-b));width:min(720px,calc(100% - 18px));display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid #e5e7eb;border-radius:14px;background:rgba(255,255,255,.97);box-shadow:0 16px 44px rgba(15,23,42,.18);backdrop-filter:blur(12px)}.cartbar[hidden]{display:none}.cartbar b{display:block;font-size:13px}.cartbar small{display:block;margin-top:2px;color:#6b7280;font-size:10px}.cartbar button{border:0;border-radius:10px;background:var(--accent);color:#fff;min-height:42px;padding:0 13px;font-weight:900}.checkout{display:none;min-height:100dvh}.checkout.show{display:block}.catalog.hide{display:none}.checkout-top{position:sticky;z-index:12;top:0;padding:calc(10px + var(--safe-t)) 12px 10px;background:rgba(255,255,255,.96);border-bottom:1px solid #e5e7eb;backdrop-filter:blur(12px)}.checkout-head{display:flex;align-items:center;gap:9px;max-width:1366px;margin:auto}.back{width:38px;height:38px;border:0;border-radius:11px;background:#f3f4f6;font-size:21px}.checkout-head b{font-size:15px}.checkout-head small{display:block;font-size:10.5px;color:#6b7280;margin-top:2px}.steps{max-width:1366px;margin:10px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:6px}.step{padding:8px;border-radius:10px;background:#f3f4f6;color:#6b7280;font-size:10px;font-weight:800}.step.active,.step.done{background:color-mix(in srgb,var(--accent) 10%,#fff);color:var(--accent)}.checkout-body{max-width:1366px;margin:auto;padding:10px 9px calc(20px + var(--safe-b))}.box{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:11px;margin-bottom:9px}.boxhead{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px}.boxhead b{font-size:13px}.boxhead small{font-size:10px;color:#6b7280}.line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #f1f2f4}.line:last-child{border-bottom:0}.line b{display:block;font-size:12px}.line small{display:block;margin-top:2px;color:#6b7280;font-size:10px}.qty{display:flex;align-items:center;gap:5px}.qty button{width:32px;height:32px;border:1px solid #e5e7eb;border-radius:9px;background:#fff;font-weight:900}.qty span{min-width:24px;text-align:center;font-size:11px;font-weight:900}.costs{margin-top:9px;padding-top:8px;border-top:1px dashed #d1d5db;display:grid;gap:6px}.costs>div{display:flex;justify-content:space-between;gap:8px;font-size:11px}.costs span{color:#6b7280}.costs .grand{padding-top:7px;border-top:1px solid #eef0f2;font-size:13px}.costs .grand strong{color:var(--accent);font-size:16px}.field{display:grid;gap:5px;margin-bottom:9px}.field label{font-size:10.5px;font-weight:850;color:#4b5563}.field input,.field textarea{width:100%;min-height:44px;border:1px solid #dfe3e8;border-radius:11px;padding:9px 10px;font:inherit;font-size:16px;outline:0}.field textarea{min-height:78px;resize:vertical}.field input:focus,.field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 12%,transparent)}.actions{display:grid;grid-template-columns:1fr 1.35fr;gap:8px}.actions button{min-height:44px;border:1px solid #e5e7eb;border-radius:11px;background:#fff;font-weight:900}.actions .primary{background:var(--accent);border-color:var(--accent);color:#fff}.help{margin-top:8px;text-align:center;font-size:10px;color:#6b7280}.qtyoverlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(15,23,42,.48);backdrop-filter:blur(2px)}.qtycard{width:min(360px,100%);background:#fff;border-radius:18px;padding:13px;box-shadow:0 24px 70px rgba(0,0,0,.26)}.qtyhead{display:grid;grid-template-columns:52px minmax(0,1fr) 34px;gap:9px;align-items:center}.qtyvisual{width:52px;height:52px;border-radius:12px;background:#f3f4f6;display:grid;place-items:center;font-size:24px;overflow:hidden}.qtyvisual img{width:100%;height:100%;object-fit:contain;background:#fff}.qtyhead b{display:block;font-size:13px}.qtyhead small{display:block;margin-top:3px;font-size:10.5px;color:#6b7280}.qtyclose{width:34px;height:34px;border:0;border-radius:10px;background:#f3f4f6;font-size:20px}.qtylabel{text-align:center;margin-top:15px;font-size:11px;font-weight:800;color:#6b7280}.qtypick{display:grid;grid-template-columns:48px 1fr 48px;gap:8px;align-items:center;margin:8px auto 0;max-width:240px}.qtypick button{height:48px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;font-size:22px;font-weight:900}.qtypick strong{text-align:center;font-size:25px}.qtystock{display:block;text-align:center;margin-top:7px;font-size:10px;color:#6b7280}.qtyactions{display:grid;grid-template-columns:1fr 1.35fr;gap:8px;margin-top:14px}.qtyactions button{min-height:43px;border:1px solid #e5e7eb;border-radius:11px;background:#fff;font-weight:900}.qtyactions .primary{background:var(--accent);border-color:var(--accent);color:#fff}.qtyactions .danger{color:#b91c1c}.qtyactions .solo{grid-column:1/-1}footer{text-align:center;color:#777;font-size:10.5px;padding:22px 10px calc(22px + var(--safe-b))}@media(min-width:720px){.grid{grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:12px}.body{padding-left:16px;padding-right:16px}.visual{height:120px}}</style>
<style id="marketSoldWholesaleV177Style">.market-product-meta{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:6px;min-height:22px}.market-product-sold{display:inline-flex;align-items:center;gap:4px;color:#6b7280;font-size:9.5px;font-weight:750;white-space:nowrap}.market-product-sold:before{content:"✓";display:grid;place-items:center;width:15px;height:15px;border-radius:999px;background:#f3f4f6;color:#4b5563;font-size:8px;font-weight:950}.market-wholesale-badge{display:inline-flex;align-items:center;justify-content:center;min-height:22px;padding:0 7px;border-radius:999px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:8.8px;font-weight:900;white-space:nowrap}.market-wholesale-offer{display:flex;align-items:baseline;justify-content:space-between;gap:7px;margin-top:5px;padding:6px 7px;border-radius:9px;background:#fff7ed;border:1px solid #ffedd5}.market-wholesale-offer b{color:#c2410c;font-size:11px;font-weight:950;white-space:nowrap}.market-wholesale-offer span{color:#9a3412;font-size:8.8px;font-weight:800;text-align:right}.market-qty-wholesale{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:9px 0 0;padding:8px 9px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;color:#9a3412}.market-qty-wholesale b{font-size:10.5px}.market-qty-wholesale span{font-size:9.5px;font-weight:800;text-align:right}.market-cart-line-main .market-line-wholesale{display:inline-flex;margin-top:4px;padding:3px 6px;border-radius:999px;background:#fff7ed;color:#c2410c;font-size:8.8px;font-weight:900}[data-theme="dark"] .market-wholesale-badge,[data-theme="dark"] .market-wholesale-offer,[data-theme="dark"] .market-qty-wholesale{background:rgba(194,65,12,.13);border-color:rgba(251,146,60,.28);color:#fdba74}[data-theme="dark"] .market-wholesale-offer b,[data-theme="dark"] .market-wholesale-offer span{color:#fdba74}@media(max-width:390px){.market-product-meta{gap:4px}.market-product-sold{font-size:9px}.market-wholesale-badge{font-size:8px;padding:0 6px}.market-wholesale-offer{padding:5px 6px}.market-wholesale-offer b{font-size:10.5px}.market-wholesale-offer span{font-size:8.2px}}</style>
</head><body>${c.infoText?`<div class="ticker"><div>${esc(c.infoText)} &nbsp; • &nbsp; ${esc(c.infoText)} &nbsp; • &nbsp; ${esc(c.infoText)}</div></div>`:''}<section class="catalog" id="catalog"><div class="hero"><div class="wrap"><span class="status"><i></i>Toko ${status}</span><h1>${esc(store)}</h1><p>${esc(address)}</p><div class="stepbar"><span class="active">1. Pilih Produk</span><span>2. Detail Pesanan</span></div><div class="search"><input id="q" type="search" placeholder="Cari produk..." oninput="renderProducts(this.value)" autocomplete="off"></div></div></div><main class="wrap body"><div class="head"><b>Pilih Produk</b><small id="count">0 produk</small></div><div class="grid" id="grid"></div></main><div class="cartbar" id="cartbar" hidden><div><b id="carttitle">0 item</b><small id="carttotal">Rp0</small></div><button type="button" onclick="checkout()">Lanjut ›</button></div></section><section class="checkout" id="checkout"><div class="checkout-top"><div class="checkout-head"><button class="back" type="button" onclick="backCatalog()">‹</button><div><b>Pesan Produk</b><small>Detail pesanan dan data pemesan</small></div></div><div class="steps"><div class="step done">✓ 1. Pilih Produk</div><div class="step active">2. Detail Pesanan</div></div></div><div class="checkout-body"><div class="box"><div class="boxhead"><b>Detail Pesanan</b><small id="sumcount"></small></div><div id="lines"></div><div class="costs"><div><span>Subtotal</span><b id="subtotal"></b></div><div><span>Biaya Ongkir</span><b id="shipping"></b></div><div class="grand"><span>Total</span><strong id="sumtotal"></strong></div></div></div><div class="box"><div class="boxhead"><b>Data Pemesan</b><small>Step 2 dari 2</small></div><div class="field"><label>Nama Pemesan</label><input id="name" maxlength="60" placeholder="Nama pemesan" autocomplete="name"></div><div class="field"><label>WhatsApp Pemesan</label><input id="customerPhone" type="tel" inputmode="tel" maxlength="18" placeholder="08xxxxxxxxxx" autocomplete="tel"></div><div class="field"><label>Catatan</label><textarea id="note" maxlength="160" placeholder="Catatan untuk pesanan (opsional)"></textarea></div><div class="actions"><button type="button" onclick="backCatalog()">Kembali</button><button class="primary" type="button" onclick="sendOrder()">Pesan & Kirim</button></div><div class="help">Biaya ongkir otomatis mengikuti Pengaturan Market Online.</div></div></div></section><footer>${esc(url.replace('https://',''))} • Dibuat dengan INPOS</footer><script>var PRODUCTS=${data};var CART=[];var STORE=${JSON.stringify(store)};var SHOPWA=${JSON.stringify(phone)};var ORDERING=${c.showOrderButton?'true':'false'};var SHIPPING=${shipping};var QPID=null;var QTY=1;function rp(n){return 'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID')}function row(id){return CART.find(function(x){return x.id===id})}function pby(id){return PRODUCTS.find(function(x){return x.id===id})}function cartCount(){return CART.reduce(function(n,x){return n+x.qty},0)}function knownSubtotal(){return CART.reduce(function(n,x){var p=pby(x.id);return n+(p&&p.price!=null?p.price*x.qty:0)},0)}function manual(){return CART.some(function(x){var p=pby(x.id);return p&&p.price==null})}function escHtml(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]})}function renderProducts(v){v=String(v||'').trim().toLowerCase();var rows=PRODUCTS.filter(function(p){return !v||p.search.indexOf(v)>-1});document.getElementById('count').textContent=rows.length+' produk';document.getElementById('grid').innerHTML=rows.map(function(p){var c=row(p.id),qty=c?c.qty:0,visual=p.image?'<img src="'+p.image.replace(/\"/g,'&quot;')+'" alt="">':p.emoji;return '<div class="card"><div class="visual">'+visual+'</div><h3>'+escHtml(p.name)+'</h3><div class="cat">'+escHtml(p.category)+' • '+escHtml(p.unit)+'</div><div class="price">'+(p.price==null?'Harga sesuai pilihan':rp(p.price))+'</div>${c.showStock?`<div class="stock">'+(p.stock==null?'Tersedia':p.available?'Stok '+p.stock:'Stok Habis')+'</div>`:''}${c.showOrderButton?`<button class="btn" type="button" '+(p.available?'':'disabled')+' onclick="openQty('+p.id+')">'+(p.available?'Pesan'+(qty?' <span class="badge">'+qty+'</span>':''):'Habis')+'</button>`:''}</div>'}).join('');renderBar()}function renderBar(){var n=cartCount(),bar=document.getElementById('cartbar'),sub=knownSubtotal();bar.hidden=!n;document.getElementById('carttitle').textContent=n+' item • '+CART.length+' produk';document.getElementById('carttotal').textContent=manual()?rp(sub+SHIPPING)+' + pilihan':rp(sub+SHIPPING)}function maxQty(p){return p.stock==null?999:Math.max(1,Math.floor(Number(p.stock)||0))}function openQty(id){if(!ORDERING)return;var p=pby(id);if(!p||!p.available)return;QPID=id;var r=row(id);QTY=Math.max(1,Math.min(maxQty(p),r?r.qty:1));drawQty()}function drawQty(){var p=pby(QPID);if(!p)return;var old=document.getElementById('qtyoverlay');if(old)old.remove();var r=row(p.id),visual=p.image?'<img src="'+p.image.replace(/\"/g,'&quot;')+'" alt="">':p.emoji,el=document.createElement('div');el.id='qtyoverlay';el.className='qtyoverlay';el.onclick=function(e){if(e.target===el)closeQty()};el.innerHTML='<div class="qtycard"><div class="qtyhead"><div class="qtyvisual">'+visual+'</div><div><b>'+escHtml(p.name)+'</b><small>'+(p.price==null?'Harga sesuai pilihan':rp(p.price))+' • '+escHtml(p.unit)+'</small></div><button class="qtyclose" onclick="closeQty()">×</button></div><div class="qtylabel">Jumlah Pesanan</div><div class="qtypick"><button onclick="chgPick(-1)">−</button><strong id="pickvalue">'+QTY+'</strong><button onclick="chgPick(1)">+</button></div><small class="qtystock">'+(p.stock==null?'Produk selalu tersedia':'Maksimal '+maxQty(p)+' '+escHtml(p.unit)+' sesuai stok')+'</small><div class="qtyactions">'+(r?'<button class="danger" onclick="removePick()">Hapus</button>':'')+'<button class="primary '+(r?'':'solo')+'" onclick="savePick()">'+(r?'Simpan Qty':'Tambah Produk')+'</button></div></div>';document.body.appendChild(el)}function chgPick(d){var p=pby(QPID);if(!p)return;QTY=Math.max(1,Math.min(maxQty(p),QTY+d));document.getElementById('pickvalue').textContent=QTY}function closeQty(){var el=document.getElementById('qtyoverlay');if(el)el.remove();QPID=null;QTY=1}function savePick(){var p=pby(QPID);if(!p)return closeQty();var r=row(p.id);if(r)r.qty=QTY;else CART.push({id:p.id,qty:QTY});closeQty();renderProducts(document.getElementById('q').value)}function removePick(){CART=CART.filter(function(x){return x.id!==QPID});closeQty();renderProducts(document.getElementById('q').value)}function changeQty(id,d){var r=row(id);if(!r)return;var p=pby(id),next=r.qty+d;if(next<=0)CART=CART.filter(function(x){return x.id!==id});else r.qty=Math.min(maxQty(p),next);if(!CART.length)return backCatalog();renderCheckout()}function checkout(){if(!CART.length)return;document.getElementById('catalog').classList.add('hide');document.getElementById('checkout').classList.add('show');renderCheckout();window.scrollTo(0,0);setTimeout(function(){document.getElementById('name').focus()},30)}function backCatalog(){document.getElementById('checkout').classList.remove('show');document.getElementById('catalog').classList.remove('hide');renderProducts(document.getElementById('q').value);window.scrollTo(0,0)}function renderCheckout(){var n=cartCount(),sub=knownSubtotal(),grand=sub+SHIPPING;document.getElementById('sumcount').textContent=CART.length+' produk • '+n+' item';document.getElementById('lines').innerHTML=CART.map(function(x){var p=pby(x.id);return '<div class="line"><div><b>'+escHtml(p.name)+'</b><small>'+(p.price==null?'Harga sesuai pilihan':rp(p.price))+' • '+escHtml(p.unit)+'</small></div><div class="qty"><button onclick="changeQty('+p.id+',-1)">−</button><span>'+x.qty+'</span><button onclick="changeQty('+p.id+',1)">+</button></div></div>'}).join('');document.getElementById('subtotal').textContent=manual()?rp(sub)+' + pilihan':rp(sub);document.getElementById('shipping').textContent=SHIPPING?rp(SHIPPING):'Gratis';document.getElementById('sumtotal').textContent=manual()?rp(grand)+' + pilihan':rp(grand)}function normalize(v){var n=String(v||'').replace(/\\D/g,'');if(n.indexOf('0')===0)n='62'+n.slice(1);else if(n.indexOf('8')===0)n='62'+n;return n}function sendOrder(){var name=document.getElementById('name').value.trim(),cust=normalize(document.getElementById('customerPhone').value),note=document.getElementById('note').value.trim();if(!name){alert('Nama pemesan wajib diisi.');return}if(!cust){alert('WhatsApp pemesan wajib diisi.');return}if(!SHOPWA){alert('WhatsApp toko belum diatur.');return}var sub=knownSubtotal(),grand=sub+SHIPPING,lines=['Halo '+STORE+', saya ingin memesan:'];CART.forEach(function(x,i){var p=pby(x.id);lines.push((i+1)+'. '+p.name+' × '+x.qty+' '+p.unit+' — '+(p.price==null?'Harga sesuai pilihan':rp(p.price*x.qty)))});lines.push('Subtotal: '+(manual()?rp(sub)+' + harga sesuai pilihan':rp(sub)));lines.push('Biaya Ongkir: '+(SHIPPING?rp(SHIPPING):'Gratis'));lines.push('Total: '+(manual()?rp(grand)+' + harga sesuai pilihan':rp(grand)));lines.push('Nama Pemesan: '+name);lines.push('WhatsApp Pemesan: '+cust);if(note)lines.push('Catatan: '+note);window.open('https://wa.me/'+SHOPWA+'?text='+encodeURIComponent(lines.join('\\n')),'_blank','noopener,noreferrer')}try{var manifest={name:STORE+' Web Toko',short_name:STORE.slice(0,24),start_url:location.href.split('#')[0],display:'standalone',background_color:'#f7f7f8',theme_color:${JSON.stringify(accent)},icons:[]};document.getElementById('storeManifest').href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}))}catch(e){}renderProducts('');<\/script>

<!-- INPOS v227 — Stock Qty integer / tanpa desimal -->


<!-- INPOS v266: Grafik Penjualan compact spacing (day/month/year/period + A4) -->

<!-- INPOS v21 — branding rename completed; legacy lowercase storage keys intentionally preserved for data compatibility -->
<style id="inpos-consignment-edit-layout-v25">#modalBox.consignment-item-edit-modal .consignment-modal-grid{display:grid!important;grid-template-columns:repeat(12,minmax(0,1fr))!important;gap:9px!important;align-items:end}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field{min-width:0!important;grid-column:span 3!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(5),
#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(6),
#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(7){grid-column:span 4!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field.full,
#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(8){grid-column:1/-1!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid input,
#modalBox.consignment-item-edit-modal .consignment-modal-grid select,
#modalBox.consignment-item-edit-modal .consignment-modal-grid textarea{min-width:0!important}@media (max-width:9999px) and (min-width:560px){#modalBox.consignment-item-edit-modal{width:min(760px,calc(100vw - 24px))!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(-n+4){grid-column:span 3!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(5),
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(6),
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(7){grid-column:span 4!important}}@media (max-width:559px){#modalBox.consignment-item-edit-modal .consignment-modal-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field,
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(5),
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(6),
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(7){grid-column:span 1!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field.full,
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field:nth-child(8){grid-column:1/-1!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid label{font-size:10.5px!important;line-height:1.2}#modalBox.consignment-item-edit-modal .consignment-modal-grid input,
  #modalBox.consignment-item-edit-modal .consignment-modal-grid select{width:100%!important;min-width:0!important;font-size:14px!important;padding-left:8px!important;padding-right:8px!important}}@media (max-width:330px){#modalBox.consignment-item-edit-modal .consignment-modal-grid{grid-template-columns:1fr!important}#modalBox.consignment-item-edit-modal .consignment-modal-grid>.field,
  #modalBox.consignment-item-edit-modal .consignment-modal-grid>.field.full{grid-column:1/-1!important}}</style>


<!-- INPOS v116 • Dashboard card label refinement: Produk & Satuan / Kategori -->

<!-- INPOS v165 — Label shortcut F3 pada baris Customer Penjualan dihapus; fungsi keyboard F3 tetap aktif. -->


<!-- INPOS v181 • Dashboard Mobile Menu Icon Fixed Size -->
<!-- INPOS v196 • Grosir keterangan ringkas tanpa duplikasi -->
<style id="inposV196WholesaleCopyClean">#screen-wholesale-settings .rule-list-copy>small:empty{display:none!important}@media(max-width:9999px){#screen-wholesale-settings .feature-setting-card>h3{margin-bottom:9px!important}#screen-wholesale-settings .rule-list-copy{display:flex!important;align-items:center!important;min-height:32px!important}#screen-wholesale-settings .rule-list-copy b{margin:0!important}}</style>

<!-- INPOS v555: sinkronisasi shortcut Kasir, Pembelian, popup, dan bantuan keyboard. -->
<!-- INPOS v609: Pembelian desktop menggunakan dua panel otomatis setara Kasir Penjualan. -->

<style id="inposV615FirstUseFeatureCompactStyle">
.first-use-overlay-v338 .first-use-feature-overview-v615{display:grid;grid-template-columns:1fr;align-items:start;gap:2px;padding:8px 10px;margin-bottom:9px;background:var(--surface2);border:1px solid var(--line);border-radius:10px}
.first-use-overlay-v338 .first-use-feature-overview-v615 span{font-size:11.5px;font-weight:900;color:var(--primary-deep)}
.first-use-overlay-v338 .first-use-feature-overview-v615 small{font-size:10px;color:var(--muted);line-height:1.35}
.first-use-overlay-v338 .first-use-feature-section-v615{margin:0 0 10px;min-width:0}
.first-use-overlay-v338 .first-use-feature-heading-v615{display:grid;grid-template-columns:1fr;align-items:start;gap:2px;margin:0 0 6px;padding:0 2px}
.first-use-overlay-v338 .first-use-feature-heading-v615 b{font-size:11.5px;line-height:1.3;font-weight:900;color:var(--text)}
.first-use-overlay-v338 .first-use-feature-heading-v615 small{font-size:9.5px;line-height:1.3;color:var(--muted)}
.first-use-overlay-v338 .first-use-feature-grid-v566{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
.first-use-overlay-v338 .first-use-feature-v566{min-width:0!important;min-height:52px!important;padding:8px 9px!important;grid-template-columns:18px minmax(0,1fr) auto!important;gap:7px!important;border-radius:11px!important;align-items:center!important}
.first-use-overlay-v338 .first-use-feature-v566 input{width:17px!important;height:17px!important;min-width:17px!important}
.first-use-overlay-v338 .first-use-feature-copy-v566 b{font-size:11.5px!important;line-height:1.25!important}
.first-use-overlay-v338 .first-use-feature-copy-v566 small{font-size:9.5px!important;line-height:1.3!important;margin-top:2px!important}
.first-use-overlay-v338 .first-use-feature-status-v566{font-size:9px!important;font-weight:800!important}
@media (max-width:599px){
 .first-use-overlay-v338 .first-use-feature-grid-v566{grid-template-columns:1fr!important}
 .first-use-overlay-v338 .first-use-feature-v566{min-height:49px!important;padding:8px 10px!important}
 .first-use-overlay-v338 .first-use-feature-overview-v615{padding:7px 9px}
 .first-use-overlay-v338 .first-use-feature-section-v615{margin-bottom:9px}
}
</style>

<style id="inposV677StockOpnameUnifiedLayout">
/* The mobile stock-opname component is the only route on desktop and tablet too. */
@media (min-width:1025px){
 body.mobile-stock-opname-active #screen-stock-opname .stock-opname-page{
   width:min(100%,760px)!important;max-width:760px!important;
   margin-inline:auto!important;min-width:0!important;
   display:flex!important;flex-direction:column!important;
   min-height:0!important;height:100%!important;
   background:var(--surface2);border-left:1px solid var(--line);border-right:1px solid var(--line);
 }
 body.mobile-stock-opname-active #screen-stock-opname .stock-opname-list{
   overflow-y:auto!important;overflow-x:hidden!important;flex:1 1 0%!important;min-height:0!important;
 }
 body.mobile-stock-opname-active #screen-stock-opname .stock-opname-actions{
   position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;
   transform:none!important;flex:0 0 auto!important;max-width:100%!important;
 }
 body.mobile-stock-opname-active #screen-stock-opname .stock-opname-row{
   min-width:0!important;height:auto!important;align-self:stretch!important;
 }
}
@media (min-width:650px) and (max-width:1024px){
 body.mobile-stock-opname-active #screen-stock-opname .stock-opname-page{
    max-width:760px!important;margin-inline:auto!important;
 }
}
</style>

<style id="inposV678UnifiedMenusDesktop">
/* INPOS v678: the same mobile page components on desktop. Width impacts number of cards only. */
@media (min-width:1025px){
  #screen-categories .category-page,#screen-productform .mobile-product-form-page,
  #screen-stock-opname .stock-opname-page,#screen-purchase-detail .purchase-detail-page,
  #screen-sale-detail .sale-detail-page{max-width:min(100%,1024px);margin-inline:auto;min-width:0}
  #screen-categories .category-page{width:100%}
  #screen-stock .stock-mobile-list,#screen-purchases .purchase-mobile-list,
  #screen-customers .customer-mobile-list,#screen-sales .sales-mobile-list,
  #screen-expenses .expense-mobile-list{min-width:0;max-width:100%}
}
</style>
</body></html>`
}
function openMarketPreviewTab(){
const html=marketStandaloneHTML(),blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),w=window.open(url,'_blank','noopener,noreferrer');
if(!w){URL.revokeObjectURL(url);toast('Popup diblokir browser. Izinkan popup lalu coba lagi.','error');return}
setTimeout(()=>URL.revokeObjectURL(url),120000)
}
function validSale(s){return s&&!s.returned}function todaySales(){return db.sales.filter(s=>validSale(s)&&dateKey(s.date)===todayKey())}function salesInDays(n){const c=new Date();c.setDate(c.getDate()-(n-1));c.setHours(0,0,0,0);return db.sales.filter(s=>validSale(s)&&new Date(s.date)>=c)}
function go(screen){if(screen==='coupon-promo'&&!optionalFeatureEnabled('coupon')){toast('Fitur Kupon nonaktif. Aktifkan dari Lainnya → Fitur Kupon.','error');screen='more'}if(screen==='shift'&&!shiftFeatureEnabled()){toast('Fitur Shift sedang dinonaktifkan.','error');screen='more'}if(db?.settings?.employeeLoggedOut){inposV650ShowLogin();return}if(screen==='account-system'&&accountSystemState.type!=='employee'&&!employeeCan('settings')){accountSystemState.type='employee';accountSystemState.employeeMode='list'}if(!employeeScreenAllowed(screen)){toast('Akses menu ini tidak diizinkan untuk karyawan aktif.','error');return}const optionalKey=optionalFeatureKeyForScreen(screen);if(optionalKey&&!optionalFeatureEnabled(optionalKey))screen='more';if(!pageMeta[screen]||!document.getElementById('screen-'+screen))screen='dashboard';document.body.dataset.mobileScreen=screen;if(screen==='stock-waste')renderStockWasteV707();inposV631SetLoginShell(false);document.body.classList.toggle('mobile-dashboard-active',screen==='dashboard');document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('screen-'+screen)?.classList.add('active');const navScreen=screen==='coupon-promo'?'more':screen==='debts'?(debtBookTab==='supplier'?'purchases':'customers'):['suppliers','purchase-form','purchase-detail'].includes(screen)?'purchases':['categories','productform','stock-data','stock-data-detail','stock-opname','stock-waste','consignment','discount-settings','wholesale-settings','mass-price-settings','bundle-settings','production','market-online','market-orders','market-preview','courier','notifications','notification-settings','account-system','printer','payments','sales-settings','labels','points-settings','ppn-settings','about'].includes(screen)?'more':screen==='sale-detail'?'sales':screen==='productpicker'?'cashier':(screen==='report-general'||screen==='report-cashflow'||screen==='report-finance'||screen==='report-detail')?'reports':screen;document.querySelectorAll('[data-screen]').forEach(x=>{const active=x.dataset.screen===navScreen;x.classList.toggle('active',active);if(x.classList.contains('mbtn')){if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')}});const title=document.getElementById('pageTitle'),sub=document.getElementById('pageSub');if(title)title.textContent=pageMeta[screen][0];if(sub)sub.textContent=pageMeta[screen][1];if(screen==='dashboard'){if(title)title.textContent=String(db.settings?.store||'INPOS');if(sub)sub.textContent=`${String(db.settings?.cashier||'Kasir')} • Beranda`}document.body.classList.toggle('mobile-cashier-active',screen==='cashier');document.body.classList.toggle('mobile-product-picker-active',screen==='productpicker');document.body.classList.toggle('mobile-product-form-active',screen==='productform');document.body.classList.toggle('mobile-sales-active',screen==='sales');document.body.classList.toggle('mobile-stock-active',screen==='stock');document.body.classList.toggle('mobile-stock-opname-active',screen==='stock-opname');document.body.classList.toggle('mobile-expenses-active',screen==='expenses');document.body.classList.toggle('mobile-customers-active',screen==='customers');document.body.classList.toggle('mobile-reports-active',screen==='reports'||screen==='report-general'||screen==='report-cashflow'||screen==='report-finance'||screen==='report-detail');document.body.classList.toggle('mobile-notifications-active',screen==='notification-settings');document.body.classList.toggle('mobile-account-system-active',screen==='account-system');if(screen!=='cashier')toggleCart(false);const scroller=document.querySelector('.container');if(scroller){scroller.scrollTop=0;scroller.scrollLeft=0}if(screen==='more'){ensureSalesFeatureMenu();syncDashboardMenuVisibility()}if(['discount-settings','wholesale-settings','mass-price-settings','bundle-settings'].includes(screen)){try{renderSalesFeatureScreen(screen)}catch(err){console.error('Sales feature render error:',err)}}try{renderAll({navigation:true,screen})}catch(err){console.error('INPOS render error:',err)}if(screen==='categories')renderCategoryPage();if(screen==='sale-detail')renderSaleDetailPage();if(screen==='stock-opname')renderStockOpnamePage();if(screen==='printer')renderPrinterPage();if(screen==='payments')renderPaymentSettings();if(screen==='sales-settings')renderSalesSettingsPage();if(screen==='labels')renderLabelPage();if(screen==='points-settings')renderPointsSettings();if(screen==='ppn-settings')renderPPNSettings();if(screen==='report-general')renderGeneralReportPage();if(screen==='report-cashflow')renderCashFlowReport();if(screen==='report-finance')renderFinanceReportPage();if(screen==='report-detail')renderReportDetailPage();if(screen==='account-system')renderAccountSystemPage();if(screen==='consignment')renderConsignmentPage();if(screen==='purchase-form')renderPurchaseFormPage();if(screen==='purchase-detail')renderPurchaseDetailPage();if(screen==='sales'){const salesList=document.getElementById('salesMobileList');if(salesList)salesList.scrollTop=0}const active=document.getElementById('screen-'+screen);if(active){active.scrollTop=0;active.scrollLeft=0;active.querySelectorAll('.sales-mobile-list,.stock-mobile-list,.customer-mobile-list,.expense-mobile-list,.category-page,.sale-detail-page,.mobile-product-page,.mobile-product-form-body,.stock-opname-list,.feature-setting-body,.account-system-body,.market-storefront,.notification-list,.shift-page-body,.supplier-page-body,.purchase-entry-layout,.purchase-detail-page').forEach(el=>{el.scrollTop=0;el.scrollLeft=0})}}
function mobileBottomGo(screen,event){
if(event){event.preventDefault();event.stopPropagation()}
const current=document.body.dataset.mobileScreen||'dashboard';
if(current===screen){
const active=document.getElementById('screen-'+screen),scroller=document.querySelector('.container');
if(scroller){scroller.scrollTop=0;scroller.scrollLeft=0}
if(active){active.scrollTop=0;active.scrollLeft=0;active.querySelectorAll('.sales-mobile-list,.stock-mobile-list,.feature-setting-body,.category-page,.sale-detail-page,.notification-list').forEach(el=>{el.scrollTop=0;el.scrollLeft=0})}
return
}
go(screen)
}
document.querySelectorAll('[data-screen]:not(.mbtn)').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.screen)));
function toggleTheme(force){const cur=document.documentElement.dataset.theme||'light';const next=force||(cur==='light'?'dark':'light');document.documentElement.dataset.theme=next;db.settings.theme=next;save();const themeBtn=document.getElementById('themeBtn');if(themeBtn)themeBtn.textContent=next==='dark'?'☀':'☾';const themeMeta=document.getElementById('themeColorMeta')||document.querySelector('meta[name=theme-color]');if(themeMeta)themeMeta.setAttribute('content',next==='dark'?'#141619':'#e11d2e')}
let notificationFilterValue='all',notificationReturnScreen='dashboard';
function notificationConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.notifications||typeof db.settings.notifications!=='object')db.settings.notifications={stock:true,expiry:true,transactions:true,market:true,browser:false};
const c=db.settings.notifications;['stock','expiry','transactions','market','browser'].forEach(k=>c[k]=!!c[k]);return c
}
function notificationIcon(type){return({stock:'▦',expiry:'◷',transaction:'✓',market:'🛍',system:'🔔'})[type]||'🔔'}
function notificationTypeLabel(type){return({stock:'Stok',expiry:'Expired',transaction:'Transaksi',market:'Market Online',system:'Sistem'})[type]||'Notifikasi'}
function notificationTypeSetting(type){return type==='transaction'?'transactions':type}
function browserNotificationSupported(){return typeof window!=='undefined'&&'Notification'in window}
function browserNotificationPermission(){return browserNotificationSupported()?Notification.permission:'unsupported'}
function maybeShowBrowserNotification(n){const c=notificationConfig();if(!c.browser||!browserNotificationSupported()||Notification.permission!=='granted')return;try{const note=new Notification(`INPOS • ${n.title}`,{body:n.message||'',tag:n.key||n.id});note.onclick=()=>{try{window.focus()}catch(e){};openNotifications()}}catch(e){}}
function addAppNotification(type,title,message,options={}){
const c=notificationConfig(),setting=notificationTypeSetting(type);if(setting&&setting in c&&!c[setting])return null;
const key=String(options.key||'');if(key&&db.notifications.some(n=>n.key===key))return null;
const n={id:uid('NTF'),type,title:String(title||'Notifikasi'),message:String(message||''),time:new Date().toISOString(),read:false,actionScreen:String(options.actionScreen||''),actionId:options.actionId??null,key};
db.notifications.unshift(n);db.notifications=db.notifications.slice(0,100);save();updateNotificationBadge();if(options.system!==false)maybeShowBrowserNotification(n);return n
}
function syncSmartNotifications(){
const c=notificationConfig(),day=todayKey();let changed=false;
if(c.stock){const low=db.products.filter(p=>!p.noStock&&Number(p.stock)<=Number(p.min));if(low.length){const key=`auto-stock-${day}-${low.map(p=>`${p.id}:${p.stock}`).join(',')}`;if(!db.notifications.some(n=>n.key===key)){const names=low.slice(0,3).map(p=>p.name).join(', '),extra=low.length>3?` +${low.length-3} lainnya`:'';db.notifications.unshift({id:uid('NTF'),type:'stock',title:`${low.length} produk stok menipis`,message:`${names}${extra}. Segera cek dan lakukan restok.`,time:new Date().toISOString(),read:false,actionScreen:'stock',actionId:null,key});changed=true}}}
if(c.expiry){const exp=db.products.map(p=>({p,d:productExpiryDays(p)})).filter(x=>x.d!==null&&x.d<=30).sort((a,b)=>a.d-b.d);if(exp.length){const overdue=exp.filter(x=>x.d<0),soon=exp.filter(x=>x.d>=0);const key=`auto-expiry-${day}-${exp.map(x=>`${x.p.id}:${x.p.expiry}`).join(',')}`;if(!db.notifications.some(n=>n.key===key)){const title=overdue.length?`${overdue.length} produk melewati masa berlaku`:`${soon.length} produk mendekati expired`;const first=exp[0],when=first.d<0?`${Math.abs(first.d)} hari lewat`:first.d===0?'hari ini':`${first.d} hari lagi`;db.notifications.unshift({id:uid('NTF'),type:'expiry',title,message:`${first.p.name} ${when}${exp.length>1?` • ${exp.length-1} produk lainnya perlu dicek`:''}.`,time:new Date().toISOString(),read:false,actionScreen:'stock',actionId:null,key});changed=true}}}
if(changed){db.notifications=db.notifications.slice(0,100);save()}updateNotificationBadge()
}
function unreadNotificationCount(){return db.notifications.filter(n=>!n.read).length}
function updateNotificationBadge(){const count=unreadNotificationCount(),badge=document.getElementById('notificationBadge'),menu=document.getElementById('notificationMenuStatus');if(badge){badge.textContent=count>99?'99+':String(count);badge.classList.toggle('show',count>0)}if(menu)menu.textContent=count?`${count} belum dibaca • stok, expired, transaksi, aktivitas toko`:'Semua notifikasi sudah dibaca'}
function notificationPopupMarkup(){return`<div class="notification-popup-head"><div class="notification-popup-title"><span class="notification-popup-title-ico">🔔</span><span class="notification-popup-title-copy"><b>Pusat Notifikasi</b><small id="notificationSummaryText">Aktivitas dan peringatan penting toko</small></span></div><button class="icon-btn notification-popup-close" type="button" onclick="closeNotificationPopup()" aria-label="Tutup">×</button></div><div class="notification-popup-body"><div class="notification-popup-topline"><span class="notification-popup-unread"><span class="notification-unread-pill zero" id="notificationUnreadPill">0</span><span>belum dibaca</span></span><span class="notification-popup-mini-actions"><button type="button" onclick="markAllNotificationsRead()">Semua dibaca</button><button type="button" onclick="clearReadNotifications()">Bersihkan</button></span></div><div class="notification-filter" id="notificationFilter"><button type="button" class="active" data-notification-filter="all" onclick="setNotificationFilter('all')">Semua</button><button type="button" data-notification-filter="unread" onclick="setNotificationFilter('unread')">Belum Dibaca</button><button type="button" data-notification-filter="stock" onclick="setNotificationFilter('stock')">Stok</button><button type="button" data-notification-filter="expiry" onclick="setNotificationFilter('expiry')">Expired</button><button type="button" data-notification-filter="transaction" onclick="setNotificationFilter('transaction')">Transaksi</button><button type="button" data-notification-filter="market" onclick="setNotificationFilter('market')">Market</button></div><div class="notification-popup-list-wrap"><div class="notification-list" id="notificationList"></div></div></div>`}
function openNotifications(){const active=document.querySelector('.screen.active')?.id?.replace('screen-','')||'dashboard';notificationReturnScreen=active;syncSmartNotifications();const m=document.getElementById('modalBox'),overlay=document.getElementById('overlay');if(!m||!overlay)return;m.className='modal notification-popup-modal';m.innerHTML=notificationPopupMarkup();overlay.classList.add('show','notification-popup-overlay');document.body.style.overflow='hidden';renderNotifications()}
function closeNotificationPopup(){closeModal()}
function notificationBack(){closeNotificationPopup()}
function openNotificationSettings(){go('notification-settings');renderNotificationSettings()}
function notificationSettingsBack(){go('more')}
function setNotificationFilter(value){notificationFilterValue=['all','unread','stock','expiry','transaction','market'].includes(value)?value:'all';renderNotifications()}
function filteredNotifications(){return db.notifications.filter(n=>notificationFilterValue==='all'||(notificationFilterValue==='unread'&&!n.read)||n.type===notificationFilterValue)}
function renderNotificationSettings(){
const c=notificationConfig();['stock','expiry','transactions','market','browser'].forEach(k=>document.getElementById('notificationSetting-'+k)?.classList.toggle('on',!!c[k]));
const count=document.getElementById('notificationSettingsEnabledCount');if(count)count.textContent=['stock','expiry','transactions','market','browser'].filter(k=>!!c[k]).length;
const status=document.getElementById('browserNotificationStatus'),perm=browserNotificationPermission();if(status)status.textContent=perm==='granted'?'Izin perangkat aktif • notifikasi sistem diizinkan':perm==='denied'?'Izin browser ditolak • ubah melalui pengaturan situs/browser':perm==='unsupported'?'Browser ini tidak mendukung Notification API':'Aktifkan untuk meminta izin notifikasi perangkat';
}
function renderNotifications(){
syncSmartNotifications();const list=document.getElementById('notificationList'),rows=filteredNotifications(),unread=unreadNotificationCount(),summary=document.getElementById('notificationSummaryText'),pill=document.getElementById('notificationUnreadPill');
if(summary)summary.textContent=unread?`${unread} notifikasi baru`:'Tidak ada notifikasi baru';
if(pill){pill.textContent=unread>99?'99+':String(unread);pill.classList.toggle('zero',unread===0)}
document.querySelectorAll('[data-notification-filter]').forEach(b=>b.classList.toggle('active',b.dataset.notificationFilter===notificationFilterValue));
if(list)list.innerHTML=rows.length?rows.map(n=>`<button type="button" class="notification-item type-${esc(n.type)} ${n.read?'':'unread'}" onclick="openNotificationItem('${esc(n.id)}')"><span class="notification-icon">${notificationIcon(n.type)}</span><span class="notification-copy"><b>${esc(n.title)}</b><p>${esc(n.message)}</p><span class="notification-meta"><span class="notification-type-tag">${esc(notificationTypeLabel(n.type))}</span><span>${fmtTime(n.time)}</span></span></span></button>`).join(''):`<div class="notification-empty"><span class="notification-empty-icon">🔔</span><strong>Belum ada notifikasi</strong><span>${notificationFilterValue==='all'?'Peringatan stok, expired, transaksi, dan aktivitas penting akan muncul di sini.':'Tidak ada notifikasi untuk filter ini.'}</span></div>`;
renderNotificationSettings();updateNotificationBadge()
}
function openNotificationItem(id){const n=db.notifications.find(x=>x.id===id);if(!n)return;n.read=true;save();updateNotificationBadge();if(n.actionScreen&&pageMeta[n.actionScreen]){closeNotificationPopup();if(n.actionScreen==='sale-detail'&&n.actionId)openSaleDetail(n.actionId);else go(n.actionScreen)}else renderNotifications()}
function markAllNotificationsRead(){let changed=false;db.notifications.forEach(n=>{if(!n.read){n.read=true;changed=true}});if(changed)save();renderNotifications();toast(changed?'Semua notifikasi ditandai dibaca.':'Tidak ada notifikasi baru.')}
function clearReadNotifications(){const before=db.notifications.length;db.notifications=db.notifications.filter(n=>!n.read);if(db.notifications.length!==before)save();renderNotifications();toast(before===db.notifications.length?'Tidak ada notifikasi terbaca untuk dibersihkan.':'Notifikasi yang sudah dibaca dibersihkan.')}
function toggleNotificationSetting(key){const c=notificationConfig();if(!(key in c)||key==='browser')return;c[key]=!c[key];save();if(c[key])syncSmartNotifications();renderNotificationSettings();updateNotificationBadge();toast(`Notifikasi ${key==='transactions'?'transaksi':key==='expiry'?'masa berlaku':key==='stock'?'stok':'Market Online'} ${c[key]?'diaktifkan':'dinonaktifkan'}.`)}
async function toggleBrowserNotifications(){const c=notificationConfig();if(c.browser){c.browser=false;save();renderNotificationSettings();toast('Notifikasi perangkat dinonaktifkan.');return}if(!browserNotificationSupported()){toast('Browser ini tidak mendukung notifikasi perangkat.','error');return}try{const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();c.browser=permission==='granted';save();renderNotificationSettings();if(c.browser){toast('Notifikasi perangkat diaktifkan.');maybeShowBrowserNotification({id:uid('NTF'),key:'notification-test',title:'Notifikasi Aktif',message:'INPOS siap menampilkan peringatan penting.'})}else toast('Izin notifikasi belum diberikan.','error')}catch(e){toast('Tidak dapat meminta izin notifikasi pada browser ini.','error')}}
function ensureSalesFeatureMenu(){
const sec=document.getElementById('salesFeatureMenuSection');if(!sec)return;sec.hidden=false;sec.removeAttribute('aria-hidden');
const expected=['discount-settings','wholesale-settings','mass-price-settings','bundle-settings'];
expected.forEach(screen=>{const btn=sec.querySelector(`[data-sales-feature-menu="${screen}"]`);if(btn){btn.hidden=false;btn.disabled=false;btn.removeAttribute('aria-hidden')}})
}
function renderSalesFeatureScreen(screen){
ensureSalesFeatureMenu();
if(screen==='discount-settings')return renderDiscountSettings();
if(screen==='wholesale-settings')return renderWholesaleSettings();
if(screen==='mass-price-settings')return renderMassPriceSettings();
if(screen==='bundle-settings')return renderBundleSettings();
}
function salesFeatureConfig(){
const defaults={wholesaleEnabled:false,wholesaleMinQty:10,wholesaleDurationValue:30,wholesaleDurationUnit:'day',wholesaleStartsAt:null,wholesaleExpiresAt:null,wholesaleBonusRules:[]};
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.salesFeatures||typeof db.settings.salesFeatures!=='object')db.settings.salesFeatures={...defaults};
const c=db.settings.salesFeatures;
delete c.discountEnabled;delete c.discountType;delete c.discountValue;
delete c.globalDiscountEnabled;delete c.globalDiscountType;delete c.globalDiscountValue;
c.wholesaleEnabled=!!c.wholesaleEnabled;
c.wholesaleMinQty=Math.max(2,Math.round(Number(c.wholesaleMinQty)||10));
c.wholesaleDurationValue=Math.max(1,Math.round(Number(c.wholesaleDurationValue)||30));
c.wholesaleDurationUnit=c.wholesaleDurationUnit==='month'?'month':'day';
if(!c.wholesaleStartsAt)c.wholesaleStartsAt=new Date().toISOString();
if(!c.wholesaleExpiresAt)c.wholesaleExpiresAt=bundleExpiryISO(c.wholesaleDurationValue,c.wholesaleDurationUnit,c.wholesaleStartsAt);
c.wholesaleBonusRules=(Array.isArray(c.wholesaleBonusRules)?c.wholesaleBonusRules:[]).filter(r=>r&&typeof r==='object').map((r,i)=>({id:String(r.id||('WBG-'+(i+1))),buyProductId:Number(r.buyProductId),buyQty:Math.max(1,Math.round(Number(r.buyQty)||1)),bonusProductId:Number(r.bonusProductId),bonusQty:Math.max(1,Math.round(Number(r.bonusQty)||1))}));
return c
}
function promoBundleProductIds(excludeBundleId=null){
const ids=new Set();if(!optionalFeatureEnabled('bundling'))return ids;(db.bundles||[]).forEach(b=>{if(excludeBundleId!=null&&Number(b?.id)===Number(excludeBundleId))return;(b?.items||[]).forEach(x=>{const id=Number(x?.productId);if(Number.isFinite(id))ids.add(id)})});return ids
}
function promoBonusProductIds(excludeRuleId=null){
if(!optionalFeatureEnabled('wholesale'))return new Set();
const ids=new Set(),rules=Array.isArray(salesFeatureConfig().wholesaleBonusRules)?salesFeatureConfig().wholesaleBonusRules:[];rules.forEach(r=>{if(excludeRuleId!=null&&String(r?.id)===String(excludeRuleId))return;const buy=Number(r?.buyProductId),bonus=Number(r?.bonusProductId);if(Number.isFinite(buy))ids.add(buy);if(Number.isFinite(bonus))ids.add(bonus)});return ids
}
function productAvailableForWholesale(p){if(!p)return false;const id=Number(p.id);return!promoBonusProductIds().has(id)&&!promoBundleProductIds().has(id)}
function productAvailableForBonus(p,excludeRuleId=null,otherProductId=null){if(!p)return false;const id=Number(p.id);if(otherProductId!=null&&id===Number(otherProductId))return false;return p.wholesaleConfigured!==true&&!promoBundleProductIds().has(id)&&!promoBonusProductIds(excludeRuleId).has(id)}
function productAvailableForBundle(p){if(!p)return false;const id=Number(p.id);return(!optionalFeatureEnabled('wholesale')||p.wholesaleConfigured!==true)&&!promoBonusProductIds().has(id)}
function promoConflictLabel(p){if(!p)return'';const id=Number(p.id),labels=[];if(p.wholesaleConfigured===true)labels.push('Grosir Per Produk');if(promoBonusProductIds().has(id))labels.push('Bonus Produk');if(promoBundleProductIds().has(id))labels.push('Bundling');return labels.join(' + ')}
function bonusRulePromoConflicts(r){if(!r)return[];const ids=[Number(r.buyProductId),Number(r.bonusProductId)],out=[];if(ids[0]===ids[1]&&Number.isFinite(ids[0]))out.push({id:ids[0],reason:'Produk dibeli dan bonus tidak boleh sama'});ids.forEach(id=>{const p=getProduct(id);if(!p)return;if(p.wholesaleConfigured===true)out.push({id,reason:'Grosir Per Produk'});if(promoBundleProductIds().has(id))out.push({id,reason:'Bundling'});if(promoBonusProductIds(r.id).has(id))out.push({id,reason:'Aturan Bonus lain'})});return out}
function bundlePromoConflicts(b){if(!b)return[];const out=[],seen=new Set();(b.items||[]).forEach(x=>{const id=Number(x?.productId),p=getProduct(id);if(!p||seen.has(id))return;seen.add(id);if(optionalFeatureEnabled('wholesale')&&p.wholesaleConfigured===true)out.push({id,name:p.name,reason:'Grosir Per Produk'});if(promoBonusProductIds().has(id))out.push({id,name:p.name,reason:'Bonus Produk'})});return out}
function bonusEligibleProducts(excludeRuleId=null,otherProductId=null){return sortProductsNatural(db.products.filter(p=>productAvailableForBonus(p,excludeRuleId,otherProductId)))}
function transactionDiscountTotal(){if(!optionalFeatureEnabled('discount'))return 0;const sub=cartSubtotal();return Math.min(sub,Math.max(0,Number(discount)||0))}
function productDiscountAmount(p,base){if(!optionalFeatureEnabled('discount')||!p||p.manualPrice||p.discountConfigured!==true||p.discountActive===false||p.wholesaleConfigured===true)return 0;const value=Math.max(0,Number(p.discountValue)||0);if(!value)return 0;const type=p.discountType==='nominal'?'nominal':'percent';return type==='percent'?Math.min(base,Math.round(base*Math.min(100,value)/100)):Math.min(base,value)}
function productSalePrice(p,base){const raw=Math.max(0,Number(base)||0);return Math.max(0,Math.round(raw-productDiscountAmount(p,raw)))}
function productVariantsActive(p){const variants=Array.isArray(p?.variants)?p.variants.map(v=>String(v||'').trim()).filter(Boolean):[];return p?.variantsEnabled===true||variants.length>1||(variants.length===1&&variants[0]!=='Default')}
function variantExtraCost(p,variant){const key=String(variant||'Default').trim()||'Default';return Math.max(0,Number(p?.variantCosts?.[key])||0)}
function productPriceWithVariant(p,variant='Default',basePrice=null){const base=basePrice===null?productSalePrice(p,p?.price||0):Math.max(0,Number(basePrice)||0);return Math.max(0,base+variantExtraCost(p,variant))}
function productDiscountLabel(p){const value=Math.max(0,Number(p?.discountValue)||0);if(!value)return'Tanpa diskon';return p?.discountType==='nominal'?`Diskon ${rupiah(value)}`:`Diskon ${Math.min(100,value)}%`}
function clearCartItemProductDiscount(x){if(!x)return;delete x.productDiscountAmount;delete x.productDiscountType;delete x.productDiscountValue;delete x.productBasePrice}
function setCartItemProductDiscount(x,p,base){if(!x||!p)return;const amount=Math.max(0,Number(productDiscountAmount(p,base))||0);if(!amount){clearCartItemProductDiscount(x);return}x.productDiscountAmount=amount;x.productDiscountType=p.discountType==='nominal'?'nominal':'percent';x.productDiscountValue=Math.max(0,Number(p.discountValue)||0);x.productBasePrice=Math.max(0,Number(base)||0)}
function cartItemProductDiscountInfo(x){if(!optionalFeatureEnabled('discount'))return null;const amount=Math.max(0,Number(x?.productDiscountAmount)||0);if(!amount)return null;const type=x?.productDiscountType==='nominal'?'nominal':'percent',value=Math.max(0,Number(x?.productDiscountValue)||0),qty=Math.max(0,Number(x?.qty)||0),total=Math.max(0,amount*qty),label=type==='nominal'?`Diskon ${rupiah(value||amount)}`:`Diskon ${Math.min(100,value)}%`;return{amount,type,value,total,label}}
function cartItemProductDiscountHTML(x,className='product-discount-value'){const info=cartItemProductDiscountInfo(x);return info?`<span class="${className}">${esc(info.label)} • −${rupiah(info.total)}</span>`:''}
function toggleSalesFeatureSwitch(btn){if(!btn)return;const on=!btn.classList.contains('on');btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on))}
function renderDiscountSettings(){
const el=document.getElementById('discountSettingsBody');if(!el)return;const discountProducts=db.products.filter(p=>p.discountConfigured===true&&p.wholesaleConfigured!==true),available=db.products.filter(p=>p.wholesaleConfigured!==true&&p.discountConfigured!==true);
el.innerHTML=`<div class="feature-setting-card"><h3>Diskon Per Produk</h3><p>Atur diskon otomatis untuk produk tertentu. Produk grosir tidak tersedia.</p><label class="discount-picker-rule-v527"><input type="checkbox" id="enableManualSaleDiscountV529" ${db.settings?.enableManualSaleDiscountV529===true?'checked':''} onchange="setManualSaleDiscountV529(this.checked)"><span><b>Diskon Manual di Penjualan</b><small>Izinkan diskon Rp/% saat menambah produk.</small></span></label><label class="discount-picker-rule-v527"><input type="checkbox" id="showProductDiscountInSalePickerV527" ${db.settings?.showProductDiscountInSalePickerV527!==false?'checked':''} onchange="toggleProductDiscountPickerV527(this.checked)"><span><b>Tampilkan Label Diskon</b><small>Tampilkan promo aktif saat memilih atau menambah produk.</small></span></label><div class="rule-list-toolbar"><div class="rule-list-copy"><b>${discountProducts.length} produk diskon</b><small>${available.length} produk tersedia untuk ditambahkan</small></div><button type="button" class="btn btn-primary" onclick="openAddDiscountProduct()" ${available.length?'':'disabled'}>+ Tambah Produk</button></div><div class="product-discount-bulk"><div class="field"><label>Jenis</label><select id="productDiscountGlobalType" onchange="renderProductDiscountGlobalInput()"><option value="percent">%</option><option value="nominal">Rp</option></select></div><div class="field"><label id="productDiscountGlobalValueLabel">Persentase</label><input id="productDiscountGlobalValue" type="number" inputmode="numeric" min="0" max="100" step="1" value="0"></div><button type="button" class="btn btn-primary" onclick="applyProductDiscountGlobal()" ${discountProducts.length?'':'disabled'}>Set Global</button><button type="button" class="btn btn-reset" onclick="resetProductDiscountSettings()" ${discountProducts.length?'':'disabled'}>Reset</button></div><div class="feature-product-list" id="discountProductList">${discountProducts.length?discountProducts.map(p=>`<div class="feature-product-row discount-product-row ${p.discountActive===false?'discount-row-off-v526':''}"><div class="feature-product-info"><b>${esc(p.name)}</b><span class="discount-status-pill-v526 ${p.discountActive===false?'off':'on'}">${p.discountActive===false?'Nonaktif':'Aktif'}</span><small>${esc(p.category||'Umum')} • Ecer ${p.manualPrice?'Manual':rupiah(p.price)} • <span class="feature-product-discount-note">${productDiscountLabel(p)}</span></small></div><div class="feature-mini-field"><span>Jenis</span><select data-product-discount-type="${p.id}" onchange="updateProductDiscountInput(${p.id})"><option value="percent" ${p.discountType!=='nominal'?'selected':''}>%</option><option value="nominal" ${p.discountType==='nominal'?'selected':''}>Rp</option></select></div><div class="feature-mini-field"><span>Nilai</span><input data-product-discount-value="${p.id}" ${p.discountType==='nominal'?'class="nominal-input" type="text" inputmode="numeric"':'type="number" inputmode="numeric" min="0" max="100" step="1"'} value="${p.discountType==='nominal'?nominal(p.discountValue||0):Math.min(100,Number(p.discountValue)||0)}" aria-label="Diskon ${esc(p.name)}"></div><div class="discount-product-actions-v526"><button type="button" class="discount-power-btn-v526 ${p.discountActive===false?'off':'on'}" onclick="toggleProductDiscountActiveV526(${p.id})" aria-label="${p.discountActive===false?'Aktifkan':'Nonaktifkan'} diskon ${esc(p.name)}" aria-pressed="${p.discountActive!==false}" title="${p.discountActive===false?'Aktifkan':'Nonaktifkan'} diskon"><svg class="promo-power-svg-v526" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7.2 5.8a8 8 0 1 0 9.6 0"/></svg></button><button type="button" class="rule-remove-btn" onclick="removeDiscountProduct(${p.id})" aria-label="Hapus ${esc(p.name)} dari Diskon Per Produk" title="Hapus dari daftar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div></div>`).join(''):'<div class="empty-state">Belum ada produk Diskon Per Produk. Tekan <b>+ Tambah Produk</b>.</div>'}</div><div class="feature-actions"><button class="btn btn-primary" onclick="saveProductDiscountSettings()" ${discountProducts.length?'':'disabled'}>Simpan Diskon Per Produk</button></div></div>`;
renderProductDiscountGlobalInput()
if(typeof window.syncWholesaleDiscountDockV177==='function'){
window.syncWholesaleDiscountDockV177();
}
}
function captureProductDiscountDraft(){document.querySelectorAll('[data-product-discount-value]').forEach(inp=>{const id=Number(inp.dataset.productDiscountValue),p=getProduct(id);if(!p||p.discountConfigured!==true)return;const type=document.querySelector(`[data-product-discount-type="${id}"]`)?.value||p.discountType||'percent';p.discountType=type==='nominal'?'nominal':'percent';p.discountValue=p.discountType==='nominal'?Math.max(0,parseNominal(inp.value)):Math.min(100,Math.max(0,Number(inp.value)||0))})}
function filterDiscountAddProducts(){const q=(document.getElementById('addDiscountProductSearch')?.value||'').trim().toLocaleLowerCase('id-ID');let visible=0;document.querySelectorAll('#addDiscountProductList .rule-product-option').forEach(row=>{const show=!q||(row.dataset.search||'').includes(q);row.hidden=!show;if(show)visible++});const empty=document.getElementById('addDiscountProductEmpty');if(empty)empty.hidden=visible>0}
function openAddDiscountProduct(){captureProductDiscountDraft();const available=db.products.filter(p=>p.wholesaleConfigured!==true&&p.discountConfigured!==true);if(!available.length)return toast('Tidak ada produk yang tersedia. Produk Grosir Per Produk tidak dapat dipilih untuk Diskon Per Produk.','error');showModal('Tambah Produk Diskon','Pilih produk untuk Diskon Per Produk.',`<div class="field rule-add-select"><label>Produk</label><input id="addDiscountProductSearch" class="rule-product-search" placeholder="Cari nama produk / barcode / kategori" autocomplete="off" oninput="filterDiscountAddProducts()"><div class="rule-product-picker" id="addDiscountProductList">${available.map((p,i)=>{const stock=Number(p.stock)||0,stockText=p.noStock?'∞':stock.toLocaleString('id-ID',{maximumFractionDigits:2}),stockClass=p.noStock?'is-nostock':(!p.noStock&&stock<=Number(p.min||0)?'is-low':'');return`<label class="rule-product-option wholesale-picker-option" data-search="${esc((p.name+' '+(p.barcode||'')+' '+(p.category||'Umum')).toLocaleLowerCase('id-ID'))}"><input type="radio" name="addDiscountProductChoice" value="${p.id}" ${i===0?'checked':''}><span class="wholesale-picker-main"><b>${esc(p.name)}</b><small>${esc(p.category||'Umum')}${p.barcode?` • ${esc(p.barcode)}`:''}</small></span><span class="wholesale-picker-stock ${stockClass}"><span>Stok</span><strong>${stockText}</strong><small>${p.noStock?'Tanpa stok':esc(p.unit||'pcs')}</small></span></label>`}).join('')}<div class="rule-product-empty" id="addDiscountProductEmpty" hidden>Produk tidak ditemukan.</div></div><small>Produk yang sudah ada di Grosir Per Produk otomatis tidak ditampilkan.</small></div>`,[{label:'Batal',close:true},{label:'Tambah Produk',primary:true,fn:()=>{const selected=document.querySelector('input[name="addDiscountProductChoice"]:checked');const p=getProduct(Number(selected?.value));if(!p)return toast('Pilih produk terlebih dahulu.','error');if(p.wholesaleConfigured===true)return toast('Produk ini sudah digunakan di Grosir Per Produk.','error');p.discountConfigured=true;p.discountActive=true;p.discountType=['percent','nominal'].includes(p.discountType)?p.discountType:'percent';p.discountValue=Math.max(0,Number(p.discountValue)||0);save();closeModal();renderDiscountSettings();toast(`${p.name} ditambahkan ke Diskon Per Produk.`)}}]);const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('discount-add-product-overlay-v188');modal?.classList.add('discount-add-product-modal-v188');}
function removeDiscountProduct(id){captureProductDiscountDraft();const p=getProduct(Number(id));if(!p)return;if(!confirm(`Hapus ${p.name} dari Diskon Per Produk?`))return;p.discountConfigured=false;p.discountValue=0;save();syncCartWholesalePrices();renderCart();renderProducts();renderMobileProductPicker();renderDiscountSettings();toast('Produk dihapus dari Diskon Per Produk.')}
function toggleProductDiscountActiveV526(id){
const p=getProduct(Number(id));
if(!p||p.discountConfigured!==true||p.wholesaleConfigured===true)return toast('Produk diskon tidak ditemukan.','error');
captureProductDiscountDraft();
p.discountActive=p.discountActive===false;
save();
syncCartWholesalePrices();
renderCart();renderProducts();renderMobileProductPicker();renderDiscountSettings();
toast(`Diskon ${p.name} ${p.discountActive?'diaktifkan':'dinonaktifkan'}.`);
}
function renderProductDiscountGlobalInput(){const type=document.getElementById('productDiscountGlobalType')?.value||'percent',inp=document.getElementById('productDiscountGlobalValue'),lab=document.getElementById('productDiscountGlobalValueLabel');if(!inp)return;const current=type==='nominal'?Math.max(0,parseNominal(inp.value)):Math.min(100,Math.max(0,parseNominal(inp.value)));if(lab)lab.textContent=type==='nominal'?'Nominal':'Persentase';if(type==='nominal'){inp.type='text';inp.inputMode='numeric';inp.classList.add('nominal-input');inp.removeAttribute('min');inp.removeAttribute('max');inp.removeAttribute('step');setNominalInput(inp,current)}else{inp.classList.remove('nominal-input');inp.type='number';inp.inputMode='numeric';inp.min='0';inp.max='100';inp.step='1';inp.value=String(current)}}
function applyProductDiscountGlobal(){const type=document.getElementById('productDiscountGlobalType')?.value==='nominal'?'nominal':'percent',inp=document.getElementById('productDiscountGlobalValue'),value=type==='nominal'?Math.max(0,parseNominal(inp?.value)):Math.min(100,Math.max(0,Number(inp?.value)||0)),targets=db.products.filter(p=>p.discountConfigured===true&&p.wholesaleConfigured!==true);if(!targets.length)return toast('Tambahkan produk ke Diskon Per Produk terlebih dahulu.','error');targets.forEach(p=>{p.discountType=type;p.discountValue=value});syncCartWholesalePrices();save();renderCart();renderProducts();renderMobileProductPicker();renderDiscountSettings();toast(`Diskon ${type==='nominal'?rupiah(value):value+'%'} diterapkan ke ${targets.length} produk Diskon.`)}
function resetProductDiscountSettings(){const targets=db.products.filter(p=>p.discountConfigured===true&&p.wholesaleConfigured!==true);if(!targets.length)return toast('Belum ada produk Diskon Per Produk.','error');if(!confirm('Reset nilai diskon semua produk dalam daftar menjadi 0?'))return;targets.forEach(p=>{p.discountType='percent';p.discountValue=0});syncCartWholesalePrices();save();renderCart();renderProducts();renderMobileProductPicker();renderDiscountSettings();toast('Nilai Diskon Per Produk sudah direset.')}
function updateProductDiscountInput(id){const type=document.querySelector(`[data-product-discount-type="${id}"]`)?.value||'percent',inp=document.querySelector(`[data-product-discount-value="${id}"]`);if(!inp)return;const value=type==='nominal'?Math.max(0,parseNominal(inp.value)):Math.min(100,Math.max(0,parseNominal(inp.value)));if(type==='nominal'){inp.type='text';inp.inputMode='numeric';inp.classList.add('nominal-input');inp.removeAttribute('min');inp.removeAttribute('max');inp.removeAttribute('step');setNominalInput(inp,value)}else{inp.classList.remove('nominal-input');inp.type='number';inp.inputMode='numeric';inp.min='0';inp.max='100';inp.step='1';inp.value=String(value)}}
function saveProductDiscountSettings(){captureProductDiscountDraft();const targets=db.products.filter(p=>p.discountConfigured===true&&p.wholesaleConfigured!==true);syncCartWholesalePrices();save();renderCart();renderProducts();renderMobileProductPicker();renderDiscountSettings();toast(`${targets.length} Diskon Per Produk disimpan.`)}
function wholesaleIsExpired(c=salesFeatureConfig()){if(!c?.wholesaleExpiresAt)return false;const t=new Date(c.wholesaleExpiresAt).getTime();return Number.isFinite(t)&&t<Date.now()}
function wholesaleDurationLabel(c=salesFeatureConfig()){const n=Math.max(1,Math.round(Number(c?.wholesaleDurationValue)||1));return`${n} ${c?.wholesaleDurationUnit==='month'?'Bulan':'Hari'}`}
function wholesaleCategoryOptions(selected=''){return`<option value="">Semua Kategori</option>${categoryNames().map(cat=>`<option value="${esc(cat)}" ${selected===cat?'selected':''}>${esc(cat)}</option>`).join('')}`}
function filterWholesaleProducts(){
const select=document.getElementById('wholesaleCategoryFilter');
let category=(select?.value||'').trim();
const validCategories=new Set(categoryNames());
if(category&&!validCategories.has(category)){category='';if(select)select.value=''}
wholesaleCategoryFilterValue=category;
const normalized=category.toLocaleLowerCase('id-ID');let visible=0;
document.querySelectorAll('#wholesaleProductList .wholesale-product-row').forEach(row=>{
const rowCategory=(row.dataset.category||'Umum').trim();
const show=!normalized||rowCategory.toLocaleLowerCase('id-ID')===normalized;
row.hidden=!show;if(show)visible++
});
const count=document.getElementById('wholesaleFilterCount');
if(count){count.value=`${visible} produk`;count.setAttribute('value',`${visible} produk`)}
return visible
}
function wholesaleBonusRules(){const c=salesFeatureConfig();c.wholesaleBonusRules=(Array.isArray(c.wholesaleBonusRules)?c.wholesaleBonusRules:[]).filter(r=>r&&getProduct(Number(r.buyProductId))&&getProduct(Number(r.bonusProductId))).map(r=>({...r,buyProductId:Number(r.buyProductId),bonusProductId:Number(r.bonusProductId),buyQty:Math.max(1,Math.round(Number(r.buyQty)||1)),bonusQty:Math.max(1,Math.round(Number(r.bonusQty)||1))}));return c.wholesaleBonusRules}
function wholesaleBonusProductOptions(selected){
const selectedId=Number(selected),bundleIds=promoBundleProductIds();
return sortProductsNatural(db.products).filter(p=>Number(p.id)===selectedId||productAvailableForBonus(p)).map(p=>{const id=Number(p.id),external=[];if(p.wholesaleConfigured===true)external.push('Grosir');if(bundleIds.has(id))external.push('Bundling');const conflict=external.length?` • Konflik ${external.join('/')}`:'';return`<option value="${p.id}" ${selectedId===id?'selected':''}>${esc(p.name)}${p.noStock?' • Tanpa Stok':` • Stok ${Number(p.stock||0).toLocaleString('id-ID',{maximumFractionDigits:2})}`}${conflict}</option>`}).join('')
}
function addWholesaleBonusRule(){
captureWholesaleDraft();const eligible=bonusEligibleProducts();if(eligible.length<2)return toast('Minimal 2 produk yang belum dipakai di Grosir Per Produk, Bonus Produk, atau Bundling diperlukan.','error');const c=salesFeatureConfig(),first=eligible[0],second=eligible[1];c.wholesaleBonusRules.push({id:uid('WBG'),buyProductId:first.id,buyQty:Math.max(1,Number(c.wholesaleMinQty)||10),bonusProductId:second.id,bonusQty:1});save();renderWholesaleSettings();toast('Aturan Bonus Produk ditambahkan.')
}
function updateWholesaleBonusRule(id,key,value){
const r=salesFeatureConfig().wholesaleBonusRules.find(x=>String(x.id)===String(id));if(!r)return;
if(key==='buyProductId'||key==='bonusProductId'){
const productId=Number(value),p=getProduct(productId),other=key==='buyProductId'?r.bonusProductId:r.buyProductId;
if(!p||!productAvailableForBonus(p,r.id,other)){toast('Produk sudah dipakai di promo lain. Hapus dari Grosir/Bundling/Bonus lain terlebih dahulu.','error');renderWholesaleSettings();return}
r[key]=productId
}else if(key==='buyQty'||key==='bonusQty')r[key]=Math.max(1,Math.round(Number(value)||1));
save();syncCartWholesalePrices();renderCart();renderWholesaleSettings()
}
function removeWholesaleBonusRule(id){const c=salesFeatureConfig(),r=c.wholesaleBonusRules.find(x=>String(x.id)===String(id));if(!r)return;c.wholesaleBonusRules=c.wholesaleBonusRules.filter(x=>String(x.id)!==String(id));save();syncCartWholesalePrices();renderCart();renderWholesaleSettings();toast('Aturan Bonus Produk dihapus.')}
function captureWholesaleBonusDraft(){document.querySelectorAll('[data-wholesale-bonus-rule]').forEach(row=>{const r=salesFeatureConfig().wholesaleBonusRules.find(x=>String(x.id)===String(row.dataset.wholesaleBonusRule));if(!r)return;r.buyProductId=Number(row.querySelector('[data-bonus-buy-product]')?.value||r.buyProductId);r.buyQty=Math.max(1,Math.round(Number(row.querySelector('[data-bonus-buy-qty]')?.value)||1));r.bonusProductId=Number(row.querySelector('[data-bonus-product]')?.value||r.bonusProductId);r.bonusQty=Math.max(1,Math.round(Number(row.querySelector('[data-bonus-qty]')?.value)||1))})}
function wholesaleBonusRuleSummary(r){const buy=getProduct(Number(r.buyProductId)),bonus=getProduct(Number(r.bonusProductId));return`Beli ${Math.max(1,Number(r.buyQty)||1)} ${buy?.name||'Produk'} → Bonus ${Math.max(1,Number(r.bonusQty)||1)} ${bonus?.name||'Produk'}`}
function wholesalePurchasedQty(productId){return sum(cart.filter(x=>Number(x.productId)===Number(productId)&&!x.wholesaleBonus&&!x.bundleId),x=>Number(x.qty)||0)}
function syncCartWholesaleBonuses(config=null){const c=config||salesFeatureConfig(),active=optionalFeatureEnabled('wholesale')&&c.wholesaleEnabled&&!wholesaleIsExpired(c),rules=wholesaleBonusRules();cart=cart.filter(x=>!x.wholesaleBonus);if(!active||!rules.length)return;rules.forEach(r=>{if(bonusRulePromoConflicts(r).length)return;const buy=getProduct(Number(r.buyProductId)),bonus=getProduct(Number(r.bonusProductId));if(!buy||!bonus)return;const bought=wholesalePurchasedQty(buy.id),times=Math.floor((bought+1e-9)/Math.max(1,Number(r.buyQty)||1)),bonusQty=times*Math.max(1,Number(r.bonusQty)||1);if(bonusQty<=0)return;cart.push({productId:bonus.id,qty:bonusQty,price:0,variantFee:0,itemFee:0,note:`Bonus Grosir • ${wholesaleBonusRuleSummary(r)}`,variant:'',priceLocked:true,wholesaleBonus:true,wholesaleBonusRuleId:r.id,wholesaleBonusSourceProductId:buy.id})})}
function captureWholesaleDraft(){document.querySelectorAll('[data-wholesale-product]').forEach(inp=>{const p=getProduct(Number(inp.dataset.wholesaleProduct));if(p&&p.wholesaleConfigured===true)p.wholesale=Math.max(0,parseNominal(inp.value))});document.querySelectorAll('[data-wholesale-min]').forEach(inp=>{const p=getProduct(Number(inp.dataset.wholesaleMin));if(p&&p.wholesaleConfigured===true)p.wholesaleMinQty=Math.max(2,Math.round(Number(inp.value)||salesFeatureConfig().wholesaleMinQty))});captureWholesaleBonusDraft()}
function filterWholesaleAddProducts(){const q=(document.getElementById('addWholesaleProductSearch')?.value||'').trim().toLocaleLowerCase('id-ID');let visible=0;document.querySelectorAll('#addWholesaleProductList .rule-product-option').forEach(row=>{const show=!q||(row.dataset.search||'').includes(q);row.hidden=!show;if(show)visible++});const empty=document.getElementById('addWholesaleProductEmpty');if(empty)empty.hidden=visible>0}
function openAddWholesaleProduct(){captureWholesaleDraft();const available=db.products.filter(p=>p.wholesaleConfigured!==true&&productAvailableForWholesale(p));if(!available.length)return toast('Tidak ada produk yang tersedia. Produk Bonus dan Bundling tidak ditampilkan di Grosir Per Produk.','error');showModal('Tambah Produk Grosir','Pilih produk untuk Grosir Per Produk.',`<div class="field rule-add-select"><label>Produk</label><input id="addWholesaleProductSearch" class="rule-product-search" placeholder="Cari nama produk / barcode / kategori" autocomplete="off" oninput="filterWholesaleAddProducts()"><div class="rule-product-picker" id="addWholesaleProductList">${available.map((p,i)=>{const stock=Number(p.stock)||0,stockText=p.noStock?'∞':stock.toLocaleString('id-ID',{maximumFractionDigits:2}),stockClass=p.noStock?'is-nostock':(!p.noStock&&stock<=Number(p.min||0)?'is-low':'');return`<label class="rule-product-option wholesale-picker-option" data-search="${esc((p.name+' '+(p.barcode||'')+' '+(p.category||'Umum')).toLocaleLowerCase('id-ID'))}"><input type="radio" name="addWholesaleProductChoice" value="${p.id}" ${i===0?'checked':''}><span class="wholesale-picker-main"><b>${esc(p.name)}</b><small>${esc(p.category||'Umum')}${p.barcode?` • ${esc(p.barcode)}`:''}</small></span><span class="wholesale-picker-stock ${stockClass}"><span>Stok</span><strong>${stockText}</strong></span></label>`}).join('')}<div class="rule-product-empty" id="addWholesaleProductEmpty" hidden>Produk tidak ditemukan.</div></div><small>Produk yang sudah digunakan di Bonus Produk atau Bundling otomatis tidak ditampilkan. Jika produk memiliki Diskon Per Produk, diskon akan dilepas saat dipindahkan ke Grosir.</small></div>`,[{label:'Batal',close:true},{label:'Tambah Produk',primary:true,fn:()=>{const selected=document.querySelector('input[name="addWholesaleProductChoice"]:checked');const p=getProduct(Number(selected?.value));if(!p)return toast('Pilih produk terlebih dahulu.','error');if(!productAvailableForWholesale(p))return toast('Produk sudah dipakai di Bonus Produk atau Bundling.','error');const hadDiscount=p.discountConfigured===true;p.wholesaleConfigured=true;p.wholesaleMinQty=Math.max(2,Number(p.wholesaleMinQty)||salesFeatureConfig().wholesaleMinQty);if(!(Number(p.wholesale)>0)&&!p.manualPrice)p.wholesale=Math.max(0,Number(p.price)||0);p.discountConfigured=false;p.discountValue=0;save();closeModal();renderWholesaleSettings();renderDiscountSettings();syncCartWholesalePrices();renderCart();toast(hadDiscount?`${p.name} dipindahkan dari Diskon ke Grosir Per Produk.`:`${p.name} ditambahkan ke Grosir Per Produk.`)}}])}
function removeWholesaleProduct(id){captureWholesaleDraft();const p=getProduct(Number(id));if(!p)return;if(!confirm(`Hapus ${p.name} dari Grosir Per Produk?`))return;p.wholesaleConfigured=false;save();syncCartWholesalePrices();renderCart();renderWholesaleSettings();renderDiscountSettings();toast('Produk dihapus dari Grosir Per Produk dan kembali tersedia di Diskon Per Produk.')}
function renderWholesaleSettings(){
const el=document.getElementById('wholesaleSettingsBody');if(!el)return;
const preservedWholesaleScrollV456=el.scrollTop;
const c=salesFeatureConfig(),expired=wholesaleIsExpired(c),validCategories=new Set(categoryNames()),wholesaleProducts=db.products.filter(p=>p.wholesaleConfigured===true&&productAvailableForWholesale(p)),available=db.products.filter(p=>p.wholesaleConfigured!==true&&productAvailableForWholesale(p)),bonusRules=wholesaleBonusRules();
if(wholesaleCategoryFilterValue&&!validCategories.has(wholesaleCategoryFilterValue))wholesaleCategoryFilterValue='';
const status=c.wholesaleEnabled?(expired?'Masa berlaku habis':`Aktif s/d ${fmtDate(c.wholesaleExpiresAt)}`):'Nonaktif';
const bonusHtml=bonusRules.length?bonusRules.map((r,i)=>`<div class="wholesale-bonus-rule" data-wholesale-bonus-rule="${esc(r.id)}"><div class="wholesale-bonus-rule-head"><div class="wholesale-bonus-head-copy"><b>Aturan Bonus ${i+1}</b><small>Berlaku kelipatan</small></div><button type="button" class="rule-remove-btn wholesale-bonus-remove" onclick="removeWholesaleBonusRule('${esc(r.id)}')" aria-label="Hapus aturan bonus ${i+1}" title="Hapus aturan bonus"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div><div class="wholesale-bonus-rule-grid"><div class="field bonus-buy-product"><label>Produk Dibeli</label><select data-bonus-buy-product onchange="updateWholesaleBonusRule('${esc(r.id)}','buyProductId',this.value)">${wholesaleBonusProductOptions(r.buyProductId)}</select></div><div class="field bonus-buy-qty"><label>Qty Beli</label><input data-bonus-buy-qty type="number" min="1" step="1" value="${r.buyQty}" onchange="updateWholesaleBonusRule('${esc(r.id)}','buyQty',this.value)"></div><div class="field bonus-product"><label>Produk Bonus</label><select data-bonus-product onchange="updateWholesaleBonusRule('${esc(r.id)}','bonusProductId',this.value)">${wholesaleBonusProductOptions(r.bonusProductId)}</select></div><div class="field bonus-qty"><label>Qty Bonus</label><input data-bonus-qty type="number" min="1" step="1" value="${r.bonusQty}" onchange="updateWholesaleBonusRule('${esc(r.id)}','bonusQty',this.value)"></div></div><div class="wholesale-bonus-preview"><span>Kasir</span><b>${esc(wholesaleBonusRuleSummary(r))}</b></div></div>`).join(''):'<div class="empty-state">Belum ada aturan Bonus Produk. Tekan <b>+ Tambah Aturan</b>.</div>';
el.innerHTML=`<div class="feature-setting-card"><h3>Aturan Grosir</h3><div class="feature-form-grid" style="margin-top:10px"><div class="field"><label>Qty Default Grosir</label><input id="wholesaleMinQty" type="number" min="2" step="1" value="${c.wholesaleMinQty}"></div><div class="wholesale-duration-inline"><div class="field"><label>Durasi</label><input id="wholesaleDurationValue" type="number" min="1" step="1" value="${c.wholesaleDurationValue}" oninput="updateWholesaleDurationPreview()"></div><div class="field"><label>Satuan Durasi</label><select id="wholesaleDurationUnit" onchange="updateWholesaleDurationPreview()"><option value="day" ${c.wholesaleDurationUnit==='day'?'selected':''}>Hari</option><option value="month" ${c.wholesaleDurationUnit==='month'?'selected':''}>Bulan</option></select></div></div></div><div class="feature-summary" style="margin-top:10px"><span>Status Grosir</span><b id="wholesaleDurationPreview" class="${expired?'text-danger':''}">${esc(status)}</b></div></div><div class="feature-setting-card"><h3>Grosir Per Produk</h3><div class="rule-list-toolbar"><div class="rule-list-copy"><b>${wholesaleProducts.length} produk grosir</b></div><button type="button" class="btn btn-primary" onclick="openAddWholesaleProduct()" ${available.length?'':'disabled'}>+ Tambah Produk</button></div><div class="feature-form-grid wholesale-filter-bar"><div class="field"><label>Filter Kategori</label><select id="wholesaleCategoryFilter" onchange="filterWholesaleProducts()">${wholesaleCategoryOptions(wholesaleCategoryFilterValue)}</select></div><div class="field"><label>Produk Ditampilkan</label><input id="wholesaleFilterCount" value="0 produk" disabled></div></div><div class="feature-product-list" id="wholesaleProductList">${wholesaleProducts.length?wholesaleProducts.map(p=>`<div class="feature-product-row wholesale-product-row" data-category="${esc(p.category||'Umum')}"><div class="feature-product-info"><b>${esc(p.name)}</b><small>${esc(p.category||'Umum')} • Ecer ${p.manualPrice?'Manual':rupiah(p.price)} • ${esc(p.unit||'pcs')}</small></div><div class="feature-mini-field"><span>Min Qty</span><input type="number" min="2" step="1" data-wholesale-min="${p.id}" value="${Math.max(2,Number(p.wholesaleMinQty)||c.wholesaleMinQty)}" aria-label="Minimum qty grosir ${esc(p.name)}"></div><div class="feature-mini-field"><span>Harga Grosir</span><input class="nominal-input" inputmode="numeric" data-wholesale-product="${p.id}" value="${nominal(p.wholesale||0)}" aria-label="Harga grosir ${esc(p.name)}"></div><button type="button" class="rule-remove-btn" onclick="removeWholesaleProduct(${p.id})" aria-label="Hapus ${esc(p.name)} dari Grosir Per Produk" title="Hapus dari daftar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div>`).join(''):'<div class="empty-state">Belum ada produk Grosir Per Produk. Tekan <b>+ Tambah Produk</b>.</div>'}</div></div><div class="feature-setting-card wholesale-bonus-card"><h3>Bonus Produk</h3><div class="rule-list-toolbar"><div class="rule-list-copy"><b>${bonusRules.length} aturan bonus</b></div><button type="button" class="btn btn-primary" onclick="addWholesaleBonusRule()" ${bonusEligibleProducts().length>=2?'':'disabled'}>+ Tambah Aturan</button></div><div class="wholesale-bonus-list">${bonusHtml}</div><div class="feature-actions"><button class="btn btn-primary" onclick="saveWholesaleSettings()">Simpan Pengaturan Grosir</button></div></div>`;
filterWholesaleProducts()
if(preservedWholesaleScrollV456>0){el.scrollTop=Math.min(preservedWholesaleScrollV456,Math.max(0,el.scrollHeight-el.clientHeight))}
}
function updateWholesaleDurationPreview(){const val=Math.max(1,Math.round(Number(document.getElementById('wholesaleDurationValue')?.value)||1)),unit=document.getElementById('wholesaleDurationUnit')?.value==='month'?'month':'day',preview=document.getElementById('wholesaleDurationPreview'),expires=bundleExpiryISO(val,unit,new Date());if(preview){preview.textContent=`${val} ${unit==='month'?'Bulan':'Hari'} • s/d ${fmtDate(expires)}`;preview.classList.remove('text-danger')}}
function saveWholesaleSettings(){const c=salesFeatureConfig();c.wholesaleEnabled=optionalFeatureEnabled('wholesale');c.wholesaleMinQty=Math.max(2,Math.round(Number(document.getElementById('wholesaleMinQty')?.value)||2));c.wholesaleDurationValue=Math.max(1,Math.round(Number(document.getElementById('wholesaleDurationValue')?.value)||1));c.wholesaleDurationUnit=document.getElementById('wholesaleDurationUnit')?.value==='month'?'month':'day';c.wholesaleStartsAt=new Date().toISOString();c.wholesaleExpiresAt=bundleExpiryISO(c.wholesaleDurationValue,c.wholesaleDurationUnit,c.wholesaleStartsAt);captureWholesaleDraft();const targets=db.products.filter(p=>p.wholesaleConfigured===true),bonusCount=wholesaleBonusRules().length;syncCartWholesalePrices();save();renderCart();renderWholesaleSettings();toast(`Pengaturan Grosir disimpan • ${targets.length} produk harga grosir • ${bonusCount} aturan bonus.`)}
function syncCartWholesalePrices(){const c=salesFeatureConfig(),qtyByProduct=new Map(),wholesaleActive=optionalFeatureEnabled('wholesale')&&c.wholesaleEnabled&&!wholesaleIsExpired(c);syncCartWholesaleBonuses(c);cart.forEach(x=>{const p=getProduct(x.productId);if(!p||x.wholesaleBonus||p.manualPrice||x.priceLocked||x.bundleId)return;qtyByProduct.set(Number(x.productId),(qtyByProduct.get(Number(x.productId))||0)+(Number(x.qty)||0))});cart.forEach(x=>{const p=getProduct(x.productId);if(!p){clearCartItemProductDiscount(x);return}if(x.wholesaleBonus){x.price=0;x.itemFee=0;x.priceLocked=true;clearCartItemProductDiscount(x);return}if(p.manualPrice||x.priceLocked||x.bundleId){clearCartItemProductDiscount(x);return}const totalQty=qtyByProduct.get(Number(x.productId))||0,min=Math.max(2,Number(p.wholesaleMinQty)||Number(c.wholesaleMinQty)||2),base=(wholesaleActive&&p.wholesaleConfigured===true&&productAvailableForWholesale(p)&&Number(p.wholesale)>0&&totalQty>=min)?Number(p.wholesale):Number(p.price)||0;const variantFee=variantExtraCost(p,x.variant);x.price=productSalePrice(p,base)+variantFee;x.variantFee=variantFee;setCartItemProductDiscount(x,p,base)})}
function renderMassPriceSettings(){
const el=document.getElementById('massPriceSettingsBody');if(!el)return;
const categoriesNow=new Set(['Semua',...categoryNames()]);if(!categoriesNow.has(massPriceState.category))massPriceState.category='Semua';
if(!['price','cost','wholesale'].includes(massPriceState.target))massPriceState.target='price';
if(!['percent_up','percent_down','nominal_up','nominal_down','fixed'].includes(massPriceState.method))massPriceState.method='percent_up';
el.innerHTML=`<div class="feature-setting-card"><h3>Ubah Harga Masal</h3><p>Pilih kategori, jenis harga, lalu metode perubahan. Perubahan hanya diterapkan setelah konfirmasi.</p><div class="feature-form-grid"><div class="field"><label>Kategori</label><select id="massPriceCategory" onchange="massPriceState.category=this.value;updateMassPricePreview()"><option value="Semua" ${massPriceState.category==='Semua'?'selected':''}>Semua Kategori</option>${categoryNames().map(c=>`<option value="${esc(c)}" ${massPriceState.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="field"><label>Jenis Harga</label><select id="massPriceTarget" onchange="massPriceState.target=this.value;updateMassPricePreview()"><option value="price" ${massPriceState.target==='price'?'selected':''}>Harga Ecer</option><option value="cost" ${massPriceState.target==='cost'?'selected':''}>Harga Modal</option><option value="wholesale" ${massPriceState.target==='wholesale'?'selected':''}>Harga Grosir</option></select></div><div class="field"><label>Metode</label><select id="massPriceMethod" onchange="massPriceState.method=this.value;updateMassPriceValueMode(true)"><option value="percent_up" ${massPriceState.method==='percent_up'?'selected':''}>Naik Persentase</option><option value="percent_down" ${massPriceState.method==='percent_down'?'selected':''}>Turun Persentase</option><option value="nominal_up" ${massPriceState.method==='nominal_up'?'selected':''}>Tambah Nominal</option><option value="nominal_down" ${massPriceState.method==='nominal_down'?'selected':''}>Kurangi Nominal</option><option value="fixed" ${massPriceState.method==='fixed'?'selected':''}>Set Harga Tetap</option></select></div><div class="field"><label id="massPriceValueLabel">Persentase (%)</label><input id="massPriceValue" type="number" inputmode="decimal" min="0" step="0.1" value="${massPriceState.value||0}" oninput="updateMassPricePreview()"></div></div><div class="feature-summary" style="margin-top:10px"><span>Produk yang akan diperbarui</span><b id="massPriceCount">0 produk</b></div><div class="feature-summary" style="margin-top:8px"><span>Contoh perubahan</span><b id="massPriceExample">Masukkan nilai</b></div><div id="massPriceProductList" class="mass-price-product-list"></div><div class="feature-actions"><button class="btn btn-primary" onclick="applyMassPriceSettings()">Terapkan Harga Masal</button></div></div>`;
updateMassPriceValueMode(false)
}
function updateMassPriceValueMode(resetOnUnitChange=false){
const method=document.getElementById('massPriceMethod')?.value||massPriceState.method||'percent_up',inp=document.getElementById('massPriceValue'),lab=document.getElementById('massPriceValueLabel');if(!inp)return;
massPriceState.method=method;const percent=method.startsWith('percent_'),nextMode=percent?'percent':'nominal',previousMode=inp.dataset.valueMode||massPriceState.valueMode||nextMode;
if(resetOnUnitChange&&previousMode!==nextMode){massPriceState.value=0;inp.value='0'}
if(lab)lab.textContent=percent?'Persentase (%)':method==='fixed'?'Harga Tetap':'Nominal (Rp)';
if(percent){inp.classList.remove('nominal-input');inp.type='number';inp.inputMode='decimal';inp.min='0';inp.step='0.1';inp.removeAttribute('max');inp.value=String(Math.max(0,Number(massPriceState.value)||0))}
else{inp.type='text';inp.inputMode='numeric';inp.classList.add('nominal-input');inp.removeAttribute('min');inp.removeAttribute('max');inp.removeAttribute('step');setNominalInput(inp,Math.max(0,Number(massPriceState.value)||0))}
inp.dataset.valueMode=nextMode;massPriceState.valueMode=nextMode;updateMassPricePreview()
}
function massPriceInputValue(){const method=document.getElementById('massPriceMethod')?.value||massPriceState.method||'percent_up',inp=document.getElementById('massPriceValue');return Math.max(0,method.startsWith('percent_')?(Number(inp?.value)||0):parseNominal(inp?.value))}
function massPriceApplicableProducts(rows=massPriceProducts(),target=document.getElementById('massPriceTarget')?.value||massPriceState.target||'price'){return rows.filter(p=>!(target==='price'&&p.manualPrice))}
function massPriceProducts(){const cat=document.getElementById('massPriceCategory')?.value||'Semua';return db.products.filter(p=>cat==='Semua'||p.category===cat)}
function renderMassPriceProductList(rows){const el=document.getElementById('massPriceProductList');if(!el)return;el.innerHTML=rows.length?`<div class="mass-price-product-row head"><span>Nama Produk</span><span style="text-align:center">Stok</span><span style="text-align:right">Harga Beli</span><span style="text-align:right">Harga Ecer (Sekarang)</span></div>${rows.map(p=>`<div class="mass-price-product-row"><span class="mass-price-product-name" title="${esc(p.name)}">${esc(p.name)}</span><span class="mass-price-product-stock">${p.noStock?'∞':nominal(p.stock||0)}</span><span class="mass-price-product-price">${rupiah(p.cost||0)}</span>${p.manualPrice?'<span class="mass-price-manual">Harga Manual</span>':`<input class="nominal-input mass-price-edit-input" inputmode="numeric" data-mass-product-price="${p.id}" value="${nominal(p.price||0)}" onchange="saveMassPriceProductPrice(${p.id},this)" aria-label="Harga ecer ${esc(p.name)}">`}</div>`).join('')}`:'<div class="empty-state">Tidak ada produk pada kategori ini.</div>'}
function saveMassPriceProductPrice(id,input){const p=getProduct(Number(id));if(!p||p.manualPrice)return;p.price=Math.max(0,parseNominal(input?.value));setNominalInput(input,p.price);save();syncCartWholesalePrices();renderCart();renderProducts();renderStock();renderMobileProductPicker();toast(`Harga ecer ${p.name} diperbarui.`)}
function updateMassPricePreview(){
massPriceState.category=document.getElementById('massPriceCategory')?.value||massPriceState.category||'Semua';
massPriceState.target=document.getElementById('massPriceTarget')?.value||massPriceState.target||'price';
massPriceState.method=document.getElementById('massPriceMethod')?.value||massPriceState.method||'percent_up';
const rows=massPriceProducts(),applicable=massPriceApplicableProducts(rows,massPriceState.target),count=document.getElementById('massPriceCount'),ex=document.getElementById('massPriceExample'),method=massPriceState.method,value=massPriceInputValue();
massPriceState.value=value;if(count)count.textContent=`${applicable.length} produk${rows.length!==applicable.length?` • ${rows.length-applicable.length} manual dilewati`:''}`;renderMassPriceProductList(rows);if(!ex)return;
if(!applicable.length){ex.textContent=rows.length?'Tidak ada harga yang dapat diubah':'Tidak ada produk';return}
const old=Math.max(0,Number(applicable[0][massPriceState.target])||0);let next=old;
if(value>0||method==='fixed'){if(method==='percent_up')next=old*(1+value/100);if(method==='percent_down')next=old*(1-value/100);if(method==='nominal_up')next=old+value;if(method==='nominal_down')next=old-value;if(method==='fixed')next=value}
ex.textContent=(value>0||method==='fixed')?`${rupiah(old)} → ${rupiah(Math.max(0,Math.round(next)))}`:'Masukkan nilai'
}
function applyMassPriceSettings(){
const allRows=massPriceProducts(),target=document.getElementById('massPriceTarget')?.value||massPriceState.target||'price',rows=massPriceApplicableProducts(allRows,target);if(!allRows.length)return toast('Tidak ada produk pada kategori ini.','error');if(!rows.length)return toast('Tidak ada produk yang dapat diperbarui untuk jenis harga ini.','error');
const method=document.getElementById('massPriceMethod')?.value||massPriceState.method||'percent_up',value=massPriceInputValue();if(method!=='fixed'&&value<=0)return toast('Masukkan nilai perubahan harga.','error');if(method==='percent_down'&&value>100)return toast('Persentase penurunan maksimal 100%.','error');
const label={price:'Harga Ecer',cost:'Harga Modal',wholesale:'Harga Grosir'}[target],methodLabel={percent_up:'Naik Persentase',percent_down:'Turun Persentase',nominal_up:'Tambah Nominal',nominal_down:'Kurangi Nominal',fixed:'Set Harga Tetap'}[method]||method,skipped=allRows.length-rows.length;
showModal('Konfirmasi Harga Masal',`${rows.length} produk akan diperbarui.`,`<div class="feature-summary"><span>${label}</span><b>${esc(methodLabel)}</b></div><div class="feature-summary" style="margin-top:8px"><span>Nilai</span><b>${method.startsWith('percent_')?`${value}%`:rupiah(value)}</b></div>${skipped?`<p style="font-size:11px;color:var(--muted);line-height:1.45;margin-top:8px">${skipped} produk Harga Manual tidak diubah pada Harga Ecer.</p>`:''}<p style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:10px">Perubahan akan langsung disimpan ke data produk.</p>`,[{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{rows.forEach(p=>{const old=Math.max(0,Number(p[target])||0);let next=old;if(method==='percent_up')next=old*(1+value/100);if(method==='percent_down')next=old*(1-value/100);if(method==='nominal_up')next=old+value;if(method==='nominal_down')next=old-value;if(method==='fixed')next=value;p[target]=Math.max(0,Math.round(next))});save();syncCartWholesalePrices();renderCart();renderProducts();renderStock();renderMobileProductPicker();renderMassPriceSettings();closeModal();toast(`${label} ${rows.length} produk diperbarui.`)}}])
}
function bundleResolvedItems(b){const grouped=new Map();(b?.items||[]).forEach(x=>{const id=Number(x?.productId),qty=Math.max(.5,Number(x?.qty)||1);if(!Number.isFinite(id)||!getProduct(id))return;grouped.set(id,(grouped.get(id)||0)+qty)});return[...grouped].map(([productId,qty])=>({productId,qty}))}
function bundleReferencePrice(p){return Math.max(0,Number(p?.price)||0)}
function bundleHasMissingProducts(b){return(b?.items||[]).some(x=>!getProduct(Number(x?.productId)))}
function bundleDraftInit(current=null){
const key=current?`edit:${current.id}`:'new';
if(!bundleDraftState||bundleDraftKey!==key){
bundleDraftKey=key;
bundleDraftState={
name:String(current?.name||''),
durationValue:Math.max(1,Number(current?.durationValue)||30),
durationUnit:current?.durationUnit==='month'?'month':'day',
price:Math.max(0,Number(current?.price)||0),
items:bundleResolvedItems(current).map(x=>({productId:Number(x.productId),qty:Math.max(.5,Number(x.qty)||1)}))
};
}
bundleDraftState.items=(bundleDraftState.items||[]).filter(x=>getProduct(Number(x.productId))).map(x=>({productId:Number(x.productId),qty:Math.max(.5,Number(x.qty)||1)}));
return bundleDraftState
}
function captureBundleDraftForm(){
if(!bundleDraftState)bundleDraftInit(editingBundleId==null?null:db.bundles.find(b=>Number(b.id)===Number(editingBundleId))||null);
const name=document.getElementById('bundleName'),dur=document.getElementById('bundleDurationValue'),unit=document.getElementById('bundleDurationUnit'),price=document.getElementById('bundlePrice');
if(name)bundleDraftState.name=name.value;
if(dur)bundleDraftState.durationValue=Math.max(1,Number(dur.value)||1);
if(unit)bundleDraftState.durationUnit=unit.value==='month'?'month':'day';
if(price)bundleDraftState.price=Math.max(0,parseNominal(price.value));
document.querySelectorAll('[data-bundle-draft-qty]').forEach(inp=>{const id=Number(inp.dataset.bundleDraftQty),item=bundleDraftState.items.find(x=>Number(x.productId)===id);if(item)item.qty=Math.max(.5,Number(inp.value)||1)});
return bundleDraftState
}
function bundleDraftSelectedIds(){return new Set((bundleDraftState?.items||[]).map(x=>Number(x.productId)))}
function bundleProductSearchFilter(){
const q=String(document.getElementById('bundleProductPickerSearch')?.value||'').trim().toLocaleLowerCase('id-ID');let visible=0;
document.querySelectorAll('#bundleProductPickerList .bundle-picker-option').forEach(row=>{const show=!q||String(row.dataset.search||'').includes(q);row.hidden=!show;if(show)visible++});
const empty=document.getElementById('bundleProductPickerEmpty');if(empty)empty.hidden=visible>0
}
function openBundleProductPicker(){
captureBundleDraftForm();const selected=bundleDraftSelectedIds(),available=db.products.filter(p=>!selected.has(Number(p.id))&&productAvailableForBundle(p));
if(!available.length)return toast(db.products.length?'Tidak ada produk yang tersedia. Produk Grosir Per Produk dan Bonus Produk tidak ditampilkan di Bundling.':'Belum ada produk. Tambahkan produk terlebih dahulu.','error');
const rows=available.map(p=>{const stock=p.noStock?'∞':nominal(p.stock||0),meta=`${p.category||'Umum'} • ${p.manualPrice?'Harga Manual':rupiah(p.price||0)} • Stok ${stock}`;return`<label class="bundle-picker-option" data-search="${esc((p.name+' '+(p.barcode||'')+' '+(p.category||'')).toLocaleLowerCase('id-ID'))}"><input type="checkbox" value="${p.id}" data-bundle-picker-choice><span><b>${esc(p.name)}</b><small>${esc(meta)}</small></span></label>`}).join('');
showModal('Tambah Produk Bundling','Pilih produk yang belum digunakan di Grosir Per Produk atau Bonus Produk.',`<div class="bundle-picker"><input id="bundleProductPickerSearch" class="input bundle-picker-search" type="search" autocomplete="off" placeholder="Cari nama / barcode / kategori..." oninput="bundleProductSearchFilter()"><div class="bundle-picker-list" id="bundleProductPickerList">${rows}</div><div class="empty-state" id="bundleProductPickerEmpty" hidden>Produk tidak ditemukan.</div></div>`,[{label:'Batal',close:true},{label:'Tambahkan',primary:true,fn:()=>addSelectedBundleProducts()}],true);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('bundle-picker-overlay');modal?.classList.add('bundle-picker-modal')
}
function addSelectedBundleProducts(){
const ids=[...document.querySelectorAll('[data-bundle-picker-choice]:checked')].map(x=>Number(x.value)).filter(id=>getProduct(id));if(!ids.length)return toast('Pilih minimal satu produk.','error');
const selected=bundleDraftSelectedIds();ids.forEach(id=>{if(!selected.has(id))bundleDraftState.items.push({productId:id,qty:1})});closeModal();renderBundleSettings();setTimeout(()=>document.getElementById('bundleSelectedList')?.scrollIntoView({block:'nearest'}),20)
}
function removeBundleDraftProduct(id){captureBundleDraftForm();bundleDraftState.items=bundleDraftState.items.filter(x=>Number(x.productId)!==Number(id));renderBundleSettings()}
function updateBundleDraftQty(id,value){if(!bundleDraftState)return;const item=bundleDraftState.items.find(x=>Number(x.productId)===Number(id));if(item)item.qty=Math.max(.5,Number(value)||1);updateBundlePriceSummary()}
function cancelBundleEdit(){editingBundleId=null;bundleDraftState=null;bundleDraftKey='';renderBundleSettings()}
function renderBundleMobileAction(current=null){
const bar=document.getElementById('bundleMobileSubmitBar');if(!bar)return;const hasItems=(bundleDraftState?.items||[]).length>0;
bar.innerHTML=current?`<button type="button" class="btn bundle-mobile-cancel" onclick="cancelBundleEdit()">Batal</button><button type="button" class="btn btn-primary bundle-mobile-save" onclick="saveBundleSettings()">Simpan Perubahan</button>`:`<button type="button" class="btn btn-primary bundle-mobile-save" onclick="saveBundleSettings()">Simpan Bundling</button>`
}
function renderBundleSettings(){
const el=document.getElementById('bundleSettingsBody');if(!el)return;
const current=editingBundleId==null?null:(db.bundles.find(b=>Number(b.id)===Number(editingBundleId))||null);if(editingBundleId!=null&&!current){editingBundleId=null;bundleDraftState=null;bundleDraftKey=''}
const activeCurrent=editingBundleId==null?null:(db.bundles.find(b=>Number(b.id)===Number(editingBundleId))||null),draft=bundleDraftInit(activeCurrent),items=draft.items;
const selectedRows=items.length?items.map((x,i)=>{const p=getProduct(Number(x.productId));if(!p)return'';return`<div class="bundle-selected-row"><div class="bundle-selected-index">${i+1}</div><div class="bundle-selected-info"><b>${esc(p.name)}</b><small>${esc(p.category||'Umum')} • ${p.manualPrice?'Harga Manual':rupiah(p.price||0)}${productAvailableForBundle(p)?'':' • Konflik Promo'}</small></div><div class="bundle-selected-qty"><span>Qty</span><input type="number" min="0.5" step="0.5" value="${Math.max(.5,Number(x.qty)||1)}" data-bundle-draft-qty="${p.id}" oninput="updateBundleDraftQty(${p.id},this.value)" aria-label="Qty ${esc(p.name)}"></div><button type="button" class="bundle-selected-remove" onclick="removeBundleDraftProduct(${p.id})" aria-label="Hapus ${esc(p.name)} dari bundling" title="Hapus"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div>`}).join(''):'<div class="bundle-selected-empty"><b>Belum ada produk</b><span>Tekan <strong>+ Tambah Produk</strong> untuk memilih produk yang akan digabungkan.</span></div>';
const listHtml=db.bundles.length?db.bundles.map(b=>{const resolved=bundleResolvedItems(b),normalTotal=sum(resolved,x=>{const p=getProduct(x.productId);return bundleReferencePrice(p)*(Number(x.qty)||0)}),expired=bundleIsExpired(b),missing=bundleHasMissingProducts(b),promoConflict=bundlePromoConflicts(b).length>0,status=missing?'Produk tidak lengkap':promoConflict?'Konflik Promo':expired?'Masa berlaku habis':(b.active!==false?'Aktif di Kasir':'Nonaktif'),statusClass=missing?'missing':promoConflict?'missing':expired?'expired':(b.active!==false?'active':'inactive'),productText=resolved.length?resolved.map(x=>{const p=getProduct(x.productId);return`${x.qty}× ${esc(p?.name||'Produk')}`}).join(' • '):'Produk bundling sudah tidak tersedia';return`<div class="bundle-card"><div class="bundle-card-head"><div class="bundle-card-title"><span class="bundle-card-icon">🎁</span><span class="bundle-card-title-copy"><b>${esc(b.name)}</b><small>${resolved.length} jenis produk</small></span></div><span class="bundle-status ${statusClass}">${status}</span></div><div class="bundle-card-products">${productText}</div><div class="bundle-card-meta"><span>◷ ${bundleDurationLabel(b)}</span><span>Berakhir ${fmtDate(b.expiresAt)}</span></div><div class="bundle-card-pricing"><div class="bundle-price-box"><small>Total Harga</small><span>${rupiah(normalTotal)}</span></div><div class="bundle-price-box special"><small>Harga Bundling</small><b>${rupiah(b.price)}</b></div></div><div class="bundle-card-actions"><button type="button" class="bundle-power-btn-v526 ${b.active===false?'off':'on'}" onclick="toggleBundleActive(${b.id})" aria-label="${b.active===false?'Aktifkan':'Nonaktifkan'} bundling ${esc(b.name)}" aria-pressed="${b.active!==false}" title="${b.active===false?'Aktifkan':'Nonaktifkan'} Bundling" ${(b.active===false&&(missing||promoConflict||!resolved.length||expired))?'disabled':''}><svg class="promo-power-svg-v526" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7.2 5.8a8 8 0 1 0 9.6 0"/></svg><span>${b.active===false?'Nonaktif':'Aktif'}</span></button><button onclick="editBundleSettings(${b.id})">Edit</button><button class="bundle-action-danger" onclick="deleteBundleSettings(${b.id})" aria-label="Hapus bundling ${esc(b.name)}" title="Hapus"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button></div></div>`}).join(''):'<div class="empty-state">Belum ada bundling. Buat paket baru dari produk yang sudah tersimpan.</div>';
el.innerHTML=`<div class="feature-setting-card bundle-create-card">${activeCurrent?`<div class="bundle-editor-head"><div><h3>Edit Bundling</h3><p>Ubah produk, qty, harga, atau masa berlaku paket.</p></div><span class="bundle-step-badge">${items.length} produk</span></div>`:''}<div class="bundle-editor"><div class="feature-form-grid"><div class="field full"><label>Nama Bundling</label><input id="bundleName" value="${esc(draft.name)}" placeholder="Contoh: Paket Hemat A" oninput="bundleDraftState.name=this.value"></div></div><div class="bundle-product-select-head"><div><b>Produk dalam Bundling</b><small>Pilih produk lalu tentukan qty masing-masing.</small></div><button type="button" class="btn btn-primary bundle-add-product" onclick="openBundleProductPicker()" ${db.products.length?'':'disabled'}>+ Tambah Produk</button></div><div class="bundle-selected-list" id="bundleSelectedList">${selectedRows}</div><div class="bundle-duration-grid"><div class="field"><label>Durasi</label><input id="bundleDurationValue" type="number" min="1" step="1" value="${draft.durationValue}" oninput="bundleDraftState.durationValue=Math.max(1,Number(this.value)||1)"></div><div class="field"><label>Satuan Durasi</label><select id="bundleDurationUnit" onchange="bundleDraftState.durationUnit=this.value==='month'?'month':'day'"><option value="day" ${draft.durationUnit!=='month'?'selected':''}>Hari</option><option value="month" ${draft.durationUnit==='month'?'selected':''}>Bulan</option></select></div></div><div class="bundle-price-summary"><div class="feature-summary"><span>Total Harga Produk</span><b id="bundleProductsTotal">Rp0</b></div><div class="field bundle-price-field"><label>Harga Bundling</label><input id="bundlePrice" class="nominal-input" inputmode="numeric" value="${nominal(draft.price)}" placeholder="0" oninput="bundleDraftState.price=Math.max(0,parseNominal(this.value));updateBundlePriceSummary()"></div></div><div class="feature-actions bundle-desktop-actions">${activeCurrent?'<button class="btn" onclick="cancelBundleEdit()">Batal Edit</button>':''}<button class="btn btn-primary" onclick="saveBundleSettings()" ${items.length?'':'disabled'}>${activeCurrent?'Simpan Perubahan':'Tambah Bundling'}</button></div></div></div><div class="feature-setting-card"><h3>Daftar Bundling</h3><p>${db.bundles.length?`${db.bundles.length} bundling tersimpan. Bundling aktif dan belum kedaluwarsa tampil di Kasir.`:'Belum ada bundling tersimpan.'}</p><div class="bundle-list">${listHtml}</div></div>`;
updateBundlePriceSummary();renderBundleMobileAction(activeCurrent)
}
function updateBundlePriceSummary(){
if(!bundleDraftState)return;let total=0;bundleDraftState.items.forEach(x=>{const p=getProduct(Number(x.productId));if(p)total+=bundleReferencePrice(p)*Math.max(.5,Number(x.qty)||1)});const totalEl=document.getElementById('bundleProductsTotal');if(totalEl)totalEl.textContent=rupiah(total);const count=document.querySelector('.bundle-step-badge');if(count)count.textContent=`${bundleDraftState.items.length} produk`;const mobileSave=document.querySelector('#bundleMobileSubmitBar .bundle-mobile-save');if(mobileSave)mobileSave.disabled=!bundleDraftState.items.length
}
function saveBundleSettings(){
const draft=captureBundleDraftForm(),name=String(draft.name||'').trim(),price=Math.max(0,Number(draft.price)||0),durationValue=Math.max(1,Math.round(Number(draft.durationValue)||1)),durationUnit=draft.durationUnit==='month'?'month':'day',items=(draft.items||[]).map(x=>({productId:Number(x.productId),qty:Math.max(.5,Number(x.qty)||1)})).filter(x=>getProduct(x.productId));
if(!name)return toast('Nama bundling wajib diisi.','error');if(!items.length)return toast('Tambahkan minimal satu produk ke bundling.','error');if(price<=0)return toast('Harga bundling wajib diisi.','error');
const conflicts=items.map(x=>getProduct(x.productId)).filter(p=>p&&!productAvailableForBundle(p));if(conflicts.length)return toast(`Produk berikut sudah dipakai di Grosir/Bonus: ${conflicts.map(p=>p.name).join(', ')}.`,'error');
const startsAt=new Date().toISOString(),expiresAt=bundleExpiryISO(durationValue,durationUnit,startsAt),current=editingBundleId==null?null:db.bundles.find(b=>Number(b.id)===Number(editingBundleId));
if(current){const expiredBefore=bundleIsExpired(current);Object.assign(current,{name,price,items,durationValue,durationUnit,startsAt,expiresAt});if(expiredBefore)current.active=true}
else db.bundles.push({id:Math.max(0,...db.bundles.map(b=>Number(b.id)||0))+1,name,price,active:true,durationValue,durationUnit,startsAt,expiresAt,items});
editingBundleId=null;bundleDraftState=null;bundleDraftKey='';save();renderBundleSettings();renderProducts();renderMobileProductPicker();renderWholesaleSettings();toast('Bundling disimpan.')
}
function editBundleSettings(id){editingBundleId=id;bundleDraftState=null;bundleDraftKey='';renderBundleSettings();document.getElementById('bundleSettingsBody')?.scrollTo({top:0,behavior:'smooth'})}
function deleteBundleSettings(id){const b=db.bundles.find(x=>Number(x.id)===Number(id));if(!b)return;showModal('Hapus Bundling',b.name,'<p style="font-size:12px;color:var(--muted);line-height:1.5">Bundling akan dihapus dari daftar. Produk asli tidak ikut dihapus.</p>',[{label:'Batal',close:true},{label:'Hapus',primary:true,fn:()=>{db.bundles=db.bundles.filter(x=>Number(x.id)!==Number(id));if(Number(editingBundleId)===Number(id)){editingBundleId=null;bundleDraftState=null;bundleDraftKey=''}save();closeModal();renderBundleSettings();renderProducts();renderMobileProductPicker();toast('Bundling dihapus.')}}])}
function toggleBundleActive(id){const b=db.bundles.find(x=>Number(x.id)===Number(id));if(!b)return;if(b.active===false){if(bundleIsExpired(b))return toast('Bundling sudah kedaluwarsa. Perbarui durasinya.','error');if(bundleHasMissingProducts(b)||bundlePromoConflicts(b).length||!bundleResolvedItems(b).length)return toast('Perbaiki produk atau konflik promo sebelum mengaktifkan Bundling.','error')}b.active=b.active===false;save();renderBundleSettings();renderProducts();renderMobileProductPicker();toast(`Bundling ${b.active!==false?'diaktifkan':'dinonaktifkan'}.`)}
function activeBundles(){if(!optionalFeatureEnabled('bundling'))return [];return(db.bundles||[]).filter(b=>b&&b.active!==false&&!bundleIsExpired(b)&&!bundleHasMissingProducts(b)&&!bundlePromoConflicts(b).length&&bundleResolvedItems(b).length&&Number(b.price)>0)}
function addBundleToCart(id){
if(!optionalFeatureEnabled('bundling'))return toast('Fitur Bundling nonaktif. Aktifkan dari Lainnya → Fitur Tambahan.','error');
const b=db.bundles.find(x=>Number(x.id)===Number(id));if(!b||b.active===false)return toast('Bundling tidak aktif.','error');if(bundleIsExpired(b))return toast('Masa berlaku bundling sudah habis.','error');if(bundleHasMissingProducts(b))return toast('Produk pada bundling tidak lengkap. Edit bundling terlebih dahulu.','error');const promoConflicts=bundlePromoConflicts(b);if(promoConflicts.length)return toast(`Bundling memiliki produk yang sudah dipakai di promo lain: ${[...new Set(promoConflicts.map(x=>x.name))].join(', ')}.`,'error');
const items=bundleResolvedItems(b).map(x=>({product:getProduct(Number(x.productId)),qty:Math.max(.5,Number(x.qty)||1)}));if(!items.length||items.some(x=>!x.product))return toast('Produk pada bundling tidak lengkap.','error');
for(const x of items){if(!x.product.noStock&&availableProductStock(x.product.id)+1e-9<x.qty)return toast(`Stok ${x.product.name} tidak mencukupi untuk bundling.`,'error')}
const bases=items.map(x=>Math.max(1,(Number(x.product.price)||Number(x.product.cost)||1)*x.qty)),baseTotal=sum(bases,x=>x),bundleTotal=Math.max(0,Number(b.price)||0);let allocated=0;
items.forEach((x,i)=>{const lineTotal=i===items.length-1?Math.max(0,bundleTotal-allocated):Math.max(0,Math.round(bundleTotal*bases[i]/baseTotal));allocated+=lineTotal;const unitPrice=x.qty?lineTotal/x.qty:0,note=`Bundling: ${b.name}`;const found=cart.find(c=>Number(c.bundleId)===Number(b.id)&&Number(c.productId)===Number(x.product.id)&&!c.variant&&c.priceLocked);if(found){found.qty+=x.qty;found.price=unitPrice;found.note=note}else cart.push({productId:x.product.id,qty:x.qty,price:unitPrice,itemFee:0,note,variant:'',priceLocked:true,bundleId:b.id,bundleName:b.name})});
renderCart();playCashierTone('product');if(navigator.vibrate)navigator.vibrate(12);toast(`${b.name} ditambahkan ke transaksi.`)
}
function dashboardMenuCatalog(){
return[
{key:'stock',group:'PRODUK & INVENTORI',title:'Produk',sub:'Produk dan stok',badge:'STOK',icon:'▦',tone:'green',screen:'stock',action:"go('stock')",moreSelectors:['#screen-more .mobile-more-stock-item']},
{key:'purchases',group:'OPERASIONAL HARIAN',title:'Pembelian',sub:'Pembelian & supplier',badge:'BELI',icon:'⇩',tone:'blue',screen:'purchases',action:"go('purchases')",moreSelectors:['#mobileMoreDashboard-purchases']},
{key:'customers',group:'OPERASIONAL HARIAN',title:'Pelanggan',sub:'Data & piutang',badge:'CRM',icon:'♙',tone:'purple',screen:'customers',action:"go('customers')",moreSelectors:['#mobileMoreDashboard-customers']},
{key:'finance',group:'OPERASIONAL HARIAN',title:'Keuangan',sub:'Pemasukan, Pengeluaran',badge:'KAS',icon:'Rp',tone:'gold',screen:'finance',permission:'expenses',action:"go('finance')",moreSelectors:['#mobileMoreDashboard-finance']},
{key:'shift',group:'OPERASIONAL HARIAN',title:'Shift Kasir',sub:'Buka / tutup shift',badge:'SHIFT',icon:'◷',tone:'orange',screen:'shift',action:"go('shift')",feature:'shift',moreSelectors:['#mobileMoreDashboard-shift']},
{key:'stock-opname',group:'PRODUK & INVENTORI',title:'Stok Opname',sub:'Stok fisik',badge:'OPNAME',icon:'✓',tone:'green',screen:'stock-opname',action:'openStockOpname()',moreSelectors:[`#screen-more button[onclick="openStockOpname()"]`]},
{key:'consignment',group:'PRODUK & INVENTORI',title:'Konsinyasi',sub:'Barang titipan & komisi',badge:'TITIP',icon:'◇',tone:'purple',screen:'consignment',action:'openConsignmentPage()',feature:'consignment',moreSelectors:[`#screen-more button[onclick="openConsignmentPage()"]`]},
{key:'payments',group:'PENJUALAN, PROMO & PPN',title:'Pembayaran',sub:'Metode bayar',badge:'BAYAR',icon:'▣',tone:'blue',screen:'payments',action:"go('payments')",moreSelectors:[`#screen-more button[onclick="go('payments')"]`]},
{key:'points-settings',group:'PENJUALAN, PROMO & PPN',title:'Fitur Poin',sub:'Poin & hadiah',badge:'POIN',icon:'P',tone:'gold',screen:'points-settings',action:"go('points-settings')",feature:'points',moreSelectors:[`#screen-more button[onclick="go('points-settings')"]`]},
{key:'discount-settings',group:'PENJUALAN, PROMO & PPN',title:'Diskon',sub:'Diskon produk & transaksi',badge:'DISKON',icon:'%',tone:'red',screen:'discount-settings',feature:'discount',action:"go('discount-settings')",moreSelectors:['#screen-more [data-sales-feature-menu="discount-settings"]']},
{key:'coupon-promo',group:'PENJUALAN, PROMO & PPN',title:'Kupon Promo',sub:'Promo pelanggan',badge:'KUPON',icon:'🎟',tone:'red',screen:'coupon-promo',permission:'settings',feature:'coupon',action:"go('coupon-promo')",moreSelectors:['#couponPromoMenuV569',`#screen-more button[onclick="go('coupon-promo')"]`]},
{key:'wholesale-settings',group:'PENJUALAN, PROMO & PPN',title:'Grosir',sub:'Harga grosir',badge:'GROSIR',icon:'G',tone:'purple',screen:'wholesale-settings',action:"go('wholesale-settings')",feature:'wholesale',moreSelectors:['#screen-more [data-sales-feature-menu="wholesale-settings"]']},
{key:'mass-price-settings',group:'PENJUALAN, PROMO & PPN',title:'Harga Massal',sub:'Ubah banyak harga',badge:'HARGA',icon:'⇅',tone:'orange',screen:'mass-price-settings',action:"go('mass-price-settings')",moreSelectors:['#screen-more [data-sales-feature-menu="mass-price-settings"]','#optionalMenu-massPrice']},
{key:'bundle-settings',group:'PENJUALAN, PROMO & PPN',title:'Bundling',sub:'Paket produk',badge:'PAKET',icon:'◇',tone:'green',screen:'bundle-settings',action:"go('bundle-settings')",feature:'bundling',moreSelectors:['#screen-more [data-sales-feature-menu="bundle-settings"]']},
{key:'categories',group:'PRODUK & INVENTORI',title:'Kategori & Satuan',sub:'Kelompok produk',cardTop:'Produk & Satuan',cardBottom:'Kategori',badge:'KAT',icon:'▦',tone:'purple',screen:'categories',action:'openCategoryManager()',moreSelectors:['#screen-more .mobile-more-stock-setting-item']},
{key:'labels',group:'PRODUK & INVENTORI',title:'Label & Barcode',sub:'Cetak label',cardTop:'Label & Barcode',cardBottom:'Cetak Label',badge:'LABEL',icon:'▥',tone:'green',screen:'labels',action:'openLabels()',moreSelectors:[`#screen-more button[onclick="openLabels()"]`]},

{key:'multi-units',group:'FITUR TAMBAHAN',title:'Multi Satuan',sub:'Kemasan & konversi stok',badge:'SATUAN',icon:'▣',tone:'purple',action:'openMultiUnitManagerV684()',feature:'multiUnit',moreSelectors:['#inposMultiUnitMenuV684']},
{key:'production',group:'FITUR TAMBAHAN',title:'Produksi',sub:'Produksi & bahan',badge:'PROD',icon:'⚙',tone:'orange',screen:'production',action:"openOptionalFeature('production')",feature:'production',moreSelectors:['#optionalMenu-production']},
{key:'market-online',group:'FITUR TAMBAHAN',title:'Toko Online',sub:'Katalog online',badge:'ONLINE',icon:'◎',tone:'blue',screen:'market-online',action:"openOptionalFeature('marketOnline')",feature:'marketOnline',moreSelectors:['#optionalMenu-marketOnline']},
]
}
// v740: Menu Dashboard otomatis; tidak lagi memakai pilihan Home manual.
function dashboardMenuSelection(){
 const basic=new Set(['stock','stock-data','purchases','customers','finance']);
 return dashboardMenuCatalog().filter(item=>
   basic.has(item.key)||
   (item.feature&&dashboardMenuItemAvailable(item))||
   (item.key==='mass-price-settings'&&!!db.settings?.optionalFeatures?.massPrice)
 ).map(item=>item.key);
}
function dashboardMenuItemAvailable(item){if(!item)return false;if(item.feature==='shift'&&!shiftFeatureEnabled())return false;if(item.feature==='multiUnit'&&!multiUnitFeatureEnabledV685())return false;if(item.key==='mass-price-settings'&&!db.settings?.optionalFeatures?.massPrice)return false;if(['production','marketOnline','coupon','consignment','bundling','points','wholesale','discount'].includes(item.feature)&&!optionalFeatureEnabled(item.feature))return false;if(item.screen&&!employeeScreenAllowed(item.screen))return false;if(item.permission&&!employeeCan(item.permission))return false;return true}
function dashboardSelectedMenuItems(){const map=new Map(dashboardMenuCatalog().map(x=>[x.key,x]));return dashboardMenuSelection().map(k=>map.get(k)).filter(x=>x&&dashboardMenuItemAvailable(x))}
function syncDashboardMovedSections(){['mobileDashboardPoolSection','productInventoryMenuSection','salesFeatureMenuSection','optionalFeatureMenuSection','deviceDisplayMenuSection','accountSystemMoreSection'].forEach(id=>{const sec=document.getElementById(id);if(!sec)return;const items=[...sec.querySelectorAll('.more-list-item')],visible=items.some(el=>!el.hidden&&el.style.display!=='none');sec.hidden=!visible})}
function syncDashboardMenuVisibility(){const selected=new Set(dashboardMenuSelection());dashboardMenuCatalog().forEach(item=>{const moved=selected.has(item.key),inactive=!!item.feature&&!dashboardMenuItemAvailable(item);(item.moreSelectors||[]).forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(moved||inactive){el.dataset.dashboardMoved='1';el.style.display='none'}else if(el.dataset.dashboardMoved==='1'){el.style.removeProperty('display');delete el.dataset.dashboardMoved}}))});const shiftMenu=document.getElementById('mobileMoreDashboard-shift');if(shiftMenu)shiftMenu.hidden=!shiftFeatureEnabled();
const multiUnitMenu=document.getElementById('inposMultiUnitMenuV684');
if(multiUnitMenu){const visible=multiUnitFeatureEnabledV685()&&!selected.has('multi-units');multiUnitMenu.hidden=!visible;multiUnitMenu.setAttribute('aria-hidden',String(!visible));}
const massPriceMenu=document.getElementById('optionalMenu-massPrice');
if(massPriceMenu){
const massPriceEnabled=!!db?.settings?.optionalFeatures?.massPrice;
const massPriceHidden=!massPriceEnabled||selected.has('mass-price-settings');
massPriceMenu.hidden=massPriceHidden;
massPriceMenu.setAttribute('aria-hidden',String(massPriceHidden));
}
const couponMenu=document.getElementById('couponPromoMenuV569');
if(couponMenu){
 const couponActive=optionalFeatureEnabled('coupon');
 couponMenu.hidden=!couponActive;
 couponMenu.setAttribute('aria-hidden',String(!couponActive));
}
syncDashboardMovedSections()}
function dashboardMenuSwitchRow(item){const on=dashboardMenuSelection().includes(item.key),featureOff=(item.feature==='shift'&&!shiftFeatureEnabled())||(item.feature==='multiUnit'&&!multiUnitFeatureEnabledV685())||(['production','marketOnline','courier','coupon'].includes(item.feature)&&!optionalFeatureEnabled(item.feature));const sub=featureOff?`${item.sub} • fitur sedang nonaktif`:item.sub;return`<div class="account-system-item account-system-switch-item"><span class="account-system-item-icon">${esc(item.icon)}</span><div class="account-system-item-copy"><b>${esc(item.title)}</b><small>${esc(sub)}</small></div><button class="switch ${on?'on':''}" type="button" data-dashboard-menu-toggle="${esc(item.key)}" onclick="this.classList.toggle('on');updateDashboardMenuSelectionCount()"></button></div>`}
function updateDashboardMenuSelectionCount(){const el=document.getElementById('dashboardMenuSelectionCount');if(el)el.textContent=document.querySelectorAll('#screen-account-system [data-dashboard-menu-toggle].on').length}
function saveDashboardMenuSelection(){renderDashboard();syncDashboardMenuVisibility()}
function resetDashboardMenuSelection(){renderDashboard();syncDashboardMenuVisibility()}
function openDashboardMenu(){go('dashboard')}
function mobileTodayHidden(){return!!db.settings?.mobileTodayHidden}
function toggleMobileToday(){db.settings=db.settings||{};db.settings.mobileTodayHidden=!mobileTodayHidden();save();renderMobileHuffaadzHome()}
function clearStockQuickFilters(){
const ids=['stockSearch','stockMobileSearch'];
ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
const cat=document.getElementById('stockCategoryFilter');if(cat)cat.value='';
}
function openTodayActionFilter(kind){
if(kind==='low-stock'||kind==='expiry'){
clearStockQuickFilters();
const stock=document.getElementById('stockFilter'),expiry=document.getElementById('stockExpiryFilter');
if(stock)stock.value=kind==='low-stock'?'low':'';
if(expiry)expiry.value=kind==='expiry'?'attention':'';
go('stock');
renderStock();
return;
}
if(kind==='overdue-debt'){
debtBookTab='customer';
debtBookReturnScreen='customers';
syncDebtBookContextUI();
const desktopSearch=document.getElementById('debtBookSearch');if(desktopSearch)desktopSearch.value='';
const mobileSearch=document.getElementById('customerDebtMobileSearch');if(mobileSearch)mobileSearch.value='';
syncDebtBookStatusFilter(false);
const status=document.getElementById('debtBookStatusFilter');
if(status){status.value='overdue';status.dataset.mode='customer'}
window.customerDebtMobileSort='due-asc';
go('debts');
renderDebts();
}
}
function renderMobileHuffaadzHome(){
const root=document.getElementById('mobileHuffaadzHome');
if(!root)return;
const homeActive=document.getElementById('screen-dashboard')?.classList.contains('active');
document.body.classList.toggle('mobile-dashboard-active',!!homeActive);
if(homeActive){
const title=document.getElementById('pageTitle'),sub=document.getElementById('pageSub');
if(title)title.textContent=String(db.settings?.store||'INPOS');
if(sub)sub.textContent=`${String(db.settings?.cashier||'Kasir')} • Beranda`;
}
const ts=todaySales();
const revenue=sum(ts,s=>Number(s.total)||0);
const low=(db.products||[]).filter(stockNeedsRestockV707);
const now=Date.now();
const expiry=(db.products||[]).filter(p=>{
if(!p.hasExpiry||!p.expiry||p.noStock||Number(p.stock)<=0)return false;
const t=new Date(p.expiry).getTime();
if(!Number.isFinite(t))return false;
return(t-now)/864e5<=30;
});
const overdue=(db.customers||[]).filter(c=>Number(c.debt||0)>0&&c.due&&new Date(c.due).getTime()<now);
const marketOnlineActive=optionalFeatureEnabled('marketOnline');
const marketOrders=marketOnlineActive?(marketOnlineConfig().orders||[]):[];
const onlinePending=marketOrders.filter(o=>{
const status=String(o?.status||'new').trim().toLowerCase();
return!['done','completed','complete','selesai','cancelled','canceled','batal'].includes(status);
}).length;
const pending=low.length+expiry.length+overdue.length+onlinePending;
const store=String(db.settings?.store||'INPOS');
const cashier=String(db.settings?.cashier||'Kasir');
const date=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
const greeting=`Selamat datang di ${store} ✦ ${cashier} ✦ ${date} ✦ Omzet hari ini ${rupiah(revenue)} dari ${ts.length} transaksi`;
const greeting2=`${greeting} ✦ ${greeting}`;
const work=[
{icon:'▦',tone:'red',title:'Stok menipis',desc:low.length?`${low.length} produk perlu dicek atau direstok`:'Semua stok berada di atas batas minimum',count:low.length,action:"openTodayActionFilter('low-stock')"},
{icon:'⌛',tone:'gold',title:'Kadaluarsa',desc:expiry.length?`${expiry.length} produk expired / mendekati expired`:'Tidak ada produk mendekati kadaluarsa',count:expiry.length,action:"openTodayActionFilter('expiry')"},
{icon:'☷',tone:'blue',title:'Bon jatuh tempo',desc:overdue.length?`${overdue.length} pelanggan melewati jatuh tempo`:'Tidak ada bon yang melewati jatuh tempo',count:overdue.length,action:"openTodayActionFilter('overdue-debt')"}
];
if(marketOnlineActive){
work.push({icon:'🛒',tone:'blue',title:'Pesanan Online',desc:onlinePending?`${onlinePending} pesanan online perlu diproses`:'Belum ada pesanan online yang perlu diproses',count:onlinePending,action:'openMarketOrders()'});
}
const todayHidden=mobileTodayHidden();
const selectedDashboardItems=dashboardSelectedMenuItems();
const dashboardGroupMeta={
'OPERASIONAL HARIAN':{title:'Operasional Harian',icon:'◎',desc:'Aktivitas utama operasional toko',tone:'red',order:10},
'KEUANGAN':{title:'Keuangan',icon:'Rp',desc:'Pemasukan, pengeluaran, saldo & mutasi',tone:'gold',order:15},
'PRODUK & INVENTORI':{title:'Produk & Inventori',icon:'▦',desc:'Produk, data stok, opname, kategori & label',tone:'green',order:20},
'PENJUALAN, PROMO & PPN':{title:'Penjualan, Promo & PPN',icon:'%',desc:'Pembayaran, poin, diskon & pengaturan harga',tone:'blue',order:30},
'FITUR TAMBAHAN':{title:'Fitur Tambahan',icon:'✦',desc:'Produksi, market online & pengiriman',tone:'purple',order:40}
};
const groupedDashboardItems=new Map();
selectedDashboardItems.forEach(item=>{
const key=String(item.group||'LAINNYA');
if(!groupedDashboardItems.has(key))groupedDashboardItems.set(key,[]);
groupedDashboardItems.get(key).push(item);
});
const sections=[...groupedDashboardItems.entries()].map(([group,items])=>{
const meta=dashboardGroupMeta[group]||{title:group==='LAINNYA'?'Lainnya':group,icon:'▣',desc:'Menu pilihan Dashboard',tone:'orange',order:90};
return{...meta,group,items};
}).sort((a,b)=>(a.order||90)-(b.order||90)||String(a.title).localeCompare(String(b.title),'id'));
root.innerHTML=`
  <div class="mh-greeting" aria-label="Sapaan">
    <div class="mh-greeting-track"><span>${esc(greeting2)}</span><span class="mh-spark">✦</span></div>
  </div>
  <section class="mh-today ${todayHidden?'is-collapsed':''}">
    <div class="mh-today-head">
      <div class="mh-today-title">
        <span class="mh-today-title-icon">✓</span>
        <div><strong>Yang Perlu Dilakukan Hari Ini</strong><small>${pending?`${pending} perhatian perlu ditindaklanjuti`:'Semua kondisi utama toko aman'}</small></div>
      </div>
      <div class="mh-today-head-actions">
        <span class="mh-today-total ${pending?'':'all-clear'}">${pending||'✓'}</span>
        <button class="mh-today-toggle" type="button" onclick="toggleMobileToday()" aria-label="${todayHidden?'Tampilkan':'Sembunyikan'} Yang Perlu Dilakukan Hari Ini" aria-expanded="${todayHidden?'false':'true'}">
          ${todayHidden?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.4"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.4"/><path d="M4 4l16 16"/></svg>'}
        </button>
      </div>
    </div>
    <div class="mh-today-list">
      ${work.map(x=>`<button type="button" class="mh-today-item ${x.count?'has-work':'done'} tone-${x.tone}" onclick="${x.action||`go('${x.screen}')`}">
        <span class="mhti-icon">${x.icon}</span>
        <span class="mhti-copy"><strong>${esc(x.title)}</strong><small class="today-description-full-v236">${esc(x.desc)}</small><small class="today-description-short-v236">${esc(x.count?({"Stok menipis":"Perlu restok","Kadaluarsa":"Perlu dicek","Bon jatuh tempo":"Perlu ditagih","Pesanan Online":"Perlu diproses"}[x.title]||"Perlu dicek"):({"Stok menipis":"Stok aman","Kadaluarsa":"Produk aman","Bon jatuh tempo":"Tidak ada tagihan","Pesanan Online":"Belum ada pesanan"}[x.title]||"Aman"))}</small></span>
        <span class="mhti-status"><b>${x.count||'✓'}</b><small>${x.count?'Buka':'Aman'}</small></span>
        <span class="mhti-chevron">›</span>
      </button>`).join('')}
    </div>
  </section>
  ${sections.length?sections.map(sec=>`<section class="mh-section mh-group-section tone-${esc(sec.tone||'red')}" data-dashboard-group="${esc(sec.group||sec.title)}">
    <div class="mh-section-head"><span class="mhs-icon">${esc(sec.icon)}</span><div><strong>${esc(sec.title)}</strong><small>${esc(sec.desc)}</small></div></div>
    <div class="mh-menu-grid">
      ${sec.items.map(item=>`<button type="button" class="mh-menu-tile tone-${item.tone}" onclick="${item.action}" aria-label="Buka ${esc(item.title)}">
        <span class="mhm-visual">
          <span class="mhm-icon">${esc(item.icon)}</span>
          <span class="mhm-badge">${esc(item.badge)}</span>
          <small class="mhm-sub">${esc(item.cardTop||item.sub)}</small>
        </span>
        <span class="mhm-footer"><span class="mhm-footer-name">${esc(item.cardBottom||item.title)}</span><span class="mhm-footer-chevron">›</span></span>
      </button>`).join('')}
    </div>
  </section>`).join(''):'<section class="mh-section mh-group-section"><div class="empty-state">Belum ada menu Dashboard yang tersedia untuk akun ini.</div></section>'}
 `;
}
function renderDashboard(){const ts=todaySales(),rev=sum(ts,s=>s.total),cost=sum(ts,s=>s.cost),profit=rev-cost,debts=sum(db.customers,c=>c.debt),stockVal=sum(db.products,p=>p.stock*p.cost),low=db.products.filter(stockNeedsRestockV707);document.getElementById('dashDate').textContent=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});document.getElementById('dashRevenue').textContent=rupiah(rev);document.getElementById('dashRevenueFoot').textContent=ts.length+' transaksi hari ini';document.getElementById('dashProfit').textContent=rupiah(profit);document.getElementById('profitMarginBadge').textContent=(rev?profit/rev*100:0).toFixed(1)+'%';document.getElementById('dashDebt').textContent=rupiah(debts);document.getElementById('dashDebtFoot').textContent=db.customers.filter(c=>c.debt>0).length+' pelanggan belum lunas';document.getElementById('dashStockValue').textContent=rupiah(stockVal);document.getElementById('dashLowStock').textContent=low.length+' barang stok menipis';
const last7=salesInDays(7),wrev=sum(last7,s=>s.total),wcost=sum(last7,s=>s.cost),wprofit=wrev-wcost,margin=wrev?wprofit/wrev*100:0;document.getElementById('weekTotal').textContent=rupiah(wrev);document.getElementById('weekRevenue').textContent=rupiah(wrev);document.getElementById('weekCost').textContent=rupiah(wcost);document.getElementById('weekProfit').textContent=rupiah(wprofit);document.getElementById('marginPct').textContent=margin.toFixed(1)+'%';document.getElementById('marginRing').style.background=`conic-gradient(var(--primary) 0 ${Math.min(margin,100)}%,var(--surface3) ${Math.min(margin,100)}%)`;renderDayChart(last7);
let att=[];low.slice(0,2).forEach(p=>att.push({t:p.name,s:`Stok ${p.stock} ${p.unit||'pcs'} • minimum ${p.min}`,pill:'Stok rendah',cls:'red',pid:p.id}));db.products.filter(stockExpiryAttentionV707).slice(0,2).forEach(p=>{const d=Math.ceil((new Date(p.expiry)-new Date())/864e5);att.push({t:p.name,s:d<0?`Sudah expired ${fmtDate(p.expiry)}`:`Expired ${fmtDate(p.expiry)}`,pill:d<0?'Sudah Expired':'Expired',cls:d<0?'red':'yellow',pid:p.id})});db.customers.filter(c=>c.debt>0&&c.due&&new Date(c.due)<new Date()).slice(0,2).forEach(c=>att.push({t:c.name,s:`Bon ${rupiah(c.debt)} • lewat jatuh tempo`,pill:'Bon',cls:'red'}));document.getElementById('attentionList').innerHTML=att.length?att.map(a=>`<div class="list-row"><div class="list-main"><div class="list-title">${esc(a.t)}</div><div class="list-sub">${esc(a.s)}</div></div><span class="pill ${a.cls}">${a.pill}</span>${a.pid?stockAlertActionsV707(getProduct(a.pid)):''}</div>`).join(''):'<div class="empty-state">Tidak ada peringatan.</div>';
document.getElementById('topProducts').innerHTML=[...db.products].sort((a,b)=>b.sold-a.sold).slice(0,5).map((p,i)=>`<div class="list-row"><div class="list-main"><div class="list-title">${i+1}. ${esc(p.name)}</div><div class="list-sub">${p.sold} item • ${p.noStock?'tanpa stok':'stok '+p.stock}</div></div><b>${p.manualPrice?'Manual':rupiah(p.price)}</b></div>`).join('');renderMobileHuffaadzHome()}
function renderDayChart(sales){const el=document.getElementById('weekChart');let days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=dateKey(d);days.push({label:d.toLocaleDateString('id-ID',{weekday:'short'}),value:sum(sales.filter(x=>dateKey(x.date)===k),x=>x.total)})}const max=Math.max(...days.map(x=>x.value),1);el.innerHTML=days.map(d=>`<div class="bar-wrap" title="${rupiah(d.value)}"><div class="bar" style="height:${Math.max(5,d.value/max*100)}%"></div><div class="bar-label">${d.label}</div></div>`).join('')}
function categoryNames(){return[...new Set(['Umum',...(db.categories||[]),...db.products.map(p=>p.category).filter(Boolean),...(optionalFeatureEnabled('production')?['Bahan']:[]),...(serviceProductEnabled()?['Jasa']:[])])].sort((a,b)=>a.localeCompare(b,'id'))}function categories(){return['Semua',...categoryNames()]}
function setCashierView(view){db.settings.cashierView='list';save();renderProducts()}
function renderProducts(){const mode='list';db.settings.cashierView='list';const grid=document.getElementById('productGrid');if(!grid)return;grid.classList.add('list-view','cashier-list-compact');document.getElementById('viewGridBtn')?.remove();document.getElementById('viewListBtn')?.remove();document.getElementById('categoryStrip').innerHTML=categories().map(c=>`<button class="chip ${c===activeCategory?'active':''}" onclick="activeCategory='${esc(c)}';renderProducts()">${esc(c)}</button>`).join('');const q=(document.getElementById('productSearch')?.value||'').toLowerCase().trim();let ps=sortProductsNatural(db.products.filter(p=>p.active!==false&&(activeCategory==='Semua'||p.category===activeCategory)&&(!q||p.name.toLowerCase().includes(q)||String(p.sku||'').toLowerCase().includes(q)||productMatchesBarcode(p,q))));const bundles=activeCategory==='Semua'?activeBundles().filter(b=>!q||b.name.toLowerCase().includes(q)):[];const bundleHtml=bundles.map(b=>`<button class="product-card bundle-cashier-card" onclick="addBundleToCart(${b.id})"><div class="product-top"><div class="product-icon">🎁</div><span class="stock-tag"><small>Paket</small><b>✓</b></span></div><div class="product-name">${esc(b.name)}</div><div class="product-code">${b.items.length} jenis produk</div><div class="product-bottom"><div><div class="product-price">${rupiah(b.price)}</div><div class="product-unit">/bundling</div></div><span class="pill green">+</span></div></button>`).join('');const productHtml=ps.map(p=>{const visual=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:(p.emoji||'▦');const stockClass=p.noStock?'':(p.stock<=0?'out':(p.stock<=p.min?'low':''));const stockLabel=p.noStock?'<small>Stok</small><b>∞</b>':`<small>Stok</small><b>${p.stock}</b>`;const priceLabel=p.manualPrice?'Harga Manual':rupiah(productSalePrice(p,p.price));return`<button class="product-card" onclick="addToCart(${p.id})"><div class="product-top"><div class="product-icon">${visual}</div><span class="stock-tag ${stockClass}">${stockLabel}</span></div><div class="product-name">${esc(p.name)}</div><div class="product-code">${p.sku?`SKU ${esc(p.sku)} • `:''}${esc(p.barcode)}</div><div class="product-bottom"><div><div class="product-price">${priceLabel}</div><div class="product-unit">/${esc(p.unit||'pcs')}</div></div><span class="pill green">+</span></div></button>`}).join('');grid.innerHTML=(bundleHtml||productHtml)?bundleHtml+productHtml:'<div class="empty-state" style="grid-column:1/-1">Produk tidak ditemukan.</div>'}
function focusBarcode(){const i=document.getElementById('productSearch');i.focus();i.select();toast('Scanner siap. Scan barcode atau ketik kode produk.')}
function cartProductQty(productId,excludeIndex=-1){return sum(cart.filter((x,i)=>x.productId===productId&&i!==excludeIndex),x=>Number(x.qty)||0)}
function availableProductStock(productId,excludeIndex=-1){const p=getProduct(productId);if(!p)return 0;if(p.noStock)return 999999;return Math.max(0,(Number(p.stock)||0)-cartProductQty(productId,excludeIndex))}
function validateCartStock(){for(const x of cart){const item=getProduct(x.productId);if(item&&item.active===false)return{ok:false,product:item,qty:x.qty,stock:item.stock,reason:'inactive'}}for(const p of db.products){if(p.noStock)continue;const q=cartProductQty(p.id);if(q>(Number(p.stock)||0)+1e-9)return{ok:false,product:p,qty:q,stock:Number(p.stock)||0}}for(const x of cart){if(!getProduct(x.productId))return{ok:false,product:null,qty:x.qty,stock:0};if(!(Number(x.qty)>0))return{ok:false,product:getProduct(x.productId),qty:x.qty,stock:getProduct(x.productId)?.stock||0}}return{ok:true}}
function addToCart(id){const p=getProduct(id);if(!p)return toast('Produk tidak ditemukan.','error');if(p.active===false)return toast('Produk nonaktif dan tidak dapat dijual.','error');if(!p.noStock&&p.stock<=0)return toast('Stok produk habis.','error');if(!p.noStock&&availableProductStock(id)<1)return toast('Stok produk sudah habis teralokasi di transaksi ini.','error');if(productVariantsActive(p)||p.manualPrice||multiUnitRulesV684(p).length)return openMobileProductQtyVariant(id);const found=cart.find(x=>x.productId===id&&!x.variant&&!x.priceLocked);if(found)found.qty+=1;else cart.push({productId:id,qty:1,price:productSalePrice(p,p.price),variantFee:0,itemFee:0,note:'',variant:'',priceLocked:false});renderCart();playCashierTone('product');if(navigator.vibrate)navigator.vibrate(12)}
function cartItemFee(x){return Math.max(0,Number(x?.itemFee)||0)}
function cartProductFeeTotal(){return sum(cart,x=>cartItemFee(x))}
function saleProductFeeTotal(s){return sum(Array.isArray(s?.items)?s.items:[],x=>cartItemFee(x))}
function saleAllFeeTotal(s){return saleProductFeeTotal(s)+Math.max(0,Number(s?.fee)||0)}
function cartItemLineTotal(x){return Math.max(0,Number(x?.qty)||0)*Math.max(0,Number(x?.price)||0)+cartItemFee(x)}
function cartSubtotal(){return sum(cart,x=>cartItemLineTotal(x))}function cartTotal(){return Math.max(0,cartNetBeforeTax())}
function cartQty(){return sum(cart,x=>x.qty)}
function renderCart(){syncCartWholesalePrices();const subBeforeDiscount=cartSubtotal();discount=Math.max(0,Math.min(Number(discount)||0,subBeforeDiscount));const el=document.getElementById('cartItems');if(!cart.length)el.innerHTML='<div class="cart-empty"><div><div class="cart-empty-icon">🛒</div><b>Keranjang masih kosong</b><span>Pilih produk atau scan barcode untuk mulai transaksi.</span></div></div>';else el.innerHTML=cart.map((x,idx)=>{const p=getProduct(x.productId),isBonus=!!x.wholesaleBonus;return`<div class="cart-item ${isBonus?'is-wholesale-bonus':''}"><div class="cart-item-top"><div><div class="cart-item-name">${esc(p?.name||'Produk')} ${isBonus?'<span class="cart-bonus-badge">BONUS</span>':''}</div><div class="cart-item-note">${isBonus?'Gratis • Bonus Produk':`${rupiah((x.price||0)*(x.unitFactor||1))} / ${esc(x.unitLabel||p?.unit||'pcs')}${x.variant?' • '+esc(x.variant):''}`}</div>${x.note?`<span class="cart-item-note-only">${esc(x.note)}</span>`:''}${!isBonus&&cartItemFee(x)?`<span class="cart-item-fee">Biaya +${rupiah(cartItemFee(x))}</span>`:''}${!isBonus?cartItemProductDiscountHTML(x,'cart-item-discount'):''}</div><div class="cart-line-total">${isBonus?'<span class="cart-bonus-free">GRATIS</span>':rupiah(cartItemLineTotal(x))}</div></div><div class="cart-item-bottom">${isBonus?`<div class="cart-bonus-qty">Bonus × ${x.qty}</div><div class="cart-bonus-info">Stok tetap berkurang</div>`:`<div class="qty"><button onclick="changeQty(${idx},-1)">−</button><span>${multiUnitQtyTextV684(x)}</span><button onclick="changeQty(${idx},1)">+</button></div><div class="cart-tools"><button class="mini-icon" onclick="editCartItem(${idx})">✎</button><button class="mini-icon" onclick="removeCartItem(${idx})">×</button></div>`}</div></div>`}).join('');const sub=cartSubtotal(),tot=cartTotal(),taxCfg=ppnConfig();document.getElementById('cartSubtotal').textContent=rupiah(sub);const taxRow=document.getElementById('cartTaxRow'),taxEl=document.getElementById('cartTax'),taxLabel=document.getElementById('cartTaxLabel');if(taxRow)taxRow.hidden=true;if(taxEl)taxEl.textContent=rupiah(0);if(taxLabel)taxLabel.textContent=`PPN ${taxCfg.rate}%`;document.getElementById('cartTotal').textContent=rupiah(tot);document.getElementById('checkoutBtn').textContent='Bayar • '+rupiah(tot);const totalDiscountNow=transactionDiscountTotal();document.getElementById('discountBtn').textContent=totalDiscountNow?'- '+rupiah(totalDiscountNow):'+ Diskon';document.getElementById('discountBtn').hidden=!optionalFeatureEnabled('discount');document.getElementById('cartHeaderSub').textContent=cart.length?`${cartQty()} item • ${cart.length} produk`:'Belum ada item';document.getElementById('mobileCartCount').textContent=cartQty();document.getElementById('mobileCartTotal').textContent=rupiah(tot);document.getElementById('selectedCustomerText').textContent=selectedCustomerId?'👤 '+getCustomer(selectedCustomerId)?.name:'👤 Pelanggan umum';document.getElementById('mobileCartFab').style.display=(window.innerWidth<=1024&&cart.length)?'flex':'';renderMobileCashier();updateMobilePickerSummary()}
function changeQty(i,d){const x=cart[i],p=getProduct(x?.productId);if(!x||!p)return;if(x.wholesaleBonus)return toast('Qty bonus mengikuti aturan Grosir secara otomatis.');const max=availableProductStock(p.id,i);if(max<.5){cart.splice(i,1);renderCart();return toast('Item dihapus karena stok sudah tidak tersedia.','error')}const step=Number(x.unitFactor)||1;let next=step>1?Math.max(step,Number(x.qty)+d*step):Math.max(.5,Math.round((Number(x.qty)+d)*2)/2);if(next>max){next=max;toast('Jumlah disesuaikan dengan stok tersedia.')}x.qty=next;renderCart()}
function removeCartItem(i){if(cart[i]?.wholesaleBonus)return toast('Bonus Produk dihapus otomatis jika Qty pembelian tidak memenuhi aturan.');cart.splice(i,1);renderCart()}
function removeMobileSaleItem(i){if(i<0||i>=cart.length)return;if(cart[i]?.wholesaleBonus)return toast('Bonus Produk mengikuti Qty pembelian secara otomatis.');const p=getProduct(cart[i]?.productId);cart.splice(i,1);renderCart();toast(`${p?.name||'Produk'} dihapus dari penjualan.`)}
function clearCart(){if(!cart.length)return;cart=[];discount=0;paymentFee=0;paymentFeeNote='';paymentPPNActive=false;selectedTransferAccountId=null;selectedCustomerId=null;transactionNote='';renderCart();toggleCart(false);toast('Keranjang dikosongkan.')}
function showEditItemFee(){
const row=document.querySelector('#modalBox .edit-item-note-fee-row'),trigger=document.getElementById('editItemFeeTrigger'),control=document.getElementById('editItemFeeControl');
if(trigger)trigger.classList.add('hidden');if(control)control.classList.remove('hidden');if(row)row.classList.add('fee-active');
setTimeout(()=>document.getElementById('editItemFee')?.focus(),30)
}
function cancelEditItemFee(){
const row=document.querySelector('#modalBox .edit-item-note-fee-row'),trigger=document.getElementById('editItemFeeTrigger'),control=document.getElementById('editItemFeeControl'),input=document.getElementById('editItemFee');
if(input)input.value='0';if(control)control.classList.add('hidden');if(trigger)trigger.classList.remove('hidden');if(row)row.classList.remove('fee-active')
}
function editItemVariantChanged(productId){const p=getProduct(productId),sel=document.getElementById('editVariant'),priceEl=document.getElementById('editPrice');if(!p||!sel||!priceEl)return;const next=sel.value||'Default',current=Math.max(0,parseNominal(priceEl.value)),previousAppliedFee=Math.max(0,Number(sel.dataset.previousFee)||0),nextFee=variantExtraCost(p,next);priceEl.value=nominal(Math.max(0,current-previousAppliedFee+nextFee));sel.dataset.previousVariant=next;sel.dataset.previousFee=String(nextFee);const fee=document.getElementById('editVariantFee');if(fee){fee.textContent=nextFee?`Biaya varian +${rupiah(nextFee)} • Harga jual sudah diperbarui`:'Tanpa biaya tambahan varian';fee.classList.toggle('muted',!nextFee)}}
function editCartItem(i){const x=cart[i],p=getProduct(x?.productId);if(!x||!p)return toast('Produk tidak ditemukan.','error');if(Number(x.unitFactor)>1)return editMultiUnitCartV684(i);if(x.wholesaleBonus)return toast('Item Bonus Produk diatur otomatis dari menu Grosir.');const max=availableProductStock(p.id,i);if(max<.5){cart.splice(i,1);renderCart();return toast('Item dihapus karena stok sudah tidak tersedia.','error')}const currentVariant=x.variant||'Default',storedVariants=Array.isArray(p.variants)?p.variants.map(v=>String(v||'').trim()).filter(Boolean):[],variantsActive=productVariantsActive(p),variantList=[...new Set([...(variantsActive?storedVariants:[]),...((variantsActive||x.variant)?[currentVariant]:[])])];if(!variantList.length&&variantsActive)variantList.push('Default');const hasVariant=variantList.length>0,currentItemFee=cartItemFee(x),hasItemFee=currentItemFee>0,currentVariantFee=Number.isFinite(Number(x.variantFee))?Math.max(0,Number(x.variantFee)):(p.manualPrice?0:variantExtraCost(p,currentVariant));const variantInfo=hasVariant?`<div class="field full edit-item-variant"><label>Varian</label><select id="editVariant" data-previous-variant="${esc(currentVariant)}" data-previous-fee="${currentVariantFee}" onchange="editItemVariantChanged(${p.id})">${variantList.map(v=>`<option value="${esc(v)}" ${v===currentVariant?'selected':''}>${esc(v)}${variantExtraCost(p,v)?` (+${rupiah(variantExtraCost(p,v))})`:''}</option>`).join('')}</select><small id="editVariantFee" class="${variantExtraCost(p,currentVariant)?'':'muted'}" style="margin-top:2px;font-size:10.5px">${variantExtraCost(p,currentVariant)?`Biaya varian +${rupiah(variantExtraCost(p,currentVariant))}`:'Tanpa biaya tambahan varian'}</small></div>`:'';showModal('Edit Item',p.name,`<div class="form-grid edit-item-grid"><div class="edit-item-main-row"><div class="field"><label>Harga Jual</label><input id="editPrice" class="nominal-input" type="text" inputmode="numeric" value="${nominal(x.price)}" oninput="this.dataset.dirty='1'"></div><div class="field"><label>Qty</label><input id="editQty" type="number" min="0.5" max="${max}" step="0.5" value="${x.qty}"></div></div>${variantInfo}<div class="edit-item-note-fee-row ${hasItemFee?'fee-active':''}"><div class="field edit-item-note-field"><label>Catatan</label><input id="editNote" value="${esc(x.note||'')}" placeholder="Contoh: tanpa kantong"></div><button id="editItemFeeTrigger" class="edit-item-fee-trigger ${hasItemFee?'hidden':''}" type="button" onclick="showEditItemFee()">＋ Biaya</button><div id="editItemFeeControl" class="edit-item-fee-control ${hasItemFee?'':'hidden'}"><label class="edit-item-fee-field"><span>Biaya</span><span class="edit-item-fee-input"><span>Rp</span><input id="editItemFee" class="nominal-input" type="text" inputmode="numeric" value="${nominal(currentItemFee)}" ></span></label><button class="edit-item-fee-cancel" type="button" onclick="cancelEditItemFee()" title="Hapus biaya" aria-label="Hapus biaya">×</button></div></div></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{const qty=Math.max(.5,Number(document.getElementById('editQty').value)||.5),priceEl=document.getElementById('editPrice'),variantEl=document.getElementById('editVariant'),selectedVariant=variantEl?(variantEl.value||'Default'):'Default';x.qty=Math.min(qty,max);x.price=Math.max(0,parseNominal(priceEl.value));x.variantFee=hasVariant?variantExtraCost(p,selectedVariant):0;x.itemFee=Math.max(0,parseNominal(document.getElementById('editItemFee')?.value||0));x.variant=hasVariant&&selectedVariant!=='Default'?selectedVariant:'';x.priceLocked=!!(x.priceLocked||p.manualPrice||priceEl.dataset.dirty==='1');x.note=document.getElementById('editNote').value;renderCart();closeModal()}}])}
function setDiscount(){if(!optionalFeatureEnabled('discount'))return toast('Setting Diskon nonaktif. Aktifkan dari Lainnya → Fitur Tambahan.','error');if(!cart.length)return toast('Keranjang masih kosong.');const remaining=cartSubtotal();showModal('Diskon Transaksi','Masukkan potongan nominal transaksi.',`<div class="field"><label>Nominal Diskon</label><input id="discInput" class="nominal-input" type="text" inputmode="numeric" value="${nominal(discount)}" placeholder="0"></div>`,[{label:'Hapus Diskon',fn:()=>{discount=0;renderCart();closeModal()}},{label:'Terapkan',primary:true,fn:()=>{discount=Math.max(0,Math.min(parseNominal(document.getElementById('discInput').value),remaining));renderCart();closeModal()}}])}
function customerPickerRows(query=''){
const raw=String(query||'').trim().toLowerCase(),digits=raw.replace(/\D/g,'');
const rows=(db.customers||[]).filter(c=>{const name=String(c?.name||'').toLowerCase(),phone=String(c?.phone||''),phoneDigits=phone.replace(/\D/g,'');return!raw||name.includes(raw)||phone.toLowerCase().includes(raw)||(digits&&phoneDigits.includes(digits))});
const customerRows=rows.map(c=>`<button class="list-row customer-picker-row ${selectedCustomerId===c.id?'selected':''}" type="button" onclick="selectedCustomerId=${JSON.stringify(c.id)};renderCart();closeModal()"><div class="list-main"><div class="list-title">${esc(c.name)}</div><div class="list-sub">${esc(c.phone||'-')} • ${Number(c.points||0).toLocaleString('id-ID')} poin</div></div><span class="pill ${selectedCustomerId===c.id?'green':''}">${selectedCustomerId===c.id?'Dipilih':'Pilih'}</span></button>`).join('');
const empty=!rows.length?`<div class="customer-picker-empty"><b>Pelanggan tidak ditemukan</b><span>Cari menggunakan nama atau nomor WhatsApp.</span></div>`:'';
const general=`<button class="list-row customer-picker-row general ${selectedCustomerId==null?'selected':''}" type="button" onclick="selectedCustomerId=null;renderCart();closeModal()"><div class="list-main"><div class="list-title">Pelanggan Umum</div><div class="list-sub">Transaksi tanpa data pelanggan</div></div><span class="pill ${selectedCustomerId==null?'green':''}">${selectedCustomerId==null?'Dipilih':'Pilih'}</span></button>`;
return`${customerRows}${empty}${general}`
}
function filterCustomerPicker(value){const list=document.getElementById('customerPickerList'),count=document.getElementById('customerPickerCount');if(!list)return;const raw=String(value||'').trim().toLowerCase(),digits=raw.replace(/\D/g,''),rows=(db.customers||[]).filter(c=>{const name=String(c?.name||'').toLowerCase(),phone=String(c?.phone||''),phoneDigits=phone.replace(/\D/g,'');return!raw||name.includes(raw)||phone.toLowerCase().includes(raw)||(digits&&phoneDigits.includes(digits))});list.innerHTML=customerPickerRows(value);if(count)count.textContent=`${rows.length.toLocaleString('id-ID')} pelanggan`}
function selectCustomer(){showModal('Pilih Pelanggan','Cari dan pilih pelanggan untuk transaksi.',`<div class="customer-picker-filter"><div class="customer-picker-search"><span aria-hidden="true">⌕</span><input id="customerPickerSearch" type="search" inputmode="search" autocomplete="off" placeholder="Cari Nama / Nomor WhatsApp" oninput="filterCustomerPicker(this.value)"></div><small id="customerPickerCount">${(db.customers||[]).length.toLocaleString('id-ID')} pelanggan</small></div><div class="list customer-picker-list" id="customerPickerList">${customerPickerRows('')}</div>`,[{label:'Tambah Pelanggan',fn:()=>{closeModal();openCustomerModal()}}]);document.getElementById('modalBox')?.classList.add('customer-picker-modal');document.getElementById('overlay')?.classList.add('customer-picker-overlay');setTimeout(()=>document.getElementById('customerPickerSearch')?.focus(),80)}
function editTransactionNote(){showModal('Catatan Transaksi','Catatan akan tercatat di detail transaksi.',`<div class="field"><label>Catatan</label><textarea id="trxNote">${esc(transactionNote)}</textarea></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{transactionNote=document.getElementById('trxNote').value;closeModal();toast('Catatan transaksi disimpan.')}}])}
function holdCart(message='Transaksi ditahan.',options={}){if(!cart.length)return toast('Keranjang masih kosong.');const kind=options.kind||'hold',prefix=options.prefix||'HOLD';db.holds.push({id:uid(prefix),kind,time:new Date().toISOString(),cart:structuredClone(cart),discount,selectedCustomerId,transactionNote});save();cart=[];discount=0;paymentFee=0;paymentFeeNote='';paymentPPNActive=false;selectedCustomerId=null;transactionNote='';renderCart();toast(message)}
function saveSaleDraft(){holdCart('Draf penjualan disimpan.',{kind:'draft',prefix:'DRF'})}
function saveSaleQueue(){holdCart('Transaksi disimpan ke antrian.',{kind:'queue',prefix:'QUEUE'})}
function openCreditCheckout(){if(!cart.length)return toast('Keranjang masih kosong.');if(!paymentSettings().methods.Bon)return toast('Metode Bon sedang dinonaktifkan di Menu → Pembayaran.','error');if(!selectedCustomerId){toast('Pilih customer terlebih dahulu untuk Bayar Kredit.','error');selectCustomer();return}openCheckout('Bon')}
function setCartActionsCenter(){const m=document.getElementById('modalBox'),overlay=document.getElementById('overlay');m?.classList.add('cart-actions-modal');overlay?.classList.add('cart-actions-overlay')}
function openCartTools(){
const draftCount=db.holds.filter(h=>h?.kind==='draft').length,customerSales=db.sales.filter(s=>s?.customerId).length;
showModal('Aksi Keranjang','Pilih data transaksi yang ingin dibuka.',`<div class="cart-action-menu">
   <button class="cart-action-item" type="button" onclick="openDraftData()"><span class="cart-action-icon">▣</span><span class="cart-action-copy"><b>Data Draf</b><small>Draf penjualan yang belum diselesaikan.</small></span><span class="cart-action-count">${draftCount}</span></button>
   <button class="cart-action-item" type="button" onclick="openCustomerTransactions()"><span class="cart-action-icon">👤</span><span class="cart-action-copy"><b>Transaksi Pelanggan</b><small>Lihat riwayat transaksi berdasarkan pelanggan.</small></span><span class="cart-action-count">${customerSales}</span></button>
 </div>`,[]);setCartActionsCenter()
}
function openDraftData(){
const drafts=db.holds.map((h,index)=>({h,index})).filter(x=>x.h?.kind==='draft');
const body=drafts.length?`<div class="cart-action-list">${drafts.map(({h,index})=>`<button class="cart-action-row" type="button" onclick="restoreHold(${index})"><span class="cart-action-row-main"><b>${esc(h.id)}</b><small>${fmtTime(h.time)} • ${h.cart.length} produk</small></span><span class="cart-action-row-side"><strong>${rupiah(Math.max(0,sum(h.cart,x=>cartItemLineTotal(x))-(Number(h.discount)||0)))}</strong><span>Panggil ›</span></span></button>`).join('')}</div>`:`<div class="cart-action-empty"><b>Belum ada Data Draf</b><span>Tekan tombol Simpan Draf pada Penjualan untuk menyimpan transaksi sementara.</span></div>`;
showModal('Data Draf',`${drafts.length} draf tersimpan.`,body,[]);setCartActionsCenter()
}
function customerTransactionRows(){
const grouped=new Map();
db.sales.filter(s=>s?.customerId).forEach(s=>{const id=s.customerId,key=String(id),g=grouped.get(key)||{id,count:0,total:0,last:''};g.count++;g.total+=Number(s.total)||0;if(!g.last||new Date(s.date)>new Date(g.last))g.last=s.date;grouped.set(key,g)});
return[...grouped.values()].sort((a,b)=>new Date(b.last)-new Date(a.last))
}
function openCustomerTransactions(){
const rows=customerTransactionRows();
const body=rows.length?`<div class="cart-action-list">${rows.map(r=>{const c=getCustomer(r.id);return`<button class="cart-action-row" type="button" onclick="openCustomerTransactionList(${JSON.stringify(r.id)})"><span class="cart-action-row-main"><b>${esc(c?.name||'Pelanggan')}</b><small>${r.count} transaksi • Terakhir ${fmtDate(r.last)}</small></span><span class="cart-action-row-side"><strong>${rupiah(r.total)}</strong><span>Lihat ›</span></span></button>`}).join('')}</div>`:`<div class="cart-action-empty"><b>Belum ada Transaksi Pelanggan</b><span>Transaksi yang menggunakan data pelanggan akan tampil di sini.</span></div>`;
showModal('Transaksi Pelanggan','Riwayat transaksi berdasarkan pelanggan.',body,[]);setCartActionsCenter()
}
function openCustomerTransactionList(customerId){
const c=getCustomer(customerId),rows=db.sales.filter(s=>String(s.customerId)===String(customerId)).sort((a,b)=>new Date(b.date)-new Date(a.date));
const body=`<div class="cart-action-back"><button type="button" onclick="openCustomerTransactions()">‹</button><span>${esc(c?.name||'Pelanggan')} • ${rows.length} transaksi</span></div>${rows.length?`<div class="cart-action-list">${rows.map(s=>`<button class="cart-action-row" type="button" onclick="openCustomerSaleDetail('${esc(s.id)}')"><span class="cart-action-row-main"><b>${esc(s.id)}</b><small>${fmtTime(s.date)} • ${s.items?.length||0} produk • ${esc(salePaymentNameV264(s))}</small></span><span class="cart-action-row-side"><strong>${rupiah(s.total)}</strong><span>${s.returned?'Diretur':'Detail ›'}</span></span></button>`).join('')}</div>`:`<div class="cart-action-empty"><b>Belum ada transaksi</b></div>`}`;
showModal('Transaksi Pelanggan',c?.name||'Pelanggan',body,[]);setCartActionsCenter()
}
function openCustomerSaleDetail(id){closeModal();setTimeout(()=>openSaleDetail(id),0)}
function recallHold(){if(!db.holds.length)return toast('Belum ada draf atau transaksi ditahan.');document.getElementById('modalBox').classList.add('wide');document.getElementById('modalBox').innerHTML=`<div class="modal-head"><div><div class="modal-title">Draf & Transaksi Ditahan</div><div class="modal-sub">Pilih transaksi untuk dilanjutkan.</div></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="modal-body"><div class="list">${db.holds.map((h,i)=>{const label=h.kind==='draft'?'Draf':h.kind==='queue'?'Antrian':'Ditahan';return`<button class="list-row" style="border:0;background:transparent;text-align:left" onclick="restoreHold(${i})"><div class="list-main"><div class="list-title">${h.id}</div><div class="list-sub">${label} • ${fmtTime(h.time)} • ${h.cart.length} produk • ${rupiah(sum(h.cart,x=>cartItemLineTotal(x))-h.discount)}</div></div><span class="pill green">Panggil</span></button>`}).join('')}</div></div>`}
function restoreHold(i){const h=db.holds.splice(i,1)[0];if(!h)return toast('Transaksi ditahan tidak ditemukan.','error');cart=(Array.isArray(h.cart)?h.cart:[]).filter(x=>getProduct(x.productId)).map(x=>({...x,qty:Math.max(.5,Number(x.qty)||1),price:Math.max(0,Number(x.price)||0),variant:String(x.variant||''),note:String(x.note||'')}));discount=Math.max(0,Math.min(Number(h.discount)||0,cartSubtotal()));selectedCustomerId=getCustomer(h.selectedCustomerId)?h.selectedCustomerId:null;transactionNote=String(h.transactionNote||'');save();renderCart();closeModal();toast('Transaksi dipanggil kembali.')}
function toggleCart(show){const el=document.getElementById('cartPanel');if(!el)return;if(window.innerWidth<=1024)el.classList.toggle('show',show===undefined?!el.classList.contains('show'):show)}
function paymentSettings(){
if(!db.settings.payments||typeof db.settings.payments!=='object')db.settings.payments={default:'Tunai',methods:{Tunai:true,QRIS:true,Transfer:true,Bon:true},customMethods:[],labels:{},qrisImage:'',transferAccounts:[]};
if(typeof db.settings.payments.qrisImage!=='string')db.settings.payments.qrisImage='';
const legacy=db.settings.payments.transfer&&typeof db.settings.payments.transfer==='object'?db.settings.payments.transfer:null;
if(!Array.isArray(db.settings.payments.transferAccounts))db.settings.payments.transferAccounts=[];
db.settings.payments.transferAccounts=db.settings.payments.transferAccounts.filter(a=>a&&typeof a==='object').map((a,i)=>({id:String(a.id||('BANK-'+(i+1))),bank:String(a.bank||''),accountNumber:String(a.accountNumber||''),accountName:String(a.accountName||'')}));
if(!db.settings.payments.transferAccounts.length&&legacy?.accountNumber)db.settings.payments.transferAccounts.push({id:'BANK-MIGRATED',bank:String(legacy.bank||''),accountNumber:String(legacy.accountNumber||''),accountName:String(legacy.accountName||'')});
delete db.settings.payments.transfer;
if(!Array.isArray(db.settings.payments.customMethods))db.settings.payments.customMethods=[];
db.settings.payments.customMethods=[...new Set(db.settings.payments.customMethods.map(x=>String(x||'').trim()).filter(x=>x&&!['Tunai','QRIS','Transfer','Bon'].includes(x)).slice(0,12))];
if(!db.settings.payments.methods||typeof db.settings.payments.methods!=='object')db.settings.payments.methods={Tunai:true,QRIS:true,Transfer:true,Bon:true};
['Tunai','QRIS','Transfer','Bon'].forEach(k=>{if(typeof db.settings.payments.methods[k]!=='boolean')db.settings.payments.methods[k]=true});
db.settings.payments.customMethods.forEach(k=>{if(typeof db.settings.payments.methods[k]!=='boolean')db.settings.payments.methods[k]=true});
if(!db.settings.payments.labels||typeof db.settings.payments.labels!=='object'||Array.isArray(db.settings.payments.labels))db.settings.payments.labels={};
['Tunai','QRIS','Transfer','Bon'].forEach(k=>{const v=String(db.settings.payments.labels[k]||'').trim();db.settings.payments.labels[k]=v.slice(0,24)||k});
const names=paymentMethodNames(db.settings.payments),active=names.filter(k=>db.settings.payments.methods[k]);
if(!active.length){db.settings.payments.methods.Tunai=true;active.push('Tunai')}
if(!active.includes(db.settings.payments.default))db.settings.payments.default=active[0];
return db.settings.payments
}
function paymentMethodNames(c=null){c=c||db.settings?.payments||{};return['Tunai','QRIS','Transfer','Bon',...(Array.isArray(c.customMethods)?c.customMethods:[])]}
function paymentMethodLabel(m,c=null){c=c||paymentSettings();m=String(m||'');return['Tunai','QRIS','Transfer','Bon'].includes(m)?String(c.labels?.[m]||m):m}
function enabledPaymentMethods(){const c=paymentSettings();return paymentMethodNames(c).filter(k=>c.methods[k])}
function paymentMethodIcon(m){return m==='Tunai'?'💵':m==='QRIS'?'▦':m==='Transfer'?'⇄':m==='Bon'?'☷':'◉'}
function paymentMethodDesc(m){return m==='Tunai'?'Uang tunai dan kembalian otomatis.':m==='QRIS'?'Pembayaran melalui QRIS.':m==='Transfer'?'Transfer ke rekening toko.':m==='Bon'?'Catat sebagai piutang pelanggan.':'Jenis pembayaran tambahan.'}
function paymentAccountsV264(){
try{return(typeof window.financeAccountsV236==='function'?window.financeAccountsV236():(db.settings?.financeAccounts||[])).filter(Boolean)}catch(e){return(db.settings?.financeAccounts||[]).filter(Boolean)}
}
function salePaymentAccountV264(sale){
if(!sale)return null;
const base=String(sale.method||sale.paymentBaseMethod||'').trim();
if(base==='Bon'||base.toLowerCase().includes('piutang'))return null;
const rows=paymentAccountsV264();
const direct=String(sale.financeAccountId||'').trim();
if(direct){const a=rows.find(x=>String(x.id)===direct);if(a)return a}
try{
if(Array.isArray(db?.sales)&&db.sales[0]===sale&&typeof selectedFinancePaymentAccountIdV240!=='undefined'&&String(selectedFinancePaymentAccountIdV240||'')){
const pending=rows.find(x=>String(x.id)===String(selectedFinancePaymentAccountIdV240));if(pending)return pending
}
}catch(e){}
try{
if(typeof window.routeForMoveV236==='function'){
const routed=String(window.routeForMoveV236({method:base,date:sale.date,financeAccountId:direct})||'');
if(routed){const a=rows.find(x=>String(x.id)===routed);if(a)return a}
}else if(typeof routeForMoveV236==='function'){
const routed=String(routeForMoveV236({method:base,date:sale.date,financeAccountId:direct})||'');
if(routed){const a=rows.find(x=>String(x.id)===routed);if(a)return a}
}
}catch(e){}
const stored=String(sale.paymentAccountName||'').trim();
if(stored){const a=rows.find(x=>String(x.name||'').trim().toLowerCase()===stored.toLowerCase());if(a)return a;return{id:'',name:stored,method:base,active:false,historical:true}}
const same=rows.filter(x=>String(x.method||'').trim().toLowerCase()===base.toLowerCase());
if(same.length===1)return same[0];
return null
}
function salePaymentTypeV264(sale){
const raw=String(sale?.paymentBaseMethod||sale?.method||'').trim();
return raw==='Bon'?(String(paymentSettings()?.labels?.Bon||'Bon / Piutang').trim()||'Bon / Piutang'):(raw||'Lainnya')
}
function salePaymentNameV264(sale){
if(!sale)return'-';
const raw=String(sale.method||sale.paymentBaseMethod||'').trim();
if(raw==='Bon'||raw.toLowerCase().includes('piutang'))return String(paymentSettings()?.labels?.Bon||'Bon / Piutang').trim()||'Bon / Piutang';
const a=salePaymentAccountV264(sale);if(a?.name)return String(a.name);
const stored=String(sale.paymentAccountName||'').trim();if(stored)return stored;
try{return paymentMethodLabel(raw)||raw||'-'}catch(e){return raw||'-'}
}
function salePaymentDisplayV264(sale){
const name=salePaymentNameV264(sale),type=String(sale?.paymentBaseMethod||sale?.method||'').trim();
if(!type||type==='Bon'||name.toLowerCase()===type.toLowerCase())return name;
return`${name} • ${type}`
}
window.salePaymentAccountV264=salePaymentAccountV264;
window.salePaymentNameV264=salePaymentNameV264;
window.salePaymentDisplayV264=salePaymentDisplayV264;
function renderPaymentSettings(){
const el=document.getElementById('paymentSettingBody');if(!el)return;
const c=paymentSettings(),active=enabledPaymentMethods();
el.innerHTML=`<div class="payment-setting-card">
   <div class="payment-setting-overview">
     <div class="payment-setting-overview-main"><div class="payment-setting-overview-icon">▣</div><div class="payment-setting-overview-copy"><b>Pembayaran Kasir</b><small>Atur nama dan jenis pembayaran yang tampil di kasir.</small></div></div>
     <div class="payment-setting-overview-meta"><span class="pill green">${active.length} Aktif</span><span class="pill">Kasir POS</span></div>
   </div>
 </div>
 <div class="payment-setting-card">
   <div class="payment-setting-heading-row"><div><div class="payment-setting-title">Metode Pembayaran</div><p class="payment-setting-desc">Pilih jenis pembayaran yang tampil di popup kasir.</p></div><button class="btn btn-primary btn-sm" type="button" onclick="openPaymentTypeForm()">+ Tambah Jenis</button></div>
   <div class="payment-method-list">
     ${paymentMethodNames(c).map(m=>`<div class="payment-method-row ${c.methods[m]?'active':''}">
       <div class="payment-method-icon">${paymentMethodIcon(m)}</div>
       <div class="payment-method-copy"><b>${esc(paymentMethodLabel(m,c))}</b><small>${paymentMethodDesc(m)}</small></div>
       <div class="payment-method-actions"><button class="payment-mini-action" type="button" title="Edit Nama" aria-label="Edit nama ${esc(paymentMethodLabel(m,c))}" onclick="openPaymentTypeForm(decodeURIComponent('${encodeURIComponent(m)}'))">✎</button>${c.customMethods.includes(m)?`<button class="payment-mini-action danger" type="button" title="Hapus" aria-label="Hapus ${esc(paymentMethodLabel(m,c))}" onclick="deletePaymentType(decodeURIComponent('${encodeURIComponent(m)}'))">×</button>`:''}<button class="switch ${c.methods[m]?'on':''}" type="button" aria-label="${c.methods[m]?'Nonaktifkan':'Aktifkan'} ${esc(paymentMethodLabel(m,c))}" aria-pressed="${c.methods[m]?'true':'false'}" onclick="togglePaymentSetting(decodeURIComponent('${encodeURIComponent(m)}'))"></button></div>
     </div>`).join('')}
   </div>
   ${c.methods.QRIS?`<div class="qris-upload-box">
     <div class="qris-upload-head"><div><b>QRIS — Upload PNG</b><small>Upload gambar QRIS toko untuk ditampilkan saat pembayaran QRIS.</small></div><span class="pill ${c.qrisImage?'green':''}">${c.qrisImage?'TERPASANG':'BELUM ADA'}</span></div>
     <div class="qris-upload-grid">
       <div class="qris-preview">${c.qrisImage?`<img src="${c.qrisImage}" alt="QRIS">`:'<div class="qris-preview-empty">Preview<br>QRIS PNG</div>'}</div>
       <div>
         <div class="qris-upload-actions">
           <input id="qrisPngInput" type="file" accept="image/png" class="hidden" onchange="uploadQrisPng(event)">
           <button class="btn btn-primary" type="button" onclick="document.getElementById('qrisPngInput').click()">Upload PNG</button>
           ${c.qrisImage?'<button class="btn btn-danger" type="button" onclick="removeQrisPng()">Hapus</button>':''}
         </div>
         <div class="qris-upload-note">Format PNG, maksimal 2 MB. Disarankan gambar persegi dan QR terlihat jelas.</div>
       </div>
     </div>
   </div>`:''}
   ${c.methods.Transfer?`<div class="transfer-setting-box">
     <div class="transfer-setting-toolbar">
       <div class="transfer-setting-head" style="margin:0"><div><b>Transfer — Daftar Rekening</b><small>Tambahkan satu atau beberapa rekening tujuan pembayaran.</small></div></div>
       <button class="btn btn-primary btn-sm" type="button" onclick="openTransferAccountForm()">+ Tambah Rekening</button>
     </div>
     <div class="transfer-account-setting-list">
       ${c.transferAccounts.length?c.transferAccounts.map(a=>`<div class="transfer-account-setting-card">
         <div class="transfer-account-bank-icon">${esc((a.bank||'BANK').slice(0,4).toUpperCase())}</div>
         <div class="transfer-account-setting-copy"><b>${esc(a.bank||'Bank')}</b><strong>${esc(a.accountNumber||'-')}</strong><small>a.n. ${esc(a.accountName||'-')}</small></div>
         <div class="transfer-account-setting-actions"><button class="btn btn-sm" type="button" onclick="openTransferAccountForm('${esc(a.id)}')">Edit</button><button class="btn btn-danger btn-sm" type="button" onclick="deleteTransferAccount('${esc(a.id)}')">Hapus</button></div>
       </div>`).join(''):'<div class="transfer-account-empty">Belum ada rekening Transfer. Tekan <b>+ Tambah Rekening</b>.</div>'}
     </div>
   </div>`:''}
 </div>
 <div class="payment-setting-card">
   <div class="payment-setting-title">Metode Default</div>
   <p class="payment-setting-desc">Metode ini otomatis dipilih ketika popup pembayaran dibuka.</p>
   <div class="payment-default-grid">
     <div class="field"><label>Pembayaran Default</label><select id="defaultPaymentMethod" onchange="setDefaultPaymentMethod(this.value)">${active.map(m=>`<option value="${esc(m)}" ${c.default===m?'selected':''}>${esc(paymentMethodLabel(m,c))}</option>`).join('')}</select></div>
     <button class="btn btn-primary" type="button" onclick="go('cashier')">Buka Kasir</button>
   </div>
 </div>`;
}
function openPaymentTypeForm(oldName=''){
const c=paymentSettings(),fixed=['Tunai','QRIS','Transfer','Bon'];
if(oldName&&!fixed.includes(oldName)&&!c.customMethods.includes(oldName))return;
const editing=!!oldName,current=editing?paymentMethodLabel(oldName,c):'';
showModal(editing?'Edit Nama Pembayaran':'Tambah Jenis Pembayaran',editing?'Ubah nama yang tampil di kasir. Fungsi pembayaran tetap sama.':'Jenis tambahan akan tampil di popup pembayaran kasir.',`<div class="form-grid"><div class="field full"><label>Nama Jenis</label><input id="paymentTypeName" maxlength="24" placeholder="Contoh: EDC BCA / ShopeePay" value="${esc(current)}"></div></div>`,[{label:'Batal',close:true},{label:editing?'Simpan':'Tambah',primary:true,fn:()=>savePaymentType(oldName)}],true);
setTimeout(()=>{const inp=document.getElementById('paymentTypeName');inp?.focus();inp?.select()},50)
}
function savePaymentType(oldName=''){
const c=paymentSettings(),fixed=['Tunai','QRIS','Transfer','Bon'];let name=String(document.getElementById('paymentTypeName')?.value||'').trim().replace(/\s+/g,' ');
if(!name)return toast('Nama jenis pembayaran wajib diisi.','error');
if(name.length>24)return toast('Nama jenis maksimal 24 karakter.','error');
if(!/^[A-Za-z0-9À-ÿ .&+_\/-]+$/.test(name))return toast('Gunakan huruf, angka, spasi, atau tanda umum.','error');
const duplicate=paymentMethodNames(c).some(k=>k!==oldName&&paymentMethodLabel(k,c).toLowerCase()===name.toLowerCase());
if(duplicate)return toast('Nama pembayaran sudah digunakan.','error');
if(oldName&&fixed.includes(oldName)){
c.labels[oldName]=name;save();closeModal();renderPaymentSettings();toast('Nama pembayaran diperbarui.');return
}
if(!oldName&&fixed.some(k=>paymentMethodLabel(k,c).toLowerCase()===name.toLowerCase()))return toast('Nama pembayaran sudah digunakan.','error');
if(c.customMethods.some(x=>x!==oldName&&x.toLowerCase()===name.toLowerCase()))return toast('Jenis pembayaran sudah ada.','error');
if(oldName){const idx=c.customMethods.indexOf(oldName);if(idx>=0)c.customMethods[idx]=name;const wasActive=c.methods[oldName]!==false;delete c.methods[oldName];c.methods[name]=wasActive;if(c.default===oldName)c.default=name}
else{c.customMethods.push(name);c.methods[name]=true}
save();closeModal();renderPaymentSettings();toast(oldName?'Jenis pembayaran diperbarui.':'Jenis pembayaran ditambahkan.')
}
function deletePaymentType(name){
const c=paymentSettings();if(!c.customMethods.includes(name))return;
showModal('Hapus Jenis Pembayaran',name,`<div class="muted">Jenis pembayaran <b>${esc(name)}</b> akan dihapus dari pilihan kasir. Riwayat transaksi lama tidak berubah.</div>`,[{label:'Batal',close:true},{label:'Hapus',danger:true,fn:()=>{c.customMethods=c.customMethods.filter(x=>x!==name);delete c.methods[name];if(c.default===name)c.default=enabledPaymentMethods()[0]||'Tunai';save();closeModal();renderPaymentSettings();toast('Jenis pembayaran dihapus.')}}],true)
}
function uploadQrisPng(event){
const file=event?.target?.files?.[0];if(!file)return;
if(file.type!=='image/png'&&!String(file.name||'').toLowerCase().endswith('.png')){event.target.value='';return toast('File QRIS harus berformat PNG.','error')}
if(file.size>2*1024*1024){event.target.value='';return toast('Ukuran PNG maksimal 2 MB.','error')}
const reader=new FileReader();
reader.onload=()=>{const c=paymentSettings();c.qrisImage=String(reader.result||'');save();renderPaymentSettings();toast('PNG QRIS berhasil disimpan.')};
reader.onerror=()=>toast('Gagal membaca file PNG QRIS.','error');
reader.readAsDataURL(file)
}
function removeQrisPng(){const c=paymentSettings();c.qrisImage='';save();renderPaymentSettings();toast('PNG QRIS dihapus.')}
function openTransferAccountForm(id=''){
const c=paymentSettings(),a=c.transferAccounts.find(x=>x.id===id)||{id:'',bank:'',accountNumber:'',accountName:''};
showModal(id?'Edit Rekening':'Tambah Rekening','Transfer Bank',`<div class="transfer-account-form-grid"><div class="field"><label>Nama Bank</label><input id="transferBank" maxlength="40" placeholder="Contoh: BCA" value="${esc(a.bank)}"></div><div class="field"><label>Nomor Rekening</label><input id="transferAccountNumber" inputmode="numeric" maxlength="30" placeholder="Contoh: 1234567890" value="${esc(a.accountNumber)}"></div><div class="field full"><label>Atas Nama</label><input id="transferAccountName" maxlength="60" placeholder="Nama pemilik rekening" value="${esc(a.accountName)}"></div></div>`,[{label:'Batal',close:true},{label:id?'Simpan Perubahan':'Tambah Rekening',primary:true,fn:()=>saveTransferAccountEntry(id)}],true)
}
function saveTransferAccountEntry(id=''){
const c=paymentSettings();
const bank=String(document.getElementById('transferBank')?.value||'').trim();
const accountNumber=String(document.getElementById('transferAccountNumber')?.value||'').trim().replace(/[^\dA-Za-z .-]/g,'');
const accountName=String(document.getElementById('transferAccountName')?.value||'').trim();
if(!bank)return toast('Nama bank harus diisi.','error');
if(!accountNumber)return toast('Nomor rekening harus diisi.','error');
if(!accountName)return toast('Atas nama rekening harus diisi.','error');
if(c.transferAccounts.some(a=>a.id!==id&&a.bank.toLowerCase()===bank.toLowerCase()&&a.accountNumber===accountNumber))return toast('Rekening tersebut sudah terdaftar.','error');
if(id){const a=c.transferAccounts.find(x=>x.id===id);if(!a)return toast('Rekening tidak ditemukan.','error');Object.assign(a,{bank,accountNumber,accountName})}
else c.transferAccounts.push({id:uid('BANK'),bank,accountNumber,accountName});
save();closeModal();renderPaymentSettings();toast(id?'Rekening berhasil diperbarui.':'Rekening berhasil ditambahkan.')
}
function deleteTransferAccount(id){
const c=paymentSettings(),a=c.transferAccounts.find(x=>x.id===id);if(!a)return;
showModal('Hapus Rekening',`${a.bank} • ${a.accountNumber}`,`<div class="muted" style="line-height:1.55">Rekening <b>${esc(a.bank)} ${esc(a.accountNumber)}</b> atas nama <b>${esc(a.accountName)}</b> akan dihapus.</div>`,[{label:'Batal',close:true},{label:'Hapus',danger:true,fn:()=>{c.transferAccounts=c.transferAccounts.filter(x=>x.id!==id);if(selectedTransferAccountId===id)selectedTransferAccountId=null;save();closeModal();renderPaymentSettings();toast('Rekening Transfer dihapus.')}}],true)
}
function togglePaymentSetting(method){
const c=paymentSettings();if(!Object.prototype.hasOwnProperty.call(c.methods,method))return;
const active=enabledPaymentMethods();
if(c.methods[method]&&active.length<=1)return toast('Minimal satu metode pembayaran harus aktif.','error');
c.methods[method]=!c.methods[method];
const next=enabledPaymentMethods();if(!c.methods[c.default])c.default=next[0]||'Tunai';
save();renderPaymentSettings();toast(`${paymentMethodLabel(method,c)} ${c.methods[method]?'diaktifkan':'dinonaktifkan'}.`)
}
function setDefaultPaymentMethod(method){
const c=paymentSettings();if(!c.methods[method])return toast('Aktifkan metode tersebut terlebih dahulu.','error');
c.default=method;save();renderPaymentSettings();toast(`${paymentMethodLabel(method,c)} dijadikan metode pembayaran default.`)
}
function openCheckout(initialMethod=''){if(!cart.length)return toast('Keranjang masih kosong.');const stockCheck=validateCartStock();if(!stockCheck.ok)return toast(stockCheck.product?`Stok ${stockCheck.product.name} tidak mencukupi.`:'Ada produk yang sudah tidak tersedia.','error');paymentFee=0;paymentFeeNote='';paymentPPNActive=false;const total=cartTotal(),cfg=paymentSettings(),enabled=enabledPaymentMethods();paymentMethod=enabled.includes(initialMethod)?initialMethod:(enabled.includes(cfg.default)?cfg.default:enabled[0]||'Tunai');if(!cfg.transferAccounts.some(a=>a.id===selectedTransferAccountId))selectedTransferAccountId=cfg.transferAccounts[0]?.id||null;showModal('Pembayaran',`${cartQty()} item • ${selectedCustomerId?getCustomer(selectedCustomerId)?.name:'Pelanggan umum'}`,checkoutHTML(total),[{label:'Batal',close:true},{label:'Proses Pembayaran',primary:true,id:'payProcessBtn',fn:processPayment}],true);document.getElementById('overlay')?.classList.add('payment-overlay');document.getElementById('modalBox')?.classList.add('payment-modal');setTimeout(()=>updatePaymentUI(),0)}
function checkoutHTML(total){
const enabled=enabledPaymentMethods(),cfg=paymentSettings(),accounts=cfg.transferAccounts||[];
const qrisHtml=cfg.qrisImage
?`<div class="qris-checkout-box"><img src="${cfg.qrisImage}" alt="QRIS Pembayaran"><b>Scan QRIS untuk pembayaran</b><small>Pastikan nominal pembayaran sesuai total transaksi.</small></div>`
:`<div class="qris-checkout-box"><b>PNG QRIS belum diatur</b><small>Atur di Lainnya → Pembayaran → QRIS — Upload PNG.</small></div>`;
const transferHtml=accounts.length
?`<div class="transfer-checkout-box"><div class="transfer-checkout-title"><b>Pilih Rekening Transfer</b><span>Nominal <b id="transferPaymentAmount">${rupiah(total)}</b></span></div><div class="transfer-checkout-accounts">${accounts.map(a=>`<button class="transfer-checkout-account ${a.id===selectedTransferAccountId?'active':''}" data-transfer-account="${esc(a.id)}" type="button" onclick="selectTransferAccount('${esc(a.id)}')"><span class="transfer-checkout-account-copy"><span class="transfer-checkout-account-main"><b>${esc(a.bank||'Bank')}</b><strong>${esc(a.accountNumber||'-')}</strong></span><small>a.n. ${esc(a.accountName||'-')}</small></span><span class="transfer-checkout-check">✓</span></button>`).join('')}</div><div class="transfer-checkout-note">Pilih rekening tujuan dan pastikan nominal transfer sesuai total transaksi.</div></div>`
:`<div class="transfer-checkout-box"><div class="transfer-checkout-title"><b>Rekening belum tersedia</b></div><div class="transfer-checkout-note">Tambahkan rekening di Lainnya → Pembayaran → Transfer — Daftar Rekening.</div></div>`;
return`<div class="pay-total-box"><span>Total yang harus dibayar</span><strong id="paymentGrandTotal">${rupiah(total)}</strong><div class="pay-total-breakdown"><span>Belanja <b id="paymentBaseTotal">${rupiah(cartNetBeforeTax())}</b></span><span id="paymentPPNSeparator" class="ppn-payment-breakdown hidden">•</span><span id="paymentPPNBreakdown" class="ppn-payment-breakdown hidden">PPN ${ppnConfig().rate}% <b id="paymentPPNText">+Rp0</b></span>${cartProductFeeTotal()?`<span>•</span><span class="pay-fee-breakdown">Biaya Produk <b>+${rupiah(cartProductFeeTotal())}</b></span>`:''}<span id="paymentFeeSeparator" class="pay-fee-breakdown hidden">•</span><span id="paymentFeeBreakdown" class="pay-fee-breakdown hidden">Biaya Pembayaran <b id="paymentFeeText">+Rp0</b></span></div></div>${ppnEnabled()?`<div id="paymentPPNControl" class="payment-ppn-control"><div class="payment-ppn-copy"><b>PPN ${ppnConfig().rate}%</b><small id="paymentPPNStatus">Belum diterapkan • aktifkan manual untuk transaksi ini</small></div><button id="paymentPPNSwitch" class="switch" type="button" aria-pressed="false" onclick="togglePaymentPPN()"></button></div>`:''}<div class="payment-grid">${enabled.map(m=>`<button class="payment-card ${m===paymentMethod?'active':''}" data-pay="${esc(m)}" onclick="choosePayment(decodeURIComponent('${encodeURIComponent(m)}'))"><i>${paymentMethodIcon(m)}</i>${esc(paymentMethodLabel(m,cfg))}</button>`).join('')}</div><div id="paymentFeeTriggerWrap" class="payment-fee-trigger-wrap"><button id="paymentFeeTrigger" class="payment-fee-trigger" type="button" onclick="showPaymentFeeForm()">＋ Biaya</button></div><div id="paymentFeeRow" class="payment-fee-row hidden"><label class="payment-fee-field"><span>Biaya &gt; Keterangan</span><input id="paymentFeeNoteInput" class="payment-fee-note-input" type="text" maxlength="50" placeholder="Contoh: Admin" oninput="paymentFeeNote=this.value"></label><label class="payment-fee-field"><span>Nominal</span><span class="payment-fee-input"><span>Rp</span><input id="paymentFeeInput" class="nominal-input" type="text" inputmode="numeric" value="0" oninput="updatePaymentFee()"></span></label><button id="paymentFeeCancelBtn" class="payment-fee-cancel-btn" type="button" onclick="cancelPaymentFee()" title="Batal biaya" aria-label="Batal biaya">×</button></div><div id="cashArea"><div class="cash-received-row"><div class="field"><label>Uang Diterima</label><input id="paidInput" class="nominal-input" type="text" inputmode="numeric" value="${nominal(Math.ceil(total/5000)*5000)}" oninput="this.dataset.manual='1';updateChange()"></div><div class="cash-change-field"><label>Kembalian</label><div class="cash-change-inline"><b id="changeText">0</b></div></div></div><div class="quick-cash"><button onclick="setPaid(getPaymentGrandTotal())">Uang Pas</button><button id="quickCash50" onclick="setPaid(roundPaymentCash(50000))">${rupiah(Math.ceil(total/50000)*50000)}</button><button id="quickCash100" onclick="setPaid(roundPaymentCash(100000))">${rupiah(Math.ceil(total/100000)*100000)}</button><button id="quickCash500" onclick="setPaid(roundPaymentCash(500000))">${rupiah(Math.ceil(total/500000)*500000)}</button></div></div><div id="qrisArea" class="hidden">${qrisHtml}</div><div id="transferArea" class="hidden">${transferHtml}</div><div id="bonArea" class="hidden"><div class="field"><label>Jatuh Tempo</label><input id="dueInput" type="date" value="${futureDay(7)}"></div><div class="muted" style="margin-top:7px">Transaksi Bon membutuhkan pelanggan terdaftar.</div></div>`
}
function selectTransferAccount(id){const c=paymentSettings();if(!c.transferAccounts.some(a=>a.id===id))return;selectedTransferAccountId=id;document.querySelectorAll('[data-transfer-account]').forEach(b=>b.classList.toggle('active',b.dataset.transferAccount===id))}
function choosePayment(m){if(!enabledPaymentMethods().includes(m))return;paymentMethod=m;updatePaymentUI()}function updatePaymentUI(){document.querySelectorAll('[data-pay]').forEach(b=>b.classList.toggle('active',b.dataset.pay===paymentMethod));document.getElementById('cashArea')?.classList.toggle('hidden',paymentMethod!=='Tunai');document.getElementById('qrisArea')?.classList.toggle('hidden',paymentMethod!=='QRIS');document.getElementById('transferArea')?.classList.toggle('hidden',paymentMethod!=='Transfer');document.getElementById('bonArea')?.classList.toggle('hidden',paymentMethod!=='Bon');const btn=document.getElementById('payProcessBtn');if(btn)btn.textContent=paymentMethod==='Bon'?'Simpan Bon':'Proses Pembayaran';updateChange()}
function showPaymentFeeForm(){
const trigger=document.getElementById('paymentFeeTriggerWrap'),row=document.getElementById('paymentFeeRow');
if(trigger)trigger.classList.add('hidden');
if(row)row.classList.remove('hidden');
setTimeout(()=>document.getElementById('paymentFeeNoteInput')?.focus(),30)
}
function cancelPaymentFee(){
paymentFee=0;
paymentFeeNote='';
const note=document.getElementById('paymentFeeNoteInput'),fee=document.getElementById('paymentFeeInput'),trigger=document.getElementById('paymentFeeTriggerWrap'),row=document.getElementById('paymentFeeRow');
if(note)note.value='';
if(fee)fee.value='0';
updatePaymentFee();
if(row)row.classList.add('hidden');
if(trigger)trigger.classList.remove('hidden');
}
function togglePaymentPPN(){if(!ppnEnabled())return;paymentPPNActive=!paymentPPNActive;updatePaymentFee();const paid=document.getElementById('paidInput');if(paid&&paymentMethod==='Tunai'){paid.value=nominal(Math.ceil(getPaymentGrandTotal()/5000)*5000);delete paid.dataset.manual;updateChange()}}
function getPaymentGrandTotal(){return Math.max(0,cartNetBeforeTax()+paymentPPN()+(Number(paymentFee)||0))}
function roundPaymentCash(step){const total=getPaymentGrandTotal();return Math.ceil(total/step)*step}
function updatePaymentFee(){const inp=document.getElementById('paymentFeeInput');paymentFee=Math.max(0,Math.round(parseNominal(inp?.value)));if(inp)inp.value=nominal(paymentFee);const total=getPaymentGrandTotal(),tax=paymentPPN(),totalEl=document.getElementById('paymentGrandTotal'),feeEl=document.getElementById('paymentFeeText'),feeWrap=document.getElementById('paymentFeeBreakdown'),feeSep=document.getElementById('paymentFeeSeparator'),transferTotalEl=document.getElementById('transferPaymentAmount'),taxWrap=document.getElementById('paymentPPNBreakdown'),taxSep=document.getElementById('paymentPPNSeparator'),taxText=document.getElementById('paymentPPNText'),taxSwitch=document.getElementById('paymentPPNSwitch'),taxStatus=document.getElementById('paymentPPNStatus'),taxControl=document.getElementById('paymentPPNControl');if(totalEl)totalEl.textContent=rupiah(total);if(taxText)taxText.textContent='+'+rupiah(tax);if(taxWrap)taxWrap.classList.toggle('hidden',!paymentPPNActive);if(taxSep)taxSep.classList.toggle('hidden',!paymentPPNActive);if(taxSwitch){taxSwitch.classList.toggle('on',paymentPPNActive);taxSwitch.setAttribute('aria-pressed',String(paymentPPNActive))}if(taxStatus)taxStatus.textContent=paymentPPNActive?`Diterapkan • +${rupiah(tax)}`:'Belum diterapkan • aktifkan manual untuk transaksi ini';if(taxControl)taxControl.classList.toggle('active',paymentPPNActive);if(feeEl)feeEl.textContent='+'+rupiah(paymentFee);if(feeWrap)feeWrap.classList.toggle('hidden',paymentFee<=0);if(feeSep)feeSep.classList.toggle('hidden',paymentFee<=0);if(transferTotalEl)transferTotalEl.textContent=rupiah(total);const q50=document.getElementById('quickCash50'),q100=document.getElementById('quickCash100'),q500=document.getElementById('quickCash500');if(q50)q50.textContent=rupiah(roundPaymentCash(50000));if(q100)q100.textContent=rupiah(roundPaymentCash(100000));if(q500)q500.textContent=rupiah(roundPaymentCash(500000));updateChange()}
function setPaid(v){setNominalInput('paidInput',v);updateChange()}function updateChange(){const el=document.getElementById('changeText'),inp=document.getElementById('paidInput');if(el)el.textContent=nominal(Math.max(0,parseNominal(inp?.value)-getPaymentGrandTotal()))}
function processPayment(){if(!cart.length)return toast('Keranjang masih kosong.','error');const payCfg=paymentSettings();if(paymentMethod==='QRIS'&&!payCfg.qrisImage)return toast('PNG QRIS belum diatur. Atur di Lainnya → Pembayaran.','error');if(paymentMethod==='Transfer'&&!payCfg.transferAccounts.length)return toast('Tambahkan rekening Transfer terlebih dahulu.','error');if(paymentMethod==='Transfer'&&!payCfg.transferAccounts.some(a=>a.id===selectedTransferAccountId))return toast('Pilih rekening tujuan Transfer.','error');const paymentSubtotal=cartSubtotal();discount=Math.max(0,Math.min(Number(discount)||0,paymentSubtotal));const totalDiscountNow=discount;const stockCheck=validateCartStock();if(!stockCheck.ok)return toast(stockCheck.product?`Stok ${stockCheck.product.name} tidak mencukupi (${stockCheck.stock} tersedia, ${stockCheck.qty} diminta).`:'Ada produk yang sudah tidak tersedia.','error');paymentFee=Math.max(0,parseNominal(document.getElementById('paymentFeeInput')?.value||0));paymentFeeNote=String(document.getElementById('paymentFeeNoteInput')?.value||'').trim();const tax=paymentPPN(),taxRate=tax>0?ppnConfig().rate:0,earnedPoints=calculateCartPoints(),total=getPaymentGrandTotal();if(paymentMethod==='Bon'&&!selectedCustomerId)return toast('Pilih pelanggan untuk transaksi Bon.','error');let paid=total;if(paymentMethod==='Tunai'){paid=Math.max(0,parseNominal(document.getElementById('paidInput')?.value));if(paid<total)return toast('Uang diterima masih kurang.','error')}if(paymentMethod==='Bon')paid=0;const cost=sum(cart,x=>{const p=getProduct(x.productId);return(p?.cost||0)*x.qty});const stamp=new Date(),date=stamp.toISOString(),saleId=nextTransactionId(stamp);const transferAccount=paymentMethod==='Transfer'?payCfg.transferAccounts.find(a=>a.id===selectedTransferAccountId)||null:null;const saleDueDate=paymentMethod==='Bon'?(document.getElementById('dueInput')?.value||futureDay(7)):'';const sale={id:saleId,date,customerId:selectedCustomerId,customerName:selectedCustomerId?receiptSelectedCustomerNameV68(selectedCustomerId):'',cashier:String(db.settings.cashier||'Kasir'),method:paymentMethod,paymentDetail:transferAccount?structuredClone(transferAccount):null,total,cost,paid,discount:totalDiscountNow,fee:paymentFee,feeNote:paymentFeeNote,tax,taxRate,pointsEarned:earnedPoints,manualDiscount:transactionDiscountTotal(),note:transactionNote,dueDate:saleDueDate,items:structuredClone(cart),returned:false};const beforePaymentV217=structuredClone(db);db.sales.unshift(sale);cart.forEach(x=>{const p=getProduct(x.productId);if(p){if(!p.noStock)p.stock=Math.max(0,p.stock-x.qty);if(!x.wholesaleBonus)p.sold=Math.max(0,(p.sold||0)+x.qty)}});if(selectedCustomerId){const c=customerByIdLooseV68(selectedCustomerId);if(c){c.spent=Math.max(0,(c.spent||0)+total);if(pointsEnabled()){expireCustomerPointBalance(c);c.points=Math.max(0,(Number(c.points)||0)+earnedPoints);if(earnedPoints>0)c.pointsExpiresAt=pointExpiryISO(sale.date)}c.last=sale.date;if(paymentMethod==='Bon'){c.debt=Math.max(0,(c.debt||0)+total);c.due=sale.dueDate||futureDay(7)}}}if(!save()){Object.keys(db).forEach(key=>delete db[key]);Object.assign(db,beforePaymentV217);return toast('Transaksi belum tersimpan. Penyimpanan perangkat penuh atau tidak tersedia. Keranjang tetap tersedia; kosongkan ruang lalu coba lagi.','error')}addAppNotification('transaction','Transaksi berhasil',`${sale.id} • ${rupiah(sale.total)} • ${salePaymentNameV264(sale)}`,{actionScreen:'sale-detail',actionId:sale.id,key:'sale-'+sale.id});syncSmartNotifications();const auto=db.settings.autoPrint;cart=[];discount=0;paymentFee=0;paymentFeeNote='';paymentPPNActive=false;selectedTransferAccountId=null;selectedCustomerId=null;transactionNote='';renderCart();closeModal();toggleCart(false);renderAll();playCashierTone('success');if(navigator.vibrate)navigator.vibrate([35,35,55]);showSuccessReceipt(sale);if(db.settings.cashDrawerEnabled&&isCashPaymentV47(sale.method)){if(auto)setTimeout(async()=>{try{await printReceipt(sale.id)}finally{setTimeout(()=>window.openCashDrawer?.(false),180)}},350);else setTimeout(()=>window.openCashDrawer?.(false),220)}else if(auto)setTimeout(()=>printReceipt(sale.id),350)}
function showSuccessReceipt(sale){
const totals=receiptShareTotals(sale),customer=customerByIdLooseV68(sale.customerId),change=sale.method==='Tunai'?Math.max(0,(Number(sale.paid)||Number(sale.total)||0)-(Number(sale.total)||0)):0;
const extra=[];
if(totals.discount>0)extra.push(`<div class="success-tx-row"><span>Diskon</span><b>−${rupiah(totals.discount)}</b></div>`);
if(totals.tax>0)extra.push(`<div class="success-tx-row"><span>PPN ${totals.taxRate||''}${totals.taxRate?'%':''}</span><b>+${rupiah(totals.tax)}</b></div>`);
if(totals.paymentFee>0)extra.push(`<div class="success-tx-row"><span>Biaya Pembayaran${sale.feeNote?' • '+esc(sale.feeNote):''}</span><b>+${rupiah(totals.paymentFee)}</b></div>`);
if(change>0)extra.push(`<div class="success-tx-row success-tx-change"><span>Kembalian</span><b>${rupiah(change)}</b></div>`);
if((Number(sale.pointsEarned)||0)>0)extra.push(`<div class="success-tx-row success-tx-points"><span>Poin Didapat</span><b>+${Number(sale.pointsEarned)||0} Poin</b></div>`);
if(sale.method==='Bon')extra.push(`<div class="success-tx-row success-tx-bon"><span>Piutang Pelanggan</span><b>${rupiah(sale.total)}</b></div>`);
const body=`<div class="success-tx-hero"><div class="success-tx-check">✓</div><div class="success-tx-label">TRANSAKSI BERHASIL</div><div class="success-tx-total">${rupiah(sale.total)}</div><div class="success-tx-meta">${esc(salePaymentNameV264(sale))} • ${fmtTime(sale.date)}</div></div><div class="success-tx-card"><div class="success-tx-row"><span>No. Transaksi</span><b>${esc(sale.id)}</b></div><div class="success-tx-row"><span>PLG</span><b>${esc(customer?.name||'Pelanggan umum')}</b></div><div class="success-tx-row"><span>Akun Pembayaran</span><b>${esc(salePaymentNameV264(sale))}</b></div>${extra.join('')}</div><div class="success-tx-actions"><button class="success-tx-action" type="button" onclick="printReceipt('${sale.id}')"><span>🖨</span><b>Cetak Struk</b><small>58 / 80 mm</small></button><button class="success-tx-action" type="button" onclick="activeSaleDetailId='${sale.id}';window.saleDetailDocumentTargetId='${sale.id}';openSaleDetailShareReceiptMenu()"><span>↗</span><b>Bagikan</b><small>PNG 58 / 80 mm</small></button><button class="success-tx-action" type="button" onclick="openSuccessSaleDetail('${sale.id}')"><span>≡</span><b>Detail</b><small>Lihat transaksi</small></button></div>`;
showModal('Transaksi Berhasil',sale.id,body,[{label:'Transaksi Baru',primary:true,fn:()=>{closeModal();go('cashier')}}]);
const overlay=document.getElementById('overlay'),m=document.getElementById('modalBox');overlay?.classList.add('success-tx-overlay');m?.classList.add('success-tx-modal');
}
function openSuccessSaleDetail(id){closeModal();setTimeout(()=>openSaleDetail(id),0)}
function renderSales(){
const mobileMode=true;
const qSource=mobileMode?(document.getElementById('salesMobileSearch')?.value||''):(document.getElementById('salesSearch')?.value||'');
let q=qSource.toLowerCase(),mth=document.getElementById('salesMethodFilter')?.value||'',sort=window.salesMobileSort||'newest';
let rows=db.sales.filter(s=>(!q||String(s.id||'').toLowerCase().includes(q)||String(getCustomer(s.customerId)?.name||s.customerName||'Umum').toLowerCase().includes(q)||String(s.note||'').toLowerCase().includes(q)||String(s.shippingAddress||'').toLowerCase().includes(q)||String(salePaymentNameV264(s)).toLowerCase().includes(q))&&(!mth||s.method===mth));
rows=[...rows].sort((a,b)=>sort==='oldest'?new Date(a.date)-new Date(b.date):new Date(b.date)-new Date(a.date));
const countPill=document.getElementById('salesCountPill');if(countPill)countPill.textContent=rows.length+' transaksi';
const table=document.getElementById('salesTable');if(table)table.innerHTML=rows.length?rows.map(s=>`<tr><td data-label="Transaksi" data-main="true"><div class="cell-title">${s.id}</div><div class="cell-sub">${fmtTime(s.date)} • ${s.items.length} produk</div></td><td data-label="Pelanggan">${esc(getCustomer(s.customerId)?.name||s.customerName||'Umum')}</td><td data-label="Pembayaran"><span class="pill ${s.method==='Bon'?'yellow':'green'}">${esc(salePaymentNameV264(s))}</span>${saleAllFeeTotal(s)?`<span class="sales-payment-fee">Biaya +${rupiah(saleAllFeeTotal(s))}</span>`:''}</td><td data-label="Total" class="money">${rupiah(s.total)}</td><td data-label="Laba" class="money ${s.returned?'text-danger':'text-success'}">${s.returned?'Rp0':rupiah(s.total-s.cost)}</td><td data-label="Status"><span class="pill ${s.returned?'red':'green'}">${s.returned?'Diretur':'Selesai'}</span></td><td data-label="Aksi"><div class="actions"><button class="btn btn-sm" onclick="openSaleDetail('${s.id}')">Detail</button><button class="btn btn-sm" onclick="printReceipt('${s.id}')">Cetak</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-state">Transaksi tidak ditemukan.</div></td></tr>';
const methodValue=document.getElementById('salesMobileMethodValue');if(methodValue)methodValue.textContent=mth||'Semua';
const filterCount=(mth?1:0)+(sort!=='newest'?1:0);const fc=document.getElementById('salesMobileFilterCount');if(fc){fc.textContent=filterCount;fc.hidden=!filterCount}
const mc=document.getElementById('salesMobileCount');if(mc)mc.innerHTML=`<strong>${rows.length}</strong> transaksi`;
const mobileList=document.getElementById('salesMobileList');if(mobileList){mobileList.innerHTML=rows.length?rows.map(s=>{const cust=getCustomer(s.customerId)?.name||s.customerName||'Umum';const profit=s.returned?0:s.total-s.cost;return`<button class="sales-mobile-card ${s.returned?'returned':''}" type="button" onclick="openSaleDetail('${s.id}')"><div class="sales-mobile-icon"><span>🧾</span><span class="sales-mobile-icon-method">${s.returned?'Retur':esc(salePaymentNameV264(s))}</span></div><div class="sales-mobile-info"><div class="sales-mobile-id">${esc(s.id)}</div><div class="sales-mobile-time">${fmtTime(s.date)}</div><div class="sales-mobile-customer">${esc(cust)}</div><div class="sales-mobile-meta"><span class="sales-mobile-method ${s.returned?'returned':s.method==='Bon'?'bon':''}">${s.returned?'Diretur':esc(salePaymentNameV264(s))}</span><span class="sales-mobile-items">${s.items.length} produk</span></div>${saleAllFeeTotal(s)?`<span class="sales-mobile-payment-fee">Biaya +${rupiah(saleAllFeeTotal(s))}</span>`:''}</div><div class="sales-mobile-values"><div class="sales-mobile-total"><small>Total</small>${rupiah(s.total)}</div><div class="sales-mobile-profit"><small>${s.returned?'Status':'Laba'}</small>${s.returned?'Retur':rupiah(profit)}</div></div></button>`}).join(''):'<div class="sales-mobile-empty">Transaksi tidak ditemukan.</div>'}
}
function toggleMobileSalesSearch(force){const panel=document.getElementById('salesMobileSearchPanel');if(!panel)return;const open=force===undefined?!panel.classList.contains('open'):!!force;panel.classList.toggle('open',open);if(open)setTimeout(()=>document.getElementById('salesMobileSearch')?.focus(),40)}
function setSalesMobileMethod(method){const el=document.getElementById('salesMethodFilter');if(el)el.value=method;renderSales()}
function openSalesMobileMethodPicker(){const active=document.getElementById('salesMethodFilter')?.value||'';const methods=['','Tunai','QRIS','Transfer','Bon'];const rows=methods.map(v=>`<button class="stock-mobile-action${v===active?' active':''}" type="button" onclick="closeModal();setSalesMobileMethod('${v}')"><span class="ico">${v===active?'✓':'▣'}</span><span>${v?esc(paymentMethodLabel(v)):'Semua Pembayaran'}</span></button>`).join('');showModal('Metode Pembayaran','Pilih metode transaksi yang ingin ditampilkan.',`<div class="stock-mobile-action-list">${rows}</div>`,[{label:'Tutup',close:true}],true)}
function openSalesMobileFilters(){const method=document.getElementById('salesMethodFilter')?.value||'',sort=window.salesMobileSort||'newest';showModal('Filter Transaksi','Atur metode pembayaran dan urutan transaksi.',`<div class="form-grid"><div class="field full"><label>Pembayaran</label><select id="salesMobileFilterMethod"><option value="" ${!method?'selected':''}>Semua pembayaran</option><option ${method==='Tunai'?'selected':''}>Tunai</option><option ${method==='QRIS'?'selected':''}>QRIS</option><option ${method==='Online'?'selected':''}>Online</option><option ${method==='Transfer'?'selected':''}>Transfer</option><option ${method==='Bon'?'selected':''}>Bon</option></select></div><div class="field full"><label>Urutan</label><select id="salesMobileSort"><option value="newest" ${sort==='newest'?'selected':''}>Terbaru</option><option value="oldest" ${sort==='oldest'?'selected':''}>Terlama</option></select></div></div>`,[{label:'Reset',fn:()=>{setSalesMobileMethod('');window.salesMobileSort='newest';renderSales();closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{setSalesMobileMethod(document.getElementById('salesMobileFilterMethod').value);window.salesMobileSort=document.getElementById('salesMobileSort').value;renderSales();closeModal()}}])}
let activeSaleDetailId=null;
function openSaleDetail(id){
  const s=(db.sales||[]).find(x=>String(x.id)===String(id));
  if(!s){toast('Transaksi tidak ditemukan.','error');return}
  // Satu halaman Detail Transaksi untuk ponsel, tablet, dan desktop.
  activeSaleDetailId=s.id;
  closeModal();
  go('sale-detail');
}
function renderSaleDetailPage(){const body=document.getElementById('saleDetailMobileBody');if(!body)return;const s=db.sales.find(x=>x.id===activeSaleDetailId);if(!s){body.innerHTML='<div class="sale-detail-card"><div class="sale-detail-note">Transaksi tidak ditemukan.</div></div>';return}const cust=getCustomer(s.customerId);const toolbarId=document.getElementById('saleDetailToolbarId'),toolbarDate=document.getElementById('saleDetailToolbarDate');if(toolbarId)toolbarId.textContent=s.id;if(toolbarDate){const d=new Date(s.date);toolbarDate.textContent=Number.isNaN(d.getTime())?fmtTime(s.date):`${d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})} · ${d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',hour12:false})}`;}const totals=receiptShareTotals(s),fee=totals.paymentFee,productFee=totals.productFee,subtotal=totals.baseSubtotal;const change=s.method==='Tunai'?Math.max(0,(s.paid||s.total)-s.total):0;body.innerHTML=`<div class="sale-detail-card"><div class="sale-detail-info sale-detail-info-nohead"><div class="sale-detail-info-row"><small>Pelanggan</small><b>${esc(cust?.name||s.customerName||'Pelanggan umum')}</b></div><div class="sale-detail-info-row"><small>Akun Pembayaran</small><b>${esc(salePaymentNameV264(s))}</b></div><div class="sale-detail-info-row"><small>Kasir</small><b>${esc(s.cashier||'-')}</b></div><div class="sale-detail-info-row"><small>Laba Kotor</small><b>${rupiah(s.returned?0:s.total-s.cost)}</b></div></div></div><div class="sale-detail-card"><div class="sale-detail-items"><table class="sale-detail-item-table"><thead><tr><th>NO</th><th>PRODUK</th><th>JML</th><th>TOTAL</th></tr></thead><tbody>${s.items.map((x,i)=>{const prod=getProduct(x.productId);return`<tr><td>${i+1}</td><td><div class="sale-detail-item-product">${esc(prod?.name||'Produk')}${x.wholesaleBonus?' <span class="pill green">Bonus</span>':''}</div><span class="sale-detail-item-sub">${rupiah(x.price)}${prod?.unit?' / '+esc(prod.unit):''}</span>${cartItemProductDiscountHTML(x,'sale-detail-item-discount')}${cartItemFee(x)?`<span class="sale-detail-item-fee">Biaya +${rupiah(cartItemFee(x))}</span>`:''}${x.note?`<span class="sale-detail-item-note">${esc(x.note)}</span>`:''}</td><td class="sale-detail-item-qty">${x.qty}</td><td class="sale-detail-item-total">${rupiah(cartItemLineTotal(x))}</td></tr>`}).join('')}</tbody></table></div></div><div class="sale-detail-card"><div class="sale-detail-section-title">Pembayaran</div><div class="sale-detail-totals"><div class="sale-detail-total-row"><span>Subtotal</span><b>${rupiah(subtotal)}</b></div>${s.discount?`<div class="sale-detail-total-row"><span>Diskon</span><b>−${rupiah(s.discount)}</b></div>`:''}${productFee?`<div class="sale-detail-total-row"><span>Biaya Produk</span><b>+${rupiah(productFee)}</b></div>`:''}${totals.tax?`<div class="sale-detail-total-row"><span>PPN ${totals.taxRate||''}${totals.taxRate?'%':''}</span><b>+${rupiah(totals.tax)}</b></div>`:''}${fee?`<div class="sale-detail-total-row"><span>Biaya Pembayaran${s.feeNote?' • '+esc(s.feeNote):''}</span><b>+${rupiah(fee)}</b></div>`:''}<div class="sale-detail-total-row"><span>${esc(salePaymentNameV264(s))}</span><b>${rupiah(s.method==='Tunai'?(s.paid||s.total):s.total)}</b></div>${s.method==='Tunai'?`<div class="sale-detail-total-row"><span>Kembalian</span><b>${rupiah(change)}</b></div>`:''}<div class="sale-detail-total-row grand"><span>Grand Total</span><b>${rupiah(s.total)}</b></div></div></div>${s.note?`<div class="sale-detail-card"><div class="sale-detail-note"><small>CATATAN TRANSAKSI</small>${esc(s.note)}</div></div>`:''}${s.shippingAddress?`<div class="sale-detail-card"><div class="sale-detail-note"><small>ALAMAT PENGIRIMAN</small>${esc(s.shippingAddress)}</div></div>`:''}${s.shippingNote?`<div class="sale-detail-card"><div class="sale-detail-note"><small>CATATAN PENGIRIMAN</small>${esc(s.shippingNote)}</div></div>`:''}<div class="sale-detail-card"><div class="sale-detail-actions"><button class="btn btn-danger" type="button" ${s.returned?'disabled':''} onclick="returnSale('${s.id}')">${s.returned?'Transaksi Sudah Diretur':'↩ Retur Transaksi'}</button></div></div>`}
function saleDetailTarget(id=''){
const key=String(id||activeSaleDetailId||'');
return db.sales.find(s=>String(s.id)===key)||null
}
function openSaleDetailShareMenu(id=''){
const s=saleDetailTarget(id);if(!s)return toast('Transaksi tidak ditemukan.','error');
window.saleDetailDocumentTargetId=s.id;
showModal('Bagikan & Dokumen',s.id,`<div class="share-action-list">
   <button class="share-action-item" type="button" onclick="openSaleDetailShareReceiptMenu()"><span class="share-action-icon">↗</span><span>Share Struk</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="openSaleDetailPrintReceiptMenu()"><span class="share-action-icon">▣</span><span>Print Struk</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="printSaleDetailAddress()"><span class="share-action-icon">⌖</span><span>Print Alamat</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="printSaleDetailDocument('invoice')"><span class="share-action-icon">▤</span><span>Print Invoice</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="printSaleDetailDocument('delivery')"><span class="share-action-icon">⇥</span><span>Print Surat Jalan</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="openSaleDetailEmail('invoice')"><span class="share-action-icon">@</span><span>Kirimkan Email Invoice</span><span class="share-action-arrow">›</span></button>
   <button class="share-action-item" type="button" onclick="openSaleDetailEmail('quote')"><span class="share-action-icon">✉</span><span>Kirimkan Email Penawaran</span><span class="share-action-arrow">›</span></button>
  </div>`,[]);
const modal=document.getElementById('modalBox'),overlay=document.getElementById('overlay');modal?.classList.add('share-menu-modal');overlay?.classList.add('share-sheet-overlay')
}
function openSaleDetailShareReceiptMenu(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
showModal('Share Struk',s.id,`<div class="share-format-grid">
   <button class="share-format-card" type="button" onclick="shareSaleDetailReceiptPNG('58')">
    <span class="share-format-icon">▤</span><b>58 mm PNG</b><small>Bagikan struk thermal 58 mm.</small>
   </button>
   <button class="share-format-card" type="button" onclick="shareSaleDetailReceiptPNG('80')">
    <span class="share-format-icon">▤</span><b>80 mm PNG</b><small>Bagikan struk thermal 80 mm.</small>
   </button>
   <button class="share-format-card" type="button" onclick="shareSaleDetailReceiptPNG('a4')">
    <span class="share-format-icon">A4</span><b>A4 PNG</b><small>Bagikan struk ukuran A4.</small>
   </button>
  </div>`,[{label:'Kembali',fn:()=>openSaleDetailShareMenu(s.id)}],true)
}
function openSaleDetailPrintReceiptMenu(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
showModal('Print Struk',s.id,`<div class="share-format-grid">
   <button class="share-format-card" type="button" onclick="printSaleDetailReceipt()">
    <span class="share-format-icon">🖨</span><b>Cetak Struk</b><small>Cetak sesuai pengaturan printer 58/80 mm.</small>
   </button>
   <button class="share-format-card" type="button" onclick="printSaleDetailReceiptA4()">
    <span class="share-format-icon">A4</span><b>Print A4</b><small>Cetak struk transaksi dalam format halaman A4.</small>
   </button>
  </div>`,[{label:'Kembali',fn:()=>openSaleDetailShareMenu(s.id)}],true)
}
function wrapCanvasText(ctx,text,maxWidth){
const words=String(text||'').split(/\s+/).filter(Boolean),lines=[];let line='';
words.forEach(word=>{const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test});
if(line)lines.push(line);return lines.length?lines:['']
}
function receiptShareTotals(s){
const items=Array.isArray(s?.items)?s.items:[],baseSubtotal=sum(items,x=>Math.max(0,Number(x?.qty)||0)*Math.max(0,Number(x?.price)||0));
const productFee=saleProductFeeTotal(s),paymentFee=Math.max(0,Number(s?.fee)||0),discount=Math.max(0,Number(s?.discount)||0),tax=Math.max(0,Number(s?.tax)||0),taxRate=Math.max(0,Number(s?.taxRate)||0);
return{baseSubtotal,productFee,paymentFee,discount,tax,taxRate,grandTotal:Math.max(0,Number(s?.total)||0)}
}
function drawCanvasRule(ctx,x1,x2,y,color='#d1d5db',dash=[]){
ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y+.5);ctx.lineTo(x2,y+.5);ctx.stroke();ctx.restore()
}
function drawCanvasWrapped(ctx,text,x,y,maxWidth,lineHeight,opts={}){
const lines=wrapCanvasText(ctx,String(text??''),maxWidth),maxLines=Math.max(1,Number(opts.maxLines)||99);
const shown=lines.slice(0,maxLines);
if(lines.length>maxLines&&shown.length){
let last=shown[shown.length-1],suffix='…';
while(last&&ctx.measureText(last+suffix).width>maxWidth)last=last.slice(0,-1);
shown[shown.length-1]=last+suffix
}
ctx.save();ctx.textAlign=opts.align||'left';ctx.fillStyle=opts.color||'#111827';
shown.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));ctx.restore();
return shown.length*lineHeight
}
function drawCanvasPair(ctx,label,value,leftX,rightX,y,opts={}){
ctx.save();
ctx.font=`${opts.boldLabel?'700':'400'} ${opts.fontSize||18}px Arial`;
ctx.fillStyle=opts.color||'#374151';ctx.textAlign='left';ctx.fillText(String(label||''),leftX,y);
ctx.font=`${opts.boldValue===false?'400':'700'} ${opts.valueSize||opts.fontSize||18}px Arial`;
ctx.fillStyle=opts.valueColor||'#111827';ctx.textAlign='right';ctx.fillText(String(value||''),rightX,y);
ctx.restore();return opts.lineHeight||28
}
function buildSaleReceiptCanvas80(s){
const f=receiptFieldConfig(),c=s.customerId?getCustomer(s.customerId):null,t=receiptShareTotals(s);
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
const width=640,pad=38,contentW=width-pad*2,right=width-pad;
const itemNameFont=20,itemMetaFont=17,bodyFont=17,smallFont=15;
const headerParts=[],meta=[];
if(f.storeName)headerParts.push({text:String(db.settings.store||'INPOS'),font:'700 30px Arial',lh:38,color:'#111827'});
if(f.storeAddress&&db.settings.address)headerParts.push({text:String(db.settings.address),font:'400 16px Arial',lh:23,color:'#4b5563'});
if(f.storePhone&&db.settings.phone)headerParts.push({text:String(db.settings.phone),font:'400 16px Arial',lh:23,color:'#4b5563'});
if(f.transactionNumber)meta.push(['No. Transaksi',String(s.id)]);
if(f.dateTime)meta.push(['Tanggal',fmtTime(s.date)]);
if(f.cashier)meta.push(['Kasir',String(db.settings.cashier||'-')]);
if(f.customer)meta.push(['Pelanggan',String(c?.name||'Pelanggan Umum')]);
if(f.payment)meta.push(['Akun Pembayaran',String(salePaymentNameV264(s))]);
const measures=[];
let estimated=pad+10;
headerParts.forEach(h=>{ctx.font=h.font;estimated+=wrapCanvasText(ctx,h.text,contentW).length*h.lh});
estimated+=22+meta.length*29+20;
(s.items||[]).forEach(x=>{
const p=getProduct(x.productId),name=String(p?.name||'Produk')+(x.wholesaleBonus?' [BONUS]':'')+(x.variant?` • ${x.variant}`:'');
ctx.font=`700 ${itemNameFont}px Arial`;
const nameLines=wrapCanvasText(ctx,name,contentW);
const noteLines=(f.itemNote&&x.note)?(ctx.font=`400 ${smallFont}px Arial`,wrapCanvasText(ctx,String(x.note),contentW)):[],
fee=cartItemFee(x);
measures.push({x,p,name,nameLines,noteLines,fee});
estimated+=nameLines.length*27+31+(fee?24:0)+(noteLines.length*21)+12
});
estimated+=24+6*31+28+(f.footer?74:16);
canvas.width=width;canvas.height=Math.max(560,Math.ceil(estimated+pad));
ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.textBaseline='top';let y=pad;
headerParts.forEach((h,idx)=>{
ctx.font=h.font;ctx.fillStyle=h.color;ctx.textAlign='center';
const lines=wrapCanvasText(ctx,h.text,contentW);
lines.forEach(line=>{ctx.fillText(line,width/2,y);y+=h.lh});
if(idx===0)y+=2
});
y+=10;drawCanvasRule(ctx,pad,right,y,'#9ca3af',[5,5]);y+=18;
ctx.font=`400 ${bodyFont}px Arial`;
meta.forEach(([label,value])=>{
ctx.fillStyle='#4b5563';ctx.textAlign='left';ctx.fillText(label,pad,y);
ctx.fillStyle='#111827';ctx.textAlign='right';ctx.font=`700 ${bodyFont}px Arial`;
const maxValW=contentW*0.58,valLines=wrapCanvasText(ctx,value,maxValW);
valLines.forEach((line,i)=>ctx.fillText(line,right,y+i*22));
y+=Math.max(29,valLines.length*22+5);ctx.font=`400 ${bodyFont}px Arial`
});
if(f.shipping&&s.shippingAddress){
y+=2;ctx.font=`700 ${smallFont}px Arial`;ctx.fillStyle='#374151';ctx.textAlign='left';ctx.fillText('Alamat',pad,y);y+=22;
ctx.font=`400 ${smallFont}px Arial`;y+=drawCanvasWrapped(ctx,s.shippingAddress,pad,y,contentW,21,{color:'#4b5563'});y+=4
}
if(f.transactionNote&&s.note){
ctx.font=`700 ${smallFont}px Arial`;ctx.fillStyle='#374151';ctx.textAlign='left';ctx.fillText('Catatan',pad,y);y+=22;
ctx.font=`400 ${smallFont}px Arial`;y+=drawCanvasWrapped(ctx,s.note,pad,y,contentW,21,{color:'#4b5563'});y+=4
}
y+=4;drawCanvasRule(ctx,pad,right,y,'#9ca3af',[5,5]);y+=18;
measures.forEach((m,index)=>{
ctx.font=`700 ${itemNameFont}px Arial`;ctx.fillStyle='#111827';ctx.textAlign='left';
m.nameLines.forEach(line=>{ctx.fillText(line,pad,y);y+=27});
ctx.font=`400 ${itemMetaFont}px Arial`;ctx.fillStyle='#374151';ctx.textAlign='left';
ctx.fillText(`${m.x.qty} × ${rupiah(m.x.price)}`,pad,y);
ctx.font=`700 ${itemMetaFont}px Arial`;ctx.fillStyle='#111827';ctx.textAlign='right';
ctx.fillText(rupiah(cartItemLineTotal(m.x)),right,y);y+=29;
if(m.fee){
ctx.font=`400 ${smallFont}px Arial`;ctx.fillStyle='#6b7280';ctx.textAlign='left';ctx.fillText('Termasuk biaya produk',pad,y);
ctx.textAlign='right';ctx.fillText(`+${rupiah(m.fee)}`,right,y);y+=23
}
if(m.noteLines.length){
ctx.font=`400 ${smallFont}px Arial`;ctx.fillStyle='#6b7280';ctx.textAlign='left';
m.noteLines.forEach(line=>{ctx.fillText(line,pad,y);y+=21})
}
if(index<(measures.length-1)){drawCanvasRule(ctx,pad,right,y+2,'#e5e7eb');y+=14}else y+=7
});
drawCanvasRule(ctx,pad,right,y,'#9ca3af',[5,5]);y+=18;
ctx.font=`400 ${bodyFont}px Arial`;
y+=drawCanvasPair(ctx,'Subtotal Produk',rupiah(t.baseSubtotal),pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false});
if(t.productFee)y+=drawCanvasPair(ctx,'Biaya Produk',`+${rupiah(t.productFee)}`,pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false});
if(t.discount)y+=drawCanvasPair(ctx,'Diskon',`-${rupiah(t.discount)}`,pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false});
if(t.paymentFee)y+=drawCanvasPair(ctx,`Biaya Pembayaran${s.feeNote?' • '+s.feeNote:''}`,`+${rupiah(t.paymentFee)}`,pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false});
y+=5;drawCanvasRule(ctx,pad,right,y,'#111827');y+=14;
y+=drawCanvasPair(ctx,'TOTAL',rupiah(t.grandTotal),pad,right,y,{fontSize:23,valueSize:25,lineHeight:38,boldLabel:true,valueColor:'#111827'});
if(f.payment){
const paid=s.method==='Tunai'?Math.max(0,Number(s.paid)||t.grandTotal):t.grandTotal;
y+=drawCanvasPair(ctx,salePaymentNameV264(s),rupiah(paid),pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false});
if(s.method==='Tunai')y+=drawCanvasPair(ctx,'Kembalian',rupiah(Math.max(0,paid-t.grandTotal)),pad,right,y,{fontSize:bodyFont,lineHeight:30,boldValue:false})
}
if(f.footer){
y+=6;drawCanvasRule(ctx,pad,right,y,'#9ca3af',[5,5]);y+=20;
ctx.font=`400 ${smallFont}px Arial`;ctx.fillStyle='#4b5563';ctx.textAlign='center';
y+=drawCanvasWrapped(ctx,String(db.settings.footer||'Terima kasih'),width/2,y,contentW,21,{align:'center',color:'#4b5563'});y+=2;
ctx.fillText('www.inpos.id',width/2,y);y+=22
}
return canvas
}
function buildSaleReceiptCanvasA4(s){
const f=receiptFieldConfig(),c=s.customerId?getCustomer(s.customerId):null,t=receiptShareTotals(s);
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
const width=1240,padX=82,padTop=78,right=width-padX,contentW=right-padX;
const col={no:padX,product:padX+70,qty:padX+620,price:padX+745,total:right};
const productW=col.qty-col.product-22,qtyW=105,priceW=170;
const rowData=(s.items||[]).map((x,i)=>{
const p=getProduct(x.productId),name=String(p?.name||'Produk')+(x.wholesaleBonus?' [BONUS]':''),variant=x.variant?String(x.variant):'',note=(f.itemNote&&x.note)?String(x.note):'';
ctx.font='700 21px Arial';const nameLines=wrapCanvasText(ctx,name,productW);
ctx.font='400 16px Arial';const variantLines=variant?wrapCanvasText(ctx,variant,productW):[],noteLines=note?wrapCanvasText(ctx,note,productW):[];
const h=Math.max(54,nameLines.length*27+variantLines.length*21+noteLines.length*21+16);
return{x,i,p,nameLines,variantLines,noteLines,h}
});
const rowsH=rowData.reduce((n,r)=>n+r.h,0),summaryExtra=(t.productFee?33:0)+(t.discount?33:0)+(t.paymentFee?33:0)+(f.payment?66:0);
const bonDue=receiptBonDueNoteV53(s);
const estimated=padTop+115+115+58+rowsH+45+160+summaryExtra+(f.transactionNote&&receiptCleanTransactionNoteV50(s)?80:0)+(f.footer?85:30)+(bonDue?72:0);
canvas.width=width;canvas.height=Math.max(1754,Math.ceil(estimated));
ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.textBaseline='top';let y=padTop;
ctx.textAlign='left';ctx.fillStyle='#111827';
if(f.storeName){ctx.font='700 34px Arial';ctx.fillText(String(db.settings.store||'INPOS'),padX,y)}
let storeY=y+46;
ctx.font='400 18px Arial';ctx.fillStyle='#4b5563';
if(f.storeAddress&&db.settings.address){storeY+=drawCanvasWrapped(ctx,db.settings.address,padX,storeY,540,25,{color:'#4b5563'})}
if(f.storePhone&&db.settings.phone){ctx.fillText(String(db.settings.phone),padX,storeY);storeY+=25}
ctx.textAlign='right';ctx.fillStyle='#111827';ctx.font='700 30px Arial';ctx.fillText('STRUK PENJUALAN',right,y);
if(f.transactionNumber){ctx.font='400 18px Arial';ctx.fillStyle='#4b5563';ctx.fillText(String(s.id),right,y+43)}
y=Math.max(storeY,y+82)+18;drawCanvasRule(ctx,padX,right,y,'#cbd5e1');y+=25;
const metaCols=[
f.dateTime?['Tanggal',fmtTime(s.date)]:null,
f.cashier?['Kasir',String(db.settings.cashier||'-')]:null,
f.customer?['Pelanggan',String(c?.name||'Pelanggan Umum')]:null,
f.payment?['Akun Pembayaran',String(salePaymentNameV264(s))]:null
].filter(Boolean);
const metaWidth=contentW/2;
metaCols.forEach((m,i)=>{
const x=padX+(i%2)*metaWidth,yy=y+Math.floor(i/2)*50;
ctx.font='400 15px Arial';ctx.fillStyle='#6b7280';ctx.textAlign='left';ctx.fillText(m[0].toUpperCase(),x,yy);
ctx.font='700 18px Arial';ctx.fillStyle='#111827';ctx.fillText(m[1],x,yy+20)
});
y+=metaCols.length>2?112:62;
if(f.shipping&&s.shippingAddress){
ctx.font='400 15px Arial';ctx.fillStyle='#6b7280';ctx.fillText('ALAMAT',padX,y);
ctx.font='600 17px Arial';y+=22;y+=drawCanvasWrapped(ctx,s.shippingAddress,padX,y,contentW,23,{color:'#111827'});y+=12
}
drawCanvasRule(ctx,padX,right,y,'#cbd5e1');y+=1;
ctx.fillStyle='#f3f4f6';ctx.fillRect(padX,y,contentW,44);
ctx.font='700 15px Arial';ctx.fillStyle='#374151';ctx.textAlign='left';ctx.fillText('NO',col.no+10,y+14);ctx.fillText('PRODUK',col.product,y+14);
ctx.textAlign='right';ctx.fillText('QTY',col.qty+qtyW-8,y+14);ctx.fillText('HARGA',col.price+priceW-8,y+14);ctx.fillText('TOTAL',col.total,y+14);y+=44;
rowData.forEach(r=>{
const rowTop=y;ctx.fillStyle='#111827';ctx.textAlign='left';ctx.font='400 17px Arial';ctx.fillText(String(r.i+1),col.no+10,y+16);
ctx.font='700 21px Arial';r.nameLines.forEach(line=>{ctx.fillText(line,col.product,y+13);y+=27});
ctx.font='400 16px Arial';ctx.fillStyle='#6b7280';
r.variantLines.forEach(line=>{ctx.fillText(line,col.product,y+2);y+=21});
r.noteLines.forEach(line=>{ctx.fillText(line,col.product,y+2);y+=21});
y=Math.max(rowTop+r.h,y+8);
ctx.fillStyle='#111827';ctx.font='400 18px Arial';ctx.textAlign='right';
ctx.fillText(String(r.x.qty),col.qty+qtyW-8,rowTop+16);
ctx.fillText(rupiah(r.x.price),col.price+priceW-8,rowTop+16);
ctx.font='700 18px Arial';ctx.fillText(rupiah(cartItemLineTotal(r.x)),col.total,rowTop+16);
drawCanvasRule(ctx,padX,right,y,'#e5e7eb')
});
y+=28;
const sumLeft=width-560,sumRight=right,labelX=sumLeft,valueX=sumRight;
ctx.font='400 18px Arial';
y+=drawCanvasPair(ctx,'Subtotal Produk',rupiah(t.baseSubtotal),labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false});
if(t.productFee)y+=drawCanvasPair(ctx,'Biaya Produk',`+${rupiah(t.productFee)}`,labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false});
if(t.discount)y+=drawCanvasPair(ctx,'Diskon',`-${rupiah(t.discount)}`,labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false});
if(t.paymentFee)y+=drawCanvasPair(ctx,`Biaya Pembayaran${s.feeNote?' • '+s.feeNote:''}`,`+${rupiah(t.paymentFee)}`,labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false});
y+=5;drawCanvasRule(ctx,sumLeft,sumRight,y,'#111827');y+=15;
y+=drawCanvasPair(ctx,'GRAND TOTAL',rupiah(t.grandTotal),labelX,valueX,y,{fontSize:21,valueSize:24,lineHeight:40,boldLabel:true});
if(f.payment){
const paid=s.method==='Tunai'?Math.max(0,Number(s.paid)||t.grandTotal):t.grandTotal;
y+=drawCanvasPair(ctx,salePaymentNameV264(s),rupiah(paid),labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false});
if(s.method==='Tunai')y+=drawCanvasPair(ctx,'Kembalian',rupiah(Math.max(0,paid-t.grandTotal)),labelX,valueX,y,{fontSize:18,lineHeight:33,boldValue:false})
}
const cleanReceiptNoteA4=receiptCleanTransactionNoteV50(s);
if(f.transactionNote&&cleanReceiptNoteA4){
y+=26;drawCanvasRule(ctx,padX,right,y,'#e5e7eb');y+=22;
ctx.font='700 16px Arial';ctx.fillStyle='#374151';ctx.textAlign='left';ctx.fillText('CATATAN',padX,y);y+=24;
ctx.font='400 17px Arial';y+=drawCanvasWrapped(ctx,cleanReceiptNoteA4,padX,y,contentW,24,{color:'#4b5563'})
}
if(f.shipping&&s.shippingNote){
y+=18;ctx.font='700 16px Arial';ctx.fillStyle='#374151';ctx.textAlign='left';ctx.fillText('CATATAN PENGIRIMAN',padX,y);y+=24;
ctx.font='400 17px Arial';y+=drawCanvasWrapped(ctx,s.shippingNote,padX,y,contentW,24,{color:'#4b5563'})
}
let receiptBottomY=y;
if(f.footer){
const footerY=Math.max(y+45,canvas.height-(bonDue?178:112));drawCanvasRule(ctx,padX,right,footerY,'#e5e7eb');ctx.textAlign='center';
ctx.font='400 16px Arial';ctx.fillStyle='#6b7280';ctx.fillText(String(db.settings.footer||'Terima kasih'),width/2,footerY+24);
ctx.fillText('www.inpos.id',width/2,footerY+50);receiptBottomY=footerY+78
}
if(bonDue){
const dueY=Math.max(receiptBottomY+10,y+28);drawCanvasRule(ctx,padX,right,dueY,'#d1d5db');
ctx.textAlign='center';ctx.font='700 17px Arial';ctx.fillStyle='#111827';ctx.fillText(bonDue,width/2,dueY+20)
}
return canvas
}
function receiptShareThermalTextV51(s,width='80'){
const prev=String(db?.settings?.receiptWidth||'58');
try{
db.settings.receiptWidth=String(width)==='80'?'80':'58';
return String(window.makeReceiptText?window.makeReceiptText(s):makeReceiptText(s)||'');
}finally{
db.settings.receiptWidth=prev;
}
}
function buildSaleReceiptThermalCanvasV51(s,width='80'){
const is80=String(width)==='80';
const text=receiptShareThermalTextV51(s,is80?'80':'58').replace(/\r/g,'').replace(/\n+$/,'');
const lines=text.split('\n');
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
const canvasW=is80?640:464;
const fontPx=is80?20:18;
const lineH=is80?29:27;
const padX=is80?30:40,padY=is80?28:24;
canvas.width=canvasW;
canvas.height=Math.max(1,padY+Math.max(1,lines.length)*lineH+(is80?12:10));
ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='#111111';
ctx.textBaseline='top';
ctx.textAlign='left';
ctx.font=`500 ${fontPx}px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`;
lines.forEach((line,i)=>ctx.fillText(String(line||''),padX,padY+i*lineH));
return canvas
}
function buildSaleReceiptCanvas(s,format='80'){
if(format==='a4')return buildSaleReceiptCanvasA4(s);
if(String(format)==='58')return buildSaleReceiptThermalCanvasV51(s,'58');
return buildSaleReceiptThermalCanvasV51(s,'80')
}
async function shareSaleDetailReceiptPNG(format='80'){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const mode=format==='a4'?'a4':String(format)==='58'?'58':'80',canvas=buildSaleReceiptCanvas(s,mode);
const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat PNG.','error');
const fileName=`struk-${String(s.id).replace(/[^A-Za-z0-9._-]/g,'-')}-${mode}.png`;
let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(e){}
closeModal();
if(file&&navigator.share&&navigator.canShare?.({files:[file]})){
try{await navigator.share({title:`Struk ${s.id}`,text:`Struk ${db.settings.store||'INPOS'} • ${s.id}`,files:[file]});return}catch(e){if(e?.name==='AbortError')return}
}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
toast(`${mode==='a4'?'A4':mode+' mm'} PNG dibuat.`)
}
function saleReceiptA4HTML(s){
const f=receiptFieldConfig(),c=s.customerId?getCustomer(s.customerId):null,t=receiptShareTotals(s);
const rows=s.items.map((x,i)=>{const p=getProduct(x.productId);return`<tr><td>${i+1}</td><td><b>${esc(p?.name||'Produk')}${x.wholesaleBonus?' [BONUS]':''}</b>${x.variant?`<br><small>${esc(x.variant)}</small>`:''}${f.itemNote&&x.note?`<br><small>${esc(x.note)}</small>`:''}</td><td>${x.qty}</td><td>${rupiah(x.price)}</td><td><b>${rupiah(cartItemLineTotal(x))}</b></td></tr>`}).join('');
const paid=s.method==='Tunai'?Math.max(0,Number(s.paid)||t.grandTotal):t.grandTotal,change=s.method==='Tunai'?Math.max(0,paid-t.grandTotal):0;
return`<div class="doc-paper sale-receipt-a4-paper"><div class="doc-head"><div>${f.storeName?`<div class="doc-brand">${esc(db.settings.store||'INPOS')}</div>`:''}${f.storeAddress&&db.settings.address?`<div>${esc(db.settings.address)}</div>`:''}${f.storePhone&&db.settings.phone?`<div>${esc(db.settings.phone)}</div>`:''}</div><div><div class="doc-title">STRUK PENJUALAN</div>${f.transactionNumber?`<div>${esc(s.id)}</div>`:''}</div></div><div class="doc-meta">${f.dateTime?`<div><span>Tanggal</span><b>${fmtTime(s.date)}</b></div>`:''}${f.cashier?`<div><span>Kasir</span><b>${esc(db.settings.cashier||'-')}</b></div>`:''}${f.customer?`<div><span>PLG</span><b>${esc(c?.name||'Pelanggan Umum')}</b></div>`:''}${f.payment?`<div><span>Akun Pembayaran</span><b>${esc(salePaymentNameV264(s))}</b></div>`:''}${f.shipping&&s.shippingAddress?`<div><span>ALMT</span><b>${esc(s.shippingAddress)}</b></div>`:''}</div><table class="doc-table sale-receipt-a4-table"><thead><tr><th>No</th><th>Produk</th><th>Qty</th><th>Harga</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="doc-total"><div><div class="doc-total-row"><span>Subtotal Produk</span><b>${rupiah(t.baseSubtotal)}</b></div>${t.productFee?`<div class="doc-total-row"><span>Biaya Produk</span><b>+${rupiah(t.productFee)}</b></div>`:''}${t.discount?`<div class="doc-total-row"><span>Diskon</span><b>-${rupiah(t.discount)}</b></div>`:''}${t.paymentFee?`<div class="doc-total-row"><span>Biaya Pembayaran${s.feeNote?' • '+esc(s.feeNote):''}</span><b>+${rupiah(t.paymentFee)}</b></div>`:''}<div class="doc-total-row grand"><span>GRAND TOTAL</span><b>${rupiah(t.grandTotal)}</b></div>${f.payment?`<div class="doc-total-row"><span>${esc(salePaymentNameV264(s))}</span><b>${rupiah(paid)}</b></div>${s.method==='Tunai'?`<div class="doc-total-row"><span>Kembalian</span><b>${rupiah(change)}</b></div>`:''}`:''}</div></div>${f.transactionNote&&s.note?`<p><b>Catatan:</b> ${esc(s.note)}</p>`:''}${f.shipping&&s.shippingNote?`<p><b>Catatan Pengiriman:</b> ${esc(s.shippingNote)}</p>`:''}${f.footer?`<div class="sale-receipt-a4-footer">${esc(db.settings.footer||'Terima kasih')}<br>www.inpos.id</div>`:''}</div>`
}
function prepareA4PrintPage(){
let style=document.getElementById('saleReceiptA4PrintStyle');if(!style){style=document.createElement('style');style.id='saleReceiptA4PrintStyle';document.head.appendChild(style)}
style.textContent='@media print{@page{size:A4 portrait;margin:0}html,body{width:210mm!important}.printable.document-a4{width:210mm!important;min-height:297mm!important;margin:0!important;padding:12mm!important}}'
}
function printSaleDetailReceiptA4(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const zone=document.getElementById('printZone');prepareA4PrintPage();zone.className='printable document-a4';zone.innerHTML=saleReceiptA4HTML(s);closeModal();setTimeout(()=>window.print(),80)
}
window.addEventListener('afterprint',()=>{document.getElementById('saleReceiptA4PrintStyle')?.remove()});
function activeSaleDetailDocument(){
return saleDetailTarget(window.saleDetailDocumentTargetId||activeSaleDetailId)
}
async function shareSaleDetailReceipt(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
closeModal();setTimeout(()=>shareReceipt(s.id),60)
}
function printSaleDetailReceipt(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const id=s.id;closeModal();setTimeout(()=>printReceipt(id),60)
}
function saleDetailAddressHTML(s){
const c=s.customerId?getCustomer(s.customerId):null,address=String(s.shippingAddress||c?.address||'').trim();
return`<div class="address-label-paper"><div class="to">Kepada</div><h2>${esc(c?.name||'Pelanggan')}</h2>${c?.phone?`<p>${esc(c.phone)}</p>`:''}<p>${esc(address||'Alamat pengiriman belum diisi')}</p>${s.shippingNote?`<p><b>Catatan:</b> ${esc(s.shippingNote)}</p>`:''}<hr><p><b>Pengirim:</b> ${esc(db.settings.store)}</p><p>${esc(db.settings.phone||'')}</p><small>${esc(s.id)}</small></div>`
}
function printSaleDetailAddress(){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const c=s.customerId?getCustomer(s.customerId):null,address=String(s.shippingAddress||c?.address||'').trim();
if(!address)return toast('Alamat pengiriman belum tersedia.','error');
const zone=document.getElementById('printZone');zone.className='printable address-label';zone.innerHTML=saleDetailAddressHTML(s);closeModal();setTimeout(()=>window.print(),80)
}
function saleDetailDocumentHTML(s,type='invoice'){
const c=s.customerId?getCustomer(s.customerId):null,title=type==='delivery'?'SURAT JALAN':type==='quote'?'PENAWARAN':'INVOICE';
const rows=s.items.map((x,i)=>{const p=getProduct(x.productId);return`<tr><td>${i+1}</td><td><b>${esc(p?.name||'Produk')}${x.wholesaleBonus?' [BONUS]':''}</b>${x.variant?`<br><small>${esc(x.variant)}</small>`:''}${x.note?`<br><small>${esc(x.note)}</small>`:''}</td><td>${x.qty} ${esc(p?.unit||'pcs')}</td>${type==='delivery'?'':`<td>${rupiah(cartItemLineTotal(x))}</td>`}</tr>`}).join('');
const totals=receiptShareTotals(s),productFee=totals.productFee,paymentFee=totals.paymentFee,subtotal=totals.baseSubtotal;
return`<div class="doc-paper"><div class="doc-head"><div><div class="doc-brand">${esc(db.settings.store)}</div><div>${esc(db.settings.address||'')}</div><div>${esc(db.settings.phone||'')}</div></div><div><div class="doc-title">${title}</div><div>${esc(s.id)}</div></div></div><div class="doc-meta"><div><span>Tanggal</span><b>${fmtTime(s.date)}</b></div><div><span>Customer</span><b>${esc(c?.name||'Pelanggan Umum')}</b></div>${c?.phone?`<div><span>WhatsApp</span><b>${esc(c.phone)}</b></div>`:''}${s.shippingAddress?`<div><span>ALMT</span><b>${esc(s.shippingAddress)}</b></div>`:c?.address?`<div><span>ALMT</span><b>${esc(c.address)}</b></div>`:''}</div><table class="doc-table"><thead><tr><th>No</th><th>Keterangan</th><th>Jml</th>${type==='delivery'?'':'<th>Total</th>'}</tr></thead><tbody>${rows}</tbody></table>${type==='delivery'?'':`<div class="doc-total"><div><div class="doc-total-row"><span>Subtotal</span><b>${rupiah(subtotal)}</b></div>${s.discount?`<div class="doc-total-row"><span>Diskon</span><b>-${rupiah(s.discount)}</b></div>`:''}${productFee?`<div class="doc-total-row"><span>Biaya Produk</span><b>+${rupiah(productFee)}</b></div>`:''}${paymentFee?`<div class="doc-total-row"><span>Biaya Pembayaran${s.feeNote?' • '+esc(s.feeNote):''}</span><b>+${rupiah(paymentFee)}</b></div>`:''}<div class="doc-total-row grand"><span>GRAND TOTAL</span><b>${rupiah(s.total)}</b></div></div></div>`}${s.note?`<p style="margin-top:18px"><b>Catatan:</b> ${esc(s.note)}</p>`:''}${s.shippingNote?`<p><b>Catatan Pengiriman:</b> ${esc(s.shippingNote)}</p>`:''}</div>`
}
function printSaleDetailDocument(type='invoice'){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const zone=document.getElementById('printZone');zone.className='printable document-a4';zone.innerHTML=saleDetailDocumentHTML(s,type);closeModal();setTimeout(()=>window.print(),80)
}
function saleDetailQuoteText(s){
const c=s.customerId?getCustomer(s.customerId):null;let t=`PENAWARAN • ${s.id}\n${db.settings.store}\n${db.settings.address||''}\n\nKepada: ${c?.name||'Pelanggan'}\n`;
s.items.forEach((x,i)=>{const p=getProduct(x.productId),itemFee=cartItemFee(x);t+=`${i+1}. ${p?.name||'Produk'}${x.wholesaleBonus?' [BONUS]':''} — ${x.qty} x ${rupiah(x.price)}${itemFee?` + biaya ${rupiah(itemFee)}`:''} = ${rupiah(cartItemLineTotal(x))}\n`});
t+=`\nTOTAL PENAWARAN: ${rupiah(s.total)}\n`;return t
}
function openSaleDetailEmail(type='invoice'){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const c=s.customerId?getCustomer(s.customerId):null;
showModal(type==='quote'?'Email Penawaran':'Email Invoice',s.id,`<div class="field"><label>Email Customer</label><input id="saleDetailDocumentEmail" type="email" value="${esc(c?.email||'')}" placeholder="nama@email.com"></div>`,[{label:'Batal',close:true},{label:'Buka Email',primary:true,fn:()=>sendSaleDetailEmail(type)}])
}
function sendSaleDetailEmail(type='invoice'){
const s=activeSaleDetailDocument();if(!s)return toast('Transaksi tidak ditemukan.','error');
const email=String(document.getElementById('saleDetailDocumentEmail')?.value||'').trim();if(!email)return toast('Masukkan email tujuan.','error');
const subject=type==='quote'?`Penawaran ${s.id} - ${db.settings.store}`:`Invoice ${s.id} - ${db.settings.store}`,body=type==='quote'?saleDetailQuoteText(s):makeReceiptText(s);
window.location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
function shareCurrentSaleDetail(){if(activeSaleDetailId)shareReceipt(activeSaleDetailId)}
function returnSale(id){const s=db.sales.find(x=>x.id===id);if(!s||s.returned)return toast('Transaksi sudah diretur.');if(!confirm('Retur seluruh item transaksi ini?'))return;s.returned=true;s.returnedAt=new Date().toISOString();s.items.forEach(x=>{const p=getProduct(x.productId);if(p){if(!p.noStock)p.stock=Math.max(0,(p.stock||0)+(Number(x.qty)||0));if(!x.wholesaleBonus)p.sold=Math.max(0,(p.sold||0)-(Number(x.qty)||0))}});if(s.customerId){const c=getCustomer(s.customerId);if(c){c.spent=Math.max(0,(c.spent||0)-(s.total||0));c.points=Math.max(0,(c.points||0)-(s.pointsEarned==null?Math.floor((s.total||0)/10000):Math.max(0,Number(s.pointsEarned)||0)));if(c.points<=0)c.pointsExpiresAt=null;if(s.method==='Bon'){c.debt=Math.max(0,(c.debt||0)-(s.total||0));if(c.debt===0)c.due=null}}}save();renderAll();if(document.getElementById('screen-sale-detail')?.classList.contains('active')&&String(activeSaleDetailId)===String(id))renderSaleDetailPage();else closeModal();toast('Transaksi diretur, stok dan saldo pelanggan disesuaikan.')}
function exportSales(){const rows=[['No Transaksi','Tanggal','Nama Akun Pembayaran','Jenis Pembayaran','Total','Laba','Status'],...db.sales.map(s=>[s.id,s.date,salePaymentNameV264(s),String(s.paymentBaseMethod||s.method||'-'),s.total,s.returned?0:s.total-s.cost,s.returned?'Diretur':'Selesai'])];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'inpos-transaksi.csv')}
let debtBookTab='customer',debtBookReturnScreen='customers';
function syncDebtBookContextUI(){const supplier=debtBookTab==='supplier',title=supplier?'Hutang Supplier':'Piutang Pelanggan',sub=supplier?'Tagihan pembelian supplier yang belum lunas':'Tagihan pelanggan yang belum lunas';const h=document.getElementById('debtBookTitle'),p=document.getElementById('debtBookSubtitle'),purchaseNav=document.getElementById('debtSupplierModuleSubnav'),screen=document.getElementById('screen-debts'),action=document.getElementById('debtBookAction'),head=screen?.querySelector('.debt-book-head');if(h)h.textContent=title;if(p)p.textContent=sub;if(purchaseNav){purchaseNav.classList.toggle('hidden',!supplier);purchaseNav.hidden=!supplier}if(action){action.hidden=supplier;action.classList.toggle('hidden',supplier)}if(head){head.hidden=supplier;head.classList.toggle('hidden',supplier)}screen?.classList.toggle('purchase-aligned-debt',supplier);pageMeta.debts=[title,sub];if(screen?.classList.contains('active')){const t=document.getElementById('pageTitle'),s=document.getElementById('pageSub');if(t)t.textContent=title;if(s)s.textContent=sub}}
function setDebtBookTab(tab){debtBookTab=tab==='supplier'?'supplier':'customer';debtBookReturnScreen=debtBookTab==='supplier'?'purchases':'customers';const f=document.getElementById('debtBookStatusFilter');if(f)f.value='all';syncDebtBookContextUI();renderDebts()}
function openCustomerDebtPage(){debtBookTab='customer';debtBookReturnScreen='customers';syncDebtBookContextUI();go('debts')}
function openSupplierDebtPage(){debtBookTab='supplier';debtBookReturnScreen='purchases';syncDebtBookContextUI();go('debts')}
function closeDebtBookPage(){go(debtBookReturnScreen||(debtBookTab==='supplier'?'purchases':'customers'))}
function openSupplierFromPurchases(){go('suppliers')}
function debtBookPrimaryAction(){if(debtBookTab==='supplier')openPurchaseModal();else openDebtModal()}
function customerLastBonSale(customerId){return(db.sales||[]).filter(s=>Number(s.customerId)===Number(customerId)&&s.method==='Bon'&&!s.returned).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null}
function customerDebtPayments(customerId){
const direct=(db.debtPayments||[]).filter(x=>Number(x.customerId)===Number(customerId));
const linked=new Set(direct.map(x=>String(x.cashEntryId||'')).filter(Boolean));
const legacy=(db.cashEntries||[]).filter(x=>x.source==='debt'&&String(x.sourceId)===String(customerId)&&!linked.has(String(x.id))).map(x=>({id:String(x.id),date:x.date,customerId:Number(customerId),amount:Number(x.amount)||0,method:x.method||'Tunai',balanceBefore:0,balanceAfter:0,cashEntryId:String(x.id),note:'Pembayaran sebelumnya',legacy:true}));
return[...direct,...legacy].sort((a,b)=>new Date(b.date)-new Date(a.date))
}
function supplierDebtPaymentHistory(purchase){
const direct=(db.supplierDebtPayments||[]).filter(x=>String(x.purchaseId)===String(purchase.id)).sort((a,b)=>new Date(b.date)-new Date(a.date));
const logged=sum(direct,x=>Number(x.amount)||0),initial=Math.max(0,Number(purchase.paid||0)-logged),rows=[...direct];
if(initial>0)rows.push({id:'INITIAL-'+purchase.id,date:purchase.date,amount:initial,method:String(purchase.paymentMethod||'-'),note:'Pembayaran awal / sebelumnya',legacy:true});
return rows.sort((a,b)=>new Date(b.date)-new Date(a.date))
}
function syncDebtBookStatusFilter(isSupplier){
const el=document.getElementById('debtBookStatusFilter');if(!el)return'all';const mode=isSupplier?'supplier':'customer';let value=el.dataset.mode===mode?el.value:'all';
const opts=isSupplier?[['all','Semua Status'],['unpaid','Belum Bayar'],['installment','Dicicil']]:[['all','Semua Status'],['overdue','Terlambat'],['running','Berjalan'],['installment','Dicicil']];
el.innerHTML=opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');el.dataset.mode=mode;if(!opts.some(x=>x[0]===value))value='all';el.value=value;return value
}
function renderDebts(){
syncDebtBookContextUI();
const isSupplier=debtBookTab==='supplier',list=document.getElementById('debtBookList'),count=document.getElementById('debtBookCount'),totalEl=document.getElementById('debtBookTotal'),action=document.getElementById('debtBookAction'),mobileMode=true,searchSource=isSupplier&&mobileMode?(document.getElementById('supplierDebtMobileSearch')?.value||''):(document.getElementById('debtBookSearch')?.value||''),search=String(searchSource).trim().toLowerCase(),status=syncDebtBookStatusFilter(isSupplier),supplierSort=window.supplierDebtMobileSort||'newest';
document.getElementById('debtTabCustomer')?.classList.toggle('active',!isSupplier);document.getElementById('debtTabSupplier')?.classList.toggle('active',isSupplier);
document.getElementById('debtTabCustomer')?.setAttribute('aria-selected',String(!isSupplier));document.getElementById('debtTabSupplier')?.setAttribute('aria-selected',String(isSupplier));
if(action&&!isSupplier)action.textContent='+ Catat Bon';const searchEl=document.getElementById('debtBookSearch');if(searchEl)searchEl.placeholder=isSupplier?'Cari supplier / no. pembelian...':'Cari pelanggan / transaksi...';
if(isSupplier)syncPurchaseRelationMobileFilterUI('debt');
if(!list)return;
if(!isSupplier){
let rows=(db.customers||[]).filter(c=>Number(c.debt)>0).map(c=>{const last=customerLastBonSale(c.id),payments=customerDebtPayments(c.id),over=!!(c.due&&new Date(c.due)<new Date()),installment=payments.length>0,sales=(db.sales||[]).filter(s=>Number(s.customerId)===Number(c.id)&&s.method==='Bon'&&!s.returned),manual=(db.debtEntries||[]).filter(x=>Number(x.customerId)===Number(c.id)),hay=[c.name,c.phone,...sales.map(x=>x.id),...manual.map(x=>x.note)].join(' ').toLowerCase();return{c,last,payments,over,installment,hay}}).filter(x=>(!search||x.hay.includes(search))&&(status==='all'||(status==='overdue'&&x.over)||(status==='running'&&!x.over&&!x.installment)||(status==='installment'&&x.installment))).sort((a,b)=>Number(b.c.debt||0)-Number(a.c.debt||0));
const total=sum(rows,x=>Number(x.c.debt)||0);if(count)count.textContent=`${rows.length} piutang`;if(totalEl)totalEl.textContent=rupiah(total);
list.innerHTML=rows.length?rows.map(({c,last,over,installment})=>{const badge=over?'<span class="debt-status overdue">Terlambat</span>':installment?'<span class="debt-status installment">Dicicil</span>':'<span class="debt-status running">Berjalan</span>';return`<article class="debt-history-card"><div class="debt-history-icon"><span>👤</span><small>BON</small></div><div class="debt-history-main"><div class="debt-history-id">${esc(c.name)}</div><div class="debt-history-time">${last?fmtDate(last.date):'Piutang pelanggan'}${c.phone?' • '+esc(c.phone):''}</div><div class="debt-history-meta">${badge}<span>${c.due?'Jatuh tempo '+fmtDate(c.due):'Tanpa jatuh tempo'}</span></div></div><div class="debt-history-value"><small>Sisa Piutang</small><strong>${rupiah(c.debt)}</strong><div class="debt-history-actions customer-debt-actions"><button type="button" onclick="payDebt(${c.id})">Cicil</button><button type="button" onclick="openCustomerDebtDetail(${c.id})">Detail</button><button class="customer-debt-wa" type="button" aria-label="Kirim tagihan ke WhatsApp ${esc(c.name)}" title="Kirim Tagihan ke WhatsApp" onclick="waDebt(${c.id})"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L4 20l.9-4a8.4 8.4 0 1 1 15.6-4.3Z"></path><path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .3-.1 1.2-.6 1.7-.5.5-1.3.8-2.1.7-1-.1-2.5-.6-4.2-2.1-1.4-1.3-2.4-2.9-2.7-3.9-.3-.8-.2-1.7.2-2.3l.4-.4Z"></path></svg></button></div></div></article>`}).join(''):'<div class="debt-history-empty"><b>Data piutang tidak ditemukan</b><span>Ubah filter atau catat piutang baru.</span></div>';
}else{
let rows=(db.purchases||[]).filter(p=>!purchaseIsDraft(p)).filter(p=>Math.max(0,Number(p.total||0)-Number(p.paid||0))>0).map(p=>{const remaining=Math.max(0,Number(p.total||0)-Number(p.paid||0)),supplier=getSupplier(p.supplierId),installment=Number(p.paid||0)>0,unpaid=Number(p.paid||0)<=0,hay=[p.id,supplier?.name,supplier?.phone].join(' ').toLowerCase();return{p,remaining,supplier,installment,unpaid,hay}}).filter(x=>(!search||x.hay.includes(search))&&(status==='all'||(status==='installment'&&x.installment)||(status==='unpaid'&&x.unpaid))).sort((a,b)=>supplierSort==='oldest'?new Date(a.p.date)-new Date(b.p.date):supplierSort==='amount-desc'?b.remaining-a.remaining:new Date(b.p.date)-new Date(a.p.date));
const total=sum(rows,x=>x.remaining);if(count)count.textContent=`${rows.length} hutang`;if(totalEl)totalEl.textContent=rupiah(total);
list.innerHTML=rows.length?rows.map(({p,remaining,supplier,installment})=>`<article class="relation-history-card supplier-debt-history-card"><div class="relation-history-icon"><span>⇩</span><small>HT</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(p.id)}</div><div class="relation-history-time">${fmtTime(p.date)}</div><div class="relation-history-meta"><span class="relation-status debt">${installment?'Dicicil':'Belum Bayar'}</span><span>${esc(supplier?.name||'Supplier')} • ${Math.max(1,Number(p.items)||1)} item</span></div></div><div class="relation-history-value"><small>Sisa Hutang</small><strong>${rupiah(remaining)}</strong><span class="relation-history-remain">Dibayar ${rupiah(p.paid||0)}</span><div class="relation-history-actions"><button type="button" onclick="paySupplierDebt('${esc(p.id)}')">Cicil</button><button type="button" onclick="openSupplierDebtDetail('${esc(p.id)}')">Detail</button></div></div></article>`).join(''):'<div class="relation-history-empty"><b>Data hutang tidak ditemukan</b><span>Ubah pencarian atau filter status.</span></div>';
}
}
function setDebtPayQuick(inputId,value){const el=document.getElementById(inputId);if(el){el.value=nominal(Math.max(0,Math.round(Number(value)||0)));el.dispatchEvent(new Event('input',{bubbles:true}))}}
function payDebt(id){
const c=getCustomer(id);if(!c)return toast('Pelanggan tidak ditemukan.','error');const remaining=Math.max(0,Number(c.debt)||0);if(remaining<=0)return toast('Piutang pelanggan sudah lunas.');
showModal('Bayar / Cicil Piutang',c.name,`<div class="pay-total-box"><span>Sisa Piutang</span><strong>${rupiah(remaining)}</strong></div><div class="debt-pay-quick"><button type="button" onclick="setDebtPayQuick('debtPay',${Math.max(1,Math.round(remaining/2))})">50% • ${rupiah(Math.max(1,Math.round(remaining/2)))}</button><button type="button" onclick="setDebtPayQuick('debtPay',${remaining})">Bayar Lunas</button></div><div class="form-grid"><div class="field"><label>Nominal Cicilan</label><input id="debtPay" class="nominal-input" type="text" inputmode="numeric" value="${nominal(remaining)}"></div><div class="field"><label>Metode</label><select id="debtPayMethod"><option>Tunai</option><option>QRIS</option><option>Transfer</option></select></div></div>`,[{label:'Batal',close:true},{label:'Simpan Cicilan',primary:true,fn:()=>{const raw=parseNominal(document.getElementById('debtPay').value),n=Math.max(0,Math.min(remaining,raw));if(n<=0)return toast('Nominal cicilan harus lebih dari 0.','error');const method=document.getElementById('debtPayMethod')?.value||'Tunai',before=Math.max(0,Number(c.debt)||0),after=Math.max(0,before-n),date=new Date().toISOString(),cashId=uid('CASH'),dueBeforeV614=c.due;c.debt=after;if(after<=0){c.debt=0;c.due=null}if(!Array.isArray(db.cashEntries))db.cashEntries=[];db.cashEntries.unshift({id:cashId,date,direction:'in',category:'Pelunasan Bon',note:`Cicilan piutang - ${c.name}`,method,amount:n,source:'debt',sourceId:String(c.id)});if(!Array.isArray(db.debtPayments))db.debtPayments=[];db.debtPayments.unshift({id:uid('DPAY'),date,customerId:Number(c.id),amount:n,method,balanceBefore:before,balanceAfter:after,cashEntryId:cashId,note:after<=0?'Pelunasan piutang':'Cicilan piutang'});if(!save()){c.debt=before;c.due=dueBeforeV614;db.cashEntries.shift();db.debtPayments.shift();return toast('Cicilan piutang gagal tersimpan. Saldo dan kas tidak diubah.','error')}renderAll();closeModal();toast(after<=0?'Piutang pelanggan sudah lunas.':'Cicilan piutang disimpan.')}}])
}
function customerDebtShareData(id){
const c=getCustomer(id);if(!c)return null;
const sources=customerDebtSourceRows(id),payments=customerDebtPayments(id),debt=Math.max(0,Number(c.debt)||0),sourceTotal=sum(sources,x=>Number(x.amount)||0),paidTotal=sum(payments,x=>Number(x.amount)||0);
return{c,sources,payments,debt,sourceTotal,paidTotal,store:String(db.settings.store||'INPOS')}
}
function customerDebtShareText(id){
const d=customerDebtShareData(id);if(!d)return'';const{c,sources,payments,debt,sourceTotal,paidTotal,store}=d,lines=[];
lines.push('*TAGIHAN PIUTANG*',`*${store}*`);
if(db.settings.address)lines.push(String(db.settings.address));
if(db.settings.phone)lines.push(`WA Toko: ${db.settings.phone}`);
lines.push('',`Pelanggan: *${c.name}*`,c.phone?`WhatsApp: ${c.phone}`:'',`Sisa Piutang: *${rupiah(debt)}*`,c.due?`Jatuh Tempo: *${fmtDate(c.due)}*`:'Jatuh Tempo: -','','*RINCIAN TRANSAKSI*');
if(!sources.length)lines.push('Belum ada sumber transaksi yang tersimpan.');
sources.forEach((x,idx)=>{
lines.push('',`${idx+1}. *${x.id}*`,`Tanggal: ${fmtTime(x.date)}`);
if(x.type==='sale'&&x.sale){
const sale=x.sale;
(sale.items||[]).forEach((it,i)=>{const p=getProduct(it.productId),name=p?.name||'Produk',variant=it.variant?` • ${it.variant}`:'',qty=Number(it.qty)||0,price=Number(it.price)||0,total=typeof cartItemLineTotal==='function'?cartItemLineTotal(it):qty*price;lines.push(`   ${i+1}) ${name}${variant}`,`      ${nominal(qty)} x ${rupiah(price)} = ${rupiah(total)}`);if(it.note)lines.push(`      Catatan: ${it.note}`)});
const totals=typeof receiptShareTotals==='function'?receiptShareTotals(sale):null;
if(totals){lines.push(`   Subtotal: ${rupiah(totals.baseSubtotal)}`);if(totals.productFee)lines.push(`   Biaya Produk: +${rupiah(totals.productFee)}`);if(totals.discount)lines.push(`   Diskon: -${rupiah(totals.discount)}`);if(totals.tax)lines.push(`   PPN: +${rupiah(totals.tax)}`);if(totals.paymentFee)lines.push(`   Biaya Pembayaran: +${rupiah(totals.paymentFee)}`)}
lines.push(`   Total Transaksi: *${rupiah(Number(sale.total)||Number(x.amount)||0)}*`,`   Pembayaran: ${salePaymentNameV264(sale)}`);if(sale.note)lines.push(`   Catatan: ${sale.note}`)
}else{
lines.push(`   Piutang Manual: *${rupiah(x.amount)}*`,x.note?`   Catatan: ${x.note}`:'')
}
});
lines.push('','*RIWAYAT CICILAN*');
if(payments.length)payments.forEach((x,i)=>lines.push(`${i+1}. ${fmtTime(x.date)} • ${x.method||'Tunai'}`,`   Bayar ${rupiah(x.amount)}${Number(x.balanceAfter)>0?` • Sisa ${rupiah(x.balanceAfter)}`:' • Lunas'}`));else lines.push('Belum ada cicilan tercatat.');
lines.push('','*RINGKASAN*',`Total transaksi/piutang tercatat: ${rupiah(sourceTotal)}`,`Total cicilan tercatat: ${rupiah(paidTotal)}`,`Sisa piutang saat ini: *${rupiah(debt)}*`,c.due?`Jatuh tempo: ${fmtDate(c.due)}`:'Jatuh tempo: -','',`Mohon dapat melakukan pembayaran. Terima kasih.`,`— ${store}`);
return lines.filter((x,i,a)=>x!==''||i===0||a[i-1]!=='').join('\n')
}
function openDebtWhatsAppShare(id){
const d=customerDebtShareData(id);if(!d)return toast('Pelanggan tidak ditemukan.','error');const phone=normalizeMarketPhone(d.c.phone);if(!phone||phone.length<10)return toast('Nomor WhatsApp pelanggan belum diisi atau tidak valid.','error');if(d.debt<=0)return toast('Piutang pelanggan sudah lunas.');
const preview=d.sources.slice(0,3).map(x=>`<div class="debt-wa-preview-row"><span><b>${esc(x.id)}</b><small>${fmtTime(x.date)} • ${esc(x.type==='sale'?'Transaksi Bon':'Piutang Manual')}</small></span><strong>${rupiah(x.amount)}</strong></div>`).join('');
showModal('Kirim Tagihan WhatsApp',d.c.name,`<div class="debt-wa-share"><div class="debt-wa-summary"><div><small>Sisa Piutang</small><strong>${rupiah(d.debt)}</strong></div><div><small>Jatuh Tempo</small><b>${d.c.due?fmtDate(d.c.due):'-'}</b></div></div><div class="debt-wa-preview"><div class="debt-wa-preview-head"><b>Transaksi Tagihan</b><small>${d.sources.length} transaksi/data</small></div>${preview||'<div class="debt-wa-empty">Belum ada rincian transaksi tersimpan.</div>'}${d.sources.length>3?`<div class="debt-wa-more">+ ${d.sources.length-3} transaksi lainnya akan ikut dikirim</div>`:''}</div><div class="debt-wa-choice"><button type="button" class="debt-wa-option text" onclick="sendDebtWhatsAppText(${Number(id)})"><span class="debt-wa-option-icon">T</span><span><b>Teks Tagihan</b><small>Kirim rincian transaksi lengkap sebagai pesan WhatsApp.</small></span><i>›</i></button><button type="button" class="debt-wa-option png" onclick="shareDebtWhatsAppPNG(${Number(id)})"><span class="debt-wa-option-icon">58</span><span><b>Nota 58 mm (PNG)</b><small>Buat nota tagihan lengkap lalu bagikan sebagai gambar.</small></span><i>›</i></button></div><div class="debt-wa-note">Nota dan teks memuat transaksi, item, qty, harga, total, cicilan, sisa piutang, dan jatuh tempo.</div></div>`,[{label:'Tutup',close:true}]);
document.getElementById('modalBox')?.classList.add('debt-wa-share-modal')
}
function waDebt(id){openDebtWhatsAppShare(id)}
function sendDebtWhatsAppText(id){
const d=customerDebtShareData(id);if(!d)return toast('Pelanggan tidak ditemukan.','error');const phone=normalizeMarketPhone(d.c.phone);if(!phone||phone.length<10)return toast('Nomor WhatsApp pelanggan belum diisi atau tidak valid.','error');const txt=customerDebtShareText(id);closeModal();const url='https://wa.me/'+phone+'?text='+encodeURIComponent(txt);const w=window.open(url,'_blank','noopener,noreferrer');if(!w)toast('Browser memblokir WhatsApp. Izinkan popup lalu coba lagi.','error')
}
function debtCanvasWrap(ctx,text,maxWidth){
const src=String(text||''),words=src.split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines.length?lines:['']
}
function buildCustomerDebt58Canvas(id){
const d=customerDebtShareData(id);if(!d)return null;const{c,sources,payments,debt,sourceTotal,paidTotal,store}=d,width=384,pad=22,right=width-pad,temp=document.createElement('canvas');temp.width=width;temp.height=7000;const ctx=temp.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,temp.width,temp.height);ctx.fillStyle='#111';ctx.textBaseline='top';let y=22;
const rule=(gap=8)=>{y+=gap;ctx.strokeStyle='#777';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(right,y);ctx.stroke();ctx.setLineDash([]);y+=gap};
const center=(text,font='700 15px Arial',gap=5)=>{ctx.font=font;ctx.textAlign='center';ctx.fillStyle='#111';debtCanvasWrap(ctx,text,width-pad*2).forEach(line=>{ctx.fillText(line,width/2,y);y+=parseInt(font.match(/(\d+)px/)?.[1]||14)+3});y+=gap};
const left=(text,font='400 13px Arial',indent=0,gap=2,color='#111')=>{ctx.font=font;ctx.textAlign='left';ctx.fillStyle=color;const x=pad+indent,max=right-x;debtCanvasWrap(ctx,text,max).forEach(line=>{ctx.fillText(line,x,y);y+=parseInt(font.match(/(\d+)px/)?.[1]||13)+4});y+=gap};
const pair=(label,value,bold=false)=>{ctx.font='400 12px Arial';ctx.textAlign='left';ctx.fillStyle='#555';ctx.fillText(label,pad,y);ctx.font=(bold?'800 ':'700 ')+'13px Arial';ctx.textAlign='right';ctx.fillStyle='#111';ctx.fillText(String(value),right,y);y+=19};
center(store,'900 19px Arial',2);if(db.settings.address)center(String(db.settings.address),'400 11px Arial',1);if(db.settings.phone)center(String(db.settings.phone),'400 11px Arial',3);center('TAGIHAN PIUTANG','900 16px Arial',1);rule(7);
pair('Pelanggan',c.name,true);if(c.phone)pair('WhatsApp',c.phone);pair('Sisa Piutang',rupiah(debt),true);pair('Jatuh Tempo',c.due?fmtDate(c.due):'-');rule(7);
center('RINCIAN TRANSAKSI','800 13px Arial',3);
if(!sources.length)left('Belum ada sumber transaksi yang tersimpan.','400 12px Arial',0,4,'#666');
sources.forEach((x,idx)=>{left(`${idx+1}. ${x.id}`,'800 13px Arial',0,0);left(fmtTime(x.date),'400 10px Arial',0,4,'#666');if(x.type==='sale'&&x.sale){const sale=x.sale;(sale.items||[]).forEach((it,i)=>{const p=getProduct(it.productId),name=`${i+1}) ${p?.name||'Produk'}${it.variant?' • '+it.variant:''}`;left(name,'700 12px Arial',8,0);const qty=Number(it.qty)||0,price=Number(it.price)||0,total=typeof cartItemLineTotal==='function'?cartItemLineTotal(it):qty*price;ctx.font='400 11px Arial';ctx.textAlign='left';ctx.fillStyle='#555';ctx.fillText(`${nominal(qty)} x ${rupiah(price)}`,pad+16,y);ctx.textAlign='right';ctx.fillStyle='#111';ctx.font='700 11px Arial';ctx.fillText(rupiah(total),right,y);y+=17;if(it.note)left(`Catatan: ${it.note}`,'400 10px Arial',16,1,'#666')});const totals=typeof receiptShareTotals==='function'?receiptShareTotals(sale):null;if(totals){if(totals.discount)pair('Diskon','-'+rupiah(totals.discount));if(totals.tax)pair('PPN','+'+rupiah(totals.tax));if(totals.paymentFee)pair('Biaya Bayar','+'+rupiah(totals.paymentFee))}pair('Total Transaksi',rupiah(Number(sale.total)||Number(x.amount)||0),true);left(`Pembayaran: ${salePaymentNameV264(sale)}`,'400 10px Arial',0,1,'#666');if(sale.note)left(`Catatan: ${sale.note}`,'400 10px Arial',0,1,'#666')}else{pair('Piutang Manual',rupiah(x.amount),true);if(x.note)left(`Catatan: ${x.note}`,'400 10px Arial',0,1,'#666')}rule(5)});
center('RIWAYAT CICILAN','800 13px Arial',3);if(payments.length){payments.forEach((x,i)=>{left(`${i+1}. ${fmtTime(x.date)} • ${x.method||'Tunai'}`,'700 11px Arial',0,0);pair('Bayar',rupiah(x.amount),true);left(Number(x.balanceAfter)>0?`Sisa setelah bayar: ${rupiah(x.balanceAfter)}`:'Lunas','400 10px Arial',0,2,'#666')})}else left('Belum ada cicilan tercatat.','400 11px Arial',0,2,'#666');rule(7);
center('RINGKASAN','800 13px Arial',3);pair('Total Tercatat',rupiah(sourceTotal));pair('Total Cicilan',rupiah(paidTotal));pair('SISA PIUTANG',rupiah(debt),true);if(c.due)pair('Jatuh Tempo',fmtDate(c.due));rule(7);center('Mohon melakukan pembayaran. Terima kasih.','400 11px Arial',2);center('www.inpos.id','400 10px Arial',0);
const h=Math.max(420,Math.ceil(y+22)),canvas=document.createElement('canvas');canvas.width=width;canvas.height=h;const out=canvas.getContext('2d');out.fillStyle='#fff';out.fillRect(0,0,width,h);out.drawImage(temp,0,0,width,h,0,0,width,h);return canvas
}
async function shareDebtWhatsAppPNG(id){
const d=customerDebtShareData(id);if(!d)return toast('Pelanggan tidak ditemukan.','error');const phone=normalizeMarketPhone(d.c.phone);if(!phone||phone.length<10)return toast('Nomor WhatsApp pelanggan belum diisi atau tidak valid.','error');const canvas=buildCustomerDebt58Canvas(id);if(!canvas)return toast('Gagal membuat nota tagihan.','error');const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat PNG.','error');const safe=String(d.c.name||'pelanggan').replace(/[^A-Za-z0-9._-]+/g,'-'),fileName=`tagihan-piutang-${safe}-58mm.png`;let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(e){}closeModal();
const shareText=`Tagihan piutang ${d.store} • ${d.c.name} • Sisa ${rupiah(d.debt)}${d.c.due?' • Jatuh tempo '+fmtDate(d.c.due):''}`;
if(file&&navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:`Tagihan ${d.c.name}`,text:shareText,files:[file]});return}catch(e){if(e?.name==='AbortError')return}}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1800);const msg=`Halo ${d.c.name}, nota tagihan piutang dari ${d.store} sudah dibuat. Sisa tagihan *${rupiah(d.debt)}*${d.c.due?` dan jatuh tempo ${fmtDate(d.c.due)}`:''}. Silakan lampirkan file PNG ${fileName} yang baru disimpan.`;const w=window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');if(!w)toast('PNG sudah dibuat. Buka WhatsApp dan lampirkan file tagihan yang tersimpan.');else toast('PNG 58 mm dibuat. Lampirkan file tersebut pada chat WhatsApp.')
}
function customerDebtSourceRows(customerId){
const sales=(db.sales||[]).filter(s=>Number(s.customerId)===Number(customerId)&&s.method==='Bon'&&!s.returned).map(s=>({type:'sale',id:s.id,date:s.date,amount:Number(s.total)||0,note:`${s.items?.length||0} produk`,sale:s}));
const manual=(db.debtEntries||[]).filter(x=>Number(x.customerId)===Number(customerId)).map(x=>({type:'manual',id:x.id,date:x.date,amount:Number(x.amount)||0,note:x.note||'Piutang manual'}));
return[...sales,...manual].sort((a,b)=>new Date(b.date)-new Date(a.date))
}
function inposDebtOutstandingV503(customerId){
const c=getCustomer(customerId),sources=customerDebtSourceRows(customerId).slice().sort((a,b)=>new Date(a.date)-new Date(b.date)),
amounts=new Map(sources.map(x=>[x.type+':'+String(x.id),Math.max(0,Number(x.amount)||0)])),
payments=customerDebtPayments(customerId).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
for(const p of payments){
const key=String(p.sourceType||'')+':'+String(p.sourceTransactionId||'');
if(amounts.has(key))amounts.set(key,Math.max(0,amounts.get(key)-Math.max(0,Number(p.amount)||0)));
}
let unmatched=payments.filter(p=>!amounts.has(String(p.sourceType||'')+':'+String(p.sourceTransactionId||''))).reduce((n,p)=>n+Math.max(0,Number(p.amount)||0),0);
for(const row of sources){const key=row.type+':'+String(row.id),paid=Math.min(amounts.get(key)||0,unmatched);amounts.set(key,Math.max(0,(amounts.get(key)||0)-paid));unmatched-=paid;}
let over=Math.max(0,[...amounts.values()].reduce((a,b)=>a+b,0)-Math.max(0,Number(c?.debt)||0));
for(const row of sources){if(over<=0)break;const key=row.type+':'+String(row.id),n=Math.min(amounts.get(key)||0,over);amounts.set(key,Math.max(0,(amounts.get(key)||0)-n));over-=n;}
return{amounts,unmatchedBalance:Math.max(0,(Number(c?.debt)||0)-[...amounts.values()].reduce((a,b)=>a+b,0))};
}
function payCustomerDebtTransactionV503(customerId,sourceType,sourceId){
const c=getCustomer(customerId);if(!c)return toast('Pelanggan tidak ditemukan.','error');
const type=sourceType==='manual'?'manual':'sale',row=customerDebtSourceRows(customerId).find(x=>x.type===type&&String(x.id)===String(sourceId));
if(!row)return toast('Transaksi piutang tidak ditemukan.','error');
const ledger=inposDebtOutstandingV503(customerId),balance=Math.min(Math.max(0,Number(c.debt)||0),ledger.amounts.get(type+':'+String(sourceId))||0);
if(balance<=0)return toast('Piutang transaksi ini sudah lunas.');
showModal('Bayar Piutang Transaksi',String(row.id),`<div class="debt-tx-pay-v503"><div class="pay-total-box"><span>Sisa Piutang Transaksi</span><strong>${rupiah(balance)}</strong></div><div class="debt-pay-quick"><button type="button" onclick="setDebtPayQuick('debtTxAmountV503',${Math.max(1,Math.round(balance/2))})">50%</button><button type="button" onclick="setDebtPayQuick('debtTxAmountV503',${balance})">Bayar Lunas</button></div><div class="form-grid"><div class="field"><label>Nominal Pembayaran</label><input class="nominal-input" id="debtTxAmountV503" type="text" inputmode="numeric" value="${nominal(balance)}"></div><div class="field"><label>Metode</label><select id="debtTxMethodV503"><option>Tunai</option><option>QRIS</option><option>Transfer</option></select></div></div><small>Hanya untuk transaksi ${esc(row.id)}.</small></div>`,[
{label:'Batal',close:true},{label:'Simpan Pembayaran',primary:true,fn:()=>{
const fresh=getCustomer(customerId),freshLedger=inposDebtOutstandingV503(customerId),available=Math.min(Math.max(0,Number(fresh?.debt)||0),freshLedger.amounts.get(type+':'+String(sourceId))||0),raw=parseNominal(document.getElementById('debtTxAmountV503')?.value||'0'),n=Math.max(0,Number(raw)||0);
if(n<=0)return toast('Isi nominal pembayaran.','error');
if(n>available)return toast('Nominal melebihi sisa piutang transaksi.','error');
const before=Math.max(0,Number(fresh.debt)||0),after=Math.max(0,before-n),date=new Date().toISOString(),method=document.getElementById('debtTxMethodV503')?.value||'Tunai',cashId=uid('CASH');
fresh.debt=after;if(after<=0)fresh.due=null;
if(!Array.isArray(db.cashEntries))db.cashEntries=[];
db.cashEntries.unshift({id:cashId,date,direction:'in',category:'Pelunasan Bon',note:`Piutang ${row.id} - ${fresh.name}`,method,amount:n,source:'debt',sourceId:String(fresh.id),sourceTransactionId:String(row.id),sourceType:type});
if(!Array.isArray(db.debtPayments))db.debtPayments=[];
db.debtPayments.unshift({id:uid('DPAY'),date,customerId:Number(fresh.id),sourceType:type,sourceTransactionId:String(row.id),amount:n,method,balanceBefore:before,balanceAfter:after,sourceRemainingAfter:available-n,cashEntryId:cashId,note:available-n<=0?'Pelunasan transaksi':'Cicilan transaksi '+row.id});
save();renderAll();closeModal();toast(available-n<=0?'Transaksi piutang lunas.':'Cicilan transaksi disimpan.');
setTimeout(()=>openCustomerDebtDetail(fresh.id),80)
}}],true)
}
function openCustomerDebtDetail(id){
const c=getCustomer(id);if(!c)return toast('Pelanggan tidak ditemukan.','error');const payments=customerDebtPayments(id),sources=customerDebtSourceRows(id),paid=sum(payments,x=>Number(x.amount)||0);
const outstanding=inposDebtOutstandingV503(id);const sourceHtml=sources.length?sources.map(x=>{const remaining=outstanding.amounts.get(x.type+':'+String(x.id))||0;return`<div class="debt-detail-row debt-source-v503"><span class="debt-detail-row-main"><b>${esc(x.id)}</b><small>${fmtTime(x.date)} • ${esc(x.note)}</small>${x.type==='sale'?`<button class="debt-tx-link-v503" type="button" onclick="closeModal();setTimeout(()=>openSaleDetail('${esc(x.id)}'),70)">Lihat transaksi ›</button>`:''}</span><span class="debt-detail-row-value"><b>${rupiah(remaining)}</b><small>${remaining>0?'Sisa tagihan':'Lunas'}</small></span>${remaining>0?`<button type="button" class="debt-tx-action-v503" aria-label="Bayar piutang transaksi ${esc(x.id)}" title="Bayar transaksi" onclick="payCustomerDebtTransactionV503(${Number(c.id)},'${x.type}','${esc(String(x.id))}')"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M14 15h4M12 2v5m-2-2 2 2 2-2"/></svg></button>`:''}</div>`}).join(''):'<div class="muted">Belum ada sumber transaksi yang tersimpan.</div>';
const payHtml=payments.length?payments.map(x=>`<div class="debt-detail-row"><span class="debt-detail-row-main"><b>${esc(x.note||'Cicilan piutang')}</b><small>${fmtTime(x.date)} • ${esc(x.method||'Tunai')}</small></span><span class="debt-detail-row-value"><b>${rupiah(x.amount)}</b><small>${x.balanceAfter>0?'Sisa '+rupiah(x.balanceAfter):x.legacy?'Riwayat lama':'Lunas'}</small></span></div>`).join(''):'<div class="muted">Belum ada riwayat cicilan.</div>';
showModal('Detail Piutang',c.name,`<div class="debt-detail-summary"><div class="debt-detail-stat danger"><span>Sisa Piutang</span><b>${rupiah(c.debt||0)}</b></div><div class="debt-detail-stat"><span>Total Cicilan</span><b>${rupiah(paid)}</b></div><div class="debt-detail-stat"><span>Jatuh Tempo</span><b>${c.due?fmtDate(c.due):'-'}</b></div></div><div class="debt-detail-section"><div class="debt-detail-section-head"><b>Detail Transaksi</b><small>${sources.length} data</small></div><div class="debt-detail-list">${sourceHtml}</div></div><div class="debt-detail-section"><div class="debt-detail-section-head"><b>Riwayat Cicilan</b><small>${payments.length} pembayaran</small></div><div class="debt-detail-list">${payHtml}</div></div>`,[{label:'WA Tagih',fn:()=>waDebt(c.id)},{label:'Tutup',close:true}],true)
}
function openDebtModal(){
if(!(db.customers||[]).length)return toast('Tambahkan pelanggan terlebih dahulu.','error');
showModal('Catat Piutang Pelanggan','Tambahkan piutang di luar transaksi kasir.',`<div class="form-grid"><div class="field full"><label>Pelanggan</label><select id="manualDebtCustomer">${db.customers.map(c=>`<option value="${c.id}">${esc(c.name)}${c.phone?' • '+esc(c.phone):''}</option>`).join('')}</select></div><div class="field"><label>Nominal Piutang</label><input id="manualDebtAmount" class="nominal-input" type="text" inputmode="numeric" value="0"></div><div class="field"><label>Jatuh Tempo</label><input id="manualDebtDue" type="date" value="${futureDay(7)}"></div><div class="field full"><label>Catatan</label><input id="manualDebtNote" type="text" maxlength="80" placeholder="Contoh: Bon tambahan"></div></div>`,[{label:'Batal',close:true},{label:'Simpan Piutang',primary:true,fn:()=>{const c=getCustomer(Number(document.getElementById('manualDebtCustomer')?.value)),amount=Math.max(0,parseNominal(document.getElementById('manualDebtAmount')?.value));if(!c)return toast('Pelanggan tidak ditemukan.','error');if(amount<=0)return toast('Nominal piutang harus lebih dari 0.','error');c.debt=Math.max(0,Number(c.debt)||0)+amount;c.due=document.getElementById('manualDebtDue')?.value||c.due||null;if(!Array.isArray(db.debtEntries))db.debtEntries=[];db.debtEntries.unshift({id:uid('BON'),date:new Date().toISOString(),customerId:Number(c.id),amount,note:document.getElementById('manualDebtNote')?.value.trim()||'Piutang manual',due:c.due});save();renderAll();closeModal();toast('Piutang pelanggan disimpan.')}}]);document.getElementById('modalBox')?.classList.add('customer-debt-entry-modal');document.getElementById('overlay')?.classList.add('customer-debt-entry-overlay');setTimeout(()=>document.getElementById('manualDebtAmount')?.focus(),70)
}
function purchaseById(id){return(db.purchases||[]).find(p=>String(p.id)===String(id))||null}
let activePurchaseDetailId=null;
function openPurchaseDetail(id){
const p=purchaseById(id);
if(!p)return toast('Data pembelian tidak ditemukan.','error');
activePurchaseDetailId=String(id);
go('purchase-detail');
}
function renderPurchaseDetailPage(){
const body=document.getElementById('purchaseDetailMobileBody');if(!body)return;
const p=purchaseById(activePurchaseDetailId);if(!p){body.innerHTML='<div class="sale-detail-card"><div class="sale-detail-note">Data pembelian tidak ditemukan.</div></div>';return}
const supplier=getSupplier(p.supplierId),isDraft=purchaseIsDraft(p),subtotal=Math.max(0,Number(p.subtotal??sum(p.lines||[],x=>Number(x.subtotal)||0))||0),tax=Math.max(0,Number(p.tax)||0),total=Math.max(0,Number(p.total)||0),paid=isDraft?0:Math.max(0,Number(p.paid)||0),remaining=isDraft?0:Math.max(0,total-paid),payments=isDraft?[]:supplierDebtPaymentHistory(p),lines=Array.isArray(p.lines)?p.lines:[];
const toolbarId=document.getElementById('purchaseDetailToolbarId'),toolbarDate=document.getElementById('purchaseDetailToolbarDate');if(toolbarId)toolbarId.textContent=String(p.id||'Pembelian');if(toolbarDate)toolbarDate.textContent=fmtTime(p.updatedAt||p.date);
const qty=lines.length?sum(lines,x=>Math.max(0,Number(x.qty)||0)):Math.max(0,Number(p.items)||0),method=String(p.paymentMethod||p.lastPaymentMethod||'-'),status=isDraft?'Draf':remaining>0?'Ada Hutang':'Lunas';
const itemsHtml=lines.length?lines.map((x,i)=>{const prod=getProduct(Number(x.productId)),name=x.name||prod?.name||'Produk',unit=x.unit||prod?.unit||'pcs',q=Math.max(0,Number(x.qty)||0),cost=Math.max(0,Number(x.cost)||0),lineSubtotal=Math.max(0,Number(x.subtotal??(q*cost))||0);return`<tr><td>${i+1}</td><td><div class="sale-detail-item-product">${esc(name)}</div><span class="sale-detail-item-sub">${rupiah(cost)} / ${esc(unit)}</span></td><td class="sale-detail-item-qty">${q.toLocaleString('id-ID',{maximumFractionDigits:2})}</td><td class="sale-detail-item-total">${rupiah(lineSubtotal)}</td></tr>`}).join(''):`<tr><td colspan="4"><div class="purchase-detail-empty">${isDraft?'Belum ada produk pada draf ini.':'Detail produk belum tersedia pada data pembelian lama.'}</div></td></tr>`;
const paymentHtml=isDraft?'<div class="purchase-detail-empty">Draf belum membuat arus kas atau hutang supplier.</div>':payments.length?payments.map(x=>`<div class="purchase-detail-payment-row"><div><b>${esc(x.note||'Pembayaran')}</b><small>${fmtTime(x.date)} • ${esc(x.method||'-')}</small></div><div><b>${rupiah(x.amount||0)}</b><small>${Number(x.balanceAfter)>0?'Sisa '+rupiah(x.balanceAfter):x.legacy?'Pembayaran awal':'Lunas'}</small></div></div>`).join(''):'<div class="purchase-detail-empty">Belum ada riwayat pembayaran tambahan.</div>';
body.innerHTML=`<div class="sale-detail-card"><div class="sale-detail-info"><div class="sale-detail-info-row"><small>Supplier</small><b>${esc(supplier?.name||'Supplier')}</b></div><div class="sale-detail-info-row"><small>Metode</small><b>${esc(method)}</b></div><div class="sale-detail-info-row"><small>Total Qty</small><b>${qty.toLocaleString('id-ID',{maximumFractionDigits:2})}</b></div><div class="sale-detail-info-row"><small>Status Barang</small><b>${isDraft?'Belum Masuk Stok':'Barang Masuk'}</b></div></div></div><div class="sale-detail-card"><div class="sale-detail-items"><table class="sale-detail-item-table purchase-detail-item-table"><thead><tr><th>NO</th><th>PRODUK</th><th>QTY</th><th>SUBTOTAL</th></tr></thead><tbody>${itemsHtml}</tbody></table></div></div><div class="sale-detail-card"><div class="sale-detail-section-title">Pembayaran</div><div class="sale-detail-totals"><div class="sale-detail-total-row"><span>Subtotal Produk</span><b>${rupiah(subtotal)}</b></div>${tax?`<div class="sale-detail-total-row"><span>PPN ${Number(p.taxRate||0)}%</span><b>+${rupiah(tax)}</b></div>`:''}<div class="sale-detail-total-row"><span>Total Pembelian</span><b>${rupiah(total)}</b></div>${isDraft?`<div class="sale-detail-total-row"><span>Rencana Dibayar</span><b>${rupiah(Math.max(0,Number(p.paid)||0))}</b></div><div class="sale-detail-total-row grand"><span>Status</span><b>Draf</b></div>`:`<div class="sale-detail-total-row"><span>Sudah Dibayar</span><b>${rupiah(paid)}</b></div><div class="sale-detail-total-row"><span>Metode Pembayaran</span><b>${esc(method)}</b></div><div class="sale-detail-total-row grand ${remaining>0?'purchase-debt-total':''}"><span>${remaining>0?'Sisa Hutang':'Status Pembayaran'}</span><b>${remaining>0?rupiah(remaining):'Lunas'}</b></div>`}</div></div><div class="sale-detail-card"><div class="sale-detail-section-title">${isDraft?'Status Draf':'Riwayat Pembayaran'}</div><div class="purchase-detail-payment-list">${paymentHtml}</div></div>${p.note?`<div class="sale-detail-card"><div class="sale-detail-note"><small>CATATAN PEMBELIAN</small>${esc(p.note)}</div></div>`:''}<div class="sale-detail-card"><div class="sale-detail-actions purchase-detail-actions">${isDraft?`<button class="btn btn-primary" type="button" onclick="editPurchaseDraft('${esc(String(p.id))}')">Lanjutkan Draf</button>`:remaining>0?`<button class="btn btn-primary" type="button" onclick="paySupplierDebt('${esc(String(p.id))}')">Bayar / Cicil Hutang</button>`:'<button class="btn" type="button" disabled>✓ Pembelian Lunas</button>'}</div></div>`
}
function paySupplierDebt(id){
const p=purchaseById(id);if(!p)return toast('Data pembelian tidak ditemukan.','error');if(purchaseIsDraft(p))return toast('Draf belum menjadi hutang supplier. Selesaikan pembelian terlebih dahulu.','error');const supplier=getSupplier(p.supplierId),remaining=Math.max(0,Number(p.total||0)-Number(p.paid||0));if(remaining<=0)return toast('Hutang supplier sudah lunas.');
showModal('Bayar / Cicil Hutang',supplier?.name||'Supplier',`<div class="pay-total-box"><span>Sisa Hutang</span><strong>${rupiah(remaining)}</strong></div><div class="debt-pay-quick"><button type="button" onclick="setDebtPayQuick('supplierDebtPay',${Math.max(1,Math.round(remaining/2))})">50% • ${rupiah(Math.max(1,Math.round(remaining/2)))}</button><button type="button" onclick="setDebtPayQuick('supplierDebtPay',${remaining})">Bayar Lunas</button></div><div class="form-grid"><div class="field"><label>Nominal Cicilan</label><input id="supplierDebtPay" class="nominal-input" type="text" inputmode="numeric" value="${nominal(remaining)}"></div><div class="field"><label>Metode</label><select id="supplierDebtMethod"><option>Tunai</option><option>Transfer</option><option>QRIS</option></select></div></div><div class="muted" style="margin-top:8px">Pembayaran untuk ${esc(p.id)}.</div>`,[{label:'Batal',close:true},{label:'Simpan Cicilan',primary:true,fn:()=>{const raw=parseNominal(document.getElementById('supplierDebtPay').value),n=Math.max(0,Math.min(remaining,raw));if(n<=0)return toast('Nominal cicilan harus lebih dari 0.','error');const before=Math.max(0,Number(p.total||0)-Number(p.paid||0)),after=Math.max(0,before-n),date=new Date().toISOString(),method=document.getElementById('supplierDebtMethod')?.value||'Tunai',cashId=uid('CASH');p.paid=Math.min(Number(p.total)||0,(Number(p.paid)||0)+n);p.lastPaymentAt=date;p.lastPaymentMethod=method;if(!Array.isArray(db.supplierDebtPayments))db.supplierDebtPayments=[];db.supplierDebtPayments.unshift({id:uid('SPAY'),date,purchaseId:String(p.id),supplierId:Number(p.supplierId)||null,amount:n,method,balanceBefore:before,balanceAfter:after,cashEntryId:cashId,note:after<=0?'Pelunasan hutang':'Cicilan hutang'});if(!Array.isArray(db.cashEntries))db.cashEntries=[];db.cashEntries.unshift({id:cashId,date,direction:'out',category:'Pembayaran Hutang Supplier',note:`Cicilan hutang ${p.id} - ${supplier?.name||'Supplier'}`,method,amount:n,source:'supplier-debt',sourceId:String(p.id)});save();renderAll();closeModal();if(document.getElementById('screen-purchase-detail')?.classList.contains('active'))renderPurchaseDetailPage();toast(after<=0?'Hutang supplier sudah lunas.':'Cicilan hutang supplier disimpan.')}}])
}
function openSupplierDebtDetail(id){
const p=purchaseById(id);if(!p)return toast('Data pembelian tidak ditemukan.','error');const supplier=getSupplier(p.supplierId),remaining=Math.max(0,Number(p.total||0)-Number(p.paid||0)),payments=supplierDebtPaymentHistory(p);
const payHtml=payments.length?payments.map(x=>`<div class="debt-detail-row"><span class="debt-detail-row-main"><b>${esc(x.note||'Cicilan hutang')}</b><small>${fmtTime(x.date)} • ${esc(x.method||'-')}</small></span><span class="debt-detail-row-value"><b>${rupiah(x.amount)}</b><small>${x.balanceAfter>0?'Sisa '+rupiah(x.balanceAfter):x.legacy?'Pembayaran awal':'Lunas'}</small></span></div>`).join(''):'<div class="muted">Belum ada riwayat pembayaran.</div>';
showModal('Detail Hutang Supplier',p.id,`<div class="debt-detail-summary"><div class="debt-detail-stat"><span>Total Pembelian</span><b>${rupiah(p.total||0)}</b></div><div class="debt-detail-stat"><span>Sudah Dibayar</span><b>${rupiah(p.paid||0)}</b></div><div class="debt-detail-stat danger"><span>Sisa Hutang</span><b>${rupiah(remaining)}</b></div></div><div class="debt-detail-section"><div class="debt-detail-section-head"><b>Detail Transaksi Pembelian</b><small>${fmtDate(p.date)}</small></div><div class="debt-detail-list"><div class="debt-detail-row"><span class="debt-detail-row-main"><b>${esc(supplier?.name||'Supplier')}</b><small>${esc(p.id)} • ${Math.max(1,Number(p.items)||1)} item</small></span><span class="debt-detail-row-value"><b>${rupiah(p.total||0)}</b><small>Total pembelian</small></span></div></div></div><div class="debt-detail-section"><div class="debt-detail-section-head"><b>Riwayat Cicilan</b><small>${payments.length} pembayaran</small></div><div class="debt-detail-list">${payHtml}</div></div>`,[{label:'Tutup',close:true},{label:'Bayar / Cicil',primary:true,fn:()=>{closeModal();setTimeout(()=>paySupplierDebt(p.id),70)}}],true)
}
function productHasExpiry(p){return!!(p&&p.hasExpiry&&p.expiry)}
function productExpiryDays(p){if(!productHasExpiry(p))return null;const parts=String(p.expiry).split('-').map(Number);if(parts.length!==3||parts.some(n=>!Number.isFinite(n)))return null;const[y,m,d]=parts,now=new Date(),expiryDay=Date.UTC(y,m-1,d),todayDay=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((expiryDay-todayDay)/864e5)}
// INPOS v707: tindak lanjut produk menipis dan kadaluarsa.
function stockLowIgnoredV707(p){
  const rec=db.settings?.stockLowIgnoredV707?.[String(p?.id)];
  return !!p&&!!rec&&Number(rec.stock)===Number(p.stock)&&Number(rec.min)===Number(p.min);
}
function stockNeedsRestockV707(p){return !!p&&!p.noStock&&p.productKind!=='service'&&Number(p.stock)<=Number(p.min)&&!stockLowIgnoredV707(p)}
function stockExpiryAttentionV707(p){const days=productExpiryDays(p);return !!p&&!p.noStock&&Number(p.stock)>0&&days!==null&&days<=30}
function stockAlertActionsV707(p){
  const low=stockNeedsRestockV707(p),expiry=stockExpiryAttentionV707(p);if(!low&&!expiry)return '';
  return `<div class="stock-alert-actions-v707" role="group" aria-label="Tindakan persediaan ${esc(p.name)}">${low?`<button type="button" class="stock-alert-action-v707 purchase" aria-label="Pembelian ${esc(p.name)}" title="Pembelian" onclick="stockAlertPurchaseV707(${Number(p.id)},event)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v15H4zM8 9h8M12 5v9M8 17h8"/></svg><span>Pembelian</span></button><button type="button" class="stock-alert-action-v707 ignore" aria-label="Abaikan stok menipis ${esc(p.name)}" title="Abaikan peringatan" onclick="stockAlertIgnoreV707(${Number(p.id)},event)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M10 5a9 9 0 0 1 10 7s-.9 2-3.2 3.8M6.4 6.5C3.8 8.2 2 12 2 12s3.6 7 10 7c1.3 0 2.6-.3 3.7-.8M9.8 10a3 3 0 0 0 4.1 4"/></svg><span>Abaikan</span></button>`:''}${expiry?`<button type="button" class="stock-alert-action-v707 waste" aria-label="Buang produk kadaluarsa ${esc(p.name)}" title="Buang ke Sampah Produk" onclick="stockAlertWastePromptV707(${Number(p.id)},event)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg><span>Buang</span></button>`:''}</div>`;
}
function stockAlertPurchaseV707(id,event){
 event?.preventDefault?.();event?.stopPropagation?.();
 const p=getProduct(Number(id));if(!p)return toast('Produk tidak ditemukan.','error');
 if(!employeeCan('purchases'))return toast('Tidak memiliki akses Pembelian.','error');
 if(p.noStock||p.purchaseEnabled===false)return toast('Produk ini tidak tersedia untuk Pembelian.','error');
 if(!Array.isArray(db.suppliers)||!db.suppliers.length){go('purchases');return toast('Tambahkan Supplier sebelum membuat Pembelian.','error')}
 try{openPurchaseProductPage();if(!document.getElementById('screen-purchase-form')?.classList.contains('active'))return;
 purchaseFormAddProduct(p.id);toast('Produk masuk daftar Pembelian.');
 }catch(err){console.error('INPOS v707 purchase alert',err);toast('Gagal membuka Pembelian.','error')}
}
function stockAlertIgnoreV707(id,event){
 event?.preventDefault?.();event?.stopPropagation?.();
 if(!employeeCan('stock'))return toast('Tidak memiliki akses Produk & Stok.','error');
 const p=getProduct(Number(id));if(!p||!stockNeedsRestockV707(p))return;
 db.settings=db.settings||{};db.settings.stockLowIgnoredV707=db.settings.stockLowIgnoredV707||{};
 const key=String(p.id),prev=db.settings.stockLowIgnoredV707[key];
 db.settings.stockLowIgnoredV707[key]={stock:Number(p.stock),min:Number(p.min),at:new Date().toISOString()};
 try{if(!save())throw new Error('Storage penuh')}catch(e){if(prev)db.settings.stockLowIgnoredV707[key]=prev;else delete db.settings.stockLowIgnoredV707[key];return toast('Gagal menyimpan peringatan.','error')}
 renderStock();renderDashboard();toast('Peringatan diabaikan hingga stok berubah.');
}
function stockAlertWastePromptV707(id,event){
 event?.preventDefault?.();event?.stopPropagation?.();
 if(!employeeCan('stock'))return toast('Tidak memiliki akses Produk & Stok.','error');
 const p=getProduct(Number(id));if(!p||!stockExpiryAttentionV707(p))return toast('Produk tidak tersedia pada daftar kadaluarsa.','error');
 const avail=Number(p.stock);if(!Number.isFinite(avail)||avail<=0)return toast('Stok sudah habis.','error');
 const expired=productExpiryDays(p)<0;
 const html=`<div class="stock-waste-confirm-v707"><p>${expired?'Produk sudah kadaluarsa.':'Produk mendekati kadaluarsa.'} Jumlah yang dibuang akan <b>mengurangi stok</b> dan dicatat ke <b>Menu Sampah</b>.</p><div class="stock-waste-info-v707"><span>Produk</span><strong>${esc(p.name)}</strong><span>Stok tersedia</span><strong>${stockQtyTextV227(avail)} ${esc(p.unit||'pcs')}</strong><span>Expired</span><strong>${esc(fmtDate(p.expiry))}</strong></div><label for="stockWasteQtyV707">Qty dibuang (${esc(p.unit||'pcs')})</label><input id="stockWasteQtyV707" type="number" inputmode="decimal" min="0.001" max="${avail}" step="any" value="1" aria-label="Jumlah produk dibuang"/><small id="stockWasteErrorV707" class="stock-waste-error-v707" aria-live="polite"></small></div>`;
 showModal('Buang ke Sampah',p.name,html,[{label:'Batal',close:true},{label:'Konfirmasi Buang',danger:true,fn:()=>stockAlertWasteConfirmV707(id)}]);
 setTimeout(()=>{const x=document.getElementById('stockWasteQtyV707');x?.focus();x?.select()},35);
}
let stockWasteBusyV707=false;
function stockAlertWasteConfirmV707(id){
 if(stockWasteBusyV707)return;
 const input=document.getElementById('stockWasteQtyV707'),err=document.getElementById('stockWasteErrorV707');
 const p=getProduct(Number(id)),qty=Number(input?.value),available=Number(p?.stock);
 const invalid=msg=>{if(err)err.textContent=msg;else toast(msg,'error')};
 if(!employeeCan('stock'))return invalid('Tidak memiliki akses Produk & Stok.');
 if(!p||!stockExpiryAttentionV707(p))return invalid('Produk tidak tersedia. Tutup dan buka kembali.');
 if(!input||!input.value.trim()||!Number.isFinite(qty)||qty<=0||Math.abs(qty*1000-Math.round(qty*1000))>1e-6)return invalid('Isi qty lebih dari 0, maksimal 3 angka desimal.');
 if(!Number.isFinite(available)||qty>available)return invalid('Qty melebihi stok tersedia.');
 stockWasteBusyV707=true;
 const before=available,logBefore=Array.isArray(db.stockWasteV707)?[...db.stockWasteV707]:[];
 const entry={id:'SW-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),productId:p.id,productName:String(p.name),category:String(p.category||'Umum'),qty,unit:String(p.unit||'pcs'),cost:Number(p.cost)||0,expiry:p.expiry,at:new Date().toISOString(),by:String(db.settings?.cashier||'Kasir'),reason:'Kadaluarsa'};
 try{
  p.stock=Math.max(0,Math.round((before-qty)*1000)/1000);
  if(!Array.isArray(db.stockWasteV707))db.stockWasteV707=[];
  db.stockWasteV707.push(entry);
  if(!save())throw new Error('Penyimpanan gagal');
  closeModal();renderStock();renderDashboard();toast('Qty dibuang dan tercatat di Menu Sampah.');
 }catch(e){p.stock=before;db.stockWasteV707=logBefore;invalid('Gagal menyimpan. Stok tidak diubah.')}finally{stockWasteBusyV707=false}
}
function stockWasteCategoryV709(row){
 const saved=String(row?.category||'').trim();if(saved)return saved;
 const p=(Array.isArray(db.products)?db.products:[]).find(x=>x&&String(x.id)===String(row?.productId));
 return String(p?.category||'Tanpa Kategori').trim()||'Tanpa Kategori';
}
function renderStockWasteV707(){
 const list=document.getElementById('stockWasteListV707');if(!list)return;
 const all=Array.isArray(db.stockWasteV707)?db.stockWasteV707:[];
 const searchEl=document.getElementById('stockWasteSearchV709'),catEl=document.getElementById('stockWasteCategoryV709');
 const q=String(searchEl?.value||'').trim().toLocaleLowerCase('id-ID'),selected=String(catEl?.value||'');
 const categories=[...new Set(all.map(stockWasteCategoryV709))].sort((a,b)=>a.localeCompare(b,'id'));
 if(catEl){
  // Keep selection on refresh, including when an unrelated record is removed.
  const nextOptions='<option value="">Semua Kategori</option>'+categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if(catEl.innerHTML!==nextOptions)catEl.innerHTML=nextOptions;
  catEl.value=categories.includes(selected)?selected:'';
 }
 const category=catEl?.value||'';
 const filtered=all.filter(r=>{
  const c=stockWasteCategoryV709(r);
  const matches=!q||[r.productName,r.by,r.unit,r.reason,c].some(v=>String(v||'').toLocaleLowerCase('id-ID').includes(q));
  return matches&&(!category||c===category);
 }).slice().reverse();
 const count=document.getElementById('stockWasteCountV707');
 if(count)count.textContent=filtered.length===all.length?`${all.length} catatan`:`${filtered.length} dari ${all.length} catatan`;
 const del=document.getElementById('stockWasteDeleteAllV709');if(del)del.disabled=!all.length;
 const info=document.getElementById('stockWasteQtyInfoV709');
 if(info)info.textContent=all.length?'Stok tidak berubah saat riwayat dihapus':'Belum ada barang yang dibuang';
 if(!filtered.length){
  list.innerHTML=`<div class="stock-waste-empty-v709"><span aria-hidden="true">${all.length?'⌕':'▤'}</span><b>${all.length?'Tidak ada hasil':'Belum ada riwayat sampah'}</b><small>${all.length?'Coba kata kunci atau kategori lain.':'Barang yang dibuang akan tercatat di sini.'}</small></div>`;
  return;
 }
 list.innerHTML=filtered.map(r=>{
  const category=stockWasteCategoryV709(r);
  const date=new Date(r.at);
  const dateText=Number.isFinite(date.getTime())?date.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
  return `<article class="stock-waste-row-v707 stock-waste-record-v709">
   <div class="stock-waste-row-copy-v707"><b>${esc(r.productName||'Produk')}</b><div class="stock-waste-record-info-v709"><span>${esc(category)}</span><span>${esc(dateText)}</span></div><small>${esc(r.by||'Petugas tidak diketahui')}${r.expiry?' • Exp. '+esc(fmtDate(r.expiry)):''}</small></div>
   <div class="stock-waste-quantity-v709"><strong>−${stockQtyTextV227(r.qty)}</strong><small>${esc(r.unit||'pcs')}</small></div>
  </article>`;
 }).join('');
}
let stockWasteClearBusyV709=false;
function openStockWasteClearV709(){
 if(!employeeCan('stock'))return toast('Tidak memiliki akses Produk & Stok.','error');
 const all=Array.isArray(db.stockWasteV707)?db.stockWasteV707:[];
 if(!all.length)return toast('Riwayat sampah masih kosong.');
 const owners=(Array.isArray(db.employees)?db.employees:[]).filter(e=>e&&e.active!==false&&String(e.role||'').toLowerCase()==='owner'&&/^\d{4,8}$/.test(String(e.pin||'')));
 if(!owners.length)return toast('PIN Owner aktif belum tersedia.','error');
 const html=`<div class="stock-waste-pin-v709"><div class="stock-waste-warning-v709"><b>Hapus ${all.length} catatan Sampah Produk?</b><span>Riwayat akan hilang permanen. Stok dan produk tidak berubah.</span></div><label for="stockWasteDeletePinV709">Konfirmasi PIN Owner</label><input id="stockWasteDeletePinV709" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="Masukkan PIN" onkeydown="if(event.key==='Enter'){event.preventDefault();stockWasteClearConfirmV709()}"/><small id="stockWasteDeleteErrorV709" aria-live="polite"></small></div>`;
 showModal('Hapus Sampah','Verifikasi PIN Owner',html,[{label:'Batal',close:true},{label:'Hapus Riwayat',danger:true,fn:stockWasteClearConfirmV709}]);
 setTimeout(()=>document.getElementById('stockWasteDeletePinV709')?.focus({preventScroll:true}),40);
}
function stockWasteClearConfirmV709(){
 if(stockWasteClearBusyV709)return;
 const input=document.getElementById('stockWasteDeletePinV709'),err=document.getElementById('stockWasteDeleteErrorV709');
 const fail=msg=>{if(err)err.textContent=msg;else toast(msg,'error');input?.focus({preventScroll:true})};
 if(!employeeCan('stock'))return fail('Akses Produk & Stok diperlukan.');
 const pin=String(input?.value||'').trim();
 if(!/^\d{4,8}$/.test(pin))return fail('Masukkan PIN Owner yang benar.');
 const owners=(Array.isArray(db.employees)?db.employees:[]).filter(e=>e&&e.active!==false&&String(e.role||'').toLowerCase()==='owner');
 if(!owners.some(e=>String(e.pin||'')===pin)){
  if(input)input.value='';return fail('PIN Owner tidak sesuai. Riwayat tidak dihapus.');
 }
 const existing=Array.isArray(db.stockWasteV707)?db.stockWasteV707:null;
 if(!existing||!existing.length)return fail('Riwayat sudah kosong.');
 stockWasteClearBusyV709=true;
 try{
  db.stockWasteV707=[];
  if(!save())throw new Error('save gagal');
  closeModal();
  if(document.getElementById('stockWasteSearchV709'))document.getElementById('stockWasteSearchV709').value='';
  if(document.getElementById('stockWasteCategoryV709'))document.getElementById('stockWasteCategoryV709').value='';
  renderStockWasteV707();
  toast('Riwayat Sampah Produk berhasil dihapus.');
 }catch(error){db.stockWasteV707=existing;fail('Gagal menyimpan. Riwayat tetap tersedia.')}
 finally{stockWasteClearBusyV709=false}
}
function openStockWasteV707(){
 if(!employeeCan('stock'))return toast('Tidak memiliki akses Produk & Stok.','error');
 go('stock-waste');renderStockWasteV707();
}
function renderStock(){
const catEl=document.getElementById('stockCategoryFilter');
const selectedCat=catEl?.value||'';
if(catEl){catEl.innerHTML='<option value="">Semua kategori</option>'+categoryNames().map(c=>`<option value="${esc(c)}" ${c===selectedCat?'selected':''}>${esc(c)}</option>`).join('')}
const mobileMode=true,marketActive=optionalFeatureEnabled('marketOnline'),skuOn=skuFeatureEnabled();
const marketRows=(db.products||[]).filter(p=>p&&typeof p==='object'),allMarketOnline=marketRows.length>0&&marketRows.every(marketProductOnlineEnabled);
['stockGlobalOnlineDesktop','stockGlobalOnlineMobile'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.hidden=!marketActive;el.classList.toggle('active',allMarketOnline);el.classList.toggle('off',!allMarketOnline);el.setAttribute('aria-pressed',String(allMarketOnline));el.setAttribute('aria-label',allMarketOnline?'Set Offline Global':'Set Online Global');el.title=allMarketOnline?'Set Offline Global':'Set Online Global'});
document.querySelector('#screen-stock .stock-mobile-tools')?.classList.toggle('has-market-online',marketActive);
const stockSearch=document.getElementById('stockSearch'),stockMobileSearch=document.getElementById('stockMobileSearch');if(stockSearch)stockSearch.placeholder=skuOn?'Cari nama / SKU / scan barcode langsung...':'Cari nama / scan barcode langsung...';if(stockMobileSearch)stockMobileSearch.placeholder=skuOn?'Cari nama / SKU / barcode...':'Cari nama / barcode...';
const qSource=mobileMode?(stockMobileSearch?.value||''):(stockSearch?.value||'');
let q=qSource.toLowerCase(),f=document.getElementById('stockFilter')?.value||'',ef=document.getElementById('stockExpiryFilter')?.value||'',cat=document.getElementById('stockCategoryFilter')?.value||'';
const mobileFilterCount=[cat,f,ef].filter(Boolean).length;
['stockMobileFilterCount','stockMobileFilterCount2'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=mobileFilterCount;el.hidden=!mobileFilterCount}});
let ps=sortProductsNatural(db.products.filter(p=>{const has=productHasExpiry(p),days=productExpiryDays(p);return(!q||p.name.toLowerCase().includes(q)||String(p.sku||'').toLowerCase().includes(q)||(skuOn&&String(p.sku||'').toLowerCase().includes(q))||productMatchesBarcode(p,q)||String(p.category||'').toLowerCase().includes(q))&&(!cat||p.category===cat)&&(!f||(f==='low'&&stockNeedsRestockV707(p)))&&(!ef||(ef==='expired'&&has)||(ef==='nonexpired'&&!has)||(ef==='attention'&&stockExpiryAttentionV707(p))||(ef==='soon'&&has&&days>=0&&days<=30)||(ef==='overdue'&&has&&days<0))}));
const table=document.getElementById('stockTable');
if(table)table.innerHTML=ps.length?ps.map(p=>{const has=productHasExpiry(p),days=productExpiryDays(p);let expiryCell='<span class="pill green">Non Expired</span>';if(has){const cls=days<0?'red':days<=30?'yellow':'';const label=days<0?'Sudah Expired':fmtDate(p.expiry);expiryCell=`<span class="pill ${cls}">${label}</span>${days>=0&&days<=30?`<div class="cell-sub">${days} hari lagi</div>`:''}`;}return`<tr><td data-label="Produk" data-main="true"><div class="cell-title">${p.emoji||'▦'} ${esc(p.name)}${productKind(p)==='service'?' <span class="pill blue">Jasa</span>':''}${p.active===false?' <span class="pill red">Nonaktif</span>':''}</div><div class="cell-sub">${skuOn&&p.sku?`SKU ${esc(p.sku)} • `:''}${esc(p.unit||'pcs')}</div></td><td data-label="Kategori"><span class="pill">${esc(p.category||'Umum')}</span></td><td data-label="Barcode">${esc(p.barcode)}</td><td data-label="Stok">${p.noStock?'<span class="pill green">Tanpa Stok</span>':`<b class="${p.stock<=p.min?'text-danger':''}">${stockQtyTextV227(p.stock)}</b><span class="stock-min-detail"> / min ${stockQtyTextV227(p.min)}</span>`}</td><td data-label="Modal" class="money">${rupiah(p.cost)}</td><td data-label="Ecer" class="money">${p.manualPrice?'<span class="pill">Manual</span>':rupiah(p.price)}</td><td data-label="Grosir" class="money">${rupiah(p.wholesale)}</td><td data-label="Expired">${expiryCell}</td><td data-label="Aksi"><div class="actions">${stockAlertActionsV707(p)}<button class="btn btn-sm" onclick="openProductModal(${p.id})">Edit</button>${marketActive?`<button class="stock-online-btn ${marketProductOnlineEnabled(p)?'active':'off'}" type="button" aria-pressed="${marketProductOnlineEnabled(p)}" aria-label="${marketProductOnlineEnabled(p)?'Nonaktifkan':'Aktifkan'} ${esc(p.name)} di Market Online" title="${marketProductOnlineEnabled(p)?'Produk aktif di Market Online':'Produk offline dari Market Online'}" onclick="toggleProductMarketOnline(${p.id},event)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9"></path>${marketProductOnlineEnabled(p)?'':`<path class="stock-online-slash" d="M5 5l14 14"></path>`}</svg><i></i></button>`:''}</div></td></tr>`}).join(''):'<tr><td colspan="9"><div class="empty-state">Produk tidak ditemukan.</div></td></tr>';
renderStockMobileCategories(cat);
const mobileCategoryValue=document.getElementById('stockMobileCategoryValue');
if(mobileCategoryValue)mobileCategoryValue.textContent=cat||'Semua';
const mobileList=document.getElementById('stockMobileList');
if(mobileList){mobileList.innerHTML=ps.length?ps.map(p=>{const visual=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:(p.emoji||'📦');const stockCls=p.noStock?'':(p.stock<=0?'out':p.stock<=p.min?'low':'');const has=productHasExpiry(p),days=productExpiryDays(p);let expiry='',expiryCls='';if(has){if(days<0){expiry='Sudah Expired';expiryCls='danger'}else if(days<=30){expiry=`Expired ${days} hari lagi`;expiryCls='warn'}else expiry=`Exp. ${fmtDate(p.expiry)}`;}return`<div class="stock-alert-mobile-wrap-v707"><button class="stock-mobile-card" type="button" onclick="openProductModal(${p.id})"><div class="stock-mobile-image">${visual}</div><div class="stock-mobile-info"><div class="stock-mobile-name">${esc(p.name)}${productKind(p)==='service'?' <span class="pill blue">Jasa</span>':''}${p.active===false?' <span class="pill red">Nonaktif</span>':''}</div><div class="stock-mobile-code">${skuOn&&p.sku?`SKU ${esc(p.sku)} · `:''}${esc(p.barcode||'-')}${p.multiBarcodeEnabled&&p.barcodes?.length?` +${p.barcodes.length} barcode`:''} · ${esc(p.category||'Umum')}</div><div class="stock-mobile-meta"><span class="stock-mobile-unit">${esc(p.unit||'pcs')}</span><span class="stock-mobile-stock ${stockCls}">${p.noStock?'Tanpa Stok':'Stok '+stockQtyTextV227(p.stock)}</span>${marketActive?`<span class="stock-mobile-online-toggle ${marketProductOnlineEnabled(p)?'active':'off'}" role="button" tabindex="0" aria-pressed="${marketProductOnlineEnabled(p)}" aria-label="${marketProductOnlineEnabled(p)?'Nonaktifkan':'Aktifkan'} ${esc(p.name)} di Market Online" title="${marketProductOnlineEnabled(p)?'Produk aktif di Market Online':'Produk offline dari Market Online'}" onclick="toggleProductMarketOnline(${p.id},event)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();toggleProductMarketOnline(${p.id},event)}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9"></path>${marketProductOnlineEnabled(p)?'':`<path class="stock-online-slash" d="M5 5l14 14"></path>`}</svg><i></i></span>`:''}</div>${expiry?`<div class="stock-mobile-expiry ${expiryCls}">${expiry}</div>`:''}</div><div class="stock-mobile-prices"><div class="stock-mobile-cost"><small>Modal</small>${rupiah(p.cost)}</div><div class="stock-mobile-price"><small>Ecer</small>${p.manualPrice?'Manual':rupiah(p.price)}</div></div></button>${stockAlertActionsV707(p)}</div>`}).join(''):'<div class="stock-mobile-empty">Produk tidak ditemukan.</div>'}
}
function renderStockMobileCategories(active=''){
const el=document.getElementById('stockMobileCategories');if(!el)return;
const cats=['',...categoryNames()];el.innerHTML=cats.map(c=>`<button type="button" class="stock-mobile-cat ${c===active?'active':''}" onclick="setStockMobileCategory('${encodeURIComponent(c).replace(/'/g,'%27')}')">${c?esc(c):'Semua'}</button>`).join('')
}
function setStockMobileCategory(encoded){const v=decodeURIComponent(encoded),el=document.getElementById('stockCategoryFilter');if(el)el.value=v;renderStock()}
function openStockMobileCategoryPicker(){const active=document.getElementById('stockCategoryFilter')?.value||'';const rows=['',...categoryNames()].map(c=>`<button class="stock-mobile-action${c===active?' active':''}" type="button" onclick="closeModal();setStockMobileCategory('${encodeURIComponent(c).replace(/'/g,'%27')}')"><span class="ico">${c===active?'✓':'▦'}</span><span>${c?esc(c):'Semua Kategori'}</span></button>`).join('');showModal('Pilih Kategori','Pilih kategori produk yang ingin ditampilkan.',`<div class="stock-mobile-action-list">${rows}</div>`,[{label:'Tutup',close:true}],true)}
function toggleMobileStockSearch(force){const panel=document.getElementById('stockMobileSearchPanel');if(!panel)return;const open=force===undefined?!panel.classList.contains('open'):!!force;panel.classList.toggle('open',open);if(open)setTimeout(()=>document.getElementById('stockMobileSearch')?.focus(),40)}
function focusStockBarcode(){openStockCameraScanner()}
function openStockCameraScanner(mode='stock-search'){
stopStockCameraScanner();stockScannerMode=mode;
const forProductForm=mode==='product-form',forMultiBarcode=mode==='product-multi-barcode',forSale=mode==='sale-barcode';
const secure=window.isSecureContext||['localhost','127.0.0.1'].includes(location.hostname);
const embedded=window.self!==window.top;
showModal('Scan Barcode',forMultiBarcode?'Barcode tambahan produk':forProductForm?'Isi barcode utama':forSale?'Pindai produk penjualan':'Arahkan barcode ke kamera',`<div class="stock-camera-wrap"><div class="stock-camera-box"><video id="stockScannerVideo" autoplay muted playsinline></video><div class="stock-camera-frame"></div></div><div class="stock-camera-status" id="stockScannerStatus">${secure?'Meminta izin kamera...':'Kamera memerlukan HTTPS atau aplikasi PWA.'}</div><div class="stock-camera-hint"><span>▣</span><div>Arahkan barcode tepat di dalam bingkai.</div></div><div class="stock-camera-help" id="stockCameraHelp"><b>Kamera belum tersedia.</b><span id="stockCameraHelpText">Periksa izin kamera lalu coba lagi.</span></div><div class="stock-camera-actions"><button class="btn btn-soft" type="button" id="stockCameraRetry" onclick="retryStockCameraScanner()">↻ Coba Kamera Lagi</button></div><div class="field"><label>Kode Barcode Manual</label><div class="stock-camera-manual"><input class="input" id="stockScannerManual" inputmode="text" autocomplete="off" placeholder="Ketik / tempel barcode" onkeydown="if(event.key==='Enter'){event.preventDefault();applyStockScannedBarcode(this.value)}"><button class="btn btn-primary" type="button" onclick="applyStockScannedBarcode(document.getElementById('stockScannerManual').value)">Gunakan</button></div></div></div>`,[{label:'Tutup',fn:()=>closeModal()}]);
if(!secure){setStockCameraError('Akses kamera diblokir karena halaman tidak menggunakan HTTPS. Buka melalui HTTPS/PWA atau isi barcode manual.','insecure');return}
if(embedded){const help=document.getElementById('stockCameraHelpText');if(help)help.textContent='Jika kamera ditolak di mode preview/iframe, buka aplikasi langsung melalui HTTPS/PWA. Preview yang disandbox dapat memblokir kamera.'}
setTimeout(startStockCameraScanner,120)
}
function setStockCameraStatus(message,type=''){
const status=document.getElementById('stockScannerStatus');if(!status)return;
status.textContent=message;status.className='stock-camera-status'+(type?' '+type:'')
}
function setStockCameraError(message,reason=''){
setStockCameraStatus(message,'error');
const help=document.getElementById('stockCameraHelp'),txt=document.getElementById('stockCameraHelpText');
if(help)help.classList.add('show');
if(txt){
if(reason==='denied')txt.textContent='Android/Chrome: buka kontrol situs di address bar → Izin/Permissions → Kamera → Izinkan. Jika tetap ditolak, cek Pengaturan Android → Aplikasi → browser/PWA → Izin → Kamera.';
else if(reason==='inuse')txt.textContent='Tutup aplikasi lain yang sedang memakai kamera, lalu tekan Coba Kamera Lagi.';
else if(reason==='missing')txt.textContent='Kamera tidak ditemukan. Masukkan barcode manual.';
else if(reason==='insecure')txt.textContent='Kamera langsung hanya tersedia pada HTTPS, localhost, atau PWA. Gunakan alamat HTTPS aplikasi.';
else if(reason==='embedded')txt.textContent='Mode preview/iframe dapat memblokir kamera. Buka aplikasi langsung di browser/PWA lalu coba kembali.';
}
}
async function cameraPermissionState(){
try{if(navigator.permissions?.query){const p=await navigator.permissions.query({name:'camera'});return p?.state||'unknown'}}catch(e){}
return'unknown'
}
async function retryStockCameraScanner(){
stopStockCameraScanner();
const help=document.getElementById('stockCameraHelp');if(help)help.classList.remove('show');
setStockCameraStatus('Meminta izin kamera...');
await startStockCameraScanner()
}
async function requestStockCameraStream(){
const preferred={video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false};
try{return await navigator.mediaDevices.getUserMedia(preferred)}catch(err){
if(['OverconstrainedError','ConstraintNotSatisfiedError'].includes(err?.name))return await navigator.mediaDevices.getUserMedia({video:true,audio:false});
throw err
}
}
async function startStockCameraScanner(){
const video=document.getElementById('stockScannerVideo');if(!video)return;
stopStockCameraScanner();
if(!(window.isSecureContext||['localhost','127.0.0.1'].includes(location.hostname))){setStockCameraError('Kamera memerlukan koneksi HTTPS atau aplikasi PWA.','insecure');return}
if(!navigator.mediaDevices?.getUserMedia){setStockCameraError('Browser/WebView ini tidak menyediakan akses kamera langsung. Masukkan barcode manual.','missing');return}
const permission=await cameraPermissionState();
if(permission==='denied'){
setStockCameraError('Izin kamera diblokir oleh browser/perangkat. Ubah izin Kamera menjadi Izinkan, lalu tekan Coba Kamera Lagi.','denied');
return
}
try{
stockScanStream=await requestStockCameraStream();
const currentVideo=document.getElementById('stockScannerVideo');
if(!currentVideo){stopStockCameraScanner();return}
currentVideo.srcObject=stockScanStream;
await currentVideo.play();
const track=stockScanStream.getVideoTracks?.()[0];
const label=track?.label?` • ${track.label}`:'';
if(!('BarcodeDetector'in window)){
setStockCameraStatus('Kamera aktif, tetapi pembacaan barcode otomatis belum didukung browser ini. Masukkan barcode manual.');
return
}
let supported=[];try{supported=await BarcodeDetector.getSupportedFormats()}catch(e){}
const preferred=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','code_93','codabar','itf','qr_code'];
const formats=supported.length?preferred.filter(x=>supported.includes(x)):preferred;
try{stockBarcodeDetector=new BarcodeDetector(formats.length?{formats}:undefined)}catch(e){stockBarcodeDetector=new BarcodeDetector()}
const help=document.getElementById('stockCameraHelp');if(help)help.classList.remove('show');
setStockCameraStatus(`Kamera aktif${label} • mencari barcode...`,'ok');
scanStockCameraFrame()
}catch(err){
const name=err?.name||'';
if(name==='NotAllowedError'||name==='SecurityError'){
const embedded=window.self!==window.top;
setStockCameraError(embedded?'Akses kamera diblokir pada mode preview/iframe. Buka aplikasi langsung melalui HTTPS/PWA lalu coba lagi.':'Izin kamera ditolak atau diblokir. Ubah izin Kamera menjadi Izinkan, lalu tekan Coba Kamera Lagi.',embedded?'embedded':'denied')
}else if(name==='NotFoundError'||name==='DevicesNotFoundError')setStockCameraError('Kamera tidak ditemukan pada perangkat ini.','missing');
else if(name==='NotReadableError'||name==='TrackStartError'||name==='AbortError')setStockCameraError('Kamera sedang tidak dapat digunakan. Tutup aplikasi lain yang memakai kamera lalu coba lagi.','inuse');
else if(name==='OverconstrainedError'||name==='ConstraintNotSatisfiedError')setStockCameraError('Kamera tersedia tetapi konfigurasi kamera tidak didukung. Tekan Coba Kamera Lagi atau masukkan barcode manual.','missing');
else setStockCameraError(`Kamera tidak dapat dibuka${name?` (${name})`:''}. Coba lagi atau masukkan barcode manual.`,'')
}
}
async function scanBarcodeImageFile(file){
if(!file)return;
setStockCameraStatus('Membaca barcode dari foto...');
if(!('BarcodeDetector'in window)){setStockCameraError('Browser ini belum mendukung pembacaan barcode dari foto. Masukkan kode secara manual.','');return}
try{
const bitmap=await createImageBitmap(file);
let detector=stockBarcodeDetector;
if(!detector){
let supported=[];try{supported=await BarcodeDetector.getSupportedFormats()}catch(e){}
const preferred=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','code_93','codabar','itf','qr_code'];
const formats=supported.length?preferred.filter(x=>supported.includes(x)):preferred;
try{detector=new BarcodeDetector(formats.length?{formats}:undefined)}catch(e){detector=new BarcodeDetector()}
}
const codes=await detector.detect(bitmap);bitmap.close?.();
const raw=codes?.[0]?.rawValue;
if(raw){applyStockScannedBarcode(raw);return}
setStockCameraError('Barcode belum terbaca dari foto. Ambil foto lebih dekat, terang, dan barcode memenuhi bingkai lalu coba lagi.','')
}catch(err){setStockCameraError('Foto tidak dapat dibaca sebagai barcode. Coba foto lain atau masukkan barcode manual.','')}
finally{const input=document.getElementById('stockCameraCapture');if(input)input.value=''}
}
async function scanStockCameraFrame(){
if(!stockScanStream||!stockBarcodeDetector)return;
const video=document.getElementById('stockScannerVideo');if(!video)return stopStockCameraScanner();
if(video.readyState>=2&&!stockScanBusy){
stockScanBusy=true;
try{const codes=await stockBarcodeDetector.detect(video);const raw=codes?.[0]?.rawValue;if(raw){applyStockScannedBarcode(raw);return}}catch(e){}
finally{stockScanBusy=false}
}
if(stockScanStream)stockScanTimer=setTimeout(scanStockCameraFrame,180)
}
function stopStockCameraScanner(){
if(stockScanTimer){clearTimeout(stockScanTimer);stockScanTimer=null}
if(stockScanStream){stockScanStream.getTracks().forEach(t=>t.stop());stockScanStream=null}
const video=document.getElementById('stockScannerVideo');if(video)video.srcObject=null;
stockBarcodeDetector=null;stockScanBusy=false
}
function applyStockScannedBarcode(raw){
const code=String(raw||'').trim();if(!code)return toast('Barcode belum diisi.','error');
if(stockScannerMode==='product-form'){
const input=document.getElementById('mpBarcode');if(input)input.value=code;const found=findProductByBarcode(code,mobileProductFormEditingId);
stopStockCameraScanner();closeModal();setTimeout(()=>{input?.focus();input?.setSelectionRange?.(code.length,code.length)},80);
if(found)toast(`Barcode sudah digunakan oleh ${found.name}.`,'error');else toast(`Barcode ${code} berhasil dipindai.`);return
}
if(stockScannerMode==='product-multi-barcode'){
stopStockCameraScanner();closeModal();setTimeout(()=>appendMobileProductMultiBarcode(code),60);return
}
if(stockScannerMode==='sale-barcode'){
const found=findProductByBarcode(code);
stopStockCameraScanner();closeModal();
if(!found){setTimeout(()=>showSaleBarcodeProductUnavailable(code),70);return}
setTimeout(()=>{
addToCart(found.id);
if(!productVariantsActive(found)&&!found.manualPrice)toast(`${found.name} ditambahkan dari scan barcode.`);
},70);
return
}
const mobile=document.getElementById('stockMobileSearch'),desktop=document.getElementById('stockSearch');
if(mobile)mobile.value=code;if(desktop)desktop.value=code;
const found=findProductByBarcode(code);
stopStockCameraScanner();closeModal();toggleMobileStockSearch(true);renderStock();
setTimeout(()=>{const input=document.getElementById('stockMobileSearch');input?.focus();input?.setSelectionRange?.(code.length,code.length)},80);
if(found)toast(`Barcode ditemukan • ${found.name}`);else toast(`Barcode ${code} belum terdaftar.`,'error')
}
function showSaleBarcodeProductUnavailable(code){
const barcode=String(code||'').trim();if(!barcode)return;
showModal(
'Produk tidak tersedia',
'Barcode belum terdaftar',
`<div class="sale-barcode-missing"><div class="sale-barcode-missing-box"><div class="sale-barcode-missing-icon">▦</div><b>Produk dengan barcode ini belum tersedia.</b><p>Tambahkan sebagai produk baru agar selanjutnya dapat langsung dipindai pada Penjualan.</p></div><div class="sale-barcode-code"><span>Barcode</span><b>${esc(barcode)}</b></div></div>`,
[
{label:'Batal',close:true},
{label:'Tambah Produk',primary:true,fn:()=>openNewProductFromScannedBarcode(barcode)}
],
true
)
}
function openNewProductFromScannedBarcode(code){
const barcode=String(code||'').trim();if(!barcode)return;
const stockDesktop=document.getElementById('stockSearch'),stockMobile=document.getElementById('stockMobileSearch');
if(stockDesktop)stockDesktop.value='';if(stockMobile)stockMobile.value='';
closeModal();
if(true){
openMobileProductForm(null);
setTimeout(()=>{
const input=document.getElementById('mpBarcode');
if(input){input.value=barcode;input.dispatchEvent(new Event('input',{bubbles:true}))}
const name=document.getElementById('mpName');name?.focus()
},100);
return
}
openProductModal(null);
setTimeout(()=>{
const input=document.getElementById('pBarcode');
if(input){input.value=barcode;input.dispatchEvent(new Event('input',{bubbles:true}))}
document.getElementById('pName')?.focus()
},80)
}
function openSaleBarcodeScanner(){openStockCameraScanner('sale-barcode')}
function openMobileProductBarcodeScanner(){openStockCameraScanner('product-form')}
function openMobileProductMultiBarcodeScanner(){openStockCameraScanner('product-multi-barcode')}
function appendMobileProductMultiBarcode(raw){
const code=String(raw||'').trim();if(!code)return toast('Barcode belum diisi.','error');
const primary=document.getElementById('mpBarcode')?.value.trim()||'';if(code===primary)return toast('Barcode ini sudah digunakan sebagai Barcode Utama.','error');
const other=findProductByBarcode(code,mobileProductFormEditingId);if(other)return toast(`Barcode sudah digunakan oleh ${other.name}.`,'error');
const box=document.getElementById('mpBarcodes');if(!box)return;const rows=normalizeBarcodeList(box.value);if(rows.includes(code))return toast('Barcode sudah ada pada produk ini.','error');
rows.push(code);box.value=rows.join('\n');updateMobileProductBarcodeCount();box.focus();box.setSelectionRange?.(box.value.length,box.value.length);toast(`Barcode ${code} ditambahkan.`)
}
function openStockMobileActions(){showModal('Produk & Stok','Pilih tindakan.',`<div class="stock-mobile-action-list"><button class="stock-mobile-action" onclick="closeModal();openProductModal()"><span class="ico">＋</span><span>Tambah Produk</span></button><button class="stock-mobile-action" onclick="closeModal();openCategoryManager()"><span class="ico">▦</span><span>Kelola Kategori</span></button><button class="stock-mobile-action" onclick="closeModal();openUnitManager()"><span class="ico">▤</span><span>Kelola Satuan</span></button><button class="stock-mobile-action" onclick="closeModal();openStockOpname()"><span class="ico">✓</span><span>Stok Opname</span></button><button class="stock-mobile-action" onclick="closeModal();openLabels()"><span class="ico">▥</span><span>Label & Barcode</span></button></div>`,[{label:'Tutup',close:true}])}
function openStockMobileFilters(){
const cat=document.getElementById('stockCategoryFilter')?.value||'',stock=document.getElementById('stockFilter')?.value||'',expiry=document.getElementById('stockExpiryFilter')?.value||'';
const cats='<option value="">Semua kategori</option>'+categoryNames().map(c=>`<option value="${esc(c)}" ${c===cat?'selected':''}>${esc(c)}</option>`).join('');
showModal('Filter Produk','Pilih filter yang ingin digunakan.',`<div class="form-grid"><div class="field full"><label>Kategori</label><select id="mobileStockCategory">${cats}</select></div><div class="field"><label>Stok</label><select id="mobileStockState"><option value="" ${!stock?'selected':''}>Semua stok</option><option value="low" ${stock==='low'?'selected':''}>Stok menipis</option></select></div><div class="field"><label>Masa Berlaku</label><select id="mobileStockExpiry"><option value="" ${!expiry?'selected':''}>Semua</option><option value="expired" ${expiry==='expired'?'selected':''}>Expired</option><option value="nonexpired" ${expiry==='nonexpired'?'selected':''}>Non Expired</option><option value="attention" ${expiry==='attention'?'selected':''}>Expired / ≤30 hari</option><option value="soon" ${expiry==='soon'?'selected':''}>≤30 hari</option><option value="overdue" ${expiry==='overdue'?'selected':''}>Sudah Expired</option></select></div></div>`,[{label:'Reset',fn:()=>{resetStockMobileFilters();closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{document.getElementById('stockCategoryFilter').value=document.getElementById('mobileStockCategory').value;document.getElementById('stockFilter').value=document.getElementById('mobileStockState').value;document.getElementById('stockExpiryFilter').value=document.getElementById('mobileStockExpiry').value;renderStock();closeModal()}}])
}
function resetStockMobileFilters(){const a=document.getElementById('stockCategoryFilter'),b=document.getElementById('stockFilter'),c=document.getElementById('stockExpiryFilter');if(a)a.value='';if(b)b.value='';if(c)c.value='';renderStock()}
function categoryOptions(selected='Umum'){return categoryNames().map(c=>`<option value="${esc(c)}" ${c===selected?'selected':''}>${esc(c)}</option>`).join('')}
function unitNames(){return[...new Set(['pcs',...(db.units||[]),...db.products.map(p=>p.unit).filter(Boolean),...(serviceProductEnabled()?['layanan']:[])])].sort((a,b)=>a.localeCompare(b,'id'))}
function unitOptions(selected='pcs'){return unitNames().map(u=>`<option value="${esc(u)}" ${u===selected?'selected':''}>${esc(u)}</option>`).join('')}
function openUnitManager(){
if(true){productSettingTab='unit';unitPageEditing=null;unitPageDeleteArmed=false;if(!document.getElementById('screen-categories')?.classList.contains('active'))go('categories');else renderCategoryPage();return}
openDesktopProductSettings('unit')
}
function addUnitFromManager(){const input=document.getElementById('newUnitName');const name=(input?.value||'').trim();if(!name)return toast('Nama satuan wajib diisi.','error');if(unitNames().some(u=>u.toLowerCase()===name.toLowerCase()))return toast('Satuan sudah tersedia.','error');db.units.push(name);save();renderAll();openUnitManager();toast('Satuan ditambahkan.')}
function editUnit(encoded){const old=decodeURIComponent(encoded);if(true){productSettingTab='unit';if(!document.getElementById('screen-categories')?.classList.contains('active'))go('categories');openUnitPageEdit(encoded);return}if(String(old).toLowerCase()==='pcs'||serviceProductUnitLocked(old)){const builtin=String(old).toLowerCase()==='pcs';showModal(builtin?'Satuan pcs':'Satuan layanan',old,`<div style="font-size:11px;color:var(--muted);line-height:1.6">${builtin?'Satuan pcs adalah satuan bawaan dan tidak dapat diubah atau dihapus.':'Satuan layanan dibuat otomatis karena Produk Jasa aktif. Nonaktifkan Produk Jasa jika ingin mengubah atau menghapus satuan ini.'}</div>`,[{label:'Kembali',fn:()=>openUnitManager()}]);return}showModal('Edit Satuan',old,`<div class="field"><label>Nama Satuan</label><input id="editUnitName" value="${esc(old)}"></div><div style="font-size:10px;color:var(--muted);margin-top:8px">Perubahan nama otomatis diterapkan ke seluruh produk yang memakai satuan ini.</div>`,[{label:'Batal',fn:()=>openUnitManager()},{label:'Simpan',primary:true,fn:()=>{const name=document.getElementById('editUnitName').value.trim();if(!name)return toast('Nama satuan wajib diisi.','error');if(name.toLowerCase()!==old.toLowerCase()&&unitNames().some(u=>u.toLowerCase()===name.toLowerCase()))return toast('Satuan sudah tersedia.','error');db.units=db.units.map(u=>u===old?name:u);db.products.forEach(p=>{if((p.unit||'pcs')===old)p.unit=name});save();renderAll();openUnitManager();toast('Satuan diperbarui.')}}])}
function deleteUnit(encoded){const name=decodeURIComponent(encoded);if(name.toLowerCase()==='pcs')return toast('Satuan pcs tidak dapat dihapus.','error');if(serviceProductUnitLocked(name))return toast('Satuan layanan tidak dapat dihapus selama Produk Jasa aktif.','error');if(true){productSettingTab='unit';if(!document.getElementById('screen-categories')?.classList.contains('active'))go('categories');unitPageEditing=name;unitPageDeleteArmed=true;renderCategoryPage();return}const count=db.products.filter(p=>(p.unit||'pcs')===name).length;showModal('Hapus Satuan',name,`<div class="empty-state" style="padding:8px 0 2px"><b>${count?count+' produk akan dipindahkan ke satuan pcs.':'Satuan ini belum digunakan produk.'}</b><span style="display:block;margin-top:6px">Tindakan ini tidak menghapus produk.</span></div>`,[{label:'Batal',fn:()=>openUnitManager()},{label:'Hapus Satuan',primary:true,fn:()=>{db.units=db.units.filter(u=>u!==name);db.products.forEach(p=>{if((p.unit||'pcs')===name)p.unit='pcs'});save();renderAll();openUnitManager();toast('Satuan dihapus.')}}])}
let productSettingTab='category',categoryPageEditing=null,categoryPageDeleteArmed=false,unitPageEditing=null,unitPageDeleteArmed=false;
function openCategoryManager(){
if(true){productSettingTab='category';categoryPageEditing=null;categoryPageDeleteArmed=false;go('categories');return}
openDesktopProductSettings('category')
}
function openDesktopProductSettings(tab='category'){
productSettingTab=tab==='unit'?'unit':'category';
const isUnit=productSettingTab==='unit';
let rows,form,countText;
if(isUnit){
const units=unitNames();countText=`${units.length} satuan tersedia`;
rows=units.map(u=>{const count=db.products.filter(p=>(p.unit||'pcs')===u).length,builtin=u.toLowerCase()==='pcs',serviceLocked=serviceProductUnitLocked(u),locked=builtin||serviceLocked;return`<div class="list-row"><div class="list-main"><div class="list-title">${esc(u)}</div><div class="list-sub">${count} produk${builtin?' • satuan bawaan':serviceLocked?' • otomatis dari Produk Jasa':''}</div></div><div class="actions"><button class="btn btn-sm" onclick="editUnit('${encodeURIComponent(u).replace(/'/g,'%27')}')">${locked?'Lihat':'Edit'}</button><button class="btn btn-sm ${locked?'disabled':''}" ${locked?'disabled':''} onclick="deleteUnit('${encodeURIComponent(u).replace(/'/g,'%27')}')">Hapus</button></div></div>`}).join('');
form=`<div class="field"><label>Tambah Satuan Baru</label><div style="display:flex;gap:8px"><input id="newUnitName" placeholder="Contoh: dus, box, kg, liter" onkeydown="if(event.key==='Enter'){event.preventDefault();addUnitFromManager()}"><button class="btn btn-primary" style="white-space:nowrap" onclick="addUnitFromManager()">+ Tambah</button></div></div>`;
}else{
const cats=categoryNames();countText=`${cats.length} kategori tersedia`;
rows=cats.map(c=>{const count=db.products.filter(p=>(p.category||'Umum')===c).length;const builtin=c==='Umum',productionLocked=productionMaterialCategoryLocked(c),serviceLocked=serviceProductCategoryLocked(c),locked=builtin||productionLocked||serviceLocked;return`<div class="list-row"><div class="list-main"><div class="list-title">${esc(c)}</div><div class="list-sub">${count} produk${builtin?' • kategori bawaan':productionLocked?' • otomatis dari Produksi':serviceLocked?' • otomatis dari Produk Jasa':''}</div></div><div class="actions"><button class="btn btn-sm" onclick="editCategory('${encodeURIComponent(c).replace(/'/g,'%27')}')">${locked?'Lihat':'Edit'}</button><button class="btn btn-sm ${locked?'disabled':''}" ${locked?'disabled':''} onclick="deleteCategory('${encodeURIComponent(c).replace(/'/g,'%27')}')">Hapus</button></div></div>`}).join('');
form=`<div class="field"><label>Tambah Kategori Baru</label><div style="display:flex;gap:8px"><input id="newCategoryName" placeholder="Contoh: Minuman Dingin" onkeydown="if(event.key==='Enter'){event.preventDefault();addCategoryFromManager()}"><button class="btn btn-primary" style="white-space:nowrap" onclick="addCategoryFromManager()">+ Tambah</button></div></div>`;
}
const tabs=`<div class="desktop-product-setting-tabs"><button class="desktop-product-setting-tab ${!isUnit?'active':''}" type="button" onclick="openDesktopProductSettings('category')">Kategori</button><button class="desktop-product-setting-tab ${isUnit?'active':''}" type="button" onclick="openDesktopProductSettings('unit')">Satuan</button></div>`;
showModal('Kategori & Satuan Produk','Kelola pengelompokan dan satuan produk dalam satu tempat.',`${tabs}<div class="desktop-product-setting-count">${countText}</div>${form}<div class="list" style="margin-top:14px">${rows||'<div class="empty-state">Belum ada data.</div>'}</div>`,[{label:'Selesai',close:true}],true)
}
function renderCategoryPage(){
const catTab=document.getElementById('productSettingCategoryTab'),unitTab=document.getElementById('productSettingUnitTab'),catPanel=document.getElementById('productSettingCategoryPanel'),unitPanel=document.getElementById('productSettingUnitPanel');
catTab?.classList.toggle('active',productSettingTab==='category');unitTab?.classList.toggle('active',productSettingTab==='unit');catPanel?.classList.toggle('active',productSettingTab==='category');unitPanel?.classList.toggle('active',productSettingTab==='unit');
const countEl=document.getElementById('categoryPageCount'),summary=document.getElementById('categoryPageSummaryText');
if(productSettingTab==='unit'){const units=unitNames();if(countEl)countEl.textContent=`${units.length} satuan`;if(summary)summary.textContent=`${units.length} nama satuan • Atur isi Box/Dus di Multi Satuan`;renderUnitPage();return}
const list=document.getElementById('categoryPageList');if(!list)return;
const names=categoryNames();if(countEl)countEl.textContent=`${names.length} kategori`;if(summary)summary.textContent=`${names.length} kategori • Pengelompokan produk & stok`;
list.innerHTML=names.length?names.map(c=>{const count=db.products.filter(p=>(p.category||'Umum')===c).length,builtin=c==='Umum',productionLocked=productionMaterialCategoryLocked(c),serviceLocked=serviceProductCategoryLocked(c),locked=builtin||productionLocked||serviceLocked;return`<button class="category-page-item" type="button" onclick="openCategoryPageEdit('${encodeURIComponent(c).replace(/'/g,'%27')}')"><span class="category-page-icon">▦</span><span class="category-page-copy"><b>${esc(c)}</b><small>${count} produk</small>${builtin?'<span class="category-page-lock">Kategori bawaan</span>':productionLocked?'<span class="category-page-lock">Otomatis dari Produksi</span>':serviceLocked?'<span class="category-page-lock">Otomatis dari Produk Jasa</span>':''}</span><span class="category-page-chevron">›</span></button>`}).join(''):'<div class="category-page-empty">Belum ada kategori.</div>';
renderCategoryPageEditor();
}
function setProductSettingTab(tab){productSettingTab=tab==='unit'?'unit':'category';categoryPageEditing=null;categoryPageDeleteArmed=false;unitPageEditing=null;unitPageDeleteArmed=false;renderCategoryPage()}
function openProductSettingAdd(){if(productSettingTab==='unit')openUnitPageAdd();else openCategoryPageAdd()}
// v693: switch konversi per satuan. Periksa ulang status setiap kali form atau kasir digunakan.
function normalizeMultiUnitV693(v){return String(v||'').trim().toLocaleLowerCase('id-ID')}
function ecerUnitSettingsV693(){db.settings=db.settings||{};const m=db.settings.multiUnitsV684||(db.settings.multiUnitsV684={enabled:false,products:{}});if(!m.unitEcerV693||typeof m.unitEcerV693!=='object'||Array.isArray(m.unitEcerV693))m.unitEcerV693={};return m}
function ecerUnitPermittedV693(unit){return !!unit&&!['pcs','layanan'].includes(normalizeMultiUnitV693(unit))&&!serviceProductUnitLocked(unit)}
function ecerUnitLegacyV693(unit){const key=normalizeMultiUnitV693(unit);if(!key)return false;return db.products.some(p=>normalizeMultiUnitV693(p.packUnitV687)===key)||Object.values(db.settings?.multiUnitsV684?.products||{}).some(a=>Array.isArray(a)&&a.some(r=>normalizeMultiUnitV693(r?.unit)===key))}
window.inposEcerUnitEnabledV693=function(unit){if(!db?.settings?.multiUnitsV684?.enabled||!ecerUnitPermittedV693(unit))return false;const m=ecerUnitSettingsV693(),key=normalizeMultiUnitV693(unit);if(Object.prototype.hasOwnProperty.call(m.unitEcerV693,key))return m.unitEcerV693[key]===true;return ecerUnitLegacyV693(unit)};
window.toggleUnitEcerV693=function(encoded){const unit=decodeURIComponent(encoded||'');if(!db?.settings?.multiUnitsV684?.enabled||!ecerUnitPermittedV693(unit))return;
if(typeof employeeCan==='function'&&!employeeCan('stock'))return toast('Tidak memiliki izin mengatur satuan.','error');
const m=ecerUnitSettingsV693(),key=normalizeMultiUnitV693(unit),previous=structuredClone(m.unitEcerV693),newValue=!window.inposEcerUnitEnabledV693(unit);m.unitEcerV693[key]=newValue;
try{if(!save())throw new Error('save gagal')}catch(e){m.unitEcerV693=previous;toast('Gagal menyimpan. Coba lagi.','error');return;}
renderUnitPage();toast(newValue?`${unit}: satuan ecer diaktifkan.`:`${unit}: konversi dinonaktifkan; aturan dan stok tetap tersimpan.`);
};
function renderUnitPage(){
const list=document.getElementById('unitPageList');if(!list)return;const units=unitNames();
const showSwitch=db?.settings?.multiUnitsV684?.enabled===true;
list.innerHTML=units.length?units.map(u=>{
const count=db.products.filter(p=>(p.unit||'pcs')===u||normalizeMultiUnitV693(p.packUnitV687)===normalizeMultiUnitV693(u)||window.multiUnitSavedRulesV686?.(p)?.some(r=>normalizeMultiUnitV693(r.unit)===normalizeMultiUnitV693(u))).length,builtin=normalizeMultiUnitV693(u)==='pcs',serviceLocked=serviceProductUnitLocked(u),locked=builtin||serviceLocked;
const encoded=encodeURIComponent(u).replace(/'/g,'%27'),active=window.inposEcerUnitEnabledV693(u),canSwitch=showSwitch&&ecerUnitPermittedV693(u);
return `<div class="category-page-item unit-list-row-v693"><button class="unit-list-main-v693" type="button" onclick="openUnitPageEdit('${encoded}')"><span class="category-page-icon">▤</span><span class="category-page-copy"><b>${esc(u)}</b><small>${count} produk</small>${builtin?'<span class="category-page-lock">Satuan bawaan</span>':serviceLocked?'<span class="category-page-lock">Satuan Produk Jasa</span>':''}</span><span class="category-page-chevron">›</span></button>${canSwitch?`<button class="unit-ecer-switch-v693" role="switch" type="button" aria-checked="${active}" aria-label="Satuan ecer ${esc(u)}: ${active?'aktif':'nonaktif'}" title="${active?'Nonaktifkan':'Aktifkan'} konversi untuk ${esc(u)}" onclick="toggleUnitEcerV693('${encoded}')"><span>Ecer</span><i aria-hidden="true"></i></button>`:''}</div>`;
}).join(''):'<div class="category-page-empty">Belum ada satuan.</div>';renderUnitPageEditor();
}
function renderUnitPageEditor(){
const editor=document.getElementById('unitPageEditor'),input=document.getElementById('unitPageName'),title=document.getElementById('unitPageEditorTitle'),note=document.getElementById('unitPageEditorNote'),actions=document.getElementById('unitPageEditorActions'),confirm=document.getElementById('unitPageDeleteConfirm');if(!editor||!input||!title||!actions)return;
const opened=unitPageEditing!==null;editor.classList.toggle('open',opened);if(!opened)return;const isAdd=unitPageEditing==='',builtin=String(unitPageEditing).toLowerCase()==='pcs',serviceLocked=serviceProductUnitLocked(unitPageEditing),locked=builtin||serviceLocked;title.textContent=isAdd?'Tambah Satuan':builtin?'Satuan pcs':serviceLocked?'Satuan layanan':'Edit Satuan';input.value=isAdd?'':unitPageEditing;input.disabled=locked;
if(note)note.textContent=builtin?'Satuan pcs adalah satuan bawaan dan tidak dapat diubah atau dihapus.':serviceLocked?'Satuan layanan dibuat otomatis karena Produk Jasa aktif. Nonaktifkan Produk Jasa jika ingin mengubah atau menghapus satuan ini.':isAdd?'Masukkan nama satuan baru, misalnya dus, box, kg, atau liter.':`${db.products.filter(p=>(p.unit||'pcs')===unitPageEditing).length} produk menggunakan satuan ini.`;if(confirm)confirm.hidden=!unitPageDeleteArmed;
if(locked){actions.className='category-page-editor-actions';actions.innerHTML='<button class="btn btn-primary" type="button" onclick="closeUnitPageEditor()">Selesai</button>'}
else if(isAdd){actions.className='category-page-editor-actions';actions.innerHTML='<button class="btn" type="button" onclick="closeUnitPageEditor()">Batal</button><button class="btn btn-primary" type="button" onclick="saveUnitPage()">Tambah</button>'}
else{actions.className='category-page-editor-actions three';actions.innerHTML=`<button class="btn" type="button" onclick="closeUnitPageEditor()">Batal</button><button class="btn" type="button" style="color:var(--danger);border-color:rgba(225,29,46,.28)" onclick="deleteUnitPage()">${unitPageDeleteArmed?'Hapus Sekarang':'Hapus'}</button><button class="btn btn-primary" type="button" onclick="saveUnitPage()">Simpan</button>`}
}
function openUnitPageAdd(){productSettingTab='unit';unitPageEditing='';unitPageDeleteArmed=false;renderCategoryPage();setTimeout(()=>document.getElementById('unitPageName')?.focus(),50)}
function openUnitPageEdit(encoded){productSettingTab='unit';unitPageEditing=decodeURIComponent(encoded);unitPageDeleteArmed=false;renderCategoryPage();setTimeout(()=>{document.getElementById('unitPageEditor')?.scrollIntoView({behavior:'smooth',block:'start'});document.getElementById('unitPageName')?.focus()},40)}
function closeUnitPageEditor(){unitPageEditing=null;unitPageDeleteArmed=false;renderCategoryPage()}
function saveUnitPage(){
 const input=document.getElementById('unitPageName'),name=String(input?.value||'').trim(),old=unitPageEditing;
 if(old===null)return;
 if(!name||name.length>32||/[<>\x00-\x1f]/.test(name))return toast('Nama satuan wajib valid, maksimal 32 karakter.','error');
 if(normalizeMultiUnitV693(old)==='pcs')return toast('Satuan PCS tidak dapat diubah.','error');
 if(serviceProductUnitLocked(old))return toast('Satuan layanan digunakan otomatis selama Produk Jasa aktif.','error');
 if(unitNames().some(u=>normalizeMultiUnitV693(u)===normalizeMultiUnitV693(name)&&normalizeMultiUnitV693(u)!==normalizeMultiUnitV693(old)))return toast('Satuan sudah tersedia.','error');
 if(old===name){unitPageEditing=null;unitPageDeleteArmed=false;renderCategoryPage();return;}
 const originalUnits=[...(db.units||[])],originalProducts=db.products.map(p=>({unit:p.unit,packUnitV687:p.packUnitV687}));
 const originalConfig=structuredClone(db.settings?.multiUnitsV684||null);
 if(old==='')db.units.push(name);
 else{
  db.units=db.units.map(u=>normalizeMultiUnitV693(u)===normalizeMultiUnitV693(old)?name:u);
  if(!db.units.some(u=>normalizeMultiUnitV693(u)===normalizeMultiUnitV693(name)))db.units.push(name);
  db.products.forEach(p=>{if(normalizeMultiUnitV693(p.unit||'pcs')===normalizeMultiUnitV693(old))p.unit=name;if(normalizeMultiUnitV693(p.packUnitV687)===normalizeMultiUnitV693(old))p.packUnitV687=name});
  const settings=db.settings?.multiUnitsV684;
  if(settings){
   Object.values(settings.products||{}).forEach(arr=>{if(Array.isArray(arr))arr.forEach(r=>{if(r&&normalizeMultiUnitV693(r.unit)===normalizeMultiUnitV693(old))r.unit=name;if(r&&normalizeMultiUnitV693(r.baseUnit)===normalizeMultiUnitV693(old))r.baseUnit=name})});
   const sw=settings.unitEcerV693,oldKey=normalizeMultiUnitV693(old),newKey=normalizeMultiUnitV693(name);
   if(sw&&Object.prototype.hasOwnProperty.call(sw,oldKey)){sw[newKey]=sw[oldKey];if(newKey!==oldKey)delete sw[oldKey]}
  }
 }
 let success=false;try{success=save()===true}catch(e){console.warn('INPOS v694 gagal simpan satuan:',e)}
 if(!success){db.units=originalUnits;db.products.forEach((p,i)=>{p.unit=originalProducts[i].unit;p.packUnitV687=originalProducts[i].packUnitV687});if(originalConfig===null)delete db.settings.multiUnitsV684;else db.settings.multiUnitsV684=originalConfig;return toast('Satuan gagal disimpan. Data dikembalikan.','error')}
 unitPageEditing=null;unitPageDeleteArmed=false;renderAll();renderCategoryPage();toast(old===''?'Satuan ditambahkan.':'Satuan diperbarui.');
}
function deleteUnitPage(){
 const name=unitPageEditing,normalized=normalizeMultiUnitV693(name);
 if(!name||normalized==='pcs')return;
 if(serviceProductUnitLocked(name))return toast('Satuan layanan tidak dapat dihapus selama Produk Jasa aktif.','error');
 if(db.products.some(p=>normalizeMultiUnitV693(p.unit||'pcs')===normalized||normalizeMultiUnitV693(p.packUnitV687)===normalized)||Object.values(db.settings?.multiUnitsV684?.products||{}).some(a=>Array.isArray(a)&&a.some(r=>normalizeMultiUnitV693(r?.unit)===normalized||normalizeMultiUnitV693(r?.baseUnit)===normalized)))return toast('Satuan masih dipakai produk atau konversi. Pindahkan satuan produk / hapus aturan konversi dahulu.','error');
 if(!unitPageDeleteArmed){unitPageDeleteArmed=true;renderUnitPageEditor();return}
 const originalUnits=[...(db.units||[])],setting=db.settings?.multiUnitsV684,originalSwitch=setting?.unitEcerV693?structuredClone(setting.unitEcerV693):null;
 db.units=db.units.filter(u=>normalizeMultiUnitV693(u)!==normalized);
 if(setting?.unitEcerV693)delete setting.unitEcerV693[normalized];
 let success=false;try{success=save()===true}catch(e){console.warn('INPOS v694 gagal hapus satuan:',e)}
 if(!success){db.units=originalUnits;if(setting){if(originalSwitch===null)delete setting.unitEcerV693;else setting.unitEcerV693=originalSwitch}return toast('Satuan gagal dihapus. Data dikembalikan.','error')}
 unitPageEditing=null;unitPageDeleteArmed=false;renderAll();renderCategoryPage();toast('Satuan dihapus.');
}
function renderCategoryPageEditor(){
const editor=document.getElementById('categoryPageEditor'),input=document.getElementById('categoryPageName'),title=document.getElementById('categoryPageEditorTitle'),note=document.getElementById('categoryPageEditorNote'),actions=document.getElementById('categoryPageEditorActions'),confirm=document.getElementById('categoryPageDeleteConfirm');if(!editor||!input||!title||!actions)return;
const opened=categoryPageEditing!==null;editor.classList.toggle('open',opened);if(!opened)return;
const isAdd=categoryPageEditing==='';const builtin=categoryPageEditing==='Umum',productionLocked=productionMaterialCategoryLocked(categoryPageEditing),serviceLocked=serviceProductCategoryLocked(categoryPageEditing),locked=builtin||productionLocked||serviceLocked;title.textContent=isAdd?'Tambah Kategori':builtin?'Kategori Umum':productionLocked?'Kategori Bahan':serviceLocked?'Kategori Jasa':'Edit Kategori';input.value=isAdd?'':categoryPageEditing;input.disabled=locked;
if(note)note.textContent=builtin?'Kategori Umum adalah kategori bawaan dan tidak dapat diubah atau dihapus.':productionLocked?'Kategori Bahan dibuat otomatis karena fitur Produksi aktif. Nonaktifkan Produksi jika ingin mengubah atau menghapus kategori ini.':serviceLocked?'Kategori Jasa dibuat otomatis karena Produk Jasa aktif. Nonaktifkan Produk Jasa jika ingin mengubah atau menghapus kategori ini.':isAdd?'Masukkan nama kategori baru untuk pengelompokan produk.':`${db.products.filter(p=>(p.category||'Umum')===categoryPageEditing).length} produk menggunakan kategori ini.`;
if(confirm)confirm.hidden=!categoryPageDeleteArmed;
if(locked){actions.className='category-page-editor-actions';actions.innerHTML='<button class="btn btn-primary" type="button" onclick="closeCategoryPageEditor()">Selesai</button>'}
else if(isAdd){actions.className='category-page-editor-actions';actions.innerHTML='<button class="btn" type="button" onclick="closeCategoryPageEditor()">Batal</button><button class="btn btn-primary" type="button" onclick="saveCategoryPage()">Tambah</button>'}
else{actions.className='category-page-editor-actions three';actions.innerHTML=`<button class="btn" type="button" onclick="closeCategoryPageEditor()">Batal</button><button class="btn" type="button" style="color:var(--danger);border-color:rgba(225,29,46,.28)" onclick="deleteCategoryPage()">${categoryPageDeleteArmed?'Hapus Sekarang':'Hapus'}</button><button class="btn btn-primary" type="button" onclick="saveCategoryPage()">Simpan</button>`}
}
function openCategoryPageAdd(){categoryPageEditing='';categoryPageDeleteArmed=false;renderCategoryPage();setTimeout(()=>document.getElementById('categoryPageName')?.focus(),50)}
function openCategoryPageEdit(encoded){categoryPageEditing=decodeURIComponent(encoded);categoryPageDeleteArmed=false;renderCategoryPage();setTimeout(()=>{const el=document.getElementById('categoryPageEditor');el?.scrollIntoView({behavior:'smooth',block:'start'});document.getElementById('categoryPageName')?.focus()},40)}
function closeCategoryPageEditor(){categoryPageEditing=null;categoryPageDeleteArmed=false;renderCategoryPage()}
function saveCategoryPage(){
const input=document.getElementById('categoryPageName');const name=(input?.value||'').trim();if(!name)return toast('Nama kategori wajib diisi.','error');const old=categoryPageEditing;
if(old==='Umum')return;if(productionMaterialCategoryLocked(old))return toast('Kategori Bahan digunakan otomatis selama fitur Produksi aktif.','error');if(serviceProductCategoryLocked(old))return toast('Kategori Jasa digunakan otomatis selama Produk Jasa aktif.','error');
if(categoryNames().some(c=>c.toLowerCase()===name.toLowerCase()&&c!==old))return toast('Kategori sudah tersedia.','error');
if(old===''){db.categories.push(name);toast('Kategori ditambahkan.')}else{db.categories=db.categories.map(c=>c===old?name:c);db.products.forEach(p=>{if((p.category||'Umum')===old)p.category=name});if(activeCategory===old)activeCategory=name;toast('Kategori diperbarui.')}
categoryPageEditing=null;categoryPageDeleteArmed=false;save();renderAll();renderCategoryPage();
}
function deleteCategoryPage(){
const name=categoryPageEditing;if(!name||name==='Umum')return;if(productionMaterialCategoryLocked(name))return toast('Kategori Bahan tidak dapat dihapus selama fitur Produksi aktif.','error');if(serviceProductCategoryLocked(name))return toast('Kategori Jasa tidak dapat dihapus selama Produk Jasa aktif.','error');
if(!categoryPageDeleteArmed){categoryPageDeleteArmed=true;renderCategoryPageEditor();return}
db.categories=db.categories.filter(c=>c!==name);db.products.forEach(p=>{if((p.category||'Umum')===name)p.category='Umum'});if(activeCategory===name)activeCategory='Semua';categoryPageEditing=null;categoryPageDeleteArmed=false;save();renderAll();renderCategoryPage();toast('Kategori dihapus.')
}
function openAddCategoryModal(){showModal('Tambah Kategori','Buat kategori produk baru.',`<div class="field"><label>Nama Kategori</label><input id="newCategoryName" placeholder="Contoh: Minuman Dingin" autocomplete="off" onkeydown="if(event.key==='Enter'){event.preventDefault();addCategoryFromManager()}"></div>`,[{label:'Batal',fn:()=>openCategoryManager()},{label:'Tambah',primary:true,fn:addCategoryFromManager}]);setTimeout(()=>document.getElementById('newCategoryName')?.focus(),60)}
function addCategoryFromManager(){
const input=document.getElementById('newCategoryName');const name=(input?.value||'').trim();if(!name)return toast('Nama kategori wajib diisi.','error');
if(categoryNames().some(c=>c.toLowerCase()===name.toLowerCase()))return toast('Kategori sudah tersedia.','error');
db.categories.push(name);save();renderAll();openCategoryManager();toast('Kategori ditambahkan.')
}
function editCategory(encoded){
if(true){if(document.getElementById('overlay')?.classList.contains('show'))closeModal();if(!document.getElementById('screen-categories')?.classList.contains('active'))go('categories');openCategoryPageEdit(encoded);return}
const old=decodeURIComponent(encoded);
const builtin=old==='Umum',productionLocked=productionMaterialCategoryLocked(old),serviceLocked=serviceProductCategoryLocked(old),locked=builtin||productionLocked||serviceLocked;
const count=db.products.filter(p=>(p.category||'Umum')===old).length;
if(locked){
showModal(builtin?'Kategori Umum':productionLocked?'Kategori Bahan':'Kategori Jasa',`${count} produk menggunakan kategori ini.`,`<div style="font-size:11px;color:var(--muted);line-height:1.6">${builtin?'Kategori Umum adalah kategori bawaan dan tidak dapat diubah atau dihapus.':productionLocked?'Kategori Bahan dibuat otomatis karena fitur Produksi aktif. Nonaktifkan Produksi jika ingin mengubah atau menghapus kategori ini.':'Kategori Jasa dibuat otomatis karena Produk Jasa aktif. Nonaktifkan Produk Jasa jika ingin mengubah atau menghapus kategori ini.'}</div>`,[{label:'Kembali',fn:()=>openCategoryManager()}]);
return;
}
const saveEdit=()=>{const name=document.getElementById('editCategoryName').value.trim();if(!name)return toast('Nama kategori wajib diisi.','error');if(name.toLowerCase()!==old.toLowerCase()&&categoryNames().some(c=>c.toLowerCase()===name.toLowerCase()))return toast('Kategori sudah tersedia.','error');db.categories=db.categories.map(c=>c===old?name:c);db.products.forEach(p=>{if((p.category||'Umum')===old)p.category=name});if(activeCategory===old)activeCategory=name;save();renderAll();openCategoryManager();toast('Kategori diperbarui.')};
showModal('Edit Kategori',`${count} produk menggunakan kategori ini.`,`<div class="field"><label>Nama Kategori</label><input id="editCategoryName" value="${esc(old)}"></div><div style="font-size:11px;color:var(--muted);margin-top:9px;line-height:1.5">Perubahan nama otomatis diterapkan ke seluruh produk dalam kategori ini.</div>`,[{label:'Hapus',danger:true,fn:()=>deleteCategory(encodeURIComponent(old))},{label:'Batal',fn:()=>openCategoryManager()},{label:'Simpan',primary:true,fn:saveEdit}]);
}
function deleteCategory(encoded){
if(true){if(!document.getElementById('screen-categories')?.classList.contains('active'))go('categories');categoryPageEditing=decodeURIComponent(encoded);categoryPageDeleteArmed=true;renderCategoryPage();return}
const name=decodeURIComponent(encoded);if(name==='Umum')return toast('Kategori Umum tidak dapat dihapus.','error');if(productionMaterialCategoryLocked(name))return toast('Kategori Bahan tidak dapat dihapus selama fitur Produksi aktif.','error');if(serviceProductCategoryLocked(name))return toast('Kategori Jasa tidak dapat dihapus selama Produk Jasa aktif.','error');const count=db.products.filter(p=>(p.category||'Umum')===name).length;
showModal('Hapus Kategori',name,`<div class="empty-state" style="padding:8px 0 2px"><b>${count?count+' produk akan dipindahkan ke kategori Umum.':'Kategori ini belum digunakan produk.'}</b><span style="display:block;margin-top:6px">Tindakan ini tidak menghapus produk.</span></div>`,[{label:'Batal',fn:()=>openCategoryManager()},{label:'Hapus Kategori',primary:true,fn:()=>{db.categories=db.categories.filter(c=>c!==name);db.products.forEach(p=>{if((p.category||'Umum')===name)p.category='Umum'});if(activeCategory===name)activeCategory='Semua';save();renderAll();openCategoryManager();toast('Kategori dihapus.')}}])
}
function productPowerIconMarkupV505(on=true){
return`<svg class="product-power-icon-v505 ${on?'on':'off'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v8"></path><path d="M7.05 5.8A8 8 0 1 0 16.95 5.8"></path></svg>`
}
function syncEditedProductActiveButtonV503(){
const button=document.getElementById('mobileProductActiveBtnV503');if(!button)return;
const p=mobileProductFormEditingId!==null?getProduct(mobileProductFormEditingId):null;
button.hidden=!p;if(!p)return;
const on=p.active!==false;
button.classList.toggle('off',!on);button.setAttribute('aria-pressed',String(on));
button.title=on?'Nonaktifkan produk':'Aktifkan produk';button.setAttribute('aria-label',button.title);
const iconWrap=button.querySelector('span');if(iconWrap)iconWrap.innerHTML=productPowerIconMarkupV505(on);
const caption=button.querySelector('small');if(caption)caption.textContent=on?'Aktif':'Nonaktif';
const desktop=document.getElementById('desktopProductActiveBtnV503');if(desktop){
desktop.innerHTML=`${productPowerIconMarkupV505(on)}<span>${on?'Nonaktifkan':'Aktifkan'}</span>`;
desktop.classList.toggle('btn-danger',on);
desktop.title=button.title;desktop.setAttribute('aria-label',button.title);
}
}
function toggleEditedProductActiveV503(explicitId=null){
const id=explicitId??mobileProductFormEditingId,p=id!==null?getProduct(Number(id)):null;
if(!p)return toast('Produk tidak ditemukan.','error');
p.active=p.active===false;
save();syncEditedProductActiveButtonV503();
renderStock();renderProducts();renderDashboard();
toast(p.active?`${p.name} diaktifkan.`:`${p.name} dinonaktifkan dari penjualan.`)
}
let mobileProductFormReturnScreen='stock',mobileProductFormEditingId=null,mobileVariantCostDraft={};
function variantNamesFromValue(value){const names=[...new Set(String(value||'').split(',').map(v=>v.trim()).filter(Boolean))];return names.length?names:['Default']}
function captureMobileVariantCostDraft(){document.querySelectorAll('#mpVariantCostList [data-variant-cost]').forEach(el=>{const name=el.dataset.variantCost;if(name)mobileVariantCostDraft[name]=Math.max(0,parseNominal(el.value))})}
function renderMobileVariantCostRows(){captureMobileVariantCostDraft();const list=document.getElementById('mpVariantCostList');if(!list)return;const names=variantNamesFromValue(document.getElementById('mpVariants')?.value||'');list.innerHTML=names.map(name=>`<div class="variant-cost-row"><div class="variant-cost-name"><b>${esc(name)}</b><small>Biaya tambahan varian</small></div><label class="variant-cost-input"><span>Rp</span><input class="nominal-input" type="text" inputmode="numeric" data-variant-cost="${esc(name)}" value="${nominal(mobileVariantCostDraft[name]||0)}" aria-label="Biaya varian ${esc(name)}"></label></div>`).join('')}
function currentScreenName(){const active=document.querySelector('.screen.active');return active?.id?.replace(/^screen-/,'')||'stock'}
function setMobileProductFormCopy(isEdit=false){
const heading=document.getElementById('mobileProductFormHeading'),subheading=document.getElementById('mobileProductFormSubheading'),stockLabel=document.getElementById('mpStockLabel'),saveBtn=document.getElementById('mobileProductFormSaveBtn');
if(heading)heading.textContent=isEdit?'Edit Produk':'Tambah Produk';
if(subheading)subheading.textContent=isEdit?'Perbarui data produk. Perubahan stok melalui Stok Opname':'Lengkapi data produk dan stok awal';
if(stockLabel)stockLabel.textContent=isEdit?'Stok':'Stok Awal';
if(saveBtn)saveBtn.textContent=isEdit?'Simpan Perubahan':'Simpan Produk';
}
function openMobileProductForm(id=null){
const p=id!==null?getProduct(id):null;if(id!==null&&!p)return toast('Produk tidak ditemukan.','error');
const origin=currentScreenName();mobileProductFormReturnScreen=(origin&&origin!=='productform')?origin:'stock';mobileProductFormEditingId=p?.id??null;
pageMeta.productform=p?['Edit Produk','Perbarui data dan pengaturan produk']:['Tambah Produk','Buat produk baru dan atur stok awal'];
go('productform');setMobileProductFormCopy(!!p);
const category=document.getElementById('mpCategory'),unit=document.getElementById('mpUnit');
if(category)category.innerHTML=categoryOptions(p?.category||'Umum');if(unit)unit.innerHTML=unitOptions(p?.unit||'pcs');
const values={
mpName:p?.name||'',mpImage:p?.image||'',mpBarcode:p?.barcode||'',mpSku:p?.sku||'',mpBarcodes:normalizeBarcodeList(p?.barcodes).join('\n'),mpStock:String(stockQtyIntV227(p?.stock??0)),
mpVariants:(p?.variants||['Default']).join(', '),mpCost:nominal(p?.cost??0),mpPrice:nominal(p?.price??0),
mpMin:String(stockQtyIntV227(p?.min??0)),mpExpiry:p?.expiry||futureDay(365)
};
Object.entries(values).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value});const mpStockInput=document.getElementById('mpStock');if(mpStockInput){mpStockInput.disabled=!!p;mpStockInput.title=p?'Perubahan stok wajib melalui Stok Opname':''}
const skuWrap=document.getElementById('mpSkuWrap');if(skuWrap)skuWrap.hidden=!skuFeatureEnabled();
const variantCostList=document.getElementById('mpVariantCostList');if(variantCostList)variantCostList.innerHTML='';mobileVariantCostDraft={};(p?.variants||['Default']).forEach(v=>mobileVariantCostDraft[v]=Math.max(0,Number(p?.variantCosts?.[v])||0));renderMobileVariantCostRows();
const type=document.getElementById('mpExpiryType');if(type)type.value=p&&productHasExpiry(p)?'expired':'nonexpired';
const noStock=document.getElementById('mpNoStock'),variantsEnabled=document.getElementById('mpVariantsEnabled'),manualPrice=document.getElementById('mpManualPrice'),multiBarcodeEnabled=document.getElementById('mpMultiBarcodeEnabled'),multiFeature=document.getElementById('mpMultiBarcodeFeature');
if(noStock)noStock.checked=!!p?.noStock;if(variantsEnabled)variantsEnabled.checked=!!p?.variantsEnabled;if(manualPrice)manualPrice.checked=!!p?.manualPrice;if(multiBarcodeEnabled)multiBarcodeEnabled.checked=!!p?.multiBarcodeEnabled;if(multiFeature){multiFeature.hidden=false;multiFeature.style.display='';}
setupMobileProductKind(p);setupMobileProductProductionType(p);toggleMobileProductStockless();toggleMobileProductVariants();toggleMobileProductManualPrice();toggleMobileProductMultiBarcode();toggleMobileProductExpiryField();
setProductPurchasableUIV515('mobile',p?.purchaseEnabled!==false);syncEditedProductActiveButtonV503();syncServiceNominalLabelsV519();setTimeout(()=>document.getElementById('mpName')?.focus(),80)
}
function closeMobileProductForm(){const back=pageMeta[mobileProductFormReturnScreen]?mobileProductFormReturnScreen:'stock';mobileProductFormEditingId=null;go(back)}
function setupMobileProductKind(p=null){
const wrap=document.getElementById('mpProductKindWrap'),select=document.getElementById('mpProductKind');if(!wrap||!select)return;
const enabled=serviceProductEnabled();wrap.hidden=false;select.disabled=!enabled;select.value=productKind(p);select.title=enabled?'Pilih jenis produk':'Aktifkan Produk Jasa di Fitur Tambahan untuk mengubah jenis';
['prevCategory','prevUnit','prevNoStock','prevExpiryType','prevExpiry','prevProductionType'].forEach(k=>delete select.dataset[k]);
if(!enabled){updateMobileServiceFieldVisibility(productKind(p)==='service');return}
ensureServiceProductDefaults();select.value=productKind(p);updateMobileProductKind(false)
}
function syncServiceNominalLabelsV519(){
const mobileService=document.getElementById('mpProductKind')?.value==='service';
const mobileNominal=mobileService&&!!document.getElementById('mpServiceStockEnabledV517')?.checked;
const mobileStock=document.getElementById('mpStock');
const mobileStockLabel=mobileStock?.closest('.mobile-product-form-field')?.querySelector('label');
const mobileMinLabel=document.getElementById('mpMin')?.closest('.mobile-product-form-field')?.querySelector('label');
if(mobileStockLabel)mobileStockLabel.textContent=mobileNominal?(mobileStock?.disabled?'Nominal Saat Ini':'Nominal Awal'):(mobileStock?.disabled?'Stok Saat Ini':'Stok Awal');
if(mobileMinLabel)mobileMinLabel.textContent=mobileNominal?'Minimum Nominal':'Minimum Stok';
if(mobileStock){mobileStock.setAttribute('aria-label',mobileNominal?'Nominal persediaan jasa':'Jumlah stok produk');mobileStock.placeholder=mobileNominal?'Contoh: 100000':'';}
const desktopService=document.getElementById('pProductKind')?.value==='service';
const desktopNominal=desktopService&&!!document.getElementById('pServiceStockEnabledV517')?.checked;
const desktopStock=document.getElementById('pStock');
const desktopStockLabel=desktopStock?.closest('.field')?.querySelector('label');
const desktopMinLabel=document.getElementById('pMin')?.closest('.field')?.querySelector('label');
if(desktopStockLabel)desktopStockLabel.textContent=desktopNominal?(desktopStock?.disabled?'Nominal Saat Ini':'Nominal Awal'):'Stok';
if(desktopMinLabel)desktopMinLabel.textContent=desktopNominal?'Minimum Nominal':'Minimum Stok';
if(desktopStock){desktopStock.setAttribute('aria-label',desktopNominal?'Nominal persediaan jasa':'Jumlah stok produk');desktopStock.placeholder=desktopNominal?'Contoh: 100000':'';}
}
function toggleServiceStockMobileV517(){
const check=document.getElementById('mpServiceStockEnabledV517'),noStock=document.getElementById('mpNoStock');
if(check&&noStock){noStock.checked=!check.checked;toggleMobileProductStockless()}
syncServiceNominalLabelsV519();
}
function syncServiceStockMobileV517(isService){
const row=document.getElementById('mpServiceStockWrapV517'),check=document.getElementById('mpServiceStockEnabledV517'),noStock=document.getElementById('mpNoStock');
if(row)row.hidden=!isService;
if(check&&noStock)check.checked=!noStock.checked;
syncServiceNominalLabelsV519();
}
function updateMobileServiceFieldVisibility(isService){
const noStockFeature=document.getElementById('mpNoStockFeature'),expirySection=document.getElementById('mpExpirySection'),title=document.getElementById('mpPriceStockSectionTitle'),productionWrap=document.getElementById('mpProductionTypeWrap');
if(noStockFeature)noStockFeature.hidden=!!isService;if(expirySection)expirySection.hidden=!!isService;if(title)title.textContent=isService?'Harga & Stok Jasa':'Harga & Stok';syncServiceStockMobileV517(isService);
if(productionWrap)productionWrap.hidden=!!isService||!optionalFeatureEnabled('production')
}
function mobileProductFormIsService(){
const editing=mobileProductFormEditingId!==null?getProduct(mobileProductFormEditingId):null;
return serviceProductEnabled()?(document.getElementById('mpProductKind')?.value==='service'):productKind(editing)==='service'
}
function updateMobileProductKind(fromUser=false){
const select=document.getElementById('mpProductKind'),category=document.getElementById('mpCategory'),unit=document.getElementById('mpUnit'),hint=document.getElementById('mpProductKindHint'),noStock=document.getElementById('mpNoStock'),production=document.getElementById('mpProductionType'),expiryType=document.getElementById('mpExpiryType'),expiry=document.getElementById('mpExpiry');if(!select||!category||!unit)return;
const kind=select.value==='service'?'service':'product',isService=kind==='service';
if(isService){
ensureServiceProductDefaults();
if(![...category.options].some(o=>String(o.value).toLocaleLowerCase('id-ID')==='jasa'))category.insertAdjacentHTML('beforeend','<option value="Jasa">Jasa</option>');
if(![...unit.options].some(o=>String(o.value).toLocaleLowerCase('id-ID')==='layanan'))unit.insertAdjacentHTML('beforeend','<option value="layanan">layanan</option>');
if(fromUser){
select.dataset.prevCategory=category.value||'Umum';select.dataset.prevUnit=unit.value||'pcs';select.dataset.prevNoStock=noStock?.checked?'1':'0';select.dataset.prevExpiryType=expiryType?.value||'nonexpired';select.dataset.prevExpiry=expiry?.value||'';select.dataset.prevProductionType=production?.value||'nonproduction';
category.value=[...category.options].find(o=>String(o.value).toLocaleLowerCase('id-ID')==='jasa')?.value||'Jasa';unit.value=[...unit.options].find(o=>String(o.value).toLocaleLowerCase('id-ID')==='layanan')?.value||'layanan';
}
category.disabled=false;unit.disabled=false;
if(noStock){if(fromUser)noStock.checked=true;noStock.disabled=false}if(production){production.value='nonproduction';production.disabled=true}if(expiryType)expiryType.value='nonexpired';
if(hint)hint.textContent='Jasa dapat memakai stok atau tanpa stok. Pilih sesuai layanan.';
}else{
category.disabled=false;unit.disabled=false;if(noStock)noStock.disabled=false;if(production)production.disabled=false;
if(fromUser){
const prevCategory=select.dataset.prevCategory||'Umum',prevUnit=select.dataset.prevUnit||'pcs';category.value=[...category.options].some(o=>o.value===prevCategory)?prevCategory:'Umum';unit.value=[...unit.options].some(o=>o.value===prevUnit)?prevUnit:'pcs';if(noStock)noStock.checked=select.dataset.prevNoStock==='1';if(expiryType)expiryType.value=select.dataset.prevExpiryType||'nonexpired';if(expiry&&select.dataset.prevExpiry)expiry.value=select.dataset.prevExpiry;if(production)production.value=select.dataset.prevProductionType||'nonproduction';
}
if(hint)hint.textContent='Produk fisik memakai stok seperti biasa. Tanpa Stok tetap bisa diaktifkan bila diperlukan.';
}
updateMobileServiceFieldVisibility(isService);toggleMobileProductStockless();toggleMobileProductExpiryField();if(optionalFeatureEnabled('production'))updateMobileProductProductionType(false);syncServiceNominalLabelsV519()
}
function productProductionType(p){
const raw=String(p?.productionType||'').toLowerCase();if(['production','nonproduction','material'].includes(raw))return raw;
if(String(p?.category||'').trim().toLocaleLowerCase('id-ID')==='bahan')return'material';
if(p?.id!=null&&productionItem(Number(p.id)))return'production';
return'nonproduction'
}
function setupMobileProductProductionType(p=null){
const wrap=document.getElementById('mpProductionTypeWrap'),select=document.getElementById('mpProductionType');if(!wrap||!select)return;
const enabled=optionalFeatureEnabled('production'),isService=mobileProductFormIsService();wrap.hidden=!enabled||isService;if(!enabled)return;ensureProductionMaterialCategory();
select.value=isService?'nonproduction':productProductionType(p);select.disabled=isService;if(isService){const hint=document.getElementById('mpProductionTypeHint');if(hint)hint.textContent='Jasa tidak memakai proses produksi.';return}updateMobileProductProductionType(false)
}
function updateMobileProductProductionType(fromUser=false){
const select=document.getElementById('mpProductionType'),category=document.getElementById('mpCategory'),hint=document.getElementById('mpProductionTypeHint'),wrap=document.getElementById('mpProductionTypeWrap');if(!select||!category)return;
const isService=mobileProductFormIsService();if(isService){select.value='nonproduction';select.disabled=true;if(wrap)wrap.hidden=true;if(hint)hint.textContent='Jasa tidak memakai proses produksi.';return}else{select.disabled=false;if(wrap)wrap.hidden=!optionalFeatureEnabled('production')}
const type=['production','nonproduction','material'].includes(select.value)?select.value:'nonproduction';
if(type==='material'){ensureProductionMaterialCategory();if(![...category.options].some(o=>String(o.value).toLocaleLowerCase('id-ID')==='bahan'))category.insertAdjacentHTML('beforeend','<option value="Bahan">Bahan</option>');category.value=[...category.options].find(o=>String(o.value).toLocaleLowerCase('id-ID')==='bahan')?.value||'Bahan';category.disabled=true;if(hint)hint.textContent='Bahan otomatis menggunakan kategori Bahan dan dapat dipakai pada Resep/BOM.'}
else{category.disabled=false;if(fromUser&&String(category.value||'').toLocaleLowerCase('id-ID')==='bahan')category.value='Umum';if(hint)hint.textContent=type==='production'?'Produk Produksi dapat dikelola pada Menu Produksi untuk Resep/BOM dan HPP.':'Non Produksi adalah produk biasa yang tidak memerlukan proses produksi.'}
}
function toggleMobileProductStockless(){const on=!!document.getElementById('mpNoStock')?.checked;['mpStockWrap','mpMinWrap'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=on})}
function toggleMobileProductVariants(){const on=!!document.getElementById('mpVariantsEnabled')?.checked,wrap=document.getElementById('mpVariantsWrap');if(wrap)wrap.hidden=!on;if(on)renderMobileVariantCostRows()}
function toggleMobileProductManualPrice(){const on=!!document.getElementById('mpManualPrice')?.checked;const el=document.getElementById('mpPriceWrap');if(el)el.hidden=on}
function updateMobileProductBarcodeCount(){const el=document.getElementById('mpBarcodeCount'),box=document.getElementById('mpBarcodes');if(el)el.textContent=`${normalizeBarcodeList(box?.value).length} barcode`}
function toggleMobileProductMultiBarcode(){const on=!!document.getElementById('mpMultiBarcodeEnabled')?.checked,wrap=document.getElementById('mpMultiBarcodeWrap');if(wrap)wrap.hidden=!on;updateMobileProductBarcodeCount()}
function toggleMobileProductExpiryField(){const type=document.getElementById('mpExpiryType')?.value||'nonexpired',wrap=document.getElementById('mpExpiryWrap'),input=document.getElementById('mpExpiry'),typeField=document.querySelector('#mpExpirySection .mobile-product-expiry-type'),expired=type==='expired';if(wrap)wrap.style.display=expired?'flex':'none';if(typeField)typeField.classList.toggle('full',!expired);if(input)input.required=expired}
function saveMobileProductForm(){
const editing=mobileProductFormEditingId!==null?getProduct(mobileProductFormEditingId):null;if(mobileProductFormEditingId!==null&&!editing)return toast('Produk yang akan diedit tidak ditemukan.','error');
const name=document.getElementById('mpName')?.value.trim()||'';if(!name){toast('Nama produk wajib diisi.','error');document.getElementById('mpName')?.focus();return}
const serviceEnabled=serviceProductEnabled(),kind=serviceEnabled?(document.getElementById('mpProductKind')?.value==='service'?'service':'product'):productKind(editing),isService=kind==='service';
const hasExpiry=!isService&&document.getElementById('mpExpiryType')?.value==='expired',expiry=hasExpiry?(document.getElementById('mpExpiry')?.value||''):null;if(hasExpiry&&!expiry)return toast('Tanggal expired wajib diisi untuk produk Expired.','error');
const barcode=document.getElementById('mpBarcode')?.value.trim()||'';
const duplicate=barcode?findProductByBarcode(barcode,editing?.id??null):null;if(duplicate)return toast(`Barcode sudah digunakan oleh ${duplicate.name}.`,'error');
const sku=skuFeatureEnabled()?String(document.getElementById('mpSku')?.value||'').trim().slice(0,48):String(editing?.sku||'');if(sku){const usedSku=db.products.find(x=>x.id!==editing?.id&&String(x.sku||'').trim().toLowerCase()===sku.toLowerCase());if(usedSku)return toast(`SKU sudah digunakan oleh ${usedSku.name}.`,'error')}
let noStock=!!document.getElementById('mpNoStock')?.checked;if(isService)noStock=!document.getElementById('mpServiceStockEnabledV517')?.checked;const variantsEnabled=!!document.getElementById('mpVariantsEnabled')?.checked,manualPrice=!!document.getElementById('mpManualPrice')?.checked,multiBarcodeEnabled=!!document.getElementById('mpMultiBarcodeEnabled')?.checked;
let barcodes=normalizeBarcodeList(document.getElementById('mpBarcodes')?.value||editing?.barcodes||[]).filter(code=>code!==barcode);for(const code of barcodes){const used=findProductByBarcode(code,editing?.id??null);if(used)return toast(`Barcode ${code} sudah digunakan oleh ${used.name}.`,'error')}
let variants=variantsEnabled?[...new Set((document.getElementById('mpVariants')?.value||'').split(',').map(v=>v.trim()).filter(Boolean))]:['Default'];if(variantsEnabled&&!variants.length)return toast('Isi minimal satu varian produk.','error');if(!variants.length)variants=['Default'];captureMobileVariantCostDraft();const variantCosts={};variants.forEach(v=>variantCosts[v]=variantsEnabled?Math.max(0,Number(mobileVariantCostDraft[v])||0):0);
const productionEnabled=optionalFeatureEnabled('production'),productionType=isService?'nonproduction':(productionEnabled?(document.getElementById('mpProductionType')?.value||'nonproduction'):(editing?.productionType||''));
let productCategory=document.getElementById('mpCategory')?.value||'Umum',productUnit=document.getElementById('mpUnit')?.value||'pcs';const multiDraftV687=window.inposMultiPrepareProductV687?.(editing,productUnit,noStock,manualPrice,isService);if(multiDraftV687===false)return;if(editing&&editing.packUnitV687&&db?.settings?.multiUnitsV684?.enabled&&!multiDraftV687&&window.inposEcerUnitEnabledV693?.(editing.packUnitV687)!==false)return toast('Untuk mengubah produk kemasan, tetap pilih satuan kemasan atau hapus aturan konversinya dahulu.','error');if(multiDraftV687)productUnit=multiDraftV687.baseUnit;else if(editing?.packUnitV687&&window.inposEcerUnitEnabledV693?.(editing.packUnitV687)===false&&String(productUnit).toLowerCase()===String(editing.packUnitV687).toLowerCase())productUnit=editing.unit;if(editing&&window.multiUnitSavedRulesV686?.(editing).length&&productUnit!==editing.unit)return toast('Hapus aturan konversi pada Multi Satuan sebelum mengganti satuan dasar.','error');if(isService){ensureServiceProductDefaults();if(!productCategory)productCategory='Jasa';if(!productUnit)productUnit='layanan'}else if(productionEnabled&&productionType==='material'){ensureProductionMaterialCategory();productCategory='Bahan'}
if(editing&&!editing.noStock&&noStock&&Number(editing.stock||0)>0)return toast('Stok masih tersedia. Sesuaikan stok ke 0 sebelum memilih Tanpa Stok.','error');
const purchaseEnabled=document.getElementById('mpPurchaseEnabledV515')?.dataset?.enabled!=='false';
const data={purchaseEnabled,name,image:document.getElementById('mpImage')?.value.trim()||'',sku,barcode,barcodes,multiBarcodeEnabled,category:productCategory,cost:Math.max(0,parseNominal(document.getElementById('mpCost')?.value)),price:manualPrice?0:Math.max(0,parseNominal(document.getElementById('mpPrice')?.value)),wholesale:editing?Math.max(0,Number(editing.wholesale)||0):0,wholesaleConfigured:editing?editing.wholesaleConfigured===true:false,discountConfigured:editing?editing.discountConfigured===true:false,discountActive:editing?editing.discountActive!==false:true,discountType:editing?.discountType||'percent',discountValue:editing?Math.max(0,Number(editing.discountValue)||0):0,unit:productUnit,productKind:kind,stock:editing?stockQtyIntV227(editing.stock):(noStock?0:stockQtyIntV227(document.getElementById('mpStock')?.value)),variants,variantCosts,min:noStock?0:stockQtyIntV227(document.getElementById('mpMin')?.value),noStock,variantsEnabled,manualPrice,hasExpiry,expiry};
if(multiDraftV687){data.multiUnitEnabledV686=true;data.packUnitV687=multiDraftV687.packUnit;data.packFactorV687=multiDraftV687.factor;if(!editing){data.stock=multiDraftV687.stockBase;data.min=stockQtyIntV227(document.getElementById('mpMin')?.value)*multiDraftV687.factor;}}if(isService)data.productionType='nonproduction';else if(productionEnabled)data.productionType=['production','nonproduction','material'].includes(productionType)?productionType:'nonproduction';else if(editing?.productionType)data.productionType=editing.productionType;
const v688Snapshot={products:structuredClone(db.products),categories:[...db.categories],units:[...db.units],multiUnits:structuredClone(db.settings?.multiUnitsV684||{})};if(!db.categories.includes(data.category))db.categories.push(data.category);if(!db.units.includes(data.unit))db.units.push(data.unit);
let savedProduct=editing;if(editing)Object.assign(editing,data);else{savedProduct={id:Math.max(0,...db.products.map(x=>Number(x.id)||0))+1,emoji:isService?'🧾':'📦',sold:0,active:true,...data};db.products.push(savedProduct)}
if(multiDraftV687){db.settings=db.settings||{};const conf=db.settings.multiUnitsV684||{enabled:true,products:{}};conf.products=conf.products||{};const key=String(savedProduct.id),previous=Array.isArray(conf.products[key])?conf.products[key]:[];conf.products[key]=previous.filter(x=>String(x.unit).toLowerCase()!==multiDraftV687.packUnit.toLowerCase());conf.products[key].push({unit:multiDraftV687.packUnit,factor:multiDraftV687.factor,salePrice:multiDraftV687.sell, buyCost:multiDraftV687.buy,baseUnit:multiDraftV687.baseUnit});db.settings.multiUnitsV684=conf;if(!db.units.some(x=>String(x).toLowerCase()===multiDraftV687.packUnit.toLowerCase()))db.units.push(multiDraftV687.packUnit)}
if(!save()){if(v688Snapshot){db.products=v688Snapshot.products;db.categories=v688Snapshot.categories;db.units=v688Snapshot.units;db.settings.multiUnitsV684=v688Snapshot.multiUnits;}return toast('Gagal menyimpan produk. Periksa ruang penyimpanan browser.','error');} renderAll();toast(editing?(isService?'Jasa diperbarui.':'Produk diperbarui.'):(isService?'Jasa disimpan.':'Produk disimpan.'));closeMobileProductForm()
}
let desktopVariantCostDraft={};
function captureDesktopVariantCostDraft(){document.querySelectorAll('#pVariantCostList [data-desktop-variant-cost]').forEach(el=>{const name=el.dataset.desktopVariantCost;if(name)desktopVariantCostDraft[name]=Math.max(0,parseNominal(el.value))})}
function renderDesktopVariantCostRows(){captureDesktopVariantCostDraft();const list=document.getElementById('pVariantCostList');if(!list)return;const names=variantNamesFromValue(document.getElementById('pVariants')?.value||'');list.innerHTML=names.map(name=>`<div class="variant-cost-row"><div class="variant-cost-name"><b>${esc(name)}</b><small>Biaya tambahan varian</small></div><label class="variant-cost-input"><span>Rp</span><input class="nominal-input" type="text" inputmode="numeric" data-desktop-variant-cost="${esc(name)}" value="${nominal(desktopVariantCostDraft[name]||0)}"></label></div>`).join('')}
function toggleProductExpiryField(){const type=document.getElementById('pExpiryType')?.value||'expired',wrap=document.getElementById('pExpiryWrap'),input=document.getElementById('pExpiry');if(wrap)wrap.style.display=type==='expired'?'flex':'none';if(input)input.required=type==='expired'}
function updateDesktopProductKind(fromUser=false,forcedService=null){
const select=document.getElementById('pProductKind'),category=document.getElementById('pCategory'),unit=document.getElementById('pUnit'),hint=document.getElementById('pProductKindHint'),stock=document.getElementById('pStock'),min=document.getElementById('pMin'),expiryType=document.getElementById('pExpiryType'),expiry=document.getElementById('pExpiry');if(!category||!unit)return;
const isService=forcedService===null?(select?.value==='service'):!!forcedService,stockField=stock?.closest('.field'),minField=min?.closest('.field'),expiryTypeField=expiryType?.closest('.field'),expiryWrap=document.getElementById('pExpiryWrap'),serviceRow=document.getElementById('pServiceStockWrapV517'),serviceCheck=document.getElementById('pServiceStockEnabledV517');if(serviceRow)serviceRow.hidden=!isService;if(isService&&fromUser&&serviceCheck)serviceCheck.checked=false;
if(isService){
ensureServiceProductDefaults();if(![...category.options].some(o=>String(o.value).toLocaleLowerCase('id-ID')==='jasa'))category.insertAdjacentHTML('beforeend','<option value="Jasa">Jasa</option>');if(![...unit.options].some(o=>String(o.value).toLocaleLowerCase('id-ID')==='layanan'))unit.insertAdjacentHTML('beforeend','<option value="layanan">layanan</option>');
if(fromUser&&select){select.dataset.prevCategory=category.value||'Umum';select.dataset.prevUnit=unit.value||'pcs';select.dataset.prevStock=stock?.value||'0';select.dataset.prevMin=min?.value||'0';select.dataset.prevExpiryType=expiryType?.value||'nonexpired';select.dataset.prevExpiry=expiry?.value||'';category.value=[...category.options].find(o=>String(o.value).toLocaleLowerCase('id-ID')==='jasa')?.value||'Jasa';unit.value=[...unit.options].find(o=>String(o.value).toLocaleLowerCase('id-ID')==='layanan')?.value||'layanan'}
category.disabled=false;unit.disabled=false;if(stock)stock.disabled=stock.dataset.editing==='1'||!serviceCheck?.checked;if(min)min.disabled=!serviceCheck?.checked;if(expiryType)expiryType.value='nonexpired';if(stockField)stockField.style.display=serviceCheck?.checked?'flex':'none';if(minField)minField.style.display=serviceCheck?.checked?'flex':'none';if(expiryTypeField)expiryTypeField.style.display='none';if(expiryWrap)expiryWrap.style.display='none';if(hint)hint.textContent='Jasa bisa memakai stok. Aktifkan sesuai kebutuhan layanan.';
}else{
category.disabled=false;unit.disabled=false;if(stock)stock.disabled=stock.dataset.editing==='1';if(min)min.disabled=false;if(stockField)stockField.style.display='flex';if(minField)minField.style.display='flex';if(expiryTypeField)expiryTypeField.style.display='flex';
if(fromUser&&select){const prevCategory=select.dataset.prevCategory||'Umum',prevUnit=select.dataset.prevUnit||'pcs';category.value=[...category.options].some(o=>o.value===prevCategory)?prevCategory:'Umum';unit.value=[...unit.options].some(o=>o.value===prevUnit)?prevUnit:'pcs';if(stock)stock.value=select.dataset.prevStock||'0';if(min)min.value=select.dataset.prevMin||'0';if(expiryType)expiryType.value=select.dataset.prevExpiryType||'nonexpired';if(expiry&&select.dataset.prevExpiry)expiry.value=select.dataset.prevExpiry}
toggleProductExpiryField();if(hint)hint.textContent='Produk fisik memakai stok seperti biasa.'
}
syncServiceNominalLabelsV519();
}
function openProductModal(id=null){
if(window.innerWidth<=1024){openMobileProductForm(id);return}
const p=id?getProduct(id):null,selectedCategory=p?.category||'Umum',expiryType=p?(productHasExpiry(p)?'expired':'nonexpired'):'nonexpired';
desktopVariantCostDraft={};(p?.variants||['Default']).forEach(v=>desktopVariantCostDraft[v]=Math.max(0,Number(p?.variantCosts?.[v])||0));
showModal(p?'Edit Produk':'Tambah Produk',p?.name||'Buat produk baru dan atur stok awal.',`<div class="form-grid"><div class="field full"><label>Nama Produk</label><input id="pName" value="${esc(p?.name||'')}" placeholder="Nama produk"></div><div class="field full product-purchasable-field-v515"><label>Pembelian Produk</label><button type="button" id="pPurchaseEnabledV515" class="product-purchasable-v515" aria-pressed="true" onclick="toggleProductPurchasableV515('desktop')"><span class="purchase-ico-v515"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h2l2.4 11h11.3l2.1-8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></span><span class="purchase-copy-v515"><b>Bisa Dibeli</b><small>Tersedia saat Pembelian</small></span><span class="purchase-indicator-v515" aria-hidden="true"></span></button></div><div class="field full"><label>Foto Produk (URL, opsional)</label><input id="pImage" value="${esc(p?.image||'')}" placeholder="https://.../foto-produk.jpg"></div><div class="field"><label for="pBarcode">Barcode (Opsional)</label><input id="pBarcode" value="${esc(p?.barcode||'')}" placeholder="Scan / ketik (boleh kosong)"></div>${skuFeatureEnabled()?`<div class="field"><label>SKU Toko (Opsional)</label><input id="pSku" maxlength="48" value="${esc(p?.sku||'')}" placeholder="Contoh: AM-600ML"></div>`:''}${serviceProductEnabled()?`<div class="field full"><label>Jenis Produk</label><select id="pProductKind" onchange="updateDesktopProductKind(true)"><option value="product" ${productKind(p)==='product'?'selected':''}>Produk Fisik</option><option value="service" ${productKind(p)==='service'?'selected':''}>Jasa / Layanan</option></select><small id="pProductKindHint" style="color:var(--muted);margin-top:4px">Produk fisik memakai stok. Jasa dapat memilih pakai stok.</small></div><div class="field full service-stock-field-v517" id="pServiceStockWrapV517" hidden><label for="pServiceStockEnabledV517">Persediaan Jasa</label><label class="service-stock-switch-v517"><span class="service-stock-main-v517"><b>📦 Pakai Stok</b><small>Untuk pulsa dan layanan berkuota.</small></span><input type="checkbox" id="pServiceStockEnabledV517" onchange="updateDesktopProductKind(false)" ${p&&!p.noStock?'checked':''}><span class="service-stock-tick-v517" aria-hidden="true"></span></label></div>`:''}<div class="field"><label>Kategori</label><select id="pCategory">${categoryOptions(selectedCategory)}</select></div><div class="field"><label>Harga Modal</label><input id="pCost" class="nominal-input" type="text" inputmode="numeric" value="${nominal(p?.cost||0)}"></div><div class="field"><label>Harga Ecer</label><input id="pPrice" class="nominal-input" type="text" inputmode="numeric" value="${nominal(p?.price||0)}"></div><div class="field"><label>Harga Grosir</label><input id="pWholesale" class="nominal-input" type="text" inputmode="numeric" value="${nominal(p?.wholesale||0)}"></div><div class="field"><label>Satuan</label><select id="pUnit">${unitOptions(p?.unit||'pcs')}</select></div><div class="field"><label>Stok</label><input id="pStock" type="number" inputmode="numeric" min="0" step="1" data-editing="${p?'1':'0'}" value="${stockQtyIntV227(p?.stock||0)}" ${p?'disabled':''}>${p?'<small style="color:var(--muted);margin-top:4px">Perubahan stok wajib melalui Stok Opname.</small>':''}</div><div class="field full"><label>Varian Produk</label><input id="pVariants" value="${esc((p?.variants||['Default']).join(', '))}" placeholder="Contoh: Original, Pedas, Extra Pedas" oninput="renderDesktopVariantCostRows()"><small style="color:var(--muted);margin-top:4px">Pisahkan setiap varian dengan koma. Biaya akan ditambahkan ke harga jual ketika varian dipilih.</small><div class="variant-cost-list desktop-variant-cost-list" id="pVariantCostList"></div></div><div class="field"><label>Minimum Stok</label><input id="pMin" type="number" inputmode="numeric" min="0" step="1" value="${stockQtyIntV227(p?.min||0)}"></div><div class="field"><label>Masa Berlaku</label><select id="pExpiryType" onchange="toggleProductExpiryField()"><option value="nonexpired" ${expiryType==='nonexpired'?'selected':''}>Non Expired</option><option value="expired" ${expiryType==='expired'?'selected':''}>Expired</option></select></div><div class="field" id="pExpiryWrap"><label>Tanggal Expired</label><input id="pExpiry" type="date" value="${p?.expiry||futureDay(365)}"></div></div>`,[...(p?[{label:p.active===false?'⏻ Aktifkan':'⏻ Nonaktifkan',id:'desktopProductActiveBtnV503',fn:()=>toggleEditedProductActiveV503(p.id)}]:[]),{label:'Batal',close:true},{label:'Simpan Produk',primary:true,fn:()=>{
const name=document.getElementById('pName').value.trim();if(!name)return toast('Nama produk wajib diisi.','error');
const kind=serviceProductEnabled()?(document.getElementById('pProductKind')?.value==='service'?'service':'product'):productKind(p),isService=kind==='service';
const hasExpiry=!isService&&document.getElementById('pExpiryType').value==='expired',expiry=hasExpiry?document.getElementById('pExpiry').value:null;if(hasExpiry&&!expiry)return toast('Tanggal expired wajib diisi untuk produk Expired.','error');
const barcode=document.getElementById('pBarcode').value.trim();
const duplicate=barcode?db.products.find(x=>x.id!==p?.id&&String(x.barcode||'').trim()===barcode):null;if(duplicate)return toast(`Barcode sudah digunakan oleh ${duplicate.name}.`,'error');
const sku=skuFeatureEnabled()?String(document.getElementById('pSku')?.value||'').trim().slice(0,48):String(p?.sku||'');if(sku){const usedSku=db.products.find(x=>x.id!==p?.id&&String(x.sku||'').trim().toLowerCase()===sku.toLowerCase());if(usedSku)return toast(`SKU sudah digunakan oleh ${usedSku.name}.`,'error')}
let variants=[...new Set((document.getElementById('pVariants').value||'Default').split(',').map(v=>v.trim()).filter(Boolean))];if(!variants.length)variants=['Default'];captureDesktopVariantCostDraft();const variantCosts={};variants.forEach(v=>variantCosts[v]=Math.max(0,Number(desktopVariantCostDraft[v])||0));
const serviceStock=!!document.getElementById('pServiceStockEnabledV517')?.checked;if(p&&!p.noStock&&isService&&!serviceStock&&Number(p.stock||0)>0)return toast('Stok masih tersedia. Sesuaikan stok ke 0 sebelum memilih Tanpa Stok.','error');
let productCategory=document.getElementById('pCategory').value||'Umum',productUnit=document.getElementById('pUnit').value||'pcs';if(p&&window.multiUnitSavedRulesV686?.(p).length&&productUnit!==p.unit)return toast('Hapus aturan konversi Multi Satuan sebelum mengganti satuan dasar.','error');if(isService){ensureServiceProductDefaults();if(!productCategory)productCategory='Jasa';if(!productUnit)productUnit='layanan'}const purchaseEnabled=document.getElementById('pPurchaseEnabledV515')?.dataset?.enabled!=='false';const data={purchaseEnabled,name,image:document.getElementById('pImage').value.trim(),sku,barcode,category:productCategory,cost:Math.max(0,parseNominal(document.getElementById('pCost').value)),price:Math.max(0,parseNominal(document.getElementById('pPrice').value)),wholesale:Math.max(0,parseNominal(document.getElementById('pWholesale').value)),wholesaleConfigured:p?p.wholesaleConfigured===true:false,discountConfigured:p?p.discountConfigured===true:false,discountActive:p?p.discountActive!==false:true,discountType:p?.discountType||'percent',discountValue:p?Math.max(0,Number(p.discountValue)||0):0,unit:productUnit,productKind:kind,stock:p?stockQtyIntV227(p.stock):((isService&&!serviceStock)?0:stockQtyIntV227(document.getElementById('pStock').value)),variants,variantCosts,variantsEnabled:!(variants.length===1&&variants[0]==='Default'),manualPrice:!!p?.manualPrice,min:(isService&&!serviceStock)?0:stockQtyIntV227(document.getElementById('pMin').value),noStock:isService?!serviceStock:!!p?.noStock,hasExpiry,expiry,productionType:isService?'nonproduction':(p?.productionType||'')};
if(!db.categories.includes(data.category))db.categories.push(data.category);if(!db.units.includes(data.unit))db.units.push(data.unit);if(p)Object.assign(p,data);else db.products.push({id:Math.max(0,...db.products.map(x=>Number(x.id)||0))+1,emoji:'📦',sold:0,active:true,...data});save();renderAll();closeModal();toast('Produk disimpan.')
}}]);setTimeout(()=>{setProductPurchasableUIV515('desktop',p?.purchaseEnabled!==false);toggleProductExpiryField();renderDesktopVariantCostRows();const kindSelect=document.getElementById('pProductKind');if(kindSelect){['prevCategory','prevUnit','prevStock','prevMin','prevExpiryType','prevExpiry'].forEach(k=>delete kindSelect.dataset[k]);updateDesktopProductKind(false)}else updateDesktopProductKind(false,productKind(p)==='service')},0)
}
function adjustStock(id){const p=getProduct(Number(id));if(!p)return toast('Produk tidak ditemukan.','error');toast('Penyesuaian stok wajib melalui Stok Opname.');openStockOpname()}
let mobileStockOpnameReturnScreen='stock',stockOpnameWorking=null;
function openStockOpname(){
 const current=document.body.dataset.mobileScreen||currentScreenName?.()||'stock';
 mobileStockOpnameReturnScreen=current!=='stock-opname'&&document.getElementById('screen-'+current)?current:'stock';
 stockOpnameWorking={};
 db.products.filter(p=>!p.noStock).forEach(p=>{stockOpnameWorking[p.id]=stockQtyIntV227(p.stock)});
 if(db.settings.stockOpnameDraft){delete db.settings.stockOpnameDraft;save()}
 go('stock-opname');
}
function stockOpnameValue(id){const p=getProduct(id);if(!p)return 0;if(!stockOpnameWorking)stockOpnameWorking={};if(stockOpnameWorking[id]===undefined)stockOpnameWorking[id]=stockQtyIntV227(p.stock);return stockQtyIntV227(stockOpnameWorking[id])}
function stockOpnameDiffMarkup(p){const physical=stockOpnameValue(p.id),system=stockQtyIntV227(p.stock),diff=physical-system,cls=diff>0?'plus':diff<0?'minus':'zero',prefix=diff>0?'+':'';return`<div class="stock-opname-cell stock-opname-diff ${cls}"><small>SELISIH</small><strong>${prefix}${diff}</strong></div>`}
function syncStockOpnameCategoryFilter(){
const select=document.getElementById('stockOpnameCategoryFilter');if(!select)return'';
const current=select.value||'';
const categories=[...new Set(db.products.filter(p=>!p.noStock).map(p=>String(p.category||'Umum').trim()||'Umum'))].sort((a,b)=>a.localeCompare(b,'id'));
select.innerHTML=`<option value="">Semua Kategori</option>${categories.map(cat=>`<option value="${esc(cat)}">${esc(cat)}</option>`).join('')}`;
if(current&&categories.includes(current))select.value=current;else select.value='';
return select.value||'';
}
function renderStockOpnamePage(){
const list=document.getElementById('stockOpnameList');if(!list)return;
if(!stockOpnameWorking){stockOpnameWorking={};db.products.filter(p=>!p.noStock).forEach(p=>stockOpnameWorking[p.id]=stockQtyIntV227(p.stock))}
const q=(document.getElementById('stockOpnameSearch')?.value||'').trim().toLowerCase();
const category=syncStockOpnameCategoryFilter();
const rows=db.products.filter(p=>!p.noStock).filter(p=>!category||String(p.category||'Umum')===category).filter(p=>!q||[p.name,p.barcode,p.category,p.unit].some(v=>String(v||'').toLowerCase().includes(q)));
const changed=db.products.filter(p=>!p.noStock).filter(p=>stockOpnameValue(p.id)!==stockQtyIntV227(p.stock)).length;
const count=document.getElementById('stockOpnameCount'),changedEl=document.getElementById('stockOpnameChanged');if(count)count.textContent=String(rows.length);if(changedEl)changedEl.textContent=String(changed);
list.innerHTML=rows.map(p=>{const physical=stockOpnameValue(p.id),isChanged=physical!==stockQtyIntV227(p.stock);return`<div class="stock-opname-row${isChanged?' is-changed':''}" id="stockOpnameRow-${p.id}"><div class="stock-opname-product"><div class="stock-opname-product-main"><b>${esc(p.name)}</b><span>${esc(p.barcode||'Tanpa barcode')} · ${esc(p.category||'Umum')}</span></div></div><div class="stock-opname-values"><div class="stock-opname-cell"><small>SYSTEM</small><strong>${stockQtyTextV227(p.stock)}</strong></div><div class="stock-opname-cell stock-opname-physical"><small>FISIK</small><div class="stock-opname-input-line"><input type="number" inputmode="numeric" min="0" step="1" value="${physical}" oninput="updateStockOpnameValue(${p.id},this.value)"></div></div>${stockOpnameDiffMarkup(p)}</div></div>`}).join('')||'<div class="stock-opname-empty">Produk tidak ditemukan.</div>';
}
function updateStockOpnameValue(id,value){const p=getProduct(id);if(!p)return;const n=stockQtyIntV227(value);if(!stockOpnameWorking)stockOpnameWorking={};stockOpnameWorking[id]=n;const row=document.getElementById('stockOpnameRow-'+id);if(row){row.classList.toggle('is-changed',n!==stockQtyIntV227(p.stock));const old=row.querySelector('.stock-opname-diff');if(old)old.outerHTML=stockOpnameDiffMarkup(p)}const changed=db.products.filter(x=>!x.noStock).filter(x=>stockOpnameValue(x.id)!==stockQtyIntV227(x.stock)).length;const changedEl=document.getElementById('stockOpnameChanged');if(changedEl)changedEl.textContent=String(changed)}
function resetStockOpnameWorking(){stockOpnameWorking={};db.products.filter(p=>!p.noStock).forEach(p=>stockOpnameWorking[p.id]=stockQtyIntV227(p.stock));renderStockOpnamePage();toast('Stok fisik direset mengikuti stok sistem.')}
let stockOpnameConfirmTime=null,stockOpnameReportFormat='58',stockOpnameLastSavedReport=null;
function stockOpnameCurrentItems(){return db.products.filter(p=>!p.noStock).map(p=>{const system=stockQtyIntV227(p.stock),physical=stockOpnameValue(p.id);return{productId:p.id,name:p.name,barcode:p.barcode||'',system,physical,diff:physical-system}})}
function stockOpnameChangedItems(){return stockOpnameCurrentItems().filter(x=>x.diff!==0)}
function setStockOpnameReportFormat(format){stockOpnameReportFormat=format==='a4'?'a4':'58';document.querySelectorAll('[data-opname-format]').forEach(btn=>btn.classList.toggle('active',btn.dataset.opnameFormat===stockOpnameReportFormat))}
function stockOpnameReportFromForm(){const time=stockOpnameConfirmTime||new Date().toISOString();return{id:'OPN-'+dateKey(time).replaceAll('-','')+'-'+String(new Date(time).getHours()).padStart(2,'0')+String(new Date(time).getMinutes()).padStart(2,'0'),date:time,officer:(document.getElementById('stockOpnameOfficer')?.value||db.settings.cashier||'Petugas').trim()||'Petugas',note:(document.getElementById('stockOpnameNote')?.value||'').trim(),items:stockOpnameCurrentItems()}}
function stockOpnameReportHTML(report,format='58'){
const items=report.items||[],changed=items.filter(x=>x.diff!==0),totalDiff=items.reduce((n,x)=>n+Number(x.diff||0),0),store=esc(db.settings.store||'INPOS'),address=db.settings.address?esc(db.settings.address):'',time=esc(fmtTime(report.date)),officer=esc(report.officer||'Petugas'),note=esc(report.note||'');
if(format==='a4'){
const rows=items.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.name)}</b>${x.barcode?`<div style="font-size:9px;color:#555;margin-top:2px">${esc(x.barcode)}</div>`:''}</td><td class="num">${x.system}</td><td class="num">${x.physical}</td><td class="num" style="font-weight:800">${x.diff>0?'+':''}${x.diff}</td></tr>`).join('');
return`<div class="opname-print-wrap a4" style="color:#111;background:#fff;font-family:Arial,sans-serif"><div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start"><div><div class="opname-print-title" style="font-size:22px;font-weight:900;letter-spacing:.3px">STOK OPNAME</div><div style="font-size:14px;font-weight:800;margin-top:3px">${store}</div>${address?`<div style="font-size:10px;color:#555;margin-top:2px">${address}</div>`:''}</div><div style="text-align:right;font-size:10px"><div><b>No. Dokumen</b></div><div>${esc(report.id||'-')}</div></div></div><div style="height:1px;background:#222;margin:14px 0 10px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 18px;font-size:11px"><div><b>Tanggal/Waktu:</b> ${time}</div><div><b>Petugas:</b> ${officer}</div>${note?`<div style="grid-column:1/-1"><b>Catatan:</b> ${note}</div>`:''}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0"><div style="border:1px solid #bbb;border-radius:7px;padding:8px;text-align:center"><div style="font-size:9px;color:#666;font-weight:700">PRODUK</div><b style="font-size:16px">${items.length}</b></div><div style="border:1px solid #bbb;border-radius:7px;padding:8px;text-align:center"><div style="font-size:9px;color:#666;font-weight:700">BERBEDA</div><b style="font-size:16px">${changed.length}</b></div><div style="border:1px solid #bbb;border-radius:7px;padding:8px;text-align:center"><div style="font-size:9px;color:#666;font-weight:700">TOTAL SELISIH</div><b style="font-size:16px">${totalDiff>0?'+':''}${totalDiff}</b></div></div><table class="opname-print-table" style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr><th>No</th><th>Produk</th><th class="num">System</th><th class="num">Fisik</th><th class="num">Selisih</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:14px;padding-top:8px;border-top:1px solid #bbb;display:flex;justify-content:space-between;font-size:9px;color:#666"><span>INPOS · www.inpos.id</span><span>${time}</span></div></div>`;
}
const rows=items.map((x,i)=>`<div style="padding:5px 0;border-bottom:1px dashed #aaa"><div style="font-weight:800;line-height:1.25">${i+1}. ${esc(x.name)}</div>${x.barcode?`<div style="font-size:7px;color:#555;margin-top:1px">${esc(x.barcode)}</div>`:''}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-top:4px;text-align:center"><div><small style="font-size:7px;color:#666">SYSTEM</small><div style="font-weight:900">${x.system}</div></div><div><small style="font-size:7px;color:#666">FISIK</small><div style="font-weight:900">${x.physical}</div></div><div><small style="font-size:7px;color:#666">SELISIH</small><div style="font-weight:900">${x.diff>0?'+':''}${x.diff}</div></div></div></div>`).join('');
return`<div class="opname-print-wrap thermal" style="color:#111;background:#fff;font-family:'Courier New',monospace"><div style="text-align:center"><div class="opname-print-title" style="font-size:14px;font-weight:900">STOK OPNAME</div><div style="font-size:10px;font-weight:800;margin-top:2px">${store}</div>${address?`<div style="font-size:7px;margin-top:2px">${address}</div>`:''}</div><div style="border-top:1px dashed #555;margin:7px 0"></div><div style="font-size:8px;line-height:1.4"><div><b>Tanggal:</b> ${time}</div><div><b>Petugas:</b> ${officer}</div>${note?`<div><b>Catatan:</b> ${note}</div>`:''}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin:7px 0;text-align:center;font-size:8px"><div style="border:1px solid #aaa;padding:4px 2px"><small>PRODUK</small><b style="display:block;font-size:11px">${items.length}</b></div><div style="border:1px solid #aaa;padding:4px 2px"><small>BEDA</small><b style="display:block;font-size:11px">${changed.length}</b></div><div style="border:1px solid #aaa;padding:4px 2px"><small>SELISIH</small><b style="display:block;font-size:11px">${totalDiff>0?'+':''}${totalDiff}</b></div></div>${rows}<div style="border-top:1px dashed #555;margin:7px 0 5px"></div><div style="font-size:7px;text-align:center">${esc(report.id||'')}<br>INPOS · www.inpos.id</div></div>`;
}
function openStockOpnameConfirm(){
if(!stockOpnameWorking){stockOpnameWorking={};db.products.filter(p=>!p.noStock).forEach(p=>stockOpnameWorking[p.id]=stockQtyIntV227(p.stock))}
stockOpnameConfirmTime=new Date().toISOString();stockOpnameReportFormat='58';
const items=stockOpnameCurrentItems(),changed=items.filter(x=>x.diff!==0).length,totalDiff=items.reduce((n,x)=>n+x.diff,0);
showModal('Simpan Stok Opname','Lengkapi data lalu simpan opname.',`<div class="stock-opname-confirm-grid"><div class="stock-opname-confirm-top"><div class="field"><label>Tanggal / Waktu <span style="color:var(--muted);font-weight:700">(Otomatis)</span></label><input id="stockOpnameDateTime" readonly value="${esc(fmtTime(stockOpnameConfirmTime))}"></div><div class="field stock-opname-officer-field"><label>Petugas</label><input id="stockOpnameOfficer" value="${esc(db.settings.cashier||'Kasir')}" placeholder="Nama petugas"></div></div><div class="field full"><label>Catatan</label><textarea id="stockOpnameNote" rows="2" placeholder="Opsional, contoh: opname akhir shift"></textarea></div></div><div class="stock-opname-confirm-summary"><div class="stock-opname-confirm-stat"><small>Produk</small><b>${items.length}</b></div><div class="stock-opname-confirm-stat"><small>Berbeda</small><b>${changed}</b></div><div class="stock-opname-confirm-stat"><small>Selisih</small><b>${totalDiff>0?'+':''}${totalDiff}</b></div></div>`,[{label:'Batal',close:true},{label:'Simpan Opname',primary:true,fn:commitStockOpname}]);
document.getElementById('overlay')?.classList.add('stock-opname-confirm-overlay');document.getElementById('modalBox')?.classList.add('stock-opname-confirm-modal');
}
function saveStockOpnameDraft(){openStockOpnameConfirm()}
function commitStockOpname(){
const report=stockOpnameReportFromForm();if(!report.officer)return toast('Nama petugas wajib diisi.','error');
report.items.forEach(x=>{const p=getProduct(x.productId);if(p&&!p.noStock)p.stock=stockQtyIntV227(x.physical)});
if(!Array.isArray(db.settings.stockOpnameHistory))db.settings.stockOpnameHistory=[];db.settings.stockOpnameHistory.unshift(report);db.settings.stockOpnameHistory=db.settings.stockOpnameHistory.slice(0,50);delete db.settings.stockOpnameDraft;
stockOpnameLastSavedReport=JSON.parse(JSON.stringify(report));
save();closeModal();stockOpnameWorking=null;renderAll();toast('Stok opname berhasil disimpan.');openStockOpnameSavedActions(stockOpnameLastSavedReport);
}
function openStockOpnameSavedActions(report){
if(!report)return closeStockOpnamePage();
stockOpnameLastSavedReport=report;stockOpnameReportFormat='58';
const items=report.items||[],changed=items.filter(x=>Number(x.diff||0)!==0).length,totalDiff=items.reduce((n,x)=>n+Number(x.diff||0),0);
showModal('Stok Opname Tersimpan','Opname berhasil disimpan. Cetak atau bagikan laporan bila diperlukan.',`<div class="stock-opname-confirm-summary"><div class="stock-opname-confirm-stat"><small>Produk</small><b>${items.length}</b></div><div class="stock-opname-confirm-stat"><small>Berbeda</small><b>${changed}</b></div><div class="stock-opname-confirm-stat"><small>Selisih</small><b>${totalDiff>0?'+':''}${totalDiff}</b></div></div><div class="stock-opname-report-tools"><small>Cetak / Share PNG</small><div class="stock-opname-format"><button type="button" class="active" data-opname-format="58" onclick="setStockOpnameReportFormat('58')">58 mm</button><button type="button" data-opname-format="a4" onclick="setStockOpnameReportFormat('a4')">A4</button></div><div class="stock-opname-export-actions"><button class="btn" type="button" onclick="printStockOpnameReport(stockOpnameLastSavedReport)">🖨 Cetak</button><button class="btn" type="button" onclick="shareStockOpnamePNG(stockOpnameLastSavedReport)">↗ Share PNG</button></div></div>`,[{label:'Selesai',primary:true,fn:()=>{closeModal();closeStockOpnamePage()}}]);
document.getElementById('overlay')?.classList.add('stock-opname-confirm-overlay');document.getElementById('modalBox')?.classList.add('stock-opname-confirm-modal');
}
function printStockOpnameReport(reportOverride=null){const report=reportOverride||stockOpnameLastSavedReport||stockOpnameReportFromForm(),format=stockOpnameReportFormat==='a4'?'a4':'58',zone=document.getElementById('printZone');if(!zone)return toast('Area cetak tidak tersedia.','error');zone.className=`printable opname-report-${format}`;zone.innerHTML=stockOpnameReportHTML(report,format);setTimeout(()=>window.print(),60)}
function stockOpnameCanvas(report,format='58'){
const a4=format==='a4',items=report.items||[],changed=items.filter(x=>x.diff!==0),totalDiff=items.reduce((n,x)=>n+Number(x.diff||0),0),canvas=document.createElement('canvas'),c=canvas.getContext('2d');
const width=a4?1240:384,pad=a4?64:22,body=a4?18:14,title=a4?34:24;
const wrap=(txt,max)=>{txt=String(txt||'');const words=txt.split(/\s+/),out=[];let line='';words.forEach(w=>{const test=line?line+' '+w:w;if(test.length>max&&line){out.push(line);line=w}else line=test});if(line)out.push(line);return out.length?out:['']};
const noteLines=report.note?wrap('Catatan: '+report.note,a4?105:42):[];
const itemHeights=items.map(x=>a4?34:(wrap(x.name,31).length*17+44));
const contentH=a4?(360+items.length*34+100):(235+noteLines.length*17+itemHeights.reduce((a,b)=>a+b,0)+70);
canvas.width=width;canvas.height=Math.max(a4?1754:contentH,contentH);c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#111';c.textBaseline='top';let y=pad;
const line=(ypos)=>{c.strokeStyle='#777';c.beginPath();c.moveTo(pad,ypos);c.lineTo(width-pad,ypos);c.stroke()};
const center=(txt,font,step)=>{c.font=font;c.textAlign='center';c.fillText(String(txt),width/2,y);y+=step};
center('STOK OPNAME',`900 ${title}px Arial`,title+8);center(String(db.settings.store||'INPOS'),`700 ${body}px Arial`,body+8);
if(db.settings.address){c.font=`${a4?14:11}px Arial`;c.fillStyle='#555';c.textAlign='center';c.fillText(String(db.settings.address).slice(0,a4?120:48),width/2,y);y+=a4?22:17;c.fillStyle='#111'}
line(y);y+=12;c.textAlign='left';c.font=`${body}px Arial`;c.fillText(`Tanggal/Waktu: ${fmtTime(report.date)}`,pad,y);y+=body+8;c.fillText(`Petugas: ${report.officer||'Petugas'}`,pad,y);y+=body+8;
noteLines.forEach(t=>{c.fillText(t,pad,y);y+=body+5});y+=4;
const boxGap=a4?12:6,boxW=(width-pad*2-boxGap*2)/3,boxH=a4?66:50,stats=[['PRODUK',items.length],['BERBEDA',changed.length],['SELISIH',(totalDiff>0?'+':'')+totalDiff]];
stats.forEach((st,i)=>{const x=pad+i*(boxW+boxGap);c.strokeStyle='#aaa';c.strokeRect(x,y,boxW,boxH);c.textAlign='center';c.fillStyle='#666';c.font=`700 ${a4?13:9}px Arial`;c.fillText(st[0],x+boxW/2,y+(a4?10:7));c.fillStyle='#111';c.font=`900 ${a4?24:16}px Arial`;c.fillText(String(st[1]),x+boxW/2,y+(a4?29:22))});y+=boxH+14;
if(a4){
c.textAlign='left';c.font=`700 ${body}px Arial`;c.fillText('No',pad,y);c.fillText('Produk',pad+58,y);c.textAlign='right';c.fillText('System',width-300,y);c.fillText('Fisik',width-185,y);c.fillText('Selisih',width-pad,y);y+=body+8;line(y);y+=8;c.font=`${body}px Arial`;
items.forEach((x,i)=>{c.textAlign='left';c.fillText(String(i+1),pad,y);let name=String(x.name||'Produk');if(name.length>56)name=name.slice(0,55)+'…';c.fillText(name,pad+58,y);c.textAlign='right';c.fillText(String(x.system),width-300,y);c.fillText(String(x.physical),width-185,y);c.fillText((x.diff>0?'+':'')+x.diff,width-pad,y);y+=34});
}else{
items.forEach((x,i)=>{const names=wrap(`${i+1}. ${x.name}`,31);c.textAlign='left';c.font=`700 ${body}px Arial`;names.forEach(n=>{c.fillText(n,pad,y);y+=17});if(x.barcode){c.fillStyle='#666';c.font='10px Arial';c.fillText(String(x.barcode).slice(0,35),pad,y);y+=14;c.fillStyle='#111'}const w=(width-pad*2)/3,labels=[['SYSTEM',x.system],['FISIK',x.physical],['SELISIH',(x.diff>0?'+':'')+x.diff]];labels.forEach((st,j)=>{const cx=pad+j*w+w/2;c.textAlign='center';c.fillStyle='#666';c.font='700 9px Arial';c.fillText(st[0],cx,y);c.fillStyle='#111';c.font='900 15px Arial';c.fillText(String(st[1]),cx,y+13)});y+=36;line(y);y+=8});
}
y+=4;line(y);y+=10;c.textAlign='center';c.fillStyle='#555';c.font=`${a4?14:10}px Arial`;c.fillText(String(report.id||''),width/2,y);y+=a4?20:14;c.fillText('INPOS · www.inpos.id',width/2,y);return canvas;
}
async function shareStockOpnamePNG(reportOverride=null){const report=reportOverride||stockOpnameLastSavedReport||stockOpnameReportFromForm(),format=stockOpnameReportFormat==='a4'?'a4':'58',canvas=stockOpnameCanvas(report,format),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat PNG.','error');const file=new File([blob],`stok-opname-${dateKey(report.date)}-${format}.png`,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:'Stok Opname '+dateKey(report.date),text:`Stok Opname ${db.settings.store||'INPOS'}`,files:[file]});return}catch(e){if(e?.name==='AbortError')return}}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast('PNG dibuat. Pilih Bagikan dari file jika browser tidak mendukung share langsung.')}
function closeStockOpnamePage(){stockOpnameWorking=null;const back=pageMeta[mobileStockOpnameReturnScreen]?mobileStockOpnameReturnScreen:'stock';go(back)}
function ean13CheckDigit(base12){const digits=String(base12||'').replace(/\D/g,'').slice(0,12);if(digits.length!==12)return null;let sum=0;for(let i=0;i<12;i++)sum+=Number(digits[i])*(i%2===0?1:3);return String((10-(sum%10))%10)}
function ean13IsValid(code){const d=String(code||'').replace(/\D/g,'');return d.length===13&&ean13CheckDigit(d.slice(0,12))===d[12]}
function ean13FromBase(base){const d=String(base||'').replace(/\D/g,'').slice(0,12);return d.length===12?d+ean13CheckDigit(d):''}
function ean13IndonesiaCandidate(product,offset=0){const idRaw=Math.abs(Number(product?.id)||0),serial=(idRaw+Math.max(0,Number(offset)||0))%1000000000,base='899'+String(serial).padStart(9,'0');return ean13FromBase(base)}
function productEan13(product){if(!product)return'';const saved=String(product.ean13||'').replace(/\D/g,'');if(saved.startsWith('899')&&ean13IsValid(saved))return saved;const primary=String(product.barcode||'').replace(/\D/g,'');if(primary.startsWith('899')&&ean13IsValid(primary))return primary;return''}
function ensureProductEan13(product,force=false){if(!product)return'';if(!force){const existing=productEan13(product);if(existing){if(product.ean13!==existing){product.ean13=existing;save()}return existing}}let offset=force?1:0,code='';for(let i=0;i<10000;i++,offset++){code=ean13IndonesiaCandidate(product,offset);const used=db.products.find(x=>Number(x.id)!==Number(product.id)&&productBarcodeList(x,true).includes(code));if(!used)break}product.ean13=code;save();return code}
function regenerateSelectedProductEan13(){const p=getProduct(Number(labelPageState.productId));if(!p)return toast('Pilih produk terlebih dahulu.','error');const code=ensureProductEan13(p,true);renderLabelProductPicker();updateLabelPreview();toast(`EAN-13 baru dibuat: ${code}`)}
function ean13Bits(code){const d=String(code||'').replace(/\D/g,'');if(!ean13IsValid(d))return'';const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],G=['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'],R=['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'],parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];let bits='101',p=parity[Number(d[0])];for(let i=1;i<=6;i++)bits+=(p[i-1]==='L'?L:G)[Number(d[i])];bits+='01010';for(let i=7;i<=12;i++)bits+=R[Number(d[i])];return bits+'101'}
function labelBarcodeSVG(code){const d=String(code||'').replace(/\D/g,'');if(!ean13IsValid(d))return'<span style="font-size:10px;color:#777">EAN-13 tidak valid</span>';const bits=ean13Bits(d),module=2,quiet=9,w=(95+quiet*2)*module,h=62,barH=46,guard=new Set([0,1,2,45,46,47,48,49,92,93,94]);let bars='';for(let i=0;i<bits.length;i++)if(bits[i]==='1'){const bh=guard.has(i)?52:barH;bars+=`<rect x="${(quiet+i)*module}" y="0" width="${module}" height="${bh}" fill="#000"/>`}const first=d[0],left=d.slice(1,7),right=d.slice(7);return`<svg class="ean13-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="EAN-13 ${d}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/>${bars}<text x="${(quiet-2)*module}" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.2" fill="#000">${first}</text><text x="${(quiet+24)*module}" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.2" letter-spacing="2.25" fill="#000">${left}</text><text x="${(quiet+71)*module}" y="61" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.2" letter-spacing="2.25" fill="#000">${right}</text></svg>`}
function labelFieldConfig(){
if(!db.settings||typeof db.settings!=='object')db.settings={};
if(!db.settings.labelFields||typeof db.settings.labelFields!=='object')db.settings.labelFields={};
const defaults={price:true,store:true,barcode:true,product:true};
Object.keys(defaults).forEach(k=>{if(typeof db.settings.labelFields[k]!=='boolean')db.settings.labelFields[k]=defaults[k]});
return db.settings.labelFields
}
function labelFieldEnabled(key){return labelFieldConfig()[key]!==false}
function labelStoreName(){return String(db.settings?.store||'INPOS').trim()||'INPOS'}
function syncLabelFieldControls(){const cfg=labelFieldConfig(),ids={price:'labelShowPrice',store:'labelShowStore',barcode:'labelShowBarcode',product:'labelShowProduct'};Object.entries(ids).forEach(([key,id])=>{const el=document.getElementById(id);if(el)el.checked=cfg[key]!==false})}
function setLabelFieldVisibility(key,enabled){if(!['price','store','barcode','product'].includes(String(key)))return;labelFieldConfig()[key]=!!enabled;save();syncLabelFieldControls();updateLabelPreview()}
const labelPageState={productId:null,size:'40',qty:1};
function labelPageProducts(){return sortProductsNatural(db.products||[])}
function labelPageChange(key,value){if(key==='product')labelPageState.productId=Number(value)||null;else if(key==='size')labelPageState.size=['40','50','58'].includes(String(value))?String(value):'40';else if(key==='qty')labelPageState.qty=Math.max(1,Math.min(100,Math.round(Number(value)||1)));if(key==='product')renderLabelProductPicker();updateLabelPreview()}
function selectLabelProduct(id){const product=getProduct(Number(id));if(!product)return;labelPageState.productId=Number(id);ensureProductEan13(product);renderLabelProductPicker();updateLabelPreview()}
function renderLabelProductPicker(){
const picker=document.getElementById('labelProductPicker');if(!picker)return;
const q=String(document.getElementById('labelProductSearch')?.value||'').trim().toLowerCase(),all=labelPageProducts().filter(p=>!q||[p.name,p.sku,p.barcode,p.ean13,p.category].some(v=>String(v||'').toLowerCase().includes(q)));
if(!all.length){picker.innerHTML='<div class="label-product-picker-empty">Produk tidak ditemukan.</div>';return}
const mobile=window.matchMedia?.('(max-width:1024px)')?.matches;
let products=all,extra=0;
if(mobile){
if(!q){const current=all.find(p=>Number(p.id)===Number(labelPageState.productId));products=current?[current]:all.slice(0,1);extra=Math.max(0,all.length-products.length)}
else{products=all.slice(0,2);extra=Math.max(0,all.length-products.length)}
}
const html=products.map(p=>{const active=Number(p.id)===Number(labelPageState.productId),stock=p.noStock?'∞':Number(p.stock||0).toLocaleString('id-ID'),ean=productEan13(p);return`<button class="label-product-option ${active?'active':''}" type="button" onclick="selectLabelProduct(${Number(p.id)})" aria-pressed="${active?'true':'false'}"><span class="label-product-option-main"><b>${esc(p.name)}</b><small>${ean?`EAN-13 ${esc(ean)}`:esc(p.barcode||'Belum EAN-13')} • ${esc(p.category||'Umum')}</small></span><span class="label-product-option-side"><strong>${rupiah(p.price||0)}</strong><span>${active?'✓ Dipilih':'Stok '+stock}</span></span></button>`}).join('');
picker.innerHTML=html+(mobile&&extra?`<div class="label-product-picker-more">${q?`+${extra} hasil lain`:'Cari nama / barcode untuk ganti produk'}</div>`:'')
}
function setLabelMobilePreview(mode='label'){
const next=mode==='a4'?'a4':'label',body=document.querySelector('#screen-labels .label-page-body');if(body)body.dataset.labelMobilePreview=next;
document.querySelectorAll('#screen-labels [data-label-preview-tab]').forEach(btn=>{const active=btn.dataset.labelPreviewTab===next;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',active?'true':'false')})
}
function renderLabelPage(){
const products=labelPageProducts(),sizeSelect=document.getElementById('labelSizeSelect'),qtyInput=document.getElementById('labelQtyInput');
if(!products.length){labelPageState.productId=null;syncLabelFieldControls();renderLabelProductPicker();updateLabelPreview();return}
if(!products.some(p=>Number(p.id)===Number(labelPageState.productId)))labelPageState.productId=Number(products[0].id);
const selected=getProduct(Number(labelPageState.productId));if(selected)ensureProductEan13(selected);
if(sizeSelect)sizeSelect.value=labelPageState.size;if(qtyInput)qtyInput.value=labelPageState.qty;syncLabelFieldControls();renderLabelProductPicker();updateLabelPreview()
}
function labelA4Layout(size){
const s=String(size||'40');
if(s==='50')return{cols:3,rows:8,capacity:24,labelW:50,labelH:30,gap:3};
if(s==='58')return{cols:3,rows:7,capacity:21,labelW:58,labelH:34,gap:3};
return{cols:4,rows:8,capacity:32,labelW:40,labelH:30,gap:3}
}
function updateLabelA4Preview(){
const box=document.getElementById('labelA4Preview'),info=document.getElementById('labelA4PreviewInfo'),pageCount=document.getElementById('labelA4PageCount');if(!box)return;
const p=getProduct(Number(labelPageState.productId)),size=document.getElementById('labelSizeSelect')?.value||labelPageState.size||'40',qty=Math.max(1,Math.min(100,Math.round(Number(document.getElementById('labelQtyInput')?.value||labelPageState.qty)||1))),layout=labelA4Layout(size),pages=Math.max(1,Math.ceil(qty/layout.capacity));
if(pageCount)pageCount.textContent=`${pages} halaman`;if(info)info.textContent=`A4 • ${layout.cols} kolom • maksimal ${layout.capacity} label / halaman`;
if(!p){box.innerHTML='<div style="display:grid;place-items:center;height:100%;color:#777;font-size:11px;text-align:center">Pilih produk untuk melihat preview A4.</div>';return}
const ean=ensureProductEan13(p),vis=labelFieldConfig(),store=labelStoreName(),visible=Math.min(qty,layout.capacity),pageW=210-20,pageH=297-20,scaleX=228/pageW,scaleY=321/pageH,labelPxW=Math.max(20,layout.labelW*scaleX),labelPxH=Math.max(18,layout.labelH*scaleY),gapPx=Math.max(2,layout.gap*Math.min(scaleX,scaleY));
const item=()=>`<div class="label-a4-mini" style="width:${labelPxW.toFixed(1)}px;height:${labelPxH.toFixed(1)}px">${vis.store?`<div class="mini-store">${esc(store)}</div>`:''}${vis.product?`<div class="mini-name">${esc(p.name)}</div>`:''}<div class="mini-bars">${labelBarcodeSVG(ean)}</div>${vis.barcode?`<div class="mini-code">${esc(ean)}</div>`:''}${vis.price?`<div class="mini-price">${rupiah(p.price||0)}</div>`:''}</div>`;
box.innerHTML=`<div class="label-a4-page-grid" style="grid-template-columns:repeat(${layout.cols},${labelPxW.toFixed(1)}px);grid-auto-rows:${labelPxH.toFixed(1)}px;gap:${gapPx.toFixed(1)}px">${Array.from({length:visible},item).join('')}</div>${qty>visible?`<div class="label-a4-more">+${qty-visible} label • halaman berikutnya</div>`:''}`
}
function printLabelsA4(){
const p=getProduct(Number(labelPageState.productId));if(!p)return toast('Pilih produk terlebih dahulu.','error');
const ean=ensureProductEan13(p);if(!ean13IsValid(ean))return toast('Barcode EAN-13 tidak valid.','error');
const qty=Math.max(1,Math.min(100,Math.round(Number(document.getElementById('labelQtyInput')?.value||labelPageState.qty)||1))),size=document.getElementById('labelSizeSelect')?.value||labelPageState.size||'40',layout=labelA4Layout(size),zone=document.getElementById('printZone');if(!zone)return toast('Area cetak tidak tersedia.','error');
const sizeClass=size==='50'?'size-50':size==='58'?'size-58':'size-40',vis=labelFieldConfig(),store=labelStoreName(),all=Array.from({length:qty},(_,i)=>i),pages=[];for(let i=0;i<all.length;i+=layout.capacity)pages.push(all.slice(i,i+layout.capacity));
const label=()=>`<div class="label-print-item ${sizeClass}" style="width:${layout.labelW}mm;height:${layout.labelH}mm;min-height:${layout.labelH}mm">${vis.store?`<div class="label-print-store">${esc(store)}</div>`:''}${vis.product?`<div class="label-print-name">${esc(p.name)}</div>`:''}<div class="label-print-bars">${labelBarcodeSVG(ean)}</div>${vis.barcode?`<div class="label-print-code">${esc(ean)}</div>`:''}${vis.price?`<div class="label-print-price">${rupiah(p.price||0)}</div>`:''}</div>`;
zone.innerHTML=`<div class="printable label-a4-print-document">${pages.map(pg=>`<section class="label-a4-print-page"><div class="label-a4-print-grid" style="grid-template-columns:repeat(${layout.cols},${layout.labelW}mm);grid-auto-rows:${layout.labelH}mm;gap:${layout.gap}mm">${pg.map(label).join('')}</div></section>`).join('')}</div>`;
setTimeout(()=>window.print(),100)
}
function updateLabelPreview(){
const preview=document.getElementById('labelPreview'),info=document.getElementById('labelPreviewInfo'),count=document.getElementById('labelPreviewCount'),eanInput=document.getElementById('labelEan13Input'),eanStatus=document.getElementById('labelEan13Status');if(!preview)return;
const sizeEl=document.getElementById('labelSizeSelect'),qtyEl=document.getElementById('labelQtyInput');
if(sizeEl?.value)labelPageState.size=['40','50','58'].includes(sizeEl.value)?sizeEl.value:'40';if(qtyEl?.value)labelPageState.qty=Math.max(1,Math.min(100,Math.round(Number(qtyEl.value)||1)));
const p=getProduct(Number(labelPageState.productId)),qty=labelPageState.qty,size=labelPageState.size,sizeText=size==='40'?'40 × 30 mm':size==='50'?'50 × 30 mm':'58 mm roll',ean=p?ensureProductEan13(p):'';
if(eanInput)eanInput.value=ean;if(eanStatus){const valid=ean.startsWith('899')&&ean13IsValid(ean);eanStatus.textContent=valid?'EAN-13 valid • Prefix 899 • Checksum sesuai':'EAN-13 belum valid';eanStatus.classList.toggle('valid',valid);eanStatus.classList.toggle('invalid',!valid)}
if(count)count.textContent=`${qty} label`;if(info)info.textContent=`${sizeText} • ${p?.name||'Belum ada produk'}`;
if(!p){preview.innerHTML='<div class="label-preview-empty"><div><b>Belum ada produk</b><br>Tambahkan produk terlebih dahulu untuk membuat label.</div></div>';updateLabelA4Preview();return}
const vis=labelFieldConfig(),store=labelStoreName(),visible=Math.min(qty,6),sizeClass=`size-${size}`,card=()=>`<div class="label-preview-card-new ${sizeClass}">${vis.store?`<div class="label-store">${esc(store)}</div>`:''}${vis.product?`<div class="label-name">${esc(p.name)}</div>`:''}<div class="label-bars">${labelBarcodeSVG(ean)}</div>${vis.barcode?`<div class="label-code">${esc(ean)}</div>`:''}${vis.price?`<div class="label-price">${rupiah(p.price||0)}</div>`:''}</div>`;
preview.innerHTML=Array.from({length:visible},card).join('')+(qty>visible?`<div class="label-preview-more">+${qty-visible}<br>label</div>`:'');updateLabelA4Preview()
}
function printSelectedLabels(){
const p=getProduct(Number(labelPageState.productId));if(!p)return toast('Pilih produk terlebih dahulu.','error');
const ean=ensureProductEan13(p);if(!ean13IsValid(ean))return toast('Barcode EAN-13 tidak valid.','error');
const qty=Math.max(1,Math.min(100,Math.round(Number(document.getElementById('labelQtyInput')?.value||labelPageState.qty)||1))),size=document.getElementById('labelSizeSelect')?.value||labelPageState.size||'40';
const zone=document.getElementById('printZone');if(!zone)return toast('Area cetak tidak tersedia.','error');
const sizeClass=size==='50'?'size-50':size==='58'?'size-58':'size-40',vis=labelFieldConfig(),store=labelStoreName();
zone.innerHTML=`<div class="printable label-print-sheet">${Array.from({length:qty},()=>`<div class="label-print-item ${sizeClass}">${vis.store?`<div class="label-print-store">${esc(store)}</div>`:''}${vis.product?`<div class="label-print-name">${esc(p.name)}</div>`:''}<div class="label-print-bars">${labelBarcodeSVG(ean)}</div>${vis.barcode?`<div class="label-print-code">${esc(ean)}</div>`:''}${vis.price?`<div class="label-print-price">${rupiah(p.price||0)}</div>`:''}</div>`).join('')}</div>`;
setTimeout(()=>window.print(),80)
}
function openLabels(){go('labels')}
function purchaseRelationFilterConfig(kind){
const configs={
purchase:{statusId:'purchaseHistoryStatusFilter',searchId:'purchaseMobileSearch',panelId:'purchaseMobileSearchPanel',valueId:'purchaseMobileStatusValue',countId:'purchaseMobileFilterCount',sortKey:'purchaseMobileSort',defaultSort:'newest',periodKey:'purchaseMobilePeriod',dayKey:'purchaseMobileDay',monthKey:'purchaseMobileMonth',yearKey:'purchaseMobileYear',totalLabel:'Total Pembelian',title:'Filter Pembelian',subtitle:'Atur status, periode, dan urutan riwayat pembelian.',pickerTitle:'Status Pembelian',pickerSub:'Pilih status pembelian yang ingin ditampilkan.',statuses:[['all','Semua'],['draft','Draf'],['paid','Lunas'],['debt','Ada Hutang']],sorts:[['newest','Terbaru'],['oldest','Terlama']]},
supplier:{statusId:'supplierDebtFilter',searchId:'supplierMobileSearch',panelId:'supplierMobileSearchPanel',valueId:'supplierMobileStatusValue',countId:'supplierMobileFilterCount',sortKey:'supplierMobileSort',defaultSort:'name-asc',title:'Filter Supplier',subtitle:'Atur status dan urutan daftar supplier.',pickerTitle:'Status Supplier',pickerSub:'Pilih status supplier yang ingin ditampilkan.',statuses:[['all','Semua'],['debt','Punya Hutang'],['clear','Tanpa Hutang']],sorts:[['name-asc','Nama A–Z'],['name-desc','Nama Z–A'],['debt-desc','Hutang Terbesar']]},
debt:{statusId:'debtBookStatusFilter',searchId:'supplierDebtMobileSearch',panelId:'supplierDebtMobileSearchPanel',valueId:'supplierDebtMobileStatusValue',countId:'supplierDebtMobileFilterCount',sortKey:'supplierDebtMobileSort',defaultSort:'newest',periodKey:'supplierDebtMobilePeriod',dayKey:'supplierDebtMobileDay',monthKey:'supplierDebtMobileMonth',yearKey:'supplierDebtMobileYear',totalLabel:'Total Hutang',title:'Filter Hutang Supplier',subtitle:'Atur status, periode, dan urutan hutang supplier.',pickerTitle:'Status Hutang Supplier',pickerSub:'Pilih status hutang yang ingin ditampilkan.',statuses:[['all','Semua'],['unpaid','Belum Bayar'],['installment','Dicicil']],sorts:[['newest','Terbaru'],['oldest','Terlama'],['amount-desc','Hutang Terbesar']]}
};
return configs[kind]||configs.purchase
}
function renderPurchaseRelationKind(kind){if(kind==='purchase')renderPurchases();else if(kind==='supplier')renderSuppliers();else renderDebts()}
function syncPurchaseRelationMobileFilterUI(kind){
const c=purchaseRelationFilterConfig(kind),status=document.getElementById(c.statusId)?.value||'all',sort=window[c.sortKey]||c.defaultSort,label=(c.statuses.find(x=>x[0]===status)||c.statuses[0])[1],period=c.periodKey?(window[c.periodKey]||''):'';
const value=document.getElementById(c.valueId);if(value)value.textContent=label;
const n=(status!=='all'?1:0)+(sort!==c.defaultSort?1:0)+(period?1:0),count=document.getElementById(c.countId);if(count){count.textContent=String(n);count.hidden=!n}
}
function togglePurchaseRelationSearch(kind,force){const c=purchaseRelationFilterConfig(kind),panel=document.getElementById(c.panelId);if(!panel)return;const open=force===undefined?!panel.classList.contains('open'):!!force;panel.classList.toggle('open',open);if(open)setTimeout(()=>document.getElementById(c.searchId)?.focus(),40)}
function setPurchaseRelationStatus(kind,value){const c=purchaseRelationFilterConfig(kind),el=document.getElementById(c.statusId);if(kind==='debt')syncDebtBookStatusFilter(true);if(el)el.value=value;renderPurchaseRelationKind(kind)}
function openPurchaseRelationStatusPicker(kind){const c=purchaseRelationFilterConfig(kind);if(kind==='debt')syncDebtBookStatusFilter(true);const active=document.getElementById(c.statusId)?.value||'all',rows=c.statuses.map(([v,l])=>`<button class="stock-mobile-action${v===active?' active':''}" type="button" onclick="closeModal();setPurchaseRelationStatus('${kind}','${v}')"><span class="ico">${v===active?'✓':'▣'}</span><span>${esc(l)}</span></button>`).join('');showModal(c.pickerTitle,c.pickerSub,`<div class="stock-mobile-action-list">${rows}</div>`,[{label:'Tutup',close:true}],true)}
function purchaseRelationPeriodDraft(kind,fromPopup=false){
const c=purchaseRelationFilterConfig(kind),now=new Date();
const period=fromPopup?(document.querySelector('.expense-filter-period-btn.active')?.dataset.period||''):(c.periodKey?(window[c.periodKey]||''):'');
return{period,day:fromPopup?(document.getElementById('purchaseRelationFilterDay')?.value||todayKey()):(c.dayKey?(window[c.dayKey]||todayKey()):todayKey()),month:fromPopup?(document.getElementById('purchaseRelationFilterMonth')?.value||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`):(c.monthKey?(window[c.monthKey]||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`):''),year:fromPopup?(document.getElementById('purchaseRelationFilterYear')?.value||String(now.getFullYear())):(c.yearKey?(window[c.yearKey]||String(now.getFullYear())):'')}
}
function purchaseRelationDateMatch(date,draft){if(!draft?.period)return true;const d=new Date(date);if(Number.isNaN(d.getTime()))return false;if(draft.period==='day')return!draft.day||dateKey(d)===draft.day;if(draft.period==='month')return!draft.month||`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===draft.month;if(draft.period==='year')return!draft.year||String(d.getFullYear())===String(draft.year);return true}
function purchaseRelationYearOptions(selected=''){const current=new Date().getFullYear(),years=[...new Set([current,...(db.purchases||[]).map(p=>new Date(p.date).getFullYear()).filter(Number.isFinite)])].sort((a,b)=>b-a);return years.map(y=>`<option value="${y}" ${String(y)===String(selected)?'selected':''}>${y}</option>`).join('')}
function purchaseRelationPreviewRows(kind,fromPopup=true){
const c=purchaseRelationFilterConfig(kind),draft=purchaseRelationPeriodDraft(kind,fromPopup),status=fromPopup?(document.getElementById('purchaseRelationFilterStatus')?.value||'all'):(document.getElementById(c.statusId)?.value||'all'),search=String(document.getElementById(c.searchId)?.value||'').trim().toLowerCase();
if(kind==='purchase')return(db.purchases||[]).filter(p=>{const supplier=getSupplier(p.supplierId)?.name||'',isDraft=purchaseIsDraft(p),remain=isDraft?0:Math.max(0,Number(p.total||0)-Number(p.paid||0));if(search&&!`${p.id||''} ${supplier} ${fmtDate(p.date)}`.toLowerCase().includes(search))return false;if(status==='draft'&&!isDraft)return false;if(status==='paid'&&(isDraft||remain>0))return false;if(status==='debt'&&(isDraft||remain<=0))return false;return purchaseRelationDateMatch(p.date,draft)});
if(kind==='debt')return(db.purchases||[]).filter(p=>!purchaseIsDraft(p)).filter(p=>{const remaining=Math.max(0,Number(p.total||0)-Number(p.paid||0));if(remaining<=0)return false;const supplier=getSupplier(p.supplierId),installment=Number(p.paid||0)>0,unpaid=Number(p.paid||0)<=0,hay=[p.id,supplier?.name,supplier?.phone].join(' ').toLowerCase();if(search&&!hay.includes(search))return false;if(status==='installment'&&!installment)return false;if(status==='unpaid'&&!unpaid)return false;return purchaseRelationDateMatch(p.date,draft)});
return[]
}
function purchaseRelationPreviewTotal(kind){const rows=purchaseRelationPreviewRows(kind,true),total=kind==='debt'?sum(rows,p=>Math.max(0,Number(p.total||0)-Number(p.paid||0))):sum(rows.filter(p=>!purchaseIsDraft(p)),p=>Number(p.total)||0),el=document.getElementById('purchaseRelationFilterTotal');if(el)el.textContent=rupiah(total);return total}
function setPurchaseRelationFilterPeriod(mode=''){document.querySelectorAll('.expense-filter-period-btn').forEach(btn=>btn.classList.toggle('active',(btn.dataset.period||'')===mode));['day','month','year'].forEach(key=>{const el=document.getElementById('purchaseRelationPeriodField-'+key);if(el)el.hidden=mode!==key});purchaseRelationPreviewTotal(window.purchaseRelationFilterKind||'purchase')}
function openPurchaseRelationFilters(kind){
const c=purchaseRelationFilterConfig(kind);if(kind==='debt')syncDebtBookStatusFilter(true);
if(kind==='supplier'){
const status=document.getElementById(c.statusId)?.value||'all',sort=window[c.sortKey]||c.defaultSort,statusOpts=c.statuses.map(([v,l])=>`<option value="${v}" ${v===status?'selected':''}>${esc(l)}</option>`).join(''),sortOpts=c.sorts.map(([v,l])=>`<option value="${v}" ${v===sort?'selected':''}>${esc(l)}</option>`).join('');
document.getElementById('overlay')?.classList.add('supplier-filter-overlay','excel-restore-overlay');
return showModal(c.title,c.subtitle,`<div class="form-grid"><div class="field full"><label>Status</label><select id="purchaseRelationFilterStatus">${statusOpts}</select></div><div class="field full"><label>Urutan</label><select id="purchaseRelationFilterSort">${sortOpts}</select></div></div>`,[{label:'Reset',fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value='all';window[c.sortKey]=c.defaultSort;renderPurchaseRelationKind(kind);closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value=document.getElementById('purchaseRelationFilterStatus')?.value||'all';window[c.sortKey]=document.getElementById('purchaseRelationFilterSort')?.value||c.defaultSort;renderPurchaseRelationKind(kind);closeModal()}}])
}
window.purchaseRelationFilterKind=kind;
const status=document.getElementById(c.statusId)?.value||'all',sort=window[c.sortKey]||c.defaultSort,draft=purchaseRelationPeriodDraft(kind,false),statusOpts=c.statuses.map(([v,l])=>`<option value="${v}" ${v===status?'selected':''}>${esc(l)}</option>`).join(''),sortOpts=c.sorts.map(([v,l])=>`<option value="${v}" ${v===sort?'selected':''}>${esc(l)}</option>`).join(''),initialRows=purchaseRelationPreviewRows(kind,false),initialTotal=kind==='debt'?sum(initialRows,p=>Math.max(0,Number(p.total||0)-Number(p.paid||0))):sum(initialRows,p=>Number(p.total)||0);
const subtitle='Pilih periode per hari, bulan, atau tahun.';
showModal(c.title,subtitle,`<div class="expense-filter-total-card"><span>${esc(c.totalLabel||'Total')}</span><strong id="purchaseRelationFilterTotal">${rupiah(initialTotal)}</strong></div><div class="expense-filter-period"><button type="button" class="expense-filter-period-btn ${!draft.period?'active':''}" data-period="" onclick="setPurchaseRelationFilterPeriod('')">Semua</button><button type="button" class="expense-filter-period-btn ${draft.period==='day'?'active':''}" data-period="day" onclick="setPurchaseRelationFilterPeriod('day')">Hari</button><button type="button" class="expense-filter-period-btn ${draft.period==='month'?'active':''}" data-period="month" onclick="setPurchaseRelationFilterPeriod('month')">Bulan</button><button type="button" class="expense-filter-period-btn ${draft.period==='year'?'active':''}" data-period="year" onclick="setPurchaseRelationFilterPeriod('year')">Tahun</button></div><div class="form-grid expense-filter-form"><div class="field full" id="purchaseRelationPeriodField-day" ${draft.period==='day'?'':'hidden'}><label>Tanggal</label><input id="purchaseRelationFilterDay" type="date" value="${esc(draft.day)}" onchange="purchaseRelationPreviewTotal('${kind}')"></div><div class="field full" id="purchaseRelationPeriodField-month" ${draft.period==='month'?'':'hidden'}><label>Bulan</label><input id="purchaseRelationFilterMonth" type="month" value="${esc(draft.month)}" onchange="purchaseRelationPreviewTotal('${kind}')"></div><div class="field full" id="purchaseRelationPeriodField-year" ${draft.period==='year'?'':'hidden'}><label>Tahun</label><select id="purchaseRelationFilterYear" onchange="purchaseRelationPreviewTotal('${kind}')">${purchaseRelationYearOptions(draft.year)}</select></div><div class="field full"><label>Status</label><select id="purchaseRelationFilterStatus" onchange="purchaseRelationPreviewTotal('${kind}')">${statusOpts}</select></div><div class="field full"><label>Urutan</label><select id="purchaseRelationFilterSort">${sortOpts}</select></div></div>`,[{label:'Reset',fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value='all';window[c.sortKey]=c.defaultSort;if(c.periodKey)window[c.periodKey]='';if(c.dayKey)window[c.dayKey]='';if(c.monthKey)window[c.monthKey]='';if(c.yearKey)window[c.yearKey]='';renderPurchaseRelationKind(kind);closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value=document.getElementById('purchaseRelationFilterStatus')?.value||'all';window[c.sortKey]=document.getElementById('purchaseRelationFilterSort')?.value||c.defaultSort;const d=purchaseRelationPeriodDraft(kind,true);if(c.periodKey)window[c.periodKey]=d.period;if(c.dayKey)window[c.dayKey]=d.day;if(c.monthKey)window[c.monthKey]=d.month;if(c.yearKey)window[c.yearKey]=d.year;renderPurchaseRelationKind(kind);closeModal()}}]);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('expense-filter-overlay');modal?.classList.add('expense-filter-modal');setTimeout(()=>purchaseRelationPreviewTotal(kind),0)
}
function purchaseReportState(){
const now=new Date(),defaultMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
return{period:String(window.purchaseReportPeriod||'day'),day:String(window.__purchaseReportDayValue||todayKey()),month:String(window.__purchaseReportMonthValue||defaultMonth),year:String(window.__purchaseReportYearValue||now.getFullYear()),format:String(window.purchaseReportFormat||'a4')}
}
function purchaseReportPeriodLabel(draft=purchaseReportState()){
if(draft.period==='day')return draft.day?fmtDate(draft.day):'Per Hari';
if(draft.period==='month'){if(!draft.month)return'Per Bulan';const[y,m]=draft.month.split('-'),d=new Date(Number(y),Math.max(0,Number(m)-1),1);return d.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
if(draft.period==='year')return draft.year||'Per Tahun';return'Semua Periode'
}
function purchaseReportRows(draft=purchaseReportState()){
const status=document.getElementById('purchaseHistoryStatusFilter')?.value||'all',mobileMode=true,q=String((mobileMode?document.getElementById('purchaseMobileSearch')?.value:document.getElementById('purchaseHistorySearch')?.value)||'').trim().toLowerCase();
return(db.purchases||[]).filter(p=>!purchaseIsDraft(p)).filter(p=>{const supplier=getSupplier(p.supplierId)?.name||'',remain=Math.max(0,Number(p.total||0)-Number(p.paid||0));if(q&&!`${p.id||''} ${supplier} ${fmtDate(p.date)}`.toLowerCase().includes(q))return false;if(status==='draft')return false;if(status==='paid'&&remain>0)return false;if(status==='debt'&&remain<=0)return false;return purchaseRelationDateMatch(p.date,draft)}).sort((a,b)=>new Date(b.date)-new Date(a.date))
}
function purchaseReportPreview(){const draft=purchaseReportState(),rows=purchaseReportRows(draft),total=sum(rows,p=>Number(p.total)||0),el=document.getElementById('purchaseReportTotal'),badge=document.getElementById('purchaseReportPeriodBadge'),count=document.getElementById('purchaseReportCount');if(el)el.textContent=rupiah(total);if(badge)badge.textContent=purchaseReportPeriodLabel(draft);if(count)count.textContent=`${rows.length} transaksi`;return{draft,rows,total}}
function setPurchaseReportPeriod(mode='day'){window.purchaseReportPeriod=mode;document.querySelectorAll('.purchase-report-period button').forEach(btn=>btn.classList.toggle('active',(btn.dataset.period||'')===mode));['day','month','year'].forEach(key=>{const el=document.getElementById('purchaseReportField-'+key);if(el)el.hidden=key!==mode});purchaseReportPreview()}
function setPurchaseReportFormat(mode='a4'){window.purchaseReportFormat=mode;document.querySelectorAll('.purchase-report-format button').forEach(btn=>btn.classList.toggle('active',(btn.dataset.format||'')===mode))}
function syncPurchaseReportForm(){const d=document.getElementById('purchaseReportDay'),m=document.getElementById('purchaseReportMonth'),y=document.getElementById('purchaseReportYear'),now=new Date();if(d)window.__purchaseReportDayValue=String(d.value||todayKey());if(m)window.__purchaseReportMonthValue=String(m.value||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);if(y)window.__purchaseReportYearValue=String(y.value||now.getFullYear());purchaseReportPreview()}
function openPurchaseMobileReportPopup(){
const draft=purchaseReportState();
showModal('Laporan Pembelian','Pilih periode dan format laporan.',`<div class="report-clean-summary purchase-clean-summary"><div class="report-clean-summary-main"><small>Total Pembelian</small><strong id="purchaseReportTotal">Rp0</strong></div><div class="report-clean-summary-side"><b id="purchaseReportPeriodBadge">${purchaseReportPeriodLabel(draft)}</b><span id="purchaseReportCount">0 transaksi</span></div></div><section class="report-clean-step purchase-report-step-v535"><div class="report-clean-step-head"><b>Periode Laporan</b></div><div class="purchase-report-period report-clean-period"><button type="button" data-period="day" class="${draft.period==='day'?'active':''}" onclick="setPurchaseReportPeriod('day')">Hari</button><button type="button" data-period="month" class="${draft.period==='month'?'active':''}" onclick="setPurchaseReportPeriod('month')">Bulan</button><button type="button" data-period="year" class="${draft.period==='year'?'active':''}" onclick="setPurchaseReportPeriod('year')">Tahun</button><button type="button" data-period="all" class="${draft.period==='all'?'active':''}" onclick="setPurchaseReportPeriod('all')">Semua</button></div><div class="purchase-report-fields report-clean-fields"><div class="field" id="purchaseReportField-day" ${draft.period==='day'?'':'hidden'}><label>Tanggal</label><input id="purchaseReportDay" type="date" value="${esc(draft.day)}" onchange="syncPurchaseReportForm()"></div><div class="field" id="purchaseReportField-month" ${draft.period==='month'?'':'hidden'}><label>Bulan</label><input id="purchaseReportMonth" type="month" value="${esc(draft.month)}" onchange="syncPurchaseReportForm()"></div><div class="field" id="purchaseReportField-year" ${draft.period==='year'?'':'hidden'}><label>Tahun</label><select id="purchaseReportYear" onchange="syncPurchaseReportForm()">${purchaseRelationYearOptions(draft.year)}</select></div></div></section><section class="report-clean-step purchase-report-step-v535"><div class="report-clean-step-head"><b>Format Gambar</b></div><div class="purchase-report-format report-clean-format"><button type="button" data-format="a4" class="${draft.format==='a4'?'active':''}" aria-label="Format A4 PNG" onclick="setPurchaseReportFormat('a4')"><span class="report-clean-format-icon">A4</span><b>A4 PNG</b></button><button type="button" data-format="png" class="${draft.format==='png'?'active':''}" aria-label="Format PNG ringkas" onclick="setPurchaseReportFormat('png')"><span class="report-clean-format-icon">▤</span><b>PNG Ringkas</b></button></div></section><div class="report-clean-note purchase-report-note-v535"><span>Mengikuti filter dan pencarian Pembelian.</span></div>`,[{label:'Batal',close:true},{label:'Bagikan Laporan',primary:true,fn:()=>sharePurchaseMobileReport()}],true);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('purchase-report-overlay');modal?.classList.add('purchase-report-modal','report-clean-modal');setTimeout(()=>purchaseReportPreview(),0)
}
function purchaseReportCanvas(draft,rows,total,format='a4'){
const a4=format==='a4',width=a4?1240:820,pad=a4?68:42,body=a4?18:15,small=a4?14:12,title=a4?34:28,rowH=a4?48:44;
const maxRows=a4?27:Math.min(80,Math.max(18,rows.length)),visible=rows.slice(0,maxRows),extra=rows.length-visible.length,height=a4?1754:Math.max(860,330+visible.length*rowH+(extra?42:0));
const canvas=document.createElement('canvas'),c=canvas.getContext('2d');canvas.width=width;canvas.height=height;c.fillStyle='#fff';c.fillRect(0,0,width,height);c.textBaseline='top';
c.fillStyle='#111827';c.font=`800 ${title}px Arial`;c.fillText('Laporan Pembelian',pad,pad);c.fillStyle='#6b7280';c.font=`${small}px Arial`;c.fillText(String(db.settings.store||'INPOS'),pad,pad+34);
c.textAlign='right';c.fillStyle='#b91c1c';c.font=`900 ${a4?30:24}px Arial`;c.fillText(rupiah(total),width-pad,pad+4);c.fillStyle='#6b7280';c.font=`700 ${small}px Arial`;c.fillText('Total Pembelian',width-pad,pad+36);c.textAlign='left';
let y=pad+70;c.fillStyle='#f8fafc';c.fillRect(pad,y,width-pad*2,58);c.strokeStyle='#e5e7eb';c.strokeRect(pad,y,width-pad*2,58);c.fillStyle='#64748b';c.font=`700 ${small}px Arial`;c.fillText('Periode',pad+16,y+12);c.fillStyle='#111827';c.font=`700 ${body}px Arial`;c.fillText(purchaseReportPeriodLabel(draft),pad+16,y+31);y+=82;
c.fillStyle='#64748b';c.font=`700 ${small}px Arial`;c.fillText('Pembelian / Supplier',pad,y);c.fillText('Status',width-pad-300,y);c.textAlign='right';c.fillText('Total',width-pad,y);c.textAlign='left';y+=13;c.beginPath();c.moveTo(pad,y);c.lineTo(width-pad,y);c.stroke();y+=18;
visible.forEach((p,i)=>{const supplier=getSupplier(p.supplierId)?.name||'-',total=Math.max(0,Number(p.total)||0),remain=Math.max(0,total-Number(p.paid||0)),status=remain>0?'Hutang':'Lunas';c.fillStyle='#111827';c.font=`700 ${body}px Arial`;c.fillText(`${i+1}. ${String(p.id||'Pembelian')}`,pad,y);c.fillStyle='#6b7280';c.font=`${small}px Arial`;c.fillText(`${fmtDate(p.date)} • ${supplier} • ${Number(p.items||0)} item`,pad,y+19);c.fillStyle=remain>0?'#b45309':'#15803d';c.font=`700 ${small}px Arial`;c.fillText(status,width-pad-300,y+8);c.textAlign='right';c.fillStyle='#b91c1c';c.font=`800 ${body}px Arial`;c.fillText(rupiah(total),width-pad,y+8);c.textAlign='left';c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(pad,y+34);c.lineTo(width-pad,y+34);c.stroke();y+=rowH});
if(!rows.length){c.fillStyle='#6b7280';c.font=`${body}px Arial`;c.fillText('Tidak ada data pembelian pada periode ini.',pad,y);y+=30}if(extra>0){c.fillStyle='#6b7280';c.font=`italic ${small}px Arial`;c.fillText(`+ ${extra} pembelian lainnya tetap tercakup dalam total laporan.`,pad,y);y+=25}
y=Math.max(y+10,height-86);c.strokeStyle='#e5e7eb';c.beginPath();c.moveTo(pad,y);c.lineTo(width-pad,y);c.stroke();c.textAlign='center';c.fillStyle='#6b7280';c.font=`${small}px Arial`;c.fillText('Laporan Pembelian • INPOS • www.inpos.id',width/2,y+24);return canvas
}
async function sharePurchaseMobileReport(){
syncPurchaseReportForm();const{draft,rows,total}=purchaseReportPreview(),format=window.purchaseReportFormat||'a4',canvas=purchaseReportCanvas(draft,rows,total,format),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat laporan Pembelian.','error');const file=new File([blob],`laporan-pembelian-${draft.period||'semua'}-${format}.png`,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:'Laporan Pembelian',text:`${db.settings.store||'INPOS'} • ${purchaseReportPeriodLabel(draft)} • ${rupiah(total)}`,files:[file]});closeModal();return}catch(e){if(e?.name==='AbortError')return}}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);toast(`${format==='a4'?'A4 PNG':'PNG'} Laporan Pembelian dibuat.`);closeModal()
}
function purchaseIsDraft(p){return!!p&&(!!p.draft||String(p.status||'').toLowerCase()==='draft')}
function purchaseTaxRateDefault(){const r=Number(ppnConfig?.().rate);return Number.isFinite(r)&&r>0?r:11}
function renderPurchases(){
const mobileMode=true;
const q=String((mobileMode?document.getElementById('purchaseMobileSearch')?.value:document.getElementById('purchaseHistorySearch')?.value)||'').trim().toLowerCase();
const status=String(document.getElementById('purchaseHistoryStatusFilter')?.value||'all'),sort=window.purchaseMobileSort||'newest',periodDraft=mobileMode?purchaseRelationPeriodDraft('purchase',false):{period:''};
let rows=[...(db.purchases||[])].filter(p=>{
const supplier=getSupplier(p.supplierId)?.name||'',isDraft=purchaseIsDraft(p),remain=isDraft?0:Math.max(0,(Number(p.total)||0)-(Number(p.paid)||0));
if(q&&!`${p.id||''} ${supplier} ${fmtDate(p.date)} ${isDraft?'draf':''}`.toLowerCase().includes(q))return false;
if(status==='draft'&&!isDraft)return false;
if(status==='paid'&&(isDraft||remain>0))return false;
if(status==='debt'&&(isDraft||remain<=0))return false;
if(mobileMode&&!purchaseRelationDateMatch(p.date,periodDraft))return false;
return true;
}).sort((a,b)=>sort==='oldest'?new Date(a.date)-new Date(b.date):new Date(b.updatedAt||b.date)-new Date(a.updatedAt||a.date));
syncPurchaseRelationMobileFilterUI('purchase');
const count=document.getElementById('purchaseHistoryCount'),totalEl=document.getElementById('purchaseHistoryTotal'),list=document.getElementById('purchaseHistoryList');
if(count)count.textContent=`${rows.length} pembelian`;
if(totalEl)totalEl.textContent=rupiah(sum(rows.filter(p=>!purchaseIsDraft(p)),p=>Number(p.total)||0));
if(list)list.innerHTML=rows.length?rows.map(p=>{
const supplier=getSupplier(p.supplierId)?.name||'-',isDraft=purchaseIsDraft(p),total=Math.max(0,Number(p.total)||0),paid=Math.max(0,Number(p.paid)||0),remain=isDraft?0:Math.max(0,total-paid),isDebt=!isDraft&&remain>0,statusLabel=isDraft?'Draf':isDebt?'Hutang':'Lunas',statusClass=isDraft?'draft':isDebt?'debt':'paid',itemCount=Math.max(0,Number(p.items)||0);
return`<article class="relation-history-card purchase-history-card ${isDraft?'purchase-draft-card':''}"><div class="relation-history-icon"><span>${isDraft?'✎':'⇩'}</span><small>${isDraft?'DRF':'PB'}</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(p.id||'Pembelian')}</div><div class="relation-history-time">${fmtTime(p.updatedAt||p.date)}</div><div class="relation-history-meta"><span class="relation-status ${statusClass}">${statusLabel}</span><span>${esc(supplier)} • ${itemCount.toLocaleString('id-ID',{maximumFractionDigits:2})} item${p.tax?` • PPN ${Number(p.taxRate||0)}%`:''}</span></div></div><div class="relation-history-value"><small>${isDraft?'Total Draf':'Total'}</small><strong>${rupiah(total)}</strong>${isDraft?`<span class="relation-history-remain draft">Belum diproses</span>`:isDebt?`<span class="relation-history-remain">Sisa ${rupiah(remain)}</span>`:`<span class="relation-history-remain paid">Dibayar ${rupiah(paid)}</span>`}<div class="relation-history-actions">${isDraft?`<button type="button" onclick="editPurchaseDraft('${esc(String(p.id||''))}')">Lanjutkan</button><button type="button" onclick="openPurchaseDetail('${esc(String(p.id||''))}')">Detail</button>`:`<button type="button" onclick="openPurchaseDetail('${esc(String(p.id||''))}')">Detail</button><button type="button" onclick="openSupplierFromPurchases()">Supplier</button>`}</div></div></article>`
}).join(''):`<div class="relation-history-empty"><b>${q||status!=='all'?'Pembelian tidak ditemukan':'Belum ada pembelian'}</b><span>${q||status!=='all'?'Ubah pencarian atau filter status.':'Tekan + Pembelian untuk mencatat barang masuk.'}</span></div>`;
}
let purchaseFormDraft={purchaseId:null,supplierId:null,date:'',search:'',lines:[],paid:0,method:'Tunai',note:'',taxActive:false,taxRate:11};
function purchaseFormTrackedProducts(){return(db.products||[]).filter(p=>p&&!p.noStock&&p.purchaseEnabled!==false)}
function purchaseFormInit(force=false){
if(force||!purchaseFormDraft||!Array.isArray(purchaseFormDraft.lines))purchaseFormDraft={purchaseId:null,supplierId:null,date:todayKey(),search:'',lines:[],paid:0,method:'Tunai',note:'',taxActive:false,taxRate:purchaseTaxRateDefault(),taxMode:'exclude'};
if(!purchaseFormDraft.date)purchaseFormDraft.date=todayKey();
if(!purchaseFormDraft.supplierId||!getSupplier(purchaseFormDraft.supplierId))purchaseFormDraft.supplierId=db.suppliers?.[0]?.id??null;
if(!Number.isFinite(Number(purchaseFormDraft.taxRate))||Number(purchaseFormDraft.taxRate)<=0)purchaseFormDraft.taxRate=purchaseTaxRateDefault();
purchaseFormDraft.taxActive=!!purchaseFormDraft.taxActive;
purchaseFormDraft.taxMode=purchaseFormDraft.taxMode==='include'?'include':'exclude';
purchaseFormDraft.lines=(purchaseFormDraft.lines||[]).filter(x=>getProduct(Number(x.productId))&&!getProduct(Number(x.productId))?.noStock).map(x=>({productId:Number(x.productId),qty:Math.max(.01,Number(x.qty)||1),cost:Math.max(0,Number(x.cost)||0),discountType:x.discountType==='percent'?'percent':'nominal',discountValue:Math.max(0,Number(x.discountValue)||0),purchaseUnit:x.purchaseUnit||'',unitFactor:Math.max(1,Number(x.unitFactor)||1),packQty:Number(x.packQty)||0}));
purchaseFormDraft.paid=Math.max(0,Math.min(purchaseFormTotal(),Number(purchaseFormDraft.paid)||0));
}
function purchaseLineGrossV515(r){return Math.max(0,Number(r?.qty)||0)*Math.max(0,Number(r?.cost)||0)}
function purchaseLineDiscountV515(r){const gross=purchaseLineGrossV515(r),value=Math.max(0,Number(r?.discountValue)||0);return Math.min(gross,Math.round(r?.discountType==='percent'?gross*Math.min(100,value)/100:value))}
function purchaseLineNetV515(r){return Math.max(0,purchaseLineGrossV515(r)-purchaseLineDiscountV515(r))}
function purchaseLineDiscountTotalV515(){return sum(purchaseFormDraft.lines||[],purchaseLineDiscountV515)}
function purchaseEffectiveUnitCostV515(row){
const qty=Math.max(0,Number(row?.qty)||0),net=purchaseLineNetV515(row),all=Math.max(0,purchaseFormNetBeforeGlobalV515());
const global=all>0?purchaseFormDiscount()*net/all:0;
const afterDiscount=Math.max(0,net-global);
const includedTax= purchaseFormDraft.taxActive&&purchaseFormDraft.taxMode==='include' ? purchaseFormTax()*(all>0?net/all:0) : 0;
return qty>0?Math.max(0,afterDiscount-includedTax)/qty:0;
}
function purchaseFormNetBeforeGlobalV515(){return Math.max(0,purchaseFormSubtotal()-purchaseLineDiscountTotalV515())}
function purchaseFormSubtotal(){return sum(purchaseFormDraft.lines||[],purchaseLineGrossV515)}
function purchaseFormDiscount(){
const raw=purchaseFormNetBeforeGlobalV515(),type=String(purchaseFormDraft?.discountType||'nominal'),value=Math.max(0,Number(purchaseFormDraft?.discountValue)||0);
return Math.min(raw,Math.round(type==='percent'?raw*Math.min(value,100)/100:value));
}
function purchaseFormTax(){
 const subtotal=Math.max(0,purchaseFormNetBeforeGlobalV515()-purchaseFormDiscount()),rate=Math.max(0,Number(purchaseFormDraft.taxRate)||0);
 if(!purchaseFormDraft.taxActive||rate<=0)return 0;
 return Math.max(0,Math.round(purchaseFormDraft.taxMode==='include'?subtotal*rate/(100+rate):subtotal*rate/100));
}
function purchaseFormTotal(){
 const base=Math.max(0,purchaseFormNetBeforeGlobalV515()-purchaseFormDiscount());
 return base+(purchaseFormDraft.taxActive&&purchaseFormDraft.taxMode!=='include'?purchaseFormTax():0);
}
function purchaseFormItemCount(){return sum(purchaseFormDraft.lines||[],x=>Math.max(0,Number(x.qty)||0))}
function openPurchaseModal(){openPurchaseProductPage()}
function openPurchaseProductPage(){purchaseFormInit(false);if(!db.suppliers?.length){go('purchases');return toast('Tambahkan supplier terlebih dahulu.','error')}go('purchase-form')}
function purchaseFormBack(){go('purchases')}
function resetPurchaseForm(confirmReset=false){purchaseFormDraft={purchaseId:null,supplierId:db.suppliers?.[0]?.id??null,date:todayKey(),search:'',lines:[],paid:0,method:'Tunai',note:'',taxActive:false,taxRate:purchaseTaxRateDefault(),taxMode:'exclude'};renderPurchaseFormPage()}
function setPurchaseFormSearch(v){purchaseFormDraft.search=String(v||'');renderPurchaseFormProducts()}
function setPurchaseFormSupplier(v){purchaseFormDraft.supplierId=Number(v)||null}
function setPurchaseFormDate(v){purchaseFormDraft.date=String(v||'')}
function purchaseFormAddProduct(id){const p=getProduct(Number(id));if(!p||p.noStock||p.purchaseEnabled===false)return toast('Produk ini tidak dapat dibeli.','error');const row=(purchaseFormDraft.lines||[]).find(x=>Number(x.productId)===Number(id));if(row)row.qty=Math.max(.01,Number(row.qty)||1)+1;else purchaseFormDraft.lines.push({productId:Number(id),qty:1,cost:Math.max(0,Number(p.cost)||0),discountType:'nominal',discountValue:0});renderPurchaseFormLines();renderPurchaseFormPayment();renderPurchaseFormSummary()}
function purchaseFormRemoveProduct(id){purchaseFormDraft.lines=purchaseFormDraft.lines.filter(x=>Number(x.productId)!==Number(id));purchaseFormDraft.paid=Math.min(Math.max(0,Number(purchaseFormDraft.paid)||0),purchaseFormTotal());renderPurchaseFormLines();renderPurchaseFormPayment();renderPurchaseFormSummary();renderPurchaseFormProducts()}
function purchaseFormSetQty(id,v){const r=purchaseFormDraft.lines.find(x=>Number(x.productId)===Number(id));if(!r)return;r.qty=Math.max(.01,Number(v)||.01);purchaseFormDraft.paid=Math.min(Math.max(0,Number(purchaseFormDraft.paid)||0),purchaseFormTotal());renderPurchaseFormLineSubtotal(id);renderPurchaseFormPayment();renderPurchaseFormSummary()}
function purchaseFormSetCost(id,v){const r=purchaseFormDraft.lines.find(x=>Number(x.productId)===Number(id));if(!r)return;r.cost=Math.max(0,Math.round(parseNominal(v)));purchaseFormDraft.paid=Math.min(Math.max(0,Math.round(Number(purchaseFormDraft.paid)||0)),purchaseFormTotal());renderPurchaseFormLineSubtotal(id);renderPurchaseFormPayment();renderPurchaseFormSummary()}
function renderPurchaseFormLineSubtotal(id){const r=purchaseFormDraft.lines.find(x=>Number(x.productId)===Number(id)),el=document.getElementById('purchaseLineSubtotal-'+id);if(el&&r)el.textContent=rupiah(purchaseLineNetV515(r))}
function purchaseFormSetPaid(v){purchaseFormDraft.paid=Math.max(0,Math.min(purchaseFormTotal(),Math.round(parseNominal(v))));const el=document.getElementById('purchaseFormPaid');if(el)setNominalInput(el,purchaseFormDraft.paid);renderPurchaseFormPaymentState();renderPurchaseFormSummary()}
function purchaseFormSetMethod(v){purchaseFormDraft.method=String(v||'Tunai')}
function purchaseFormSetNote(v){purchaseFormDraft.note=String(v||'')}
function purchaseFormTogglePPN(){purchaseFormDraft.taxActive=!purchaseFormDraft.taxActive;if(purchaseFormDraft.taxActive)purchaseFormDraft.taxRate=purchaseTaxRateDefault();purchaseFormDraft.paid=Math.min(Math.max(0,Number(purchaseFormDraft.paid)||0),purchaseFormTotal());renderPurchaseFormPayment();renderPurchaseFormSummary()}
function renderPurchaseFormSupplier(){
const root=document.getElementById('purchaseFormSupplierBlock');if(!root)return;
if(!db.suppliers?.length){root.innerHTML=`<div class="purchase-entry-alert">Belum ada supplier. Tambahkan supplier terlebih dahulu sebelum mencatat pembelian.</div><div style="margin-top:8px"><button class="btn btn-primary" type="button" onclick="openSupplierFromPurchases()">+ Tambah Supplier</button></div>`;return}
const opts=db.suppliers.map(s=>`<option value="${s.id}" ${Number(s.id)===Number(purchaseFormDraft.supplierId)?'selected':''}>${esc(s.name)}${s.phone?' • '+esc(s.phone):''}</option>`).join('');
root.innerHTML=`<div class="purchase-entry-grid purchase-supplier-grid"><div class="purchase-entry-field full"><label>Supplier</label><div class="purchase-supplier-tools"><select onchange="setPurchaseFormSupplier(this.value)">${opts}</select></div></div><div class="purchase-entry-field purchase-date-field"><label>Tanggal Pembelian</label><input type="date" value="${esc(purchaseFormDraft.date||todayKey())}" onchange="setPurchaseFormDate(this.value)"></div><div class="purchase-entry-field purchase-status-field"><label>Status</label><input value="${purchaseFormDraft.purchaseId?'Draf / Belum Diproses':'Barang Masuk'}" disabled></div></div>`
}
function renderPurchaseFormProducts(){
const root=document.getElementById('purchaseFormProductResults');if(!root)return;
const q=String(purchaseFormDraft.search||'').trim().toLowerCase(),selected=new Set((purchaseFormDraft.lines||[]).map(x=>Number(x.productId)));
let rows=purchaseFormTrackedProducts().filter(p=>!q||`${p.name||''} ${p.code||''} ${p.barcode||''} ${p.category||''}`.toLowerCase().includes(q)).slice(0,24);
root.innerHTML=rows.length?rows.map(p=>`<button class="purchase-product-option" type="button" onclick="purchaseFormAddProduct(${Number(p.id)})"><span class="copy"><b>${esc(p.name)}</b><small>${esc(p.code||p.barcode||p.category||'Produk')} • Stok ${Number(p.stock||0).toLocaleString('id-ID',{maximumFractionDigits:2})} ${esc(p.unit||'pcs')} • Modal ${rupiah(Number(p.cost)||0)}</small></span><span class="add">${selected.has(Number(p.id))?'＋':'+'}</span></button>`).join(''):`<div class="purchase-empty" style="grid-column:1/-1"><b>Produk tidak ditemukan</b><span>Ubah kata pencarian atau tambahkan produk terlebih dahulu.</span></div>`
}
function renderPurchaseFormLines(){
const root=document.getElementById('purchaseFormLines');if(!root)return;
root.innerHTML=purchaseFormDraft.lines.length?purchaseFormDraft.lines.map(r=>{const p=getProduct(r.productId);if(!p)return'';return`<article class="purchase-line"><div class="purchase-line-top"><div class="purchase-line-name"><b>${esc(p.name)}</b><small>Stok sekarang ${Number(p.stock||0).toLocaleString('id-ID',{maximumFractionDigits:2})} ${esc(p.unit||'pcs')} • Modal lama ${rupiah(Number(p.cost)||0)}</small></div><button class="purchase-line-remove" type="button" aria-label="Hapus ${esc(p.name)}" onclick="purchaseFormRemoveProduct(${Number(p.id)})">×</button></div><div class="purchase-line-fields"><label>Qty<input type="number" inputmode="decimal" min="0.01" step="0.01" value="${Number(r.qty)}" oninput="purchaseFormSetQty(${Number(p.id)},this.value)"></label><label>Harga Beli<input class="nominal-input" type="text" inputmode="numeric" value="${nominal(r.cost||0)}" oninput="purchaseFormSetCost(${Number(p.id)},this.value)"></label><label>Subtotal<div class="purchase-line-subtotal" id="purchaseLineSubtotal-${Number(p.id)}">${rupiah(purchaseLineNetV515(r))}</div></label></div>${purchaseLineDiscountV515(r)>0?`<small class="purchase-line-discount-v515">Diskon ${r.discountType==='percent'?`${nominal(r.discountValue)}%`:'Rp '+nominal(r.discountValue)} • −${rupiah(purchaseLineDiscountV515(r))}</small>`:''}</article>`}).join(''):`<div class="purchase-empty"><b>Belum ada produk</b><span>Pilih produk dari daftar di atas. Produk yang dibeli akan menambah stok setelah Pembelian disimpan, bukan saat Draf.</span></div>`
}
function renderPurchaseFormPayment(){
const root=document.getElementById('purchaseFormPayment');if(!root)return;
const total=purchaseFormTotal(),rate=Math.max(0,Number(purchaseFormDraft.taxRate)||purchaseTaxRateDefault());purchaseFormDraft.paid=Math.min(Math.max(0,Number(purchaseFormDraft.paid)||0),total);
root.innerHTML=`<div class="purchase-entry-grid purchase-payment-grid"><div class="purchase-entry-field"><label>Dibayar Sekarang</label><input id="purchaseFormPaid" class="nominal-input" type="text" inputmode="numeric" value="${nominal(purchaseFormDraft.paid)}" oninput="purchaseFormSetPaid(this.value)"></div><div class="purchase-entry-field"><label>Metode Pembayaran</label><select onchange="purchaseFormSetMethod(this.value)"><option ${purchaseFormDraft.method==='Tunai'?'selected':''}>Tunai</option><option ${purchaseFormDraft.method==='Transfer'?'selected':''}>Transfer</option><option ${purchaseFormDraft.method==='QRIS'?'selected':''}>QRIS</option></select></div><div class="purchase-entry-field full"><label>Catatan</label><textarea maxlength="120" placeholder="Contoh: Faktur supplier / barang masuk gudang" oninput="purchaseFormSetNote(this.value)">${esc(purchaseFormDraft.note||'')}</textarea></div></div><div class="purchase-ppn-control ${purchaseFormDraft.taxActive?'active':''}"><div class="purchase-ppn-copy"><b>PPN Pembelian ${rate}%</b><small>${purchaseFormDraft.taxActive?'Aktif untuk transaksi ini • '+rupiah(purchaseFormTax()):'Nonaktif • tidak menambah total pembelian'}</small></div><button class="switch ${purchaseFormDraft.taxActive?'on':''}" type="button" aria-pressed="${purchaseFormDraft.taxActive?'true':'false'}" onclick="purchaseFormTogglePPN()"></button></div><div class="purchase-pay-quick"><button type="button" onclick="purchaseFormSetPaid(0)">Belum Bayar</button><button type="button" onclick="purchaseFormSetPaid(purchaseFormTotal())">Bayar Lunas</button></div><div class="purchase-balance"><span id="purchaseFormBalanceLabel">Sisa Hutang</span><b id="purchaseFormBalance">${rupiah(Math.max(0,total-purchaseFormDraft.paid))}</b></div>`
}
function renderPurchaseFormPaymentState(){const total=purchaseFormTotal(),remain=Math.max(0,total-(Number(purchaseFormDraft.paid)||0)),label=document.getElementById('purchaseFormBalanceLabel'),val=document.getElementById('purchaseFormBalance');if(label)label.textContent=remain>0?'Sisa Hutang':'Status Pembayaran';if(val)val.textContent=remain>0?rupiah(remain):'Lunas'}
function renderPurchaseFormSummary(){
const root=document.getElementById('purchaseFormSummary'),sticky=document.getElementById('purchaseFormStickyTotal');if(!root)return;
const subtotal=purchaseFormSubtotal(),lineDiscount=purchaseLineDiscountTotalV515(),discount=purchaseFormDiscount(),tax=purchaseFormTax(),total=purchaseFormTotal(),paid=Math.min(total,Math.max(0,Number(purchaseFormDraft.paid)||0)),remain=Math.max(0,total-paid),qty=purchaseFormItemCount();
root.innerHTML=`<div class="purchase-summary-row"><span>Jenis Produk</span><b>${purchaseFormDraft.lines.length}</b></div><div class="purchase-summary-row"><span>Total Qty</span><b>${qty.toLocaleString('id-ID',{maximumFractionDigits:2})}</b></div><div class="purchase-summary-row"><span>Subtotal</span><b>${rupiah(subtotal)}</b></div>${lineDiscount>0?`<div class="purchase-summary-row"><span>Diskon Produk</span><b>−${rupiah(lineDiscount)}</b></div>`:''}${discount>0?`<div class="purchase-summary-row"><span>Diskon Pembelian</span><b>−${rupiah(discount)}</b></div>`:''}${purchaseFormDraft.taxActive?`<div class="purchase-summary-row purchase-tax-row"><span>PPN ${Number(purchaseFormDraft.taxRate||0)}% (${purchaseFormDraft.taxMode==='include'?'Include':'Exclude'})</span><b>${purchaseFormDraft.taxMode==='include'?'Termasuk ':'+'}${rupiah(tax)}</b></div>`:''}<div class="purchase-summary-row"><span>Dibayar</span><b>${rupiah(paid)}</b></div><div class="purchase-summary-row"><span>${remain>0?'Hutang Supplier':'Status'}</span><b>${remain>0?rupiah(remain):'Lunas'}</b></div><div class="purchase-summary-row total"><span>Total Pembelian</span><b>${rupiah(total)}</b></div>`;
if(sticky)sticky.textContent=rupiah(total)
}
function renderPurchaseFormPage(){purchaseFormInit(false);renderPurchaseFormSupplier();const search=document.getElementById('purchaseFormSearch');if(search&&search.value!==purchaseFormDraft.search)search.value=purchaseFormDraft.search||'';renderPurchaseFormProducts();renderPurchaseFormLines();renderPurchaseFormPayment();renderPurchaseFormSummary()}
function purchaseDraftRecordLines(){return(purchaseFormDraft.lines||[]).map(r=>{const p=getProduct(r.productId),qty=Math.max(0,Number(r.qty)||0),cost=Math.max(0,Number(r.cost)||0);return{productId:Number(r.productId),name:String(p?.name||'Produk'),unit:String(p?.unit||'pcs'),purchaseUnit:r.purchaseUnit||String(p?.unit||'pcs'),unitFactor:Number(r.unitFactor)||1,packQty:Number(r.packQty)||0,qty,cost,subtotal:qty*cost,discountType:r.discountType==='percent'?'percent':'nominal',discountValue:Math.max(0,Number(r.discountValue)||0),discount:purchaseLineDiscountV515(r),netSubtotal:purchaseLineNetV515(r)}})}
function savePurchaseDraft(){
purchaseFormInit(false);if(!purchaseFormDraft.lines.length)return toast('Tambahkan minimal 1 produk sebelum menyimpan draf.','error');if(purchaseFormDraft.purchaseId){const old=purchaseById(purchaseFormDraft.purchaseId);if(old&&!purchaseIsDraft(old))return toast('Pembelian sudah diproses dan tidak dapat disimpan ulang sebagai draf.','error')}if(!db.suppliers?.length)return toast('Supplier belum tersedia.','error');const supplier=getSupplier(purchaseFormDraft.supplierId);if(!supplier)return toast('Pilih supplier yang valid.','error');
const d=purchaseFormDraft.date?new Date(`${purchaseFormDraft.date}T12:00:00`):new Date();if(Number.isNaN(d.getTime()))return toast('Tanggal pembelian tidak valid.','error');
const lines=purchaseDraftRecordLines(),subtotal=purchaseFormSubtotal(),lineDiscount=purchaseLineDiscountTotalV515(),globalDiscount=purchaseFormDiscount(),discount=lineDiscount+globalDiscount,tax=purchaseFormTax(),total=purchaseFormTotal(),paid=Math.max(0,Math.min(total,Number(purchaseFormDraft.paid)||0)),id=String(purchaseFormDraft.purchaseId||uid('PB')),now=new Date().toISOString();
const purchaseDraftBeforeV614=structuredClone(db);let rec=purchaseById(id);const payload={id,date:d.toISOString(),updatedAt:now,supplierId:Number(supplier.id),items:sum(lines,x=>Number(x.qty)||0),subtotal,lineDiscount,globalDiscount,discount,discountType:String(purchaseFormDraft.discountType||'nominal'),discountValue:Math.max(0,Number(purchaseFormDraft.discountValue)||0),taxActive:!!purchaseFormDraft.taxActive,taxRate:Number(purchaseFormDraft.taxRate)||0,taxMode:purchaseFormDraft.taxMode==='include'?'include':'exclude',tax,total,paid,paymentMethod:String(purchaseFormDraft.method||'Tunai'),note:String(purchaseFormDraft.note||'').trim(),lines,stockApplied:false,draft:true,status:'draft'};
if(rec&&purchaseIsDraft(rec))Object.assign(rec,payload);else{rec=payload;db.purchases.unshift(rec)}if(!save()){Object.keys(db).forEach(key=>delete db[key]);Object.assign(db,purchaseDraftBeforeV614);return toast('Draf pembelian belum tersimpan. Data form tetap tersedia untuk dicoba kembali.','error')}purchaseFormDraft={purchaseId:null,supplierId:Number(supplier.id),date:todayKey(),search:'',lines:[],paid:0,method:'Tunai',note:'',taxActive:false,taxRate:purchaseTaxRateDefault(),taxMode:'exclude'};renderAll();go('purchases');toast('Draf pembelian disimpan. Stok dan kas belum berubah.')
}
function editPurchaseDraft(id){
const p=purchaseById(id);if(!p||!purchaseIsDraft(p))return toast('Draf pembelian tidak ditemukan.','error');
purchaseFormDraft={purchaseId:String(p.id),supplierId:Number(p.supplierId)||(db.suppliers?.[0]?.id??null),date:dateKey(new Date(p.date)),search:'',lines:(Array.isArray(p.lines)?p.lines:[]).map(r=>({productId:Number(r.productId),qty:Math.max(.01,Number(r.qty)||1),cost:Math.max(0,Number(r.cost)||0),discountType:r.discountType==='percent'?'percent':'nominal',discountValue:Math.max(0,Number(r.discountValue)||0)})),paid:Math.max(0,Number(p.paid)||0),method:String(p.paymentMethod||'Tunai'),note:String(p.note||''),discountType:String(p.discountType||'nominal'),discountValue:Math.max(0,Number(p.discountValue)||0),taxActive:!!p.taxActive,taxRate:Math.max(0,Number(p.taxRate)||purchaseTaxRateDefault()),taxMode:p.taxMode==='include'?'include':'exclude'};go('purchase-form')
}
function savePurchaseProductForm(){
purchaseFormInit(false);if(!db.suppliers?.length)return toast('Supplier belum tersedia.','error');const supplier=getSupplier(purchaseFormDraft.supplierId);if(!supplier)return toast('Pilih supplier yang valid.','error');
if(!purchaseFormDraft.date)return toast('Tanggal pembelian wajib diisi.','error');const d=new Date(`${purchaseFormDraft.date}T12:00:00`);if(Number.isNaN(d.getTime()))return toast('Tanggal pembelian tidak valid.','error');
if(!purchaseFormDraft.lines.length)return toast('Tambahkan minimal 1 produk.','error');
for(const r of purchaseFormDraft.lines){const p=getProduct(r.productId);if(!p||p.noStock||p.purchaseEnabled===false)return toast('Ada produk yang tidak bisa dibeli. Periksa daftar pembelian.','error');if(!(Number(r.qty)>0))return toast(`Qty ${p.name} harus lebih dari 0.`,'error');if(Number(r.cost)<0||!Number.isFinite(Number(r.cost)))return toast(`Harga beli ${p.name} tidak valid.`,'error')}
const subtotal=purchaseFormSubtotal(),lineDiscount=purchaseLineDiscountTotalV515(),globalDiscount=purchaseFormDiscount(),discount=lineDiscount+globalDiscount,tax=purchaseFormTax(),total=purchaseFormTotal(),paid=Math.max(0,Number(purchaseFormDraft.paid)||0);if(total<=0)return toast('Total pembelian harus lebih dari 0.','error');if(paid>total)return toast('Nominal dibayar tidak boleh melebihi total pembelian.','error');
const existing=purchaseFormDraft.purchaseId?purchaseById(purchaseFormDraft.purchaseId):null;if(existing&&!purchaseIsDraft(existing))return toast('Pembelian ini sudah diproses dan tidak dapat disimpan ulang.','error');
const id=String(existing?.id||uid('PB')),lines=purchaseDraftRecordLines();
const purchaseBeforeSaveV614=structuredClone(db),priceChoicesBeforeSaveV614=window.purchasePriceChoicesV513;
lines.forEach(r=>{const p=getProduct(r.productId);if(!p)return;const oldStock=Math.max(0,Number(p.stock)||0),oldCost=Math.max(0,Number(p.cost)||0),incoming=Math.max(0,Number(r.qty)||0),unitCost=purchaseEffectiveUnitCostV515(r),priceChoice=window.purchasePriceChoicesV513?.[String(r.productId)];p.stock=oldStock+incoming;if(priceChoice?.applyAverage!==false&&incoming>0)p.cost=calculateWeightedAverageV513(oldStock,oldCost,incoming,unitCost);if(priceChoice?.changeSelling===true&&Number.isFinite(Number(priceChoice.sellingPrice))&&Number(priceChoice.sellingPrice)>=0)p.price=Number(priceChoice.sellingPrice)});window.purchasePriceChoicesV513=null;
const payload={id,date:d.toISOString(),updatedAt:new Date().toISOString(),supplierId:Number(supplier.id),items:sum(lines,x=>x.qty),subtotal,lineDiscount,globalDiscount,discount,discountType:String(purchaseFormDraft.discountType||'nominal'),discountValue:Math.max(0,Number(purchaseFormDraft.discountValue)||0),taxActive:!!purchaseFormDraft.taxActive,taxRate:Number(purchaseFormDraft.taxRate)||0,taxMode:purchaseFormDraft.taxMode==='include'?'include':'exclude',tax,total,paid,paymentMethod:String(purchaseFormDraft.method||'Tunai'),note:String(purchaseFormDraft.note||'').trim(),lines,stockApplied:true,draft:false,status:'completed'};
if(existing)Object.assign(existing,payload);else db.purchases.unshift(payload);
if(paid>0){if(!Array.isArray(db.cashEntries))db.cashEntries=[];db.cashEntries.unshift({id:uid('CASH'),date:new Date().toISOString(),direction:'out',category:'Pembelian Produk',note:`Pembelian ${id} - ${supplier.name}`,method:String(purchaseFormDraft.method||'Tunai'),amount:paid,source:'purchase',sourceId:String(id)})}
if(!save()){Object.keys(db).forEach(key=>delete db[key]);Object.assign(db,purchaseBeforeSaveV614);window.purchasePriceChoicesV513=priceChoicesBeforeSaveV614;return toast('Pembelian belum tersimpan. Stok, kas, dan data transaksi tidak diubah. Periksa ruang penyimpanan lalu coba lagi.','error')}purchaseFormDraft={purchaseId:null,supplierId:Number(supplier.id),date:todayKey(),search:'',lines:[],paid:0,method:'Tunai',note:'',taxActive:false,taxRate:purchaseTaxRateDefault(),taxMode:'exclude'};renderAll();go('purchases');toast(existing?'Draf diproses menjadi pembelian. Stok sudah ditambahkan.':'Pembelian produk disimpan dan stok sudah ditambahkan.')
}
function syncExpenseWebYearFilter(){
const el=document.getElementById('expenseYearFilter');if(!el)return;
const selected=String(el.value||'');
const current=new Date().getFullYear();
const years=[...new Set([current,...(db.expenses||[]).map(e=>new Date(e.date).getFullYear()).filter(Number.isFinite)])].sort((a,b)=>b-a);
el.innerHTML='<option value="">Semua Tahun</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
if(selected&&years.includes(Number(selected)))el.value=selected;
}
function renderExpenses(){
const mobileMode=true;
const category=mobileMode?(document.getElementById('expenseMobileCategory')?.value||''):(document.getElementById('expenseFilter')?.value||'');
const method=mobileMode?(document.getElementById('expenseMobileMethod')?.value||''):'';
const period=mobileMode?(document.getElementById('expenseMobilePeriod')?.value||''):'';
const mobileDay=mobileMode?String(document.getElementById('expenseMobileDay')?.value||''):'';
const mobileMonth=mobileMode?String(document.getElementById('expenseMobileMonth')?.value||''):'';
const mobileYear=mobileMode?String(document.getElementById('expenseMobileYear')?.value||''):'';
const q=mobileMode?String(document.getElementById('expenseMobileSearch')?.value||'').trim().toLowerCase():'';
const webDate=mobileMode?'':String(document.getElementById('expenseDateFilter')?.value||'');
const webMonth=mobileMode?'':String(document.getElementById('expenseMonthFilter')?.value||'');
const webYear=mobileMode?'':String(document.getElementById('expenseYearFilter')?.value||'');
if(!mobileMode)syncExpenseWebYearFilter();
let rows=db.expenses.filter(e=>{
if(category&&e.category!==category)return false;
if(method&&e.method!==method)return false;
if(q&&!`${e.category||''} ${e.note||''} ${e.method||''}`.toLowerCase().includes(q))return false;
const d=new Date(e.date);if(Number.isNaN(d.getTime()))return false;
if(!mobileMode){
if(webDate&&dateKey(d)!==webDate)return false;
if(webMonth&&d.getMonth()+1!==Number(webMonth))return false;
if(webYear&&d.getFullYear()!==Number(webYear))return false;
}else if(period){
if(period==='day'&&mobileDay&&dateKey(d)!==mobileDay)return false;
if(period==='month'&&mobileMonth){const ym=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(ym!==mobileMonth)return false}
if(period==='year'&&mobileYear&&d.getFullYear()!==Number(mobileYear))return false;
}
return true;
});
const sort=window.expenseMobileSort||'newest';
rows=[...rows].sort((a,b)=>sort==='oldest'?new Date(a.date)-new Date(b.date):new Date(b.date)-new Date(a.date));
const catValue=document.getElementById('expenseMobileCategoryValue');if(catValue)catValue.textContent=category||'Semua';
const filterCount=(method?1:0)+(period?1:0)+(sort!=='newest'?1:0);const filterBadge=document.getElementById('expenseMobileFilterCount');if(filterBadge){filterBadge.textContent=filterCount;filterBadge.hidden=!filterCount}
const total=sum(rows,e=>e.amount);window.expenseMobileFilteredTotal=total;
const pill=document.getElementById('expenseTotalPill');if(pill)pill.textContent='Total '+rupiah(total);
const mobileTotal=document.getElementById('expenseMobileTotal');if(mobileTotal)mobileTotal.textContent=rupiah(total);const mobileCount=document.getElementById('expenseMobileCount');if(mobileCount)mobileCount.textContent=`${rows.length} pengeluaran`;
const table=document.getElementById('expenseTable');if(table)table.innerHTML=rows.length?rows.map(e=>`<tr><td data-label="Tanggal" data-main="true"><div class="cell-title">${fmtDate(e.date)}</div></td><td data-label="Kategori"><span class="pill">${esc(e.category)}</span></td><td data-label="Keterangan">${esc(e.note)}</td><td data-label="Metode">${esc(e.method)}</td><td data-label="Nominal" class="money">${rupiah(e.amount)}</td><td data-label="Aksi"><button class="btn btn-sm" onclick="deleteExpense(${e.id})">Hapus</button></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state">Belum ada pengeluaran.</div></td></tr>';
const mobile=document.getElementById('expenseMobileList');
if(mobile)mobile.innerHTML=rows.length?rows.map(e=>`<article class="expense-mobile-card"><button class="expense-mobile-main" type="button" onclick="openExpenseMobileDetail(${e.id})" aria-label="Detail pengeluaran ${esc(e.category)}"><span class="expense-mobile-info"><span class="expense-mobile-category">${esc(e.category||'Pengeluaran')}</span><span class="expense-mobile-time">${fmtTime(e.date)}</span><span class="expense-mobile-note">${esc(e.note||'Tanpa keterangan')}</span></span><span class="expense-mobile-values"><small>Nominal</small><b>${rupiah(e.amount)}</b><span class="expense-mobile-value-method ${String(e.method||'Tunai').toLowerCase()==='transfer'?'transfer':'cash'}">${esc(e.method||'Tunai')}</span></span></button></article>`).join(''):`<div class="expense-mobile-empty"><b>Data tidak ditemukan</b><span>Ubah filter atau tekan + Pengeluaran untuk mencatat biaya.</span></div>`;
}
function toggleMobileExpenseSearch(force){const panel=document.getElementById('expenseMobileSearchPanel');if(!panel)return;const open=force===undefined?!panel.classList.contains('open'):!!force;panel.classList.toggle('open',open);if(open)setTimeout(()=>document.getElementById('expenseMobileSearch')?.focus(),40)}
function setExpenseMobileCategory(category){const el=document.getElementById('expenseMobileCategory');if(el)el.value=category;renderExpenses()}
function openExpenseMobileCategoryPicker(){const active=document.getElementById('expenseMobileCategory')?.value||'';const categories=['','Listrik','Operasional','Transport','Gaji'];const rows=categories.map(v=>`<button class="stock-mobile-action${v===active?' active':''}" type="button" onclick="closeModal();setExpenseMobileCategory('${v}')"><span class="ico">${v===active?'✓':'▣'}</span><span>${v?esc(v):'Semua Kategori'}</span></button>`).join('');showModal('Kategori Pengeluaran','Pilih kategori pengeluaran yang ingin ditampilkan.',`<div class="stock-mobile-action-list">${rows}</div>`,[{label:'Tutup',close:true}],true)}
function expenseMobileYearOptions(selected=''){
const current=new Date().getFullYear(),years=[...new Set([current,...(db.expenses||[]).map(e=>new Date(e.date).getFullYear()).filter(Number.isFinite)])].sort((a,b)=>b-a);
return years.map(y=>`<option value="${y}" ${String(y)===String(selected)?'selected':''}>${y}</option>`).join('')
}
function expenseMobileFilterDraft(){
return{
method:document.getElementById('expenseMobileFilterMethod')?.value||'',
period:document.querySelector('.expense-filter-period-btn.active')?.dataset.period||'',
day:document.getElementById('expenseMobileFilterDay')?.value||'',
month:document.getElementById('expenseMobileFilterMonth')?.value||'',
year:document.getElementById('expenseMobileFilterYear')?.value||'',
sort:document.getElementById('expenseMobileSort')?.value||'newest'
}
}
function expenseMobilePreviewTotal(){
const draft=expenseMobileFilterDraft(),category=document.getElementById('expenseMobileCategory')?.value||'',q=String(document.getElementById('expenseMobileSearch')?.value||'').trim().toLowerCase();
const total=sum((db.expenses||[]).filter(e=>{if(category&&e.category!==category)return false;if(draft.method&&e.method!==draft.method)return false;if(q&&!`${e.category||''} ${e.note||''} ${e.method||''}`.toLowerCase().includes(q))return false;const d=new Date(e.date);if(Number.isNaN(d.getTime()))return false;if(draft.period==='day'&&draft.day&&dateKey(d)!==draft.day)return false;if(draft.period==='month'&&draft.month&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`!==draft.month)return false;if(draft.period==='year'&&draft.year&&d.getFullYear()!==Number(draft.year))return false;return true}),e=>e.amount);
const el=document.getElementById('expenseMobileFilterTotal');if(el)el.textContent=rupiah(total);return total
}
function setExpenseMobileFilterMode(mode=''){
document.querySelectorAll('.expense-filter-period-btn').forEach(btn=>btn.classList.toggle('active',(btn.dataset.period||'')===mode));
['day','month','year'].forEach(key=>{const el=document.getElementById('expenseFilterField-'+key);if(el)el.hidden=mode!==key});
expenseMobilePreviewTotal()
}
function openExpenseMobileFilters(){
const method=document.getElementById('expenseMobileMethod')?.value||'',period=document.getElementById('expenseMobilePeriod')?.value||'',sort=window.expenseMobileSort||'newest',now=new Date();
const day=document.getElementById('expenseMobileDay')?.value||todayKey(),month=document.getElementById('expenseMobileMonth')?.value||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,year=document.getElementById('expenseMobileYear')?.value||String(now.getFullYear());
const total=Number(window.expenseMobileFilteredTotal)||0;
showModal('Filter Pengeluaran','Pilih periode per hari, bulan, atau tahun.',`<div class="expense-filter-total-card"><span>Total Pengeluaran</span><strong id="expenseMobileFilterTotal">${rupiah(total)}</strong></div><div class="expense-filter-period"><button type="button" class="expense-filter-period-btn ${!period?'active':''}" data-period="" onclick="setExpenseMobileFilterMode('')">Semua</button><button type="button" class="expense-filter-period-btn ${period==='day'?'active':''}" data-period="day" onclick="setExpenseMobileFilterMode('day')">Hari</button><button type="button" class="expense-filter-period-btn ${period==='month'?'active':''}" data-period="month" onclick="setExpenseMobileFilterMode('month')">Bulan</button><button type="button" class="expense-filter-period-btn ${period==='year'?'active':''}" data-period="year" onclick="setExpenseMobileFilterMode('year')">Tahun</button></div><div class="form-grid expense-filter-form"><div class="field full" id="expenseFilterField-day" ${period==='day'?'':'hidden'}><label>Tanggal</label><input id="expenseMobileFilterDay" type="date" value="${esc(day)}" onchange="expenseMobilePreviewTotal()"></div><div class="field full" id="expenseFilterField-month" ${period==='month'?'':'hidden'}><label>Bulan</label><input id="expenseMobileFilterMonth" type="month" value="${esc(month)}" onchange="expenseMobilePreviewTotal()"></div><div class="field full" id="expenseFilterField-year" ${period==='year'?'':'hidden'}><label>Tahun</label><select id="expenseMobileFilterYear" onchange="expenseMobilePreviewTotal()">${expenseMobileYearOptions(year)}</select></div><div class="field full"><label>Metode</label><select id="expenseMobileFilterMethod" onchange="expenseMobilePreviewTotal()"><option value="" ${!method?'selected':''}>Semua metode</option><option ${method==='Tunai'?'selected':''}>Tunai</option><option ${method==='Transfer'?'selected':''}>Transfer</option></select></div><div class="field full"><label>Urutan</label><select id="expenseMobileSort"><option value="newest" ${sort==='newest'?'selected':''}>Terbaru</option><option value="oldest" ${sort==='oldest'?'selected':''}>Terlama</option></select></div></div>`,[{label:'Reset',fn:()=>{const m=document.getElementById('expenseMobileMethod'),p=document.getElementById('expenseMobilePeriod'),d=document.getElementById('expenseMobileDay'),mo=document.getElementById('expenseMobileMonth'),y=document.getElementById('expenseMobileYear');if(m)m.value='';if(p)p.value='';if(d)d.value='';if(mo)mo.value='';if(y)y.value='';window.expenseMobileSort='newest';renderExpenses();closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{const draft=expenseMobileFilterDraft(),m=document.getElementById('expenseMobileMethod'),p=document.getElementById('expenseMobilePeriod'),d=document.getElementById('expenseMobileDay'),mo=document.getElementById('expenseMobileMonth'),y=document.getElementById('expenseMobileYear');if(m)m.value=draft.method;if(p)p.value=draft.period;if(d)d.value=draft.day;if(mo)mo.value=draft.month;if(y)y.value=draft.year;window.expenseMobileSort=draft.sort;renderExpenses();closeModal()}}]);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('expense-filter-overlay');modal?.classList.add('expense-filter-modal');setTimeout(()=>expenseMobilePreviewTotal(),0)
}
function buildExpenseReceipt58Canvas(e){
const canvas=document.createElement('canvas');canvas.width=384;let ctx=canvas.getContext('2d');
const width=384,pad=20,right=width-pad,contentW=width-(pad*2),store=String(db.settings.store||'INPOS'),f=receiptFieldConfig();
ctx.font='400 14px Arial';
const noteLines=wrapCanvasText(ctx,String(e.note||'-'),contentW-96);
ctx.font='400 12px Arial';
const addressLines=(f.storeAddress&&db.settings.address)?wrapCanvasText(ctx,String(db.settings.address),contentW):[];
const footerOn=f.footer!==false,footerText=String(db.settings.footer||'Terima kasih');
canvas.height=Math.max(430,320+(addressLines.length*16)+(noteLines.length*19)+(footerOn?72:20));ctx=canvas.getContext('2d');
ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#111827';ctx.textBaseline='top';let y=20;
const center=(text,font,step,color='#111827')=>{ctx.font=font;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(String(text),width/2,y);y+=step};
const pair=(label,value,bold=false)=>{ctx.textAlign='left';ctx.fillStyle='#4b5563';ctx.font='400 13px Arial';ctx.fillText(String(label),pad,y);ctx.textAlign='right';ctx.fillStyle='#111827';ctx.font=`${bold?'700':'600'} 13px Arial`;ctx.fillText(String(value),right,y);y+=22};
center('NOTA PENGELUARAN','900 22px Arial',30);if(f.storeName!==false)center(store,'800 16px Arial',22);
if(addressLines.length){ctx.font='400 12px Arial';ctx.fillStyle='#6b7280';ctx.textAlign='center';addressLines.forEach(line=>{ctx.fillText(line,width/2,y);y+=16})}
if(f.storePhone&&db.settings.phone)center(String(db.settings.phone),'400 12px Arial',18,'#6b7280');
y+=4;drawCanvasRule(ctx,pad,right,y,'#9ca3af',[4,4]);y+=14;
pair('No. Nota',`EXP-${e.id}`);pair('Tanggal',fmtTime(e.date));pair('Kategori',String(e.category||'-'));pair('Metode',String(e.method||'-'));
ctx.textAlign='left';ctx.fillStyle='#4b5563';ctx.font='400 13px Arial';ctx.fillText('Keterangan',pad,y);ctx.fillStyle='#111827';ctx.font='600 13px Arial';let ny=y;noteLines.forEach((line,i)=>{ctx.textAlign='right';ctx.fillText(line,right,ny+(i*19))});y+=Math.max(22,noteLines.length*19)+7;
drawCanvasRule(ctx,pad,right,y,'#9ca3af',[4,4]);y+=16;
ctx.textAlign='left';ctx.fillStyle='#111827';ctx.font='800 15px Arial';ctx.fillText('TOTAL PENGELUARAN',pad,y);ctx.textAlign='right';ctx.font='900 19px Arial';ctx.fillText(rupiah(e.amount||0),right,y-2);y+=34;
if(footerOn){drawCanvasRule(ctx,pad,right,y,'#d1d5db');y+=16;center(footerText,'400 12px Arial',18,'#6b7280');center('www.inpos.id','400 11px Arial',16,'#6b7280')}
return canvas
}
async function shareExpenseReceipt58PNG(id){
const e=db.expenses.find(x=>Number(x.id)===Number(id));if(!e)return toast('Pengeluaran tidak ditemukan.','error');
try{
const canvas=buildExpenseReceipt58Canvas(e),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat Nota 58 PNG.','error');
const fileName=`nota-pengeluaran-${String(e.id).replace(/[^A-Za-z0-9._-]/g,'-')}-58.png`;let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(err){}
if(file&&navigator.share&&navigator.canShare?.({files:[file]})){
try{await navigator.share({title:'Nota Pengeluaran',text:`Nota Pengeluaran ${db.settings.store||'INPOS'} • ${rupiah(e.amount||0)}`,files:[file]});return}catch(err){if(err?.name==='AbortError')return}
}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Nota 58 PNG dibuat. Bagikan file melalui WhatsApp atau aplikasi lain.')
}catch(err){console.error('shareExpenseReceipt58PNG',err);toast('Gagal membuat Nota 58 PNG.','error')}
}
function expenseReportDraft(){
const now=new Date();
const period=String(window.expenseReportPeriod||'day');
const defaultMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
return{
period,
day:String(window.__expenseReportDayValue||todayKey()),
month:String(window.__expenseReportMonthValue||defaultMonth),
year:String(window.__expenseReportYearValue||now.getFullYear()),
format:String(window.expenseReportFormat||'a4')
}
}
function getExpenseReportRows(draft=expenseReportDraft()){
const category=document.getElementById('expenseMobileCategory')?.value||'';
const q=String(document.getElementById('expenseMobileSearch')?.value||'').trim().toLowerCase();
const method=document.getElementById('expenseMobileMethod')?.value||'';
return(db.expenses||[]).filter(e=>{
if(category&&e.category!==category)return false;
if(method&&e.method!==method)return false;
if(q&&!`${e.category||''} ${e.note||''} ${e.method||''}`.toLowerCase().includes(q))return false;
const d=new Date(e.date);if(Number.isNaN(d.getTime()))return false;
if(draft.period==='day'&&draft.day&&dateKey(d)!==draft.day)return false;
if(draft.period==='month'&&draft.month&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`!==draft.month)return false;
if(draft.period==='year'&&draft.year&&String(d.getFullYear())!==String(draft.year))return false;
return true;
}).sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function expenseReportPeriodLabel(draft=expenseReportDraft()){
if(draft.period==='day')return draft.day?fmtDate(draft.day):'Per Hari';
if(draft.period==='month'){if(!draft.month)return'Per Bulan';const[y,m]=draft.month.split('-');return`${monthNames[Math.max(0,Number(m||1)-1)]||m} ${y}`;}
if(draft.period==='year')return draft.year||'Per Tahun';
return'Semua Periode';
}
function expenseReportPreview(){
const draft=expenseReportDraft();
const rows=getExpenseReportRows(draft);
const total=sum(rows,e=>Number(e.amount)||0);
const totalEl=document.getElementById('expenseReportTotal');if(totalEl)totalEl.textContent=rupiah(total);
const badge=document.getElementById('expenseReportPeriodBadge');if(badge)badge.textContent=expenseReportPeriodLabel(draft);
const count=document.getElementById('expenseReportCount');if(count)count.textContent=`${rows.length} data`;
return{draft,rows,total};
}
function setExpenseReportPeriod(mode='day'){
window.expenseReportPeriod=mode;
document.querySelectorAll('.expense-report-period button').forEach(btn=>btn.classList.toggle('active',(btn.dataset.period||'')===mode));
['day','month','year'].forEach(key=>{const el=document.getElementById('expenseReportField-'+key);if(el)el.hidden=key!==mode;});
expenseReportPreview();
}
function setExpenseReportFormat(mode='a4'){
window.expenseReportFormat=mode;
document.querySelectorAll('.expense-report-format button').forEach(btn=>btn.classList.toggle('active',(btn.dataset.format||'')===mode));
}
function syncExpenseReportDraftFromForm(){
const day=document.getElementById('expenseReportDay'),month=document.getElementById('expenseReportMonth'),year=document.getElementById('expenseReportYear'),now=new Date();
if(day)window.__expenseReportDayValue=String(day.value||todayKey());
if(month)window.__expenseReportMonthValue=String(month.value||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
if(year)window.__expenseReportYearValue=String(year.value||now.getFullYear());
expenseReportPreview();
}
function expenseReportYearOptions(selected=''){
const current=new Date().getFullYear();
const years=[...new Set([current,...(db.expenses||[]).map(e=>new Date(e.date).getFullYear()).filter(Number.isFinite)])].sort((a,b)=>b-a);
return years.map(y=>`<option value="${y}" ${String(y)===String(selected)?'selected':''}>${y}</option>`).join('');
}
function openExpenseMobileReportPopup(){
const draft=expenseReportDraft();
showModal('Laporan Pengeluaran','Pilih periode dan format, lalu bagikan laporan.',`<div class="report-clean-summary expense-clean-summary"><div class="report-clean-summary-main"><small>Total Pengeluaran</small><strong id="expenseReportTotal">Rp0</strong></div><div class="report-clean-summary-side"><b id="expenseReportPeriodBadge">${expenseReportPeriodLabel(draft)}</b><span id="expenseReportCount">0 data</span></div></div><section class="report-clean-step"><div class="report-clean-step-head"><i>1</i><div><b>Pilih Periode</b><small>Tentukan data pengeluaran yang ingin masuk laporan.</small></div></div><div class="expense-report-period report-clean-period"><button type="button" data-period="day" class="${draft.period==='day'?'active':''}" onclick="setExpenseReportPeriod('day')">Hari</button><button type="button" data-period="month" class="${draft.period==='month'?'active':''}" onclick="setExpenseReportPeriod('month')">Bulan</button><button type="button" data-period="year" class="${draft.period==='year'?'active':''}" onclick="setExpenseReportPeriod('year')">Tahun</button><button type="button" data-period="all" class="${draft.period==='all'?'active':''}" onclick="setExpenseReportPeriod('all')">Semua</button></div><div class="expense-report-fields report-clean-fields"><div class="field" id="expenseReportField-day" ${draft.period==='day'?'':'hidden'}><label>Tanggal laporan</label><input id="expenseReportDay" type="date" value="${esc(draft.day)}" onchange="syncExpenseReportDraftFromForm()"></div><div class="field" id="expenseReportField-month" ${draft.period==='month'?'':'hidden'}><label>Bulan laporan</label><input id="expenseReportMonth" type="month" value="${esc(draft.month)}" onchange="syncExpenseReportDraftFromForm()"></div><div class="field" id="expenseReportField-year" ${draft.period==='year'?'':'hidden'}><label>Tahun laporan</label><select id="expenseReportYear" onchange="syncExpenseReportDraftFromForm()">${expenseReportYearOptions(draft.year)}</select></div></div></section><section class="report-clean-step"><div class="report-clean-step-head"><i>2</i><div><b>Pilih Format</b><small>Pilih bentuk gambar yang akan dibagikan.</small></div></div><div class="expense-report-format report-clean-format"><button type="button" data-format="a4" class="${draft.format==='a4'?'active':''}" onclick="setExpenseReportFormat('a4')"><span class="report-clean-format-icon">A4</span><span><b>A4 PNG</b><small>Laporan dokumen, cocok untuk arsip dan cetak.</small></span></button><button type="button" data-format="png" class="${draft.format==='png'?'active':''}" onclick="setExpenseReportFormat('png')"><span class="report-clean-format-icon">▤</span><span><b>PNG</b><small>Gambar ringkas, cocok dibagikan ke WhatsApp.</small></span></button></div></section><div class="report-clean-note"><b>Data yang digunakan</b><span>Laporan mengikuti kategori, pencarian, dan metode Pengeluaran yang sedang aktif.</span></div>`,[{label:'Tutup',close:true},{label:'Bagikan Laporan',primary:true,fn:()=>shareExpenseMobileReport()}],true);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');
overlay?.classList.add('expense-report-overlay');modal?.classList.add('expense-report-modal','report-clean-modal');
setTimeout(()=>expenseReportPreview(),20);
}
function expenseReportCanvas(draft,rows,total,format='a4'){
const isA4=format==='a4';
const width=isA4?1240:820;
const pad=isA4?70:42;
const lineGap=isA4?24:19;
const headTitle=isA4?34:28;
const body=isA4?18:15;
const small=isA4?15:12;
const visibleRows=rows.slice(0,isA4?28:18);
const extra=rows.length-visibleRows.length;
let height=isA4?1754:Math.max(860,360+visibleRows.length*52+(extra>0?50:0));
const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');
c.fillStyle='#ffffff';c.fillRect(0,0,width,height);
c.fillStyle='#111827';c.font=`700 ${headTitle}px Arial`;c.fillText('Laporan Pengeluaran',pad,pad);
c.fillStyle='#6b7280';c.font=`${small}px Arial`;c.fillText(String(db.settings.store||'INPOS'),pad,pad+28);
c.textAlign='right';c.fillStyle='#dc2626';c.font=`800 ${isA4?30:24}px Arial`;c.fillText(rupiah(total),width-pad,pad+6);
c.fillStyle='#6b7280';c.font=`700 ${small}px Arial`;c.fillText('Total Pengeluaran',width-pad,pad+28);
const periodLabel=expenseReportPeriodLabel(draft);
let y=pad+56;
c.textAlign='left';
c.fillStyle='#f8fafc';c.fillRect(pad,y,width-pad*2,58);c.strokeStyle='#e5e7eb';c.strokeRect(pad,y,width-pad*2,58);
c.fillStyle='#475569';c.font=`700 ${small}px Arial`;c.fillText('Periode',pad+16,y+22);c.fillText('Dicetak',width/2,y+22);
c.fillStyle='#111827';c.font=`700 ${body}px Arial`;c.fillText(periodLabel,pad+16,y+44);c.fillText(fmtTime(new Date().toISOString()),width/2,y+44);
y+=82;
c.strokeStyle='#e5e7eb';c.lineWidth=1;
const cols=[pad,width-pad-150,width-pad];
c.fillStyle='#64748b';c.font=`700 ${small}px Arial`;c.fillText('Keterangan',cols[0],y);c.fillText('Metode',cols[1]-55,y);c.textAlign='right';c.fillText('Nominal',cols[2],y);c.textAlign='left';y+=12;c.beginPath();c.moveTo(pad,y);c.lineTo(width-pad,y);c.stroke();y+=lineGap;
c.font=`${body}px Arial`;c.fillStyle='#111827';
visibleRows.forEach((row,idx)=>{
const d=fmtDate(row.date);const cat=String(row.category||'Pengeluaran');const note=String(row.note||'-');const title=`${idx+1}. ${cat}`;const meta=`${d} • ${note}`;
c.font=`700 ${body}px Arial`;c.fillText(title,cols[0],y);
c.font=`${small}px Arial`;c.fillStyle='#6b7280';c.fillText(meta,cols[0],y+17);
c.fillStyle=String(row.method||'Tunai').toLowerCase()==='transfer'?'#2563eb':'#16a34a';c.font=`700 ${small}px Arial`;c.fillText(String(row.method||'Tunai'),cols[1]-55,y+6);
c.textAlign='right';c.fillStyle='#dc2626';c.font=`800 ${body}px Arial`;c.fillText(rupiah(row.amount||0),cols[2],y+6);c.textAlign='left';
c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(pad,y+28);c.lineTo(width-pad,y+28);c.stroke();
c.fillStyle='#111827';y+=52;
});
if(!rows.length){c.fillStyle='#6b7280';c.font=`${body}px Arial`;c.fillText('Tidak ada data pengeluaran pada periode ini.',pad,y);y+=32;}
if(extra>0){c.fillStyle='#6b7280';c.font=`italic ${small}px Arial`;c.fillText(`+ ${extra} pengeluaran lainnya tetap tercakup dalam total laporan.`,pad,y);y+=26;}
y=Math.max(y+10,height-90);
c.strokeStyle='#e5e7eb';c.beginPath();c.moveTo(pad,y);c.lineTo(width-pad,y);c.stroke();y+=26;
c.fillStyle='#6b7280';c.font=`${small}px Arial`;c.textAlign='center';c.fillText('Laporan Pengeluaran • INPOS • www.inpos.id',width/2,y);
return canvas;
}
async function shareExpenseMobileReport(){
syncExpenseReportDraftFromForm();
const draft=expenseReportDraft();
const rows=getExpenseReportRows(draft);const total=sum(rows,e=>Number(e.amount)||0);
const format=window.expenseReportFormat||'a4';
const canvas=expenseReportCanvas(draft,rows,total,format);
const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
if(!blob)return toast('Gagal membuat laporan PNG.','error');
const file=new File([blob],`laporan-pengeluaran-${draft.period||'semua'}-${format}.png`,{type:'image/png'});
if(navigator.share&&navigator.canShare?.({files:[file]})){
try{await navigator.share({title:'Laporan Pengeluaran',text:`${db.settings.store||'INPOS'} • ${expenseReportPeriodLabel(draft)} • ${rupiah(total)}`,files:[file]});closeModal();return}catch(e){if(e?.name==='AbortError')return;}
}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
toast(`${format==='a4'?'A4 PNG':'PNG'} dibuat. Bagikan file dari perangkat jika share langsung tidak tersedia.`);
closeModal();
}
function openExpenseMobileDetail(id){
const e=db.expenses.find(x=>Number(x.id)===Number(id));if(!e)return;
showModal('Detail Pengeluaran',e.category||'Pengeluaran',`<div class="expense-detail-card"><div class="expense-detail-total"><small>Nominal Pengeluaran</small><strong>${rupiah(e.amount||0)}</strong><span>${esc(e.method||'-')}</span></div><div class="expense-detail-list"><div><span>Tanggal</span><b>${fmtTime(e.date)}</b></div><div><span>Kategori</span><b>${esc(e.category||'-')}</b></div><div><span>Keterangan</span><b>${esc(e.note||'-')}</b></div><div><span>Metode Pembayaran</span><b>${esc(e.method||'-')}</b></div><div><span>No. Nota</span><b>EXP-${esc(String(e.id))}</b></div></div></div>`,[{label:'Hapus',danger:true,fn:()=>{closeModal();deleteExpense(e.id)}},{label:'Share Nota 58',primary:true,fn:()=>shareExpenseReceipt58PNG(e.id)},{label:'Tutup',close:true}]);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('expense-detail-overlay');modal?.classList.add('expense-detail-modal')
}
function openExpenseModal(){
const today=todayKey();
showModal('Tambah Pengeluaran','Catat biaya toko.',`<div class="form-grid expense-add-form"><div class="field full expense-add-date"><label>Tanggal</label><input id="eDate" type="date" value="${today}" max="${today}"></div><div class="expense-add-pair"><div class="field"><label>Kategori</label><select id="eCat"><option>Operasional</option><option>Listrik</option><option>Transport</option><option>Gaji</option></select></div><div class="field"><label>Metode</label><select id="eMethod"><option>Tunai</option><option>Transfer</option></select></div></div><div class="field full"><label>Keterangan</label><input id="eNote" maxlength="120" placeholder="Contoh: beli plastik"></div><div class="field full expense-add-amount"><label>Nominal</label><input id="eAmount" class="nominal-input" type="text" inputmode="numeric" placeholder="0"></div></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{
const amount=Math.max(0,parseNominal(document.getElementById('eAmount').value));if(amount<=0)return toast('Nominal pengeluaran harus lebih dari 0.','error');
const note=document.getElementById('eNote').value.trim();if(!note)return toast('Keterangan pengeluaran wajib diisi.','error');
const dateValue=String(document.getElementById('eDate')?.value||'').trim();if(!dateValue)return toast('Tanggal pengeluaran wajib diisi.','error');
const now=new Date(),time=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
const expenseDate=new Date(`${dateValue}T${time}`);if(Number.isNaN(expenseDate.getTime()))return toast('Tanggal pengeluaran tidak valid.','error');
db.expenses.unshift({id:numericUid(),date:expenseDate.toISOString(),category:document.getElementById('eCat').value,note,method:document.getElementById('eMethod').value,amount});save();renderAll();closeModal();toast('Pengeluaran dicatat.')
}}]);
const overlay=document.getElementById('overlay'),modal=document.getElementById('modalBox');overlay?.classList.add('expense-add-overlay');modal?.classList.add('expense-add-modal');
setTimeout(()=>document.getElementById('eDate')?.focus(),40)
}
function deleteExpense(id){db.expenses=db.expenses.filter(x=>x.id!==id);save();renderAll();toast('Pengeluaran dihapus.')}
function currentShiftData(){const x=db.settings?.currentShift;return x&&typeof x==='object'?x:null}
function shiftSessionTotals(shift=currentShiftData()){
if(!shift)return{cash:0,cashExpense:0,expected:0};
const start=new Date(shift.openedAt||0).getTime();
const cash=sum(db.sales.filter(s=>s.method==='Tunai'&&new Date(s.date).getTime()>=start),s=>s.total);
const cashExpense=sum(db.expenses.filter(e=>e.method==='Tunai'&&new Date(e.date).getTime()>=start),e=>e.amount||0);
return{cash,cashExpense,expected:Math.max(0,(Number(shift.openingCash)||0)+cash-cashExpense)}
}
function renderShift(){
const shift=currentShiftData(),tot=shiftSessionTotals(shift),statusTitle=document.getElementById('shiftStatusTitle'),statusMeta=document.getElementById('shiftStatusMeta'),action=document.getElementById('shiftActionBtn');
const opening=document.getElementById('shiftOpeningCash'),openingMeta=document.getElementById('shiftOpeningMeta'),cashEl=document.getElementById('shiftCashSales'),expectedEl=document.getElementById('shiftExpected'),statusValue=document.getElementById('shiftStatusValue'),statusTime=document.getElementById('shiftStatusTime');
if(opening)opening.textContent=rupiah(shift?.openingCash||0);if(cashEl)cashEl.textContent=rupiah(tot.cash);const shiftExpenseEl=document.getElementById('shiftCashExpenses');if(shiftExpenseEl)shiftExpenseEl.textContent=rupiah(tot.cashExpense||0);if(expectedEl)expectedEl.textContent=rupiah(tot.expected);
if(shift){const opened=new Date(shift.openedAt);if(statusTitle)statusTitle.textContent='Shift Aktif';if(statusMeta)statusMeta.textContent=`${shift.cashier} • Dibuka ${fmtTime(shift.openedAt)}`;if(openingMeta)openingMeta.textContent=`${shift.cashier} • ${fmtDate(shift.openedAt)}`;if(statusValue){statusValue.textContent='Aktif';statusValue.className='text-success'}if(statusTime)statusTime.textContent=`${fmtTime(shift.openedAt)} – sekarang`;if(action){action.textContent='Tutup Shift';action.className='btn btn-danger btn-sm'}}
else{if(statusTitle)statusTitle.textContent='Belum Buka Shift';if(statusMeta)statusMeta.textContent='Buka shift sebelum mulai transaksi kasir';if(openingMeta)openingMeta.textContent='Belum ada kas awal';if(statusValue){statusValue.textContent='Tutup';statusValue.className=''}if(statusTime)statusTime.textContent='Tidak ada shift aktif';if(action){action.textContent='Buka Shift';action.className='btn btn-primary btn-sm'}}
const hist=document.getElementById('shiftTable');if(hist)hist.innerHTML=db.shifts.length?db.shifts.map(s=>`<tr><td data-label="Tanggal" data-main="true"><div class="cell-title">${fmtDate(s.date)}</div><div class="cell-sub">${s.openedAt?`${fmtTime(s.openedAt)} – ${fmtTime(s.closedAt||s.date)}`:fmtTime(s.date)}</div></td><td data-label="Kasir">${esc(s.cashier)}</td><td data-label="Seharusnya">${rupiah(s.expected)}</td><td data-label="Aktual">${rupiah(s.counted)}</td><td data-label="Selisih" class="money ${s.diff<0?'text-danger':'text-success'}">${rupiah(s.diff)}</td><td data-label="Status"><span class="pill green">Ditutup</span></td><td data-label="Cetak" class="shift-print-cell"><button type="button" class="shift-print-btn" aria-label="Cetak shift ${esc(s.cashier||'Kasir')}" title="Cetak Shift" onclick="printShiftRecord('${encodeURIComponent(String(s.id))}')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V4h10v4"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M7 14h10v7H7z"></path><path d="M18 12h.01"></path></svg><span>Cetak</span></button></td></tr>`).join(''):'<tr class="shift-empty-row"><td colspan="7"><div class="empty">Belum ada riwayat shift.</div></td></tr>';
const hc=document.getElementById('shiftHistoryCount');if(hc)hc.textContent=`${db.shifts.length} shift`;
document.querySelectorAll('.desktop-actions button[onclick="openShiftModal()"]')?.forEach?.(b=>b.textContent=shift?'◷ Shift aktif':'◷ Buka Shift')
}
function shiftPrintHTML(s){
const diff=Number(s?.diff)||0,opened=s?.openedAt||s?.date,closed=s?.closedAt||s?.date;
const note=String(s?.note||'').trim();
return`<div class="shift-print-receipt"><div class="shift-print-brand">${esc(db.settings.store||'INPOS')}</div><div class="shift-print-title">LAPORAN SHIFT KASIR</div><div class="shift-print-line"></div><div class="shift-print-row"><span>ID Shift</span><b>${esc(String(s?.id||'-'))}</b></div><div class="shift-print-row"><span>Kasir</span><b>${esc(s?.cashier||'-')}</b></div><div class="shift-print-row"><span>Dibuka</span><b>${esc(fmtTime(opened))}</b></div><div class="shift-print-row"><span>Ditutup</span><b>${esc(fmtTime(closed))}</b></div><div class="shift-print-line"></div><div class="shift-print-row"><span>Kas Awal</span><b>${rupiah(s?.openingCash||0)}</b></div><div class="shift-print-row"><span>Penjualan Tunai</span><b>${rupiah(s?.cashSales||0)}</b></div><div class="shift-print-row"><span>Pengeluaran Tunai</span><b>${rupiah(s?.cashExpense||0)}</b></div><div class="shift-print-row"><span>Kas Seharusnya</span><b>${rupiah(s?.expected||0)}</b></div><div class="shift-print-row"><span>Kas Aktual</span><b>${rupiah(s?.counted||0)}</b></div><div class="shift-print-line"></div><div class="shift-print-row shift-print-total"><span>Selisih</span><b>${rupiah(diff)}</b></div>${note?`<div class="shift-print-note"><span>NOTE</span><p>${esc(note)}</p></div>`:''}<div class="shift-print-line"></div><div class="shift-print-footer">Dicetak ${esc(fmtTime(new Date().toISOString()))}</div></div>`
}
function printShiftRecord(encodedId){
const id=decodeURIComponent(String(encodedId||'')),s=(db.shifts||[]).find(x=>String(x.id)===id);
if(!s)return toast('Data shift tidak ditemukan.','error');
const width=String(db.settings.receiptWidth)==='80'?'80':'58',zone=document.getElementById('printZone');
if(!zone)return toast('Area cetak tidak tersedia.','error');
prepareThermalPrintPage(width);zone.className=`printable receipt-${width}`;zone.style.width=width+'mm';zone.style.maxWidth=width+'mm';zone.innerHTML=shiftPrintHTML(s);setTimeout(()=>window.print(),80)
}
function openShiftModal(){if(!shiftFeatureEnabled())return toast('Fitur Shift sedang dinonaktifkan.','error');return currentShiftData()?openShiftCloseModal():openShiftStartModal()}
function openShiftStartModal(){
if(currentShiftData())return toast('Masih ada shift yang aktif.','error');
const cashier=String(db.settings.cashier||'Kasir').trim()||'Kasir';
showModal('Buka Shift','Mulai sesi kasir.',`<div class="shift-open-form-v540"><div class="shift-open-cash-v540"><label for="shiftOpenCash">Kas Awal</label><div class="shift-open-input-v540"><span aria-hidden="true">Rp</span><input id="shiftOpenCash" class="nominal-input" type="text" inputmode="numeric" autocomplete="off" aria-label="Kas Awal" value="${nominal(db.settings.openingCash||0)}"></div><small>Uang tunai di laci saat shift dimulai.</small></div><div class="field shift-open-note-v540"><label for="shiftOpenNote">Catatan <span class="muted">(opsional)</span></label><input id="shiftOpenNote" maxlength="80" placeholder="Mis. Shift pagi"></div></div>`,[{label:'Batal',close:true},{label:'Buka Shift',primary:true,fn:()=>{const openingCash=Math.max(0,parseNominal(document.getElementById('shiftOpenCash')?.value||0)),note=String(document.getElementById('shiftOpenNote')?.value||'').trim();db.settings.openingCash=openingCash;db.settings.currentShift={id:uid('SHIFT'),openedAt:new Date().toISOString(),openingCash,cashier,note};save();closeModal();renderAll();toast('Shift berhasil dibuka.')}}],false);
document.getElementById('overlay')?.classList.add('shift-open-overlay-v540');
document.getElementById('modalBox')?.classList.add('shift-open-modal-v540');
setTimeout(()=>{const el=document.getElementById('shiftOpenCash');if(el){el.focus({preventScroll:true});el.select();}},60);
}
function openShiftCloseModal(){
const shift=currentShiftData();if(!shift)return openShiftStartModal();const{cash,cashExpense,expected}=shiftSessionTotals(shift);
showModal('Tutup Shift','Hitung kas fisik sebelum menutup shift.',`<div class="form-grid"><div class="field"><label>Kas Awal</label><input disabled value="${nominal(shift.openingCash||0)}"></div><div class="field"><label>Penjualan Tunai</label><input disabled value="${nominal(cash)}"></div><div class="field"><label>Pengeluaran Tunai</label><input disabled value="${nominal(cashExpense)}"></div><div class="field"><label>Kas Seharusnya</label><input disabled value="${nominal(expected)}"></div><div class="field full"><label>Kas Aktual di Laci</label><input id="countedCash" class="nominal-input" type="text" inputmode="numeric" value="${nominal(expected)}" oninput="document.getElementById('shiftDiff').textContent=rupiah(parseNominal(this.value)-${expected})"></div></div><div class="change-box"><span>Selisih</span><b id="shiftDiff">Rp0</b></div>`,[{label:'Batal',close:true},{label:'Tutup Shift',danger:true,fn:()=>{const counted=Math.max(0,parseNominal(document.getElementById('countedCash')?.value||0)),closedAt=new Date().toISOString();db.shifts.unshift({id:shift.id||Date.now(),date:closedAt,openedAt:shift.openedAt,closedAt,cashier:shift.cashier||db.settings.cashier,openingCash:shift.openingCash||0,cashSales:cash,cashExpense,expected,counted,diff:counted-expected,note:shift.note||''});db.settings.currentShift=null;db.settings.openingCash=0;save();closeModal();renderAll();toast('Shift ditutup dan tersimpan.')}}],true)
}
function renderCustomers(){
const q=(document.getElementById('customerSearch')?.value||'').trim().toLowerCase();
const rows=db.customers.filter(c=>!q||String(c.name||'').toLowerCase().includes(q)||String(c.phone||'').toLowerCase().includes(q));
const count=document.getElementById('customerCountPill');if(count)count.textContent=rows.length+' pelanggan';
const table=document.getElementById('customerTable');
if(table)table.innerHTML=rows.map(c=>`<tr><td data-label="Pelanggan" data-main="true"><div class="cell-title">${esc(c.name)}</div><div class="cell-sub">ID #${c.id}</div></td><td data-label="WhatsApp">${esc(c.phone||'-')}</td><td data-label="Poin"><span class="pill blue">${Number(c.points||0).toLocaleString('id-ID')}</span></td><td data-label="Total Belanja" class="money">${rupiah(c.spent||0)}</td><td data-label="Bon" class="money ${Number(c.debt||0)?'text-danger':''}">${rupiah(c.debt||0)}</td><td data-label="Terakhir">${c.last?fmtDate(c.last):'-'}</td><td data-label="Aksi"><button class="btn btn-sm" onclick="openCustomerModal(${c.id})">Edit</button></td></tr>`).join('');
const mobile=document.getElementById('customerMobileList');
if(mobile){
mobile.innerHTML=rows.length?rows.map(c=>{
const points=Math.max(0,Number(c.points)||0),debt=Math.max(0,Number(c.debt)||0),spent=Math.max(0,Number(c.spent)||0),initial=String(c.name||'P').trim().charAt(0).toUpperCase()||'P';
return`<button class="customer-mobile-card" type="button" onclick="openCustomerModal(${c.id})" aria-label="Edit pelanggan ${esc(c.name)}"><span class="customer-mobile-info"><span class="customer-mobile-name">${esc(c.name)}</span><span class="customer-mobile-phone">${esc(c.phone||'WhatsApp belum diisi')}</span><span class="customer-mobile-meta"><span class="customer-mobile-pill points">${points.toLocaleString('id-ID')} poin</span></span><span class="customer-mobile-last">${c.last?'Terakhir '+fmtDate(c.last):'Belum ada transaksi'}</span></span><span class="customer-mobile-values"><span class="customer-mobile-spent"><small>Total Belanja</small>${rupiah(spent)}</span><span class="customer-mobile-debt ${debt?'has-debt':''}"><small>Bon</small>${rupiah(debt)}</span></span></button>`
}).join(''):`<div class="customer-mobile-empty"><b>${q?'Pelanggan tidak ditemukan':'Belum ada pelanggan'}</b><span>${q?'Coba nama atau nomor WhatsApp lain.':'Tekan + Pelanggan untuk menambahkan data.'}</span></div>`;
}
}
function openCustomerModal(id=null){const c=id?getCustomer(id):null;showModal(c?'Edit Pelanggan':'Tambah Pelanggan',c?.name||'Simpan data pelanggan untuk poin dan bon.',`<div class="form-grid customer-form"><div class="field full"><label>Nama Pelanggan</label><input id="cName" value="${esc(c?.name||'')}" placeholder="Nama pelanggan"></div><div class="field full"><label>WhatsApp</label><input id="cPhone" inputmode="tel" value="${esc(c?.phone||'62')}" placeholder="08xxxxxxxxxx"></div><div class="field full"><label>Alamat</label><textarea id="cAddress" placeholder="Alamat pelanggan">${esc(c?.address||'')}</textarea></div><div class="customer-point-bon-row"><div class="field"><label>Poin</label><input id="cPoints" type="number" inputmode="numeric" min="0" value="${c?.points||0}"></div><div class="field"><label>Bon</label><input id="cDebt" class="nominal-input" type="text" inputmode="numeric" value="${nominal(c?.debt||0)}" placeholder="0"></div></div></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{const name=document.getElementById('cName').value.trim();if(!name)return toast('Nama pelanggan wajib diisi.','error');const data={name,phone:document.getElementById('cPhone').value.trim(),address:document.getElementById('cAddress').value.trim(),points:Math.max(0,Number(document.getElementById('cPoints').value)||0),debt:Math.max(0,parseNominal(document.getElementById('cDebt').value))};if(c){const oldPoints=Math.max(0,Number(c.points)||0);Object.assign(c,data);if(data.points<=0)c.pointsExpiresAt=null;else if(data.points!==oldPoints||!c.pointsExpiresAt)c.pointsExpiresAt=pointExpiryISO(new Date())}else db.customers.push({id:Math.max(0,...db.customers.map(x=>Number(x.id)||0))+1,spent:0,last:new Date().toISOString(),due:null,email:'',pointsExpiresAt:data.points>0?pointExpiryISO(new Date()):null,...data});save();renderAll();closeModal();toast('Pelanggan disimpan.')}}]);document.getElementById('modalBox')?.classList.add('customer-modal');document.getElementById('overlay')?.classList.add('customer-overlay');setTimeout(()=>document.getElementById('cName')?.focus(),70)}
function renderSuppliers(){
const grid=document.getElementById('supplierGrid');if(!grid)return;
const mobileMode=true;
const q=String((mobileMode?document.getElementById('supplierMobileSearch')?.value:document.getElementById('supplierSearch')?.value)||'').trim().toLowerCase(),filter=String(document.getElementById('supplierDebtFilter')?.value||'all'),sort=window.supplierMobileSort||'name-asc';
let rows=(db.suppliers||[]).map(s=>{const ps=(db.purchases||[]).filter(p=>p.supplierId===s.id&&!purchaseIsDraft(p)),total=sum(ps,p=>Number(p.total)||0),debt=sum(ps,p=>Math.max(0,(Number(p.total)||0)-(Number(p.paid)||0)));return{s,total,debt,count:ps.length}}).filter(({s,debt})=>{
if(q&&![s.name,s.phone,s.address].some(v=>String(v||'').toLowerCase().includes(q)))return false;
if(filter==='debt'&&debt<=0)return false;
if(filter==='clear'&&debt>0)return false;
return true;
});
rows.sort((a,b)=>sort==='name-desc'?String(b.s.name||'').localeCompare(String(a.s.name||''),'id'):sort==='debt-desc'?b.debt-a.debt:String(a.s.name||'').localeCompare(String(b.s.name||''),'id'));
syncPurchaseRelationMobileFilterUI('supplier');
const countEl=document.getElementById('supplierHistoryCount'),debtEl=document.getElementById('supplierHistoryDebt');
if(countEl)countEl.textContent=`${rows.length} supplier`;
if(debtEl)debtEl.textContent=rupiah(sum(rows,x=>x.debt));
grid.innerHTML=rows.length?rows.map(({s,total,debt,count})=>`<article class="relation-history-card supplier-history-card"><div class="relation-history-icon supplier"><span>${esc(String(s.name||'S').trim().charAt(0).toUpperCase()||'S')}</span><small>SUP</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(s.name||'Supplier')}</div><div class="relation-history-time">${esc(s.phone||'WhatsApp belum diisi')}</div><div class="relation-history-meta"><span class="relation-status ${debt>0?'debt':'paid'}">${debt>0?'Ada Hutang':'Lunas'}</span><span>${esc(s.address||'Alamat belum diisi')} • ${count} pembelian</span></div></div><div class="relation-history-value"><small>Total Pembelian</small><strong>${rupiah(total)}</strong><span class="relation-history-remain ${debt>0?'':'paid'}">${debt>0?'Hutang '+rupiah(debt):'Tanpa hutang'}</span><div class="relation-history-actions"><button type="button" onclick="openSupplierModal(${s.id})">Edit</button><button type="button" onclick="openSupplierDebtPage()">Hutang</button></div></div></article>`).join(''):`<div class="relation-history-empty"><b>${q||filter!=='all'?'Supplier tidak ditemukan':'Belum ada supplier'}</b><span>${q||filter!=='all'?'Ubah pencarian atau filter status.':'Tekan + Supplier untuk menambahkan pemasok.'}</span></div>`
}
function openSupplierModal(id=null){const s=id?getSupplier(id):null;showModal(s?'Edit Supplier':'Tambah Supplier',s?.name||'Data pemasok barang.',`<div class="form-grid"><div class="field full"><label>Nama Supplier</label><input id="sName" value="${esc(s?.name||'')}" placeholder="Nama pemasok"></div><div class="field"><label>WhatsApp</label><input id="sPhone" inputmode="tel" value="${esc(s?.phone||'62')}" placeholder="08xxxxxxxxxx"></div><div class="field"><label>Kota / Alamat</label><input id="sAddress" value="${esc(s?.address||'')}" placeholder="Kota atau alamat"></div></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{const name=document.getElementById('sName').value.trim();if(!name)return toast('Nama supplier wajib diisi.','error');const data={name,phone:document.getElementById('sPhone').value.trim(),address:document.getElementById('sAddress').value.trim()};if(s)Object.assign(s,data);else db.suppliers.push({id:Math.max(0,...db.suppliers.map(x=>Number(x.id)||0))+1,...data});save();renderAll();closeModal();toast('Supplier disimpan.')}}],true)}
function reportBetween(rows,period,dateField='date'){return(Array.isArray(rows)?rows:[]).filter(row=>{const d=new Date(row?.[dateField]||row?.date);return!Number.isNaN(d.getTime())&&d>=period.start&&d<=period.end})}
function reportSales(period,{includeReturned=false,returnsOnly=false}={}){return reportBetween(db.sales,period).filter(s=>returnsOnly?!!s.returned:(includeReturned?true:validSale(s)))}
function reportPurchases(period,{returnsOnly=false}={}){return reportBetween(db.purchases,period).filter(p=>!purchaseIsDraft(p)).filter(p=>returnsOnly?!!p.returned:!p.returned)}
function reportMoneyStat(label,value){return`<div class="report-detail-stat"><small>${esc(label)}</small><b>${rupiah(value||0)}</b></div>`}
function reportCountStat(label,value){return`<div class="report-detail-stat"><small>${esc(label)}</small><b>${Number(value||0).toLocaleString('id-ID')}</b></div>`}
function reportList(rows){return`<div class="report-detail-list">${rows.length?rows.join(''):'<div class="report-detail-empty">Belum ada data pada periode ini.</div>'}</div>`}
function reportTransactionRows(rows,type='sale'){
return rows.map(x=>{if(type==='purchase'){const supplier=getSupplier(x.supplierId)?.name||'-';return`<div class="report-detail-row"><div class="report-detail-main"><b>${esc(x.id)}</b><small>${fmtTime(x.date)} • ${esc(supplier)} • ${Number(x.items||0)} item</small></div><div class="report-detail-value">${rupiah(x.total)}</div></div>`}
const customer=getCustomer(x.customerId)?.name||'Pelanggan Umum';return`<div class="report-detail-row"><div class="report-detail-main"><b>${esc(x.id)}</b><small>${fmtTime(x.date)} • ${esc(customer)} • ${esc(salePaymentNameV264(x))}</small></div><div class="report-detail-value">${rupiah(x.total)}</div></div>`}).join('')
}
function reportRankingRows(items,unit=''){return reportList(items.map((x,i)=>`<div class="report-detail-row"><div class="report-detail-main"><b>${i+1}. ${esc(x.name)}</b><small>${esc(x.sub||'')}</small></div><div class="report-detail-value">${typeof x.value==='number'?x.value.toLocaleString('id-ID'):esc(x.value||'0')}${unit?` ${esc(unit)}`:''}</div></div>`))}
function openReportPeriodPicker(){openGeneralReportPage('period')}
const generalReportState={
kind:'month',
day:todayKey(),
month:todayKey().slice(0,7),
year:String(new Date().getFullYear()),
start:todayKey().slice(0,8)+'01',
end:todayKey()
};
function openGeneralReportPage(kind='month'){
generalReportState.kind=['day','month','year','period'].includes(kind)?kind:'month';
go('report-general')
}
function generalReportPeriod(){
const kind=generalReportState.kind,now=new Date();
if(kind==='day'){
const key=generalReportState.day||todayKey(),start=new Date(key+'T00:00:00'),end=new Date(key+'T23:59:59.999');
return{start,end,label:fmtDate(start)}
}
if(kind==='month'){
const raw=String(generalReportState.month||todayKey().slice(0,7)),m=raw.match(/^(\d{4})-(\d{2})$/),y=m?Number(m[1]):now.getFullYear(),mi=m?Number(m[2])-1:now.getMonth();
const start=new Date(y,mi,1),end=new Date(y,mi+1,0,23,59,59,999);return{start,end,label:start.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
}
if(kind==='year'){
const y=Math.max(2000,Math.min(2100,Number(generalReportState.year)||now.getFullYear())),start=new Date(y,0,1),end=new Date(y,11,31,23,59,59,999);return{start,end,label:String(y)}
}
const startKey=generalReportState.start||todayKey().slice(0,8)+'01',endKey=generalReportState.end||todayKey();
let start=new Date(startKey+'T00:00:00'),end=new Date(endKey+'T23:59:59.999');if(start>end){const t=start;start=new Date(endKey+'T00:00:00');end=new Date(startKey+'T23:59:59.999');generalReportState.start=dateKey(start);generalReportState.end=dateKey(end)}
return{start,end,label:`${fmtDate(start)} - ${fmtDate(end)}`}
}
function generalReportKindTabs(){
const k=generalReportState.kind;if(k==='period')return'';
return`<div class="general-report-kind-tabs" role="tablist" aria-label="Jenis periode laporan umum"><button type="button" class="${k==='day'?'active':''}" aria-selected="${k==='day'}" onclick="setGeneralReportKind('day')">Harian</button><button type="button" class="${k==='month'?'active':''}" aria-selected="${k==='month'}" onclick="setGeneralReportKind('month')">Bulanan</button><button type="button" class="${k==='year'?'active':''}" aria-selected="${k==='year'}" onclick="setGeneralReportKind('year')">Tahunan</button></div>`
}
function setGeneralReportKind(kind){
if(!['day','month','year'].includes(kind))return;
generalReportState.kind=kind;renderGeneralReportPage()
}
function reportYearOptions(selected){
const nowYear=new Date().getFullYear(),years=[];
const collect=(rows)=>{(Array.isArray(rows)?rows:[]).forEach(row=>{const d=new Date(row?.date||row?.createdAt||row?.updatedAt||'');if(!Number.isNaN(d.getTime()))years.push(d.getFullYear())})};
collect(db.sales);collect(db.purchases);collect(db.expenses);collect(db.cashEntries);
const selectedYear=Math.max(2000,Math.min(2100,Number(selected)||nowYear));
years.push(nowYear,selectedYear);
const dataMin=years.length?Math.min(...years):nowYear,dataMax=years.length?Math.max(...years):nowYear;
const minYear=Math.max(2000,Math.min(dataMin,nowYear-5,selectedYear)),maxYear=Math.min(2100,Math.max(dataMax,nowYear+1,selectedYear));
let html='';for(let y=maxYear;y>=minYear;y--)html+=`<option value="${y}" ${y===selectedYear?'selected':''}>${y}</option>`;
return html
}
function generalReportFilterHTML(){
const k=generalReportState.kind,tabs=generalReportKindTabs();
if(k==='day')return`${tabs}<div class="field"><label>Tanggal</label><input id="generalReportDay" type="date" value="${esc(generalReportState.day)}" onchange="autoApplyGeneralReportFilter('day',this.value)"></div>`;
if(k==='month')return`${tabs}<div class="field"><label>Bulan</label><input id="generalReportMonth" type="month" value="${esc(generalReportState.month)}" onchange="autoApplyGeneralReportFilter('month',this.value)"></div>`;
if(k==='year')return`${tabs}<div class="field"><label>Tahun</label><select id="generalReportYear" onchange="autoApplyGeneralReportFilter('year',this.value)">${reportYearOptions(generalReportState.year)}</select></div>`;
return`<div class="field"><label>Tanggal Awal</label><input id="generalReportStart" type="date" value="${esc(generalReportState.start)}" onchange="autoApplyGeneralReportFilter('start',this.value)"></div><div class="field"><label>Tanggal Akhir</label><input id="generalReportEnd" type="date" value="${esc(generalReportState.end)}" onchange="autoApplyGeneralReportFilter('end',this.value)"></div>`
}
function autoApplyGeneralReportFilter(source,value){
const v=String(value||'').trim();if(!v)return;
if(source==='day')generalReportState.day=v;
else if(source==='month')generalReportState.month=v;
else if(source==='year'){
if(!/^\d{4}$/.test(v))return toast('Tahun laporan tidak valid.','error');
const y=Math.max(2000,Math.min(2100,Number(v)));generalReportState.year=String(y)
}else if(source==='start'){
generalReportState.start=v;
if(generalReportState.end<v)generalReportState.end=v
}else if(source==='end'){
generalReportState.end=v;
if(generalReportState.start>v)generalReportState.start=v
}
renderGeneralReportPage()
}
function applyGeneralReportFilter(){
const k=generalReportState.kind;
if(k==='day'){const v=document.getElementById('generalReportDay')?.value;if(!v)return toast('Tanggal laporan belum dipilih.','error');generalReportState.day=v}
else if(k==='month'){const v=document.getElementById('generalReportMonth')?.value;if(!v)return toast('Bulan laporan belum dipilih.','error');generalReportState.month=v}
else if(k==='year'){const v=String(document.getElementById('generalReportYear')?.value||'').trim();if(!/^\d{4}$/.test(v))return toast('Tahun laporan tidak valid.','error');generalReportState.year=v}
else{const a=document.getElementById('generalReportStart')?.value,b=document.getElementById('generalReportEnd')?.value;if(!a||!b)return toast('Periode laporan belum lengkap.','error');if(a>b)return toast('Tanggal awal tidak boleh setelah tanggal akhir.','error');generalReportState.start=a;generalReportState.end=b}
renderGeneralReportPage()
}
function generalReportTitle(){return generalReportState.kind==='period'?'Laporan Periode':'Laporan Umum'}
function generalReportBucketInfo(date,period){
const d=new Date(date),kind=generalReportState.kind,monthNames=['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
if(kind==='day')return{key:String(d.getHours()).padStart(2,'0'),label:String(d.getHours()).padStart(2,'0')+':00',sort:d.getHours()};
if(kind==='month')return{key:dateKey(d),label:String(d.getDate()).padStart(2,'0'),sort:d.getTime()};
if(kind==='year')return{key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,label:monthNames[d.getMonth()],sort:d.getMonth()};
const days=Math.max(1,Math.ceil((period.end-period.start)/86400000)+1);
if(days<=45)return{key:dateKey(d),label:d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}),sort:d.getTime()};
return{key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,label:d.toLocaleDateString('id-ID',{month:'short',year:'2-digit'}),sort:d.getFullYear()*12+d.getMonth()}
}
function generalReportGroup(rows,period,valueFn,profitFn=null){
const map=new Map();(rows||[]).forEach(row=>{const info=generalReportBucketInfo(row.date,period),cur=map.get(info.key)||{...info,value:0,profit:0,count:0};cur.value+=Number(valueFn(row))||0;cur.profit+=profitFn?(Number(profitFn(row))||0):0;cur.count++;map.set(info.key,cur)});return[...map.values()].sort((a,b)=>a.sort-b.sort)
}
function generalReportNumber(value){return nominal(Math.max(0,Number(value)||0))}
function generalReportChartHTML(groups){
if(!groups.length)return'<div class="general-report-empty-chart">Belum ada penjualan pada periode ini.</div>';
const max=Math.max(1,...groups.map(x=>x.value)),barMax=generalReportState.kind==='period'?88:150;
return`<div class="general-report-chart" style="--report-bar-count:${groups.length}" data-dense="${groups.length>=12}">${groups.map(x=>{const h=Math.max(2,Math.round((x.value/max)*barMax));return`<div class="general-report-bar-item" title="${esc(x.label)} • ${esc(generalReportNumber(x.value))}"><span class="general-report-bar-value">${esc(generalReportNumber(x.value))}</span><i class="general-report-bar" style="height:${h}px"></i><span class="general-report-bar-label">${esc(x.label)}</span></div>`}).join('')}</div>`
}
function generalReportTableEmpty(colspan){return`<tr class="empty-row"><td colspan="${colspan}">Belum ada data pada periode ini.</td></tr>`}
function generalReportMoneyCell(value){return generalReportNumber(value)}
function generalReportCashRows(sales,purchases,expenses,saleReturns,purchaseReturns){
const rows=[
{desc:'Penjualan',sub:`${sales.length.toLocaleString('id-ID')} transaksi`,in:sum(sales,s=>Math.max(0,Number(s.total)||0)),out:0},
{desc:'Retur Pembelian',sub:`${purchaseReturns.length.toLocaleString('id-ID')} transaksi`,in:sum(purchaseReturns,p=>Math.max(0,Number(p.total)||Number(p.paid)||0)),out:0},
{desc:'Pembelian Dibayar',sub:`${purchases.length.toLocaleString('id-ID')} transaksi pembelian`,in:0,out:sum(purchases,p=>Math.max(0,Number(p.paid)||0))},
{desc:'Pengeluaran Operasional',sub:`${expenses.length.toLocaleString('id-ID')} catatan`,in:0,out:sum(expenses,e=>Math.max(0,Number(e.amount)||0))},
{desc:'Retur Penjualan',sub:`${saleReturns.length.toLocaleString('id-ID')} transaksi`,in:0,out:sum(saleReturns,s=>Math.max(0,Number(s.total)||0))}
];
return rows.filter(r=>(Number(r.in)||0)>0||(Number(r.out)||0)>0)
}
function generalReportArusTable(rows){
const totalIn=sum(rows,x=>x.in||0),totalOut=sum(rows,x=>x.out||0);
const body=rows.length?rows.map((r,i)=>`<tr><td class="center">${i+1}</td><td class="desc"><b>${esc(r.desc)}</b><small>${esc(r.sub||'Ringkasan periode')}</small></td><td class="num">${generalReportMoneyCell(r.in)}</td><td class="num">${generalReportMoneyCell(r.out)}</td></tr>`).join(''):generalReportTableEmpty(4);
return`<div class="general-report-block"><div class="general-report-block-title">ARUS KAS</div><div class="general-report-table-wrap"><table class="general-report-table general-report-cash-table"><thead><tr><th>NO</th><th>KETERANGAN</th><th>MASUK</th><th>KELUAR</th></tr></thead><tbody>${body}<tr class="total-row"><td></td><td>TOTAL</td><td class="num">${generalReportNumber(totalIn)}</td><td class="num">${generalReportNumber(totalOut)}</td></tr></tbody></table></div></div>`
}
function generalReportGroupedTable(title,groups,type='sales'){
const purchase=type==='purchase'||type==='purchase-return',isReturn=type==='sale-return';
const head=purchase?'<tr><th>PERIODE</th><th>NILAI</th></tr>':'<tr><th>PERIODE</th><th>LABA</th><th>NILAI</th></tr>';
const cols=purchase?2:3;
const body=groups.length?groups.map(g=>purchase?`<tr><td class="center">${esc(g.label)}</td><td class="num">${generalReportNumber(g.value)}</td></tr>`:`<tr><td class="center">${esc(g.label)}</td><td class="num">${isReturn&&g.profit?'-':''}${generalReportNumber(Math.abs(g.profit))}</td><td class="num">${generalReportNumber(g.value)}</td></tr>`).join(''):generalReportTableEmpty(cols);
const totalValue=sum(groups,g=>g.value||0),totalProfit=sum(groups,g=>g.profit||0);
const total=purchase?`<tr class="total-row"><td class="center">TOTAL</td><td class="num">${generalReportNumber(totalValue)}</td></tr>`:`<tr class="total-row"><td class="center">TOTAL</td><td class="num">${isReturn&&totalProfit?'-':''}${generalReportNumber(Math.abs(totalProfit))}</td><td class="num">${generalReportNumber(totalValue)}</td></tr>`;
return`<div class="general-report-block"><div class="general-report-block-title">${esc(title)}</div><div class="general-report-table-wrap"><table class="general-report-table general-report-grouped-table ${purchase?'is-two-col':'is-three-col'}"><thead>${head}</thead><tbody>${body}${total}</tbody></table></div></div>`
}
function renderGeneralReportPage(){
const body=document.getElementById('generalReportBody');if(!body)return;
const page=body.closest('.general-report-page');if(page)page.dataset.reportKind=generalReportState.kind;
const period=generalReportPeriod(),title=generalReportTitle(),titleEl=document.getElementById('generalReportTitle'),sub=document.getElementById('generalReportSubtitle'),badge=document.getElementById('generalReportPeriodBadge'),filter=document.getElementById('generalReportFilter');
if(titleEl)titleEl.textContent=title;if(sub)sub.textContent='Grafik, arus uang, penjualan, pembelian, dan retur';if(badge)badge.textContent=period.label;if(filter)filter.innerHTML=generalReportFilterHTML();
const sales=reportSales(period),purchases=reportPurchases(period),expenses=reportBetween(db.expenses,period),saleReturns=reportSales(period,{includeReturned:true,returnsOnly:true}),purchaseReturns=reportPurchases(period,{returnsOnly:true});
const salesValue=sum(sales,s=>s.total||0),salesCost=sum(sales,s=>s.cost||0),expenseValue=sum(expenses,e=>e.amount||0),purchasePaid=sum(purchases,p=>Math.max(0,Number(p.paid)||0)),saleReturnValue=sum(saleReturns,s=>s.total||0),saleReturnProfit=sum(saleReturns,s=>Math.max(0,(Number(s.total)||0)-(Number(s.cost)||0))),purchaseReturnValue=sum(purchaseReturns,p=>Math.max(0,Number(p.total)||Number(p.paid)||0));
const income=salesValue+purchaseReturnValue,outcome=expenseValue+purchasePaid+saleReturnValue,netProfit=(salesValue-salesCost)-saleReturnProfit-expenseValue;
const saleGroups=generalReportGroup(sales,period,s=>s.total||0,s=>(Number(s.total)||0)-(Number(s.cost)||0)),purchaseGroups=generalReportGroup(purchases,period,p=>p.total||0),saleReturnGroups=generalReportGroup(saleReturns,period,s=>s.total||0,s=>Math.max(0,(Number(s.total)||0)-(Number(s.cost)||0))),purchaseReturnGroups=generalReportGroup(purchaseReturns,period,p=>p.total||0),cashRows=generalReportCashRows(sales,purchases,expenses,saleReturns,purchaseReturns);
body.innerHTML=`
  <div class="general-report-block"><div class="general-report-block-title">GRAFIK PENJUALAN</div><div class="general-report-chart-body">${generalReportChartHTML(saleGroups)}</div></div>
  <div class="general-report-money-grid"><div class="general-report-money"><h4>PEMASUKAN</h4><strong>${generalReportNumber(income)}</strong></div><div class="general-report-money"><h4>PENGELUARAN</h4><strong>${generalReportNumber(outcome)}</strong></div></div>
  <div class="general-report-block general-report-profit"><div class="general-report-block-title">ESTIMASI LABA BERSIH</div><strong>${generalReportNumber(netProfit)}</strong><small>Penjualan − HPP − laba transaksi diretur − pengeluaran operasional</small></div>
  ${generalReportArusTable(cashRows)}
  ${generalReportGroupedTable('PENJUALAN',saleGroups,'sales')}
  ${generalReportGroupedTable('PEMBELIAN',purchaseGroups,'purchase')}
  ${generalReportGroupedTable('RETUR PENJUALAN',saleReturnGroups,'sale-return')}
  ${generalReportGroupedTable('RETUR PEMBELIAN',purchaseReturnGroups,'purchase-return')}
 `
}
function generalReportShareSnapshot(){
const period=generalReportPeriod();
const sales=reportSales(period),purchases=reportPurchases(period),expenses=reportBetween(db.expenses,period),saleReturns=reportSales(period,{includeReturned:true,returnsOnly:true}),purchaseReturns=reportPurchases(period,{returnsOnly:true});
const salesValue=sum(sales,s=>s.total||0),salesCost=sum(sales,s=>s.cost||0),expenseValue=sum(expenses,e=>e.amount||0),purchasePaid=sum(purchases,p=>Math.max(0,Number(p.paid)||0)),saleReturnValue=sum(saleReturns,s=>s.total||0),saleReturnProfit=sum(saleReturns,s=>Math.max(0,(Number(s.total)||0)-(Number(s.cost)||0))),purchaseReturnValue=sum(purchaseReturns,p=>Math.max(0,Number(p.total)||Number(p.paid)||0));
const income=salesValue+purchaseReturnValue,outcome=expenseValue+purchasePaid+saleReturnValue,netProfit=(salesValue-salesCost)-saleReturnProfit-expenseValue;
const saleGroups=generalReportGroup(sales,period,s=>s.total||0,s=>(Number(s.total)||0)-(Number(s.cost)||0));
const purchaseGroups=generalReportGroup(purchases,period,p=>p.total||0);
const saleReturnGroups=generalReportGroup(saleReturns,period,s=>s.total||0,s=>Math.max(0,(Number(s.total)||0)-(Number(s.cost)||0)));
const purchaseReturnGroups=generalReportGroup(purchaseReturns,period,p=>p.total||0);
const cashRows=generalReportCashRows(sales,purchases,expenses,saleReturns,purchaseReturns);
return{period,sales,purchases,expenses,saleReturns,purchaseReturns,income,outcome,netProfit,saleGroups,purchaseGroups,saleReturnGroups,purchaseReturnGroups,cashRows}
}
function generalReportShareTitle(){
return generalReportState.kind==='day'?'LAPORAN HARI':generalReportState.kind==='month'?'LAPORAN BULAN':generalReportState.kind==='year'?'LAPORAN TAHUN':'LAPORAN PERIODE'
}
function generalReportCanvasWrap(ctx,text,maxWidth){
const words=String(text??'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean),lines=[];let line='';
words.forEach(word=>{const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test});
if(line)lines.push(line);return lines.length?lines:['-']
}
function buildGeneralReportA4Canvas(){
const data=generalReportShareSnapshot(),W=1240,pad=70,contentW=W-pad*2,work=document.createElement('canvas'),ctx=work.getContext('2d');
const cashRows=data.cashRows,extraCash=0;
const groupedCount=data.saleGroups.length+data.purchaseGroups.length+data.saleReturnGroups.length+data.purchaseReturnGroups.length;
const estimated=Math.max(1754,980+cashRows.length*54+groupedCount*42+520);
work.width=W;work.height=Math.min(12000,estimated);
const red='#b51220',red2='#8f0f1b',ink='#171717',muted='#666',line='#d8d8d8',soft='#f7f7f7',white='#fff';
ctx.fillStyle=white;ctx.fillRect(0,0,work.width,work.height);ctx.textBaseline='top';
let y=pad;
const font=(size,weight=400)=>{ctx.font=`${weight} ${size}px Arial, sans-serif`};
const text=(t,x,yy,size=20,weight=400,color=ink,align='left')=>{font(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(t??''),x,yy)};
const rule=(yy,color=line)=>{ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,yy);ctx.lineTo(W-pad,yy);ctx.stroke()};
const sectionTitle=(title)=>{ctx.fillStyle=red2;ctx.fillRect(pad,y,contentW,44);text(title,W/2,y+11,17,700,white,'center');y+=44};
const money=generalReportNumber;
const safeBottom=(need)=>{if(y+need>work.height-50)return false;return true};
text(String(db.settings.store||'INPOS').toUpperCase(),pad,y,29,700,red);text(generalReportShareTitle(),W-pad,y,27,700,ink,'right');y+=38;
if(db.settings.address){text(db.settings.address,pad,y,16,400,muted);y+=23}
if(db.settings.phone){text(db.settings.phone,pad,y,16,400,muted);y+=23}
text(`Periode: ${data.period.label}`,W-pad,y-23,16,700,ink,'right');
rule(y+7,red);y+=28;
const cardGap=12,cardW=(contentW-cardGap*2)/3,cardH=88;
[['PEMASUKAN',data.income],['PENGELUARAN',data.outcome],['ESTIMASI LABA BERSIH',data.netProfit]].forEach((it,i)=>{
const x=pad+i*(cardW+cardGap);ctx.fillStyle=soft;ctx.fillRect(x,y,cardW,cardH);ctx.strokeStyle=line;ctx.strokeRect(x+.5,y+.5,cardW-1,cardH-1);
text(it[0],x+14,y+13,13,700,muted);text(money(it[1]),x+14,y+39,24,700,ink)
});y+=cardH+22;
sectionTitle('GRAFIK PENJUALAN');
const chartY=y+18,chartH=150,chartBottom=chartY+chartH,groups=data.saleGroups,max=Math.max(1,...groups.map(g=>Number(g.value)||0));
ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(pad+20,chartBottom);ctx.lineTo(W-pad-20,chartBottom);ctx.stroke();
if(!groups.length){text('Belum ada penjualan pada periode ini.',W/2,chartY+58,17,400,muted,'center')}
else{
const n=groups.length,chartAvail=contentW-40,kind=generalReportState.kind;
const targetSlot=kind==='month'?29:kind==='year'?48:kind==='day'?32:38;
const slot=Math.max(14,Math.min(targetSlot,chartAvail/Math.max(1,n)));
const span=slot*n,startX=pad+20+Math.max(0,(chartAvail-span)/2);
const targetBar=kind==='month'?14:kind==='year'?24:kind==='day'?16:19;
const barW=Math.max(6,Math.min(targetBar,slot*.62));
groups.forEach((g,i)=>{const h=Math.max(3,Math.round((Number(g.value)||0)/max*105)),cx=startX+slot*i+slot/2;ctx.fillStyle=red;ctx.fillRect(cx-barW/2,chartBottom-h,barW,h);text(money(g.value),cx,chartBottom-h-20,11,700,muted,'center');text(g.label,cx,chartBottom+7,10,400,muted,'center')})
}
y=chartBottom+42;
function drawTable(title,headers,rows,widths,opts={}){
if(!safeBottom(120))return;
sectionTitle(title);const x0=pad,tableW=contentW,headH=38;
ctx.fillStyle='#f0f0f0';ctx.fillRect(x0,y,tableW,headH);ctx.strokeStyle=line;ctx.strokeRect(x0+.5,y+.5,tableW-1,headH-1);
let xx=x0;headers.forEach((h,i)=>{const cw=tableW*widths[i];text(h,xx+(i===0?cw/2:10),y+11,12,700,ink,i===0?'center':'left');if(i<headers.length-1){ctx.beginPath();ctx.moveTo(xx+cw,y);ctx.lineTo(xx+cw,y+headH);ctx.stroke()}xx+=cw});y+=headH;
if(!rows.length){ctx.strokeStyle=line;ctx.strokeRect(x0+.5,y+.5,tableW-1,48-1);text('Belum ada data pada periode ini.',W/2,y+14,13,400,muted,'center');y+=48}
rows.forEach((r,ri)=>{
font(13,400);const descLines=opts.descIndex!=null?generalReportCanvasWrap(ctx,r[opts.descIndex],tableW*widths[opts.descIndex]-22):[''];
const rowH=Math.max(40,descLines.length*17+16);if(!safeBottom(rowH+20))return;
ctx.fillStyle=ri%2?'#fbfbfb':white;ctx.fillRect(x0,y,tableW,rowH);ctx.strokeStyle=line;ctx.strokeRect(x0+.5,y+.5,tableW-1,rowH-1);
let x=x0;r.forEach((cell,i)=>{const cw=tableW*widths[i];if(i<r.length-1){ctx.beginPath();ctx.moveTo(x+cw,y);ctx.lineTo(x+cw,y+rowH);ctx.stroke()}
if(opts.descIndex===i){descLines.forEach((ln,li)=>text(ln,x+10,y+8+li*17,12.5,li===0?700:400,li===0?ink:muted))}
else{const align=opts.numeric?.includes(i)?'right':(i===0?'center':'left');const tx=align==='right'?x+cw-10:align==='center'?x+cw/2:x+10;text(cell,tx,y+12,12.5,opts.boldLast&&ri===rows.length-1?700:400,ink,align)}x+=cw
});y+=rowH
});y+=18
}
const arusHeader='KETERANGAN';
const cashTableRows=cashRows.map((r,i)=>[String(i+1),`${r.desc}${r.sub?' — '+r.sub:''}`,money(r.in),money(r.out)]);
const inTotal=sum(data.cashRows,r=>r.in||0),outTotal=sum(data.cashRows,r=>r.out||0);cashTableRows.push(['','TOTAL',money(inTotal),money(outTotal)]);
drawTable('ARUS KAS',['NO',arusHeader,'MASUK','KELUAR'],cashTableRows,[.08,.48,.22,.22],{descIndex:1,numeric:[2,3],boldLast:true});
const groupedRows=(groups,type)=>{const purchase=type==='purchase'||type==='purchase-return',isReturn=type==='sale-return';return groups.map(g=>purchase?[g.label,money(g.value)]:[g.label,(isReturn&&g.profit?'-':'')+money(Math.abs(g.profit||0)),money(g.value)])};
const addTotal=(rows,groups,type)=>{const purchase=type==='purchase'||type==='purchase-return',isReturn=type==='sale-return',tv=sum(groups,g=>g.value||0),tp=sum(groups,g=>g.profit||0);rows.push(purchase?['TOTAL',money(tv)]:['TOTAL',(isReturn&&tp?'-':'')+money(Math.abs(tp)),money(tv)]);return rows};
let rr=addTotal(groupedRows(data.saleGroups,'sales'),data.saleGroups,'sales');drawTable('PENJUALAN',['PERIODE','LABA','NILAI'],rr,[.34,.33,.33],{numeric:[1,2],boldLast:true});
rr=addTotal(groupedRows(data.purchaseGroups,'purchase'),data.purchaseGroups,'purchase');drawTable('PEMBELIAN',['PERIODE','NILAI'],rr,[.5,.5],{numeric:[1],boldLast:true});
rr=addTotal(groupedRows(data.saleReturnGroups,'sale-return'),data.saleReturnGroups,'sale-return');drawTable('RETUR PENJUALAN',['PERIODE','LABA','NILAI'],rr,[.34,.33,.33],{numeric:[1,2],boldLast:true});
rr=addTotal(groupedRows(data.purchaseReturnGroups,'purchase-return'),data.purchaseReturnGroups,'purchase-return');drawTable('RETUR PEMBELIAN',['PERIODE','NILAI'],rr,[.5,.5],{numeric:[1],boldLast:true});
rule(y,red);y+=16;text(`Dibuat dari INPOS • ${fmtTime(new Date())}`,pad,y,11,400,muted);text('www.inpos.id',W-pad,y,11,700,muted,'right');y+=35;
const finalH=Math.max(1754,Math.min(work.height,y+pad)),canvas=document.createElement('canvas');canvas.width=W;canvas.height=finalH;const c=canvas.getContext('2d');c.fillStyle=white;c.fillRect(0,0,W,finalH);c.drawImage(work,0,0,W,finalH,0,0,W,finalH);return canvas
}
async function shareGeneralReportA4PNG(){
try{
const canvas=buildGeneralReportA4Canvas(),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat PNG laporan.','error');
const kind=generalReportState.kind==='day'?'hari':generalReportState.kind==='month'?'bulan':generalReportState.kind==='year'?'tahun':'periode',stamp=dateKey(new Date()),fileName=`laporan-${kind}-${stamp}-a4.png`;
let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(e){}
if(file&&navigator.share&&navigator.canShare?.({files:[file]})){
try{await navigator.share({title:`${generalReportShareTitle()} - ${generalReportPeriod().label}`,text:`${generalReportShareTitle()} ${db.settings.store||'INPOS'} • ${generalReportPeriod().label}`,files:[file]});return}catch(e){if(e?.name==='AbortError')return}
}
const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('A4 PNG laporan dibuat.')
}catch(err){console.error('Share laporan A4 PNG error:',err);toast('Gagal membuat Share A4 PNG.','error')}
}
const cashFlowState={kind:'month',day:todayKey(),month:todayKey().slice(0,7),year:String(new Date().getFullYear()),start:todayKey().slice(0,8)+'01',end:todayKey()};
function cashFlowEnsureData(){if(!Array.isArray(db.cashEntries))db.cashEntries=[];return db.cashEntries}
function openCashFlowReport(){go('report-cashflow')}
function setCashFlowKind(kind){cashFlowState.kind=['day','month','year','period'].includes(kind)?kind:'month';renderCashFlowReport()}
function cashFlowSetField(key,value){cashFlowState[key]=String(value||'');if(key==='start'&&cashFlowState.end&&cashFlowState.start>cashFlowState.end)cashFlowState.end=cashFlowState.start;if(key==='end'&&cashFlowState.start&&cashFlowState.end<cashFlowState.start)cashFlowState.start=cashFlowState.end;renderCashFlowReport()}
function cashFlowPeriod(){
const kind=cashFlowState.kind;
if(kind==='day'){const k=cashFlowState.day||todayKey(),start=new Date(k+'T00:00:00'),end=new Date(k+'T23:59:59.999');return{start,end,label:fmtDate(start)}}
if(kind==='month'){const k=cashFlowState.month||todayKey().slice(0,7),[y,m]=k.split('-').map(Number),start=new Date(y,m-1,1),end=new Date(y,m,0,23,59,59,999);return{start,end,label:start.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}}
if(kind==='year'){const y=Math.max(2000,Math.min(2100,Number(cashFlowState.year)||new Date().getFullYear())),start=new Date(y,0,1),end=new Date(y,11,31,23,59,59,999);return{start,end,label:String(y)}}
let a=cashFlowState.start||todayKey(),b=cashFlowState.end||a;if(a>b)[a,b]=[b,a];const start=new Date(a+'T00:00:00'),end=new Date(b+'T23:59:59.999');return{start,end,label:`${fmtDate(start)} - ${fmtDate(end)}`}
}
function cashFlowFilterHTML(){
const k=cashFlowState.kind,tabs=`<div class="cashflow-kind-tabs">${[['day','Hari'],['month','Bulan'],['year','Tahun'],['period','Periode']].map(([v,l])=>`<button type="button" class="${k===v?'active':''}" onclick="setCashFlowKind('${v}')">${l}</button>`).join('')}</div>`;
let fields='';
if(k==='day')fields=`<div class="cashflow-filter-fields"><div class="field"><label>Tanggal</label><input type="date" value="${esc(cashFlowState.day)}" onchange="cashFlowSetField('day',this.value)"></div></div>`;
else if(k==='month')fields=`<div class="cashflow-filter-fields"><div class="field"><label>Bulan</label><input type="month" value="${esc(cashFlowState.month)}" onchange="cashFlowSetField('month',this.value)"></div></div>`;
else if(k==='year')fields=`<div class="cashflow-filter-fields"><div class="field"><label>Tahun</label><select onchange="cashFlowSetField('year',this.value)">${reportYearOptions(cashFlowState.year)}</select></div></div>`;
else fields=`<div class="cashflow-filter-fields"><div class="field"><label>Tanggal Awal</label><input type="date" value="${esc(cashFlowState.start)}" onchange="cashFlowSetField('start',this.value)"></div><div class="field"><label>Tanggal Akhir</label><input type="date" value="${esc(cashFlowState.end)}" onchange="cashFlowSetField('end',this.value)"></div></div>`;
return tabs+fields
}
function cashFlowAllMovements(){
cashFlowEnsureData();const rows=[];
(db.sales||[]).forEach(s=>{const amount=Math.max(0,Number(s.total)||0),method=String(s.method||'Tunai'),accountName=salePaymentNameV264(s);if(amount>0&&method!=='Bon')rows.push({id:'sale:'+s.id,date:s.date,direction:'in',amount,source:'Penjualan',desc:String(s.id||'Transaksi'),method:accountName,system:true});if(s.returned&&amount>0&&method!=='Bon')rows.push({id:'return:'+s.id,date:s.returnedAt||s.date,direction:'out',amount,source:'Retur Penjualan',desc:String(s.id||'Retur transaksi'),method:accountName,system:true})});
(db.purchases||[]).filter(p=>!purchaseIsDraft(p)).forEach(p=>{const paid=Math.max(0,Number(p.paid)||0);if(paid>0)rows.push({id:'purchase:'+p.id,date:p.date,direction:'out',amount:paid,source:'Pembelian',desc:`${p.id}${getSupplier(p.supplierId)?.name?' • '+getSupplier(p.supplierId).name:''}`,method:'-',system:true});if(p.returned&&paid>0)rows.push({id:'purchase-return:'+p.id,date:p.returnedAt||p.date,direction:'in',amount:paid,source:'Retur Pembelian',desc:String(p.id||'Retur pembelian'),method:'-',system:true})});
(db.expenses||[]).forEach(e=>{const amount=Math.max(0,Number(e.amount)||0);if(amount>0)rows.push({id:'expense:'+e.id,date:e.date,direction:'out',amount,source:'Pengeluaran',desc:`${e.category||'Pengeluaran'}${e.note?' • '+e.note:''}`,method:String(e.method||'Tunai'),system:true})});
db.cashEntries.forEach(e=>{const amount=Math.max(0,Number(e.amount)||0);if(amount>0)rows.push({id:'manual:'+e.id,date:e.date,direction:e.direction==='out'?'out':'in',amount,source:String(e.category||'Kas Manual'),desc:String(e.note||e.category||'Pencatatan kas'),method:String(e.method||'Tunai'),system:e.source!=='manual',manualId:e.source==='manual'?String(e.id):''})});
return rows.filter(r=>{const d=new Date(r.date);return!Number.isNaN(d.getTime())}).sort((a,b)=>new Date(a.date)-new Date(b.date)||String(a.id).localeCompare(String(b.id)))
}
function cashFlowSnapshot(){
const period=cashFlowPeriod(),all=cashFlowAllMovements(),opening=all.filter(r=>new Date(r.date)<period.start).reduce((n,r)=>n+(r.direction==='in'?r.amount:-r.amount),0),periodRows=all.filter(r=>{const d=new Date(r.date);return d>=period.start&&d<=period.end});let balance=opening;const rows=periodRows.map(r=>{balance+=r.direction==='in'?r.amount:-r.amount;return{...r,balance}});const incoming=rows.reduce((n,r)=>n+(r.direction==='in'?r.amount:0),0),outgoing=rows.reduce((n,r)=>n+(r.direction==='out'?r.amount:0),0);return{period,opening,incoming,outgoing,closing:opening+incoming-outgoing,rows}
}
function cashFlowSummaryHTML(data){const card=(label,value,cls='')=>`<div class="cashflow-stat ${cls}"><div class="cashflow-stat-head">${label}</div><div class="cashflow-stat-body"><b>${nominal(value)}</b></div></div>`;return card('Masuk',data.incoming,'in')+card('Keluar',data.outgoing,'out')+card('Saldo',data.closing,'end')+`<div class="cashflow-opening-note"><span>Saldo Awal Periode</span><b>${nominal(data.opening)}</b></div>`}
function cashFlowRowHTML(r){
const d=new Date(r.date),date=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),time=d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),dateTime=`${date} ${time}`.trim(),incoming=r.direction==='in'?nominal(r.amount):'',outgoing=r.direction==='out'?nominal(r.amount):'';
return`<div class="cashflow-row"><div class="cashflow-date"><b>${date}</b><small>${dateTime}</small></div><div class="cashflow-desc"><b>${esc(r.source)}</b><small>${esc(r.desc)}${r.manualId?`<br><button class="cashflow-manual-delete" type="button" onclick="deleteCashFlowEntry('${esc(r.manualId)}')">Hapus catatan manual</button>`:''}</small></div><div class="cashflow-method">${esc(r.method||'-')}</div><div class="cashflow-amount cashflow-in ${r.direction==='in'?'in':'inactive'}">${incoming||'—'}</div><div class="cashflow-amount cashflow-out ${r.direction==='out'?'out':'inactive'}">${outgoing||'—'}</div><div class="cashflow-balance">${nominal(r.balance)}</div></div>`
}
function renderCashFlowReport(){
const page=document.getElementById('screen-report-cashflow');if(!page)return;const data=cashFlowSnapshot(),filter=document.getElementById('cashFlowFilter'),summary=document.getElementById('cashFlowSummary'),list=document.getElementById('cashFlowList'),badge=document.getElementById('cashFlowPeriodBadge'),count=document.getElementById('cashFlowCount');if(filter)filter.innerHTML=cashFlowFilterHTML();if(summary)summary.innerHTML=cashFlowSummaryHTML(data);if(badge)badge.textContent=data.period.label;if(count)count.textContent=`${data.rows.length.toLocaleString('id-ID')} transaksi`;if(list)list.innerHTML=data.rows.length?data.rows.map(cashFlowRowHTML).join(''):'<div class="cashflow-empty"><b>Belum ada arus kas</b><br>Transaksi pada periode ini belum menghasilkan pergerakan kas.</div>'
}
function cashFlowDateTimeLocal(date=new Date()){const d=date instanceof Date?date:new Date(date);const p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
function openCashFlowEntryModal(){
showModal('Tambah Arus Kas','Catat kas masuk atau kas keluar di luar transaksi otomatis.',`<div class="form-grid"><div class="field"><label>Jenis</label><select id="cashEntryDirection"><option value="in">Kas Masuk</option><option value="out">Kas Keluar</option></select></div><div class="field"><label>Metode</label><select id="cashEntryMethod"><option>Tunai</option><option>Transfer</option><option>QRIS</option><option>Lainnya</option></select></div><div class="field"><label>Kategori</label><select id="cashEntryCategory"><option>Modal Tambahan</option><option>Pendapatan Lain</option><option>Setoran</option><option>Penarikan</option><option>Biaya Lain</option><option>Lainnya</option></select></div><div class="field"><label>Tanggal & Waktu</label><input id="cashEntryDate" type="datetime-local" value="${cashFlowDateTimeLocal()}"></div><div class="field full"><label>Keterangan</label><input id="cashEntryNote" placeholder="Contoh: Tambah modal kasir"></div><div class="field full"><label>Nominal</label><input id="cashEntryAmount" class="nominal-input" type="text" inputmode="numeric" placeholder="0"></div></div>`,[{label:'Batal',close:true},{label:'Simpan',primary:true,fn:()=>{const amount=Math.max(0,parseNominal(document.getElementById('cashEntryAmount')?.value||0)),note=String(document.getElementById('cashEntryNote')?.value||'').trim(),rawDate=document.getElementById('cashEntryDate')?.value;if(amount<=0)return toast('Nominal arus kas harus lebih dari 0.','error');if(!note)return toast('Keterangan arus kas wajib diisi.','error');const date=rawDate?new Date(rawDate):new Date();if(Number.isNaN(date.getTime()))return toast('Tanggal arus kas tidak valid.','error');cashFlowEnsureData().unshift({id:uid('CASH'),date:date.toISOString(),direction:document.getElementById('cashEntryDirection')?.value==='out'?'out':'in',category:document.getElementById('cashEntryCategory')?.value||'Lainnya',note,method:document.getElementById('cashEntryMethod')?.value||'Tunai',amount,source:'manual',sourceId:''});save();closeModal();renderCashFlowReport();toast('Arus kas tersimpan.')}}])
}
function deleteCashFlowEntry(id){const row=cashFlowEnsureData().find(x=>String(x.id)===String(id)&&x.source==='manual');if(!row)return toast('Catatan kas tidak ditemukan.','error');if(!confirm('Hapus catatan arus kas manual ini?'))return;db.cashEntries=db.cashEntries.filter(x=>String(x.id)!==String(id));save();renderCashFlowReport();toast('Catatan arus kas dihapus.')}
function cashFlowCanvasWrap(ctx,text,maxWidth){const words=String(text||'').split(/\s+/).filter(Boolean),lines=[];let line='';for(const w of words){const test=line?line+' '+w:w;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=w}else line=test}if(line)lines.push(line);return lines.length?lines:['']}
function buildCashFlowA4Canvas(){
const data=cashFlowSnapshot(),rows=data.rows.slice(0,32),extra=Math.max(0,data.rows.length-rows.length),W=1240,H=1754,pad=72,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),ink='#181818',muted='#666',line='#d7d7d7',red='#9f1320';ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';const text=(t,x,y,size=20,weight=400,color=ink,align='left')=>{ctx.font=`${weight} ${size}px Arial`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(t),x,y)};let y=pad;text('LAPORAN ARUS KAS',pad,y,30,800,ink);y+=42;text(db.settings.store||'INPOS',pad,y,19,700,ink);text(data.period.label,W-pad,y,17,700,red,'right');y+=28;if(db.settings.address){text(db.settings.address,pad,y,13,400,muted);y+=21}ctx.fillStyle=red;ctx.fillRect(pad,y,W-pad*2,3);y+=23;
const cards=[['SALDO AWAL',data.opening],['KAS MASUK',data.incoming],['KAS KELUAR',data.outgoing],['SALDO AKHIR',data.closing]],cw=(W-pad*2-30)/4;cards.forEach((c,i)=>{const x=pad+i*(cw+10);ctx.strokeStyle=line;ctx.strokeRect(x,y,cw,78);text(c[0],x+12,y+12,11,700,muted);text(nominal(c[1]),x+12,y+34,19,800,i===1?'#15803d':i===2?'#b91c1c':i===3?red:ink)});y+=101;
const widths=[.14,.34,.12,.13,.13,.14],headers=['TANGGAL','KETERANGAN','METODE','MASUK','KELUAR','SALDO'],tableW=W-pad*2;let x=pad;ctx.fillStyle=red;ctx.fillRect(pad,y,tableW,34);headers.forEach((h,i)=>{const w=tableW*widths[i];text(h,i>=3?x+w-8:x+8,y+10,10,700,'#fff',i>=3?'right':'left');x+=w});y+=34;let balance=data.opening;
rows.forEach((r,ri)=>{balance+=r.direction==='in'?r.amount:-r.amount;ctx.font='400 11px Arial';const desc=cashFlowCanvasWrap(ctx,`${r.source} — ${r.desc}`,tableW*widths[1]-16).slice(0,2),rh=Math.max(38,desc.length*15+12);ctx.fillStyle=ri%2?'#fbfbfb':'#fff';ctx.fillRect(pad,y,tableW,rh);ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(pad,y+rh);ctx.lineTo(W-pad,y+rh);ctx.stroke();x=pad;const d=new Date(r.date),vals=[d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'2-digit'}),desc,r.method||'-',r.direction==='in'?nominal(r.amount):'—',r.direction==='out'?nominal(r.amount):'—',nominal(balance)];vals.forEach((v,i)=>{const w=tableW*widths[i];if(i===1)v.forEach((ln,j)=>text(ln,x+8,y+8+j*15,11,j===0?700:400,j===0?ink:muted));else text(v,i>=3?x+w-8:x+8,y+11,11,i>=3?700:400,ink,i>=3?'right':'left');x+=w});y+=rh});
if(extra){y+=10;text(`+ ${extra} transaksi lainnya tidak ditampilkan agar A4 tetap ringkas.`,pad,y,11,400,muted);y+=22}y=Math.min(H-88,y+18);ctx.fillStyle=red;ctx.fillRect(pad,y,W-pad*2,2);y+=15;text(`Dibuat dari INPOS • ${fmtTime(new Date())}`,pad,y,11,400,muted);text('www.inpos.id',W-pad,y,11,700,muted,'right');return canvas
}
async function shareCashFlowA4PNG(){try{const data=cashFlowSnapshot(),canvas=buildCashFlowA4Canvas(),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return toast('Gagal membuat PNG Arus Kas.','error');const fileName=`arus-kas-${dateKey(data.period.start)}-${dateKey(data.period.end)}-a4.png`;let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(e){}if(file&&navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:`Arus Kas - ${data.period.label}`,text:`Laporan Arus Kas ${db.settings.store||'INPOS'} • ${data.period.label}`,files:[file]});return}catch(e){if(e?.name==='AbortError')return}}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('A4 PNG Arus Kas dibuat.')}catch(err){console.error('Share Arus Kas A4 error:',err);toast('Gagal membuat Share A4 PNG.','error')}}
const financeReportState={
type:'income-expense',mode:'expense',kind:'month',day:todayKey(),month:todayKey().slice(0,7),year:String(new Date().getFullYear()),start:todayKey().slice(0,8)+'01',end:todayKey()
};
function financeReportPeriod(){
const now=new Date(),k=financeReportState.kind;
if(k==='day'){const key=financeReportState.day||todayKey();return{start:new Date(key+'T00:00:00'),end:new Date(key+'T23:59:59.999'),label:new Date(key+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}}
if(k==='month'){const m=String(financeReportState.month||todayKey().slice(0,7)).match(/^(\d{4})-(\d{2})$/),y=m?Number(m[1]):now.getFullYear(),mi=m?Number(m[2])-1:now.getMonth();return{start:new Date(y,mi,1),end:new Date(y,mi+1,0,23,59,59,999),label:new Date(y,mi,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'})}}
if(k==='year'){const y=Math.max(2000,Math.min(2100,Number(financeReportState.year)||now.getFullYear()));return{start:new Date(y,0,1),end:new Date(y,11,31,23,59,59,999),label:String(y)}}
const a=financeReportState.start||todayKey().slice(0,8)+'01',b=financeReportState.end||todayKey();let start=new Date(a+'T00:00:00'),end=new Date(b+'T23:59:59.999');if(start>end){const t=a;financeReportState.start=b;financeReportState.end=t;start=new Date(b+'T00:00:00');end=new Date(t+'T23:59:59.999')};return{start,end,label:`${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`}
}
function financeReportSetKind(kind){financeReportState.kind=['day','month','year','period'].includes(kind)?kind:'month';renderFinanceReportPage()}
function financeReportSetField(key,value){financeReportState[key]=String(value||'');if(key==='start'&&financeReportState.end&&financeReportState.start>financeReportState.end)financeReportState.end=financeReportState.start;if(key==='end'&&financeReportState.start&&financeReportState.end<financeReportState.start)financeReportState.start=financeReportState.end;renderFinanceReportPage()}
function financeReportSetMode(mode){financeReportState.mode=mode==='income'?'income':'expense';renderFinanceReportPage()}
function financeReportKindTabs(includePeriod=true){const items=includePeriod?[['day','Hari'],['month','Bulan'],['year','Tahun'],['period','Periode']]:[['day','Hari'],['month','Bulan'],['year','Tahun']];return`<div class="cashflow-kind-tabs">${items.map(([v,l])=>`<button type="button" class="${financeReportState.kind===v?'active':''}" onclick="financeReportSetKind('${v}')">${l}</button>`).join('')}</div>`}
function financeReportDateFields(){const k=financeReportState.kind;if(k==='day')return`<div class="cashflow-filter-fields"><div class="field"><label>Tanggal</label><input type="date" value="${esc(financeReportState.day)}" onchange="financeReportSetField('day',this.value)"></div></div>`;if(k==='month')return`<div class="cashflow-filter-fields"><div class="field"><label>Bulan</label><input type="month" value="${esc(financeReportState.month)}" onchange="financeReportSetField('month',this.value)"></div></div>`;if(k==='year')return`<div class="cashflow-filter-fields"><div class="field"><label>Tahun</label><select onchange="financeReportSetField('year',this.value)">${reportYearOptions(financeReportState.year)}</select></div></div>`;return`<div class="cashflow-filter-fields"><div class="field"><label>Tanggal Awal</label><input type="date" value="${esc(financeReportState.start)}" onchange="financeReportSetField('start',this.value)"></div><div class="field"><label>Tanggal Akhir</label><input type="date" value="${esc(financeReportState.end)}" onchange="financeReportSetField('end',this.value)"></div></div>`}
function financeSummaryCard(label,value,cls=''){return`<div class="cashflow-stat ${cls}"><div class="cashflow-stat-head">${esc(label)}</div><div class="cashflow-stat-body"><b>${nominal(value||0)}</b></div></div>`}
function financeRowHTML({date,title,sub='',method='-',value=0,direction='in'}){const d=new Date(date),dateText=Number.isNaN(d.getTime())?'-':d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),time=Number.isNaN(d.getTime())?'':d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});return`<div class="finance-report-row"><div class="finance-report-date"><b>${dateText}</b><small>${dateText}${time?' · '+time:''}</small></div><div class="finance-report-main"><b>${esc(title)}</b><small>${esc(sub||'-')}</small></div><div class="finance-report-method">${esc(method||'-')}</div><div class="finance-report-value ${direction==='out'?'out':'in'}">${nominal(value||0)}</div></div>`}
function financeBreakdownHTML(rows){return`<div class="finance-report-breakdown">${rows.map(([label,value])=>`<div><small>${esc(label)}</small><b>${nominal(value||0)}</b></div>`).join('')}</div>`}
function financeBalanceData(period){const sales=reportSales(period),expenses=reportBetween(db.expenses,period),purchases=reportPurchases(period),revenue=sum(sales,s=>s.total||0),expenseTotal=sum(expenses,e=>e.amount||0),purchasePaid=sum(purchases,p=>p.paid||0),outgoing=expenseTotal+purchasePaid;return{sales,expenses,purchases,revenue,expenseTotal,purchasePaid,outgoing,balance:revenue-outgoing}}
function renderFinanceReportPage(){
const page=document.getElementById('financeReportPage');if(!page)return;const title=document.getElementById('financeReportTitle'),sub=document.getElementById('financeReportSubtitle'),badge=document.getElementById('financeReportPeriodBadge'),filter=document.getElementById('financeReportFilter'),summary=document.getElementById('financeReportSummary'),list=document.getElementById('financeReportList'),listTitle=document.getElementById('financeReportListTitle'),count=document.getElementById('financeReportCount'),breakdown=document.getElementById('financeReportBreakdown'),note=document.getElementById('financeReportNote');
const type=financeReportState.type;page.dataset.financeType=type;
if(type==='total'){
const period=reportPeriod('all'),data=financeBalanceData(period),allMoves=cashFlowAllMovements(),cashIn=sum(allMoves,r=>r.direction==='in'?r.amount:0),cashOut=sum(allMoves,r=>r.direction==='out'?r.amount:0),cashSaldo=cashIn-cashOut;
title.textContent='Total Saldo';sub.textContent='Posisi saldo keseluruhan usaha';if(badge)badge.textContent='Semua Periode';filter.innerHTML='';summary.innerHTML=financeSummaryCard('Masuk',cashIn,'in')+financeSummaryCard('Keluar',cashOut,'out')+financeSummaryCard('Saldo',cashSaldo,'end');listTitle.textContent='Rincian Total Saldo';count.textContent='Ringkasan sumber saldo';list.innerHTML=[{title:'Penjualan',sub:`${data.sales.length.toLocaleString('id-ID')} transaksi`,value:data.revenue,direction:'in'},{title:'Pengeluaran Operasional',sub:`${data.expenses.length.toLocaleString('id-ID')} catatan`,value:data.expenseTotal,direction:'out'},{title:'Pembelian Dibayar',sub:`${data.purchases.length.toLocaleString('id-ID')} transaksi pembelian`,value:data.purchasePaid,direction:'out'}].map(x=>financeRowHTML({date:'',method:'Total',...x})).join('');breakdown.innerHTML=financeBreakdownHTML([['Saldo berdasarkan transaksi laporan',data.balance],['Saldo berdasarkan Arus Kas',cashSaldo]]);note.textContent='Total Saldo menampilkan posisi keseluruhan. Ringkasan utama mengikuti seluruh pergerakan Arus Kas yang tercatat pada sistem.';return
}
const period=financeReportPeriod();if(badge)badge.textContent=period.label;
if(type==='income-expense'){
const mode=financeReportState.mode,activeIncome=mode==='income',data=financeBalanceData(period);title.textContent='Pengeluaran / Pemasukan';sub.textContent=activeIncome?'Penerimaan usaha pada periode terpilih':'Biaya dan kas keluar operasional pada periode terpilih';filter.innerHTML=`<div class="finance-mode-tabs"><button type="button" class="${mode==='expense'?'active':''}" onclick="financeReportSetMode('expense')">Pengeluaran</button><button type="button" class="${mode==='income'?'active':''}" onclick="financeReportSetMode('income')">Pemasukan</button></div>${financeReportKindTabs(true)}${financeReportDateFields()}`;
if(activeIncome){const rows=data.sales.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));summary.innerHTML=financeSummaryCard('Pemasukan',data.revenue,'in')+financeSummaryCard('Transaksi',rows.length,'end')+financeSummaryCard('Rata-rata',rows.length?data.revenue/rows.length:0);listTitle.textContent='Daftar Pemasukan';count.textContent=`${rows.length.toLocaleString('id-ID')} transaksi`;list.innerHTML=rows.length?rows.map(s=>financeRowHTML({date:s.date,title:s.id||'Penjualan',sub:getCustomer(s.customerId)?.name||'Pelanggan Umum',method:salePaymentNameV264(s),value:s.total||0,direction:'in'})).join(''):'<div class="finance-report-empty">Belum ada pemasukan pada periode ini.</div>';breakdown.innerHTML='';note.textContent='Pemasukan pada laporan ini mengikuti transaksi penjualan yang valid pada periode terpilih.'}
else{const rows=data.expenses.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));summary.innerHTML=financeSummaryCard('Pengeluaran',data.expenseTotal,'out')+financeSummaryCard('Catatan',rows.length,'end')+financeSummaryCard('Rata-rata',rows.length?data.expenseTotal/rows.length:0);listTitle.textContent='Daftar Pengeluaran';count.textContent=`${rows.length.toLocaleString('id-ID')} catatan`;list.innerHTML=rows.length?rows.map(e=>financeRowHTML({date:e.date,title:e.category||'Pengeluaran',sub:e.note||'Pengeluaran operasional',method:e.method||'-',value:e.amount||0,direction:'out'})).join(''):'<div class="finance-report-empty">Belum ada pengeluaran pada periode ini.</div>';breakdown.innerHTML='';note.textContent='Pengeluaran menampilkan catatan biaya operasional pada periode terpilih.'}
return
}
const data=financeBalanceData(period);title.textContent='Saldo Hari / Bulan / Tahun';sub.textContent='Posisi saldo berdasarkan periode yang dipilih';filter.innerHTML=`${financeReportKindTabs(false)}${financeReportDateFields()}`;summary.innerHTML=financeSummaryCard('Masuk',data.revenue,'in')+financeSummaryCard('Keluar',data.outgoing,'out')+financeSummaryCard('Saldo',data.balance,'end');listTitle.textContent='Rincian Saldo';count.textContent=period.label;list.innerHTML=[financeRowHTML({date:period.end,title:'Pemasukan Penjualan',sub:`${data.sales.length.toLocaleString('id-ID')} transaksi`,method:'Masuk',value:data.revenue,direction:'in'}),financeRowHTML({date:period.end,title:'Pengeluaran Operasional',sub:`${data.expenses.length.toLocaleString('id-ID')} catatan`,method:'Keluar',value:data.expenseTotal,direction:'out'}),financeRowHTML({date:period.end,title:'Pembelian Dibayar',sub:`${data.purchases.length.toLocaleString('id-ID')} pembelian`,method:'Keluar',value:data.purchasePaid,direction:'out'})].join('');breakdown.innerHTML=financeBreakdownHTML([['Pengeluaran Operasional',data.expenseTotal],['Pembelian Dibayar',data.purchasePaid],['Total Keluar',data.outgoing]]);note.textContent='Saldo dihitung dari pemasukan penjualan dikurangi pengeluaran operasional dan pembelian yang sudah dibayar pada periode laporan.'
}
function openIncomeExpenseReport(mode='expense'){financeReportState.type='income-expense';financeReportState.mode=mode==='income'?'income':'expense';if(!['day','month','year','period'].includes(financeReportState.kind))financeReportState.kind='month';go('report-finance')}
function openBalancePeriodReport(kind='day'){financeReportState.type='balance';financeReportState.kind=['day','month','year'].includes(kind)?kind:'day';go('report-finance')}
function openTotalBalanceReport(){financeReportState.type='total';go('report-finance')}
let reportDetailPageState={key:'',title:'Laporan',periodLabel:'',body:''};
function renderReportDetailPage(){
const title=document.getElementById('reportDetailPageTitle'),sub=document.getElementById('reportDetailPageSubtitle'),badge=document.getElementById('reportDetailPagePeriod'),body=document.getElementById('reportDetailPageBody');
if(title)title.textContent=reportDetailPageState.title||'Laporan';
if(sub)sub.textContent=reportDetailPageState.periodLabel||'Rincian laporan';
if(badge)badge.textContent=reportDetailPageState.periodLabel||'Periode';
if(body){
body.innerHTML=reportDetailPageState.body||'<div class="report-detail-empty">Belum ada data laporan.</div>';
const dateFilter=body.querySelector('.report-transaction-filter');
const inlineShare=document.createElement('button');
inlineShare.type='button';inlineShare.className='report-detail-share-btn report-inline-share';
inlineShare.setAttribute('aria-label','Share A4 PNG');inlineShare.title='Share A4 PNG';
inlineShare.textContent='↗';inlineShare.onclick=()=>shareReportDetailA4PNG();
if(dateFilter){
dateFilter.classList.add('report-date-filter-share');
dateFilter.appendChild(inlineShare);
const periodTabs=body.querySelector(':scope > .segmented');
const card=document.createElement('div');
card.className='report-detail-period-card';
const reportBadge=document.createElement('span');reportBadge.className='inpos-report-title-badge';
reportBadge.textContent=inposCompactReportName(reportDetailPageState.title||'Laporan');
card.appendChild(reportBadge);
if(periodTabs){
periodTabs.before(card);
card.appendChild(periodTabs);
}else{
dateFilter.before(card);
}
card.appendChild(dateFilter);
}else{
const line=document.createElement('div');line.className='report-detail-filter-share-row';
const period=document.createElement('span');period.className='report-share-period';
period.textContent=reportDetailPageState.periodLabel||'Periode';
line.append(period,inlineShare);
const card=document.createElement('div');card.className='report-detail-period-card inpos-report-no-date';
const reportBadge=document.createElement('span');reportBadge.className='inpos-report-title-badge';
reportBadge.textContent=inposCompactReportName(reportDetailPageState.title||'Laporan');
card.append(reportBadge,line);body.prepend(card);
}
}
}
function reportPeriodTabs(items,activeKey){
return`<div class="segmented" style="margin-bottom:12px">${items.map(([key,label])=>`<button type="button" class="${key===activeKey?'active':''}" onclick="openReportMenu('${key}')">${label}</button>`).join('')}</div>`
}
const transactionReportFilterState={day:todayKey(),month:String(new Date().getMonth()+1),year:String(new Date().getFullYear())};
function isTransactionReportKey(key){return['sales-day','sales-month','purchases-day','purchases-month','sales-returns-month','purchase-returns-month'].includes(String(key||''))}
function transactionReportMonthOptions(selected){const names=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];return names.map((name,i)=>`<option value="${i+1}" ${Number(selected)===i+1?'selected':''}>${name}</option>`).join('')}
function transactionReportPeriod(key){
const kind=String(key||'').includes('-day')?'day':'month';
if(kind==='day'){
const k=/^\d{4}-\d{2}-\d{2}$/.test(transactionReportFilterState.day)?transactionReportFilterState.day:todayKey(),start=new Date(k+'T00:00:00'),end=new Date(k+'T23:59:59.999');
return{start,end,label:start.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}
}
const now=new Date(),year=Math.max(2000,Math.min(2100,Number(transactionReportFilterState.year)||now.getFullYear())),month=Math.max(1,Math.min(12,Number(transactionReportFilterState.month)||now.getMonth()+1)),start=new Date(year,month-1,1),end=new Date(year,month,0,23,59,59,999);
return{start,end,label:start.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
}
function transactionReportSetField(field,value,key){
if(field==='day')transactionReportFilterState.day=String(value||todayKey());
else if(field==='month')transactionReportFilterState.month=String(Math.max(1,Math.min(12,Number(value)||new Date().getMonth()+1)));
else if(field==='year')transactionReportFilterState.year=String(Math.max(2000,Math.min(2100,Number(value)||new Date().getFullYear())));
openReportMenu(key||reportDetailPageState.key)
}
function transactionReportFilterHTML(key){
const day=String(key||'').includes('-day');
if(day)return`<div class="report-transaction-filter day"><div class="field"><label>Tanggal</label><input type="date" value="${esc(transactionReportFilterState.day)}" onchange="transactionReportSetField('day',this.value,'${esc(key)}')"></div></div>`;
return`<div class="report-transaction-filter month"><div class="field"><label>Bulan</label><select onchange="transactionReportSetField('month',this.value,'${esc(key)}')">${transactionReportMonthOptions(transactionReportFilterState.month)}</select></div><div class="field"><label>Tahun</label><select onchange="transactionReportSetField('year',this.value,'${esc(key)}')">${reportYearOptions(transactionReportFilterState.year)}</select></div></div>`
}
const rankingReportFilterState={day:todayKey(),month:String(new Date().getMonth()+1),year:String(new Date().getFullYear())};
function isRankingReportKey(key){return/^(products|customers|suppliers|salespeople)-(day|month|year)$/.test(String(key||''))}
function rankingReportPeriod(key){
const k=String(key||''),now=new Date();
if(k.endsWith('-day')){
const day=/^\d{4}-\d{2}-\d{2}$/.test(rankingReportFilterState.day)?rankingReportFilterState.day:todayKey(),start=new Date(day+'T00:00:00'),end=new Date(day+'T23:59:59.999');
return{start,end,label:start.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}
}
const year=Math.max(2000,Math.min(2100,Number(rankingReportFilterState.year)||now.getFullYear()));
if(k.endsWith('-year'))return{start:new Date(year,0,1),end:new Date(year,11,31,23,59,59,999),label:String(year)};
const month=Math.max(1,Math.min(12,Number(rankingReportFilterState.month)||now.getMonth()+1)),start=new Date(year,month-1,1),end=new Date(year,month,0,23,59,59,999);
return{start,end,label:start.toLocaleDateString('id-ID',{month:'long',year:'numeric'})}
}
function rankingReportSetField(field,value,key){
if(field==='day')rankingReportFilterState.day=String(value||todayKey());
else if(field==='month')rankingReportFilterState.month=String(Math.max(1,Math.min(12,Number(value)||new Date().getMonth()+1)));
else if(field==='year')rankingReportFilterState.year=String(Math.max(2000,Math.min(2100,Number(value)||new Date().getFullYear())));
openReportMenu(key||reportDetailPageState.key)
}
function rankingReportFilterHTML(key){
const k=String(key||'');
if(k.endsWith('-day'))return`<div class="report-transaction-filter day"><div class="field"><label>Tanggal</label><input type="date" value="${esc(rankingReportFilterState.day)}" onchange="rankingReportSetField('day',this.value,'${esc(k)}')"></div></div>`;
if(k.endsWith('-year'))return`<div class="report-transaction-filter day"><div class="field"><label>Tahun</label><select onchange="rankingReportSetField('year',this.value,'${esc(k)}')">${reportYearOptions(rankingReportFilterState.year)}</select></div></div>`;
return`<div class="report-transaction-filter month"><div class="field"><label>Bulan</label><select onchange="rankingReportSetField('month',this.value,'${esc(k)}')">${transactionReportMonthOptions(rankingReportFilterState.month)}</select></div><div class="field"><label>Tahun</label><select onchange="rankingReportSetField('year',this.value,'${esc(k)}')">${reportYearOptions(rankingReportFilterState.year)}</select></div></div>`
}
function reportPeriod(kind='month',override=null){
const normalize=(start,end,label)=>{const a=new Date(start),b=new Date(end);return{start:Number.isNaN(a.getTime())?new Date(0):a,end:Number.isNaN(b.getTime())?new Date(8640000000000000):b,label:String(label||'Periode')}};
if(override&&typeof override==='object'&&override.start&&override.end)return normalize(override.start,override.end,override.label||'Periode');
const now=new Date(),k=String(kind||'month').toLowerCase();
if(k==='all')return normalize(new Date(0),new Date(8640000000000000),'Semua Periode');
if(k==='day'){const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999);return normalize(start,end,start.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}))}
if(k==='year'){const start=new Date(now.getFullYear(),0,1),end=new Date(now.getFullYear(),11,31,23,59,59,999);return normalize(start,end,String(now.getFullYear()))}
const start=new Date(now.getFullYear(),now.getMonth(),1),end=new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59,999);return normalize(start,end,start.toLocaleDateString('id-ID',{month:'long',year:'numeric'}))
}
const pointsReportFiltersV483={
ranking:{mode:'week',week:todayKey(),month:todayKey().slice(0,7),year:String(new Date().getFullYear())},
redemptions:{mode:'week',week:todayKey(),month:todayKey().slice(0,7),year:String(new Date().getFullYear())}
};
function pointsReportFilterV483(key){
return pointsReportFiltersV483[key==='points-redemptions'?'redemptions':'ranking'];
}
function pointsReportPeriodV483(key){
const f=pointsReportFilterV483(key);
if(f.mode==='year'){
const y=Math.max(2000,Math.min(2100,Number(f.year)||new Date().getFullYear()));
return{start:new Date(y,0,1,0,0,0,0),end:new Date(y,11,31,23,59,59,999),label:String(y)};
}
if(f.mode==='month'){
const match=/^(\d{4})-(\d{2})$/.exec(f.month||'');
const y=match?Number(match[1]):new Date().getFullYear(),m=match?Math.min(12,Math.max(1,Number(match[2]))):new Date().getMonth()+1;
const start=new Date(y,m-1,1,0,0,0,0),end=new Date(y,m,0,23,59,59,999);
return{start,end,label:start.toLocaleDateString('id-ID',{month:'long',year:'numeric'})};
}
const safe=/^\d{4}-\d{2}-\d{2}$/.test(f.week)?f.week:todayKey();
const anchor=new Date(safe+'T12:00:00'),date=Number.isFinite(anchor.getTime())?anchor:new Date();
const start=new Date(date.getFullYear(),date.getMonth(),date.getDate(),0,0,0,0);
start.setDate(start.getDate()-((start.getDay()+6)%7));
const end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6,23,59,59,999);
return{start,end,label:`${start.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})} – ${end.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}`};
}
function pointsReportChangeV483(key,field,value){
const f=pointsReportFilterV483(key);
if(field==='mode')f.mode=['week','month','year'].includes(value)?value:'week';
if(field==='week'&&/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))f.week=value;
if(field==='month'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(String(value||'')))f.month=value;
if(field==='year'&&/^\d{4}$/.test(String(value||''))&&Number(value)>=2000&&Number(value)<=2100)f.year=value;
openReportMenu(key);
}
function pointsReportFilterHTMLV483(key){
const f=pointsReportFilterV483(key),k=key==='points-redemptions'?'points-redemptions':'points-ranking';
const tabs=`<div class="segmented points-report-tabs-v483" role="group" aria-label="Periode laporan poin" style="margin-bottom:12px"><button type="button" class="${f.mode==='week'?'active':''}" aria-pressed="${f.mode==='week'}" onclick="pointsReportChangeV483('${k}','mode','week')">Mingguan</button><button type="button" class="${f.mode==='month'?'active':''}" aria-pressed="${f.mode==='month'}" onclick="pointsReportChangeV483('${k}','mode','month')">Bulanan</button><button type="button" class="${f.mode==='year'?'active':''}" aria-pressed="${f.mode==='year'}" onclick="pointsReportChangeV483('${k}','mode','year')">Tahunan</button></div>`;
return tabs+(f.mode==='week'
?`<div class="report-transaction-filter day points-period-filter-v483"><div class="field"><label>Tanggal Minggu</label><input type="date" aria-label="Pilih minggu laporan" value="${esc(f.week)}" onchange="pointsReportChangeV483('${k}','week',this.value)"></div></div>`
:f.mode==='month'
?`<div class="report-transaction-filter day points-period-filter-v483"><div class="field"><label>Bulan</label><input type="month" aria-label="Pilih bulan laporan" value="${esc(f.month)}" onchange="pointsReportChangeV483('${k}','month',this.value)"></div></div>`
:`<div class="report-transaction-filter day points-period-filter-v483"><div class="field"><label>Tahun</label><input type="number" inputmode="numeric" min="2000" max="2100" step="1" aria-label="Pilih tahun laporan" value="${esc(f.year)}" onchange="pointsReportChangeV483('${k}','year',this.value)"></div></div>`);
}
function pointsCurrentBalanceRankingV492(){
return(Array.isArray(db.customers)?db.customers:[]).map(c=>({
customerId:c.id,
name:String(c.name||'Pelanggan'),
phone:String(c.phone||''),
points:Math.max(0,Math.floor(Number(c.points)||0)),
transactions:null
})).filter(x=>x.points>0).sort((a,b)=>b.points-a.points||a.name.localeCompare(b.name,'id'));
}
function pointsRankingExplanationV492(data){
if(data.source==='balance')return'Tidak ada catatan perolehan poin transaksi pada periode yang dipilih. Menampilkan saldo poin pelanggan SAAT INI sebagai informasi; saldo tidak mengikuti filter Mingguan, Bulanan, atau Tahunan. Poin transaksi lama tanpa catatan perolehan tidak dihitung ulang.';
if(data.source==='transactions')return'Peringkat berdasarkan poin yang tercatat saat penjualan dalam periode terpilih, setelah dikurangi poin retur. Ini bukan saldo poin pelanggan saat ini.';
return'Belum ada perolehan poin yang tercatat pada periode ini, dan belum ada saldo poin pelanggan. Pilih periode lain atau lakukan transaksi dengan pelanggan terdaftar dan Fitur Poin aktif.';
}
function pointsReportDataV483(key){
const period=pointsReportPeriodV483(key);
if(key==='points-ranking'){
const map=new Map();
reportSales(period).forEach(s=>{
if(s.customerId==null||s.customerId===''||s.pointsEarned==null)return;
const earned=Math.max(0,Math.floor(Number(s.pointsEarned)||0));
const returned=Math.min(earned,Math.max(0,Math.floor(Number(s.returnedPoints)||0)));
const net=earned-returned;if(!net)return;
const id=String(s.customerId),cur=map.get(id)||{customerId:s.customerId,points:0,transactions:0};
cur.points+=net;cur.transactions+=1;map.set(id,cur);
});
const earnedItems=[...map.values()].map(x=>{
const c=(db.customers||[]).find(y=>String(y.id)===String(x.customerId));
return{...x,name:c?.name||'Pelanggan',phone:c?.phone||''};
}).sort((a,b)=>b.points-a.points||String(a.name).localeCompare(String(b.name),'id'));
const source=earnedItems.length?'transactions':'balance';
const currentBalance=earnedItems.length?[]:pointsCurrentBalanceRankingV492();
const items=earnedItems.length?earnedItems:currentBalance;
return{period,items,total:sum(items,x=>x.points),highest:items[0]?.points||0,
source:items.length?source:'empty'};
}
const items=reportBetween(db.pointRedemptions,period).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
return{period,items,total:sum(items,x=>Math.max(0,Number(x.points)||0)),customers:new Set(items.map(x=>x.customerId==null?'':String(x.customerId).trim()).filter(Boolean)).size};
}
function openReportMenu(key,override=null){
const parts=String(key||'').split('-'),periodKind=parts.includes('day')?'day':parts.includes('year')?'year':parts.includes('total')?'all':'month',period=isTransactionReportKey(key)?transactionReportPeriod(key):isRankingReportKey(key)?rankingReportPeriod(key):reportPeriod(periodKind,override);
let title='Laporan',body='',note='',periodLabel=period.label;
const sales=reportSales(period),purchases=reportPurchases(period),expenses=reportBetween(db.expenses,period),revenue=sum(sales,s=>s.total||0),cost=sum(sales,s=>s.cost||0),expenseTotal=sum(expenses,e=>e.amount||0),purchaseTotal=sum(purchases,p=>p.total||0),purchasePaid=sum(purchases,p=>p.paid||0),gross=revenue-cost,net=gross-expenseTotal,cashBalance=revenue-expenseTotal-purchasePaid;
if(key.startsWith('general-')){
title=key==='general-day'?'Laporan Harian':key==='general-month'?'Laporan Bulanan':key==='general-year'?'Laporan Tahunan':'Laporan Periode';
body=`<div class="report-detail-summary">${reportMoneyStat('Pemasukan',revenue)}${reportMoneyStat('Pembelian',purchaseTotal)}${reportMoneyStat('Pengeluaran',expenseTotal)}${reportMoneyStat('Laba Bersih',net)}</div>${reportList([`<div class="report-detail-row"><div class="report-detail-main"><b>Penjualan</b><small>${sales.length} transaksi</small></div><div class="report-detail-value">${rupiah(revenue)}</div></div>`,`<div class="report-detail-row"><div class="report-detail-main"><b>Pembelian</b><small>${purchases.length} transaksi</small></div><div class="report-detail-value">${rupiah(purchaseTotal)}</div></div>`,`<div class="report-detail-row"><div class="report-detail-main"><b>Pengeluaran</b><small>${expenses.length} catatan</small></div><div class="report-detail-value">${rupiah(expenseTotal)}</div></div>`])}`
}else if(key==='cashflow-month'){
title='Arus Uang';body=`<div class="report-detail-summary">${reportMoneyStat('Uang Masuk',revenue)}${reportMoneyStat('Uang Keluar',expenseTotal+purchasePaid)}${reportMoneyStat('Pembelian Dibayar',purchasePaid)}${reportMoneyStat('Arus Bersih',cashBalance)}</div>`
}else if(key==='expenses-month'){
title='Pengeluaran';body=`<div class="report-detail-summary">${reportMoneyStat('Total Pengeluaran',expenseTotal)}${reportCountStat('Catatan',expenses.length)}</div>${reportList(expenses.map(e=>`<div class="report-detail-row"><div class="report-detail-main"><b>${esc(e.category||'Pengeluaran')}</b><small>${fmtTime(e.date)}${e.note?' • '+esc(e.note):''}</small></div><div class="report-detail-value">${rupiah(e.amount)}</div></div>`))}`
}else if(key==='income-month'){
title='Pemasukan';body=`<div class="report-detail-summary">${reportMoneyStat('Total Pemasukan',revenue)}${reportCountStat('Transaksi',sales.length)}</div>${reportList(reportTransactionRows(sales,'sale').split(/(?=<div class="report-detail-row">)/).filter(Boolean))}`
}else if(key.startsWith('balance-')){
title=key==='balance-day'?'Saldo Harian':key==='balance-month'?'Saldo Bulanan':key==='balance-year'?'Saldo Tahunan':'Total Saldo';body=`<div class="report-detail-summary">${reportMoneyStat('Pemasukan',revenue)}${reportMoneyStat('Pengeluaran',expenseTotal)}${reportMoneyStat('Pembelian Dibayar',purchasePaid)}${reportMoneyStat('Saldo',cashBalance)}</div><div class="report-detail-note">Saldo dihitung dari pemasukan penjualan dikurangi pengeluaran operasional dan pembelian yang sudah dibayar pada periode laporan.</div>`
}else if(key==='sales-day'||key==='sales-month'){
title='Penjualan Harian / Bulanan';body=reportPeriodTabs([['sales-day','Harian'],['sales-month','Bulanan']],key)+transactionReportFilterHTML(key)+`<div class="report-detail-summary">${reportMoneyStat('Total Penjualan',revenue)}${reportCountStat('Transaksi',sales.length)}</div>${reportList(reportTransactionRows(sales,'sale').split(/(?=<div class="report-detail-row">)/).filter(Boolean))}`
}else if(key==='purchases-day'||key==='purchases-month'){
title='Pembelian Harian / Bulanan';body=reportPeriodTabs([['purchases-day','Harian'],['purchases-month','Bulanan']],key)+transactionReportFilterHTML(key)+`<div class="report-detail-summary">${reportMoneyStat('Total Pembelian',purchaseTotal)}${reportCountStat('Transaksi',purchases.length)}</div>${reportList(reportTransactionRows(purchases,'purchase').split(/(?=<div class="report-detail-row">)/).filter(Boolean))}`
}else if(key==='sales-returns-month'){
title='Retur Penjualan Bulanan';const rows=reportSales(period,{includeReturned:true,returnsOnly:true}),total=sum(rows,s=>s.total||0);body=transactionReportFilterHTML(key)+`<div class="report-detail-summary">${reportMoneyStat('Nilai Retur',total)}${reportCountStat('Transaksi Retur',rows.length)}</div>${reportList(reportTransactionRows(rows,'sale').split(/(?=<div class="report-detail-row">)/).filter(Boolean))}`
}else if(key==='purchase-returns-month'){
title='Retur Pembelian Bulanan';const rows=reportPurchases(period,{returnsOnly:true}),total=sum(rows,p=>p.total||0);body=transactionReportFilterHTML(key)+`<div class="report-detail-summary">${reportMoneyStat('Nilai Retur',total)}${reportCountStat('Retur Pembelian',rows.length)}</div>${rows.length?reportList(reportTransactionRows(rows,'purchase').split(/(?=<div class="report-detail-row">)/).filter(Boolean)):'<div class="report-detail-note">Belum ada data retur pembelian yang tercatat pada sistem.</div>'}`
}else if(key.startsWith('products-')){
title='Produk Harian / Bulanan / Tahunan';const map=new Map();sales.forEach(s=>s.items.filter(x=>!x.wholesaleBonus).forEach(x=>{const cur=map.get(x.productId)||{qty:0,total:0};cur.qty+=Number(x.qty)||0;cur.total+=Number(x.price||0)*(Number(x.qty)||0);map.set(x.productId,cur)}));const items=[...map.entries()].map(([id,v])=>({name:getProduct(id)?.name||'Produk',value:v.qty,sub:`Penjualan ${rupiah(v.total)}`})).sort((a,b)=>b.value-a.value);body=reportPeriodTabs([['products-day','Harian'],['products-month','Bulanan'],['products-year','Tahunan']],key)+rankingReportFilterHTML(key)+reportRankingRows(items,'item')
}else if(key.startsWith('customers-')){
title='Customer Bulanan / Tahunan';const map=new Map();sales.filter(s=>s.customerId).forEach(s=>{const cur=map.get(s.customerId)||{count:0,total:0};cur.count++;cur.total+=s.total||0;map.set(s.customerId,cur)});const items=[...map.entries()].map(([id,v])=>({name:getCustomer(id)?.name||'Customer',value:rupiah(v.total),sub:`${v.count} transaksi`})).sort((a,b)=>parseNominal(b.value)-parseNominal(a.value));body=reportPeriodTabs([['customers-month','Bulanan'],['customers-year','Tahunan']],key)+rankingReportFilterHTML(key)+reportRankingRows(items)
}else if(key.startsWith('suppliers-')){
title='Supplier Bulanan / Tahunan';const map=new Map();purchases.forEach(p=>{const cur=map.get(p.supplierId)||{count:0,total:0};cur.count++;cur.total+=p.total||0;map.set(p.supplierId,cur)});const items=[...map.entries()].map(([id,v])=>({name:getSupplier(id)?.name||'Supplier',raw:v.total,value:rupiah(v.total),sub:`${v.count} pembelian`})).sort((a,b)=>b.raw-a.raw);body=reportPeriodTabs([['suppliers-month','Bulanan'],['suppliers-year','Tahunan']],key)+rankingReportFilterHTML(key)+reportRankingRows(items)
}else if(key==='points-ranking'){
title='Peringkat Poin';const d=pointsReportDataV483(key);
periodLabel=d.source==='balance'?'Saldo poin saat ini':d.period.label;
const balanceMode=d.source==='balance';
body=pointsReportFilterHTMLV483(key)+
`<div class="report-detail-summary">${reportCountStat(balanceMode?'Saldo Poin Aktif':'Poin Diperoleh',d.total)}${reportCountStat(balanceMode?'Saldo Tertinggi':'Poin Tertinggi',d.highest)}</div>`+
(balanceMode?'<div class="inpos-v492-point-balance-label">Peringkat Saldo Poin Saat Ini</div>':'')+
(d.items.length?reportRankingRows(d.items.map(x=>({name:x.name,value:x.points,sub:balanceMode?`Saldo aktif${x.phone?' • '+x.phone:''}`:`${x.transactions} transaksi${x.phone?' • '+x.phone:''}`})),'poin'):'<div class="report-detail-note">Belum ada data poin yang dapat ditampilkan.</div>')+
`<div class="report-detail-note inpos-v492-points-note">${esc(pointsRankingExplanationV492(d))}</div>`;
}else if(key==='points-redemptions'){
title='Riwayat Tukar Hadiah';const d=pointsReportDataV483(key);periodLabel=d.period.label;
body=pointsReportFilterHTMLV483(key)+`<div class="report-detail-summary points-redemption-summary">${reportCountStat('Penukaran',d.items.length)}${reportCountStat('Poin Terpakai',d.total)}${reportCountStat('Pelanggan',d.customers)}</div>`+
(d.items.length?reportList(d.items.map(h=>`<div class="report-detail-row"><div class="report-detail-main"><b>${esc(getCustomer(h.customerId)?.name||'Pelanggan')} • ${esc(h.rewardName||'Hadiah')}</b><small>${fmtTime(h.date)} • Kasir ${esc(h.cashier||'-')}</small></div><div class="report-detail-value">−${Math.max(0,Number(h.points)||0).toLocaleString('id-ID')} poin</div></div>`)):'<div class="report-detail-note">Belum ada penukaran hadiah pada periode yang dipilih.</div>');
}else if(key.startsWith('salespeople-')){
title='Sales Bulanan / Tahunan';const map=new Map();sales.filter(s=>String(s.cashier||'').trim()).forEach(s=>{const name=String(s.cashier).trim(),cur=map.get(name)||{count:0,total:0};cur.count++;cur.total+=s.total||0;map.set(name,cur)});const items=[...map.entries()].map(([name,v])=>({name,raw:v.total,value:rupiah(v.total),sub:`${v.count} transaksi`})).sort((a,b)=>b.raw-a.raw);body=reportPeriodTabs([['salespeople-month','Bulanan'],['salespeople-year','Tahunan']],key)+rankingReportFilterHTML(key)+(items.length?reportRankingRows(items):'<div class="report-detail-note">Data Sales/Kasir per transaksi belum tersedia pada transaksi lama. Transaksi baru mulai mencatat nama kasir untuk laporan ini.</div>')
}else return toast('Jenis laporan tidak ditemukan.','error');
reportDetailPageState={key,title,periodLabel,body};
if(document.getElementById('screen-report-detail')?.classList.contains('active'))renderReportDetailPage();else go('report-detail')
}
function renderFinanceReport(){renderFinanceReportPage()}
function shareA4CanvasFile(canvas,fileName,shareTitle,shareText,okMessage,errorPrefix='Gagal membuat Share A4 PNG.'){
return new Promise(async(resolve)=>{try{const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob){toast(errorPrefix,'error');return resolve(false)}let file=null;try{file=new File([blob],fileName,{type:'image/png'})}catch(e){}if(file&&navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:shareTitle,text:shareText,files:[file]});return resolve(true)}catch(e){if(e?.name==='AbortError')return resolve(false)}}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);if(okMessage)toast(okMessage);resolve(true)}catch(err){console.error('Share A4 PNG error:',err);toast(errorPrefix,'error');resolve(false)}})
}
function reportA4Wrap(ctx,text,maxWidth){const words=String(text??'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines.length?lines:['-']}
function buildSimpleReportA4Canvas(snapshot={}){
const summary=Array.isArray(snapshot.summary)?snapshot.summary:[],rows=Array.isArray(snapshot.rows)?snapshot.rows:[],breakdown=Array.isArray(snapshot.breakdown)?snapshot.breakdown:[];
const rowLimit=Math.min(rows.length,26),usedRows=rows.slice(0,rowLimit),extra=Math.max(0,rows.length-rowLimit),W=1240,pad=70,base=520,rowH=56,breakH=breakdown.length?130:0,H=Math.max(1754,base+usedRows.length*rowH+breakH+summary.length*6);
const canvas=document.createElement('canvas');canvas.width=W;canvas.height=Math.min(12000,H);const ctx=canvas.getContext('2d');
const ink='#181818',muted='#666',line='#dadada',red='#a3121f',redSoft='#fff3f4',soft='#f7f7f7',white='#fff',green='#15803d',danger='#b91c1c';
ctx.fillStyle=white;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline='top';
const font=(size,weight=400)=>ctx.font=`${weight} ${size}px Arial, sans-serif`;
const text=(t,x,y,size=18,weight=400,color=ink,align='left')=>{font(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(t??''),x,y)};
const rule=(y,color=line,w=1)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(W-pad,y);ctx.stroke()};
let y=pad,contentW=W-pad*2;
text(String(db.settings.store||'INPOS').toUpperCase(),pad,y,30,800,red);text(String(snapshot.title||'LAPORAN').toUpperCase(),W-pad,y,27,800,ink,'right');y+=38;
if(snapshot.subtitle){text(snapshot.subtitle,pad,y,16,400,muted);y+=23}
if(snapshot.periodLabel){text(`Periode: ${snapshot.periodLabel}`,W-pad,y-(snapshot.subtitle?23:0),16,700,ink,'right')}
if(db.settings.address){text(db.settings.address,pad,y,14,400,muted);y+=21}
if(db.settings.phone){text(db.settings.phone,pad,y,14,400,muted);y+=21}
rule(y+4,red,2);y+=24;
if(summary.length){
const cols=Math.min(summary.length,3),gap=12,cardW=(contentW-gap*(cols-1))/cols,cardH=82;summary.slice(0,3).forEach((item,i)=>{const x=pad+i*(cardW+gap);ctx.fillStyle=soft;ctx.fillRect(x,y,cardW,cardH);ctx.strokeStyle=line;ctx.strokeRect(x,y,cardW,cardH);ctx.fillStyle=item.tone==='danger'?'#fff5f5':item.tone==='success'?'#f0fdf4':item.tone==='primary'?redSoft:soft;ctx.fillRect(x+1,y+1,cardW-2,33);text(item.label||'-',x+cardW/2,y+9,12,800,item.tone==='danger'?danger:item.tone==='success'?green:red,'center');text(item.value||'0',x+cardW/2,y+41,24,800,ink,'center')});y+=96;
}
text(snapshot.sectionTitle||'RINCIAN LAPORAN',pad,y,16,800,red);y+=24;ctx.fillStyle=red;ctx.fillRect(pad,y,contentW,34);text('KETERANGAN',pad+10,y+10,10,800,white);text('NILAI',W-pad-10,y+10,10,800,white,'right');y+=34;
usedRows.forEach((row,i)=>{ctx.fillStyle=i%2?'#fbfbfb':'#fff';ctx.fillRect(pad,y,contentW,52);ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(pad,y+52);ctx.lineTo(W-pad,y+52);ctx.stroke();const leftW=contentW-220;const titleLines=reportA4Wrap(ctx,row.title||'-',leftW-12).slice(0,2);const subLines=row.sub?reportA4Wrap(ctx,row.sub,leftW-12).slice(0,2):[];let yy=y+8;titleLines.forEach((ln,idx)=>text(ln,pad+10,yy+idx*15,13,idx===0?800:700,ink));yy+=titleLines.length*15;subLines.forEach((ln,idx)=>text(ln,pad+10,yy+idx*14,11,400,muted));const valColor=row.tone==='danger'?danger:row.tone==='success'?green:ink;text(row.value||'-',W-pad-10,y+15,14,800,valColor,'right');y+=52});
if(extra){y+=10;text(`+ ${extra} data lainnya tidak ditampilkan agar A4 tetap rapi.`,pad,y,11,400,muted);y+=22}
if(breakdown.length){y+=4;text('RINGKASAN TAMBAHAN',pad,y,15,800,red);y+=22;const cols=Math.min(2,breakdown.length),gap=12,bw=(contentW-gap*(cols-1))/cols;breakdown.forEach((item,i)=>{const col=i%cols,row=Math.floor(i/cols);const x=pad+col*(bw+gap),yy=y+row*68;ctx.fillStyle=soft;ctx.fillRect(x,yy,bw,56);ctx.strokeStyle=line;ctx.strokeRect(x,yy,bw,56);text(item.label||'-',x+10,yy+9,11,700,muted);text(item.value||'0',x+bw-10,yy+28,15,800,ink,'right')});y+=Math.ceil(breakdown.length/cols)*68}
if(snapshot.note){y+=6;ctx.fillStyle='#fafafa';ctx.fillRect(pad,y,contentW,58);ctx.strokeStyle=line;ctx.strokeRect(pad,y,contentW,58);const noteLines=reportA4Wrap(ctx,snapshot.note,contentW-24).slice(0,3);noteLines.forEach((ln,i)=>text(ln,pad+12,y+10+i*14,11,400,muted));y+=68}
y=Math.min(canvas.height-80,y+8);rule(y,red,2);y+=14;text(`Dibuat dari INPOS • ${new Date().toLocaleString('id-ID')}`,pad,y,11,400,muted);text('www.inpos.id',W-pad,y,11,700,muted,'right');
return canvas
}
function financeReportShareSnapshot(){
const type=financeReportState.type;
if(type==='total'){
const period={label:'Semua Periode'},data=financeBalanceData(reportPeriod('all')),allMoves=cashFlowAllMovements(),cashIn=sum(allMoves,r=>r.direction==='in'?r.amount:0),cashOut=sum(allMoves,r=>r.direction==='out'?r.amount:0),cashSaldo=cashIn-cashOut;
return{title:'Total Saldo',subtitle:'Posisi saldo keseluruhan usaha',periodLabel:period.label,summary:[{label:'Masuk',value:nominal(cashIn),tone:'success'},{label:'Keluar',value:nominal(cashOut),tone:'danger'},{label:'Saldo',value:nominal(cashSaldo),tone:'primary'}],sectionTitle:'Rincian Total Saldo',rows:[{title:'Penjualan',sub:`${data.sales.length.toLocaleString('id-ID')} transaksi`,value:nominal(data.revenue),tone:'success'},{title:'Pengeluaran Operasional',sub:`${data.expenses.length.toLocaleString('id-ID')} catatan`,value:nominal(data.expenseTotal),tone:'danger'},{title:'Pembelian Dibayar',sub:`${data.purchases.length.toLocaleString('id-ID')} transaksi pembelian`,value:nominal(data.purchasePaid),tone:'danger'}],breakdown:[{label:'Saldo berdasarkan transaksi laporan',value:nominal(data.balance)},{label:'Saldo berdasarkan Arus Kas',value:nominal(cashSaldo)}],note:'Total Saldo menampilkan posisi keseluruhan usaha berdasarkan seluruh pergerakan kas yang tercatat pada sistem.'}
}
const period=financeReportPeriod();
if(type==='income-expense'){
const mode=financeReportState.mode,activeIncome=mode==='income',data=financeBalanceData(period);
if(activeIncome){const rows=data.sales.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s=>({title:s.id||'Penjualan',sub:`${fmtTime(s.date)} • ${getCustomer(s.customerId)?.name||'Pelanggan Umum'} • ${salePaymentNameV264(s)}`,value:nominal(s.total||0),tone:'success'}));return{title:'Pengeluaran / Pemasukan',subtitle:'Daftar pemasukan usaha',periodLabel:period.label,summary:[{label:'Pemasukan',value:nominal(data.revenue),tone:'success'},{label:'Transaksi',value:Number(rows.length).toLocaleString('id-ID')},{label:'Rata-rata',value:nominal(rows.length?data.revenue/rows.length:0)}],sectionTitle:'Daftar Pemasukan',rows,note:'Pemasukan mengikuti transaksi penjualan yang valid pada periode terpilih.'}}
const rows=data.expenses.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=>({title:e.category||'Pengeluaran',sub:`${fmtTime(e.date)} • ${e.note||'Pengeluaran operasional'} • ${e.method||'-'}`,value:nominal(e.amount||0),tone:'danger'}));return{title:'Pengeluaran / Pemasukan',subtitle:'Daftar pengeluaran usaha',periodLabel:period.label,summary:[{label:'Pengeluaran',value:nominal(data.expenseTotal),tone:'danger'},{label:'Catatan',value:Number(rows.length).toLocaleString('id-ID')},{label:'Rata-rata',value:nominal(rows.length?data.expenseTotal/rows.length:0)}],sectionTitle:'Daftar Pengeluaran',rows,note:'Pengeluaran menampilkan catatan biaya operasional pada periode terpilih.'}
}
const data=financeBalanceData(period);return{title:'Saldo Hari / Bulan / Tahun',subtitle:'Posisi saldo berdasarkan periode',periodLabel:period.label,summary:[{label:'Masuk',value:nominal(data.revenue),tone:'success'},{label:'Keluar',value:nominal(data.outgoing),tone:'danger'},{label:'Saldo',value:nominal(data.balance),tone:'primary'}],sectionTitle:'Rincian Saldo',rows:[{title:'Pemasukan Penjualan',sub:`${data.sales.length.toLocaleString('id-ID')} transaksi`,value:nominal(data.revenue),tone:'success'},{title:'Pengeluaran Operasional',sub:`${data.expenses.length.toLocaleString('id-ID')} catatan`,value:nominal(data.expenseTotal),tone:'danger'},{title:'Pembelian Dibayar',sub:`${data.purchases.length.toLocaleString('id-ID')} pembelian`,value:nominal(data.purchasePaid),tone:'danger'}],breakdown:[{label:'Pengeluaran Operasional',value:nominal(data.expenseTotal)},{label:'Pembelian Dibayar',value:nominal(data.purchasePaid)},{label:'Total Keluar',value:nominal(data.outgoing)}],note:'Saldo dihitung dari pemasukan penjualan dikurangi pengeluaran operasional dan pembelian yang sudah dibayar pada periode laporan.'}
}
async function shareFinanceReportA4PNG(){try{const snap=financeReportShareSnapshot(),canvas=buildSimpleReportA4Canvas(snap),periodTag=(snap.periodLabel||'laporan').toLowerCase().replace(/[^a-z0-9]+/gi,'-');await shareA4CanvasFile(canvas,`laporan-keuangan-${periodTag}-a4.png`,`${snap.title} - ${snap.periodLabel}`,`${snap.title} ${db.settings.store||'INPOS'} • ${snap.periodLabel}`,'A4 PNG laporan keuangan dibuat.','Gagal membuat PNG laporan keuangan.')}catch(err){console.error('shareFinanceReportA4PNG',err);toast('Gagal membuat Share A4 PNG.','error')}}
function reportDetailShareSnapshot(){
const key=String(reportDetailPageState.key||'');if(!key)return{title:'Laporan',subtitle:'Rincian laporan',periodLabel:reportDetailPageState.periodLabel||'',summary:[],rows:[]};
const period=isTransactionReportKey(key)?transactionReportPeriod(key):isRankingReportKey(key)?rankingReportPeriod(key):reportPeriod('month');
const sales=reportSales(period),purchases=reportPurchases(period),expenses=reportBetween(db.expenses,period),revenue=sum(sales,s=>s.total||0),purchaseTotal=sum(purchases,p=>p.total||0);
if(key==='sales-day'||key==='sales-month'){const rows=sales.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s=>({title:s.id||'Penjualan',sub:`${fmtTime(s.date)} • ${getCustomer(s.customerId)?.name||'Pelanggan Umum'} • ${salePaymentNameV264(s)}`,value:rupiah(s.total||0),tone:'success'}));return{title:'Penjualan Harian / Bulanan',subtitle:'Daftar transaksi penjualan',periodLabel:period.label,summary:[{label:'Total Penjualan',value:rupiah(revenue),tone:'success'},{label:'Transaksi',value:Number(sales.length).toLocaleString('id-ID')}],sectionTitle:'Daftar Penjualan',rows,note:'Laporan penjualan mengikuti filter periode yang dipilih.'}}
if(key==='purchases-day'||key==='purchases-month'){const rows=purchases.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(p=>({title:p.id||'Pembelian',sub:`${fmtTime(p.date)} • ${getSupplier(p.supplierId)?.name||'-'} • ${(Number(p.items)||0).toLocaleString('id-ID')} item`,value:rupiah(p.total||0),tone:'danger'}));return{title:'Pembelian Harian / Bulanan',subtitle:'Daftar transaksi pembelian',periodLabel:period.label,summary:[{label:'Total Pembelian',value:rupiah(purchaseTotal),tone:'danger'},{label:'Transaksi',value:Number(purchases.length).toLocaleString('id-ID')}],sectionTitle:'Daftar Pembelian',rows,note:'Laporan pembelian mengikuti filter periode yang dipilih.'}}
if(key==='sales-returns-month'){const rows=reportSales(period,{includeReturned:true,returnsOnly:true}),total=sum(rows,s=>s.total||0),list=rows.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s=>({title:s.id||'Retur Penjualan',sub:`${fmtTime(s.date)} • ${getCustomer(s.customerId)?.name||'Pelanggan Umum'}`,value:rupiah(s.total||0),tone:'danger'}));return{title:'Retur Penjualan Bulanan',subtitle:'Daftar transaksi retur penjualan',periodLabel:period.label,summary:[{label:'Nilai Retur',value:rupiah(total),tone:'danger'},{label:'Transaksi Retur',value:Number(rows.length).toLocaleString('id-ID')}],sectionTitle:'Daftar Retur Penjualan',rows:list,note:'Menampilkan seluruh transaksi retur penjualan pada periode terpilih.'}}
if(key==='purchase-returns-month'){const rows=reportPurchases(period,{returnsOnly:true}),total=sum(rows,p=>p.total||0),list=rows.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(p=>({title:p.id||'Retur Pembelian',sub:`${fmtTime(p.date)} • ${getSupplier(p.supplierId)?.name||'-'}`,value:rupiah(p.total||0),tone:'danger'}));return{title:'Retur Pembelian Bulanan',subtitle:'Daftar transaksi retur pembelian',periodLabel:period.label,summary:[{label:'Nilai Retur',value:rupiah(total),tone:'danger'},{label:'Retur Pembelian',value:Number(rows.length).toLocaleString('id-ID')}],sectionTitle:'Daftar Retur Pembelian',rows:list,note:'Menampilkan seluruh transaksi retur pembelian pada periode terpilih.'}}
if(key.startsWith('products-')){const map=new Map();sales.forEach(s=>s.items.filter(x=>!x.wholesaleBonus).forEach(x=>{const cur=map.get(x.productId)||{qty:0,total:0};cur.qty+=Number(x.qty)||0;cur.total+=Number(x.price||0)*(Number(x.qty)||0);map.set(x.productId,cur)}));const items=[...map.entries()].map(([id,v])=>({name:getProduct(id)?.name||'Produk',qty:v.qty,total:v.total})).sort((a,b)=>b.qty-a.qty);return{title:'Produk Harian / Bulanan / Tahunan',subtitle:'Peringkat produk berdasarkan penjualan',periodLabel:period.label,summary:[{label:'Produk Terjual',value:Number(sum(items,x=>x.qty)).toLocaleString('id-ID')},{label:'Jumlah Produk',value:Number(items.length).toLocaleString('id-ID')},{label:'Nilai Penjualan',value:rupiah(sum(items,x=>x.total)),tone:'success'}],sectionTitle:'Peringkat Produk',rows:items.map((x,i)=>({title:`${i+1}. ${x.name}`,sub:`Penjualan ${rupiah(x.total)}`,value:`${Number(x.qty).toLocaleString('id-ID')} item`})),note:'Urutan berdasarkan jumlah produk terjual pada periode terpilih.'}}
if(key.startsWith('customers-')){const map=new Map();sales.filter(s=>s.customerId).forEach(s=>{const cur=map.get(s.customerId)||{count:0,total:0};cur.count++;cur.total+=s.total||0;map.set(s.customerId,cur)});const items=[...map.entries()].map(([id,v])=>({name:getCustomer(id)?.name||'Customer',count:v.count,total:v.total})).sort((a,b)=>b.total-a.total);return{title:'Customer Bulanan / Tahunan',subtitle:'Peringkat pelanggan berdasarkan transaksi',periodLabel:period.label,summary:[{label:'Jumlah Customer',value:Number(items.length).toLocaleString('id-ID')},{label:'Total Transaksi',value:Number(sum(items,x=>x.count)).toLocaleString('id-ID')},{label:'Nilai Transaksi',value:rupiah(sum(items,x=>x.total)),tone:'success'}],sectionTitle:'Peringkat Customer',rows:items.map((x,i)=>({title:`${i+1}. ${x.name}`,sub:`${x.count} transaksi`,value:rupiah(x.total)})),note:'Urutan berdasarkan nilai transaksi pelanggan pada periode terpilih.'}}
if(key.startsWith('suppliers-')){const map=new Map();purchases.forEach(p=>{const cur=map.get(p.supplierId)||{count:0,total:0};cur.count++;cur.total+=p.total||0;map.set(p.supplierId,cur)});const items=[...map.entries()].map(([id,v])=>({name:getSupplier(id)?.name||'Supplier',count:v.count,total:v.total})).sort((a,b)=>b.total-a.total);return{title:'Supplier Bulanan / Tahunan',subtitle:'Peringkat supplier berdasarkan pembelian',periodLabel:period.label,summary:[{label:'Jumlah Supplier',value:Number(items.length).toLocaleString('id-ID')},{label:'Total Pembelian',value:Number(sum(items,x=>x.count)).toLocaleString('id-ID')},{label:'Nilai Pembelian',value:rupiah(sum(items,x=>x.total)),tone:'danger'}],sectionTitle:'Peringkat Supplier',rows:items.map((x,i)=>({title:`${i+1}. ${x.name}`,sub:`${x.count} pembelian`,value:rupiah(x.total),tone:'danger'})),note:'Urutan berdasarkan nilai pembelian supplier pada periode terpilih.'}}
if(key==='points-ranking'){
const d=pointsReportDataV483(key),balanceMode=d.source==='balance';
return{title:'Peringkat Poin',subtitle:balanceMode?'Peringkat saldo poin pelanggan saat ini':'Poin diperoleh dari transaksi penjualan',periodLabel:balanceMode?'Saldo poin saat ini':d.period.label,
summary:[{label:balanceMode?'Saldo Poin Aktif':'Poin Diperoleh',value:Number(d.total).toLocaleString('id-ID')},{label:balanceMode?'Saldo Tertinggi':'Poin Tertinggi',value:Number(d.highest).toLocaleString('id-ID')}],
sectionTitle:balanceMode?'Peringkat Saldo Poin Saat Ini':'Peringkat Poin Pelanggan',
rows:d.items.map((x,i)=>({title:`${i+1}. ${x.name}`,sub:balanceMode?`Saldo aktif${x.phone?' • '+x.phone:''}`:`${x.transactions} transaksi${x.phone?' • '+x.phone:''}`,value:`${Number(x.points).toLocaleString('id-ID')} poin`})),
note:pointsRankingExplanationV492(d)};
}
if(key==='points-redemptions'){
const d=pointsReportDataV483(key);
return{title:'Riwayat Tukar Hadiah',subtitle:'Penukaran hadiah menggunakan poin pelanggan',periodLabel:d.period.label,summary:[{label:'Penukaran',value:Number(d.items.length).toLocaleString('id-ID')},{label:'Poin Terpakai',value:Number(d.total).toLocaleString('id-ID')},{label:'Pelanggan',value:Number(d.customers).toLocaleString('id-ID')}],sectionTitle:'Riwayat Penukaran',rows:d.items.map(h=>({title:`${getCustomer(h.customerId)?.name||'Pelanggan'} • ${h.rewardName||'Hadiah'}`,sub:`${fmtTime(h.date)} • Kasir ${h.cashier||'-'}`,value:`−${Math.max(0,Number(h.points)||0).toLocaleString('id-ID')} poin`,tone:'danger'})),note:'Hanya menampilkan penukaran hadiah pada periode terpilih.'};
}
if(key.startsWith('salespeople-')){const map=new Map();sales.filter(s=>String(s.cashier||'').trim()).forEach(s=>{const name=String(s.cashier).trim(),cur=map.get(name)||{count:0,total:0};cur.count++;cur.total+=s.total||0;map.set(name,cur)});const items=[...map.entries()].map(([name,v])=>({name,count:v.count,total:v.total})).sort((a,b)=>b.total-a.total);return{title:'Sales Bulanan / Tahunan',subtitle:'Peringkat sales / kasir',periodLabel:period.label,summary:[{label:'Jumlah Sales',value:Number(items.length).toLocaleString('id-ID')},{label:'Total Transaksi',value:Number(sum(items,x=>x.count)).toLocaleString('id-ID')},{label:'Nilai Penjualan',value:rupiah(sum(items,x=>x.total)),tone:'success'}],sectionTitle:'Peringkat Sales / Kasir',rows:items.map((x,i)=>({title:`${i+1}. ${x.name}`,sub:`${x.count} transaksi`,value:rupiah(x.total)})),note:items.length?'Urutan berdasarkan nilai penjualan kasir/sales pada periode terpilih.':'Data Sales/Kasir pada transaksi lama belum tersedia sepenuhnya.'}}
return{title:reportDetailPageState.title||'Laporan',subtitle:'Rincian laporan',periodLabel:reportDetailPageState.periodLabel||'',summary:[],rows:[],note:'Belum ada data laporan pada menu ini.'}
}
async function shareReportDetailA4PNG(){try{const snap=reportDetailShareSnapshot(),canvas=buildSimpleReportA4Canvas(snap),slug=(reportDetailPageState.key||'laporan').replace(/[^a-z0-9]+/gi,'-');await shareA4CanvasFile(canvas,`${slug}-a4.png`,`${snap.title} - ${snap.periodLabel}`,`${snap.title} ${db.settings.store||'INPOS'} • ${snap.periodLabel}`,'A4 PNG laporan dibuat.','Gagal membuat PNG laporan.')}catch(err){console.error('shareReportDetailA4PNG',err);toast('Gagal membuat Share A4 PNG.','error')}}
function renderReports(){if(document.getElementById('screen-report-general')?.classList.contains('active'))renderGeneralReportPage();if(document.getElementById('screen-report-cashflow')?.classList.contains('active'))renderCashFlowReport();if(document.getElementById('screen-report-finance')?.classList.contains('active'))renderFinanceReportPage();if(document.getElementById('screen-report-detail')?.classList.contains('active'))renderReportDetailPage()}
function receiptFieldConfig(){
if(!db.settings.receiptFields||typeof db.settings.receiptFields!=='object')db.settings.receiptFields=structuredClone(seed.settings.receiptFields);
const defaults=seed.settings.receiptFields;
Object.keys(defaults).forEach(k=>db.settings.receiptFields[k]=db.settings.receiptFields[k]!==false);
return db.settings.receiptFields
}
function receiptFieldEnabled(key){return receiptFieldConfig()[key]!==false}
function toggleReceiptField(key){
const cfg=receiptFieldConfig();if(!(key in cfg))return;
cfg[key]=!cfg[key];save();renderPrinterPage()
}
function receiptFieldDefinitions(){
return[
['storeName','Nama Toko'],['storeAddress','Alamat Toko'],['storePhone','Nomor Telepon'],
['transactionNumber','Nomor Transaksi'],['dateTime','Tanggal & Waktu'],['cashier','Kasir'],
['orderService','Jenis Pesanan & Antrian'],['itemNote','Catatan Item'],['transactionNote','Catatan Transaksi'],
['shipping','Data Pengiriman'],['payment','Pembayaran & Kembalian'],['footer','Footer Struk']
]
}
function receiptTextColumns(){return String(db.settings.receiptWidth)==='80'?48:32}
function receiptTwoColV50(left,right,cols){
let a=String(left||''),b=String(right||'');cols=Math.max(20,Number(cols)||32);
if(!b)return a.slice(0,cols);
if(a.length+b.length+1>cols)a=a.slice(0,Math.max(1,cols-b.length-1));
return a+' '.repeat(Math.max(1,cols-a.length-b.length))+b
}
function receiptTextDivider(){return'-'.repeat(receiptTextColumns())}
function escposWidthCommandString(){
const dots=String(db.settings.receiptWidth)==='80'?560:384;
return'\x1d\x4c\x00\x00'+'\x1d\x57'+String.fromCharCode(dots&255,(dots>>8)&255)
}
let thermalPrintPageStyle=null;
function prepareThermalPrintPage(width){
const w=String(width)==='80'?'80':'58';
let style=document.getElementById('thermalPrintPageStyle');
if(!style){style=document.createElement('style');style.id='thermalPrintPageStyle';document.head.appendChild(style)}
style.textContent=`@media print{@page{size:${w}mm auto;margin:0}html,body{width:${w}mm!important;max-width:${w}mm!important}.printable.receipt-${w}{width:${w}mm!important;max-width:${w}mm!important}}`;
thermalPrintPageStyle=style
}
function clearThermalPrintPageStyle(){
const style=document.getElementById('thermalPrintPageStyle');if(style)style.remove();thermalPrintPageStyle=null
}
window.addEventListener('afterprint',clearThermalPrintPageStyle);
function toggleCashDrawerSetting(){
db.settings.cashDrawerEnabled=!db.settings.cashDrawerEnabled;save();renderPrinterPage();
toast(db.settings.cashDrawerEnabled?'Cash drawer otomatis diaktifkan untuk pembayaran Tunai.':'Cash drawer otomatis dinonaktifkan.')
}
function cashDrawerPulseString(){return'\x1b\x70\x00\x19\x64'}
function cashDrawerPulseBytes(){return new Uint8Array([0x1b,0x70,0x00,0x19,0x64])}
async function sendDrawerUSB(){
if(!usbDevice)throw new Error('Printer USB belum terhubung');
if(!usbDevice.opened)await usbDevice.open();
if(!usbDevice.configuration)await usbDevice.selectConfiguration(1);
const iface=usbDevice.configuration.interfaces.find(i=>i.alternates.some(a=>a.endpoints.some(e=>e.direction==='out')));if(!iface)throw new Error('Endpoint USB OUT tidak ditemukan');
try{await usbDevice.claimInterface(iface.interfaceNumber)}catch(e){}
const alt=iface.alternates.find(a=>a.endpoints.some(e=>e.direction==='out')),ep=alt.endpoints.find(e=>e.direction==='out').endpointNumber;
await usbDevice.transferOut(ep,cashDrawerPulseBytes())
}
async function sendDrawerBLE(){
if(!bleCharacteristic)throw new Error('Printer Bluetooth belum terhubung');
const bytes=cashDrawerPulseBytes();
if(bleCharacteristic.writeValueWithoutResponse)await bleCharacteristic.writeValueWithoutResponse(bytes);else await bleCharacteristic.writeValue(bytes)
}
async function sendDrawerWiFi(){
const p=db.settings.printer||{},ip=String(p.ip||'').trim(),port=Math.round(Number(p.port)||9100),bridge=getWiFiPrinterBridge();
if(!bridge)throw new Error('Bridge printer jaringan tidak tersedia');
for(const method of['openCashDrawer','openDrawer','kickDrawer']){
if(typeof bridge[method]==='function'){
let r;
try{r=await Promise.resolve(bridge[method](ip,port))}catch(e){r=await Promise.resolve(bridge[method]())}
if(r===false||String(r).toLowerCase()==='false')throw new Error('Perintah drawer ditolak');
return
}
}
const pulse=cashDrawerPulseString();
if(typeof bridge.sendTcp==='function')await Promise.resolve(bridge.sendTcp(ip,port,pulse));
else if(typeof bridge.printTcp==='function')await Promise.resolve(bridge.printTcp(ip,port,pulse));
else if(typeof bridge.printNetwork==='function')await Promise.resolve(bridge.printNetwork(ip,port,pulse));
else throw new Error('Metode TCP drawer tidak tersedia')
}
async function openCashDrawer(showResult=true){
const p=db.settings.printer||{},type=p.type||'system',bridge=getWiFiPrinterBridge();
try{
if(['usb','ble','wifi'].includes(type)){const ready=await ensurePrinterReadyForOutput(type);if(!ready)throw new Error('Printer belum dapat tersambung otomatis')}
if(type==='usb'){await sendDrawerUSB()}
else if(type==='ble'){await sendDrawerBLE()}
else if(type==='wifi'){await sendDrawerWiFi()}
else if(bridge&&['openCashDrawer','openDrawer','kickDrawer'].some(k=>typeof bridge[k]==='function')){
const method=['openCashDrawer','openDrawer','kickDrawer'].find(k=>typeof bridge[k]==='function');
const r=await Promise.resolve(bridge[method]());
if(r===false||String(r).toLowerCase()==='false')throw new Error('Perintah drawer ditolak')
}else throw new Error('Print Sistem browser tidak dapat mengirim pulsa cash drawer langsung. Pilih USB, Bluetooth, WiFi/LAN, atau gunakan aplikasi native INPOS.');
if(showResult)toast('Cash drawer berhasil diberi perintah buka.')
}catch(e){
if(showResult)toast(e?.message||'Cash drawer gagal dibuka.','error');
else console.warn('Cash drawer:',e)
}
}
function testCashDrawer(){openCashDrawer(true)}
function renderPrinterPage(){
const el=document.getElementById('printerSettingBody');if(!el)return;
const p=db.settings.printer||{type:'system',name:'Printer Sistem',connected:false,ip:'192.168.1.100',port:9100};
const wifiIp=esc(p.ip||'192.168.1.100'),wifiPort=Math.min(65535,Math.max(1,Number(p.port)||9100)),fields=receiptFieldConfig(),footerOn=fields.footer!==false;
const wifiStatus=p.type==='wifi'?(p.connected?'Terhubung':(p.ip?'Terkonfigurasi':'Belum dikonfigurasi')):'Belum dipilih';
const activeLabel=p.type==='system'?'Print Sistem':p.type==='usb'?'USB Thermal':p.type==='ble'?'Bluetooth / BLE':p.type==='wifi'?'WiFi / LAN':'Printer';
const connState=p.type==='system'?'Online':p.connected?'Terhubung':p.type==='wifi'&&p.ip?'Terkonfigurasi':'Belum terhubung';
const fieldRows=receiptFieldDefinitions().map(([key,label])=>`<div class="receipt-content-item"><span>${label}</span><button class="switch ${fields[key]!==false?'on':''}" type="button" aria-pressed="${fields[key]!==false}" onclick="toggleReceiptField('${key}')"></button></div>`).join('');
el.innerHTML=`<div class="printer-setting-card">
   <div class="printer-overview">
     <div class="printer-overview-main">
       <div class="printer-overview-icon">🖨</div>
       <div class="printer-overview-copy"><small>PRINTER AKTIF</small><b>${esc(p.name||activeLabel)}</b></div>
     </div>
     <div class="printer-overview-meta"><span class="pill green">${activeLabel}</span><span class="pill">${connState}</span><span class="pill">${esc(db.settings.receiptWidth||'58')} mm</span></div>
   </div>
   <h3>Koneksi Printer</h3>
   <p>Pilih koneksi printer.</p><div class="printer-auto-note">Setelah printer pernah dipasangkan, INPOS mencoba menyambung ulang otomatis saat Cetak/Test Print, termasuk ketika aplikasi berjalan offline. Dialog pairing hanya diperlukan pertama kali atau jika izin perangkat Bluetooth berubah.</div>
   <div class="printer-grid">
     <div class="printer-card ${p.type==='system'?'selected':''}">
       <div class="picon">🖨</div><h4>Print Sistem</h4>
       <p>Cetak melalui dialog perangkat.</p>
       <div class="printer-status ${p.type==='system'?'connected':''}"><i></i>${p.type==='system'?'Online • Siap digunakan':'Tersedia'}</div>
       <button class="btn btn-sm w100 ${p.type==='system'?'btn-primary':''}" onclick="setPrinter('system','Printer Sistem',true)">${p.type==='system'?'Dipilih':'Pilih'}</button>
     </div>
     <div class="printer-card ${p.type==='usb'?'selected':''}">
       <div class="picon">🔌</div><h4>USB Thermal</h4>
       <p>Printer thermal melalui USB.</p>
       <div class="printer-status ${p.type==='usb'&&(p.connected||p.remembered)?'connected':''}"><i></i>${p.type==='usb'&&p.connected?'Terhubung':p.type==='usb'&&p.remembered?'Tersimpan • Auto reconnect':'Belum terhubung'}</div>
       <button class="btn btn-sm w100 ${p.type==='usb'&&(p.connected||p.remembered)?'btn-primary':''}" onclick="connectUSB()">${p.type==='usb'&&p.remembered?'Pasangkan Ulang':'Hubungkan'}</button>
     </div>
     <div class="printer-card ${p.type==='ble'?'selected':''}">
       <div class="picon">ᛒ</div><h4>Bluetooth / BLE</h4>
       <p>Printer thermal Bluetooth BLE.</p>
       <div class="printer-status ${p.type==='ble'&&(p.connected||p.remembered)?'connected':''}"><i></i>${p.type==='ble'&&p.connected?'Terhubung':p.type==='ble'&&p.remembered?'Tersimpan • Sambung otomatis':'Belum terhubung'}</div>
       <button class="btn btn-sm w100 ${p.type==='ble'&&(p.connected||p.remembered)?'btn-primary':''}" onclick="connectBLESmart()">${p.type==='ble'&&p.connected?'Terhubung':p.type==='ble'&&p.remembered?'Sambungkan Otomatis':'Hubungkan'}</button>
     </div>
     <div class="printer-card ${p.type==='wifi'?'selected':''}">
       <div class="picon">📶</div><h4>WiFi / LAN</h4>
       <p>Printer jaringan melalui IP/LAN.</p>
       <div class="printer-status ${p.type==='wifi'&&p.connected?'connected':''}"><i></i>${wifiStatus}</div>
       <button class="btn btn-sm w100 ${p.type==='wifi'?'btn-primary':''}" onclick="selectWiFiPrinter()">${p.type==='wifi'?'Atur':'Pilih'}</button>
     </div>
   </div>
   ${p.type==='wifi'?`<div class="wifi-printer-config">
     <div class="wifi-printer-config-head"><div><b>Konfigurasi WiFi / LAN</b><small>Pastikan printer dan INPOS satu jaringan.</small></div><span class="pill ${p.connected?'green':''}">${p.connected?'ONLINE':'TCP/IP'}</span></div>
     <div class="wifi-printer-fields">
       <div class="field"><label>IP Address</label><input id="wifiPrinterIp" inputmode="decimal" autocomplete="off" placeholder="192.168.1.100" value="${wifiIp}"></div>
       <div class="field"><label>Port</label><input id="wifiPrinterPort" type="number" min="1" max="65535" inputmode="numeric" value="${wifiPort}"></div>
       <button class="btn btn-primary" type="button" onclick="saveWiFiPrinter()">Simpan & Hubungkan</button>
     </div>
   </div>`:''}
 </div>
 <div class="printer-setting-card">
   <h3>Pengaturan Struk</h3>
   <p>Atur kertas dan isi struk.</p>
   <div class="form-grid">
     <div class="field"><label>Lebar Kertas</label><select id="receiptWidth" onchange="db.settings.receiptWidth=this.value;save();renderPrinterPage()"><option value="58" ${db.settings.receiptWidth==='58'?'selected':''}>58 mm</option><option value="80" ${db.settings.receiptWidth==='80'?'selected':''}>80 mm</option></select></div>
     <div class="field"><label>Printer Aktif</label><input disabled value="${esc(p.name||'Printer Sistem')}"></div>
   </div>
   <div class="switch-row"><div><b>Cetak otomatis setelah bayar</b><small>Cetak struk setelah pembayaran.</small></div><button class="switch ${db.settings.autoPrint?'on':''}" onclick="db.settings.autoPrint=!db.settings.autoPrint;save();renderPrinterPage()"></button></div>
   <div class="switch-row drawer-setting-row"><div><b>Buka Cash Drawer Otomatis</b><small>Buka laci setelah pembayaran tunai.</small></div><div class="drawer-setting-actions"><button class="btn btn-sm drawer-test-btn" type="button" onclick="testCashDrawer()">Test Cash Drawer</button><button class="switch ${db.settings.cashDrawerEnabled?'on':''}" type="button" aria-pressed="${!!db.settings.cashDrawerEnabled}" onclick="toggleCashDrawerSetting()"></button></div></div>
   <div class="receipt-content-box">
    <div class="receipt-content-head"><div><b>Tampilkan di Struk</b><small>Pilih informasi tambahan pada struk.</small></div><span class="pill">${db.settings.receiptWidth} mm</span></div>
    <div class="receipt-content-grid">${fieldRows}</div>
    ${footerOn?`<div class="receipt-footer-setting"><div class="field"><label>Teks Footer Struk</label><input id="printerFooterText" maxlength="160" value="${esc(db.settings.footer||'Terima kasih telah berbelanja')}" placeholder="Terima kasih sudah berbelanja" oninput="db.settings.footer=this.value;save()"><small>Dicetak saat Footer Struk aktif.</small></div></div>`:''}
    <div class="receipt-content-note">Untuk printer 80 mm, INPOS menggunakan area ESC/POS lebih lebar dan layout teks 48 kolom. Print Sistem juga meminta halaman 80 mm pada dialog cetak.</div>
   </div>
   <div class="printer-page-actions"><button class="btn" onclick="testPrint()">🧾 Test Print</button><button class="btn" onclick="testCashDrawer()">▣ Test Drawer</button><button class="btn btn-primary" onclick="openReceiptPreviewFinalV56()">👁 Preview Struk</button></div>
 </div>`;
}
function openPrinter(){go('printer');setTimeout(()=>{autoReconnectRememberedPrinter(true)},80)}
function setPrinter(type,name,connected){db.settings.printer={...(db.settings.printer||{}),type,name,connected,remembered:type==='system'?false:!!db.settings.printer?.remembered};save();toast(name+' dipilih.');openPrinter()}
const PRINTER_BLE_SERVICES=['000018f0-0000-1000-8000-00805f9b34fb','0000ff00-0000-1000-8000-00805f9b34fb'];
function savePrinterRuntimeState(connected,extra={}){
const p=db.settings.printer||{};
db.settings.printer={...p,...extra,connected:!!connected};
if(extra.remembered!==undefined)db.settings.printer.remembered=!!extra.remembered;
if(connected)db.settings.printer.lastConnectedAt=new Date().toISOString();
save();
if(document.getElementById('screen-printer')?.classList.contains('active'))renderPrinterPage()
}
function printerUSBMatches(device,p=db.settings.printer||{}){
if(!device)return false;
if(p.usbSerial&&device.serialNumber)return String(p.usbSerial)===String(device.serialNumber);
if(p.usbVendorId!=null&&p.usbProductId!=null)return Number(p.usbVendorId)===Number(device.vendorId)&&Number(p.usbProductId)===Number(device.productId);
return p.name&&device.productName?String(p.name)===String(device.productName):false
}
async function prepareUSBPrinter(device){
if(!device)throw new Error('Perangkat USB tidak ditemukan');
if(!device.opened)await device.open();
if(!device.configuration)await device.selectConfiguration(1);
usbDevice=device;
savePrinterRuntimeState(true,{type:'usb',name:device.productName||'USB Thermal',remembered:true,usbVendorId:device.vendorId,usbProductId:device.productId,usbSerial:device.serialNumber||''});
return true
}
async function reconnectUSBPrinter(){
if(!navigator.usb)return false;
try{if(usbDevice)return await prepareUSBPrinter(usbDevice)}catch(e){usbDevice=null}
if(typeof navigator.usb.getDevices!=='function')return false;
try{
const devices=await navigator.usb.getDevices(),p=db.settings.printer||{};
const device=devices.find(d=>printerUSBMatches(d,p))||(devices.length===1?devices[0]:null);
if(!device)return false;
return await prepareUSBPrinter(device)
}catch(e){console.warn('Auto reconnect USB:',e);return false}
}
function bindBLEDisconnect(device){
if(!device)return;
device.ongattserverdisconnected=()=>{if(bleDevice===device){
bleCharacteristic=null;
savePrinterRuntimeState(false,{remembered:true});
clearTimeout(bleAutoReconnectTimer);
bleAutoReconnectTimer=setTimeout(()=>{autoReconnectRememberedPrinter(true)},900);
}}
}
async function prepareBLEPrinter(device){
if(!device?.gatt)throw new Error('Perangkat BLE tidak tersedia');
bleDevice=device;bindBLEDisconnect(device);
const server=device.gatt.connected?device.gatt:await device.gatt.connect();
let characteristic=null;
for(const uuid of PRINTER_BLE_SERVICES){
try{
const service=await server.getPrimaryService(uuid),chars=await service.getCharacteristics();
characteristic=chars.find(c=>c.properties.write||c.properties.writeWithoutResponse)||null;
if(characteristic)break
}catch(e){}
}
if(!characteristic)throw new Error('Karakteristik tulis printer BLE tidak ditemukan');
bleCharacteristic=characteristic;
savePrinterRuntimeState(true,{type:'ble',name:device.name||'BLE Thermal',remembered:true,bleId:device.id||'',bleName:device.name||''});
return true
}
async function reconnectBLEPrinter(){
if(!navigator.bluetooth)return false;
if(bleReconnectPromise)return bleReconnectPromise;
bleReconnectPromise=(async()=>{
try{
if(bleDevice?.gatt){
try{if(await prepareBLEPrinter(bleDevice))return true}catch(e){bleCharacteristic=null}
}
if(typeof navigator.bluetooth.getDevices!=='function')return false;
const devices=await navigator.bluetooth.getDevices(),p=db.settings.printer||{};
const preferred=devices.filter(d=>(p.bleId&&d.id===p.bleId)||(p.bleName&&d.name===p.bleName));
const others=devices.filter(d=>!preferred.includes(d));
for(const device of[...preferred,...others]){
try{if(await prepareBLEPrinter(device))return true}catch(e){console.warn('BLE device reconnect skipped:',device?.name||device?.id,e)}
}
return false
}catch(e){console.warn('Auto reconnect BLE:',e);return false}
finally{bleReconnectPromise=null}
})();
return bleReconnectPromise
}
async function autoReconnectRememberedPrinter(silent=true){
const p=db.settings.printer||{};
if(p.type!=='ble'||!p.remembered)return false;
if(p.connected&&bleDevice?.gatt?.connected&&bleCharacteristic)return true;
const ok=await reconnectBLEPrinter();
if(ok){
if(!silent&&typeof toast==='function')toast('Printer BLE tersambung kembali.');
return true
}
if(!silent&&typeof toast==='function')toast('Printer tersimpan tetapi belum dapat tersambung otomatis. Gunakan Pasangkan Ulang hanya jika izin Bluetooth berubah.','error');
return false
}
async function connectBLESmart(){
const p=db.settings.printer||{};
if(p.type==='ble'&&p.remembered){
const ok=await autoReconnectRememberedPrinter(false);
if(ok){openPrinter();return}
}
return connectBLE()
}
async function ensurePrinterReadyForOutput(type=db.settings.printer?.type||'system'){
if(type==='system')return true;
if(type==='usb')return reconnectUSBPrinter();
if(type==='ble')return reconnectBLEPrinter();
if(type==='wifi'){
const p=db.settings.printer||{},bridge=getWiFiPrinterBridge(),ip=String(p.ip||'').trim(),port=Math.round(Number(p.port)||9100);
if(!bridge||!validPrinterHost(ip)||port<1||port>65535)return false;
try{
if(typeof bridge.connectTcp==='function'){const r=await Promise.resolve(bridge.connectTcp(ip,port));if(r===false||String(r).toLowerCase()==='false')return false}
savePrinterRuntimeState(true,{remembered:true});return true
}catch(e){return false}
}
return false
}
async function connectUSB(){
if(!navigator.usb)return toast('WebUSB tidak tersedia di browser ini. Gunakan Chrome/Chromium atau Print Sistem.','error');
try{const device=await navigator.usb.requestDevice({filters:[]});await prepareUSBPrinter(device);toast('USB printer terhubung. Auto reconnect saat cetak aktif.');openPrinter()}catch(e){toast('Koneksi USB dibatalkan atau perangkat tidak kompatibel.','error')}
}
async function connectBLE(){
if(!navigator.bluetooth)return toast('Web Bluetooth tidak tersedia. Classic Bluetooth printer membutuhkan aplikasi native Android.','error');
try{const device=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:PRINTER_BLE_SERVICES});await prepareBLEPrinter(device);toast('Printer BLE terhubung. Auto reconnect saat cetak aktif.');openPrinter()}catch(e){toast('Koneksi Bluetooth dibatalkan atau service printer tidak cocok.','error')}
}
if(navigator.usb?.addEventListener){
navigator.usb.addEventListener('disconnect',event=>{if(usbDevice===event.device){usbDevice=null;savePrinterRuntimeState(false,{remembered:true})}});
navigator.usb.addEventListener('connect',event=>{const p=db.settings.printer||{};if(p.type==='usb'&&p.remembered&&printerUSBMatches(event.device,p))usbDevice=event.device})
}
function selectWiFiPrinter(){const p=db.settings.printer||{};db.settings.printer={...p,type:'wifi',name:p.ip?`WiFi ${p.ip}:${Number(p.port)||9100}`:'WiFi / LAN',connected:false,ip:p.ip||'192.168.1.100',port:Number(p.port)||9100};save();renderPrinterPage()}
function validPrinterHost(host){const h=String(host||'').trim();if(!h)return false;const ipv4=/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;const hostname=/^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/;return ipv4.test(h)||hostname.test(h)}
function getWiFiPrinterBridge(){return window.MYPOSPrinter||window.AndroidPrinter||window.NativePrinter||null}
async function saveWiFiPrinter(){
const ip=String(document.getElementById('wifiPrinterIp')?.value||'').trim(),port=Math.round(Number(document.getElementById('wifiPrinterPort')?.value)||0);
if(!validPrinterHost(ip))return toast('IP Address / hostname printer tidak valid.','error');
if(port<1||port>65535)return toast('Port printer harus 1–65535.','error');
let connected=false;
const bridge=getWiFiPrinterBridge();
try{
if(bridge&&typeof bridge.testTcp==='function'){const result=await Promise.resolve(bridge.testTcp(ip,port));connected=result!==false&&String(result).toLowerCase()!=='false'}
else if(bridge&&typeof bridge.connectTcp==='function'){const result=await Promise.resolve(bridge.connectTcp(ip,port));connected=result!==false&&String(result).toLowerCase()!=='false'}
}catch(e){connected=false}
db.settings.printer={...(db.settings.printer||{}),type:'wifi',name:`WiFi ${ip}:${port}`,ip,port,connected};
save();renderPrinterPage();
if(connected)toast('Printer WiFi / LAN terhubung.');
else toast('Konfigurasi WiFi disimpan. Cetak TCP langsung aktif saat dijalankan melalui aplikasi native INPOS.');
}
function openReceiptPreview(){return openReceiptPreviewFinalV56()}
function testPrint(){return testPrintSameAsPreviewV57()}
function receiptOrderServiceV50(s){
let type=String(s?.fulfillmentType||'').toLowerCase();
const rawNote=String(s?.note||'');
if(!['takeaway','dinein'].includes(type)){
if(/Layanan:\s*Dine\s*In/i.test(rawNote))type='dinein';
else if(/Layanan:\s*Take\s*Away/i.test(rawNote))type='takeaway';
}
if(!type)return null;
let queue=String(s?.queueNumber||'').trim();
let table=String(s?.tableNumber||'').trim();
if(!queue){const m=rawNote.match(/Antrian:\s*([A-Za-z0-9_-]+)/i);if(m)queue=m[1]}
if(!table){const m=rawNote.match(/Meja:\s*([^•\n]+)/i);if(m)table=String(m[1]||'').trim()}
return{type,label:type==='dinein'?'Dine In':'Take Away',queue,table}
}
function receiptBonDueNoteV53(s){
if(String(s?.method||'').trim().toLowerCase()!=='bon')return'';
const raw=String(s?.bonDueNote||s?.note||'').trim();
const dayMatch=raw.match(/jatuh\s*tempo\s*:?\s*(\d+)\s*hari/i);
if(dayMatch){
const n=Math.max(0,parseInt(dayMatch[1],10)||0);
return n===0?'Jatuh Tempo Hari Ini':`Jatuh Tempo ${n} Hari`;
}
let due=String(s?.dueDate||s?.bonDueDate||'').trim();
if(!due&&s?.customerId!=null){
try{
const c=typeof getCustomer==='function'?getCustomer(s.customerId):null;
due=String(c?.due||'').trim();
}catch(e){}
}
if(due){
const saleDate=new Date(s?.date||Date.now()),dueDate=new Date(due+'T00:00:00');
if(!Number.isNaN(saleDate.getTime())&&!Number.isNaN(dueDate.getTime())){
const start=new Date(saleDate.getFullYear(),saleDate.getMonth(),saleDate.getDate());
const days=Math.round((dueDate-start)/86400000);
if(days>=0&&days<=3650)return days===0?'Jatuh Tempo Hari Ini':`Jatuh Tempo ${days} Hari`;
}
try{return`Jatuh Tempo ${fmtDate(due)}`}catch(e){return`Jatuh Tempo ${due}`}
}
const dateMatch=raw.match(/jatuh\s*tempo\s*:?\s*([0-3]?\d[\/-][01]?\d[\/-](?:\d{2}|\d{4}))/i);
return dateMatch?`Jatuh Tempo ${dateMatch[1]}`:'';
}
function receiptCenterTextV53(value,cols){
const s=String(value||'');cols=Math.max(20,Number(cols)||32);
if(s.length>=cols)return s.slice(0,cols);
return' '.repeat(Math.max(0,Math.floor((cols-s.length)/2)))+s;
}
function receiptCleanTransactionNoteV50(s){
let note=String(s?.note||'').trim();
if(!note)return'';
note=note
.replace(/(?:^|\s*•\s*)Layanan:\s*Dine\s*In(?:\s*•\s*Meja:\s*[^•\n]+)?(?:\s*•\s*Antrian:\s*[A-Za-z0-9_-]+)?/ig,'')
.replace(/(?:^|\s*•\s*)Layanan:\s*Take\s*Away(?:\s*•\s*Antrian:\s*[A-Za-z0-9_-]+)?/ig,'');
if(String(s?.method||'').trim().toLowerCase()==='bon'){
note=note
.replace(/(?:^|\s*•\s*)Jatuh\s*Tempo\s*:?\s*\d+\s*Hari/ig,'')
.replace(/(?:^|\s*•\s*)Jatuh\s*Tempo\s*:?\s*[0-3]?\d[\/-][01]?\d[\/-](?:\d{2}|\d{4})/ig,'');
}
note=note
.replace(/^\s*•\s*|\s*•\s*$/g,'')
.replace(/\s*•\s*•\s*/g,' • ')
.trim();
return note
}
function customerByIdLooseV68(id){
if(id==null)return null;
try{const c=typeof getCustomer==='function'?getCustomer(id):null;if(c)return c}catch(e){}
return Array.isArray(db?.customers)?db.customers.find(c=>String(c?.id)===String(id))||null:null
}
function receiptSelectedCustomerNameV68(id){
if(id==null)return'';
const c=customerByIdLooseV68(id);
if(c?.name)return String(c.name).trim();
const label=String(document.getElementById('selectedCustomerText')?.textContent||'').replace(/^👤\s*/,'').trim();
if(label&&!/^(pelanggan umum|umum)$/i.test(label))return label;
return''
}
function receiptCustomerNameV43(s){
const direct=String(s?.customerName||s?.customer?.name||'').trim();
const customer=s?.customerId!=null?customerByIdLooseV68(s.customerId):null;
const name=String(direct||customer?.name||'').trim();
if(!name||/^(pelanggan umum|umum)$/i.test(name))return'';
return name;
}
function receiptPaper(s){
const width=String(db.settings.receiptWidth)==='80'?'80':'58',f=receiptFieldConfig(),totals=receiptShareTotals(s);
const header=(f.storeName||f.storeAddress||f.storePhone)?`<div class="center">${f.storeName?`<h3>${esc(db.settings.store)}</h3>`:''}${f.storeAddress&&db.settings.address?`<div>${esc(db.settings.address)}</div>`:''}${f.storePhone&&db.settings.phone?`<div>${esc(db.settings.phone)}</div>`:''}</div><hr>`:'';
const customerName=receiptCustomerNameV43(s),receiptNote=receiptCleanTransactionNoteV50(s),orderService=receiptOrderServiceV50(s);
const meta=`${f.transactionNumber?`<div class="paper-line"><span>No.</span><span>${esc(s.id)}</span></div>`:''}${f.dateTime?`<div class="paper-line"><span>Tanggal</span><span>${fmtTime(s.date)}</span></div>`:''}${f.cashier?`<div class="paper-line"><span>Kasir</span><span>${esc(s.cashier||db.settings.cashier)}</span></div>`:''}${f.customer&&customerName?`<div class="paper-line"><span>PLG</span><span>${esc(customerName)}</span></div>`:''}${f.shipping&&s.shippingAddress?`<div class="paper-line"><span>ALMT</span><span>${esc(s.shippingAddress)}</span></div>`:''}${f.shipping&&s.shippingNote?`<div class="paper-line"><span>KRM</span><span>${esc(s.shippingNote)}</span></div>`:''}${f.transactionNote&&receiptNote?`<div class="paper-line"><span>NOTE</span><span>${esc(receiptNote)}</span></div>`:''}`;
const orderServiceHtml=f.orderService&&orderService?`<div class="paper-line receipt-order-service-v50"><b>${esc(orderService.label)}${orderService.type==='dinein'&&orderService.table?` • Meja: ${esc(orderService.table)}`:''}</b><b>${orderService.queue?`Antrian: ${esc(orderService.queue)}`:''}</b></div>`:'';
const items=s.items.map(x=>{const p=getProduct(x.productId);return`<div class="paper-item"><b>${esc(p?.name||'Produk')}${x.wholesaleBonus?' [BONUS]':''}</b>${x.variant?`<small>Varian: ${esc(x.variant)}</small>`:''}<div class="paper-line"><span>${x.qty} × ${rupiah(x.price)}</span><span>${rupiah(x.qty*x.price)}</span></div>${cartItemFee(x)?`<div class="paper-line"><small>Biaya item</small><small>+${rupiah(cartItemFee(x))}</small></div><div class="paper-line"><b>Total item</b><b>${rupiah(cartItemLineTotal(x))}</b></div>`:''}${f.itemNote&&x.note?`<small>${esc(x.note)}</small>`:''}</div>`}).join('');
const payment=f.payment?`<div class="paper-line"><span>${esc(salePaymentNameV264(s))}</span><span>${s.method==='Tunai'?rupiah(s.paid||s.total):rupiah(s.total)}</span></div>${s.method==='Tunai'?`<div class="paper-line"><span>Kembali</span><span>${rupiah(Math.max(0,(s.paid||s.total)-s.total))}</span></div>`:''}`:'';
const footer=f.footer?`<hr><div class="center">${esc(db.settings.footer||'Terima kasih')}</div>`:'';
const bonDue=receiptBonDueNoteV53(s),bonBottom=bonDue?`<hr><div class="center receipt-bon-due-v53"><b>${esc(bonDue)}</b></div>`:'';
return`<div class="paper receipt-paper-${width}">${header}${meta}${meta?'<hr>':''}${orderServiceHtml}${orderServiceHtml?'<hr>':''}${items}<hr><div class="paper-line"><span>Subtotal Produk</span><span>${rupiah(totals.baseSubtotal)}</span></div>${totals.productFee?`<div class="paper-line"><span>Biaya Produk</span><span>+${rupiah(totals.productFee)}</span></div>`:''}${totals.discount?`<div class="paper-line"><span>Diskon</span><span>-${rupiah(totals.discount)}</span></div>`:''}${totals.tax?`<div class="paper-line"><span>PPN ${totals.taxRate||''}${totals.taxRate?'%':''}</span><span>+${rupiah(totals.tax)}</span></div>`:''}${totals.paymentFee?`<div class="paper-line"><span>Biaya Pembayaran${s.feeNote?' ('+esc(s.feeNote)+')':''}</span><span>+${rupiah(totals.paymentFee)}</span></div>`:''}<div class="paper-line paper-total"><span>TOTAL</span><span>${rupiah(totals.grandTotal)}</span></div>${payment}${footer}${bonBottom}</div>`
}
function printReceipt(id){
const s=db.sales.find(x=>String(x.id)===String(id));
if(!s)return toast('Transaksi tidak ditemukan.','error');
return printReceiptObject(s);
}
function receiptPrintTextCompactV494(s){
return String(makeReceiptText(s)||'').replace(/(?:[ \t]*\r?\n)+$/g,'').trimEnd();
}
async function printReceiptObject(s){
const width=String(db.settings.receiptWidth)==='80'?'80':'58',type=db.settings.printer?.type||'system',text=receiptPrintTextCompactV494(s);
if(['ble','usb','wifi'].includes(type)){
try{
const ready=await ensurePrinterReadyForOutput(type);
if(!ready)throw new Error('Printer belum dapat tersambung otomatis');
if(type==='ble')await sendESCPOSBLE(text);
else if(type==='usb')await sendESCPOSUSB(text);
else await sendESCPOSWiFi(text);
savePrinterRuntimeState(true,{remembered:true});
toast(`Struk ${width} mm dikirim ke printer ${type==='ble'?'BLE':type==='usb'?'USB':'WiFi / LAN'}.`);return
}catch(e){
if(type==='ble'){bleCharacteristic=null;savePrinterRuntimeState(false,{remembered:true})}
if(type==='usb'){savePrinterRuntimeState(false,{remembered:true})}
if(type==='wifi')savePrinterRuntimeState(false,{remembered:true});
toast('Auto reconnect printer gagal. Gunakan Hubungkan/Pasangkan Ulang jika izin perangkat berubah. Membuka Print Sistem.','error')
}
}
const zone=document.getElementById('printZone');prepareThermalPrintPage(width);zone.className=`printable receipt-${width}`;zone.style.width=width+'mm';zone.style.maxWidth=width+'mm';zone.innerHTML=receiptPaper(s);setTimeout(()=>window.print(),80)
}
function makeReceiptText(s){
const f=receiptFieldConfig(),divider=receiptTextDivider(),totals=receiptShareTotals(s);let t='';
if(f.storeName)t+=`${db.settings.store}\n`;
if(f.storeAddress&&db.settings.address)t+=`${db.settings.address}\n`;
if(f.storePhone&&db.settings.phone)t+=`${db.settings.phone}\n`;
if(t)t+=divider+'\n';
if(f.transactionNumber)t+=`No: ${s.id}\n`;
if(f.dateTime)t+=`Tanggal: ${fmtTime(s.date)}\n`;
if(f.cashier)t+=`Kasir: ${s.cashier||db.settings.cashier}\n`;
const customerName=receiptCustomerNameV43(s),receiptNote=receiptCleanTransactionNoteV50(s),orderService=receiptOrderServiceV50(s);
if(f.customer&&customerName)t+=`PLG : ${customerName}\n`;
if(f.shipping&&s.shippingAddress)t+=`ALMT : ${s.shippingAddress}\n`;
if(f.shipping&&s.shippingNote)t+=`KRM : ${s.shippingNote}\n`;
if(f.transactionNote&&receiptNote)t+=`NOTE : ${receiptNote}\n`;
t+=divider+'\n';
if(f.orderService&&orderService){const left=orderService.label+(orderService.type==='dinein'&&orderService.table?` • Meja: ${orderService.table}`:'');const right=orderService.queue?`Antrian: ${orderService.queue}`:'';t+=receiptTwoColV50(left,right,receiptTextColumns())+'\n'+divider+'\n'}
s.items.forEach(x=>{const p=getProduct(x.productId);t+=`${p?.name||'Produk'}${x.wholesaleBonus?' [BONUS]':''}${x.variant?' - '+x.variant:''}\n${x.qty} x ${rupiah(x.price)}     ${rupiah(x.qty*x.price)}\n${cartItemFee(x)?`Biaya item: +${rupiah(cartItemFee(x))}\nTotal item: ${rupiah(cartItemLineTotal(x))}\n`:''}${f.itemNote&&x.note?x.note+'\n':''}`});
t+=`${divider}\nSubtotal Produk: ${rupiah(totals.baseSubtotal)}\n${totals.productFee?`Biaya Produk: +${rupiah(totals.productFee)}\n`:''}${totals.discount?`Diskon: -${rupiah(totals.discount)}\n`:''}${totals.tax?`PPN ${totals.taxRate||''}${totals.taxRate?'%':''}: +${rupiah(totals.tax)}\n`:''}${totals.paymentFee?`Biaya Pembayaran${s.feeNote?' ('+s.feeNote+')':''}: +${rupiah(totals.paymentFee)}\n`:''}TOTAL: ${rupiah(totals.grandTotal)}\n`;
if(f.payment)t+=`${salePaymentNameV264(s)}: ${rupiah(s.method==='Tunai'?(s.paid||s.total):s.total)}\n${s.method==='Tunai'?`Kembali: ${rupiah(Math.max(0,(s.paid||s.total)-s.total))}\n`:''}`;
if(f.footer)t+=`${db.settings.footer||'Terima kasih'}\n`;
const bonDue=receiptBonDueNoteV53(s);
if(bonDue)t+=`${divider}\n${receiptCenterTextV53(bonDue,receiptTextColumns())}\n`;
return t+'\n\n'
}
async function sendESCPOSBLE(text){if(!bleCharacteristic||!bleDevice?.gatt?.connected)throw new Error('Printer BLE belum siap');const bytes=new TextEncoder().encode('\x1b\x40'+escposWidthCommandString()+text+'\n\n\x1d\x56\x00');for(let i=0;i<bytes.length;i+=180){const chunk=bytes.slice(i,i+180);if(bleCharacteristic.writeValueWithoutResponse)await bleCharacteristic.writeValueWithoutResponse(chunk);else await bleCharacteristic.writeValue(chunk)}}
async function sendESCPOSUSB(text){if(!usbDevice)throw new Error('No device');if(!usbDevice.opened)await usbDevice.open();if(!usbDevice.configuration)await usbDevice.selectConfiguration(1);const iface=usbDevice.configuration.interfaces.find(i=>i.alternates.some(a=>a.endpoints.some(e=>e.direction==='out')));if(!iface)throw new Error('No OUT endpoint');try{await usbDevice.claimInterface(iface.interfaceNumber)}catch(e){}const alt=iface.alternates.find(a=>a.endpoints.some(e=>e.direction==='out'));const ep=alt.endpoints.find(e=>e.direction==='out').endpointNumber;const bytes=new TextEncoder().encode('\x1b\x40'+escposWidthCommandString()+text+'\n\n\x1d\x56\x00');const result=await usbDevice.transferOut(ep,bytes);if(result?.status&&result.status!=='ok')throw new Error('USB transfer '+result.status)}
async function sendESCPOSWiFi(text){const p=db.settings.printer||{},ip=String(p.ip||'').trim(),port=Math.round(Number(p.port)||9100);if(!validPrinterHost(ip)||port<1||port>65535)throw new Error('Invalid WiFi printer address');const bridge=getWiFiPrinterBridge();if(!bridge)throw new Error('Native TCP bridge unavailable');const payload='\x1b\x40'+escposWidthCommandString()+text+'\n\n\x1d\x56\x00';let result;if(typeof bridge.printTcp==='function')result=await Promise.resolve(bridge.printTcp(ip,port,payload));else if(typeof bridge.printNetwork==='function')result=await Promise.resolve(bridge.printNetwork(ip,port,payload));else if(typeof bridge.sendTcp==='function')result=await Promise.resolve(bridge.sendTcp(ip,port,payload));else throw new Error('TCP print method unavailable');if(result===false||String(result).toLowerCase()==='false')throw new Error('TCP print failed');db.settings.printer={...p,type:'wifi',name:`WiFi ${ip}:${port}`,ip,port,connected:true};save()}
async function shareReceipt(id){const s=db.sales.find(x=>x.id===id);if(!s)return;const txt=makeReceiptText(s);if(navigator.share){try{await navigator.share({title:'Struk '+s.id,text:txt});return}catch(e){}}try{await navigator.clipboard.writeText(txt);toast('Isi struk disalin ke clipboard.')}catch(e){toast('Fitur bagikan tidak tersedia di browser ini.','error')}}
let mobilePickerView=db.settings.cashierView||'list';
function mobileInvoiceNumber(){return nextTransactionId()}
function mobileDateText(){const d=new Date();return`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`}
function plainNumber(v){return Number(v||0).toLocaleString('id-ID',{maximumFractionDigits:2})}
function renderMobileCashier(){
const items=document.getElementById('mobileSaleItems');
if(!items)return;
syncMobileSaleCloseShiftButton();
const number=document.getElementById('mobileSaleNumber');if(number)number.textContent=mobileInvoiceNumber();
const date=document.getElementById('mobileSaleDate');if(date)date.textContent=mobileDateText();
const cust=document.getElementById('mobileSaleCustomer');if(cust)cust.textContent=selectedCustomerId?(getCustomer(selectedCustomerId)?.name||'Pelanggan Umum'):'Pelanggan Umum';
const total=document.getElementById('mobileSaleGrandTotal');if(total)total.textContent=plainNumber(cartTotal());
const badge=document.getElementById('mobileSaleCartBadge');if(badge){badge.textContent=cartQty();badge.classList.toggle('show',cartQty()>0)}
items.innerHTML=cart.length?cart.map((x,i)=>{const p=getProduct(x.productId),isBonus=!!x.wholesaleBonus;return`<div class="mobile-sale-item ${isBonus?'is-wholesale-bonus':''}" ${isBonus?'':'role="button" tabindex="0"'} ${isBonus?'':`onclick="editCartItem(${i})"`}><div class="mobile-sale-cell mobile-sale-no">${i+1}</div><div class="mobile-sale-cell mobile-sale-desc"><b>${esc(p?.name||'Produk')}${isBonus?' <span class="mobile-bonus-badge">BONUS</span>':''}</b><small>${isBonus?'Gratis • Bonus Grosir':`${rupiah((x.price||0)*(x.unitFactor||1))} / ${esc(x.unitLabel||p?.unit||'pcs')}${x.variant?' • '+esc(x.variant):''}`}</small>${x.note?`<span class="mobile-sale-note">${esc(x.note)}</span>`:''}${!isBonus&&cartItemFee(x)?`<span class="mobile-sale-fee">Biaya +${rupiah(cartItemFee(x))}</span>`:''}${!isBonus?cartItemProductDiscountHTML(x,'mobile-sale-discount'):''}</div><div class="mobile-sale-cell mobile-sale-qty">${multiUnitQtyTextV684(x)}</div><div class="mobile-sale-cell mobile-sale-total">${isBonus?'GRATIS':plainNumber(cartItemLineTotal(x))}</div><div class="mobile-sale-cell mobile-sale-delete">${isBonus?'<span class="mobile-bonus-lock">✓</span>':`<button type="button" class="mobile-sale-delete-btn" aria-label="Hapus ${esc(p?.name||'produk')}" title="Hapus produk" onclick="event.stopPropagation();removeMobileSaleItem(${i})"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg></button>`}</div></div>`}).join(''):'<div class="mobile-sale-empty"></div>';
}
function openMobileCashierMenu(){
showModal('Menu Kasir','Navigasi cepat INPOS',`<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:8px"><button class="menu-card" onclick="closeModal();go('dashboard')"><div class="micon">⌂</div><b>Beranda</b><span>Kembali ke dashboard.</span></button><button class="menu-card" onclick="closeModal();go('sales')"><div class="micon">⇄</div><b>Riwayat</b><span>Transaksi sebelumnya.</span></button><button class="menu-card" onclick="closeModal();go('reports')"><div class="micon">⌁</div><b>Laporan</b><span>Lihat performa.</span></button><button class="menu-card" onclick="toggleTheme()"><div class="micon">◐</div><b>Tema</b><span>Light / Dark mode.</span></button><button class="menu-card" onclick="closeModal();go('more')"><div class="micon">⋯</div><b>Menu</b><span>Fitur lainnya.</span></button></div>`,[{label:'Tutup',close:true}]);
}
function openMobileProductPicker(){
mobilePickerView=db.settings.cashierView||mobilePickerView||'list';
try{document.activeElement?.blur?.()}catch(e){}
if(window.innerWidth<=1024){
go('productpicker');
setTimeout(()=>{renderMobileProductPicker()},40);
return;
}
showModal('Pilih Produk','Cari, lalu pilih produk.',`<div class="mobile-product-toolbar"><input class="input" id="mobilePickerSearch" placeholder="Cari nama / barcode..." autocomplete="off" oninput="renderMobileProductPicker()"><div class="mobile-picker-toggle"><button id="mobilePickerGrid" onclick="setMobilePickerView('grid')">▦ Grid</button><button id="mobilePickerList" onclick="setMobilePickerView('list')">☷ List</button></div></div><div class="mobile-picker-products" id="mobilePickerProducts"></div>`,[{label:'Selesai',close:true}],true);
setTimeout(()=>{renderMobileProductPicker()},40);
}
function setMobilePickerView(view){mobilePickerView='list';db.settings.cashierView='list';save();renderMobileProductPicker()}
function mobilePickerQuery(){const pageActive=document.getElementById('screen-productpicker')?.classList.contains('active');const id=pageActive?'mobilePickerPageSearch':'mobilePickerSearch';return(document.getElementById(id)?.value||'').toLowerCase().trim()}
function renderMobileProductPicker(){
const pageBox=document.getElementById('mobilePickerProductsPage'),modalBox=document.getElementById('mobilePickerProducts');
const boxes=[pageBox,modalBox].filter(Boolean);if(!boxes.length)return;
const q=mobilePickerQuery();
const rows=sortProductsNatural(db.products.filter(p=>!q||p.name.toLowerCase().includes(q)||String(p.sku||'').toLowerCase().includes(q)||productMatchesBarcode(p,q)||String(p.category||'').toLowerCase().includes(q)));
const bundles=activeBundles().filter(b=>!q||b.name.toLowerCase().includes(q));
const bundleHtml=bundles.map(b=>`<button class="mobile-picker-product mobile-picker-bundle" type="button" onclick="tapMobilePickerBundleV19(${b.id})"><div class="picker-main"><b class="picker-name">🎁 ${esc(b.name)}</b><small class="picker-meta">${b.items.length} jenis produk</small><small class="picker-category">Bundling</small></div><div class="picker-bottom"><div class="picker-price">${rupiah(b.price)}</div><div class="picker-stock nostock"><span class="picker-stock-label">Paket</span><strong class="picker-stock-value picker-stock-text">✓</strong></div></div></button>`).join('');
const productHtml=rows.map(p=>`<button class="mobile-picker-product" type="button" onclick="tapMobilePickerProductV19(${p.id})"><div class="picker-main"><b class="picker-name">${esc(p.name)}</b><small class="picker-meta">${p.sku?`SKU ${esc(p.sku)} • `:''}${esc(p.barcode||'-')} • ${esc(p.unit||'pcs')}</small><small class="picker-category">${esc(p.category||'Umum')}</small>${salePickerDiscountBadgeV527(p)}</div><div class="picker-bottom"><div class="picker-price">${p.manualPrice?'Harga Manual':rupiah(productSalePrice(p,p.price))}</div><div class="picker-stock ${p.noStock?'nostock':(Number(p.stock)<=0?'out':'')}">${p.noStock?'<span class="picker-stock-label">Stok</span><strong class="picker-stock-value picker-stock-text">∞</strong>':`<span class="picker-stock-label">Stok</span><strong class="picker-stock-value">${p.stock}</strong>`}</div></div></button>`).join('');
boxes.forEach(box=>{box.classList.toggle('list',mobilePickerView==='list');box.innerHTML=(bundleHtml||productHtml)?bundleHtml+productHtml:'<div class="empty-state mobile-picker-empty">Produk tidak ditemukan.</div>'});
const pageInfo=document.getElementById('mobilePickerPageInfo'),total=rows.length+bundles.length;if(pageInfo)pageInfo.textContent=total?`${total} pilihan tersedia`:'Produk tidak ditemukan';
['mobilePickerGrid','mobilePickerPageGrid'].forEach(id=>document.getElementById(id)?.remove());
['mobilePickerList','mobilePickerPageList'].forEach(id=>document.getElementById(id)?.classList.add('active'));
updateMobilePickerSummary();
}
function focusMobilePickerBarcode(){openSaleBarcodeScanner()}
function updateMobilePickerSummary(){const count=document.getElementById('mobilePickerCartCount'),total=document.getElementById('mobilePickerCartTotal');if(count)count.textContent=`${cartQty()} item dipilih`;if(total)total.textContent=rupiah(cartTotal())}
function openMobileProductQtyVariant(id){
const p=getProduct(id);if(!p)return;const available=availableProductStock(id);if(!p.noStock&&available<=0)return toast('Stok produk sudah habis teralokasi di transaksi ini.','error');
const variantsActive=productVariantsActive(p),variants=(variantsActive&&Array.isArray(p.variants)&&p.variants.length?p.variants:['Default']),initialVariant=variants[0]||'Default';
const visual=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:(p.emoji||'📦');
const initialQty=1,maxQty=p.noStock?999999:available,stockText=p.noStock?'Tanpa Stok':`Stok tersedia ${available} ${esc(p.unit||'pcs')}`;
const variantField=variantsActive?`<div class="field full"><label>Varian</label><select id="mobileProductVariant" onchange="updateMobileProductVariantPrice(${p.id})">${variants.map(v=>{const fee=variantExtraCost(p,v);return`<option value="${esc(v)}">${esc(v)}${fee?` (+${rupiah(fee)})`:''}</option>`}).join('')}</select><small id="mobileProductVariantFeeHint" style="color:var(--muted);margin-top:4px">${variantExtraCost(p,initialVariant)?`Biaya varian +${rupiah(variantExtraCost(p,initialVariant))} otomatis ditambahkan.`:'Varian ini tanpa biaya tambahan.'}</small></div>`:'';
const priceField=p.manualPrice?`<div class="field full"><label>Harga Jual Dasar</label><input id="mobileProductManualPrice" class="nominal-input" type="text" inputmode="numeric" placeholder="Masukkan harga jual dasar" oninput="updateMobileProductVariantPrice(${p.id})" autofocus><small style="color:var(--muted);margin-top:4px">Biaya varian akan ditambahkan otomatis ke harga jual dasar.</small></div>`:'';
const initialPrice=p.manualPrice?'Masukkan harga jual dasar':rupiah(productPriceWithVariant(p,initialVariant));
showModal('Tambah Produk','Atur produk sebelum dimasukkan ke transaksi.',`<div class="variant-picker-product"><div class="product-icon">${visual}</div><div><b>${esc(p.name)}</b><small>${esc(p.barcode||'-')} • ${stockText}</small><small id="mobileProductComputedPrice" style="color:var(--primary);font-weight:900">${initialPrice}</small></div></div><div class="form-grid">${variantField}${priceField}<div class="field full"><label>Qty</label><div class="variant-qty-row"><button type="button" onclick="adjustMobileVariantQty(-1)">−</button><input id="mobileProductQty" type="number" min="0.5" max="${maxQty}" step="0.5" value="${initialQty}"><button type="button" onclick="adjustMobileVariantQty(1)">+</button></div></div></div>`,[{label:'Batal',close:true},{label:'Tambahkan',primary:true,fn:()=>addMobileVariantProduct(id)}]);if(window.innerWidth<=1024){document.getElementById('overlay')?.classList.add('product-variant-overlay');document.getElementById('modalBox')?.classList.add('product-variant-modal')}
}
function updateMobileProductVariantPrice(id){const p=getProduct(id);if(!p)return;const variantsActive=productVariantsActive(p),raw=variantsActive?(document.getElementById('mobileProductVariant')?.value||'Default'):'Default',fee=variantExtraCost(p,raw),priceEl=document.getElementById('mobileProductComputedPrice'),hint=document.getElementById('mobileProductVariantFeeHint');let base=productSalePrice(p,p.price);if(p.manualPrice){const input=document.getElementById('mobileProductManualPrice'),rawPrice=input?.value?.trim()||'';if(!rawPrice){if(priceEl)priceEl.textContent='Masukkan harga jual dasar';if(hint)hint.textContent=fee?`Biaya varian +${rupiah(fee)} akan ditambahkan otomatis.`:'Varian ini tanpa biaya tambahan.';return}base=Math.max(0,parseNominal(rawPrice))}if(priceEl)priceEl.textContent=rupiah(base+fee);if(hint)hint.textContent=fee?`Biaya varian +${rupiah(fee)} • Harga jual akhir ${rupiah(base+fee)}`:'Varian ini tanpa biaya tambahan.'}
function adjustMobileVariantQty(delta){const el=document.getElementById('mobileProductQty');if(!el)return;const max=Number(el.max)||999999;let v=Number(el.value)||1;v=Math.max(.5,Math.min(max,Math.round((v+delta)*2)/2));el.value=v}
function addMobileVariantProduct(id){const p=getProduct(id);if(!p)return;const qty=Math.max(.5,Number(document.getElementById('mobileProductQty')?.value)||1),available=availableProductStock(id);if(!p.noStock&&qty>available)return toast(`Qty melebihi stok tersedia (${available}).`,'error');const variantsActive=productVariantsActive(p),raw=variantsActive?(document.getElementById('mobileProductVariant')?.value||'Default'):'Default',variant=raw==='Default'?'':raw,variantFee=variantExtraCost(p,raw);let basePrice=productSalePrice(p,p.price);if(p.manualPrice){const priceInput=document.getElementById('mobileProductManualPrice'),rawPrice=priceInput?.value?.trim()||'';if(rawPrice==='')return toast('Harga jual dasar wajib diisi.','error');basePrice=Math.max(0,parseNominal(rawPrice))}const price=basePrice+variantFee;const found=p.manualPrice?cart.find(x=>x.productId===id&&(x.variant||'')===variant&&Number(x.price)===Number(price)):cart.find(x=>x.productId===id&&(x.variant||'')===variant&&!x.priceLocked);if(found){found.qty+=qty;found.variantFee=variantFee}else cart.push({productId:id,qty,price,variantFee,itemFee:0,note:'',variant,priceLocked:!!p.manualPrice});renderCart();playCashierTone('product');if(navigator.vibrate)navigator.vibrate(12);closeModal();renderMobileProductPicker();toast(`${p.name} ditambahkan.`)}
function currentSaleDraft(){
const cost=sum(cart,x=>{const p=getProduct(x.productId);return(p?.cost||0)*x.qty});
const subtotal=cartSubtotal(),manualDiscountNow=Math.min(Math.max(0,Number(discount)||0),subtotal);return{id:mobileInvoiceNumber(),date:new Date().toISOString(),customerId:selectedCustomerId,method:'Belum Dibayar',total:cartTotal(),cost,paid:0,discount:manualDiscountNow,manualDiscount:manualDiscountNow,note:transactionNote,items:structuredClone(cart)};
}
function requireCurrentCart(){if(cart.length)return true;closeModal();toast('Belum ada item pada transaksi.','error');return false}
function openCurrentShareMenu(){
showModal('Bagikan & Dokumen','Pilih tindakan untuk transaksi saat ini.',`<div class="share-action-list">
    <button class="share-action-item" onclick="shareCurrentCart()"><span class="share-action-icon">↗</span><span>Share Struk</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="printCurrentReceipt()"><span class="share-action-icon">▣</span><span>Print Struk</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="printCurrentAddress()"><span class="share-action-icon">⌖</span><span>Print Alamat</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="printCurrentInvoice()"><span class="share-action-icon">▤</span><span>Print Invoice</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="printCurrentDeliveryNote()"><span class="share-action-icon">⇥</span><span>Print Surat Jalan</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="openEmailDocument('invoice')"><span class="share-action-icon">@</span><span>Kirimkan Email Invoice</span><span class="share-action-arrow">›</span></button>
    <button class="share-action-item" onclick="openEmailDocument('quote')"><span class="share-action-icon">✉</span><span>Kirimkan Email Penawaran</span><span class="share-action-arrow">›</span></button>
  </div>`,[]);
const modal=document.getElementById('modalBox'),overlay=document.getElementById('overlay');modal?.classList.add('share-menu-modal');overlay?.classList.add('share-sheet-overlay');
}
function printCurrentReceipt(){if(!requireCurrentCart())return;const sale=currentSaleDraft();closeModal();setTimeout(()=>printReceiptObject(sale),80)}
function printCurrentAddress(){
if(!requireCurrentCart())return;const c=selectedCustomerId?getCustomer(selectedCustomerId):null;if(!c){closeModal();toast('Pilih customer terlebih dahulu untuk Print Alamat.','error');return}
const zone=document.getElementById('printZone');zone.className='printable address-label';zone.innerHTML=`<div class="address-label-paper"><div class="to">Kepada</div><h2>${esc(c.name)}</h2><p>${esc(c.phone||'-')}</p><p>${esc(c.address||'Alamat pelanggan belum diisi')}</p><hr><p><b>Pengirim:</b> ${esc(db.settings.store)}</p><p>${esc(db.settings.phone||'')}</p></div>`;closeModal();setTimeout(()=>window.print(),80)
}
function currentDocumentHTML(type='invoice'){
const s=currentSaleDraft(),c=s.customerId?getCustomer(s.customerId):null,title=type==='delivery'?'SURAT JALAN':type==='quote'?'PENAWARAN':'INVOICE';
const rows=s.items.map((x,i)=>{const p=getProduct(x.productId);return`<tr><td>${i+1}</td><td><b>${esc(p?.name||'Produk')}${x.wholesaleBonus?' [BONUS]':''}</b><br><small>${esc(p?.barcode||'')}</small></td><td>${x.qty} ${esc(p?.unit||'pcs')}</td>${type==='delivery'?'':`<td>${rupiah(cartItemLineTotal(x))}</td>`}</tr>`}).join('');
return`<div class="doc-paper"><div class="doc-head"><div><div class="doc-brand">${esc(db.settings.store)}</div><div>${esc(db.settings.address||'')}</div><div>${esc(db.settings.phone||'')}</div></div><div><div class="doc-title">${title}</div><div>${esc(s.id)}</div></div></div><div class="doc-meta"><div><span>Tanggal</span><b>${mobileDateText()}</b></div><div><span>Customer</span><b>${esc(c?.name||'Pelanggan Umum')}</b></div>${c?.phone?`<div><span>WhatsApp</span><b>${esc(c.phone)}</b></div>`:''}${c?.address?`<div><span>ALMT</span><b>${esc(c.address)}</b></div>`:''}</div><table class="doc-table"><thead><tr><th>No</th><th>Keterangan</th><th>Jml</th>${type==='delivery'?'':'<th>Total</th>'}</tr></thead><tbody>${rows}</tbody></table>${type==='delivery'?'':`<div class="doc-total"><div><div class="doc-total-row"><span>Subtotal</span><b>${rupiah(s.total+(s.discount||0))}</b></div>${s.discount?`<div class="doc-total-row"><span>Diskon</span><b>-${rupiah(s.discount)}</b></div>`:''}<div class="doc-total-row grand"><span>GRAND TOTAL</span><b>${rupiah(s.total)}</b></div></div></div>`}${transactionNote?`<p style="margin-top:18px"><b>Catatan:</b> ${esc(transactionNote)}</p>`:''}</div>`;
}
function printDocument(type){if(!requireCurrentCart())return;const zone=document.getElementById('printZone');zone.className='printable document-a4';zone.innerHTML=currentDocumentHTML(type);closeModal();setTimeout(()=>window.print(),80)}
function printCurrentInvoice(){printDocument('invoice')}
function printCurrentDeliveryNote(){printDocument('delivery')}
function makeQuoteText(){const s=currentSaleDraft(),c=s.customerId?getCustomer(s.customerId):null;let t=`PENAWARAN • ${s.id}\n${db.settings.store}\n${db.settings.address||''}\n\nKepada: ${c?.name||'Pelanggan'}\n`;s.items.forEach((x,i)=>{const p=getProduct(x.productId),itemFee=cartItemFee(x);t+=`${i+1}. ${p?.name||'Produk'}${x.wholesaleBonus?' [BONUS]':''} — ${x.qty} x ${rupiah(x.price)}${itemFee?` + biaya ${rupiah(itemFee)}`:''} = ${rupiah(cartItemLineTotal(x))}\n`});t+=`\nTOTAL PENAWARAN: ${rupiah(s.total)}\n`;return t}
function openEmailDocument(type){
if(!requireCurrentCart())return;const c=selectedCustomerId?getCustomer(selectedCustomerId):null;showModal(type==='quote'?'Email Penawaran':'Email Invoice','Masukkan alamat email tujuan.',`<div class="field"><label>Email Customer</label><input id="documentEmail" type="email" value="${esc(c?.email||'')}" placeholder="nama@email.com"></div>`,[{label:'Batal',close:true},{label:'Buka Email',primary:true,fn:()=>sendDocumentEmail(type)}]);
}
function sendDocumentEmail(type){const email=(document.getElementById('documentEmail')?.value||'').trim();if(!email)return toast('Masukkan email tujuan.','error');const sale=currentSaleDraft(),subject=type==='quote'?`Penawaran ${sale.id} - ${db.settings.store}`:`Invoice ${sale.id} - ${db.settings.store}`,body=type==='quote'?makeQuoteText():makeReceiptText(sale);window.location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;closeModal()}
async function shareCurrentCart(){
if(!cart.length)return toast('Belum ada item untuk dibagikan.');
closeModal();
const lines=cart.map((x,i)=>{const p=getProduct(x.productId),itemFee=cartItemFee(x);return`${i+1}. ${p?.name||'Produk'}${x.wholesaleBonus?' [BONUS]':''} - ${x.qty} x ${rupiah(x.price)}${itemFee?` + biaya ${rupiah(itemFee)}`:''} = ${rupiah(cartItemLineTotal(x))}`});
const text=`INPOS • ${mobileInvoiceNumber()}\n${mobileDateText()}\n${selectedCustomerId?(getCustomer(selectedCustomerId)?.name||'Pelanggan'):'Pelanggan Umum'}\n\n${lines.join('\n')}\n\nTOTAL: ${rupiah(cartTotal())}`;
if(navigator.share){try{await navigator.share({title:'Transaksi '+mobileInvoiceNumber(),text});return}catch(e){}}
try{await navigator.clipboard.writeText(text);toast('Ringkasan transaksi disalin.')}catch(e){toast('Fitur bagikan tidak tersedia.','error')}
}
function refreshMobileSale(){
cart=[];discount=0;selectedCustomerId=null;transactionNote='';renderCart();toast('Transaksi baru siap.');
}
function syncMobileSaleCloseShiftButton(){
const btn=document.getElementById('mobileSaleCloseShiftBtn');if(!btn)return;
let show=false;
try{show=window.innerWidth<=1024&&typeof shiftFeatureEnabled==='function'&&shiftFeatureEnabled()&&typeof currentShiftData==='function'&&!!currentShiftData()}catch(e){show=false}
btn.classList.toggle('show',show);
btn.setAttribute('aria-hidden',show?'false':'true');
btn.tabIndex=show?0:-1;
}
function openMobileSaleCloseShift(){
if(typeof shiftFeatureEnabled==='function'&&!shiftFeatureEnabled())return toast('Fitur Shift sedang dinonaktifkan.','error');
if(typeof currentShiftData==='function'&&!currentShiftData())return toast('Belum ada shift yang aktif.','error');
closeMobileSaleShortcuts();
if(typeof openShiftCloseModal==='function')return openShiftCloseModal();
return openShiftModal();
}
function openMobileSaleShortcuts(){
const el=document.getElementById('mobileSaleShortcutOverlay');if(!el)return;
// A shortcut dialog and the desktop product picker must never stack together.
try{window.closeDesktopSalePickerV549?.()}catch(err){console.warn('Tutup pemilih produk:',err)}
const picker=document.getElementById('screen-productpicker');
if(picker&&document.getElementById('screen-cashier')?.classList.contains('active'))picker.classList.remove('active');
el.classList.add('show');el.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
el.querySelector('.mobile-sale-shortcut-close')?.focus({preventScroll:true});
}
function closeMobileSaleShortcuts(){
const el=document.getElementById('mobileSaleShortcutOverlay');if(!el)return;
el.classList.remove('show');el.setAttribute('aria-hidden','true');document.body.style.overflow='';
}
let excelRestoreDraft=null;
function excelXml(v){return String(v??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]||ch))}
function excelColName(index){let n=index+1,s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s}
function excelCRC32(bytes){let c=0xffffffff;for(let i=0;i<bytes.length;i++){c^=bytes[i];for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function excelWriteU16(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255}
function excelWriteU32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255}
function excelZipStore(files){const enc=new TextEncoder(),locals=[],centrals=[];let offset=0,centralSize=0;Object.entries(files).forEach(([name,content])=>{const nb=enc.encode(name),data=content instanceof Uint8Array?content:enc.encode(String(content)),crc=excelCRC32(data),local=new Uint8Array(30+nb.length);excelWriteU32(local,0,0x04034b50);excelWriteU16(local,4,20);excelWriteU16(local,6,0x0800);excelWriteU16(local,8,0);excelWriteU16(local,10,0);excelWriteU16(local,12,0);excelWriteU32(local,14,crc);excelWriteU32(local,18,data.length);excelWriteU32(local,22,data.length);excelWriteU16(local,26,nb.length);excelWriteU16(local,28,0);local.set(nb,30);locals.push(local,data);const cen=new Uint8Array(46+nb.length);excelWriteU32(cen,0,0x02014b50);excelWriteU16(cen,4,20);excelWriteU16(cen,6,20);excelWriteU16(cen,8,0x0800);excelWriteU16(cen,10,0);excelWriteU16(cen,12,0);excelWriteU16(cen,14,0);excelWriteU32(cen,16,crc);excelWriteU32(cen,20,data.length);excelWriteU32(cen,24,data.length);excelWriteU16(cen,28,nb.length);excelWriteU16(cen,30,0);excelWriteU16(cen,32,0);excelWriteU16(cen,34,0);excelWriteU16(cen,36,0);excelWriteU32(cen,38,0);excelWriteU32(cen,42,offset);cen.set(nb,46);centrals.push(cen);centralSize+=cen.length;offset+=local.length+data.length});const end=new Uint8Array(22);excelWriteU32(end,0,0x06054b50);excelWriteU16(end,4,0);excelWriteU16(end,6,0);excelWriteU16(end,8,centrals.length);excelWriteU16(end,10,centrals.length);excelWriteU32(end,12,centralSize);excelWriteU32(end,16,offset);excelWriteU16(end,20,0);return new Blob([...locals,...centrals,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function excelSheetXml(rows){const maxCols=Math.max(1,...rows.map(r=>r.length));let xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>';for(let i=0;i<maxCols;i++)xml+=`<col min="${i+1}" max="${i+1}" width="${i===1?26:(i===0?10:18)}" customWidth="1"/>`;xml+='</cols><sheetData>';rows.forEach((row,ri)=>{xml+=`<row r="${ri+1}">`;for(let ci=0;ci<row.length;ci++){const ref=excelColName(ci)+(ri+1),v=row[ci];if(v===null||v===undefined||v==='')continue;if(typeof v==='number'&&Number.isFinite(v))xml+=`<c r="${ref}"${ri===0?' s="1"':''}><v>${v}</v></c>`;else{const s=String(v);xml+=`<c r="${ref}" t="inlineStr"${ri===0?' s="1"':''}><is><t xml:space="preserve">${excelXml(s)}</t></is></c>`}}xml+='</row>'});return xml+'</sheetData><autoFilter ref="A1:'+excelColName(maxCols-1)+Math.max(1,rows.length)+'"/></worksheet>'}
function excelWorkbookBlob(sheets){const clean=sheets.map((s,i)=>({name:String(s.name||('Sheet'+(i+1))).replace(/[\\\/?*\[\]:]/g,' ').slice(0,31)||('Sheet'+(i+1)),rows:s.rows||[]})),files={};files['[Content_Types].xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+clean.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>';files['_rels/.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';files['xl/workbook.xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+clean.map((s,i)=>`<sheet name="${excelXml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets></workbook>';files['xl/_rels/workbook.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+clean.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+`<Relationship Id="rId${clean.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;files['xl/styles.xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE11D2E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>';clean.forEach((s,i)=>files[`xl/worksheets/sheet${i+1}.xml`]=excelSheetXml(s.rows));return excelZipStore(files)}
function excelDownload(name,sheets){downloadBlob(excelWorkbookBlob(sheets),name)}
const productExcelHeaders=['ID','Nama Produk','Jenis Produk','SKU','Barcode','Kategori','Satuan','Stok','Stok Minimum','Harga Modal','Harga Jual','Harga Grosir','Minimal Grosir','Tipe Diskon','Nilai Diskon','Kadaluarsa','Tanpa Stok','Harga Manual','Varian','Emoji','Terjual'];
const customerExcelHeaders=['ID','Nama Pelanggan','WhatsApp','Alamat','Poin','Poin Berlaku Sampai','Piutang','Jatuh Tempo','Total Belanja','Transaksi Terakhir'];
function productExcelRows(products=db.products){return[productExcelHeaders,...(products||[]).map(p=>[Number(p.id)||'',p.name||'',p.productKind==='service'?'Jasa':'Produk',p.sku||'',p.barcode||'',p.category||'Umum',p.unit||'pcs',Number(p.stock)||0,Number(p.min)||0,Number(p.cost)||0,Number(p.price)||0,Number(p.wholesale)||0,Number(p.wholesaleMinQty)||0,p.discountConfigured?(p.discountType==='nominal'?'Nominal':'Persentase'):'',p.discountConfigured?Number(p.discountValue)||0:0,p.hasExpiry&&p.expiry?dateKey(p.expiry):'',p.noStock?'Ya':'Tidak',p.manualPrice?'Ya':'Tidak',(p.variants||['Default']).join('|'),p.emoji||'📦',Number(p.sold)||0])]}
function customerExcelRows(customers=db.customers){return[customerExcelHeaders,...(customers||[]).map(c=>[Number(c.id)||'',c.name||'',c.phone||'',c.address||'',Number(c.points)||0,c.pointsExpiresAt?dateKey(c.pointsExpiresAt):'',Number(c.debt)||0,c.due?dateKey(c.due):'',Number(c.spent)||0,c.last?dateKey(c.last):''])]}
function backupProductsExcel(){excelDownload(`inpos-produk-${todayKey()}.xlsx`,[{name:'Produk',rows:productExcelRows()}]);toast('Backup Data Produk Excel diunduh.')}
function backupCustomersExcel(){excelDownload(`inpos-pelanggan-${todayKey()}.xlsx`,[{name:'Pelanggan',rows:customerExcelRows()}]);toast('Backup Data Pelanggan Excel diunduh.')}
function downloadProductExcelSample(){const headers=['Nama Produk','SKU','Barcode','Kategori','Satuan','Stok','Harga Modal','Harga Jual'],rows=[headers,['Beras Premium 1 Kg','BRS-1KG','899100000001','Sembako','PCS',25,14500,16000],['Kopi Susu','KOPI-SUSU','899100000002','Minuman','PCS',40,5000,8000]];excelDownload('INPOS-Sampel-Produk-Mudah.xlsx',[{name:'Produk',rows}]);toast('Sampel Produk Excel sederhana diunduh.')}
function downloadCustomerExcelSample(){const headers=['Nama Pelanggan','WhatsApp','Alamat'],rows=[headers,['Siti Aminah','081234567890','Jl. Mawar No. 10'],['Budi Santoso','081298765432','Jl. Melati No. 5']];excelDownload('INPOS-Sampel-Pelanggan-Mudah.xlsx',[{name:'Pelanggan',rows}]);toast('Sampel Pelanggan Excel sederhana diunduh.')}
async function excelInflateRaw(bytes){if(typeof DecompressionStream!=='function')throw new Error('Browser belum mendukung pembacaan Excel terkompresi. Gunakan Chrome/Edge terbaru.');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return new Uint8Array(await new Response(stream).arrayBuffer())}
async function excelUnzip(buffer){const u=new Uint8Array(buffer),dv=new DataView(buffer);let eocd=-1;for(let i=u.length-22;i>=Math.max(0,u.length-65557);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}if(eocd<0)throw new Error('File Excel tidak valid.');const count=dv.getUint16(eocd+10,true),centralOffset=dv.getUint32(eocd+16,true),dec=new TextDecoder('utf-8'),files={};let p=centralOffset;for(let i=0;i<count;i++){if(dv.getUint32(p,true)!==0x02014b50)throw new Error('Struktur Excel rusak.');const method=dv.getUint16(p+10,true),compSize=dv.getUint32(p+20,true),nameLen=dv.getUint16(p+28,true),extraLen=dv.getUint16(p+30,true),commentLen=dv.getUint16(p+32,true),localOffset=dv.getUint32(p+42,true),name=dec.decode(u.slice(p+46,p+46+nameLen));if(dv.getUint32(localOffset,true)!==0x04034b50)throw new Error('File Excel rusak.');const lName=dv.getUint16(localOffset+26,true),lExtra=dv.getUint16(localOffset+28,true),start=localOffset+30+lName+lExtra,comp=u.slice(start,start+compSize);let data;if(method===0)data=comp;else if(method===8)data=await excelInflateRaw(comp);else throw new Error('Metode kompresi Excel tidak didukung.');files[name]=data;p+=46+nameLen+extraLen+commentLen}return files}
function excelParseXml(bytes){return new DOMParser().parseFromString(new TextDecoder('utf-8').decode(bytes),'application/xml')}
function excelCellColumn(ref){const m=String(ref||'').match(/^([A-Z]+)/i);if(!m)return 0;let n=0;for(const ch of m[1].toUpperCase())n=n*26+(ch.charCodeAt(0)-64);return n-1}
async function excelReadRows(file){if(!file)return[];if(file.size>15*1024*1024)throw new Error('File Excel terlalu besar (maksimal 15 MB).');if(!/\.xlsx$/i.test(file.name||''))throw new Error('Gunakan file Excel .xlsx.');const files=await excelUnzip(await file.arrayBuffer()),sheetPath=Object.keys(files).find(k=>/^xl\/worksheets\/sheet\d+\.xml$/i.test(k));if(!sheetPath)throw new Error('Sheet Excel tidak ditemukan.');let shared=[];if(files['xl/sharedStrings.xml']){const doc=excelParseXml(files['xl/sharedStrings.xml']);shared=[...doc.getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent||'').join(''))}const doc=excelParseXml(files[sheetPath]),rows=[];for(const r of[...doc.getElementsByTagName('row')]){const arr=[];for(const c of[...r.getElementsByTagName('c')]){const idx=excelCellColumn(c.getAttribute('r')),type=c.getAttribute('t')||'',v=c.getElementsByTagName('v')[0]?.textContent??'',inline=[...c.getElementsByTagName('t')].map(t=>t.textContent||'').join('');let value=type==='inlineStr'?inline:type==='s'?(shared[Number(v)]??''):type==='b'?(v==='1'?'Ya':'Tidak'):v;arr[idx]=value}rows.push(arr)}while(rows.length&&rows[rows.length-1].every(v=>v==null||String(v).trim()===''))rows.pop();return rows}
function excelHeaderNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function excelRowObjects(rows){if(!rows.length)return[];const headers=(rows[0]||[]).map(excelHeaderNorm);return rows.slice(1).filter(r=>r.some(v=>String(v??'').trim()!=='')).map((r,index)=>{const o={__row:index+2};headers.forEach((h,i)=>{if(h)o[h]=r[i]??''});return o})}
function excelNum(v){if(typeof v==='number')return Number.isFinite(v)?v:0;const s=String(v??'').trim();if(!s)return 0;if(/^[-+]?\d+(?:\.\d+)?$/.test(s))return Number(s)||0;return typeof parseNominal==='function'?parseNominal(s):(Number(s.replace(/[^0-9.-]/g,''))||0)}
function excelBool(v){const s=String(v??'').trim().toLowerCase();return['1','true','ya','yes','y','aktif'].includes(s)}
function excelDate(v){const raw=String(v??'').trim();if(!raw)return null;if(/^\d+(?:\.\d+)?$/.test(raw)){const n=Number(raw);if(n>20000&&n<100000){const d=new Date(Date.UTC(1899,11,30)+Math.round(n)*86400000);return Number.isNaN(d.getTime())?null:d.toISOString()}}const iso=/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)?raw:new Date(raw);if(typeof iso==='string'){const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?null:d.toISOString()}return Number.isNaN(iso.getTime())?null:iso.toISOString()}
function excelPick(o,...keys){for(const key of keys){const k=excelHeaderNorm(key);if(o[k]!==undefined&&String(o[k]).trim()!=='')return o[k]}return''}
function parseProductExcelRows(rows){const objs=excelRowObjects(rows);if(!objs.length)throw new Error('Data Produk kosong.');const hasName=Object.keys(objs[0]).some(k=>['nama produk','nama'].includes(k));if(!hasName)throw new Error('Kolom “Nama Produk” tidak ditemukan. Gunakan file sampel INPOS.');const out=[];for(const o of objs){const name=String(excelPick(o,'Nama Produk','Nama')).trim();if(!name)continue;const type=String(excelPick(o,'Jenis Produk')).trim().toLowerCase(),expiry=excelDate(excelPick(o,'Kadaluarsa','Kedaluwarsa')),variants=String(excelPick(o,'Varian')).split(/[|,]/).map(v=>v.trim()).filter(Boolean),discountRaw=String(excelPick(o,'Tipe Diskon')).toLowerCase(),discountValue=Math.max(0,excelNum(excelPick(o,'Nilai Diskon'))),wholesale=Math.max(0,excelNum(excelPick(o,'Harga Grosir'))),id=Math.max(0,Math.round(excelNum(excelPick(o,'ID'))));out.push({id:id||null,name,productKind:type==='jasa'?'service':'product',sku:String(excelPick(o,'SKU','Kode Produk')).trim().toUpperCase(),barcode:String(excelPick(o,'Barcode')).trim(),category:String(excelPick(o,'Kategori')).trim()||'Umum',unit:String(excelPick(o,'Satuan')).trim()||'pcs',stock:Math.max(0,excelNum(excelPick(o,'Stok'))),min:Math.max(0,excelNum(excelPick(o,'Stok Minimum','Minimum Stok'))),cost:Math.max(0,excelNum(excelPick(o,'Harga Modal'))),price:Math.max(0,excelNum(excelPick(o,'Harga Jual'))),wholesale,wholesaleMinQty:Math.max(0,Math.round(excelNum(excelPick(o,'Minimal Grosir','Minimum Grosir')))),wholesaleConfigured:wholesale>0,discountType:discountRaw.includes('nom')?'nominal':'percent',discountValue,discountConfigured:discountValue>0,expiry,hasExpiry:!!expiry,noStock:String(excelPick(o,'Tanpa Stok')).trim()===''?type==='jasa':excelBool(excelPick(o,'Tanpa Stok')),manualPrice:excelBool(excelPick(o,'Harga Manual')),variants:variants.length?variants:['Default'],variantsEnabled:variants.length>1||Boolean(variants.length&&variants[0]!=='Default'),emoji:String(excelPick(o,'Emoji')).trim()||'📦',sold:Math.max(0,excelNum(excelPick(o,'Terjual')))})}if(!out.length)throw new Error('Tidak ada baris produk valid.');return out}
function parseCustomerExcelRows(rows){const objs=excelRowObjects(rows);if(!objs.length)throw new Error('Data Pelanggan kosong.');const hasName=Object.keys(objs[0]).some(k=>['nama pelanggan','nama'].includes(k));if(!hasName)throw new Error('Kolom “Nama Pelanggan” tidak ditemukan. Gunakan file sampel INPOS.');const out=[];for(const o of objs){const name=String(excelPick(o,'Nama Pelanggan','Nama')).trim();if(!name)continue;const id=Math.max(0,Math.round(excelNum(excelPick(o,'ID'))));out.push({id:id||null,name,phone:String(excelPick(o,'WhatsApp','WA','Nomor WhatsApp')).replace(/\s+/g,''),address:String(excelPick(o,'Alamat')).trim(),points:Math.max(0,Math.round(excelNum(excelPick(o,'Poin')))),pointsExpiresAt:excelDate(excelPick(o,'Poin Berlaku Sampai')),debt:Math.max(0,excelNum(excelPick(o,'Piutang','Bon'))),due:excelDate(excelPick(o,'Jatuh Tempo')),spent:Math.max(0,excelNum(excelPick(o,'Total Belanja'))),last:excelDate(excelPick(o,'Transaksi Terakhir'))||new Date().toISOString(),email:''})}if(!out.length)throw new Error('Tidak ada baris pelanggan valid.');return out}
async function restoreProductsExcel(file){try{const data=parseProductExcelRows(await excelReadRows(file));openExcelRestorePreview('products',data,file.name)}catch(e){toast(e.message||'File Excel Produk tidak dapat dibaca.','error')}}
async function restoreCustomersExcel(file){try{const data=parseCustomerExcelRows(await excelReadRows(file));openExcelRestorePreview('customers',data,file.name)}catch(e){toast(e.message||'File Excel Pelanggan tidak dapat dibaca.','error')}}
function openExcelRestorePreview(type,data,fileName){excelRestoreDraft={type,data,fileName};const isProduct=type==='products',current=isProduct?db.products.length:db.customers.length,newCount=data.filter(x=>isProduct?(!db.products.some(p=>(x.barcode&&p.barcode===x.barcode)||(x.sku&&p.sku===x.sku)||(x.id&&Number(p.id)===Number(x.id)))):(!db.customers.some(c=>(x.phone&&c.phone===x.phone)||(x.id&&Number(c.id)===Number(x.id))))).length,updateCount=data.length-newCount,preview=data.slice(0,5),rows=preview.map(x=>isProduct?`<tr><td>${esc(x.name)}</td><td>${esc(x.barcode||x.sku||'-')}</td><td>${esc(x.category||'-')}</td><td>${rupiah(x.price||0)}</td></tr>`:`<tr><td>${esc(x.name)}</td><td>${esc(x.phone||'-')}</td><td>${nominal(x.points||0)}</td><td>${rupiah(x.debt||0)}</td></tr>`).join('');showModal(`Restore ${isProduct?'Data Produk':'Data Pelanggan'}`,fileName,`<div class="excel-restore-summary"><div class="excel-restore-stat"><small>File</small><b>${data.length}</b></div><div class="excel-restore-stat"><small>Data Baru</small><b>${newCount}</b></div><div class="excel-restore-stat"><small>Cocok/Update</small><b>${updateCount}</b></div></div><div class="excel-restore-help"><b>Gabungkan</b> akan memperbarui data yang cocok dan menambah data baru. <b>Ganti Semua</b> akan mengganti seluruh ${isProduct?'produk':'pelanggan'} dengan isi Excel.</div><div class="excel-preview-table"><table><thead><tr>${isProduct?'<th>Nama Produk</th><th>SKU/Barcode</th><th>Kategori</th><th>Harga</th>':'<th>Nama</th><th>WhatsApp</th><th>Poin</th><th>Piutang</th>'}</tr></thead><tbody>${rows}</tbody></table></div>`,[{label:'Batal',close:true},{label:'Gabungkan',fn:()=>applyExcelRestore('merge')},{label:'Ganti Semua',primary:true,fn:()=>applyExcelRestore('replace')}],true);document.getElementById('overlay')?.classList.add('excel-restore-overlay');document.getElementById('modalBox')?.classList.add('excel-restore-modal')}
function applyExcelRestore(mode='merge'){const d=excelRestoreDraft;if(!d?.data?.length)return toast('Data restore tidak tersedia.','error');if(d.type==='products'){let next;if(mode==='replace'){next=d.data.map((x,i)=>({...x,id:x.id||i+1}))}else{next=[...db.products];let maxId=Math.max(0,...next.map(p=>Number(p.id)||0));d.data.forEach(x=>{const idx=next.findIndex(p=>(x.barcode&&p.barcode===x.barcode)||(x.sku&&p.sku===x.sku)||(x.id&&Number(p.id)===Number(x.id)));if(idx>=0){const keepImage=next[idx].image;next[idx]={...next[idx],...x,id:next[idx].id};if(keepImage&&!next[idx].image)next[idx].image=keepImage}else next.push({...x,id:x.id&&!next.some(p=>Number(p.id)===Number(x.id))?x.id:++maxId})})}db=normalizeDB({...db,products:next})}else{let next;if(mode==='replace'){next=d.data.map((x,i)=>({...x,id:x.id||i+1}))}else{next=[...db.customers];let maxId=Math.max(0,...next.map(c=>Number(c.id)||0));d.data.forEach(x=>{const idx=next.findIndex(c=>(x.phone&&c.phone===x.phone)||(x.id&&Number(c.id)===Number(x.id)));if(idx>=0)next[idx]={...next[idx],...x,id:next[idx].id};else next.push({...x,id:x.id&&!next.some(c=>Number(c.id)===Number(x.id))?x.id:++maxId})})}db=normalizeDB({...db,customers:next})}save();renderAll();excelRestoreDraft=null;closeModal();if(document.getElementById('screen-account-system')?.classList.contains('active'))renderAccountSystemPage();toast(`${d.type==='products'?'Data Produk':'Data Pelanggan'} berhasil ${mode==='replace'?'diganti':'digabungkan'} dari Excel.`)}
function backupJSON(){downloadBlob(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),'inpos-backup-'+todayKey()+'.json');toast('Backup diunduh.')}
function restoreJSON(file){
 if(!file)return;
 if(activeEmployee()?.role!=='owner')return toast('Hanya Owner yang dapat memulihkan backup.','error');
 if(file.size>10*1024*1024)return toast('File backup terlalu besar.','error');
 const r=new FileReader();
 r.onload=()=>{
  let parsed;
  try{parsed=JSON.parse(r.result)}catch(_){return toast('File backup bukan JSON yang valid.','error')}
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||!Array.isArray(parsed.products)||!parsed.settings||typeof parsed.settings!=='object'||Array.isArray(parsed.settings))return toast('File bukan backup INPOS yang valid.','error');
  const id=String(db.settings?.activeEmployeeId||'');
  if(!id||!Array.isArray(parsed.employees)||!parsed.employees.some(e=>e&&String(e.id)===id&&e.active!==false&&e.role==='owner'))return toast('Owner aktif tidak ditemukan pada backup. Pemulihan dibatalkan untuk mencegah akun terkunci.','error');
  if(!confirm('Pulihkan backup INPOS? Data usaha saat ini akan diganti. Pastikan Anda sudah menyimpan backup terbaru.'))return;
  const before=db;
  try{
   const restored=normalizeDB(parsed);restored.settings.activeEmployeeId=id;restored.settings.employeeLoggedOut=false;
   db=restored;
   if(!save()){db=before;return toast('Pemulihan gagal: ruang penyimpanan tidak tersedia. Data lama tetap aman.','error')}
  }catch(e){db=before;return toast('Pemulihan gagal. Data lama tetap aman.','error')}
  cart=[];discount=0;selectedCustomerId=null;transactionNote='';
  try{renderAll();if(document.getElementById('screen-account-system')?.classList.contains('active'))renderAccountSystemPage()}
  catch(e){console.error('INPOS render after restore:',e);toast('Data dipulihkan. Muat ulang aplikasi agar tampilan diperbarui.','error');return}
  toast('Backup berhasil dipulihkan.');
 };
 r.onerror=()=>toast('File backup tidak dapat dibaca.','error');r.readAsText(file)
}
function applyDashboardView(){const v=db.settings.dashboardView||{summary:true,chart:true,quick:true,bottom:true};document.querySelectorAll('[data-dashboard-block]').forEach(el=>{const key=el.dataset.dashboardBlock;el.style.display=v[key]===false?'none':''})}
let accountSystemState={type:'employee',employeeMode:'list',editingEmployeeId:null,deleteConfirm:false};
const employeePermissionMeta={
cashier:['Kasir','Akses halaman kasir dan transaksi baru'],
sales:['Penjualan','Riwayat transaksi, retur, diskon, dan fitur penjualan'],
stock:['Produk & Stok','Produk, stok opname, kategori, dan kode sistem produk'],
purchases:['Pembelian & Supplier','Pembelian stok dan data supplier'],
expenses:['Pengeluaran','Catatan biaya operasional'],
customers:['Pelanggan & Bon','Data pelanggan dan buku bon'],
reports:['Laporan','Semua laporan usaha'],
settings:['Pengaturan','Pengaturan sistem, printer, pembayaran, dan fitur tambahan']
};
function employeeRoleDefaults(role='cashier'){
if(role==='owner')return{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true};
if(role==='supervisor')return{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:false};
return{cashier:true,sales:true,stock:false,purchases:false,expenses:false,customers:true,reports:false,settings:false}
}
function employeeRoleLabel(role){return role==='owner'?'Owner':role==='supervisor'?'Supervisor':'Kasir'}
function employeeInitials(name){return String(name||'K').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'K'}
function employeeUsernameKey(value){return String(value||'').toLowerCase().trim()}
function employeePhoneKey(value){let digits=String(value||'').replace(/\D/g,'');if(!digits)return'';if(digits.startsWith('0'))digits='62'+digits.slice(1);else if(digits.startsWith('8'))digits='62'+digits;return digits}
function employeeFindByLogin(value){const username=employeeUsernameKey(value),phone=employeePhoneKey(value);return employeeList().find(e=>employeeUsernameKey(e.username)===username||(phone&&employeePhoneKey(e.phone)===phone))||null}
function employeeList(){if(!Array.isArray(db.employees))db.employees=[];return db.employees}
function activeEmployee(){if(db.settings.employeeLoggedOut)return null;return employeeList().find(e=>String(e.id)===String(db.settings.activeEmployeeId)&&e.active)||employeeList().find(e=>e.active)||employeeList()[0]||null}
function employeeById(id){return employeeList().find(e=>String(e.id)===String(id))||null}
function employeeCan(permission){const emp=activeEmployee();if(!emp||emp.active===false)return false;if(emp.role==='owner')return true;const explicit=emp.permissions?.[permission];if(typeof explicit==='boolean')return explicit===true;return employeeRoleDefaults(emp.role)?.[permission]===true}
function employeeScreenPermission(screen){const s=String(screen||'');if(s==='finance')return'expenses';if(['dashboard','more'].includes(s))return null;if(['account-system','tax'].includes(s))return'settings';if(['cashier','productpicker'].includes(s))return'cashier';if(['sales','sale-detail','sales-settings','discount-settings','wholesale-settings','mass-price-settings','bundle-settings'].includes(s))return'sales';if(['stock','stock-waste','stock-data','stock-opname','productform','categories','production','labels','consignment'].includes(s))return'stock';if(['purchases','suppliers','purchase-form','purchase-detail'].includes(s))return'purchases';if(s==='debts')return debtBookTab==='supplier'?'purchases':'customers';if(s==='expenses')return'expenses';if(s==='customers')return'customers';if(s==='shift')return'cashier';if(['reports','report-general','report-cashflow','report-finance','report-detail'].includes(s))return'reports';if(['printer','payments','notification-settings','notifications','market-online','market-orders','market-preview','courier','points-settings','ppn-settings','coupon-promo'].includes(s))return'settings';return null}
function employeeScreenAllowed(screen){const p=employeeScreenPermission(screen);return!p||employeeCan(p)}
function syncActiveEmployeeUI(){const emp=activeEmployee();if(!emp){document.querySelectorAll('.account-name').forEach(el=>el.textContent='Belum Login');document.querySelectorAll('.account-role').forEach(el=>el.textContent='Karyawan');document.querySelectorAll('.avatar').forEach(el=>{if(el.closest('.account'))el.textContent='--'});return}db.settings.cashier=emp.name;document.querySelectorAll('.account-name').forEach(el=>el.textContent=emp.name);document.querySelectorAll('.account-role').forEach(el=>el.textContent=employeeRoleLabel(emp.role));document.querySelectorAll('.avatar').forEach(el=>{if(el.closest('.account'))el.textContent=employeeInitials(emp.name)})}
function openAccountSystemPage(type='employee'){if(db.settings.employeeLoggedOut){inposV650ShowLogin();return}const next=['employee','dashboard-menu','backup','settings'].includes(type)?type:'employee';if(next!=='employee'&&!employeeCan('settings'))return toast('Akses menu ini tidak diizinkan untuk karyawan aktif.','error');accountSystemState.type=next;if(next==='employee'&&accountSystemState.employeeMode!=='edit')accountSystemState.employeeMode='list';go('account-system');renderAccountSystemPage()}
function accountSystemBack(){if(db.settings.employeeLoggedOut){inposV650ShowLogin();return}if(accountSystemState.type==='employee'&&accountSystemState.employeeMode!=='list'){accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;accountSystemState.deleteConfirm=false;renderAccountSystemPage();return}go('more')}
function accountSystemHeader(title,subtitle){const t=document.getElementById('accountSystemTitle'),s=document.getElementById('accountSystemSubtitle');if(t)t.textContent=title;if(s)s.textContent=subtitle}
function accountSystemToolbarAction(show=false){
const btn=document.getElementById('accountSystemToolbarAction');if(!btn)return;
const enabled=Boolean(show&&accountSystemState.type==='employee'&&accountSystemState.employeeMode==='list'&&employeeCan('settings'));
btn.hidden=!enabled;
btn.disabled=!enabled;
btn.setAttribute('aria-hidden',String(!enabled));
btn.style.setProperty('display',enabled?'grid':'none','important');
}
function employeeSummaryHTML(){const rows=employeeList(),activeCount=rows.filter(x=>x.active).length,current=activeEmployee();return`<div class="employee-summary"><div class="employee-summary-card"><small>Total Karyawan</small><b>${rows.length}</b></div><div class="employee-summary-card"><small>Aktif</small><b>${activeCount}</b></div><div class="employee-summary-card active"><small>Akun Aktif</small><div class="employee-summary-current"><b>${esc(current?.name||'-')}</b><span>${current?employeeRoleLabel(current.role):'-'}</span></div></div></div>`}
function employeeFilterList(value){const q=String(value||'').trim().toLowerCase();document.querySelectorAll('#employeeList [data-employee-search]').forEach(card=>{card.hidden=q&&!String(card.dataset.employeeSearch||'').includes(q)})}
function employeeListHTML(){const current=activeEmployee(),canManage=employeeCan('settings'),rows=employeeList().slice().sort((a,b)=>{if(a.id===current?.id)return-1;if(b.id===current?.id)return 1;return a.name.localeCompare(b.name,'id')});if(!rows.length)return'<div class="employee-empty"><b>Belum ada karyawan</b><small>Tekan tombol + di kanan atas untuk menambahkan karyawan baru.</small></div>';return`<div class="employee-list" id="employeeList">${rows.map(e=>{const isCurrent=String(e.id)===String(current?.id),access=Object.values(e.permissions||{}).filter(Boolean).length,search=esc(`${e.name} ${e.username||''} ${employeeRoleLabel(e.role)} ${e.phone||''}`.toLowerCase()),statusText=e.active?'Aktif':'Nonaktif';return`<div class="employee-card ${isCurrent?'current':''} ${e.active?'':'inactive'}" data-employee-search="${search}"><div class="employee-avatar">${employeeInitials(e.name)}</div><div class="employee-card-main"><div class="employee-card-name"><b>${esc(e.name)}</b><span class="employee-role-badge">${employeeRoleLabel(e.role)}</span>${isCurrent?'<span class="employee-status-badge current">Sedang Dipakai</span>':`<span class="employee-status-badge ${e.active?'active':'inactive'}">${statusText}</span>`}</div><div class="employee-card-meta"><span>@${esc(e.username||'-')}</span><span>${e.phone?`WA ${esc(e.phone)}`:'WA belum diisi'}</span><span>${access} akses</span><span>${e.pin?'PIN aktif':'PIN belum diatur'}</span></div></div><div class="employee-card-actions">${canManage?`<button class="employee-mini-btn" type="button" onclick="openEmployeeEdit('${esc(e.id)}')">Edit</button>`:''}</div></div>`}).join('')}</div>`}
function renderEmployeeListPage(){accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;accountSystemState.deleteConfirm=false;accountSystemHeader('Karyawan & PIN','Kelola akun login, PIN, peran, dan hak akses');accountSystemToolbarAction(employeeCan('settings'));return`${employeeSummaryHTML()}<div class="employee-search"><span>⌕</span><input type="search" placeholder="Cari nama, username, atau WhatsApp" oninput="employeeFilterList(this.value)"></div><div class="account-system-section employee-list-section"><div class="account-system-section-title">DAFTAR KARYAWAN</div>${employeeListHTML()}</div><div class="account-system-note employee-pin-info"><strong>Login Terpadu</strong><span>Owner & Karyawan login dengan Username/WhatsApp dan PIN 5–6 digit. Akses sesuai peran.</span></div>`}
function openEmployeeCreate(){if(!employeeCan('settings'))return toast('Anda tidak memiliki akses untuk menambah karyawan.','error');accountSystemState.employeeMode='edit';accountSystemState.editingEmployeeId=null;accountSystemState.deleteConfirm=false;renderAccountSystemPage()}
function openEmployeeEdit(id){if(!employeeCan('settings'))return toast('Anda tidak memiliki akses untuk mengedit karyawan.','error');if(!employeeById(id))return toast('Karyawan tidak ditemukan.','error');accountSystemState.employeeMode='edit';accountSystemState.editingEmployeeId=String(id);accountSystemState.deleteConfirm=false;renderAccountSystemPage()}
function cancelEmployeeEditor(){accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;accountSystemState.deleteConfirm=false;renderAccountSystemPage()}
function employeePermissionRows(perms,role){return Object.entries(employeePermissionMeta).map(([key,meta])=>`<div class="employee-permission"><div><b>${meta[0]}</b><small>${meta[1]}</small></div><button class="switch ${perms[key]?'on':''}" type="button" data-employee-permission="${key}" ${role==='owner'?'disabled':''} onclick="this.classList.toggle('on')"></button></div>`).join('')}
function renderEmployeeEditor(){const current=accountSystemState.editingEmployeeId?employeeById(accountSystemState.editingEmployeeId):null,role=current?.role||'cashier',perms=current?{...employeeRoleDefaults(role),...(current.permissions||{})}:employeeRoleDefaults(role),isActive=current?.active!==false;accountSystemHeader(current?'Edit Karyawan':'Tambah Karyawan',current?'Ubah akun login, PIN, role, dan hak akses':'Buat akun login karyawan baru');accountSystemToolbarAction(false);const owners=employeeList().filter(x=>x.role==='owner').length,isLastOwner=current?.role==='owner'&&owners<=1,isCurrent=String(current?.id||'')===String(activeEmployee()?.id||'');return`<div class="account-system-section"><div class="account-system-section-title">DATA KARYAWAN</div><div class="account-system-card"><div class="account-system-card-body"><div class="employee-editor"><div class="employee-editor-grid"><div class="field full employee-field-name"><label>Nama Karyawan</label><input id="employeeName" value="${esc(current?.name||'')}" placeholder="Contoh: Siti Aminah"></div><div class="employee-editor-pair-row"><div class="field employee-field-username"><label>Username</label><input id="employeeUsername" value="${esc(current?.username||'')}" placeholder="Contoh: siti.aminah" autocapitalize="none" autocomplete="username" oninput="this.value=this.value.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9._-]/g,'')"></div><div class="field employee-field-phone"><label>Nomor WhatsApp</label><input id="employeePhone" inputmode="tel" value="${esc(current?.phone||'')}" placeholder="08xxxxxxxxxx" autocomplete="tel"></div></div><div class="employee-editor-compact-row"><div class="field employee-field-role"><label>Role</label><select id="employeeRole" onchange="applyEmployeeRolePreset(this.value)"><option value="owner" ${role==='owner'?'selected':''}>Owner</option><option value="supervisor" ${role==='supervisor'?'selected':''}>Supervisor</option><option value="cashier" ${role==='cashier'?'selected':''}>Kasir</option></select></div><div class="field employee-field-pin"><label>PIN baru 5–6 digit</label><input id="employeePin" type="password" inputmode="numeric" maxlength="6" value="${esc(current?.pin||'')}" placeholder="••••" autocomplete="new-password"></div><div class="field employee-field-status"><label>Status</label><select id="employeeStatus" ${isCurrent||isLastOwner?'disabled':''}><option value="active" ${isActive?'selected':''}>Aktif</option><option value="inactive" ${!isActive?'selected':''}>Nonaktif</option></select></div></div></div><div class="employee-account-note-v644"><b>Akun Login</b><span>Karyawan dapat masuk memakai <strong>Username</strong> atau <strong>Nomor WhatsApp</strong> dan PIN yang sama.</span></div><div><div class="account-system-section-title" style="padding:0 0 6px">HAK AKSES</div><div class="employee-permissions" id="employeePermissionGrid">${employeePermissionRows(perms,role)}</div></div><div class="account-system-note">Role hanya memberikan preset awal. Selain Owner, hak akses dapat diaktifkan atau dimatikan sesuai kebutuhan.</div><div class="account-system-actions employee-editor-actions">${current&&!isCurrent?'<button class="btn btn-danger employee-delete-btn" type="button" onclick="requestDeleteEmployee()">Hapus</button>':''}<button class="btn" type="button" onclick="cancelEmployeeEditor()">Batal</button><button class="btn btn-primary" type="button" onclick="saveEmployeeRecord()">Simpan</button></div><div id="employeeDeleteConfirm"></div></div></div></div></div>`}
function applyEmployeeRolePreset(role){const perms=employeeRoleDefaults(role);const grid=document.getElementById('employeePermissionGrid');if(grid)grid.innerHTML=employeePermissionRows(perms,role)}
function collectEmployeePermissions(role){if(role==='owner')return employeeRoleDefaults('owner');const out={};document.querySelectorAll('#employeePermissionGrid [data-employee-permission]').forEach(btn=>out[btn.dataset.employeePermission]=btn.classList.contains('on'));return{...employeeRoleDefaults(role),...out}}
function saveEmployeeRecord(){if(!employeeCan('settings'))return toast('Anda tidak memiliki akses untuk menyimpan data karyawan.','error');const name=String(document.getElementById('employeeName')?.value||'').trim(),username=employeeUsernameKey(document.getElementById('employeeUsername')?.value||''),phone=String(document.getElementById('employeePhone')?.value||'').trim(),role=String(document.getElementById('employeeRole')?.value||'cashier'),pin=String(document.getElementById('employeePin')?.value||'').replace(/\D/g,''),status=document.getElementById('employeeStatus')?.value!=='inactive',currentId=String(accountSystemState.editingEmployeeId||'');if(name.length<2)return toast('Nama karyawan minimal 2 karakter.','error');if(!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(username))return toast('Username minimal 3 karakter dan hanya boleh huruf kecil, angka, titik, garis bawah, atau strip.','error');if(!/^\d{5,6}$/.test(pin)&&!(currentId&&window.INPOS_LOCAL_SERVER&&pin==='')&&!(currentId&&/^\d{4}$/.test(pin)&&String(employeeById(currentId)?.pin||'')===pin))return toast('PIN baru harus 5–6 digit angka.','error');const duplicateName=employeeList().find(e=>e.name.toLowerCase()===name.toLowerCase()&&String(e.id)!==currentId);if(duplicateName)return toast('Nama karyawan sudah digunakan.','error');const duplicateUsername=employeeList().find(e=>employeeUsernameKey(e.username)===username&&String(e.id)!==currentId);if(duplicateUsername)return toast('Username sudah digunakan karyawan lain.','error');const phoneKey=employeePhoneKey(phone);if(phone&&phoneKey.length<10)return toast('Nomor WhatsApp belum valid.','error');const duplicatePhone=phoneKey&&employeeList().find(e=>employeePhoneKey(e.phone)===phoneKey&&String(e.id)!==currentId);if(duplicatePhone)return toast('Nomor WhatsApp sudah digunakan karyawan lain.','error');const permissions=collectEmployeePermissions(role);let row=currentId?employeeById(currentId):null;if(row){const lastOwner=row.role==='owner'&&employeeList().filter(e=>e.role==='owner').length<=1;if(lastOwner&&role!=='owner')return toast('Minimal harus ada satu Owner.','error');row.name=name;row.username=username;row.phone=phone;row.role=role;row.pin=pin;row.active=String(row.id)===String(db.settings.activeEmployeeId)?true:status;row.permissions=permissions;if(String(row.id)===String(db.settings.activeEmployeeId))db.settings.cashier=name}else{row={id:'EMP-'+Date.now().toString(36).toUpperCase(),name,username,phone,role,pin,active:status,permissions};db.employees.push(row)}save();syncActiveEmployeeUI();accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;renderAccountSystemPage();toast('Data karyawan disimpan.')}
function requestDeleteEmployee(){if(!employeeCan('settings'))return toast('Anda tidak memiliki akses untuk menghapus karyawan.','error');const row=employeeById(accountSystemState.editingEmployeeId);if(!row)return;if(String(row.id)===String(db.settings.activeEmployeeId))return toast('Karyawan yang sedang aktif tidak dapat dihapus.','error');if(row.role==='owner'&&employeeList().filter(e=>e.role==='owner').length<=1)return toast('Owner terakhir tidak dapat dihapus.','error');accountSystemState.deleteConfirm=true;const box=document.getElementById('employeeDeleteConfirm');if(box)box.innerHTML=`<div class="employee-delete-confirm"><b>Hapus ${esc(row.name)}?</b><small>Data karyawan dan PIN akan dihapus. Riwayat transaksi lama tetap menyimpan nama kasir yang sudah tercatat.</small><div class="employee-delete-actions"><button class="btn" type="button" onclick="cancelDeleteEmployee()">Batal</button><button class="btn btn-danger" type="button" onclick="confirmDeleteEmployee()">Ya, Hapus</button></div></div>`}
function cancelDeleteEmployee(){accountSystemState.deleteConfirm=false;const box=document.getElementById('employeeDeleteConfirm');if(box)box.innerHTML=''}
function confirmDeleteEmployee(){if(!employeeCan('settings'))return toast('Anda tidak memiliki akses untuk menghapus karyawan.','error');const id=String(accountSystemState.editingEmployeeId||''),row=employeeById(id);if(!row)return cancelEmployeeEditor();if(String(row.id)===String(db.settings.activeEmployeeId))return toast('Karyawan aktif tidak dapat dihapus.','error');if(row.role==='owner'&&employeeList().filter(e=>e.role==='owner').length<=1)return toast('Owner terakhir tidak dapat dihapus.','error');db.employees=db.employees.filter(e=>String(e.id)!==id);save();accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;renderAccountSystemPage();toast('Karyawan dihapus.')}
function openEmployeeLogin(employeeId=''){
 // Native login is available only after logout; the employee menu must never embed the login form.
 if(!db.settings.employeeLoggedOut){openAccountSystemPage('employee');return}
 inposV650ShowLogin();
 const row=employeeId?employeeById(employeeId):null;
 const input=document.getElementById('employeeLoginIdentity');
 if(input&&row){input.value=row.username||row.phone||'';document.getElementById('employeeLoginPin')?.focus()}
}
function cancelEmployeeLogin(){if(db?.settings?.employeeLoggedOut)return;accountSystemState.employeeMode='list';renderAccountSystemPage()}
function inposV631SetLoginShell(active){
 document.body.classList.toggle('inpos-native-login-v631',!!active);
 if(active){if(!document.body.id)document.body.id='inposNativeLoginV631'}
 else if(document.body.id==='inposNativeLoginV631')document.body.removeAttribute('id');
}
/* INPOS v650: login benar-benar tidak menggunakan route Akun, Data & Sistem. */
function inposV649UnmountStandaloneLogin(){
 const root=document.getElementById('inposNativeLoginStandaloneV649');
 if(root)root.remove();
 document.body.classList.remove('inpos-v649-login-active');
 inposV631SetLoginShell(false);
 document.documentElement.classList.remove('inpos-v650-auth-loading');
}
function inposV650ShowLogin(){
 // v656: login and app share one file, but load as separate document views.
 location.reload();
}
/* INPOS v664: form login lama di dalam menu Akun & Sistem telah dihapus.
   Halaman login aktif berada dalam cabang dokumen login gabungan. */
let deferredPWAInstallPrompt=null,pwaServiceWorkerReady=false,pwaServiceWorkerError='';
function pwaConfig(){if(!db.settings||typeof db.settings!=='object')db.settings={};if(!db.settings.pwa||typeof db.settings.pwa!=='object')db.settings.pwa={};db.settings.pwa.enabled=true;return db.settings.pwa}
function pwaStoreShortName(){const cfg=pwaConfig(),fallback=String(db.settings?.store||'INPOS').trim()||'INPOS';return String(cfg.shortName||fallback).trim().slice(0,24)||'INPOS'}
function pwaStoreIcon(size=512){const cfg=pwaConfig();return size<=192?String(cfg.storeIcon192||cfg.storeIcon512||''):String(cfg.storeIcon512||cfg.storeIcon192||'')}
function buildTenantPWAManifest(){
const cfg=pwaConfig(),store=String(db.settings?.store||'INPOS').trim()||'INPOS',shortName=pwaStoreShortName(),base=new URL('./',location.href).href,start=location.href.split('#')[0],i192=pwaStoreIcon(192),i512=pwaStoreIcon(512);
const icons=(i192||i512)?[{src:new URL('tenant-icon-192.png',base).href,sizes:'192x192',type:'image/png',purpose:'any'},{src:new URL('tenant-icon-512.png',base).href,sizes:'512x512',type:'image/png',purpose:'any'}]:[{src:new URL('pwa-icon-192.png',base).href,sizes:'192x192',type:'image/png',purpose:'any'},{src:new URL('pwa-icon-512.png',base).href,sizes:'512x512',type:'image/png',purpose:'any'}];
return{id:new URL('./',location.href).pathname,name:`${store} – Kasir POS`,short_name:shortName,description:`Aplikasi kasir POS ${store}`,lang:'id-ID',start_url:location.href.split('#')[0],scope:base,display:'standalone',display_override:['window-controls-overlay','standalone','minimal-ui'],orientation:'any',background_color:'#fff8f8',theme_color:document.documentElement.dataset.theme==='dark'?'#141619':'#e11d2e',categories:['business','productivity'],icons}
}
function applyPWAStoreIdentity(){
try{
const manifest=buildTenantPWAManifest(),link=document.getElementById('pwaManifestLink');
if(window.__tenantManifestUrl){try{URL.revokeObjectURL(window.__tenantManifestUrl)}catch(e){}}
if(link){const url=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));link.href=url;window.__tenantManifestUrl=url}
const appMeta=document.getElementById('pwaApplicationNameMeta');if(appMeta)appMeta.setAttribute('content',manifest.short_name);
const apple=document.getElementById('pwaAppleTouchIcon'),icon=pwaStoreIcon(192);if(apple)apple.href=icon||'./pwa-icon-192.png';
document.title=`${manifest.short_name} — Kasir POS`;if(window.syncTenantTopbarIconV503)window.syncTenantTopbarIconV503();
}catch(err){console.warn('PWA identitas toko:',err)}
}
function resizeStorePWAIcon(file,size){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('File icon tidak dapat dibaca'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('File bukan gambar yang valid'));img.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,size,size);const pad=Math.round(size*.025),max=size-pad*2,scale=Math.min(max/img.width,max/img.height),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),x=Math.round((size-w)/2),y=Math.round((size-h)/2);ctx.drawImage(img,x,y,w,h);resolve(canvas.toDataURL('image/png'))}catch(err){reject(err)}};img.src=String(reader.result||'')};reader.readAsDataURL(file)})}
async function handleStorePWAIcon(input){
const file=input?.files?.[0];if(!file)return;if(!/^image\/(png|jpe?g|webp)$/i.test(file.type||''))return toast('Gunakan gambar PNG, JPG, atau WEBP.','error');if(file.size>8*1024*1024)return toast('Ukuran gambar maksimal 8 MB.','error');
try{const[i192,i512]=await Promise.all([resizeStorePWAIcon(file,192),resizeStorePWAIcon(file,512)]),cfg=pwaConfig();cfg.storeIcon192=i192;cfg.storeIcon512=i512;save();applyPWAStoreIdentity();syncTenantPWAAssetsV503();renderAccountSystemPage();toast('Icon toko disimpan untuk topbar dan PWA.')}catch(err){console.error(err);toast('Icon toko gagal diproses.','error')}
}
function removeStorePWAIcon(){const cfg=pwaConfig();delete cfg.storeIcon192;delete cfg.storeIcon512;save();applyPWAStoreIdentity();syncTenantPWAAssetsV503();renderAccountSystemPage();toast('Icon toko dikembalikan ke icon bawaan.')}
function pwaStandalone(){return window.matchMedia?.('(display-mode: standalone)')?.matches===true||window.navigator.standalone===true}
function pwaSecureContext(){return location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'}
function pwaServiceWorkerActive(){return pwaServiceWorkerReady||!!navigator.serviceWorker?.controller}
function pwaInstallState(){if(pwaStandalone())return'Terpasang';if(deferredPWAInstallPrompt)return'Siap diinstal';if(!pwaSecureContext())return'Perlu HTTPS';if(pwaServiceWorkerError)return'File PWA bermasalah';if(pwaServiceWorkerActive())return'Tersedia di browser';return'Menyiapkan PWA'}
function syncPWAMenuStatus(){/* v739: status PWA otomatis, tanpa menu atau switch. */}
function refreshPWAStatusUI(){syncPWAMenuStatus()}
async function syncPWARegistration(){pwaConfig();pwaServiceWorkerError='';if(!('serviceWorker'in navigator)){pwaServiceWorkerReady=false;pwaServiceWorkerError='Browser tidak mendukung service worker';refreshPWAStatusUI();return false}if(!pwaSecureContext()){pwaServiceWorkerReady=false;refreshPWAStatusUI();return false}try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;await syncTenantPWAAssetsV503(reg);pwaServiceWorkerReady=!!(navigator.serviceWorker.controller||reg.active||reg.waiting||reg.installing);refreshPWAStatusUI();return true}catch(err){pwaServiceWorkerReady=false;pwaServiceWorkerError=String(err?.message||err||'Registrasi service worker gagal');console.warn('PWA service worker:',err);refreshPWAStatusUI();return false}}

// v739: PWA aktif otomatis, prompt browser hanya bisa dibuka oleh tap pengguna.
let pwaInstallPromptBusyV739=false;
const PWA_AUTO_OFFER_KEY_V739='inpos_pwa_auto_offer_v739';
let pwaAutoOfferDisplayedV739=false,pwaAutoOfferTimerV739=null,pwaAutoOfferRetriesV739=0;
function pwaStoreAutoOfferDismissedV739(){
  try {return Date.now()-Number(localStorage.getItem(PWA_AUTO_OFFER_KEY_V739)||0)<7*24*60*60*1000}
  catch(e){return false}
}
function pwaDismissAutoOfferV739(){
  try{localStorage.setItem(PWA_AUTO_OFFER_KEY_V739,String(Date.now()))}catch(e){}
}
function pwaCanShowAutoOfferV739(){
  if(pwaStandalone()||pwaStoreAutoOfferDismissedV739()||pwaAutoOfferDisplayedV739)return false;
  if(db?.settings?.employeeLoggedOut||document.documentElement.classList.contains('inpos-v650-auth-loading'))return false;
  if(document.getElementById('overlay')?.classList.contains('show'))return false;
  if(document.getElementById('firstUseOverlayV338')?.classList.contains('show'))return false;
  if(!document.querySelector('section.screen.active'))return false;
  if(!pwaSecureContext()||!('serviceWorker'in navigator))return false;
  const isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
  return !!deferredPWAInstallPrompt||isMobile;
}
function showAutomaticPWAInstallV739(){
  pwaAutoOfferTimerV739=null;
  if(!pwaCanShowAutoOfferV739()){
    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'');
    if((mobile||deferredPWAInstallPrompt)&&!pwaStandalone()&&!pwaStoreAutoOfferDismissedV739()&&!pwaAutoOfferDisplayedV739&&pwaAutoOfferRetriesV739++<12)
      scheduleAutomaticPWAInstallV739(6500);
    return false;
  }
  const hasNativePrompt=!!deferredPWAInstallPrompt;
  pwaAutoOfferDisplayedV739=true;
  const name=pwaStoreShortName();
  const description=hasNativePrompt
    ? 'Pasang aplikasi di perangkat untuk membuka INPOS langsung dari layar utama.'
    : 'Tambahkan INPOS ke layar utama melalui menu browser agar lebih mudah dibuka.';
  const buttons=[
    {label:'Nanti',fn:()=>{pwaDismissAutoOfferV739();closeModal()}},
    hasNativePrompt
      ? {label:'Instal Aplikasi',primary:true,fn:()=>{pwaDismissAutoOfferV739();closeModal();installPWA()}}
      : {label:'Petunjuk',primary:true,fn:()=>{pwaDismissAutoOfferV739();showPWAInstallHelp()}}
  ];
  showModal('Instal Aplikasi '+name,'INPOS',
    '<div class="pwa-help-list"><div class="pwa-help-row"><span>▣</span><div><b>'+esc(name)+'</b><small>'+description+'</small></div></div></div>',buttons);
  return true;
}
function scheduleAutomaticPWAInstallV739(delay=1500){
  if(pwaAutoOfferDisplayedV739||pwaStoreAutoOfferDismissedV739()||pwaStandalone())return;
  if(pwaAutoOfferTimerV739)clearTimeout(pwaAutoOfferTimerV739);
  pwaAutoOfferTimerV739=setTimeout(showAutomaticPWAInstallV739,delay);
}
async function installPWA(){
  if(pwaStandalone())return toast(`${pwaStoreShortName()} sudah terpasang sebagai aplikasi.`);
  if(pwaInstallPromptBusyV739)return;
  const prompt=deferredPWAInstallPrompt;
  if(!prompt){
    showPWAInstallHelp();
    return;
  }
  pwaInstallPromptBusyV739=true;
  deferredPWAInstallPrompt=null;
  try{
    // Prompt wajib berasal dari interaksi pengguna (tombol Instal Aplikasi).
    await prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice?.outcome==='accepted')toast(`Permintaan instalasi ${pwaStoreShortName()} diterima.`);
  }catch(err){
    console.warn('PWA install prompt:',err);
    showPWAInstallHelp();
  }finally{
    pwaInstallPromptBusyV739=false;
    syncPWAMenuStatus();
  }
}
function showPWAInstallHelp(){
  showModal(`Petunjuk Instal ${pwaStoreShortName()}`,'PWA',
    `<div class="pwa-help-list"><div class="pwa-help-row"><span>1</span><div><b>Android / Chrome</b><small>Buka menu browser (⋮), lalu pilih Instal aplikasi atau Tambahkan ke layar utama.</small></div></div><div class="pwa-help-row"><span>2</span><div><b>iPhone / Safari</b><small>Tekan Bagikan, lalu pilih Tambahkan ke Layar Utama.</small></div></div></div>`,
    [{label:'Tutup',close:true}]);
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPWAInstallPrompt=event;syncPWAMenuStatus();scheduleAutomaticPWAInstallV739(1300)});
window.addEventListener('appinstalled',()=>{deferredPWAInstallPrompt=null;pwaAutoOfferDisplayedV739=true;pwaDismissAutoOfferV739();syncPWAMenuStatus();toast(`${pwaStoreShortName()} berhasil dipasang sebagai aplikasi.`)});
function renderAccountSystemPage(){
const body=document.getElementById('accountSystemBody');if(!body)return;
if(db.settings.employeeLoggedOut){inposV650ShowLogin();return;}
inposV649UnmountStandaloneLogin();
if(accountSystemState.type==='employee'&&accountSystemState.employeeMode==='login')accountSystemState.employeeMode='list';
const type=accountSystemState.type;
document.getElementById('screen-account-system')?.classList.toggle('dashboard-menu-mode',type==='dashboard-menu');accountSystemToolbarAction(false);
if(type==='employee'){
if(accountSystemState.employeeMode==='edit')body.innerHTML=renderEmployeeEditor();
else body.innerHTML=renderEmployeeListPage();
return;
}
if(type==='dashboard-menu'){go('dashboard');return;}
if(type==='backup'){
accountSystemHeader('Backup & Restore','Backup lengkap atau data master melalui Excel');
const saleCount=Array.isArray(db.sales)?db.sales.length:0,productCount=Array.isArray(db.products)?db.products.length:0,customerCount=Array.isArray(db.customers)?db.customers.length:0;
body.innerHTML=`<div class="account-system-section"><div class="account-system-section-title">RINGKASAN DATA</div><div class="backup-restore-wrap"><div class="backup-status-card"><div class="backup-status-icon">DB</div><div class="backup-status-copy"><b>Data INPOS</b><small>Gunakan Backup Lengkap untuk seluruh aplikasi, atau Excel untuk memindahkan Produk dan Pelanggan.</small></div><div class="backup-stats"><div class="backup-stat"><small>Produk</small><b>${productCount.toLocaleString('id-ID')}</b></div><div class="backup-stat"><small>Pelanggan</small><b>${customerCount.toLocaleString('id-ID')}</b></div><div class="backup-stat"><small>Transaksi</small><b>${saleCount.toLocaleString('id-ID')}</b></div></div></div></div></div>
  <div class="account-system-section"><div class="account-system-section-title">BACKUP LENGKAP APLIKASI</div><div class="backup-action-grid"><button class="backup-action-card primary" type="button" onclick="backupJSON()"><span class="backup-action-icon">⇩</span><b>Backup Lengkap</b><small>Seluruh database aplikasi dalam file JSON.</small><span class="backup-action-arrow">›</span></button><label class="backup-action-card"><span class="backup-action-icon">⇧</span><b>Restore Lengkap</b><small>Pulihkan seluruh database dari backup JSON.</small><span class="backup-action-arrow">›</span><input type="file" accept="application/json,.json" onchange="restoreJSON(this.files[0]);this.value=''" /></label></div></div>
  <div class="account-system-section"><div class="account-system-section-title">DATA PRODUK • EXCEL</div><div class="backup-excel-card"><div class="backup-excel-head"><span class="backup-excel-ico">XLS</span><div class="backup-excel-copy"><b>Produk</b><small>Backup, restore, atau gunakan sampel Excel untuk input massal produk.</small></div><span class="backup-excel-count">${productCount} data</span></div><div class="backup-excel-actions"><button class="backup-excel-btn primary" type="button" onclick="backupProductsExcel()"><i>⇩</i><span>Backup Excel</span></button><label class="backup-excel-btn"><i>⇧</i><span>Restore Excel</span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onchange="restoreProductsExcel(this.files[0]);this.value=''" /></label><button class="backup-excel-btn sample" type="button" onclick="downloadProductExcelSample()"><i>▤</i><span>Sampel Excel</span></button></div><div class="backup-excel-note">Sampel mudah: <b>Nama Produk, SKU, Barcode, Kategori, Satuan, Stok, Harga Modal, Harga Jual</b>. Kolom lain tetap didukung pada Backup Excel.</div></div></div>
  <div class="account-system-section"><div class="account-system-section-title">DATA PELANGGAN • EXCEL</div><div class="backup-excel-card"><div class="backup-excel-head"><span class="backup-excel-ico">XLS</span><div class="backup-excel-copy"><b>Pelanggan</b><small>Backup dan restore data pelanggan dari Excel tanpa mengetik ulang satu per satu.</small></div><span class="backup-excel-count">${customerCount} data</span></div><div class="backup-excel-actions"><button class="backup-excel-btn primary" type="button" onclick="backupCustomersExcel()"><i>⇩</i><span>Backup Excel</span></button><label class="backup-excel-btn"><i>⇧</i><span>Restore Excel</span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onchange="restoreCustomersExcel(this.files[0]);this.value=''" /></label><button class="backup-excel-btn sample" type="button" onclick="downloadCustomerExcelSample()"><i>▤</i><span>Sampel Excel</span></button></div><div class="backup-excel-note">Sampel mudah: <b>Nama Pelanggan, WhatsApp, Alamat</b>. Data lain tetap didukung pada Backup Excel.</div></div></div>
  <div class="account-system-section hard-reset-section-v131"><div class="account-system-section-title">HARD RESET</div><div class="hard-reset-card-v131"><div class="hard-reset-copy-v131"><span class="hard-reset-icon-v131">!</span><div><b>Reset Aplikasi</b><small>Hapus seluruh data toko, transaksi, produk, pelanggan, pengaturan, dan akun. Wajib PIN Owner.</small></div></div><button class="btn btn-danger hard-reset-btn-v131" type="button" onclick="openHardResetV131()">Hard Reset</button></div></div>
  <div class="backup-warning"><span class="backup-warning-icon">!</span><div><b>Restore Excel aman dan bertahap</b><small>Setelah file dipilih, cek ringkasan lalu pilih Gabungkan atau Ganti Semua. Disarankan Backup Lengkap sebelum mengganti seluruh data.</small></div></div>`;
return
}
accountSystemHeader('Pengaturan','Profil toko & aplikasi');
const storeName=String(db.settings.store||'INPOS'),initial=storeName.trim().slice(0,1).toUpperCase()||'I',pwaCfg=pwaConfig(),storeIcon=pwaStoreIcon(512),shortName=pwaStoreShortName();
body.innerHTML=`<div class="settings-modern-hero"><div class="settings-modern-logo">${storeIcon?`<img src="${esc(storeIcon)}" alt="Icon ${esc(storeName)}">`:esc(initial)}</div><div class="settings-modern-hero-copy"><b>${esc(storeName)}</b><small>${esc(db.settings.address||'Profil usaha')}</small></div><span class="settings-modern-badge">TOKO</span></div><div class="account-system-section"><div class="account-system-section-title">PROFIL TOKO</div><div class="settings-modern-card"><div class="settings-modern-card-head"><div><b>Identitas Usaha</b><small>Untuk aplikasi & dokumen transaksi.</small></div></div><div class="settings-modern-form"><div class="field full"><label>Nama Toko</label><input id="setStorePage" value="${esc(db.settings.store)}" placeholder="Nama usaha"></div><div class="field"><label>Nama Pemilik</label><input id="setOwnerNamePage" autocomplete="name" value="${esc(db.settings.ownerName||'')}" placeholder="Nama pemilik usaha"></div><div class="field"><label>Email</label><input id="setStoreEmailPage" type="email" inputmode="email" autocomplete="email" value="${esc(db.settings.email||'')}" placeholder="nama@email.com"></div><div class="field full"><label>Alamat</label><input id="setAddressPage" value="${esc(db.settings.address||'')}" placeholder="Alamat toko"></div><div class="field"><label>WhatsApp Toko</label><input id="setPhonePage" inputmode="tel" value="${esc(db.settings.phone||'')}" placeholder="08xxxxxxxxxx"></div><div class="field"><label>Kasir Aktif</label><input value="${esc(activeEmployee()?.name||db.settings.cashier)}" disabled></div></div></div></div><div class="account-system-section"><div class="account-system-section-title">IDENTITAS APLIKASI PWA</div><div class="settings-modern-card"><div class="settings-modern-card-head"><div><b>Icon & Nama Aplikasi Toko</b><small>Nama & icon saat aplikasi diinstal.</small></div></div><div class="settings-pwa-identity"><div class="settings-pwa-icon-preview" id="settingsPWAIconPreview">${storeIcon?`<img src="${esc(storeIcon)}" alt="Icon PWA ${esc(storeName)}">`:esc(initial)}</div><div class="settings-pwa-icon-copy"><b>Icon Toko</b><small>Logo persegi • otomatis 192 & 512 px.</small><div class="settings-pwa-icon-actions"><button class="btn btn-sm" type="button" onclick="document.getElementById('setStorePWAIcon')?.click()">Pilih Icon</button>${storeIcon?`<button class="btn btn-sm btn-danger" type="button" onclick="removeStorePWAIcon()">Hapus</button>`:''}<input id="setStorePWAIcon" type="file" accept="image/png,image/jpeg,image/webp" hidden onchange="handleStorePWAIcon(this);this.value=''"></div></div></div><div class="settings-modern-form"><div class="field full"><label>Nama Singkatan Aplikasi</label><input id="setPWAShortNamePage" maxlength="24" value="${esc(shortName)}" placeholder="Contoh: TOKO JAYA" oninput="document.getElementById('pwaShortNamePreview').textContent=this.value.trim()||'INPOS'"><div class="settings-pwa-name-preview"><small>Nama saat diinstal</small><b id="pwaShortNamePreview">${esc(shortName)}</b></div><div class="account-system-note" style="margin-top:7px">Jika nama/icon berubah, instal ulang PWA.</div></div></div></div></div><div class="settings-modern-save"><button class="btn btn-primary" type="button" onclick="saveAccountSystemSettings()">Simpan Pengaturan</button></div>`
}
function saveAccountSystemSettings(){
const email=String(document.getElementById('setStoreEmailPage')?.value||'').trim();
if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Format email toko belum valid.','error');
db.settings.store=document.getElementById('setStorePage')?.value||db.settings.store;
db.settings.ownerName=String(document.getElementById('setOwnerNamePage')?.value||'').trim();
db.settings.email=email;
db.settings.address=document.getElementById('setAddressPage')?.value||'';
db.settings.phone=document.getElementById('setPhonePage')?.value||'';
db.settings.cashier=activeEmployee()?.name||db.settings.cashier;
const cfg=pwaConfig(),shortName=String(document.getElementById('setPWAShortNamePage')?.value||db.settings.store||'INPOS').trim().slice(0,24);cfg.shortName=shortName||'INPOS';
save();applyPWAStoreIdentity();syncTenantPWAAssetsV503();renderDashboard();renderAccountSystemPage();toast('Profil toko dan identitas PWA disimpan.');
}
function logoutEmployee(){
if(window.INPOS_LOCAL_SERVER){fetch('/api/auth/logout',{method:'POST',headers:{'X-INPOS-Request':'1'}}).finally(()=>{try{const dirty=localStorage.getItem('inpos_sync_dirty')==='1';if(dirty){const raw=localStorage.getItem('myposid_demo_v3');if(raw)localStorage.setItem('inpos_unsynced_backup_'+Date.now(),raw)}localStorage.removeItem('myposid_demo_v3');localStorage.removeItem('inpos_sync_dirty');localStorage.removeItem('inpos_device_login_v633')}catch{}location.replace('/login')});return;}

const emp=activeEmployee();inposV633ForgetDevice();db.settings.employeeLoggedOut=true;save();cart=[];discount=0;selectedCustomerId=null;transactionNote='';accountSystemState.type='employee';accountSystemState.employeeMode='list';accountSystemState.editingEmployeeId=null;accountSystemState.deleteConfirm=false;syncActiveEmployeeUI();renderCart();inposV650ShowLogin();toast(emp?`Logout berhasil: ${emp.name}`:'Anda sudah logout.')
}
function openEmployeeModal(){openAccountSystemPage('employee')}
function openBackupModal(){openAccountSystemPage('backup')}
function openSettings(){openAccountSystemPage('settings')}
function openSimpleModal(title,text){showModal(title,'INPOS',`<div style="line-height:1.7;font-size:11px;color:var(--muted)">${esc(text)}</div>`,[{label:'Tutup',close:true}])}
function showModal(title,sub,body,buttons=[],wide=false){const m=document.getElementById('modalBox');m.className='modal'+(wide?' wide':'');m.innerHTML=`<div class="modal-head"><div><div class="modal-title">${esc(title)}</div><div class="modal-sub">${esc(sub||'')}</div></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div>${buttons.length?`<div class="modal-foot">${buttons.map((b,i)=>`<button ${b.id?`id="${b.id}"`:''} class="btn ${b.primary?'btn-primary':''} ${b.danger?'btn-danger':''}" data-modal-btn="${i}">${esc(b.label)}</button>`).join('')}</div>`:''}`;document.getElementById('overlay').classList.add('show');document.body.style.overflow='hidden';buttons.forEach((b,i)=>m.querySelector(`[data-modal-btn="${i}"]`)?.addEventListener('click',()=>{if(b.close)closeModal();else if(b.fn)b.fn()}))}
function closeModal(){stopStockCameraScanner();const overlay=document.getElementById('overlay');overlay.classList.remove('show','shift-open-overlay-v540','share-sheet-overlay','product-variant-overlay','notification-popup-overlay','cart-actions-overlay','stock-opname-confirm-overlay','payment-overlay','success-tx-overlay','expense-filter-overlay','expense-detail-overlay','expense-report-overlay','purchase-relation-period-overlay','purchase-report-overlay','expense-add-overlay','bundle-picker-overlay','customer-overlay','customer-picker-overlay','customer-tools-overlay','customer-debt-entry-overlay','supplier-filter-overlay','finance-edit-overlay-v330');document.getElementById('modalBox')?.classList.remove('share-menu-modal','product-variant-modal','notification-popup-modal','cart-actions-modal','stock-opname-confirm-modal','payment-modal','success-tx-modal','expense-filter-modal','expense-detail-modal','expense-report-modal','purchase-relation-period-modal','purchase-report-modal','expense-add-modal','bundle-picker-modal','report-clean-modal','customer-modal','customer-picker-modal','customer-tools-modal','customer-filter-modal','customer-status-modal','customer-debt-entry-modal');document.body.style.overflow=''}function overlayClose(e){if(e.target.id==='overlay')closeModal()}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
window.addEventListener('DOMContentLoaded',()=>{applyPWAStoreIdentity();syncPWAMenuStatus();syncPWARegistration();scheduleAutomaticPWAInstallV739(5500);});
function renderAll(options={}){
const opts=(options&&typeof options==='object')?options:{};
const activeScreen=String(document.body?.dataset?.mobileScreen||document.querySelector('.screen.active')?.id?.replace(/^screen-/,'')||'dashboard');
applyPointExpirations(true);
syncActiveEmployeeUI();
syncSmartNotifications();
if(activeScreen==='more')ensureSalesFeatureMenu();
switch(activeScreen){
case'dashboard':renderDashboard();applyDashboardView();break;
case'cashier':renderProducts();renderCart();break;
case'sales':renderSales();break;
case'debts':renderDebts();break;
case'stock':renderStock();break;
case'purchases':renderPurchases();break;
case'expenses':renderExpenses();break;
case'shift':renderShift();break;
case'customers':renderCustomers();break;
case'suppliers':renderSuppliers();break;
case'reports':renderReports();break;
case'productpicker':renderMobileProductPicker();break;
case'production':renderProductionSettings();break;
case'market-online':renderMarketOnlineSettings();break;
case'coupon-promo':renderCouponPromoV569();break;
case'market-orders':renderMarketOrdersPage();break;
case'market-preview':renderMarketPreview();break;
case'categories':if(!opts.navigation)renderCategoryPage();break;
case'sale-detail':if(!opts.navigation)renderSaleDetailPage();break;
case'stock-opname':if(!opts.navigation)renderStockOpnamePage();break;
case'printer':if(!opts.navigation)renderPrinterPage();break;
case'payments':if(!opts.navigation)renderPaymentSettings();break;
case'sales-settings':if(!opts.navigation)renderSalesSettingsPage();break;
case'labels':if(!opts.navigation)renderLabelPage();break;
case'points-settings':if(!opts.navigation)renderPointsSettings();break;
case'ppn-settings':if(!opts.navigation)renderPPNSettings();break;
case'report-general':if(!opts.navigation)renderGeneralReportPage();break;
case'report-cashflow':if(!opts.navigation)renderCashFlowReport();break;
case'report-finance':if(!opts.navigation)renderFinanceReportPage();break;
case'report-detail':if(!opts.navigation)renderReportDetailPage();break;
case'account-system':if(!opts.navigation)renderAccountSystemPage();break;
case'purchase-form':if(!opts.navigation)renderPurchaseFormPage();break;
case'purchase-detail':if(!opts.navigation)renderPurchaseDetailPage();break;
}
if(activeScreen==='more'||activeScreen==='sales-settings'){
renderCashierSoundSetting();
renderCommerceFeatureToggles();
renderServiceProductSetting();
renderOptionalFeatureSettings();
syncPWAMenuStatus();
}
if(activeScreen==='notification-settings'||activeScreen==='more')renderNotificationSettings();
const activeSalesFeature=['discount-settings','wholesale-settings','mass-price-settings','bundle-settings'].find(x=>document.getElementById('screen-'+x)?.classList.contains('active'));
if(activeSalesFeature){try{renderSalesFeatureScreen(activeSalesFeature)}catch(err){console.error('Sales feature render error:',err)}}
updateNotificationBadge();
syncDashboardMenuVisibility();
}
let inposMainResizeFrameV429=0;
let inposMainWasMobileV429=window.innerWidth<=1024;
window.addEventListener('resize',()=>{
if(inposMainResizeFrameV429)return;
inposMainResizeFrameV429=requestAnimationFrame(()=>{
inposMainResizeFrameV429=0;
const mobile=window.innerWidth<=1024;
const active=String(document.body?.dataset?.mobileScreen||'dashboard');
if(!mobile){document.getElementById('cartPanel')?.classList.remove('show');const fab=document.getElementById('mobileCartFab');if(fab)fab.style.display='none'}
else if(active==='cashier')renderCart();
if(mobile!==inposMainWasMobileV429||active==='dashboard'||active==='more')syncDashboardMenuVisibility();
if(active==='dashboard')renderMobileHuffaadzHome();
inposMainWasMobileV429=mobile;
});
},{passive:true});
let hardwareBarcodeBuffer='',hardwareBarcodeStartedAt=0,hardwareBarcodeLastAt=0,hardwareBarcodeResetTimer=null;
function resetHardwareBarcodeBuffer(){
hardwareBarcodeBuffer='';hardwareBarcodeStartedAt=0;hardwareBarcodeLastAt=0;
if(hardwareBarcodeResetTimer){clearTimeout(hardwareBarcodeResetTimer);hardwareBarcodeResetTimer=null}
}
function currentHardwareBarcodeScreen(){
return document.body.dataset.mobileScreen||document.querySelector('.screen.active')?.id?.replace(/^screen-/,'')||''
}
function hardwareBarcodeTargetAllowed(target){
if(!target)return true;
const tag=String(target.tagName||'').toLowerCase();
if(target.isContentEditable)return false;
if(!['input','textarea','select'].includes(tag))return true;
return['productSearch','stockSearch','stockMobileSearch'].includes(target.id)
}
function isLikelyHardwareBarcode(code,duration){
const value=String(code||'').trim();
if(value.length<5)return false;
const avg=duration/Math.max(1,value.length);
return avg<=85
}
function clearSaleSearchAfterHardwareScan(){
const input=document.getElementById('productSearch');
if(input){input.value='';renderProducts()}
}
function showHardwareStockBarcode(code){
const found=findProductByBarcode(code);
const desktop=document.getElementById('stockSearch'),mobile=document.getElementById('stockMobileSearch');
const cat=document.getElementById('stockCategoryFilter'),stock=document.getElementById('stockFilter'),expiry=document.getElementById('stockExpiryFilter');
if(cat)cat.value='';if(stock)stock.value='';if(expiry)expiry.value='';
if(desktop)desktop.value=code;if(mobile)mobile.value=code;
renderStock();
if(found){
toast(`Barcode ditemukan • ${found.name}`);
return
}
setTimeout(()=>openNewProductFromScannedBarcode(code),60)
}
function processHardwareBarcode(code){
const value=String(code||'').trim();
if(!value)return;
const screen=currentHardwareBarcodeScreen();
if(screen==='cashier'){
clearSaleSearchAfterHardwareScan();
const found=findProductByBarcode(value);
if(!found){showSaleBarcodeProductUnavailable(value);return}
addToCart(found.id);
if(!productVariantsActive(found)&&!found.manualPrice)toast(`${found.name} ditambahkan dari scanner barcode.`);
return
}
if(screen==='stock'){
showHardwareStockBarcode(value);
}
}
function handleHardwareBarcodeKeydown(e){
const screen=currentHardwareBarcodeScreen();
if(!['cashier','stock'].includes(screen))return;
if(document.getElementById('overlay')?.classList.contains('show'))return;
if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
if(!hardwareBarcodeTargetAllowed(e.target))return;
const now=performance.now();
if((e.key==='Enter'||e.key==='Tab')&&hardwareBarcodeBuffer){
const code=hardwareBarcodeBuffer;
const duration=Math.max(1,now-hardwareBarcodeStartedAt);
const valid=isLikelyHardwareBarcode(code,duration);
resetHardwareBarcodeBuffer();
if(valid){
e.preventDefault();
e.stopPropagation();
processHardwareBarcode(code);
}
return
}
if(e.key.length!==1||!/[0-9A-Za-z._\-\/]/.test(e.key))return;
if(hardwareBarcodeLastAt&&now-hardwareBarcodeLastAt>180)resetHardwareBarcodeBuffer();
if(!hardwareBarcodeBuffer)hardwareBarcodeStartedAt=now;
hardwareBarcodeBuffer+=e.key;
hardwareBarcodeLastAt=now;
if(hardwareBarcodeResetTimer)clearTimeout(hardwareBarcodeResetTimer);
hardwareBarcodeResetTimer=setTimeout(resetHardwareBarcodeBuffer,240);
}
window.addEventListener('keydown',handleHardwareBarcodeKeydown,true);
function customerRelationFilterConfig(kind){
const configs={
customer:{statusId:'customerDebtFilter',searchId:'customerMobileSearch',panelId:'customerMobileSearchPanel',valueId:'customerMobileStatusValue',countId:'customerMobileFilterCount',sortKey:'customerMobileSort',defaultSort:'name-asc',title:'Filter Pelanggan',subtitle:'Atur status dan urutan daftar pelanggan.',pickerTitle:'Status Pelanggan',pickerSub:'Pilih status pelanggan yang ingin ditampilkan.',statuses:[['all','Semua'],['debt','Ada Piutang'],['clear','Tanpa Piutang']],sorts:[['name-asc','Nama A–Z'],['name-desc','Nama Z–A'],['spent-desc','Belanja Terbesar'],['points-desc','Poin Terbesar']]},
debt:{statusId:'debtBookStatusFilter',searchId:'customerDebtMobileSearch',panelId:'customerDebtMobileSearchPanel',valueId:'customerDebtMobileStatusValue',countId:'customerDebtMobileFilterCount',sortKey:'customerDebtMobileSort',defaultSort:'amount-desc',title:'Filter Piutang Pelanggan',subtitle:'Atur status dan urutan piutang pelanggan.',pickerTitle:'Status Piutang',pickerSub:'Pilih status piutang yang ingin ditampilkan.',statuses:[['all','Semua'],['overdue','Terlambat'],['running','Berjalan'],['installment','Dicicil']],sorts:[['amount-desc','Piutang Terbesar'],['name-asc','Nama A–Z'],['name-desc','Nama Z–A'],['due-asc','Jatuh Tempo Terdekat']]}
};return configs[kind]||configs.customer
}
function renderCustomerRelationKind(kind){if(kind==='debt')renderDebts();else renderCustomers()}
function syncCustomerRelationMobileFilterUI(kind){const c=customerRelationFilterConfig(kind),status=document.getElementById(c.statusId)?.value||'all',sort=window[c.sortKey]||c.defaultSort,label=(c.statuses.find(x=>x[0]===status)||c.statuses[0])[1];const value=document.getElementById(c.valueId);if(value)value.textContent=label;const n=(status!=='all'?1:0)+(sort!==c.defaultSort?1:0),count=document.getElementById(c.countId);if(count){count.textContent=String(n);count.hidden=!n}}
function toggleCustomerRelationSearch(kind,force){const c=customerRelationFilterConfig(kind),panel=document.getElementById(c.panelId);if(!panel)return;const open=force===undefined?!panel.classList.contains('open'):!!force;panel.classList.toggle('open',open);if(open)setTimeout(()=>document.getElementById(c.searchId)?.focus(),40)}
function setCustomerRelationStatus(kind,value){const c=customerRelationFilterConfig(kind);if(kind==='debt')syncDebtBookStatusFilter(false);const el=document.getElementById(c.statusId);if(el)el.value=value;renderCustomerRelationKind(kind)}
function markCustomerRelationModal(mode){const modal=document.getElementById('modalBox'),overlay=document.getElementById('overlay');modal?.classList.add('customer-tools-modal',mode==='status'?'customer-status-modal':'customer-filter-modal');overlay?.classList.add('customer-tools-overlay')}
function openCustomerRelationStatusPicker(kind){const c=customerRelationFilterConfig(kind);if(kind==='debt')syncDebtBookStatusFilter(false);const active=document.getElementById(c.statusId)?.value||'all',rows=c.statuses.map(([v,l])=>`<button class="stock-mobile-action${v===active?' active':''}" type="button" onclick="closeModal();setCustomerRelationStatus('${kind}','${v}')"><span class="ico">${v===active?'✓':'▣'}</span><span>${esc(l)}</span></button>`).join('');showModal(c.pickerTitle,c.pickerSub,`<div class="stock-mobile-action-list">${rows}</div>`,[{label:'Tutup',close:true}],true);markCustomerRelationModal('status')}
function openCustomerRelationFilters(kind){const c=customerRelationFilterConfig(kind);if(kind==='debt')syncDebtBookStatusFilter(false);const status=document.getElementById(c.statusId)?.value||'all',sort=window[c.sortKey]||c.defaultSort,statusOpts=c.statuses.map(([v,l])=>`<option value="${v}" ${v===status?'selected':''}>${esc(l)}</option>`).join(''),sortOpts=c.sorts.map(([v,l])=>`<option value="${v}" ${v===sort?'selected':''}>${esc(l)}</option>`).join('');showModal(c.title,c.subtitle,`<div class="form-grid"><div class="field full"><label>Status</label><select id="customerRelationFilterStatus">${statusOpts}</select></div><div class="field full"><label>Urutan</label><select id="customerRelationFilterSort">${sortOpts}</select></div></div>`,[{label:'Reset',fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value='all';window[c.sortKey]=c.defaultSort;renderCustomerRelationKind(kind);closeModal()}},{label:'Batal',close:true},{label:'Terapkan',primary:true,fn:()=>{const el=document.getElementById(c.statusId);if(el)el.value=document.getElementById('customerRelationFilterStatus')?.value||'all';window[c.sortKey]=document.getElementById('customerRelationFilterSort')?.value||c.defaultSort;renderCustomerRelationKind(kind);closeModal()}}]);markCustomerRelationModal('filter');setTimeout(()=>document.getElementById('customerRelationFilterStatus')?.focus(),60)}
function syncDebtBookContextUI(){const supplier=debtBookTab==='supplier',title=supplier?'Hutang Supplier':'Piutang Pelanggan',sub=supplier?'Tagihan pembelian supplier yang belum lunas':'Tagihan pelanggan yang belum lunas';const h=document.getElementById('debtBookTitle'),p=document.getElementById('debtBookSubtitle'),purchaseNav=document.getElementById('debtSupplierModuleSubnav'),customerNav=document.getElementById('debtCustomerModuleSubnav'),screen=document.getElementById('screen-debts'),action=document.getElementById('debtBookAction'),head=screen?.querySelector('.debt-book-head');if(h)h.textContent=title;if(p)p.textContent=sub;if(purchaseNav){purchaseNav.classList.toggle('hidden',!supplier);purchaseNav.hidden=!supplier}if(customerNav){customerNav.classList.toggle('hidden',supplier);customerNav.hidden=supplier}if(action){action.hidden=true;action.classList.add('hidden')}if(head){head.hidden=true;head.classList.add('hidden')}screen?.classList.toggle('purchase-aligned-debt',supplier);screen?.classList.toggle('customer-aligned-debt',!supplier);pageMeta.debts=[title,sub];if(screen?.classList.contains('active')){const t=document.getElementById('pageTitle'),ss=document.getElementById('pageSub');if(t)t.textContent=title;if(ss)ss.textContent=sub}}
function renderCustomers(){const mobileMode=true,q=String((mobileMode?document.getElementById('customerMobileSearch')?.value:document.getElementById('customerSearch')?.value)||'').trim().toLowerCase(),status=String(document.getElementById('customerDebtFilter')?.value||'all'),sort=window.customerMobileSort||'name-asc';let rows=[...(db.customers||[])].filter(c=>{const debt=Math.max(0,Number(c.debt)||0);if(q&&!`${c.name||''} ${c.phone||''}`.toLowerCase().includes(q))return false;if(status==='debt'&&debt<=0)return false;if(status==='clear'&&debt>0)return false;return true}).sort((a,b)=>{if(sort==='name-desc')return String(b.name||'').localeCompare(String(a.name||''),'id');if(sort==='spent-desc')return Number(b.spent||0)-Number(a.spent||0);if(sort==='points-desc')return Number(b.points||0)-Number(a.points||0);return String(a.name||'').localeCompare(String(b.name||''),'id')});syncCustomerRelationMobileFilterUI('customer');const count=document.getElementById('customerHistoryCount'),debtEl=document.getElementById('customerHistoryDebt'),list=document.getElementById('customerRelationList');if(count)count.textContent=`${rows.length} pelanggan`;if(debtEl)debtEl.textContent=rupiah(sum(rows,c=>Math.max(0,Number(c.debt)||0)));if(list)list.innerHTML=rows.length?rows.map(c=>{const debt=Math.max(0,Number(c.debt)||0),spent=Math.max(0,Number(c.spent)||0),points=Math.max(0,Number(c.points)||0);return`<article class="relation-history-card customer-history-card"><div class="relation-history-icon"><span>◉</span><small>PL</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(c.name)}</div><div class="relation-history-time">${esc(c.phone||'WhatsApp belum diisi')}</div><div class="relation-history-meta"><span class="relation-status ${debt?'debt':'paid'}">${debt?'Ada Piutang':'Lunas'}</span><span>${points.toLocaleString('id-ID')} poin • ${c.last?fmtDate(c.last):'Belum transaksi'}</span></div></div><div class="relation-history-value"><small>Total Belanja</small><strong>${rupiah(spent)}</strong><span class="relation-history-remain ${debt?'':'paid'}">${debt?'Piutang '+rupiah(debt):'Tanpa piutang'}</span><div class="relation-history-actions"><button type="button" onclick="openCustomerModal(${c.id})">Edit</button><button type="button" onclick="${debt?`openCustomerDebtDetail(${c.id})`:`openCustomerDebtPage()`}">Piutang</button></div></div></article>`}).join(''):`<div class="relation-history-empty"><b>${q||status!=='all'?'Pelanggan tidak ditemukan':'Belum ada pelanggan'}</b><span>${q||status!=='all'?'Ubah pencarian atau filter status.':'Tekan + untuk menambahkan pelanggan.'}</span></div>`}
function renderDebts(){syncDebtBookContextUI();const isSupplier=debtBookTab==='supplier',list=document.getElementById('debtBookList'),count=document.getElementById('debtBookCount'),totalEl=document.getElementById('debtBookTotal'),mobileMode=true,searchSource=isSupplier?(mobileMode?(document.getElementById('supplierDebtMobileSearch')?.value||''):(document.getElementById('debtBookSearch')?.value||'')):(mobileMode?(document.getElementById('customerDebtMobileSearch')?.value||''):(document.getElementById('debtBookSearch')?.value||'')),search=String(searchSource).trim().toLowerCase(),status=syncDebtBookStatusFilter(isSupplier),supplierSort=window.supplierDebtMobileSort||'newest',customerSort=window.customerDebtMobileSort||'amount-desc';document.getElementById('debtTabCustomer')?.classList.toggle('active',!isSupplier);document.getElementById('debtTabSupplier')?.classList.toggle('active',isSupplier);document.getElementById('debtTabCustomer')?.setAttribute('aria-selected',String(!isSupplier));document.getElementById('debtTabSupplier')?.setAttribute('aria-selected',String(isSupplier));const searchEl=document.getElementById('debtBookSearch');if(searchEl)searchEl.placeholder=isSupplier?'Cari supplier / no. pembelian...':'Cari pelanggan / transaksi...';if(!list)return;if(!isSupplier){let rows=(db.customers||[]).filter(c=>Number(c.debt)>0).map(c=>{const last=customerLastBonSale(c.id),payments=customerDebtPayments(c.id),over=!!(c.due&&new Date(c.due)<new Date()),installment=payments.length>0,sales=(db.sales||[]).filter(s=>Number(s.customerId)===Number(c.id)&&s.method==='Bon'&&!s.returned),manual=(db.debtEntries||[]).filter(x=>Number(x.customerId)===Number(c.id)),hay=[c.name,c.phone,...sales.map(x=>x.id),...manual.map(x=>x.note)].join(' ').toLowerCase();return{c,last,payments,over,installment,hay}}).filter(x=>(!search||x.hay.includes(search))&&(status==='all'||(status==='overdue'&&x.over)||(status==='running'&&!x.over&&!x.installment)||(status==='installment'&&x.installment)));rows.sort((a,b)=>{if(customerSort==='name-asc')return String(a.c.name||'').localeCompare(String(b.c.name||''),'id');if(customerSort==='name-desc')return String(b.c.name||'').localeCompare(String(a.c.name||''),'id');if(customerSort==='due-asc'){const ad=a.c.due?new Date(a.c.due).getTime():Number.MAX_SAFE_INTEGER,bd=b.c.due?new Date(b.c.due).getTime():Number.MAX_SAFE_INTEGER;return ad-bd}return Number(b.c.debt||0)-Number(a.c.debt||0)});syncCustomerRelationMobileFilterUI('debt');const total=sum(rows,x=>Number(x.c.debt)||0);if(count)count.textContent=`${rows.length} piutang`;if(totalEl)totalEl.textContent=rupiah(total);list.innerHTML=rows.length?rows.map(({c,last,over,installment})=>`<article class="relation-history-card customer-debt-history-card"><div class="relation-history-icon"><span>◉</span><small>PT</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(c.name)}</div><div class="relation-history-time customer-debt-date-v565">${last?fmtDate(last.date):'Tanggal belum tersedia'}</div><div class="relation-history-meta customer-debt-meta-v565"><span class="relation-status debt ${over?'customer-debt-overdue-v565':''}">${over?'Terlambat':installment?'Dicicil':'Berjalan'}</span><span class="customer-debt-due-v565 customer-debt-due-v571"><span class="customer-debt-due-icon-v571" aria-hidden="true">🔰</span><span class="customer-debt-due-text-v571">${c.due?'Jatuh tempo '+fmtDate(c.due):'Tanpa jatuh tempo'}</span></span></div></div><div class="relation-history-value"><small>Sisa Piutang</small><strong>${rupiah(c.debt)}</strong><span class="relation-history-remain">${installment?'Sudah dicicil':'Belum dicicil'}</span><div class="relation-history-actions customer-debt-actions"><button type="button" onclick="payDebt(${c.id})">Cicil</button><button type="button" onclick="openCustomerDebtDetail(${c.id})">Detail</button><button class="customer-debt-wa" type="button" aria-label="Kirim tagihan ke WhatsApp ${esc(c.name)}" title="Kirim Tagihan ke WhatsApp" onclick="waDebt(${c.id})"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L4 20l.9-4a8.4 8.4 0 1 1 15.6-4.3Z"></path><path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .3-.1 1.2-.6 1.7-.5.5-1.3.8-2.1.7-1-.1-2.5-.6-4.2-2.1-1.4-1.3-2.4-2.9-2.7-3.9-.3-.8-.2-1.7.2-2.3l.4-.4Z"></path></svg></button></div></div></article>`).join(''):'<div class="relation-history-empty"><b>Data piutang tidak ditemukan</b><span>Ubah pencarian atau filter status.</span></div>'}else{const supplierPeriodDraft=mobileMode?purchaseRelationPeriodDraft('debt',false):{period:''};let rows=(db.purchases||[]).filter(p=>!purchaseIsDraft(p)).filter(p=>Math.max(0,Number(p.total||0)-Number(p.paid||0))>0).map(p=>{const remaining=Math.max(0,Number(p.total||0)-Number(p.paid||0)),supplier=getSupplier(p.supplierId),installment=Number(p.paid||0)>0,unpaid=Number(p.paid||0)<=0,hay=[p.id,supplier?.name,supplier?.phone].join(' ').toLowerCase();return{p,remaining,supplier,installment,unpaid,hay}}).filter(x=>(!search||x.hay.includes(search))&&(status==='all'||(status==='installment'&&x.installment)||(status==='unpaid'&&x.unpaid))&&(!mobileMode||purchaseRelationDateMatch(x.p.date,supplierPeriodDraft))).sort((a,b)=>supplierSort==='oldest'?new Date(a.p.date)-new Date(b.p.date):supplierSort==='amount-desc'?b.remaining-a.remaining:new Date(b.p.date)-new Date(a.p.date));syncPurchaseRelationMobileFilterUI('debt');const total=sum(rows,x=>x.remaining);if(count)count.textContent=`${rows.length} hutang`;if(totalEl)totalEl.textContent=rupiah(total);list.innerHTML=rows.length?rows.map(({p,remaining,supplier,installment})=>`<article class="relation-history-card supplier-debt-history-card"><div class="relation-history-icon"><span>⇩</span><small>HT</small></div><div class="relation-history-main"><div class="relation-history-id">${esc(p.id)}</div><div class="relation-history-time">${fmtTime(p.date)}</div><div class="relation-history-meta"><span class="relation-status debt">${installment?'Dicicil':'Belum Bayar'}</span><span>${esc(supplier?.name||'Supplier')} • ${Math.max(1,Number(p.items)||1)} item</span></div></div><div class="relation-history-value"><small>Sisa Hutang</small><strong>${rupiah(remaining)}</strong><span class="relation-history-remain">Dibayar ${rupiah(p.paid||0)}</span><div class="relation-history-actions"><button type="button" onclick="paySupplierDebt('${esc(p.id)}')">Cicil</button><button type="button" onclick="openSupplierDebtDetail('${esc(p.id)}')">Detail</button></div></div></article>`).join(''):'<div class="relation-history-empty"><b>Data hutang tidak ditemukan</b><span>Ubah pencarian atau filter status.</span></div>'}}
if(!db.settings.inposV486ThemeInitialized){db.settings.theme='light';db.settings.inposV486ThemeInitialized=true;save()}toggleTheme(db.settings.theme||'light');renderAll();if(db.settings.employeeLoggedOut)inposV650ShowLogin();else inposV649UnmountStandaloneLogin();
