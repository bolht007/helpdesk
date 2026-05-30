// ===========================
//  BSI IT Helpdesk — script.js
// ===========================

// ---- Users ----
const USERS = [
  { username: 'admin',   password: 'admin1234', name: 'Admin',    role: 'admin',   display: 'ผู้ดูแลระบบ' },
  { username: 'itstaff', password: 'it1234',    name: 'IT Staff', role: 'itstaff', display: 'เจ้าหน้าที่ IT' },
  { username: 'user',    password: 'user1234',  name: 'User',     role: 'user',    display: 'ผู้ใช้งานทั่วไป' },
];

let currentUser = null;
let tickets = [];
let ticketCounter = 1;
let selectedPriority = 'low';

// ---- Login ----
function doLogin() {
  const u = document.getElementById('login-username').value.trim();
  const p = document.getElementById('login-password').value;
  const found = USERS.find(x => x.username === u && x.password === p);

  if (!found) {
    document.getElementById('login-error').textContent = 'Username หรือ Password ไม่ถูกต้องครับ';
    return;
  }

  currentUser = found;
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  // Set user info
  document.getElementById('user-name').textContent = found.name;
  document.getElementById('user-role').textContent = found.display;
  document.getElementById('user-avatar').textContent = found.name.substring(0,2).toUpperCase();

  // Role badge
  const badge = document.getElementById('topbar-role');
  badge.textContent = found.display;
  badge.className = 'role-badge role-' + found.role;

  // Admin menu
  if (found.role === 'admin') {
    document.getElementById('admin-menu').style.display = 'block';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
  }

  // User role: ซ่อนปุ่มสร้าง Ticket (user แจ้งผ่านฟอร์มได้แต่ไม่ manage)
  if (found.role === 'user') {
    // user ยังสร้าง ticket ได้แต่ไม่เห็นปุ่ม action
  }

  updateClock();
  renderMyTickets();
}

function doLogout() {
  currentUser = null;
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('admin-menu').style.display = 'none';
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}

// ---- Clock ----
function updateClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const now = new Date();
  el.textContent =
    now.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' }) + '  ' +
    now.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
setInterval(updateClock, 1000);

// ---- Page Navigation ----
function showPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');

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
  if (page === 'mytickets') renderMyTickets();
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
    id: 'IT' + now.getFullYear() + '-' + String(ticketCounter++).padStart(4, '0'),
    reporter, department, category, title, detail,
    assignee: assignee || '-',
    priority: selectedPriority,
    status: 'open',
    date: now.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' }),
    isToday: true,
    createdBy: currentUser ? currentUser.name : '-'
  };

  tickets.unshift(ticket);
  renderTable(tickets);
  updateStats();
  renderMyTickets();
  closeModal();

  ['reporter','department','category','title','detail'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('assignee').value = '-';
  setPriority('low', document.querySelector('.priority-btn.low'));
  showToast('สร้าง Ticket ' + ticket.id + ' สำเร็จครับ');
}

// ---- Update Status ----
function updateStatus(id, status) {
  const t = tickets.find(t => t.id === id);
  if (t) { t.status = status; renderTable(tickets); updateStats(); renderMyTickets(); }
}

// ---- Delete ----
function deleteTicket(id) {
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'itstaff') {
    showToast('ไม่มีสิทธิ์ลบ Ticket ครับ');
    return;
  }
  tickets = tickets.filter(t => t.id !== id);
  renderTable(tickets);
  updateStats();
  renderMyTickets();
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
        !t.title.toLowerCase().includes(search)) return false;
    return true;
  });
  renderTable(filtered);
}

// ---- Render Table ----
const statusLabel = { open:'รอดำเนินการ', inprogress:'กำลังดำเนินการ', done:'ปิดแล้ว' };
const statusClass = { open:'badge-open', inprogress:'badge-inprogress', done:'badge-done' };
const priorityLabel = { low:'ปกติ', medium:'ด่วน', high:'เร่งด่วนมาก', critical:'วิกฤต' };
const priorityClass = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical' };

