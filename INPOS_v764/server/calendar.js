'use strict';
// Semua masa langganan mengikuti kalender Indonesia (WIB, UTC+07:00),
// bukan pergantian tanggal server yang mungkin berjalan di UTC.
const WIB_MS=7*60*60*1000;
function todayWIB(now=Date.now()){
 const d=new Date(now instanceof Date?now.getTime():now);
 if(!Number.isFinite(d.getTime()))throw new RangeError('Waktu tidak valid');
 return new Date(d.getTime()+WIB_MS).toISOString().slice(0,10);
}
function addDaysWIB(days,now=Date.now()){
 if(!Number.isSafeInteger(days)||days<0||days>36500)throw new RangeError('Jumlah hari tidak valid');
 const day=todayWIB(now);
 const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);
 return d.toISOString().slice(0,10);
}
function addMonthsClamped(day,months){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(day))||!Number.isSafeInteger(months)||months<1||months>36)throw new RangeError('Tanggal atau bulan tidak valid');
 const [year,month,date]=day.split('-').map(Number);
 const test=new Date(Date.UTC(year,month-1,date));
 if(test.toISOString().slice(0,10)!==day)throw new RangeError('Tanggal tidak valid');
 const last=new Date(Date.UTC(year,month-1+months+1,0)).getUTCDate();
 return new Date(Date.UTC(year,month-1+months,Math.min(date,last))).toISOString().slice(0,10);
}
module.exports={todayWIB,addDaysWIB,addMonthsClamped};
