const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = 'your-secret-key';

mongoose.connect('mongodb://localhost:27017/moodjournal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    console.log("connected")
});

//User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (e) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, userId: user._id });
});

const EntrySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  mood: String,
  date: String,
});

const Entry = mongoose.model('Entry', EntrySchema);

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send('Token missing');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
}

app.post('/entry', auth, async (req, res) => {
  const { text, mood, date } = req.body;
  const entry = new Entry({ userId: req.userId, text, mood, date });
  await entry.save();
  res.status(201).json(entry);
});


app.get('/entries', auth, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 });
  res.json(entries);
});

app.put('/entry/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { text, mood = 'neutral', date } = req.body;
  try {
    const updated = await Entry.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { text, mood, date },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(400).send('Update failed');
  }
});

app.delete('/entry/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await Entry.findOneAndDelete({ _id: id, userId: req.userId });
    res.sendStatus(204);
  } catch {
    res.status(400).send('Delete failed');
  }
});




app.get('/api/dashboard', (req, res) => {
  res.json({
    totalEntries: 15,
    averageMood: "Content",
    dayStreak: 7,
    mostCommonMood: "Happy",
    moodStats: {
      happy: 5,
      anxious: 3,
      content: 4,
      excited: 2,
      sad: 1,
      neutral:3
    },
    recentMoods: [
      { mood: "happy", date: "2024-06-03", rating: 8 },
      { mood: "anxious", date: "2024-06-02", rating: 4 },
      { mood: "content", date: "2024-06-01", rating: 7 },
      { mood: "excited", date: "2024-05-31", rating: 9 },
      { mood: "sad", date: "2024-05-30", rating: 3 },
      { mood: "nuetral", date: "2024-05-30", rating: 5 }
    ]
  });
});





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));