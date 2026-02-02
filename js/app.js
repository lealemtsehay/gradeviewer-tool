// ==========================================
// ⚠️ CONFIGURE YOUR BACKEND URL HERE
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbdNWwSitI1A7Qs1x2IvMpOyjQq5OST5nClv6kpc25qT_2WEUbqPA33msgu8YNZYM2/exec";
let chartInstance = null;

// --- Background Animation (Network/Nodes) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let nodes = [];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Node {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
    ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
  }
}

function initAnim() { nodes = []; for (let i = 0; i < 40; i++) nodes.push(new Node()); }
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
  ctx.lineWidth = 0.1;

  for (let i = 0; i < nodes.length; i++) {
    nodes[i].update(); nodes[i].draw();
    for (let j = i; j < nodes.length; j++) {
      let dx = nodes[i].x - nodes[j].x;
      let dy = nodes[i].y - nodes[j].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.globalAlpha = 1 - (dist / 150);
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animate);
}
initAnim(); animate();

// --- Data Logic ---
function fetchGrades() {
  const id = document.getElementById('nameInput').value;
  const btn = document.querySelector('.btn-formal');
  const err = document.getElementById('error-msg');

  if (!id) return;
  btn.textContent = 'Verifying Credentials...'; btn.disabled = true; err.style.display = 'none';

  fetch(SCRIPT_URL + "?name=" + encodeURIComponent(id), { redirect: "follow", credentials: 'omit' })
    .then(res => res.json())
    .then(data => {
      if (data.found) {
        renderDashboard(data);
      } else {
        err.textContent = "Identifier not found in database.";
        err.style.display = 'block';
        resetBtn();
      }
    })
    .catch(e => {
      console.error(e);
      err.textContent = "Unable to connect to server.";
      err.style.display = 'block';
      resetBtn();
    });
}

function refreshDashboard(btn) {
  const id = document.getElementById('nameInput').value;
  if (!id) return;
  const origText = btn.innerHTML;
  btn.innerHTML = 'Loading...'; btn.disabled = true;

  fetch(SCRIPT_URL + "?name=" + encodeURIComponent(id), { redirect: "follow", credentials: 'omit' })
    .then(res => res.json())
    .then(data => {
      if (data.found) renderDashboard(data);
      btn.innerHTML = origText; btn.disabled = false;
    });
}

function resetBtn() {
  const btn = document.querySelector('.btn-formal');
  btn.textContent = 'View Grades'; btn.disabled = false;
}

function renderDashboard(data) {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = 'block';

  document.getElementById('studentNameDisplay').textContent = data.studentName;
  document.getElementById('lastUpdatedDisplay').textContent = "Data retrieved: " + data.lastUpdated;

  const tbody = document.getElementById('gradesBody');
  tbody.innerHTML = '';
  let labels = [], myScores = [], avgScores = [];

  data.data.forEach(item => {
    let sDisplay = (item.score === "" || item.score === undefined) ? "-" : item.score;
    let sVal = parseFloat(item.score) || 0;
    let avg = parseFloat(item.avg) || 0;

    if (item.category !== "Hashed ID" && item.category !== "Name") {
      tbody.innerHTML += `
        <tr>
          <td class="fw-medium">${item.category}</td>
          <td class="text-center score-cell">${sDisplay}</td>
          <td class="text-center stat-cell">${item.max}</td>
          <td class="text-center stat-cell">${avg.toFixed(1)}</td>
          <td class="text-center stat-cell">${parseFloat(item.median).toFixed(1)}</td>
        </tr>`;

      if (!isNaN(parseFloat(item.score))) {
        labels.push(item.category.substring(0, 15));
        myScores.push(sVal);
        avgScores.push(avg);
      }
    }
  });

  renderChart(labels, myScores, avgScores);
}

function renderChart(l, m, a) {
  if (chartInstance) chartInstance.destroy();
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const color = isDark ? '#e0e0e0' : '#2c3e50';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary');

  chartInstance = new Chart(document.getElementById('gradeChart'), {
    type: 'bar',
    data: {
      labels: l,
      datasets: [
        { label: 'Student Score', data: m, backgroundColor: primaryColor, borderRadius: 2, barPercentage: 0.6 },
        { label: 'Class Average', data: a, backgroundColor: 'rgba(128,128,128,0.3)', borderRadius: 2, barPercentage: 0.6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: color } },
        x: { grid: { display: false }, ticks: { color: color } }
      },
      plugins: { legend: { labels: { color: color } } }
    }
  });
}

function downloadPDF() {
  const el = document.getElementById('print-area');
  const studentName = document.getElementById('studentNameDisplay').textContent || "Student";

  document.querySelector('.action-grid').style.display = 'none';
  document.querySelector('.d-print-none').style.display = 'none';
  document.querySelector('.pdf-header').style.display = 'block';

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `${studentName.replace(/\s+/g, '_')}_Grade_Report_${dateStr}.pdf`;

  html2pdf().set({
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).from(el).save().then(() => {
    document.querySelector('.action-grid').style.display = 'grid';
    document.querySelector('.d-print-none').style.display = 'block';
    document.querySelector('.pdf-header').style.display = 'none';
  });
}

function toggleTheme() {
  const b = document.body;
  const d = b.getAttribute('data-theme') === 'dark';
  b.setAttribute('data-theme', d ? 'light' : 'dark');
  localStorage.setItem('theme', d ? 'light' : 'dark');

  document.getElementById('themeIcon').className = d ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
  if (chartInstance) {
    // Re-render chart to update colors
    const data = chartInstance.config.data;
    renderChart(data.labels, data.datasets[0].data, data.datasets[1].data);
  }
}

if (localStorage.getItem('theme') === 'dark') toggleTheme();

function logout() {
  location.reload();
}
