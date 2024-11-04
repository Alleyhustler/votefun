document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const trumpButton = document.getElementById('vote-trump');
    const kamalaButton = document.getElementById('vote-kamala');
    const trumpCount = document.getElementById('trump-count');
    const kamalaCount = document.getElementById('kamala-count');
    const resultTrump = document.getElementById('result-trump');
    const resultKamala = document.getElementById('result-kamala');
    const connectButton = document.getElementById("connect-wallet");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendChatButton = document.getElementById("send-chat");

    // Variables
    let trumpVotes = 0, kamalaVotes = 0;
    let userWalletAddress = null;

    // Initialize Chart
    const voteChart = new Chart(document.getElementById('vote-chart').getContext('2d'), {
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
                        label: (tooltipItem) => `${tooltipItem.label || ''}: ${tooltipItem.raw}`
                    }
                }
            }
        }
    });

    // Voting and Wallet Connection
    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWalletAddress = response.publicKey.toString();
                document.getElementById("wallet-status").textContent = `Connected: ${userWalletAddress}`;
                connectButton.classList.add('connected');
                connectButton.textContent = 'Wallet Connected';
                enableVoting();
            } catch (err) {
                console.error("Wallet connection error:", err);
            }
        } else {
            alert("Please install Phantom Wallet to vote.");
        }
    }

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
            showVoteConfirmation(candidate);
        })
        .catch(error => console.error('Error:', error));
    }

    function showVoteConfirmation(candidate) {
        const confirmationMessage = document.createElement("div");
        confirmationMessage.textContent = `You voted for ${candidate}!`;
        confirmationMessage.classList.add("vote-confirmation");
        document.body.appendChild(confirmationMessage);
        setTimeout(() => confirmationMessage.remove(), 3000);
    }

    function enableVoting() {
        trumpButton.disabled = false;
        kamalaButton.disabled = false;
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
        voteChart.data.datasets[0].data = [trumpVotes, kamalaVotes];
        voteChart.update();
    }

    // Fetch live results every 3 seconds
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

    setInterval(fetchResults, 3000);

    // Chat Functions
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!userWalletAddress || !message) {
            return alert("Please connect your wallet and enter a message.");
        }

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userWalletAddress, text: message })
        })
        .then(response => response.ok ? chatInput.value = "" : Promise.reject('Failed to send message'))
        .then(fetchMessages)
        .catch(console.error);
    }

    function fetchMessages() {
        fetch('/api/chat')
            .then(response => response.json())
            .then(data => {
                const wasScrolledToBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 1;
                chatMessages.innerHTML = ""; // Clear current messages
    
                data.forEach(({ user, text, timestamp }) => {
                    const newMessage = document.createElement("p");
                    const shortWallet = user.slice(0, 4);
                    const date = new Date(timestamp);
                    const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                    newMessage.textContent = `[${formattedTime}] ${shortWallet}: ${text}`;
                    chatMessages.appendChild(newMessage);
                });

                if (wasScrolledToBottom) chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(console.error);
    }    

    // Event Listeners
    connectButton.addEventListener("click", connectWallet);
    trumpButton.addEventListener('click', () => vote('Trump'));
    kamalaButton.addEventListener('click', () => vote('Kamala'));
    sendChatButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

    setInterval(fetchMessages, 3000);
    setInterval(fetchResults, 3000);
});