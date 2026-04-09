/* ============================
   SkillConnect – Supabase Client
   ============================ */

const SUPABASE_URL  = 'https://yhpvchnoqnkcazoivrsu.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocHZjaG5vcW5rY2F6b2l2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTgzOTgsImV4cCI6MjA5MTI5NDM5OH0.T959p7P212H_jwKZNKALzbexDQ-VCSaKVMB5GpflXX4';

// Load Supabase client (CDN-loaded via <script> in each HTML before this file)
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ─────────────────────────────────────────
   AUTH HELPERS
───────────────────────────────────────── */

/** Register a new user via Supabase Auth + insert profile row */
async function sbRegister({ name, phone, email, password, role, trade, experience, rate, company, city }) {
  // 1. Create auth user
  const { data: authData, error: authErr } = await db.auth.signUp({ email, password });
  if (authErr) throw authErr;

  const uid = authData.user?.id;
  if (!uid) throw new Error('No user ID returned from sign-up');

  // 2. Insert profile into public.profiles
  const { error: profileErr } = await db.from('profiles').insert({
    id:         uid,
    name,
    phone:      phone  || null,
    email,
    role,
    trade:      trade  || null,
    experience: experience || null,
    rate:       rate   || null,
    company:    company || null,
    city:       city   || null,
    available:  true,
    avatar:     name?.[0]?.toUpperCase() || 'U',
  });
  if (profileErr) throw profileErr;

  // 3. Build safe session object (no password)
  return {
    id: uid, name, phone, email, role,
    trade, experience, rate, company, city,
    available: true,
    avatar: name?.[0]?.toUpperCase() || 'U',
    needsConfirmation: !authData.session
  };
}

/** Private helper to ensure a user has a profile record */
async function _ensureProfile(authUser, extraData = {}) {
  let { data: profile, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !profile) {
    const name = extraData.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
    const newProfile = {
      id: authUser.id,
      name: name,
      email: authUser.email,
      role: extraData.role || 'worker',
      available: true,
      avatar: authUser.user_metadata?.avatar_url || name[0].toUpperCase(),
      phone: extraData.phone || null,
      city: extraData.city || null,
      trade: extraData.trade || null,
      experience: extraData.experience || null,
      rate: extraData.rate || null,
      company: extraData.company || null,
    };
    const { error: insErr } = await db.from('profiles').insert(newProfile);
    if (insErr) { console.error('Failed to create profile:', insErr); }
    return newProfile;
  }
  return profile;
}

/** Sign in with email + password */
async function sbLogin(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error; 

  // Use helper to get/create profile row
  return await _ensureProfile(data.user);
}

/** Sign out */
async function sbLogout() {
  await db.auth.signOut();
}

/** Get currently signed-in user from session */
async function sbGetCurrentUser() {
  const { data: { session }, error: sErr } = await db.auth.getSession();
  if (sErr || !session) return null;

  return await _ensureProfile(session.user);
}

/** Sign in with Google */
async function sbLoginWithGoogle() {
  const { data, error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard.html',
    }
  });
  if (error) throw error;
  return data;
}

/** Reset Password */
async function sbResetPassword(email) {
  const { data, error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login.html', // Or a dedicated reset-password.html
  });
  if (error) throw error;
  return data;
}

/* ─────────────────────────────────────────
   PROFILES / WORKERS
───────────────────────────────────────── */

/** Fetch all worker profiles */
async function sbGetWorkers() {
  const { data, error } = await db
    .from('profiles')
    .select('*, worker_reviews(rating)')
    .eq('role', 'worker');
  if (error) { console.error('sbGetWorkers:', error); return []; }
  return data;
}

/** Update availability for a worker */
async function sbSetAvailability(userId, available) {
  const { error } = await db
    .from('profiles')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/* ─────────────────────────────────────────
   JOB POSTS
───────────────────────────────────────── */

/** Fetch all ACTIVE job posts (for workers browsing) */
async function sbGetActiveJobs() {
  const { data, error } = await db
    .from('job_posts')
    .select('*, profiles(name, company)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetActiveJobs:', error); return []; }
  return data;
}

