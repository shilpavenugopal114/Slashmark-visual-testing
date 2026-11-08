require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Initial DB connection error:', err);
});

// Define Routes
app.use('/api/all_posts', require('./controllers/allposts'));
app.use('/api/authenticate', require('./controllers/auth'));
app.use('/api/posts', require('./controllers/post'));
app.use('/api/user', require('./controllers/users'));
app.use('/api', require('./controllers/manageFollow'));
app.use('/api/like', require('./controllers/like'));
app.use('/api/unlike', require('./controllers/unlike'));
app.use('/api/comment', require('./controllers/comment'));

let serverInstance = null;
if (!module.parent) {
  serverInstance = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log(`Open http://localhost:${port} in your browser to view the app`);
  });
}

module.exports = app;
