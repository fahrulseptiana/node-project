const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userModel = require('./models/userModel');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(authRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  const users = userModel.getAllUsers();
  res.render('users', { users });
});

module.exports = app;
