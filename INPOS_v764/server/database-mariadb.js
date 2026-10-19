'use strict';
const crypto=require('node:crypto');
const {addDaysWIB}=require('./calendar');
const {db}=require('./mariadb-sync');
function hashPin(pin){const salt=crypto.randomBytes(16);const out=crypto.scryptSync(String(pin),salt,64);return 'scrypt$'+salt.toString('hex')+'$'+out.toString('hex')}
function checkPin(pin,stored){const parts=String(stored||'').split('$');if(parts.length!==3||parts[0]!=='scrypt')return false;try{const expected=Buffer.from(parts[2],'hex'),actual=crypto.scryptSync(String(pin),Buffer.from(parts[1],'hex'),expected.length);return crypto.timingSafeEqual(expected,actual)}catch{return false}}
function phone(v){let s=String(v||'').replace(/\D/g,'');if(s.startsWith('0'))s='62'+s.slice(1);else if(s.startsWith('8'))s='62'+s;return s}
function slug(v){return String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-+$/g,'').slice(0,40)}
function iso(){return new Date().toISOString()}
function future(days){return addDaysWIB(days)}
function defaultAdmin(){return {version:1,config:{monthly:49000,tax:25000,reminder:7,trialDays:60,merchant:'INPOS • Pembayaran Langganan',confirmationWhatsapp:'',minimumPayout:0,qris:'',subscriptionDiscount:{enabled:false,rules:[]},taxDiscount:{enabled:false,rules:[]}},nextTenant:1,nextPayment:1,nextNote:1,commissionPayouts:[],broadcasts:[],tenants:[],payments:[],notifications:[]}}
function createState(t,ownerUser){return {products:[],customers:[],suppliers:[],purchases:[],expenses:[],sales:[],shifts:[],holds:[],settings:{store:t.name,ownerName:t.owner,onlineStoreName:t.name,address:t.address,storeAddress:t.address,phone:t.phone,email:t.email,cashier:t.owner,activeEmployeeId:ownerUser.id,employeeLoggedOut:false,inposLocalSampleV641:false,marketOnline:{subdomain:t.slug,showOrderButton:true},inposRegistrationV632:{registered:true,mode:'inpos_server_local_v1',referralCode:t.referral,registeredAt:t.created_at}},employees:[{id:ownerUser.id,name:t.owner,username:ownerUser.username,phone:t.phone,role:'owner',pin:'',active:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true}}]}}
const admin=db.prepare('SELECT json FROM admin_state WHERE id=1').get();
if(!admin)db.prepare('INSERT INTO admin_state(id,json,updated_at) VALUES (1,?,?)').run(JSON.stringify(defaultAdmin()),iso());
const initial=process.env.INPOS_ADMIN_PIN;
if(initial&&!db.prepare("SELECT name FROM credentials WHERE name='superinpos'").get()){
 if(!/^\d{6}$/.test(initial))throw Error('INPOS_ADMIN_PIN harus 6 angka.');
 db.prepare('INSERT INTO credentials(name,pin_hash) VALUES (?,?)').run('superinpos',hashPin(initial));
}
module.exports={db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin};
