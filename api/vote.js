const trumpVotes = 0;
const kamalaVotes = 0;

export default (req, res) => {
    // Initialize votes
    if (req.method === 'POST') {
        const candidate = req.body.candidate;
        if (candidate === 'Trump') {
            trumpVotes++;
        } else if (candidate === 'Kamala') {
            kamalaVotes++;
        }
        return res.json({ trumpVotes, kamalaVotes });
    } else if (req.method === 'GET') {
        return res.json({ trumpVotes, kamalaVotes });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
