const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = By.id('login-email');
    this.passwordInput = By.id('login-password');
    this.loginBtn = By.id('login-btn');
    this.notificationBanner = By.id('notification-banner');
    this.feedSection = By.id('feed-section');
  }

  async navigate(url) {
    await this.driver.get(url);
    await this.driver.wait(until.elementLocated(this.emailInput), 5000);
  }

  async enterEmail(email) {
    const el = await this.driver.findElement(this.emailInput);
    await el.clear();
    await el.sendKeys(email);
  }

  async enterPassword(password) {
    const el = await this.driver.findElement(this.passwordInput);
    await el.clear();
    await el.sendKeys(password);
  }

  async clickLogin() {
    const btn = await this.driver.findElement(this.loginBtn);
    await btn.click();
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getNotificationText() {
    const banner = await this.driver.wait(until.elementIsVisible(this.driver.findElement(this.notificationBanner)), 5000);
    return await banner.getText();
  }

  async waitForFeedVisible() {
    await this.driver.wait(until.elementIsVisible(this.driver.findElement(this.feedSection)), 8000);
  }
}

module.exports = LoginPage;

