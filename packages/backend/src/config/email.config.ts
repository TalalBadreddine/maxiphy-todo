export const emailConfig = () => ({
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || 'talalbadreddine@gmail.com',
      pass: process.env.SMTP_PASS || 'xkok nlvo ehch tvhd',
    },
  },

  from: process.env.EMAIL_FROM || '"Maxiphy" <talalbadreddine@gmail.com>',
});