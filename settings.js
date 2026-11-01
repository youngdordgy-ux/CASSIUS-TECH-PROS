
require('dotenv').config();

const settings = {
  // BOT IDENTITY
  packname: 'CASSIUS TECH PROS',
  author: 'CASSIUS TECH PROS',
  botName: 'CASSIUS TECH PROS',
  botOwner: 'CASSIUS',

  // OWNER NUMBER: Replace with your WhatsApp number
  // Include country code, without + or spaces.
  ownerNumber: '27686836786',

  // API CONFIGURATION
  giphyApiKey: process.env.GIPHY_API_KEY || '',

  // BOT SETTINGS
  commandMode: 'public',
  maxStoreMessages: 20,
  storeWriteInterval: 10000,

  description: 'CASSIUS TECH PROS - Advanced WhatsApp Automation Bot.',
  version: '3.0.8',

  // UPDATER
  // Add your own GitHub repository ZIP URL when ready.
  updateZipUrl: '',

  // MEDIA API
  knightApiUrl: process.env.KNIGHT_API_URL || 'https://knightbotapi.stream',
  knightApiKey: process.env.KNIGHT_API_KEY || 'knight',

  mediaApiUrl: process.env.MEDIA_API_URL || 'https://knightbotapi.stream',
  mediaApiKey: process.env.MEDIA_API_KEY || 'knight',

  princeApiUrl: process.env.PRINCE_API_URL || 'https://api.princetechn.com',
  princeApiKey: process.env.PRINCE_API_KEY || 'prince',
};

module.exports = settings;
