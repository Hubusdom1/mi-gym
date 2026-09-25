# Mi Gym

App personal de gimnasio, sin dependencias, con rutina torso/pierna de cuatro días y un quinto día opcional. Series, pesos, historial y temporizador se guardan en localStorage del navegador. Sin base de datos ni envío de registros a un servidor.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `mi-gym`.
2. Sube todos los archivos de la carpeta `dist` a la raíz del repositorio (index.html debe estar en la raíz).
3. En Settings > Pages, selecciona Deploy from a branch, rama main y carpeta / (root), y guarda.
4. Abre la dirección que muestre GitHub Pages. En Safari, Compartir > Añadir a pantalla de inicio.

Las rutas de recursos son relativas y admiten una subcarpeta como /mi-gym/. No subas .openai/hosting.json: solo corresponde a la versión alojada en Sites.

## Uso

Lunes: Torso A. Martes: Pierna A. Miércoles: descanso. Jueves: Torso B. Viernes: Pierna B. Sábado: extra opcional o paseo. Domingo: descanso. Se pueden mover los días respetando recuperación.

Primeras dos semanas: elige Adaptación al iniciar sesión, para hacer dos series por ejercicio. Después usa Series del plan si recuperas bien. Los pesos empiezan vacíos; los pesos anteriores son referencias, no registros ya realizados. Marca cada serie completada. Terminar guarda solo las series marcadas.

Mancuernas: kg de una mancuerna. Barra: kg totales, incluida la barra. Máquina: carga indicada. No compares distintas máquinas solo por los kg de sus placas.

Calienta 5–8 min y realiza series de aproximación. Deja 2–3 repeticiones en reserva. Aumenta el mínimo peso disponible cuando completes el máximo del rango en todas las series con técnica y margen. Pide al monitor que te enseñe movimientos desconocidos. Para ante dolor punzante o articular. Plan general para adultos sin lesiones conocidas.

Referencia: https://acsm.org/resistance-training-guidelines-update-2026/

## Datos y funcionamiento

Exporta e importa copias JSON desde Rutina. Cada dominio, navegador y dispositivo mantiene sus propios datos. Para cambiar de alojamiento exporta e importa. Cambiar el nombre de un ejercicio crea un identificador distinto para separar sus marcas. Los cambios de rutina afectan a las siguientes sesiones.

Los recursos de la app se guardan para uso sin conexión mediante service worker después de una primera carga correcta; las barreras de acceso del alojamiento pueden requerir conexión o inicio de sesión. GitHub Pages permite servirla públicamente, aunque cada persona solo ve sus propios registros locales.

El temporizador conserva la hora final y se ajusta al regresar. No hay avisos en segundo plano ni con la pantalla bloqueada. No contiene cuentas de usuario ni sincronización de entrenamientos. Evita usarla simultáneamente en varias pestañas. Borrar los datos del navegador puede eliminar los registros.

Para actualizar los recursos sin conexión, aumenta la versión de CACHE en sw.js y cierra las pestañas antiguas para activar la nueva versión. No cambies la clave mi-gym-v1 salvo que implementes una migración.
