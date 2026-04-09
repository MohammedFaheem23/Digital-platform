/* ============================
   Jobs Page JS
   ============================ */

/* ── Static baseline jobs ── */
const STATIC_JOBS = [
  { id:'s1', title:'Senior Electrician – Residential Complex', company:'Skyline Builders', location:'Delhi', type:'Full Time', category:'Electrician', pay:1200, payLabel:'₹1,200/day', experience:'Senior', posted:'2 days ago', icon:'⚡', iconBg:'linear-gradient(135deg,#fbbf24,#f59e0b)', description:'Looking for an experienced residential electrician for a large apartment complex project. Must have experience with panel installation and home wiring.', source:'static' },
  { id:'s2', title:'Plumber for Hotel Renovation', company:'Grand Palace Hotels', location:'Mumbai', type:'Contract', category:'Plumber', pay:1500, payLabel:'₹1,500/day', experience:'Senior', posted:'1 day ago', icon:'🔧', iconBg:'linear-gradient(135deg,#38bdf8,#0ea5e9)', description:'Immediate requirement for a skilled plumber for hotel bathroom and kitchen renovation work. 6-month contract with possible extension.', source:'static' },
  { id:'s3', title:'Carpenter – Office Furniture Fitting', company:'WorkSpace Solutions', location:'Bengaluru', type:'Freelance', category:'Carpenter', pay:900, payLabel:'₹900/day', experience:'Junior', posted:'3 days ago', icon:'🪚', iconBg:'linear-gradient(135deg,#a78bfa,#7c3aed)', description:'Need a skilled carpenter to install modular furniture in a new office space. 2-week project with all materials provided.', source:'static' },
  { id:'s4', title:'Welder for Steel Fabrication', company:'MetalWorks India', location:'Pune', type:'Full Time', category:'Welder', pay:1100, payLabel:'₹1,100/day', experience:'Expert', posted:'5 days ago', icon:'🔥', iconBg:'linear-gradient(135deg,#f87171,#ef4444)', description:'Permanent position for a skilled TIG/MIG welder at our manufacturing unit. Experience with structural steel preferred.', source:'static' },
  { id:'s5', title:'House Painter – 3 BHK Apartment', company:'Individual – Rohit Sharma', location:'Hyderabad', type:'Freelance', category:'Painter', pay:600, payLabel:'₹600/day', experience:'Fresher', posted:'1 day ago', icon:'🎨', iconBg:'linear-gradient(135deg,#34d399,#10b981)', description:'Need a house painter to paint a 3 BHK apartment. Paint and materials provided. 4-5 days work expected.', source:'static' },
  { id:'s6', title:'Mason for House Construction', company:'Sharma Construction', location:'Jaipur', type:'Full Time', category:'Mason', pay:800, payLabel:'₹800/day', experience:'Senior', posted:'4 days ago', icon:'🧱', iconBg:'linear-gradient(135deg,#fb923c,#ea580c)', description:'Looking for skilled mason for residential house construction. Long-term project with accommodation provided.', source:'static' },
  { id:'s7', title:'Electrician – Solar Panel Installation', company:'GreenEnergy Solutions', location:'Chennai', type:'Contract', category:'Electrician', pay:1400, payLabel:'₹1,400/day', experience:'Expert', posted:'6 hours ago', icon:'⚡', iconBg:'linear-gradient(135deg,#fbbf24,#f59e0b)', description:'Urgent requirement for solar panel installation technicians. Must have solar installation experience and electrical certification.', source:'static' },
  { id:'s8', title:'Plumber – Emergency Repair Service', company:'QuickFix Services', location:'Delhi', type:'Part Time', category:'Plumber', pay:700, payLabel:'₹700/day', experience:'Junior', posted:'12 hours ago', icon:'🔧', iconBg:'linear-gradient(135deg,#38bdf8,#0ea5e9)', description:'Need reliable plumber for on-demand emergency repair services. Flexible hours. Own tools required.', source:'static' },
  { id:'s9', title:'Custom Wood Furniture Maker', company:'ArtiCraft Interiors', location:'Mumbai', type:'Freelance', category:'Carpenter', pay:1300, payLabel:'₹1,300/day', experience:'Expert', posted:'1 week ago', icon:'🪚', iconBg:'linear-gradient(135deg,#a78bfa,#7c3aed)', description:'Looking for creative carpentry expert for high-end custom furniture. Portfolio required. Premium rates offered.', source:'static' },
  { id:'s10', title:'AC Technician – HVAC Maintenance', company:'CoolAir Systems', location:'Bengaluru', type:'Full Time', category:'HVAC', pay:1000, payLabel:'₹1,000/day', experience:'Senior', posted:'3 days ago', icon:'❄️', iconBg:'linear-gradient(135deg,#67e8f9,#06b6d4)', description:'HVAC technician required for commercial AC installation and maintenance projects across the city.', source:'static' },
  { id:'s11', title:'Tile Flooring & Bathroom Tiles', company:'Individual – Meera Patel', location:'Pune', type:'Freelance', category:'Tiler', pay:750, payLabel:'₹750/day', experience:'Junior', posted:'2 days ago', icon:'🪵', iconBg:'linear-gradient(135deg,#d97706,#b45309)', description:'Require a tiler for bathroom and kitchen tile work in a new flat. 1 week project.', source:'static' },
  { id:'s12', title:'Structural Welder – Bridge Work', company:'InfraBuild Corp', location:'Mumbai', type:'Contract', category:'Welder', pay:1800, payLabel:'₹1,800/day', experience:'Expert', posted:'1 day ago', icon:'🔥', iconBg:'linear-gradient(135deg,#f87171,#ef4444)', description:'Large-scale structural welding project for flyover construction. 12-month contract. Certified welders only.', source:'static' },
];

