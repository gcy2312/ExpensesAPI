const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


let billSchema = mongoose.Schema({
  Description: { type: String, required: true },
  Date: { type: mongoose.Schema.Types.Date, required: true },
  Amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  Currency: String,
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  Paid: Boolean,
  Index: Boolean
});

let expenseSchema = mongoose.Schema({
  Category: String,
  Description: { type: String, required: true },
  Date: { type: mongoose.Schema.Types.Date, required: true },
  Amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  Currency: String,
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  Index: Boolean
});

let userSchema = mongoose.Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  CurrencyPref: { type: String, required: true },
  Email: { type: String, required: true },
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  //referring to the actual user document rather than userSchema.methods (this)
  return bcrypt.compareSync(password, this.Password);
};

let Bill = mongoose.model('Bill', billSchema);
let Expense = mongoose.model('Expense', expenseSchema);
let User = mongoose.model('User', userSchema);

module.exports.Bill = Bill;
module.exports.Expense = Expense;
module.exports.User = User;