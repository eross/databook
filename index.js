const express = require('express');
const app = express();
const port = 3000;

// Serve basic HTML page
app.get('/', (req, res) => {
  const today = new Date().toLocaleDateString();
  const dataRows = [
    { id: 1, date: today, information: 'Node.js server is running' },
    { id: 2, date: '2024-01-01', information: 'Express framework loaded' },
    { id: 3, date: '2023-06-15', information: 'Databook project initialized' }
  ].map(row => `
    <tr data-id="${row.id}" onclick="selectRow(this)" style="cursor: pointer; padding: 4px;" onmouseover="highlightRow(this)" onmouseout="unhighlightRow(this)">
      <td>${row.date}</td>
      <td>${row.information}</td>
    </tr>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Databook App</title></head>
    <body>
      <h1>Welcome to Databook!</h1>
      <p>This is a simple Node.js web application.</p>
      <h2>Activity Log</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Information</th>
          </tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
      <div style="margin-top: 15px;">
        <button onclick="alert('Add functionality coming soon!')">Add</button>
        <button onclick="alert('Delete functionality coming soon!')">Delete</button>
        <button onclick="alert('Edit functionality coming soon!')">Edit</button>
      </div>
      <br>
      <a href="/health">Check Health Status</a>
    </body>
    <script>
      // Global variable to store selected row ID
      let selectedRowId = null;
      
      // Highlight row on hover
      function highlightRow(row) {
        row.style.backgroundColor = '#e6f3ff';
        row.style.borderLeft = '4px solid #2196F3';
      }
      // Unhighlight row when mouse leaves
      function unhighlightRow(row) {
        if (!row.classList.contains('selected')) {
          row.style.backgroundColor = '';
          row.style.borderLeft = '';
        }
      }
      // Select a row (set as selected with different style)
      function selectRow(row) {
        // Get the row ID
        const id = parseInt(row.getAttribute('data-id'));
        
        // Remove selected class and styles from all rows
        document.querySelectorAll('tr').forEach(r => {
          r.classList.remove('selected');
          r.style.backgroundColor = '';
          r.style.borderLeft = '';
          r.style.fontWeight = '';
        });
        
        // Add selected class to clicked row with its specific ID
        row.classList.add('selected');
        row.style.backgroundColor = '#d4edff';
        row.style.borderLeft = '4px solid #2196F3';
        row.style.fontWeight = 'bold';
        
        // Save selected row ID in global variable
        selectedRowId = id;
      }
    </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Data endpoint for demonstrating API functionality
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Databook API',
    items: ['Welcome', 'Node.js', 'Express'],
    ready: true
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Endpoints available: /, /health, /api/data');
});
