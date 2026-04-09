// hire.js – Worker directory page (Supabase)

const ALL_WORKERS_STATIC = [
  { id:1, name:'Rajesh Sharma', initial:'R', trade:'Electrician', skills:['Wiring','Solar','CCTV','Panel Work'], city:'Delhi', rating:4.9, reviews:127, jobs:312, rate:800, rateLabel:'₹800/hr', experience:'10+ yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#f97316,#ea580c)', phone:'+91 98100 12345', about:'Expert electrician with 10+ years of experience.' },
  { id:2, name:'Suresh Patel',  initial:'S', trade:'Plumber',     skills:['Pipe Fitting','Drainage','Gas Lines'], city:'Mumbai', rating:4.8, reviews:98,  jobs:245, rate:700, rateLabel:'₹700/hr', experience:'7 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#3b82f6,#2563eb)', phone:'+91 90220 67890', about:'Reliable plumber known for fast, clean work.' },
  { id:3, name:'Arjun Singh',   initial:'A', trade:'Carpenter',   skills:['Furniture','Flooring','Cabinets'],     city:'Bengaluru', rating:4.7, reviews:74, jobs:189, rate:650, rateLabel:'₹650/hr', experience:'5 yrs', available:false, verified:true, gradient:'linear-gradient(135deg,#10b981,#059669)', phone:'+91 98440 23456', about:'Skilled carpenter in custom furniture.' },
  { id:4, name:'Mohan Das',     initial:'M', trade:'Welder',      skills:['MIG','TIG','Arc Welding'],             city:'Chennai', rating:4.9, reviews:152, jobs:420, rate:900, rateLabel:'₹900/hr', experience:'12 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#f87171,#ef4444)', phone:'+91 94440 34567', about:'Master welder with 12 years of experience.' },
  { id:5, name:'Karthik Rajan', initial:'K', trade:'Painter',     skills:['Interior','Exterior','Texture'],       city:'Hyderabad', rating:4.6, reviews:63, jobs:178, rate:500, rateLabel:'₹500/hr', experience:'4 yrs', available:true, verified:false, gradient:'linear-gradient(135deg,#a78bfa,#7c3aed)', phone:'+91 98490 45678', about:'Creative painter with an eye for detail.' },
  { id:6, name:'Vinod Mehta',   initial:'V', trade:'Mason',       skills:['Brickwork','Plastering','Tiling'],     city:'Pune', rating:4.8, reviews:89, jobs:267, rate:600, rateLabel:'₹600/hr', experience:'8 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#fb923c,#ea580c)', phone:'+91 99220 56789', about:'Experienced mason and builder.' },
];

const GRADIENTS = [
  'linear-gradient(135deg,#f97316,#ea580c)','linear-gradient(135deg,#38bdf8,#0ea5e9)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)','linear-gradient(135deg,#34d399,#10b981)',
  'linear-gradient(135deg,#fb923c,#ea580c)','linear-gradient(135deg,#f87171,#ef4444)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)','linear-gradient(135deg,#67e8f9,#06b6d4)',
];

let workerDisplayed  = 6;
let filteredWorkers  = [];
let ALL_WORKERS_MERGED = [];
let WORKER_INDEX     = {};

