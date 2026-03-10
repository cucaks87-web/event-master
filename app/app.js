const STORE_KEY = 'hall-booking-v29';
const halls = ['VIP', 'Restoran', 'Master sala'];
const defaultProfiles = [
  { name:'Safet', role:'user', can_create_suggestion:true, can_view_financials:false, can_view_activity_feed:false },
  { name:'Goran', role:'user', can_create_suggestion:true, can_view_financials:false, can_view_activity_feed:false },
  { name:'Šišić', role:'user', can_create_suggestion:true, can_view_financials:false, can_view_activity_feed:false },
  { name:'Dušan', role:'user', can_create_suggestion:true, can_view_financials:false, can_view_activity_feed:false },
  { name:'Tamara', role:'user', can_create_suggestion:true, can_view_financials:false, can_view_activity_feed:false },
  { name:'Dejan', role:'admin', can_create_suggestion:true, can_view_financials:true, can_view_activity_feed:true },
  { name:'Saša', role:'super_admin', can_create_suggestion:true, can_view_financials:true, can_view_activity_feed:true },
];
const defaultSettings = { allowMultipleEventsPerDay:false, showWeekendQuickView:true };
const seedReservations = [
  {id:id(), hall:'VIP', date:addDays(new Date(), 5), start:'18:00', end:'23:00', type:'Rođendan', client:'Marko J.', phone:'060123456', guests:60, price:800, deposit:200, paid:200, note:'DJ i dekoracija', status:'potvrđeno depozitom', createdBy:'Dejan', updatedBy:'Dejan'},
  {id:id(), hall:'Restoran', date:addDays(new Date(), 5), start:'19:00', end:'23:30', type:'Svadba', client:'Ana i Milan', phone:'061222333', guests:120, price:2500, deposit:500, paid:500, note:'Bina + torta', status:'potvrđeno depozitom', createdBy:'Dejan', updatedBy:'Dejan'},
  {id:id(), hall:'Master sala', date:addDays(new Date(), 12), start:'20:00', end:'02:00', type:'Proslava firme', client:'Nova doo', phone:'062888777', guests:90, price:1400, deposit:400, paid:1000, note:'Projektor', status:'rezervisano', createdBy:'Saša', updatedBy:'Saša'}
].map(r=>({...r, date:ymd(r.date)}));

let state = loadState();
let currentUser = state.currentUser || null;
let view = state.view || 'calendar';
let visibleDate = new Date(state.visibleDate || new Date());
let selectedDate = state.selectedDate || ymd(new Date());
let hallFilter = state.hallFilter || 'Sve sale';
let toast = null;

