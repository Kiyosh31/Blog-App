const mongodb = require("mongodb")
require("dotenv").config()

mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true, useNewUrlParser: true },
  (err, client) => {
    module.exports = client.db()
    const app = require("./app")
    app.listen(process.env.PORT)
  }
)
