/* ============================
   Jobs Page JS – Supabase
   ============================ */

const STATIC_JOBS = [
  { id:'s1', title:'Senior Electrician – Residential Complex', company:'Skyline Builders', location:'Delhi', type:'Full Time', category:'Electrician', pay:1200, payLabel:'₹1,200/day', experience:'Senior', posted:'2 days ago', icon:'⚡', iconBg:'linear-gradient(135deg,#fbbf24,#f59e0b)', description:'Looking for an experienced residential electrician for a large apartment complex.', source:'static' },
  { id:'s2', title:'Plumber for Hotel Renovation', company:'Grand Palace Hotels', location:'Mumbai', type:'Contract', category:'Plumber', pay:1500, payLabel:'₹1,500/day', experience:'Senior', posted:'1 day ago', icon:'🔧', iconBg:'linear-gradient(135deg,#38bdf8,#0ea5e9)', description:'Immediate requirement for a skilled plumber for hotel renovation.', source:'static' },
  { id:'s3', title:'Carpenter – Office Furniture Fitting', company:'WorkSpace Solutions', location:'Bengaluru', type:'Freelance', category:'Carpenter', pay:900, payLabel:'₹900/day', experience:'Junior', posted:'3 days ago', icon:'🪚', iconBg:'linear-gradient(135deg,#a78bfa,#7c3aed)', description:'Need a skilled carpenter for office furniture installation.', source:'static' },
  { id:'s4', title:'Welder for Steel Fabrication', company:'MetalWorks India', location:'Pune', type:'Full Time', category:'Welder', pay:1100, payLabel:'₹1,100/day', experience:'Expert', posted:'5 days ago', icon:'🔥', iconBg:'linear-gradient(135deg,#f87171,#ef4444)', description:'Permanent position for a skilled TIG/MIG welder.', source:'static' },
  { id:'s5', title:'House Painter – 3 BHK Apartment', company:'Individual – Rohit Sharma', location:'Hyderabad', type:'Freelance', category:'Painter', pay:600, payLabel:'₹600/day', experience:'Fresher', posted:'1 day ago', icon:'🎨', iconBg:'linear-gradient(135deg,#34d399,#10b981)', description:'Need a house painter for a 3 BHK apartment.', source:'static' },
  { id:'s6', title:'Mason for House Construction', company:'Sharma Construction', location:'Jaipur', type:'Full Time', category:'Mason', pay:800, payLabel:'₹800/day', experience:'Senior', posted:'4 days ago', icon:'🧱', iconBg:'linear-gradient(135deg,#fb923c,#ea580c)', description:'Looking for skilled mason for residential construction.', source:'static' },
];

const TRADE_ICONS = {
  'Electrician':'⚡','Plumber':'🔧','Carpenter':'🪚','Welder':'🔥',
  'Painter':'🎨','Mason':'🧱','AC Technician':'❄️','Driver':'🚗',
  'Cleaner':'🧹','General Labour':'🛠️','Other':'🔩','HVAC':'❄️','Tiler':'🪵'
};
const TRADE_BG = {
  'Electrician':'linear-gradient(135deg,#fbbf24,#f59e0b)','Plumber':'linear-gradient(135deg,#38bdf8,#0ea5e9)',
  'Carpenter':'linear-gradient(135deg,#a78bfa,#7c3aed)','Welder':'linear-gradient(135deg,#f87171,#ef4444)',
  'Painter':'linear-gradient(135deg,#34d399,#10b981)','Mason':'linear-gradient(135deg,#fb923c,#ea580c)',
  'AC Technician':'linear-gradient(135deg,#67e8f9,#06b6d4)','HVAC':'linear-gradient(135deg,#67e8f9,#06b6d4)',
  'Driver':'linear-gradient(135deg,#fbbf24,#f59e0b)','Cleaner':'linear-gradient(135deg,#34d399,#10b981)',
  'Tiler':'linear-gradient(135deg,#d97706,#b45309)','General Labour':'linear-gradient(135deg,#9ca3af,#6b7280)',
  'Other':'linear-gradient(135deg,#9ca3af,#6b7280)',
};

