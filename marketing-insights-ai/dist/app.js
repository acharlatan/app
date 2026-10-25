import {initializePlatform} from './platform.js';
import {config} from './config.js';
import {metrics,evidence,filterRows} from './intelligence.js';
import { fields, channels, demo, aggregate, ratio, parseCSV, csv } from './analytics.js';

const $ = id => document.getElementById(id);
let activeEvidence=null;document.addEventListener('mi:context',event=>{activeEvidence=event.detail});
let generation=0;let page = 0; let data = demo, filtered = [], lastInsight = '', source = 'Fictional demo';
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const num = value => new Intl.NumberFormat('en-US').format(value);
const mult = value => value === null ? '—' : value.toFixed(2) + '×';
const pctChange = (first, last) => first ? `${((last - first) / first * 100) > 0 ? '+' : ''}${((last - first) / first * 100).toFixed(1)}%` : '—';

function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function render() {
  generation++;document.querySelector('.badge').textContent=source==='Fictional demo'?'SYNTHETIC DEMO DATA':'UPLOADED DATA · LOCAL';
  filtered = data.filter(row => ($('channel').value === 'All channels' || row.channel === $('channel').value) && (!$('date-from').value || row.date >= $('date-from').value) && (!$('date-to').value || row.date <= $('date-to').value) && (!$('campaign-filter')?.value||row.campaign===$('campaign-filter').value) && (!$('objective-filter')?.value||row.objective===$('objective-filter').value));
  filtered.sort((a,b)=>a.date.localeCompare(b.date)||a.channel.localeCompare(b.channel));
  lastInsight = '';
  const summary = aggregate(filtered);
  $('kpis').replaceChildren();
  [
    ['Attributed revenue', money(summary.revenue), 'USD · selected campaigns'],
    ['Campaign spend', money(summary.spend), 'USD · marketing investment'],
    ['Return on ad spend', mult(ratio(summary.revenue, summary.spend)), 'Attributed revenue ÷ spend'],
    ['Conversions', num(summary.conversions), `CPA ${summary.conversions ? money(summary.spend / summary.conversions) : '—'} · CTR ${summary.impressions ? (summary.clicks / summary.impressions * 100).toFixed(2) + '%' : '—'}`]
  ].forEach(([label, value, sub]) => {
    const card = document.createElement('div'); card.className = 'kpi';
    for (const [className, text] of [['label', label], ['value', value], ['sub', sub]]) {
      const el = document.createElement('div'); el.className = className; el.textContent = text; card.append(el);
    }
    $('kpis').append(card);
  });
  $('rows').replaceChildren();
  page=Math.min(page,Math.max(0,Math.ceil(filtered.length/15)-1));
  for (const row of filtered.slice(page*15,page*15+15)) {
    const tr = document.createElement('tr');
    [row.date, row.campaign, row.channel, money(row.spend), money(row.revenue), num(row.clicks), num(row.conversions), mult(ratio(row.revenue, row.spend))].forEach((text, index) => {
      const td = document.createElement('td'); td.textContent = text; if (index === 7) td.className = 'roas'; tr.append(td);
    });
    $('rows').append(tr);
  }
  $('row-count').textContent = `${filtered.length} campaign records · ${source} · USD`;
  $('mix').replaceChildren();
  for (const channel of channels) {
    const revenue = aggregate(filtered.filter(row => row.channel === channel)).revenue;
    const percent = summary.revenue ? revenue / summary.revenue * 100 : 0;
    const el = document.createElement('div'); el.className = 'mix-row';
    const label = document.createElement('div'); label.className = 'mix-label';
    const name = document.createElement('span'); name.textContent = channel;
    const value = document.createElement('b'); value.textContent = `${percent.toFixed(1)}%`;
    const track = document.createElement('div'); track.className = 'track';
    const bar = document.createElement('div'); bar.style.width = `${percent}%`;
    label.append(name, value); track.append(bar); el.append(label, track); $('mix').append(el);
  }
  chart(); story(); insights(); breakdown(); serviceRender();
  document.dispatchEvent(new Event('mi:render'));
  $('data-note').textContent = `${source} · ${filtered.length} selected records · ${$('channel').value}`;
}

