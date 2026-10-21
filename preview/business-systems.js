import {translate as t} from './i18n.js';
import {el,button} from './company-ui.js';
import {accountingSystems,openSystemConnection} from './integration-center.js';
export function createSystemsView(app){
 return (host,state,{company})=>{
  host.replaceChildren();const selected=state.sub,system=accountingSystems[selected];
  if(!system){host.append(el('p',t('Выберите учётную систему. Подключения настраиваются отдельно для каждой компании.')));return;}
  const card=el('article',null,'system-card');
  card.append(el('h2',selected+' · '+t(system[0])),el('p',t(system[1])),el('span',t('Не подключена'),'system-status'),el('p',t('Можно настроить параметры подключения или добавить выгрузку для анализа.')));
  card.append(button('Настроить подключение',()=>openSystemConnection(app,company.id,selected)),button('Добавить выгрузку',()=>document.querySelector('#composer-add-files').click()));host.append(card);
 };
}
