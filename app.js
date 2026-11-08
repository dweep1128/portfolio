'use strict';
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reduceQuery.matches;
const motionButton = document.querySelector('.motion-toggle');
function updateMotion(){
 document.documentElement.classList.toggle('no-motion',motionPaused);
 motionButton.textContent=motionPaused?'Enable motion':'Pause motion';
 motionButton.setAttribute('aria-pressed',String(motionPaused));
}
updateMotion();
motionButton.addEventListener('click',()=>{motionPaused=!motionPaused;updateMotion();});
reduceQuery.addEventListener('change',e=>{motionPaused=e.matches;updateMotion();});
if('IntersectionObserver' in window){
 document.documentElement.classList.add('js-motion');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
let scrollTick=false;
function progress(){const total=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',`${total>0?scrollY/total*100:0}%`);document.querySelector('.back-top')?.classList.toggle('shown',scrollY>700);scrollTick=false;}
addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(progress);}},{passive:true});progress();
const projects=JSON.parse(document.querySelector('#project-data').textContent);
const dialog=document.querySelector('#case-dialog');
let lastCaseButton;
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{
 const p=projects.find(p=>p.id===button.dataset.case);lastCaseButton=button;
 const container=document.querySelector('#case-content');container.replaceChildren();
 function add(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;container.append(el);return el;}
 add('span',p.kind,'eyebrow');const title=add('h2',p.name);title.id='case-title';
 [['The problem',p.problem],[p.stage==='mvp'?'What I’m building':'My contribution',p.built],['A decision that matters',p.decision],['Evidence & status',p.evidence]].forEach(([h,t])=>{add('h3',h);add('p',t);});
 if(p.url){const link=add('a',p.link+' ↗');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';}
 dialog.showModal();
}));
document.documentElement.classList.add('js-ready');
document.querySelector('.modal-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>lastCaseButton?.focus());
document.querySelector('.copy-email').addEventListener('click',async e=>{
 try{await navigator.clipboard.writeText(e.currentTarget.dataset.email);document.querySelector('#copy-status').textContent='Email address copied';document.querySelector('.copy-email').textContent='Copied ✓';}
 catch{document.querySelector('#copy-status').textContent='Select the email address to copy it, or use the email link.';document.querySelector('.copy-email').textContent='Use email link ↗';}
});
if(document.querySelector('.project-deck')){
 let current=0;
 function move(direction){current=(current+direction+projects.length)%projects.length;document.querySelector('#deck-title').textContent=projects[current].name;document.querySelector('#deck-desc').textContent=projects[current].subtitle;document.querySelector('#deck-count').textContent=String(current+1).padStart(2,'0');document.querySelector('#deck-link').href='#'+projects[current].id;document.querySelector('#deck-live').textContent=`Featured project ${current+1} of ${projects.length}: ${projects[current].name}`;}
 document.querySelector('#deck-prev').addEventListener('click',()=>move(-1));document.querySelector('#deck-next').addEventListener('click',()=>move(1));
}
const modelVault=document.querySelector('#ml-lab');
if(modelVault){
 const cards=[...modelVault.querySelectorAll('.model-entry')];
 const filters=[...modelVault.querySelectorAll('[data-model-filter]')];
 filters.forEach(button=>button.addEventListener('click',()=>{
  const family=button.dataset.modelFilter;let count=0;
  cards.forEach(card=>{card.hidden=family!=='all'&&card.dataset.family!==family;if(!card.hidden)count++;});
  filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
  document.querySelector('#model-result-count').textContent=`${count} ${count===1?'project':'projects'}`;
 }));
 document.querySelectorAll('[data-open-models]').forEach(link=>link.addEventListener('click',()=>modelVault.open=true));
 function openLinkedCollection(){if(location.hash==='#ml-lab')modelVault.open=true;}
 addEventListener('hashchange',openLinkedCollection);openLinkedCollection();
}
// A small process explorer explains the actual pipeline without pretending to generate video.
const pipeline=document.querySelector('.pipeline-explorer');
if(pipeline){
 const descriptions=['Clean the product image and isolate the subject, so the product stays at the centre of the creative.','Use a template to guide AI video generation around the product, rather than beginning with a blank prompt.','Bring the generated footage into a final composition. Treat output checks and assembly as their own steps.'];
 const buttons=[...pipeline.querySelectorAll('button[data-stage]')];
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>{pipeline.dataset.stage=String(index);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));pipeline.querySelector('.pipeline-note').textContent=descriptions[index];pipeline.querySelector('.pipeline-top .mono:last-child').textContent=`0${index+1} — 03`;});
  button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else return;event.preventDefault();buttons[next].focus();buttons[next].click();});
 });
}
// The visitor keeps control of scrolling; navigation only reflects the section being read.
if('IntersectionObserver' in window){
 const links=[...document.querySelectorAll('[data-section]')];
 const active=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(link=>{if(link.dataset.section===entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-18% 0px -62% 0px',threshold:0});
 document.querySelectorAll('main>section:not(#projects)').forEach(section=>active.observe(section));
 const related=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(link=>{if(link.dataset.section==='work')link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-18% 0px -62% 0px',threshold:0});
 document.querySelectorAll('#projects').forEach(section=>related.observe(section));
}
// Original canvas sculpture: points form two linked waves, responding to the pointer.
const canvas=document.querySelector('#signal-canvas');
if(canvas){
 const ctx=canvas.getContext('2d');
 if(ctx){
 let width=500,height=470,pointer={x:-1000,y:-1000},visible=true,last=0,time=0,needsDraw=true;
 const field=canvas.parentElement;
 function resize(){const r=field.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);needsDraw=true;}
 new ResizeObserver(resize).observe(field);resize();
 field.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};});
 field.addEventListener('pointerleave',()=>pointer={x:-1000,y:-1000});
 new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(field);
 function draw(now){requestAnimationFrame(draw);if(!visible||document.hidden)return;if(motionPaused&&!needsDraw)return;if(now-last<32)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!motionPaused)time+=dt;needsDraw=false;
 ctx.clearRect(0,0,width,height);const cx=width*.53,cy=height*.5,scale=Math.min(width/500,height/440);
 const points=[];
 const rows=width<500?21:29,columns=width<500?38:52;
 for(let row=0;row<rows;row++){
  const strip=[];
  for(let col=0;col<columns;col++){
   const u=col/(columns-1)*Math.PI*2,v=(row/(rows-1)-.5)*1.6;
   const r=135+Math.sin(u*3+time*.45)*23+v*40;
   const px=Math.cos(u)*r,py=Math.sin(u)*r;
   const z=Math.sin(u*2+time*.4)*45+v*100;
   let x=cx+(px*.95+py*.3)*scale,y=cy+(py*.45+z)*scale;
   if(!motionPaused){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy);if(dist>0&&dist<90){x+=dx/dist*(90-dist)*.25;y+=dy/dist*(90-dist)*.25;}}
   strip.push({x,y,depth:(Math.sin(u)+1)/2});
  }points.push(strip);
 }
 points.forEach((strip,ri)=>{strip.forEach((p,i)=>{ctx.fillStyle=`rgba(192,238,128,${.25+p.depth*.65})`;ctx.beginPath();ctx.arc(p.x,p.y,(.65+p.depth*.65)*scale,0,Math.PI*2);ctx.fill();if(i<strip.length-1&&ri%3===0){ctx.strokeStyle='rgba(192,238,128,.10)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(strip[i+1].x,strip[i+1].y);ctx.stroke();}});});
 }
 requestAnimationFrame(draw);
 }
}
