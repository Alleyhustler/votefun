document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const usaButton = document.getElementById('vote-trump');
    const chinaButton = document.getElementById('vote-kamala');
    const usaCount = document.getElementById('trump-count');
    const chinaCount = document.getElementById('kamala-count');
    const resultUSA = document.getElementById('result-trump');
    const resultChina = document.getElementById('result-kamala');
    const connectButton = document.getElementById("connect-wallet");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendChatButton = document.getElementById("send-chat");

    // Variables
    let usaVotes = 0, chinaVotes = 0;
    let userWalletAddress = null;

    // Initialize Chart
    const voteChart = new Chart(document.getElementById('vote-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['USA', 'CHINA'],
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
            usaVotes = data.usaVotes;
            chinaVotes = data.chinaVotes;
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
        usaButton.disabled = false;
        chinaButton.disabled = false;
    }

    function disableVoting() {
        usaButton.disabled = true;
        chinaButton.disabled = true;
    }

    function updateCounts() {
        usaCount.textContent = usaVotes;
        chinaCount.textContent = chinaVotes;
        resultUSA.textContent = usaVotes;
        resultChina.textContent = chinaVotes;
    }

    function updateChart() {
        voteChart.data.datasets[0].data = [usaVotes, chinaVotes];
        voteChart.update();
    }

    // Fetch live results every 3 seconds
    function fetchResults() {
        fetch('/api/vote')
            .then(response => response.json())
            .then(data => {
                usaVotes = data.usaVotes;
                chinaVotes = data.chinaVotes;
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
            alert("Please connect your wallet and enter a message.");
            return;
        }

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userWalletAddress, text: message })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to send message');
            chatInput.value = "";
            fetchMessages();
        })
        .catch(error => console.error('Error sending message:', error));
    }

    function fetchMessages() {
        fetch('/api/chat')
            .then(response => response.json())
            .then(data => {
                const wasScrolledToBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 1;
                chatMessages.innerHTML = "";
                data.forEach(message => {
                    const newMessage = document.createElement("p");
                    const shortWallet = message.user.slice(0, 4);
                    newMessage.textContent = `${shortWallet}: ${message.text}`;
                    newMessage.style.color = getColor(message.user);
                    chatMessages.appendChild(newMessage);
                });

                if (wasScrolledToBottom) chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => console.error('Error fetching messages:', error));
    }

    function getColor(walletAddress) {
        const hash = Array.from(walletAddress).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Event Listeners
    connectButton.addEventListener("click", connectWallet);
    usaButton.addEventListener('click', () => vote('USA'));
    chinaButton.addEventListener('click', () => vote('CHINA'));
    sendChatButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    setInterval(fetchMessages, 3000);
});