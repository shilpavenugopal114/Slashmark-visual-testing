# Social Media Platform - Automation Testing Project (Task 3)
**SlashMark Automation Testing Internship**

---

## 📌 Project Overview
This project delivers a complete **Automation Testing Framework** for a Social Media Website as required by the SlashMark Internship Task 3:
- **Core Capabilities**: User authentication (JWT), post creation, follow/unfollow, profile inspection, dynamic feed retrieval, like/unlike toggles, asynchronous comment additions, and dynamic UI notifications.
- **Testing Layers**:
  1. **REST API Automation Testing**: 14 automated test cases written with **Mocha** and **Chai HTTP**.
  2. **End-to-End UI Automation Testing**: Automated browser testing built with **Selenium WebDriver** using the **Page Object Model (POM)** design pattern.
  3. **Zero-Setup Database Architecture**: Includes automated database seeding and seamless fallback to an **in-memory MongoDB server (`mongodb-memory-server`)**, allowing tests to run instantly on any machine without requiring external cloud databases or local MongoDB services.

---

## 🛠️ Tech Stack & Automation Tools
- **Application Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Application Frontend**: HTML5, CSS3, Modern JavaScript (DOM manipulation, Fetch API)
- **API Automation Framework**: Mocha, Chai, Chai-HTTP, Chai-Sorted
- **UI Automation Framework**: Selenium WebDriver (JavaScript + Python implementations)
- **Design Pattern**: Page Object Model (POM) with explicit dynamic waits (`WebDriverWait` / `until.elementLocated`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v16+ recommended, tested with v24)
- **Google Chrome** (for Selenium WebDriver UI tests)
- **Python 3.x** *(optional, for running Python Selenium suite)*

### 2. Installation
Open your terminal in the project directory and run:
```bash
npm install
```

### 3. Running the Social Media Web Application
To start the live web application:
```bash
npm start
```
- Open your browser and navigate to: **`http://localhost:3000`**
- You can manually register a new user, or use the pre-configured credentials:
  - **Email**: `pratap123@email.com`
  - **Password**: `pratap`

---

## 🧪 Test Execution

### 1. Running API Automation Tests (Mocha + Chai)
Runs all **14 REST API automation tests** verifying status codes, response payloads, authentication headers, and sort order:
```bash
npm test
```
**Expected Outcome**: 14 passing tests in ~2 seconds.

### 2. Running UI Automation Tests (Selenium WebDriver - POM)
Executes end-to-end browser automation covering login, dynamic post creation, likes, comments, and notification banners:
```bash
npm run test:ui
```
**Expected Outcome**: 4/4 POM tests passing in headless Chrome.

### 3. Running Python Selenium Tests *(Optional)*
Ensure `selenium` is installed (`pip install selenium`), start the app with `npm start`, and in a separate terminal execute:
```bash
python tests/python_selenium/test_social_media.py
```

### 4. Running All Tests Together
```bash
npm run test:all
```

---

## 📋 Test Cases Matrix (`test_cases.xlsx`)
All 14 test cases outlined in `test_cases.xlsx` are automated and passing:

| # | Test Case Description | Method & Endpoint | Type | Expected Status |
|---|----------------------|-------------------|------|-----------------|
| 1 | Follow another user | `POST /api/follow/:id` | Positive | `200 OK` |
| 2 | Unfollow another user | `POST /api/unfollow/:id` | Positive | `200 OK` |
| 3 | User profile fetch (valid user ID) | `GET /api/user` | Positive | `200 OK` |
| 4 | User profile fetch with invalid payload | `GET /api/user` | Negative | `500 Error` |
| 5 | Post creation with valid title & body | `POST /api/posts` | Positive | `200 OK` |
| 6 | Post creation with missing title | `POST /api/posts` | Negative | `500 / 400` |
| 7 | Delete post without required ID parameter | `DELETE /api/posts/` | Negative | `404 Not Found`|
| 8 | Like an existing post | `POST /api/like/:id` | Positive | `200 OK` |
| 9 | Unlike a post | `POST /api/unlike/:id` | Positive | `200 OK` |
| 10 | Like a post without auth token | `POST /api/like/:id` | Negative | `401 Unauthorized` |
| 11 | Comment on an existing post | `POST /api/comment/:id` | Positive | `200 OK` |
| 12 | Fetch post details by ID | `GET /api/posts/:id` | Positive | `200 OK` |
| 13 | Fetch non-existent post by invalid ID | `GET /api/posts/:id` | Negative | `500 Error` |
| 14 | Fetch all posts sorted by timestamp | `GET /api/all_posts` | Positive | `200 OK (sorted)`|

---

## 📂 Project Structure
```text
Social-Media-Platform-main/
├── controllers/              # Express route controllers (auth, posts, likes, etc.)
├── middleware/               # Auth token verification middleware (Fetchuser.js)
├── models/                   # Mongoose data models (Register, Post)
├── public/                   # Frontend Web Application (HTML, CSS, JS)
│   ├── index.html            # SocialSphere UI (Login, Post Form, Live Feed)
│   ├── style.css             # Responsive styling
│   └── app.js                # Dynamic AJAX client handling real-time updates
├── test/                     # Mocha & Chai REST API test suite
│   └── task.js               # 14 automated API test cases with automated seeding
├── tests/
│   ├── ui/                   # JavaScript Selenium WebDriver UI test framework
│   │   ├── pages/            # Page Object Model (POM) classes
│   │   │   ├── LoginPage.js  # POM for login actions & notifications
│   │   │   └── FeedPage.js   # POM for feed actions, likes, comments
│   │   └── social_media_ui.test.js # E2E Selenium test runner
│   └── python_selenium/      # Python Selenium alternative test suite
│       └── test_social_media.py
├── db.js                     # Smart DB connector (In-Memory + Atlas fallback)
├── index.js                  # Main server entrypoint
├── package.json              # Project scripts and dependencies
├── test_cases.xlsx           # Excel test case documentation from SlashMark
└── README.md                 # Complete documentation & execution guide
```

---

## 📤 Submission Instructions for SlashMark Portal
When ready to submit your internship task on the SlashMark dashboard:
1. **Push your code to your GitHub account**:
   ```bash
   git init
   git add .
   git commit -m "Complete Automation Testing for Social Media Platform"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. On the SlashMark dashboard:
   - Click the **[Submit Project]** button.
   - Paste your GitHub repository link.
   - Mention the test suite highlights:
     - 14/14 automated API tests passing using Mocha & Chai.
     - 4/4 Selenium WebDriver UI tests passing using Page Object Model (POM).
     - Full handling of dynamic elements, asynchronous DOM updates, and notification toasts.
   - Click **[Mark Done]** to complete Task 3!
