const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let usaVotes = 0;
let chinaVotes = 0;

app.post('/vote', (req, res) => {
    const candidate = req.body.candidate;
    if (candidate === 'USA') {
        usaVotes++;
    } else if (candidate === 'CHINA') {
        chinaVotes++;
    }
    res.json({ usaVotes, chinaVotes });
});

app.get('/results', (req, res) => {
    res.json({ usaVotes, chinaVotes });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});