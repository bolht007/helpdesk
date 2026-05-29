// ===========================
//  BSI IT Helpdesk
//  script.js
// ===========================

let tickets = [];
let ticketCounter = 1;
let selectedPriority = 'low';

// ---- Categories ----
const categories = [
  { name: 'คอมพิวเตอร์/Laptop', sub: 'Computer/Laptop', sla: 8, color: '#1a56db' },
  { name: 'Internet/Network',   sub: 'Internet/Network', sla: 4, color: '#0694a2' },
  { name: 'เครื่องพิมพ์',         sub: 'Printer',          sla: 8, color: '#d97706' },
  { name: 'ซอฟต์แวร์/License',  sub: 'Software/License', sla: 16, color: '#7c3aed' },
  { name: 'Email/บัญชีผู้ใช้',   sub: 'Email/Account',    sla: 8, color: '#057a55' },
  { name: 'Server/ระบบ',        sub: 'Server/System',    sla: 2, color: '#e02424' },
  { name: 'CCTV',               sub: 'CCTV',             sla: 8, color: '#1f2937' },
  { name: 'โทรศัพท์',            sub: 'Telephone',        sla: 4, color: '#0e9f6e' },
  { name: 'อุปกรณ์สำนักงาน',     sub: 'Office Equipment', sla: 24, color: '#d97706' },
];

// ---- SLA Data ----
const slaData = [
  { name: 'คอมพิวเตอร์/Laptop', low:[8,24], med:[4,16], high:[2,8], crit:[1,4] },
  { name: 'Internet/Network',   low:[5,20], med:[2,8],  high:[1,4], crit:[1,2] },
  { name: 'เครื่องพิมพ์',         low:[8,24], med:[4,16], high:[2,8], crit:[1,4] },
  { name: 'ซอฟต์แวร์/License',  low:[16,48],med:[8,24], high:[4,16],crit:[2,8] },
  { name: 'Email/บัญชีผู้ใช้',   low:[8,24], med:[4,16], high:[2,8], crit:[1,4] },
  { name: 'Server/ระบบ',        low:[4,8],  med:[2,4],  high:[1,2], crit:[1,1] },
  { name: 'CCTV',               low:[8,24], med:[4,16], high:[2,8], crit:[1,4] },
  { name: 'โทรศัพท์',            low:[8,24], med:[4,16], high:[2,8], crit:[1,4] },
  { name: 'อุปกรณ์สำนักงาน',     low:[24,48],med:[8,24], high:[4,8], crit:[2,4] },
];

// ---- Clock ----
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clock');
  if (el) el.textContent =
    now.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' }) + '  ' +
    now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ---- Page Navigation ----
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  event.currentTarget.classList.add('active');

  const titles = {
    queue: 'คิว Ticket ทั้งหมด',
    mytickets: 'งานที่รับผิดชอบ',
    dashboard: 'Dashboard',
    categories: 'จัดการประเภทงาน',
    sla: 'กำหนด SLA'
  };
  document.getElementById('topbar-title').textContent = titles[page] || '';

  if (page === 'categories') renderCategories();
  if (page === 'sla') renderSLA();
  if (page === 'dashboard') renderDashboard();
}

// ---- Modal ----
function openModal() {
  document.getElementById('modal-overlay').classList.add('show');
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
}

// ---- Priority ----
function setPriority(p, btn) {
  selectedPriority = p;
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ---- Toast ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- Submit Ticket ----
function submitTicket() {
  const reporter   = document.getElementById('reporter').value.trim();
  const department = document.getElementById('department').value;
  const category   = document.getElementById('category').value;
  const title      = document.getElementById('title').value.trim();
  const detail     = document.getElementById('detail').value.trim();
  const assignee   = document.getElementById('assignee').value;

  if (!reporter || !department || !category || !title || !detail) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วนครับ');
    return;
  }

  const now = new Date();
  const ticket = {
    id: 'IT' + new Date().getFullYear() + '-' + String(ticketCounter++).padStart(4, '0'),
    reporter, department, category, title, detail,
    assignee: assignee || '-',
    priority: selectedPriority,
    status: 'open',
    date: now.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' }),
    isToday: true
  };

  tickets.unshift(ticket);
  renderTable(tickets);
  updateStats();
  closeModal();

  // Reset
  ['reporter','department','category','title','detail','assignee'].forEach(id => {
    document.getElementById(id).value = '';
  });
  setPriority('low', document.querySelector('.priority-btn.low'));
  showToast('สร้าง Ticket ' + ticket.id + ' สำเร็จครับ');
}

// ---- Update Status ----
function updateStatus(id, status) {
  const t = tickets.find(t => t.id === id);
  if (t) { t.status = status; renderTable(tickets); updateStats(); }
}

// ---- Delete ----
function deleteTicket(id) {
  tickets = tickets.filter(t => t.id !== id);
  renderTable(tickets);
  updateStats();
}

