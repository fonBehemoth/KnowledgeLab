import {translate as t} from './i18n.js';
import {el,button} from './company-ui.js';
import {descendants} from './company-model.js';
import {createPeopleDrawer} from './people-drawer.js';
import {createStructureView} from './company-structure.js';
import {createSystemsView} from './business-systems.js';
import {initIntegrationCenter} from './integration-center.js';
import {initObjectCards} from './object-cards.js';
export function initCompanyWorkspace(icon){
 const app=window.deepAgentDemo,sheet=el('link');sheet.rel='stylesheet';sheet.href=new URL('./company-workspace.css',import.meta.url);document.head.append(sheet);
 for(const [name,glyph] of [['Структура компании','graph'],['Системы учёта','settings']]){const b=button(name,()=>{});b.dataset.section=name;b.prepend(icon(glyph));document.querySelector('.main-tabs').append(b);}
 const drawer=createPeopleDrawer(app,icon),structureView=createStructureView(app,drawer.showPeople),systemsView=createSystemsView(app);
 initObjectCards(app);initIntegrationCenter(app);
 const companyPicker=el('select',null,'org-company-picker');companyPicker.setAttribute('aria-label',t('Компания структуры'));companyPicker.hidden=true;document.querySelector('#workspace-context').append(companyPicker);companyPicker.onchange=()=>app.openSearchTarget({kind:'section',section:'Структура компании',company_id:companyPicker.value});
 function refresh(){const org=app.organization()||{},state=app.state(),company=org.companies?.find(c=>c.id===state.company_id),context={org,company,departments:(org.departments||[]).filter(d=>d.company_id===state.company_id&&!d.archived),people:(org.people||[]).filter(p=>p.company_id===state.company_id&&!p.archived)};companyPicker.hidden=state.section!=='Структура компании';if(!companyPicker.hidden){companyPicker.replaceChildren();for(const c of (org.companies||[]).filter(c=>!c.archived)){const option=el('option',c.name);option.value=c.id;option.dataset.authored='true';companyPicker.append(option);}companyPicker.value=state.company_id||'';}drawer.refresh(context);const structure=document.querySelector('#company-structure-host'),systems=document.querySelector('#company-systems-host');if(structure)structureView(structure,context);if(systems)systemsView(systems,state,context);}
 document.addEventListener('deepagent-section-rendered',refresh);document.addEventListener('deepagent-history-changed',refresh);document.addEventListener('deepagent-language-change',refresh);refresh();
}
