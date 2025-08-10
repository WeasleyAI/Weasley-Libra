const { logger } = require('@librechat/data-schemas');
const { setAuthTokens } = require('~/server/services/AuthService');
const { autoLogin } = require('~/server/services/AutoLoginService');

/**
 * Auto-login controller that creates an anonymous user and logs them in automatically
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const autoLoginController = async (req, res) => {
  try {
    // Create anonymous user and get credentials
    const { email, password, user } = await autoLogin();
    
    // Set authentication tokens for the new user
    const token = await setAuthTokens(user._id, res);
    
    // Remove sensitive data before sending response
    const { password: _p, totpSecret: _t, __v, ...userResponse } = user._doc || user;
    userResponse.id = userResponse._id.toString();
    
    logger.info(`[autoLoginController] Auto-logged in user: ${email}`);
    
    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Auto-login successful'
    });
    
  } catch (error) {
    logger.error('[autoLoginController] Error during auto-login:', error);
    return res.status(500).json({
      success: false,
      message: 'Auto-login failed',
      error: error.message
    });
  }
};

module.exports = {
  autoLoginController,
};
