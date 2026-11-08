"""
Selenium WebDriver UI Automation Test Suite (Python)
Pattern: Page Object Model (POM)
Application: Social Media Platform (Task 3 - SlashMark Internship)
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.email_input = (By.ID, "login-email")
        self.password_input = (By.ID, "login-password")
        self.login_btn = (By.ID, "login-btn")
        self.notification_banner = (By.ID, "notification-banner")
        self.feed_section = (By.ID, "feed-section")

    def login(self, email, password):
        email_el = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(self.email_input))
        email_el.clear()
        email_el.send_keys(email)

        pwd_el = self.driver.find_element(*self.password_input)
        pwd_el.clear()
        pwd_el.send_keys(password)

        btn = self.driver.find_element(*self.login_btn)
        self.driver.execute_script("arguments[0].click();", btn)

    def get_notification_text(self):
        banner = WebDriverWait(self.driver, 5).until(EC.visibility_of_element_located(self.notification_banner))
        return banner.text

    def wait_for_feed(self):
        WebDriverWait(self.driver, 10).until(EC.visibility_of_element_located(self.feed_section))


class FeedPage:
    def __init__(self, driver):
        self.driver = driver
        self.post_title_input = (By.ID, "post-title")
        self.post_desc_input = (By.ID, "post-desc")
        self.create_post_btn = (By.ID, "create-post-btn")
        self.first_post_title = (By.CSS_SELECTOR, ".post-card .post-card-title")
        self.first_post_like_btn = (By.CSS_SELECTOR, ".post-card .like-btn")
        self.first_post_like_count = (By.CSS_SELECTOR, ".post-card .like-count")
        self.first_post_comment_input = (By.CSS_SELECTOR, ".post-card .comment-form input")
        self.first_post_comment_btn = (By.CSS_SELECTOR, ".post-card .comment-form button")
        self.comment_items = (By.CSS_SELECTOR, ".post-card .comment-item")

    def create_post(self, title, description):
        self.driver.execute_script(
            "document.getElementById('post-title').value = arguments[0];"
            "document.getElementById('post-desc').value = arguments[1];",
            title, description
        )
        btn = self.driver.find_element(*self.create_post_btn)
        self.driver.execute_script("arguments[0].click();", btn)
        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(self.first_post_title))

    def get_first_post_title(self):
        el = WebDriverWait(self.driver, 5).until(EC.presence_of_element_located(self.first_post_title))
        return el.text

    def like_first_post(self):
        btn = WebDriverWait(self.driver, 5).until(EC.element_to_be_clickable(self.first_post_like_btn))
        self.driver.execute_script("arguments[0].click();", btn)

    def get_first_post_like_count(self):
        el = WebDriverWait(self.driver, 5).until(EC.presence_of_element_located(self.first_post_like_count))
        return int(el.text or "0")

    def comment_on_first_post(self, comment):
        inp = WebDriverWait(self.driver, 5).until(EC.presence_of_element_located(self.first_post_comment_input))
        self.driver.execute_script("arguments[0].value = arguments[1];", inp, comment)
        btn = self.driver.find_element(*self.first_post_comment_btn)
        self.driver.execute_script("arguments[0].click();", btn)
        WebDriverWait(self.driver, 8).until(EC.presence_of_element_located(self.comment_items))

    def get_latest_comment_text(self):
        items = self.driver.find_elements(*self.comment_items)
        if not items:
            return ""
        return items[-1].text


def main():
    print("=" * 60)
    print("  PYTHON SELENIUM WEBDRIVER UI AUTOMATION TEST SUITE")
    print("  Task 3 - SlashMark Automation Testing Internship")
    print("=" * 60)

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")

    driver = webdriver.Chrome(options=options)
    passed_tests = 0
    total_tests = 4

    try:
        driver.get(BASE_URL)
        login_page = LoginPage(driver)
        feed_page = FeedPage(driver)

        # Test 1: User Login
        print("\n[Test 1] Testing User Login & Dynamic Notification...")
        login_page.login("pratap123@email.com", "pratap")
        banner_text = login_page.get_notification_text()
        print(f"  -> Notification: '{banner_text}'")
        assert "Logged in successfully" in banner_text, f"Unexpected banner: {banner_text}"
        print("  ✓ Test 1 Passed: User Login Verified.")
        passed_tests += 1

        login_page.wait_for_feed()

        # Test 2: Dynamic Post Creation
        print("\n[Test 2] Testing Dynamic Feed Update & Post Creation...")
        test_title = f"Python Automation Post {int(time.time())}"
        test_desc = "Testing asynchronous DOM insertion with Selenium."
        feed_page.create_post(test_title, test_desc)
        displayed_title = feed_page.get_first_post_title()
        print(f"  -> Displayed Post Title: '{displayed_title}'")
        assert displayed_title == test_title, f"Expected '{test_title}', got '{displayed_title}'"
        print("  ✓ Test 2 Passed: Dynamic Post Creation Verified.")
        passed_tests += 1

        # Test 3: Like Action
        print("\n[Test 3] Testing Asynchronous Like Action...")
        initial_likes = feed_page.get_first_post_like_count()
        feed_page.like_first_post()
        time.sleep(1)
        updated_likes = feed_page.get_first_post_like_count()
        print(f"  -> Likes updated: {initial_likes} -> {updated_likes}")
        assert updated_likes == initial_likes + 1, "Like count failed to increment"
        print("  ✓ Test 3 Passed: Like Counter Verified.")
        passed_tests += 1

        # Test 4: Comment Submission
        print("\n[Test 4] Testing Asynchronous Comment Submission...")
        test_comment = "Verified via Python Selenium POM!"
        feed_page.comment_on_first_post(test_comment)
        time.sleep(1)
        comment_text = feed_page.get_latest_comment_text()
        print(f"  -> Rendered Comment: '{comment_text}'")
        assert test_comment in comment_text, f"Comment '{test_comment}' not in '{comment_text}'"
        print("  ✓ Test 4 Passed: Dynamic Comment Verified.")
        passed_tests += 1

        print("\n" + "=" * 60)
        print(f"  TEST RESULTS: {passed_tests}/{total_tests} TESTS PASSED (100%)")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Python UI Test Error: {e}")
        sys.exit(1)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
