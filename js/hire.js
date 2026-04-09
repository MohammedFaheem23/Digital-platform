// hire.js – Worker directory page

const ALL_WORKERS = [
  { id:1, name:'Rajesh Sharma', initial:'R', trade:'Electrician', skills:['Wiring','Solar','CCTV','Panel Work','Home Wiring'], city:'Delhi', rating:4.9, reviews:127, jobs:312, rate:800, rateLabel:'₹800/hr', experience:'10+ yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#f97316,#ea580c)', phone:'+91 98100 12345', about:'Expert electrician with 10+ years of experience in residential and commercial electrical work. Specializes in solar panel installation, CCTV systems, and full home wiring.' },
  { id:2, name:'Suresh Patel', initial:'S', trade:'Plumber', skills:['Pipe Fitting','Drainage','Gas Lines','Tank Repair'], city:'Mumbai', rating:4.8, reviews:98, jobs:245, rate:700, rateLabel:'₹700/hr', experience:'7 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#3b82f6,#2563eb)', phone:'+91 90220 67890', about:'Reliable plumber known for fast, clean work. Handles everything from minor leaks to complete bathroom renovations. Available 24/7 for emergencies.' },
  { id:3, name:'Arjun Singh', initial:'A', trade:'Carpenter', skills:['Furniture','Flooring','Cabinets','Doors'], city:'Bengaluru', rating:4.7, reviews:74, jobs:189, rate:650, rateLabel:'₹650/hr', experience:'5 yrs', available:false, verified:true, gradient:'linear-gradient(135deg,#10b981,#059669)', phone:'+91 98440 23456', about:'Skilled carpenter specializing in custom furniture, modular kitchens, and interior woodwork. Uses quality materials with precise finishing.' },
  { id:4, name:'Mohan Das', initial:'M', trade:'Welder', skills:['MIG','TIG','Arc Welding','Fabrication'], city:'Chennai', rating:4.9, reviews:152, jobs:420, rate:900, rateLabel:'₹900/hr', experience:'12 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#f87171,#ef4444)', phone:'+91 94440 34567', about:'Master welder with certification in MIG, TIG, and Arc welding. 12 years of structural steel and fabrication experience across major infrastructure projects.' },
  { id:5, name:'Karthik Rajan', initial:'K', trade:'Painter', skills:['Interior','Exterior','Texture','Polishing','Waterproofing'], city:'Hyderabad', rating:4.6, reviews:63, jobs:178, rate:500, rateLabel:'₹500/hr', experience:'4 yrs', available:true, verified:false, gradient:'linear-gradient(135deg,#a78bfa,#7c3aed)', phone:'+91 98490 45678', about:'Creative painter with an eye for detail. Handles interior/exterior painting, decorative textures, and waterproofing. Eco-friendly paint options available.' },
  { id:6, name:'Vinod Mehta', initial:'V', trade:'Mason', skills:['Brickwork','Plastering','Tiling','RCC','Waterproofing'], city:'Pune', rating:4.8, reviews:89, jobs:267, rate:600, rateLabel:'₹600/hr', experience:'8 yrs', available:true, verified:true, gradient:'linear-gradient(135deg,#fb923c,#ea580c)', phone:'+91 99220 56789', about:'Experienced mason and builder with deep expertise in residential construction, plastering, and tile work. Known for strong structural quality.' },
  { id:7, name:'Deepak Yadav', initial:'D', trade:'Electrician', skills:['HT/LT Lines','Substation','Meter Work','Industrial Wiring'], city:'Delhi', rating:4.5, reviews:45, jobs:123, rate:750, rateLabel:'₹750/hr', experience:'5 yrs', available:false, verified:true, gradient:'linear-gradient(135deg,#fbbf24,#f59e0b)', phone:'+91 98100 67890', about:'Specialized in industrial and high-tension electrical work. Certified for HT/LT line maintenance and substation operations.' },
  { id:8, name:'Pradeep Kumar', initial:'P', trade:'Plumber', skills:['Bathroom Fitting','Kitchen','Drainage','Bore Well'], city:'Kolkata', rating:4.3, reviews:31, jobs:78, rate:550, rateLabel:'₹550/hr', experience:'3 yrs', available:true, verified:false, gradient:'linear-gradient(135deg,#67e8f9,#06b6d4)', phone:'+91 90330 78901', about:'Dependable plumber offering affordable and quality service for bathrooms, kitchens, and drainage systems across Kolkata.' },
];

