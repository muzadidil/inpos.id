'use strict';
const path=require('node:path'),fs=require('node:fs');
// File kredensial wajib berada di luar aset web dan hanya dapat dibaca akun proses Node.js.
function config(){
 const envKeys=['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'];
 const usingEnv=envKeys.some(key=>Object.hasOwn(process.env,key));
 let c;
 if(usingEnv){
  const missing=envKeys.filter(key=>!String(process.env[key]||'').trim());
  if(missing.length)throw Error('Variabel database Hostinger belum lengkap: '+missing.join(', '));
  const tlsFlag=String(process.env.DB_TLS||'').toLowerCase();
  if(tlsFlag&&!['true','false'].includes(tlsFlag))throw Error('DB_TLS hanya boleh true atau false.');
  c={host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,
   database:process.env.DB_NAME,port:process.env.DB_PORT||3306,tls:tlsFlag==='true',
   tlsCaFile:process.env.DB_TLS_CA_FILE||''};
 }else{
  const filename=process.env.INPOS_DB_CONFIG || path.resolve(__dirname,'../data/mariadb-connection.json');
  if(!fs.existsSync(filename))throw Error('Konfigurasi MariaDB belum ada: atur DB_HOST, DB_USER, DB_PASSWORD, DB_NAME di hPanel atau INPOS_DB_CONFIG untuk Termux.');
  const st=fs.statSync(filename);
  if(!st.isFile())throw Error('Konfigurasi MariaDB harus berupa file privat.');
  if(process.platform!=='win32'&&(st.mode&0o077)!==0)throw Error('File MariaDB harus privat (chmod 600).');
  c=JSON.parse(fs.readFileSync(filename,'utf8'));
 }
 if(!c.user||!c.password||!c.database)throw Error('Kredensial MariaDB tidak lengkap.');
 const options={user:c.user,password:c.password,database:c.database,
  charset:'utf8mb4',dateStrings:true,supportBigNumbers:true,bigNumberStrings:false,
  connectTimeout:10000,multipleStatements:false,timezone:'Z'};
 if(typeof c.socketPath==='string'&&c.socketPath.trim()){
  options.socketPath=c.socketPath.trim();
 }else{
  const host=String(c.host||'').trim();const port=c.port===undefined?3306:Number(c.port);
  if(!host||!Number.isInteger(port)||port<1||port>65535)throw Error('MariaDB membutuhkan socketPath atau host/port yang valid.');
  options.host=host;options.port=port;
  const local=['127.0.0.1','localhost','::1','[::1]'].includes(host.toLowerCase());
  if(!local&&c.tls!==true)throw Error('Koneksi MariaDB jarak jauh wajib memakai TLS (tls:true).');
  if(c.tls===true){
   options.ssl={rejectUnauthorized:true,minVersion:'TLSv1.2'};
   if(c.tlsCaFile){
    const ca=path.resolve(String(c.tlsCaFile));
    options.ssl.ca=fs.readFileSync(ca,'utf8');
   }
  }
 }
 return options;
}
module.exports={config};
