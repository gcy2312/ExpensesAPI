const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Bills = Models.Bill;
const Expenses = Models.Expense;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/billFoldDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//documentation request
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET requests
app.get('/', (req, res) => {
  res.send('welcome to BillFold');
});

//get user by userId
app.get('/users/:id', (req, res) => {
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
app.get('/users/:id/expenses', (req, res) => {
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
app.get('/users/:id/bills', (req, res) => {
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
app.get('/expenses/:expenseId', (req, res) => {
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
app.get('/bills/:billId', (req, res) => {
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
app.post('/users', (req, res) => {
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
            Password: req.body.Password,
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
app.post('/users/:id/expenses', (req, res) => {
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
app.post('/users/:id/bills', (req, res) => {
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
app.put('/users/:id', (req, res) => {
  Users.findByIdAndUpdate(req.params.id, {
    $set:
    {
      FirstName: req.body.FistName,
      LastName: req.body.LastName,
      Username: req.body.Username,
      Password: req.body.Password,
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
});

//update single expense doc
app.put('/users/:id/expenses/:expenseId', (req, res) => {
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
app.put('/users/:id/bills/:billId', (req, res) => {
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
app.delete('/users/:id', (req, res) => {
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
app.delete('/expenses/:expenseId', (req, res) => {
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
app.delete('/bills/:billId', (req, res) => {
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




// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});