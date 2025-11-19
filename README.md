# FTAM Restaurant Status API

A lightweight backend API for managing restaurant status (open, closed, paused) with real-time updates for Shopify dynamic announcement bars.

## Features

- **RESTful API** with two main endpoints for status management
- **Real-time pause timer** with automatic countdown and status transitions
- **In-memory data store** for fast, lightweight operation
- **CORS enabled** for easy Shopify integration
- **Simple deployment** to cloud platforms (Heroku, Render, etc.)

## Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mhallia29/FTAM-Admin.git
cd FTAM-Admin
```

2. Install dependencies:
```bash
npm install
```

## Running Locally

Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

You should see output like:
```
✓ Server is running on port 3000
✓ API endpoints available at http://localhost:3000/api
✓ Current status: open
```

## API Endpoints

### 1. GET /api/restaurant-status

Get the current status of the restaurant.

**Response:**
```json
{
  "status": "open",
  "remainingTime": 0,
  "message": "Restaurant is open for orders"
}
```

**Status values:**
- `open` - Restaurant is accepting orders
- `closed` - Restaurant is closed
- `paused` - Restaurant is temporarily paused (includes remaining time)

**Example with paused status:**
```json
{
  "status": "paused",
  "remainingTime": 180,
  "message": "Orders paused. Resuming in 3 minutes"
}
```

### 2. POST /api/update-status

Update the restaurant status (admin endpoint).

**Request Body:**
```json
{
  "status": "paused",
  "pauseTime": 300
}
```

**Parameters:**
- `status` (required): One of `"open"`, `"closed"`, or `"paused"`
- `pauseTime` (required for paused status): Duration in seconds

**Response:**
```json
{
  "success": true,
  "status": "paused",
  "remainingTime": 300,
  "message": "Status updated to paused for 300 seconds"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid status. Must be one of: open, closed, paused"
}
```

## Testing the API

### Using cURL

1. **Get current status:**
```bash
curl http://localhost:3000/api/restaurant-status
```

2. **Set status to open:**
```bash
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -d '{"status": "open"}'
```

3. **Set status to closed:**
```bash
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

4. **Pause for 5 minutes (300 seconds):**
```bash
curl -X POST http://localhost:3000/api/update-status \
  -H "Content-Type: application/json" \
  -d '{"status": "paused", "pauseTime": 300}'
```

### Using Postman or Similar Tools

1. **GET Request:**
   - URL: `http://localhost:3000/api/restaurant-status`
   - Method: GET

2. **POST Request:**
   - URL: `http://localhost:3000/api/update-status`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "status": "paused",
       "pauseTime": 180
     }
     ```

## Deployment

### Deploying to Heroku

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Deploy:
```bash
git push heroku main
```

5. Open your app:
```bash
heroku open
```

Your API will be available at `https://your-app-name.herokuapp.com`

### Deploying to Render

1. Push your code to GitHub

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click "New +" and select "Web Service"

4. Connect your GitHub repository

5. Configure:
   - **Name**: ftam-restaurant-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. Click "Create Web Service"

Your API will be available at the Render-provided URL.

### Environment Variables

The server uses the `PORT` environment variable. If not set, it defaults to 3000.

For cloud deployments, the platform automatically sets the `PORT` variable.

## Integration with Shopify

### Frontend Integration Example

```javascript
// Fetch restaurant status
fetch('https://your-api-url.com/api/restaurant-status')
  .then(response => response.json())
  .then(data => {
    console.log('Status:', data.status);
    console.log('Message:', data.message);
    
    // Update your announcement bar
    if (data.status === 'paused') {
      document.getElementById('announcement').textContent = 
        `Orders paused. Resuming in ${data.remainingTime} seconds`;
    }
  });
```

### Polling for Updates

```javascript
// Poll every 10 seconds for status updates
setInterval(() => {
  fetch('https://your-api-url.com/api/restaurant-status')
    .then(response => response.json())
    .then(data => {
      updateAnnouncementBar(data);
    });
}, 10000);
```

## Project Structure

```
FTAM-Admin/
├── server.js          # Main Express server
├── package.json       # Project dependencies
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## How It Works

1. **In-Memory Storage**: Restaurant status is stored in memory for fast access
2. **Pause Timer**: When paused, the system stores the start time and duration
3. **Automatic Expiry**: When requesting status, if pause time has expired, status automatically changes to "open"
4. **Real-time Calculation**: Remaining time is calculated on each request for accuracy

## Limitations & Considerations

- **In-Memory Storage**: Status resets when server restarts. For persistence, integrate a database like SQLite or PostgreSQL.
- **Single Instance**: If running multiple instances, consider using Redis or a database for shared state.
- **No Authentication**: Add authentication (API keys, JWT) before production use.

## Future Enhancements

- Add SQLite database for persistent storage
- Implement authentication and authorization
- Add scheduled status changes
- WebSocket support for real-time push updates
- Admin dashboard UI
- Status change history logging

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.