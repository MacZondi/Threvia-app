# Threvia App - Implementation Roadmap

## Project Overview
Threvia is an AI-powered health & wellness platform for South African youth with:
- **Free Mode**: Login, buy data, transfer (no data required)
- **Restricted Features**: Education, health, research, map (free after watching ads)
- **Premium Features**: Other uses (require earning Threvia-bucks via points)
- **Ad System**: Unskippable ads that earn data/points
- **AI Agent**: WhatsApp/Telegram bot for health reminders and info
- **Token**: THREV on Base blockchain

---

## Phase 1: Ad & Data System (Priority 1)

### 1.1 Advert System Architecture

#### First Ad Flow (Mandatory, post-login)
- User logs in → Immediately shown **randomized ad** from sponsor pool
- **Cannot skip** - must watch entire duration
- **Reward**: 25 minutes of free data allocation
- Duration: Random 10-20 seconds
- Video: YouTube embed (using YouTube Player API)

#### Recurring Ads (Every 5 minutes during data usage)
- **Trigger**: Every 5 minutes of active app usage
- **Cannot skip** - 30-second unskippable ad
- **Reward**: 50 points per ad watched
- Randomized from sponsor pool
- In-session counter visible

#### Components Needed
```
src/
├── components/
│   ├── AdModal.jsx           # Unskippable ad display
│   ├── YouTubePlayer.jsx     # YouTube video embed
│   ├── AdRewardModal.jsx     # Reward notification
│   ├── DataUsageBar.jsx      # Active data timer
│   └── PointsCounter.jsx     # Points earned display
├── hooks/
│   ├── useAdSystem.js        # Ad logic & timing
│   ├── useDataSession.js     # 25-min session tracking
│   └── usePointsSystem.js    # Points accumulation
└── contexts/
    └── DataContext.jsx       # Global data/points state
```

#### Ad Randomization Algorithm
```javascript
// Sponsors pool with weighted distribution
const SPONSORS = [
  { id: 'vodacom', weight: 1.2, category: 'telecom' },
  { id: 'capitec', weight: 1.0, category: 'finance' },
  { id: 'nsfas', weight: 0.8, category: 'education' },
  { id: 'doh', weight: 1.5, category: 'health' },
  { id: 'mtn', weight: 1.2, category: 'telecom' },
];

// No repeat ads within 24 hours
// Track: last_ad_id, timestamp, watch_duration
```

---

### 1.2 Data Usage Tracking

#### Session Structure
```javascript
{
  session_id: UUID,
  user_id: string,
  started_at: timestamp,
  expires_at: timestamp + 25min,
  data_allocated: 25 * 60 seconds,
  data_remaining: number,
  ads_watched: array,
  points_earned: number,
  is_active: boolean
}
```

#### Offline-First Mode
- App works **without data** after login
- Can browse educational/health/research/map modules
- Cannot access other features
- Sync when connection restored

---

## Phase 2: Access Control & Features (Priority 2)

### 2.1 Feature Matrix

| Feature | Free Mode | With 25min Data | Points→Bucks | Notes |
|---------|-----------|-----------------|--------------|-------|
| Login | ✅ | ✅ | ✅ | No data needed |
| Buy Data | ✅ | ✅ | ✅ | In-app transaction |
| Transfer Bucks | ✅ | ✅ | ✅ | Wallet to wallet |
| Education Module | 🎓 | ✅ | ✅ | Free after ads |
| Health Module | 🏥 | ✅ | ✅ | Free after ads |
| Research Tools | 🔬 | ✅ | ✅ | Free after ads |
| Maps/Clinics | 📍 | ✅ | ✅ | Free after ads |
| Chat/Messaging | ❌ | ✅ | ✅ | Requires data |
| Document Storage | ❌ | ✅ | ✅ | Requires data |
| Other Features | ❌ | ❌ | ✅ | Earn points first |

### 2.2 Access Control Implementation

