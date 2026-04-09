/* ============================
   Auth JavaScript
   ============================ */

// ---- Password Toggle ----
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

// ---- Password Strength ----
function checkPasswordStrength(password) {
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  if (!fill || !text) return;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { class: '', label: 'Enter a password', color: '' },
    { class: 'weak', label: '🔴 Weak', color: '#ef4444' },
    { class: 'fair', label: '🟡 Fair', color: '#f59e0b' },
    { class: 'good', label: '🔵 Good', color: '#3b82f6' },
    { class: 'strong', label: '🟢 Strong', color: '#10b981' },
  ];

  fill.className = 'strength-fill ' + (levels[score]?.class || '');
  text.textContent = levels[score]?.label || '';
  text.style.color = levels[score]?.color || 'var(--text-muted)';
}

// ---- Multi-step Registration ----
let currentStep = 1;

function nextStep(step) {
  if (!validateStep(currentStep)) return;
  goToStep(step);
}

function prevStep(step) {
  goToStep(step);
}

function goToStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById('step' + step)?.classList.add('active');

  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('stepDot' + i);
    const line = document.getElementById('stepLine' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'completed');
    if (i < step) dot.classList.add('completed'), dot.textContent = '✓';
    else if (i === step) dot.classList.add('active'), dot.textContent = i;
    else dot.textContent = i;
    if (line) {
      line.classList.toggle('active', i < step);
    }
  }
  currentStep = step;
}

function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('regName')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    if (!name || name.length < 2) { showAlert('Please enter your full name.', 'error', 'registerAlert'); return false; }
    if (!phone || phone.length < 10) { showAlert('Please enter a valid phone number.', 'error', 'registerAlert'); return false; }
    if (!email || !email.includes('@')) { showAlert('Please enter a valid email address.', 'error', 'registerAlert'); return false; }
    hideAlert('registerAlert');
  }
  if (step === 2) {
    const city = document.getElementById('regCity')?.value.trim();
    if (!city) { showAlert('Please enter your city/location.', 'error', 'registerAlert'); return false; }
    hideAlert('registerAlert');
  }
  return true;
}

function updateRoleView() {
  const role = document.querySelector('input[name="role"]:checked')?.value;
  const workerFields = document.getElementById('workerFields');
  const employerFields = document.getElementById('employerFields');
  if (role === 'employer') {
    workerFields && (workerFields.style.display = 'none');
    employerFields && (employerFields.style.display = 'block');
  } else {
    workerFields && (workerFields.style.display = 'block');
    employerFields && (employerFields.style.display = 'none');
  }
}

document.querySelectorAll('input[name="role"]').forEach(r => {
  r.addEventListener('change', updateRoleView);
});

// ---- Show/Hide Alert ----
function showAlert(message, type, alertId) {
  const alert = document.getElementById(alertId);
  if (!alert) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `${icons[type] || ''} ${message}`;
  alert.style.display = 'flex';
  setTimeout(() => hideAlert(alertId), 5000);
}

function hideAlert(alertId) {
  const alert = document.getElementById(alertId);
  if (alert) alert.style.display = 'none';
}

// ---- Demo Login ----
function demoLogin(role) {
  const demos = {
    worker: { name: 'Rajesh Sharma', email: 'demo.worker@skillconnect.in', role: 'worker', trade: 'Electrician', city: 'Delhi' },
    employer: { name: 'Priya Mehta Corp', email: 'demo.employer@skillconnect.in', role: 'employer', company: 'ABC Constructions', city: 'Mumbai' }
  };
  const user = demos[role];
  if (!user) return;
  setCurrentUser(user);
  showToast(`Welcome back, ${user.name}! 👋`, 'success');
  setTimeout(() => {
    const redirect = localStorage.getItem('redirectAfterLogin');
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirect;
    } else {
      window.location.href = role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    }
  }, 800);
}

