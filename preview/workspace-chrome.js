import {translate} from './i18n.js';

// Native disclosures preserve tab order and existing button listeners.
export function disclosure(label,items=[],className=''){
 const root=document.createElement('details');root.className='workspace-disclosure '+className;
 const summary=document.createElement('summary');summary.textContent=translate(label);
 const panel=document.createElement('div');panel.className='disclosure-panel';panel.append(...items);root.append(summary,panel);
 root.addEventListener('toggle',()=>{if(root.open)for(const other of document.querySelectorAll('.workspace-disclosure[open]'))if(other!==root&&!other.contains(root)&&!root.contains(other))other.open=false;});
 root.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&root.open){event.preventDefault();root.open=false;summary.focus();}
  if(['ArrowDown','ArrowUp'].includes(event.key)){
   const buttons=[...panel.querySelectorAll('button:not(:disabled),a[href]')];if(!buttons.length)return;
   event.preventDefault();root.open=true;const i=buttons.indexOf(document.activeElement);
   const next=i<0?(event.key==='ArrowDown'?0:buttons.length-1):(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();
  }
 });
 panel.addEventListener('click',event=>{if(event.target.closest('button,a[href]'))root.open=false;});
 return root;
}

let initialized=false;
export function initWorkspaceChrome(){
 if(initialized)return;initialized=true;document.body.classList.add('organized-workspace');
 const link=document.createElement('link');link.rel='stylesheet';link.href='./workspace-chrome.css';document.head.append(link);
 document.addEventListener('pointerdown',event=>{for(const menu of document.querySelectorAll('.workspace-disclosure[open]'))if(!menu.contains(event.target))menu.open=false;});
 const sidebar=document.querySelector('#navigation-panel'),controls=document.querySelector('.chat-controls');
 const resources=disclosure('Материалы и анализ',[], 'workspace-resources');resources.id='workspace-resources';
 const panel=resources.querySelector('.disclosure-panel');
 for(const id of ['core-history-button','analytics-access','core-graph-button']){const item=document.getElementById(id);if(item)panel.append(item);}
 document.querySelector('.header-right').prepend(resources);
 const modes=disclosure('Диалог',[document.querySelector('#assistant-mode'),document.querySelector('#team-mode')],'conversation-modes');modes.id='conversation-modes';
 controls.prepend(modes);document.querySelector('#ask-form').before(controls);
 const updateMode=()=>{const active=modes.querySelector('button.active');const summary=modes.querySelector('summary');if(active&&summary.textContent!==active.textContent)summary.textContent=active.textContent;};
 modes.addEventListener('click',()=>queueMicrotask(updateMode));
 const firstLabel=sidebar.querySelector(':scope > .label');
 const company=disclosure('Компания',[],'company-disclosure');company.id='company-disclosure';
 const companyPanel=company.querySelector('.disclosure-panel');
 for(const selector of ['#companies','#add-company','.neighbors','#company-dots']){const item=sidebar.querySelector(selector);if(item)companyPanel.append(item);}
 firstLabel?.replaceWith(company);
 const summary=company.querySelector('summary'),label=document.createElement('small'),name=document.createElement('strong');label.textContent=translate('Компания');name.dataset.authored='true';summary.replaceChildren(label,name);
 const syncCompany=()=>{const value=document.getElementById('company-name')?.textContent||translate('Выберите компанию');if(name.textContent!==value)name.textContent=value;};
 const nameSource=document.getElementById('company-name');if(nameSource)new MutationObserver(syncCompany).observe(nameSource,{childList:true,characterData:true,subtree:true});
 companyPanel.addEventListener('click',event=>{if(event.target.closest('#add-company'))company.open=false;});
 const departmentLabel=sidebar.querySelector('label[for="department-select"]');if(departmentLabel)departmentLabel.textContent=translate('Подразделение');
 const sectionLabel=sidebar.querySelector('.section-choice .step-label');if(sectionLabel)sectionLabel.textContent=translate('Рабочие разделы');
 const employeeLabel=sidebar.querySelector('#person-controls>.step-label');if(employeeLabel)employeeLabel.textContent=translate('Сотрудник');
 const settings=document.getElementById('app-settings-button');if(settings)settings.textContent=translate('Настройки приложения');
 // The employee activity remains a direct action; the empty prompt is redundant.
 const activity=()=>{const selected=!!window.deepAgentDemo?.state().employee;document.getElementById('activity-button').hidden=!selected;document.body.classList.toggle('has-selected-employee',selected);updateMode();syncCompany();};
 document.addEventListener('deepagent-section-rendered',activity);document.addEventListener('deepagent-language-change',activity);activity();
}