```javascript
// Access level system
const ACCESS_LEVELS = {
  PUBLIC: 0,           // Login not required
  AUTHENTICATED: 1,    // Logged in (free mode)
  DATA_ACTIVE: 2,      // 25min active session
  POINTS_PREMIUM: 3,   // Earned sufficient points
};

// Module access mapping
const MODULE_ACCESS = {
  education: [ACCESS_LEVELS.DATA_ACTIVE],
  health: [ACCESS_LEVELS.DATA_ACTIVE],
  research: [ACCESS_LEVELS.DATA_ACTIVE],
  map: [ACCESS_LEVELS.DATA_ACTIVE],
  chat: [ACCESS_LEVELS.DATA_ACTIVE],
  documents: [ACCESS_LEVELS.DATA_ACTIVE],
  premium_features: [ACCESS_LEVELS.POINTS_PREMIUM],
};
```

---

## Phase 3: AI Agent & Messaging (Priority 3)

### 3.1 WhatsApp/Telegram Bot Features

#### Capabilities
1. **Health Reminders**
   - Study reminders (customizable schedule)
   - Medication reminders (pill schedules)
   - Doctor appointment alerts
   - Period tracking & predictions
   - Trimester tracking for pregnant users

2. **Health Tracking Integration**
   - Period logs: `/log_period [date]`
   - Pregnancy tracking: `/track_pregnancy [trimester]`
   - Medication adherence: `/log_meds [medication]`
   - Symptom reporting: `/report_symptoms`

3. **Information & Opportunities**
   - Educational events near user (location-based)
   - Learnerships available
   - Internship postings
   - Youth development programs

4. **AI Contextual Responses**
   - Natural language understanding
   - Judgment-free advice
   - Privacy-focused data storage
   - Crisis protocol for mental health

#### Bot Architecture
```
backend/
├── services/
│   ├── whatsappBot.js        # WhatsApp integration
│   ├── telegramBot.js        # Telegram integration
│   ├── aiAgent.js            # AI reasoning engine
│   └── healthReminders.js    # Scheduling & notifications
├── models/
│   ├── HealthProfile.js      # User health data
│   ├── ReminderSchedule.js   # Scheduled reminders
│   └── BotSession.js         # Chat sessions
└── routes/
    └── bot.js                # Webhook endpoints
```

---

## Phase 4: Token & Blockchain (Priority 4)

### 4.1 Threvia-bucks Token (THREV)

#### Token Specifications
- **Network**: Base (Ethereum L2)
- **Standard**: ERC-20
- **Decimals**: 18
- **Initial Supply**: To be determined
- **Symbol**: THREV

#### Points → Bucks Conversion
```javascript
// Conversion formula
const POINTS_TO_BUCKS = 100; // 100 points = 1 THREV

// Earning rates
const EARNING_RATES = {
  watch_ad: 50,        // points per 30-sec ad
  health_log: 10,      // per log entry
  referral: 500,       // per successful referral
  daily_streak: 20,    // per day active
};

// Smart contract function
function convertPointsToBucks(points) {
  require(points % 100 == 0, "Points not divisible by 100");
  uint256 bucks = points / 100;
  // Mint THREV tokens to user wallet
}
```

#### Token Flow Diagram
```
User watches ad
        ↓
   +50 points
        ↓
  Points accumulate
        ↓
  100 points = 1 THREV (conversion)
        ↓
  THREV minted to user wallet
        ↓
  Use for: Buy data, premium features, transfer
```

---

## Phase 5: UI/UX Design (Priority 5)

### 5.1 Key User Flows

#### Login → First Ad Flow
```
1. User logs in
2. System checks: "Has watched intro ad?"
3. NO → Show full-screen ad modal
4. Ad plays (can't skip, 10-20 sec)
5. Completion → "Great! You have 25 minutes data"
6. Redirect to home dashboard
```

#### Home Dashboard Layout
```
┌─────────────────────────────────┐
│ ⏰ Data remaining: 23:45         │
│ ⭐ Points: 850 | 📊 8.5 THREV   │
├─────────────────────────────────┤
│ [Education] [Health] [Research] │
│ [Maps]      [Chat]   [Documents]│
├─────────────────────────────────┤
│ 🎬 Next ad in: 3:42             │
└─────────────────────────────────┘
```

