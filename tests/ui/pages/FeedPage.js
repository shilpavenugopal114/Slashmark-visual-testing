const { By, until } = require('selenium-webdriver');

class FeedPage {
  constructor(driver) {
    this.driver = driver;
    this.postTitleInput = By.id('post-title');
    this.postDescInput = By.id('post-desc');
    this.createPostBtn = By.id('create-post-btn');
    this.postsContainer = By.id('posts-container');
    this.postCards = By.css('.post-card');
    this.firstPostTitle = By.css('.post-card .post-card-title');
    this.firstPostDesc = By.css('.post-card .post-card-body');
    this.firstPostLikeBtn = By.css('.post-card .like-btn');
    this.firstPostLikeCount = By.css('.post-card .like-count');
    this.firstPostCommentInput = By.css('.post-card .comment-form input');
    this.firstPostCommentBtn = By.css('.post-card .comment-form button');
    this.firstPostCommentItems = By.css('.post-card .comment-item');
    this.notificationBanner = By.id('notification-banner');
  }

  async waitForFeedToLoad() {
    await this.driver.wait(until.elementLocated(this.postTitleInput), 5000);
  }

  async createPost(title, description) {
    console.log('    [FeedPage] Setting post title and description...');
    await this.driver.executeScript(
      "document.getElementById('post-title').value = arguments[0];" +
      "document.getElementById('post-desc').value = arguments[1];",
      title,
      description
    );

    console.log('    [FeedPage] Clicking submit post button...');
    const btn = await this.driver.findElement(this.createPostBtn);
    await this.driver.executeScript("arguments[0].click();", btn);
    console.log('    [FeedPage] Clicked! Now waiting for post title to appear...');

    // Wait for the dynamic feed update
    await this.driver.wait(until.elementLocated(this.firstPostTitle), 8000);
  }

  async getFirstPostTitle() {
    const el = await this.driver.wait(until.elementLocated(this.firstPostTitle), 5000);
    return await el.getText();
  }

  async likeFirstPost() {
    const likeBtn = await this.driver.wait(until.elementLocated(this.firstPostLikeBtn), 5000);
    await this.driver.executeScript("arguments[0].click();", likeBtn);
  }

  async getFirstPostLikeCount() {
    const el = await this.driver.wait(until.elementLocated(this.firstPostLikeCount), 5000);
    return await el.getText();
  }

  async commentOnFirstPost(comment) {
    const input = await this.driver.wait(until.elementLocated(this.firstPostCommentInput), 5000);
    await this.driver.executeScript("arguments[0].value = arguments[1];", input, comment);

    const btn = await this.driver.findElement(this.firstPostCommentBtn);
    await this.driver.executeScript("arguments[0].click();", btn);

    // Wait for the comment to appear dynamically
    await this.driver.wait(until.elementLocated(this.firstPostCommentItems), 8000);
  }

  async getLatestCommentText() {
    const items = await this.driver.findElements(this.firstPostCommentItems);
    if (items.length === 0) return '';
    return await items[items.length - 1].getText();
  }
}

module.exports = FeedPage;

