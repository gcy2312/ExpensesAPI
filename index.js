const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require('uuid');

const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());


//documentation request
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET requests
app.get('/', (req, res) => {
  res.send('welcome to BillFold');
});

app.get('/users/:userId', (req, res) => {
  res.send('get user by ID');
});

app.get('/user/:userId/expenses', (req, res) => {
  res.send('list of all expenses for user');
});

app.get('/users/:userId/bills', (req, res) => {
  res.send('list of all bills for user');
});

app.get('/expenses/:expenseId', (req, res) => {
  res.send('single expense info');
});

app.get('/bills/:billId', (req, res) => {
  res.send('single bill info');
});

//POST requests (create)
app.post('/users', (req, res) => {
  res.send('create new user');
});

app.post('/users/:userId/expenses', (req, res) => {
  res.send('create new expense');
});

app.post('/users/:userId/bills', (req, res) => {
  res.send('create new bill');
});

//PUT requests (update)
app.put('/users/:userId', (req, res) => {
  res.send('Successful PUT request updating data of user');
});

app.put('/expenses/:expenseId', (req, res) => {
  res.send('update expense');
});

app.put('/bills/:billId', (req, res) => {
  res.send('update bill');
});

//DELETE requests
app.delete('/users/:userId', (req, res) => {
  res.send('delete user');
});

app.delete('/expenses/:expenseId', (req, res) => {
  res.send('delete expense');
});

app.delete('/bills/:billId', (req, res) => {
  res.send('delete bill');
});




// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});