function chart() {
  const months = [...new Set(filtered.map(row => row.date.slice(0, 7)))].sort();
  const points = months.map(month => ({ month, ...aggregate(filtered.filter(row => row.date.startsWith(month))) }));
  const max = Math.max(1, ...points.map(row => Math.max(row.revenue, row.spend))) * 1.15;
  const width = 600, height = 210, left = 60, bottom = 177;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly revenue and spend"><title>Revenue and spend by month</title>`;
  for (let i = 0; i < 4; i++) {
    const y = bottom - i * 50;
    svg += `<line x1="${left}" x2="590" y1="${y}" y2="${y}" stroke="#e9ede1" stroke-dasharray="3 4"/><text x="0" y="${y + 4}" fill="#88917e" font-size="10">${money(max * i / 3)}</text>`;
  }
  const spacing = 520 / Math.max(1, points.length);
  points.forEach((row, index) => {
    const x = left + spacing * (index + .5), barWidth = Math.min(35, spacing * .25);
    for (const [key, offset, color] of [['revenue', -barWidth, '#234d3a'], ['spend', 2, '#bad472']]) {
      const barHeight = row[key] / max * 150;
      svg += `<rect x="${x + offset}" y="${bottom - barHeight}" width="${barWidth - 2}" height="${barHeight}" rx="4" fill="${color}" tabindex="0" role="button" data-month="${row.month}" aria-label="${row.month} ${key}: ${money(row[key])}"><title>${row.month}: revenue ${money(row.revenue)}, spend ${money(row.spend)}</title></rect>`;
    }
    svg += `<text x="${x}" y="200" text-anchor="middle" fill="#77836d" font-size="10">${row.month}</text>`;
  });
  svg += '</svg>';
  $('chart').innerHTML = points.length ? svg : 'No data matches these filters.';
  $('chart-detail').textContent = points.length ? 'Select a bar to inspect a month.' : 'Try another filter or upload campaign data.';
  document.querySelectorAll('[data-month]').forEach(el => {
    const show = () => {
      const row = points.find(item => item.month === el.dataset.month);
      $('chart-detail').textContent = `${row.month} · Revenue ${money(row.revenue)} · Spend ${money(row.spend)} · ROAS ${mult(ratio(row.revenue, row.spend))}`;
    };
    el.onclick = show;
    el.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(); } };
  });
}

function story() {
  const monthly = [...new Set(filtered.map(row => row.date.slice(0, 7)))].sort().map(month => ({ month, ...aggregate(filtered.filter(row => row.date.startsWith(month))) }));
  const ranked = channels.map(channel => ({ channel, ...aggregate(filtered.filter(row => row.channel === channel)) })).filter(row => row.spend > 0).sort((a, b) => b.revenue / b.spend - a.revenue / a.spend);
  const first = monthly[0], last = monthly.at(-1);
  if (!filtered.length) {
    $('story-signal').textContent = 'No campaign data matches these filters.';
    $('story-evidence').textContent = 'Clear a filter or upload a CSV to explore a new signal.';
    $('story-action').textContent = 'Start with a complete date range and confirm every required field.';
    $('story-title').textContent = 'Your next signal starts with data';
    return;
  }
  if (monthly.length > 1) {
    const revenueChange = (last.revenue - first.revenue) / (first.revenue || 1) * 100;
    const spendChange = (last.spend - first.spend) / (first.spend || 1) * 100;
    $('story-title').textContent = revenueChange >= spendChange ? 'Revenue is outpacing investment' : 'Spend is rising faster than revenue';
    $('story-signal').textContent = `Revenue ${pctChange(first.revenue, last.revenue)} · Spend ${pctChange(first.spend, last.spend)}`;
    $('story-evidence').textContent = `${first.month} → ${last.month}: ${money(first.revenue)} to ${money(last.revenue)} in attributed revenue, against ${money(first.spend)} to ${money(last.spend)} in spend.`;
    $('story-action').textContent = 'Check conversion quality and margin, then test a small budget shift with a clear CPA guardrail.';
  } else {
    const best = ranked[0];
    $('story-title').textContent = 'A channel signal to investigate';
    $('story-signal').textContent = best ? `${best.channel} leads at ${mult(best.revenue / best.spend)} ROAS` : 'No spend recorded in this selection.';
    $('story-evidence').textContent = best ? `${best.month || monthly[0].month} · ${money(best.revenue)} attributed revenue from ${money(best.spend)} spend. ROAS does not equal profit.` : 'Select campaigns with recorded spend to compare channel performance.';
    $('story-action').textContent = 'Compare conversion quality and audience overlap before changing budget.';
  }
}

