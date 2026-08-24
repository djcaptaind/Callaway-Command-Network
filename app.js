(async () => {
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
  const loadShared = async () => {
    try {
      const url = new URL('shared-content.json', window.location.href);
      const res = await fetch(url, {cache:'no-store'});
      if (!res.ok) throw new Error('shared content unavailable');
      return await res.json();
    } catch { return null; }
  };

  const shared = await loadShared();
  let local = null;
  try { local = JSON.parse(localStorage.getItem('ccnStreamingContent') || localStorage.getItem('ccnContent') || 'null'); } catch {}
  const C = merge(merge(clone(D), shared || {}), local || {});

  const esc = (v='') => String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const accentLast = value => esc(value||'').replace(/\s+(\S+)$/, ' <span class="accent">$1</span>');
  const titleClass = value => { const n=String(value||'').trim().length; return n>88?'title-xxlong':n>64?'title-xlong':n>44?'title-long':n>28?'title-medium':'title-short'; };
  const recognitionTitleClass = value => {
    const n=String(value||'').trim().length;
    return n>70?'recognition-title-xxlong':n>48?'recognition-title-xlong':n>30?'recognition-title-long':'recognition-title-short';
  };
  const cardTitleClass = value => { const n=String(value||'').trim().length; return n>60?'card-title-xlong':n>38?'card-title-long':''; };
  const readableCardTitle = (value, fallback='', maxWords=5) => {
    const explicit=String(value||'').trim();
    if(explicit) return explicit;
    const source=String(fallback||'').trim();
    if(!source) return '';
    if(source.length<=34) return source;
    const clean=source.replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();
    const words=clean.split(' ');
    let short=words.slice(0,maxWords).join(' ');
    if(short.length>38) short=short.slice(0,38).replace(/\s+\S*$/,'');
    return short + (short!==clean?'…':'');
  };
  const toDate = value => { const d=new Date(value); return Number.isNaN(d.getTime())?null:d; };
  const daysUntil = value => { const d=toDate(value); return d?Math.max(0,Math.ceil((d-new Date())/86400000)):0; };
  const formatDate = value => { const d=toDate(value); return d?d.toLocaleDateString([], {weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase():'DATE TBD'; };
  const recognitionActive = item => {
    const today=new Date();
    today.setHours(0,0,0,0);
    if(item.startDate){
      const s=new Date(item.startDate+'T00:00:00');
      if(today<s) return false;
    }
    if(item.endDate){
      const e=new Date(item.endDate+'T23:59:59');
      if(today>e) return false;
    }
    return true;
  };
  const galleryFor = key => {
    const g=C.galleries?.[key];
    if(!g || g.enabled===false) return null;
    let media=Array.isArray(g.media)?g.media:[];
    if(!media.length && Array.isArray(g.photos)){
      media=g.photos.map(src=>({type:'image',src}));
    }
    if(!media.length) return null;
    const coverIndex=Math.max(0,Math.min(Number(g.coverIndex||0),media.length-1));
    return {media,coverIndex,seconds:Math.max(2,Math.min(20,Number(g.seconds||5)))};
  };
  const coverFor = (key,fallback) => {
    const g=galleryFor(key);
    if(!g) return fallback;
    const item=g.media[g.coverIndex];
    if(!item) return fallback;
    if(item.type==='image') return item.src;
    if(item.type==='youtube'){
      const id=item.videoId||String(item.src||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/)?.[1];
      return id?`https://img.youtube.com/vi/${id}/hqdefault.jpg`:fallback;
    }
    return fallback;
  };


  const DEFAULT_ARTWORK = {
    lesson:'lesson-board.svg',
    objective:'focus-target.svg',
    terms:'notebook-pen.svg',
    exit:'clipboard-check.svg',
    event:'mountain-event.svg',
    announcements:'bullhorn-siren.svg',
    recognition:'medal-recognition.svg',
    service:'community-hands.svg',
    challenge:'stopwatch-challenge.svg',
    promotion:'promotion-chevron.svg',
    academic:'academic-cap.svg'
  };
  const artworkFile = key => {
    const name=C.artwork?.[key] || DEFAULT_ARTWORK[key] || '';
    return name ? `assets/icons/${name}` : '';
  };

  const announcementHeroes = [
    ['assets/photos/hero-uniform.jpg','assets/photos/card-uniform.jpg'],
    ['assets/photos/hero-promotion.jpg','assets/photos/card-promotion.jpg'],
    ['assets/photos/hero-drill.jpg','assets/photos/card-drill.jpg']
  ];

  const items=[];
  if(C.display?.lesson!==false) items.push({id:'lesson',group:'lesson',tag:C.titles?.lessonLabel||"TODAY'S LESSON",callout:'NOW PLAYING',title:C.lesson?.title||"Today's Lesson",cardTitle:readableCardTitle(C.lesson?.cardTitle,C.lesson?.title||"Today's Lesson",5),titleHtml:accentLast(C.lesson?.title||"Today's Lesson"),description:C.lesson?.hook||'',meta:[C.lesson?.let,C.lesson?.lesson,C.lesson?.duration],context:'BE THE BEST • COMPETE • LEAD',hero:coverFor('lesson','assets/photos/hero-lesson.jpg'),card:coverFor('lesson','assets/photos/card-lesson-clean.jpg'),badge:'FEATURED',galleryKey:'lesson',artwork:artworkFile('lesson')});
  if(C.display?.objective!==false) items.push({id:'objective',group:'learn',tag:C.titles?.objectiveLabel||'LESSON OBJECTIVE',callout:"TODAY'S FOCUS",title:C.titles?.objectiveTitle||'KNOW THE STANDARD',cardTitle:readableCardTitle(C.titles?.objectiveCardTitle,'Lesson Objective',4),titleHtml:accentLast(C.titles?.objectiveTitle||'KNOW THE STANDARD'),description:C.lesson?.objective||'',meta:['Objective',C.lesson?.let],context:'LOCK IN. KNOW THE STANDARD.',hero:coverFor('objective','assets/photos/hero-objective.jpg'),card:coverFor('objective','assets/photos/card-objective.jpg'),badge:'LEARN',galleryKey:'objective',artwork:artworkFile('objective')});
  if(C.display?.terms!==false && C.keyTerms?.length) items.push({id:'terms',group:'learn',tag:C.titles?.termsLabel||'KEY TERMS',callout:'WORDS TO KNOW',title:C.titles?.termsTitle||'WORDS TO KNOW',titleHtml:accentLast(C.titles?.termsTitle||'WORDS TO KNOW'),description:C.keyTerms.map(x=>x.word).join(' • '),meta:[`${C.keyTerms.length} Terms`],context:'BUILD YOUR VOCABULARY.',hero:coverFor('terms','assets/photos/hero-terms.jpg'),card:coverFor('terms','assets/photos/card-terms.jpg'),badge:`${C.keyTerms.length} TERMS`,galleryKey:'terms',artwork:artworkFile('terms')});
  if(C.display?.exit!==false && C.exitQuestions?.length) items.push({id:'exit',group:'learn',tag:C.titles?.exitLabel||'EXIT QUESTIONS',callout:'EXIT TICKET',title:C.titles?.exitTitle||'SHOW WHAT YOU KNOW',titleHtml:accentLast(C.titles?.exitTitle||'SHOW WHAT YOU KNOW'),description:C.exitQuestions[0],meta:[`${C.exitQuestions.length} Questions`],context:'FINISH STRONG.',hero:coverFor('exit','assets/photos/hero-exit.jpg'),card:coverFor('exit','assets/photos/card-exit.jpg'),badge:'EXIT',galleryKey:'exit',artwork:artworkFile('exit')});

  if(C.display?.event!==false && C.operation?.title){
    const basePhoto=C.operation.showPhoto===false?'assets/ui/event-no-photo.svg':(C.operation.photo||'assets/photos/hero-adventure.jpg');
    const photo=coverFor('event',basePhoto);
    items.push({id:'operation',group:'events',tag:C.titles?.eventLabel||'UPCOMING EVENT',callout:'UPCOMING EVENT',title:C.operation.title,titleHtml:accentLast(C.operation.title),description:C.operation.detail||'',meta:[formatDate(C.operation.date),C.operation.location],context:'STAY READY.',hero:photo,card:photo,badge:`${daysUntil(C.operation.date)} DAYS`,artwork:artworkFile('event')});
  }

  if(C.display?.announcements!==false && Array.isArray(C.announcements)){
    C.announcements.filter(a=>a&&(a.headline||a.detail)).forEach((a,i)=>{
      const art=announcementHeroes[i%announcementHeroes.length];
      items.push({id:`announcement-${i}`,group:'events',tag:C.titles?.announcementLabel||'ANNOUNCEMENT',callout:a.status||'ANNOUNCEMENT',title:a.headline||'Announcement',titleHtml:accentLast(a.headline||'Announcement'),description:a.detail||'',meta:[],context:'STAY INFORMED. STAY READY.',hero:coverFor('announcements',art[0]),card:coverFor('announcements',art[1]),badge:a.status||'UPDATE',galleryKey:'announcements',artwork:artworkFile('announcements')});
    });
  }

  if(C.display?.spotlights!==false && Array.isArray(C.spotlights)){
    C.spotlights.filter(s=>s&&s.enabled!==false&&recognitionActive(s)&&(s.name||s.headline)).forEach((s,i)=>{
      const label=s.type==='Custom'?(s.customType||'Custom Recognition'):(s.type||'Special Recognition');
      const t=label.toLowerCase();
      const badge=t.includes('year')?'YEAR':t.includes('month')?'MONTH':t.includes('week')?'WEEK':t.includes('staff')?'STAFF':t.includes('team')?'TEAM':t.includes('congrat')?'CONGRATS':'RECOGNITION';
      const recognitionMedia=Array.isArray(s.media)?s.media:[];
      const mediaCover=recognitionMedia.length?recognitionMedia[Math.max(0,Math.min(Number(s.coverIndex||0),recognitionMedia.length-1))]:null;
      const coverImage=mediaCover?.type==='image'
        ? mediaCover.src
        : mediaCover?.type==='youtube'
          ? `https://img.youtube.com/vi/${mediaCover.videoId||String(mediaCover.src||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/)?.[1]}/hqdefault.jpg`
          : null;
      const portraitVisible=s.showPhoto!==false && Boolean(s.portrait);
      const displayTitle=s.headline||s.name||label;
      items.push({
        id:`spotlight-${i}`,
        group:'spotlight',
        tag:label,
        callout:'RECOGNITION',
        title:displayTitle,
        cardTitle:readableCardTitle('',displayTitle,5),
        titleHtml:accentLast(displayTitle),
        description:s.detail||'',
        personName:s.name||'',
        meta:s.badges||[],
        context:s.quote?`“${s.quote}”`:'',
        hero:coverImage||'assets/photos/hero-spotlight-clean.jpg',
        card:coverImage||(portraitVisible?s.portrait:'assets/photos/card-spotlight-clean.jpg'),
        badge,
        portrait:s.portrait,
        showPhoto:s.showPhoto!==false,
        recognitionMedia,
        recognitionMediaSeconds:Math.max(2,Math.min(20,Number(s.mediaSeconds||5))),
        recognitionType:label,artwork:artworkFile('recognition')
      });
    });
  }

  if(Array.isArray(C.customSections)){
    C.customSections.filter(s=>s && s.enabled!==false && s.title).forEach((s,i)=>{
      const photoVisible=s.showPhoto!==false && Boolean(s.photo);
      const photo=photoVisible?s.photo:'assets/ui/event-no-photo.svg';
      const meta=String(s.meta||'').split(/[•,|]/).map(x=>x.trim()).filter(Boolean).slice(0,4);
      items.push({
        id:`custom-${i}-${String(s.id||i).replace(/[^a-z0-9_-]/gi,'')}`,
        group:s.group==='home'?'home':(s.group||'learn'),
        tag:s.label||'CUSTOM SECTION',
        callout:s.callout||'FEATURE',
        title:s.title,
        cardTitle:readableCardTitle(s.cardTitle,s.title,5),
        titleHtml:accentLast(s.title),
        description:s.description||'',
        meta,
        context:'',
        hero:photo,
        card:photo,
        badge:s.badge||'FEATURE',
        artwork:s.artwork?`assets/icons/${s.artwork}`:'',
        customSection:true
      });
    });
  }

  if(C.display?.service!==false) items.push({id:'service',group:'spotlight',tag:C.titles?.serviceLabel||'COMMUNITY IMPACT',callout:'CALLAWAY PRIDE',title:C.titles?.serviceTitle||'SERVICE IN ACTION',titleHtml:accentLast(C.titles?.serviceTitle||'SERVICE IN ACTION'),description:'Leadership is measured by the positive impact we create for others.',meta:['Community','Teamwork','Service'],context:'MAKE A DIFFERENCE.',hero:coverFor('service','assets/photos/hero-service.jpg'),card:coverFor('service','assets/photos/card-service.jpg'),badge:'IMPACT',galleryKey:'service',artwork:artworkFile('service')});

  const app=document.getElementById('app'), heroBg=document.getElementById('heroBackground'), heroCopy=document.getElementById('heroCopy'), rail=document.getElementById('rail'), rowTitle=document.getElementById('rowTitle'), featureIndex=document.getElementById('featureIndex'), featureTotal=document.getElementById('featureTotal'), pausedBadge=document.getElementById('pausedBadge');
  const heroMediaLayer=document.getElementById('heroMediaLayer');
  const spotlightPhotoPanel=document.getElementById('spotlightPhotoPanel'), spotlightPhoto=document.getElementById('spotlightPhoto'), spotlightPhotoType=document.getElementById('spotlightPhotoType'), spotlightPhotoName=document.getElementById('spotlightPhotoName');
  let visible=[...items],index=0,timer=null,paused=!(C.settings?.autoplay!==false),seconds=Math.max(6,Number(C.settings?.secondsPerFeature||11));
  let heroGalleryTimer=null,heroGalleryIndex=0;
  app.style.setProperty('--feature-seconds',`${seconds}s`);
  rowTitle.textContent=C.settings?.lineupTitle||"Today's Lineup";
  featureTotal.textContent=String(visible.length).padStart(2,'0');

  const eventTitle=document.getElementById('eventTitle'),eventMeta=document.getElementById('eventMeta'),eventBg=document.getElementById('eventBackground'),countdown=document.getElementById('countdown');
  function renderEvent(){
    const op=C.operation||{}; const photo=op.showPhoto===false?'assets/ui/event-no-photo.svg':(op.photo||'assets/photos/hero-adventure.jpg');
    eventBg.style.backgroundImage=`url('${photo}')`; eventTitle.textContent=op.title||'Upcoming Event';
    eventMeta.innerHTML=`<div>▦ ${esc(formatDate(op.date))}</div><div>● ${esc(op.location||'Location TBD')}</div>`;
    updateCountdown();
  }
  function updateCountdown(){
    const d=toDate(C.operation?.date); let ms=d?Math.max(0,d-new Date()):0;
    const days=Math.floor(ms/86400000);ms%=86400000;const hrs=Math.floor(ms/3600000);ms%=3600000;const mins=Math.floor(ms/60000);const secs=Math.floor((ms%60000)/1000);
    countdown.innerHTML=[[days,'DAYS'],[hrs,'HRS'],[mins,'MINS'],[secs,'SECS']].map(([n,l])=>`<div class="count-box"><b>${String(n).padStart(2,'0')}</b><small>${l}</small></div>`).join('');
  }
  renderEvent(); setInterval(updateCountdown,1000);

  function renderRail(){
    rail.innerHTML=visible.map((item,i)=>`<article class="card cinematic-card ${i===index?'active':''}" data-index="${i}" data-id="${esc(item.id)}" role="option" aria-selected="${i===index}">
      <div class="cinematic-card-media">
        <img class="card-photo" src="${esc(item.card)}" alt="">
        <div class="cinematic-card-overlay"></div>
      </div>
      <span class="card-badge">${esc(item.badge||'')}</span>
      <div class="card-copy">
        <div class="card-label-row"><span class="card-number">${i+1}.</span><span class="tag">${esc(item.tag)}</span></div>
        <h3 class="${cardTitleClass(item.cardTitle||item.title)}">${esc(item.cardTitle||item.title)}</h3>
        <p class="card-description">${esc(String(item.description||item.context||'').slice(0,92))}</p>
      </div>
      <span class="card-progress"></span>
    </article>`).join('');
    rail.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>show(Number(c.dataset.index),true)));
  }

  function stopHeroGallery(){
    clearInterval(heroGalleryTimer);
    heroGalleryTimer=null;
    heroGalleryIndex=0;
    if(heroMediaLayer){
      heroMediaLayer.innerHTML='';
      heroMediaLayer.hidden=true;
    }
  }

  function playHeroMediaItem(item,done){
    if(!heroMediaLayer || !item){
      done?.(); return;
    }
    heroMediaLayer.innerHTML='';
    heroMediaLayer.hidden=false;

    if(item.type==='video'){
      const video=document.createElement('video');
      video.src=item.src;
      video.autoplay=true;
      video.playsInline=true;
      video.muted=item.muted!==false;
      video.loop=Boolean(item.loop);
      video.className='hero-media-video';
      if(!video.loop) video.addEventListener('ended',()=>done?.(),{once:true});
      video.addEventListener('error',()=>done?.(),{once:true});
      heroMediaLayer.appendChild(video);
      video.play().catch(()=>done?.());
      return;
    }

    if(item.type==='youtube'){
      const id=item.videoId||String(item.src||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/)?.[1];
      if(!id){done?.();return;}
      const iframe=document.createElement('iframe');
      const loop=item.loop?`&loop=1&playlist=${id}`:'';
      iframe.src=`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1${loop}`;
      iframe.allow='autoplay; encrypted-media; picture-in-picture';
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      iframe.className='hero-media-youtube';
      heroMediaLayer.appendChild(iframe);
      // YouTube iframe API is intentionally avoided. Advance after a safe default.
      if(!item.loop) heroGalleryTimer=setTimeout(()=>done?.(),Math.max(10,seconds)*1000);
      return;
    }

    heroMediaLayer.hidden=true;
    heroBg.classList.remove('animate');
    heroBg.style.backgroundImage=`url('${item.src}')`;
    requestAnimationFrame(()=>heroBg.classList.add('animate'));
    heroGalleryTimer=setTimeout(()=>done?.(),5000);
  }

  function startHeroGallery(item){
    stopHeroGallery();
    const g=item.galleryKey?galleryFor(item.galleryKey):null;
    if(!g || !g.media.length) return;
    heroGalleryIndex=g.coverIndex;

    const advance=()=>{
      if(!g.media.length) return;
      const current=g.media[heroGalleryIndex];
      if(current.type==='image'){
        if(heroMediaLayer){heroMediaLayer.innerHTML='';heroMediaLayer.hidden=true;}
        heroBg.classList.remove('animate');
        heroBg.style.backgroundImage=`url('${current.src}')`;
        requestAnimationFrame(()=>heroBg.classList.add('animate'));
        heroGalleryTimer=setTimeout(()=>{
          heroGalleryIndex=(heroGalleryIndex+1)%g.media.length;
          advance();
        },g.seconds*1000);
      }else{
        playHeroMediaItem(current,()=>{
          heroGalleryIndex=(heroGalleryIndex+1)%g.media.length;
          advance();
        });
      }
    };
    advance();
  }

  function renderHero(item){
    if(!item) return;
    heroCopy.classList.add('fade');
    setTimeout(()=>{
      try{
      const isSpotlight=item.id.startsWith('spotlight-');
      const showSpotlightPhoto=isSpotlight && item.showPhoto && item.portrait;
      if(spotlightPhotoPanel){
        spotlightPhotoPanel.hidden=!showSpotlightPhoto;
        spotlightPhotoPanel.classList.toggle('visible',Boolean(showSpotlightPhoto));
      }
      if(showSpotlightPhoto && spotlightPhoto){
        spotlightPhoto.src=item.portrait;
        spotlightPhotoType.textContent=item.recognitionType||item.tag||'RECOGNITION';
        spotlightPhotoName.textContent=item.personName||item.title||'';
      } else if(spotlightPhoto){
        spotlightPhoto.removeAttribute('src');
      }
      stopHeroGallery();
            heroBg.classList.remove('animate'); heroBg.style.backgroundImage=`url('${item.hero}')`; requestAnimationFrame(()=>heroBg.classList.add('animate'));
      startHeroGallery(item);
      heroCopy.classList.remove('terms-mode','exit-mode','objective-mode','spotlight-mode','recognition-mode','term-count-1','term-count-2','term-count-3','term-count-4','term-count-many','exit-count-1','exit-count-2','exit-count-3','exit-count-4','exit-count-many','objective-long','objective-xlong');
      if(showSpotlightPhoto) heroCopy.classList.add('spotlight-mode');
      if(item.id==='terms'){
        const tc=C.keyTerms.length;
        heroCopy.classList.add('terms-mode',tc<=4?`term-count-${tc}`:'term-count-many');
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout)}</span><h1 class="terms-title">${item.titleHtml}</h1><div class="term-grid">${C.keyTerms.map((t,i)=>`<article class="term-tile"><span class="term-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(t.word)}</h3><p>${esc(t.definition)}</p></div></article>`).join('')}</div>`;
      }else if(item.id==='exit'){
        const ec=C.exitQuestions.length;
        heroCopy.classList.add('exit-mode',ec<=4?`exit-count-${ec}`:'exit-count-many');
        heroCopy.innerHTML=`<span class="callout">EXIT TICKET</span><h1 class="exit-title">${item.titleHtml}</h1><div class="exit-grid">${C.exitQuestions.map((q,i)=>`<article class="exit-tile"><span class="exit-number">${i+1}</span><p>${esc(q)}</p></article>`).join('')}</div>`;
      }else if(item.id==='objective'){
        const objectiveText=String(item.description||'');
        heroCopy.classList.add('objective-mode',objectiveText.length>430?'objective-xlong':objectiveText.length>230?'objective-long':'');
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout)}</span><h1 class="${titleClass(item.title)}">${item.titleHtml}</h1><div class="meta">${item.meta.filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div><p class="synopsis">${esc(item.description)}</p>`;
      }else if(item.id.startsWith('spotlight-')){
        heroCopy.classList.add('recognition-mode');
        const typeLabel=esc(item.recognitionType||item.tag||'Recognition');
        const nameLine=item.personName && item.personName!==item.title ? `<div class="recognition-person">${esc(item.personName)}</div>` : '';
        heroCopy.innerHTML=`<span class="callout">${typeLabel}</span><h1 class="${recognitionTitleClass(item.title)}">${item.titleHtml}</h1>${nameLine}<div class="meta">${item.meta.filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div>${item.description?`<p class="synopsis recognition-detail">${esc(item.description)}</p>`:''}${item.context?`<div class="context-note recognition-quote">${esc(item.context)}</div>`:''}`;
      }else{
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout)}</span><h1 class="${titleClass(item.title)}">${item.titleHtml}</h1><div class="meta">${item.meta.filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div><p class="synopsis">${esc(item.description)}</p><div class="context-note">${esc(item.context||'')}</div>`;
      }
      }catch(err){
        console.error('CCN hero render error',err);
        if(heroMediaLayer){heroMediaLayer.innerHTML='';heroMediaLayer.hidden=true;}
        heroBg.style.backgroundImage=`url('${item.hero||'assets/photos/hero-lesson.jpg'}')`;
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout||item.tag||'FEATURE')}</span><h1>${item.titleHtml||esc(item.title||'Callaway JROTC')}</h1><p class="synopsis">${esc(item.description||'')}</p>`;
      }
      heroCopy.classList.remove('fade');
    },180);
  }

  function centerActive(){
    const cards=[...rail.querySelectorAll('.card')];
    const active=cards[index]; if(!active)return;
    const gap=parseFloat(getComputedStyle(rail).gap||0);
    const maxScroll=Math.max(0,rail.scrollWidth-rail.clientWidth);
    let target=active.offsetLeft-(rail.clientWidth-active.offsetWidth)/2;
    if(index===0) target=0;
    if(index===cards.length-1) target=maxScroll;
    target=Math.max(0,Math.min(target,maxScroll));
    rail.scrollTo({left:target,behavior:'smooth'});
  }
  function show(n,user=false){
    if(!visible.length)return;
    index=(n+visible.length)%visible.length;const item=visible[index];
    featureIndex.textContent=String(index+1).padStart(2,'0');featureTotal.textContent=String(visible.length).padStart(2,'0');
    renderHero(item);renderRail();requestAnimationFrame(()=>requestAnimationFrame(centerActive));
    clearTimeout(timer); if(!paused)timer=setTimeout(()=>show(index+1),seconds*1000);
    document.getElementById('briefTitle').textContent=item.tag;
    const briefSource=String(item.description||item.context||'Check today’s updates.');
    document.getElementById('briefText').textContent=briefSource.length>88?briefSource.slice(0,85).trim()+'…':briefSource;
  }
  function filter(group,btn){
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    visible=group==='all'?[...items]:items.filter(x=>x.group===group);rowTitle.textContent=group==='all'?(C.settings?.lineupTitle||"Today's Lineup"):btn.textContent.trim();index=0;show(0,true);
  }
  document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>filter(btn.dataset.filter,btn)));

  const tickerItems=(C.announcements||[]).filter(a=>a?.headline).map(a=>a.headline);
  tickerItems.push('Be On Time','Participate Every Day','Wear It Right','Represent Callaway With Pride');
  document.getElementById('tickerText').innerHTML=(tickerItems.concat(tickerItems)).map(x=>`<span>${esc(x)}</span><b>●</b>`).join('');

  function tick(){const now=new Date();document.getElementById('clock').textContent=now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});document.getElementById('date').textContent=now.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase();}
  tick();setInterval(tick,1000);

  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight')show(index+1,true); if(e.key==='ArrowLeft')show(index-1,true);
    if(e.code==='Space'){e.preventDefault();paused=!paused;pausedBadge.hidden=!paused;if(!paused)show(index);}
    if(e.key.toLowerCase()==='f'){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
    if(e.key.toLowerCase()==='e')location.href='editor.html';
  });
  document.addEventListener('dblclick',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();});
  renderRail();show(0);
})();