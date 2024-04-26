const db = require('../config/db');

module.exports = async () => {    
    db.destroy();
    // return true;
  };