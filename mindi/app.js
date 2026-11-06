(() => {
 'use strict';
 const data=JSON.parse(document.querySelector('#page-data').textContent);
 const root=document.documentElement;
 const themeButton=document.querySelector('.theme-toggle');
 const readStorage=k=>{try{return localStorage.getItem(k)}catch{return null}};
 const saveStorage=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 function setTheme(theme){root.dataset.theme=theme;themeButton.setAttribute('aria-pressed',String(theme==='dark'));const img=document.querySelector('#hero-img');const src=theme==='dark'?img.dataset.dark:img.dataset.light;img.src=src;document.querySelector('.theme-source').srcset=src;document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#0e131a':'#f4f7fb';}
 setTheme(root.dataset.theme);
 themeButton.addEventListener('click',()=>{const theme=root.dataset.theme==='dark'?'light':'dark';setTheme(theme);saveStorage('mindi.site.theme',theme)});
 const themeMedia=matchMedia('(prefers-color-scheme: dark)');
 themeMedia.addEventListener('change',e=>{if(!readStorage('mindi.site.theme'))setTheme(e.matches?'dark':'light')});
 const menuButton=document.querySelector('.mobile-menu');const mobileNav=document.querySelector('#mobile-nav');
 function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false')}
 menuButton.addEventListener('click',()=>{mobileNav.hidden=!mobileNav.hidden;menuButton.setAttribute('aria-expanded',String(!mobileNav.hidden))});
 mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 matchMedia('(min-width: 961px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
 const tabs=[...document.querySelectorAll('[data-screen]')];const files=['chat.png','hierarchy.png','mail.png'];
 function selectScreen(i,focus=false){tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1});const image=document.querySelector('#explorer-image');image.src='/KnowledgeLab/mindi/assets/'+files[i];image.alt=data.tabAlt[i];image.closest('button').dataset.active=String(i);document.querySelector('#screen-panel').setAttribute('aria-labelledby','tab-'+i);document.querySelector('#screen-description').textContent=data.tabText[i];document.querySelector('#screen-number').textContent=String(i+1).padStart(2,'0');if(focus)tabs[i].focus()}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectScreen(i));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectScreen(n,true)}})});
 document.querySelectorAll('[data-show-screen]').forEach(b=>b.addEventListener('click',()=>selectScreen(Number(b.dataset.showScreen))));
 const dialog=document.querySelector('#image-dialog');let lastOpener=null;
 document.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',()=>{const src=document.getElementById(b.dataset.expand);const image=document.querySelector('#dialog-image');image.src=src.currentSrc||src.src;image.alt=src.alt;lastOpener=b;dialog.showModal();document.body.style.overflow='hidden';document.querySelector('.dialog-close').focus()}));
 document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>{document.body.style.overflow='';lastOpener?.focus()});
 const choices=[...document.querySelectorAll('[data-choice]')];let intent='demo';
 function setIntent(value){if(!['demo','consult','pilot'].includes(value))return;intent=value;choices.forEach(c=>{const on=c.dataset.choice===value;c.classList.toggle('selected',on);c.setAttribute('aria-pressed',String(on))});if(document.querySelector('#request-form').hidden){document.querySelector('#request-form').hidden=false;document.querySelector('#request-ready').hidden=true}}
 choices.forEach(c=>c.addEventListener('click',()=>setIntent(c.dataset.choice)));
 document.querySelectorAll('[data-intent]').forEach(b=>b.addEventListener('click',()=>setIntent(b.dataset.intent)));
 const form=document.querySelector('#request-form');let prepared='';
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const f=new FormData(form);const name=String(f.get('name')).trim();const message=String(f.get('message')).trim();if(!name||!message){const input=form.elements[!name?'name':'message'];input.setCustomValidity(data.lang==='uk'?'Заповніть це поле':'Please fill out this field');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return}const choice=data.choices[['demo','consult','pilot'].indexOf(intent)][0];prepared=`MINDI — ${choice}\n\n${data.labels.name}: ${name}\n${data.labels.email}: ${String(f.get('email')).trim()}\n${data.labels.company}: ${String(f.get('company')).trim()}\n\n${data.labels.message}\n${message}\n\n${data.lang==='uk'?'Підготовлено локально. Не надіслано.':'Prepared locally. Not sent.'}\n`;form.hidden=true;document.querySelector('#request-ready').hidden=false;document.querySelector('#download-request').focus()});
 document.querySelector('#download-request').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\ufeff'+prepared],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MINDI-request.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 document.querySelector('#edit-request').addEventListener('click',()=>{document.querySelector('#request-ready').hidden=true;form.hidden=false;form.elements.name.focus()});
 document.querySelector('[data-lang-link]').addEventListener('click',e=>{e.currentTarget.href='/KnowledgeLab/mindi/'+(data.lang==='uk'?'en':'uk')+'/?v=20261106-24bc19ce4956'+location.hash});
})();
