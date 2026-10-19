'use strict';
const mysql=require('mysql2/promise'),{config}=require('./mariadb-config');
(async()=>{const conn=await mysql.createConnection(config());try{
const [rows]=await conn.query('SELECT DATABASE() AS db,VERSION() AS version');
const [data]=await conn.query('SELECT (SELECT COUNT(*) FROM tenants) AS tenants,(SELECT COUNT(*) FROM states) AS states,(SELECT COUNT(*) FROM credentials) AS credentials');
console.log(JSON.stringify({connected:true,...rows[0],...data[0]},null,2));}finally{await conn.end()}})().catch(e=>{console.error('MariaDB tidak dapat diakses:',e.message);process.exitCode=1});
