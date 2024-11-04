import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto'; // Make sure to import Chart.js correctly

const VotingComponent = () => {
    const [trumpVotes, setTrumpVotes] = useState(0);
    const [kamalaVotes, setKamalaVotes] = useState(0);
    const [voteChart, setVoteChart] = useState(null); // State to hold chart instance

    useEffect(() => {
        // Initialize Chart.js when the component mounts
        const ctx = document.getElementById('vote-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Trump', 'Kamala'],
                datasets: [{
                    data: [trumpVotes, kamalaVotes],
                    backgroundColor: ['#ff4757', '#74b9ff'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const label = tooltipItem.label || '';
                                const count = tooltipItem.raw;
                                return `${label}: ${count}`;
                            }
                        }
                    }
                }
            }
        });

        // Save the chart instance in state
        setVoteChart(chart);

        // Clean up chart instance on unmount
        return () => {
            chart.destroy();
        };
    }, []); // Only run on mount

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const response = await fetch('/api/results'); // Replace with your API endpoint
                const data = await response.json();
                setTrumpVotes(data.trumpVotes);
                setKamalaVotes(data.kamalaVotes);
            } catch (error) {
                console.error('Error fetching votes:', error);
            }
        };

        fetchVotes(); // Initial fetch

        const interval = setInterval(fetchVotes, 5000); // Poll every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
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

            // Update chart data after voting
            if (voteChart) {
                voteChart.data.datasets[0].data[0] = data.trumpVotes; // Update Trump votes
                voteChart.data.datasets[0].data[1] = data.kamalaVotes; // Update Kamala votes
                voteChart.update(); // Refresh the chart
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    return (
        <div>
            <h1>Votes</h1>
            <h2>Trump: {trumpVotes}</h2>
            <h2>Kamala: {kamalaVotes}</h2>
            <button onClick={() => handleVote('Trump')}>Vote for Trump</button>
            <button onClick={() => handleVote('Kamala')}>Vote for Kamala</button>
            <canvas id="vote-chart" width="400" height="400"></canvas> {/* Make sure this canvas exists */}
        </div>
    );
};

export default VotingComponent;
