'use strict';
const http=require('node:http');
const {dispatch}=require('../src/http/dispatcher');
const {db,PORT,HOST}=require('../src/domain/shared');
let server,adapter='node:http';
try{
 const express=require('express');
 const app=express();
 app.disable('x-powered-by');
 // Raw JSON streams intentionally reach existing verified API parsing/limits.
 // This avoids changing request parsing, authentication or tenant isolation.
 app.use((req,res)=>{void dispatch(req,res)});
 server=http.createServer(app);
 adapter='express';
}catch(e){
 if(e.code!=='MODULE_NOT_FOUND'||!String(e.message).includes("'express'"))throw e;
 server=http.createServer((req,res)=>{void dispatch(req,res)});
}
if(require.main===module){
 server.listen(PORT,HOST,()=>{
  console.log(`INPOS modular (${adapter}) http://${HOST}:${PORT}`);
  if(!db.prepare('SELECT 1 FROM credentials WHERE name=?').get('superinpos'))console.log('ATUR INPOS_ADMIN_PIN untuk mengaktifkan Super Admin');
 });
}
module.exports={server,db,adapter};
