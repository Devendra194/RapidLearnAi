const { v4: uuidv4 } = require('uuid');

const generateChatId = () => uuidv4();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { generateChatId, sleep };