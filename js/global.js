/* ============================
   SkillConnect – Global JS (Supabase)
   ============================ */

// ---- Navigation ----
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) navbar?.classList.add('scrolled');
  else                      navbar?.classList.remove('scrolled');
});

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks?.classList.toggle('open');
});

// ---- Toast Notifications ----
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- Auth State (delegated to supabase.js) ----
// getCurrentUser() and setCurrentUser() are defined in supabase.js
// logout() uses Supabase signOut

async function logout() {
  try { await sbLogout(); } catch(e) {}
  setCurrentUser(null);
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'home.html', 800);
}

// ---- Update Navbar for Auth ----
function updateNavbarAuth() {
  const user     = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn= document.getElementById('signupBtn');

  const allNavLinks = document.querySelectorAll('#navLinks .nav-link, #navLinks a');
  allNavLinks.forEach(link => {
    const href         = link.getAttribute('href') || '';
    const isFindJobs   = href.includes('jobs.html');
    const isHireWorkers= href.includes('hire.html');

    if (!user) { link.closest('li')?.style.removeProperty('display'); link.style.removeProperty('display'); return; }

    if (user.role === 'employer') {
      if (isFindJobs) (link.closest('li') || link).style.display = 'none';
      else            (link.closest('li') || link).style.removeProperty('display');
    } else {
      if (isHireWorkers) (link.closest('li') || link).style.display = 'none';
      else               (link.closest('li') || link).style.removeProperty('display');
    }
  });

  if (!user || !loginBtn) return;
  loginBtn.textContent = user.name?.split(' ')[0] || 'Profile';
  loginBtn.href  = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
  signupBtn.textContent = 'Dashboard';
  signupBtn.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
}

// ---- Animate numbers ----
function animateNumbers() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target   = parseInt(el.getAttribute('data-target'));
    const duration = 2000, steps = 60, step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); }
      else                   { el.textContent = Math.floor(current).toLocaleString(); }
    }, duration / steps);
  });
}

// ---- Scroll Animations ----
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        if (entry.target.hasAttribute('data-target')) animateNumbers();
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card,.category-card,.worker-profile-card,.feature-item,.trust-badge').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const so = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { animateNumbers(); so.disconnect(); } }, { threshold:0.5 });
    so.observe(statsSection);
  }
}

const style = document.createElement('style');
style.textContent = `.fade-in { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ---- Init ----
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for the async session restore (supabase.js IIFE)
  await new Promise(r => setTimeout(r, 500));
  updateNavbarAuth();
  setupScrollAnimations();
});
