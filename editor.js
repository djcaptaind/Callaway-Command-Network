(() => {
  const D = window.CCN_STREAMING_DEFAULTS;
  const clone = o => JSON.parse(JSON.stringify(o));
  const merge = (base, extra) => {
    if (!extra || typeof extra !== 'object') return base;
    const out = Array.isArray(base) ? [...base] : {...base};
    Object.keys(extra).forEach(k => {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base?.[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) out[k] = merge(base[k], extra[k]);
      else out[k] = extra[k];
    });
    return out;
  };
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('ccnStreamingContent') || localStorage.getItem('ccnContent') || 'null'); } catch { saved = null; }
  let data = merge(clone(D), saved || {});

  // Migrate older spotlight formats into the v13 gallery.
  if (!Array.isArray(saved?.spotlights)) {
    const migrated = [];
    const month = saved?.spotlightMonth || saved?.spotlight;
    const week = saved?.spotlightWeek;
    if (month?.name) migrated.push({
      type: saved?.titles?.spotlightMonthLabel || saved?.titles?.spotlightLabel || 'Cadet of the Month',
      enabled: saved?.display?.spotlightMonth ?? saved?.display?.spotlight ?? true,
      name: month.name || '', detail: month.detail || '', quote: month.quote || '', badges: month.badges || [],
      showPhoto: month.showPhoto !== false, portrait: month.portrait || D.spotlights[0].portrait
    });
    if (week?.name) migrated.push({
      type: saved?.titles?.spotlightWeekLabel || 'Cadet of the Week',
      enabled: saved?.display?.spotlightWeek ?? true,
      name: week.name || '', detail: week.detail || '', quote: week.quote || '', badges: week.badges || [],
      showPhoto: week.showPhoto !== false, portrait: week.portrait || D.spotlights[0].portrait
    });
    if (migrated.length) data.spotlights = migrated;
    if (saved?.display?.spotlight !== undefined || saved?.display?.spotlightMonth !== undefined || saved?.display?.spotlightWeek !== undefined) data.display.spotlights = true;
  }
  if (!Array.isArray(data.spotlights)) data.spotlights = clone(D.spotlights);

  const form=document.getElementById('editorForm');
  const status=document.getElementById('status');
  const termsWrap=document.getElementById('terms');
  const questionsWrap=document.getElementById('questions');
  const updatesWrap=document.getElementById('updates');
  const spotlightsWrap=document.getElementById('spotlights');
  const get=(obj,path)=>path.split('.').reduce((x,k)=>x?.[k],obj);
  const setPath=(obj,path,value)=>{const keys=path.split('.');const last=keys.pop();const target=keys.reduce((x,k)=>x[k]??={},obj);target[last]=value};
  const escapeHtml=s=>String(s).replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
  const escapeAttr=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

  form.querySelectorAll('[name]').forEach(el=>{
    const v=get(data,el.name);
    if(v===undefined) return;
    if(el.type==='checkbox') el.checked=Boolean(v);
    else el.value=el.type==='datetime-local'?String(v).slice(0,16):Array.isArray(v)?v.join(', '):v;
  });

  const repeatCard=(title,innerHtml,removeText='Remove')=>{const wrap=document.createElement('div');wrap.className='repeat';wrap.innerHTML=`<div class="repeat-toolbar"><strong>${title}</strong><button type="button" class="remove-btn">${removeText}</button></div><div class="repeat-body">${innerHtml}</div>`;return wrap};

  function renderTerms(){termsWrap.innerHTML='';if(!Array.isArray(data.keyTerms)||!data.keyTerms.length)data.keyTerms=[{word:'',definition:''}];data.keyTerms.forEach((term,i)=>{const card=repeatCard(`Term ${i+1}`,`<label>Word<input data-term-word value="${escapeAttr(term.word||'')}"></label><label>Definition<textarea data-term-definition>${escapeHtml(term.definition||'')}</textarea></label>`);card.querySelector('.remove-btn').addEventListener('click',()=>{data.keyTerms.splice(i,1);renderTerms()});termsWrap.appendChild(card)})}
  function renderQuestions(){questionsWrap.innerHTML='';if(!Array.isArray(data.exitQuestions)||!data.exitQuestions.length)data.exitQuestions=[''];data.exitQuestions.forEach((q,i)=>{const card=repeatCard(`Exit Question ${i+1}`,`<label>Question<textarea data-exit-question>${escapeHtml(q||'')}</textarea></label>`);card.querySelector('.remove-btn').addEventListener('click',()=>{data.exitQuestions.splice(i,1);renderQuestions()});questionsWrap.appendChild(card)})}
  function renderUpdates(){updatesWrap.innerHTML='';if(!Array.isArray(data.announcements)||!data.announcements.length)data.announcements=[{headline:'',detail:'',status:''}];data.announcements.forEach((u,i)=>{const card=repeatCard(`Announcement ${i+1}`,`<label>Headline<input data-update-headline value="${escapeAttr(u.headline||'')}"></label><label>Details<textarea data-update-detail>${escapeHtml(u.detail||'')}</textarea></label><label>Badge / Label<input data-update-status value="${escapeAttr(u.status||'')}"></label>`);card.querySelector('.remove-btn').addEventListener('click',()=>{data.announcements.splice(i,1);renderUpdates()});updatesWrap.appendChild(card)})}

  const resizeImage=(file,maxW,maxH,quality=.82)=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,r=Math.min(maxW/w,maxH/h,1);w=Math.round(w*r);h=Math.round(h*r);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',quality));URL.revokeObjectURL(img.src)};img.onerror=reject;img.src=URL.createObjectURL(file)});

  let eventPhotoData = null;
  const eventPhotoStatus = document.getElementById('eventPhotoStatus');
  const eventPhotoUpload = document.getElementById('eventPhotoUpload');
  if (eventPhotoUpload) {
    const existingCustomEventPhoto = data.operation?.photo && String(data.operation.photo).startsWith('data:');
    if (existingCustomEventPhoto && eventPhotoStatus) eventPhotoStatus.textContent = 'Custom event photo is currently saved. Upload a new photo to replace it, or uncheck “Show event photo on TV” to hide it without deleting it.';
    eventPhotoUpload.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      eventPhotoData = await resizeImage(file,1280,800,.80);
      if (eventPhotoStatus) eventPhotoStatus.textContent = 'New event photo ready. Save CCN Display to apply it.';
      status.textContent = 'Upcoming Event photo ready to save.';
    });
  }

  function renderSpotlights(){
    spotlightsWrap.innerHTML='';
    if(!data.spotlights.length) spotlightsWrap.innerHTML='<div class="empty-gallery">No spotlights yet. Click <strong>+ Add Spotlight</strong>.</div>';
    data.spotlights.forEach((s,i)=>{
      const card=document.createElement('div');
      card.className='spotlight-editor-card';
      const photoNote = s.portrait && s.portrait.startsWith('data:') ? 'Custom photo saved' : 'Default photo';
      card.innerHTML=`
        <div class="spotlight-card-head"><div><span class="spotlight-index">SPOTLIGHT ${i+1}</span><strong>${escapeHtml(s.name || 'New Cadet')}</strong></div><div class="spotlight-card-actions"><button type="button" class="duplicate-btn">Duplicate</button><button type="button" class="remove-btn">Remove</button></div></div>
        <div class="row">
          <label>Spotlight type<select data-spot-type><option ${s.type==='Cadet of the Month'?'selected':''}>Cadet of the Month</option><option ${s.type==='Cadet of the Week'?'selected':''}>Cadet of the Week</option><option ${s.type==='Cadet of the Year'?'selected':''}>Cadet of the Year</option></select></label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-spot-enabled ${s.enabled!==false?'checked':''}> Show this spotlight</label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-spot-photo ${s.showPhoto!==false?'checked':''}> Show its photo</label>
        </div>
        <label>Cadet name<input data-spot-name value="${escapeAttr(s.name||'')}"></label>
        <label>Cadet details<input data-spot-detail value="${escapeAttr(s.detail||'')}"></label>
        <label>Quote<textarea data-spot-quote>${escapeHtml(s.quote||'')}</textarea></label>
        <label>Recognition badges (comma separated)<input data-spot-badges value="${escapeAttr((s.badges||[]).join(', '))}"></label>
        <label class="upload">Spotlight photo<input type="file" data-spot-upload accept="image/*"><small data-photo-status>${photoNote}. Uploading a new photo replaces this spotlight’s stored photo only.</small></label>`;
      card.querySelector('.remove-btn').addEventListener('click',()=>{data.spotlights.splice(i,1);renderSpotlights();status.textContent='Spotlight removed. Save to apply.'});
      card.querySelector('.duplicate-btn').addEventListener('click',()=>{const copy=clone(s);copy.name=copy.name?`${copy.name} Copy`:'';data.spotlights.splice(i+1,0,copy);renderSpotlights();status.textContent='Spotlight duplicated.'});
      card.querySelector('[data-spot-upload]').addEventListener('change',async e=>{const file=e.target.files[0];if(file){s.portrait=await resizeImage(file,720,960);card.querySelector('[data-photo-status]').textContent='Custom photo ready. Save CCN Display to apply.';status.textContent=`Photo ready for Spotlight ${i+1}.`}});
      spotlightsWrap.appendChild(card);
    });
  }

  document.getElementById('addTerm').addEventListener('click',()=>{data.keyTerms.push({word:'',definition:''});renderTerms();status.textContent='New term added.'});
  document.getElementById('addQuestion').addEventListener('click',()=>{data.exitQuestions.push('');renderQuestions();status.textContent='New exit question added.'});
  document.getElementById('addUpdate').addEventListener('click',()=>{data.announcements.push({headline:'',detail:'',status:''});renderUpdates();status.textContent='New announcement added.'});
  document.getElementById('addSpotlight').addEventListener('click',()=>{data.spotlights.push({type:'Cadet of the Year',enabled:true,name:'',detail:'',quote:'',badges:[],showPhoto:true,portrait:D.spotlights[0].portrait});renderSpotlights();status.textContent='New spotlight added.'});

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const result=merge(clone(D),data);
    form.querySelectorAll('[name]').forEach(el=>{
      let value=el.type==='checkbox'?el.checked:el.value;
      if(el.type==='number') value=Number(value);
      setPath(result,el.name,value);
    });
    result.keyTerms=Array.from(termsWrap.querySelectorAll('.repeat')).map(card=>({word:card.querySelector('[data-term-word]')?.value.trim()||'',definition:card.querySelector('[data-term-definition]')?.value.trim()||''})).filter(x=>x.word||x.definition);
    result.exitQuestions=Array.from(questionsWrap.querySelectorAll('.repeat')).map(card=>card.querySelector('[data-exit-question]')?.value.trim()||'').filter(Boolean);
    result.announcements=Array.from(updatesWrap.querySelectorAll('.repeat')).map(card=>({headline:card.querySelector('[data-update-headline]')?.value.trim()||'',detail:card.querySelector('[data-update-detail]')?.value.trim()||'',status:card.querySelector('[data-update-status]')?.value.trim()||''})).filter(x=>x.headline||x.detail||x.status);
    result.spotlights=Array.from(spotlightsWrap.querySelectorAll('.spotlight-editor-card')).map((card,i)=>({
      type:card.querySelector('[data-spot-type]')?.value||'Cadet of the Year',
      enabled:Boolean(card.querySelector('[data-spot-enabled]')?.checked),
      name:card.querySelector('[data-spot-name]')?.value.trim()||'',
      detail:card.querySelector('[data-spot-detail]')?.value.trim()||'',
      quote:card.querySelector('[data-spot-quote]')?.value.trim()||'',
      badges:(card.querySelector('[data-spot-badges]')?.value||'').split(',').map(x=>x.trim()).filter(Boolean),
      showPhoto:Boolean(card.querySelector('[data-spot-photo]')?.checked),
      portrait:data.spotlights[i]?.portrait||D.spotlights[0].portrait
    }));
    if (eventPhotoData) result.operation.photo = eventPhotoData;
    try{
      localStorage.setItem('ccnStreamingContent',JSON.stringify(result));
      data=result;
      status.textContent='Saved. Refresh the TV home screen.';
    }catch(err){
      status.textContent='Could not save. Too many or very large photos may exceed browser storage. Remove a photo or use smaller images.';
    }
  });

  document.getElementById('reset').addEventListener('click',()=>{if(confirm('Reset all saved CCN content?')){localStorage.removeItem('ccnStreamingContent');location.reload()}});
  renderTerms();renderQuestions();renderUpdates();renderSpotlights();
})();
