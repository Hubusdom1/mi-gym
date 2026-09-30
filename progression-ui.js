'use strict';
let pendingSession=null;
function loadStepFor(id){return state.loadSteps.find(x=>x.id===id)?.kg??null;}
function suggestExercise(e,r,step=loadStepFor(e.id)){return GYM_PROGRESSION.suggest(e,state.history,{step,known:Object.hasOwn(GYM_PROFILE.meta,e.id),duplicate:r.exercises.filter(x=>x.id===e.id).length>1});}
function renderEffort(e,index){
 const last=e.logs.reduce((found,l,i)=>l.done?i:found,-1);if(last<0)return '';
 const rir=e.logs[last].rir;
 return `<section class="effort-box"><label for="effort-${index}"><strong>¿Cuántas repeticiones te quedaban?</strong><span>Al terminar la serie ${last+1}, manteniendo la misma técnica.</span></label><select id="effort-${index}" data-effort-ex="${index}" data-effort-set="${last}" aria-label="Esfuerzo de ${esc(e.name)}, serie ${last+1}"><option value="" ${rir===undefined||rir===null?'selected':''}>No lo sé / Sin indicar</option>${Object.entries(GYM_PROGRESSION.rirLabels).map(([v,label])=>`<option value="${v}" ${rir===Number(v)?'selected':''}>${label}</option>`).join('')}</select><p class="small muted">Opcional. Esta estimación ayuda a preparar tu próxima sesión.</p></section>`;
}
function renderGuidance(e){return e.guidance?`<div class="session-guidance"><p class="eyebrow">OBJETIVO REVISADO PARA HOY</p><strong>${e.guidance.kg===null?'Carga a elegir':num(e.guidance.kg)+' kg'} · ${e.guidance.reps.join(' / ')} reps</strong><p class="small">Repeticiones por serie. Registra las que hagas realmente.</p><details><summary>Por qué se propuso</summary><p>${esc(e.guidance.reason)}${e.guidance.adjusted?' Ajustaste esta propuesta antes de empezar.':''}</p></details></div>`:'';}
function renderHistoryEffort(e){return e.logs.some(l=>Number.isInteger(l.rir))?`<p class="history-effort">Margen anotado: ${e.logs.map((l,i)=>Number.isInteger(l.rir)?`serie ${i+1}, ${l.rir===3?'3 o más':l.rir} reps en reserva`:null).filter(Boolean).join(' · ')}.</p>`:'';}
function copyNextSet(index){
 if(!inputIsValid())return false;const e=state.active?.exercises[index];if(!e||e.retained)return false;
 const source=e.logs.findLast(l=>l.done),target=e.logs.find(l=>!l.done);
 if(!source||!target){toast('Completa una serie para copiarla en la siguiente pendiente.');return false;}
 if(target.reps!==''||target.kg!==''&&target.kg!==source.kg){toast('La siguiente serie ya tiene datos. Revísala antes de copiar otra.');return false;}
 if(!commit(()=>{target.kg=source.kg;target.reps=source.reps;delete target.rir;}))return false;
 render();toast('Serie copiada. Márcala cuando la hayas realizado.');return true;
}
function showStartOptions(id){
 if(loadError){toast('Revisa tus datos en Rutina antes de entrenar.');return;}
 if(state.active){go('entrenar');return;}selected=id;
 const r=state.routines.find(r=>r.id===id);if(!r?.exercises.length)return;
 modal(`<h2>¿Cómo entrenas hoy?</h2><p class="muted">${esc(r.name)} · ${r.exercises.length} ejercicios</p><button class="btn lime full" data-action="review-session" data-id="${esc(r.id)}" style="margin-top:20px">Preparar con mi historial</button><p class="note">Revisa objetivos de carga y repeticiones antes de empezar. Tú decides cuáles usar.</p><div class="actions"><button class="btn secondary" data-action="startnormal">Series del plan</button></div><button class="textbtn" data-action="close">Volver</button>`);
}
function warmupProposal(item,i){
 if(!GYM_PROFILE.needsWarmup(item.exercise))return '';
 const g=GYM_PROGRESSION.suggestWarmup(item.exercise,state.history,{workKg:item.use?item.kg:null,step:item.step});
 return `<section class="warmup-proposal" id="warmup-proposal-${i}"><p class="eyebrow">ANTES · 1 SERIE DE APROXIMACIÓN</p><strong>${g.kg===null?'Carga ligera a elegir':num(g.kg)+' kg'} · ${g.reps} reps orientativas</strong>${g.reference?`<p class="small">Última aproximación: ${num(g.reference.kg)} kg × ${g.reference.reps} · ${fmtDate(g.sourceDate)}</p>`:''}<p class="note">${esc(g.reason)}</p><p class="small muted">Se guarda aparte. Puedes ajustar el peso y las repeticiones al entrenar; esta serie no decide tus récords ni por sí sola una subida de carga.</p></section>`;
}
function renderWarmup(e,ei){
 if(!e.warmup)return '';
 const w=e.warmup,g=e.warmupGuidance||GYM_PROGRESSION.suggestWarmup(e,state.history);
 return `<section class="warmup-block"><p class="eyebrow">APROXIMACIÓN · ANTES DE LAS SERIES DE TRABAJO</p><p class="note">Carga ligera, sin buscar fatiga. Es una primera aproximación: ajusta el calentamiento a la carga que vayas a usar.</p>${g.kg!==null?`<p><strong>Guía para hoy: ${num(g.kg)} kg × ${g.reps}</strong></p>`:g.reference?`<p class="small">Última aproximación: ${num(g.reference.kg)} kg × ${g.reference.reps}</p>`:''}<div class="set labels"><span>Tipo</span><span>Peso · kg</span><span>Reps</span><span class="sr-only">Hecha</span></div><div class="set warmup-set ${w.done?'done':''}"><span class="warmup-tag" title="Aproximación">A</span><input aria-label="${esc(e.name)} aproximación peso en kg" type="number" inputmode="decimal" min="0" max="2000" step="any" data-ex="${ei}" data-warmup="true" data-field="kg" value="${w.kg}" placeholder="${g.kg??'—'}"><input aria-label="${esc(e.name)} aproximación repeticiones" type="number" inputmode="numeric" min="1" max="200" step="1" data-ex="${ei}" data-warmup="true" data-field="reps" value="${w.reps}" placeholder="${g.reps}"><button data-action="checkwarmup" data-ex="${ei}" aria-label="${w.done?'Desmarcar':'Completar'} aproximación de ${esc(e.name)}" aria-pressed="${w.done}">${w.done?'✓':'○'}</button></div><p class="small muted">Aproximación separada de las ${e.logs.length} series de trabajo. Descanso orientativo: 60 s.</p></section>`;
}
function proposalCard(item,i){
 const e=item.exercise,s=item.suggestion,g=getGuide(e);
 return `<article class="suggestion-card" id="suggestion-${i}"><div class="suggestion-heading">${g?`<img src="./assets/exercises/${g.art}-1.svg" alt="" width="48" height="48">`:''}<div><h3>${esc(e.name)}</h3><p class="small muted">${e.sets} series · rango ${e.min}–${e.max} reps</p></div></div><span class="suggestion-status ${['load','reps'].includes(s.status)?'progress':''}">${esc(s.title)}</span><p class="suggestion-reason">${esc(s.reason)}</p>${s.reference.length?`<p class="suggestion-reference">${fmtDate(s.sourceDate)} · ${s.reference.map(l=>`${num(l.kg)} kg × ${l.reps}`).join(' / ')}</p>`:''}<label class="suggestion-use"><input type="checkbox" name="use-${i}" ${item.use?'checked':''}> Usar estos objetivos en esta sesión</label><div class="suggestion-fields"><div><label for="target-kg-${i}">Carga · kg</label><input id="target-kg-${i}" name="kg-${i}" type="number" inputmode="decimal" min="0" max="2000" step="any" value="${item.kg??''}" placeholder="Elegir al entrenar"></div><fieldset><legend>Reps objetivo por serie</legend><div class="target-reps">${item.reps.map((n,j)=>`<label><span>${j+1}</span><input name="reps-${i}-${j}" type="number" inputmode="numeric" min="1" max="50" step="1" value="${n}" aria-label="${esc(e.name)}, objetivo de repeticiones de la serie ${j+1}"></label>`).join('')}</div></fieldset></div>${warmupProposal(item,i)}${s.ready?`<div class="load-step"><label for="load-step-${i}">Menor salto disponible · kg</label><div><input id="load-step-${i}" name="step-${i}" type="number" inputmode="decimal" min="0.1" max="100" step="any" value="${item.step??''}" placeholder="Ej.: 1 o 2,5"><button class="btn secondary" type="button" data-action="calculate-step" data-index="${i}">Calcular</button></div><p class="small muted">Pulsa Calcular para revisar la propuesta. Mancuernas: salto de una mancuerna. Barra: aumento total. Se recuerda al empezar esta sesión.</p></div>`:''}</article>`;
}
function showSessionProposal(id){
 if(loadError){toast('Revisa tus datos en Rutina antes de entrenar.');return;}
 if(state.active){go('entrenar');return;}
 const r=state.routines.find(r=>r.id===id);if(!r?.exercises.length)return;
 selected=r.id;pendingSession={routineId:r.id,signature:planSignature([r]),items:r.exercises.map(e=>{const s=suggestExercise(e,r);return {exercise:clone(e),suggestion:s,use:true,kg:s.kg,reps:[...s.reps],step:loadStepFor(e.id)};})};
 modal(`<div class="suggestion-title"><p class="eyebrow">TU PRÓXIMA SESIÓN</p><h2>${esc(r.name)}</h2><p class="note">Propuesta a partir de tus series guardadas y el esfuerzo que anotaste. Revisa los objetivos: puedes cambiarlos o desmarcarlos.</p></div><form id="session-proposal-form" novalidate><div class="suggestions">${pendingSession.items.map(proposalCard).join('')}</div><p class="note">Compara el mismo ejercicio, máquina y técnica. Estos objetivos son orientativos; las repeticiones realizadas se registran durante el entrenamiento.</p><p id="suggestion-error" class="data-error" role="alert" tabindex="-1" hidden></p><div class="suggestion-actions"><button class="btn secondary" type="button" data-action="close">Cancelar</button><button class="btn lime" type="submit">Empezar con mis objetivos</button></div></form>`);
 $('#modal').classList.add('suggestion-dialog');$('#modal').setAttribute('aria-label','Preparar próxima sesión');
}
function proposalError(message){const node=$('#suggestion-error');node.textContent=message;node.hidden=false;node.focus();}
function readProposal(){
 if(!pendingSession||!$('#session-proposal-form'))return false;
 const f=new FormData($('#session-proposal-form'));
 const next=[];
 for(let i=0;i<pendingSession.items.length;i++){
   const old=pendingSession.items[i],use=f.get(`use-${i}`)==='on',kgInput=$(`#target-kg-${i}`),raw=f.get(`kg-${i}`),kg=raw===''?null:Number(raw),reps=old.reps.map((_,j)=>Number(f.get(`reps-${i}-${j}`))),stepInput=$(`#load-step-${i}`),stepRaw=f.get(`step-${i}`),step=stepInput?(stepRaw===''?null:Number(stepRaw)):old.step;
   if(use&&(kgInput.validity?.badInput||kg!==null&&(!Number.isFinite(kg)||kg<0||kg>2000)||reps.some(n=>!integer(n,1,50)))){proposalError(`Revisa la carga y las repeticiones de ${old.exercise.name}.`);return false;}
   if(stepInput&&(stepInput.validity?.badInput||step!==null&&(!Number.isFinite(step)||step<0.1||step>100))){proposalError('El salto de carga debe estar entre 0,1 y 100 kg, o quedar vacío.');return false;}
   next.push({...old,use,kg,reps,step});
 }
 pendingSession.items=next;return true;
}
function calculateLoadStep(index){
 if(!readProposal())return;const r=state.routines.find(r=>r.id===pendingSession.routineId),item=pendingSession.items[index];if(!r||!item)return;
 item.suggestion=suggestExercise(item.exercise,r,item.step);item.kg=item.suggestion.kg;item.reps=[...item.suggestion.reps];
 const node=$(`#suggestion-${index}`);node.outerHTML=proposalCard(item,index);$('#suggestion-error').hidden=true;$(`#target-kg-${index}`).focus();
}
function applySessionProposal(){
 if(!readProposal())return false;
 const r=state.routines.find(r=>r.id===pendingSession.routineId);
 if(!r||planSignature([r])!==pendingSession.signature){proposalError('La rutina ha cambiado. Cierra esta propuesta y vuelve a prepararla.');return false;}
 const guidance=pendingSession.items.map(item=>item.use?{kg:item.kg,reps:item.reps,reason:item.suggestion.reason,status:item.suggestion.status,sourceId:item.suggestion.sourceId,sourceDate:item.suggestion.sourceDate,adjusted:item.kg!==item.suggestion.kg||JSON.stringify(item.reps)!==JSON.stringify(item.suggestion.reps)}:null);
 if(guidance.some(g=>g&&!GYM_PROGRESSION.validGuidance(g)))return false;
 const steps=pendingSession.items.filter(item=>item.use&&item.suggestion.ready).map(item=>({id:item.exercise.id,kg:item.step}));
 selected=r.id;return startSession(false,guidance,steps);
}
document.addEventListener('input',ev=>{
 const match=ev.target.id?.match(/^target-kg-(\d+)$/);if(!match||!pendingSession)return;
 const i=Number(match[1]),item=pendingSession.items[i],raw=ev.target.value;
 item.kg=raw!==''&&Number.isFinite(Number(raw))&&Number(raw)>=0&&Number(raw)<=2000?Number(raw):null;
 const node=$(`#warmup-proposal-${i}`);if(node)node.outerHTML=warmupProposal(item,i);
});
document.addEventListener('change',ev=>{
 const match=ev.target.name?.match(/^use-(\d+)$/);if(!match||!pendingSession)return;
 const i=Number(match[1]),item=pendingSession.items[i];item.use=ev.target.checked;
 const node=$(`#warmup-proposal-${i}`);if(node)node.outerHTML=warmupProposal(item,i);
});
document.addEventListener('change',ev=>{
 const el=ev.target;if(el.dataset.effortEx===undefined)return;
 const e=state.active?.exercises[Number(el.dataset.effortEx)],l=e?.logs[Number(el.dataset.effortSet)];if(!l?.done)return;
 const value=el.value===''?null:Number(el.value);if(value!==null&&!integer(value,0,3))return;
 if(!commit(()=>{if(value===null)delete l.rir;else l.rir=value;})){const restored=state.active.exercises[Number(el.dataset.effortEx)].logs[Number(el.dataset.effortSet)].rir;el.value=restored===undefined?'':String(restored);}
});
document.addEventListener('click',ev=>{
 const button=ev.target.closest('[data-action]');if(!button||button.disabled)return;
 const action=button.dataset.action;
 if(action==='copy-next')copyNextSet(Number(button.dataset.ex));
 if(action==='review-session')showSessionProposal(button.dataset.id);
 if(action==='review-next')showSessionProposal(nextRoutine());
 if(action==='calculate-step')calculateLoadStep(Number(button.dataset.index));
});
document.addEventListener('submit',ev=>{if(ev.target.id==='session-proposal-form'){ev.preventDefault();applySessionProposal();}});
