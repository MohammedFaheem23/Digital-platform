/* ============================
   Worker Dashboard JS – Dynamic
   ============================ */

// ---- Job pool filtered by trade ----
const ALL_JOBS_POOL = [
  { title: 'Senior Electrician Needed', company: 'ABC Construction', location: 'Delhi', pay: '₹900/day', type: 'Full Time', icon: '⚡', trade: 'electrician' },
  { title: 'Home Wiring & Repair Work', company: 'HomeServe Inc.', location: 'Noida', pay: '₹1,200/day', type: 'Freelance', icon: '🔌', trade: 'electrician' },
  { title: 'Electrical Panel Installation', company: 'BuildRight Co.', location: 'Gurgaon', pay: '₹15,000', type: 'Contract', icon: '⚡', trade: 'electrician' },
  { title: 'Solar Panel Technician', company: 'SolarTech Ltd', location: 'Pune', pay: '₹1,100/day', type: 'Full Time', icon: '☀️', trade: 'electrician' },
  { title: 'Bathroom Plumbing Fix', company: 'HomeCare Services', location: 'Bangalore', pay: '₹700/day', type: 'Freelance', icon: '🔧', trade: 'plumber' },
  { title: 'New Pipeline Installation', company: 'GreenBuild Co.', location: 'Chennai', pay: '₹1,000/day', type: 'Contract', icon: '🚰', trade: 'plumber' },
  { title: 'Industrial Plumbing – Factory', company: 'IndTech Works', location: 'Surat', pay: '₹25,000', type: 'Full Time', icon: '🔧', trade: 'plumber' },
  { title: 'Custom Cabinet Work', company: 'DreamHome Corp', location: 'Bengaluru', pay: '₹900/day', type: 'Freelance', icon: '🪚', trade: 'carpenter' },
  { title: 'Wooden Flooring – 3BHK', company: 'Interiors Plus', location: 'Hyderabad', pay: '₹20,000', type: 'Contract', icon: '🪵', trade: 'carpenter' },
  { title: 'Steel Welding – Structural', company: 'BuildMax Ltd', location: 'Mumbai', pay: '₹1,100/day', type: 'Full Time', icon: '🔥', trade: 'welder' },
  { title: 'Pipe Welding – Factory Unit', company: 'MetalPro Inc.', location: 'Nashik', pay: '₹950/day', type: 'Contract', icon: '🔩', trade: 'welder' },
  { title: 'Interior House Painting', company: 'ColorCraft Homes', location: 'Kochi', pay: '₹600/day', type: 'Freelance', icon: '🎨', trade: 'painter' },
  { title: '2BHK Full Paint Job', company: 'HomeFresh Pvt', location: 'Thiruvananthapuram', pay: '₹12,000', type: 'Contract', icon: '🖌️', trade: 'painter' },
  { title: 'Brick Masonry – House Wall', company: 'ClassicBuild Co.', location: 'Lucknow', pay: '₹750/day', type: 'Full Time', icon: '🧱', trade: 'mason' },
  { title: 'RCC Column Work', company: 'SmartBuild Pvt', location: 'Jaipur', pay: '₹850/day', type: 'Contract', icon: '🏗️', trade: 'mason' },
  { title: 'AC Service & Repair', company: 'CoolTech Services', location: 'Ahmedabad', pay: '₹800/day', type: 'Freelance', icon: '❄️', trade: 'hvac' },
  { title: 'Duct Installation – Office', company: 'AirFlow Pro', location: 'Delhi', pay: '₹1,200/day', type: 'Full Time', icon: '🌬️', trade: 'hvac' },
  { title: 'Tile Flooring – Bathroom', company: 'TileArt Homes', location: 'Pune', pay: '₹700/day', type: 'Freelance', icon: '🪟', trade: 'tiler' },
  { title: 'Security Guard – Night Shift', company: 'SecureGuard Pvt', location: 'Bangalore', pay: '₹600/day', type: 'Full Time', icon: '🔐', trade: 'security' },
  { title: 'Driver – Corporate Cab', company: 'FlexDrive Ltd', location: 'Mumbai', pay: '₹700/day', type: 'Contract', icon: '🚗', trade: 'driver' },
  { title: 'Roofing Repair Work', company: 'TopBuild Services', location: 'Nagpur', pay: '₹800/day', type: 'Freelance', icon: '🏠', trade: 'roofer' },
  // Generic fallback (other)
  { title: 'General Labour Position', company: 'WorkPlus Ltd', location: 'Nearby Location', pay: '₹550/day', type: 'Full Time', icon: '🛠️', trade: 'other' },
  { title: 'Skilled Tradesman Needed', company: 'AllCraft India', location: 'Your City', pay: '₹650/day', type: 'Freelance', icon: '⚙️', trade: 'other' },
];

