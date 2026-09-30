# Mi Gym

App de gimnasio con rutinas adaptables, registro de entrenamientos y acceso con cuenta preparado mediante Supabase. Sin cuenta, los datos se guardan en este navegador. Con la conexión activada e inicio de sesión, perfil, rutinas, notas, historial y sesión en curso se guardan en la cuenta y se recuperan en otro dispositivo.

**Estado de esta entrega:** proyecto Supabase `Mi Gym` creado en París (`hsegquwjytlglabjnkjc`) y conexión pública configurada. La migración ya está aplicada: no volver a ejecutarla en este proyecto. Se han probado permisos, guardado con revisiones y aislamiento en la base de datos real, además de las pruebas locales. **Falta configurar las URLs de Auth y el correo antes de probar registro y recuperación completos.** No se han creado cuentas personales ni enviado correos de prueba. La app muestra un aviso mientras `emailSetupPending` sea `true`.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo, por ejemplo `mi-gym`.
2. Sube todos los archivos de la carpeta `dist` a la raíz del repositorio (index.html debe estar en la raíz).
3. En Settings > Pages, selecciona Deploy from a branch, rama main y carpeta / (root), y guarda.
4. Abre la dirección que muestre GitHub Pages. En Safari, Compartir > Añadir a pantalla de inicio.

Las rutas de recursos son relativas y admiten una subcarpeta como /mi-gym/. No subas .openai/hosting.json: solo corresponde a la versión alojada en Sites.

## Uso

Desde **Días y rutina**, elige tu disponibilidad y revisa las sesiones antes de aplicar. Cambian la distribución, los ejercicios, las series y los días planificados. Puedes mover los días respetando la recuperación.

Al empezar, puedes elegir Adaptación para hacer hasta dos series por ejercicio, o Series del plan. En esos modos los pesos empiezan vacíos. **Preparar con mi historial** permite revisar y aceptar objetivos de carga antes de comenzar. Las repeticiones realizadas siempre empiezan vacías; las marcas anteriores son referencias. Marca cada serie completada. Terminar guarda solo las series marcadas.

Mancuernas: kg de una mancuerna. Barra: kg totales, incluida la barra. Máquina: carga indicada. No compares distintas máquinas solo por los kg de sus placas.

Calienta 5–8 min y realiza series de aproximación. Deja 2–3 repeticiones en reserva. Aumenta el mínimo peso disponible cuando completes el máximo del rango en todas las series con técnica y margen. Pide al monitor que te enseñe movimientos desconocidos. Para ante dolor punzante o articular. Plan general para adultos sin lesiones conocidas.

Referencia: https://acsm.org/resistance-training-guidelines-update-2026/

## Datos y funcionamiento

Exporta e importa copias JSON desde Rutina. Sin cuenta, cada dominio, navegador y dispositivo mantiene sus propios datos; para cambiar de alojamiento exporta e importa. Con una cuenta y el mismo proyecto Supabase configurado, inicia sesión y espera a que se descarguen tus datos. Cambiar el nombre de un ejercicio crea un identificador distinto para separar sus marcas. Los cambios de rutina afectan a las siguientes sesiones.

Los recursos de la app se guardan para uso sin conexión mediante service worker después de una primera carga correcta; las barreras de acceso del alojamiento pueden requerir conexión o inicio de sesión. GitHub Pages permite servirla públicamente, con registros locales o acceso con cuenta según la configuración.

El temporizador conserva la hora final y se ajusta al regresar. No hay avisos en segundo plano ni con la pantalla bloqueada. Evita editar simultáneamente en varias pestañas. Borrar los datos del navegador elimina la copia local y los cambios todavía pendientes; una cuenta puede recuperar lo que ya se haya sincronizado.

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

La clave de almacenamiento sin cuenta sigue siendo `mi-gym-v1`. Cada cuenta utiliza una caché separada por proyecto y usuario. Las copias antiguas se aceptan sin perder su historial; los nuevos campos se inicializan en memoria y se guardan en la próxima modificación. Las exportaciones incluyen días personalizados, notas, objetivo, vista y sesión en curso. Eliminar o reordenar una rutina no modifica sus sesiones guardadas ni la sesión activa.

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

Validación: `tests/app.test.cjs` comprueba los flujos del registro y `tests/frequency.test.cjs` los cambios reales de frecuencia, su vista previa, la migración y la conservación de datos. Ambos usan Node y `linkedom` como dependencia de pruebas; la app publicada incluye sus recursos y el cliente Supabase empaquetado; no necesita Node en el teléfono.

