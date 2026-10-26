import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';

export function collectRecentChats(history,companyId,limit=8){
 const entries=(history.chats?.[companyId]?.threads||[]).filter(chat=>chat.messages?.length||chat.kind==='employee').map(chat=>({id:chat.id,title:chat.title,at:chat.messages?.at(-1)?.at||chat.created_at||'',preview:chat.messages?.at(-1)?.text||'',count:chat.messages?.length||0,kind:'chat'}));
 const team=history.teams?.[companyId];if(team?.messages?.length)entries.push({id:'team',title:'Групповой чат',at:team.messages.at(-1).at||'',preview:team.messages.at(-1).text||'',count:team.messages.length,kind:'team'});
 return entries.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,limit);
}
export function initRecentChats(host,app){
 const sheet=el('link');sheet.rel='stylesheet';sheet.href=new URL('./recent-chats.css',import.meta.url);document.head.append(sheet);
 const tip=el('div',null,'recent-chat-tooltip');tip.id='recent-chat-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);
 host.setAttribute('aria-label',t('Недавние чаты'));let scheduled=false,timer,active=null;
 function hideTip(){clearTimeout(timer);tip.hidden=true;if(active){active.removeAttribute('aria-describedby');active.classList.remove('title-scrolling');active=null;}}
 function showTip(item,chat,company){
  if(!item.isConnected)return;active=item;tip.replaceChildren(el('strong',chat.title),el('small',company));
  if(chat.at){const date=new Date(chat.at);if(!Number.isNaN(date.getTime()))tip.append(el('small',t('Последнее сообщение')+': '+date.toLocaleString(document.documentElement.lang||'ru')));}
  if(chat.preview)tip.append(el('p',chat.preview.slice(0,240)));else tip.append(el('p',t('Сообщений пока нет.')));
  tip.hidden=false;const rect=item.getBoundingClientRect(),width=tip.offsetWidth,height=tip.offsetHeight;tip.style.left=Math.max(8,Math.min(rect.right+12,innerWidth-width-8))+'px';tip.style.top=Math.max(8,Math.min(rect.top,innerHeight-height-8))+'px';item.setAttribute('aria-describedby',tip.id);
 }
 function begin(item,chat,company,immediate=false){
  hideTip();active=item;const viewport=item.querySelector('.recent-chat-viewport'),title=item.querySelector('.recent-chat-title'),distance=Math.max(0,title.scrollWidth-viewport.clientWidth);
  item.style.setProperty('--title-travel',-distance+'px');item.style.setProperty('--title-duration',Math.max(4,distance/35+2)+'s');item.classList.toggle('title-scrolling',distance>1);timer=setTimeout(()=>showTip(item,chat,company),immediate?0:450);
 }
 function render(){
  scheduled=false;hideTip();const state=app.state(),entries=collectRecentChats(app.historySnapshot(),state.company_id),company=app.organization()?.companies?.find(c=>c.id===state.company_id)?.name||'';host.replaceChildren(el('small',t('Недавние чаты')));host.hidden=false;
  for(const chat of entries){
   const item=button('',()=>{hideTip();app.openSearchTarget({kind:chat.kind,company_id:state.company_id,chat_id:chat.id});}),viewport=el('span',null,'recent-chat-viewport'),title=el('span',chat.title,'recent-chat-title');title.dataset.authored='true';viewport.append(title);item.append(viewport);item.setAttribute('aria-label',chat.title);item.className='recent-chat';
   const selected=state.section==='Чаты'&&(chat.kind==='team'?state.chatMode==='team':state.conversation_id===chat.id);item.classList.toggle('active',selected);if(selected)item.setAttribute('aria-current','page');
   item.onpointerenter=()=>begin(item,chat,company);item.onpointerleave=hideTip;item.onfocus=()=>requestAnimationFrame(()=>{if(document.activeElement===item)begin(item,chat,company,true);});item.onblur=hideTip;host.append(item);
  }
  if(!entries.length)host.append(el('span',t('Переписок пока нет.'),'recent-empty'));
 }
 document.addEventListener('scroll',hideTip,true);document.addEventListener('keydown',event=>{if(event.key==='Escape')hideTip();});window.addEventListener('resize',hideTip);
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(render);}};document.addEventListener('deepagent-history-changed',schedule);document.addEventListener('deepagent-section-rendered',schedule);document.addEventListener('deepagent-language-change',schedule);render();
}
