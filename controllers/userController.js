const User = require("../models/User")
const Post = require("../models/Post")
const Follow = require("../models/Follow")
const jwt = require("jsonwebtoken")

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in to perform that action.")
    req.session.save(function () {
      res.redirect("/")
    })
  }
}

exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
    next()
  } catch {
    res.json("Sorry, you must provide a valid token.")
  }
}

exports.register = (req, res) => {
  let user = new User(req.body)
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      }
      req.session.save(function () {
        res.redirect("/")
      })
    })
    .catch((regErrors) => {
      regErrors.forEach((error) => {
        req.flash("regErrors", error)
      })
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.login = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function (result) {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id,
      }
      req.session.save(function () {
        res.redirect("/")
      })
    })
    .catch(function (err) {
      req.flash("errors", err)
      req.session.save(function () {
        res.redirect("/")
      })
    })
}

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/")
  })
}

exports.home = async (req, res) => {
  if (req.session.user) {
    // Fetch feed of posts for current user
    let posts = await Post.getFeed(req.session.user._id)

    // show all the users to make new friends
    let allUsers = await User.getAllUsers()
    let users = []
    allUsers.forEach((user) => {
      if (req.session.user._id != user._id) {
        users.push({
          username: user.username,
          avatar: User.getUserAvatar(user.email),
        })
      }
    })

    res.render("home-dashboard", { posts: posts, users: users })
  } else {
    res.render("home-guest", { regErrors: req.flash("regErrors") })
  }
}

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument
      next()
    })
    .catch(function () {
      res.render("404")
    })
}

exports.profilePostsScreen = function (req, res) {
  // Ask our post model for posts by a certain author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function (posts) {
      res.render("profile", {
        title: `${req.profileUser.username} Profile`,
        currentPage: "posts",
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {
          postCount: req.postCount,
          followerCount: req.followerCount,
          followingCount: req.followingCount,
        },
      })
    })
    .catch(function () {
      res.render("404")
    })
}

exports.sharedProfiledData = async function (req, res, next) {
  let isVisitorsProfile = false
  let isFollowing = false
  if (req.session.user) {
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    )
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
  }

  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing

  // Retrieve post, follower and following counts
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id)

  let [postCount, followerCount, followingCount] = await Promise.all([
    postCountPromise,
    followerCountPromise,
    followingCountPromise,
  ])

  req.postCount = postCount
  req.followerCount = followerCount
  req.followingCount = followingCount

  next()
}

exports.profileFollowersScreen = async function (req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render("profile-followers", {
      currentPage: "followers",
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    })
  } catch {
    res.render("404")
  }
}

exports.profileFollowingScreen = async function (req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id)
    res.render("profile-following", {
      currentPage: "following",
      following: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    })
  } catch {
    res.render("404")
  }
}

exports.doesUsernameExist = function (req, res) {
  User.findByUsername(req.body.username)
    .then(function () {
      res.json(true)
    })
    .catch(function () {
      res.json(false)
    })
}

exports.doesEmailExist = async function (req, res) {
  let emailBool = await User.doesEmailExist(req.body.email)
  res.json(emailBool)
}

exports.apiLogin = function (req, res) {
  let user = new User(req.body)
  user
    .login()
    .then(function () {
      res.json(
        jwt.sign({ _id: user.data._id }, process.env.JWTSECRET, {
          expiresIn: "30m",
        })
      )
    })
    .catch(function (err) {
      res.json("Sorry! your values are not correct.")
    })
}

exports.apiGetPostsByUsername = async function (req, res) {
  try {
    let authorDoc = await User.findByUsername(req.params.username)
    let posts = await Post.findByAuthorId(authorDoc._id)
    res.json(posts)
  } catch {
    res.json("Sorry invalid user requested.")
  }
}
