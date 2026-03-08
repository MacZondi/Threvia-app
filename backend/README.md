# Threvia Backend API Setup

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment

Create `.env` file in backend directory:

```
DATABASE_URL=postgresql://threvia_user:secure_password_here@localhost:5432/threvia
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
BASE_RPC_URL=https://sepolia.base.org
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### 3. Install PostgreSQL (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### 4. Create Database

```bash
sudo -u postgres psql
CREATE DATABASE threvia;
CREATE USER threvia_user WITH PASSWORD 'secure_password_here';
ALTER ROLE threvia_user SET client_encoding TO 'utf8';
ALTER ROLE threvia_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE threvia_user SET default_transaction_deferrable TO on;
ALTER ROLE threvia_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;
\q
```

### 5. Start Backend Server

```bash
npm run dev
```

Expected output:
```
✅ Threvia API running on port 5000
🌐 http://localhost:5000
```

## API Endpoints

### Authentication

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "bucks_balance": 0,
    "engagement_score": 0
  }
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**POST /api/auth/login-base**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc0e7595f47cBf",
  "name": "John Doe"
}
```

### Users

**GET /api/users** (Admin only)
- Returns all users

**GET /api/users/me**
- Returns current user profile (requires auth token)

**PUT /api/users/me**
```json
{
  "name": "Updated Name",
  "phone": "+9876543210"
}
```

**DELETE /api/users/:id** (Admin only)
- Deletes a user

**POST /api/users/:id/add-bucks** (Admin only)
```json
{
  "amount": 1000
}
```

**GET /api/users/leaderboard**
- Returns top 10 users by engagement score

### Competitions

**GET /api/competitions**
- Returns all competitions

**POST /api/competitions** (Admin only)
```json
{
  "name": "February Challenge",
  "description": "Step count challenge",
  "metric": "steps",
  "start_date": "2024-02-01T00:00:00Z",
  "end_date": "2024-02-29T23:59:59Z",
  "prize_pool": 10000
}
```

**PUT /api/competitions/:id** (Admin only)

**DELETE /api/competitions/:id** (Admin only)

### Token

**GET /api/token/info**
- Returns token metadata

**GET /api/token/balance/:address**
- Returns user's bucks balance

**POST /api/token/purchase-data**
```json
{
  "packageId": "unlimited",
  "amount": 5000
}
```

### Chat

**POST /api/chat**
```json
{
  "messages": [
    { "role": "user", "content": "How do I manage exam stress?" }
  ],
  "system": "You are the Threvia Intelligence Engine...",
  "max_tokens": 700
}
```

Response:
```json
{
  "reply": "A practical first step is to set a 25-minute study block...",
  "model": "claude-sonnet-4-20250514"
}
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGc...
```

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+1234567890","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

## Connecting Frontend to Backend

Update frontend API calls to use `http://localhost:5000/api` instead of localStorage.

Example in Login.jsx:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('authToken', data.token);
```
