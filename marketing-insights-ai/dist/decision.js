import {metrics,health} from './intelligence.js?v=release-1';
export function explorerRows(rows,query='',sort='date'){
 const q=query.trim().toLowerCase(),keys={date:['date',1],newest:['date',-1],revenue:['revenue',-1],spend:['spend',-1],campaign:['campaign',1],roas:['roas',-1],cpa:['cpa',1]},[key,dir]=keys[sort]||keys.date;
 const value=r=>key==='roas'?(r.spend?r.revenue/r.spend:null):key==='cpa'?(r.conversions?r.spend/r.conversions:null):r[key];
 return rows.filter(r=>!q||[r.campaign,r.channel,r.objective,r.date].some(v=>String(v||'').toLowerCase().includes(q))).slice().sort((a,b)=>{const x=value(a),y=value(b);if(x===null)return y===null?0:1;if(y===null)return -1;return typeof x==='string'?x.localeCompare(y)*dir:(x-y)*dir});
}
export function datasetKey(rows){let h=2166136261;for(const r of rows)for(const c of JSON.stringify(r)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)+':'+rows.length}
export function restoreScenario(saved,rows){
 if(!saved||!Array.isArray(saved.projection)||!saved.filters)throw Error('This saved scenario is incomplete. Export it before creating a new one.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(saved.filters.from)||!/^\d{4}-\d{2}-\d{2}$/.test(saved.filters.to)||saved.filters.from>saved.filters.to)throw Error('Invalid saved reporting dates.');
 if(saved.filters.campaign&&!rows.some(r=>r.campaign===saved.filters.campaign))throw Error('This saved campaign is absent from the current dataset.');
 if(saved.filters.objective&&!rows.some(r=>r.objective===saved.filters.objective))throw Error('This saved objective is absent from the current dataset.');
 if(saved.datasetKey&&saved.datasetKey!==datasetKey(rows))throw Error('This scenario belongs to a different dataset. Import that dataset before restoring.');
 if(!Number.isFinite(saved.efficiency)||saved.efficiency<0||saved.efficiency>200)throw Error('Invalid saved efficiency.');
 const allocations={};for(const p of saved.projection){if(!['Paid Search','Paid Social','Email'].includes(p.channel)||!Number.isFinite(p.budget)||p.budget<0||p.budget>1e7)throw Error('Invalid saved allocation.');allocations[p.channel]=p.budget}return {filters:{...saved.filters},efficiency:saved.efficiency,allocations};
}
export function strategyFor(objective,rows){const m=metrics(rows);const strategies={
 'Reduce CPA':['CPA','Test a clearer qualification message in one ad or landing-page variant.','A more specific promise may improve qualified conversions per click.','CPA below the chosen target, without reducing conversion quality.'],
 'Increase ROAS':['ROAS','Test a higher-value offer in one channel, holding audience and budget comparable.','An offer aligned with higher-value purchases may improve attributed revenue per dollar.','ROAS above the chosen goal, with stable customer quality and margin.'],
 'Improve conversion rate':['Conversion rate','Test one simpler landing-page call to action against the current page.','Reducing one point of friction may increase completed conversions per click.','Conversion rate above the recorded baseline, with stable qualification.'],
 'Improve budget efficiency':['CPA','Test a small allocation shift from the lowest observed ROAS channel with a comparable control.','A controlled shift may improve efficiency if audience capacity and quality remain stable.','Higher ROAS without exceeding the chosen CPA target.'],
 'Generate more leads':['CPA','Test a dedicated lead offer with one shorter qualification form.','A relevant offer may increase qualified leads at a sustainable acquisition cost.','More qualified leads while keeping CPA within target.'],
 'Improve campaign reach':['CTR','Collect unique reach and frequency before testing a new audience.','A new audience may expand unique exposure; impressions alone cannot establish it.','Predefine unique reach and frequency goals after collecting those fields.'],
 'Increase engagement':['CTR','Test one opening message and collect engagement events.','A clearer opening may improve response; engagement requires an engagements column.','Predefine an engagement-rate goal with a conversion-quality guardrail.']};
 const [kpi,action,hypothesis,success]=strategies[objective]||strategies['Reduce CPA'];return {kpi,action,hypothesis,success,metrics:m};
}
export function healthDetail(rows,options){const h=health(rows,options),m=metrics(rows);return {...h,metrics:m,summary:h.score===null?'Insufficient evidence':h.checks.every(c=>c.pass)?'Goals met':h.checks.every(c=>!c.pass)?'Goals missed':'Mixed performance'};}
export function experimentBaseline(original,candidate,allRows){
 if(original&&original.channel===candidate.channel&&original.kpi===candidate.kpi)return {baseline:original.baseline,filters:{...original.filters}};
 const filters=original&&original.channel===candidate.channel?{...original.filters}:{...candidate.filters};const rows=allRows.filter(r=>(!filters.from||r.date>=filters.from)&&(!filters.to||r.date<=filters.to)&&(!filters.campaign||r.campaign===filters.campaign)&&(!filters.objective||r.objective===filters.objective)&&r.channel===candidate.channel);if(!rows.length)throw Error('The original experiment scope is not available in this dataset. Keep its KPI/channel or import the original data.');
 const key={CPA:'cpa',ROAS:'roas','Conversion rate':'cvr',CTR:'ctr'}[candidate.kpi];if(!key)throw Error('Unsupported experiment KPI.');const value=metrics(rows)[key];return {baseline:value===null?'Unavailable':value.toLocaleString('en-US',{maximumFractionDigits:2}),filters};
}
