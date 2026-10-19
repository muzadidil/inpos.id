'use strict';
// Worker DB asynchronous dipanggil melalui MessageChannel dari kompatibilitas API SQLite sinkron.
// Semua transaksi memakai SATU koneksi MariaDB sehingga BEGIN/COMMIT tidak berpindah koneksi.
const {workerData, parentPort}=require('node:worker_threads');
const {config}=require('./mariadb-config');
const {schema}=require('./mariadb-schema');
const mysql=require('mysql2/promise');
const port=workerData.port,signal=new Int32Array(workerData.signal);
let conn,started=false,queue=Promise.resolve();
function send(v){port.postMessage(v);Atomics.store(signal,0,1);Atomics.notify(signal,0,1)}
function normalize(sql){return String(sql).replace(/CAST\(code AS INTEGER\)/gi,'CAST(code AS SIGNED)').replace(/ORDER BY rowid\b/gi,'ORDER BY id')}
async function run(op,sql,params=[]){
 if(op==='exec'){
  const command=String(sql).trim().toUpperCase().replace(/;$/,'');
  if(command==='BEGIN IMMEDIATE'||command==='BEGIN'){await conn.beginTransaction();return {}};
  if(command==='COMMIT'){await conn.commit();return {}};
  if(command==='ROLLBACK'){await conn.rollback();return {}};
  throw Error('Perintah exec MariaDB tidak dikenal: '+command);
 }
 if(op==='close'){await conn.end();return {closed:true}}
 if(sql==='PRAGMA table_info(tenants)'){
  const [rows]=await conn.execute('SELECT COLUMN_NAME name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?',['tenants']);
  return rows;
 }
 const [rows]=await conn.execute(normalize(sql),params);
 if(op==='all')return rows;
 if(op==='get')return rows[0];
 if(op==='run')return {changes:rows.affectedRows||0,lastInsertRowid:Number(rows.insertId||0)};
 throw Error('Operasi database tidak dikenal: '+op);
}
(async()=>{
 try{
  conn=await mysql.createConnection(config());
  await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED');
  for(const statement of schema)await conn.query(statement);
  // Existing v745 MariaDB uses VARCHAR(3), widen automatically without erasing data.
  const [cols]=await conn.execute("SELECT CHARACTER_MAXIMUM_LENGTH n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tenants' AND COLUMN_NAME='code'");
  if(Number(cols[0]?.n||0)<16)await conn.query('ALTER TABLE tenants MODIFY COLUMN code VARCHAR(16) NOT NULL');
  started=true;send({ok:true,ready:true});
 }catch(e){send({ok:false,error:'MariaDB gagal memulai: '+e.message});return}
 port.on('message',m=>{queue=queue.then(async()=>{
  try{const result=await run(m.op,m.sql,m.params);send({ok:true,result});if(m.op==='close'){port.close();parentPort.close()}}
  catch(e){send({ok:false,error:e.message,code:e.code||''})}
 }).catch(e=>send({ok:false,error:e.message}))});
})().catch(e=>send({ok:false,error:e.message}));
