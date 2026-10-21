import {translate as t} from './i18n.js';
import {el,button} from './company-ui.js';
import {descendants} from './company-model.js';
import {createPeopleDrawer} from './people-drawer.js';
import {createStructureView} from './company-structure.js';
import {createSystemsView} from './business-systems.js';
import {initIntegrationCenter} from './integration-center.js';
import {initEmployeeContact} from './employee-contact.js';
import {initCurrentUser} from './current-user.js';
import {initObjectCards} from './object-cards.js';
export function initCompanyWorkspace(icon){
 const app=window.deepAgentDemo,administration=document.querySelector('#organization-settings-button'),sheet=el('link');if(administration)administration.hidden=true;sheet.rel='stylesheet';sheet.href=new URL('./company-workspace.css',import.meta.url);document.head.append(sheet);
 for(const [name,glyph] of [['Системы учёта','settings']]){const b=button(name,()=>{});b.dataset.section=name;b.prepend(icon(glyph));document.querySelector('.main-tabs').append(b);}
 const drawer=createPeopleDrawer(app,icon),structureView=createStructureView(app,drawer.showPeople),systemsView=createSystemsView(app);
 initObjectCards(app);initEmployeeContact(app);initIntegrationCenter(app);initCurrentUser(app,icon,drawer);
 const companyPicker=el('select',null,'org-company-picker');companyPicker.setAttribute('aria-label',t('Компания структуры'));companyPicker.hidden=true;document.querySelector('#workspace-context').append(companyPicker);companyPicker.onchange=()=>app.openSearchTarget({kind:'section',section:'Структура компании',company_id:companyPicker.value});
 function refresh(){const org=app.organization()||{},state=app.state(),company=org.companies?.find(c=>c.id===state.company_id),context={org,company,departments:(org.departments||[]).filter(d=>d.company_id===state.company_id&&!d.archived),people:(org.people||[]).filter(p=>p.company_id===state.company_id&&!p.archived)};companyPicker.hidden=!(state.section==='Персонал'&&state.sub==='Структура компании');if(!companyPicker.hidden){companyPicker.replaceChildren();for(const c of (org.companies||[]).filter(c=>!c.archived)){const option=el('option',c.name);option.value=c.id;option.dataset.authored='true';companyPicker.append(option);}companyPicker.value=state.company_id||'';}drawer.refresh(context);if(state.section!=='Персонал')drawer.close();if(state.section==='Персонал'&&!document.querySelector('#personnel-tools')){const tools=el('nav',null,'personnel-tools');tools.id='personnel-tools';tools.setAttribute('aria-label',t('Персонал'));const search=button('Найти сотрудника',()=>drawer.showPeople());search.id='personnel-directory';tools.append(search,button('Структура и иерархия',()=>app.openWorkspaceContext({company_id:state.company_id,section:'Персонал',sub:'Структура компании',department:'Все отделы'})));if(administration&&(!window.DeepAgentIdentityProvider?.current?.()||window.DeepAgentIdentityProvider.current().role==='owner'))tools.append(button('Управление структурой',()=>administration.click()));document.querySelector('#content').prepend(tools);} const structure=document.querySelector('#company-structure-host'),systems=document.querySelector('#company-systems-host');if(structure)structureView(structure,context);if(systems)systemsView(systems,state,context);}
 document.addEventListener('deepagent-section-rendered',refresh);document.addEventListener('deepagent-history-changed',refresh);document.addEventListener('deepagent-language-change',refresh);refresh();
}
