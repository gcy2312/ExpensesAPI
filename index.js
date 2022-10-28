const bodyParser = require("body-parser");
const cors = require('cors');
const express = require("express");
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const morgan = require("morgan");

const uuid = require('uuid');


const Models = require('./models.js');
require('./passport');
const generateAuth = require('./auth');


const Bills = Models.Bill;
const Expenses = Models.Expense;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/billFoldDB', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
// let allowedOrigins = ['http://localhost:58157', 'http://localhost:4200', 'https://gcy2312.github.io/billFold'];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
//       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//       return callback(new Error(message), false);
//     }
//     return callback(null, true);
//   }
// }));
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('common'));

generateAuth(app);
const passport = require('passport');


// app.use(bodyParser.urlencoded({ extended: true }));






//documentation request
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET requests
app.get('/', (req, res) => {
  res.send('welcome to BillFold');
});

//get user by userId
app.get('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Users.find({ _id: req.params.userId })
  Users.findById(req.params.id)
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get users list of expenses
app.get('/users/:id/expenses', passport.authenticate('jwt', { session: false }), (req, res) => {
  Expenses.find({ UserId: req.params.id })
    .then((userExpenses) => {
      res.json(userExpenses);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get users list of bills
app.get('/users/:id/bills', passport.authenticate('jwt', { session: false }), (req, res) => {
  Bills.find({ UserId: req.params.id })
    .then((bills) => {
      res.json(bills);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get single expense info
app.get('/expenses/:expenseId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Expenses.find({ _id: req.params.expenseId })
    .then((expense) => {
      res.json(expense);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get single bill info
app.get('/bills/:billId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Bills.find({ _id: req.params.billId })
    .then((bill) => {
      res.json(bill);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST requests (create)

//regsiter new user
app.post('/users',
  [
    check('Username', 'Username is required').not().isEmpty(),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('CurrencyPref', 'Please select a currency preference').not().isEmpty(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Email: req.body.Email })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Email + 'is already registered');
        } else {
          Users
            .create({
              FirstName: req.body.FirstName,
              LastName: req.body.LastName,
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              CurrencyPref: req.body.CurrencyPref
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//create new expense doc
app.post('/users/:id/expenses', passport.authenticate('jwt', { session: false }), (req, res) => {
  Expenses.create({
    ...req.body, UserId: req.params.id, Index: true
  })
    .then((expense) => { res.status(201).json(expense) })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//create new bill doc
app.post('/users/:id/bills', passport.authenticate('jwt', { session: false }), (req, res) => {
  Bills.create({
    ...req.body, UserId: req.params.id, Index: true
  })
    .then((bill) => { res.status(201).json(bill) })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//PUT requests (update)

//update user by id
app.put('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

  if (req.body.Password === undefined) {
    Users.findByIdAndUpdate(req.params.id, {
      $set:
      {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Username: req.body.Username,

        Email: req.body.Email,
        CurrencyPref: req.body.CurrencyPref
      }
    },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  } else {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findByIdAndUpdate(req.params.id, {
      $set:
      {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        CurrencyPref: req.body.CurrencyPref
      }
    },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  }

});

//update single expense doc
app.put('/users/:id/expenses/:expenseId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Expenses.findByIdAndUpdate({ _id: req.params.expenseId }, {
    $set:
    {
      Category: req.body.Category,
      Description: req.body.Description,
      Date: req.body.Date,
      Amount: req.body.Amount,
      Currency: req.body.Currency,
      UserId: req.params.id,
      Index: true
    }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedExpense) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedExpense);
      }
    });
});

//update single bill doc
app.put('/users/:id/bills/:billId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Bills.findByIdAndUpdate({ _id: req.params.billId }, {
    $set:
    {
      Description: req.body.Description,
      Date: req.body.Date,
      Amount: req.body.Amount,
      Currency: req.body.Currency,
      UserId: req.params.id,
      Paid: req.body.Paid,
      Index: true
    }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedBill) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedBill);
      }
    });
});

//DELETE requests

//delete user account
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (!user) {
        res.status(400).send('Account was not found');
      } else {
        res.status(200).send('Account has been successfully deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//delete expense by id
app.delete('/expenses/:expenseId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Expenses.findByIdAndRemove({ _id: req.params.expenseId })
    .then((expense) => {
      if (!expense) {
        res.status(400).send('Expense item was not found');
      } else {
        res.status(200).send('Expense item has been successfully deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//delete bill by id
app.delete('/bills/:billId', passport.authenticate('jwt', { session: false }), (req, res) => {
  Bills.findByIdAndRemove({ _id: req.params.billId })
    .then((bill) => {
      if (!bill) {
        res.status(400).send('Bill item was not found');
      } else {
        res.status(200).send('Bill item has been successfully deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
