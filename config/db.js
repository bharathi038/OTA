const SecretsManager = require('./SecretsManager');

//instantiate db connection
// db connection is cached by knex
// input sanitation is handled by knex
const knex = require('knex')({
    client: 'mysql2',
    debug: false,
    connection: async function () {
      //Get connection details from secret manager specific to stages
      let smResp = await SecretsManager.getSecret(process.env.SERVERLESS_STAGE && process.env.SERVERLESS_STAGE == 'prod' ? "prod/otadb" : "dev/otadb", "ap-south-1");
      
      return {
          host     : smResp.host,
          user     : smResp.username,
          password : smResp.password,
          database : smResp.database,
          charset: 'latin1_swedish_ci'
      }}
  });
  
module.exports = knex;
  
