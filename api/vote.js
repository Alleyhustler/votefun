// vote.js in the /api folders
let trumpVotes = 0;
let kamalaVotes = 0;

export default (req, res) => {
    if (req.method === 'POST') {
        const { candidate } = req.body;
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
