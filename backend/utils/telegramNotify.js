const axios = require('axios');

// N8n Webhook URL for mentor notifications (set in .env or use default)
const N8N_WEBHOOK_URL = process.env.N8N_MENTOR_WEBHOOK_URL || null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || null;
const TELEGRAM_MENTOR_CHAT_ID = process.env.TELEGRAM_MENTOR_CHAT_ID || null;

// Helper function to notify mentor via Telegram when student applies
const notifyMentorNewApplication = async (application, student, internship, mentor) => {
    try {
        // Option 1: Direct Telegram notification
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_MENTOR_CHAT_ID) {
            const firstName = student.name ? student.name.split(' ')[0] : 'Student';
            const message = `📋 *New Application!*

👤 *Student:* ${student.name || 'Unknown'}
📧 *Email:* ${student.email || 'N/A'}
🎓 *CGPA:* ${student.cgpa || 'N/A'} | *Sem:* ${student.semester || 'N/A'}
🏢 *Internship:* ${internship.title || 'Unknown'}
🏭 *Company:* ${internship.company || 'Unknown'}

Reply with:
\`${firstName} approved\` or \`${firstName} rejected\``;

            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_MENTOR_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            });
            console.log(`[NOTIFY] Sent Telegram notification for new application ${application.id}`);
        } else {
            console.log('[NOTIFY] Telegram not configured - skipping notification');
        }

        // Option 2: N8n Webhook (if configured)
        if (N8N_WEBHOOK_URL) {
            await axios.post(N8N_WEBHOOK_URL, {
                type: 'new_application',
                application: {
                    id: application.id,
                    status: application.status
                },
                student: {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    cgpa: student.cgpa,
                    semester: student.semester
                },
                internship: {
                    id: internship.id,
                    title: internship.title,
                    company: internship.company
                },
                mentor: mentor ? {
                    id: mentor.id,
                    name: mentor.name
                } : null
            });
            console.log(`[NOTIFY] Sent N8n webhook for new application ${application.id}`);
        }
    } catch (error) {
        console.error('[NOTIFY] Failed to send mentor notification:', error.message);
    }
};

module.exports = { notifyMentorNewApplication };