// ---- Filter ----
function filterTickets() {
  const status   = document.getElementById('filter-status').value;
  const category = document.getElementById('filter-category').value;
  const priority = document.getElementById('filter-priority').value;
  const search   = document.getElementById('filter-search').value.toLowerCase();

  const filtered = tickets.filter(t => {
    if (status && t.status !== status) return false;
    if (category && t.category !== category) return false;
    if (priority && t.priority !== priority) return false;
    if (search && !t.id.toLowerCase().includes(search) &&
        !t.title.toLowerCase().includes(search) &&
        !t.detail.toLowerCase().includes(search)) return false;
    return true;
  });

  renderTable(filtered);
}

// ---- Render Table ----
function renderTable(list) {
  const body = document.getElementById('ticketTableBody');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="10" class="empty-row">ไม่พบรายการ Ticket ครับ</td></tr>';
    return;
  }

  const statusLabel = { open:'รอดำเนินการ', inprogress:'กำลังดำเนินการ', done:'ปิดแล้ว' };
  const statusClass = { open:'badge-open', inprogress:'badge-inprogress', done:'badge-done' };
  const priorityLabel = { low:'ปกติ', medium:'ด่วน', high:'เร่งด่วนมาก', critical:'วิกฤต' };
  const priorityClass = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical' };

  body.innerHTML = list.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="ticket-no">${t.id}</span></td>
      <td>${t.title}</td>
      <td>${t.department}</td>
      <td>${t.category}</td>
      <td><span class="badge-priority ${priorityClass[t.priority]}">${priorityLabel[t.priority]}</span></td>
      <td><span class="badge-status ${statusClass[t.status]}">${statusLabel[t.status]}</span></td>
      <td>${t.assignee}</td>
      <td>${t.date}</td>
      <td>
        ${t.status === 'open' ? `<button class="btn-action" onclick="updateStatus('${t.id}','inprogress')">รับงาน</button>` : ''}
        ${t.status === 'inprogress' ? `<button class="btn-action done" onclick="updateStatus('${t.id}','done')">ปิดงาน</button>` : ''}
        <button class="btn-action del" onclick="deleteTicket('${t.id}')">ลบ</button>
      </td>
    </tr>
  `).join('');
}

// ---- Update Stats ----
function updateStats() {
  const todayTickets = tickets.filter(t => t.isToday);
  document.getElementById('count-new').textContent = todayTickets.length;
  document.getElementById('count-open').textContent = tickets.filter(t => t.status === 'open').length;
  document.getElementById('count-inprogress').textContent = tickets.filter(t => t.status === 'inprogress').length;
  document.getElementById('count-done').textContent = tickets.filter(t => t.status === 'done' && t.isToday).length;
}

// ---- Render Categories ----
function renderCategories() {
  const grid = document.getElementById('categories-grid');
  grid.innerHTML = categories.map(c => {
    const count = tickets.filter(t => t.category === c.name).length;
    return `
      <div class="category-card">
        <div class="category-card-top">
          <div>
            <div class="category-name">${c.name}</div>
            <div class="category-sub">${c.sub}</div>
          </div>
          <span class="badge-active">ใช้งาน</span>
        </div>
        <div class="category-info">
          <div class="category-info-item">
            <label>SLA (ชม.)</label>
            <span>${c.sla} ชม.</span>
          </div>
          <div class="category-info-item">
            <label>จำนวน Ticket</label>
            <span>${count} รายการ</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="category-color" style="background:${c.color}"></div>
          <span style="font-size:11px;color:var(--text-dim)">${c.color}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ---- Render SLA ----
function renderSLA() {
  const body = document.getElementById('sla-body');
  body.innerHTML = slaData.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.low[0]}</td><td>${s.low[1]}</td>
      <td>${s.med[0]}</td><td>${s.med[1]}</td>
      <td>${s.high[0]}</td><td>${s.high[1]}</td>
      <td>${s.crit[0]}</td><td>${s.crit[1]}</td>
    </tr>
  `).join('');
}

// ---- Render Dashboard ----
function renderDashboard() {
  document.getElementById('dash-total').textContent = tickets.length;
  document.getElementById('dash-open').textContent = tickets.filter(t => t.status === 'open').length;
  document.getElementById('dash-inprogress').textContent = tickets.filter(t => t.status === 'inprogress').length;
  document.getElementById('dash-done').textContent = tickets.filter(t => t.status === 'done').length;

  const priorityColors = { low:'#f3f4f6', medium:'#fef3c7', high:'#fee2e2', critical:'#111827' };
  const priorityTextColors = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#ffffff' };
  const priorityLabel = { low:'ปกติ', medium:'ด่วน', high:'เร่งด่วนมาก', critical:'วิกฤต' };

  const summary = document.getElementById('priority-summary');
  summary.innerHTML = ['low','medium','high','critical'].map(p => {
    const count = tickets.filter(t => t.priority === p).length;
    return `<div class="priority-chip" style="background:${priorityColors[p]};color:${priorityTextColors[p]}">
      ${priorityLabel[p]}: <strong>${count}</strong>
    </div>`;
  }).join('');
}

// ---- Init ----
updateStats();
