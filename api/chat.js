let messages = []; // Store chat messages in memory

export default (req, res) => {
    if (req.method === 'POST') {
        const { user, text } = req.body;

        // Validate the message
        if (!user || !text) {
            return res.status(400).json({ error: 'User and message text are required.' });
        }

        // Add the new message to the array
        messages.push({ user, text });
        return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
        return res.status(200).json(messages); // Return all messages
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
