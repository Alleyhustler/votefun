let trumpVotes = 0;
let kamalaVotes = 0;
let votes = {}; // To track if a wallet has voted

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress } = req.body;

        // Check if the wallet has already voted
        if (votes[walletAddress]) {
            return res.status(400).json({ error: 'You can only vote once.' });
        }

        if (candidate === 'Trump') {
            trumpVotes++;
        } else if (candidate === 'Kamala') {
            kamalaVotes++;
        }

        votes[walletAddress] = true; // Mark wallet as having voted
        return res.json({ trumpVotes, kamalaVotes });
    } else if (req.method === 'GET') {
        return res.json({ trumpVotes, kamalaVotes });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
