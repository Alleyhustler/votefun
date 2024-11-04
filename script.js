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
                data: [1, 1],
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
                            return ${label}: ${count};
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

    fetchResults();

    function fetchResults() {
        fetch('/api/results')
            .then(response => response.json())
            .then(data => {
                trumpVotes = data.trumpVotes;
                kamalaVotes = data.kamalaVotes;
                updateCounts();
                updateChart();
            })
            .catch(error => console.error('Error:', error));
    }
});

api folder  vote.js

// vote.js in the /api folder
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
        res.status(405).end(Method ${req.method} Not Allowed);
    }
};