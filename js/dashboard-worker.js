/* ============================
   Worker Dashboard JS – Supabase
   ============================ */

const ALL_JOBS_POOL = [
  { title:'Senior Electrician Needed', company:'ABC Construction', location:'Delhi', pay:'₹900/day', type:'Full Time', icon:'⚡', trade:'electrician' },
  { title:'Home Wiring & Repair Work', company:'HomeServe Inc.', location:'Noida', pay:'₹1,200/day', type:'Freelance', icon:'🔌', trade:'electrician' },
  { title:'Solar Panel Technician', company:'SolarTech Ltd', location:'Pune', pay:'₹1,100/day', type:'Full Time', icon:'☀️', trade:'electrician' },
  { title:'Bathroom Plumbing Fix', company:'HomeCare Services', location:'Bangalore', pay:'₹700/day', type:'Freelance', icon:'🔧', trade:'plumber' },
  { title:'New Pipeline Installation', company:'GreenBuild Co.', location:'Chennai', pay:'₹1,000/day', type:'Contract', icon:'🚰', trade:'plumber' },
  { title:'Custom Cabinet Work', company:'DreamHome Corp', location:'Bengaluru', pay:'₹900/day', type:'Freelance', icon:'🪚', trade:'carpenter' },
  { title:'Steel Welding – Structural', company:'BuildMax Ltd', location:'Mumbai', pay:'₹1,100/day', type:'Full Time', icon:'🔥', trade:'welder' },
  { title:'Interior House Painting', company:'ColorCraft Homes', location:'Kochi', pay:'₹600/day', type:'Freelance', icon:'🎨', trade:'painter' },
  { title:'Brick Masonry – House Wall', company:'ClassicBuild Co.', location:'Lucknow', pay:'₹750/day', type:'Full Time', icon:'🧱', trade:'mason' },
  { title:'General Labour Position', company:'WorkPlus Ltd', location:'Nearby Location', pay:'₹550/day', type:'Full Time', icon:'🛠️', trade:'other' },
];

const EARNINGS_DATA = [
  { month:'Oct',amount:0 },{ month:'Nov',amount:0 },{ month:'Dec',amount:0 },
  { month:'Jan',amount:0 },{ month:'Feb',amount:0 },{ month:'Mar',amount:0 },
];

function getProfileCompletion(user) {
  let score = 0;
  ['name','email','phone','city','trade','experience','rate'].forEach(f => { if (user[f]) score++; });
  return Math.round((score / 7) * 100);
}

function getRecommendedJobs(user) {
  const trade = (user?.trade || 'other').toLowerCase();
  const city  = (user?.city  || '').toLowerCase();
  let matched = ALL_JOBS_POOL.filter(j => j.trade === trade);
  if (matched.length === 0) matched = ALL_JOBS_POOL.filter(j => j.trade === 'other');
  matched.sort((a,b) => {
    const aM = city && a.location.toLowerCase().includes(city.split(',')[0].toLowerCase().trim());
    const bM = city && b.location.toLowerCase().includes(city.split(',')[0].toLowerCase().trim());
    return (aM && !bM) ? -1 : (!aM && bM) ? 1 : 0;
  });
  return matched.slice(0,3);
}

