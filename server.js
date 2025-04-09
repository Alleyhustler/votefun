const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

let usaVotes = 0;
let chinaVotes = 0;
let votes = {}; // Track wallet votes

// Set up API routes
app.post('/api/vote', (req, res) => {
    const { candidate, walletAddress } = req.body;
    
    // Check if wallet has already voted
    if (votes[walletAddress]) {
        return res.status(400).json({ error: 'You can only vote once.' });
    }
    
    if (candidate === 'USA') {
        usaVotes++;
    } else if (candidate === 'CHINA') {
        chinaVotes++;
    }
    
    votes[walletAddress] = true; // Mark wallet as voted
    res.json({ usaVotes, chinaVotes });
});

app.get('/api/vote', (req, res) => {
    res.json({ usaVotes, chinaVotes });
});

// Chat messages storage
let messages = [];

app.post('/api/chat', (req, res) => {
    const { user, text } = req.body;
    if (!user || !text) {
        return res.status(400).json({ error: 'User and message text are required.' });
    }
    messages.push({ user, text });
    res.status(200).json({ success: true });
});

app.get('/api/chat', (req, res) => {
    res.status(200).json(messages);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});