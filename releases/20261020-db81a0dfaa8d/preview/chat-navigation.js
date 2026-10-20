import {translate} from './i18n.js';

export function groupMessageIndices(count,limit=24){
 const size=Math.max(1,Math.ceil(count/Math.max(1,limit))),groups=[];
 for(let start=0;start<count;start+=size)groups.push({start,end:Math.min(count-1,start+size-1)});
 return groups;
}

export function initChatNavigation(tree,icon){
 document.body.classList.add('has-chat-tree');const app=window.deepAgentDemo,expanded=new Map();tree.className='chat-tree';tree.setAttribute('aria-label',translate('Чаты по компаниям'));
 const fold=(key,label,parent,open)=>{const details=document.createElement('details');details.open=expanded.has(key)?expanded.get(key):open;const summary=document.createElement('summary');summary.append(icon('projects'),document.createTextNode(label));const chevron=icon('down');chevron.classList.add('tree-chevron');summary.append(chevron);details.append(summary);details.addEventListener('toggle',()=>expanded.set(key,details.open));parent.append(details);return details;};
 function refreshTree(){
  const org=app.organization(),history=app.historySnapshot(),state=app.state();tree.replaceChildren();
  const label=document.createElement('small');label.className='chat-tree-caption';label.textContent=translate('Чаты по компаниям');tree.append(label);
  for(const company of (org?.companies||[]).filter(x=>!x.archived)){
   const threads=history.chats[company.id]?.threads||[],companyNode=fold('c:'+company.id,company.name,tree,company.id===state.company_id),groups=new Map();
   const teamMessages=history.teams[company.id]?.messages||[];
   if(!threads.length&&!teamMessages.length){const empty=document.createElement('small');empty.className='chat-tree-empty';empty.textContent=translate('Переписок пока нет');companyNode.append(empty);}
   if(teamMessages.length){const team=document.createElement('button');team.type='button';team.className='chat-tree-item';team.append(icon('people'),document.createTextNode(translate('Чат менеджеров')));team.classList.toggle('active',company.id===state.company_id&&state.chatMode==='team'&&state.section==='Чаты');team.onclick=()=>{app.openSearchTarget({kind:'team',company_id:company.id});if(innerWidth<=900&&!document.body.classList.contains('nav-closed'))document.querySelector('#menu-toggle').click();};companyNode.append(team);}
   for(const thread of threads){
    const department=org.departments.find(d=>d.id===thread.department_id&&d.company_id===company.id),person=org.people.find(p=>p.id===thread.employee_id&&p.company_id===company.id);
    // Older conversations have no context metadata. Do not infer a department from their text.
    const group=thread.project_id?'p:'+thread.project_id:department?'d:'+department.id:'general';
    if(!groups.has(group)){const name=thread.project_id?(org.projects?.find(p=>p.id===thread.project_id)?.name||translate('Проект')):department?.name||translate('Общие чаты');groups.set(group,{name,items:[]});}
    groups.get(group).items.push({thread,person});
   }
   for(const [key,group] of groups){
    const groupNode=fold(company.id+':'+key,group.name,companyNode,group.items.some(x=>x.thread.id===state.conversation_id));
    for(const {thread,person} of group.items.sort((a,b)=>String(b.thread.messages.at(-1)?.at||'').localeCompare(String(a.thread.messages.at(-1)?.at||'')))){
     const b=document.createElement('button');b.type='button';b.className='chat-tree-item';b.append(icon('chat'));const text=document.createElement('span');text.textContent=thread.title;text.dataset.authored='true';b.append(text);b.title=[thread.title,person?.name].filter(Boolean).join(' · ');
     const current=state.section==='Чаты'&&company.id===state.company_id&&thread.id===state.conversation_id;b.classList.toggle('active',current);if(current)b.setAttribute('aria-current','page');
     b.onclick=()=>{app.openSearchTarget({kind:'chat',company_id:company.id,chat_id:thread.id});if(innerWidth<=900&&!document.body.classList.contains('nav-closed'))document.querySelector('#menu-toggle').click();};groupNode.append(b);
    }
   }
  }
 }
 document.addEventListener('deepagent-section-rendered',refreshTree);document.addEventListener('deepagent-history-changed',refreshTree);document.addEventListener('deepagent-language-change',refreshTree);refreshTree();
 for(const id of ['assistant-mode','team-mode'])document.getElementById(id)?.addEventListener('click',refreshTree);

 const composer=document.querySelector('main>.composer'),flow=document.querySelector('#conversation-flow');
 const map=document.createElement('nav');map.id='chat-map';map.hidden=true;map.setAttribute('aria-label',translate('Переходы по переписке'));
 const marks=document.createElement('div');marks.className='chat-map-marks';const preview=document.createElement('div');preview.className='chat-map-preview';preview.hidden=true;map.append(marks,preview);composer.append(map);
 let targets=[],groups=[],scroller=flow,detach=()=>{},pending=false,highlightTimer;
 const describe=(node,index)=>[translate('Сообщение')+' '+(index+1),({task:translate('Задача'),decision:translate('Решение'),attachment:translate('Вложение')})[node.dataset.navKind],node.querySelector('strong,small')?.textContent,node.dataset.messageAt?new Date(node.dataset.messageAt).toLocaleString(document.documentElement.lang||'ru',{timeZone:'Europe/Zurich'}):'',(node.querySelector('p,.message-text')?.textContent||node.textContent).slice(0,180)].filter(Boolean).join(' · ');
 function jump(index){const node=targets[index];if(!node)return;node.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});clearTimeout(highlightTimer);for(const old of document.querySelectorAll('.chat-map-target'))old.classList.remove('chat-map-target');node.classList.add('chat-map-target');highlightTimer=setTimeout(()=>node.classList.remove('chat-map-target'),1800);}
 function showPreview(index,group={start:index,end:index}){preview.replaceChildren();let selected=index;const text=document.createElement('p');text.textContent=describe(targets[index],index);const go=document.createElement('button');go.type='button';go.textContent=translate('Перейти к сообщению');go.onclick=()=>jump(selected);if(group.end>group.start){const select=document.createElement('select');select.setAttribute('aria-label',translate('Сообщение в группе'));for(let i=group.start;i<=group.end;i++){const option=document.createElement('option');option.value=String(i);option.textContent=describe(targets[i],i).slice(0,110);select.append(option);}select.value=String(index);select.onchange=()=>{selected=Number(select.value);text.textContent=describe(targets[selected],selected);};preview.append(select);}const close=document.createElement('button');close.type='button';close.textContent=translate('Закрыть');close.onclick=()=>preview.hidden=true;preview.append(text,go,close);preview.hidden=false;}
 function updatePosition(){if(!targets.length)return;const top=scroller.getBoundingClientRect().top+30;let current=0;for(let i=0;i<targets.length;i++){if(targets[i].getBoundingClientRect().top<=top)current=i;else break;}for(let i=0;i<groups.length;i++){const active=current>=groups[i].start&&current<=groups[i].end;marks.children[i]?.classList.toggle('active',active);if(active)marks.children[i].setAttribute('aria-current','true');else marks.children[i]?.removeAttribute('aria-current');}}
 function refreshMap(){
  const history=document.querySelector('.history-stream');targets=history?[...history.querySelectorAll('.history-message')]:document.querySelector('#chat-panel')?.hidden?[]:[...document.querySelectorAll('#chat-thread .message')];
  map.hidden=targets.length<2;document.body.classList.toggle('has-chat-map',!map.hidden);marks.replaceChildren();preview.hidden=true;detach();scroller=history||flow;
  if(map.hidden)return;
  groups=groupMessageIndices(targets.length,Math.max(4,Math.floor(Math.min(480,innerHeight-260)/24)));
  for(const group of groups){
   const special=targets.findIndex((node,i)=>i>=group.start&&i<=group.end&&node.dataset.navKind&&node.dataset.navKind!=='message'),index=special>=0?special:group.start,node=targets[index];
   const b=document.createElement('button');b.type='button';b.className='chat-map-mark';b.dataset.kind=node.dataset.navKind||'message';b.title=describe(node,index);b.setAttribute('aria-label',(group.end>group.start?translate('Сообщения')+' '+(group.start+1)+'–'+(group.end+1)+' · ':'')+describe(node,index));b.onmouseenter=()=>showPreview(index,group);b.onfocus=()=>showPreview(index,group);b.onclick=()=>{showPreview(index,group);jump(index);};marks.append(b);
  }
  let frame=false;const scroll=()=>{if(frame)return;frame=true;requestAnimationFrame(()=>{frame=false;updatePosition();});};scroller.addEventListener('scroll',scroll,{passive:true});detach=()=>scroller.removeEventListener('scroll',scroll);updatePosition();
 }
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refreshMap();});};
 new MutationObserver(schedule).observe(document.querySelector('#content'),{childList:true,subtree:true});new MutationObserver(schedule).observe(document.querySelector('#chat-thread'),{childList:true,subtree:true});
 document.addEventListener('deepagent-section-rendered',schedule);window.addEventListener('resize',schedule);document.addEventListener('keydown',e=>{if(e.key==='Escape')preview.hidden=true;});schedule();
}
