const palette=['#087ba5','#7957bd','#a45410','#197b69','#bd4571','#4a64ad'];
const companyColors=new Map([['vector','#4a64ad'],['horizon','#197b69']]);
export function companyColor(id){if(companyColors.has(id))return companyColors.get(id);let hash=0;for(const c of String(id||''))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return palette[hash%palette.length];}
export function initCompanyIdentity(){
 function refresh(){const app=window.deepAgentDemo;if(!app)return;const state=app.state(),company=app.organization()?.companies?.find(c=>c.id===state.company_id);document.body.style.setProperty('--company-color',companyColor(company?.id));const target=document.querySelector('#companies .firm small');if(target)target.classList.add('company-location');}
 // Tree and empty-state renders can return before the section event. The
 // company name is updated on every company switch, including those paths.
 const name=document.querySelector('#company-name');if(name)new MutationObserver(refresh).observe(name,{childList:true,characterData:true,subtree:true});
 document.addEventListener('deepagent-section-rendered',refresh);refresh();
}