const EARNINGS_DATA = [
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 0 },
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
];

// ---- Compute profile completeness ----
function getProfileCompletion(user) {
  let score = 0;
  const fields = ['name', 'email', 'phone', 'city', 'trade', 'experience', 'rate'];
  fields.forEach(f => { if (user[f]) score++; });
  return Math.round((score / fields.length) * 100);
}

// ---- Get relevant jobs for user ----
function getRecommendedJobs(user) {
  const trade = (user?.trade || 'other').toLowerCase();
  const city = (user?.city || '').toLowerCase();
  
  // First try trade match
  let matched = ALL_JOBS_POOL.filter(j => j.trade === trade);
  
  // If no trade match, show other/generic jobs
  if (matched.length === 0) {
    matched = ALL_JOBS_POOL.filter(j => j.trade === 'other');
  }
  
  // Sort: prefer city matches first
  matched.sort((a, b) => {
    const aCityMatch = city && a.location.toLowerCase().includes(city.split(',')[0].toLowerCase().trim());
    const bCityMatch = city && b.location.toLowerCase().includes(city.split(',')[0].toLowerCase().trim());
    if (aCityMatch && !bCityMatch) return -1;
    if (!aCityMatch && bCityMatch) return 1;
    return 0;
  });
  
  return matched.slice(0, 3);
}

function initDashboard() {
  const user = getCurrentUser();
  
  // ---- Greeting ----
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';
  document.getElementById('greetingText').textContent = `${greeting}, ${firstName}! 👋`;

  // ---- Profile completion-based subtext ----
  const completion = getProfileCompletion(user || {});
  const subEl = document.getElementById('greetingSubtext');
  if (subEl) {
    if (completion < 60) {
      subEl.innerHTML = `Complete your profile to start getting <strong>job recommendations</strong> near you.`;
    } else {
      const tradeLabel = (user?.trade || 'your trade').charAt(0).toUpperCase() + (user?.trade || '').slice(1);
      subEl.innerHTML = `We found <strong>job opportunities</strong> matching your <strong>${tradeLabel}</strong> skills today.`;
    }
  }

  // ---- Avatar ----
  if (user) {
    const ava = user.avatar || user.name?.[0]?.toUpperCase() || 'U';
    document.getElementById('userAva').textContent = ava;
    document.getElementById('userName').textContent = firstName;
  }

  // ---- Stats – new user gets zeroed stats ----
  const statsData = {
    jobsApplied: user?.stats?.jobsApplied ?? 0,
    jobsCompleted: user?.stats?.jobsCompleted ?? 0,
    totalEarned: user?.stats?.totalEarned ?? 0,
    rating: user?.stats?.rating ?? 0,
    reviews: user?.stats?.reviews ?? 0,
  };
  
  const statCards = document.querySelectorAll('.stat-card-value');
  if (statCards[0]) statCards[0].textContent = statsData.jobsApplied;
  if (statCards[1]) statCards[1].textContent = statsData.jobsCompleted;
  if (statCards[2]) {
    statCards[2].textContent = statsData.totalEarned > 0 ? '₹' + statsData.totalEarned.toLocaleString() : '₹0';
  }
  if (statCards[3]) statCards[3].textContent = statsData.rating > 0 ? statsData.rating : '—';

  // ---- Stat change subtexts ----
  const changeEls = document.querySelectorAll('.stat-card-change');
  if (changeEls[0]) {
    changeEls[0].textContent = statsData.jobsApplied > 0 ? `↑ Recent activity` : 'No applications yet';
    changeEls[0].className = 'stat-card-change' + (statsData.jobsApplied > 0 ? ' up' : '');
  }
  if (changeEls[1]) {
    changeEls[1].textContent = statsData.jobsCompleted > 0 ? `↑ Great work!` : 'None yet';
    changeEls[1].className = 'stat-card-change' + (statsData.jobsCompleted > 0 ? ' up' : '');
  }
  if (changeEls[2]) {
    changeEls[2].textContent = statsData.totalEarned > 0 ? `↑ Growing!` : 'Start applying to earn';
    changeEls[2].className = 'stat-card-change' + (statsData.totalEarned > 0 ? ' up' : '');
  }
  if (changeEls[3]) {
    changeEls[3].textContent = statsData.reviews > 0 ? `${statsData.reviews} total reviews` : 'No reviews yet';
    changeEls[3].className = 'stat-card-change';
  }

  // ---- Profile alert ----
  const profileAlert = document.getElementById('profileAlert');
  if (profileAlert) {
    if (completion >= 100) {
      profileAlert.style.display = 'none';
    } else {
      profileAlert.innerHTML = `📝 Your profile is <strong style="color:var(--accent)">${completion}% complete</strong>. ${completion < 50 ? 'Complete it to get job matches!' : 'Almost there — finish your profile for 3x more matches!'} <a href="#" style="color:var(--accent);font-weight:700;margin-left:auto;white-space:nowrap;">Complete Now →</a>`;
    }
  }

  // ---- Sidebar badge for pending applications ----
  const apps = user?.applications || [];
  const pendingCount = apps.filter(a => a.status === 'pending' || a.status === 'shortlisted').length;
  const badge = document.getElementById('appsSidebarBadge');
  if (badge) {
    if (pendingCount > 0) { badge.textContent = pendingCount; badge.style.display = ''; }
    else badge.style.display = 'none';
  }

  renderRecommendedJobs(user);
  renderApplications(user);
  renderMessages(user);
  renderMonthlyStats(user);
  renderEarningsChart(user);
}