// ---- Handle Login ----
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const btn = document.getElementById('loginSubmitBtn');
  const btnText = document.getElementById('loginBtnText');
  const spinner = document.getElementById('loginSpinner');

  // Validation
  let valid = true;
  if (!email || !email.includes('@')) {
    document.getElementById('emailError')?.classList.add('show');
    valid = false;
  } else {
    document.getElementById('emailError')?.classList.remove('show');
  }
  if (!password || password.length < 6) {
    document.getElementById('passwordError')?.classList.add('show');
    valid = false;
  } else {
    document.getElementById('passwordError')?.classList.remove('show');
  }
  if (!valid) return;

  // Show loading
  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  // Simulate API call
  setTimeout(() => {
    // Check stored users
    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    const user = users.find(u => u.email === email);

    if (user && user.password === btoa(password)) {
      const { password: _, ...safeUser } = user;
      setCurrentUser(safeUser);
      showAlert('Login successful! Redirecting...', 'success', 'loginAlert');
      setTimeout(() => {
        const redirect = localStorage.getItem('redirectAfterLogin');
        if (redirect) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirect;
        } else {
          window.location.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
        }
      }, 800);
    } else {
      btn.disabled = false;
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      showAlert('Invalid email or password. Try the demo buttons below!', 'error', 'loginAlert');
    }
  }, 1500);
}

// ---- Handle Register ----
function handleRegister(e) {
  e.preventDefault();

  if (!validateStep(2)) { prevStep(2); return; }

  const password = document.getElementById('regPassword')?.value;
  const confirmPwd = document.getElementById('regConfirmPwd')?.value;
  const terms = document.getElementById('termsAgreed')?.checked;

  if (password !== confirmPwd) {
    document.getElementById('confirmPwdError')?.classList.add('show');
    return;
  }
  if (!terms) {
    showAlert('Please agree to the Terms of Service to continue.', 'error', 'registerAlert');
    return;
  }
  if (password.length < 6) {
    showAlert('Password must be at least 6 characters.', 'error', 'registerAlert');
    return;
  }

  const role = document.querySelector('input[name="role"]:checked')?.value;
  const newUser = {
    id: Date.now().toString(),
    name: document.getElementById('regName')?.value.trim(),
    phone: document.getElementById('regPhone')?.value.trim(),
    email: document.getElementById('regEmail')?.value.trim(),
    password: btoa(password), // simple encoding (not production-safe)
    role,
    trade: document.getElementById('regTrade')?.value,
    experience: document.getElementById('regExperience')?.value,
    rate: document.getElementById('regRate')?.value,
    company: document.getElementById('regCompany')?.value,
    city: document.getElementById('regCity')?.value.trim(),
    createdAt: new Date().toISOString(),
    verified: false,
    avatar: (document.getElementById('regName')?.value.trim()[0] || 'U').toUpperCase()
  };

  const btn = document.getElementById('registerSubmitBtn');
  const btnText = document.getElementById('registerBtnText');
  const spinner = document.getElementById('registerSpinner');

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    if (users.find(u => u.email === newUser.email)) {
      btn.disabled = false;
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      showAlert('An account with this email already exists. Try logging in.', 'error', 'registerAlert');
      return;
    }
    users.push(newUser);
    localStorage.setItem('sc_users', JSON.stringify(users));

    const { password: _, ...safeUser } = newUser;
    setCurrentUser(safeUser);
    showToast(`Welcome to SkillConnect, ${newUser.name}! 🎉`, 'success');
    setTimeout(() => {
      window.location.href = role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    }, 1000);
  }, 1500);
}

// ---- Social Login ----
function socialLogin(provider) {
  showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
}

// ---- Redirect if already logged in ----
document.addEventListener('DOMContentLoaded', () => {
  updateRoleView();
  const user = getCurrentUser();
  if (user && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
    const dest = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    showToast(`Welcome back, ${user.name}!`, 'info');
    setTimeout(() => window.location.href = dest, 500);
  }
});
