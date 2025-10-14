const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echolens';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('📦 Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  apiKey: String,
  aiProvider: { type: String, default: 'openai' },
  subscription: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

const MemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String, required: true },
  title: String,
  content: String,
  visits: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: Date,
  highlights: [{
    text: String,
    timestamp: Date
  }],
  tags: [String],
  insights: {
    summary: String,
    topics: [String],
    aiGenerated: Boolean
  }
});

const User = mongoose.model('User', UserSchema);
const Memory = mongoose.model('Memory', MemorySchema);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EchoLens API is running' });
});

// User routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = new User({ email, name });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

app.put('/api/users/:userId/settings', async (req, res) => {
  try {
    const { apiKey, aiProvider } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { apiKey, aiProvider },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Memory routes
app.post('/api/memories', async (req, res) => {
  try {
    const memory = new Memory(req.body);
    await memory.save();
    res.status(201).json({ success: true, memory });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/memories', async (req, res) => {
  try {
    const { userId, limit = 50, skip = 0 } = req.query;
    const memories = await Memory.find({ userId })
      .sort({ lastVisit: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    res.json({ success: true, memories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/memories/:memoryId', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.memoryId);
    res.json({ success: true, memory });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Memory not found' });
  }
});

app.put('/api/memories/:memoryId', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(
      req.params.memoryId,
      req.body,
      { new: true }
    );
    res.json({ success: true, memory });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/memories/:memoryId', async (req, res) => {
  try {
    await Memory.findByIdAndDelete(req.params.memoryId);
    res.json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Search memories
app.get('/api/memories/search', async (req, res) => {
  try {
    const { userId, query } = req.query;
    const memories = await Memory.find({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { url: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ lastVisit: -1 });
    res.json({ success: true, memories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Sync endpoint
app.post('/api/sync', async (req, res) => {
  try {
    const { userId, memories } = req.body;
    
    // Bulk upsert memories
    const bulkOps = memories.map(memory => ({
      updateOne: {
        filter: { userId, url: memory.url },
        update: { $set: memory },
        upsert: true
      }
    }));

    await Memory.bulkWrite(bulkOps);
    
    res.json({ success: true, message: 'Sync completed' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Stats endpoint
app.get('/api/stats/:userId', async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.params.userId });
    
    const stats = {
      totalMemories: memories.length,
      totalVisits: memories.reduce((sum, m) => sum + m.visits, 0),
      totalTimeSpent: memories.reduce((sum, m) => sum + m.totalTimeSpent, 0),
      totalHighlights: memories.reduce((sum, m) => sum + m.highlights.length, 0),
      topTags: getTopTags(memories, 10)
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Helper functions
function getTopTags(memories, limit) {
  const tagCount = {};
  memories.forEach(memory => {
    memory.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

// Start server
app.listen(PORT, () => {
  console.log(`🌌 EchoLens API server running on port ${PORT}`);
});

module.exports = app;
