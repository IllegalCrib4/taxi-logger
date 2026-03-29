const chernarusLocations = [
    "Altar", "Balota", "Belaya Polana", "Berezino", "Berezhki", "Black Mountain", "Bogatyrka", "Bor", 
    "Chernaya Polana", "Chernogorsk", "Devil's Castle", "Dobroe", "Dolina", "Drozhino", "Dubky", 
    "Dubrovka", "Elektrozavodsk", "Gorka", "Green Mountain", "Grishino", "Guglovo", "Gvozdno", 
    "Kabanino", "Kamenka", "Kamensk", "Kamyshovo", "Karmanovka", "Khelm", "Komarovo", "Kozlovka", 
    "Krasnoe", "Krasnostav", "Lopatino", "Mamino", "Mogilevka", "Msta", "Myshkino", "Nadezhdino", 
    "Nagornoe", "NEAF", "Nizhnoye", "Novaya Petrovka", "Novodmitrovsk", "Novoselky", "Novy Sobor", 
    "NWAF", "Olsha", "Orlovets", "Pavlovo", "Pogorevka", "Polana", "Polesovo", "Prigorodki", 
    "Prison Island", "Pulkovo", "Pusta", "Pustoshka", "Ratnoe", "Rogovo", "Samorodok", 
    "Severograd", "Shakhovka", "Sinistok", "Skalisty Island", "Smirnovo", "Solnichniy", "Sosnovka", 
    "Staroye", "Stary Sobor", "Stary Yar", "Svergino", "Svetlojarsk", "Tisy Military", "Topolniki", 
    "Troitskoe", "Tulga", "Turovo", "Vavilovo", "Vybor", "Vyshnaya Dubrovka", "Vyshnoye", 
    "Vysotovo", "Zabolotye", "Zaprudnoe", "Zelenogorsk", "Zvir"
];

// Data State
let suggestions = JSON.parse(localStorage.getItem('taxiSuggestions')) || { servers: [], locations: [], players: [] };
let savedAds = JSON.parse(localStorage.getItem('taxiSavedAds')) || [
    { name: "Standard Ad", content: "🚕 TAXI SERVICE AVAILABLE 🚕\nStatus: Active & Ready\nDM for pickups and safe travels! 🚕💨" }
];
let dispatchHistory = JSON.parse(localStorage.getItem('taxiDispatchHistory')) || [];
let tripLog = JSON.parse(localStorage.getItem('taxiTripLog')) || [];
let rideQueue = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSuggestions();
    updateStatsUI();
    updateAdsUI();
    updateHistoryUI();
    setupEventListeners();
});

function initTheme() {
    const savedTheme = localStorage.getItem('taxiTheme') || 'discord';
    setTheme(savedTheme);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = savedTheme;
}

