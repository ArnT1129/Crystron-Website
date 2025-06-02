// File: api/send-email.js
// This is your serverless function. Vercel will run this code when
// your website makes a request to /api/send-email.

const { Resend } = require('resend'); // We need the 'Resend' library

module.exports = async (req, res) => {
  // These environment variables will be set in your Vercel project settings
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL;

  // Only allow POST requests (which your form should be sending)
  if (req.method === 'POST') {
    // Get the data sent from the form (name, email, subject, message)
    // req.body contains the JSON data sent by your form's JavaScript.
    const { name, email: replyToEmail, subject, message } = req.body;

    // Basic check: Make sure all fields were filled out
    if (!name || !replyToEmail || !subject || !message) {
      // Send an error response back to the form's JavaScript
      return res.status(400).json({ message: 'Oops! All fields are required.' });
    }

    // Security/Configuration Check: Ensure environment variables are actually set on Vercel
    if (!resendApiKey || !toEmail || !fromEmail) {
      let missingVars = [];
      if (!resendApiKey) missingVars.push("RESEND_API_KEY");
      if (!toEmail) missingVars.push("CONTACT_FORM_TO_EMAIL");
      if (!fromEmail) missingVars.push("CONTACT_FORM_FROM_EMAIL");
      
      console.error(`Server Configuration Error: Missing environment variables: ${missingVars.join(', ')}`);
      // Send a generic error to the user, but log the specifics for yourself
      return res.status(500).json({ message: 'Server configuration error. Please contact support if this issue persists.' });
    }

    // Initialize Resend with your API key
    const resend = new Resend(resendApiKey);

    try {
      // Attempt to send the email using Resend
      const { data: emailSentData, error: emailSendError } = await resend.emails.send({
        from: fromEmail, // Example: "Crystron Website <contact@yourverifieddomain.com>"
        to: [toEmail],   // The email address that will RECEIVE the submissions
        subject: `New Contact Form Submission: ${subject}`,
        reply_to: replyToEmail, // So when you reply in your email client, it goes to the form submitter
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email (Reply-To):</strong> ${replyToEmail}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p> 
          <hr>
          <p><em>This email was sent from the contact form on the Crystron Technologies website.</em></p>
        `,
      });

      if (emailSendError) {
        // If Resend returns an error
        console.error('Resend API Error:', emailSendError);
        return res.status(500).json({ message: `Failed to send message. Service error: ${emailSendError.message}` });
      }

      // If email sent successfully
      console.log('Email sent successfully via Resend! ID:', emailSentData.id);
      return res.status(200).json({ message: 'Thank you! Your message has been sent successfully.' });

    } catch (error) {
      // If any other unexpected error occurs during the try block
      console.error('Catch Block Error - Failed to send email:', error);
      return res.status(500).json({ message: 'Something went wrong on our end. Failed to send your message.' });
    }
  } else {
    // If the request is not a POST request, tell the browser it's not allowed
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed. Please use POST.` });
  }
};