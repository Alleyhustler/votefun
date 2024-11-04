let trumpVotes = 0;
let kamalaVotes = 0;
let votes = {}; // To track if a wallet has voted
let points = {}; // To store points based on $VOTE holdings for each wallet

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress, points: votePoints } = req.body;

        // Check if the wallet has already voted
        if (votes[walletAddress]) {
            return res.status(400).json({ error: 'You can only vote once.' });
        }

        // Track votes for the candidate
        if (candidate === 'Trump') {
            trumpVotes++;
        } else if (candidate === 'Kamala') {
            kamalaVotes++;
        }

        // Mark wallet as having voted and store points
        votes[walletAddress] = true;
        points[walletAddress] = votePoints; // Store points for this wallet

        return res.json({ trumpVotes, kamalaVotes });
    } else if (req.method === 'GET') {
        return res.json({ trumpVotes, kamalaVotes, points });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

function calculateAirdrop() {
    const totalAirdropSupply = 1000000000; // 1 billion tokens for airdrop
    const totalPoints = Object.values(points).reduce((sum, userPoints) => sum + userPoints, 0);
    
    let airdropDistribution = {};
    for (const [wallet, userPoints] of Object.entries(points)) {
        const share = (userPoints / totalPoints) * totalAirdropSupply;
        airdropDistribution[wallet] = share;
    }

    return airdropDistribution;
}

// Example usage: Call calculateAirdrop after voting ends to get distribution
