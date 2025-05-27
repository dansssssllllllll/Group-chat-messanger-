const users = {};

module.exports = {
  getCoins: (uid) => users[uid]?.coins || 0,
  setCoins: (uid, amount) => {
    if (!users[uid]) users[uid] = {};
    users[uid].coins = amount;
  },
  getLastDaily: (uid) => users[uid]?.lastDaily || 0,
  setLastDaily: (uid, timestamp) => {
    if (!users[uid]) users[uid] = {};
    users[uid].lastDaily = timestamp;
  },
  getBank: (uid) => users[uid]?.bank || null,
  setBank: (uid, bankInfo) => {
    if (!users[uid]) users[uid] = {};
    users[uid].bank = bankInfo;
  }
};