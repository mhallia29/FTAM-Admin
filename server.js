const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store for restaurant status
let restaurantStatus = {
  status: 'open', // 'open', 'closed', or 'paused'
  pauseStartTime: null, // Timestamp when pause started
  pauseDuration: 0, // Pause duration in seconds
};

/**
 * Calculate remaining pause time in seconds
 * @returns {number} Remaining time in seconds, or 0 if not paused or expired
 */
function getRemainingPauseTime() {
  if (restaurantStatus.status !== 'paused' || !restaurantStatus.pauseStartTime) {
    return 0;
  }

  const now = Date.now();
  const elapsed = Math.floor((now - restaurantStatus.pauseStartTime) / 1000);
  const remaining = restaurantStatus.pauseDuration - elapsed;

  // If pause time has expired, automatically transition to open
  if (remaining <= 0) {
    restaurantStatus.status = 'open';
    restaurantStatus.pauseStartTime = null;
    restaurantStatus.pauseDuration = 0;
    return 0;
  }

  return remaining;
}

/**
 * GET /api/restaurant-status
 * Returns the current restaurant status and remaining pause time if applicable
 */
app.get('/api/restaurant-status', (req, res) => {
  const remainingTime = getRemainingPauseTime();
  
  res.json({
    status: restaurantStatus.status,
    remainingTime: remainingTime,
    message: getStatusMessage(restaurantStatus.status, remainingTime)
  });
});

/**
 * POST /api/update-status
 * Updates the restaurant status
 * Request body: { status: 'open' | 'closed' | 'paused', pauseTime?: number }
 */
app.post('/api/update-status', (req, res) => {
  const { status, pauseTime } = req.body;

  // Validate status
  if (!status || !['open', 'closed', 'paused'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be one of: open, closed, paused'
    });
  }

  // If status is paused, validate pauseTime
  if (status === 'paused') {
    if (!pauseTime || typeof pauseTime !== 'number' || pauseTime <= 0) {
      return res.status(400).json({
        error: 'pauseTime is required and must be a positive number when status is paused'
      });
    }

    restaurantStatus.status = 'paused';
    restaurantStatus.pauseStartTime = Date.now();
    restaurantStatus.pauseDuration = pauseTime;
  } else {
    // For open or closed status, clear pause timer
    restaurantStatus.status = status;
    restaurantStatus.pauseStartTime = null;
    restaurantStatus.pauseDuration = 0;
  }

  const remainingTime = getRemainingPauseTime();

  res.json({
    success: true,
    status: restaurantStatus.status,
    remainingTime: remainingTime,
    message: `Status updated to ${status}${status === 'paused' ? ` for ${pauseTime} seconds` : ''}`
  });
});

/**
 * GET / - Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'FTAM Restaurant Status API',
    version: '1.0.0',
    endpoints: {
      status: 'GET /api/restaurant-status',
      update: 'POST /api/update-status'
    }
  });
});

/**
 * Helper function to generate status message
 */
function getStatusMessage(status, remainingTime) {
  switch (status) {
    case 'open':
      return 'Restaurant is open for orders';
    case 'closed':
      return 'Restaurant is currently closed';
    case 'paused':
      return `Orders paused. Resuming in ${formatTime(remainingTime)}`;
    default:
      return 'Status unknown';
  }
}

/**
 * Format seconds into a human-readable time string
 */
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✓ Current status: ${restaurantStatus.status}`);
});
