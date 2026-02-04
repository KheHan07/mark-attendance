# 🎓 EduTrack System

**EduTrack** is a modern, mobile first web application designed to streamline school attendance and academic reporting. It leverages cloud databases and real time barcode scanning to automate communication between schools and parents.

## 🚀 Features

### 📸 **Smart Attendance Scanner**
- **Mobile-First Design:** Optimized for teachers' smartphones.
- **Barcode Integration:** Uses the device camera to scan student ID cards (Code 128 & QR).
- **Zero-Touch Logic:** Automatically identifies the student and logs the entry time.

### 📧 **Real-Time Notification System**
- **Instant Arrival Alerts:** Parents receive an immediate email when their child enters the classroom.
- **Timezone Aware:** Timestamps are automatically localized to Sri Lanka Time (Asia/Colombo).

### 📊 **Teacher Dashboard**
- **Marks Management:** A secure interface for teachers to input and edit Term Test marks.
- **Digital Report Cards:** One click generation and emailing of detailed term test results to parents.
- **Responsive UI:** Works seamlessly on both desktop (Table View) and mobile (Card View).

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14 (App Router)](https://nextjs.org/), React, Tailwind CSS
* **Language:** TypeScript
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Email Engine:** Nodemailer (Gmail SMTP)
* **Scanning Library:** `html5-qrcode`

## ⚙️ Installation & Setup

### 1. Clone the Repository

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
# Supabase Configuration (Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (Gmail SMTP)
# Note: Use an App Password, not your login password.
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_digit_app_password

### 4. Database Setup (Supabase)

Go to your Supabase **SQL Editor** and run this script to initialize the database:

```sql
-- Create the Students Table
CREATE TABLE students (
  barcode_id text PRIMARY KEY,
  name text,
  parent_email text,
  math int DEFAULT 0,
  science int DEFAULT 0,
  history int DEFAULT 0,
  english int DEFAULT 0,
  ict int DEFAULT 0
);

-- Insert Dummy Data for Demo
INSERT INTO students (barcode_id, name, parent_email, math, science, history, english, ict)
VALUES
  ('12345', 'user1', 'demo_parent@gmail.com', 85, 90, 75, 88, 92),
  ('67890', 'user2', 'demo_parent@gmail.com', 45, 60, 55, 40, 70);

```

### 5. Run Locally

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---

## 📱 How to Demo (Presentation Guide)

1. **Preparation:**
* Open the deployed Vercel link on your **Mobile Phone**.
* Have a printed barcode (Code 128) representing ID `12345`.
* Have the "Parent's Email" inbox open on a laptop.


2. **The Flow:**
* **Step 1:** Click **"Start Attendance Scanner"**.
* **Step 2:** Scan the barcode. Show the **"Success"** badge on the phone screen.
* **Step 3:** Show the **"Arrival Email"** appearing instantly in the inbox.
* **Step 4:** Navigate to **"Teacher Dashboard"**.
* **Step 5:** Edit a mark for a student and click **"Save"**.
* **Step 6:** Click **"Email Report"** and show the detailed Marks Sheet in the inbox.



---

## 🤝 Contributing
This project is for educational purposes. Suggestions and pull requests are welcome!