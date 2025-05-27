const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://danhackerowner:lgr3iXgbs2cC7lyQ@clusterv.6m2an35.mongodb.net/groupchat?retryWrites=true&w=majority&appName=Clusterv');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  isVerified: Boolean
});
const MessageSchema = new mongoose.Schema({
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).send('Username already taken');
  const hashed = await bcrypt.hash(password, 10);
  const isVerified = username === 'Owner';
  await User.create({ username, password: hashed, isVerified });
  res.sendStatus(200);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send('Incorrect password');
  res.json({ username: user.username, isVerified: user.isVerified });
});

io.on('connection', (socket) => {
  socket.on('join', async (user) => {
    socket.data.user = user;
    const history = await Message.find().sort({ createdAt: 1 }).limit(50);
    socket.emit('chatHistory', history);
  });

  socket.on('chatMessage', async (text) => {
    const user = socket.data.user;
    if (!user) return;
    const message = new Message({ user: user.username, text });
    await message.save();
    io.emit('chatMessage', { user: user.username, text, isVerified: user.isVerified });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
