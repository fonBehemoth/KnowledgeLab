import {translate} from './i18n.js';

const iso=value=>{if(!value)return '';const date=new Date(typeof value==='number'?value*1000:value);return Number.isNaN(date.getTime())?'':date.toISOString();};
export function collectHistoryEntries(org,history,company){
 const people=new Map((org?.people||[]).filter(p=>p.company_id===company).map(p=>[p.id,p])),entries=[];
 const chats=history.chats?.[company];
 for(const chat of chats?.threads||[])entries.push({category:'Переписки',title:chat.title,messages:chat.messages||[],text:(chat.messages||[]).map(m=>m.text).join('\n'),at:iso(chat.messages?.at(-1)?.at),dates:(chat.messages||[]).map(m=>iso(m.at)).filter(Boolean),department_id:chat.department_id,kind:'Переписка',target:{kind:'chat',chat_id:chat.id,company_id:company}});
 for(const mail of chats?.mails||[])entries.push({category:'Переписки',title:mail.subject||'Письмо',text:[mail.to,mail.text].join('\n'),at:iso(mail.createdAt),kind:mail.status==='scheduled'?'Отложенное письмо':'Черновик',target:{kind:'mail',mail_id:mail.id,company_id:company}});
 const team=history.teams?.[company];if(team?.messages?.length)entries.push({category:'Переписки',title:'Чат менеджеров',messages:team.messages,text:team.messages.map(m=>m.text).join('\n'),at:iso(team.messages.at(-1)?.at),dates:team.messages.map(m=>iso(m.at)).filter(Boolean),kind:'Групповой чат',target:{kind:'team',company_id:company}});
 for(const record of Object.values(history.records||{}))if(record._company_id===company){
  const person=people.get(record._employee_id);
  for(const item of [{task:record.task,result:record.result},...(record.past_tasks||[])])if(item.task)entries.push({category:'Задачи и действия',title:item.task.title,text:[item.task.detail,item.result,person?.name,item.task.deadline?'Срок: '+item.task.deadline:''].filter(Boolean).join('\n'),at:iso(item.task.created_at||item.task.createdAt),department_id:record._department_id,kind:item.task.status==='transferred'?'Переданное поручение':'Поручение',target:{kind:'task',company_id:company,employee_id:record._employee_id,department_id:record._department_id}});
 }
 for(const [personId,events] of Object.entries(history.activities||{})){
  const person=people.get(personId);if(!person)continue;
  for(const event of events)entries.push({category:'Задачи и действия',title:event.text,text:[person.name,event.detail,event.task?.title].filter(Boolean).join('\n'),at:iso(event.at),department_id:person.department_id,kind:'Действие сотрудника',target:{kind:'activity',company_id:company,employee_id:personId,department_id:person.department_id}});
 }
 return entries;
}

