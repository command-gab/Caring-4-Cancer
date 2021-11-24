const ObjectId = require("mongodb").ObjectId;
const MongoClient = require('mongodb').MongoClient;
const { response } = require('express');
const fetch = require('node-fetch')

module.exports = function (app, passport, db) {

  // NORMAL ROUTES ===============================================================

  // HOME PAGE
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // ADMIN PAGE
  app.get('/admin', function (req, res) {
    res.render('admin.ejs');
  });

  // SEARCH FEATURE
  app.get('/search', (req, res) => {
    db.collection('posts')
      .find({ "city": { $regex: req.query.search, $options: "i" } })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render('events.ejs', { posts: result });
      });
  });

  // EVENTS PAGE
  app.get('/events', function (req, res) {
    res.render('events.ejs', {
    })
  })

  // FORM PAGE 
  app.get('/form', function (req, res) {
    res.render('form.ejs', {
      
    });
  });

  // ABOUT PAGE
  app.get('/about', function (req, res) {
    res.render('about.ejs', {
    })
  })

  // COMMUNITY PAGE
  app.get('/community', function (req, res) {
    // db.collection('posts').find({}).toArray((err, result) => {
    //     if (err) return console.log(err);
        res.render('community.ejs');
      });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
    })
  })

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // POST ROUTES ===============================================================

  app.post('/eventsForm', (req, res) => {
    // object destructuring  
    db.collection('registered').insertOne(
      { name: req.body.name, 
        email: req.body.email, 
        quantity: req.body.quantity, 
        event: req.body.event })
    //add error handling
    res.render('form.ejs')
  });

  app.post('/discussion', (req, res) => {
    db.collection('posts').insertOne({
      name: req.body.name, 
      msg: req.body.msg, 
      thumbUp: 0}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/community')
    })
  })

  // app.put('/upVote', (req, res) => {
  //   db.collection('messages')
  //     .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
  //       $set: {
  //         thumbUp: req.body.thumbUp + 1
  //       }
  //     }, {
  //       sort: { _id: -1 },
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  // })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
}