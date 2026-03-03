-- Threvia App - Database Schema
-- Run this file to set up all required tables

-- Drop existing tables if needed (development only)
-- DROP TABLE IF EXISTS ad_logs CASCADE;
-- DROP TABLE IF EXISTS data_sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  wallet_address VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  
  -- Engagement
  points INT DEFAULT 0,
  threv_balance DECIMAL(18, 6) DEFAULT 0,
  
  -- Ad tracking
  first_ad_watched BOOLEAN DEFAULT false,
  total_ads_watched INT DEFAULT 0,
  total_data_sessions INT DEFAULT 0,
  
  -- Health profile
  health_profile JSONB, -- Stores health data: period_cycle, pregnancy_trimester, medications, etc.
  
  -- Bot integration
  whatsapp_phone VARCHAR(20),
  telegram_chat_id VARCHAR(255),
  reminders_enabled BOOLEAN DEFAULT true,
  
  -- Compliance
  popia_consent BOOLEAN DEFAULT false,
  gdpr_consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Data Sessions Table
CREATE TABLE IF NOT EXISTS data_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session timing
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Data tracking (in seconds)
  data_allocated INT NOT NULL, -- Total seconds allocated (25 * 60 = 1500)
  data_remaining INT NOT NULL, -- Seconds remaining
  
  -- Activity tracking
  ads_watched INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  modules_accessed JSONB, -- Array of accessed modules
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Ad Logs Table (Track every ad watched)
CREATE TABLE IF NOT EXISTS ad_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ad details
  sponsor_id VARCHAR(100) NOT NULL,
  ad_type VARCHAR(20) NOT NULL, -- 'first' or 'recurring'
  
  -- Watched info
  watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INT NOT NULL,
  
  -- Reward
  points_earned INT DEFAULT 0,
  session_id UUID REFERENCES data_sessions(id) ON DELETE SET NULL,
  
  -- Video
  youtube_video_id VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bot Sessions Table (WhatsApp/Telegram integration)
CREATE TABLE IF NOT EXISTS bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Platform info
  platform VARCHAR(20) NOT NULL, -- 'whatsapp' or 'telegram'
  chat_id VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP,
  last_message_text TEXT,
  
  -- Preferences
  reminders_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '08:00:00', -- 8 AM daily
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders Table (Store scheduled reminders)
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reminder type
  reminder_type VARCHAR(50) NOT NULL, -- 'study', 'medication', 'appointment', 'period', 'pregnancy', 'event', 'job'
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100), -- 'daily', 'weekly', 'monthly'
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Additional data
  metadata JSONB, -- Store type-specific data
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Profile Table (Detailed health tracking)
CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Period tracking
  last_period_date DATE,
  period_cycle_length INT DEFAULT 28, -- average cycle in days
  
  -- Pregnancy tracking
  is_pregnant BOOLEAN DEFAULT false,
  pregnancy_start_date DATE,
  current_trimester INT,
  
  -- Medications
  medications JSONB, -- Array of medications with schedules
  
  -- Doctor appointments
  next_appointment TIMESTAMP,
  last_appointment TIMESTAMP,
  appointment_notes TEXT,
  
  -- Health conditions
  health_conditions JSONB, -- Array of conditions
  
  -- Allergies
  allergies TEXT,
  
  -- Emergency contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Points Conversion Log (Track THREV token minting)
CREATE TABLE IF NOT EXISTS token_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conversion details
  points_converted INT NOT NULL,
  threv_amount DECIMAL(18, 6) NOT NULL,
  
  -- Blockchain
  wallet_address VARCHAR(255) NOT NULL,
  transaction_hash VARCHAR(255),
  block_number INT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Sponsors Table (For admin management)
CREATE TABLE IF NOT EXISTS sponsors (
  id VARCHAR(100) PRIMARY KEY,
  
  -- Info
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  category VARCHAR(50), -- 'telecom', 'finance', 'health', 'education'
  
  -- Ad details
  logo_emoji VARCHAR(10),
  ad_text TEXT,
  cta_text VARCHAR(100),
  default_duration INT DEFAULT 15,
  
  -- YouTube videos
  youtube_video_ids TEXT[], -- Array of video IDs
  
  -- Scheduling
  is_active BOOLEAN DEFAULT true,
  daily_ad_limit INT DEFAULT 10, -- Max shows per day
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statistics Table (For analytics)
CREATE TABLE IF NOT EXISTS statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Metrics
  total_users INT DEFAULT 0,
  active_sessions INT DEFAULT 0,
  ads_shown INT DEFAULT 0,
  total_points_distributed INT DEFAULT 0,
  total_threv_minted DECIMAL(18, 6) DEFAULT 0,
  
  -- Sponsor metrics
  sponsor_id VARCHAR(100),
  sponsor_shows INT DEFAULT 0,
  sponsor_completion_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_data_sessions_user_active ON data_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_data_sessions_expires ON data_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ad_logs_user ON ad_logs(user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_logs_session ON ad_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_user ON bot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_chat ON bot_sessions(chat_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_scheduled ON reminders(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_health_profiles_user ON health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_token_conversions_user ON token_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date);
CREATE INDEX IF NOT EXISTS idx_statistics_sponsor ON statistics(sponsor_id);

-- Create Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bot_sessions_timestamp
BEFORE UPDATE ON bot_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_health_profiles_timestamp
BEFORE UPDATE ON health_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_sponsors_timestamp
BEFORE UPDATE ON sponsors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert sample sponsors
INSERT INTO sponsors (id, name, tagline, category, logo_emoji, ad_text, cta_text, default_duration, youtube_video_ids, is_active)
VALUES 
  ('vodacom', 'Vodacom', 'Connecting South Africa', 'telecom', '📡', 'Stay connected with Vodacom. Unlimited social from R29/month.', 'Get a Deal', 15, ARRAY['dQw4w9WgXcQ', 'jNQXAC9IVRw'], true),
  ('capitec', 'Capitec Bank', 'Banking made simple', 'finance', '🏦', 'Open account in minutes. Zero fees. Instant EFTs.', 'Open Account', 20, ARRAY['dQw4w9WgXcQ'], true),
  ('nsfas', 'NSFAS', 'Funding your future', 'education', '🎓', 'Apply for NSFAS bursary funding. Covers tuition & accommodation.', 'Apply Now', 12, ARRAY['dQw4w9WgXcQ'], true),
  ('doh', 'Dept of Health', 'Your health, our priority', 'health', '❤️', 'Free HIV testing & treatment at all public clinics.', 'Find a Clinic', 10, ARRAY['dQw4w9WgXcQ'], true),
  ('mtn', 'MTN', 'Everywhere you go', 'telecom', '📶', 'MTN Pulse: 1GB night data for just R10. Stream all night.', 'Get Pulse', 15, ARRAY['dQw4w9WgXcQ'], true)
ON CONFLICT (id) DO NOTHING;

-- Final verification
SELECT 'Database schema created successfully!' AS status;
