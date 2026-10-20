import {translate} from './i18n.js';

export function groupMessageIndices(count,limit=24){
 const size=Math.max(1,Math.ceil(count/Math.max(1,limit))),groups=[];
 for(let start=0;start<count;start+=size)groups.push({start,end:Math.min(count-1,start+size-1)});
 return groups;
}

export function initChatNavigation(tree,icon){
 tree.hidden=true;
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
