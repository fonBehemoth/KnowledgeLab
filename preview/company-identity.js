const palette=['#087ba5','#7957bd','#a45410','#197b69','#bd4571','#4a64ad'];
export function companyColor(id){let hash=0;for(const c of String(id||''))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return palette[hash%palette.length];}
export function initCompanyIdentity(){
 function refresh(){const app=window.deepAgentDemo;if(!app)return;const state=app.state(),company=app.organization()?.companies?.find(c=>c.id===state.company_id);document.body.style.setProperty('--company-color',companyColor(company?.id));const target=document.querySelector('#companies .firm small');if(target)target.classList.add('company-location');}
 document.addEventListener('deepagent-section-rendered',refresh);refresh();
}
