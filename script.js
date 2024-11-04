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

    // Chat functionality
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendChatButton = document.getElementById("send-chat");

    // Function to generate a color based on wallet address
    function getColor(walletAddress) {
        const hash = Array.from(walletAddress).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!userWalletAddress || message === "") {
            alert("Please connect your wallet and enter a message.");
            return;
        }

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userWalletAddress, text: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            chatInput.value = ""; // Clear the input
            fetchMessages(); // Fetch updated messages
        })
        .catch(error => console.error('Error sending message:', error));
    }

    function fetchMessages() {
        fetch('/api/chat')
            .then(response => response.json())
            .then(data => {
                const wasScrolledToBottom = chatMessages.scrollTop + chatMessages.clientHeight === chatMessages.scrollHeight;
                chatMessages.innerHTML = ""; // Clear current messages
    
                data.forEach(message => {
                    const newMessage = document.createElement("p");
                    const shortWallet = message.user.slice(0, 4);
                    
                    // Format timestamp for display
                    const date = new Date(message.timestamp);
                    const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                    
                    newMessage.textContent = `[${formattedTime}] ${shortWallet}: ${message.text}`;
                    newMessage.style.color = getColor(message.user);
                    chatMessages.appendChild(newMessage);
                });
    
                if (wasScrolledToBottom) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
    

    // In the POST /api/chat endpoint, add a timestamp to each message
    const messages = [];

    app.post('/api/chat', (req, res) => {
        const { user, text } = req.body;
        const timestamp = new Date().toISOString(); // Add a timestamp in ISO format
        messages.push({ user, text, timestamp });
        res.status(200).send();
    });

    app.get('/api/chat', (req, res) => {
        res.json(messages); // Send all messages, each with a timestamp
    });

    
    // Poll every 3 seconds for chat updates
    setInterval(fetchMessages, 3000);

    sendChatButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});

// Display confirmation message
function showVoteConfirmation(candidate) {
    const confirmationMessage = document.createElement("div");
    confirmationMessage.textContent = `You voted for ${candidate}!`;
    confirmationMessage.classList.add("vote-confirmation");
    document.body.appendChild(confirmationMessage);
    
    // Remove the message after 3 seconds
    setTimeout(() => confirmationMessage.remove(), 3000);
}

// Update the vote function to show the confirmation message
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
        showVoteConfirmation(candidate); // Show the confirmation after a successful vote
    })
    .catch(error => console.error('Error:', error));
}