async function initDashboard() {
  const user = getCurrentUser();

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';
  document.getElementById('greetingText').textContent = `${greeting}, ${firstName}! 👋`;

  const completion = getProfileCompletion(user || {});
  const subEl = document.getElementById('greetingSubtext');
  if (subEl) {
    if (completion < 60) subEl.innerHTML = `Complete your profile to start getting <strong>job recommendations</strong> near you.`;
    else { const tl = (user?.trade||'your trade').charAt(0).toUpperCase()+(user?.trade||'').slice(1); subEl.innerHTML = `We found <strong>job opportunities</strong> matching your <strong>${tl}</strong> skills today.`; }
  }

  if (user) {
    document.getElementById('userAva').textContent  = user.avatar || user.name?.[0]?.toUpperCase() || 'U';
    document.getElementById('userName').textContent = firstName;
  }

  // Stats
  const statCards  = document.querySelectorAll('.stat-card-value');
  const changeEls  = document.querySelectorAll('.stat-card-change');
  let apps = [];
  try { apps = await sbGetMyApplications(user?.id); } catch(e) {}

  const jobsApplied    = apps.length;
  const jobsCompleted  = apps.filter(a => a.status === 'selected').length;

  if (statCards[0]) statCards[0].textContent = jobsApplied;
  if (statCards[1]) statCards[1].textContent = jobsCompleted;
  if (statCards[2]) statCards[2].textContent = '₹0';
  if (statCards[3]) statCards[3].textContent = '—';

  if (changeEls[0]) { changeEls[0].textContent = jobsApplied > 0 ? '↑ Recent activity' : 'No applications yet'; changeEls[0].className = 'stat-card-change' + (jobsApplied > 0 ? ' up' : ''); }
  if (changeEls[1]) { changeEls[1].textContent = jobsCompleted > 0 ? '↑ Great work!' : 'None yet'; changeEls[1].className = 'stat-card-change' + (jobsCompleted > 0 ? ' up' : ''); }
  if (changeEls[2]) { changeEls[2].textContent = 'Start applying to earn'; }
  if (changeEls[3]) { changeEls[3].textContent = 'No reviews yet'; }

  // Profile alert
  const profileAlert = document.getElementById('profileAlert');
  if (profileAlert) {
    if (completion >= 100) profileAlert.style.display = 'none';
    else profileAlert.innerHTML = `📝 Your profile is <strong style="color:var(--accent)">${completion}% complete</strong>. ${completion<50?'Complete it to get job matches!':'Almost there — finish for 3x more matches!'} <a href="profile-worker.html" style="color:var(--accent);font-weight:700;margin-left:auto;white-space:nowrap;">Complete Now →</a>`;
  }

  // Sidebar badge
  const pendingCount = apps.filter(a => a.status === 'pending' || a.status === 'shortlisted').length;
  const badge = document.getElementById('appsSidebarBadge');
  if (badge) {
    if (pendingCount > 0) { badge.textContent = pendingCount; badge.style.display = ''; }
    else badge.style.display = 'none';
  }

  renderRecommendedJobs(user);
  renderApplicationsTable(apps);
  renderMessages(user);
  renderEarningsChart(user);
}

function renderRecommendedJobs(user) {
  const container = document.getElementById('recommendedJobs');
  if (!container) return;
  const jobs = getRecommendedJobs(user);
  if (jobs.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">🔍</div><p>Complete your profile to see job recommendations.</p><a href="profile-worker.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Complete Profile</a></div>`;
    return;
  }
  container.innerHTML = jobs.map(job => `
    <div class="job-item" style="cursor:pointer;" onclick="window.location.href='jobs.html'">
      <div class="job-item-icon" style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05));border:1px solid rgba(249,115,22,0.2);">${job.icon}</div>
      <div class="job-item-info">
        <div class="job-item-title">${job.title}</div>
        <div class="job-item-sub">📍 ${job.location} · ${job.company}</div>
      </div>
      <div class="job-item-meta">
        <span class="job-item-pay">${job.pay}</span>
        <span class="badge badge-info" style="font-size:0.7rem;">${job.type}</span>
      </div>
    </div>`).join('');
}

function renderApplicationsTable(apps) {
  const tbody = document.getElementById('applicationsTable');
  if (!tbody) return;
  if (!apps || apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">📋</div><p>No applications yet.</p><a href="jobs.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Browse Jobs</a></td></tr>`;
    return;
  }
  const statusMap = {
    pending:     { cls:'badge-warning', label:'Under Review' },
    shortlisted: { cls:'badge-info',   label:'Shortlisted ⭐' },
    selected:    { cls:'badge-success',label:'Selected ✅' },
    rejected:    { cls:'badge-error',  label:'Not Selected' },
  };
  const recent = [...apps].slice(0,5);
  tbody.innerHTML = recent.map(app => {
    const job = app.job || {};
    const s   = statusMap[app.status] || statusMap.pending;
    const date= app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Recently';
    return `
    <tr style="cursor:pointer;" onclick="window.location.href='my-applications.html'">
      <td><strong>${job.title||'—'}</strong></td>
      <td>${job.employer?.company || job.employer?.name || '—'}</td>
      <td>📍 ${job.location||'—'}</td>
      <td style="font-weight:700;color:var(--primary);">${job.pay||'—'}</td>
      <td style="color:var(--text-muted);">${date}</td>
      <td><span class="badge ${s.cls}">${s.label}</span></td>
    </tr>`;
  }).join('');
}

