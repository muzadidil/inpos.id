
(()=>{'use strict';
 document.getElementById('year').textContent=String(new Date().getFullYear());
 const navMenu=document.getElementById('navMenu'),navLinks=document.getElementById('navLinks');
 navMenu.addEventListener('click',()=>{const open=navLinks.classList.toggle('show');navMenu.setAttribute('aria-expanded',String(open));navMenu.setAttribute('aria-label',open?'Tutup menu':'Buka menu');});
 navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('show');navMenu.setAttribute('aria-expanded','false')}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){navLinks.classList.remove('show');navMenu.setAttribute('aria-expanded','false')}});
 const tabs=[...document.querySelectorAll('.demo-tab')];
 tabs.forEach((button,i)=>button.addEventListener('click',()=>{tabs.forEach(t=>{t.setAttribute('aria-selected','false');t.tabIndex=-1;});button.setAttribute('aria-selected','true');button.tabIndex=0;document.querySelectorAll('.mock-panel').forEach(p=>p.classList.remove('active'));document.getElementById(button.getAttribute('aria-controls')).classList.add('active')}));
 tabs.forEach((button,i)=>button.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();let x=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[x].focus();tabs[x].click()}));
 const input=document.getElementById('featureSearch'),groups=[...document.querySelectorAll('.feature-group')], status=document.getElementById('featureCountStatus'), empty=document.getElementById('featureEmpty');
 const normalize=s=>s.toLocaleLowerCase('id-ID').trim();
 function filter(){const q=normalize(input.value);let shown=0,activeGroups=0;groups.forEach((g,i)=>{let count=0;const matchedCategory=normalize(g.dataset.group).includes(q);g.querySelectorAll('.feature').forEach(li=>{const match=!q||matchedCategory||normalize(li.dataset.feature).includes(q);li.hidden=!match;if(match)count++;});g.hidden=count===0;if(count){activeGroups++;shown+=count}if(q){g.open=count>0}else if(!g.dataset.userTouched){g.open=(i===0)}const badge=g.querySelector('.group-count');badge.textContent=count+' fitur';});status.textContent=shown+' fitur dalam '+activeGroups+' kategori';empty.classList.toggle('visible',shown===0);}
 input.addEventListener('input',filter);
 groups.forEach(g=>g.addEventListener('toggle',()=>{if(!input.value.trim())g.dataset.userTouched='yes'}));
 document.getElementById('expandAll').addEventListener('click',()=>{groups.forEach(g=>{if(!g.hidden){g.open=true;g.dataset.userTouched='yes'}})});
 document.getElementById('collapseAll').addEventListener('click',()=>{groups.forEach(g=>{g.open=false;g.dataset.userTouched='yes'})});
 filter();
})();
