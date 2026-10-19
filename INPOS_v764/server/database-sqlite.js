'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {addDaysWIB}=require('./calendar');
const {DatabaseSync}=require('node:sqlite');
const dir=process.env.INPOS_DATA_DIR||path.resolve(__dirname,'../data');fs.mkdirSync(dir,{recursive:true,mode:0o700});
const db=new DatabaseSync(path.join(dir,'inpos.sqlite'));db.exec('PRAGMA foreign_keys=ON;PRAGMA journal_mode=WAL;PRAGMA busy_timeout=5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS tenants(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE NOT NULL,slug TEXT UNIQUE NOT NULL,name TEXT NOT NULL,owner TEXT NOT NULL,phone TEXT NOT NULL,email TEXT NOT NULL,address TEXT DEFAULT '',referral TEXT DEFAULT '',suspended INTEGER NOT NULL DEFAULT 0,subscription_end TEXT DEFAULT '',tax_end TEXT DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id TEXT NOT NULL,tenant_id INTEGER NOT NULL,username TEXT NOT NULL COLLATE NOCASE UNIQUE,phone TEXT UNIQUE,display_name TEXT NOT NULL,role TEXT NOT NULL,pin_hash TEXT NOT NULL,active INTEGER DEFAULT 1,permissions TEXT DEFAULT '{}',PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id) REFERENCES tenants(id));
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,tenant_id INTEGER,role TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS states(tenant_id INTEGER PRIMARY KEY,revision INTEGER NOT NULL DEFAULT 1,json TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(tenant_id) REFERENCES tenants(id));
CREATE TABLE IF NOT EXISTS admin_state(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL DEFAULT 1,json TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS credentials(name TEXT PRIMARY KEY,pin_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pin_requests(id INTEGER PRIMARY KEY AUTOINCREMENT,tenant_id INTEGER NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,updated_at TEXT,FOREIGN KEY(tenant_id) REFERENCES tenants(id));
CREATE TABLE IF NOT EXISTS broadcast_reads(tenant_id INTEGER NOT NULL,user_id TEXT NOT NULL,broadcast_id TEXT NOT NULL,read_at TEXT NOT NULL,PRIMARY KEY(tenant_id,user_id,broadcast_id),FOREIGN KEY(tenant_id) REFERENCES tenants(id));
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`);
function hashPin(pin){const salt=crypto.randomBytes(16);const out=crypto.scryptSync(String(pin),salt,64);return 'scrypt$'+salt.toString('hex')+'$'+out.toString('hex')}
function checkPin(pin,stored){const parts=String(stored||'').split('$');if(parts.length!==3||parts[0]!=='scrypt')return false;try{const expected=Buffer.from(parts[2],'hex'),actual=crypto.scryptSync(String(pin),Buffer.from(parts[1],'hex'),expected.length);return crypto.timingSafeEqual(expected,actual)}catch{return false}}
function phone(v){let s=String(v||'').replace(/\D/g,'');if(s.startsWith('0'))s='62'+s.slice(1);else if(s.startsWith('8'))s='62'+s;return s}
function slug(v){return String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-+$/g,'').slice(0,40)}
function iso(){return new Date().toISOString()}
function future(days){return addDaysWIB(days)}
function defaultAdmin(){return {version:1,config:{monthly:49000,tax:25000,reminder:7,trialDays:60,merchant:'INPOS • Pembayaran Langganan',confirmationWhatsapp:'',minimumPayout:0,qris:'',subscriptionDiscount:{enabled:false,rules:[]},taxDiscount:{enabled:false,rules:[]}},nextTenant:1,nextPayment:1,nextNote:1,commissionPayouts:[],broadcasts:[],tenants:[],payments:[],notifications:[]}}
function createState(t,ownerUser){return {products:[],customers:[],suppliers:[],purchases:[],expenses:[],sales:[],shifts:[],holds:[],settings:{store:t.name,ownerName:t.owner,onlineStoreName:t.name,address:t.address,storeAddress:t.address,phone:t.phone,email:t.email,cashier:t.owner,activeEmployeeId:ownerUser.id,employeeLoggedOut:false,inposLocalSampleV641:false,marketOnline:{subdomain:t.slug,showOrderButton:true},inposRegistrationV632:{registered:true,mode:'inpos_server_local_v1',referralCode:t.referral,registeredAt:t.created_at}},employees:[{id:ownerUser.id,name:t.owner,username:ownerUser.username,phone:t.phone,role:'owner',pin:'',active:true,permissions:{cashier:true,sales:true,stock:true,purchases:true,expenses:true,customers:true,reports:true,settings:true}}]}}
const admins=db.prepare('SELECT json FROM admin_state WHERE id=1').get();if(!admins)db.prepare('INSERT INTO admin_state(id,json,updated_at) VALUES (1,?,?)').run(JSON.stringify(defaultAdmin()),iso());
const initial=process.env.INPOS_ADMIN_PIN;
if(!db.prepare("SELECT name FROM credentials WHERE name='superinpos'").get()&&initial){if(!/^\d{6}$/.test(initial))throw Error('INPOS_ADMIN_PIN harus 6 angka.');db.prepare('INSERT INTO credentials(name,pin_hash) VALUES (?,?)').run('superinpos',hashPin(initial));}
module.exports={db,hashPin,checkPin,phone,slug,iso,future,createState,defaultAdmin};
