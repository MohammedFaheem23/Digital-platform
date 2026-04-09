/* ============================
   Auth JavaScript – Supabase
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
function prevStep(step) { goToStep(step); }

function goToStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById('step' + step)?.classList.add('active');

  for (let i = 1; i <= 3; i++) {
    const dot  = document.getElementById('stepDot' + i);
    const line = document.getElementById('stepLine' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'completed');
    if (i < step)      { dot.classList.add('completed'); dot.textContent = '✓'; }
    else if (i === step){ dot.classList.add('active');    dot.textContent = i;  }
    else                { dot.textContent = i; }
    if (line) line.classList.toggle('active', i < step);
  }
  currentStep = step;
}

function validateStep(step) {
  if (step === 1) {
    const name  = document.getElementById('regName')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    if (!name  || name.length < 2)   { showAlert('Please enter your full name.', 'error', 'registerAlert'); return false; }
    if (!phone || phone.length < 10)  { showAlert('Please enter a valid phone number.', 'error', 'registerAlert'); return false; }
    if (!email || !email.includes('@')){ showAlert('Please enter a valid email address.', 'error', 'registerAlert'); return false; }
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
  const workerFields   = document.getElementById('workerFields');
  const employerFields = document.getElementById('employerFields');
  if (role === 'employer') {
    workerFields   && (workerFields.style.display   = 'none');
    employerFields && (employerFields.style.display = 'block');
  } else {
    workerFields   && (workerFields.style.display   = 'block');
    employerFields && (employerFields.style.display = 'none');
  }
}

document.querySelectorAll('input[name="role"]').forEach(r => r.addEventListener('change', updateRoleView));

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
async function demoLogin(role) {
  const demos = {
    worker:   { email: 'demo.worker@skillconnect.in',   password: 'Demo@1234' },
    employer: { email: 'demo.employer@skillconnect.in',  password: 'Demo@1234' },
  };
  const creds = demos[role];
  if (!creds) return;

  try {
    const user = await sbLogin(creds.email, creds.password);
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! 👋`, 'success');
    setTimeout(() => {
      window.location.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    }, 800);
  } catch (err) {
    // Demo account may not exist – auto-create it
    showToast('Setting up demo account…', 'info');
    try {
      const demoData = role === 'worker'
        ? { name:'Demo Worker', phone:'9999900000', role:'worker', trade:'Electrician', city:'Delhi', experience:'5 yrs', rate:'₹800/hr', company:'' }
        : { name:'Demo Employer', phone:'9999911111', role:'employer', trade:'', city:'Mumbai', experience:'', rate:'', company:'Demo Corp' };

      const user = await sbRegister({ ...demoData, email: creds.email, password: creds.password });
      setCurrentUser(user);
      showToast(`Welcome, ${user.name}! 🎉`, 'success');
      setTimeout(() => {
        window.location.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
      }, 800);
    } catch (e) {
      showToast('Demo login failed. Please register manually.', 'error');
    }
  }
}

// ---- Handle Login ----
async function handleLogin(e) {
  e.preventDefault();

  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const btn      = document.getElementById('loginSubmitBtn');
  const btnText  = document.getElementById('loginBtnText');
  const spinner  = document.getElementById('loginSpinner');

  let valid = true;
  if (!email || !email.includes('@')) { document.getElementById('emailError')?.classList.add('show');    valid = false; }
  else                                 { document.getElementById('emailError')?.classList.remove('show'); }
  if (!password || password.length < 6){ document.getElementById('passwordError')?.classList.add('show');    valid = false; }
  else                                  { document.getElementById('passwordError')?.classList.remove('show'); }
  if (!valid) return;

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  try {
    const user = await sbLogin(email, password);
    setCurrentUser(user);
    showAlert('Login successful! Redirecting…', 'success', 'loginAlert');
    setTimeout(() => {
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) { localStorage.removeItem('redirectAfterLogin'); window.location.href = redirect; }
      else { window.location.href = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html'; }
    }, 800);
  } catch (err) {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    showAlert('Invalid email or password. Please try again.', 'error', 'loginAlert');
  }
}

// ---- Handle Register ----
async function handleRegister(e) {
  e.preventDefault();

  if (!validateStep(2)) { prevStep(2); return; }

  const password   = document.getElementById('regPassword')?.value;
  const confirmPwd = document.getElementById('regConfirmPwd')?.value;
  const terms      = document.getElementById('termsAgreed')?.checked;

  if (password !== confirmPwd) { document.getElementById('confirmPwdError')?.classList.add('show'); return; }
  if (!terms)    { showAlert('Please agree to the Terms of Service.', 'error', 'registerAlert'); return; }
  if (password.length < 6) { showAlert('Password must be at least 6 characters.', 'error', 'registerAlert'); return; }

  const role = document.querySelector('input[name="role"]:checked')?.value;
  const btn      = document.getElementById('registerSubmitBtn');
  const btnText  = document.getElementById('registerBtnText');
  const spinner  = document.getElementById('registerSpinner');

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  try {
    const user = await sbRegister({
      name:       document.getElementById('regName')?.value.trim(),
      phone:      document.getElementById('regPhone')?.value.trim(),
      email:      document.getElementById('regEmail')?.value.trim(),
      password,
      role,
      trade:      document.getElementById('regTrade')?.value || null,
      experience: document.getElementById('regExperience')?.value || null,
      rate:       document.getElementById('regRate')?.value || null,
      company:    document.getElementById('regCompany')?.value || null,
      city:       document.getElementById('regCity')?.value.trim(),
    });

    setCurrentUser(user);
    showToast(`Welcome to SkillConnect, ${user.name}! 🎉`, 'success');
    setTimeout(() => {
      window.location.href = role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    }, 1000);
  } catch (err) {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    const msg = err.message?.includes('already registered')
      ? 'An account with this email already exists. Try logging in.'
      : err.message || 'Registration failed. Please try again.';
    showAlert(msg, 'error', 'registerAlert');
  }
}

// ---- Social Login ----
async function socialLogin(provider) {
  if (provider === 'google') {
    try {
      await sbLoginWithGoogle();
    } catch (e) {
      showAlert('Google login failed. Please try again.', 'error', 'loginAlert');
    }
  } else {
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'info');
  }
}

// ---- Redirect if already logged in ----
document.addEventListener('DOMContentLoaded', async () => {
  updateRoleView();
  // Wait for the async session restore in supabase.js
  if(typeof initSession==="function"){await initSession();}else{await new Promise(r=>setTimeout(r,600));}
  const user = getCurrentUser();
  if (user && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
    const dest = user.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-worker.html';
    showToast(`Welcome back, ${user.name}!`, 'info');
    setTimeout(() => window.location.href = dest, 500);
  }
});
