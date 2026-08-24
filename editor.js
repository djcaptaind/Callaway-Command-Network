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
  if (!Array.isArray(data.customSections)) data.customSections = clone(D.customSections || []);
  if (!data.galleries || typeof data.galleries !== 'object') data.galleries = clone(D.galleries || {});
  Object.keys(D.galleries || {}).forEach(key=>{
    if(!data.galleries[key]) data.galleries[key]=clone(D.galleries[key]);
    if(!Array.isArray(data.galleries[key].media)){
      const oldPhotos=Array.isArray(data.galleries[key].photos)?data.galleries[key].photos:[];
      data.galleries[key].media=oldPhotos.map(src=>({type:'image',src}));
      delete data.galleries[key].photos;
    }
    data.galleries[key].coverIndex=Math.max(0,Math.min(Number(data.galleries[key].coverIndex||0),Math.max(0,data.galleries[key].media.length-1)));
    data.galleries[key].seconds=Math.max(2,Math.min(20,Number(data.galleries[key].seconds||5)));
  });

  const form=document.getElementById('editorForm');
  const status=document.getElementById('status');
  const termsWrap=document.getElementById('terms');
  const questionsWrap=document.getElementById('questions');
  const updatesWrap=document.getElementById('updates');
  const spotlightsWrap=document.getElementById('spotlights');
  const customSectionsWrap=document.getElementById('customSections');
  const universalGalleriesWrap=document.getElementById('universalGalleries');
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

  const recognitionTypes = [
    "Cadet of the Week",
    "Cadet of the Month",
    "Cadet of the Year",
    "Congratulations",
    "Staff Recognition",
    "Special Recognition",
    "Team Recognition",
    "Academic Achievement",
    "Promotion",
    "Competition Achievement",
    "College / Scholarship Acceptance",
    "Community Service",
    "Birthday / Shout-Out",
    "Alumni Spotlight",
    "Custom"
  ];

  function recognitionLabel(s){
    return s.type==="Custom" ? (s.customType||"Custom Recognition") : (s.type||"Special Recognition");
  }

  function renderSpotlights(){
    spotlightsWrap.innerHTML='';
    if(!data.spotlights.length) spotlightsWrap.innerHTML='<div class="empty-gallery">No recognition items yet. Click <strong>+ Add Recognition</strong>.</div>';
    data.spotlights.forEach((s,i)=>{
      if(!Array.isArray(s.media)) s.media=[];
      if(s.coverIndex===undefined) s.coverIndex=0;
      if(!s.mediaSeconds) s.mediaSeconds=5;
      if(s.showParents===undefined) s.showParents=true;
      const card=document.createElement('div');
      card.className='spotlight-editor-card recognition-editor-card';
      const photoNote = s.portrait && s.portrait.startsWith('data:') ? 'Custom portrait saved' : 'Default portrait';
      const typeOptions=recognitionTypes.map(t=>`<option ${s.type===t?'selected':''}>${t}</option>`).join('');
      const mediaCount=s.media.length;
      card.innerHTML=`
        <div class="spotlight-card-head">
          <div><span class="spotlight-index">RECOGNITION ${i+1}</span><strong>${escapeHtml(s.headline || s.name || recognitionLabel(s))}</strong></div>
          <div class="spotlight-card-actions">
            <button type="button" class="duplicate-btn">Duplicate</button>
            <button type="button" class="remove-btn">Remove</button>
          </div>
        </div>

        <div class="row">
          <label>Recognition type<select data-spot-type>${typeOptions}</select></label>
          <label data-custom-type-wrap style="${s.type==='Custom'?'':'display:none'}">Custom recognition type<input data-spot-customtype value="${escapeAttr(s.customType||'')}" placeholder="e.g. Congratulations to Staff"></label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-spot-enabled ${s.enabled!==false?'checked':''}> Show this recognition</label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-spot-parents ${s.showParents!==false?'checked':''}> Show on Parent View</label>
        </div>

        <label>Headline / title<input data-spot-headline value="${escapeAttr(s.headline||'')}" placeholder="Optional — e.g. Congratulations to Our JROTC Staff"></label>
        <label>Name / group<input data-spot-name value="${escapeAttr(s.name||'')}" placeholder="Cadet, staff member, team, or group"></label>
        <label>Details<input data-spot-detail value="${escapeAttr(s.detail||'')}"></label>
        <label>Message / quote<textarea data-spot-quote>${escapeHtml(s.quote||'')}</textarea></label>
        <label>Recognition badges (comma separated)<input data-spot-badges value="${escapeAttr((s.badges||[]).join(', '))}"></label>

        <div class="row">
          <label>Start date<input type="date" data-spot-start value="${escapeAttr(s.startDate||'')}"></label>
          <label>End date<input type="date" data-spot-end value="${escapeAttr(s.endDate||'')}"></label>
          <label>Media seconds<input type="number" min="2" max="20" data-spot-media-seconds value="${Number(s.mediaSeconds||5)}"></label>
        </div>

        <div class="recognition-media-panel">
          <div class="recognition-media-head">
            <div><strong>Recognition Media</strong><span>${mediaCount} gallery item${mediaCount===1?'':'s'}</span></div>
            <label class="switch-row"><input type="checkbox" data-spot-photo ${s.showPhoto!==false?'checked':''}> Show media</label>
          </div>
          <label class="upload">Primary portrait / fallback photo<input type="file" data-spot-upload accept="image/*"><small data-photo-status>${photoNote}. This remains as the fallback if the media gallery is empty.</small></label>
          <label class="upload">Add gallery photos<input type="file" data-spot-media-photo accept="image/*" multiple><small>Select multiple photos at once.</small></label>
          <label class="upload">Add gallery videos<input type="file" data-spot-media-video accept="video/mp4,video/webm,video/ogg" multiple><small>MP4/WebM recommended. Use YouTube for larger videos.</small></label>
          <div class="youtube-add-row">
            <label>YouTube link<input data-spot-youtube placeholder="https://www.youtube.com/watch?v=..."></label>
            <button type="button" class="secondary-action" data-spot-add-youtube>Add YouTube</button>
          </div>
          <div class="recognition-media-grid">
            ${s.media.map((m,mi)=>{
              const thumb=m.type==='youtube'
                ? `https://img.youtube.com/vi/${escapeAttr(m.videoId||youtubeIdFromUrl(m.src))}/hqdefault.jpg`
                : m.src;
              return `<div class="gallery-photo-tile ${mi===Number(s.coverIndex||0)?'cover-photo':''}" data-rec-media-index="${mi}">
                ${m.type==='video'?`<video src="${escapeAttr(m.src)}" muted></video>`:`<img src="${escapeAttr(thumb)}" alt="">`}
                <div class="gallery-media-type">${m.type==='image'?'PHOTO':m.type==='video'?'VIDEO':'YOUTUBE'}</div>
                <div class="gallery-photo-badge">${mi===Number(s.coverIndex||0)?'COVER':`ITEM ${mi+1}`}</div>
                <div class="gallery-photo-actions">
                  <button type="button" data-rec-cover>Set Cover</button>
                  <button type="button" data-rec-up ${mi===0?'disabled':''}>↑</button>
                  <button type="button" data-rec-down ${mi===s.media.length-1?'disabled':''}>↓</button>
                  <button type="button" data-rec-remove>Remove</button>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`;

      const typeSel=card.querySelector('[data-spot-type]');
      const customWrap=card.querySelector('[data-custom-type-wrap]');
      typeSel.addEventListener('change',()=>{
        s.type=typeSel.value;
        customWrap.style.display=s.type==='Custom'?'':'none';
      });

      card.querySelector('.remove-btn').addEventListener('click',()=>{data.spotlights.splice(i,1);renderSpotlights();status.textContent='Recognition removed. Save to apply.'});
      card.querySelector('.duplicate-btn').addEventListener('click',()=>{const copy=clone(s);copy.name=copy.name?`${copy.name} Copy`:'';data.spotlights.splice(i+1,0,copy);renderSpotlights();status.textContent='Recognition duplicated.'});
      card.querySelector('[data-spot-upload]').addEventListener('change',async e=>{const file=e.target.files[0];if(file){s.portrait=await resizeImage(file,720,960);card.querySelector('[data-photo-status]').textContent='Primary photo ready. Save CCN Display to apply.';status.textContent=`Primary photo ready for Recognition ${i+1}.`}});

      card.querySelector('[data-spot-media-photo]').addEventListener('change',async e=>{
        const files=[...e.target.files];
        for(const file of files) s.media.push({type:'image',src:await resizeImage(file,1280,800,.80),name:file.name,loop:false,muted:true});
        renderSpotlights();
      });

      card.querySelector('[data-spot-media-video]').addEventListener('change',async e=>{
        const files=[...e.target.files];
        for(const file of files){
          if(file.size>12*1024*1024){status.textContent=`${file.name} is over 12 MB. Use YouTube or a smaller video.`;continue;}
          const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
          s.media.push({type:'video',src,name:file.name,loop:false,muted:true});
        }
        renderSpotlights();
      });

      card.querySelector('[data-spot-add-youtube]').addEventListener('click',()=>{
        const input=card.querySelector('[data-spot-youtube]');
        const id=youtubeIdFromUrl(input.value);
        if(!id){status.textContent='That does not look like a valid YouTube link.';return;}
        s.media.push({type:'youtube',src:input.value.trim(),videoId:id,name:'YouTube Video',loop:false,muted:true});
        input.value='';
        renderSpotlights();
      });

      card.querySelectorAll('[data-rec-media-index]').forEach(tile=>{
        const mi=Number(tile.dataset.recMediaIndex);
        tile.querySelector('[data-rec-cover]').addEventListener('click',()=>{s.coverIndex=mi;renderSpotlights();});
        tile.querySelector('[data-rec-remove]').addEventListener('click',()=>{s.media.splice(mi,1);s.coverIndex=Math.max(0,Math.min(s.coverIndex,s.media.length-1));renderSpotlights();});
        tile.querySelector('[data-rec-up]').addEventListener('click',()=>{if(mi>0){[s.media[mi-1],s.media[mi]]=[s.media[mi],s.media[mi-1]];if(s.coverIndex===mi)s.coverIndex=mi-1;else if(s.coverIndex===mi-1)s.coverIndex=mi;renderSpotlights();}});
        tile.querySelector('[data-rec-down]').addEventListener('click',()=>{if(mi<s.media.length-1){[s.media[mi+1],s.media[mi]]=[s.media[mi],s.media[mi+1]];if(s.coverIndex===mi)s.coverIndex=mi+1;else if(s.coverIndex===mi+1)s.coverIndex=mi;renderSpotlights();}});
      });

      spotlightsWrap.appendChild(card);
    });
  }


  const universalGalleryLabels = {
    lesson: "Today's Lesson",
    objective: "Lesson Objective",
    terms: "Key Terms",
    exit: "Exit Questions",
    event: "Upcoming Event",
    announcements: "Announcements",
    spotlights: "Cadet Spotlights",
    service: "Community Impact"
  };

  function youtubeIdFromUrl(url){
    const text=String(url||'').trim();
    const m=text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m?m[1]:'';
  }

  function newMediaItem(type,src,name=''){
    return {type,src,name:name||'',loop:false,muted:true};
  }

  function renderUniversalGalleries(){
    universalGalleriesWrap.innerHTML='';
    Object.keys(universalGalleryLabels).forEach(key=>{
      const gallery=data.galleries[key] || {enabled:false,seconds:5,coverIndex:0,media:[]};
      const card=document.createElement('div');
      card.className='universal-gallery-card';
      card.dataset.galleryKey=key;

      const mediaTiles=(gallery.media||[]).map((item,i)=>{
        const isImage=item.type==='image';
        const isVideo=item.type==='video';
        const isYoutube=item.type==='youtube';
        const thumb=isYoutube?`https://img.youtube.com/vi/${escapeAttr(item.videoId||youtubeIdFromUrl(item.src))}/hqdefault.jpg`:item.src;
        return `
        <div class="gallery-photo-tile ${i===Number(gallery.coverIndex||0)?'cover-photo':''}" data-photo-index="${i}">
          ${isVideo
            ? `<video src="${escapeAttr(item.src)}" muted preload="metadata"></video>`
            : `<img src="${escapeAttr(thumb)}" alt="">`
          }
          <div class="gallery-media-type">${isImage?'PHOTO':isVideo?'VIDEO':'YOUTUBE'}</div>
          <div class="gallery-photo-badge">${i===Number(gallery.coverIndex||0)?'COVER':`ITEM ${i+1}`}</div>
          <div class="gallery-media-options">
            ${(isVideo||isYoutube)?`<label><input type="checkbox" data-media-loop ${item.loop?'checked':''}> Loop</label>`:''}
            ${(isVideo)?`<label><input type="checkbox" data-media-muted ${item.muted!==false?'checked':''}> Muted</label>`:''}
          </div>
          <div class="gallery-photo-actions">
            <button type="button" data-photo-cover>Set Cover</button>
            <button type="button" data-photo-up ${i===0?'disabled':''}>↑</button>
            <button type="button" data-photo-down ${i===(gallery.media||[]).length-1?'disabled':''}>↓</button>
            <button type="button" data-photo-remove>Remove</button>
          </div>
        </div>`;
      }).join('');

      card.innerHTML=`
        <div class="spotlight-card-head">
          <div><span class="spotlight-index">SECTION MEDIA</span><strong>${escapeHtml(universalGalleryLabels[key])}</strong></div>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-gallery-enabled ${gallery.enabled!==false?'checked':''}> Use media gallery on TV</label>
        </div>
        <div class="row gallery-settings-row">
          <label>Seconds per photo<input type="number" min="2" max="20" data-gallery-seconds value="${Number(gallery.seconds||5)}"></label>
          <label>Media count<input value="${(gallery.media||[]).length}" disabled></label>
          <label class="upload gallery-upload">Add photos<input type="file" data-gallery-photo-upload accept="image/*" multiple><small>Select multiple photos at once.</small></label>
          <label class="upload gallery-upload">Add videos<input type="file" data-gallery-video-upload accept="video/mp4,video/webm,video/ogg" multiple><small>MP4/WebM recommended. Large videos may exceed browser storage.</small></label>
        </div>
        <div class="youtube-add-row">
          <label>YouTube link<input data-youtube-url placeholder="https://www.youtube.com/watch?v=..."></label>
          <button type="button" class="secondary-action" data-add-youtube>Add YouTube Video</button>
        </div>
        <div class="gallery-photo-grid">${mediaTiles || '<div class="empty-gallery">No media yet.</div>'}</div>`;

      card.querySelector('[data-gallery-photo-upload]').addEventListener('change',async e=>{
        const files=[...e.target.files];
        if(!files.length) return;
        status.textContent=`Processing ${files.length} photo${files.length===1?'':'s'} for ${universalGalleryLabels[key]}…`;
        for(const file of files){
          gallery.media.push(newMediaItem('image',await resizeImage(file,1280,800,.80),file.name));
        }
        if(gallery.media.length===files.length) gallery.coverIndex=0;
        renderUniversalGalleries();
        status.textContent=`Photos added to ${universalGalleryLabels[key]}. Save to apply.`;
      });

      card.querySelector('[data-gallery-video-upload]').addEventListener('change',async e=>{
        const files=[...e.target.files];
        if(!files.length) return;
        for(const file of files){
          if(file.size>12*1024*1024){
            status.textContent=`${file.name} is over 12 MB. Use a smaller video or YouTube link to avoid browser storage limits.`;
            continue;
          }
          const dataUrl=await new Promise((resolve,reject)=>{
            const reader=new FileReader();
            reader.onload=()=>resolve(reader.result);
            reader.onerror=reject;
            reader.readAsDataURL(file);
          });
          gallery.media.push(newMediaItem('video',dataUrl,file.name));
        }
        renderUniversalGalleries();
        status.textContent=`Videos added to ${universalGalleryLabels[key]}. Save to apply.`;
      });

      card.querySelector('[data-add-youtube]').addEventListener('click',()=>{
        const input=card.querySelector('[data-youtube-url]');
        const url=input.value.trim();
        const videoId=youtubeIdFromUrl(url);
        if(!videoId){
          status.textContent='That does not look like a valid YouTube URL.';
          return;
        }
        gallery.media.push({type:'youtube',src:url,videoId,loop:false,muted:true,name:'YouTube Video'});
        input.value='';
        renderUniversalGalleries();
        status.textContent=`YouTube video added to ${universalGalleryLabels[key]}.`;
      });

      card.querySelectorAll('.gallery-photo-tile').forEach(tile=>{
        const i=Number(tile.dataset.photoIndex);
        tile.querySelector('[data-photo-cover]').addEventListener('click',()=>{
          gallery.coverIndex=i;renderUniversalGalleries();
        });
        tile.querySelector('[data-photo-remove]').addEventListener('click',()=>{
          gallery.media.splice(i,1);
          gallery.coverIndex=Math.max(0,Math.min(gallery.coverIndex,gallery.media.length-1));
          renderUniversalGalleries();
        });
        tile.querySelector('[data-photo-up]').addEventListener('click',()=>{
          if(i>0){
            [gallery.media[i-1],gallery.media[i]]=[gallery.media[i],gallery.media[i-1]];
            if(gallery.coverIndex===i) gallery.coverIndex=i-1; else if(gallery.coverIndex===i-1) gallery.coverIndex=i;
            renderUniversalGalleries();
          }
        });
        tile.querySelector('[data-photo-down]').addEventListener('click',()=>{
          if(i<gallery.media.length-1){
            [gallery.media[i+1],gallery.media[i]]=[gallery.media[i],gallery.media[i+1]];
            if(gallery.coverIndex===i) gallery.coverIndex=i+1; else if(gallery.coverIndex===i+1) gallery.coverIndex=i;
            renderUniversalGalleries();
          }
        });
        const loop=tile.querySelector('[data-media-loop]');
        if(loop) loop.addEventListener('change',()=>gallery.media[i].loop=loop.checked);
        const muted=tile.querySelector('[data-media-muted]');
        if(muted) muted.addEventListener('change',()=>gallery.media[i].muted=muted.checked);
      });

      universalGalleriesWrap.appendChild(card);
    });
  }

  function collectUniversalGalleries(result){
    result.galleries=result.galleries||{};
    universalGalleriesWrap.querySelectorAll('.universal-gallery-card').forEach(card=>{
      const key=card.dataset.galleryKey;
      const source=data.galleries[key]||{media:[]};
      result.galleries[key]={
        enabled:Boolean(card.querySelector('[data-gallery-enabled]')?.checked),
        seconds:Math.max(2,Math.min(20,Number(card.querySelector('[data-gallery-seconds]')?.value||5))),
        coverIndex:Math.max(0,Math.min(Number(source.coverIndex||0),Math.max(0,(source.media||[]).length-1))),
        media:[...(source.media||[])]
      };
    });
  }

  function newCustomSection(){
    return {
      id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      enabled:true,
      showParents:true,
      group:'learn',
      label:'Custom Section',
      title:'New Section',
      cardTitle:'',
      description:'',
      meta:'',
      callout:'FEATURE',
      badge:'NEW',
      showPhoto:true,
      photo:'assets/ui/event-no-photo.svg'
    };
  }

  function renderCustomSections(){
    customSectionsWrap.innerHTML='';
    if(!data.customSections.length){
      customSectionsWrap.innerHTML='<div class="empty-gallery">No custom sections yet. Click <strong>+ Add Custom Section</strong> to create one.</div>';
      return;
    }
    data.customSections.forEach((section,i)=>{
      const card=document.createElement('div');
      card.className='custom-section-editor-card';
      const photoNote=section.photo && String(section.photo).startsWith('data:')?'Custom picture saved':'Default graphic';
      card.innerHTML=`
        <div class="spotlight-card-head">
          <div><span class="spotlight-index">CUSTOM SECTION ${i+1}</span><strong>${escapeHtml(section.title||'New Section')}</strong></div>
          <div class="spotlight-card-actions">
            <button type="button" class="move-up-btn" ${i===0?'disabled':''}>↑</button>
            <button type="button" class="move-down-btn" ${i===data.customSections.length-1?'disabled':''}>↓</button>
            <button type="button" class="duplicate-btn">Duplicate</button>
            <button type="button" class="remove-btn">Remove</button>
          </div>
        </div>

        <div class="custom-toggle-grid">
          <label class="switch-row spotlight-switch"><input type="checkbox" data-custom-enabled ${section.enabled!==false?'checked':''}> Show on TV</label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-custom-parents ${section.showParents!==false?'checked':''}> Show on Parent View</label>
          <label class="switch-row spotlight-switch"><input type="checkbox" data-custom-photo ${section.showPhoto!==false?'checked':''}> Show picture</label>
        </div>

        <div class="row">
          <label>Navigation category
            <select data-custom-group>
              <option value="home" ${section.group==='home'?'selected':''}>Home only</option>
              <option value="lesson" ${section.group==='lesson'?'selected':''}>Today’s Lesson</option>
              <option value="learn" ${section.group==='learn'?'selected':''}>Learn</option>
              <option value="events" ${section.group==='events'?'selected':''}>Events</option>
              <option value="spotlight" ${section.group==='spotlight'?'selected':''}>Recognition</option>
            </select>
          </label>
          <label>Section label<input data-custom-label value="${escapeAttr(section.label||'')}"></label>
          <label>Badge<input data-custom-badge value="${escapeAttr(section.badge||'')}"></label>
          <label>Feature callout<input data-custom-callout value="${escapeAttr(section.callout||'')}"></label>
        </div>

        <label>Main title<input data-custom-title value="${escapeAttr(section.title||'')}"></label>
        <label>Short lineup-card title<input data-custom-cardtitle value="${escapeAttr(section.cardTitle||'')}" placeholder="Optional — short title for TV card"></label>
        <label>Description / main text<textarea data-custom-description>${escapeHtml(section.description||'')}</textarea></label>
        <label>Details / chips <input data-custom-meta value="${escapeAttr(section.meta||'')}" placeholder="Separate items with • or commas"></label>

        <label class="upload">Section picture
          <input type="file" data-custom-upload accept="image/*">
          <small data-custom-photo-status>${photoNote}. A landscape picture works best for the large feature screen.</small>
        </label>`;
      card.querySelector('.remove-btn').addEventListener('click',()=>{
        data.customSections.splice(i,1);renderCustomSections();status.textContent='Custom section removed. Save to apply.';
      });
      card.querySelector('.duplicate-btn').addEventListener('click',()=>{
        const copy=clone(section);
        copy.id=`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        copy.title=copy.title?`${copy.title} Copy`:'New Section';
        data.customSections.splice(i+1,0,copy);renderCustomSections();status.textContent='Custom section duplicated.';
      });
      card.querySelector('.move-up-btn').addEventListener('click',()=>{
        if(i>0){[data.customSections[i-1],data.customSections[i]]=[data.customSections[i],data.customSections[i-1]];renderCustomSections();}
      });
      card.querySelector('.move-down-btn').addEventListener('click',()=>{
        if(i<data.customSections.length-1){[data.customSections[i+1],data.customSections[i]]=[data.customSections[i],data.customSections[i+1]];renderCustomSections();}
      });
      card.querySelector('[data-custom-upload]').addEventListener('change',async e=>{
        const file=e.target.files[0];
        if(file){
          section.photo=await resizeImage(file,1280,800,.80);
          card.querySelector('[data-custom-photo-status]').textContent='Custom picture ready. Save CCN Display to apply.';
          status.textContent=`Picture ready for Custom Section ${i+1}.`;
        }
      });
      customSectionsWrap.appendChild(card);
    });
  }

  document.getElementById('addTerm').addEventListener('click',()=>{data.keyTerms.push({word:'',definition:''});renderTerms();status.textContent='New term added.'});
  document.getElementById('addQuestion').addEventListener('click',()=>{data.exitQuestions.push('');renderQuestions();status.textContent='New exit question added.'});
  document.getElementById('addUpdate').addEventListener('click',()=>{data.announcements.push({headline:'',detail:'',status:''});renderUpdates();status.textContent='New announcement added.'});
  document.getElementById('addSpotlight').addEventListener('click',()=>{data.spotlights.push({type:'Cadet of the Year',enabled:true,name:'',detail:'',quote:'',badges:[],showPhoto:true,portrait:D.spotlights[0].portrait});renderSpotlights();status.textContent='New spotlight added.'});
  document.getElementById('addCustomSection').addEventListener('click',()=>{data.customSections.push(newCustomSection());renderCustomSections();status.textContent='New custom section added.';});

  function collectResult(){
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
      type:card.querySelector('[data-spot-type]')?.value||'Special Recognition',
      customType:card.querySelector('[data-spot-customtype]')?.value.trim()||'',
      enabled:Boolean(card.querySelector('[data-spot-enabled]')?.checked),
      showParents:Boolean(card.querySelector('[data-spot-parents]')?.checked),
      headline:card.querySelector('[data-spot-headline]')?.value.trim()||'',
      name:card.querySelector('[data-spot-name]')?.value.trim()||'',
      detail:card.querySelector('[data-spot-detail]')?.value.trim()||'',
      quote:card.querySelector('[data-spot-quote]')?.value.trim()||'',
      badges:(card.querySelector('[data-spot-badges]')?.value||'').split(',').map(x=>x.trim()).filter(Boolean),
      showPhoto:Boolean(card.querySelector('[data-spot-photo]')?.checked),
      portrait:data.spotlights[i]?.portrait||D.spotlights[0].portrait,
      media:[...(data.spotlights[i]?.media||[])],
      mediaSeconds:Math.max(2,Math.min(20,Number(card.querySelector('[data-spot-media-seconds]')?.value||5))),
      coverIndex:Math.max(0,Math.min(Number(data.spotlights[i]?.coverIndex||0),Math.max(0,(data.spotlights[i]?.media||[]).length-1))),
      startDate:card.querySelector('[data-spot-start]')?.value||'',
      endDate:card.querySelector('[data-spot-end]')?.value||''
    }));
    result.customSections=Array.from(customSectionsWrap.querySelectorAll('.custom-section-editor-card')).map((card,i)=>({
      id:data.customSections[i]?.id||`custom-${Date.now()}-${i}`,
      enabled:Boolean(card.querySelector('[data-custom-enabled]')?.checked),
      showParents:Boolean(card.querySelector('[data-custom-parents]')?.checked),
      showPhoto:Boolean(card.querySelector('[data-custom-photo]')?.checked),
      group:card.querySelector('[data-custom-group]')?.value||'learn',
      label:card.querySelector('[data-custom-label]')?.value.trim()||'Custom Section',
      badge:card.querySelector('[data-custom-badge]')?.value.trim()||'',
      callout:card.querySelector('[data-custom-callout]')?.value.trim()||'FEATURE',
      title:card.querySelector('[data-custom-title]')?.value.trim()||'New Section',
      cardTitle:card.querySelector('[data-custom-cardtitle]')?.value.trim()||'',
      description:card.querySelector('[data-custom-description]')?.value.trim()||'',
      meta:card.querySelector('[data-custom-meta]')?.value.trim()||'',
      photo:data.customSections[i]?.photo||'assets/ui/event-no-photo.svg',
      artwork:card.querySelector('[data-custom-artwork]')?.value||'lesson-board.svg',
      fontPref:card.querySelector('[data-custom-fontpref]')?.value||'auto'
    }));
    // V18.9.2: serialize universal media galleries directly inside collectResult.
    result.galleries = result.galleries || {};
    if (universalGalleriesWrap) {
      universalGalleriesWrap.querySelectorAll('.universal-gallery-card').forEach(card=>{
        const key=card.dataset.galleryKey;
        const source=(data.galleries && data.galleries[key]) ? data.galleries[key] : {media:[]};
        const media=Array.isArray(source.media)
          ? source.media
          : (Array.isArray(source.photos) ? source.photos.map(src=>({type:'image',src})) : []);
        result.galleries[key]={
          enabled:Boolean(card.querySelector('[data-gallery-enabled]')?.checked),
          seconds:Math.max(2,Math.min(20,Number(card.querySelector('[data-gallery-seconds]')?.value||5))),
          coverIndex:Math.max(0,Math.min(Number(source.coverIndex||0),Math.max(0,media.length-1))),
          media:[...media]
        };
      });
    }
    if (eventPhotoData) result.operation.photo = eventPhotoData;
    result.settings = result.settings || {};
    result.settings.updatedAt = new Date().toISOString();
    return result;
  }

  function saveLocal(result){
    localStorage.setItem('ccnStreamingContent',JSON.stringify(result));
    data=result;
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    try{const result=collectResult();saveLocal(result);status.textContent='Local draft saved. Download Shared Update when ready to publish.';}
    catch(err){status.textContent='Could not save. Too many or very large photos may exceed browser storage.';}
  });

  document.getElementById('downloadShared').addEventListener('click',()=>{
    try{
      const result=collectResult(); saveLocal(result);
      const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob); const a=document.createElement('a');
      a.href=url; a.download='shared-content.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Downloaded shared-content.json. Upload it to the GitHub /docs folder to publish everywhere.';
    }catch(err){status.textContent='Could not create the shared update file.';}
  });

  document.getElementById('importShared').addEventListener('change',async e=>{
    const file=e.target.files[0]; if(!file) return;
    try{const imported=JSON.parse(await file.text());localStorage.setItem('ccnStreamingContent',JSON.stringify(imported));status.textContent='Published JSON imported. Reloading editor…';setTimeout(()=>location.reload(),350);}
    catch(err){status.textContent='That file is not a valid CCN shared-content.json file.';}
  });


  // ==========================================================
  // V18.6 — Direct GitHub publishing
  // Token is intentionally never saved to localStorage.
  // ==========================================================
  const githubRepo = document.getElementById('githubRepo');
  const githubBranch = document.getElementById('githubBranch');
  const githubPath = document.getElementById('githubPath');
  const githubToken = document.getElementById('githubToken');
  const publishGitHub = document.getElementById('publishGitHub');
  const testGitHub = document.getElementById('testGitHub');
  const toggleToken = document.getElementById('toggleToken');
  const publishProgress = document.getElementById('publishProgress');
  const publishProgressFill = document.getElementById('publishProgressFill');
  const publishProgressText = document.getElementById('publishProgressText');

  function githubConfig(){
    const repo=(githubRepo?.value||'').trim();
    const branch=(githubBranch?.value||'main').trim()||'main';
    const path=(githubPath?.value||'docs/shared-content.json').trim().replace(/^\/+/,'');
    const token=(githubToken?.value||'').trim();
    if(!/^[^/\s]+\/[^/\s]+$/.test(repo)) throw new Error('Repository must look like owner/repository.');
    if(!path) throw new Error('Shared content path is required.');
    if(!token) throw new Error('Paste your GitHub fine-grained token first.');
    return {repo,branch,path,token};
  }

  function githubHeaders(token){
    return {
      'Accept':'application/vnd.github+json',
      'Authorization':`Bearer ${token}`,
      'X-GitHub-Api-Version':'2022-11-28',
      'Content-Type':'application/json'
    };
  }

  function utf8ToBase64(text){
    const bytes=new TextEncoder().encode(text);
    let binary='';
    const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk){
      binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
    }
    return btoa(binary);
  }

  function setPublishProgress(percent,text){
    if(publishProgress) publishProgress.hidden=false;
    if(publishProgressFill) publishProgressFill.style.width=`${Math.max(0,Math.min(100,percent))}%`;
    if(publishProgressText) publishProgressText.textContent=text;
  }

  async function githubJson(url,options={}){
    const res=await fetch(url,options);
    let payload=null;
    const raw=await res.text();
    if(raw){
      try{payload=JSON.parse(raw);}catch{payload={message:raw};}
    }
    if(!res.ok){
      const msg=payload?.message||`${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    return payload;
  }

  async function testGitHubConnection(){
    const {repo,branch,path,token}=githubConfig();
    setPublishProgress(20,'Checking repository access…');
    const repoInfo=await githubJson(`https://api.github.com/repos/${repo}`,{
      headers:githubHeaders(token)
    });
    setPublishProgress(55,'Checking shared-content.json access…');
    let fileExists=false;
    try{
      await githubJson(`https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,{
        headers:githubHeaders(token)
      });
      fileExists=true;
    }catch(err){
      if(!/Not Found/i.test(err.message)) throw err;
    }
    setPublishProgress(100,fileExists?'Connection ready. Existing shared-content.json found.':'Connection ready. shared-content.json will be created on publish.');
    return repoInfo;
  }

  async function publishDirectlyToGitHub(){
    const {repo,branch,path,token}=githubConfig();
    const result=collectResult();
    saveLocal(result);

    setPublishProgress(8,'Preparing shared CCN update…');
    const contentText=JSON.stringify(result,null,2);

    setPublishProgress(20,'Reading current GitHub version…');
    let sha=null;
    try{
      const current=await githubJson(`https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,{
        headers:githubHeaders(token)
      });
      sha=current?.sha||null;
    }catch(err){
      if(!/Not Found/i.test(err.message)) throw err;
    }

    setPublishProgress(48,'Publishing to GitHub…');
    const body={
      message:`Update CCN shared content — ${new Date().toLocaleString()}`,
      content:utf8ToBase64(contentText),
      branch
    };
    if(sha) body.sha=sha;

    const published=await githubJson(`https://api.github.com/repos/${repo}/contents/${path}`,{
      method:'PUT',
      headers:githubHeaders(token),
      body:JSON.stringify(body)
    });

    setPublishProgress(82,'GitHub update committed. Waiting for Pages cache…');
    const commitSha=published?.commit?.sha||'';
    await new Promise(resolve=>setTimeout(resolve,900));

    setPublishProgress(100,'Published successfully. TV and Parent View can now refresh.');
    status.textContent=`Published to GitHub${commitSha?` • commit ${commitSha.slice(0,7)}`:''}. Refresh the public TV/Parent page in a few moments.`;
  }

  if(toggleToken){
    toggleToken.addEventListener('click',()=>{
      const showing=githubToken.type==='text';
      githubToken.type=showing?'password':'text';
      toggleToken.textContent=showing?'Show':'Hide';
    });
  }

  if(testGitHub){
    testGitHub.addEventListener('click',async()=>{
      try{
        testGitHub.disabled=true;
        status.textContent='Testing GitHub connection…';
        await testGitHubConnection();
        status.textContent='GitHub connection is ready.';
      }catch(err){
        setPublishProgress(100,'Connection failed.');
        status.textContent=`GitHub connection failed: ${err.message}`;
      }finally{
        testGitHub.disabled=false;
      }
    });
  }

  if(publishGitHub){
    publishGitHub.addEventListener('click',async()=>{
      const ok=confirm('Publish the current CCN content to GitHub now? This will update the shared TV and Parent View data.');
      if(!ok) return;
      try{
        publishGitHub.disabled=true;
        testGitHub && (testGitHub.disabled=true);
        status.textContent='Publishing CCN update to GitHub…';
        await publishDirectlyToGitHub();
      }catch(err){
        setPublishProgress(100,'Publish failed.');
        status.textContent=`GitHub publish failed: ${err.message}`;
      }finally{
        publishGitHub.disabled=false;
        testGitHub && (testGitHub.disabled=false);
      }
    });
  }


  document.getElementById('reset').addEventListener('click',()=>{if(confirm('Reset all saved CCN content?')){localStorage.removeItem('ccnStreamingContent');location.reload()}});
  renderTerms();renderQuestions();renderUpdates();renderSpotlights();renderUniversalGalleries();renderCustomSections();

  document.querySelectorAll('.inline-media-jump').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=btn.dataset.galleryTarget;
      const galleryCard=universalGalleriesWrap.querySelector(`[data-gallery-key="${target}"]`);
      if(galleryCard){
        galleryCard.scrollIntoView({behavior:'smooth',block:'start'});
        galleryCard.classList.add('gallery-flash');
        setTimeout(()=>galleryCard.classList.remove('gallery-flash'),1600);
      }
    });
  });


})();
