const palette=['#087ba5','#7957bd','#a45410','#197b69','#bd4571','#4a64ad'];
const companyColors=new Map([['vector','#4a64ad'],['horizon','#197b69']]);
export function companyColor(id){if(!id)return palette[0];if(companyColors.has(id))return companyColors.get(id);let hash=0;for(const c of String(id||''))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;const used=new Set(companyColors.values());let color;for(let i=0;i<palette.length;i++){const candidate=palette[(hash+i)%palette.length];if(!used.has(candidate)){color=candidate;break;}}if(!color){let hue=hash%360;while(used.has(`hsl(${hue} 55% 40%)`))hue=(hue+137)%360;color=`hsl(${hue} 55% 40%)`;}companyColors.set(id,color);return color;}
function contextBadge(company,label='Компания'){
 const badge=document.createElement('span');badge.className='company-context-badge';badge.dataset.authored='';badge.style.setProperty('--company-color',companyColor(company.id));badge.setAttribute('aria-label',`${label}: ${company.name}`);badge.textContent=`${label}: ${company.name}`;return badge;
}
export function initCompanyIdentity(){
 function refresh(){const app=window.deepAgentDemo;if(!app)return;const state=app.state(),companies=app.organization()?.companies||[],company=companies.find(c=>c.id===state.company_id);for(const c of [...companies].sort((a,b)=>String(a.id).localeCompare(String(b.id))))companyColor(c.id);document.body.style.setProperty('--company-color',companyColor(company?.id));const target=document.querySelector('#companies .firm small');if(target)target.classList.add('company-location');
  const heading=document.querySelector('#content>h1');if(heading&&company){let badge=heading.querySelector('.company-context-badge');if(!badge){badge=contextBadge(company);heading.append(badge);}else if(badge.dataset.companyId!==String(company.id)||badge.dataset.companyName!==company.name){badge.textContent=`Компания: ${company.name}`;badge.setAttribute('aria-label',`Компания: ${company.name}`);badge.style.setProperty('--company-color',companyColor(company.id));}badge.dataset.companyId=String(company.id);badge.dataset.companyName=company.name;}
  // A mailbox belongs to its account, not automatically to the active company.
  // Show the opening context separately from the mailbox address, and retain it
  // when the mailbox is minimized and restored from another workspace.
  for(const head of document.querySelectorAll('.mailbox-head'))if(company&&!head.querySelector('.company-context-badge'))head.append(contextBadge(company,'Открыто из компании'));
 }
 // Tree and empty-state renders can return before the section event. The
 // company name is updated on every company switch, including those paths.
 const name=document.querySelector('#company-name');if(name)new MutationObserver(refresh).observe(name,{childList:true,characterData:true,subtree:true});
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;refresh();});}}).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('deepagent-section-rendered',refresh);refresh();
}