let workerDisplayed = 6;
let filteredWorkers = [];
let ALL_WORKERS_MERGED = [];  // static + registered
let WORKER_INDEX = {};        // idx -> worker object for safe onclick passing

/* ── Merge registered workers from localStorage ── */
function buildWorkerList() {
  const GRADIENTS = [
    'linear-gradient(135deg,#f97316,#ea580c)',
    'linear-gradient(135deg,#38bdf8,#0ea5e9)',
    'linear-gradient(135deg,#a78bfa,#7c3aed)',
    'linear-gradient(135deg,#34d399,#10b981)',
    'linear-gradient(135deg,#fb923c,#ea580c)',
    'linear-gradient(135deg,#f87171,#ef4444)',
    'linear-gradient(135deg,#fbbf24,#f59e0b)',
    'linear-gradient(135deg,#67e8f9,#06b6d4)',
  ];

  const allUsers = JSON.parse(localStorage.getItem('sc_users') || '[]');
  const registeredWorkers = allUsers
    .filter(u => u.role === 'worker')
    .map((u, i) => {
      const availKey = `sc_availability_${u.email}`;
      const stored   = localStorage.getItem(availKey);
      const isAvail  = stored === null ? true : stored === 'true';

      const reviews  = JSON.parse(localStorage.getItem(`sc_worker_reviews_${u.email}`) || '[]');
      const avgRating = reviews.length
        ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : null;

      return {
        id:         'reg_' + u.email,
        name:       u.name   || 'Worker',
        initial:    (u.name || 'W')[0].toUpperCase(),
        trade:      u.trade  || 'General Labour',
        skills:     u.skills?.length ? u.skills : [u.trade || 'General Labour'],
        city:       u.city   || 'India',
        rating:     avgRating || 0,
        reviews:    reviews.length,
        jobs:       (u.applications || []).filter(a => a.status === 'selected').length,
        rate:       0,
        rateLabel:  u.expectedPay || 'Negotiable',
        experience: u.experience || 'Fresher',
        available:  isAvail,
        verified:   false,
        gradient:   GRADIENTS[i % GRADIENTS.length],
        phone:      u.phone  || 'Contact via platform',
        about:      u.bio    || `${u.name || 'Worker'} is a skilled ${u.trade || 'professional'} based in ${u.city || 'India'}.`,
        isRegistered: true,
        email:      u.email,
      };
    });

  // Registered workers first, then static demo workers
  ALL_WORKERS_MERGED = [...registeredWorkers, ...ALL_WORKERS];

  // Build index map (integer key) for safe use in onclick attributes
  WORKER_INDEX = {};
  ALL_WORKERS_MERGED.forEach((w, i) => { WORKER_INDEX[i] = w; w._idx = i; });
}


/* ===================== FILTER & RENDER ===================== */
function filterWorkers() {
  const q = document.getElementById('workerSearch')?.value.toLowerCase() || '';
  const city = document.getElementById('workerCityFilter')?.value || '';
  const trades = [...document.querySelectorAll('.wf-trade:checked')].map(t => t.value);
  const avail = document.querySelector('.wf-avail:checked')?.value || '';
  const minRating = parseFloat(document.querySelector('.wf-rating:checked')?.value) || 0;
  const verifiedOnly = document.getElementById('verifiedOnly')?.checked;
  const sort = document.getElementById('sortWorkers')?.value || 'rating';

  filteredWorkers = ALL_WORKERS_MERGED.filter(w => {
    const matchQ = !q || w.name.toLowerCase().includes(q) || w.trade.toLowerCase().includes(q) || w.skills.some(s => s.toLowerCase().includes(q));
    const matchCity = !city || w.city === city;
    const matchTrade = trades.length === 0 || trades.includes(w.trade);
    const matchAvail = !avail || (avail === 'Available' ? w.available : !w.available);
    const matchRating = w.rating >= minRating;
    const matchVerified = !verifiedOnly || w.verified;
    return matchQ && matchCity && matchTrade && matchAvail && matchRating && matchVerified;
  });

  if (sort === 'jobs') filteredWorkers.sort((a,b) => b.jobs - a.jobs);
  else if (sort === 'rate-low') filteredWorkers.sort((a,b) => a.rate - b.rate);
  else filteredWorkers.sort((a,b) => b.rating - a.rating);

  workerDisplayed = 6;
  renderWorkersList();
}