function timeAgo(ts) {
  const diff  = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins||1} min${mins!==1?'s':''} ago`;
  if (hours < 24) return `${hours} hour${hours!==1?'s':''} ago`;
  if (days  < 7)  return `${days} day${days!==1?'s':''} ago`;
  return `${Math.floor(days/7)} week${Math.floor(days/7)!==1?'s':''} ago`;
}

/* ── Merge Supabase + static ── */
let ALL_JOBS = [];

async function buildJobsList() {
  let dbJobs = [];
  try {
    const raw = await sbGetActiveJobs();
    dbJobs = raw.map(p => ({
      id:          'ep_' + p.id,
      _postId:     p.id,
      _employerId: p.employer_id,
      title:       p.title,
      company:     p.profiles?.company || p.profiles?.name || 'Employer',
      location:    p.location,
      type:        p.type     || 'Full Time',
      category:    p.trade    || 'Other',
      pay:         parseInt((p.pay||'0').replace(/[^\d]/g,'')) || 0,
      payLabel:    p.pay      || 'Negotiable',
      experience:  p.experience || 'Any',
      posted:      p.created_at ? timeAgo(p.created_at) : 'Recently',
      icon:        TRADE_ICONS[p.trade] || '📋',
      iconBg:      TRADE_BG[p.trade]   || 'linear-gradient(135deg,#9ca3af,#6b7280)',
      description: p.desc     || '',
      skills:      p.skills   || [],
      openings:    p.openings || 1,
      deadline:    p.deadline || null,
      source:      'employer',
    }));
  } catch(e) { console.warn('Could not load jobs from Supabase:', e); }

  ALL_JOBS = [...dbJobs, ...STATIC_JOBS];
}

let displayedCount = 6;
let filteredJobs   = [];

function filterJobs() {
  const query      = document.getElementById('jobSearch')?.value.toLowerCase() || '';
  const city       = document.getElementById('jobCityFilter')?.value || '';
  const maxPay     = parseInt(document.getElementById('rateRange')?.value || '5000');
  const categories = [...document.querySelectorAll('.f-category:checked')].map(c => c.value);
  const types      = [...document.querySelectorAll('.f-type:checked')].map(t => t.value);
  const exps       = [...document.querySelectorAll('.f-exp:checked')].map(e => e.value);
  const sort       = document.getElementById('sortJobs')?.value || 'recent';

  filteredJobs = ALL_JOBS.filter(job => {
    const matchQuery = !query || job.title.toLowerCase().includes(query) || job.category.toLowerCase().includes(query) || job.company.toLowerCase().includes(query) || (job.skills||[]).some(s => s.toLowerCase().includes(query));
    const matchCity  = !city || job.location === city;
    const matchPay   = !job.pay || job.pay <= maxPay;
    const matchCat   = categories.length === 0 || categories.includes(job.category);
    const matchType  = types.length === 0 || types.includes(job.type);
    const matchExp   = exps.length === 0 || exps.includes(job.experience) || job.experience === 'Any' || job.source === 'employer';
    return matchQuery && matchCity && matchPay && matchCat && matchType && matchExp;
  });

  if (sort === 'pay-high') filteredJobs.sort((a,b) => b.pay - a.pay);
  else if (sort === 'pay-low') filteredJobs.sort((a,b) => a.pay - b.pay);

  displayedCount = 6;
  renderJobs();
}

function renderJobs() {
  const grid  = document.getElementById('jobsGrid');
  const count = document.getElementById('jobsCount');
  if (!grid) return;

  const visible = filteredJobs.slice(0, displayedCount);
  if (count) count.textContent = `Showing ${visible.length} of ${filteredJobs.length} jobs`;

  if (filteredJobs.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:16px;">🔍</div><h3>No jobs found</h3><p>Try adjusting your filters.</p></div>`;
    return;
  }

  const typeBadge = { 'Full Time':'badge-success','Part Time':'badge-info','Freelance':'badge-warning','Contract':'badge-error' };
  const user      = getCurrentUser();
  const appliedIds= (user?._appliedJobIds || []).map(String);

  grid.innerHTML = visible.map(job => {
    const alreadyApplied = appliedIds.includes(String(job.id));
    const isNew          = job.source === 'employer';
    const deadlineHtml   = job.deadline ? `<span class="job-tag" style="color:#f97316;">🗓️ Deadline: ${new Date(job.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>` : '';
    const skillsHtml     = (job.skills||[]).length ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">${job.skills.slice(0,4).map(s=>`<span style="font-size:0.72rem;padding:2px 8px;border-radius:16px;background:rgba(249,115,22,0.1);color:var(--primary);border:1px solid rgba(249,115,22,0.2);">${s}</span>`).join('')}</div>` : '';

    return `
    <div class="job-card" style="position:relative;">
      ${isNew ? `<div style="position:absolute;top:14px;right:14px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:0.68rem;font-weight:700;padding:3px 9px;border-radius:20px;">✨ NEW POST</div>` : ''}
      <div class="job-card-header">
        <div style="display:flex;align-items:flex-start;gap:14px;flex:1;">
          <div class="job-company-logo" style="background:${job.iconBg}">${job.icon}</div>
          <div>
            <div class="job-title">${job.title}</div>
            <div class="job-company">🏢 ${job.company}</div>
          </div>
        </div>
        <span class="badge ${typeBadge[job.type]||'badge-info'} job-type-badge">${job.type}</span>
      </div>
      <div class="job-detail-tags">
        <span class="job-tag">📍 ${job.location}</span>
        <span class="job-tag">🎯 ${job.experience}</span>
        <span class="job-tag">🛠️ ${job.category}</span>
        <span class="job-tag">🕒 ${job.posted}</span>
        ${job.openings>1?`<span class="job-tag">👥 ${job.openings} openings</span>`:''}
        ${deadlineHtml}
      </div>
      <div class="job-description">${job.description}</div>
      ${skillsHtml}
      <div class="job-card-footer" style="margin-top:${skillsHtml?'12px':'0'};">
        <div>
          <div class="job-salary">${job.payLabel}</div>
          <div class="job-posted">Posted ${job.posted}</div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-ghost btn-sm" onclick="saveJob('${job.id}')">🔖 Save</button>
          <button class="btn btn-primary btn-sm" id="applyBtn_${job.id}"
            onclick="applyJob('${job.id}')"
            ${alreadyApplied?'disabled style="opacity:.6;cursor:not-allowed;"':''}>
            ${alreadyApplied?'✓ Applied':'Apply Now →'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('loadMoreBtn').style.display = displayedCount >= filteredJobs.length ? 'none' : 'inline-flex';
}

function loadMore() { displayedCount += 6; renderJobs(); }

function clearFilters() {
  document.querySelectorAll('.f-category,.f-type,.f-exp').forEach(el => el.checked = false);
  document.getElementById('jobSearch').value = '';
  document.getElementById('jobCityFilter').value = '';
  document.getElementById('rateRange').value = 5000;
  document.getElementById('rateVal').textContent = '₹5,000';
  filterJobs();
}

function saveJob(id) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  showToast('Job saved to your bookmarks! 🔖', 'success');
}

/* ── Apply (Supabase) ── */
async function applyJob(id) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem('redirectAfterLogin', 'jobs.html');
    showToast('Please sign in to apply for jobs.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  if (user.role === 'employer') { showToast('Switch to a worker account to apply for jobs.', 'error'); return; }

  const job = ALL_JOBS.find(j => String(j.id) === String(id));
  if (!job) return;

  const btn = document.getElementById(`applyBtn_${id}`);
  if (btn) { btn.disabled = true; btn.textContent = 'Applying…'; }

  if (job.source === 'employer' && job._postId) {
    // Apply to Supabase-backed employer job
    try {
      await sbApplyJob(user.id, job._postId);
      if (!user._appliedJobIds) user._appliedJobIds = [];
      user._appliedJobIds.push(String(id));
      setCurrentUser(user);
      showToast(`✅ Applied to "${job.title}"! Track in My Applications.`, 'success');
      if (btn) { btn.textContent = '✓ Applied'; btn.style.opacity='0.6'; }
    } catch(err) {
      if (err.message === 'already_applied') {
        showToast('You have already applied to this job!', 'info');
        if (btn) { btn.textContent = '✓ Applied'; btn.style.opacity='0.6'; }
      } else {
        showToast('Failed to apply. Please try again.', 'error');
        if (btn) { btn.disabled=false; btn.textContent='Apply Now →'; }
      }
    }
  } else {
    // Static job — just show success
    showToast(`✅ Applied to "${job.title}"!`, 'success');
    if (btn) { btn.textContent='✓ Applied'; btn.style.opacity='0.6'; }
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('jobsGrid');
  if (grid) grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);grid-column:1/-1;">⏳ Loading jobs…</div>`;

  await buildJobsList();

  const params = new URLSearchParams(window.location.search);
  const q   = params.get('q');
  const cat = params.get('category');
  if (q)   document.getElementById('jobSearch').value = q;
  if (cat) {
    const checkbox = document.querySelector(`.f-category[value="${cat.charAt(0).toUpperCase()+cat.slice(1)}"]`);
    if (checkbox) checkbox.checked = true;
  }
  filterJobs();
});
