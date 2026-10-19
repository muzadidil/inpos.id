'use strict';
const fs=require('node:fs'),path=require('node:path');
const engine=process.env.INPOS_DB_ENGINE;
const configFile=process.env.INPOS_DB_CONFIG||path.resolve(__dirname,'../data/mariadb-connection.json');
const hasEnvDb=['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'].some(k=>Object.hasOwn(process.env,k));
const useMaria=engine==='mariadb'||(!engine&&(hasEnvDb||fs.existsSync(configFile)));
// Production must never silently start with a local SQLite database when MariaDB credentials are missing.
if(process.env.NODE_ENV==='production'&&!useMaria)throw Error('MODE PRODUKSI DIBLOKIR: MariaDB wajib. Set INPOS_DB_ENGINE=mariadb dan DB_* hPanel atau INPOS_DB_CONFIG.');
module.exports=useMaria?require('./database-mariadb'):require('./database-sqlite');