function renderWorkersList() {
  const grid = document.getElementById('workersListGrid');
  const count = document.getElementById('workersCount');
  if (!grid) return;

  const visible = filteredWorkers.slice(0, workerDisplayed);
  if (count) count.textContent = `Showing ${visible.length} of ${filteredWorkers.length} workers`;

  if (filteredWorkers.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);grid-column:1/-1;"><div style="font-size:3rem;margin-bottom:16px;">👷</div><h3>No workers found</h3><p>Try adjusting your filters.</p></div>`;
    return;
  }

  grid.innerHTML = visible.map(w => {
    const idx = w._idx;   // safe integer index – no quoting issues
    const ratingDisplay = w.rating > 0
      ? `<span class="stars">${'★'.repeat(Math.floor(w.rating))}${w.rating%1 ? '☆':''}</span>
         <span class="rating-num">${w.rating}</span>
         <span class="review-count">(${w.reviews} reviews)</span>`
      : `<span style="font-size:0.8rem;color:var(--text-muted);">No reviews yet</span>`;

    return `
    <div class="worker-profile-card" style="cursor:pointer;" onclick="viewWorkerProfile(${idx})">
      <div class="wpc-header">
        <div class="wpc-avatar" style="background:${w.gradient}">${w.initial}</div>
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
        <span class="badge ${w.available ? 'badge-success' : 'badge-warning'}" style="margin-left:auto;font-size:0.7rem;">${w.available ? '🟢 Available' : '🔴 On Job'}</span>
      </div>
      <div class="wpc-skills">${w.skills.slice(0,3).map(s => `<span class="skill-chip">${s}</span>`).join('')}${w.skills.length > 3 ? `<span class="skill-chip" style="background:rgba(255,255,255,0.05);">+${w.skills.length-3} more</span>` : ''}</div>
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
  document.querySelector('.wf-rating[value=""]').checked = true;
  document.getElementById('verifiedOnly').checked = false;
  filterWorkers();
}

/* ===================== VIEW PROFILE MODAL ===================== */
function viewWorkerProfile(idx) {
  const w = WORKER_INDEX[idx];
  if (!w) return;

  // Remove existing modal
  document.getElementById('workerProfileModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'workerProfileModal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);padding:20px;
  `;
  modal.innerHTML = `
    <div style="
      background:var(--card-bg,#1a1a2e);border:1px solid var(--border,rgba(255,255,255,0.1));
      border-radius:20px;width:100%;max-width:540px;overflow:hidden;
      box-shadow:0 25px 60px rgba(0,0,0,0.5);animation:slideUp .3s ease;
    ">
      <!-- Header Banner -->
      <div style="background:${w.gradient};padding:32px 28px 20px;position:relative;">
        <button onclick="closeModal('workerProfileModal')" style="
          position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);
          border:none;color:#fff;width:32px;height:32px;border-radius:50%;
          font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;
        ">✕</button>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="
            width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.25);
            display:flex;align-items:center;justify-content:center;
            font-size:1.8rem;font-weight:800;color:#fff;border:3px solid rgba(255,255,255,0.4);
          ">${w.initial}</div>
          <div>
            <div style="font-size:1.3rem;font-weight:700;color:#fff;">${w.name}</div>
            <div style="color:rgba(255,255,255,0.85);font-size:0.95rem;">🛠️ ${w.trade} · ${w.city}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
              ${w.verified ? '<span style="background:rgba(255,255,255,0.25);color:#fff;font-size:0.75rem;padding:2px 8px;border-radius:20px;">✓ Verified</span>' : ''}
              <span style="background:${w.available ? 'rgba(52,211,153,0.3)' : 'rgba(245,158,11,0.3)'};color:${w.available ? '#34d399' : '#fbbf24'};font-size:0.75rem;padding:2px 8px;border-radius:20px;">${w.available ? '🟢 Available Now' : '🔴 On Job'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:24px 28px;max-height:60vh;overflow-y:auto;">
        <!-- Stats Row -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.rating}</div>
            <div style="font-size:0.75rem;color:var(--text-muted,#888);">Rating</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.jobs}</div>
            <div style="font-size:0.75rem;color:var(--text-muted,#888);">Jobs Done</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--primary,#f97316);">${w.experience}</div>
            <div style="font-size:0.75rem;color:var(--text-muted,#888);">Experience</div>
          </div>
        </div>

        <!-- About -->
        <div style="margin-bottom:18px;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;">About</div>
          <p style="font-size:0.9rem;color:var(--text-secondary,#ccc);line-height:1.6;margin:0;">${w.about}</p>
        </div>

        <!-- Skills -->
        <div style="margin-bottom:18px;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;">Skills</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${w.skills.map(s => `<span style="background:rgba(249,115,22,0.12);color:var(--primary,#f97316);font-size:0.8rem;padding:4px 12px;border-radius:20px;border:1px solid rgba(249,115,22,0.2);">${s}</span>`).join('')}
          </div>
        </div>

        <!-- Contact -->
        <div style="margin-bottom:18px;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;">Contact Info</div>
          <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:var(--text-secondary,#ccc);">
            <span>📞</span><span>${w.phone}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:var(--text-secondary,#ccc);margin-top:6px;">
            <span>📍</span><span>${w.city}, India</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:var(--text-secondary,#ccc);margin-top:6px;">
            <span>💰</span><span>${w.rateLabel}</span>
          </div>
        </div>

        <!-- Reviews teaser -->
        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid var(--border,rgba(255,255,255,0.08));">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted,#888);text-transform:uppercase;letter-spacing:.05em;">Reviews</div>
            <span style="font-size:0.8rem;color:var(--primary,#f97316);">${w.reviews} total</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:1.1rem;color:#fbbf24;">${'★'.repeat(Math.floor(w.rating))}${w.rating%1?'☆':''}</span>
            <span style="font-size:0.85rem;font-weight:700;">${w.rating}/5.0</span>
          </div>
          <p style="font-size:0.82rem;color:var(--text-muted,#888);margin:6px 0 0;font-style:italic;">"Great work, very professional and on time!" — Recent client</p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div style="padding:16px 28px 24px;display:flex;gap:12px;border-top:1px solid var(--border,rgba(255,255,255,0.08));">
        <button data-hire="true" style="
          flex:1;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;
          border:none;border-radius:10px;padding:12px;font-size:0.95rem;font-weight:600;
          cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.9'" onmouseout="this.style.opacity='1'">
          🤝 Hire ${w.name.split(' ')[0]}
        </button>
        <a href="tel:${w.phone.replace(/\\s/g,'')}" style="
          flex:1;background:rgba(255,255,255,0.07);color:var(--text-primary,#fff);
          border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;
          padding:12px;font-size:0.95rem;font-weight:600;cursor:pointer;
          text-decoration:none;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">
          📞 Call Now
        </a>
      </div>
    </div>
  `;

  // hire button passes the same idx safely
  modal.querySelector('button[data-hire]')?.addEventListener('click', () => {
    closeModal('workerProfileModal');
    hireWorker(idx);
  });

  modal.addEventListener('click', e => { if (e.target === modal) closeModal('workerProfileModal'); });
  document.body.appendChild(modal);
}
/* ===================== HIRE MODAL ===================== */
function hireWorker(idx) {
  const user = getCurrentUser();
  const w = WORKER_INDEX[idx];
  if (!w) return;

  if (!user) {
    showToast('Please sign in to send a hire request.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  // Remove existing modal
  document.getElementById('hireRequestModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'hireRequestModal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);padding:20px;
  `;
  modal.innerHTML = `
    <div style="
      background:var(--card-bg,#1a1a2e);border:1px solid var(--border,rgba(255,255,255,0.1));
      border-radius:20px;width:100%;max-width:480px;overflow:hidden;
      box-shadow:0 25px 60px rgba(0,0,0,0.5);animation:slideUp .3s ease;
    ">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 28px;position:relative;">
        <button onclick="closeModal('hireRequestModal')" style="
          position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);
          border:none;color:#fff;width:32px;height:32px;border-radius:50%;
          font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;
        ">✕</button>
        <div style="font-size:1.2rem;font-weight:700;color:#fff;">🤝 Send Hire Request</div>
        <div style="color:rgba(255,255,255,0.85);font-size:0.9rem;margin-top:4px;">to ${w.name} · ${w.trade}</div>
      </div>

      <div style="padding:24px 28px;">
        <div style="margin-bottom:16px;">
          <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Job Description *</label>
          <textarea id="hireJobDesc" placeholder="Describe the work you need done (e.g. Fix bathroom pipe leak, wire a new room, paint 2BHK interior...)" style="
            width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));
            border-radius:10px;padding:12px;color:var(--text-primary,#fff);font-size:0.9rem;
            resize:vertical;min-height:90px;font-family:inherit;box-sizing:border-box;outline:none;
          " oninput="this.style.borderColor='var(--primary,#f97316)'"></textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div>
            <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Start Date</label>
            <input type="date" id="hireStartDate" style="
              width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));
              border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;
              box-sizing:border-box;outline:none;font-family:inherit;
            " min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Budget</label>
            <input type="text" id="hireBudget" placeholder="e.g. ₹2,000" style="
              width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));
              border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;
              box-sizing:border-box;outline:none;font-family:inherit;
            ">
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <label style="font-size:0.85rem;font-weight:600;color:var(--text-secondary,#ccc);display:block;margin-bottom:6px;">Your Location / Jobsite Address</label>
          <input type="text" id="hireAddress" placeholder="e.g. Koramangala, Bengaluru" value="${user.city || ''}" style="
            width:100%;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.1));
            border-radius:10px;padding:10px 12px;color:var(--text-primary,#fff);font-size:0.85rem;
            box-sizing:border-box;outline:none;font-family:inherit;
          ">
        </div>

        <div style="display:flex;gap:12px;">
          <button data-submit="true" style="
            flex:1;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;
            border:none;border-radius:10px;padding:13px;font-size:0.95rem;font-weight:600;
            cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.9'" onmouseout="this.style.opacity='1'">
            Send Request 🚀
          </button>
          <button onclick="closeModal('hireRequestModal')" style="
            background:rgba(255,255,255,0.07);color:var(--text-secondary,#ccc);
            border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;
            padding:13px 20px;font-size:0.95rem;font-weight:600;cursor:pointer;">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  // Submit button
  modal.querySelector('button[data-submit]')?.addEventListener('click', () => {
    submitHireRequest(idx);
  });

  modal.addEventListener('click', e => { if (e.target === modal) closeModal('hireRequestModal'); });
  document.body.appendChild(modal);
}

function submitHireRequest(idx) {
  const desc = document.getElementById('hireJobDesc')?.value.trim();
  if (!desc) {
    document.getElementById('hireJobDesc').style.borderColor = '#ef4444';
    document.getElementById('hireJobDesc').focus();
    return;
  }

  const user = getCurrentUser();
  if (!user) return;

  const w = WORKER_INDEX[idx];

  // Load employer's hiring list (keyed by their email)
  const key = `sc_hirings_${user.email}`;
  const hirings = JSON.parse(localStorage.getItem(key) || '[]');

  hirings.push({
    id: Date.now(),
    workerId: w?.id,
    workerName: w?.name,
    trade: w?.trade,
    desc,
    date: document.getElementById('hireStartDate')?.value || 'Flexible',
    budget: document.getElementById('hireBudget')?.value || 'Negotiable',
    address: document.getElementById('hireAddress')?.value || '',
    sentBy: user?.name || user?.email,
    sentAt: new Date().toISOString(),
    status: 'contacted',  // default status
  });

  localStorage.setItem(key, JSON.stringify(hirings));

  closeModal('hireRequestModal');
  showToast(`✅ Hire request sent to ${w?.name}! View & manage in Manage Hires.`, 'success');

  // Show a "Go to Manage Hires" button after 1s
  setTimeout(() => {
    if (confirm(`Request sent to ${w?.name}!\n\nGo to "Manage Hires" to track status?`)) {
      window.location.href = 'manage-hires.html';
    }
  }, 1200);
}

/* ===================== HELPERS ===================== */
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.opacity='0'; setTimeout(() => m.remove(), 200); }
}

// Add slideUp animation if not already in CSS
if (!document.getElementById('hireModalStyles')) {
  const style = document.createElement('style');
  style.id = 'hireModalStyles';
  style.textContent = `@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  buildWorkerList();
  filterWorkers();
});