function renderTable(list) {
  const body = document.getElementById('ticketTableBody');
  if (!list.length) {
    body.innerHTML = '<tr><td colspan="10" class="empty-row">ไม่พบรายการ Ticket ครับ</td></tr>';
    return;
  }
  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'itstaff');
  body.innerHTML = list.map((t, i) => `
    <tr>
      <td>${i+1}</td>
      <td><span class="ticket-no">${t.id}</span></td>
      <td>${t.title}</td>
      <td>${t.department}</td>
      <td>${t.category}</td>
      <td><span class="badge-priority ${priorityClass[t.priority]}">${priorityLabel[t.priority]}</span></td>
      <td><span class="badge-status ${statusClass[t.status]}">${statusLabel[t.status]}</span></td>
      <td>${t.assignee}</td>
      <td>${t.date}</td>
      <td>
        ${canEdit && t.status === 'open' ? `<button class="btn-action" onclick="updateStatus('${t.id}','inprogress')">รับงาน</button>` : ''}
        ${canEdit && t.status === 'inprogress' ? `<button class="btn-action done" onclick="updateStatus('${t.id}','done')">ปิดงาน</button>` : ''}
        ${canEdit ? `<button class="btn-action del" onclick="deleteTicket('${t.id}')">ลบ</button>` : ''}
      </td>
    </tr>
  `).join('');
}

// ---- Render My Tickets (งานที่รับผิดชอบ = มีคนรับงานแล้ว) ----
function renderMyTickets() {
  const assigned = tickets.filter(t => t.assignee && t.assignee !== '-');
  const todayAssigned = assigned.filter(t => t.isToday);

  document.getElementById('my-count-new').textContent = todayAssigned.length;
  document.getElementById('my-count-open').textContent = assigned.filter(t => t.status === 'open').length;
  document.getElementById('my-count-inprogress').textContent = assigned.filter(t => t.status === 'inprogress').length;
  document.getElementById('my-count-done').textContent = assigned.filter(t => t.status === 'done' && t.isToday).length;

  const body = document.getElementById('myTicketTableBody');
  if (!assigned.length) {
    body.innerHTML = '<tr><td colspan="9" class="empty-row">ไม่มีงานที่รับผิดชอบครับ</td></tr>';
    return;
  }
  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'itstaff');
  body.innerHTML = assigned.map((t, i) => `
    <tr>
      <td>${i+1}</td>
      <td><span class="ticket-no">${t.id}</span></td>
      <td>${t.title}</td>
      <td>${t.department}</td>
      <td>${t.category}</td>
      <td><span class="badge-priority ${priorityClass[t.priority]}">${priorityLabel[t.priority]}</span></td>
      <td><span class="badge-status ${statusClass[t.status]}">${statusLabel[t.status]}</span></td>
      <td>${t.date}</td>
      <td>
        ${canEdit && t.status === 'open' ? `<button class="btn-action" onclick="updateStatus('${t.id}','inprogress')">รับงาน</button>` : ''}
        ${canEdit && t.status === 'inprogress' ? `<button class="btn-action done" onclick="updateStatus('${t.id}','done')">ปิดงาน</button>` : ''}
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

// ---- Categories ----
const categories = [
  { name:'คอมพิวเตอร์/Laptop', sub:'Computer/Laptop', sla:8,  color:'#1a56db' },
  { name:'Internet/Network',   sub:'Internet/Network', sla:4,  color:'#0694a2' },
  { name:'เครื่องพิมพ์',         sub:'Printer',          sla:8,  color:'#d97706' },
  { name:'ซอฟต์แวร์/License',  sub:'Software/License', sla:16, color:'#7c3aed' },
  { name:'Email/บัญชีผู้ใช้',   sub:'Email/Account',    sla:8,  color:'#057a55' },
  { name:'Server/ระบบ',        sub:'Server/System',    sla:2,  color:'#e02424' },
  { name:'CCTV',               sub:'CCTV',              sla:8,  color:'#1f2937' },
  { name:'โทรศัพท์',            sub:'Telephone',         sla:4,  color:'#0e9f6e' },
  { name:'อุปกรณ์สำนักงาน',     sub:'Office Equipment',  sla:24, color:'#d97706' },
];

function renderCategories() {
  document.getElementById('categories-grid').innerHTML = categories.map(c => {
    const count = tickets.filter(t => t.category === c.name).length;
    return `<div class="category-card">
      <div class="category-card-top">
        <div><div class="category-name">${c.name}</div><div class="category-sub">${c.sub}</div></div>
        <span class="badge-active">ใช้งาน</span>
      </div>
      <div class="category-info">
        <div class="category-info-item"><label>SLA (ชม.)</label><span>${c.sla} ชม.</span></div>
        <div class="category-info-item"><label>จำนวน Ticket</label><span>${count} รายการ</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="category-color" style="background:${c.color}"></div>
        <span style="font-size:11px;color:var(--text-dim)">${c.color}</span>
      </div>
    </div>`;
  }).join('');
}

// ---- SLA ----
const slaData = [
  { name:'คอมพิวเตอร์/Laptop', low:[8,24],  med:[4,16], high:[2,8],  crit:[1,4] },
  { name:'Internet/Network',   low:[5,20],  med:[2,8],  high:[1,4],  crit:[1,2] },
  { name:'เครื่องพิมพ์',         low:[8,24],  med:[4,16], high:[2,8],  crit:[1,4] },
  { name:'ซอฟต์แวร์/License',  low:[16,48], med:[8,24], high:[4,16], crit:[2,8] },
  { name:'Email/บัญชีผู้ใช้',   low:[8,24],  med:[4,16], high:[2,8],  crit:[1,4] },
  { name:'Server/ระบบ',        low:[4,8],   med:[2,4],  high:[1,2],  crit:[1,1] },
  { name:'CCTV',               low:[8,24],  med:[4,16], high:[2,8],  crit:[1,4] },
  { name:'โทรศัพท์',            low:[8,24],  med:[4,16], high:[2,8],  crit:[1,4] },
  { name:'อุปกรณ์สำนักงาน',     low:[24,48], med:[8,24], high:[4,8],  crit:[2,4] },
];

function renderSLA() {
  document.getElementById('sla-body').innerHTML = slaData.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.low[0]}</td><td>${s.low[1]}</td>
      <td>${s.med[0]}</td><td>${s.med[1]}</td>
      <td>${s.high[0]}</td><td>${s.high[1]}</td>
      <td>${s.crit[0]}</td><td>${s.crit[1]}</td>
    </tr>
  `).join('');
}

