const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { SystemRoles } = require('librechat-data-provider');
const { logger } = require('@librechat/data-schemas');
const {
  createUser,
  updateUser,
  findUser,
  countUsers,
} = require('~/models');
const { getBalanceConfig } = require('~/server/services/Config');
const { isEnabled } = require('@librechat/api');

/**
 * Generate a unique random email for anonymous users
 * @returns {string} - Random email in format: anonymous-{objectId}@temp.local
 */
const generateRandomEmail = () => {
  const randomId = new mongoose.Types.ObjectId().toString();
  return `anonymous-${randomId}@temp.local`;
};

/**
 * Generate a random username for anonymous users
 * @returns {string} - Random username in format: User_{shortId}
 */
const generateRandomUsername = () => {
  const shortId = new mongoose.Types.ObjectId().toString().substring(0, 8);
  return `User_${shortId}`;
};

/**
 * Generate a random password
 * @returns {string} - Random password
 */
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
};

/**
 * Create an anonymous user for auto-login
 * @returns {Promise<{status: number, message: string, user?: Object, password?: string}>}
 */
const createAnonymousUser = async () => {
  try {
    const email = generateRandomEmail();
    const username = generateRandomUsername();
    const name = `Anonymous ${username.split('_')[1]}`;
    const password = generateRandomPassword();
    
    // Check if this is the first user (should be admin)
    const isFirstRegisteredUser = (await countUsers()) === 0;
    
    const salt = bcrypt.genSaltSync(10);
    const newUserData = {
      provider: 'auto-login',
      email,
      username,
      name,
      avatar: null,
      role: isFirstRegisteredUser ? SystemRoles.ADMIN : SystemRoles.USER,
      password: bcrypt.hashSync(password, salt),
      emailVerified: true, // Auto-verify since these are temp accounts
    };

    const balanceConfig = await getBalanceConfig();
    const disableTTL = isEnabled(process.env.ALLOW_UNVERIFIED_EMAIL_LOGIN);
    
    const newUser = await createUser(newUserData, balanceConfig, disableTTL, true);
    
    logger.info(`[createAnonymousUser] Created anonymous user: ${email} with username: ${username}`);
    
    return { 
      status: 200, 
      message: 'Anonymous user created successfully',
      user: newUser,
      email,
      password
    };
  } catch (err) {
    logger.error('[createAnonymousUser] Error creating anonymous user:', err);
    return { status: 500, message: 'Failed to create anonymous user' };
  }
};

/**
 * Auto-login service that creates a temporary user and returns login credentials
 * @returns {Promise<{email: string, password: string, user: Object}>}
 */
const autoLogin = async () => {
  try {
    const result = await createAnonymousUser();
    
    if (result.status !== 200) {
      throw new Error(result.message);
    }
    
    return {
      email: result.email,
      password: result.password,
      user: result.user
    };
  } catch (error) {
    logger.error('[autoLogin] Error during auto-login:', error);
    throw error;
  }
};

module.exports = {
  autoLogin,
  createAnonymousUser,
  generateRandomEmail,
  generateRandomUsername,
  generateRandomPassword,
};
