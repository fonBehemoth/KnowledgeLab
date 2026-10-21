import {translate} from './i18n.js';

// Index only data already available to this application session.
export function buildSearchEntries(org={},history={}){
 const entries=[],companies=(org?.companies||[]).filter(x=>!x.archived),names=new Map(companies.map(x=>[x.id,x.name]));
 const add=(kind,title,text,company,target)=>entries.push({kind,title:title||kind,text:text||'',detail:names.get(company)||'',target:{company_id:company,...target}});
 for(const c of companies)add('Компании',c.name,c.field,c.id,{kind:'company'});
 for(const d of org?.departments||[])if(!d.archived&&names.has(d.company_id))add('Отделы',d.name,'',d.company_id,{kind:'department',department_id:d.id});
 for(const p of org?.people||[])if(!p.archived&&names.has(p.company_id))add('Сотрудники',p.name,[p.position,p.email,p.work_schedule,p.duties,p.kind==='ai'?'ИИ-агент':''].join(' '),p.company_id,{kind:'person',employee_id:p.id,department_id:p.department_id});
 for(const [company,chats] of Object.entries(history.chats||{}))if(names.has(company)){
  for(const chat of chats.threads||[])add('Переписки',chat.title,(chat.messages||[]).map(m=>m.text).join('\n'),company,{kind:'chat',chat_id:chat.id});
  for(const mail of chats.mails||[])add('Письма',mail.subject,[mail.to,mail.text].join('\n'),company,{kind:'mail',mail_id:mail.id});
 }
 for(const record of Object.values(history.records||{}))if(names.has(record._company_id)){
  const target={kind:'task',employee_id:record._employee_id,department_id:record._department_id};
  if(record.task)add('Задачи',record.task.title,[record.task.detail,record.result,record.rules].filter(Boolean).join('\n'),record._company_id,target);
  if(record.questions?.length)add('Переписки',record.task?.title||'Рабочий диалог',record.questions.map(m=>m.text).join('\n'),record._company_id,{...target,kind:'record'});
 }
 for(const [company,team] of Object.entries(history.teams||{}))if(names.has(company)&&team.messages?.length)add('Переписки','Чат менеджеров',team.messages.map(m=>m.text).join('\n'),company,{kind:'team'});
 return entries;
}
export function matchSearchEntries(entries,query,kind='Все'){
 const normalize=text=>String(text).normalize('NFKC').toLocaleLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
 const q=normalize(query),terms=q.split(' ').filter(Boolean),numeric=/^[\d\s.,€$%+-]+$/.test(q);
 if(!terms.length)return [];
 return entries.filter(x=>{if(kind!=='Все'&&x.kind!==kind)return false;const text=normalize([x.title,x.text,x.detail].join(' '));return numeric?text.includes(q):terms.every(term=>text.includes(term));});
}

export function initGlobalSearch(icon){
 const app=window.deepAgentDemo,side=document.querySelector('.nav-scroll'),flow=document.querySelector('#conversation-flow');
 const button=document.createElement('button');button.id='global-search-button';button.type='button';button.append(icon('search'));button.setAttribute('aria-label',translate('Поиск по программе'));button.title=translate('Поиск по программе')+' · Ctrl+K';document.querySelector('.nav-heading').insertBefore(button,document.querySelector('#menu-toggle'));
 const panel=document.createElement('section');panel.id='global-search-panel';panel.hidden=true;panel.setAttribute('aria-label',translate('Поиск по программе'));flow.prepend(panel);
 const head=document.createElement('div');head.className='global-search-head';const title=document.createElement('h1');title.textContent=translate('Поиск по программе');
 const close=document.createElement('button');close.type='button';close.textContent=translate('Закрыть поиск');head.append(title,close);
 const input=document.createElement('input');input.type='search';input.id='global-search-input';input.placeholder=translate('Название, ФИО или фрагмент текста');input.setAttribute('aria-label',translate('Поиск по программе'));
 const filters=document.createElement('div');filters.className='global-search-filters';filters.setAttribute('aria-label',translate('Тип результата'));
 const status=document.createElement('p');status.setAttribute('role','status');const results=document.createElement('div');results.id='global-search-results';
 panel.append(head,input,filters,status,results);
 let kind='Все',extra=[],loading=false,warning='',epoch=0;
 const kinds=['Все','Компании','Отделы','Сотрудники','Задачи','Переписки','Письма','Материалы','Отчёты','Разделы'];
 for(const name of kinds){const b=document.createElement('button');b.type='button';b.textContent=translate(name);b.dataset.kind=name;b.onclick=()=>{kind=name;render();};filters.append(b);}
 function closeSearch(){panel.hidden=true;document.body.classList.remove('global-search-open');button.focus({preventScroll:true});}
 close.onclick=closeSearch;
 function render(){
  for(const b of filters.children){b.classList.toggle('active',b.dataset.kind===kind);b.setAttribute('aria-pressed',String(b.dataset.kind===kind));}
  const sections=['Проекты','Персонал','Отчёты','Чаты','Аналитика','История'].map(name=>({kind:'Разделы',title:name,text:'',detail:'',target:{kind:'section',section:name,company_id:app.state().company_id}}));
  const matches=matchSearchEntries([...buildSearchEntries(app.organization(),app.historySnapshot()),...extra,...sections],input.value,kind);results.replaceChildren();
  status.textContent=(loading?translate('Материалы загружаются…')+' ':'')+(input.value.trim()?(matches.length?translate('Найдено')+': '+matches.length+(matches.length>50?' · '+translate('Показаны первые 50'):''):translate('Ничего не найдено')):translate('Поиск по всем компаниям, сотрудникам, задачам, текстам переписок и сохранённым материалам.'))+(warning?' '+warning:'');
  for(const item of matches.slice(0,50)){
   const b=document.createElement('button');b.type='button';b.className='global-search-result';const tag=document.createElement('small');tag.textContent=[translate(item.kind),item.detail].filter(Boolean).join(' · ');const label=document.createElement('strong');label.textContent=item.title;const snippet=document.createElement('span');
   const text=String(item.text||''),term=input.value.trim().split(/\s+/)[0].toLocaleLowerCase(),at=text.toLocaleLowerCase().indexOf(term);snippet.textContent=(at>60?'…':'')+text.slice(Math.max(0,at-60),Math.max(0,at-60)+230);b.append(tag,label,snippet);
   b.onclick=async()=>{try{if(item.open)await item.open();else app.openSearchTarget(item.target);closeSearch();document.querySelector('#content').scrollIntoView({block:'start'});}catch{status.textContent=translate('Не удалось открыть результат.');}};results.append(b);
  }
 }
 async function openSearch(){
  panel.hidden=false;document.body.classList.add('global-search-open');flow.scrollTop=0;
  if(innerWidth<=900&&!document.body.classList.contains('nav-closed'))document.querySelector('#menu-toggle').click();
  input.focus();render();const request=++epoch;
  if(window.DeepAgentSearchProvider){loading=true;warning='';render();try{const items=await window.DeepAgentSearchProvider();if(request===epoch)extra=items;}catch{if(request===epoch)warning=translate('Поиск материалов временно недоступен; показаны остальные результаты.');}finally{if(request===epoch){loading=false;render();}}}
 }
 button.onclick=openSearch;input.oninput=render;
 document.addEventListener('deepagent-section-rendered',()=>{if(!panel.hidden)closeSearch();});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}else if(e.key==='Escape'&&!panel.hidden){e.preventDefault();closeSearch();}});
}
