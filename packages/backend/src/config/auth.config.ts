export const authConfig = () => ({
  auth: {

    jwt: {
      secret: process.env.JWT_SECRET,
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '20d'
    },

    lockout: {
      maxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5,
      lockoutDuration: parseInt(process.env.LOGIN_LOCKOUT_DURATION, 10) || 900000,
    },


    passwordReset: {
      tokenExpiresIn: parseInt(process.env.RESET_TOKEN_EXPIRES_IN, 10) || 3600000,
    },
  },
});