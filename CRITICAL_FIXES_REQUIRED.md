# SupriAI - Critical Security Fixes Required

**Priority**: 🔴 CRITICAL  
**Timeline**: Must be completed before production deployment  
**Estimated Time**: 4-6 hours

---

## Table of Contents
1. [Authentication Implementation](#1-authentication-implementation)
2. [Input Validation](#2-input-validation)
3. [HTTPS Enforcement](#3-https-enforcement)
4. [Rate Limiting](#4-rate-limiting)
5. [Error Logging](#5-error-logging)
6. [Testing Guide](#testing-guide)

---

## 1. Authentication Implementation

### Current Status
❌ NO JWT or API key validation

### Impact
- Anyone can access all API endpoints
- No user identification on backend
- Potential data breach

### Solution: Add JWT Authentication

#### Step 1: Install Dependencies
```bash
npm install jsonwebtoken express-jwt dotenv
```

#### Step 2: Update `.env`
```
MONGODB_URI=mongodb://localhost:27017/supriai
PORT=3000
JWT_SECRET=your_super_secret_key_change_in_production_12345
NODE_ENV=development
```

#### Step 3: Update `server/index.js`
Add this at the top after middleware setup:

```javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Generate token function
const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

#### Step 4: Add Auth Endpoints
```javascript
// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Verify password (implement bcrypt for real passwords)
    const token = generateToken(user._id);
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Hash password (use bcrypt in production)
    const user = new User({ email, name });
    await user.save();
    
    const token = generateToken(user._id);
    
    res.status(201).json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

#### Step 5: Protect All Routes
Replace all memory/user routes with verification:

```javascript
// BEFORE
app.get('/api/memories', async (req, res) => {
  
// AFTER
app.get('/api/memories', verifyToken, async (req, res) => {
  const userId = req.userId; // Use from token
  
  try {
    const { limit = 50, skip = 0 } = req.query;
    const memories = await Memory.find({ userId })
      .sort({ lastVisit: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    
    res.json({ success: true, memories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

#### Step 6: Update Extension to Send Token
In `src/background/background.js`, add token management:

```javascript
// Store token after login
async storeAuthToken(token) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ auth_token: token }, () => {
      resolve();
    });
  });
}

// Retrieve token for API calls
async getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['auth_token'], (result) => {
      resolve(result.auth_token || null);
    });
  });
}

// Make authenticated API call
async apiCall(endpoint, method = 'GET', data = null) {
  const token = await this.getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}
```

---

## 2. Input Validation

### Current Status
❌ No validation layer

### Impact
- Data corruption
- SQL injection (if applicable)
- XSS attacks
- Type errors

### Solution: Implement Joi Validation

#### Step 1: Install Joi
```bash
npm install joi
```

#### Step 2: Create Validation Schema
Create `server/validators.js`:

```javascript
const Joi = require('joi');

const validators = {
  registerUser: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      }),
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required'
      })
  }),

  createMemory: Joi.object({
    url: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Invalid URL format'
      }),
    title: Joi.string()
      .max(200)
      .required(),
    content: Joi.string()
      .max(50000)
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    visits: Joi.number()
      .integer()
      .min(0)
      .optional(),
    totalTimeSpent: Joi.number()
      .integer()
      .min(0)
      .optional()
  }),

  updateMemory: Joi.object({
    title: Joi.string()
      .max(200)
      .optional(),
    content: Joi.string()
      .max(50000)
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .optional(),
    visits: Joi.number()
      .integer()
      .min(0)
      .optional(),
    totalTimeSpent: Joi.number()
      .integer()
      .min(0)
      .optional()
  }).min(1),

  searchMemories: Joi.object({
    query: Joi.string()
      .max(100)
      .required(),
    userId: Joi.string()
      .required(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
  })
};

