// Work-email syntax only. Delivery and mailbox ownership require confirmation mail.
const message='Укажите корректную почту, например name@company.ru.';
export function normalizeWorkEmail(value){
 value=String(value||'').trim();if(!value)return '';
 const parts=value.split('@');if(value.length>254||parts.length!==2||/[\s\x00-\x1f\x7f]/.test(value))throw Error(message);
 const [local,rawDomain]=parts;
 if(local.length>64||! /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local)||/[\/\\:?#%]/.test(rawDomain)||!rawDomain)throw Error(message);
 let domain;try{domain=new URL('https://'+rawDomain).hostname.toLowerCase();}catch{throw Error(message);}
 const labels=domain.split('.');if(labels.length<2||labels.some(label=>! /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))||labels.at(-1).length<2||/^\d+$/.test(labels.at(-1)))throw Error(message);
 const result=local+'@'+domain;if(result.length>254)throw Error(message);return result;
}
export function bindWorkEmail(input){
 input.type='email';input.inputMode='email';input.maxLength=254;
 const check=()=>{try{normalizeWorkEmail(input.value);input.setCustomValidity('');}catch(error){input.setCustomValidity(error.message);}};
 input.addEventListener('input',check);input.addEventListener('blur',()=>{try{input.value=normalizeWorkEmail(input.value);input.setCustomValidity('');}catch(error){input.setCustomValidity(error.message);}});
 return input;
}