function renderRecommendedJobs(user) {
  const container = document.getElementById('recommendedJobs');
  if (!container) return;
  
  const jobs = getRecommendedJobs(user);
  
  if (jobs.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">
      <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
      <p>Complete your profile to see personalized job recommendations.</p>
      <a href="#" class="btn btn-primary btn-sm" style="margin-top:12px;">Complete Profile</a>
    </div>`;
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
    </div>
  `).join('');
}

function renderApplications(user) {
  const tbody = document.getElementById('applicationsTable');
  if (!tbody) return;

  const apps = user?.applications || [];

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">
      <div style="font-size:2rem;margin-bottom:8px;">📋</div>
      <p>No applications yet.</p>
      <a href="jobs.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Browse Jobs</a>
    </td></tr>`;
    return;
  }

  const statusMap = {
    'pending':     { cls:'badge-warning',  label:'Under Review' },
    'shortlisted': { cls:'badge-info',     label:'Shortlisted ⭐' },
    'selected':    { cls:'badge-success',  label:'Selected ✅' },
    'rejected':    { cls:'badge-error',    label:'Not Selected' },
    'withdrawn':   { cls:'',              label:'Withdrawn' },
  };

  // Show latest 5 on dashboard
  const recent = [...apps].reverse().slice(0, 5);

  tbody.innerHTML = recent.map(app => {
    const s = statusMap[app.status] || { cls:'badge-warning', label:'Under Review' };
    const date = app.appliedOn
      ? new Date(app.appliedOn).toLocaleDateString('en-IN', { day:'numeric', month:'short' })
      : app.date || 'Recently';
    return `
    <tr style="cursor:pointer;" onclick="window.location.href='my-applications.html'">
      <td><strong>${app.title}</strong></td>
      <td>${app.employer || app.company || '—'}</td>
      <td>📍 ${app.location || '—'}</td>
      <td style="font-weight:700;color:var(--primary);">${app.pay || '—'}</td>
      <td style="color:var(--text-muted);">${date}</td>
      <td><span class="badge ${s.cls}">${s.label}</span></td>
    </tr>`;
  }).join('');
}

function renderMessages(user) {
  const container = document.getElementById('recentMessages');
  if (!container) return;
  
  // New user: empty messages
  const messages = user?.messages || [];
  
  if (messages.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">
      <div style="font-size:1.5rem;margin-bottom:6px;">💬</div>
      <p style="font-size:0.85rem;">No messages yet. Apply to jobs to start connecting with employers.</p>
    </div>`;
    return;
  }
  
  container.innerHTML = messages.map(m => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" onmouseenter="this.style.opacity='0.7'" onmouseleave="this.style.opacity='1'">
      <div style="width:36px;height:36px;border-radius:50%;background:${m.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0;color:white;">${m.avatar}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.875rem;font-weight:600;margin-bottom:2px;">${m.name}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.msg}</div>
      </div>
      <div style="font-size:0.72rem;color:var(--text-muted);flex-shrink:0;">${m.time}</div>
    </div>
  `).join('');
}

function renderMonthlyStats(user) {
  // Monthly stats for new user — all zeros
  const stats = user?.monthlyStats || { profileViews: 0, employerContacts: 0, jobsWon: 0, responseTime: '—' };
  const els = document.querySelectorAll('.dashboard-content .widget-body span[style*="font-weight:700"]');
  // We target by stable IDs added in HTML instead
  const pvEl = document.getElementById('statProfileViews');
  const ecEl = document.getElementById('statEmployerContacts');
  const jwEl = document.getElementById('statJobsWon');
  const rtEl = document.getElementById('statResponseTime');
  
  if (pvEl) pvEl.textContent = stats.profileViews;
  if (ecEl) ecEl.textContent = stats.employerContacts;
  if (jwEl) jwEl.textContent = stats.jobsWon;
  if (rtEl) rtEl.textContent = stats.responseTime;
}

function renderEarningsChart(user) {
  const chart = document.getElementById('earningsChart');
  const labels = document.getElementById('earningsChartLabels');
  if (!chart || !labels) return;
  
  // For new users, earnings are all 0
  const earnings = user?.earnings || EARNINGS_DATA;
  const max = Math.max(...earnings.map(d => d.amount), 1);
  
  if (earnings.every(d => d.amount === 0)) {
    chart.innerHTML = `<div style="width:100%;text-align:center;color:var(--text-muted);font-size:0.85rem;display:flex;align-items:center;justify-content:center;gap:8px;">
      <span>📊</span> <span>Your earnings chart will appear here once you complete jobs.</span>
    </div>`;
    labels.innerHTML = '';
    return;
  }
  
  chart.innerHTML = earnings.map(d => {
    const height = (d.amount / max) * 100;
    const isLast = d === earnings[earnings.length - 1];
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;" title="${d.month}: ₹${d.amount.toLocaleString()}">
        <div style="font-size:0.72rem;color:${isLast ? 'var(--primary)' : 'var(--text-muted)'}">₹${Math.round(d.amount/1000)}k</div>
        <div style="width:100%;border-radius:6px 6px 0 0;background:${isLast ? 'var(--gradient-primary)' : 'rgba(249,115,22,0.2)'};height:${height}%;min-height:8px;transition:transform 0.2s;" onmouseenter="this.style.transform='scaleY(1.05)'" onmouseleave="this.style.transform='scaleY(1)'"></div>
      </div>
    `;
  }).join('');
  
  labels.innerHTML = earnings.map(d => `<div style="flex:1;text-align:center;font-size:0.72rem;color:var(--text-muted);">${d.month}</div>`).join('');
}


