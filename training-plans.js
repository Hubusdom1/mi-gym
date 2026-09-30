'use strict';
// App templates. Three working sets are the requested product minimum, not a universal prescription.
window.GYM_TRAINING_PLANS={
  1:{title:'Cuerpo completo',description:'Piernas, empuje y tirón en una sola sesión. Disponibilidad limitada; conserva los movimientos principales.',sessions:[
    {id:'p1-a',name:'Cuerpo completo',day:'Lunes',focus:'Piernas, pecho y espalda',required:['knee','posterior','chest','pull'],exercises:[['prensa',3],['press-maquina',3],['remo-polea',3],['rumano',3],['crunch',3]]}
  ]},
  2:{title:'Cuerpo completo A / B',description:'Dos sesiones completas en días separados, con piernas, empuje y tirón en ambas.',sessions:[
    {id:'p2-a',name:'Cuerpo completo A',day:'Lunes',focus:'Piernas, pecho y espalda',required:['knee','posterior','chest','pull'],exercises:[['prensa',3],['press-maquina',3],['jalon',3],['rumano',3],['laterales',3]]},
    {id:'p2-b',name:'Cuerpo completo B',day:'Jueves',focus:'Piernas, pecho y espalda',required:['knee','posterior','chest','pull'],exercises:[['goblet',3],['press-inclinado',3],['remo-apoyado',3],['hip-thrust',3],['curl',3],['triceps',3]]}
  ]},
  3:{title:'Pecho / Espalda / Pierna y hombro',description:'Pecho y tríceps; espalda y bíceps; pierna y hombro. Tres bloques con descanso entre ellos, una sesión principal por grupo a la semana.',sessions:[
    {id:'p3-pecho',name:'Pecho y tríceps',day:'Lunes',focus:'Pecho, tríceps y abdomen',required:['chest','triceps'],exercises:[['press-maquina',3],['press-inclinado',3],['triceps',3],['triceps-mancuerna',3],['crunch',3]]},
    {id:'p3-espalda',name:'Espalda y bíceps',day:'Miércoles',focus:'Espalda y bíceps',required:['pull','biceps'],exercises:[['jalon',3],['remo-polea',3],['remo-apoyado',3],['curl',3],['curl-polea',3]]},
    {id:'p3-pierna',name:'Pierna y hombro',day:'Viernes',focus:'Piernas, cadena posterior y hombros',required:['knee','posterior','shoulder'],exercises:[['prensa',3],['rumano',3],['hombro',3],['femoral',3],['laterales',3],['gemelos',3]]}
  ]},
  4:{title:'Torso / Pierna × 2',description:'Torso y pierna dos veces. En cuatro días, esta distribución permite repetir todos los grupos sin concentrarlos en una sesión extra de cuerpo completo.',sessions:[
    {id:'ta',name:'Torso A',day:'Lunes',focus:'Pecho, espalda, hombros y brazos',required:['chest','pull','shoulder','biceps','triceps'],exercises:[['press-maquina',3],['jalon',3],['remo-polea',3],['hombro',3],['curl',3],['triceps',3]]},
    {id:'pa',name:'Pierna A',day:'Martes',focus:'Cuádriceps, cadena posterior y gemelos',required:['knee','posterior','calf'],exercises:[['prensa',3],['rumano',3],['femoral',3],['gemelos',3],['crunch',3]]},
    {id:'tb',name:'Torso B',day:'Jueves',focus:'Pecho, espalda, hombros y brazos',required:['chest','pull','shoulder','biceps','triceps'],exercises:[['press-inclinado',3],['remo-apoyado',3],['jalon',3],['hombro',3],['curl-polea',3],['triceps-mancuerna',3]]},
    {id:'pb',name:'Pierna B',day:'Viernes',focus:'Piernas, glúteos y gemelos',required:['knee','posterior','calf'],exercises:[['goblet',3],['hip-thrust',3],['extension',3],['femoral',3],['gemelos',3]]}
  ]},
  5:{title:'Pecho / Espalda / Pierna + Torso / Pierna',description:'Los tres bloques iniciales más una sesión de torso y otra de pierna. Pecho, espalda, hombros, brazos y piernas reciben trabajo en dos días distintos.',sessions:[
    {id:'p5-pecho',name:'Pecho y tríceps',day:'Lunes',focus:'Pecho y tríceps',required:['chest','triceps'],exercises:[['press-maquina',3],['press-inclinado',3],['triceps',3],['crunch',3]]},
    {id:'p5-espalda',name:'Espalda y bíceps',day:'Martes',focus:'Espalda y bíceps',required:['pull','biceps'],exercises:[['jalon',3],['remo-polea',3],['curl',3]]},
    {id:'p5-pierna-a',name:'Pierna y hombro',day:'Miércoles',focus:'Piernas y hombros',required:['knee','posterior','shoulder','calf'],exercises:[['prensa',3],['rumano',3],['hombro',3],['femoral',3],['gemelos',3]]},
    {id:'p5-torso',name:'Torso',day:'Viernes',focus:'Pecho, espalda, hombros y brazos',required:['chest','pull','shoulder','biceps','triceps'],exercises:[['press-inclinado',3],['remo-apoyado',3],['jalon',3],['laterales',3],['curl-polea',3],['triceps',3]]},
    {id:'p5-pierna-b',name:'Pierna',day:'Sábado',focus:'Piernas, glúteos y gemelos',required:['knee','posterior','calf'],exercises:[['goblet',3],['hip-thrust',3],['extension',3],['femoral',3],['gemelos',3]]}
  ]},
  6:{title:'Empuje / Tirón / Pierna × 2',description:'Dos vueltas de empuje, tirón y pierna. En seis días, el hombro se agrupa con pecho y tríceps para separar mejor las sesiones de empuje.',sessions:[
    {id:'p6-empuje-a',name:'Empuje A',day:'Lunes',focus:'Pecho, hombros y tríceps',required:['chest','shoulder','triceps'],exercises:[['press-maquina',3],['hombro',3],['laterales',3],['triceps',3]]},
    {id:'p6-tiron-a',name:'Tirón A',day:'Martes',focus:'Espalda y bíceps',required:['pull','biceps'],exercises:[['jalon',3],['remo-polea',3],['curl',3]]},
    {id:'p6-pierna-a',name:'Pierna A',day:'Miércoles',focus:'Piernas y gemelos',required:['knee','posterior','calf'],exercises:[['prensa',3],['rumano',3],['gemelos',3],['crunch',3]]},
    {id:'p6-empuje-b',name:'Empuje B',day:'Jueves',focus:'Pecho, hombros y tríceps',required:['chest','shoulder','triceps'],exercises:[['press-inclinado',3],['hombro',3],['laterales-polea',3],['triceps-mancuerna',3]]},
    {id:'p6-tiron-b',name:'Tirón B',day:'Viernes',focus:'Espalda y bíceps',required:['pull','biceps'],exercises:[['remo-apoyado',3],['jalon',3],['curl-polea',3]]},
    {id:'p6-pierna-b',name:'Pierna B',day:'Sábado',focus:'Piernas, glúteos y gemelos',required:['knee','posterior','calf'],exercises:[['goblet',3],['hip-thrust',3],['femoral',3],['gemelos',3]]}
  ]}
};