function id(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function ymd(d){ const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; }
function parseYMD(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function fmtDate(s){ return parseYMD(s).toLocaleDateString('sr-RS',{day:'2-digit',month:'long',year:'numeric'}); }
function monthTitle(d){ return d.toLocaleDateString('sr-RS',{month:'long',year:'numeric'}); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function diffMin(a,b){ const [ah,am]=a.split(':').map(Number); const [bh,bm]=b.split(':').map(Number); return (bh*60+bm)-(ah*60+am); }
function overlap(a1,a2,b1,b2){ return !(a2<=b1 || b2<=a1); }
function save(){ state.currentUser=currentUser; state.view=view; state.visibleDate=visibleDate.toISOString(); state.selectedDate=selectedDate; state.hallFilter=hallFilter; localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function loadState(){ const raw=localStorage.getItem(STORE_KEY); if(raw){ try{return JSON.parse(raw);}catch{} }
  return {
    profiles: defaultProfiles,
    settings: defaultSettings,
    reservations: seedReservations,
    activity: [{id:id(), when:new Date().toISOString(), by:'Sistem', action:'Inicijalni demo podaci učitani'}],
    notifications: [],
  };
}
function userObj(){ return state.profiles.find(p=>p.name===currentUser) || null; }
function isAdmin(){ return ['admin','super_admin'].includes(userObj()?.role); }
function isSuper(){ return userObj()?.role==='super_admin'; }
function canCreateSuggestion(){ return !!userObj()?.can_create_suggestion || isAdmin(); }
function canViewFinancials(){ return !!userObj()?.can_view_financials || isAdmin(); }
function canViewActivity(){ return !!userObj()?.can_view_activity_feed || isSuper(); }
function notify(msg,type='ok'){ toast={msg,type}; render(); setTimeout(()=>{toast=null; render();},3000); }
function addActivity(by,action){ state.activity.unshift({id:id(),when:new Date().toISOString(),by,action}); }
function pushNotifications(msg){ defaultProfiles.forEach(p=>{}); state.notifications.unshift({id:id(), when:new Date().toISOString(), msg}); }
function sameDayHallConflict(entry, ignoreId=null){
  const same = state.reservations.filter(r => r.id!==ignoreId && r.date===entry.date && r.hall===entry.hall && r.status!=='otkazano');
  if(!same.length) return false;
  if(!state.settings.allowMultipleEventsPerDay) return true;
  return same.some(r => overlap(r.start, r.end, entry.start, entry.end));
}
function statusColor(items){
  if(!items.length) return 'free';
  if(items.some(i=>i.status==='čeka potvrdu' || i.status==='upit')) return 'pending';
  return 'busy';
}
function hallStatus(date,hall){
  const items = state.reservations.filter(r=>r.date===date && r.hall===hall && r.status!=='otkazano');
  return statusColor(items);
}
function reservationsForDate(date){
  return state.reservations.filter(r => r.date===date && (hallFilter==='Sve sale' || r.hall===hallFilter)).sort((a,b)=>a.hall.localeCompare(b.hall,'sr') || a.start.localeCompare(b.start));
}
function render(){
  save();
  const root = document.getElementById('app');
  if(!currentUser){ root.innerHTML = loginView(); bindLogin(); return; }
  root.innerHTML = appView();
  bindApp();
}
function loginView(){
  return `<div class="login"><div class="card"><div class="title">Hall Booking v2.9</div><p class="subtitle">Demo verzija sa lokalnim podacima. Izaberi korisnika da nastaviš.</p>
    <div class="row" style="margin-top:16px"><label>Korisnik<select id="loginUser">${state.profiles.map(p=>`<option value="${p.name}">${p.name} — ${roleLabel(p.role)}</option>`).join('')}</select></label></div>
    <div class="row"><button class="primary" id="loginBtn">Uđi u aplikaciju</button></div>
    <p class="footer-note">Uloge: korisnik, admin (Dejan), super admin (Saša).</p>
  </div></div>`;
}
function roleLabel(role){ return role==='super_admin' ? 'Super admin' : role==='admin' ? 'Admin' : 'Korisnik'; }
function appView(){
  const u = userObj();
  const mobileUser = u.role==='user';
  const sections = [
    {key:'calendar', label:'Kalendar'},
    ...(isAdmin()?[{key:'manage',label:'Rezervacije'}]:[]),
    ...(canViewActivity()?[{key:'activity',label:'Izmene'}]:[]),
    ...(isSuper()?[{key:'users',label:'Korisnici i prava'},{key:'settings',label:'Podešavanja'}]:[]),
  ];
  const currentSection = sections.some(s=>s.key===view)?view:'calendar';
  view=currentSection;
  return `<div class="app-shell">
    <aside class="sidebar ${mobileUser?'hidden':''}">
      <div>
        <div class="brand">Hall Booking</div>
        <div class="small">Prijavljen: ${u.name} · ${roleLabel(u.role)}</div>
      </div>
      <div class="panel">
        <button id="logoutBtn">Odjava</button>
      </div>
      <nav>
        ${sections.map(s=>`<button class="${view===s.key?'active':''}" data-nav="${s.key}">${s.label}</button>`).join('')}
      </nav>
      <div class="panel">
        <div class="small">Notifikacije</div>
        <div class="list">${state.notifications.slice(0,5).map(n=>`<div class="small">• ${n.msg}</div>`).join('') || '<div class="small">Nema novih obaveštenja.</div>'}</div>
      </div>
      <div class="panel">
        <div class="small">Prava korisnika</div>
        <div class="small">Predlog događaja: ${canCreateSuggestion()?'da':'ne'}</div>
        <div class="small">Finansije: ${canViewFinancials()?'da':'ne'}</div>
        <div class="small">Pregled izmena: ${canViewActivity()?'da':'ne'}</div>
      </div>
    </aside>
    <main class="main">
      ${toast?`<div class="notice ${toast.type==='ok'?'ok':toast.type==='err'?'err':'info'}">${toast.msg}</div>`:''}
      ${view==='calendar'?calendarSection(mobileUser):''}
      ${view==='manage'?manageSection():''}
      ${view==='activity'?activitySection():''}
      ${view==='users'?usersSection():''}
      ${view==='settings'?settingsSection():''}
    </main>
  </div>`;
}
function calendarSection(mobileUser){
  const dayReservations = reservationsForDate(selectedDate);
  const today = new Date();
  const freeWeekend = nextFreeWeekends();
  const popular = popularTermDays();
  return `
    <div class="topbar">
      <div>
        <div class="title">Kalendar</div>
        <div class="subtitle">Jedan kalendar sa više rezervacija po salama u istom danu.</div>
      </div>
      <div class="toolbar">
        ${mobileUser?`<button id="openMenuInfo">${userObj().name}</button>`:''}
        <button id="todayBtn">Danas</button>
        <select id="hallFilter">${['Sve sale',...halls].map(h=>`<option ${hallFilter===h?'selected':''}>${h}</option>`).join('')}</select>
      </div>
    </div>
    <div class="grid">
      <div class="card calendar-wrap">
        <div class="calendar-header">
          <button id="prevMonth">◀</button>
          <button id="nextMonth">▶</button>
          <div class="calendar-title">${monthTitle(visibleDate)}</div>
          <select id="monthSelect">${Array.from({length:12},(_,i)=>new Date(2026,i,1)).map((d,i)=>`<option value="${i}" ${visibleDate.getMonth()===i?'selected':''}>${d.toLocaleDateString('sr-RS',{month:'long'})}</option>`).join('')}</select>
          <select id="yearSelect">${Array.from({length:7},(_,i)=>today.getFullYear()-1+i).map(y=>`<option value="${y}" ${visibleDate.getFullYear()===y?'selected':''}>${y}</option>`).join('')}</select>
          <input id="goToDate" type="date" value="${selectedDate}" />
          ${canCreateSuggestion() ? `<button class="primary" id="openSuggest">+ ${isAdmin()?'Dodaj događaj':'Predloži događaj'}</button>`:''}
        </div>
        <div class="legend">
          <span><span class="dot free"></span> slobodno</span>
          <span><span class="dot busy"></span> zauzeto</span>
          <span><span class="dot pending"></span> čeka potvrdu</span>
        </div>
        ${renderCalendarGrid()}
      </div>
      <div class="side-stack">
        <div class="card pad">
          <div class="section-title">${fmtDate(selectedDate)}</div>
          <div class="list">${halls.filter(h=>hallFilter==='Sve sale'||hallFilter===h).map(h=>dayHallBlock(selectedDate,h)).join('')}</div>
        </div>
        <div class="card pad">
          <div class="section-title">Brzi vikend pregled</div>
          <div class="list">${freeWeekend.map(x=>`<div class="list-item"><h4>${x.hall}</h4><div class="meta"><span>${fmtDate(x.date)}</span><span>${x.label}</span></div></div>`).join('') || '<div class="small">Nema slobodnih vikenda u narednih 90 dana.</div>'}</div>
        </div>
        <div class="card pad">
          <div class="section-title">Najtraženiji termini</div>
          <div class="list">${popular.map(x=>`<div class="list-item"><h4>${x.label}</h4><div class="meta"><span>${x.count} rezervacija</span></div></div>`).join('')}</div>
        </div>
      </div>
    </div>
    ${canCreateSuggestion()?entryModalSkeleton():''}
  `;
}
function renderCalendarGrid(){
  const start = new Date(visibleDate.getFullYear(), visibleDate.getMonth(),1);
  const end = new Date(visibleDate.getFullYear(), visibleDate.getMonth()+1,0);
  const offset = (start.getDay()+6)%7;
  const startCell = addDays(start,-offset);
  let html = `<div class="calendar-grid">${['Pon','Uto','Sre','Čet','Pet','Sub','Ned'].map(d=>`<div class="weekday">${d}</div>`).join('')}`;
  for(let i=0;i<42;i++){
    const d = addDays(startCell,i);
    const ds = ymd(d);
    const other = d.getMonth()!==visibleDate.getMonth();
    const today = ds===ymd(new Date());
    const hallsVisible = halls.filter(h=>hallFilter==='Sve sale'||hallFilter===h);
    html += `<div class="day ${other?'other':''} ${today?'today':''}" data-date="${ds}">
      <div class="day-top"><div class="day-num">${d.getDate()}</div>${ds===selectedDate?'<span class="badge">izabrano</span>':''}</div>
      ${hallsVisible.map(h=>`<div class="hall-line"><span>${shortHall(h)}</span><span class="dot ${hallStatus(ds,h)}"></span></div>`).join('')}
    </div>`;
  }
  html += `</div>`;
  return html;
}
function shortHall(h){ return h==='Master sala' ? 'Master' : h; }
function dayHallBlock(date,hall){
  const items = state.reservations.filter(r=>r.date===date && r.hall===hall && r.status!=='otkazano').sort((a,b)=>a.start.localeCompare(b.start));
  if(!items.length) return `<div class="list-item"><h4>${hall}</h4><div class="meta"><span>Slobodno</span></div></div>`;
  return `<div class="list-item"><h4>${hall}</h4>${items.map(r=>`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line)">
      <div class="meta"><span>${r.start}–${r.end}</span><span>${r.type}</span><span class="chip">${r.status}</span></div>
      ${isAdmin()?`<div class="meta"><span>${r.client}</span><span>${r.phone||''}</span>${canViewFinancials()?`<span>Depozit: ${r.deposit||0}</span><span>Plaćeno: ${r.paid||0}</span>`:''}</div>
      <div class="meta"><span>${r.note||''}</span></div>`:''}
    </div>`).join('')}</div>`;
}
function entryModalSkeleton(){
  return `<dialog id="entryDialog" class="card" style="border:none;max-width:760px;width:calc(100vw - 24px);padding:0">
    <form method="dialog" id="entryFormWrap" class="pad">
      <div class="section-title">${isAdmin()?'Novi događaj':'Predlog događaja'}</div>
      <div class="row">
        <label>Sala<select name="hall">${halls.map(h=>`<option>${h}</option>`).join('')}</select></label>
        <label>Datum<input name="date" type="date" value="${selectedDate}" required></label>
      </div>
      <div class="row">
        <label>Početak<input name="start" type="time" value="18:00" required></label>
        <label>Kraj<input name="end" type="time" value="23:00" required></label>
        <label>Vrsta događaja<input name="type" placeholder="Rođendan" required></label>
      </div>
      <div class="row">
        <label>Klijent<input name="client" placeholder="Ime klijenta"></label>
        <label>Telefon<input name="phone" placeholder="06x..."></label>
        <label>Broj gostiju<input name="guests" type="number" min="0" value="0"></label>
      </div>
      ${isAdmin()?`<div class="row">
        <label>Cena<input name="price" type="number" min="0" value="0"></label>
        <label>Depozit<input name="deposit" type="number" min="0" value="0"></label>
        <label>Plaćeno<input name="paid" type="number" min="0" value="0"></label>
      </div>
      <div class="row"><label>Status<select name="status">${['upit','čeka potvrdu','rezervisano','potvrđeno depozitom','potpuno plaćeno','realizovano','otkazano'].map(s=>`<option>${s}</option>`).join('')}</select></label></div>`:''}
      <div class="row"><label>Napomena<textarea name="note" placeholder="Napomena"></textarea></label></div>
      <div class="row"><button value="cancel">Otkaži</button><button class="primary" id="saveEntryBtn" value="default">Sačuvaj</button></div>
    </form>
  </dialog>`;
}
function manageSection(){
  const items = state.reservations.filter(r=>hallFilter==='Sve sale'||r.hall===hallFilter).sort((a,b)=>b.date.localeCompare(a.date)||a.start.localeCompare(b.start));
  return `
  <div class="topbar"><div><div class="title">Rezervacije</div><div class="subtitle">Admin i super admin uređuju događaje. Prevuci karticu na drugi datum u kalendaru.</div></div><div class="toolbar"><button class="primary" id="openSuggest">+ Dodaj događaj</button></div></div>
  <div class="grid">
    <div class="card pad">
      <div class="section-title">Lista rezervacija</div>
      <div class="list">${items.map(r=>`<div class="list-item" draggable="true" data-drag-id="${r.id}"><div class="row"><div><h4>${r.type} · ${r.hall}</h4><div class="meta"><span>${fmtDate(r.date)}</span><span>${r.start}–${r.end}</span><span>${r.client}</span><span class="chip">${r.status}</span></div><div class="meta"><span>Depozit: ${r.deposit||0}</span><span>Plaćeno: ${r.paid||0}</span></div></div><div style="display:flex;gap:8px;align-items:flex-start;flex-direction:column"><span class="drag-handle">Prevuci na datum</span><button data-edit="${r.id}">Izmeni</button><button class="danger" data-del="${r.id}">Obriši</button></div></div></div>`).join('')}</div>
    </div>
    <div class="card calendar-wrap">
      <div class="section-title" style="padding:8px">Drop zona kalendara</div>
      ${renderCalendarGrid()}
    </div>
  </div>
  ${entryModalSkeleton()}`;
}
function activitySection(){
  return `<div class="card pad"><div class="title">Istorija izmena</div><table class="table"><thead><tr><th>Vreme</th><th>Korisnik</th><th>Akcija</th></tr></thead><tbody>${state.activity.map(a=>`<tr><td>${new Date(a.when).toLocaleString('sr-RS')}</td><td>${a.by}</td><td>${a.action}</td></tr>`).join('')}</tbody></table></div>`;
}
function usersSection(){
  return `<div class="card pad"><div class="title">Korisnici i prava</div><table class="table"><thead><tr><th>Ime</th><th>Uloga</th><th>Predlog događaja</th><th>Finansije</th><th>Pregled izmena</th></tr></thead><tbody>${state.profiles.map((p,i)=>`<tr><td>${p.name}</td><td><select data-user-role="${p.name}">${['user','admin','super_admin'].map(r=>`<option value="${r}" ${p.role===r?'selected':''}>${roleLabel(r)}</option>`).join('')}</select></td><td><input type="checkbox" data-user-flag="can_create_suggestion" data-user-name="${p.name}" ${p.can_create_suggestion?'checked':''}></td><td><input type="checkbox" data-user-flag="can_view_financials" data-user-name="${p.name}" ${p.can_view_financials?'checked':''}></td><td><input type="checkbox" data-user-flag="can_view_activity_feed" data-user-name="${p.name}" ${p.can_view_activity_feed?'checked':''}></td></tr>`).join('')}</tbody></table><p class="footer-note">Super admin upravlja pravima za svakog korisnika.</p></div>`;
}
function settingsSection(){
  return `<div class="card pad"><div class="title">Podešavanja</div><div class="list">
    <div class="list-item"><div class="row"><div><h4>Više događaja istog dana po sali</h4><div class="small">Po defaultu isključeno. Kada je uključeno, dozvoljeni su različiti termini u istom danu.</div></div><div><input id="multiToggle" type="checkbox" ${state.settings.allowMultipleEventsPerDay?'checked':''}></div></div></div>
    <div class="list-item"><div class="row"><div><h4>Brzi vikend pregled</h4></div><div><input id="weekendToggle" type="checkbox" ${state.settings.showWeekendQuickView?'checked':''}></div></div></div>
  </div></div>`;
}
function bindLogin(){
  document.getElementById('loginBtn').onclick = ()=>{ currentUser = document.getElementById('loginUser').value; addActivity(currentUser,'Prijava u aplikaciju'); render(); };
}
function bindApp(){
  document.getElementById('logoutBtn')?.addEventListener('click',()=>{ addActivity(currentUser,'Odjava iz aplikacije'); currentUser=null; render(); });
  document.querySelectorAll('[data-nav]').forEach(btn=>btn.onclick=()=>{view=btn.dataset.nav; render();});
  document.getElementById('prevMonth')?.addEventListener('click',()=>{ visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth()-1, 1); render(); });
  document.getElementById('nextMonth')?.addEventListener('click',()=>{ visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth()+1, 1); render(); });
  document.getElementById('todayBtn')?.addEventListener('click',()=>{ visibleDate = new Date(); selectedDate = ymd(new Date()); render(); });
  document.getElementById('monthSelect')?.addEventListener('change',(e)=>{ visibleDate = new Date(visibleDate.getFullYear(), Number(e.target.value),1); render(); });
  document.getElementById('yearSelect')?.addEventListener('change',(e)=>{ visibleDate = new Date(Number(e.target.value), visibleDate.getMonth(),1); render(); });
  document.getElementById('goToDate')?.addEventListener('change',(e)=>{ if(!e.target.value) return; selectedDate=e.target.value; visibleDate=parseYMD(e.target.value); render(); });
  document.getElementById('hallFilter')?.addEventListener('change',(e)=>{ hallFilter=e.target.value; render(); });
  document.querySelectorAll('.day').forEach(el=>{
    el.addEventListener('click',()=>{ selectedDate=el.dataset.date; render(); });
    if(isAdmin()){
      el.addEventListener('dragover',(e)=>{ e.preventDefault(); el.classList.add('drop-target'); });
      el.addEventListener('dragleave',()=>el.classList.remove('drop-target'));
      el.addEventListener('drop',(e)=>{ e.preventDefault(); el.classList.remove('drop-target'); const idd=e.dataTransfer.getData('text/plain'); moveReservationDate(idd, el.dataset.date); });
    }
  });
  document.querySelectorAll('[draggable="true"]').forEach(el=>el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain', el.dataset.dragId)));
  document.getElementById('openSuggest')?.addEventListener('click',()=>document.getElementById('entryDialog').showModal());
  document.getElementById('saveEntryBtn')?.addEventListener('click',(e)=>{ e.preventDefault(); saveEntry(); });
  document.querySelectorAll('[data-del]').forEach(btn=>btn.onclick=()=>deleteReservation(btn.dataset.del));
  document.querySelectorAll('[data-edit]').forEach(btn=>btn.onclick=()=>openEdit(btn.dataset.edit));
  document.querySelectorAll('[data-user-role]').forEach(el=>el.onchange=()=>updateUserRole(el));
  document.querySelectorAll('[data-user-flag]').forEach(el=>el.onchange=()=>updateUserFlag(el));
  document.getElementById('multiToggle')?.addEventListener('change',(e)=>{ state.settings.allowMultipleEventsPerDay=e.target.checked; addActivity(currentUser,`Promenio opciju više događaja po danu: ${e.target.checked?'uključeno':'isključeno'}`); notify('Podešavanje je sačuvano.','ok'); render(); });
  document.getElementById('weekendToggle')?.addEventListener('change',(e)=>{ state.settings.showWeekendQuickView=e.target.checked; addActivity(currentUser,`Promenio opciju vikend pregleda`); notify('Podešavanje je sačuvano.','ok'); render(); });
}
function saveEntry(editId=null){
  const form = document.querySelector('#entryFormWrap');
  const fd = new FormData(form);
  const entry = {
    id: editId || id(),
    hall: fd.get('hall'), date: fd.get('date'), start: fd.get('start'), end: fd.get('end'), type: fd.get('type'), client: fd.get('client'), phone: fd.get('phone'), guests: Number(fd.get('guests')||0), price: Number(fd.get('price')||0), deposit: Number(fd.get('deposit')||0), paid: Number(fd.get('paid')||0), note: fd.get('note'), status: isAdmin() ? fd.get('status') : 'čeka potvrdu', createdBy: editId?undefined:currentUser, updatedBy: currentUser,
  };
  if(diffMin(entry.start, entry.end)<=0){ notify('Kraj termina mora biti posle početka.','err'); return; }
  if(sameDayHallConflict(entry, editId)){ notify('Rezervacija već postoji za izabranu salu i termin.','err'); pushNotifications('Rezervacija već postoji za izabranu salu i termin.'); return; }
  if(editId){
    const idx = state.reservations.findIndex(r=>r.id===editId); state.reservations[idx] = {...state.reservations[idx], ...entry}; addActivity(currentUser,`Izmenio događaj za ${entry.date} · ${entry.hall}`); pushNotifications(`${currentUser} je izmenio događaj za ${entry.date} (${entry.hall}).`); notify('Izmena je sačuvana.');
  } else {
    state.reservations.push(entry); addActivity(currentUser,`${isAdmin()?'Dodao događaj':'Dodao predlog događaja'} za ${entry.date} · ${entry.hall}`); pushNotifications(`${currentUser} je dodao ${isAdmin()?'događaj':'predlog'} za ${entry.date} (${entry.hall}).`); notify(`Uspešno ste uneli ${isAdmin()?'događaj':'predlog rezervacije'}.`,'ok');
  }
  document.getElementById('entryDialog')?.close();
  render();
}
function deleteReservation(rid){ if(!confirm('Obrisati događaj?')) return; const r = state.reservations.find(x=>x.id===rid); state.reservations = state.reservations.filter(r=>r.id!==rid); addActivity(currentUser,`Obrisao događaj za ${r.date} · ${r.hall}`); pushNotifications(`${currentUser} je obrisao događaj za ${r.date} (${r.hall}).`); notify('Događaj je obrisan.'); render(); }
function openEdit(rid){ const r=state.reservations.find(x=>x.id===rid); document.getElementById('entryDialog').showModal(); const f=document.querySelector('#entryFormWrap'); for(const k of ['hall','date','start','end','type','client','phone','guests','price','deposit','paid','status','note']) if(f.elements[k]) f.elements[k].value=r[k]??''; const btn=document.getElementById('saveEntryBtn'); btn.onclick=(e)=>{e.preventDefault(); saveEntry(rid);}; }
function updateUserRole(el){ const p=state.profiles.find(x=>x.name===el.dataset.userRole); p.role=el.value; addActivity(currentUser,`Promenio ulogu korisnika ${p.name}`); pushNotifications(`Promenjena uloga korisnika ${p.name}.`); notify('Uloga je sačuvana.'); render(); }
function updateUserFlag(el){ const p=state.profiles.find(x=>x.name===el.dataset.userName); p[el.dataset.userFlag]=el.checked; addActivity(currentUser,`Promenio pravo ${el.dataset.userFlag} za ${p.name}`); pushNotifications(`Promenjena prava za ${p.name}.`); notify('Pravo je sačuvano.'); render(); }
function moveReservationDate(rid,newDate){ const r=state.reservations.find(x=>x.id===rid); if(!r) return; const probe={...r,date:newDate}; if(sameDayHallConflict(probe,rid)){ notify('Rezervacija već postoji za izabranu salu i termin.','err'); return; } r.date=newDate; r.updatedBy=currentUser; addActivity(currentUser,`Premestio događaj na ${newDate} · ${r.hall}`); pushNotifications(`${currentUser} je premestio događaj na ${newDate} (${r.hall}).`); selectedDate=newDate; visibleDate=parseYMD(newDate); notify('Događaj je premešten.'); render(); }
function nextFreeWeekends(){ if(!state.settings.showWeekendQuickView) return []; const result=[]; for(const hall of halls){ for(let i=0;i<90;i++){ const d=addDays(new Date(),i); const dow=d.getDay(); if([5,6,0].includes(dow)){ const ds=ymd(d); const busy=state.reservations.some(r=>r.hall===hall && r.date===ds && r.status!=='otkazano'); if(!busy){ result.push({hall,date:ds,label:d.toLocaleDateString('sr-RS',{weekday:'long'})}); break; } } } }
  return result;
}
function popularTermDays(){ const map={Petak:0,Subota:0,Nedelja:0}; state.reservations.forEach(r=>{ const d=parseYMD(r.date).getDay(); if(d===5) map.Petak++; if(d===6) map.Subota++; if(d===0) map.Nedelja++; }); return Object.entries(map).map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count); }
render();
