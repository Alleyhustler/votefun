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
    const walletStatus = document.getElementById("wallet-status");

    // Variables
    let usaVotes = 2; // Preload 2 votes for USA
    let chinaVotes = 1; // Preload 1 vote for China
    let userWalletAddress = null;
    let hasVoted = false;
    
    // Preloaded chat messages
    const preloadedMessages = [
        { user: "WaLLE34f", text: "this real?" },
        { user: "PhaNt0m", text: "LMFAOOOO" },
        { user: "W3b3r", text: "test" }
    ];
    
    let allMessages = [...preloadedMessages];

    // Initialize Chart
    const voteChart = new Chart(document.getElementById('vote-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['USA', 'CHINA'],
            datasets: [{
                data: [usaVotes, chinaVotes], // Preloaded vote counts
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

    // Check if Phantom wallet is installed
    async function checkPhantom() {
        if (window.solana && window.solana.isPhantom) {
            return window.solana;
        }
        
        if (window.solana) {
            return window.solana;
        }
        
        window.open('https://phantom.app/', '_blank');
        throw new Error("Phantom wallet not found. Please install it first.");
    }

    // Connect to Phantom wallet
    async function connectWallet() {
        try {
            const provider = await checkPhantom();
            
            // Connect to wallet
            const response = await provider.connect();
            userWalletAddress = response.publicKey.toString();
            
            // Update UI
            walletStatus.textContent = `Connected: ${userWalletAddress.substring(0, 6)}...`;
            connectButton.classList.add('connected');
            connectButton.textContent = 'Wallet Connected';
            enableVoting();
            
            console.log("Wallet connected:", userWalletAddress);
            
            // Add connection message to chat
            addMessage(userWalletAddress.substring(0, 6), "just connected to vote!");
            
        } catch (error) {
            console.error("Wallet connection error:", error);
            walletStatus.textContent = "Connection failed";
            alert(`Error connecting wallet: ${error.message}`);
        }
    }

    async function vote(candidate) {
        if (!userWalletAddress) {
            alert("Please connect your wallet first.");
            return;
        }
        
        if (hasVoted) {
            alert("You can only vote once.");
            return;
        }
        
        try {
            // Show loading state
            if (candidate === 'USA') usaButton.textContent = "Processing...";
            else if (candidate === 'CHINA') chinaButton.textContent = "Processing...";
            
            // In a real app, you would send a transaction here
            // For demo purposes, we'll simulate a transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update vote counts
            if (candidate === 'USA') usaVotes++;
            else if (candidate === 'CHINA') chinaVotes++;
            
            hasVoted = true;
            updateCounts();
            updateChart();
            disableVoting();
            showVoteConfirmation(candidate);
            
            // Add a chat message about the vote
            const randomMessage = candidate === 'USA' ? 
                "Just voted for USA!" : 
                "CHINA has my vote!";
            addMessage(userWalletAddress.substring(0, 6), randomMessage);
            
        } catch (error) {
            console.error("Voting error:", error);
            alert(`Voting failed: ${error.message}`);
        } finally {
            // Reset button text
            if (candidate === 'USA') usaButton.textContent = "Vote USA";
            else if (candidate === 'CHINA') chinaButton.textContent = "Vote CHINA";
        }
    }

    function showVoteConfirmation(candidate) {
        const confirmationMessage = document.createElement("div");
        confirmationMessage.textContent = `You voted for ${candidate}!`;
        confirmationMessage.classList.add("vote-confirmation");
        document.body.appendChild(confirmationMessage);
        setTimeout(() => confirmationMessage.remove(), 3000);
    }

    function enableVoting() {
        if(usaButton) usaButton.disabled = false;
        if(chinaButton) chinaButton.disabled = false;
    }

    function disableVoting() {
        if(usaButton) usaButton.disabled = true;
        if(chinaButton) chinaButton.disabled = true;
    }

    function updateCounts() {
        if(usaCount) usaCount.textContent = usaVotes;
        if(chinaCount) chinaCount.textContent = chinaVotes;
        if(resultUSA) resultUSA.textContent = usaVotes;
        if(resultChina) resultChina.textContent = chinaVotes;
    }

    function updateChart() {
        voteChart.data.datasets[0].data = [usaVotes, chinaVotes];
        voteChart.update();
    }

    // Add a user message to the chat
    function addMessage(user, text) {
        const newMessage = { user, text };
        allMessages.push(newMessage);
        displayMessages();
    }
    
    // Display all messages in the chat container
    function displayMessages() {
        chatMessages.innerHTML = "";
        allMessages.forEach(message => {
            const newMessage = document.createElement("p");
            newMessage.textContent = `${message.user}: ${message.text}`;
            newMessage.style.color = getColor(message.user);
            chatMessages.appendChild(newMessage);
        });
        
        // Auto-scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Generate a color based on user ID
    function getColor(walletAddress) {
        const hash = Array.from(walletAddress).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Send a chat message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!userWalletAddress || !message) {
            alert("Please connect your wallet and enter a message.");
            return;
        }

        addMessage(userWalletAddress.substring(0, 6), message);
        chatInput.value = "";
        
        // Simulate other users responding after a delay
        setTimeout(simulateRandomResponse, Math.random() * 5000 + 2000);
    }
    
    // Simulate random responses from other "users"
    function simulateRandomResponse() {
        const randomUsers = ["SolFan21", "VoteBro", "DeFiGuy", "CryptoKing", "ChainMaster"];
        const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
        
        const randomResponses = [
            "interesting perspective!",
            "who's winning now?",
            "just joined the vote",
            "looking forward to results",
            "this is exciting",
            "airdrop when?",
            "nice project",
            "hoping for the best outcome"
        ];
        
        const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        addMessage(randomUser, randomResponse);
    }

    // Event Listeners
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }

    if (usaButton) {
        usaButton.addEventListener('click', function() {
            vote('USA');
        });
    }

    if (chinaButton) {
        chinaButton.addEventListener('click', function() {
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

    // Initial updates
    updateCounts();
    displayMessages();
    
    // Simulate a new message every 15-30 seconds
    setInterval(() => {
        if (Math.random() > 0.6) { // 40% chance of a new message
            simulateRandomResponse();
        }
    }, Math.random() * 15000 + 15000);
    
    console.log("Script initialization complete with preloaded votes and chat messages");
});