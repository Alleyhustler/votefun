let trumpVotes = 0;
let kamalaVotes = 0;
let votes = {}; // Track if a wallet has voted
let userPoints = {}; // Store user points
let totalPoints = 0;

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate, walletAddress, voteAmount } = req.body;

        // Check if the wallet has already voted
        if (votes[walletAddress]) {
            return res.status(400).json({ error: 'You can only vote once.' });
        }

        // Update vote count
        if (candidate === 'Trump') {
            trumpVotes++;
        } else if (candidate === 'Kamala') {
            kamalaVotes++;
        }

        // Calculate points based on voteAmount
        const points = voteAmount * 10; // Example: 10 points per $VOTE held
        userPoints[walletAddress] = (userPoints[walletAddress] || 0) + points;
        totalPoints += points; // Update total points

        votes[walletAddress] = true; // Mark wallet as having voted
        return res.json({ trumpVotes, kamalaVotes, points });
    } else if (req.method === 'GET') {
        // Airdrop eligibility endpoint
        const walletAddress = req.query.walletAddress;
        const userPoint = userPoints[walletAddress] || 0;
        const airdropAmount = 1_000_000_000 * 0.05; // Total airdrop amount (5%)
        const userShare = (totalPoints > 0) ? (userPoint / totalPoints) * airdropAmount : 0; // Calculate user's share

        return res.json({ userPoints: userPoint, airdropAmount: userShare });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
