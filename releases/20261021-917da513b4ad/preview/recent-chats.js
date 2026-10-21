import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';

export function collectRecentChats(history,companyId,limit=8){
 const entries=(history.chats?.[companyId]?.threads||[]).filter(chat=>chat.messages?.length||chat.kind==='employee').map(chat=>({id:chat.id,title:chat.title,at:chat.messages?.at(-1)?.at||chat.created_at||'',kind:'chat'}));
 const team=history.teams?.[companyId];if(team?.messages?.length)entries.push({id:'team',title:'Групповой чат',at:team.messages.at(-1).at||'',kind:'team'});
 return entries.sort((a,b)=>b.at.localeCompare(a.at)).slice(0,limit);
}
export function initRecentChats(host,app){
 host.setAttribute('aria-label',t('Недавние чаты'));let scheduled=false;
 function render(){scheduled=false;const state=app.state(),entries=collectRecentChats(app.historySnapshot(),state.company_id);host.replaceChildren(el('small',t('Недавние')));host.hidden=false;
  for(const chat of entries){const item=button(chat.title,()=>app.openSearchTarget({kind:chat.kind,company_id:state.company_id,chat_id:chat.id}));item.title=chat.title;item.dataset.authored='true';item.className='recent-chat';const selected=state.section==='Чаты'&&(chat.kind==='team'?state.chatMode==='team':state.conversation_id===chat.id);item.classList.toggle('active',selected);if(selected)item.setAttribute('aria-current','page');host.append(item);}
  if(!entries.length)host.append(el('span',t('Переписок пока нет.'),'recent-empty'));
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(render);}};document.addEventListener('deepagent-history-changed',schedule);document.addEventListener('deepagent-section-rendered',schedule);document.addEventListener('deepagent-language-change',schedule);render();
}