function renderMessages(user) {
  const container = document.getElementById('recentMessages');
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);"><div style="font-size:1.5rem;margin-bottom:6px;">💬</div><p style="font-size:0.85rem;">No messages yet.</p></div>`;
}

function renderEarningsChart(user) {
  const chart  = document.getElementById('earningsChart');
  const labels = document.getElementById('earningsChartLabels');
  if (!chart || !labels) return;
  chart.innerHTML  = `<div style="width:100%;text-align:center;color:var(--text-muted);font-size:0.85rem;display:flex;align-items:center;justify-content:center;gap:8px;"><span>📊</span><span>Your earnings chart will appear here once you complete jobs.</span></div>`;
  labels.innerHTML = '';
}

/* ── Availability Toggle ── */
async function initAvailability(user) {
  let isAvail = true;
  try {
    // Read from profiles table
    const { data } = await db.from('profiles').select('available').eq('id', user.id).single();
    isAvail = data?.available !== false;
  } catch(e) {
    // Fallback to localStorage cache
    const stored = localStorage.getItem(`sc_availability_${user.id}`);
    isAvail = stored === null ? true : stored === 'true';
  }
  applyAvailabilityUI(isAvail);
}

async function toggleAvailability() {
  const user = getCurrentUser();
  if (!user) return;

  // Read current state from UI (knob position)
  const knob   = document.getElementById('availKnob');
  const isAvail= knob?.style.left !== '28px'; // if currently ON, turn OFF

  try {
    await sbSetAvailability(user.id, isAvail);
    // Cache locally as fallback
    localStorage.setItem(`sc_availability_${user.id}`, String(isAvail));
  } catch(e) {
    localStorage.setItem(`sc_availability_${user.id}`, String(isAvail));
  }

  applyAvailabilityUI(isAvail);
  showToast(isAvail ? '🟢 You are now visible to employers!' : '⚫ You are now hidden from employers.', isAvail ? 'success' : 'info');
}

function applyAvailabilityUI(isAvail) {
  const dot    = document.getElementById('availDot');
  const label  = document.getElementById('availLabel');
  const slider = document.getElementById('availSlider');
  const knob   = document.getElementById('availKnob');
  const banner = document.getElementById('availabilityBanner');
  const since  = document.getElementById('availSince');

  if (isAvail) {
    if (dot)    { dot.style.background = '#34d399'; dot.style.boxShadow = '0 0 8px #34d399'; }
    if (label)  label.textContent = '🟢 Available for Work';
    if (slider) slider.style.background = '#16a34a';
    if (knob)   knob.style.left  = '28px';
    if (banner) { banner.style.borderColor = 'rgba(52,211,153,0.3)'; banner.style.background = 'rgba(52,211,153,0.05)'; }
    if (since)  since.textContent = 'Open to new opportunities';
  } else {
    if (dot)    { dot.style.background = '#6b7280'; dot.style.boxShadow = 'none'; }
    if (label)  label.textContent = '⚫ Not Available';
    if (slider) slider.style.background = '#374151';
    if (knob)   knob.style.left  = '4px';
    if (banner) { banner.style.borderColor = 'rgba(255,255,255,0.06)'; banner.style.background = '#1a1d26'; }
    if (since)  since.textContent = 'Hidden from employers';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initSession === 'function') {
    await initSession();
  } else {
    if(typeof initSession==="function"){await initSession();}else{await new Promise(r=>setTimeout(r,600));} // wait for session fallback
  }
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  await initDashboard();
  await initAvailability(user);
});