function insights() {
  const ranked = channels.map(channel => ({ channel, ...aggregate(filtered.filter(row => row.channel === channel)) })).filter(row => row.spend > 0).sort((a, b) => b.revenue / b.spend - a.revenue / a.spend);
  const best = ranked[0], low = ranked.at(-1);
  $('insight-output').replaceChildren();
  if (lastInsight) {
    const card = document.createElement('article'); card.className = 'strategy-card ai-response';
    const top = document.createElement('div'); top.className = 'strategy-top';
    const number = document.createElement('span'); number.className = 'strategy-num'; number.textContent = 'AI';
    const tag = document.createElement('span'); tag.className = 'strategy-tag'; tag.textContent = 'Gemini · AI-generated'; top.append(number, tag);
    const body = document.createElement('p'); body.textContent = `${lastInsight}\n\nReview recommendations before taking action.`; card.append(top, body); $('insight-output').append(card); return;
  }
  const items = [
    { tag: 'FIND THE SIGNAL', title: best ? `Start with ${best.channel}` : 'Start with clean data', evidence: best ? `Observed ROAS is ${mult(best.revenue / best.spend)} (${money(best.revenue)} attributed revenue / ${money(best.spend)} spend).` : 'There is no spend data in the current selection.', test: 'Check margin, conversion quality, attribution windows, and audience overlap before scaling.' },
    { tag: 'TEST THE NEXT MOVE', title: low && low !== best ? `Investigate ${low.channel}` : 'Choose one variable to test', evidence: low && low !== best ? `It has the lowest observed ROAS in this selection at ${mult(low.revenue / low.spend)}.` : 'The current filters do not show a clear channel comparison.', test: 'Test one creative or audience change. Set a CPA target and compare against a holdout where possible.' },
    { tag: 'KEEP THE CONTEXT', title: 'Treat attribution as a clue', evidence: 'Attributed revenue describes tracked conversions; it does not prove incremental lift or profit.', test: 'Record the hypothesis, audience, timeframe, and success metric before the experiment starts.' }
  ];
  items.forEach((item, index) => {
    const card = document.createElement('article'); card.className = 'strategy-card';
    const top = document.createElement('div'); top.className = 'strategy-top';
    const number = document.createElement('span'); number.className = 'strategy-num'; number.textContent = `0${index + 1}`;
    const tag = document.createElement('span'); tag.className = 'strategy-tag'; tag.textContent = item.tag; top.append(number, tag);
    const title = document.createElement('h3'); title.textContent = item.title;
    const evidenceLabel = document.createElement('span'); evidenceLabel.className = 'card-label'; evidenceLabel.textContent = 'Evidence';
    const evidence = document.createElement('p'); evidence.textContent = item.evidence;
    const testLabel = document.createElement('span'); testLabel.className = 'card-label'; testLabel.textContent = index === 2 ? 'Guardrail' : 'Next test';
    const test = document.createElement('p'); test.textContent = item.test;
    card.append(top, title, evidenceLabel, evidence, testLabel, test); $('insight-output').append(card);
  });
}

function periods() {
  const selected = $('period').value;
  $('period').replaceChildren(new Option('All periods', 'all'));
  for (const month of [...new Set(data.map(row => row.date.slice(0, 7)))].sort().reverse()) {
    $('period').add(new Option(new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), month));
  }
  if ([...$('period').options].some(option => option.value === selected)) $('period').value = selected;
}

$('channel').onchange = () => {page=0;render()};
$('period').onchange = () => {const month=$('period').value;if(month==='all'){setFullRange()}else{$('date-from').value=month+'-01';const [y,m]=month.split('-').map(Number);$('date-to').value=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10)}page=0;render()};
$('sample').onclick = () => download('marketing-sample.csv', csv(demo), 'text/csv');
$('reset').onclick = () => { $('campaign-filter').value='';$('objective-filter').value='';data = demo; source = 'Fictional demo'; periods(); setFullRange(); page=0;render(); $('upload-status').textContent = 'Demo data restored.'; };
$('upload').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 500000) throw Error('CSV must be under 500 KB.');
    data = parseCSV(await file.text()); source = 'Uploaded data'; periods(); setFullRange(); page=0;render();
    $('upload-status').textContent = `Imported ${data.length} records. Stored only in this tab.`;
  } catch (error) { $('upload-status').textContent = error.message; }
  event.target.value = '';
};

