import {translate as t} from './i18n.js';
import {el,button} from './company-ui.js';
import {descendants} from './company-model.js';
export function createPeopleDrawer(app,icon){
 const toggle=button('Сотрудники компании',()=>setOpen(drawer.hidden));toggle.id='people-drawer-toggle';toggle.replaceChildren(icon('people'));const count=el('small');toggle.append(count);toggle.setAttribute('aria-label',t('Сотрудники компании'));toggle.setAttribute('aria-controls','people-drawer');toggle.title=t('Сотрудники компании');document.querySelector('main>.composer').append(toggle);
 const drawer=el('aside',null,'people-drawer');drawer.id='people-drawer';drawer.hidden=true;drawer.setAttribute('aria-label',t('Сотрудники компании'));const header=el('div',null,'people-drawer-head'),title=el('h2',t('Сотрудники')),close=button('Закрыть',()=>setOpen(false));close.setAttribute('aria-label',t('Закрыть список сотрудников'));close.replaceChildren(icon('close'));header.append(title,close);
 const scope=el('p',null,'hint'),search=el('input');search.type='search';search.placeholder=t('ФИО, должность или почта');search.setAttribute('aria-label',t('Поиск сотрудников'));const filter=el('select');filter.setAttribute('aria-label',t('Подразделение сотрудников'));const list=el('div',null,'people-drawer-list');drawer.append(header,scope,search,filter,list);document.body.append(drawer);
 let org={},company,people=[],departments=[],lastCompany='',expanded=new Set(),department='';
 function setOpen(open){drawer.hidden=!open;toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('people-drawer-open',open);if(open){renderPeople();search.focus();}else toggle.focus({preventScroll:true});}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden){setOpen(false);}});
 function showPeople(dept='',personId=''){department=dept;filter.value=dept;search.value='';if(personId)expanded.add(personId);setOpen(true);}
 function renderPeople(){list.replaceChildren();scope.textContent=company?.name||'';const ids=department?descendants(departments,department):null,q=search.value.trim().toLocaleLowerCase();const found=people.filter(p=>(!ids||ids.has(p.department_id))&&[p.name,p.position,p.email].join(' ').toLocaleLowerCase().includes(q));
  if(!found.length){list.append(el('p',t('Сотрудники не найдены.')));return;}
  for(const p of found){const card=el('details',null,'staff-card');card.open=expanded.has(p.id);card.addEventListener('toggle',()=>card.open?expanded.add(p.id):expanded.delete(p.id));const summary=el('summary'),avatar=el('span',p.kind==='ai'?'AI':p.name.split(/\s+/).slice(0,2).map(s=>s[0]).join(''),'staff-avatar'),name=el('span');name.append(el('strong',p.name),el('small',p.position));summary.append(avatar,name);card.append(summary);const body=el('div',null,'staff-card-body');
   const row=(caption,value)=>{const r=el('div',null,'staff-info');r.append(el('small',t(caption)),el('span',value||t('Не указано')));body.append(r);};
   row('Подразделение',departments.find(d=>d.id===p.department_id)?.name);row('Руководитель',people.find(x=>x.id===p.supervisor_id)?.name||t('Не назначен'));row('Рабочая почта',p.email);row('График работы',p.work_schedule);row('Учёт времени',t('Сервис учёта рабочего времени не подключён'));
   const reports=people.filter(x=>x.supervisor_id===p.id);if(reports.length)row('Подчинённые',reports.map(x=>x.name).join(', '));
   body.append(el('h3',t('Последняя активность')));const events=app.historySnapshot().activities?.[p.id]||[];for(const event of events.slice(0,4)){const item=el('p',event.text);if(event.at){const date=el('small',new Date(event.at).toLocaleString(document.documentElement.lang||'ru'));item.prepend(date);}body.append(item);}if(!events.length)body.append(el('p',t('Нет зарегистрированных действий')));
   body.append(button('Открыть рабочий контекст',()=>app.openSearchTarget({kind:'person',company_id:company.id,department_id:p.department_id,employee_id:p.id})));card.append(body);list.append(card);
  }
 }
 search.oninput=renderPeople;filter.onchange=()=>{department=filter.value;renderPeople();};

 function refresh(context){org=context.org;company=context.company;people=context.people;departments=context.departments;count.textContent=people.length;toggle.hidden=!company;if(lastCompany!==company?.id){lastCompany=company?.id;department='';expanded.clear();}filter.replaceChildren();const all=el('option',t('Все отделы'));all.value='';filter.append(all);for(const dept of departments){const option=el('option',dept.name);option.value=dept.id;filter.append(option);}if(!departments.some(d=>d.id===department))department='';filter.value=department;if(!drawer.hidden)renderPeople();}
 return {refresh,showPeople};
}
