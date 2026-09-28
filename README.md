# Mi Gym

App personal de gimnasio, sin dependencias, con rutinas que se adaptan a los días elegidos y pueden personalizarse. El plan inicial es torso/pierna de cuatro días. Series, pesos, historial y temporizador se guardan en localStorage del navegador. Sin base de datos ni envío de registros a un servidor.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `mi-gym`.
2. Sube todos los archivos de la carpeta `dist` a la raíz del repositorio (index.html debe estar en la raíz).
3. En Settings > Pages, selecciona Deploy from a branch, rama main y carpeta / (root), y guarda.
4. Abre la dirección que muestre GitHub Pages. En Safari, Compartir > Añadir a pantalla de inicio.

Las rutas de recursos son relativas y admiten una subcarpeta como /mi-gym/. No subas .openai/hosting.json: solo corresponde a la versión alojada en Sites.

## Uso

Desde **Días y rutina**, elige tu disponibilidad y revisa las sesiones antes de aplicar. Cambian la distribución, los ejercicios, las series y los días planificados. Puedes mover los días respetando la recuperación.

Primeras dos semanas: elige Adaptación al iniciar sesión, para hacer dos series por ejercicio. Después usa Series del plan si recuperas bien. Los pesos empiezan vacíos; los pesos anteriores son referencias, no registros ya realizados. Marca cada serie completada. Terminar guarda solo las series marcadas.

Mancuernas: kg de una mancuerna. Barra: kg totales, incluida la barra. Máquina: carga indicada. No compares distintas máquinas solo por los kg de sus placas.

Calienta 5–8 min y realiza series de aproximación. Deja 2–3 repeticiones en reserva. Aumenta el mínimo peso disponible cuando completes el máximo del rango en todas las series con técnica y margen. Pide al monitor que te enseñe movimientos desconocidos. Para ante dolor punzante o articular. Plan general para adultos sin lesiones conocidas.

Referencia: https://acsm.org/resistance-training-guidelines-update-2026/

## Datos y funcionamiento

Exporta e importa copias JSON desde Rutina. Cada dominio, navegador y dispositivo mantiene sus propios datos. Para cambiar de alojamiento exporta e importa. Cambiar el nombre de un ejercicio crea un identificador distinto para separar sus marcas. Los cambios de rutina afectan a las siguientes sesiones.

Los recursos de la app se guardan para uso sin conexión mediante service worker después de una primera carga correcta; las barreras de acceso del alojamiento pueden requerir conexión o inicio de sesión. GitHub Pages permite servirla públicamente, aunque cada persona solo ve sus propios registros locales.

El temporizador conserva la hora final y se ajusta al regresar. No hay avisos en segundo plano ni con la pantalla bloqueada. No contiene cuentas de usuario ni sincronización de entrenamientos. Evita usarla simultáneamente en varias pestañas. Borrar los datos del navegador puede eliminar los registros.

Para actualizar los recursos sin conexión, aumenta la versión de CACHE en sw.js y cierra las pestañas antiguas para activar la nueva versión. No cambies la clave mi-gym-v1 salvo que implementes una migración.

## Guías visuales

Los 17 ejercicios del plan incluyen miniaturas, mapa frontal/posterior de músculos y una ficha de movimiento con claves de técnica. Rosa: músculos principales; ámbar: secundarios o apoyo. El mapa es orientativo y no mide activación. Se usan una o dos poses según el ejercicio, sin simular animaciones. Las diferencias de variante se indican en la ficha.

En Rutina > Editar puedes elegir una guía del catálogo para un ejercicio personalizado o dejarlo sin guía. Las copias antiguas siguen siendo compatibles y conservan sus registros.

Se distribuyen 32 SVG de Workout Guide (Bryl Lim), con originales de Everkinetic, bajo CC BY-SA 4.0; están recoloreados y conservan esa licencia. La geometría del mapa corporal es de GV79/react-body-highlighter (MIT). Los créditos completos, enlaces por imagen y licencias están en dist/assets/licenses/credits.html. Conserva estos avisos y las licencias al distribuir los recursos o sus adaptaciones.

