/* ============================
   Home Page JS
   ============================ */

// Featured Workers Data
const WORKERS = [
  {
    name: 'Rajesh Sharma', initial: 'R', trade: 'Master Electrician', location: 'Delhi, India',
    rating: 4.9, reviews: 127, jobs: 312, rate: '₹800', rateUnit: '/hr',
    skills: ['Wiring', 'Solar', 'CCTV', 'Panel Work'],
    gradient: 'linear-gradient(135deg,#f97316,#ea580c)', verified: true
  },
  {
    name: 'Suresh Patel', initial: 'S', trade: 'Senior Plumber', location: 'Mumbai, India',
    rating: 4.8, reviews: 98, jobs: 245, rate: '₹700', rateUnit: '/hr',
    skills: ['Pipe Fitting', 'Drainage', 'Gas Lines', 'Tank Repair'],
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', verified: true
  },
  {
    name: 'Arjun Singh', initial: 'A', trade: 'Expert Carpenter', location: 'Bengaluru, India',
    rating: 4.7, reviews: 74, jobs: 189, rate: '₹650', rateUnit: '/hr',
    skills: ['Furniture', 'Flooring', 'Cabinets', 'Doors'],
    gradient: 'linear-gradient(135deg,#10b981,#059669)', verified: true
  },
  {
    name: 'Mohan Das', initial: 'M', trade: 'Welding Specialist', location: 'Chennai, India',
    rating: 4.9, reviews: 152, jobs: 420, rate: '₹900', rateUnit: '/hr',
    skills: ['MIG', 'TIG', 'Arc Welding', 'Fabrication'],
    gradient: 'linear-gradient(135deg,#f87171,#ef4444)', verified: true
  },
  {
    name: 'Karthik Rajan', initial: 'K', trade: 'House Painter', location: 'Hyderabad, India',
    rating: 4.6, reviews: 63, jobs: 178, rate: '₹500', rateUnit: '/hr',
    skills: ['Interior', 'Exterior', 'Texture', 'Polishing'],
    gradient: 'linear-gradient(135deg,#a78bfa,#7c3aed)', verified: false
  },
  {
    name: 'Vinod Mehta', initial: 'V', trade: 'Mason & Builder', location: 'Pune, India',
    rating: 4.8, reviews: 89, jobs: 267, rate: '₹600', rateUnit: '/hr',
    skills: ['Brickwork', 'Plastering', 'Tiling', 'RCC'],
    gradient: 'linear-gradient(135deg,#fb923c,#ea580c)', verified: true
  }
];

function renderWorkers() {
  const grid = document.getElementById('workersGrid');
  if (!grid) return;
  grid.innerHTML = WORKERS.map(w => `
    <div class="worker-profile-card">
      <div class="wpc-header">
        <div class="wpc-avatar" style="background:${w.gradient}">${w.initial}</div>
        <div class="wpc-info">
          <div class="wpc-name">${w.name}</div>
          <div class="wpc-trade">${w.trade}</div>
          <div class="wpc-location">📍 ${w.location}</div>
        </div>
      </div>
      ${w.verified ? '<div class="wpc-verified">✓ Verified</div>' : ''}
      <div class="wpc-rating">
        <span class="stars">${'★'.repeat(Math.floor(w.rating))}${w.rating % 1 ? '☆' : ''}</span>
        <span class="rating-num">${w.rating}</span>
        <span class="review-count">(${w.reviews} reviews)</span>
      </div>
      <div class="wpc-skills">
        ${w.skills.map(s => `<span class="skill-chip">${s}</span>`).join('')}
      </div>
      <div class="wpc-footer">
        <div>
          <div class="wpc-rate">${w.rate}<span>${w.rateUnit}</span></div>
          <div class="wpc-jobs">${w.jobs} jobs completed</div>
        </div>
        <a href="hire.html" class="btn btn-primary btn-sm" onclick="if(!getCurrentUser()){event.preventDefault();window.location.href='register.html?type=employer';}">Hire Now</a>
      </div>
    </div>
  `).join('');
}

// ---- Particles ----
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = Math.random() * 3 + 1 + 'px';
    container.appendChild(p);
  }
}

// ---- Hero Search ----
function handleHeroSearch() {
  const query = document.getElementById('heroSearch').value;
  const category = document.getElementById('heroCategory').value;
  let url = 'jobs.html';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (params.toString()) url += '?' + params.toString();
  window.location.href = url;
}

function quickSearch(term) {
  document.getElementById('heroSearch').value = term;
  handleHeroSearch();
}

document.getElementById('heroSearch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleHeroSearch();
});

// ---- Testimonials Slider ----
let testiIndex = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dotsContainer = document.getElementById('testiDots');

function createDots() {
  if (!dotsContainer) return;
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showTesti(i));
    dotsContainer.appendChild(dot);
  });
}

function showTesti(index) {
  slides.forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.testi-dot').forEach(d => d.classList.remove('active'));
  testiIndex = (index + slides.length) % slides.length;
  slides[testiIndex]?.classList.add('active');
  document.querySelectorAll('.testi-dot')[testiIndex]?.classList.add('active');
}

function nextTesti() { showTesti(testiIndex + 1); }
function prevTesti() { showTesti(testiIndex - 1); }

// Auto-advance testimonials
setInterval(() => showTesti(testiIndex + 1), 5000);

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  renderWorkers();
  createDots();
});
