/**
 * Threvia AI Bot Service
 * Handles WhatsApp, Telegram integration with AI-powered responses
 * Features: Reminders, health tracking, opportunities, crisis support
 */

const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// System prompt for AI responses
const SYSTEM_PROMPT = `You are Threvia, an AI health assistant for South African youth. You are:
- Compassionate, non-judgmental, evidence-based
- Speaking peer-to-peer (never preachy)
- Quick to respond (users are on mobile while commuting)
- Youth-friendly and culturally aware

CRISIS PROTOCOL:
If user mentions self-harm/suicide → IMMEDIATELY respond:
"I'm concerned about what you shared. Please reach out:
🚨 Lifeline SA: 0861 322 322 | SMS 31393
🌍 Global: Text HOME to 741741 (Crisis Text Line)
💬 I'm here to listen."

KEY CAPABILITIES:
1. Period & Pregnancy Tracking: Log cycles, predict dates, trimester tracking
2. Medication Reminders: Track adherence, alert schedules
3. Doctor Appointments: Schedule, remind, manage notes
4. Health Info: Sexual health, mental health, STI prevention
5. Opportunities: Nearby events, learnerships, internships
6. Emergency Clinic Finder: "nearest HIV clinic" → location-based results

COMPLIANCE:
- POPIA compliant: Ask consent before storing personal data
- Youth safe: No graphic content
- Educational: Focus on knowledge, not judgment

Always be warm, helpful, and honest about limitations.`;

