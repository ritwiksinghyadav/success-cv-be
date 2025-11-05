import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

let emailAPI = new TransactionalEmailsApi();
emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async (to, subject, htmlContent, from = { email: "ritwikfullstack@gmail.com" }) => {
    const email = new SendSmtpEmail();
    email.sender = from;
    email.to = [{ email: to }];
    email.subject = subject;
    email.htmlContent = htmlContent;

    try {
        const response = await emailAPI.sendTransacEmail(email);
        console.log("Email sent successfully", {
            to,
            subject,
            messageId: response.messageId
        });

        return { success: true, response: response };
    } catch (error) {
        console.log("Error sending email", {
            to,
            subject,
            error: error.message
        });
        return { success: false, error: error.message };
    }
};

/**
 * Send bulk emails by calling sendEmail function one by one
 * @param {Array} recipients - Array of email addresses: ["user1@example.com", "user2@example.com"]
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content for the email
 * @param {Object} from - Sender object: { email: "sender@example.com", name: "Sender Name" }
 * @returns {Promise<Object>} - Result object with success count, failures, and details
 */
export const sendBulkEmail = async (
    recipients,
    subject,
    htmlContent,
    from = { email: "ritwikfullstack@gmail.com", name: "Resume Project" }
) => {
    // Validate inputs
    if (!Array.isArray(recipients) || recipients.length === 0) {
        const error = "Recipients must be a non-empty array";
        console.log("Bulk email validation failed", { error, recipientCount: recipients?.length });
        return { success: false, error };
    }

    if (!subject || !htmlContent) {
        const error = "Subject and htmlContent are required";
        console.log("Bulk email validation failed", { error, subject: !!subject, htmlContent: !!htmlContent });
        return { success: false, error };
    }

    const results = {
        total: recipients.length,
        successful: 0,
        failed: 0,
        failures: [],
        successfulEmails: [],
        startTime: new Date().toISOString()
    };

    console.log("Starting bulk email sending", {
        totalRecipients: recipients.length,
        subject
    });

    // Send emails one by one
    for (let i = 0; i < recipients.length; i++) {
        const email = recipients[i];
        
        console.log(`Processing email ${i + 1}/${recipients.length}: ${email}`);
        
        try {
            const result = await sendEmail(email, subject, htmlContent, from);
            
            if (result.success) {
                results.successful++;
                results.successfulEmails.push({
                    email: email,
                    messageId: result.response?.messageId
                });
            } else {
                results.failed++;
                results.failures.push({
                    email: email,
                    error: result.error
                });
            }
        } catch (error) {
            results.failed++;
            results.failures.push({
                email: email,
                error: error.message
            });
        }
    }

    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);

    console.log("Bulk email sending completed", {
        total: results.total,
        successful: results.successful,
        failed: results.failed,
        successRate: `${((results.successful / results.total) * 100).toFixed(2)}%`,
        duration: `${results.duration}ms`
    });

    return {
        success: results.failed === 0,
        results
    };
};
