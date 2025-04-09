let usaVotes = 0;
let chinaVotes = 0;
let votes = {}; // To track if a wallet has voted

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress } = req.body;

        // Check if the wallet has already voted
        if (votes[walletAddress]) {
            return res.status(400).json({ error: 'You can only vote once.' });
        }

        if (candidate === 'USA') {
            usaVotes++;
        } else if (candidate === 'CHINA') {
            chinaVotes++;
        }

        votes[walletAddress] = true; // Mark wallet as having voted
        return res.json({ usaVotes, chinaVotes });
    } else if (req.method === 'GET') {
        return res.json({ usaVotes, chinaVotes });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};