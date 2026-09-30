# Correos de Mi Gym con código

Estado: interfaz y plantillas preparadas. **Todavía no están activados el SMTP corporativo ni estas plantillas en el proyecto.** El correo actual con enlace se mantiene hasta completar la configuración. No se ha enviado ningún correo de prueba real en esta entrega.

El proyecto es `hsegquwjytlglabjnkjc`. No hace falta crear otra base de datos ni volver a registrar las cuentas existentes.

## 1. Elegir y verificar el dominio

Necesitamos un dominio del propietario para Mi Gym y acceso a sus DNS. El remitente tendrá nombre **Mi Gym** y una dirección del dominio verificado, por ejemplo `cuenta@DOMINIO-DE-LA-APP` (ejemplo, no una dirección ya configurada).

Puede usarse Resend u otro proveedor SMTP. Para Resend: crear la cuenta, añadir el dominio y copiar en sus DNS los registros concretos que entregue el proveedor. Esperar a que aparezca verificado. No inventar registros SPF/DKIM ni sustituir los de otros servicios. Revisar DMARC con los servicios de correo que use ese dominio.

## 2. Conectar el remitente

En Supabase, abrir **Authentication > Email > SMTP Settings** y configurar SMTP propio. Para Resend:

| Campo | Valor |
| --- | --- |
| Sender name | Mi Gym |
| Sender email | La dirección elegida del dominio verificado |
| Host | smtp.resend.com |
| Port | 465 |
| Username | resend |
| Password | Una API key de Resend con permiso de envío para ese dominio |

Introducir la clave exclusivamente en el campo seguro del panel. Nunca ponerla en `cloud-config.js`, GitHub ni mensajes del chat. Mantener activada la confirmación del correo. No se necesita contratar un buzón únicamente para enviar con SMTP; si se quiere recibir respuestas en esa dirección, hay que preparar también su recepción.

## 3. Activar las dos plantillas

En **Authentication > Email > Templates**, sustituir el cuerpo completo de cada plantilla con el HTML correspondiente de esta carpeta:

| Plantilla de Supabase | Asunto | Archivo |
| --- | --- | --- |
| Confirm signup | Confirma tu correo · Mi Gym | confirm-signup.html |
| Reset password | Recupera tu acceso · Mi Gym | reset-password.html |

Ambas usan `{{ .Token }}`. No añadir `{{ .ConfirmationURL }}`: el código se introduce en Mi Gym sin abrir otra página. La caducidad y longitud las aplica Supabase; comprobarlas en las opciones del proveedor Email. La app acepta de 6 a 10 dígitos y conserva ceros iniciales. El reenvío espera al menos 60 segundos y sigue sujeto a los límites del servidor.

En proyectos Free creados a partir del 3-06-2026, Supabase exige SMTP propio para editar estas plantillas; el proyecto de Mi Gym se creó después. Un cambio de HTML en este repositorio no cambia las plantillas remotas por sí solo.

## 4. Activar el flujo en la app y comprobarlo

Solo cuando estén guardados SMTP y ambas plantillas, poner `emailCodeEnabled: true` y `emailSetupPending: false` en `dist/cloud-config.js` (en GitHub Pages, `cloud-config.js` en la raíz), incrementar la versión de `CACHE` en `sw.js` y publicar. No añadir ninguna clave de envío a ese archivo: solo contiene la conexión pública de Supabase.

Crear una cuenta de prueba desde Mi Gym con una dirección autorizada por su propietario, comprobar nombre/dirección del remitente, recibir el código, introducirlo y confirmar que se abre la cuenta correcta. Comprobar también recuperación de contraseña, rechazo de un código incorrecto o ya utilizado y reenvío del correo más reciente. La verificación real se hace en Supabase, no con códigos fijos de ejemplo.

La app recuerda temporalmente en la pestaña el correo, el propósito y el instante del último envío para continuar al recargar. No guarda el código ni la contraseña en ese estado, ni los incluye en las copias de entrenamientos. Un fallo o caducidad no confirma la cuenta.

## Acceso a la app y ChatGPT

La URL `https://mi-gym-hugo.hubusdom.chatgpt.site` mantiene su acceso privado del alojamiento. El código evita navegar desde el correo a esa URL, pero no elimina el acceso de ChatGPT si alguien abre directamente la versión privada. Para usarla con personas ajenas a ChatGPT, utilizar la instalación pública en GitHub Pages o un alojamiento/dominio público aprobado por el propietario, conservando el mismo proyecto Supabase. No es necesario hacer públicos los datos de las cuentas.

Las URLs permitidas de Supabase deben incluir la dirección real de la instalación para los enlaces anteriores que sigan pendientes. No usar como sustituto la URL de otra app ni cambiar el público del alojamiento sin autorización.

## Referencias comprobadas el 30-09-2026

- https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://resend.com/docs/send-with-supabase-smtp