/** Fetch job posts belonging to the current employer */
async function sbGetMyJobPosts(employerId) {
  const { data, error } = await db
    .from('job_posts')
    .select('*, applications(id, status, worker:profiles(id,name,email,phone,trade,city))')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetMyJobPosts:', error); return []; }
  return data;
}

/** Create a new job post */
async function sbCreateJobPost(employerId, payload) {
  const { data, error } = await db
    .from('job_posts')
    .insert({ ...payload, employer_id: employerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing job post */
async function sbUpdateJobPost(postId, employerId, payload) {
  const { data, error } = await db
    .from('job_posts')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('employer_id', employerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Delete a job post */
async function sbDeleteJobPost(postId, employerId) {
  const { error } = await db
    .from('job_posts')
    .delete()
    .eq('id', postId)
    .eq('employer_id', employerId);
  if (error) throw error;
}

/* ─────────────────────────────────────────
   APPLICATIONS
───────────────────────────────────────── */

/** Apply to a job */
async function sbApplyJob(workerId, jobId) {
  // Prevent duplicate
  const { data: existing } = await db
    .from('applications')
    .select('id')
    .eq('worker_id', workerId)
    .eq('job_id', jobId)
    .maybeSingle();
  if (existing) throw new Error('already_applied');

  const { data, error } = await db
    .from('applications')
    .insert({ worker_id: workerId, job_id: jobId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get all applications for a worker */
async function sbGetMyApplications(workerId) {
  const { data, error } = await db
    .from('applications')
    .select(`
      id, status, created_at,
      job:job_posts(id, title, location, pay, type, trade, employer:profiles(name, company))
    `)
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetMyApplications:', error); return []; }
  return data;
}

/** Update application status (employer action) */
async function sbUpdateApplicationStatus(applicationId, status) {
  const { error } = await db
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (error) throw error;
}

/* ─────────────────────────────────────────
   HIRE REQUESTS
───────────────────────────────────────── */

/** Send a hire request from employer to worker */
async function sbSendHireRequest(employerId, { workerId, desc, startDate, budget, address }) {
  const { data, error } = await db
    .from('hire_requests')
    .insert({
      employer_id: employerId,
      worker_id:   workerId,
      description: desc,
      start_date:  startDate || null,
      budget:      budget    || null,
      address:     address   || null,
      status:      'contacted',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Get hire requests sent by an employer */
async function sbGetMyHireRequests(employerId) {
  const { data, error } = await db
    .from('hire_requests')
    .select('*, worker:profiles!hire_requests_worker_id_fkey(name, trade, city, phone)')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetMyHireRequests:', error); return []; }
  return data;
}

/** Update hire request status */
async function sbUpdateHireStatus(requestId, status) {
  const { error } = await db
    .from('hire_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

/* ─────────────────────────────────────────
   SESSION CACHE (replaces sc_user in localStorage)
   Keep a lightweight session cache for synchronous getCurrentUser() calls
───────────────────────────────────────── */

let _sessionCache = null;

function getCurrentUser()  { return _sessionCache; }
function setCurrentUser(u) { _sessionCache = u; }

let _sessionPromise = null;
async function initSession() {
  if (!_sessionPromise) {
    _sessionPromise = sbGetCurrentUser().then(user => {
      if (user) _sessionCache = user;
    });
  }
  await _sessionPromise;
}

// Start fetching session in the background proactively
initSession();

/** Update worker or employer profile */
async function sbUpdateProfile(userId, payload) {
  const { data, error } = await db
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  _sessionCache = { ..._sessionCache, ...data }; // update session cache
  return data;
}

/** Get reviews left for a worker */
async function sbGetWorkerReviews(workerId) {
  const { data, error } = await db
    .from('worker_reviews')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetWorkerReviews:', error); return []; }
  return data;
}

/** Submit a review for a worker */
async function sbSubmitReview(payload) {
  const { data, error } = await db
    .from('worker_reviews')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Upload profile photo to Supabase Storage */
async function sbUploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await db.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = db.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrl;
}
