'use strict'
const config = require('./config')
const DbHelper = require('./src/db-helper')
const ApiController = require('./src/api-controller')
const main = async () => {
  const dbHelper = new DbHelper(config.database)
  await dbHelper.initialize()

}



server.listen(config.port)

MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});