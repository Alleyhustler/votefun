document.addEventListener('DOMContentLoaded', () => {
    const trumpButton = document.getElementById('vote-trump');
    const kamalaButton = document.getElementById('vote-kamala');
    const trumpCount = document.getElementById('trump-count');
    const kamalaCount = document.getElementById('kamala-count');
    const resultTrump = document.getElementById('result-trump');
    const resultKamala = document.getElementById('result-kamala');

    let trumpVotes = 0;
    let kamalaVotes = 0;

    const voteChartCtx = document.getElementById('vote-chart').getContext('2d');
    const voteChart = new Chart(voteChartCtx, {
        type: 'pie',
        data: {
            labels: ['Trump', 'Kamala'],
            datasets: [{
                data: [0, 0], // Start with zero votes
                backgroundColor: ['#ff4757', '#74b9ff'],
                hoverOffset: 4
            }]
        },
        options: {
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

    // Event listeners for voting
    trumpButton.addEventListener('click', () => vote('Trump'));
    kamalaButton.addEventListener('click', () => vote('Kamala'));

    function vote(candidate) {
        fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate })
        })
        .then(response => response.json())
        .then(data => {
            trumpVotes = data.trumpVotes;
            kamalaVotes = data.kamalaVotes;
            updateCounts();
            updateChart();
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCounts() {
        trumpCount.textContent = trumpVotes;
        kamalaCount.textContent = kamalaVotes;
        resultTrump.textContent = trumpVotes;
        resultKamala.textContent = kamalaVotes;
    }

    function updateChart() {
        voteChart.data.datasets[0].data[0] = trumpVotes;
        voteChart.data.datasets[0].data[1] = kamalaVotes;
        voteChart.update();
    }

    function fetchResults() {
        fetch('/api/results')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                trumpVotes = data.trumpVotes;
                kamalaVotes = data.kamalaVotes;
                updateCounts();
                updateChart();
            })
            .catch(error => console.error('Error:', error));
    }

    // Call fetchResults every 5 seconds (5000 milliseconds)
    setInterval(fetchResults, 5000);

    // Initial fetch to load results on page load
    fetchResults();
});

import React, { useEffect, useState } from 'react';

const VotingComponent = () => {
    const [votes, setVotes] = useState(0);

    const fetchVotes = async () => {
        try {
            const response = await fetch('/api/getVotes'); // Replace with your actual API endpoint
            const data = await response.json();
            setVotes(data.votes); // Adjust based on your API response structure
        } catch (error) {
            console.error('Error fetching votes:', error);
        }
    };

    useEffect(() => {
        fetchVotes(); // Fetch votes initially

        const interval = setInterval(fetchVotes, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Clean up on component unmount
    }, []);

    const handleVote = async () => {
        // Your voting logic here
        await fetch('/api/vote', { method: 'POST' }); // Replace with your voting API call
        fetchVotes(); // Fetch updated votes after voting
    };

    return (
        <div>
            <h1>Votes: {votes}</h1>
            <button onClick={handleVote}>Vote</button>
        </div>
    );
};

export default VotingComponent;
