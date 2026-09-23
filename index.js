// Databook App - Server with JSON File Persistence
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === Configuration ===
const DATA_FILE = path.join(__dirname, 'data.json');

// === Middleware ===

// CORS - allow all origins for demo (restrict in production)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// === File-Based Storage Helper Functions ===

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading data file:', err.message);
  }
  return [];
}

function writeData(activities) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(activities, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing data file:', err.message);
    return false;
  }
}

// === Health Check Endpoint ===

app.get('/health', (req, res) => {
  const activities = readData();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    recordCount: activities.length,
    databasePath: DATA_FILE,
    uptime: process.uptime() + 's'
  });
});

// === Activities API Endpoints ===

// GET /api/activities - Get all activities
app.get('/api/activities', (req, res) => {
  try {
    const activities = readData();
    
    // Sort by date descending (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, data: activities, count: activities.length });
  } catch (err) {
    console.error('Error in GET /api/activities:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/activities/:id - Get activity by ID
app.get('/api/activities/:id', (req, res) => {
  try {
    const activities = readData();
    const id = parseInt(req.params.id);
    
    // Find and return the activity
    const activity = activities.find(a => a.id === id);
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: `Activity with ID ${id} not found` 
      });
    }
    
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('Error in GET /api/activities/:id:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/activities - Create new activity
app.post('/api/activities', (req, res) => {
  try {
    const activities = readData();
    const { date, information } = req.body;
    
    // Validate inputs
    if (!date || !information) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and information are required' 
      });
    }
    
    // Generate unique ID (incremental)
    const highestId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) : 0;
    const newId = highestId + 1;
    
    // Create new activity object
    const newActivity = {
      id: newId,
      date,
      information
    };
    
    // Add to array and persist
    activities.push(newActivity);
    
    if (!writeData(activities)) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save data' 
      });
    }
    
    // Sort after adding (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(201).json({ 
      success: true, 
      message: 'Activity created',
      data: newActivity
    });
  } catch (err) {
    console.error('Error in POST /api/activities:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// PUT /api/activities/:id - Update activity
app.put('/api/activities/:id', (req, res) => {
  try {
    const activities = readData();
    const id = parseInt(req.params.id);
    const { date, information } = req.body;
    
    // Validate inputs
    if (!date || !information) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and information are required' 
      });
    }
    
    // Find activity by ID
    const activityIndex = activities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: `Activity with ID ${id} not found` 
      });
    }
    
    // Update the activity
    activities[activityIndex].date = date;
    activities[activityIndex].information = information;
    
    if (!writeData(activities)) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save data' 
      });
    }
    
    // Sort after update
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ 
      success: true, 
      message: 'Activity updated',
      data: activities[activityIndex]
    });
  } catch (err) {
    console.error('Error in PUT /api/activities/:id:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// DELETE /api/activities/:id - Delete activity
app.delete('/api/activities/:id', (req, res) => {
  try {
    const activities = readData();
    const id = parseInt(req.params.id);
    
    // Find and remove the activity
    const activityIndex = activities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: `Activity with ID ${id} not found` 
      });
    }
    
    const deletedActivity = activities.splice(activityIndex, 1)[0];
    
    if (!writeData(activities)) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save data' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `Activity deleted`,
      deletedId: id
    });
  } catch (err) {
    console.error('Error in DELETE /api/activities/:id:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// === Serve Index for All Routes ===

// Catch-all route to serve the main page for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Start Server ===

const server = app.listen(PORT, () => {
  console.log(`🚀 Databook server running on http://localhost:${PORT}`);
  console.log(`   - Health check: http://localhost:${PORT}/health`);
  console.log(`   - Activities API: http://localhost:${PORT}/api/activities`);
  console.log(`   - Data stored in: ${DATA_FILE}`);
});

// === Graceful Shutdown ===

const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  
  // Save any pending writes before exiting
  const activities = readData();
  writeData(activities);
  
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// === Error Handling Middleware ===

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // In production, hide sensitive details
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      success: false,
      message: 'Something went wrong',
      code: process.env.DEBUG ? err.message : undefined
    });
  } else {
    // Development - show full error
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
});

// === 404 Handler ===

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.originalUrl} not found` 
  });
});