export function initHistoryWorkspace(){
 const app=window.deepAgentDemo,filters={query:'',start:'',end:''};let generation=0;
 const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=translate(text);return node;};
 async function mount(){
  const host=document.querySelector('#unified-history-host');if(!host)return;const request=++generation,state=app.state(),org=app.organization(),history=app.historySnapshot(),category=state.sub;
  host.replaceChildren();const controls=el('div');controls.className='unified-history-filters';
  const field=(caption,type,value)=>{const label=el('label',caption),input=el('input');input.type=type;input.value=value;label.append(input);controls.append(label);return input;};
  const query=field('Поиск в истории','search',filters.query),start=field('С даты','date',filters.start),end=field('По дату','date',filters.end),reset=el('button','Сбросить фильтры');reset.type='button';controls.append(reset);
  const graph=document.querySelector('#core-graph-button');if(graph){const button=el('button','Граф связей');button.type='button';button.onclick=()=>graph.click();controls.append(button);}
  const status=el('p');status.setAttribute('role','status');const list=el('div');list.className='unified-history-list';host.append(controls,status,list);
  let entries=collectHistoryEntries(org,history,state.company_id).filter(x=>x.category===category),loading=false,error='';
  const current=()=>host.isConnected&&request===generation;
  const inDates=at=>{const date=at?new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich'}).format(new Date(at)):'';return date&&(!filters.start||date>=filters.start)&&(!filters.end||date<=filters.end);};
  function render(){
   if(!current())return;list.replaceChildren();
   if(filters.start&&filters.end&&filters.start>filters.end){status.textContent=translate('Начало периода должно быть не позже окончания.');return;}
   const terms=filters.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean),matches=entries.filter(item=>{
    if(state.department&&state.department!=='Все отделы'&&!item.shared&&item.department_id!==state.department)return false;
    if((filters.start||filters.end)&&!(item.dates||[item.at]).some(inDates))return false;
    const text=(filters.start||filters.end)&&item.messages?item.messages.filter(m=>inDates(iso(m.at))).map(m=>m.text).join('\n'):item.text;return terms.every(term=>[item.title,text,item.kind].join(' ').toLocaleLowerCase().includes(term));
   }).sort((a,b)=>(b.at||'').localeCompare(a.at||''));
   status.textContent=loading?translate('История загружается…'):error||translate('Найдено')+': '+matches.length+((filters.start||filters.end)?' · '+translate('Записи без даты не показаны.'):'');
   if(category==='Версии документов'&&!controls.querySelector('select')?.value&&!loading&&!error){status.textContent=translate(controls.querySelector('select')?.options.length>1?'Выберите документ, чтобы просмотреть версии.':'Материалов пока нет.');return;}
   if(!matches.length&&!loading&&!error){list.append(el('p',category==='Версии документов'&&!entries.length?'Сохранённых версий этого документа пока нет.':'Записей по выбранным условиям нет.'));return;}
   for(const item of matches){
    const card=el('article');card.className='unified-history-card';const meta=el('small'),shownAt=(filters.start||filters.end)&&item.dates?item.dates.filter(inDates).at(-1):item.at;meta.textContent=[translate(item.kind),item.shared?translate('Общая библиотека'):org?.companies.find(c=>c.id===state.company_id)?.name,shownAt?new Date(shownAt).toLocaleString(document.documentElement.lang||'ru',{timeZone:'Europe/Zurich'}):translate('Дата не указана')].filter(Boolean).join(' · ');
    const title=el('h2');title.textContent=item.title;title.dataset.authored='true';card.append(meta,title);const text=el('p');text.textContent=String(item.text||'').slice(0,360);text.dataset.authored='true';card.append(text);
    if(item.version){const detail=el('details'),summary=el('summary','Содержимое версии'),body=el('pre');body.textContent=item.text;detail.append(summary,body);card.append(detail);}
    else if(item.open||item.target){const open=el('button','Открыть');open.type='button';open.onclick=async()=>{try{if(item.open)await item.open();else app.openSearchTarget({...item.target,start:filters.start,end:filters.end});}catch{if(current())status.textContent=translate('Не удалось открыть запись.');}};card.append(open);}
    list.append(card);
   }
  }
  for(const [input,key] of [[query,'query'],[start,'start'],[end,'end']])input.addEventListener('input',()=>{filters[key]=input.value;render();});reset.onclick=()=>{filters.query=filters.start=filters.end='';query.value=start.value=end.value='';render();};
  if(['Материалы и анализ','Версии документов'].includes(category)){
   if(!window.DeepAgentHistoryProvider){error=translate('История материалов сейчас недоступна.');render();return;}
   loading=true;render();
   try{
    const data=await window.DeepAgentHistoryProvider.materials();if(!current())return;
    const materials=data.filter(x=>!x.company_id||x.company_id===state.company_id);
    if(category==='Материалы и анализ')entries=materials.map(item=>({...item,category,kind:item.kind||'Материал',at:iso(item.at),shared:!item.company_id}));
    else{
     const label=el('label','Документ'),select=el('select');select.setAttribute('aria-label',translate('Документ'));const placeholder=el('option','Выберите документ');placeholder.value='';select.append(placeholder);for(const item of materials){const option=el('option');option.textContent=item.title;option.value=String(item.id);select.append(option);}label.append(select);controls.prepend(label);entries=[];
     let versionRequest=0;select.onchange=async()=>{const selected=materials.find(x=>String(x.id)===select.value),version=++versionRequest;entries=[];error='';if(!selected){loading=false;render();return;}loading=true;render();try{const versions=await window.DeepAgentHistoryProvider.versions(selected.id);if(!current()||version!==versionRequest)return;entries=versions.map(v=>({category,kind:'Версия документа',title:v.snapshot?.title||selected.title,text:v.snapshot?.document_md||v.snapshot?.analysis||'',at:iso(v.at),shared:!selected.company_id,department_id:selected.department_id,version:true}));}catch{if(version===versionRequest)error=translate('Не удалось загрузить версии документа.');}finally{if(version===versionRequest){loading=false;render();}}};
    }
   }catch{error=translate('История материалов сейчас недоступна.');}finally{loading=false;render();}
  }else render();
 }
 document.addEventListener('deepagent-section-rendered',mount);document.addEventListener('deepagent-language-change',mount);mount();
}