## Primera visita y Perfil

La versión 5 añade un asistente de cuatro pasos: objetivo, datos personales y experiencia, disponibilidad/material y propuesta de rutina. En instalaciones nuevas se abre automáticamente; puede posponerse. Las instalaciones existentes reciben un acceso a **Completar perfil**, sin interrumpir la sesión activa. **Perfil** es la quinta pestaña y permite revisar o cambiar las respuestas.

El nombre, la altura y el peso son opcionales. La edad sirve para limitar estas propuestas generales a adultos (18–100 años). La altura y el peso se guardan como referencia, sin calcular cargas, calorías ni diagnósticos. El perfil se incluye en las copias JSON. Sin cuenta permanece en el navegador; al activar la conexión y acceder con cuenta se sincroniza en Supabase. No se envía a una IA.

`profile-engine.js` adapta las plantillas reales de 1–6 días:

- **Objetivo:** fuerza cambia repeticiones y descansos de los principales; músculo prioriza series; estar en forma limita el volumen; perder grasa mantiene fuerza y propone 8 minutos opcionales de actividad suave. La app no promete pérdida de peso ni registra ese cardio como series de fuerza.
- **Experiencia:** empezar o volver limita las series iniciales; el usuario puede ajustar la rutina o actualizar su nivel más adelante. No se aumenta el volumen automáticamente por el mero paso del tiempo.
- **Tiempo:** se estiman calentamiento, transiciones, series, descansos y actividad adicional. Si hace falta, se reducen series sin acortar automáticamente los descansos. Es una estimación, no una garantía de duración.
- **Material:** máquinas, poleas, mancuernas, barras/discos y bancos. Las sustituciones se buscan en un catálogo cerrado. La vista previa detalla los cambios y omisiones; si faltan patrones básicos o una sesión queda vacía, impide aplicar la propuesta y pide revisar las opciones. Elegir material limitado dentro del gimnasio no cambia el enfoque de la app a entrenamiento en casa.
- **Exclusiones:** los ejercicios marcados se excluyen de las propuestas y del catálogo filtrado. Son preferencias concretas, no una evaluación de lesiones. Una máquina ocupada se gestiona con el cambio temporal de ejercicio durante la sesión.

Se incorporan 14 alternativas con instrucciones escritas. Se mantienen las 17 guías visuales existentes; las variantes nuevas sin una ilustración correspondiente se muestran sin guía, evitando atribuirles una imagen diferente.

La vista previa no escribe datos. **Guardar perfil y empezar / Aplicar nueva rutina** actualiza el plan futuro y el objetivo semanal de forma conjunta, archivando el plan personalizado anterior. Conserva registros, notas, sesión activa y temporizador. En instalaciones existentes, **Guardar solo el perfil** mantiene la rutina y muestra que las nuevas preferencias están pendientes de aplicar. **Días y rutina** también utiliza el perfil, para no perder sus ajustes al cambiar la frecuencia. Recuperar un plan anterior conserva el perfil personal y recupera la rutina elegida con su contexto de generación.

