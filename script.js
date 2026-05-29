// ===========================
//  IT Help Desk — Bangkok Steel
//  script.js
// ===========================

let tickets = [];
let ticketCounter = 1;
let selectedPriority = 'low';

// ---- นาฬิกา ----
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) + '  ' +
    now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ---- เลือกระดับความเร่งด่วน ----
function setPriority(p, btn) {
  selectedPriority = p;
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ---- แสดง Toast แจ้งเตือน ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- ส่ง Ticket ใหม่ ----
function submitTicket() {
  const reporter   = document.getElementById('reporter').value.trim();
  const department = document.getElementById('department').value;
  const category   = document.getElementById('category').value;
  const detail     = document.getElementById('detail').value.trim();

  // ตรวจสอบข้อมูล
  if (!reporter || !department || !category || !detail) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วนครับ');
    return;
  }

  // สร้าง Ticket ใหม่
  const ticket = {
    id:         'IT-' + String(ticketCounter++).padStart(4, '0'),
    reporter,
    department,
    category,
    detail,
    priority:   selectedPriority,
    status:     'open',
    time:       new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  };

  tickets.unshift(ticket);
  renderTickets();
  updateStats();

  // รีเซ็ตฟอร์ม
  document.getElementById('reporter').value   = '';
  document.getElementById('department').value = '';
  document.getElementById('category').value   = '';
  document.getElementById('detail').value     = '';
  setPriority('low', document.querySelector('.priority-btn.low'));

  showToast('ส่ง Ticket ' + ticket.id + ' สำเร็จครับ');
}

// ---- อัปเดตสถานะ Ticket ----
function updateStatus(id, status) {
  const t = tickets.find(t => t.id === id);
  if (t) {
    t.status = status;
    renderTickets();
    updateStats();
  }
}

// ---- ลบ Ticket ----
function deleteTicket(id) {
  tickets = tickets.filter(t => t.id !== id);
  renderTickets();
  updateStats();
}

// ---- อัปเดตสถิติ ----
function updateStats() {
  document.getElementById('count-open').textContent      = tickets.filter(t => t.status === 'open').length;
  document.getElementById('count-inprogress').textContent = tickets.filter(t => t.status === 'inprogress').length;
  document.getElementById('count-done').textContent      = tickets.filter(t => t.status === 'done').length;
  document.getElementById('count-total').textContent     = tickets.length;
}

// ---- แสดงรายการ Ticket ----
function renderTickets() {
  const list = document.getElementById('ticketList');

  if (tickets.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-text">ยังไม่มีรายการแจ้งปัญหาครับ</div></div>';
    return;
  }

  const statusLabel = { open: 'รอดำเนินการ', inprogress: 'กำลังดำเนินการ', done: 'เสร็จแล้ว' };
  const statusClass = { open: 'status-open',  inprogress: 'status-inprogress', done: 'status-done' };
  const priorityLabel = { low: 'ปกติ', medium: 'เร่งด่วน', high: 'วิกฤต' };

  list.innerHTML = tickets.map(t => `
    <div class="ticket ${t.priority}">
      <div class="ticket-top">
        <span class="ticket-id">${t.id} &nbsp;·&nbsp; ${t.time}</span>
        <span class="ticket-status ${statusClass[t.status]}">${statusLabel[t.status]}</span>
      </div>
      <div class="ticket-title">${t.category}</div>
      <div class="ticket-meta">
        <span>${t.reporter}</span>
        <span>${t.department}</span>
        <span>${priorityLabel[t.priority]}</span>
      </div>
      <div class="ticket-detail">${t.detail.substring(0, 80)}${t.detail.length > 80 ? '...' : ''}</div>
      <div class="ticket-actions">
        ${t.status === 'open'       ? `<button class="action-btn"          onclick="updateStatus('${t.id}','inprogress')">รับงาน</button>` : ''}
        ${t.status === 'inprogress' ? `<button class="action-btn done-btn" onclick="updateStatus('${t.id}','done')">เสร็จแล้ว</button>` : ''}
        <button class="action-btn del-btn" onclick="deleteTicket('${t.id}')">ลบ</button>
      </div>
    </div>
  `).join('');
}

// ---- เริ่มต้น ----
updateStats();
