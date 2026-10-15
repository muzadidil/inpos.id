// Jalankan: node test-domains.mjs (dari komputer dengan internet / terminal server)
const urls=[
 ['Landing','https://inpos.id/'],
 ['Kasir','https://app.inpos.id/'],
 ['Super Admin','https://adms.inpos.id/'],
 ['API Health','https://api.inpos.id/v1/health'],
 ['Web Toko','https://inpos.inpos.id/']
];
let failed=0;for(const [label,url] of urls){try{const r=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'follow'});console.log(`${r.ok?'OK':'PERIKSA'} ${label}: HTTP ${r.status} ${url}`);if(!r.ok)failed++;if(label==='API Health'&&r.ok){const data=await r.json();if(data.status!=='ok'){console.log('PERIKSA API status');failed++;}}}catch(e){console.log(`GAGAL ${label}: ${e.message}`);failed++;}}process.exitCode=failed?1:0;
