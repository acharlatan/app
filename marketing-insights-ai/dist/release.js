import {metrics,delta,groupCampaigns} from './intelligence.js?v=release-1';
import {healthDetail} from './decision.js?v=release-1';
export function initializeRelease(api,getContext){
 const $=id=>document.getElementById(id),node=(tag,text,cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n};
 document.body.classList.add('premium');
 const intro=document.querySelector('.intro');intro.after($('kpis'));
 const brief=node('section','','overview-intelligence');brief.setAttribute('aria-label','Selected data intelligence');$('kpis').after(brief);
 const stamp=node('p','','selection-stamp');document.querySelector('.intro-copy .eyebrow').after(stamp);
 function update(){const s=getContext(),ctx=s.evidence,m=ctx.totals,fmt=v=>v===null?'Unavailable':v.toLocaleString('en-US',{maximumFractionDigits:2});stamp.textContent=`${s.source} · ${s.filters.from} — ${s.filters.to}`;brief.replaceChildren();
 const feature=node('article','','featured-insight');feature.append(node('span','THE OPPORTUNITY','section-kicker'));
 const best=ctx.channels.filter(c=>c.roas!==null).sort((a,b)=>b.roas-a.roas)[0];feature.append(node('h2',best?`${best.channel} leads at ${fmt(best.roas)}× ROAS`:'Your next signal starts with data'),node('p',best?'Check conversion quality, attribution and capacity before testing additional budget.':'No spend-based comparison is available. Adjust your selection or import a CSV.'));
 const link=node('a','Explore the evidence ↗','button');link.href='#ask-data';feature.append(link);
 const compare=node('article','','overview-change');compare.append(node('span','PERIOD COMPARISON','section-kicker'));const change=s.previous.length?delta(m.revenue,metrics(s.previous).revenue):null;compare.append(node('h2',change?.percent!==null&&change?`${change.percent>=0?'+':''}${fmt(change.percent)}%`:'No comparison'),node('p',change?'Attributed revenue vs your comparison period. Coverage may differ.':'Select a later range or a custom comparison to investigate change.'));
 const health=node('article','','overview-health');health.append(node('span','YOUR GOALS','section-kicker'));const goals={cpa:Number($('cpa-target').value),roas:Number($('health-roas').value),cpaWeight:Number($('health-cpa-weight').value),roasWeight:Number($('health-roas-weight').value)},checks=groupCampaigns(s.rows).map(c=>healthDetail(s.rows.filter(r=>r.campaign===c.campaign),goals)),met=checks.filter(c=>c.score===100).length;health.append(node('h2',checks.length?`${met} / ${checks.length}`:'No campaigns'),node('p','Campaigns meeting all weighted goals. Goal scores are descriptive, not benchmarks.'));brief.append(feature,compare,health);
 }
 document.addEventListener('mi:context',update);update();
 // This selector changes intent only; the form's submit + consent initiates a request.
 const selector=$('assistant-modes'),buttons=[...selector.querySelectorAll('button')],hint=$('mode-hint');
 function mode(value){const ai=value==='gemini';$('chat-gemini').checked=ai;buttons.forEach(b=>{const chosen=b.dataset.mode===value;b.setAttribute('aria-checked',String(chosen));b.tabIndex=chosen?0:-1});hint.textContent=ai?'Gemini interprets selected aggregates, labels, your question and up to four recent messages. Submit only nonconfidential data; consent is requested before sending.':'Local Analysis calculates from selected records. Your question and data stay in this browser.';}
 buttons.forEach((b,i)=>{b.onclick=()=>mode(b.dataset.mode);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;mode(buttons[next].dataset.mode);buttons[next].focus()}}});document.addEventListener('mi:mode',e=>mode(e.detail));mode('local');
 const old=$('chat-gemini').closest('label');old.hidden=true;
 // Keep the same input owner for imports; shortcuts simply invoke it.
 $('studio-sample').onclick=()=>$('sample').click();$('studio-reset').onclick=()=>$('reset').click();
 // Only display custom comparison controls when custom comparison is selected.
 $('health-roas').addEventListener('input',()=>api.refresh());
 const paths=document.querySelectorAll('a[href="#about"]');paths.forEach(a=>a.remove());
 const detail=document.querySelector('.project-detail');detail.querySelector('p:last-child').textContent='Browser-local workspaces: no accounts, cloud sync, ad-account connections or automated spend. Attribution and business outcomes require independent verification.';
 const links=node('p','','project-links');for(const [label,url]of [['Source on GitHub','https://github.com/acharlatan/app'],['Live application','https://acharlatan.github.io/app/']]){const a=node('a',label);a.href=url;links.append(a)}detail.append(links);
 document.querySelector('.workspace').textContent='MARKETING WORKSPACE';document.querySelector('header .workspace-heading').textContent='Marketing intelligence';
 document.querySelector('.intro-copy .eyebrow').textContent='EVIDENCE INTO ACTION';document.querySelector('.intro-lead').textContent='Know what changed. Decide what to test.';
 document.querySelector('.intro-sub').textContent='Measure campaign performance, ask better questions, and turn your next insight into a practical experiment.';
}
