(() => {
  const D = window.CCN_STREAMING_DEFAULTS;
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('ccnStreamingContent') || localStorage.getItem('ccnContent') || 'null'); }
    catch { return null; }
  })();

  const merge = (base, extra) => {
    if (!extra || typeof extra !== 'object') return base;
    const out = Array.isArray(base) ? [...base] : {...base};
    Object.keys(extra).forEach(k => {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base?.[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) out[k] = merge(base[k], extra[k]);
      else out[k] = extra[k];
    });
    return out;
  };

  const C = merge(D, saved || {});
  if (!Array.isArray(saved?.spotlights)) {
    const migrated=[];
    const month=saved?.spotlightMonth || saved?.spotlight;
    const week=saved?.spotlightWeek;
    if(month?.name) migrated.push({type:saved?.titles?.spotlightMonthLabel || saved?.titles?.spotlightLabel || 'Cadet of the Month',enabled:saved?.display?.spotlightMonth ?? saved?.display?.spotlight ?? true,name:month.name||'',detail:month.detail||'',quote:month.quote||'',badges:month.badges||[],showPhoto:month.showPhoto!==false,portrait:month.portrait||D.spotlights[0].portrait});
    if(week?.name) migrated.push({type:saved?.titles?.spotlightWeekLabel || 'Cadet of the Week',enabled:saved?.display?.spotlightWeek ?? true,name:week.name||'',detail:week.detail||'',quote:week.quote||'',badges:week.badges||[],showPhoto:week.showPhoto!==false,portrait:week.portrait||D.spotlights[0].portrait});
    if(migrated.length) C.spotlights=migrated;
    if(saved?.display?.spotlight!==undefined || saved?.display?.spotlightMonth!==undefined || saved?.display?.spotlightWeek!==undefined) C.display.spotlights=true;
  }

  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const accentLast = value => {
    const text = escapeHtml(value || '');
    return text.replace(/\s+(\S+)$/, ' <span class="accent">$1</span>');
  };
  const formatDate = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'DATE TBD' : d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  };
  const daysUntil = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 0 : Math.max(0, Math.ceil((d - new Date())/86400000));
  };

  const announcementHeroes = [
    ['assets/photos/hero-uniform.jpg','assets/photos/card-uniform.jpg'],
    ['assets/photos/hero-promotion.jpg','assets/photos/card-promotion.jpg'],
    ['assets/photos/hero-drill.jpg','assets/photos/card-drill.jpg']
  ];

  const items = [];

  if (C.display.lesson) items.push({
    id:'lesson', group:'lesson', tag:C.titles.lessonLabel, callout:'NOW PLAYING', title:C.lesson.title,
    titleHtml:accentLast(C.lesson.title), description:C.lesson.hook,
    meta:[C.lesson.let,C.lesson.lesson,C.lesson.period,C.lesson.duration],
    context:'Continue learning where today’s class begins.', hero:'assets/photos/hero-lesson.jpg', card:'assets/photos/card-lesson-clean.jpg', badge:'FEATURED'
  });

  if (C.display.objective) items.push({
    id:'objective', group:'learn', tag:C.titles.objectiveLabel, callout:'TODAY’S FOCUS', title:C.titles.objectiveTitle,
    titleHtml:accentLast(C.titles.objectiveTitle), description:C.lesson.objective,
    meta:['Objective',C.lesson.let,C.lesson.period], context:'Clear targets make successful teams.',
    hero:'assets/photos/hero-objective.jpg', card:'assets/photos/card-objective.jpg', badge:'LEARN'
  });

  if (C.display.terms && C.keyTerms?.length) items.push({
    id:'terms', group:'learn', tag:C.titles.termsLabel, callout:C.titles.termsTitle, title:C.titles.termsTitle,
    titleHtml:accentLast(C.titles.termsTitle), description:C.keyTerms.map(x=>x.word).join(' • '),
    meta:[`${C.keyTerms.length} Terms`,'Vocabulary'], context:'Review each word and definition.',
    hero:'assets/photos/hero-terms.jpg', card:'assets/photos/card-terms.jpg', badge:`${C.keyTerms.length} TERMS`
  });

  if (C.display.exit && C.exitQuestions?.length) items.push({
    id:'exit', group:'learn', tag:C.titles.exitLabel, callout:'EXIT TICKET', title:C.titles.exitTitle,
    titleHtml:accentLast(C.titles.exitTitle), description:C.exitQuestions[0],
    meta:[`${C.exitQuestions.length} Questions`,'Before the Bell'], context:'Answer each question before leaving class.',
    hero:'assets/photos/hero-exit.jpg', card:'assets/photos/card-exit.jpg', badge:'EXIT'
  });

  if (C.display.event && C.operation?.title) {
    const eventPhotoVisible = C.operation.showPhoto !== false;
    const eventPhoto = C.operation.photo || 'assets/photos/hero-adventure.jpg';
    items.push({
      id:'operation', group:'events', tag:C.titles.eventLabel, callout:'COMING SOON', title:C.operation.title,
      titleHtml:accentLast(C.operation.title), description:`${daysUntil(C.operation.date)} days remaining. ${C.operation.detail}`,
      meta:[formatDate(C.operation.date),C.operation.location,'All Cadets'], context:'Check details and be prepared.',
      hero:eventPhotoVisible ? eventPhoto : 'assets/ui/event-no-photo.svg',
      card:eventPhotoVisible ? eventPhoto : 'assets/ui/event-no-photo.svg',
      badge:`${daysUntil(C.operation.date)} DAYS`
    });
  }

  if (C.display.announcements && Array.isArray(C.announcements)) {
    C.announcements.filter(a => a && (a.headline || a.detail || a.status)).forEach((a,i) => {
      const art = announcementHeroes[i % announcementHeroes.length];
      items.push({
        id:`announcement-${i}`, group:'events', tag:C.titles.announcementLabel, callout:a.status || 'ANNOUNCEMENT',
        title:a.headline || 'Announcement', titleHtml:accentLast(a.headline || 'Announcement'), description:a.detail || '',
        meta:[], context:'', hero:art[0], card:art[1], badge:a.status || 'UPDATE'
      });
    });
  }

  function makeSpotlightItem(spotlightData, spotIndex) {
    return {
      id:`spotlight-${spotIndex}`, group:'spotlight', tag:spotlightData.type || 'Cadet Spotlight', callout:'CCN ORIGINAL', title:spotlightData.name,
      titleHtml:(()=>{const parts=escapeHtml(spotlightData.name).trim().split(/\s+/); const last=parts.pop()||''; return `<span class="name-main">${parts.join(' ')}</span><span class="accent name-last">${last}</span>`;})(),
      description:spotlightData.detail, meta:spotlightData.badges || [], context:spotlightData.quote ? `“${spotlightData.quote}”` : '',
      hero:'assets/photos/hero-spotlight-clean.jpg', card:'assets/photos/card-spotlight-clean.jpg', badge:(()=>{const t=(spotlightData.type||'').toLowerCase(); if(t.includes('year')) return 'YEAR'; if(t.includes('month')) return 'MONTH'; return 'WEEK';})(),
      portrait:spotlightData.portrait, showPhoto:spotlightData.showPhoto !== false
    };
  }

  if (C.display.spotlights && Array.isArray(C.spotlights)) {
    C.spotlights.filter(s=>s && s.enabled!==false && s.name).forEach((s,i)=>items.push(makeSpotlightItem(s,i)));
  }

  if (C.display.service) items.push({
    id:'service', group:'spotlight', tag:C.titles.serviceLabel, callout:'CALLAWAY PRIDE', title:C.titles.serviceTitle,
    titleHtml:accentLast(C.titles.serviceTitle), description:'Leadership is measured by the positive impact we create for others.',
    meta:['Community','Teamwork','Service'], context:'Recognize cadets who make a difference.',
    hero:'assets/photos/hero-service.jpg', card:'assets/photos/card-service.jpg', badge:'IMPACT'
  });

  let visibleItems = [...items];
  let index = 0;
  let timer = null;
  let paused = !C.settings.autoplay;
  const seconds = Math.max(6, Number(C.settings.secondsPerFeature || 11));
  const app = document.getElementById('app');
  const heroBg = document.getElementById('heroBackground');
  const heroCopy = document.getElementById('heroCopy');
  const heroPanel = document.getElementById('heroArtPanel');
  const rail = document.getElementById('rail');
  const pausedBadge = document.getElementById('pausedBadge');
  const rowTitle = document.getElementById('rowTitle');
  rowTitle.textContent = C.settings.lineupTitle || 'Today’s Lineup';

  function renderRail(){
    rail.innerHTML = visibleItems.map((item,i)=>`
      <article class="card ${i===index?'active':''}" role="option" aria-selected="${i===index}" data-index="${i}" tabindex="${i===index?'0':'-1'}">
        <img src="${escapeHtml(item.card)}" alt="" />
        <span class="card-badge">${escapeHtml(item.badge || '')}</span>
        <div class="card-copy"><span class="tag">${escapeHtml(item.tag)}</span><h3>${escapeHtml(item.title)}</h3></div>
      </article>`).join('');
    rail.querySelectorAll('.card').forEach(card => card.addEventListener('click',()=>show(Number(card.dataset.index),true)));
  }

  function centerActive(behavior='smooth'){
    const cards=[...rail.querySelectorAll('.card')];
    const active=cards[index];
    if(!active || !cards.length) return;
    const styles=getComputedStyle(rail);
    const gap=parseFloat(styles.columnGap || styles.gap || 0);
    const step=active.offsetWidth+gap;
    const visible=Math.max(1,Math.floor((rail.clientWidth+gap)/step));
    const maxStart=Math.max(0,cards.length-visible);
    const desiredStart=Math.max(0,Math.min(index-Math.floor(visible/2),maxStart));
    const target=cards[desiredStart]?.offsetLeft || 0;
    rail.scrollTo({left:target,behavior});
  }

  function renderHero(item){
    heroCopy.classList.add('out');
    setTimeout(()=>{
      heroBg.classList.remove('animate');
      heroBg.style.backgroundImage = `url('${item.hero}')`;
      requestAnimationFrame(()=>heroBg.classList.add('animate'));

      if(item.id === 'terms'){
        heroCopy.innerHTML = `
          <span class="callout">${escapeHtml(item.callout)}</span>
          <h1 class="terms-title">${item.titleHtml}</h1>
          <div class="term-grid">
            ${C.keyTerms.map((term, termIndex)=>`
              <article class="term-tile">
                <span class="term-number">${String(termIndex + 1).padStart(2,'0')}</span>
                <div><h3>${escapeHtml(term.word)}</h3><p>${escapeHtml(term.definition)}</p></div>
              </article>`).join('')}
          </div>`;
      } else if(item.id === 'exit') {
        heroCopy.innerHTML = `
          <span class="callout">EXIT TICKET</span>
          <h1 class="exit-title">${item.titleHtml}</h1>
          <div class="exit-grid exit-count-${Math.min(C.exitQuestions.length,6)}">
            ${C.exitQuestions.map((q, qIndex)=>`
              <article class="exit-tile">
                <span class="exit-number">${qIndex + 1}</span>
                <p>${escapeHtml(q)}</p>
              </article>`).join('')}
          </div>`;
      } else {
        heroCopy.innerHTML = `
          <span class="callout">${escapeHtml(item.callout)}</span>
          <h1>${item.titleHtml}</h1>
          <div class="meta">${item.meta.filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>
          <p class="synopsis">${escapeHtml(item.description)}</p>
          <div class="hero-actions">
            <button class="hero-button" type="button">▶ View Focus</button>
            <button class="hero-button secondary" type="button">ⓘ ${escapeHtml(item.tag)}</button>
          </div>
          <div class="context-note">${escapeHtml(item.context || '')}</div>`;
      }

      heroCopy.classList.remove('out');
      heroPanel.className = 'hero-art-panel';
      heroPanel.classList.remove('visible');
      heroPanel.innerHTML='';
      if(item.id.startsWith('spotlight-') && item.showPhoto && item.portrait){
        heroPanel.classList.add('portrait-panel');
        heroPanel.innerHTML = `<img src="${escapeHtml(item.portrait)}" alt="Cadet spotlight portrait"><div class="portrait-caption"><strong>${escapeHtml(item.tag)}</strong><span>${escapeHtml(item.title)}</span></div>`;
        heroPanel.classList.add('visible');
      }
    },200);
  }

  function show(n, userAction=false){
    if(!visibleItems.length){
      heroCopy.innerHTML='<span class="callout">CCN</span><h1>NO CONTENT <span class="accent">SELECTED</span></h1><p class="synopsis">Open the Content Studio and turn on at least one section.</p>';
      rail.innerHTML='';
      return;
    }
    index = (n + visibleItems.length) % visibleItems.length;
    const item = visibleItems[index];
    app.dataset.item = item.id.startsWith('announcement-') ? 'announcement' : (item.id.startsWith('spotlight-') ? 'spotlight' : item.id);
    renderHero(item);
    renderRail();
    requestAnimationFrame(()=>requestAnimationFrame(()=>centerActive(userAction?'smooth':'auto')));
    document.getElementById('footerMessage').textContent = `${item.tag} • ${item.title}`;
    clearTimeout(timer);
    if(!paused) timer=setTimeout(()=>show(index+1),seconds*1000);
  }

  function togglePause(){ paused=!paused; pausedBadge.hidden=!paused; show(index); }
  function full(){ if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
  function setFilter(group, button){
    document.querySelectorAll('.nav-pill').forEach(x=>x.classList.remove('active'));
    button.classList.add('active');
    visibleItems = group==='all' ? [...items] : items.filter(x=>x.group===group);
    rowTitle.textContent = group==='all' ? (C.settings.lineupTitle || 'Today’s Lineup') : button.textContent;
    index=0; show(0,true);
  }

  document.querySelectorAll('.nav-pill').forEach(btn=>{
    const group=btn.dataset.filter;
    if(group!=='all' && !items.some(x=>x.group===group)) btn.hidden=true;
    btn.addEventListener('click',()=>setFilter(group,btn));
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight') show(index+1,true);
    if(e.key==='ArrowLeft') show(index-1,true);
    if(e.code==='Space'){e.preventDefault();togglePause();}
    if(e.key.toLowerCase()==='f') full();
    if(e.key.toLowerCase()==='e') location.href='editor.html';
  });
  document.addEventListener('dblclick',full);
  window.addEventListener('resize',()=>centerActive('auto'));

  function tick(){
    const now=new Date();
    document.getElementById('clock').textContent=now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    document.getElementById('date').textContent=now.toLocaleDateString([], {weekday:'short',month:'short',day:'numeric'}).toUpperCase();
  }
  tick(); setInterval(tick,1000);
  renderRail(); show(0);
})();