Las reglas concretas son decisiones de la app, no una prescripción individual ni un plan oficial de ACSM. Referencia general: [actualización de entrenamiento de fuerza de ACSM, marzo de 2026](https://acsm.org/resistance-training-guidelines-update-2026/). La carga se elige según técnica y esfuerzo percibido; las cifras corporales no determinan los kilos que levantar.

Pruebas de esta versión: `tests/profile.test.cjs` recorre el asistente y verifica efectos reales, cambios de días, exclusiones, guardado parcial, conservación de datos, importación y errores de almacenamiento, además de 1.080 combinaciones de preferencias. Las pruebas del registro y de frecuencia siguen vigentes. Son pruebas de lógica e interacción DOM; no sustituyen la revisión en un iPhone real.

Para actualizar GitHub Pages, extrae `mi-gym-github.zip` y reemplaza los archivos del mismo repositorio y carpeta donde está publicada la app. El ZIP contiene los archivos públicos en la raíz, sin una carpeta `dist` adicional. Mantén la misma URL para conservar el acceso al almacenamiento local de esa instalación. Después cierra y vuelve a abrir la app para activar los recursos sin conexión de esta versión.

## Esfuerzo y próxima sesión

La versión 6 conecta el entrenamiento realizado con objetivos revisables para la siguiente sesión. Funciona en el dispositivo, sin llamadas a IA ni costes por consulta.

- **Anotar el esfuerzo:** después de completar una serie aparece «¿Cuántas repeticiones te quedaban?». Puedes elegir ninguna, una, dos o tres o más, manteniendo la misma técnica. Es opcional y puedes dejar «No lo sé / Sin indicar». El selector corresponde a la última serie completada por posición; las anotaciones de las anteriores se conservan. Editar o desmarcar una serie elimina su esfuerzo anterior para evitar reutilizar una estimación que ya no corresponde.
- **Copiar última serie:** copia peso y repeticiones a la primera serie pendiente cuando sus repeticiones están vacías y su carga está vacía o coincide. No pisa datos distintos, no marca la serie como hecha ni inicia otro descanso.
- **Preparar próxima sesión con mi historial:** disponible en Entrenar y en las opciones de inicio. Muestra una explicación y la referencia utilizada por ejercicio. Puedes editar la carga, las repeticiones de cada serie o desmarcar los objetivos que no quieras usar. Cancelar no cambia los registros. Aceptar abre una sesión nueva con las cargas aceptadas y las repeticiones realizadas en blanco; nunca registra trabajo automáticamente.
- **Historial:** conserva el margen anotado y los objetivos aceptados junto con las series reales. Las copias JSON incluyen estos datos y los saltos de peso que hayas indicado.

`progression-engine.js` utiliza reglas explícitas de la app. Para una referencia comparable exige el mismo ejercicio, series, rango y carga uniforme, con la última sesión dentro de 21 días. Si faltan datos, hay cargas mezcladas, una sustitución, una sesión parcial o una variante personalizada, pide revisar la referencia y no rellena una carga. Tampoco utiliza un registro antiguo favorable para saltarse uno más reciente incompleto. Compara siempre la misma máquina, configuración y técnica; esos cambios no pueden deducirse de los kilos.

Con una referencia comparable, si falta el esfuerzo de la última serie o alguna serie tiene menos de dos repeticiones en reserva, mantiene la referencia. Si hay margen y aún quedan repeticiones dentro del rango, propone una repetición adicional en una sola serie. Para proponer más peso requiere dos sesiones consecutivas comparables en días distintos, ambas al máximo del rango y con margen; la anterior debe estar dentro de 42 días. Después pide el menor salto disponible. Solo propone aumentos de hasta el 10 % y vuelve al inicio del rango. Con cero carga externa pide revisar la progresión de dificultad. El salto se expresa por mancuerna o como aumento total en una barra, siguiendo la unidad usada al registrar el ejercicio.

Los plazos, el número de sesiones y el límite del 10 % son decisiones conservadoras del producto; no son una prescripción clínica ni una recomendación individual validada. El usuario revisa siempre la propuesta. La app no decide cargas a partir del peso corporal, altura o edad.

La clave de datos sigue siendo `mi-gym-v1`: las instalaciones y copias anteriores no necesitan esfuerzo anotado para abrirse. El guardado conserva la sesión en curso y revierte el cambio si falla el almacenamiento. La caché de recursos actual es `mi-gym-shell-v8-supabase`.

Pruebas: `tests/progression.test.cjs` verifica las decisiones a partir del historial, límites y casos incompletos, revisión/cancelación/edición, saltos de carga, copia de series, esfuerzo y su invalidación, importación, errores de almacenamiento y conservación de sesiones y sustituciones. También se ejecutan las pruebas existentes de registro, frecuencia y perfil. Se comprueban lógica e interacción DOM; queda pendiente una revisión visual en un iPhone real.


## Cuentas y sincronización (versión 7)

En **Cuenta** o **Perfil > Iniciar sesión**, la integración ofrece registro, acceso, recuperación de contraseña y cierre de sesión. El registro requiere confirmar el correo. En una cuenta nueva puedes pasar explícitamente los datos de este dispositivo o empezar de cero: nunca se suben automáticamente datos de invitado a otra cuenta.

El guardado conserva primero una copia local y después sincroniza. Antes de cambiar de teléfono, comprueba **Guardado en la nube**. La primera descarga requiere conexión. Si dos dispositivos modifican una misma versión, se pide elegir cuál conservar; no se fusionan automáticamente. Se conserva una copia de recuperación local y se pueden descargar ambas versiones. Esos archivos contienen objetos `local` y `cloud`; para importar uno se debe extraer el objeto elegido a un JSON normal de Mi Gym.

Cerrar sesión con cambios pendientes los conserva en la caché de esa cuenta, hasta volver a entrar con ella en el mismo navegador. Cerrar sesión con datos sincronizados retira su caché principal. Las copias de recuperación y los archivos exportados no se eliminan automáticamente; tenlo en cuenta en dispositivos compartidos. Borrar los entrenamientos dentro de una cuenta también sincroniza el borrado: no elimina la cuenta de acceso.

La base de datos guarda un documento privado por usuario, limitado a 4 MiB, con revisión para detectar conflictos. RLS limita las lecturas a su propietario; las escrituras pasan por una función que obtiene el usuario de la sesión y comprueba la revisión. No se aceptan contraseñas ni claves administrativas en el frontend. Esta primera versión no incluye competiciones, suscripciones ni eliminación de la cuenta desde la interfaz.

### Activar el proyecto (administrador)

1. Crear o elegir un proyecto Supabase en la organización del propietario, revisando antes el coste.
2. Aplicar una vez `supabase/migrations/20260929170214_gym_accounts.sql` mediante las migraciones de Supabase. En el ZIP está en `setup/`.
3. Rellenar `cloud-config.js` con la URL HTTPS del proyecto y su clave **publicable** `sb_publishable_…`. Nunca usar `service_role`, una clave secreta ni la contraseña de la base de datos.
4. En Authentication, configurar Site URL y las Redirect URLs exactas de los alojamientos usados, incluida la subcarpeta de GitHub Pages cuando corresponda. Mantener la confirmación de correo activada.
5. Configurar un proveedor SMTP antes de probar altas de amigos y familiares: el servicio de correo de prueba de Supabase restringe destinatarios y envíos. No basta con publicar el botón de registro. No compartir contraseñas ni credenciales SMTP por chat.
6. Actualizar la versión de caché de `sw.js`, publicar los recursos y verificar registro/confirmación/recuperación y sincronización en dos dispositivos reales. Revisar los asesores de seguridad del proyecto.

En el proyecto actual ya están completados los pasos 1–3. Falta finalizar los pasos 4–6; tras verificarlos, cambiar `emailSetupPending` a `false` y actualizar la caché. Si se vacían URL y clave, la app vuelve a mostrar que la conexión está pendiente de activar. Esta configuración puede compartirse en un repositorio público porque solo contiene una clave publicable; las reglas de la base de datos son las que protegen los registros.

### Desarrollo y pruebas

`npm ci`, `npm run build:vendor` y `npm test`. La app es estática y los archivos de `dist` se pueden publicar directamente. Las versiones están fijadas en `package-lock.json`. El paquete Supabase y sus avisos de licencia se distribuyen en `vendor/`.

Además de las pruebas existentes, `tests/cloud.test.cjs` ejecuta la migración en PostgreSQL mediante PGlite y comprueba permisos, aislamiento de cuentas, revisión de escrituras, dos dispositivos, trabajo sin conexión, conflictos, respuestas perdidas, cambios durante una subida y errores de almacenamiento. Las pruebas DOM comprueban acceso, cambio a invitado y el estado sin configurar. No sustituyen una prueba de Auth y correo con el proyecto real ni una revisión visual en iPhone.


### Siguiente ajuste para esta instalación

En [Authentication > URL Configuration](https://supabase.com/dashboard/project/hsegquwjytlglabjnkjc/auth/url-configuration), establecer:

- **Site URL:** `https://mi-gym-hugo.hubusdom.chatgpt.site/`
- **Redirect URLs:** añadir `https://mi-gym-hugo.hubusdom.chatgpt.site/` y `https://mi-gym-hugo.hubusdom.chatgpt.site/index.html`.

Guardar los cambios. Para una versión en GitHub Pages, añadir también su dirección real con la subcarpeta correcta; no usar como sustituto la URL de otra app. La publicación de Sites conserva su acceso privado y todavía no es un enlace abierto para amigos.

El envío de correos por defecto permite probar con el correo del propietario de Supabase; amigos y familiares necesitan un proveedor SMTP configurado. Después de configurar las URLs, el propietario puede crear su cuenta desde la app, confirmar el correo y elegir si migra sus datos locales. La contraseña se introduce exclusivamente en la app. Verificar **Guardado en la nube** y después iniciar sesión en un segundo dispositivo con la misma cuenta.

El 29-09-2026, Supabase indicó coste de creación de este proyecto de 0 al mes. No se ha contratado un plan de pago ni un proveedor de correo. Este dato no garantiza costes futuros si se cambian el plan o los servicios.
