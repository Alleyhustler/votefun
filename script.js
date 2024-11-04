document.addEventListener('DOMContentLoaded', () => {
    const trumpButton = document.getElementById('vote-trump');
    const kamalaButton = document.getElementById('vote-kamala');
    const trumpCount = document.getElementById('trump-count');
    const kamalaCount = document.getElementById('kamala-count');
    const resultTrump = document.getElementById('result-trump');
    const resultKamala = document.getElementById('result-kamala');

    let trumpVotes = 0;
    let kamalaVotes = 0;
    let lastTrumpVotes = 0;
    let lastKamalaVotes = 0;

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
                            return `${label}: ${count}`;
                        }
                    }
                }
            }
        }
    });

    let userWalletAddress = null;

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWalletAddress = response.publicKey.toString();
                document.getElementById("wallet-status").textContent = `Connected: ${userWalletAddress}`;
                trumpButton.disabled = false; // Enable voting button
                kamalaButton.disabled = false; // Enable voting button
            } catch (err) {
                console.error("Wallet connection error:", err);
            }
        } else {
            alert("Please install Phantom Wallet to vote.");
        }
    }

    // Call connectWallet when user clicks "Connect Wallet" button
    document.getElementById("connect-wallet-button").addEventListener("click", connectWallet);

    // Event listeners for voting
    trumpButton.addEventListener('click', () => vote('Trump'));
    kamalaButton.addEventListener('click', () => vote('Kamala'));

    function vote(candidate) {
        if (!userWalletAddress) {
            alert("Please connect your wallet first.");
            return;
        }

        fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate, walletAddress: userWalletAddress })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                trumpVotes = data.trumpVotes;
                kamalaVotes = data.kamalaVotes;
                updateCounts();
                updateChart();
                disableVoting();
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    function disableVoting() {
        trumpButton.disabled = true;
        kamalaButton.disabled = true;
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
        fetch('/api/vote')
            .then(response => response.json())
            .then(data => {
                // Update the vote counts regardless to keep the chart rendering
                trumpVotes = data.trumpVotes;
                kamalaVotes = data.kamalaVotes;
                
                updateCounts();
                updateChart();

                // Update the last known vote counts
                lastTrumpVotes = trumpVotes;
                lastKamalaVotes = kamalaVotes;
            })
            .catch(error => console.error('Error fetching live updates:', error));
    }
    
    // Poll every 3 seconds for updates
    setInterval(fetchResults, 3000);
});
