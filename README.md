# Student Grade Portal

A professional, secure, and mobile-responsive web application for publishing student grades. This tool allows students to view their scores, class averages, and performance charts using a private ID.

## Key Features
* **Secure Access:** Privacy-focused login using unique hashed IDs.
* **Data Visualization:** Interactive charts comparing individual performance vs. class averages.
* **Formal Design:** Professional UI with Dark Mode support.
* **PDF Reports:** One-click generation of official grade reports.
* **Universal:** Works for any subject (Math, History, Science, etc.).

## Setup Instructions

### 1. Prepare Data
1.  Create a Google Sheet.
2.  **Row 1:** Headers (e.g., ID, Name, Test 1, Homework 2...).
3.  **Row 2-8:** Statistical metadata (Max Score, Average, Median).
    * *Note: Student data must start at Row 9.*
4.  **Column A:** The unique Hashed ID for each student.

### 2. Install Backend
1.  In your Google Sheet, go to **Extensions > Apps Script**.
2.  Paste the code from `backend/Code.gs`.
3.  Click **Deploy > New deployment**.
4.  **Type:** Web App.
5.  **Execute as:** Me.
6.  **Who has access:** Anyone.
7.  **Copy** the resulting Web App URL.

### 3. Configure Frontend
1.  Open `js/app.js`.
2.  Paste your Web App URL into the `SCRIPT_URL` variable.
3.  Open `index.html` and update the `<title>` and `<h1>` tags with your School/Subject name.

### 4. Publish
Upload the files to any web host (GitHub Pages, Netlify, etc.).
