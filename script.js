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
                alert(data.error); // Show error message from the server
                return;
            }
            trumpVotes = data.trumpVotes;
            kamalaVotes = data.kamalaVotes;
            updateCounts();
            updateChart();
            disableVoting(); // Disable voting after a successful vote
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
});

let userWalletAddress = null;

async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            userWalletAddress = response.publicKey.toString();
            document.getElementById("wallet-status").textContent = `Connected: ${userWalletAddress}`;
            const connectButton = document.getElementById("connect-wallet"); // Update button ID as needed
            connectButton.classList.add('connected');
            connectButton.textContent = 'Wallet Connected'; // Change button text
            enableVoting(); // Enable voting when the wallet is connected
        } catch (err) {
            console.error("Wallet connection error:", err);
        }
    } else {
        alert("Please install Phantom Wallet to vote.");
    }
}

// Call connectWallet when user clicks "Connect Wallet" button
document.getElementById("connect-wallet").addEventListener("click", connectWallet);

// Function to enable voting buttons
function enableVoting() {
    trumpButton.disabled = false;
    kamalaButton.disabled = false;
}

let userWalletAddress = null;

// WebSocket or server endpoint for chat messages
const chatSocket = new WebSocket("wss://your-chat-server.com");

// Handle incoming chat messages
chatSocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const chatMessages = document.getElementById("chat-messages");
    const newMessage = document.createElement("p");
    newMessage.textContent = `${message.user}: ${message.text}`;
    chatMessages.appendChild(newMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
};

// Function to send a chat message
function sendMessage() {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();
    if (!userWalletAddress || message === "") {
        alert("Please connect your wallet and enter a message.");
        return;
    }

    // Send message through WebSocket
    chatSocket.send(JSON.stringify({ user: userWalletAddress, text: message }));
    chatInput.value = ""; // Clear the input
}

// Attach event listener to send button
document.getElementById("send-chat").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Wallet connection code
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            userWalletAddress = response.publicKey.toString();
            document.getElementById("wallet-status").textContent = `Connected: ${userWalletAddress}`;
            const connectButton = document.getElementById("connect-wallet");
            connectButton.classList.add('connected');
            connectButton.textContent = 'Wallet Connected';
        } catch (err) {
            console.error("Wallet connection error:", err);
        }
    } else {
        alert("Please install Phantom Wallet to vote.");
    }
}

// Call connectWallet when user clicks "Connect Wallet" button
document.getElementById("connect-wallet").addEventListener("click", connectWallet);