const TRADE_ICONS = {
  'Electrician':'⚡','Plumber':'🔧','Carpenter':'🪚','Welder':'🔥',
  'Painter':'🎨','Mason':'🧱','AC Technician':'❄️','Driver':'🚗',
  'Cleaner':'🧹','General Labour':'🛠️','Other':'🔩','HVAC':'❄️','Tiler':'🪵'
};
const TRADE_BG = {
  'Electrician':'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'Plumber':'linear-gradient(135deg,#38bdf8,#0ea5e9)',
  'Carpenter':'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'Welder':'linear-gradient(135deg,#f87171,#ef4444)',
  'Painter':'linear-gradient(135deg,#34d399,#10b981)',
  'Mason':'linear-gradient(135deg,#fb923c,#ea580c)',
  'AC Technician':'linear-gradient(135deg,#67e8f9,#06b6d4)',
  'HVAC':'linear-gradient(135deg,#67e8f9,#06b6d4)',
  'Driver':'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'Cleaner':'linear-gradient(135deg,#34d399,#10b981)',
  'Tiler':'linear-gradient(135deg,#d97706,#b45309)',
  'General Labour':'linear-gradient(135deg,#9ca3af,#6b7280)',
  'Other':'linear-gradient(135deg,#9ca3af,#6b7280)',
};

/* ── Load employer-posted jobs from localStorage across all accounts ── */
function loadEmployerJobs() {
  const employerJobs = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith('sc_job_posts_')) continue;
      const posts = JSON.parse(localStorage.getItem(key) || '[]');
      posts.forEach(p => {
        if (p.status !== 'active') return;          // only show active posts
        const payNum = parseInt((p.pay || '0').replace(/[^\d]/g, '')) || 0;
        employerJobs.push({
          id:          'ep_' + p.id,               // prefix so no id clash
          _postId:     p.id,
          _ownerKey:   key,
          title:       p.title,
          company:     p.company || p.postedBy || 'Employer',
          location:    p.location,
          type:        p.type || 'Full Time',
          category:    p.trade || 'Other',
          pay:         payNum,
          payLabel:    p.pay || 'Negotiable',
          experience:  p.experience || 'Any',
          posted:      p.createdAt ? timeAgo(p.createdAt) : 'Recently',
          icon:        TRADE_ICONS[p.trade] || '📋',
          iconBg:      TRADE_BG[p.trade] || 'linear-gradient(135deg,#9ca3af,#6b7280)',
          description: p.desc || '',
          skills:      p.skills || [],
          openings:    p.openings || 1,
          deadline:    p.deadline || null,
          source:      'employer',                  // badge marker
        });
      });
    }
  } catch(e) { /* graceful fail */ }
  return employerJobs;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins  || 1} min${mins  !== 1 ? 's' : ''} ago`;
  if (hours < 24)  return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days  < 7)   return `${days} day${days !== 1 ? 's' : ''} ago`;
  return `${Math.floor(days/7)} week${Math.floor(days/7) !== 1 ? 's' : ''} ago`;
}

/* ── Merge all jobs ── */
let ALL_JOBS = [];

function buildJobsList() {
  const empJobs = loadEmployerJobs();
  // Employer-posted jobs appear first (most relevant / newest)
  ALL_JOBS = [...empJobs, ...STATIC_JOBS];
}

let displayedCount = 6;
let filteredJobs   = [];

/* ── Filter ── */
function filterJobs() {
  const query    = document.getElementById('jobSearch')?.value.toLowerCase() || '';
  const city     = document.getElementById('jobCityFilter')?.value || '';
  const maxPay   = parseInt(document.getElementById('rateRange')?.value || '5000');
  const categories = [...document.querySelectorAll('.f-category:checked')].map(c => c.value);
  const types    = [...document.querySelectorAll('.f-type:checked')].map(t => t.value);
  const exps     = [...document.querySelectorAll('.f-exp:checked')].map(e => e.value);
  const sort     = document.getElementById('sortJobs')?.value || 'recent';

  filteredJobs = ALL_JOBS.filter(job => {
    const matchQuery = !query ||
      job.title.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      (job.skills||[]).some(s => s.toLowerCase().includes(query));
    const matchCity  = !city || job.location === city;
    const matchPay   = !job.pay || job.pay <= maxPay;
    const matchCat   = categories.length === 0 || categories.includes(job.category);
    const matchType  = types.length === 0 || types.includes(job.type);
    const matchExp   = exps.length === 0 || exps.includes(job.experience) || job.experience === 'Any' || job.source === 'employer';
    return matchQuery && matchCity && matchPay && matchCat && matchType && matchExp;
  });

  if (sort === 'pay-high') filteredJobs.sort((a,b) => b.pay - a.pay);
  else if (sort === 'pay-low') filteredJobs.sort((a,b) => a.pay - b.pay);
  // Keep employer posts first on 'recent' (default)

  displayedCount = 6;
  renderJobs();
}

/* ── Render ── */
function renderJobs() {
  const grid  = document.getElementById('jobsGrid');
  const count = document.getElementById('jobsCount');
  if (!grid) return;

  const visible = filteredJobs.slice(0, displayedCount);
  if (count) count.textContent = `Showing ${visible.length} of ${filteredJobs.length} jobs`;

  if (filteredJobs.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
      <div style="font-size:3rem;margin-bottom:16px;">🔍</div>
      <h3 style="margin-bottom:8px;">No jobs found</h3>
      <p>Try adjusting your filters or search terms.</p>
    </div>`;
    return;
  }

  const typeBadge = { 'Full Time':'badge-success', 'Part Time':'badge-info', 'Freelance':'badge-warning', 'Contract':'badge-error' };
  const user = getCurrentUser();
  const appliedIds = (user?.applications || []).map(a => String(a.jobId));

  grid.innerHTML = visible.map(job => {
    const alreadyApplied = appliedIds.includes(String(job.id));
    const isNew = job.source === 'employer';
    const deadlineHtml = job.deadline
      ? `<span class="job-tag" style="color:#f97316;">🗓️ Deadline: ${new Date(job.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>`
      : '';
    const skillsHtml = (job.skills||[]).length
      ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">${job.skills.slice(0,4).map(s=>`<span style="font-size:0.72rem;padding:2px 8px;border-radius:16px;background:rgba(249,115,22,0.1);color:var(--primary);border:1px solid rgba(249,115,22,0.2);">${s}</span>`).join('')}</div>`
      : '';

    return `
    <div class="job-card" style="position:relative;">
      ${isNew ? `<div style="position:absolute;top:14px;right:14px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:0.68rem;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.03em;">✨ NEW POST</div>` : ''}
      <div class="job-card-header">
        <div style="display:flex;align-items:flex-start;gap:14px;flex:1;">
          <div class="job-company-logo" style="background:${job.iconBg}">${job.icon}</div>
          <div>
            <div class="job-title">${job.title}</div>
            <div class="job-company">🏢 ${job.company}</div>
          </div>
        </div>
        <span class="badge ${typeBadge[job.type] || 'badge-info'} job-type-badge">${job.type}</span>
      </div>
      <div class="job-detail-tags">
        <span class="job-tag">📍 ${job.location}</span>
        <span class="job-tag">🎯 ${job.experience}</span>
        <span class="job-tag">🛠️ ${job.category}</span>
        <span class="job-tag">🕒 ${job.posted}</span>
        ${job.openings > 1 ? `<span class="job-tag">👥 ${job.openings} openings</span>` : ''}
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
            ${alreadyApplied ? 'disabled style="opacity:.6;cursor:not-allowed;"' : ''}>
            ${alreadyApplied ? '✓ Applied' : 'Apply Now →'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('loadMoreBtn').style.display = displayedCount >= filteredJobs.length ? 'none' : 'inline-flex';
}

function loadMore() {
  displayedCount += 6;
  renderJobs();
}

function clearFilters() {
  document.querySelectorAll('.f-category, .f-type, .f-exp').forEach(el => el.checked = false);
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

/* ── Apply (handles both static & employer-posted jobs) ── */
function applyJob(id) {
  const user = getCurrentUser();
  if (!user) {
    localStorage.setItem('redirectAfterLogin', 'jobs.html');
    showToast('Please sign in to apply for jobs.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  if (user.role === 'employer') {
    showToast('Switch to a worker account to apply for jobs.', 'error');
    return;
  }

  const job = ALL_JOBS.find(j => String(j.id) === String(id));
  if (!job) return;

  // Check if already applied
  const existing = (user.applications || []).find(a => String(a.jobId) === String(job.id));
  if (existing) {
    showToast('You have already applied to this job!', 'info');
    return;
  }

  // Build application record
  const newApp = {
    id:        Date.now(),
    jobId:     job.id,
    title:     job.title,
    employer:  job.company,
    location:  job.location,
    pay:       job.payLabel,
    type:      job.type,
    icon:      job.icon,
    iconBg:    job.iconBg,
    status:    'pending',
    appliedOn: new Date().toISOString(),
    date:      'Just now',
    source:    job.source || 'static',
    _postId:   job._postId || null,
    _ownerKey: job._ownerKey || null,
  };

  const updatedApps = [...(user.applications || []), newApp];
  const updatedUser = { ...user, applications: updatedApps };
  setCurrentUser(updatedUser);

  // Persist in user list
  const allUsers = JSON.parse(localStorage.getItem('sc_users') || '[]');
  const idx = allUsers.findIndex(u => u.email === user.email);
  if (idx > -1) { allUsers[idx] = { ...allUsers[idx], applications: updatedApps }; localStorage.setItem('sc_users', JSON.stringify(allUsers)); }

  // If it's an employer-posted job → add applicant to that employer's post
  if (job.source === 'employer' && job._ownerKey && job._postId) {
    const posts = JSON.parse(localStorage.getItem(job._ownerKey) || '[]');
    const pIdx  = posts.findIndex(p => p.id === job._postId);
    if (pIdx > -1) {
      if (!posts[pIdx].applicants) posts[pIdx].applicants = [];
      // avoid duplicate
      if (!posts[pIdx].applicants.find(a => a.email === user.email)) {
        posts[pIdx].applicants.push({
          name:      user.name,
          email:     user.email,
          phone:     user.phone || '—',
          trade:     user.trade || '—',
          city:      user.city || '—',
          status:    'pending',
          appliedOn: new Date().toISOString(),
        });
        localStorage.setItem(job._ownerKey, JSON.stringify(posts));
      }
    }
  }

  showToast(`✅ Applied to "${job.title}"! Track status in My Applications.`, 'success');

  // Update button
  const btn = document.getElementById(`applyBtn_${id}`);
  if (btn) { btn.textContent = '✓ Applied'; btn.disabled = true; btn.style.opacity = '0.6'; }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  buildJobsList();  // merge employer + static

  const params = new URLSearchParams(window.location.search);
  const q   = params.get('q');
  const cat = params.get('category');
  if (q)   document.getElementById('jobSearch').value = q;
  if (cat) {
    const checkbox = document.querySelector(`.f-category[value="${cat.charAt(0).toUpperCase() + cat.slice(1)}"]`);
    if (checkbox) checkbox.checked = true;
  }
  filterJobs();
});
