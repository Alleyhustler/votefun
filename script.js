document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - making sure we're using the correct IDs from the HTML
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
    const walletStatus = document.getElementById("wallet-status");

    // Variables
    let usaVotes = 0, chinaVotes = 0;
    let userWalletAddress = null;

    // Debug log to verify elements are found
    console.log("USA Button:", usaButton);
    console.log("China Button:", chinaButton);

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

    // Mock wallet connection for testing if Phantom isn't available
    async function connectWallet() {
        // First check if Phantom is available
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect();
                userWalletAddress = response.publicKey.toString();
                walletStatus.textContent = `Connected: ${userWalletAddress.substring(0, 6)}...`;
                connectButton.classList.add('connected');
                connectButton.textContent = 'Wallet Connected';
                enableVoting();
                console.log("Wallet connected:", userWalletAddress);
            } catch (err) {
                console.error("Wallet connection error:", err);
                // Fallback to mock wallet for testing
                mockWalletConnection();
            }
        } else {
            console.log("Phantom wallet not detected, using mock wallet");
            mockWalletConnection();
        }
    }

    // Mock wallet connection for testing
    function mockWalletConnection() {
        userWalletAddress = "MOCK" + Math.random().toString(36).substring(2, 10);
        walletStatus.textContent = `Test mode: ${userWalletAddress.substring(0, 10)}...`;
        connectButton.classList.add('connected');
        connectButton.textContent = 'Test Wallet Connected';
        enableVoting();
        console.log("Mock wallet connected:", userWalletAddress);
    }

    function vote(candidate) {
        console.log("Vote function called for:", candidate);
        if (!userWalletAddress) {
            alert("Please connect your wallet first.");
            return;
        }

        // First, try the API endpoint
        console.log("Attempting to vote for", candidate, "with wallet", userWalletAddress);
        
        fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate, walletAddress: userWalletAddress })
        })
        .then(response => {
            console.log("Vote response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Vote response data:", data);
            if (data.error) {
                alert(data.error);
                return;
            }
            // Update with the returned vote counts
            usaVotes = data.usaVotes || usaVotes;
            chinaVotes = data.chinaVotes || chinaVotes;
            updateCounts();
            updateChart();
            disableVoting();
            showVoteConfirmation(candidate);
        })
        .catch(error => {
            console.error('Error with API vote:', error);
            // Fallback: Just increment locally for testing
            if (candidate === 'USA') usaVotes++;
            else if (candidate === 'CHINA') chinaVotes++;
            updateCounts();
            updateChart();
            disableVoting();
            showVoteConfirmation(candidate);
        });
    }

    function showVoteConfirmation(candidate) {
        const confirmationMessage = document.createElement("div");
        confirmationMessage.textContent = `You voted for ${candidate}!`;
        confirmationMessage.classList.add("vote-confirmation");
        document.body.appendChild(confirmationMessage);
        setTimeout(() => confirmationMessage.remove(), 3000);
    }

    function enableVoting() {
        console.log("Enabling voting buttons");
        if(usaButton) usaButton.disabled = false;
        if(chinaButton) chinaButton.disabled = false;
    }

    function disableVoting() {
        console.log("Disabling voting buttons");
        if(usaButton) usaButton.disabled = true;
        if(chinaButton) chinaButton.disabled = true;
    }

    function updateCounts() {
        console.log("Updating counts - USA:", usaVotes, "CHINA:", chinaVotes);
        if(usaCount) usaCount.textContent = usaVotes;
        if(chinaCount) chinaCount.textContent = chinaVotes;
        if(resultUSA) resultUSA.textContent = usaVotes;
        if(resultChina) resultChina.textContent = chinaVotes;
    }

    function updateChart() {
        console.log("Updating chart with data:", [usaVotes, chinaVotes]);
        voteChart.data.datasets[0].data = [usaVotes, chinaVotes];
        voteChart.update();
    }

    // Fetch live results 
    function fetchResults() {
        fetch('/api/vote')
            .then(response => response.json())
            .then(data => {
                console.log("Fetched results:", data);
                usaVotes = data.usaVotes || usaVotes;
                chinaVotes = data.chinaVotes || chinaVotes;
                updateCounts();
                updateChart();
            })
            .catch(error => console.error('Error fetching results:', error));
    }

    // Initial fetch of results
    fetchResults();
    // Set interval for updating results
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

    // Event Listeners with debug logs
    if (connectButton) {
        console.log("Adding event listener to connect button");
        connectButton.addEventListener("click", connectWallet);
    }

    if (usaButton) {
        console.log("Adding USA vote event listener");
        usaButton.addEventListener('click', function() {
            console.log("USA button clicked");
            vote('USA');
        });
    }

    if (chinaButton) {
        console.log("Adding CHINA vote event listener");
        chinaButton.addEventListener('click', function() {
            console.log("CHINA button clicked");
            vote('CHINA');
        });
    }

    if (sendChatButton) {
        sendChatButton.addEventListener("click", sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

    // Fetch messages periodically
    setInterval(fetchMessages, 3000);
    
    console.log("Script initialization complete");
});