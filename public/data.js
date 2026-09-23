// Databook App - Client-side JavaScript (works with server API)
const API_BASE = '/api';

let selectedRowId = null;
let initialLoadComplete = false; // Track if initial data loaded

// ==================== INITIALIZATION ====================

// Load activities from server on page load
async function initApp() {
  try {
    console.log('Loading activities from server...');
    
    const response = await fetch(`${API_BASE}/activities`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      renderTable(result.data);
      console.log(`Loaded ${result.count} activities from server`);
    } else {
      alert('Failed to load activities. Please refresh and check the health endpoint.');
    }
    
    initialLoadComplete = true;
  } catch (error) {
    console.error('Error loading activities:', error);
    // Fallback: show empty table or previous state
    renderTable([]);
    if (!initialLoadComplete) {
      alert('Could not connect to server. Please ensure it is running.');
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for DOM to fully load
  setTimeout(() => {
    initApp();
    attachTableListeners();
  }, 100);
});

// ==================== RENDERING ====================

function renderTable(activities) {
  const tbody = document.querySelector('#activityTable tbody');
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  if (activities.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.style.textAlign = 'center';
    emptyRow.style.padding = '20px';
    emptyRow.innerHTML = '<td colspan="2"><em>No activities yet. Click "Add" to create one.</em></td>';
    tbody.appendChild(emptyRow);
    return;
  }
  
  // Create table rows in order (newest first, but showing all)
  activities.forEach(activity => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', activity.id.toString());
    
    // Date cell
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(activity.date);
    
    // Information cell - no inline edit button
    const infoCell = document.createElement('td');
    infoCell.innerHTML = `
      <div class="info-text">${escapeHtml(activity.information)}</div>
    `;
    
    row.appendChild(dateCell);
    row.appendChild(infoCell);
    
    // Attach event listeners for hover and click
    row.addEventListener('click', (event) => selectRowIfNotEditing(event, row));
    row.onmouseover = () => addHoverClass(row);
    row.onmouseout = () => removeHoverClass(row);
    
    tbody.appendChild(row);
  });
  
  console.log(`Rendered ${activities.length} rows`);
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== SELECTION HANDLING ====================

function addHoverClass(row) {
  // Don't add hover class to selected rows
  if (!row.classList.contains('selected')) {
    row.classList.add('hovered');
  }
}

function removeHoverClass(row) {
  // Remove hover class, but keep it on selected rows
  if (!row.classList.contains('selected')) {
    row.classList.remove('hovered');
  }
}

function highlightRow(row) {
  row.classList.add('selected');
  // Remove hover class when selected
  removeHoverClass(row);
}

function unhighlightRow(row) {
  row.classList.remove('hovered');
}

function selectRowIfNotEditing(event, row) {
  // Don't select if clicking on a button (like edit)
  const target = event.target;
  const tagName = target.tagName.toLowerCase();
  
  if (tagName === 'button') {
    return;
  }
  
  // Deselect all rows first
  document.querySelectorAll('#activityTable tr').forEach(r => r.classList.remove('selected'));
  
  // Highlight selected row
  highlightRow(row);
  selectedRowId = parseInt(row.getAttribute('data-id'));
  console.log(`Selected row ID: ${selectedRowId}`);
}

function getSelectedId() {
  return selectedRowId || null;
}

// ==================== CRUD OPERATIONS ====================

async function addRow() {
  const today = new Date().toLocaleDateString();
  
  // Prevent adding if not fully loaded
  if (!initialLoadComplete) {
    alert('Please refresh the page and try again. The app is still loading.');
    console.log(`App still loading, cannot add row`);
    return;
  }
  
  console.log(`Add button clicked for date: ${today}`);
  
  // Ask for confirmation before proceeding
  if (!confirm(`Add a new entry for ${today}?\n\nClick OK to continue, Cancel to skip.`)) {
    console.log(`Add cancelled by user`);
    return;
  }
  
  const info = prompt('Enter activity information:');
  
  if (info === null || info.trim() === '') {
    alert('Information cannot be empty.');
    return;
  }
  
  try {
    // Send to server
    const response = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: today,
        information: info.trim()
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create activity');
    }
    
    // Reload activities from server
    const result = await response.json();
    
    if (result.success) {
      // Refresh the table with updated data
      const allResponse = await fetch(`${API_BASE}/activities`);
      const allData = await allResponse.json();
      
      if (allData.success) {
        renderTable(allData.data);
        alert('Activity added successfully!');
      } else {
        throw new Error(allData.message || 'Failed to refresh data');
      }
    } else {
      throw new Error(result.message || 'Failed to create activity');
    }
  } catch (error) {
    console.error('Error adding row:', error);
    alert(`Error: ${error.message}. Please try again or check server logs.`);
  }
}

