export function initializeExperience(){
 const $=id=>document.getElementById(id),main=$('overview'),nav=$('main-nav');
 document.body.classList.add('immersive');
 const scope=document.createElement('details');scope.className='scope-drawer';const summary=document.createElement('summary');summary.textContent=`${$('date-from').value} → ${$('date-to').value} · Selection & comparison`;scope.append(summary);
 const all=[...main.children];let collecting=false;
 for(const node of all){if(node.id==='dashboard')collecting=true;if(node.id==='data-note')collecting=false;if(collecting)scope.append(node)}
 main.querySelector('header').after(scope);
 let view='overview';for(const node of [...main.children]){if(node.matches('header,footer')||node===scope)continue;if(node.classList.contains('intro'))view='overview';if(node.id==='data-note')view='dashboard';if(['ask-data','insights','campaign-health','budget-planner','funnel-explorer','campaigns','reports','data-studio','about'].includes(node.id))view=node.id;node.dataset.view=view}
 const titles={overview:'Your command center',dashboard:'Performance', 'ask-data':'Ask Your Data',insights:'Strategy Lab','campaign-health':'Campaign Health','budget-planner':'Budget Planner','funnel-explorer':'Funnel Explorer',campaigns:'Campaign Explorer',reports:'Reports','data-studio':'Data Studio',about:'Project details'};
 const crumb=main.querySelector('header>div');crumb.className='workspace-heading';crumb.textContent='Your command center';
 const jump=document.createElement('div');jump.className='launch-grid';jump.dataset.view='overview';[['ask-data','✳','Find the signal','Ask a question. Get the evidence.'],['insights','↗','Plan your next move','Turn a finding into a focused experiment.'],['dashboard','◈','Explore performance','See what changed across your campaigns.']].forEach(([id,icon,title,text])=>{const a=document.createElement('a');a.href='#'+id;const i=document.createElement('span');i.className='launch-icon';i.textContent=icon;const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=text;a.append(i,h,p);jump.append(a)});main.querySelector('.intro').after(jump);
 function disclose(node,label){if(!node)return;const d=document.createElement('details');d.className='depth-drawer';const s=document.createElement('summary');s.textContent=label;node.before(d);d.append(s,node);node.addEventListener('invalid',()=>d.open=true,true);return d}
 disclose($('structured-strategy'),'Recommendation · evidence & reasoning');
 const tools=document.querySelector('.strategy-tools');if(tools){[...tools.children].forEach((card,i)=>disclose(card,i?'Quick budget scenario':'Create an experiment'));}
 disclose($('action-plan'),'Your action checklist');
 const goals=document.querySelector('.breakdown .goal-controls');if(goals)disclose(goals,'Adjust margin & acquisition goals');
 const healthGoals=$('campaign-health').querySelector('.goal-controls');disclose(healthGoals,'Adjust scoring goals');
 document.querySelectorAll('p.hint').forEach(p=>{if(p.textContent.length>180&&!p.id&&!p.closest('details'))disclose(p,'Method & limitations')});
 const descriptions={'ask-data':'One question. Clear evidence. A practical next step.','insights':'Find a signal, choose a test, measure the outcome.','campaign-health':'See which campaigns meet your goals.','budget-planner':'Explore your options before committing spend.','reports':'Build a focused summary of your current selection.','data-studio':'Bring your data. Preview it before it becomes your analysis.'};
 for(const [id,text]of Object.entries(descriptions)){const p=$(id).querySelector(':scope > p:not([id])');if(p)p.textContent=text}
 const intro=document.querySelector('.intro-sub');intro.textContent='A calm space to understand performance and decide what comes next.';document.querySelector('.intro-actions .text-link').href='#ask-data';document.querySelector('.intro-actions .text-link').textContent='Ask your data ↗';document.querySelector('.intro-actions .button').href='#dashboard';
 function activate(){let id=location.hash.slice(1)||'overview';if(['diagnostics','kpis','comparison'].includes(id))id='dashboard';if(id==='action-plan')id='insights';if(id==='data-health')id='data-studio';if(!titles[id])id='overview';main.dataset.workspace=id;document.querySelectorAll('main>[data-view]').forEach(n=>n.hidden=n.dataset.view!==id);crumb.textContent=titles[id];nav.querySelectorAll('a').forEach(a=>{const selected=a.hash==='#'+id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'});}
 window.addEventListener('hashchange',activate);activate();
 document.addEventListener('mi:context',e=>{const c=e.detail;summary.textContent=`${c.filters.from} → ${c.filters.to} · ${c.filters.channel||'All channels'} · Selection & comparison`});
}
