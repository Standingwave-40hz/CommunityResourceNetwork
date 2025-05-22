# 🌱 CommShare – Community Resource Sharing App

CommShare is a lightweight, full-stack community resource exchange platform that enables neighbors to post, share, borrow, and manage tools, food, crafts, and more.

---

## 🚀 Deployment Instructions

These steps assume you're using **MongoDB Atlas**, **Node.js**, and deploying to **Render** or **Heroku** (for backend) + **GitHub Pages/Vercel/Netlify** (for frontend).

---

## 🗂️ Project Structure

```
ComShare/
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
└── README.md
```

---

## 🔧 Setup Instructions

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

Inside `.env`, add your MongoDB connection string and JWT secret:

```
MONGO_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/communitydb?retryWrites=true&w=majority
JWT_SECRET=yourSuperSecretKey
```

---

### 4. Create Initial Admin User

Run the interactive setup script to add the first admin account:

```bash
node createAdmin.js
```

The script will ask you to input:
- Admin username
- Password
- Contact info (email or phone)

Make sure MongoDB is running and `.env` is configured before running this step.

---

### 5. Start the server

```bash
node server.js
```

App will run on: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment (Render / Heroku)

1. Push to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Heroku](https://heroku.com).
3. Connect your GitHub repo.
4. Add Environment Variables (same as `.env`).
5. Set the Start Command:  
   ```bash
   node server.js
   ```

---

## 🌐 Deploy Static Frontend

If using GitHub Pages / Vercel / Netlify:
- Place your `/public` files in a separate branch/repo or build process
- Point your domain to `/public/index.html`

---

## 📬 Admin Features

- View, promote, disable/enable users
- Delete listings
- Create new users
- Export listings/users as CSV

---

## 📌 Technologies Used

- Node.js / Express.js
- MongoDB Atlas
- JWT + Cookies
- HTML, CSS, Vanilla JS

---

## 🛡️ Security Tips

- Always use HTTPS in production
- Change default passwords
- Set proper JWT secret
- Use CORS and cookie security settings if deploying across domains

---

## 🙋 Support

Built by [Caley Kelly](mailto:caleywekelly@gmail.com)  
