const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userModel = require('./models/userModel');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(authRoutes);
app.use('/users', userRoutes);

// Simple view to display all users
app.get('/', (req, res) => {
  const users = userModel.getAllUsers();
  res.render('users', { users });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