async function deleteRow() {
  const id = getSelectedId();
  
  if (!id) {
    alert('Please select a row to delete by clicking on it.');
    console.log(`No row selected for deletion`);
    return;
  }
  
  console.log(`Row ID ${id} selected, preparing for deletion...`);
  
  // Select the row visually
  document.querySelectorAll('#activityTable tr').forEach(r => r.classList.remove('selected'));
  highlightRow(document.querySelector(`tr[data-id="${id}"]`));
  selectedRowId = id;
  
  const confirmed = confirm(`Are you sure you want to delete this entry?\n\nThis action cannot be undone.`);
  
  if (!confirmed) {
    console.log(`Deletion cancelled for row ID ${id}`);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete activity');
    }
    
    // Refresh the table with updated data
    const allResponse = await fetch(`${API_BASE}/activities`);
    const allData = await allResponse.json();
    
    if (allData.success) {
      renderTable(allData.data);
      selectedRowId = null;
      alert('Activity deleted successfully!');
    } else {
      throw new Error(allData.message || 'Failed to refresh data');
    }
  } catch (error) {
    console.error('Error deleting row:', error);
    alert(`Error: ${error.message}. Please try again.`);
  }
}

async function editRow(id) {
  const confirmed = confirm('Click OK to edit this entry or Cancel to leave it as is.');
  
  if (!confirmed) {
    return;
  }
  
  // Clear selection and deselect all rows
  document.querySelectorAll('#activityTable tr').forEach(r => r.classList.remove('selected'));
  selectedRowId = null;
  console.log(`Preparing to edit row ID: ${id}`);
  
  try {
    // First, get current data
    const response = await fetch(`${API_BASE}/activities/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load activity');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to load activity');
    }
    
    const currentInfo = result.data.information;
    
    // Prompt user for new info
    const newInfo = prompt('Edit this entry:', currentInfo);
    
    if (newInfo === null || newInfo.trim() === '') {
      alert('Information cannot be empty.');
      return;
    }
    
    // Update on server
    const updateResponse = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: result.data.date,
        information: newInfo.trim()
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'Failed to update activity');
    }
    
    // Reload and refresh table
    const allResponse = await fetch(`${API_BASE}/activities`);
    const allData = await allResponse.json();
    
    if (allData.success) {
      renderTable(allData.data);
      alert('Activity updated successfully!');
    } else {
      throw new Error(allData.message || 'Failed to refresh data');
    }
  } catch (error) {
    console.error('Error editing row:', error);
    alert(`Error: ${error.message}. Changes were not saved.`);
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Attach hover listeners to existing rows (only CSS handles visual changes)
function attachTableListeners() {
  const tbody = document.querySelector('#activityTable tbody');
  
  if (!tbody) {
    console.warn('Activity table not found');
    return;
  }
  
  // Attach hover listeners to all existing rows for visual effects
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    row.onmouseover = () => highlightRow(row);
    row.onmouseout = () => unhighlightRow(row);
  });
}

// Log when page is loaded
console.log('Databook App initialized. Connected to server API.');

// ==================== BUTTON HANDLERS (wrappers for row functions) ====================

function editSelected() {
  const id = getSelectedId();
  if (!id) {
    alert('Please select a row by clicking on it first.');
    return;
  }
  editRow(id);
}

function deleteSelected() {
  deleteRow();
}
