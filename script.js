import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js for your charting needs

const VotingComponent = () => {
    const [trumpVotes, setTrumpVotes] = useState(0);
    const [kamalaVotes, setKamalaVotes] = useState(0);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const response = await fetch('/api/results'); // Adjust to your API
                const data = await response.json();
                setTrumpVotes(data.trumpVotes);
                setKamalaVotes(data.kamalaVotes);
            } catch (error) {
                console.error('Error fetching votes:', error);
            }
        };

        // Fetch votes initially
        fetchVotes();

        // Poll for updates every 5 seconds
        const interval = setInterval(fetchVotes, 5000);
        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    const handleVote = async (candidate) => {
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate })
            });
            const data = await response.json();
            setTrumpVotes(data.trumpVotes);
            setKamalaVotes(data.kamalaVotes);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Initialize your chart here (Chart.js) if necessary
    // You can use the trumpVotes and kamalaVotes states for your chart data.

    return (
        <div>
            <h1>Votes</h1>
            <h2>Trump: {trumpVotes}</h2>
            <h2>Kamala: {kamalaVotes}</h2>
            <button onClick={() => handleVote('Trump')}>Vote for Trump</button>
            <button onClick={() => handleVote('Kamala')}>Vote for Kamala</button>
            {/* Add your chart component here */}
        </div>
    );
};

export default VotingComponent;