## Rutinas y entrenamiento personalizable

- **Rutina > Crear día**: nombre, día habitual, descripción y carácter opcional. Hasta 20 días, con hasta 30 ejercicios por día. Los días pueden quedar vacíos mientras los preparas.
- **Añadir ejercicio**: busca en el catálogo, filtra por grupo muscular o crea una variante personalizada. Las flechas permiten ordenar días y ejercicios. Editar el nombre crea una nueva identidad y separa sus marcas; cambiar solo series/repeticiones conserva la identidad.
- **Entrenar**: vista de un ejercicio o lista completa. Puedes saltar a cualquier ejercicio y la sesión recuerda dónde estabas al cerrar la app. La vista de un ejercicio muestra guía, notas, marcas anteriores, series y temporizador.
- **Cambiar ejercicio**: sustituye las series pendientes solo para hoy o también para la rutina. Las series ya completadas se conservan por separado. La alternativa empieza con cargas y repeticiones vacías y conserva su propio historial. Si cambió o se eliminó el ejercicio en la rutina durante la sesión, solo se permite sustituirlo para hoy.
- **Notas**: los ajustes se guardan por ejercicio y aparecen en todas las rutinas donde se use. Al terminar una sesión se conserva una copia de la nota en su historial. Usa variantes distintas para máquinas que no quieras comparar.
- **Progreso**: reconoce aumentos del máximo de peso y aumentos de repeticiones a una carga ya registrada. La primera sesión establece la referencia; no se considera una mejora frente a datos inexistentes.
- **Días y rutina**: de 1 a 6 días de fuerza. Al aplicar se actualizan el plan completo y el objetivo semanal. Se cuentan entrenamientos guardados de lunes a domingo en la zona horaria del dispositivo. Eliminar una sesión recalcula métricas y récords. Las copias antiguas con objetivo de 7 siguen siendo compatibles y se conservan hasta aplicar otro plan.

La clave de almacenamiento sigue siendo `mi-gym-v1`. Las copias antiguas se aceptan sin perder su historial; los nuevos campos se inicializan en memoria y se guardan en la próxima modificación. Las exportaciones incluyen días personalizados, notas, objetivo, vista y sesión en curso. Eliminar o reordenar una rutina no modifica sus sesiones guardadas ni la sesión activa.

## Adaptación de la rutina a la frecuencia

| Días | Distribución |
| --- | --- |
| 1 | Cuerpo completo, para disponibilidad limitada |
| 2 | Cuerpo completo A/B |
| 3 | Cuerpo completo A/B/C en días alternos |
| 4 | Torso/Pierna A/B |
| 5 | Torso, Pierna, Empuje, Tirón, Pierna |
| 6 | Empuje, Tirón y Pierna dos veces |

Las plantillas de `training-plans.js` especifican sesiones y series reales. No se recorta un plan fijo ni se cambia solo el contador. La vista previa enumera días, ejercicios y series, con descansos programados. Son planes generales editables elaborados para la app, no planes personalizados por IA ni una prescripción específica de ACSM. Se apoyan en el principio general de repartir el trabajo de los principales grupos musculares y ajustar la frecuencia a disponibilidad y recuperación. Más días no significan automáticamente más volumen ni mejores resultados.

Al abrir datos de la versión anterior, el plan original sin personalizar se adapta al objetivo que ya estuviera elegido (1–6). Si estaba personalizado, se mantiene y la app avisa cuando distribución y objetivo no coinciden. Aplicar un plan por días guarda cualquier rutina personalizada en **Planes anteriores** (hasta 20 copias sin duplicados), desde donde puede recuperarse. No se borran pesos, notas, récords ni la sesión activa. Las copias se incluyen al exportar/importar. Las identidades de los ejercicios se mantienen para que sus marcas sigan disponibles al cambiar la distribución.

Validación: `tests/app.test.cjs` comprueba los flujos del registro y `tests/frequency.test.cjs` los cambios reales de frecuencia, su vista previa, la migración y la conservación de datos. Ambos usan Node y `linkedom` como dependencia de pruebas; la app publicada no necesita dependencias.
