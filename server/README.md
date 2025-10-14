# 🌌 EchoLens Server

Backend API for EchoLens Chrome Extension

## Setup

1. Install dependencies:
```bash
npm install express mongoose cors dotenv
npm install -D nodemon
```

2. Configure environment:
```bash
cp server/.env.example server/.env
# Edit .env with your MongoDB URI and API keys
```

3. Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

4. Run the server:
```bash
# Development mode with auto-restart
npm run server:dev

# Production mode
npm run server
```

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId/settings` - Update user settings

### Memory Management
- `POST /api/memories` - Create new memory
- `GET /api/memories?userId=:userId` - Get user memories
- `GET /api/memories/:memoryId` - Get specific memory
- `PUT /api/memories/:memoryId` - Update memory
- `DELETE /api/memories/:memoryId` - Delete memory

### Search & Stats
- `GET /api/memories/search?userId=:userId&query=:query` - Search memories
- `GET /api/stats/:userId` - Get user statistics

### Sync
- `POST /api/sync` - Bulk sync memories from extension

## Database Schema

### User
```javascript
{
  email: String,
  name: String,
  apiKey: String,
  aiProvider: String,
  subscription: String,
  createdAt: Date
}
```

### Memory
```javascript
{
  userId: ObjectId,
  url: String,
  title: String,
  content: String,
  visits: Number,
  totalTimeSpent: Number,
  firstVisit: Date,
  lastVisit: Date,
  highlights: [{ text, timestamp }],
  tags: [String],
  insights: {
    summary: String,
    topics: [String],
    aiGenerated: Boolean
  }
}
```

## Future Features

- [ ] Authentication with JWT
- [ ] Rate limiting
- [ ] Webhook support for integrations
- [ ] Export to Notion/Obsidian
- [ ] Team workspaces
- [ ] Advanced analytics