#### Ad Modal (Unskippable)
```
┌──────────────────────────────────┐
│        🚫 Can't skip             │
│   [YouTube Video - 30 seconds]   │
│   Timer: ███████░░░ 18 sec       │
├──────────────────────────────────┤
│ Watch Vodacom ad → +50 points   │
└──────────────────────────────────┘
```

### 5.2 Wireframes to Create
- [ ] Login & Registration screens
- [ ] First ad modal (full-screen, unskippable)
- [ ] Home dashboard with data timer
- [ ] Module pages (Education, Health, Research, Maps)
- [ ] Points & Bucks display
- [ ] Settings (reminder preferences, health profile)
- [ ] Admin dashboard (sponsor management, analytics)

---

## Phase 6: Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  password_hash VARCHAR,
  wallet_address VARCHAR UNIQUE,
  points INT DEFAULT 0,
  threv_balance DECIMAL DEFAULT 0,
  first_ad_watched BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Data Sessions Table
```sql
CREATE TABLE data_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  data_allocated INT (in seconds),
  data_remaining INT,
  ads_watched INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

### Ads Log Table
```sql
CREATE TABLE ad_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  sponsor_id VARCHAR,
  watched_at TIMESTAMP,
  duration_seconds INT,
  points_earned INT,
  session_id UUID REFERENCES data_sessions
);
```

### Bot Sessions Table
```sql
CREATE TABLE bot_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  platform VARCHAR (whatsapp|telegram),
  chat_id VARCHAR,
  last_message_at TIMESTAMP,
  reminders_enabled BOOLEAN
);
```

---

## Technology Stack

### Frontend
- **React 18** with Vite
- **State Management**: Context API + hooks
- **Styling**: Tailwind CSS
- **YouTube API**: @react-youtube/js
- **Web3**: ethers.js, @base-org/account

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Bot SDKs**: 
  - WhatsApp: Twilio SDK
  - Telegram: telegram-bot-api
- **Web3**: ethers.js, hardhat

### Blockchain
- **Network**: Base (Sepolia testnet → Mainnet)
- **Token Standard**: ERC-20
- **Smart Contract**: Solidity ^0.8.19

### External APIs
- **YouTube Data API** (videos)
- **Geolocation API** (map/clinics)
- **AI/LLM**: OpenAI API or similar

---

## Implementation Priority

### Week 1-2: Ad System
1. Create ad modal component
2. Implement YouTube player
3. Build ad randomization logic
4. Track first ad completion
5. Test unskippable functionality

### Week 3-4: Data Tracking
1. Implement 25-minute session timer
2. Build data usage counter
3. Add offline capability
4. Create dashboard with timers

### Week 5-6: Access Control
1. Implement feature matrix
2. Build module guards
3. Create "free mode" state
4. Test all access levels

### Week 7-8: Bot Integration
1. Setup WhatsApp/Telegram webhooks
2. Implement reminder scheduler
3. Build health profile management
4. Create AI response engine

### Week 9-10: Token & Blockchain
1. Update smart contract for conversion
2. Implement points-to-bucks logic
3. Setup minting mechanism
4. Test on Base Sepolia

### Week 11-12: UI/UX & Polish
1. Design system & components
2. Create all wireframes
3. Responsive mobile optimization
4. Performance testing

---

## Security & Compliance

- **POPIA Compliance**: User data storage & consent
- **GDPR**: Data handling for EU users
- **Youth Safety**: Content filtering, crisis protocols
- **Privacy**: End-to-end encryption for bot messages
- **Smart Contract Audit**: Before mainnet deployment

---

## Success Metrics

- ✅ 25+ unique ad sponsors
- ✅ 90% ad completion rate
- ✅ <100ms data session response time
- ✅ 50+ health reminders sent daily
- ✅ 1000+ THREV tokens distributed
- ✅ 95% uptime
- ✅ <2 second initial load time

