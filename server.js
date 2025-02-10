const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let trumpVotes = 0;
let kamalaVotes = 0;

app.post('/vote', (req, res) => {
    const candidate = req.body.candidate;
    if (candidate === 'USA') {
        trumpVotes++;
    } else if (candidate === 'INDIA') {
        kamalaVotes++;
    }
    res.json({ trumpVotes, kamalaVotes });
});

app.get('/results', (req, res) => {
    res.json({ trumpVotes, kamalaVotes });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