class ThreviaBot {
  /**
   * Process incoming message from WhatsApp or Telegram
   */
  static async processMessage(platform, chatId, userId, messageText) {
    try {
      // Store message in bot session
      await this.logMessage(userId, platform, chatId, messageText);

      // Parse message intent
      const intent = this.parseIntent(messageText);
      
      // Generate appropriate response
      let response = '';

      switch (intent.type) {
        case 'PERIOD_LOG':
          response = await this.handlePeriodLog(userId, intent.data);
          break;
        case 'PREGNANCY_TRACKING':
          response = await this.handlePregnancyTracking(userId, intent.data);
          break;
        case 'MEDICATION':
          response = await this.handleMedication(userId, intent.data);
          break;
        case 'APPOINTMENT':
          response = await this.handleAppointment(userId, intent.data);
          break;
        case 'HEALTH_QUESTION':
          response = await this.handleHealthQuestion(messageText);
          break;
        case 'OPPORTUNITIES':
          response = await this.handleOpportunities(userId, intent.data);
          break;
        case 'CLINIC_FINDER':
          response = await this.handleClinicFinder(userId, intent.data);
          break;
        case 'CRISIS':
          response = this.handleCrisis();
          break;
        case 'REMINDER_SETUP':
          response = await this.handleReminderSetup(userId, intent.data);
          break;
        default:
          response = await this.handleGeneralChat(messageText);
      }

      // Send response back through respective platform
      await this.sendMessage(platform, chatId, response);

      return { success: true, response };
    } catch (error) {
      console.error('Error processing message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse user message to determine intent
   */
  static parseIntent(messageText) {
    const text = messageText.toLowerCase();

    // Period tracking
    if (text.includes('period') || text.includes('menstrual') || text.includes('cycle')) {
      return { type: 'PERIOD_LOG', data: { date: new Date() } };
    }

    // Pregnancy
    if (text.includes('pregnant') || text.includes('pregnancy') || text.includes('trimester')) {
      return { type: 'PREGNANCY_TRACKING', data: { action: 'track' } };
    }

    // Medication
    if (text.includes('medication') || text.includes('pill') || text.includes('tablet') || text.includes('medicine')) {
      return { type: 'MEDICATION', data: { action: 'log' } };
    }

    // Doctor appointment
    if (text.includes('appointment') || text.includes('doctor') || text.includes('clinic')) {
      return { type: 'APPOINTMENT', data: { action: 'schedule' } };
    }

    // Crisis keywords
    if (text.includes('kill') || text.includes('suicide') || text.includes('harm') || text.includes('depressed') || text.includes('alone')) {
      return { type: 'CRISIS' };
    }

    // Jobs & learnerships
    if (text.includes('job') || text.includes('learnership') || text.includes('internship') || text.includes('work')) {
      return { type: 'OPPORTUNITIES', data: { type: 'jobs' } };
    }

    // Events
    if (text.includes('event') || text.includes('seminar') || text.includes('workshop')) {
      return { type: 'OPPORTUNITIES', data: { type: 'events' } };
    }

    // Clinic finder
    if (text.includes('clinic') || text.includes('hospital') || text.includes('health') || text.includes('hiv test')) {
      return { type: 'CLINIC_FINDER', data: {} };
    }

    // Reminder setup
    if (text.includes('remind') || text.includes('reminder') || text.includes('notification')) {
      return { type: 'REMINDER_SETUP', data: {} };
    }

    // Health question
    if (text.includes('how') || text.includes('what') || text.includes('why') || text.includes('when') || text.includes('where')) {
      return { type: 'HEALTH_QUESTION' };
    }

    return { type: 'GENERAL' };
  }

  /**
   * Handle period logging
   */
  static async handlePeriodLog(userId, data) {
    const result = await pool.query(
      `UPDATE health_profiles 
       SET last_period_date = CURRENT_DATE 
       WHERE user_id = $1 
       RETURNING period_cycle_length, last_period_date`,
      [userId]
    );

    if (result.rows.length === 0) {
      return "✅ Period logged! Set your cycle length for predictions:\nReply: /cycle_length 28\n(or your average cycle days)";
    }

    const cycleLength = result.rows[0].period_cycle_length;
    const nextPeriod = new Date();
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    const options = { month: 'short', day: 'numeric' };
    return `✅ Period logged!\n📅 Next period expected: ${nextPeriod.toLocaleDateString('en-ZA', options)}\n\nTips:\n💧 Stay hydrated\n🏃 Light exercise helps\n📞 Call clinic if heavy bleeding`;
  }

  /**
   * Handle pregnancy tracking
   */
  static async handlePregnancyTracking(userId, data) {
    return `🤰 Pregnancy Support\n\nWhen did you find out? (Reply with date or trimester)\nE.g: "3 months" or "March 2025"\n\nI'll help track:\n📅 Trimester milestones\n💊 Prenatal care reminders\n📋 Appointment scheduling\n📚 Pregnancy health tips`;
  }

  /**
   * Handle medication tracking
   */
  static async handleMedication(userId, data) {
    return `💊 Medication Tracking\n\nWhat's the medication name?\nThen tell me:\n⏰ What time(s) daily?\n📅 How many days/weeks?\n\nExample:\n"ARV\n10:00am and 10:00pm\nDaily"`;
  }

  /**
   * Handle appointment scheduling
   */
  static async handleAppointment(userId, data) {
    return `📅 Doctor Appointment\n\nWhen's your appointment?\n⏰ Date and time?\n🏥 Which clinic/hospital?\n\nI'll send you a reminder 24 hours before!`;
  }

  /**
   * Handle health questions with AI
   */
  static async handleHealthQuestion(question) {
    // TODO: Integrate with OpenAI or similar for AI responses
    // For now, return helpful patterns
    
    const keywords = {
      sti: "STI symptoms vary, but look for: unusual discharge, burning during urination, sores, pain.\n✅ Free testing at any public clinic\n💊 All treatable with medication\n🛡️ Prevention: Condoms + regular testing\n📍 Find clinic: Reply 'clinic'",
      
      prep: "PrEP = Pre-Exposure Prophylaxis\n💊 Prevents HIV if taken daily\n✅ Free at public clinics\n🎯 For: High-risk individuals\n📞 Ask clinic staff about eligibility",
      
      condoms: "🛡️ Condoms prevent:\n🦠 HIV\n🍆 STIs\n👶 Unplanned pregnancy\n✅ FREE at all clinics\n💪 Practice putting on correctly!",
      
      period: "Every period is different!\n📅 Normal cycle: 21-35 days\n⏱️ Duration: 2-7 days\n🩸 Flow: Light to heavy is normal\n😩 Cramps? Heat + ibuprofen helps\n📞 See clinic if: Very heavy, severe pain",
      
      stress: "😰 Feeling stressed? You're not alone!\n✅ Quick fixes:\n🚶 Walk outside for 10 min\n🎵 Listen to music\n☕ Chat with friend\n📞 Talk to counselor (free at clinics)\n📱 Text me anytime",
    };

    for (const [key, response] of Object.entries(keywords)) {
      if (question.toLowerCase().includes(key)) {
        return response;
      }
    }

    return "📚 Good question! I'm learning about more topics.\n\nWhat I can help with:\n🌿 Sexual health & STIs\n🧠 Stress & mental health\n👶 Period & pregnancy\n💊 Medications\n📅 Appointments\n📍 Clinic finder\n\nReply with a topic!";
  }

  /**
   * Handle opportunities (jobs, internships, events)
   */
  static async handleOpportunities(userId, data) {
    // TODO: Integrate with jobs API and event calendars
    return `🚀 Opportunities Near You\n\nWhat are you looking for?\n💼 /jobs - Learnerships & internships\n🎓 /events - Educational events\n🎯 /skills - Skills training programs\n\nWhere are you? (city/province)\nI'll find opportunities in your area!`;
  }

  /**
   * Handle clinic finder (location-based)
   */
  static async handleClinicFinder(userId, data) {
    // TODO: Integrate with Google Maps/clinic database
    return `📍 Clinic Finder\n\n🔍 What service do you need?\n💉 HIV testing\n🏥 General health\n🤰 Pregnancy care\n🧠 Mental health\n🌿 Sexual health\n\nWhat's your location? (city/suburb)`;
  }

  /**
   * Handle crisis response
   */
  static handleCrisis() {
    return `💜 I hear you. You're not alone.\n\n🚨 IMMEDIATE HELP:\n📞 Lifeline SA: 0861 322 322\n💬 SMS 31393 (Lifeline)\n🌍 Text HOME to 741741 (24/7)\n☎️ Call 10177 (SAPS emergency)\n\n📱 I'm here to listen anytime.\nYour feelings matter. Reach out. 💙`;
  }

  /**
   * Handle reminder setup
   */
  static async handleReminderSetup(userId, data) {
    return `🔔 Set Up Reminders\n\nWhat do you want to remember?\n📚 Study time\n💊 Medication\n📅 Appointments\n👨‍⚕️ Doctor visit\n🎯 Health goals\n\nWhen? (time)\nExample: "Meds 8am" or "Study 5pm"`;
  }

  /**
   * Handle general conversation
   */
  static async handleGeneralChat(messageText) {
    // TODO: Integrate with OpenAI for general chat
    return `👋 Hi! I'm Threvia, your health assistant.\n\nI can help with:\n🌿 Sexual & reproductive health\n🧠 Mental health & stress\n💊 Medication reminders\n📅 Doctor appointments\n📍 Find clinics & services\n🎯 Study & career info\n\nWhat would you like to know?`;
  }

  /**
   * Log message to database
   */
  static async logMessage(userId, platform, chatId, messageText) {
    try {
      await pool.query(
        `INSERT INTO bot_sessions (user_id, platform, chat_id, last_message_at, last_message_text, is_active)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, true)
         ON CONFLICT (chat_id) DO UPDATE SET
           last_message_at = CURRENT_TIMESTAMP,
           last_message_text = $4`,
        [userId, platform, chatId, messageText]
      );
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }

  /**
   * Send message through WhatsApp or Telegram
   */
  static async sendMessage(platform, chatId, messageText) {
    try {
      if (platform === 'whatsapp') {
        // TODO: Integrate Twilio WhatsApp API
        console.log(`[WhatsApp] Sending to ${chatId}: ${messageText.substring(0, 50)}...`);
      } else if (platform === 'telegram') {
        // TODO: Integrate Telegram Bot API
        console.log(`[Telegram] Sending to ${chatId}: ${messageText.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Schedule reminder
   */
  static async scheduleReminder(userId, reminderType, scheduledFor, title, description, metadata) {
    try {
      const result = await pool.query(
        `INSERT INTO reminders (user_id, reminder_type, scheduled_for, title, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, scheduled_for`,
        [userId, reminderType, scheduledFor, title, description, JSON.stringify(metadata)]
      );

      return {
        success: true,
        reminderId: result.rows[0].id,
        scheduledFor: result.rows[0].scheduled_for,
      };
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send daily health tip (for all users with reminders enabled)
   */
  static async sendDailyHealthTips() {
    const tips = [
      "💧 Drink 8 glasses of water daily! Hydration = energy",
      "🚶 Walk for 30 mins. Great for body AND mind",
      "😴 Sleep matters! 7-9 hours keeps you sharp",
      "🧘 5-min meditation. Start your day calm",
      "💪 Stretch regularly. Prevents stiff muscles",
      "🍎 Eat a rainbow! Different colors = different nutrients",
      "❤️ Check in with yourself. How are you feeling?",
      "📱 Screen break! Eyes need rest every 20 mins",
      "🤝 Text a friend. Connection is medicine",
      "🎯 Set ONE small goal today. You've got this!",
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    // Send to all active bot users
    const result = await pool.query(
      `SELECT DISTINCT bs.chat_id, bs.platform 
       FROM bot_sessions bs
       WHERE bs.reminders_enabled = true AND bs.is_active = true`
    );

    for (const session of result.rows) {
      await this.sendMessage(session.platform, session.chat_id, `📌 Daily Tip:\n${randomTip}`);
    }
  }

  /**
   * Check for due reminders and send them
   */
  static async sendDueReminders() {
    try {
      const result = await pool.query(
        `SELECT r.id, r.title, r.description, bs.chat_id, bs.platform
         FROM reminders r
         JOIN users u ON r.user_id = u.id
         JOIN bot_sessions bs ON u.id = bs.user_id
         WHERE r.scheduled_for <= CURRENT_TIMESTAMP
         AND r.is_completed = false
         AND bs.reminders_enabled = true
         AND bs.is_active = true`
      );

      for (const reminder of result.rows) {
        const message = `🔔 ${reminder.title}\n${reminder.description || ''}`;
        await this.sendMessage(reminder.platform, reminder.chat_id, message);

        // Mark as sent
        await pool.query(
          'UPDATE reminders SET is_completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = $1',
          [reminder.id]
        );
      }
    } catch (error) {
      console.error('Error sending due reminders:', error);
    }
  }
}

module.exports = ThreviaBot;
