/* ============================
   SkillConnect – Global JS
   ============================ */

// ---- Navigation ----
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
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

// ---- Auth State ----
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('sc_user') || 'null');
  } catch { return null; }
}

function setCurrentUser(user) {
  localStorage.setItem('sc_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('sc_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'home.html', 800);
}

// ---- Update Navbar for Auth ----
function updateNavbarAuth() {
  const user      = getCurrentUser();
  const loginBtn  = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  // ── Role-based nav link visibility ──
  // Give each link a stable id if not already set, then toggle
  const allNavLinks = document.querySelectorAll('#navLinks .nav-link, #navLinks a');
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const isFindJobs    = href.includes('jobs.html');
    const isHireWorkers = href.includes('hire.html');

    if (!user) {
      // Logged out → show everything
      link.closest('li')?.style.removeProperty('display');
      link.style.removeProperty('display');
      return;
    }

    if (user.role === 'employer') {
      // Employers: hide "Find Jobs", keep "Hire Workers"
      if (isFindJobs) {
        (link.closest('li') || link).style.display = 'none';
      } else {
        (link.closest('li') || link).style.removeProperty('display');
      }
    } else {
      // Workers: hide "Hire Workers", keep "Find Jobs"
      if (isHireWorkers) {
        (link.closest('li') || link).style.display = 'none';
      } else {
        (link.closest('li') || link).style.removeProperty('display');
      }
    }
  });

  if (!user || !loginBtn) return;

  loginBtn.textContent = user.name?.split(' ')[0] || 'Profile';
  loginBtn.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
  signupBtn.textContent = 'Dashboard';
  signupBtn.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
}

// ---- Animate numbers ----
function animateNumbers() {
  const numbers = document.querySelectorAll('[data-target]');
  numbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, duration / steps);
  });
}

// ---- Intersection Observer for Animations ----
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        if (entry.target.hasAttribute('data-target')) {
          animateNumbers();
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card, .category-card, .worker-profile-card, .feature-item, .trust-badge').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // trigger number animation when stats enter view
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateNumbers();
        statsObserver.disconnect();
      }
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }
}

// Add CSS for fade-in
const style = document.createElement('style');
style.textContent = `.fade-in { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
  setupScrollAnimations();
});
