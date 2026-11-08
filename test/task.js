const server = require('../index');
const { connectDB, closeDB } = require('../db');
const Register = require('../models/register.model');
const Post = require('../models/post.model');
const bcrypt = require('bcryptjs');
const chai = require('chai');
const chaihttp = require('chai-http');

chai.should();
chai.use(chaihttp);
chai.use(require('chai-sorted'));

let defaultUser = {
  email: 'pratap123@email.com',
  password: 'pratap'
};

const dummyPost = {
  title: 'CSE',
  description: 'CSE is the trending degree nowdays'
};

let userId;
let postId;
let token;

describe('Testing the REST APIs', function () {
  this.timeout(15000);

  before(async () => {
    await connectDB();
    await Register.deleteMany({});
    await Post.deleteMany({});

    // Seed default user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultUser.password, salt);
    const mainUser = await Register.create({
      name: 'Pratap Singh',
      email: defaultUser.email,
      password: hashedPassword,
      followers: 0,
      followings: 0
    });

    // Seed target user for follow / profile tests
    const targetUser = await Register.create({
      name: 'Alice Cooper',
      email: 'alice@email.com',
      password: hashedPassword,
      followers: 0,
      followings: 0
    });
    userId = targetUser._id.toString();

    // Seed initial post
    const samplePost = await Post.create({
      userId: mainUser._id.toString(),
      title: 'Initial Welcome Post',
      description: 'Welcome to our social media platform automated testing suite',
      likes: 0,
      comments: []
    });
    postId = samplePost._id.toString();
  });

  after(async function () {
    this.timeout(10000);
    await closeDB();
  });

  // Testing Auth
  beforeEach('User Authenticated', done => {
    chai.request(server)
      .post('/api/authenticate/login')
      .send(defaultUser)
      .end((err, res) => {
        token = res.body.token;
        res.should.have.status(200);
        done();
      });
  });

  describe('POST /api/follow/:id', () => {
    it('testing whether a user can follow another user', done => {
      chai.request(server)
        .post(`/api/follow/${userId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/unfollow/:id', () => {
    it('testing whether a user can unfollow another user', done => {
      chai.request(server)
        .post(`/api/unfollow/${userId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/user', () => {
    it('User Successful Profile Check', done => {
      chai.request(server)
        .get('/api/user')
        .set({ authtoken: `${token}` })
        .send({ userId })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/user', () => {
    it('User Unsuccessful Profile Check', done => {
      chai.request(server)
        .get('/api/user')
        .set({ authtoken: `${token}` })
        .send(userId)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  // Creating Post
  describe('POST /api/posts', () => {
    it('Post successful creation check', done => {
      chai.request(server)
        .post('/api/posts')
        .set({ authtoken: `${token}` })
        .send(dummyPost)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/posts', () => {
    it('Post creation with Title field missing', done => {
      chai.request(server)
        .post('/api/posts')
        .set({ authtoken: `${token}` })
        .send({ description: 'ECE is not the trending degree nowdays' })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('UnSuccessful Delete of Post', done => {
      chai.request(server)
        .delete('/api/posts/')
        .send(postId)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('POST /api/like/:id', () => {
    it('Able to Like a Post', done => {
      chai.request(server)
        .post(`/api/like/${postId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/unlike/:id', () => {
    it('Able to Unlike a Post', done => {
      chai.request(server)
        .post(`/api/unlike/${postId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/like/:id', () => {
    it('Failed to Like a Post User Unauthorized', done => {
      chai.request(server)
        .post(`/api/like/${postId}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('POST /api/comment/:id', () => {
    it('Successful Comment over a Post', done => {
      chai.request(server)
        .post(`/api/comment/${postId}`)
        .send({ comment: 'great workkk' })
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/posts/:id', () => {
    it('Successful Post fetch', done => {
      chai.request(server)
        .get(`/api/posts/${postId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/posts/:id', () => {
    it('Unavaible Post fetch', done => {
      const wrongId = 'psmsndndi1111i3js0';
      chai.request(server)
        .get(`/api/posts/${wrongId}`)
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  // fetching all posts of User
  describe('GET /api/all_posts', () => {
    it('fetching all posts of User', done => {
      chai.request(server)
        .get('/api/all_posts')
        .set({ authtoken: `${token}` })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.posts.should.have.sortedBy('createdAt', { descending: true });
          done();
        });
    });
  });
});