// ---- Dashboard ----
function renderDashboard() {
  document.getElementById('dash-total').textContent = tickets.length;
  document.getElementById('dash-open').textContent = tickets.filter(t => t.status==='open').length;
  document.getElementById('dash-inprogress').textContent = tickets.filter(t => t.status==='inprogress').length;
  document.getElementById('dash-done').textContent = tickets.filter(t => t.status==='done').length;

  const colors = { low:'#f3f4f6', medium:'#fef3c7', high:'#fee2e2', critical:'#111827' };
  const textColors = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#ffffff' };
  document.getElementById('priority-summary').innerHTML =
    ['low','medium','high','critical'].map(p => {
      const count = tickets.filter(t => t.priority===p).length;
      return `<div class="priority-chip" style="background:${colors[p]};color:${textColors[p]}">
        ${priorityLabel[p]}: <strong>${count}</strong>
      </div>`;
    }).join('');

  const recent = tickets.slice(0,5);
  const body = document.getElementById('dash-recent-body');
  body.innerHTML = recent.length ? recent.map(t => `
    <tr>
      <td><span class="ticket-no">${t.id}</span></td>
      <td>${t.title}</td>
      <td>${t.category}</td>
      <td><span class="badge-priority ${priorityClass[t.priority]}">${priorityLabel[t.priority]}</span></td>
      <td><span class="badge-status ${statusClass[t.status]}">${statusLabel[t.status]}</span></td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="empty-row">ยังไม่มี Ticket</td></tr>';
}

// ---- Init ----
updateStats();
