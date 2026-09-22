const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const today = new Date().toLocaleDateString();
  
  res.send(`<!DOCTYPE html>
<html>
<head>
<title>Databook App</title>
<style>
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #333; padding: 8px; text-align: left; }
tr:hover { background-color: #e6f3ff; border-left: 4px solid #2196F3; }
tr.selected { background-color: #d4edff; border-left: 4px solid #2196F3; font-weight: bold; cursor: pointer; }
button { padding: 8px 16px; margin: 5px; cursor: pointer; }
</style>
</head>
<body>
<h1>Welcome to Databook!</h1>
<p>This is a simple Node.js web application.</p>
<h2>Activity Log</h2>
<table id="activityTable">
<thead><tr><th>Date</th><th>Information</th></tr></thead>
<tbody>
<tr data-id="1"><td>${today}</td><td>Node.js server is running</td></tr>
<tr data-id="2"><td>2024-01-01</td><td>Express framework loaded</td></tr>
<tr data-id="3"><td>2023-06-15</td><td>Databook project initialized</td></tr>
</tbody>
</table>
<div style="margin-top: 15px;">
<button onclick="addRow()">Add</button>
<button onclick="deleteRow()" id="btn-delete">Delete</button>
<button onclick="editRow()">Edit</button>
</div>
<br><a href="/health">Check Health Status</a>
<script>
const rows = [
  {id: 1, date: '${today}', info: 'Node.js server is running'},
  {id: 2, date: '2024-01-01', info: 'Express framework loaded'},
  {id: 3, date: '2023-06-15', info: 'Databook project initialized'}
];

let selectedRowId = null;

function highlightRow(row) { row.classList.add('selected'); row.style.cursor = 'pointer'; }

function unhighlightRow(row) { if (!row.classList.contains('selected')) { row.classList.remove('selected'); row.style.cursor = 'default'; } }

function selectRow(row) {
  rows.forEach(r => document.querySelector(\`tr[data-id="\${r.id}]\`).classList.remove('selected'));
  highlightRow(row);
  selectedRowId = parseInt(row.getAttribute('data-id'));
}

function deleteRow() {
  const id = getSelectedId();
  if (!id) { alert('You must select a row to delete'); return; }
  
  const row = document.querySelector(\`tr[data-id="\${id}"]\`);
  if (row) {
    if (confirm('Are you sure you want to delete this row?')) {
      row.remove();
      selectedRowId = null;
      highlightRow(row);
    }
  }
}

function addRow() {
  const newDate = new Date().toLocaleDateString();
  const newRow = document.createElement('tr');
  newRow.setAttribute('data-id', String(getSelectedId() ? parseInt(getSelectedId()) + 1 : 1));
  newRow.innerHTML = \`<td>\${newDate}</td><td>New entry</td>\`;
  highlightRow(newRow);
  const tbody = document.querySelector('#activityTable tbody');
  tbody.insertBefore(newRow, tbody.firstChild);
}

function editRow() {
  const id = getSelectedId();
  if (!id) { alert('You must select a row to edit'); return; }
  alert('Edit functionality for row ' + id + ' coming soon!');
}

// Add event listeners on mount
const tbody = document.querySelector('#activityTable tbody');
tbody.querySelectorAll('tr').forEach(row => {
  row.onmouseover = highlightRow;
  row.onmouseout = unhighlightRow;
  row.onclick = function() { selectRow(this); };
});

console.log('Databook App loaded. Click rows to select them.');
</script>
</body>
</html>`);
});

app.get('/health', (req, res) => { res.json({ status: 'OK' }); });
app.get('/api/data', (req, res) => { res.json({ message: 'Databook API', items: ['Welcome', 'Node.js', 'Express'], ready: true }); });

console.log('Server running at http://localhost:' + port);
app.listen(port);
