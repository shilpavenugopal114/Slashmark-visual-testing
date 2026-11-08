require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
const Register = require('./models/register.model');
const Post = require('./models/post.model');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Seed default demo user and initial post for manual web testing
async function seedInitialData() {
  try {
    const existing = await Register.findOne({ email: 'pratap123@email.com' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('pratap', salt);
      const user = await Register.create({
        name: 'Pratap Singh',
        email: 'pratap123@email.com',
        password: hashedPassword,
        followers: 5,
        followings: 3
      });
      await Post.create({
        userId: user._id.toString(),
        title: 'Welcome to SocialSphere!',
        description: 'This is an automated seed post validating interactive social features at scale.',
        likes: 12,
        comments: ['Awesome platform!', 'Testing automation works smoothly!']
      });
      console.log('Default demo user (pratap123@email.com / pratap) seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
}

// Connect to MongoDB
connectDB().then(() => {
  seedInitialData();
}).catch(err => {
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
