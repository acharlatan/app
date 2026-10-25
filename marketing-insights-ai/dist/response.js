// Small, text-only Markdown renderer: no generated HTML or links are trusted.
export function formatResponse(text, doc=document){
 const root=doc.createElement('div');root.className='answer-body';let list=null;
 const inline=(node,value)=>{value.split(/(\*\*[^*]+\*\*)/g).forEach(part=>{if(part.startsWith('**')&&part.endsWith('**')){const strong=doc.createElement('strong');strong.textContent=part.slice(2,-2);node.append(strong)}else node.append(doc.createTextNode(part))})};
 for(const raw of String(text).replace(/\r/g,'').split('\n')){const line=raw.trim();if(!line){list=null;continue}const bullet=line.match(/^(?:[-*•]|\d+[.)])\s+(.+)/);const heading=line.match(/^#{1,4}\s+(.+)/)||line.match(/^\*\*([^*]+)\*\*:?$/)||line.match(/^(Evidence|Interpretation|Next test|Limitations|Gemini interpretation.*):$/i);
 if(heading){list=null;const h=doc.createElement('h4');inline(h,heading[1]);root.append(h)}else if(bullet){if(!list){list=doc.createElement('ul');root.append(list)}const li=doc.createElement('li');li.className=raw.match(/^\s{2,}/)?'answer-subitem':'';inline(li,bullet[1]);list.append(li)}else{list=null;const p=doc.createElement('p');inline(p,line);root.append(p)}}return root;
}
