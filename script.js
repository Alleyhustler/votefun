document.addEventListener('DOMContentLoaded', () => {
    const trumpButton = document.getElementById('vote-trump');
    const kamalaButton = document.getElementById('vote-kamala');
    const trumpCount = document.getElementById('trump-count');
    const kamalaCount = document.getElementById('kamala-count');
    const resultTrump = document.getElementById('result-trump');
    const resultKamala = document.getElementById('result-kamala');
    const connectButton = document.getElementById("connect-wallet");

    let trumpVotes = 0;
    let kamalaVotes = 0;
    let userWalletAddress = null;

    // Setup chart
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

    // Event listeners for voting
    trumpButton.addEventListener('click', () => vote('Trump'));
    kamalaButton.addEventListener('click', () => vote('Kamala'));

    // Voting function
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
                return;
            }
            trumpVotes = data.trumpVotes;
            kamalaVotes = data.kamalaVotes;
            updateCounts();
            updateChart();
            disableVoting();
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
                trumpVotes = data.trumpVotes;
                kamalaVotes = data.kamalaVotes;
                updateCounts();
                updateChart();
            })
            .catch(error => console.error('Error fetching live updates:', error));
    }
    
    // Poll every 3 seconds for updates
    setInterval(fetchResults, 3000);

    // Wallet connection function
    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWalletAddress = response.publicKey.toString();
                document.getElementById("wallet-status").textContent = `Connected: ${userWalletAddress}`;
                connectButton.classList.add('connected');
                connectButton.textContent = 'Wallet Connected';
                enableVoting(); // Enable voting when the wallet is connected
            } catch (err) {
                console.error("Wallet connection error:", err);
            }
        } else {
            alert("Please install Phantom Wallet to vote.");
        }
    }

    // Event listener for the "Connect Wallet" button
    connectButton.addEventListener("click", connectWallet);

    // Enable voting buttons
    function enableVoting() {
        trumpButton.disabled = false;
        kamalaButton.disabled = false;
    }

    // WebSocket for chat
    const chatSocket = new WebSocket("wss://your-chat-server.com");
    chatSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const chatMessages = document.getElementById("chat-messages");
        const newMessage = document.createElement("p");
        newMessage.textContent = `${message.user}: ${message.text}`;
        chatMessages.appendChild(newMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    function sendMessage() {
        const chatInput = document.getElementById("chat-input");
        const message = chatInput.value.trim();
        if (!userWalletAddress || message === "") {
            alert("Please connect your wallet and enter a message.");
            return;
        }
        chatSocket.send(JSON.stringify({ user: userWalletAddress, text: message }));
        chatInput.value = "";
    }

    document.getElementById("send-chat").addEventListener("click", sendMessage);
    document.getElementById("chat-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
