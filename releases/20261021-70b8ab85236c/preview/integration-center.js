import {el,button} from './company-ui.js';
import {translate as t} from './i18n.js';

export const accountingSystems={
 ERP:['Планирование ресурсов','Финансы, закупки, продажи и управленческие показатели.'],
 WMS:['Управление складом','Остатки, складские операции и движение товаров.'],
 MRP:['Планирование производства','Потребности в материалах, производственные задания и сроки.'],
 CRM:['Работа с клиентами','Контакты, сделки, обращения и задачи.']
};
const storageKey='deepagent-integration-plans-v1';
function dialog(title){
 const node=el('dialog',null,'organization-dialog integration-dialog'),head=el('div',null,'dialog-head');
 head.append(el('h2',title),button('Закрыть',()=>node.close()));node.append(head);
 node.addEventListener('close',()=>node.remove());document.body.append(node);node.showModal();return node;
}
function companyById(app,id){const company=app.organization().companies.find(c=>c.id===id&&!c.archived);if(!company)throw Error(t('Компания недоступна.'));return company;}
function localPlans(){return JSON.parse(localStorage.getItem(storageKey)||'{}');}
const readPlan=(company,system)=>window.DeepAgentIntegrationProvider?window.DeepAgentIntegrationProvider.read(company,system):Promise.resolve(localPlans()[company]?.[system]||{revision:0,product:'',address:'',direction:'read_only'});
async function savePlan(company,system,value){
 if(window.DeepAgentIntegrationProvider)return window.DeepAgentIntegrationProvider.save(company,system,value);
 const plans=localPlans(),current=plans[company]?.[system];if((current?.revision||0)!==value.revision)throw Error(t('Параметры изменены в другом окне. Откройте настройку заново.'));
 const saved={...value,revision:value.revision+1};(plans[company]??={})[system]=saved;localStorage.setItem(storageKey,JSON.stringify(plans));return saved;
}
export async function openSystemConnection(app,companyId,system){
 const company=companyById(app,companyId);if(!accountingSystems[system])return;
 const node=dialog(system+' · '+company.name),status=el('p',t('Параметры загружаются…'));status.setAttribute('role','status');node.append(status);
 try{
  let saved=await readPlan(companyId,system);if(!node.open)return;status.textContent=t(saved.revision?'Параметры сохранены. Подключение не проверено.':'Подключение не настроено.');
  const form=el('form',null,'integration-form'),fields={};
  for(const [name,caption,type,value] of [['product','Название учётной системы','text',saved.product],['address','Адрес подключения','url',saved.address]]){
   const label=el('label',t(caption)),input=el('input');input.type=type;input.required=true;input.maxLength=name==='product'?160:1000;input.value=value||'';input.autocomplete='off';label.append(input);form.append(label);fields[name]=input;
  }
  form.append(el('p',t('Получение данных из учётной системы. Изменение исходных данных не включено.')));
  form.append(el('p',t('Пока доступны сохранение параметров и анализ выгрузок. Автоматический обмен данными ещё не подключён.')));
  const save=el('button',t('Сохранить параметры'));save.type='submit';form.append(save);node.append(form);
  form.onsubmit=async event=>{event.preventDefault();save.disabled=true;try{
   companyById(app,companyId);const address=fields.address.value.trim(),url=new URL(address);
   if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw Error(t('Укажите адрес HTTP/HTTPS без пароля, параметров и фрагмента.'));
   saved=await savePlan(companyId,system,{revision:saved.revision,product:fields.product.value.trim(),address,direction:'read_only'});
   status.textContent=t('Параметры сохранены. Обмен данными ещё не включён.');
  }catch(error){status.textContent=error.message;}finally{save.disabled=false;}};
 }catch(error){status.textContent=error.message;}
}
export async function openCompanyMail(app,companyId){
 const company=companyById(app,companyId),node=dialog(t('Корпоративная почта')+' · '+company.name);
 if(window.DeepAgentMailProvider){try{await window.DeepAgentMailProvider.open(node,companyId);}catch(error){node.append(el('p',error.message));}}
 else node.append(el('p',t('Настройка и синхронизация почты доступны в установленном приложении.')),el('p',t('Корпоративные серверы и почтовые сервисы с защищённым доступом IMAP/SMTP.')));
}
export function openIntegrationCenter(app){
 const node=dialog(t('Интеграции')),label=el('label',t('Компания')),select=el('select'),host=el('div',null,'integration-list');select.setAttribute('aria-label',t('Компания интеграций'));
 for(const company of app.organization().companies.filter(c=>!c.archived)){const option=el('option',company.name);option.value=company.id;select.append(option);}select.value=app.state().company_id;
 label.append(select);node.append(label,host);
 const render=()=>{host.replaceChildren();for(const [system,[name,detail]] of Object.entries(accountingSystems)){
  const card=el('article',null,'system-card');card.append(el('h3',system+' · '+t(name)),el('p',t(detail)),button('Настроить подключение',()=>openSystemConnection(app,select.value,system)));host.append(card);
 }const mail=el('article',null,'system-card');mail.append(el('h3',t('Почта')),el('p',t('Корпоративная почта и почтовые сервисы.')),button('Настроить почту',()=>openCompanyMail(app,select.value)));host.append(mail);};select.onchange=render;render();
}
function openRegulations(app){
 const company=companyById(app,app.state().company_id),node=dialog(t('Регламенты компании')+' · '+company.name),records=Object.values(app.employeeRecords()).filter(r=>r._company_id===company.id&&r.rules);
 for(const record of records){const person=app.organization().people.find(p=>p.id===record._employee_id),card=el('article',null,'system-card');card.append(el('h3',person?.name||t('Рабочий контекст')),el('p',record.rules));if(person)card.append(button('Редактировать',()=>{node.close();app.openWorkspaceContext({company_id:company.id,employee_id:person.id,section:'Персонал',sub:'Настройки'});}));node.append(card);}
 if(!records.length)node.append(el('p',t('Регламенты можно задать в настройках рабочего контекста сотрудника.')));
}
export function initIntegrationCenter(app){
 const settings=document.querySelector('#app-settings-dialog');if(!settings)return;
 const section=el('section',null,'integration-settings-entry');section.append(el('h3',t('Подключения и правила')),button('Интеграции',()=>{settings.close();openIntegrationCenter(app);}),button('Регламенты компании',()=>{settings.close();openRegulations(app);}));settings.append(section);
}
