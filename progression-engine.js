'use strict';
// Transparent local rules, not a clinical prescription or an AI service.
window.GYM_PROGRESSION = (() => {
  const DAY=86400000;
  const rirLabels={0:'Ninguna más',1:'Una más',2:'Dos más',3:'Tres o más'};
  const round=n=>Math.round(n*1000)/1000;
  function suggest(exercise,history,{step=null,known=true,duplicate=false,now=Date.now()}={}){
    const count=exercise.sets;
    const result={status:'first',title:'Crear tu primera referencia',reason:'Todavía no hay series guardadas de este ejercicio. Elige una carga cómoda y registra cómo te resulta.',kg:null,reps:Array(count).fill(exercise.min),sourceId:null,sourceDate:null,reference:[],ready:false};
    const records=history.filter(s=>Number.isFinite(s.finished)&&s.finished<=now&&s.exercises.some(e=>e.id===exercise.id&&e.logs.some(l=>l.done))).sort((a,b)=>b.finished-a.finished);
    if(!records.length)return result;
    const latest=records[0],matches=latest.exercises.filter(e=>e.id===exercise.id&&e.logs.some(l=>l.done)),last=matches[0];
    const logs=last.logs.filter(l=>l.done);
    Object.assign(result,{sourceId:latest.id,sourceDate:latest.finished,reference:matches.flatMap(e=>e.logs.filter(l=>l.done).map(l=>({kg:l.kg,reps:l.reps}))),status:'review',title:'Revisar la referencia'});
    if(matches.length!==1||duplicate){result.reason='Este ejercicio aparece más de una vez en una sesión. Revisa cada bloque antes de fijar un objetivo.';return result;}
    if(!known){result.reason='Es una variante personalizada. Conservamos sus marcas como referencia; confirma su carga y la forma de contarla.';return result;}
    if(now-latest.finished>21*DAY){result.reason='Han pasado más de 21 días desde este ejercicio. Comprueba tu punto de partida antes de reutilizar la carga.';return result;}
    if(last.retained||last.swappedFrom||(last.plannedSets!==undefined&&last.plannedSets!==count)||logs.length!==count||last.min!==exercise.min||last.max!==exercise.max||last.sets!==count){result.reason='El último registro tiene otras series, otro rango o una sustitución. Revisa la carga para el plan actual.';return result;}
    const kg=logs[0].kg;
    if(!Number.isFinite(kg)||!logs.every(l=>l.kg===kg)){result.reason='La última sesión mezcla cargas. Revisa los pesos de cada serie antes de preparar esta sesión.';return result;}
    if(logs.some(l=>l.reps<exercise.min)){result.reason='Alguna serie quedó por debajo del rango actual. Revisa la carga y el esfuerzo antes de intentar progresar.';return result;}
    Object.assign(result,{status:'hold',title:'Mantener la referencia',kg,reps:logs.map(l=>Math.min(exercise.max,l.reps))});
    const effort=logs.at(-1).rir;
    if(!Number.isInteger(effort)){result.reason='Falta el esfuerzo de la última serie. Repite una referencia cómoda y anota cuántas repeticiones te quedaban.';return result;}
    if(logs.some(l=>Number.isInteger(l.rir)&&l.rir<2)){result.reason='En alguna serie anotaste poco margen. Mantén o ajusta la carga para completar el trabajo con control.';return result;}
    if(logs.some(l=>l.reps<exercise.max)){
      // Add one repetition to just the weakest set, not one to every set.
      const minimum=Math.min(...result.reps),index=result.reps.findIndex(n=>n===minimum);
      result.reps[index]++;Object.assign(result,{status:'reps',title:'Una repetición más',reason:`Completaste el rango y anotaste al menos dos repeticiones en reserva al terminar. Prueba una repetición más en la serie ${index+1}, con la misma carga.`});return result;
    }
    const prior=records[1],previous=prior?.exercises.filter(e=>e.id===exercise.id&&e.logs.some(l=>l.done));
    const priorLogs=previous?.length===1?previous[0].logs.filter(l=>l.done):[];
    const repeat=prior&&new Date(prior.finished).toDateString()!==new Date(latest.finished).toDateString()&&now-prior.finished<=42*DAY&&previous.length===1&&!previous[0].retained&&!previous[0].swappedFrom&&(previous[0].plannedSets===undefined||previous[0].plannedSets===count)&&previous[0].sets===count&&previous[0].min===exercise.min&&previous[0].max===exercise.max&&priorLogs.length===count&&priorLogs.every(l=>l.kg===kg&&l.reps>=exercise.max&&(!Number.isInteger(l.rir)||l.rir>=2))&&Number.isInteger(priorLogs.at(-1).rir)&&priorLogs.at(-1).rir>=2;
    if(!repeat){result.reason='Has llegado al máximo del rango con margen. Confírmalo en otra sesión comparable antes de proponer más peso.';return result;}
    if(kg===0){result.reason='Has repetido el máximo del rango sin carga externa. Revisa una progresión de dificultad antes de añadir lastre.';return result;}
    result.ready=true;
    if(!Number.isFinite(step)||step<0.1||step>100){result.status='step';result.title='Confirmar el salto de carga';result.reason='Has completado el máximo del rango con margen en dos sesiones. Indica el menor salto de peso disponible para calcular una propuesta.';return result;}
    if(step/kg>0.1||kg+step>2000){result.status='step';result.title='Revisar el salto disponible';result.reason='El salto indicado supera el límite conservador de esta propuesta (10 % de la carga), o el rango admitido. Mantén la referencia y revisa una progresión adecuada.';return result;}
    Object.assign(result,{status:'load',title:'Probar el siguiente peso',kg:round(kg+step),reps:Array(count).fill(exercise.min),reason:'En dos sesiones comparables completaste el máximo del rango con al menos dos repeticiones en reserva al terminar. Se propone un salto disponible y volver al inicio del rango.'});
    return result;
  }
  function suggestWarmup(exercise,history,{workKg=null,step=null,now=Date.now()}={}){
    const result={kg:null,reps:8,reason:'Elige una carga ligera para practicar el movimiento y anótala. Servirá como referencia para la próxima sesión.',sourceId:null,sourceDate:null,reference:null};
    const sessions=history.filter(s=>Number.isFinite(s.finished)&&s.finished<=now&&s.exercises.some(e=>e.id===exercise.id&&e.warmup?.done)).sort((a,b)=>b.finished-a.finished);
    if(!sessions.length)return result;
    const session=sessions[0],matches=session.exercises.filter(e=>e.id===exercise.id&&e.warmup?.done),old=matches[0],w=old.warmup;
    Object.assign(result,{sourceId:session.id,sourceDate:session.finished,reference:{kg:w.kg,reps:w.reps}});
    if(matches.length!==1||old.retained||old.swappedFrom||now-session.finished>21*DAY){result.reason='La aproximación anterior es antigua o corresponde a una sustitución. Úsala solo como referencia y revisa la carga.';return result;}
    const work=old.logs.find(l=>l.done),ratio=work?.kg>0?w.kg/work.kg:null;
    if(!Number.isFinite(workKg)||workKg<=0){result.reason='Revisa primero la carga de trabajo. Conservamos tu última aproximación como referencia, sin fijar un peso para hoy.';return result;}
    if(!Number.isFinite(ratio)||ratio<=0||ratio>0.7||!Number.isInteger(w.reps)||w.reps<1||w.reps>20){result.reason='La referencia no permite calcular una aproximación ligera comparable. Elige su carga y repeticiones manualmente.';return result;}
    const raw=workKg*ratio,kg=Number.isFinite(step)&&step>=0.1?round(Math.floor((raw+1e-9)/step)*step):Math.floor(raw*10)/10;
    if(kg<=0||kg>=workKg){result.reason='No se puede proponer una carga ligera con ese salto disponible. Elige una aproximación cómoda para el material que uses.';return result;}
    result.kg=kg;result.reps=w.reps;result.reason=`Tu última aproximación fue ${w.kg} kg × ${w.reps}, antes de trabajar con ${work.kg} kg. Se mantiene aproximadamente esa proporción para el objetivo de ${workKg} kg${step?' y se redondea hacia abajo al salto disponible':''}. Revisa que la carga sea cómoda y exista en tu gimnasio.`;
    return result;
  }
  function validWarmupGuidance(g){return !!g&&(g.kg===null||Number.isFinite(g.kg)&&g.kg>=0&&g.kg<=2000)&&Number.isInteger(g.reps)&&g.reps>=1&&g.reps<=20&&typeof g.reason==='string'&&g.reason.length<=1200&&(g.sourceId===null||typeof g.sourceId==='string'&&g.sourceId.length<=200)&&(g.sourceDate===null||Number.isFinite(g.sourceDate))&&(g.reference===null||g.reference&&Number.isFinite(g.reference.kg)&&g.reference.kg>=0&&g.reference.kg<=2000&&Number.isInteger(g.reference.reps)&&g.reference.reps>=1&&g.reference.reps<=200);}
  function validGuidance(g){return !!g&&(g.kg===null||Number.isFinite(g.kg)&&g.kg>=0&&g.kg<=2000)&&Array.isArray(g.reps)&&g.reps.length>0&&g.reps.length<=15&&g.reps.every(n=>Number.isInteger(n)&&n>=1&&n<=50)&&typeof g.reason==='string'&&g.reason.length<=1200&&typeof g.status==='string'&&g.status.length<=30&&(g.sourceId===null||typeof g.sourceId==='string'&&g.sourceId.length<=200)&&(g.sourceDate===null||Number.isFinite(g.sourceDate))&&typeof g.adjusted==='boolean';}
  return {suggest,suggestWarmup,rirLabels,validGuidance,validWarmupGuidance};
})();
