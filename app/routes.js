const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = function (app, passport, db, ObjectId) {

  // NORMAL ROUTES ===============================================================

  // HOME PAGE
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // EVENTS PAGE
  app.get('/events', function (req, res) {
    res.render('events.ejs', {
    })
  })

  // FORM PAGE
  app.get('/form', isLoggedIn, function (req, res) {
    res.render('form.ejs', {
      user: req.user
    });
  });

  // ABOUT PAGE
  app.get('/about', function (req, res) {
    res.render('about.ejs', {
    })
  })

  // COMMUNITY PAGE =========================
  app.get('/community', isLoggedIn, function (req, res) {
    db.collection('posts').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('community.ejs', {
        user: req.user,
        posts: result
      })
    })
  });

  app.get('/post/:singlePost', isLoggedIn, function (req, res) {
    let postId = ObjectId(req.params.singlePost);
    db.collection('posts')
      .find({
        _id: postId,
      })
      //we are converting the information to a new array called result using the  toArray method 
      .toArray((err, result) => {
        if (err) return console.log(err);
        db.collection('comments')
          .find({
            postId: postId,
          })
          // making another array out of the post object called result 02
          .toArray((err, result02) => {
            res.render('post.ejs', {
              // we are telling the ejs it can grab the following properties and all of its content
              user: req.user,
              // we are assigning the post to the result array 
              posts: result,
              // we are assignng the comments to the result 02 array
              comments: result02,
            });
          });
      });
  });


  // SEARCH FEATURE
  app.get('/search', (req, res) => {
    db.collection('posts')
      .find({ "title": { $regex: req.query.search, $options: "i" } })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render('community.ejs', {
          user: req.user,
          posts: result
        });
      });
  });

  // PROFILE PAGE =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('registered').find({ user: req.user }).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        registered: result
      })
    })
  })

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // POST/PUT/DELETE ROUTES ===============================================================

  app.post('/register', (req, res) => {
    db.collection('registered').insertOne(
      {
        user: req.user,
        email: req.body.email,
        quantity: req.body.quantity,
        event: req.body.event
      }), (err, res) => {
        if (err) return console.log(err)
        res.redirect('/profile')
      }
  });

  app.post('/discussion', (req, res) => {
    db.collection('posts').save({
      title: req.body.title,
      msg: req.body.msg,
      name: req.body.name,
      heart: 0
    }, (err, res) => {
      if (err) return console.log(err)
      res.redirect('/community')
    })
  })

  app.post('/comment/:singleComment', async(req, res) => {
    //we are creating an object from the requested single comment which is the parameter and assigning it to postId
    let postId = ObjectId(req.params.singleComment);
    console.log('object', postId);
    // we are saving the front end info to the database
    db.collection('comments').save(
      // the value of the comment property is coming from the results from the form request
      {
        name: req.body.name,
        comment: req.body.comment,
        postId: postId
      },
      //if its an error console log error if its not then create a new route
      async (err, result) => {
        if (err) return console.log(err);
        console.log('saved to database');
        res.redirect(`/post/${postId}`);
        const post = await db.collection('posts').findOne( { _id: postId } )
        const postUser = await db.collection('users').findOne({ 'local.email': post.name }) 
        const phoneNum = postUser.phoneNumber    
        client.messages
    .create({
      body: 'A user has made a comment to your post.',
      from: '+16108947596',
      to: phoneNum
    })
    .then(message => console.log(message.sid));
      }
    );
  });



  app.put('/like', (req, res) => {
    let heartID = ObjectId(req.body.heartID);
    db.collection('posts').findOneAndUpdate(
      { _id: heartID },
      {
        $inc: {
          heart: 1,
        },
      },
      {
        sort: { _id: -1 },
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.delete('/profile', (req, res) => {
    let eventID = ObjectId(req.body.eventID);
    db.collection('registered').findOneAndDelete(
      { _id: eventID },
      (err, result) => {
        if (err) return res.send(500, err);
        res.send('Message deleted!');
      }
    );
  });

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
    // successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), (req, res) => {
    db.collection('users').findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          represent: req.body.represent,
          phoneNumber: req.body.phoneNumber,
        },
      },
      {
        sort: { _id: -1 },
      },
      (err, result) => {
        if (err) return res.send(err);
        res.redirect('/profile');
      }
    );    
  });

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