$('report').onclick = () => {
  const summary = aggregate(filtered);
  download('marketing-insights-report.txt', `MARKETING INSIGHTS AI\nBy Geovanni Hernandez\nGenerated: ${new Date().toISOString()}\nSource: ${source}\nChannel: ${$('channel').value}; dates: ${$('date-from').value} to ${$('date-to').value}\nRecords: ${filtered.length}\nRevenue: ${money(summary.revenue)}\nSpend: ${money(summary.spend)}\nROAS: ${mult(ratio(summary.revenue, summary.spend))}\nConversions: ${summary.conversions}\n\nPERFORMANCE BREAKDOWN\nMargin assumption: ${$('margin').value}%\nCPA target: ${$('cpa-target').value} USD\n${$('performance-breakdown').innerText}\n\nSTRATEGY\n${$('insight-output').innerText}\n\n${lastInsight ? 'AI-generated: verify all recommendations.' : 'Rules-based observations, not AI-generated.'}\nFictional demo data does not demonstrate real business results. Attributed revenue does not establish incrementality.\n\nPERIOD COMPARISON\n${$("comparison").innerText}\n\nSAVED EXPERIMENT\n${savedExperiment?experimentText(savedExperiment):"No experiment saved."}\n\nCAMPAIGN CSV\n${csv(filtered)}`);
};

try { $('endpoint').value = config.apiBase || localStorage.getItem('mi-worker') || ''; } catch {}
$('save-endpoint').onclick = () => {
  try {
    const url = new URL($('endpoint').value);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.workers.dev') || url.username || url.password || url.search || url.hash) throw Error();
    localStorage.setItem('mi-worker', url.origin); $('endpoint').value = url.origin;
    $('ai-status').textContent = 'Worker URL saved. Connection is not verified until an AI request succeeds.'; $('generate').textContent='Generate AI insights ↗';
  } catch { $('ai-status').textContent = 'Enter a valid HTTPS workers.dev URL (no key, query, or password).'; }
};

