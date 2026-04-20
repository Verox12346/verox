# Verox Backend — Setup Guide

## 📦 What's included

```
verox-backend/
├── server.js          ← Express backend (Node.js)
├── package.json       ← Dependencies
├── .env.example       ← Environment variables template
├── contact-styles.css ← New CSS to add to your style.css
└── public/
    └── index.html     ← Updated frontend (copy your images folder here)
```

---

## 🛠 Step-by-Step Setup

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install PostgreSQL
Download from https://www.postgresql.org/download/
- During install, set a password for user `postgres`
- Remember this password!

### 3. Create the database
Open pgAdmin or psql terminal and run:
```sql
CREATE DATABASE verox_db;
```

### 4. Configure your environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your PostgreSQL password:
```
DB_PASSWORD=your_actual_password
```

### 5. Install dependencies
```bash
npm install
```

### 6. Start the server
```bash
npm start
```
You should see:
```
✅ Database tables ready
🚀 Verox server running on http://localhost:3000
```

### 7. Add your frontend files
Copy your `images/` folder and `style.css` into the `public/` folder.
Also paste the contents of `contact-styles.css` at the bottom of your `style.css`.

### 8. Open the website
Go to: http://localhost:3000

---

## 🗄 Database Tables

| Table | What it stores |
|---|---|
| `newsletter_subscribers` | Email from newsletter form |
| `contact_messages` | Name, email, phone, message from contact form |
| `purchase_requests` | Which product was clicked for purchase |

---

## 👁 View your data (Admin endpoints)

| URL | Shows |
|---|---|
| http://localhost:3000/api/admin/subscribers | All newsletter subscribers |
| http://localhost:3000/api/admin/messages | All contact messages |
| http://localhost:3000/api/admin/purchases | All purchase clicks |

Or open pgAdmin and browse the tables visually.

---

## 📲 WhatsApp & Gmail

WhatsApp links use the format:
```
https://wa.me/212612690679?text=...
```
`212` is Morocco's country code. The `+` is omitted in wa.me links.

Gmail link:
```
mailto:zoroverox@gmail.com?subject=Verox%20Inquiry
```

---

## 🚀 Deploy to the Internet (optional)

To make the site public, deploy to:
- **Railway** (railway.app) — easiest, free PostgreSQL included
- **Render** (render.com) — free tier available
- **Heroku** — paid

On deployment, update the `API` variable in `index.html`:
```js
const API = 'https://your-deployed-url.com/api';
```
