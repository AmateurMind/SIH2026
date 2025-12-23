const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development, we'll use a simple SMTP configuration
    // In production, you would use a service like SendGrid, Mailgun, etc.
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send evaluation request email
const sendEvaluationRequestEmail = async (mentorEmail, mentorName, magicLink, studentName, companyName, internshipRole) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Campus Placement Portal" <${process.env.SMTP_USER}>`,
            to: mentorEmail,
            subject: `Internship Evaluation Request - ${studentName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Internship Performance Evaluation</h1>
                        <p style="color: #e8e8e8; margin: 10px 0 0 0;">Your feedback is requested</p>
                    </div>

                    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${mentorName},</p>

                        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                            We hope this email finds you well. As the internship mentor for <strong>${studentName}</strong> at <strong>${companyName}</strong>,
                            your evaluation of their performance is crucial for their academic assessment and professional development.
                        </p>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                            <h3 style="margin: 0 0 10px 0; color: #333;">Internship Details:</h3>
                            <p style="margin: 5px 0;"><strong>Student:</strong> ${studentName}</p>
                            <p style="margin: 5px 0;"><strong>Role:</strong> ${internshipRole}</p>
                            <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${magicLink}"
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                      color: white;
                                      padding: 15px 30px;
                                      text-decoration: none;
                                      border-radius: 8px;
                                      font-weight: bold;
                                      display: inline-block;
                                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                Evaluate Student Performance
                            </a>
                        </div>

                        <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px;">
                            This evaluation link is valid for <strong>7 days</strong> from the time of this email.
                            Your detailed feedback on technical skills, soft skills, and overall performance will be greatly appreciated.
                        </p>

                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #856404;">
                                <strong>Important:</strong> Your evaluation will be part of the student's official Internship Performance Passport (IPP)
                                and will be used for academic grading and future employment references.
                            </p>
                        </div>

                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            If you have any questions or need assistance, please contact the placement cell.
                        </p>

                        <p style="font-size: 14px; color: #666; margin-bottom: 0;">
                            Best regards,<br>
                            <strong>Campus Placement Team</strong>
                        </p>
                    </div>

                    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                        <p>This is an automated message from the Campus Placement Portal.</p>
                        <p>If you did not expect this email, please ignore it.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Evaluation request email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending evaluation request email:', error);
        throw error;
    }
};

// Send notification to student when IPP is ready for review
const sendStudentNotificationEmail = async (studentEmail, studentName, ippId, status) => {
    try {
        const transporter = createTransporter();

        const statusMessages = {
            pending_student_submission: {
                subject: 'Your IPP is Ready for Submission',
                message: 'Please complete your internship documentation and reflection.',
                action: 'Submit Documentation'
            },
            verified: {
                subject: 'Your IPP has been Verified!',
                message: 'Your Internship Performance Passport has been reviewed and verified.',
                action: 'View Your IPP'
            },
            published: {
                subject: 'Your IPP is Now Published!',
                message: 'Your Internship Performance Passport is now live and shareable.',
                action: 'View Public Profile'
            }
        };

        const statusInfo = statusMessages[status] || {
            subject: 'IPP Status Update',
            message: 'Your Internship Performance Passport status has been updated.',
            action: 'View Details'
        };

        const mailOptions = {
            from: `"Campus Placement Portal" <${process.env.SMTP_USER}>`,
            to: studentEmail,
            subject: statusInfo.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">IPP Status Update</h1>
                    </div>

                    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${studentName},</p>

                        <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                            ${statusInfo.message}
                        </p>

                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">IPP ID: ${ippId}</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/student/dashboard"
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                      color: white;
                                      padding: 15px 30px;
                                      text-decoration: none;
                                      border-radius: 8px;
                                      font-weight: bold;
                                      display: inline-block;
                                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                ${statusInfo.action}
                            </a>
                        </div>

                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Best regards,<br>
                            <strong>Campus Placement Team</strong>
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Student notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending student notification email:', error);
        throw error;
    }
};

module.exports = {
    sendEvaluationRequestEmail,
    sendStudentNotificationEmail
};