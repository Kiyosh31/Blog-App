const User = require("../models/User")

exports.home = (req, res) => {
  res.render("home-guest")
}

exports.register = (req, res) => {
  let user = new User(req.body)
  user.register()
  if (user.errors.length) {
    res.send(user.errors)
  } else {
    res.send("Congrats! there are no errors")
  }
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user.login()
    .then((result) => res.send(result))
    .catch((err) => res.send(err))
}
