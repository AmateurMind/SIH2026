/**
 * Web3Forms Email Service Utility
 * Sends emails via Web3Forms API from the frontend
 */

const WEB3FORMS_API_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '8eed56d7-dd53-4db4-9f0c-125c23936490';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/**
 * Build application status message
 */
function buildApplicationStatusMessage({ student, internship, status, feedback, interviewDetails, offerDetails }) {
    const lines = [];
    lines.push(`Hello ${student?.name || 'Student'},`);
    lines.push('');
    lines.push(`Your application status for "${internship?.title}" at ${internship?.company} has been updated to: ${status.replace(/_/g, ' ')}.`);

    if (status === 'interview_scheduled' && interviewDetails) {
        lines.push('');
        lines.push('Interview Details:');
        if (interviewDetails.date) lines.push(`- Date: ${new Date(interviewDetails.date).toLocaleString()}`);
        if (interviewDetails.mode) lines.push(`- Mode: ${interviewDetails.mode}`);
        if (interviewDetails.location) lines.push(`- Location: ${interviewDetails.location}`);
        if (interviewDetails.meetingLink) lines.push(`- Meeting Link: ${interviewDetails.meetingLink}`);
    }

    if (status === 'offered' && offerDetails) {
        lines.push('');
        lines.push('Offer Details:');
        if (offerDetails.stipend) lines.push(`- Stipend: ${offerDetails.stipend}`);
        if (offerDetails.duration) lines.push(`- Duration: ${offerDetails.duration}`);
        if (offerDetails.startDate) lines.push(`- Start Date: ${new Date(offerDetails.startDate).toDateString()}`);
        if (offerDetails.offerExpiry) lines.push(`- Offer Expiry: ${new Date(offerDetails.offerExpiry).toLocaleString()}`);
    }

    if (feedback) {
        lines.push('');
        lines.push('Feedback:');
        lines.push(feedback);
    }

    lines.push('');
    lines.push('Regards,');
    lines.push('Campus Placement Cell');

    return lines.join('\n');
}

/**
 * Send email notification for application status change
 */
export async function sendApplicationStatusEmail({ student, internship, status, feedback, interviewDetails, offerDetails }) {
    if (!student?.email) {
        console.warn('[web3forms] Student email missing, cannot send notification');
        return { success: false, error: 'No student email' };
    }

    if (!WEB3FORMS_API_KEY) {
        console.warn('[web3forms] WEB3FORMS_API_KEY missing');
        return { success: false, error: 'API key not configured' };
    }

    try {
        const subject = `Application ${status.replace(/_/g, ' ')} - ${internship?.title || 'Internship'}`;
        const message = buildApplicationStatusMessage({
            student,
            internship,
            status,
            feedback,
            interviewDetails,
            offerDetails
        });

        const formData = new FormData();
        formData.append('access_key', WEB3FORMS_API_KEY);
        formData.append('subject', subject);
        formData.append('name', 'Campus Placement Cell');
        formData.append('email', student.email);
        formData.append('message', message);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        const response = await fetch(WEB3FORMS_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            console.log('[web3forms] Email sent successfully to', student.email);
            return { success: true, data };
        } else {
            console.error('[web3forms] Email send failed:', data);
            return { success: false, error: data.message || 'Email send failed', data };
        }
    } catch (error) {
        console.error('[web3forms] Error sending email:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

/**
 * Send generic email via Web3Forms
 */
export async function sendEmail({ to, subject, message, fromName = 'Campus Placement Cell' }) {
    if (!WEB3FORMS_API_KEY) {
        console.warn('[web3forms] WEB3FORMS_API_KEY missing');
        return { success: false, error: 'API key not configured' };
    }

    try {
        const formData = new FormData();
        formData.append('access_key', WEB3FORMS_API_KEY);
        formData.append('subject', subject);
        formData.append('name', fromName);
        formData.append('email', to);
        formData.append('message', message);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        const response = await fetch(WEB3FORMS_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, data };
        } else {
            return { success: false, error: data.message || 'Email send failed', data };
        }
    } catch (error) {
        console.error('[web3forms] Error sending email:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

