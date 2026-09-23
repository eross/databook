# Databook - Secure Node.js Activity Tracker

A secure Node.js web application for tracking activities with SQLite persistence.

## ✨ Features

- ✅ **Server-side data storage** using SQLite (data persists across page reloads)
- ✅ **Secure CRUD operations** with server validation
- ✅ **Automatic ID management** with database auto-increment
- ✅ **XSS protection** via HTML escaping and security headers
- ✅ **Graceful shutdown** handling for production safety
- ✅ **Health check endpoint** for monitoring
- ✅ **RESTful API** for programmatic access

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start the server (development mode)
npm run dev

# Or start in production
npm start
```

## 📖 Usage

1. Open your browser to `http://localhost:3000`
2. Click rows to select them
3. Use the buttons to Add, Edit, or Delete entries

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get all activities |
| GET | `/api/activities/:id` | Get activity by ID |
| POST | `/api/activities` | Create new activity |
| PUT | `/api/activities/:id` | Update activity |
| DELETE | `/api/activities/:id` | Delete activity |

### Health Check

Visit `http://localhost:3000/health` or the health page to check server status.

## 🔒 Security Improvements

See [SECURITY.md](./SECURITY.md) for details on critical fixes applied:

- Server-side validation of all inputs
- Database-backed storage with foreign keys
- XSS protection and security headers via Helmet
- Proper error handling and logging
- Graceful shutdown with database cleanup

## 📁 Project Structure

```
databook/
├── index.js              # Main server application
├── package.json          # Dependencies
├── README.md             # This file
├── SECURITY.md           # Security documentation
├── public/
│   ├── index.html       # Main HTML template
│   └── health.html      # Health check page
├── static/
│   └── data.js          # Client-side JavaScript
└── data.db              # SQLite database (created on first run)
```

## 📚 API Reference

### Create Activity (POST `/api/activities`)

```json
{
  "date": "2024-01-01",
  "information": "New activity entry"
}
```

### Update Activity (PUT `/api/activities/:id`)

```json
{
  "date": "2024-01-02",
  "information": "Updated information"
}
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process on port 3000 or change `port` variable in `index.js` |
| Database file missing | Delete `data.db` and restart (auto-initializes) |
| Connection refused | Ensure server is running (`npm start`) |

## 📝 License

MIT
