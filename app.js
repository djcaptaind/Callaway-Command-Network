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
  const cardTitleClass = value => { const n=String(value||'').trim().length; return n>60?'card-title-xlong':n>38?'card-title-long':''; };
  const toDate = value => { const d=new Date(value); return Number.isNaN(d.getTime())?null:d; };
  const daysUntil = value => { const d=toDate(value); return d?Math.max(0,Math.ceil((d-new Date())/86400000)):0; };
  const formatDate = value => { const d=toDate(value); return d?d.toLocaleDateString([], {weekday:'short',month:'short',day:'numeric',year:'numeric'}).toUpperCase():'DATE TBD'; };

  const announcementHeroes = [
    ['assets/photos/hero-uniform.jpg','assets/photos/card-uniform.jpg'],
    ['assets/photos/hero-promotion.jpg','assets/photos/card-promotion.jpg'],
    ['assets/photos/hero-drill.jpg','assets/photos/card-drill.jpg']
  ];

  const items=[];
  if(C.display?.lesson!==false) items.push({id:'lesson',group:'lesson',tag:C.titles?.lessonLabel||"TODAY'S LESSON",callout:'NOW PLAYING',title:C.lesson?.title||"Today's Lesson",titleHtml:accentLast(C.lesson?.title||"Today's Lesson"),description:C.lesson?.hook||'',meta:[C.lesson?.let,C.lesson?.lesson,C.lesson?.duration],context:'BE THE BEST • COMPETE • LEAD',hero:'assets/photos/hero-lesson.jpg',card:'assets/photos/card-lesson-clean.jpg',badge:'FEATURED'});
  if(C.display?.objective!==false) items.push({id:'objective',group:'learn',tag:C.titles?.objectiveLabel||'LESSON OBJECTIVE',callout:"TODAY'S FOCUS",title:C.titles?.objectiveTitle||'KNOW THE STANDARD',titleHtml:accentLast(C.titles?.objectiveTitle||'KNOW THE STANDARD'),description:C.lesson?.objective||'',meta:['Objective',C.lesson?.let],context:'LOCK IN. KNOW THE STANDARD.',hero:'assets/photos/hero-objective.jpg',card:'assets/photos/card-objective.jpg',badge:'LEARN'});
  if(C.display?.terms!==false && C.keyTerms?.length) items.push({id:'terms',group:'learn',tag:C.titles?.termsLabel||'KEY TERMS',callout:'WORDS TO KNOW',title:C.titles?.termsTitle||'WORDS TO KNOW',titleHtml:accentLast(C.titles?.termsTitle||'WORDS TO KNOW'),description:C.keyTerms.map(x=>x.word).join(' • '),meta:[`${C.keyTerms.length} Terms`],context:'BUILD YOUR VOCABULARY.',hero:'assets/photos/hero-terms.jpg',card:'assets/photos/card-terms.jpg',badge:`${C.keyTerms.length} TERMS`});
  if(C.display?.exit!==false && C.exitQuestions?.length) items.push({id:'exit',group:'learn',tag:C.titles?.exitLabel||'EXIT QUESTIONS',callout:'EXIT TICKET',title:C.titles?.exitTitle||'SHOW WHAT YOU KNOW',titleHtml:accentLast(C.titles?.exitTitle||'SHOW WHAT YOU KNOW'),description:C.exitQuestions[0],meta:[`${C.exitQuestions.length} Questions`],context:'FINISH STRONG.',hero:'assets/photos/hero-exit.jpg',card:'assets/photos/card-exit.jpg',badge:'EXIT'});

  if(C.display?.event!==false && C.operation?.title){
    const photo=C.operation.showPhoto===false?'assets/ui/event-no-photo.svg':(C.operation.photo||'assets/photos/hero-adventure.jpg');
    items.push({id:'operation',group:'events',tag:C.titles?.eventLabel||'UPCOMING EVENT',callout:'UPCOMING EVENT',title:C.operation.title,titleHtml:accentLast(C.operation.title),description:C.operation.detail||'',meta:[formatDate(C.operation.date),C.operation.location],context:'STAY READY.',hero:photo,card:photo,badge:`${daysUntil(C.operation.date)} DAYS`});
  }

  if(C.display?.announcements!==false && Array.isArray(C.announcements)){
    C.announcements.filter(a=>a&&(a.headline||a.detail)).forEach((a,i)=>{
      const art=announcementHeroes[i%announcementHeroes.length];
      items.push({id:`announcement-${i}`,group:'events',tag:C.titles?.announcementLabel||'ANNOUNCEMENT',callout:a.status||'ANNOUNCEMENT',title:a.headline||'Announcement',titleHtml:accentLast(a.headline||'Announcement'),description:a.detail||'',meta:[],context:'STAY INFORMED. STAY READY.',hero:art[0],card:art[1],badge:a.status||'UPDATE'});
    });
  }

  if(C.display?.spotlights!==false && Array.isArray(C.spotlights)){
    C.spotlights.filter(s=>s&&s.enabled!==false&&s.name).forEach((s,i)=>{
      const t=(s.type||'').toLowerCase(); const badge=t.includes('year')?'YEAR':t.includes('month')?'MONTH':'WEEK';
      items.push({id:`spotlight-${i}`,group:'spotlight',tag:s.type||'CADET SPOTLIGHT',callout:'RECOGNITION',title:s.name,titleHtml:(()=>{const p=esc(s.name).split(/\s+/);const last=p.pop()||'';return `${p.join(' ')} <span class="accent">${last}</span>`})(),description:s.detail||'',meta:s.badges||[],context:s.quote?`“${s.quote}”`:'',hero:'assets/photos/hero-spotlight-clean.jpg',card:'assets/photos/card-spotlight-clean.jpg',badge,portrait:s.portrait,showPhoto:s.showPhoto!==false});
    });
  }

  if(C.display?.service!==false) items.push({id:'service',group:'spotlight',tag:C.titles?.serviceLabel||'COMMUNITY IMPACT',callout:'CALLAWAY PRIDE',title:C.titles?.serviceTitle||'SERVICE IN ACTION',titleHtml:accentLast(C.titles?.serviceTitle||'SERVICE IN ACTION'),description:'Leadership is measured by the positive impact we create for others.',meta:['Community','Teamwork','Service'],context:'MAKE A DIFFERENCE.',hero:'assets/photos/hero-service.jpg',card:'assets/photos/card-service.jpg',badge:'IMPACT'});

  const app=document.getElementById('app'), heroBg=document.getElementById('heroBackground'), heroCopy=document.getElementById('heroCopy'), rail=document.getElementById('rail'), rowTitle=document.getElementById('rowTitle'), featureIndex=document.getElementById('featureIndex'), featureTotal=document.getElementById('featureTotal'), pausedBadge=document.getElementById('pausedBadge');
  let visible=[...items],index=0,timer=null,paused=!(C.settings?.autoplay!==false),seconds=Math.max(6,Number(C.settings?.secondsPerFeature||11));
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
    rail.innerHTML=visible.map((item,i)=>`<article class="card ${i===index?'active':''}" data-index="${i}" role="option" aria-selected="${i===index}">
      <img src="${esc(item.card)}" alt="">
      <span class="card-badge">${esc(item.badge||'')}</span>
      <div class="card-copy"><span class="tag">${esc(item.tag)}</span><h3 class="${cardTitleClass(item.title)}">${esc(item.title)}</h3></div>
      <span class="card-progress"></span>
    </article>`).join('');
    rail.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>show(Number(c.dataset.index),true)));
  }

  function renderHero(item){
    heroCopy.classList.add('fade');
    setTimeout(()=>{
      heroBg.classList.remove('animate'); heroBg.style.backgroundImage=`url('${item.hero}')`; requestAnimationFrame(()=>heroBg.classList.add('animate'));
      if(item.id==='terms'){
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout)}</span><h1 class="terms-title">${item.titleHtml}</h1><div class="term-grid">${C.keyTerms.map((t,i)=>`<article class="term-tile"><span class="term-number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(t.word)}</h3><p>${esc(t.definition)}</p></div></article>`).join('')}</div>`;
      }else if(item.id==='exit'){
        heroCopy.innerHTML=`<span class="callout">EXIT TICKET</span><h1 class="exit-title">${item.titleHtml}</h1><div class="exit-grid">${C.exitQuestions.map((q,i)=>`<article class="exit-tile"><span class="exit-number">${i+1}</span><p>${esc(q)}</p></article>`).join('')}</div>`;
      }else{
        heroCopy.innerHTML=`<span class="callout">${esc(item.callout)}</span><h1 class="${titleClass(item.title)}">${item.titleHtml}</h1><div class="meta">${item.meta.filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div><p class="synopsis">${esc(item.description)}</p><div class="context-note">${esc(item.context||'')}</div>`;
      }
      heroCopy.classList.remove('fade');
    },180);
  }

  function centerActive(){
    const active=rail.querySelector('.card.active'); if(!active)return;
    active.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  }
  function show(n,user=false){
    if(!visible.length)return;
    index=(n+visible.length)%visible.length;const item=visible[index];
    featureIndex.textContent=String(index+1).padStart(2,'0');featureTotal.textContent=String(visible.length).padStart(2,'0');
    renderHero(item);renderRail();requestAnimationFrame(()=>requestAnimationFrame(centerActive));
    clearTimeout(timer); if(!paused)timer=setTimeout(()=>show(index+1),seconds*1000);
    document.getElementById('briefTitle').textContent=item.tag;
    document.getElementById('briefText').textContent=item.description||item.context||'Check today’s updates.';
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