import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';

export function createPersonnelNavigation({compact,onSearch,onStructure,onManage}){
 const nav=el('nav',null,'personnel-tools');nav.id='personnel-tools';nav.setAttribute('aria-label',t('Персонал'));
 let target=nav,disclosure;
 if(compact){
  disclosure=el('details',null,'personnel-menu');const trigger=el('summary',t('Персонал')),arrow=el('span','▾');arrow.setAttribute('aria-hidden','true');trigger.append(arrow);trigger.setAttribute('aria-label',t('Разделы персонала'));
  target=el('div',null,'personnel-menu-items');disclosure.append(trigger,target);nav.append(disclosure);
 }
 const add=(label,action,id)=>{const item=button(label,()=>{if(disclosure)disclosure.open=false;action();});if(id)item.id=id;target.append(item);};
 add('Найти сотрудника',onSearch,'personnel-directory');add('Структура и иерархия',onStructure);if(onManage)add('Управление структурой',onManage);
 return nav;
}
