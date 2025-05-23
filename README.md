# 🌱 CommShare – Community Resource Sharing App

CommShare is a lightweight, full-stack community resource exchange platform that enables neighbors to post, share, borrow, and manage tools, food, crafts, and more.

---

## 🚀 Deployment Instructions

This project uses:

- **MongoDB Atlas** for cloud-based document storage
- **Node.js + Express** for backend RESTful API
- **Heroku** for backend hosting
- **GitHub Pages** (or Netlify/Vercel) for frontend hosting

---

## 🗂️ Project Structure

```
commshare/
├── models/
│   ├── User.js
│   ├── Listing.js
│   └── Borrow.js
├── middleware/
│   ├── auth.js
│   └── admin.js
├── public/
│   ├── index.html
│   ├── toolshare.html
│   ├── profile.html
│   ├── login.html
│   ├── register.html
│   ├── styles.css
│   └── ...
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── listings.js
│   └── borrow.js
├── createAdmin.js
├── shared.js
├── script.js
├── server.js
├── .env
├── .gitignore
├── Procfile
└── README.md
```

---

## 🔧 Setup Instructions (Local)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/commshare.git
cd commshare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```bash
touch .env
```

Inside `.env`, set the following:

```
MONGO_URI=your_mongodb_atlas_connection_uri
JWT_SECRET=your_secure_jwt_secret_here
```

---

### 4. Create Initial Admin User

Run this script to securely create the first admin:

```bash
node createAdmin.js
```

The script will prompt for:
- Admin username
- Password
- Contact info

It will abort if an admin already exists.

---

### 5. Start the development server

```bash
node server.js
```

App will be available at [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment on Heroku (Backend)

### 📦 One-Time Setup

1. Push your code to GitHub
2. Create an app on [Heroku](https://heroku.com)
3. Under the **Deploy** tab:
   - Connect your GitHub repo
   - Enable automatic deploys (optional)

### 🔐 Set environment variables under **Settings > Config Vars**:

```
MONGO_URI=your_mongodb_atlas_connection_uri
JWT_SECRET=your_secure_jwt_secret_here
```

### ⚙️ Make sure you have:

- A valid `Procfile` with:
  ```
  web: node server.js
  ```

- `package.json` with:
  ```json
  "scripts": {
    "start": "node server.js"
  }
  ```

### 🚀 Manual Deploy

Under **Deploy tab**:
- Choose `main` branch
- Click **Deploy Branch**

Visit your live backend URL:
```
https://your-app-name.herokuapp.com
```

---

## 🌐 Frontend Deployment (GitHub Pages)

### Option A – GitHub Pages (Static Hosting)

1. Move your `/public/` contents to a new GitHub repo
2. In that repo:
   - Go to **Settings > Pages**
   - Select the `main` branch and `/ (root)`
3. Update your frontend JS to point to the Heroku backend:
   ```js
   const