# Presentation Topic Selection System

A clean, practical college presentation topic allocation web application built with **React**, **Node.js/Express**, and **MongoDB**. Supports First-Come, First-Served (FCFS) atomic selection, Faculty portal, Student topic reservation, and PDF / Excel / XML Spreadsheet exports.

---

## 🌟 Key Features

### 👩‍🏫 Faculty Portal
- **Secure Login**: Seeded credentials with bcrypt password hashing (`MCA_Teacher` / `Kishan@104`).
- **Dashboard**: Summary metrics for Total, Open, Locked, and Draft presentations + recent activity table.
- **Make Presentation**: Easy creation of new presentations with Subject Code, Subject Name, Date, and Topic count.
- **Topic Management & Draft System**: Add, edit, delete topics. Save as draft before publishing. Drafts are completely hidden from students.
- **Publish & Lock Controls**: Validate topic completeness on publishing. Lock presentation anytime to close student submissions; unlock to reopen.
- **Results & Real-time Allocation**: View student selections sorted by FCFS timestamp.
- **Release / Repost Topic**: One-click topic release returning claimed topics to the student pool.
- **File Exports**:
  - 📄 **Export PDF**: Clean printable PDF document via `jsPDF` + `jspdf-autotable`.
  - 📊 **Export Excel**: Microsoft Excel spreadsheet `.xlsx` via `xlsx`.
  - 📑 **Export XML**: Standard Excel-compatible XML Spreadsheet `.xml`.

### 👨‍🎓 Student Portal
- **Public & Mobile Friendly**: Clean UI without requiring student account registration.
- **Atomic FCFS Topic Claiming**: Real-time topic claiming protected against race conditions and concurrent requests.
- **Duplicate Prevention**: Database-level unique constraint preventing the same student roll number from claiming multiple topics in the same presentation.
- **Live Polling**: Automatically refreshes available topics so students always see live availability.
- **Success Screen**: Detailed topic confirmation receipt.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running on `mongodb://127.0.0.1:27017`

### 2. Start the Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---


