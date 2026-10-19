'use strict';
// Adapter kompatibilitas API database yang digunakan INPOS lama.
// DB dilakukan async di worker; handler HTTP lama tidak perlu diganti, namun query tetap serial.
const {Worker,MessageChannel,receiveMessageOnPort}=require('node:worker_threads');
const path=require('node:path');
const channel=new MessageChannel(),signal=new Int32Array(new SharedArrayBuffer(4));
const worker=new Worker(path.join(__dirname,'mariadb-worker.js'),{workerData:{port:channel.port2,signal:signal.buffer},transferList:[channel.port2]});
worker.unref();channel.port1.unref();
let stopped=false;
function call(op,sql,params=[]){
 if(stopped)throw Error('Koneksi MariaDB telah ditutup.');
 Atomics.store(signal,0,0);
 if(op!=='ready')channel.port1.postMessage({op,sql,params});
 const state=Atomics.wait(signal,0,0,30000);
 if(state==='timed-out')throw Error('MariaDB tidak merespons dalam 30 detik. Periksa Termux/MariaDB.');
 const incoming=receiveMessageOnPort(channel.port1);
 if(!incoming)throw Error('Respons worker MariaDB tidak diterima.');
 const x=incoming.message;
 if(!x.ok){const e=Error(x.error||'Gagal menjalankan SQL');e.code=x.code;throw e}
 return x.result;
}
call('ready');
const db={
 engine:'mariadb',
 prepare(sql){return {run(...p){return call('run',sql,p)},get(...p){return call('get',sql,p)},all(...p){return call('all',sql,p)}}},
 exec(sql){return call('exec',sql)},
 close(){if(!stopped){try{call('close')}finally{stopped=true;channel.port1.close();worker.terminate()}}}
};
module.exports={db};
