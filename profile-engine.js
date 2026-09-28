'use strict';
// Local, deterministic templates. No remote service receives profile information.
window.GYM_PROFILE = (() => {
  const goals = {muscle:'Ganar músculo',strength:'Ganar fuerza',fatloss:'Perder grasa',fitness:'Estar en forma'};
  const levels = {beginner:'Estoy empezando',returning:'Vuelvo después de un tiempo',regular:'Entreno con regularidad'};
  const equipment = {machines:'Máquinas',cables:'Poleas',dumbbells:'Mancuernas',barbells:'Barras y discos',bench:'Bancos'};
  // [material, movement, muscle group, main lift]
  const meta = {
    'press-maquina':[['machines'],'chest','Pecho',true],jalon:[['cables'],'vertical-pull','Espalda',true],
    'remo-polea':[['cables'],'row','Espalda',true],'remo-apoyado':[['machines'],'row','Espalda',true],
    laterales:[['dumbbells'],'lateral','Hombros',false],triceps:[['cables'],'triceps','Brazos',false],curl:[['dumbbells'],'biceps','Brazos',false],
    prensa:[['machines'],'knee','Piernas',true],rumano:[['dumbbells'],'hinge','Piernas',true],extension:[['machines'],'knee-extension','Piernas',false],
    femoral:[['machines'],'knee-flexion','Piernas',false],gemelos:[['machines'],'calf','Piernas',false],crunch:[['cables'],'core','Abdomen',false],
    'press-inclinado':[['dumbbells','bench'],'chest','Pecho',true],hombro:[['machines'],'shoulder','Hombros',true],goblet:[['dumbbells'],'knee','Piernas',true],
    'hip-thrust':[['machines'],'hip','Piernas',true],
    'press-suelo':[['dumbbells'],'chest','Pecho',true],'remo-mancuerna':[['dumbbells'],'row','Espalda',true],
    'press-hombro-mancuerna':[['dumbbells'],'shoulder','Hombros',true],'rumano-barra':[['barbells'],'hinge','Piernas',true],
    'remo-barra':[['barbells'],'row','Espalda',true],'pull-through':[['cables'],'hinge','Piernas',true],
    'gemelos-mancuerna':[['dumbbells'],'calf','Piernas',false],'crunch-suelo':[[],'core','Abdomen',false],
    'puente-gluteos':[['dumbbells'],'hip','Piernas',true],'curl-polea':[['cables'],'biceps','Brazos',false],
    'triceps-mancuerna':[['dumbbells'],'triceps','Brazos',false],'laterales-polea':[['cables'],'lateral','Hombros',false],
    flexiones:[[],'chest','Pecho',true],'zancada-estatica':[[],'knee','Piernas',true]
  };
  const extra = [
    ['press-suelo','Press de pecho con mancuernas en suelo','Túmbate boca arriba, con rodillas flexionadas. Baja hasta apoyar suavemente los brazos y empuja con control.','Press en máquina'],
    ['remo-mancuerna','Remo con mancuerna','Adelanta un pie, apoya el antebrazo libre sobre el muslo e inclina el tronco con espalda estable. Lleva el codo hacia la cadera. Repite a ambos lados.','Remo en polea'],
    ['press-hombro-mancuerna','Press de hombros con mancuernas de pie','Mantén abdomen firme y costillas alineadas. Empuja desde una posición cómoda sin arquear la espalda.','Press de hombros en máquina'],
    ['rumano-barra','Peso muerto rumano con barra','Empieza con carga ligera. Lleva la cadera atrás con las rodillas algo flexionadas, barra cerca y espalda estable. Pide ayuda para aprender la bisagra de cadera.','Rumano con mancuernas'],
    ['remo-barra','Remo inclinado con barra','Con rodillas algo flexionadas, inclina el tronco desde la cadera y mantenlo estable. Acerca la barra sin impulsarte.','Remo con mancuerna'],
    ['pull-through','Pull-through en polea','De espaldas a una polea baja, sujeta la cuerda entre las piernas. Lleva la cadera atrás y extiéndela sin arquear la espalda.','Rumano con mancuernas'],
    ['gemelos-mancuerna','Elevación de gemelos con mancuerna','Usa la mano libre para equilibrarte en un apoyo firme. Sube y baja los talones con control, sin rebotar.','Gemelos en máquina'],
    ['crunch-suelo','Crunch en suelo','Con rodillas flexionadas, acerca suavemente las costillas a la pelvis sin tirar del cuello. Un recorrido corto es suficiente.','Crunch en polea'],
    ['puente-gluteos','Puente de glúteos con mancuerna','Túmbate con las rodillas flexionadas y sujeta una mancuerna acolchada sobre la cadera. Eleva la pelvis sin arquear la espalda.','Hip thrust en máquina'],
    ['curl-polea','Curl de bíceps en polea','Con polea baja, flexiona los codos manteniéndolos junto al tronco, sin balancearte.','Curl con mancuernas'],
    ['triceps-mancuerna','Extensión de tríceps con mancuerna','Sujeta una mancuerna ligera con ambas manos. Flexiona y extiende los codos por encima de la cabeza en un recorrido cómodo, sin arquear la espalda.','Tríceps en polea'],
    ['laterales-polea','Elevación lateral en polea','Con polea baja y carga ligera, eleva el brazo lateralmente sin impulso. Repite a ambos lados.','Elevaciones laterales con mancuernas'],
    ['flexiones','Flexiones','Con manos apoyadas en el suelo, mantén el cuerpo alineado al bajar y empujar. Apoya las rodillas si lo necesitas y usa un recorrido cómodo.','Press en máquina'],
    ['zancada-estatica','Zancada estática sin carga','Coloca un pie delante del otro, con espacio lateral para equilibrarte. Flexiona ambas rodillas con control y vuelve a subir. Repite a ambos lados.','Sentadilla goblet']
  ].map(([id,name,cue,alt])=>({id,name,cue,alt,sets:2,min:8,max:12,rest:90,guideId:''}));
  const defaults = days => ({version:1,name:'',age:'',height:null,weight:null,goal:'muscle',experience:'beginner',days:Math.max(1,Math.min(6,days||4)),minutes:45,equipment:Object.keys(equipment),avoid:[],updatedAt:0});
  const valid = p => !!p&&p.version===1&&typeof p.name==='string'&&p.name.length<=60&&Number.isInteger(p.age)&&p.age>=18&&p.age<=100&&(p.height===null||Number.isFinite(p.height)&&p.height>=80&&p.height<=250)&&(p.weight===null||Number.isFinite(p.weight)&&p.weight>=25&&p.weight<=400)&&Object.hasOwn(goals,p.goal)&&Object.hasOwn(levels,p.experience)&&Number.isInteger(p.days)&&p.days>=1&&p.days<=6&&[30,45,60,75,90].includes(p.minutes)&&Array.isArray(p.equipment)&&p.equipment.length>0&&p.equipment.every(k=>Object.hasOwn(equipment,k))&&new Set(p.equipment).size===p.equipment.length&&Array.isArray(p.avoid)&&p.avoid.length<=Object.keys(meta).length&&p.avoid.every(id=>Object.hasOwn(meta,id))&&new Set(p.avoid).size===p.avoid.length&&Number.isFinite(p.updatedAt);
  const preferences = p => JSON.stringify([p.goal,p.experience,p.days,p.minutes,[...p.equipment].sort(),[...p.avoid].sort()]);
  const eligible = (e,p) => !p.avoid.includes(e.id)&&(!meta[e.id]||meta[e.id][0].every(k=>p.equipment.includes(k)));
  const minutesFor = (r,cardio=0) => 6+cardio+r.exercises.reduce((n,e)=>n+1.5+e.sets*(e.id==='remo-mancuerna'||e.id==='zancada-estatica'||e.id==='laterales-polea'?80:40)/60+Math.max(0,e.sets-1)*e.rest/60,0);
  function generate(p,base,catalog) {
    if(!valid(p))return {routines:[],changes:[],errors:['Revisa los datos del perfil.']};
    const all=[...catalog,...extra],changes=new Set(),errors=[];
    const replacements={chest:['press-maquina','press-inclinado','press-suelo','flexiones'],row:['remo-apoyado','remo-polea','remo-mancuerna','remo-barra'],'vertical-pull':['jalon','remo-apoyado','remo-polea','remo-mancuerna','remo-barra'],knee:['prensa','goblet','zancada-estatica'],hinge:['rumano','rumano-barra','pull-through','hip-thrust','puente-gluteos'],hip:['hip-thrust','puente-gluteos','rumano','rumano-barra','pull-through'],shoulder:['hombro','press-hombro-mancuerna'],lateral:['laterales','laterales-polea'],biceps:['curl','curl-polea'],triceps:['triceps','triceps-mancuerna'],calf:['gemelos','gemelos-mancuerna'],core:['crunch','crunch-suelo']};
    const cardio=p.goal==='fatloss'?8:0;
    const routines=base.map(r=>{
      const used=new Set();
      const exercises=r.exercises.flatMap(original=>{
        let e=original;
        if(!eligible(e,p)||used.has(e.id)){
          const ids=replacements[meta[e.id]?.[1]]||[];
          e=ids.map(id=>all.find(x=>x.id===id)).find(x=>x&&eligible(x,p)&&!used.has(x.id));
          if(e)changes.add(`${original.name} → ${e.name}.`);
          else {changes.add(`Se omite ${original.name}: no hay otra opción disponible en el catálogo para ese hueco.`);return [];}
        }
        used.add(e.id);e={...e};delete e.slotId;
        const main=meta[e.id]?.[3],adapt=p.experience!=='regular';
        e.sets=adapt||p.goal==='fitness'?Math.min(2,original.sets):p.goal==='muscle'&&main?3:original.sets;
        if(p.goal==='strength'&&main){e.min=adapt?8:5;e.max=adapt?10:8;e.rest=adapt?120:180;}
        else if(main){e.min=8;e.max=12;e.rest=120;}
        else {e.min=10;e.max=e.id.includes('gemelos')?20:15;e.rest=75;}
        return [e];
      });
      const out={...r,exercises,cardioMinutes:cardio};
      // Keep movement coverage and rest intervals. Short sessions reduce sets first.
      let trimmed=false;
      while(minutesFor(out,cardio)>p.minutes&&exercises.some(e=>e.sets>1)){
        const candidates=exercises.map((e,i)=>({e,i})).filter(x=>x.e.sets>1).sort((a,b)=>b.e.sets-a.e.sets||Number(meta[a.e.id]?.[3])-Number(meta[b.e.id]?.[3])||b.i-a.i);
        candidates[0].e.sets--;trimmed=true;
      }
      if(trimmed)changes.add(`Menos series en ${r.name} para acercar la sesión a ${p.minutes} minutos.`);
      out.estimatedMinutes=Math.ceil(minutesFor(out,cardio));
      if(!exercises.length)errors.push(`${r.name} se queda sin ejercicios. Revisa el material o los ejercicios excluidos.`);
      if(out.estimatedMinutes>p.minutes)errors.push(`${r.name} necesita aproximadamente ${out.estimatedMinutes} minutos. Elige más tiempo.`);
      return out;
    });
    const patterns=new Set(routines.flatMap(r=>r.exercises.map(e=>meta[e.id]?.[1])));
    const missing=[['chest','pecho'],['row','espalda'],['knee','piernas'],['hinge','cadera y cadena posterior']].filter(([key])=>key==='row'?!patterns.has('row')&&!patterns.has('vertical-pull'):key==='hinge'?!patterns.has('hinge')&&!patterns.has('hip'):!patterns.has(key)).map(([,label])=>label);
    if(missing.length)errors.push(`Con estas opciones faltan ejercicios de ${missing.join(', ')}. Añade material o revisa las exclusiones para crear una propuesta completa.`);
    return {routines,changes:[...changes],errors:[...new Set(errors)],cardio};
  }
  return {goals,levels,equipment,meta,extra,defaults,valid,preferences,eligible,minutesFor,generate};
})();
