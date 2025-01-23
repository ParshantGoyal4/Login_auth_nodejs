var express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});
});

// Login Route with async/await for Passport Authentication
router.post('/login', 
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password'
  }), 
  async function(req, res) {
    try {
      req.flash('success', 'You are now logged in');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err); // Pass to error-handling middleware
    }
  }
);

// Serialize and Deserialize User with async/await

passport.serializeUser(async function(user, done) {
  try {
    done(null, user.id);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.getUserById(id);  // Assuming getUserById is async/await-compatible
    done(null, user);
  } catch (err) {
    done(err);
  }
});


// router.post('/login',
//   passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
//   function(req, res) {
//    req.flash('success', 'You are now logged in');
//    res.redirect('/');
// });

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.getUserById(id, function(err, user) {
//     done(err, user);
//   });
// });

// const usercheck =()=>{
//   console.log("sucess")
// }
// passport.use(new LocalStrategy(function(username){
// User.getUserByUsername(username,usercheck)}))

// passport.use(new LocalStrategy(function(username, password, done){
//   User.getUserByUsername(username, function(err, user){
//     if(err) throw err;
//     if(!user){
//       return done(null, false, {message: 'Unknown User'});
//     }

//     User.comparePassword(password, user.password, function(err, isMatch){
//       if(err) return done(err);
//       if(isMatch){
//         return done(null, user);
//       } else {
//         return done(null, false, {message:'Invalid Password'});
//       }
//     });
//   });
// }));

passport.use(new LocalStrategy(async function(username, password, done) {
  try {
    // Get user by username
    const user = await User.getUserByUsername(username);
    
    // If user doesn't exist
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }

    // Compare password
    const isMatch = await User.comparePassword(password, user.password);

    // If password matches
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Invalid Password' });
    }
  } catch (err) {
    return done(err);  // If any error occurs during the process
  }
}));

router.post('/register', upload.single('profileimage'), async function(req, res, next) {
  const { name, email, username, password, password2 } = req.body;

  // Handle file upload
  let profileimage = 'noimage.jpg';
  if (req.file) {
    console.log('Uploading File...');
    profileimage = req.file.filename;
  } else {
    console.log('No File Uploaded...');
  }

  // Form Validator (express-validator syntax)
  await body('email').isEmail().run(req);
  await body('name').notEmpty().run(req);
  await body('email').notEmpty().run(req);
  await body('username').notEmpty().run(req);
  await body('password').notEmpty().run(req);
  await body('password2').equals(password).withMessage('Passwords do not match').run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('register', {
      errors: errors.array()
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      profileimage
    });

    await User.createUser(newUser); // Assuming createUser method supports async/await

    // Set success message and redirect
    req.flash('success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err); // Pass the error to error-handling middleware
  }
});









// router.post('/register', upload.single('profileimage') ,function(req, res, next) {
//   var name = req.body.name;
//   var email = req.body.email;
//   var username = req.body.username;
//   var password = req.body.password;
//   var password2 = req.body.password2;

//   if(req.file){
//   	console.log('Uploading File...');
//   	var profileimage = req.file.filename;
//   } else {
//   	console.log('No File Uploaded...');
//   	var profileimage = 'noimage.jpg';
//   }

//   // Form Validator
//   body('email').isEmail().run(req);

//   req.checkBody('name','Name field is required').notEmpty();
//   req.checkBody('email','Email field is required').notEmpty();
//   req.checkBody('email','Email is not valid').isEmail();
//   req.checkBody('username','Username field is required').notEmpty();
//   req.checkBody('password','Password field is required').notEmpty();
//   req.checkBody('password2','Passwords do not match').equals(req.body.password);

//   // Check Errors
//   var errors = req.validationErrors();

//   if(errors){
//   	res.render('register', {
//   		errors: errors
//   	});
//   } else{
//   	var newUser = new User({
//       name: name,
//       email: email,
//       username: username,
//       password: password,
//       profileimage: profileimage
//     });

//     User.createUser(newUser, function(err, user){
//       if(err) throw err;
//       console.log(user);
//     });

//     req.flash('success', 'You are now registered and can login');

//     res.location('/');
//     res.redirect('/');
//   }
// });

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
