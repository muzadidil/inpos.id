'use strict';
const {UNHANDLED}=require('../http/contract');
const {http,fs,path,crypto,db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin,refsys,todayWIB,addMonthsClamped,ROOT,PORT,HOST,MAX_BODY,COOKIE,ADMIN_COOKIE,ADMIN_IDLE_SECONDS,ADMIN_RENEW_THRESHOLD_MS,mime,response,fail,readBody,sourceAllowed,cookieToken,sessionFrom,cookieHeader,createSession,renewAdminSession,logout,throttle,userFor,hidePins,stateRow,taxQuote,choosePaymentCode,confirmNotification,validateTaxDiscount,taxLicensed,clampTaxLicense,adminRows,adminState,catalog,safeScript,sendHtml,apiAuth,validPin,reconcileEmployees,cleanState}=require('../domain/shared');
async function handle({req,res,p,s,url}){
 if(p==='/api/inpos/subscription/status'&&req.method==='GET'){if(!apiAuth(req,res,s))return;const t=db.prepare('SELECT subscription_end,suspended FROM tenants WHERE id=?').get(s.tenant_id),end=t.subscription_end,today=todayWIB(),active=!t.suspended&&!!end&&end>=today;return response(res,200,{status:t.suspended?'suspended':active?'active':'expired',verified:active,expires_at:end?end+'T23:59:59+07:00':null})}
 if((p==='/api/inpos/subscription/pricing'||p==='/api/inpos/tax/pricing')&&req.method==='GET'){
  if(!apiAuth(req,res,s))return;
  const cfg=adminState().state.config,isTax=p.includes('/tax/');
  const tenant=isTax?null:db.prepare('SELECT * FROM tenants WHERE id=?').get(s.tenant_id);
  const raw=cfg.subscriptionDiscount||{enabled:false,rules:[]};
  // Kelayakan referral ditentukan di server, tidak boleh dipilih oleh browser.
  const eligible=!isTax&&!!tenant&&!!refsys.quote(cfg,tenant,1).referrer;
  return response(res,200,{monthly_price:isTax?cfg.tax:cfg.monthly,max_months:36,pricing_version:'local-v1',qris_image_url:cfg.qris||'',tax_discount:isTax?cfg.taxDiscount||{enabled:false,rules:[]}:undefined,subscription_discount:isTax?undefined:{enabled:raw.enabled===true,eligible,rules:Array.isArray(raw.rules)?raw.rules:[]}});
 }
 if(p==='/api/inpos/public/features/tax/offer'&&req.method==='GET'){
  const config=adminState().state.config,amount=Number(config.tax);
  return response(res,200,{feature:'tax',enabled:Number.isSafeInteger(amount)&&amount>0,currency:'IDR',amount,period:'Bulanan',offerId:'tax-local-v1',verifyEndpoint:'/api/inpos/features/tax/verify',message:'Aktivasi dilakukan setelah Super Admin memverifikasi pembayaran secara manual.'});
 }
 if(p==='/api/inpos/features/tax/verify'&&req.method==='GET'){
  if(!apiAuth(req,res,s))return;
  const t=db.prepare('SELECT tax_end,suspended FROM tenants WHERE id=?').get(s.tenant_id);
  const expiresAt=t.tax_end?t.tax_end+'T23:59:59+07:00':null;
  const active=!t.suspended&&!!expiresAt&&Date.parse(expiresAt)>Date.now();
  return response(res,200,{feature:'tax',active,verified:active,status:t.suspended?'suspended':active?'active':'inactive',expiresAt,entitlementId:active?'TAX-'+s.tenant_id+'-'+t.tax_end:null});
 }

 if(p==='/api/inpos/subscription/checkout'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner yang dapat berlangganan.');
  const body=await readBody(req),months=Number(body.months),cfg=adminState().state.config,unit=Number(cfg.monthly);
  if(!Number.isSafeInteger(months)||months<1||months>36||!Number.isSafeInteger(unit)||unit<=0)return fail(res,400,'Durasi atau tarif tidak valid.');
  if(body.pricing_version!=='local-v1')return fail(res,409,'Harga telah berubah. Muat ulang tagihan.');
  const qris=String(cfg.qris||'');if(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(qris)||qris.length>2200000)return fail(res,409,'QRIS belum diatur Super Admin.');
  const t=db.prepare('SELECT * FROM tenants WHERE id=?').get(s.tenant_id);if(!t||t.suspended)return fail(res,403,'Toko tidak aktif.');
  let invoice,replacedUnconfirmed=false;try{db.exec('BEGIN IMMEDIATE');const r=db.prepare('SELECT json FROM admin_state WHERE id=1').get(),state=JSON.parse(r.json),quote=refsys.quote(state.config,t,months);
   if(quote.amount<=0)throw Object.assign(new Error('Nilai tagihan harus lebih dari nol.'),{status:409});
   invoice=state.payments.find(p=>p.source==='server-sub'&&p.tenantId==='T'+t.code&&p.status==='pending'&&p.months===months);
   // Harga maupun diskon terbaru berlaku untuk tagihan yang belum dikonfirmasi.
   // Tagihan yang sudah dikonfirmasi tidak boleh diubah diam-diam karena mitra mungkin sudah transfer.
   if(invoice&&!invoice.confirmedAt&&(Number(invoice.amount)!==quote.amount||Number(invoice.gross)!==quote.gross||Number(invoice.discountAmount||0)!==quote.discount)){
    invoice.status='rejected';invoice.handledAt=iso();
    invoice.note='Tagihan lama dibatalkan otomatis karena tarif/diskon Langganan berubah sebelum konfirmasi. Jika sudah transfer, hubungi Super Admin; jangan bayar ulang.';
    invoice=null;replacedUnconfirmed=true;
   }
   if(!invoice){const code=choosePaymentCode(state.payments,quote.amount);
    const n=Math.max(Number(state.nextPayment)||1,...state.payments.map(p=>Number(String(p.id||'').slice(1))||0))+1;
    invoice={id:'P'+String(n).padStart(3,'0'),tenantId:'T'+t.code,type:'sub',months,amount:quote.amount,gross:quote.gross,discountAmount:quote.discount,uniqueCode:code,status:'pending',method:'QRIS',source:'server-sub',created:iso(),confirmedAt:'',requestId:'SUB-'+crypto.randomBytes(8).toString('hex')};state.payments.push(invoice);state.nextPayment=n+1;
    db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso());
   }db.exec('COMMIT');
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||500,e.message)}
  const nowQuote=refsys.quote(adminState().state.config,t,months);
  return response(res,200,{reference:invoice.requestId,monthly_price:unit,months,subtotal:invoice.amount,gross:invoice.gross,discount:invoice.discountAmount||0,unique_code:invoice.uniqueCode,amount:invoice.amount+Number(invoice.uniqueCode),already_confirmed:!!invoice.confirmedAt,price_outdated:!!invoice.confirmedAt&&(Number(invoice.amount)!==nowQuote.amount||Number(invoice.gross)!==nowQuote.gross||Number(invoice.discountAmount||0)!==nowQuote.discount),replaced_unconfirmed:replacedUnconfirmed,qris_image_url:qris});
 }
 if(p==='/api/inpos/subscription/confirm'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner dapat mengonfirmasi.');
  const b=await readBody(req),reference=String(b.reference||'');if(!/^SUB-[a-f0-9]{16}$/.test(reference))return fail(res,400,'Referensi tidak valid.');
  const t=db.prepare('SELECT code FROM tenants WHERE id=?').get(s.tenant_id);
  try{db.exec('BEGIN IMMEDIATE');const state=adminState().state,p=state.payments.find(p=>p.source==='server-sub'&&p.requestId===reference&&p.tenantId==='T'+t.code);
   if(!p)throw Object.assign(new Error('Tagihan tidak ditemukan untuk toko ini.'),{status:404});
   if(p.status==='rejected'){db.exec('COMMIT');return fail(res,409,'Tagihan Langganan ini sudah dibatalkan atau ditolak. Jika sudah transfer, hubungi Super Admin sebelum membayar lagi.');}
   if(p.status==='pending'&&!p.confirmedAt){p.confirmedAt=iso();confirmNotification(state,p,'Konfirmasi Pembayaran Langganan');db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(state),iso())}
   db.exec('COMMIT');return response(res,200,{accepted:true,verified:p.status==='approved',status:p.status,notification_sent:true});
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||500,e.message)}
 }
 if(p==='/api/inpos/tax/checkout'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner yang dapat mengajukan aktivasi Pajak.');
  const x=await readBody(req),months=Number(x.months),config=adminState().state.config,unit=Number(config.tax);
  if(!Number.isSafeInteger(months)||months<1||months>36||!Number.isSafeInteger(unit)||unit<=0)return fail(res,400,'Tarif Pajak atau jumlah bulan tidak valid.');
  if(x.pricing_version!=='local-v1')return fail(res,409,'Harga berubah. Buka ulang pembayaran.');
  const qris=String(config.qris||'');
  if(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(qris)||qris.length>2200000)return fail(res,409,'QRIS belum diatur oleh Super Admin. Hubungi pengelola INPOS.');
  const tenant=db.prepare('SELECT id,code,suspended FROM tenants WHERE id=?').get(s.tenant_id);
  if(!tenant||tenant.suspended)return fail(res,403,'Akun usaha tidak aktif.');
  let invoice,replacedUnconfirmed=false;
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT * FROM admin_state WHERE id=1').get(),data=JSON.parse(row.json);
   const quote=taxQuote(data.config,months);if(quote.amount<=0)throw Object.assign(new Error('Nilai pembayaran Pajak harus lebih dari nol.'),{status:409});
   invoice=(data.payments||[]).find(a=>a.source==='server-tax'&&a.tenantId==='T'+tenant.code&&a.status==='pending'&&a.months===months);
   // Do not silently reuse an unpaid invoice issued before Super Admin updated the price/discount.
   // Confirmed invoices are immutable: they may already correspond to a transfer.
   if(invoice&&!invoice.confirmedAt&&(Number(invoice.amount)!==quote.amount||Number(invoice.gross)!==quote.gross||Number(invoice.discountAmount||0)!==quote.discount)){
    invoice.status='rejected';invoice.handledAt=iso();
    invoice.note='Tagihan lama dibatalkan otomatis karena tarif/diskon Pajak berubah sebelum konfirmasi. Jika sudah transfer, hubungi Super Admin; jangan bayar ulang.';
    invoice=null;replacedUnconfirmed=true;
   }
   if(!invoice){const code=choosePaymentCode(data.payments,quote.amount);
    const id='P'+String(Math.max(Number(data.nextPayment)||1,...(data.payments||[]).map(p=>Number(String(p.id||'').slice(1))||0))+1).padStart(3,'0');
    invoice={id,tenantId:'T'+tenant.code,type:'tax',months,amount:quote.amount,gross:quote.gross,discountAmount:quote.discount,uniqueCode:code,status:'pending',method:'QRIS',source:'server-tax',created:iso(),confirmedAt:'',requestId:'TAX-'+crypto.randomBytes(8).toString('hex')};
    data.payments.push(invoice);data.nextPayment=Number(id.slice(1))+1;
    db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(data),iso());
   }
   db.exec('COMMIT');
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,e.status||500,e.message)}
  return response(res,200,{reference:invoice.requestId,monthly_price:unit,months,subtotal:invoice.amount,gross:invoice.gross,discount:invoice.discountAmount||0,unique_code:invoice.uniqueCode,amount:invoice.amount+Number(invoice.uniqueCode),already_confirmed:!!invoice.confirmedAt,price_outdated:!!invoice.confirmedAt&&(Number(invoice.amount)!==taxQuote(adminState().state.config,months).amount||Number(invoice.gross)!==taxQuote(adminState().state.config,months).gross),replaced_unconfirmed:replacedUnconfirmed,qris_image_url:qris});
 }
 if(p==='/api/inpos/tax/confirm'&&req.method==='POST'){
  if(!apiAuth(req,res,s))return;if(s.role!=='owner')return fail(res,403,'Hanya Owner yang dapat mengonfirmasi Pajak.');
  const x=await readBody(req),ref=String(x.reference||'');if(!/^TAX-[a-f0-9]{16}$/.test(ref))return fail(res,400,'Referensi pembayaran tidak valid.');
  const tenant=db.prepare('SELECT code FROM tenants WHERE id=?').get(s.tenant_id);let inv;
  try{db.exec('BEGIN IMMEDIATE');const row=db.prepare('SELECT json FROM admin_state WHERE id=1').get(),data=JSON.parse(row.json);
   inv=data.payments.find(p=>p.source==='server-tax'&&p.requestId===ref&&p.tenantId==='T'+tenant.code);
   if(!inv){db.exec('ROLLBACK');return fail(res,404,'Tagihan tidak ditemukan untuk akun toko ini.');}
   if(inv.status==='rejected'){db.exec('COMMIT');return fail(res,409,'Tagihan Pajak ini sudah dibatalkan atau ditolak. Jika Anda telah transfer, hubungi Super Admin sebelum membuat pembayaran baru.');}
   if(inv.status!=='pending'){db.exec('COMMIT');return response(res,200,{accepted:true,status:inv.status,verified:inv.status==='approved',notification_sent:true})}
   if(!inv.confirmedAt){inv.confirmedAt=iso();confirmNotification(data,inv,'Konfirmasi Pembayaran Pajak');db.prepare('UPDATE admin_state SET json=?,revision=revision+1,updated_at=? WHERE id=1').run(JSON.stringify(data),iso())}
   db.exec('COMMIT');
  }catch(e){try{db.exec('ROLLBACK')}catch{}return fail(res,500,'Gagal menyimpan konfirmasi pembayaran.')}
  return response(res,200,{accepted:true,verified:false,status:'pending',notification_sent:true,notification_id:inv.id});
 }
 if(/^\/api\/inpos\/(?:tax|subscription)\/(?:checkout|confirm)$/.test(p))return fail(res,501,'Pembayaran otomatis belum diaktifkan. Aktivasi membutuhkan verifikasi manual dari Super Admin.');
 if(p.startsWith('/api/'))return fail(res,404,'Endpoint tidak tersedia.');

return UNHANDLED;
}
module.exports={handle};