module.exports = validators;
```

#### Step 3: Create Validation Middleware
```javascript
// In server/index.js
const validators = require('./validators');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages
      });
    }

    req.validatedData = value;
    next();
  };
};
```

#### Step 4: Apply to Routes
```javascript
// BEFORE
app.post('/api/memories', async (req, res) => {
  try {
    const memory = new Memory(req.body);

// AFTER
app.post('/api/memories', verifyToken, validateRequest(validators.createMemory), async (req, res) => {
  try {
    const memory = new Memory({
      ...req.validatedData,
      userId: req.userId
    });
```

---

## 3. HTTPS Enforcement

### Current Status
⚠️ No HTTPS requirement

### For Development
Add SSL redirect middleware:

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.host}${req.url}`);
  }
  next();
});
```

### For Production
Use Node.js with HTTPS:

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./path/to/private-key.pem'),
  cert: fs.readFileSync('./path/to/certificate.pem')
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`✨ Secure server running on https://localhost:${PORT}`);
});
```

Or deploy on platforms like Heroku, AWS, Azure that handle SSL automatically.

---

## 4. Rate Limiting

### Current Status
❌ No rate limiting

### Solution

#### Step 1: Install Package
```bash
npm install express-rate-limit
```

#### Step 2: Configure Middleware
```javascript
const rateLimit = require('express-rate-limit');

// General API limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

// Apply globally
app.use('/api/', limiter);

// Apply to auth routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  // Login logic
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  // Register logic
});
```

---

## 5. Error Logging

### Current Status
⚠️ Basic console.error only

### Solution: Implement Winston Logger

#### Step 1: Install Winston
```bash
npm install winston winston-daily-rotate-file
```

#### Step 2: Configure Logger
Create `server/logger.js`:

```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'supriai-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
        )
      )
    }),
    // File transports for production
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxDays: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '14d'
    })
  ]
});

module.exports = logger;
```

#### Step 3: Use Logger in Routes
```javascript
const logger = require('./logger');

app.post('/api/memories', verifyToken, validateRequest(validators.createMemory), async (req, res) => {
  try {
    const memory = new Memory({
      ...req.validatedData,
      userId: req.userId
    });
    
    await memory.save();
    logger.info('Memory created', { 
      userId: req.userId, 
      memoryId: memory._id 
    });
    
    res.status(201).json({ success: true, memory });
  } catch (error) {
    logger.error('Error creating memory', { 
      userId: req.userId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(400).json({ 
      success: false, 
      error: 'Failed to create memory' 
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
```

---

## Testing Guide

### 1. Test Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "securepass123"
  }'

# Response
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {...}
}

# Use token for authenticated request
curl -X GET http://localhost:3000/api/memories \
  -H "Authorization: Bearer eyJhbGc..."
```

### 2. Test Input Validation

```bash
# Invalid email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "name": "Test",
    "password": "pass"
  }'

# Response
{
  "success": false,
  "error": "Validation failed",
  "details": [...]
}
```

### 3. Test Rate Limiting

```bash
# Multiple requests to trigger limit
for i in {1..101}; do
  curl http://localhost:3000/api/stats/userId
done

# 101st request will return 429 Too Many Requests
```

---

## Deployment Checklist

- [ ] Update JWT_SECRET in production environment
- [ ] Configure MongoDB Atlas connection
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS with valid certificates
- [ ] Configure logging paths and rotation
- [ ] Set up monitoring and alerting
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Load test with Apache Bench or Artillery
- [ ] Document API in Swagger/OpenAPI
- [ ] Create backup procedures
- [ ] Set up CI/CD pipeline
- [ ] Security audit of all endpoints
- [ ] Database index optimization
- [ ] Performance profiling

---

## Timeline

**Day 1**: Authentication implementation
**Day 1-2**: Input validation
**Day 2**: Rate limiting and error logging
**Day 3**: Testing and integration
**Day 3-4**: Deployment preparation

**Total Effort**: 4-6 hours

---

## Additional Resources

- JWT Documentation: https://jwt.io
- Joi Schema Validation: https://joi.dev
- Winston Logger: https://github.com/winstonjs/winston
- Express Rate Limit: https://github.com/nfriedly/express-rate-limit
- OWASP Security Guidelines: https://owasp.org

---

**Status**: Ready for implementation  
**Last Updated**: October 17, 2025