$('generate').onclick = async () => {
  const button = $('generate'); let endpoint;
  try { endpoint = new URL($('endpoint').value); if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.workers.dev')) throw Error(); }
  catch { $('ai-setup').open = true; $('ai-status').textContent = 'Add your HTTPS Cloudflare Worker URL below, then save the connection. Your local analysis is ready now.'; $('ai-setup').scrollIntoView({behavior:'smooth',block:'center'}); $('endpoint').focus(); return; }
  if (!filtered.length) { $('insight-output').textContent = 'No selected data to analyze.'; return; }
  if (!confirm('Send aggregated channel metrics to your Worker and Google Gemini? Do not send confidential data.')) return;
  button.disabled = true; button.textContent = 'Analyzing…'; $('insight-output').textContent = 'Requesting Gemini insights…';
  try {
    const summary = [...new Set(filtered.map(r=>r.channel))].map(channel => ({ channel, ...aggregate(filtered.filter(row => row.channel === channel)) }));
    const context=activeEvidence||evidence(filtered,{from:$('date-from').value,to:$('date-to').value,channel:$('channel').value,campaign:$('campaign-filter').value,objective:$('objective-filter').value});
    const requestGeneration=generation;
    const response = await fetch(endpoint.origin + '/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary,context }), signal: AbortSignal.timeout(25000) });
    const result = await response.json(); if (!response.ok) throw Error(result.error || 'AI service unavailable.');
    if(requestGeneration!==generation){$('ai-status').textContent='Filters changed. Previous AI response discarded.';return;}lastInsight = result.text; insights(); $('ai-status').textContent='Gemini response received. Review its interpretation against the data.';
  } catch (error) { insights(); $('ai-status').textContent = 'AI request failed: ' + error.message + ' Local analysis remains available.'; }
  finally { button.disabled = false; button.textContent = 'Generate AI insights ↗'; }
};


function breakdown(){
 const summary=aggregate(filtered),margin=Number($('margin').value),target=Number($('cpa-target').value),root=$('performance-breakdown');
 root.replaceChildren();
 if(!(margin>0&&margin<=100&&target>0)){root.textContent='Enter a margin between 1% and 100% and a CPA target above zero.';return;}
 if(!filtered.length){root.textContent='No data matches these filters. Choose another selection.';return;}
 const roas=ratio(summary.revenue,summary.spend),cpa=ratio(summary.spend,summary.conversions),threshold=100/margin,contribution=summary.revenue*margin/100-summary.spend;
 const observations=[
 ['Return on spend',roas===null?'No spend recorded':roas>=threshold?'Above assumed break-even':'Below assumed break-even',roas===null?'ROAS cannot be calculated without spend.':`Each $1 of marketing spend is associated with $${roas.toFixed(2)} in revenue. At your ${margin}% margin assumption, break-even ROAS is ${threshold.toFixed(2)}×.`,roas!==null&&roas>=threshold],
 ['Acquisition efficiency',cpa===null?'No conversions recorded':cpa<=target?'Within your CPA target':'Above your CPA target',cpa===null?'CPA cannot be calculated without conversions.':`Each recorded conversion costs ${money(cpa)}, compared with your ${money(target)} target. Confirm that these conversions represent valuable customers or qualified leads.`,cpa!==null&&cpa<=target],
 ['Estimated contribution',contribution>=0?'Positive under these assumptions':'Negative under these assumptions',`${money(summary.revenue)} revenue × ${margin}% margin − ${money(summary.spend)} marketing spend = ${money(contribution)}. This estimate excludes fixed costs and depends on accurate attribution.`,contribution>=0]
 ];
 observations.forEach(([title,verdict,explanation,good])=>{const card=document.createElement('article');card.className='assessment';const h=document.createElement('h3');h.textContent=title;const badge=document.createElement('strong');badge.className='verdict '+(good?'positive':'attention');badge.textContent=verdict;const p=document.createElement('p');p.textContent=explanation;card.append(h,badge,p);root.append(card)});
}
$('margin').oninput=()=>{breakdown();serviceRender()};$('cpa-target').oninput=()=>{breakdown();serviceRender()};
$('explain').onclick=()=>{breakdown();$('explain').textContent='Breakdown updated ✓';setTimeout(()=>$('explain').textContent='Refresh breakdown ↻',1800)};
function applyTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';$('theme-toggle').setAttribute('aria-pressed',String(dark));$('theme-toggle').textContent=dark?'☀ Light mode':'☾ Dark mode';}
let dark=false;try{dark=localStorage.getItem('mi-theme')==='dark'}catch{}applyTheme(dark);
$('theme-toggle').onclick=()=>{dark=!dark;applyTheme(dark);try{localStorage.setItem('mi-theme',dark?'dark':'light')}catch{}};
document.querySelector('.upload').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();$('upload').click()}};
document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));link.classList.add('active')}));
if($('endpoint').value){$('generate').textContent='Generate AI insights ↗';$('ai-status').textContent='Saved Worker URL found. Generate insights to verify the connection.';}