/* ── Build worker list from Supabase + static fallback ── */
async function buildWorkerList() {
  let dbWorkers = [];
  try {
    dbWorkers = await sbGetWorkers();
  } catch(e) { console.warn('Could not load workers from Supabase, using static data.', e); }

  const registeredWorkers = dbWorkers.map((u, i) => {
    const reviews   = u.worker_reviews || [];
    const avgRating = reviews.length
      ? parseFloat((reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : 0;
    const skills = Array.isArray(u.skills) ? u.skills : (u.trade ? [u.trade] : ['General Labour']);
    return {
      id:          u.id,
      name:        u.name        || 'Worker',
      initial:     (u.name||'W')[0].toUpperCase(),
      trade:       u.trade       || 'General Labour',
      skills,
      city:        u.city        || 'India',
      rating:      avgRating,
      reviews:     reviews.length,
      jobs:        0,
      rate:        0,
      rateLabel:   u.rate        || 'Negotiable',
      experience:  u.experience  || 'Fresher',
      available:   u.available   !== false,
      verified:    u.verified    || false,
      gradient:    GRADIENTS[i % GRADIENTS.length],
      phone:       u.phone       || 'Contact via platform',
      about:       u.bio         || `${u.name||'Worker'} is a skilled ${u.trade||'professional'} based in ${u.city||'India'}.`,
      isRegistered:true,
      email:       u.email,
      avatar:      u.avatar,
    };
  });

  ALL_WORKERS_MERGED = [...registeredWorkers, ...ALL_WORKERS_STATIC];
  WORKER_INDEX = {};
  ALL_WORKERS_MERGED.forEach((w, i) => { WORKER_INDEX[i] = w; w._idx = i; });
}

/* ── Filter & Render ── */
function filterWorkers() {
  const q          = document.getElementById('workerSearch')?.value.toLowerCase() || '';
  const city       = document.getElementById('workerCityFilter')?.value || '';
  const trades     = [...document.querySelectorAll('.wf-trade:checked')].map(t => t.value);
  const avail      = document.querySelector('.wf-avail:checked')?.value || '';
  const minRating  = parseFloat(document.querySelector('.wf-rating:checked')?.value) || 0;
  const verifiedOnly = document.getElementById('verifiedOnly')?.checked;
  const sort       = document.getElementById('sortWorkers')?.value || 'rating';

  filteredWorkers = ALL_WORKERS_MERGED.filter(w => {
    const matchQ       = !q || w.name.toLowerCase().includes(q) || w.trade.toLowerCase().includes(q) || w.skills.some(s => s.toLowerCase().includes(q));
    const matchCity    = !city || w.city === city;
    const matchTrade   = trades.length === 0 || trades.includes(w.trade);
    const matchAvail   = !avail || (avail === 'Available' ? w.available : !w.available);
    const matchRating  = minRating === 0 || w.rating >= minRating;
    const matchVerified= !verifiedOnly || w.verified;
    return matchQ && matchCity && matchTrade && matchAvail && matchRating && matchVerified;
  });

  if (sort === 'jobs')     filteredWorkers.sort((a,b) => b.jobs - a.jobs);
  else if (sort === 'rate-low') filteredWorkers.sort((a,b) => a.rate - b.rate);
  else filteredWorkers.sort((a,b) => b.rating - a.rating);

  workerDisplayed = 6;
  renderWorkersList();
}

function renderWorkersList() {
  const grid  = document.getElementById('workersListGrid');
  const count = document.getElementById('workersCount');
  if (!grid) return;

  const visible = filteredWorkers.slice(0, workerDisplayed);
  if (count) count.textContent = `Showing ${visible.length} of ${filteredWorkers.length} workers`;

  if (filteredWorkers.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);grid-column:1/-1;"><div style="font-size:3rem;margin-bottom:16px;">👷</div><h3>No workers found</h3><p>Try adjusting your filters.</p></div>`;
    return;
  }

  grid.innerHTML = visible.map(w => {
    const idx = w._idx;
    const ratingDisplay = w.rating > 0
      ? `<span class="stars">${'★'.repeat(Math.floor(w.rating))}${w.rating%1?'☆':''}</span>
         <span class="rating-num">${w.rating}</span>
         <span class="review-count">(${w.reviews} reviews)</span>`
      : `<span style="font-size:0.8rem;color:var(--text-muted);">No reviews yet</span>`;

    const avatarHtml = w.avatar && w.avatar.startsWith('http')
      ? `<img src="${w.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
      : w.initial;
    const avatarBg = w.avatar && w.avatar.startsWith('http') ? 'transparent' : w.gradient;

    return `
    <div class="worker-profile-card" style="cursor:pointer;" onclick="viewWorkerProfile(${idx})">
      <div class="wpc-header">
        <div class="wpc-avatar" style="background:${avatarBg}">${avatarHtml}</div>
        <div class="wpc-info">
          <div class="wpc-name">${w.name}
            ${w.isRegistered ? '<span style="font-size:0.68rem;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);margin-left:6px;">✨ Registered</span>' : ''}
          </div>
          <div class="wpc-trade">${w.trade}</div>
          <div class="wpc-location">📍 ${w.city} · ${w.experience} exp</div>
        </div>
      </div>
      ${w.verified ? '<div class="wpc-verified">✓ Verified</div>' : ''}
      <div class="wpc-rating">
        ${ratingDisplay}
        <span class="badge ${w.available?'badge-success':'badge-warning'}" style="margin-left:auto;font-size:0.7rem;">${w.available?'🟢 Available':'🔴 On Job'}</span>
      </div>
      <div class="wpc-skills">${w.skills.slice(0,3).map(s=>`<span class="skill-chip">${s}</span>`).join('')}${w.skills.length>3?`<span class="skill-chip" style="background:rgba(255,255,255,0.05);">+${w.skills.length-3} more</span>`:''}</div>
      <div class="wpc-footer" onclick="event.stopPropagation()">
        <div>
          <div class="wpc-rate">${w.rateLabel}</div>
          <div class="wpc-jobs">${w.jobs} jobs done</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();viewWorkerProfile(${idx})">View Profile</button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();hireWorker(${idx})">Hire Now</button>
        </div>
      </div>
    </div>`;
  }).join('');

  const loadBtn = document.getElementById('loadMoreWorkersBtn');
  if (loadBtn) loadBtn.style.display = workerDisplayed >= filteredWorkers.length ? 'none' : 'inline-flex';
}

function loadMoreWorkers() { workerDisplayed += 6; renderWorkersList(); }

function clearWorkerFilters() {
  document.querySelectorAll('.wf-trade').forEach(el => el.checked = false);
  document.getElementById('workerSearch').value = '';
  document.getElementById('workerCityFilter').value = '';
  document.querySelector('.wf-avail[value=""]').checked = true;
  document.querySelector('.wf-rating[value=""]') && (document.querySelector('.wf-rating[value=""]').checked = true);
  document.getElementById('verifiedOnly').checked = false;
  filterWorkers();
}

/* ── View Profile Modal ── */
function viewWorkerProfile(idx) {
  const w = WORKER_INDEX[idx];
  if (!w) return;
  document.getElementById('workerProfileModal')?.remove();

  const avatarHtml = w.avatar && w.avatar.startsWith('http')
    ? `<img src="${w.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
    : w.initial;
  const avatarBg = w.avatar && w.avatar.startsWith('http') ? 'transparent' : 'rgba(255,255,255,0.25)';

  const modal = document.createElement('div');
  modal.id = 'workerProfileModal';
  modal.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);padding:20px;`;
  modal.innerHTML = `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;width:100%;max-width:540px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);animation:slideUp .3s ease;">
      <div style="background:${w.gradient};padding:32px 28px 20px;position:relative;">
        <button onclick="closeModal('workerProfileModal')" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;">✕</button>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:72px;height:72px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:#fff;">${avatarHtml}</div>
          <div>
            <div style="font-size:1.3rem;font-weight:700;color:#fff;">${w.name}</div>
            <div style="color:rgba(255,255,255,0.85);font-size:0.95rem;">🛠️ ${w.trade} · ${w.city}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
              ${w.verified ? '<span style="background:rgba(255,255,255,0.25);color:#fff;font-size:0.75rem;padding:2px 8px;border-radius:20px;">✓ Verified</span>' : ''}
              <span style="background:${w.available?'rgba(52,211,153,0.3)':'rgba(245,158,11,0.3)'};color:${w.available?'#34d399':'#fbbf24'};font-size:0.75rem;padding:2px 8px;border-radius:20px;">${w.available?'🟢 Available Now':'🔴 On Job'}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:24px 28px;max-height:60vh;overflow-y:auto;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;"><div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.rating||'—'}</div><div style="font-size:0.75rem;color:var(--text-muted,#888);">Rating</div></div>
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;"><div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.jobs}</div><div style="font-size:0.75rem;color:var(--text-muted,#888);">Jobs Done</div></div>
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;"><div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.experience}</div><div style="font-size:0.75rem;color:var(--text-muted,#888);">Experience</div></div>
        </div>
        <div style="margin-bottom:18px;"><div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);text-transform:uppercase;margin-bottom:8px;">About</div><p style="font-size:0.9rem;color:var(--text-secondary,#ccc);line-height:1.6;margin:0;">${w.about}</p></div>
        <div style="margin-bottom:18px;"><div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);text-transform:uppercase;margin-bottom:8px;">Skills</div><div style="display:flex;flex-wrap:wrap;gap:8px;">${w.skills.map(s=>`<span style="background:rgba(249,115,22,0.12);color:var(--primary,#f97316);font-size:0.8rem;padding:4px 12px;border-radius:20px;border:1px solid rgba(249,115,22,0.2);">${s}</span>`).join('')}</div></div>
        <div style="margin-bottom:18px;"><div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);text-transform:uppercase;margin-bottom:8px;">Contact</div>
          <div style="font-size:0.9rem;color:var(--text-secondary,#ccc);">📞 ${w.phone}</div>
          <div style="font-size:0.9rem;color:var(--text-secondary,#ccc);margin-top:6px;">📍 ${w.city}, India</div>
          <div style="font-size:0.9rem;color:var(--text-secondary,#ccc);margin-top:6px;">💰 ${w.rateLabel}</div>
        </div>
      </div>
      <div style="padding:16px 28px 24px;display:flex;gap:12px;border-top:1px solid var(--border,rgba(255,255,255,0.08));">
        <button data-hire="true" style="flex:1;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:10px;padding:12px;font-size:0.95rem;font-weight:600;cursor:pointer;">🤝 Hire ${w.name.split(' ')[0]}</button>
        <a href="tel:${w.phone.replace(/\s/g,'')}" style="flex:1;background:rgba(255,255,255,0.07);color:var(--text-primary,#fff);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:12px;font-size:0.95rem;font-weight:600;text-decoration:none;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">📞 Call Now</a>
      </div>
    </div>`;

  modal.querySelector('button[data-hire]')?.addEventListener('click', () => { closeModal('workerProfileModal'); hireWorker(idx); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModal('workerProfileModal'); });
  document.body.appendChild(modal);
}

/* ── Hire Modal ── */
function hireWorker(idx) {
  const user = getCurrentUser();
  const w    = WORKER_INDEX[idx];
  if (!w) return;

  if (!user) {
    showToast('Please sign in to send a hire request.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  document.getElementById('hireRequestModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'hireRequestModal';
  modal.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);padding:20px;`;
  modal.innerHTML = `
    <div style="background:var(--card-bg,#1a1a2e);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:20px;width:100%;max-width:480px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);animation:slideUp .3s ease;">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 28px;position:relative;">
        <button onclick="closeModal('hireRequestModal')" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;">✕</button>
        <div style="font-size:1.2rem;font-weight:700;color:#fff;">🤝 Send Hire Request</div>
        <div style="color:rgba(255,255,255,0.85);font-size:0.9rem;margin-top:4px;">to ${w.name} · ${w.trade}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="margin-bottom:16px;">
          <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Job Description *</label>
          <textarea id="hireJobDesc" placeholder="Describe the work needed…" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:12px;color:var(--text-primary,#fff);font-size:0.9rem;resize:vertical;min-height:90px;font-family:inherit;box-sizing:border-box;outline:none;"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div><label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Start Date</label>
            <input type="date" id="hireStartDate" min="${new Date().toISOString().split('T')[0]}" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;box-sizing:border-box;outline:none;font-family:inherit;"></div>
          <div><label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Budget</label>
            <input type="text" id="hireBudget" placeholder="e.g. ₹2,000" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;box-sizing:border-box;outline:none;font-family:inherit;"></div>
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Location / Jobsite</label>
          <input type="text" id="hireAddress" placeholder="e.g. Koramangala, Bengaluru" value="${user.city||''}" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;box-sizing:border-box;outline:none;font-family:inherit;">
        </div>
        <div style="display:flex;gap:12px;">
          <button data-submit="true" style="flex:1;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:10px;padding:13px;font-size:0.95rem;font-weight:600;cursor:pointer;">Send Request 🚀</button>
          <button onclick="closeModal('hireRequestModal')" style="background:rgba(255,255,255,0.07);color:var(--text-secondary,#ccc);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:13px 20px;font-size:0.95rem;font-weight:600;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>`;

  modal.querySelector('button[data-submit]')?.addEventListener('click', () => submitHireRequest(idx));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal('hireRequestModal'); });
  document.body.appendChild(modal);
}

async function submitHireRequest(idx) {
  const desc = document.getElementById('hireJobDesc')?.value.trim();
  if (!desc) { document.getElementById('hireJobDesc').style.borderColor = '#ef4444'; document.getElementById('hireJobDesc').focus(); return; }

  const user = getCurrentUser();
  if (!user) return;
  const w = WORKER_INDEX[idx];

  const btn = document.querySelector('#hireRequestModal button[data-submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    await sbSendHireRequest(user.id, {
      workerId:  w.id,
      desc,
      startDate: document.getElementById('hireStartDate')?.value || null,
      budget:    document.getElementById('hireBudget')?.value || null,
      address:   document.getElementById('hireAddress')?.value || null,
    });
    closeModal('hireRequestModal');
    showToast(`✅ Hire request sent to ${w.name}! View in Manage Hires.`, 'success');
    setTimeout(() => { if (confirm(`Request sent to ${w.name}!\n\nGo to "Manage Hires" to track status?`)) window.location.href = 'manage-hires.html'; }, 1200);
  } catch(err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Request 🚀'; }
    showToast('Failed to send request. Please try again.', 'error');
  }
}

/* ── Helpers ── */
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.opacity='0'; setTimeout(() => m.remove(), 200); }
}

if (!document.getElementById('hireModalStyles')) {
  const style = document.createElement('style');
  style.id = 'hireModalStyles';
  style.textContent = `@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Show loading state
  const grid = document.getElementById('workersListGrid');
  if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">⏳ Loading workers…</div>`;

  await buildWorkerList();
  filterWorkers();
});
