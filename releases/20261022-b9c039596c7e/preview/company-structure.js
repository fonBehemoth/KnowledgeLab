import {translate as t} from './i18n.js';
import {el,button} from './company-ui.js';
import {personAvatar} from './person-avatar.js';
export function createStructureView(app,showPeople){
 let context,view='departments',selectedCompany='',expanded=new Map();
 function render(host){
  const {company,people,departments}=context;host.replaceChildren();const tools=el('div',null,'org-view-tabs');
  for(const [id,label] of [['departments','Подразделения'],['people','Подчинённость сотрудников']]){const b=button(label,()=>{view=id;render(host);});b.classList.toggle('active',view===id);b.setAttribute('aria-pressed',String(view===id));tools.append(b);}tools.append(button('Развернуть всё',()=>{for(const item of [...departments,...people])expanded.set(view+':'+item.id,true);render(host);}),button('Свернуть всё',()=>{for(const item of [...departments,...people])expanded.set(view+':'+item.id,false);render(host);}));host.append(tools,el('p','Связи сверху вниз показывают непосредственное подчинение. Ветви можно сворачивать.','hint'));
  const board=el('section',null,'org-board');board.setAttribute('aria-label',company?.name||t('Структура компании'));board.tabIndex=0;host.append(board);
  const items=view==='departments'?departments:people,key=view==='departments'?'parent_id':'supervisor_id',ids=new Set(items.map(x=>x.id)),seen=new Set(),children=new Map();
  for(const item of items){const parent=ids.has(item[key])&&item[key]!==item.id?item[key]:null;if(!children.has(parent))children.set(parent,[]);children.get(parent).push(item);}
  function branch(item,depth){
   if(seen.has(item.id))return null;seen.add(item.id);const kids=children.get(item.id)||[],node=el('li',null,'org-branch'),card=el('article',null,'org-department-card');node.append(card);card.dataset.entityId=item.id;if(item.kind==='ai')card.classList.add('is-digital');
   if(view==='departments'){
    const title=button(item.name,()=>showPeople(item.id));title.className='org-department-name';card.append(title);const staff=people.filter(p=>p.department_id===item.id).sort((a,b)=>Number(b.id===item.manager_id)-Number(a.id===item.manager_id)),avatars=el('div',null,'org-avatars');avatars.setAttribute('aria-label',t('Сотрудники')+': '+item.name);
    for(const p of staff.slice(0,8))avatars.append(personAvatar({...p,_department_name:item.name},()=>showPeople(item.id,p.id),{leader:p.id===item.manager_id}));if(staff.length>8){const more=button('+'+(staff.length-8),()=>showPeople(item.id));more.className='org-person-avatar org-more-people';more.setAttribute('aria-label',t('Список сотрудников')+': '+item.name);avatars.append(more);}if(staff.length)card.append(avatars);
   }else{const row=el('div',null,'org-reporting-person');row.append(personAvatar({...item,_department_name:departments.find(d=>d.id===item.department_id)?.name},()=>showPeople('',item.id)));const label=button(item.name,()=>showPeople('',item.id));label.className='org-person-name';label.append(el('small',item.position));if(item.kind==='ai')label.append(el('span','Агент','digital-badge'));row.append(label);card.append(row);}
   if(kids.length){const identity=view+':'+item.id,open=expanded.has(identity)?expanded.get(identity):true,toggle=button('',()=>{}),list=el('ul',null,depth===0?'org-branches-grid':'org-children');let visible=open;const caption=()=>{toggle.setAttribute('aria-expanded',String(visible));toggle.textContent=(visible?'− ':'+ ')+t(view==='departments'?'Подразделения':'Подчинённые')+' · '+kids.length;};toggle.className='org-branch-toggle';toggle.setAttribute('aria-label',t(view==='departments'?'Подразделения':'Подчинённые')+': '+item.name);caption();toggle.onclick=()=>{visible=!visible;expanded.set(identity,visible);list.hidden=!visible;caption();};card.append(toggle);list.hidden=!open;for(const child of kids){const childNode=branch(child,depth+1);if(childNode)list.append(childNode);}node.append(list);}return node;
  }
  const roots=el('ul',null,'org-roots');board.append(roots);for(const item of children.get(null)||[]){const node=branch(item,0);if(node)roots.append(node);}for(const item of items)if(!seen.has(item.id)){const node=branch(item,0);if(node)roots.append(node);}if(!items.length)board.append(el('p',t('Структура пока не заполнена. Добавьте подразделения и сотрудников в настройках.')));
 }
 return (host,next)=>{context=next;if(selectedCompany!==next.company?.id){selectedCompany=next.company?.id;expanded=new Map();}render(host);};
}
