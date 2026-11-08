(() => {
 'use strict';
 const vault=document.querySelector('#ml-lab');
 if(!vault)return;
 const graph=vault.querySelector('.model-graph');
 const map=vault.querySelector('.model-map');
 const list=vault.querySelector('.model-list-view');
 const nodes=[...vault.querySelectorAll('.model-node')];
 const cards=[...vault.querySelectorAll('.model-entry')];
 const lines=[...vault.querySelectorAll('.model-connection')];
 const viewControls=vault.querySelector('.model-view-controls');
 const views=[...viewControls.querySelectorAll('[data-model-view]')];
 const detail=vault.querySelector('.map-detail-body');
 const status=vault.querySelector('.model-map-status');
 const points=nodes.map(node=>({x:Number(node.dataset.originX),y:Number(node.dataset.originY)}));
 let selected=0,view='map',lastDrag=0,lastDragIndex=-1,drag=null,frame=0;
 viewControls.hidden=false;
 vault.classList.add('constellation-ready');
 function setView(next){
  view=next;vault.dataset.view=next;map.hidden=next!=='map';list.hidden=next!=='list';
  views.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modelView===next)));
  viewControls.querySelector('.map-reset').hidden=next!=='map';
 }
 function choose(index,announce=true){
  selected=index;
  nodes.forEach((node,i)=>node.setAttribute('aria-pressed',String(i===index)));
  lines.forEach((line,i)=>line.classList.toggle('selected',i===index));
  detail.replaceChildren(...[...cards[index].children].map(child=>child.cloneNode(true)));
  vault.querySelector('.map-selection-number').textContent=`${String(index+1).padStart(2,'0')} / 09`;
  if(announce)status.textContent=`${cards[index].querySelector('h4').textContent}. Details and source links are ready.`;
 }
 function place(index){
  const point=points[index];const node=nodes[index];
  node.style.left=`${point.x/10}%`;node.style.top=`${point.y/7}%`;
  lines[index].setAttribute('x2',point.x.toFixed(2));lines[index].setAttribute('y2',point.y.toFixed(2));
 }
 function reset(){nodes.forEach((node,i)=>{points[i]={x:Number(node.dataset.originX),y:Number(node.dataset.originY)};place(i);});status.textContent='Model positions reset.';}
 function applyFilter(){
  const family=vault.querySelector('[data-model-filter][aria-pressed="true"]').dataset.modelFilter;
  let count=0;
  nodes.forEach((node,i)=>{const visible=family==='all'||node.dataset.family===family;node.hidden=!visible;lines[i].classList.toggle('filtered-out',!visible);if(visible)count++;});
  vault.querySelector('.hub-count').textContent=`${count} ${count===1?'PROJECT':'PROJECTS'}`;
  if(nodes[selected].hidden)choose(nodes.findIndex(node=>!node.hidden));
 }
 nodes.forEach((node,index)=>{
  node.addEventListener('click',event=>{if(event.detail&&lastDragIndex===index&&performance.now()-lastDrag<350)return;choose(index);});
  node.addEventListener('pointerenter',()=>lines[index].classList.add('hovered'));
  node.addEventListener('pointerleave',()=>lines[index].classList.remove('hovered'));
  node.addEventListener('focus',()=>lines[index].classList.add('hovered'));
  node.addEventListener('blur',()=>lines[index].classList.remove('hovered'));
  node.addEventListener('keydown',event=>{
   if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key))return;
   event.preventDefault();const visible=nodes.filter(button=>!button.hidden);const current=visible.indexOf(node);
   const next=event.key==='Home'?0:event.key==='End'?visible.length-1:(current+(['ArrowRight','ArrowDown'].includes(event.key)?1:visible.length-1))%visible.length;
   visible[next].focus();
  });
  node.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   const rect=graph.getBoundingClientRect();
   drag={index,id:event.pointerId,startX:event.clientX,startY:event.clientY,original:{...points[index]},rect,moved:false,marginX:(node.offsetWidth/2+8)/rect.width*1000,marginY:(node.offsetHeight/2+8)/rect.height*700};
   node.setPointerCapture(event.pointerId);
  });
  node.addEventListener('pointermove',event=>{
   if(!drag||drag.index!==index||drag.id!==event.pointerId)return;
   const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
   if(!drag.moved&&Math.hypot(dx,dy)<5)return;
   drag.moved=true;node.classList.add('dragging');
   points[index]={x:Math.max(drag.marginX,Math.min(1000-drag.marginX,drag.original.x+dx/drag.rect.width*1000)),y:Math.max(drag.marginY,Math.min(700-drag.marginY,drag.original.y+dy/drag.rect.height*700))};
   if(!frame)frame=requestAnimationFrame(()=>{place(index);frame=0;});
  });
  function endDrag(event){
   if(!drag||drag.index!==index||drag.id!==event.pointerId)return;
   if(drag.moved){lastDrag=performance.now();lastDragIndex=index;place(index);status.textContent=`${cards[index].querySelector('h4').textContent} moved.`;}
   drag=null;node.classList.remove('dragging');
   if(node.hasPointerCapture(event.pointerId))node.releasePointerCapture(event.pointerId);
  }
  node.addEventListener('pointerup',endDrag);node.addEventListener('pointercancel',endDrag);
 });
 views.forEach(button=>button.addEventListener('click',()=>setView(button.dataset.modelView)));
 vault.querySelectorAll('[data-model-filter]').forEach(button=>button.addEventListener('click',applyFilter));
 viewControls.querySelector('.map-reset').addEventListener('click',reset);
 vault.querySelector('.model-hub').addEventListener('click',()=>{vault.querySelector('[data-model-filter="all"]').click();reset();});
 choose(0,false);setView('map');applyFilter();
})();
