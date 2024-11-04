let voteRecords = {};  // Track votes by wallet address

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: "Wallet address is required." });
        }

        if (voteRecords[walletAddress]) {
            return res.status(403).json({ error: "User has already voted." });
        }

        if (candidate === 'Trump') {
            trumpVotes++;
        } else if (candidate === 'Kamala') {
            kamalaVotes++;
        }

        voteRecords[walletAddress] = true; // Mark user as having voted
        return res.json({ trumpVotes, kamalaVotes });
    } else if (req.method === 'GET') {
        return res.json({ trumpVotes, kamalaVotes });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
