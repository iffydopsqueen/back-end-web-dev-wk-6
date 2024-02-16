const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

// Route for "/"
router.get('/', (req, res) => {
    res.render('index', { title: 'Home', showForm: false });
});
  
// Route for "/register"
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', showForm: true });
});
  
// Route for "/thankyou"
router.get('/thankyou', (req, res) => {
    res.render('thankyou', { title: 'Thank You' });
});

// Route for "/registrants"
router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

// POST route for form submission
router.post('/', 
    [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'),
        check('email').isLength({ min: 1 }).withMessage('Please enter an email'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          const registration = new Registration(req.body);
          registration.save()
            .then(() => {res.redirect('/thankyou');}) // Redirect to "/thankyou" after successful registration
            .catch((err) => {
              console.log(err);
              res.send('Sorry! Something went wrong.');
            });
          } else {
            res.render('register', { 
                title: 'Registration form',
                errors: errors.array(),
                data: req.body,
             });
          }
    });

module.exports = router;
