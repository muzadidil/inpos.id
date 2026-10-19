'use strict';
// Referral adalah data server. Nilai transaksi, komisi, dan saldo tidak boleh berasal dari browser.
const {db,iso}=require('./database');
const {todayWIB}=require('./calendar');
const reserved=new Set(['admin','login','register','privacy','terms','dashboard','settings','superinpos','inpos']);
if(db.engine!=='mariadb'){
for(const col of [
 ['referral_code',"TEXT NOT NULL DEFAULT ''"],
 ['referral_code_edited','INTEGER NOT NULL DEFAULT 0'],
 ['referral_active','INTEGER NOT NULL DEFAULT 1']
]){
 if(!db.prepare('PRAGMA table_info(tenants)').all().some(x=>x.name===col[0]))db.exec(`ALTER TABLE tenants ADD COLUMN ${col[0]} ${col[1]}`);
}
db.exec(`CREATE TABLE IF NOT EXISTS referral_withdrawals (
 id INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id INTEGER NOT NULL,
 amount INTEGER NOT NULL CHECK(amount>0),bank TEXT NOT NULL,account_number TEXT NOT NULL,account_name TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','rejected')),
 note TEXT DEFAULT '', created_at TEXT NOT NULL,handled_at TEXT DEFAULT '',
 FOREIGN KEY(tenant_id) REFERENCES tenants(id));
 CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_tenant ON referral_withdrawals(tenant_id,status);
`);
}
const legacy=t=>'INP'+String(t.code).padStart(3,'0');
const current=t=>String(t.referral_code||legacy(t)).trim().toUpperCase();
function resolve(code,{active=true}={}){
 const needle=String(code||'').trim().toUpperCase();if(!needle)return null;
 return db.prepare('SELECT * FROM tenants').all().find(t=>(!active||(t.referral_active&& !t.suspended))&&(needle===current(t)||needle===legacy(t)))||null;
}
function validCode(code){return /^[A-Z0-9]{7,11}$/.test(code)&&!reserved.has(code.toLowerCase())&&!/^INP\d{3,16}$/.test(code)}
function publicCodes(){return db.prepare('SELECT * FROM tenants WHERE suspended=0 AND referral_active=1').all().flatMap(t=>[...new Set([legacy(t),current(t)])].map(code=>({code})));}
function config(cfg){const c=cfg?.referralCommission||{};let v=Number(c.value);if(!Number.isFinite(v)||v<0)v=0;return {enabled:c.enabled===true,mode:c.mode==='fixed'?'fixed':'percent',value:v,minimumPayout:Math.max(0,Math.floor(Number(cfg?.minimumPayout)||0))};}
function quote(cfg,t,months){const gross=Math.max(0,Math.floor(Number(cfg.monthly)||0))*months;
 const d=cfg.subscriptionDiscount||{},referrer=resolve(t.referral,{active:false});
 const rule=referrer&&referrer.id!==t.id&&d.enabled===true&&Array.isArray(d.rules)?d.rules.find(r=>Number(r.months)===months):null;
 let cut=0;if(rule&&['fixed','percent'].includes(rule.mode)){
  const v=Number(rule.value);
  if(Number.isFinite(v)&&v>=0)cut=Math.min(gross,Math.round(rule.mode==='percent'?gross*Math.min(v,100)/100:v));
 }
 return {gross,discount:cut,amount:gross-cut,rule:cut?{months,mode:rule.mode,value:Number(rule.value),amount:cut}:null,referrer:referrer?.id!==t.id?referrer:null};
}
function commissionFor(payment,t,cfg){const c=config(cfg);if(!c.enabled||payment.type!=='sub'||!payment.amount)return null;
 const ref=resolve(t.referral,{active:false});if(!ref||ref.id===t.id)return null;
 const amount=Math.min(payment.amount,Math.floor(c.mode==='percent'?Math.round(payment.amount*Math.min(c.value,100)/100):c.value));
 return amount>0?{referralCode:current(ref),referrerId:ref.id,mode:c.mode,value:c.value,amount}:null;
}
function earnings(tid,adminState){const code=db.prepare('SELECT code FROM tenants WHERE id=?').get(tid)?.code;
 const out=[];for(const p of adminState.payments||[]){
  if(p.status!=='approved'||p.type!=='sub'||!(Number(p.referralCommission?.amount)>0))continue;
  if(Number(p.referralCommission.referrerId)===tid||(!p.referralCommission.referrerId&&resolve(p.referralCommission.referralCode,{active:false})?.id===tid)){
   out.push({id:p.id,tenantId:p.tenantId,amount:Number(p.referralCommission.amount),date:p.handledAt||p.created});
  }
 }
 return out;
}
function summary(tid,state){const earned=earnings(tid,state).reduce((a,p)=>a+p.amount,0);
 const paidNew=Number(db.prepare("SELECT COALESCE(SUM(amount),0) n FROM referral_withdrawals WHERE tenant_id=? AND status='paid'").get(tid).n)||0;
 const code=db.prepare('SELECT code FROM tenants WHERE id=?').get(tid)?.code;
 const paidOld=(state.commissionPayouts||[]).filter(p=>p.tenantId==='T'+code&&!p.requestId).reduce((sum,p)=>sum+Math.max(0,Number(p.amount)||0),0);
 const paid=paidNew+paidOld;
 const pending=Number(db.prepare("SELECT COALESCE(SUM(amount),0) n FROM referral_withdrawals WHERE tenant_id=? AND status='pending'").get(tid).n)||0;
 return {earned,paid,pending,available:Math.max(0,earned-paid-pending)};
}
function memberList(tid,state){const tenants=db.prepare('SELECT * FROM tenants').all(),member=tenants.find(t=>t.id===tid);if(!member)return [];
 return tenants.filter(t=>t.id!==tid&&!!t.referral&&resolve(t.referral,{active:false})?.id===tid).map(t=>({id:t.id,name:t.name,joinedAt:t.created_at,status:t.suspended||t.subscription_end<todayWIB()?'inactive':'active',reward:(state.payments||[]).filter(p=>p.tenantId==='T'+t.code&&p.status==='approved'&&Number(p.referralCommission?.referrerId)===tid).reduce((a,p)=>a+Number(p.referralCommission.amount||0),0)}));
}
function history(tid){return db.prepare('SELECT id,amount,bank,account_number accountNumber,account_name accountName,status,created_at createdAt,handled_at handledAt,note FROM referral_withdrawals WHERE tenant_id=? ORDER BY id DESC').all(tid);}
module.exports={db,current,legacy,resolve,validCode,publicCodes,config,quote,commissionFor,summary,memberList,history,earnings,iso};