/* ── Availability Toggle ── */
function initAvailability(user) {
  const key     = `sc_availability_${user.email}`;
  const stored  = localStorage.getItem(key);
  const isAvail = stored === null ? true : stored === 'true'; // default: available
  applyAvailabilityUI(isAvail);
}

function toggleAvailability() {
  const user = getCurrentUser();
  if (!user) return;
  const key = `sc_availability_${user.email}`;
  // Read current stored state and flip it
  const stored  = localStorage.getItem(key);
  const wasAvail = stored === null ? true : stored === 'true';
  const isAvail  = !wasAvail;
  localStorage.setItem(key, String(isAvail));
  applyAvailabilityUI(isAvail);
  showToast(
    isAvail ? '🟢 You are now visible to employers!' : '⚫ You are now hidden from employers.',
    isAvail ? 'success' : 'info'
  );
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
    if (knob)   knob.style.left = '28px';
    if (banner) { banner.style.borderColor = 'rgba(52,211,153,0.3)'; banner.style.background = 'rgba(52,211,153,0.05)'; }
    if (since)  since.textContent = 'Open to new opportunities';
  } else {
    if (dot)    { dot.style.background = '#6b7280'; dot.style.boxShadow = 'none'; }
    if (label)  label.textContent = '⚫ Not Available';
    if (slider) slider.style.background = '#374151';
    if (knob)   knob.style.left = '4px';
    if (banner) { banner.style.borderColor = 'rgba(255,255,255,0.06)'; banner.style.background = '#1a1d26'; }
    if (since)  since.textContent = 'Hidden from employers';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  initDashboard();
  initAvailability(user);
});

