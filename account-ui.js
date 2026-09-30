'use strict';
window.GYM_ACCOUNT = (() => {
  const config=window.MI_GYM_CLOUD||{};
  let configured=false;
  try {const u=new URL(config.url);configured=u.protocol==='https:'&&u.hostname.endsWith('.supabase.co')&&u.pathname==='/'&&!u.username&&!u.password&&/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publishableKey);}catch{}
  let client=null,user=null,core=null,mode=configured?'checking':'guest',generation=0,debounce=null,formMode='login',busy=false,notice='',recovery=false;
  const labels={loading:'Cargando tu cuenta…',syncing:'Sincronizando…',synced:'Guardado en la nube',pending:'Cambios pendientes de subir',offline:'Sin conexión · copia local',expired:'Vuelve a iniciar sesión',conflict:'Hay cambios en dos dispositivos',missing:'Elige cómo empezar',corrupt:'No se pudieron validar tus datos',storage:'No se pudo guardar en este dispositivo', 'other-tab':'Se abrió otra copia de esta cuenta'};
  const statusText=()=>mode==='checking'?'Comprobando tu cuenta…':mode==='account'?(labels[core?.status]||'Cargando tu cuenta…'):'Solo en este dispositivo';
  function canWrite(){return mode==='guest'||mode==='account'&&core?.canWrite();}
  function paint(){
    document.querySelectorAll('[data-cloud-status]').forEach(n=>n.textContent=statusText());
    const header=document.querySelector('#account-label');if(header)header.textContent=user?'Mi cuenta':'Cuenta';
    if(document.querySelector('#modal')?.open&&document.querySelector('#modal').classList.contains('account-dialog')&&!busy)show();
  }
  function persist(data){if(!core?.persist(data))return false;clearTimeout(debounce);debounce=setTimeout(()=>core?.sync(),900);return true;}
  function replaceApp(data){
    state=normalizeState(data);loadError=false;isFirstVisit=false;profileWizard=null;pendingSession=null;editing=null;routineEditing=null;picker=null;imported=null;
    selected=state.active?.routineId||nextRoutine();close();render();
  }
  function guestData(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const data=JSON.parse(raw);return validState(data)?normalizeState(data):null;}catch{return null;}}
  function transportFor(id){
    async function request(path,options={}){
      const {data,error}=await client.auth.getSession();const session=data?.session;
      if(error||!session||session.user.id!==id)throw Object.assign(Error('Sign in required'),{code:'AUTH'});
      // Pin the token to this request. An account switch cannot send the old user's data as the new user.
      const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);
      try {
        const response=await fetch(config.url.replace(/\/$/,'')+'/rest/v1/'+path,{...options,cache:'no-store',signal:abort.signal,headers:{apikey:config.publishableKey,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'}});
        const body=await response.json();
        if(!response.ok)throw Object.assign(Error('Cloud request failed'),{code:response.status===401?'AUTH':body.code||'SERVER'});
        return body;
      }finally{clearTimeout(timeout);}
    }
    return {read:async()=>{const rows=await request('gym_states?select=data,revision,last_write_id,updated_at');if(!Array.isArray(rows)||rows.length>1)throw Error('Invalid account response');return rows[0]||null;},write:async p=>{const rows=await request('rpc/gym_save_state',{method:'POST',body:JSON.stringify({p_state:p.data,p_expected_revision:p.revision,p_write_id:p.id})});if(!Array.isArray(rows)||rows.length!==1)throw Error('Invalid save response');return rows[0];}};
  }
  async function sessionChanged(session,event='SIGNED_IN'){
    if(event==='INITIAL_SESSION'&&!session&&!user){mode='guest';render();paint();return;}
    if(event==='PASSWORD_RECOVERY'){recovery=true;formMode='password';}
    if(session?.user?.id===user?.id&&core){if(recovery)show();else if(core.status==='expired')await core.sync(true);return;}
    const ticket=++generation;core?.close();clearTimeout(debounce);core=null;user=session?.user||null;notice='';
    if(!user){mode='guest';recovery=false;formMode='login';const data=guestData();replaceApp(data||freshState());paint();return;}
    mode='account';replaceApp(freshState());paint();
    const current=new GYM_CLOUD_STORE.Store({userId:user.id,namespace:new URL(config.url).hostname,storage:localStorage,transport:transportFor(user.id),validate:validState,normalize:normalizeState,
      onState:data=>{if(ticket===generation)replaceApp(data);},
      onStatus:store=>{if(ticket!==generation)return;paint();if(store.status==='missing'||store.status==='conflict'||recovery)show();},
      canPull:()=>!profileWizard&&!document.querySelector('input[data-field]:invalid')&&!document.activeElement?.matches?.('input,textarea,select')&&(!document.querySelector('#modal')?.open||document.querySelector('#modal').classList.contains('account-dialog'))
    });
    core=current;await current.open();if(ticket!==generation)return;
    paint();if(recovery||!current.envelope)show();
  }
  function authMessage(error){
    if(error?.code==='invalid_credentials')return 'El correo o la contraseña no son correctos.';
    if(error?.code==='email_not_confirmed')return 'Confirma tu correo antes de iniciar sesión.';
    if(error?.code==='over_email_send_rate_limit'||error?.status===429)return 'Se ha alcanzado el límite de intentos. Espera un poco y vuelve a probar.';
    if(error?.code==='weak_password')return 'Elige una contraseña más larga y difícil de adivinar.';
    if(error?.code==='email_address_not_authorized')return 'El envío de correos de esta prueba aún no está activado. Contacta con el responsable de Mi Gym.';
    return 'No se pudo completar la operación. Comprueba la conexión e inténtalo de nuevo.';
  }
  function summary(data){return `${data?.history?.length||0} entrenamientos · ${data?.routines?.length||0} días de rutina${data?.active?' · sesión en curso':''}`;}
  function authForm(){
    const reset=formMode==='reset',signup=formMode==='signup',password=formMode==='password';
    const title=password?'Nueva contraseña':reset?'Recuperar contraseña':signup?'Crea tu cuenta':'Inicia sesión';
    return `<h2>${title}</h2><p class="note">${password?'Elige una contraseña para seguir usando tu cuenta.':reset?'Te enviaremos un enlace para cambiarla.':'Usa la misma cuenta en tus dispositivos para recuperar tu rutina y tus entrenamientos.'}</p>${config.emailSetupPending?'<p class="note">Prueba inicial: falta completar la configuración de los correos de acceso. El registro y la recuperación pueden no estar disponibles todavía.</p>':''}<form id="account-auth-form" novalidate>${password?'':`<label for="account-email">Correo electrónico</label><input id="account-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required value="${esc(user?.email||'')}">`}${reset?'':`<label for="account-password">Contraseña${signup||password?' · mínimo 12 caracteres':''}</label><input id="account-password" name="password" type="password" autocomplete="${signup||password?'new-password':'current-password'}" required maxlength="128" ${signup||password?'minlength="12"':''}>`}${signup||password?'<label for="account-confirm">Repite la contraseña</label><input id="account-confirm" name="confirm" type="password" autocomplete="new-password" required maxlength="128">':''}<p id="account-message" class="account-message" role="status">${esc(notice)}</p><button class="btn lime full" type="submit" ${busy?'disabled':''}>${busy?'Un momento…':password?'Guardar contraseña':reset?'Enviar enlace':signup?'Crear cuenta':'Entrar'}</button></form>${password?'':`<div class="account-links"><button class="textbtn" data-action="account-form" data-form="${signup||reset?'login':'signup'}">${signup||reset?'Ya tengo una cuenta':'Crear una cuenta'}</button>${!reset?'<button class="textbtn" data-action="account-form" data-form="reset">Olvidé mi contraseña</button>':''}</div>`}`;
  }
  function accountContent(){
    if(!configured)return '<h2>Tu cuenta, en cualquier móvil</h2><p class="note">El acceso con cuenta está preparado, pero falta activar la conexión de esta versión. Tus datos actuales siguen guardándose en este dispositivo.</p><p class="note">Cuando esté activa, podrás iniciar sesión en otro teléfono y recuperar tu perfil, tus rutinas y tus entrenamientos.</p>';
    if(mode==='checking')return '<h2>Comprobando tu cuenta…</h2><p class="note">Espera antes de modificar tus entrenamientos.</p>';
    if(!user||recovery||formMode==='reauth')return authForm();
    const s=core?.status||'loading',guest=guestData();
    let body=`<p class="eyebrow">MI CUENTA</p><h2 class="account-email">${esc(user.email||'Tu cuenta')}</h2><div class="sync-summary"><strong data-cloud-status>${statusText()}</strong><p>${core?.envelope?summary(core.envelope.data):'Preparando tus datos privados.'}</p>${core?.envelope?.lastSynced?`<small>Última sincronización: ${new Date(core.envelope.lastSynced).toLocaleString('es-ES')}</small>`:''}</div>`;
    if(s==='missing')body+=`<h3>Esta cuenta todavía está vacía</h3><p class="note">${guest?'Hay datos sin cuenta en este dispositivo. Elige si son tuyos y quieres pasarlos a esta cuenta.':'Puedes crear tu perfil y empezar a registrar tus entrenamientos.'}</p>${guest?`<div class="account-local"><strong>Datos de este dispositivo</strong><p>${summary(guest)}</p><button class="btn lime full" data-action="account-migrate">Son míos · pasarlos a mi cuenta</button><p class="small muted">Quedarán asociados a ${esc(user.email)} y dejarán de estar disponibles sin iniciar sesión.</p></div>`:''}<button class="btn secondary full" data-action="account-empty">Empezar una cuenta vacía</button>`;
    else if(s==='conflict')body+=`<h3>Revisa las dos versiones</h3><p class="note">Este dispositivo y la nube tienen cambios. No se ha sustituido ninguna versión. Al elegir se conserva una copia de recuperación en este dispositivo.</p><div class="account-local"><strong>Este dispositivo</strong><p>${summary(core.envelope.data)}</p><button class="btn secondary full" data-action="account-resolve" data-choice="local">Usar esta versión y sustituir la nube</button></div><div class="account-local"><strong>La nube</strong><p>${core.remote?summary(core.remote.data):'La copia de la nube ya no existe.'}</p><button class="btn secondary full" data-action="account-resolve" data-choice="cloud" ${core.remote?'':'disabled'}>Usar la nube en este dispositivo</button></div>${core.error==='BACKUP_STORAGE'?'<p class="data-error">No hay espacio para conservar ambas copias. Descárgalas antes de liberar espacio en el dispositivo.</p>':''}<button class="textbtn" data-action="account-conflict-export">Descargar las dos versiones</button>`;
    else if(s==='other-tab')body+='<p class="note">Otra pestaña ha actualizado la copia local. Cierra las otras pestañas y recarga esta para continuar.</p><button class="btn secondary" data-action="account-reload">Recargar</button>';
    else if(s==='corrupt')body+='<p class="data-error">Los datos no tienen un formato válido. No se han sustituido por una cuenta vacía. Conserva tu copia y contacta con el responsable de la app.</p>';
    else body+=`<p class="note">${s==='synced'?'Ya puedes abrir Mi Gym en otro dispositivo e iniciar sesión con este correo.':core?.envelope?'Tu copia está en este dispositivo. Los cambios pendientes solo aparecerán en otro móvil después de sincronizar.':'Necesitas conexión para descargar esta cuenta por primera vez.'}</p><div class="actions"><button class="btn lime" data-action="account-sync" ${s==='syncing'?'disabled':''}>Sincronizar ahora</button>${core?.envelope?'<button class="btn secondary" data-action="export">Exportar copia</button>':''}</div>${s==='expired'?'<button class="btn secondary full" data-action="account-reauth">Volver a iniciar sesión</button>':''}`;
    let backup=false;try{backup=!!core&&!!localStorage.getItem(core.key+':recovery');}catch{}
    if(backup)body+='<button class="textbtn" data-action="account-recovery-export">Descargar copia de recuperación</button>';
    body+=`<p id="account-message" class="account-message" role="status">${esc(notice)}</p><p class="account-privacy">Perfil, rutinas, notas e historial privados de tu cuenta. Se mantiene una copia local para entrenar sin conexión.</p><button class="textbtn" data-action="account-signout">Cerrar sesión en este dispositivo</button>`;
    return body;
  }
  function show(){modal(`<div class="account-heading"><span class="pill">MI GYM</span><button class="textbtn" data-action="close" aria-label="Cerrar cuenta">Cerrar</button></div>${accountContent()}`);$('#modal').classList.add('account-dialog');$('#modal').setAttribute('aria-label','Tu cuenta de Mi Gym');}
  function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function initialize(useGuest){
    if(!core||core.status!=='missing'||busy)return;
    const data=useGuest?guestData():freshState();if(!data){notice='No se ha podido leer la copia local.';show();return;}
    busy=true;const current=core;const ok=await current.initialize(data);busy=false;
    if(current!==core)return;
    if(ok&&useGuest){try{localStorage.removeItem(KEY);}catch{notice='Tu cuenta conserva los datos. No se pudo retirar la antigua copia sin cuenta.';}}
    if(ok){close();go('entrenar');if(!data.profile&&!useGuest)beginProfile();}else show();paint();
  }
  async function signout(confirmed=false){
    if(busy)return;
    if(core?.envelope?.dirty&&!confirmed){modal('<h2>Hay cambios pendientes de subir</h2><p class="note">Si cierras sesión ahora, quedarán solo en este dispositivo hasta que vuelvas a entrar con esta misma cuenta y sincronices.</p><div class="actions"><button class="btn lime" data-action="account-show">Volver y sincronizar</button><button class="btn secondary" data-action="account-signout-confirmed">Cerrar sesión de todos modos</button></div>');return;}
    busy=true;const previous=core;
    try {const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;}
    catch(error){busy=false;notice=authMessage(error);show();return;}
    busy=false;
    if(previous?.envelope&&!previous.envelope.dirty&&!previous.envelope.pending){try{localStorage.removeItem(previous.key);}catch{}}
    await sessionChanged(null,'SIGNED_OUT');close();go('entrenar');toast('Sesión cerrada en este dispositivo.');
  }
  async function submitAuth(form){
    if(busy||!client)return;
    const f=new FormData(form),email=String(f.get('email')||'').trim(),password=String(f.get('password')||''),passwordMode=formMode==='password',signup=formMode==='signup',reset=formMode==='reset';
    const message=document.querySelector('#account-message');
    if(!passwordMode&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message.textContent='Introduce un correo válido.';return;}
    if(!reset&&(!password||password.length>128||(signup||passwordMode)&&password.length<12)){message.textContent='Usa una contraseña de 12 a 128 caracteres al crearla.';return;}
    if((signup||passwordMode)&&password!==f.get('confirm')){message.textContent='Las contraseñas no coinciden.';return;}
    busy=true;form.querySelector('button[type="submit"]').disabled=true;message.textContent='Un momento…';
    try {
      const redirectTo=location.origin+location.pathname;
      let result;
      if(passwordMode)result=await client.auth.updateUser({password});
      else if(reset)result=await client.auth.resetPasswordForEmail(email,{redirectTo});
      else if(signup)result=await client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});
      else result=await client.auth.signInWithPassword({email,password});
      if(result.error)throw result.error;
      notice=reset?'Si el correo corresponde a una cuenta, recibirás un enlace para recuperar el acceso.':signup&&!result.data.session?'Revisa tu correo para confirmar la cuenta y después inicia sesión.':'';
      if(passwordMode){recovery=false;formMode='login';notice='Contraseña actualizada.';}
      if(result.data?.session)formMode='login';
      busy=false;
      if(result.data?.session)await sessionChanged(result.data.session);
      show();
    }catch(error){busy=false;notice=authMessage(error);const node=document.querySelector('#account-message');if(node)node.textContent=notice;const btn=document.querySelector('#account-auth-form button[type="submit"]');if(btn)btn.disabled=false;}
    finally{form.querySelectorAll('input[type="password"]').forEach(i=>i.value='');}
  }
  async function init(){
    if(!configured){paint();return;}
    try {
      client=window.gymCreateSupabaseClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'mi-gym-auth:'+new URL(config.url).hostname}});
      client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>sessionChanged(session,event),0);});
      const {data,error}=await client.auth.getSession();if(error)throw error;await sessionChanged(data.session,'INITIAL_SESSION');
      window.addEventListener('online',()=>core?.sync());window.addEventListener('focus',()=>core?.sync());
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')core?.sync();});
      window.addEventListener('storage',ev=>{if(ev.key===core?.key)core.checkOtherTab();});
      setInterval(()=>{if(document.visibilityState!=='hidden')core?.sync();},30000);
    }catch {mode='guest';notice='No se pudo conectar el acceso a tu cuenta. Tus datos locales siguen disponibles.';paint();}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;const a=button.dataset.action;
    if(a==='account-show')show();
    if(a==='account-form'){formMode=button.dataset.form;notice='';show();}
    if(a==='account-sync')core?.sync(true);
    if(a==='account-migrate')initialize(true);
    if(a==='account-empty')initialize(false);
    if(a==='account-signout')signout();
    if(a==='account-signout-confirmed')signout(true);
    if(a==='account-reauth'){formMode='reauth';notice='';show();}
    if(a==='account-resolve')core?.resolve(button.dataset.choice);
    if(a==='account-reload')location.reload();
    if(a==='account-conflict-export'&&core?.envelope)download({local:core.envelope.data,cloud:core.remote?.data||null},'mi-gym-dos-versiones.json');
    if(a==='account-recovery-export'&&core){try{download(JSON.parse(localStorage.getItem(core.key+':recovery')),'mi-gym-recuperacion.json');}catch{toast('No se pudo leer la copia de recuperación.');}}
  });
  document.addEventListener('submit',event=>{if(event.target.id==='account-auth-form'){event.preventDefault();submitAuth(event.target);}});
  return {init,paint,persist,canWrite,show,get configured(){return configured;},get mode(){return mode;},get store(){return core;},
    privacy:()=>mode==='account'?'Datos privados de tu cuenta · se sincronizan al conectar':'Solo en este dispositivo · inicia sesión para sincronizar',
    notice:()=>mode!=='guest'&&!canWrite()?`<div class="cloud-notice" role="status"><span>${statusText()}. Abre tu cuenta para continuar.</span><button class="textbtn" data-action="account-show">Ver cuenta</button></div>`:'',
    card:()=>`<section class="account-card"><div><strong>${user?'Tu cuenta de Mi Gym':'Tu progreso, también en otro móvil'}</strong><p data-cloud-status>${statusText()}</p></div><button class="btn secondary" data-action="account-show">${user?'Ver cuenta':'Iniciar sesión'}</button></section>`};
})();