const dayMs=86400000;
const dateISO=date=>new Date(date).toISOString().slice(0,10);
function datasetBounds(){const dates=data.map(r=>r.date).sort();return [dates[0],dates.at(-1)]}
function setFullRange(){const [from,to]=datasetBounds();$('date-from').value=from||'';$('date-to').value=to||'';$('period').value='all'}
function makeText(tag,text,className=''){const element=document.createElement(tag);element.textContent=text;element.className=className;return element}
let completed={};let savedExperiment=null;
try{completed=JSON.parse(localStorage.getItem('mi-actions')||'{}');savedExperiment=JSON.parse(localStorage.getItem('mi-experiment')||'null');if(!completed||typeof completed!=='object'||Array.isArray(completed))completed={};if(savedExperiment&&typeof savedExperiment!=='object')savedExperiment=null}catch{}
function serviceRender(){
 const start=$('date-from').value,end=$('date-to').value,s=aggregate(filtered),days=start&&end?Math.round((Date.parse(end)-Date.parse(start))/dayMs)+1:0;
 $('range-status').textContent=days<1?'Choose a start date on or before the end date.':`${start} → ${end} · ${days} calendar days · ${new Set(filtered.map(r=>r.date)).size} dates with observations · ${source}`;
 $('page-status').textContent=filtered.length?`Page ${page+1} of ${Math.ceil(filtered.length/15)} · ${filtered.length} records`:'No records';$('page-prev').disabled=page===0;$('page-next').disabled=(page+1)*15>=filtered.length;
 const comparison=$('comparison');comparison.replaceChildren();
 if($('compare-period').checked&&days>0){const previousEnd=dateISO(Date.parse(start)-dayMs),previousStart=dateISO(Date.parse(start)-days*dayMs),previous=filterRows(data,{from:previousStart,to:previousEnd,channel:$('channel').value,campaign:$('campaign-filter').value,objective:$('objective-filter').value});const ps=aggregate(previous);const observed=new Set(previous.map(r=>r.date)).size;
 comparison.append(makeText('p',`Previous period: ${previousStart} → ${previousEnd} · ${observed}/${days} days with observations. ${observed<days?'Coverage is incomplete; changes may reflect missing observations.':''}`,'hint'));
 if(previous.length&&filtered.length){[['Revenue',s.revenue,ps.revenue],['Spend',s.spend,ps.spend],['Conversions',s.conversions,ps.conversions],['ROAS',ratio(s.revenue,s.spend),ratio(ps.revenue,ps.spend)]].forEach(([label,current,prior])=>{const item=makeText('div','', 'comparison-item');item.append(makeText('strong',label),makeText('span',current===null||prior===null||prior===0?'Change unavailable':pctChange(prior,current)+' vs previous'));comparison.append(item)})}else comparison.append(makeText('p','No comparable observations. Select a later range or upload data that includes a previous period.','hint'));}
 momentum();diagnostics();scenario();actions();
 const health=$('health-output');health.replaceChildren();const [min,max]=datasetBounds();health.append(makeText('p',`${data.length} validated records · Dataset coverage ${min} to ${max}. ${source==='Fictional demo'?'All observations are synthetic.':'Uploaded data is held in this tab and is not saved to a server.'}`),makeText('p',`${filtered.length} selected records; ${filtered.filter(r=>!r.spend).length} with zero spend; ${filtered.filter(r=>!r.conversions).length} with zero conversions. Zero denominators are shown as unavailable, not as a successful result.`),makeText('p','Attribution, customer quality, margin, and incremental lift cannot be validated from this CSV alone. Channel results are descriptive and do not establish causation.','hint'));
}
function momentum(){
 const metric=$('momentum-metric').value,group=$('momentum-group').value,buckets=new Map();
 filtered.forEach(r=>{let key=r.date;if(group==='month')key=r.date.slice(0,7);if(group==='week'){const d=new Date(r.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));key=dateISO(d)}if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(r)});
 const points=[...buckets].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,rows])=>{const s=aggregate(rows);return {date,value:metric==='roas'?ratio(s.revenue,s.spend):s[metric]}}),total=aggregate(filtered),format=value=>value===null?'Unavailable':metric==='roas'?mult(value):metric==='conversions'?num(value):money(value);
 $('momentum-value').textContent=format(metric==='roas'?ratio(total.revenue,total.spend):total[metric]);
 const root=$('momentum-chart');if(!points.length){root.textContent='No observations in this date range.';$('momentum-detail').textContent='Adjust your filters to view momentum.';return;}
 const max=Math.max(1,...points.map(p=>p.value||0)),x=i=>25+(points.length===1?220:i*450/(points.length-1)),y=v=>155-(v||0)/max*125;
 let svg='<svg viewBox="0 0 500 190" role="img" aria-label="Selected metric over time"><title>Campaign momentum</title><path d="M25 30H475M25 90H475M25 155H475" fill="none" stroke="#ffffff20"/>';
 const valid=points.map((p,i)=>({p,i})).filter(({p})=>p.value!==null);const path=valid.map(({p,i},j)=>`${j?'L':'M'}${x(i)},${y(p.value)}`).join(' ');
 svg+=`<path class="momentum-line" pathLength="1" d="${path}" fill="none" stroke="#d4ed83" stroke-width="3" stroke-linejoin="round"/>`;
 valid.forEach(({p,i})=>svg+=`<circle cx="${x(i)}" cy="${y(p.value)}" r="5" fill="#d4ed83" tabindex="0" role="button" data-point="${i}" aria-label="${p.date}: ${format(p.value)}"><title>${p.date}: ${format(p.value)}</title></circle>`);
 svg+=`<text x="25" y="185" fill="#bcccaf" font-size="11">${points[0].date}</text><text x="475" y="185" text-anchor="end" fill="#bcccaf" font-size="11">${points.at(-1).date}</text></svg>`;root.innerHTML=svg;
 $('momentum-detail').textContent=`${$('momentum-metric').selectedOptions[0].text} · ${points.length} ${group} groups · ${$('date-from').value} to ${$('date-to').value}`;
 root.querySelectorAll('[data-point]').forEach(el=>{const show=()=>{const p=points[Number(el.dataset.point)];$('momentum-detail').textContent=`${p.date} · ${format(p.value)} · ${group==='week'?'Week beginning on this date':group==='month'?'Monthly total':'Daily observation'}`};el.onclick=show;el.onfocus=show;el.onmouseenter=show;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}}});
}
function diagnostics(){const root=$('diagnostic-output');root.replaceChildren();const table=document.createElement('table');const head=document.createElement('thead'),tr=document.createElement('tr');['Channel','CTR','Conversion rate','CPA','ROAS','CPA target'].forEach(t=>tr.append(makeText('th',t)));head.append(tr);table.append(head);const body=document.createElement('tbody');channels.forEach(c=>{const s=aggregate(filtered.filter(r=>r.channel===c)),row=document.createElement('tr'),td=document.createElement('td'),button=makeText('button',c,'report-button');button.onclick=()=>{$('channel').value=c;page=0;render();$('dashboard').scrollIntoView({behavior:'smooth'})};td.append(button);row.append(td);const cpa=ratio(s.spend,s.conversions);[s.impressions?(s.clicks/s.impressions*100).toFixed(2)+'%':'—',s.clicks?(s.conversions/s.clicks*100).toFixed(2)+'%':'—',cpa===null?'—':money(cpa),mult(ratio(s.revenue,s.spend)),cpa===null?'Insufficient data':cpa<=Number($('cpa-target').value)?'Within target':'Above target'].forEach(t=>row.append(makeText('td',t)));body.append(row)});table.append(body);root.append(table)}
function scenario(){const s=aggregate(filtered),shift=Number($('budget-shift').value)/100;$('budget-shift-value').textContent=(shift>=0?'+':'')+Math.round(shift*100)+'%';const root=$('scenario-output');root.replaceChildren();if(!s.spend){root.textContent='Choose records with spend to model a scenario.';return;}root.append(makeText('p',`Scenario spend: ${money(s.spend*(1+shift))}`),makeText('p',`Conversions at unchanged CPA: ${(s.conversions*(1+shift)).toFixed(1)} (observed ${num(s.conversions)})`),makeText('p',`Attributed revenue at unchanged ROAS: ${money(s.revenue*(1+shift))}`))}
function actions(){const root=$('action-output');root.replaceChildren();if(!filtered.length){root.textContent='Choose a date range with observations to generate actions.';return;}const ranked=channels.map(channel=>({channel,...aggregate(filtered.filter(r=>r.channel===channel))})).filter(r=>r.spend).sort((a,b)=>a.revenue/a.spend-b.revenue/b.spend);const low=ranked[0];const tasks=[['measurement','Validate measurement','Confirm conversion events, attribution windows, and customer quality before changing budgets.'],['efficiency','Investigate acquisition cost',low?`${low.channel} has the lowest observed ROAS in this selection (${mult(low.revenue/low.spend)}). Review targeting and creative before reducing spend.`:'Record campaign spend to compare efficiency.'],['experiment','Plan one controlled test','Use the strategy lab to set a hypothesis, budget, duration, and CPA guardrail.'],['review','Schedule a decision','Review the test at the planned end date. Compare with a holdout and record uncertainty before scaling.']];tasks.forEach(([id,title,detail],i)=>{const label=document.createElement('label');label.className='action-item';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!completed[id];checkbox.onchange=()=>{completed[id]=checkbox.checked;try{localStorage.setItem('mi-actions',JSON.stringify(completed))}catch{}};const text=document.createElement('span');text.append(makeText('strong',`${i+1}. ${title}`),makeText('p',detail));label.append(checkbox,text);root.append(label)})}
function experimentText(plan){return `CAMPAIGN EXPERIMENT PLAN\nChannel: ${plan.channel}\nDates analyzed: ${plan.from} to ${plan.to}\nHypothesis: ${plan.hypothesis}\nBudget: ${plan.budget} USD\nDuration: ${plan.days} days\nSuccess guardrail: CPA at or below ${plan.target} USD; verify conversion quality\nDesign: change one variable, keep other conditions comparable, and use a holdout where feasible.\nDecision: review the complete test window and sample size before scaling.\nSaved: ${plan.saved}\nIllustrative plan; no advertising spend has been committed.`}
function previewExperiment(){const root=$('experiment-preview');root.replaceChildren();if(savedExperiment){root.append(makeText('pre',experimentText(savedExperiment)));$('download-experiment').disabled=false}else{$('download-experiment').disabled=true}}
$('experiment-form').onsubmit=e=>{e.preventDefault();savedExperiment={channel:$('experiment-channel').value,hypothesis:$('experiment-hypothesis').value.trim(),budget:$('experiment-budget').value,days:$('experiment-days').value,target:$('cpa-target').value,from:$('date-from').value,to:$('date-to').value,saved:new Date().toISOString()};if(!savedExperiment.hypothesis)return;try{localStorage.setItem('mi-experiment',JSON.stringify(savedExperiment));$('experiment-status').textContent='Experiment saved in this browser.'}catch{$('experiment-status').textContent='Plan is ready for this tab. Browser storage is unavailable; download a copy.'}previewExperiment()};
$('download-experiment').onclick=()=>{if(savedExperiment)download('campaign-experiment.txt',experimentText(savedExperiment))};
$('budget-shift').oninput=scenario;$('momentum-metric').onchange=momentum;$('momentum-group').onchange=momentum;
['date-from','date-to'].forEach(id=>$(id).onchange=()=>{$('period').value='all';page=0;render()});$('compare-period').onchange=serviceRender;
function recentRange(days){const [,end]=datasetBounds();$('date-to').value=end;$('date-from').value=dateISO(Date.parse(end)-(days-1)*dayMs);$('period').value='all';page=0;render()}
$('range7').onclick=()=>recentRange(7);$('range30').onclick=()=>recentRange(30);$('rangeall').onclick=()=>{setFullRange();page=0;render()};
$('page-prev').onclick=()=>{if(page>0){page--;render()}};$('page-next').onclick=()=>{if((page+1)*15<filtered.length){page++;render()}};$('filtered-csv').onclick=()=>download('filtered-campaigns.csv',csv(filtered),'text/csv');
let collapsed=false;try{collapsed=localStorage.getItem('mi-nav-collapsed')==='true'}catch{}
function navState(){document.body.classList.toggle('nav-collapsed',collapsed);$('nav-toggle').textContent=collapsed?'☰':'◧ Collapse sidebar';$('nav-toggle').setAttribute('aria-label',collapsed?'Expand navigation':'Collapse navigation');$('nav-toggle').title=collapsed?'Expand navigation':'Collapse navigation';$('nav-toggle').setAttribute('aria-expanded',String(!collapsed));$('main-nav').inert=collapsed}
$('nav-toggle').onclick=()=>{collapsed=!collapsed;navState();try{localStorage.setItem('mi-nav-collapsed',String(collapsed))}catch{}};navState();
function updateNavigation(){const ids=['dashboard','diagnostics','insights','action-plan','campaigns','data-health','about'];let active='overview';for(const id of ids){if($(id).getBoundingClientRect().top<=170)active=id}document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active))}window.addEventListener('scroll',updateNavigation,{passive:true});updateNavigation();
periods();setFullRange();previewExperiment();render();

initializePlatform({get:()=>({data,rows:filtered,source,filters:{from:$('date-from').value,to:$('date-to').value,channel:$('channel').value,campaign:$('campaign-filter')?.value||'',objective:$('objective-filter')?.value||''}}),refresh:()=>{page=0;render()},importRows:(rows,label)=>{$('campaign-filter').value='';$('objective-filter').value='';data=rows;source=label;periods();setFullRange();page=0;render()},download});
