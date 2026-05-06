import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export const initMailer = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✉️  Nodemailer configured with Ethereal Email');
  } catch (err) {
    console.error('❌ Failed to configure Nodemailer:', err);
  }
};

export const sendTaskAssignmentEmail = async (userEmail: string, taskTitle: string, adminName: string) => {
  if (!transporter) {
    console.warn('Transporter not initialized. Call initMailer() first.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Team Task Manager" <noreply@taskmaster.com>',
      to: userEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      text: `Hello,\n\nYou have been assigned a new task: "${taskTitle}" by ${adminName}.\n\nPlease check your dashboard for details.\n\nBest,\nTaskMaster Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">New Task Assigned</h2>
          <p>Hello,</p>
          <p>You have been assigned a new task: <strong>${taskTitle}</strong> by <strong>${adminName}</strong>.</p>
          <p>Please log in to your dashboard to view the details and start working.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">This is an automated message from Team Task Manager.</p>
        </div>
      `,
    });

    console.log(`✉️  Email sent to ${userEmail}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
