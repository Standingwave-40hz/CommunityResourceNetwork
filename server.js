const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Load routes
const listingsRoute = require('./routes/listings');
const authRoutes = require('./routes/auth');
const borrowRoutes = require('./routes/borrow'); 
app.use('/api/listings', listingsRoute);
app.use('/api/auth', authRoutes);
app.use('/api/borrow', borrowRoutes); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));