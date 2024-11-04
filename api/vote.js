let votes = {};

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress } = req.body;
        if (votes[walletAddress]) {
            return res.status(400).json({ error: 'You have already voted.' });
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
