'use strict';
// Mi Gym's general-purpose templates. These splits are app choices, not an ACSM prescription.
// General reference: https://acsm.org/resistance-training-guidelines-update-2026/
// Each entry specifies a real session and working-set counts, not a filtered view of a six-day plan.
window.GYM_TRAINING_PLANS={
  1:{title:'Cuerpo completo',description:'Una sesión que reúne piernas, empuje y tirón. Es una opción de disponibilidad limitada; si puedes, distribuye el entrenamiento en al menos dos días.',sessions:[
    {id:'p1-a',name:'Cuerpo completo',day:'Lunes',focus:'Piernas, pecho, espalda y abdomen',exercises:[['prensa',3],['press-maquina',3],['remo-polea',3],['rumano',2],['hombro',2],['crunch',2]]}
  ]},
  2:{title:'Cuerpo completo A / B',description:'Dos sesiones con trabajo de piernas y torso en ambas. Los ejercicios cambian entre A y B y quedan días de descanso entre ellas.',sessions:[
    {id:'p2-a',name:'Cuerpo completo A',day:'Lunes',focus:'Piernas, pecho, espalda y abdomen',exercises:[['prensa',3],['press-maquina',3],['jalon',3],['rumano',2],['laterales',2],['crunch',2]]},
    {id:'p2-b',name:'Cuerpo completo B',day:'Jueves',focus:'Piernas, espalda, pecho y brazos',exercises:[['goblet',3],['remo-apoyado',3],['press-inclinado',3],['femoral',2],['gemelos',2],['curl',2],['triceps',2]]}
  ]},
  3:{title:'Cuerpo completo A / B / C',description:'Tres sesiones alternas de cuerpo completo, con distintos énfasis y un día de descanso entre entrenamientos.',sessions:[
    {id:'p3-a',name:'Cuerpo completo A',day:'Lunes',focus:'Cuádriceps, pecho y espalda',exercises:[['prensa',3],['press-maquina',3],['remo-polea',3],['femoral',2],['gemelos',2]]},
    {id:'p3-b',name:'Cuerpo completo B',day:'Miércoles',focus:'Cadena posterior, espalda y hombros',exercises:[['rumano',3],['jalon',3],['hombro',2],['goblet',2],['curl',2],['crunch',2]]},
    {id:'p3-c',name:'Cuerpo completo C',day:'Viernes',focus:'Piernas, pecho, espalda y brazos',exercises:[['goblet',3],['press-inclinado',3],['remo-apoyado',3],['hip-thrust',2],['laterales',2],['triceps',2]]}
  ]},
  4:{title:'Torso / Pierna A / B',description:'Dos sesiones de torso y dos de pierna. Se conserva la distribución de cuatro días del plan original, sin añadir un quinto día opcional.',sessions:[
    {from:'ta'},{from:'pa'},{from:'tb'},{from:'pb'}
  ]},
  5:{title:'Torso / Pierna + Empuje / Tirón / Pierna',description:'El trabajo del torso se reparte entre una sesión general, una de empuje y una de tirón. Hay dos sesiones de piernas y dos días libres.',sessions:[
    {id:'p5-torso',name:'Torso',day:'Lunes',focus:'Pecho, espalda y hombros',exercises:[['press-maquina',3],['jalon',3],['remo-polea',2],['laterales',2]]},
    {id:'p5-pierna-a',name:'Pierna A',day:'Martes',focus:'Cuádriceps, cadena posterior y abdomen',exercises:[['prensa',3],['rumano',2],['femoral',2],['gemelos',2],['crunch',2]]},
    {id:'p5-empuje',name:'Empuje',day:'Jueves',focus:'Pecho, hombros y tríceps',exercises:[['press-inclinado',3],['hombro',2],['laterales',2],['triceps',2]]},
    {id:'p5-tiron',name:'Tirón',day:'Viernes',focus:'Espalda y bíceps',exercises:[['remo-apoyado',3],['jalon',2],['curl',2]]},
    {id:'p5-pierna-b',name:'Pierna B',day:'Sábado',focus:'Piernas, glúteos y abdomen',exercises:[['goblet',3],['hip-thrust',2],['extension',2],['femoral',2],['gemelos',2],['crunch',2]]}
  ]},
  6:{title:'Empuje / Tirón / Pierna × 2',description:'Seis sesiones más cortas, con dos vueltas de empuje, tirón y pierna. El domingo queda libre. Más días reparten el trabajo; no implican mejores resultados por sí solos.',sessions:[
    {id:'p6-empuje-a',name:'Empuje A',day:'Lunes',focus:'Pecho, hombros y tríceps',exercises:[['press-maquina',3],['hombro',2],['laterales',2],['triceps',2]]},
    {id:'p6-tiron-a',name:'Tirón A',day:'Martes',focus:'Espalda y bíceps',exercises:[['jalon',3],['remo-polea',2],['curl',2]]},
    {id:'p6-pierna-a',name:'Pierna A',day:'Miércoles',focus:'Cuádriceps, cadena posterior y abdomen',exercises:[['prensa',3],['rumano',2],['gemelos',2],['crunch',2]]},
    {id:'p6-empuje-b',name:'Empuje B',day:'Jueves',focus:'Pecho, hombros y tríceps',exercises:[['press-inclinado',3],['hombro',2],['laterales',2],['triceps',2]]},
    {id:'p6-tiron-b',name:'Tirón B',day:'Viernes',focus:'Espalda y bíceps',exercises:[['remo-apoyado',3],['jalon',2],['curl',2]]},
    {id:'p6-pierna-b',name:'Pierna B',day:'Sábado',focus:'Piernas, glúteos y abdomen',exercises:[['goblet',3],['hip-thrust',2],['femoral',2],['gemelos',2],['crunch',2]]}
  ]}
};
