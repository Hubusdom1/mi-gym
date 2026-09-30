'use strict';
// The server is authoritative. This per-account cache is an offline outbox.
// Every cloud write compares the server revision; conflicts require a decision.
window.GYM_CLOUD_STORE = (() => {
  const clone = x => JSON.parse(JSON.stringify(x));
  const canonical = x => JSON.stringify(sort(x));
  function sort(x) { return Array.isArray(x) ? x.map(sort) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sort(x[k])])) : x; }
  const same = (a,b) => canonical(a) === canonical(b);
  class Store {
    constructor({userId, namespace, storage, transport, validate, normalize, onState=()=>{}, onStatus=()=>{}, canPull=()=>true, uuid=()=>crypto.randomUUID()}) {
      Object.assign(this,{userId,storage,transport,validate,normalize,onState,onStatus,canPull,uuid});
      this.key=`mi-gym-cloud-v1:${namespace}:${userId}`;
      this.envelope=null;this.remote=null;this.status='loading';this.error=null;this.closed=false;this.running=null;
    }
    statusTo(status,error=null) { if(this.closed)return;this.status=status;this.error=error;this.onStatus(this); }
    canWrite() { return !this.closed && !!this.envelope && !['conflict','corrupt','other-tab','loading','missing'].includes(this.status); }
    validRemote(row) { return row===null || row && Number.isSafeInteger(row.revision) && row.revision>=1 && typeof row.last_write_id==='string' && typeof row.updated_at==='string' && this.validate(row.data); }
    validEnvelope(e) {
      return e && e.version===1 && e.userId===this.userId && Number.isSafeInteger(e.revision) && e.revision>=0 && typeof e.dirty==='boolean' && typeof e.stamp==='string' && this.validate(e.data) &&
        (!e.pending || typeof e.pending.id==='string' && Number.isSafeInteger(e.pending.revision) && this.validate(e.pending.data));
    }
    put(next) {
      if(this.closed)return false;
      try {
        const disk=this.storage.getItem(this.key);
        if(this.envelope && (!disk || JSON.parse(disk).stamp!==this.envelope.stamp)) {this.statusTo('other-tab');return false;}
        if(!this.envelope && disk) {this.statusTo('other-tab');return false;}
        const value={...next,stamp:this.uuid()};
        this.storage.setItem(this.key,JSON.stringify(value));this.envelope=value;return true;
      } catch {this.statusTo('storage');return false;}
    }
    empty(data) {return {version:1,userId:this.userId,revision:0,dirty:true,data:clone(data),pending:null,lastSynced:null,updatedAt:null};}
    acceptRemote(row) {
      const next={version:1,userId:this.userId,revision:row.revision,dirty:false,data:this.normalize(row.data),pending:null,lastSynced:Date.now(),updatedAt:row.updated_at};
      if(!this.put(next))return false;
      this.remote=null;this.onState(clone(next.data));this.statusTo('synced');return true;
    }
    async open() {
      try {
        const raw=this.storage.getItem(this.key);
        if(raw) {const e=JSON.parse(raw);if(!this.validEnvelope(e))throw Error('Invalid cache');this.envelope=e;this.onState(clone(e.data));}
      } catch {this.statusTo('corrupt');return false;}
      return this.sync(true);
    }
    async initialize(data) {
      if(this.status!=='missing' || this.envelope || !this.validate(data))return false;
      if(!this.put(this.empty(this.normalize(data))))return false;
      this.onState(clone(this.envelope.data));this.statusTo('pending');await this.sync(true);return !!this.envelope;
    }
    persist(data) {
      if(!this.canWrite() || !this.validate(data))return false;
      if(same(this.envelope.data,data))return true;
      if(!this.put({...this.envelope,data:clone(data),dirty:true}))return false;
      this.statusTo('pending');return true;
    }
    async sync(force=false) {
      if(this.closed || ['corrupt','other-tab','conflict'].includes(this.status))return false;
      if(this.running)return this.running;
      if(!force && this.envelope && !this.envelope.dirty && !this.canPull())return false;
      this.running=this.performSync();
      try {return await this.running;} finally {this.running=null;}
    }
    async performSync() {
      this.statusTo('syncing');
      try {
        let row=await this.transport.read();if(this.closed)return false;
        if(!this.validRemote(row)){this.statusTo('corrupt');return false;}
        if(!this.envelope) {
          if(row)return this.acceptRemote(row);
          this.statusTo('missing');return false;
        }
        // Recover a response lost after the server committed a previous write.
        if(this.envelope.pending && row?.last_write_id===this.envelope.pending.id) {
          const pending=this.envelope.pending;
          if(!this.put({...this.envelope,revision:row.revision,updatedAt:row.updated_at,pending:null,dirty:!same(this.envelope.data,pending.data),lastSynced:Date.now()}))return false;
        }
        if((row?.revision??0)!==this.envelope.revision) {
          if(!this.envelope.dirty && row)return this.acceptRemote(row);
          this.remote=row;this.statusTo('conflict');return false;
        }
        if(!this.envelope.dirty) {this.statusTo('synced');return true;}
        // Serialize writes; edits arriving during a request remain pending for the next pass.
        for(let attempt=0;attempt<3 && this.envelope.dirty;attempt++) {
          let pending=this.envelope.pending;
          if(!pending) {
            pending={id:this.uuid(),revision:this.envelope.revision,data:clone(this.envelope.data)};
            if(!this.put({...this.envelope,pending}))return false;
          }
          let saved;
          try {saved=await this.transport.write(pending);} catch(error) {
            if(error.code==='40001') {
              row=await this.transport.read();if(this.closed)return false;
              if(!this.validRemote(row)){this.statusTo('corrupt');return false;}
              this.remote=row;this.statusTo('conflict');return false;
            }
            throw error;
          }
          if(this.closed)return false;
          if(!this.validRemote(saved) || !saved || saved.last_write_id!==pending.id)throw Error('Invalid write acknowledgment');
          if(!this.put({...this.envelope,revision:saved.revision,updatedAt:saved.updated_at,pending:null,dirty:!same(this.envelope.data,pending.data),lastSynced:Date.now()}))return false;
        }
        this.statusTo(this.envelope.dirty?'pending':'synced');return !this.envelope.dirty;
      } catch(error) {this.statusTo(error.code==='AUTH'?'expired':'offline',error.code||'NETWORK');return false;}
    }
    async resolve(choice) {
      if(this.status!=='conflict' || !['local','cloud'].includes(choice) || choice==='cloud'&&!this.remote)return false;
      // Keep the displaced snapshot on this device before choosing either version.
      try {this.storage.setItem(this.key+':recovery',JSON.stringify({version:1,savedAt:Date.now(),userId:this.userId,local:clone(this.envelope.data),cloud:this.remote?clone(this.remote.data):null}));}
      catch {this.statusTo('conflict','BACKUP_STORAGE');return false;}
      if(choice==='cloud')return this.acceptRemote(this.remote);
      if(!this.put({...this.envelope,revision:this.remote?.revision??0,pending:null,dirty:true}))return false;
      this.remote=null;this.statusTo('pending');return this.sync(true);
    }
    checkOtherTab() {
      if(this.closed || !this.envelope)return;
      try {const raw=this.storage.getItem(this.key);if(!raw || JSON.parse(raw).stamp!==this.envelope.stamp)this.statusTo('other-tab');}
      catch {this.statusTo('storage');}
    }
    close() {this.closed=true;}
  }
  return {Store,same};
})();

