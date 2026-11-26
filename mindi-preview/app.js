(() => {
 'use strict';
 const data=JSON.parse(document.querySelector('#page-data').textContent);
 const root=document.documentElement;
 const themeButton=document.querySelector('.theme-toggle');
 const storage={get(){try{return localStorage.getItem('mindi.site.theme')}catch{return null}},set(v){try{localStorage.setItem('mindi.site.theme',v)}catch{}}};
 function setTheme(theme){root.dataset.theme=theme;themeButton.setAttribute('aria-pressed',String(theme==='dark'));for(const img of document.querySelectorAll('img[data-light][data-dark]')){img.src=theme==='dark'?img.dataset.dark:img.dataset.light;const source=img.closest('picture')?.querySelector('source');if(source)source.srcset=img.src;}document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#0e131a':'#f4f7fb';}
 setTheme(root.dataset.theme);
 themeButton.addEventListener('click',()=>{const value=root.dataset.theme==='dark'?'light':'dark';setTheme(value);storage.set(value)});
 matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{if(!storage.get())setTheme(e.matches?'dark':'light')});
 const menuButton=document.querySelector('.mobile-menu'),mobileNav=document.querySelector('#mobile-nav');
 function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false')}
 menuButton.addEventListener('click',()=>{mobileNav.hidden=!mobileNav.hidden;menuButton.setAttribute('aria-expanded',String(!mobileNav.hidden))});
 mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus()}});
 matchMedia('(min-width: 1201px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
 const tabs=[...document.querySelectorAll('[data-screen]')],files=['chat.png','hierarchy.png','mail.png'];
 const assets=new URL('assets/',new URL(document.querySelector('script[src$="app.js"],script[src*="app.js?"]').src)).href;
 function selectScreen(i,focus=false){if(!tabs.length||!Number.isInteger(i)||i<0||i>=tabs.length)return;tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1});const image=document.querySelector('#explorer-image');image.src=assets+files[i];image.alt=data.tabAlt[i];document.querySelector('#screen-panel').setAttribute('aria-labelledby','tab-'+i);document.querySelector('#screen-description').textContent=data.tabText[i];document.querySelector('#screen-number').textContent=String(i+1).padStart(2,'0');if(focus)tabs[i].focus()}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectScreen(i));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectScreen(n,true)}})});
 document.querySelectorAll('[data-show-screen]').forEach(a=>{a.addEventListener('click',()=>{if(tabs.length)selectScreen(Number(a.dataset.showScreen));else{const u=new URL(a.href);u.searchParams.set('screen',a.dataset.showScreen);a.href=u.href;}})});
 if(tabs.length){const selected=new URLSearchParams(location.search).get('screen');if(selected!==null)selectScreen(Number(selected));}
 const dialog=document.querySelector('#image-dialog');let lastOpener=null;
 document.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',()=>{const src=document.getElementById(b.dataset.expand);if(!src)return;const image=document.querySelector('#dialog-image');image.src=src.currentSrc||src.src;image.alt=src.alt;lastOpener=b;dialog.showModal();document.body.style.overflow='hidden';document.querySelector('.dialog-close').focus()}));
 document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{document.body.style.overflow='';lastOpener?.focus()});
 const form=document.querySelector('#request-form');
 if(form){const choices=[...document.querySelectorAll('[data-choice]')];let intent='demo',prepared='';
  function setIntent(value){if(!['demo','consult','pilot'].includes(value))return;intent=value;choices.forEach(c=>{const on=c.dataset.choice===value;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',String(on))});document.querySelectorAll('[data-lang-link]').forEach(link=>{const u=new URL(link.href);u.searchParams.set('intent',value);link.href=u.href});if(form.hidden){form.hidden=false;document.querySelector('#request-ready').hidden=true;}}
  choices.forEach(c=>c.addEventListener('click',()=>setIntent(c.dataset.choice)));
  setIntent(new URLSearchParams(location.search).get('intent'));
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const f=new FormData(form),name=String(f.get('name')).trim(),message=String(f.get('message')).trim();if(!name||!message){const input=form.elements[!name?'name':'message'];input.setCustomValidity(data.required);input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return}const choice=data.choices[['demo','consult','pilot'].indexOf(intent)][0];prepared=`MINDI — ${choice}\n\n${data.labels.name}: ${name}\n${data.labels.email}: ${String(f.get('email')).trim()}\n${data.labels.company}: ${String(f.get('company')).trim()}\n\n${data.labels.message}\n${message}\n\n${data.prepared}\n`;form.hidden=true;document.querySelector('#request-ready').hidden=false;document.querySelector('#download-request').focus()});
  document.querySelector('#download-request').addEventListener('click',()=>{const href=URL.createObjectURL(new Blob(['\ufeff'+prepared],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download='MINDI-request.txt';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)});
  document.querySelector('#edit-request').addEventListener('click',()=>{document.querySelector('#request-ready').hidden=true;form.hidden=false;form.elements.name.focus()});
 }
 // Language links already point to the equivalent page. Only safe UI choices
 // cross languages; entered contact details stay in this document.

 if(!data.page&&location.hash){const routes={workspace:'mindi',explore:'mindi',specialists:'agents',control:'control',implementation:'implementation',contact:'contact'};const page=routes[location.hash.slice(1)];if(page){const next=new URL(page+'/',new URL('./',document.querySelector('link[hreflang='+data.lang+']').href));if(location.hash==='#explore')next.hash='explore';location.replace(next.href);}}
})();
