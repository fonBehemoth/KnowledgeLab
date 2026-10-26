import {translate as t} from './i18n.js';
export function avatarFace(person){
 const face=document.createElement('span');face.className='person-avatar-face'+(person.kind==='ai'?' is-digital':'');face.textContent=person.kind==='ai'?'AI':person.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('');
 if(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(person.photo_data||'')){const image=document.createElement('img');image.src=person.photo_data;image.alt='';image.onload=()=>face.replaceChildren(image);image.onerror=()=>image.remove();}return face;
}
export function personAvatar(person,onOpen,{leader=false}={}){
 const b=document.createElement('button');b.type='button';b.className='org-person-avatar';b.setAttribute('aria-label',person.name+' · '+person.position);if(leader)b.classList.add('is-leader');b.append(avatarFace(person));
 const tip=document.createElement('span');tip.className='org-person-tip';tip.setAttribute('role','tooltip');tip.id='profile-mini-'+crypto.randomUUID();b.setAttribute('aria-describedby',tip.id);tip.hidden=true;const name=document.createElement('strong'),job=document.createElement('small');name.textContent=person.name;job.textContent=person.position;tip.append(name,job);for(const value of [person._department_name,person.email].filter(Boolean)){const detail=document.createElement('small');detail.textContent=value;tip.append(detail);}b.append(tip);
 const hide=()=>{tip.hidden=true;if(tip.parentElement!==b)b.append(tip);};const show=()=>{document.body.append(tip);tip.hidden=false;const r=b.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(r.left,innerWidth-264))+'px';tip.style.top=Math.max(8,r.top-tip.offsetHeight-12)+'px';};b.onpointerenter=b.onfocus=show;b.onpointerleave=b.onblur=hide;b.onclick=()=>{hide();onOpen();};return b;
}