function setTheme(theme) {
    document.body.classList.remove('theme-midnight', 'theme-forest', 'theme-ocean', 'theme-sunset');
    if (theme !== 'discord') {
        document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('taxiTheme', theme);
}

function setupEventListeners() {
    // Theme Selector
    document.getElementById('theme-select')?.addEventListener('change', (e) => setTheme(e.target.value));
    
    // Data Controls
    document.getElementById('export-btn')?.addEventListener('click', exportData);
    document.getElementById('import-btn')?.addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file')?.addEventListener('change', importData);

    // Dynamic Suggestions
    ['server', 'pickup', 'dropoff', 'players'].forEach(id => {
        const el = document.getElementById(id);
        const listId = id === 'server' ? 'server-list' : 
                       (id === 'players' ? 'player-list' : 'location-list');
        
        el?.addEventListener('input', () => {
            if (el.value.trim().length > 0) {
                el.setAttribute('list', listId);
            } else {
                el.removeAttribute('list');
            }
        });
    });

    // Form & Multi-Ride
    document.getElementById('taxi-form').addEventListener('submit', handleSingleRide);
    document.getElementById('add-ride-btn').addEventListener('click', addToQueue);
    document.getElementById('generate-all-btn').addEventListener('click', generateMultiDispatch);

    // Output Controls
    document.getElementById('copy-output-btn').addEventListener('click', (e) => copyToClipboard('output-box', e.target));
    document.getElementById('clear-output-btn').addEventListener('click', () => document.getElementById('output-box').value = '');
    
    // Discord Controls
    document.getElementById('copy-discord-btn').addEventListener('click', (e) => copyToClipboard('discord-input', e.target));
    document.getElementById('clear-discord-btn').addEventListener('click', () => document.getElementById('discord-input').value = '');

    // Global Actions
    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    document.getElementById('add-new-ad-btn').addEventListener('click', addNewAd);
    document.getElementById('reset-stats-btn')?.addEventListener('click', resetStats);
    
    // In-Game Ad Global Controls
    document.getElementById('copy-ingame-all-btn')?.addEventListener('click', copyAllInGameAds);
    document.getElementById('clear-ingame-all-btn')?.addEventListener('click', () => {
        if(confirm("Clear all templates?")) {
            savedAds = [];
            localStorage.setItem('taxiSavedAds', JSON.stringify(savedAds));
            updateAdsUI();
        }
    });
}

function copyAllInGameAds(e) {
    const allText = savedAds.map(ad => ad.content).join('\n\n');
    navigator.clipboard.writeText(allText).then(() => {
        showButtonFeedback(e.target, 'Copied All!');
    });
}

// --- CORE LOGIC ---

function handleSingleRide(e) {
    e.preventDefault();
    const data = getFormData();
    if (!validateData(data)) return;

    const output = formatRide(data);
    const wasAppend = updateOutput(output, true);
    saveTrip(document.getElementById('output-box').value, 1, wasAppend);
    saveSuggestions(data);
    
    // Feedback
    const btn = e.target.querySelector('button[type="submit"]');
    showButtonFeedback(btn, 'Trip Logged!');
}

function addToQueue() {
    const data = getFormData();
    if (!validateData(data)) return;

    rideQueue.push(data);
    updateQueueUI();
    saveSuggestions(data);
    clearInputs(['pickup', 'dropoff', 'players']);
}

function generateMultiDispatch() {
    if (rideQueue.length === 0) return;
    
    const output = rideQueue.map(formatRide).join('\n\n');
    
    const wasAppend = updateOutput(output, true);
    saveTrip(document.getElementById('output-box').value, rideQueue.length, wasAppend);
    
    rideQueue = [];
    updateQueueUI();
}

function formatRide(ride) {
    return `Server : ${ride.server}\nPickup : ${ride.pickup}\nDropoff : ${ride.dropoff}\nPlayer(s) : ${ride.players}`;
}

function updateOutput(text, append = false) {
    const outputBox = document.getElementById('output-box');
    
    const wasEmpty = !outputBox.value.trim();
    const willAppend = append && !wasEmpty;

    if (willAppend) {
        outputBox.value = outputBox.value.trim() + '\n\n' + text;
    } else {
        outputBox.value = text;
    }

    return willAppend;
}

// --- UI UPDATES ---

function updateQueueUI() {
    const container = document.getElementById('ride-list-container');
    const list = document.getElementById('ride-list');
    
    if (rideQueue.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    rideQueue.forEach((ride, index) => {
        const li = document.createElement('li');
        li.className = 'queue-item';
        li.innerHTML = `
            <span><strong>${ride.server}</strong>: ${ride.pickup} → ${ride.dropoff}</span>
            <button onclick="removeFromQueue(${index})">×</button>
        `;
        list.appendChild(li);
    });
}

window.removeFromQueue = (index) => {
    rideQueue.splice(index, 1);
    updateQueueUI();
};

function updateHistoryUI() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    if (dispatchHistory.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-label); padding:2rem;">No trips logged yet.</p>';
        return;
    }

    dispatchHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        // Format Timestamp range
        const startTime = new Date(item.tsStart || item.ts).toLocaleString();
        let timeDisplay = startTime;
        if (item.tsEnd && item.tsEnd !== (item.tsStart || item.ts)) {
            const endTime = new Date(item.tsEnd).toLocaleTimeString();
            timeDisplay = `${startTime} - ${endTime}`;
        }

        div.innerHTML = `
            <div class="meta">
                <span>${timeDisplay}</span>
                <button class="btn-text danger" onclick="deleteHistory(${index})">Delete</button>
            </div>
            <div class="history-content">${item.content}</div>
            <div class="action-bar" style="display:flex; gap:1rem;">
                <button class="btn btn-secondary btn-sm" style="flex:1" onclick="copyHistory(${index}, this)">Copy Trip</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateAdsUI() {
    const container = document.getElementById('ads-list');
    container.innerHTML = '';
    
    savedAds.forEach((ad, index) => {
        const div = document.createElement('div');
        div.className = 'ad-item';
        const charCount = (ad.content || "").length;
        div.innerHTML = `
            <div class="ad-header-row">
                <input type="text" value="${ad.name}" onchange="updateAd(${index}, 'name', this.value)" placeholder="Template Name">
                <button class="btn-text danger ad-delete-btn" onclick="deleteAd(${index})">×</button>
            </div>
            <div class="ad-item-content">
                <textarea maxlength="125" oninput="updateCharCount(this, ${index})" onchange="updateAd(${index}, 'content', this.value)">${ad.content}</textarea>
                <div class="ad-char-counter">Characters: <span>${charCount}</span> / 125</div>
            </div>
        `;
        container.appendChild(div);
    });
}

window.updateCharCount = (el, index) => {
    const counter = el.parentElement.querySelector('.ad-char-counter span');
    if (counter) {
        const count = el.value.length;
        counter.textContent = count;
        if (count >= 125) {
            counter.parentElement.classList.add('limit-reached');
        } else {
            counter.parentElement.classList.remove('limit-reached');
        }
    }
};

// --- PERSISTENCE ---

function saveTrip(content, count, isAppend = false) {
    const now = Date.now();

    if (isAppend && dispatchHistory.length > 0) {
        // Update the most recent entry instead of adding a new one
        dispatchHistory[0].content = content;
        dispatchHistory[0].tsEnd = now;
    } else {
        // Create a new entry
        dispatchHistory.unshift({ 
            content, 
            tsStart: now, 
            tsEnd: now 
        });
        if (dispatchHistory.length > 30) dispatchHistory.pop();
    }
    
    localStorage.setItem('taxiDispatchHistory', JSON.stringify(dispatchHistory));
    
    // Still log each event for stats
    tripLog.push({ ts: now, count });
    localStorage.setItem('taxiTripLog', JSON.stringify(tripLog));
    
    updateHistoryUI();
    updateStatsUI();
}

function updateStatsUI() {
    const now = Date.now();
    const dayMs = 86400000;
    const weekMs = dayMs * 7;
    const monthMs = dayMs * 30;

    const stats = {
        daily: tripLog.filter(l => now - l.ts < dayMs).reduce((a, b) => a + b.count, 0),
        weekly: tripLog.filter(l => now - l.ts < weekMs).reduce((a, b) => a + b.count, 0),
        monthly: tripLog.filter(l => now - l.ts < monthMs).reduce((a, b) => a + b.count, 0)
    };

    document.getElementById('stat-daily').textContent = stats.daily;
    document.getElementById('stat-weekly').textContent = stats.weekly;
    document.getElementById('stat-monthly').textContent = stats.monthly;
}

// --- UTILS ---

function getFormData() {
    return {
        server: document.getElementById('server').value.trim(),
        pickup: document.getElementById('pickup').value.trim(),
        dropoff: document.getElementById('dropoff').value.trim(),
        players: document.getElementById('players').value.trim()
    };
}

function validateData(data) {
    if (!data.server || !data.pickup || !data.dropoff || !data.players) {
        alert("Please fill in all fields.");
        return false;
    }
    return true;
}

function clearInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = '';
            el.removeAttribute('list');
        }
    });
}

function copyToClipboard(elementId, btn) {
    const el = document.getElementById(elementId);
    el.select();
    navigator.clipboard.writeText(el.value).then(() => {
        showButtonFeedback(btn, 'Copied!');
    });
}

function showButtonFeedback(btn, text) {
    const oldText = btn.textContent;
    btn.textContent = text;
    btn.classList.add('btn-accent');
    setTimeout(() => {
        btn.textContent = oldText;
        btn.classList.remove('btn-accent');
    }, 2000);
}

function initSuggestions() {
    chernarusLocations.forEach(loc => {
        if (!suggestions.locations.includes(loc)) suggestions.locations.push(loc);
    });
    suggestions.locations.sort();
    updateDatalists();
}

function saveSuggestions(data) {
    if (data.server && !suggestions.servers.includes(data.server)) suggestions.servers.push(data.server);
    if (data.pickup && !suggestions.locations.includes(data.pickup)) suggestions.locations.push(data.pickup);
    if (data.dropoff && !suggestions.locations.includes(data.dropoff)) suggestions.locations.push(data.dropoff);
    
    data.players.split(',').forEach(p => {
        const name = p.trim();
        if (name && !suggestions.players.includes(name)) suggestions.players.push(name);
    });
    
    localStorage.setItem('taxiSuggestions', JSON.stringify(suggestions));
    updateDatalists();
}

function updateDatalists() {
    const populate = (id, items) => {
        const dl = document.getElementById(id);
        if (!dl) return;
        dl.innerHTML = '';
        items.sort().forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            dl.appendChild(opt);
        });
    };
    populate('server-list', suggestions.servers);
    populate('location-list', suggestions.locations);
    populate('player-list', suggestions.players);
}

// Global actions for onclick
window.deleteHistory = (index) => {
    dispatchHistory.splice(index, 1);
    localStorage.setItem('taxiDispatchHistory', JSON.stringify(dispatchHistory));
    updateHistoryUI();
};

window.copyHistory = (index, btn) => {
    navigator.clipboard.writeText(dispatchHistory[index].content).then(() => {
        showButtonFeedback(btn, 'Copied!');
    });
};

window.updateAd = (index, key, val) => {
    savedAds[index][key] = val;
    localStorage.setItem('taxiSavedAds', JSON.stringify(savedAds));
};

window.copyAd = (index, btn) => {
    navigator.clipboard.writeText(savedAds[index].content).then(() => {
        showButtonFeedback(btn, 'Copied!');
    });
};

window.deleteAd = (index) => {
    if (confirm('Delete this template?')) {
        savedAds.splice(index, 1);
        localStorage.setItem('taxiSavedAds', JSON.stringify(savedAds));
        updateAdsUI();
    }
};

function addNewAd() {
    savedAds.push({ name: 'New Template', content: '' });
    updateAdsUI();
}

function exportData() {
    const data = {
        suggestions,
        savedAds,
        dispatchHistory,
        tripLog,
        theme: localStorage.getItem('taxiTheme') || 'discord'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxi-logger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (confirm("This will overwrite your current data. Continue?")) {
                if (data.suggestions) {
                    suggestions = data.suggestions;
                    localStorage.setItem('taxiSuggestions', JSON.stringify(suggestions));
                }
                if (data.savedAds) {
                    savedAds = data.savedAds;
                    localStorage.setItem('taxiSavedAds', JSON.stringify(savedAds));
                }
                if (data.dispatchHistory) {
                    dispatchHistory = data.dispatchHistory;
                    localStorage.setItem('taxiDispatchHistory', JSON.stringify(dispatchHistory));
                }
                if (data.tripLog) {
                    tripLog = data.tripLog;
                    localStorage.setItem('taxiTripLog', JSON.stringify(tripLog));
                }
                if (data.theme) {
                    setTheme(data.theme);
                    const themeSelect = document.getElementById('theme-select');
                    if (themeSelect) themeSelect.value = data.theme;
                }

                // Refresh UI
                updateDatalists();
                updateAdsUI();
                updateHistoryUI();
                updateStatsUI();
                alert("Data imported successfully!");
            }
        } catch (err) {
            alert("Error importing data. Please check the file format.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
}

function clearHistory() {
    if (confirm('Clear all history records?')) {
        dispatchHistory = [];
        localStorage.setItem('taxiDispatchHistory', JSON.stringify(dispatchHistory));
        updateHistoryUI();
    }
}

function resetStats() {
    if (confirm('Reset all trip statistics?')) {
        tripLog = [];
        localStorage.setItem('taxiTripLog', JSON.stringify(tripLog));
        updateStatsUI();
    }
}

// Discord Toolbar Helpers
window.formatDiscord = (type) => {
    const input = document.getElementById('discord-input');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const selected = text.substring(start, end);
    let formatted = selected;

    if (type === 'bold') formatted = `**${selected}**`;
    if (type === 'italic') formatted = `*${selected}*`;
    if (type === 'underline') formatted = `__${selected}__`;

    input.value = text.substring(0, start) + formatted + text.substring(end);
    input.focus();
    input.setSelectionRange(start + formatted.length, start + formatted.length);
};

window.addEmoji = (emoji) => {
    const input = document.getElementById('discord-input');
    const start = input.selectionStart;
    const text = input.value;
    input.value = text.substring(0, start) + emoji + text.substring(start);
    input.focus();
    input.setSelectionRange(start + emoji.length, start + emoji.length);
};