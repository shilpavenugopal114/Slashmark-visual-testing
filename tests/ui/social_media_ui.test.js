const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../../index');
const { connectDB, closeDB } = require('../../db');
const Register = require('../../models/register.model');
const Post = require('../../models/post.model');
const bcrypt = require('bcryptjs');
const LoginPage = require('./pages/LoginPage');
const FeedPage = require('./pages/FeedPage');

const PORT = 3001; // Separate port for UI test to avoid collisions
const BASE_URL = `http://localhost:${PORT}`;

async function runUITests() {
  console.log('\n======================================================');
  console.log('  RUNNING SELENIUM WEBDRIVER UI AUTOMATION TEST SUITE');
  console.log('  Pattern: Page Object Model (POM)');
  console.log('======================================================\n');

  let server;
  let driver;
  let passedTests = 0;
  let totalTests = 4;

  try {
    // 1. Initialize local DB & Seed test user
    console.log('[Setup] Connecting to database and seeding test user...');
    await connectDB();
    await Register.deleteMany({});
    await Post.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('pratap', salt);
    await Register.create({
      name: 'Pratap Singh',
      email: 'pratap123@email.com',
      password: hashedPassword,
      followers: 0,
      followings: 0
    });

    // 2. Start server
    await new Promise(resolve => {
      server = app.listen(PORT, () => {
        console.log(`[Setup] Test server running at ${BASE_URL}`);
        resolve();
      });
    });

    // 3. Initialize Selenium WebDriver
    console.log('[Setup] Launching Chrome WebDriver (headless mode)...');
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1280,800');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    const loginPage = new LoginPage(driver);
    const feedPage = new FeedPage(driver);

    // TEST 1: User Login
    console.log('\n[Test 1] Testing User Authentication & Dynamic Notification...');
    await loginPage.navigate(BASE_URL);
    await loginPage.login('pratap123@email.com', 'pratap');
    const loginNotice = await loginPage.getNotificationText();
    console.log(`  -> Notification displayed: "${loginNotice}"`);
    if (loginNotice.includes('Logged in successfully')) {
      console.log('  ✓ Test 1 Passed: User Login & Notification Verified.');
      passedTests++;
    } else {
      throw new Error(`Unexpected notification text: ${loginNotice}`);
    }

    // Wait for Feed to become visible
    await loginPage.waitForFeedVisible();

    // TEST 2: Dynamic Post Creation
    console.log('\n[Test 2] Testing Dynamic Feed Update & Post Creation...');
    const testTitle = 'Automated Test Post ' + Date.now();
    const testDesc = 'Validating asynchronous updates and dynamic DOM elements.';
    await feedPage.createPost(testTitle, testDesc);
    const displayedTitle = await feedPage.getFirstPostTitle();
    console.log(`  -> Feed updated with post: "${displayedTitle}"`);
    if (displayedTitle === testTitle) {
      console.log('  ✓ Test 2 Passed: Dynamic Feed Updated with New Post.');
      passedTests++;
    } else {
      throw new Error(`Post title mismatch. Expected "${testTitle}", got "${displayedTitle}"`);
    }

    // TEST 3: Asynchronous Like Action
    console.log('\n[Test 3] Testing Asynchronous Like Action & Counter Update...');
    const initialLikes = parseInt(await feedPage.getFirstPostLikeCount(), 10) || 0;
    await feedPage.likeFirstPost();
    // Allow asynchronous state update
    await driver.sleep(1000);
    const updatedLikes = parseInt(await feedPage.getFirstPostLikeCount(), 10);
    console.log(`  -> Like count updated: ${initialLikes} -> ${updatedLikes}`);
    if (updatedLikes === initialLikes + 1) {
      console.log('  ✓ Test 3 Passed: Like count asynchronously incremented.');
      passedTests++;
    } else {
      throw new Error(`Like count failed to increment. Initial: ${initialLikes}, Current: ${updatedLikes}`);
    }

    // TEST 4: Dynamic Comment Insertion
    console.log('\n[Test 4] Testing Asynchronous Comment Submission & DOM Insertion...');
    const testComment = 'Great automation framework test!';
    await feedPage.commentOnFirstPost(testComment);
    await driver.sleep(1000);
    const commentText = await feedPage.getLatestCommentText();
    console.log(`  -> Comment rendered in DOM: "${commentText}"`);
    if (commentText.includes(testComment)) {
      console.log('  ✓ Test 4 Passed: Comment added dynamically to the feed.');
      passedTests++;
    } else {
      throw new Error(`Comment not found in list. Got: "${commentText}"`);
    }

    // SUMMARY
    console.log('\n======================================================');
    console.log(`  TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ UI Test Failure:', err.message);
    if (driver) {
      try {
        const logs = await driver.manage().logs().get('browser');
        console.log('--- Browser Console Logs ---');
        logs.forEach(log => console.log(`[${log.level.name}] ${log.message}`));
        const html = await driver.getPageSource();
        console.log('--- Page Source (truncated) ---', html.substring(0, 1000));
      } catch (logErr) {}
    }
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit();
      console.log('[Teardown] Chrome WebDriver closed.');
    }
    if (server) {
      server.close();
      console.log('[Teardown] Test server stopped.');
    }
    await closeDB();
    console.log('[Teardown] Database disconnected.\n');
  }
}

runUITests();

