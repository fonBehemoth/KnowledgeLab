// Authored sample ledger, not tax rates, declarations or production accounting data.
export const months=['Апрель','Май','Июнь','Июль','Август','Сентябрь'];
export const ledger=[320000,342000,331000,368000,394000,418000].map((revenue,i)=>({
 month:months[i],revenue,cogs:Math.round(revenue*.52),payroll:51000,overhead:55000,
 depreciation:7000,interest:2000,profitTax:[7000,8100,8200,9100,9400,9800][i],
 outputVat:[21000,22500,21800,24300,26000,27600][i],inputVat:[13000,14200,13700,15100,16200,16900][i],
 employerContributions:6900,receipts:Math.round(revenue*.94),cashPayments:Math.round(revenue*.52)+51000+55000,
 investments:[18000,8000,12000,16000,9000,15000][i],taxPayments:[6500,7200,7100,8000,8800,11000][i],financing:-4000,
 plan:Math.round(revenue*1.035),orders:[42,45,44,48,51,56][i],onTime:[39,43,42,45,49,54][i]
}));
export function summary(companyId,period='half'){
 const factor=companyId==='horizon'?.64:1,from=period==='month'?5:period==='quarter'?3:0,allRows=ledger.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='number'?Math.round(v*factor):v]))),rows=allRows.slice(from);
 const sum=key=>rows.reduce((a,r)=>a+r[key],0),revenue=sum('revenue'),gross=revenue-sum('cogs'),ebitda=gross-sum('payroll')-sum('overhead')-sum('employerContributions'),ebit=ebitda-sum('depreciation'),beforeTax=ebit-sum('interest'),net=beforeTax-sum('profitTax');
 const opening=240000*factor+allRows.slice(0,from).reduce((a,r)=>a+r.receipts-r.cashPayments-r.employerContributions-r.taxPayments-r.investments+r.financing,0);
 const operatingCash=sum('receipts')-sum('cashPayments')-sum('employerContributions')-sum('taxPayments'),cash=opening+operatingCash-sum('investments')+sum('financing');
 return {rows,period,companyId,factor,sum,revenue,gross,ebitda,ebit,beforeTax,net,operatingCash,opening,cash,ar:Math.round(192000*factor),overdue:Math.round(38000*factor),ap:Math.round(128000*factor),inventory:Math.round(285000*factor),loans:Math.round(160000*factor),fixedAssets:Math.round(510000*factor),vat:sum('outputVat')-sum('inputVat'),plan:sum('plan'),orders:sum('orders'),onTime:sum('onTime')};
}
