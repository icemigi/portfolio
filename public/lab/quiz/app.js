const gameState = {
    username: '',
    mode: 'daily',
    correct: 0,
    score: 0,
    streak: 0,
    multiplier: 1,
    lives: 3,
    maxLives: 3,
    tier: 1,
    questionCount: 0,
    maxQuestions: null,
    currentQuestion: null,
    timerInterval: null,
    timeLeft: 15,
    maxTime: 15,
    isAnswered: false,
    selectedOptionBtn: null,
    seenIds: [],
    currentOrder: [],
    isCustomGame: false,
    customFilters: {
        difficulties: ['1', '2', '3', '4', '5'],
        themes: ['geographie', 'histoire', 'science', 'cinema', 'general', 'literature', 'art', 'music'],
        types: ['flag', 'slider', 'boolean', 'qcm', 'text', 'order', 'map_pin']
    }
};

let draggedIndex = null;

const countryNamesMap = {
    'fr': 'France',
    'de': 'Allemagne',
    'es': 'Espagne',
    'it': 'Italie',
    'gb': 'Royaume-Uni',
    'us': 'États-Unis',
    'ca': 'Canada',
    'br': 'Brésil',
    'au': 'Australie',
    'jp': 'Japon'
};

function handleCheat() {
    const screenGame = document.getElementById('screen-game');
    if (!screenGame || screenGame.classList.contains('hidden')) return;

    if (!gameState.isAnswered && gameState.currentQuestion) {
        clearInterval(gameState.timerInterval);
        lockInputs();
        evaluateAnswer(null, false, true);
    }
}

window.addEventListener('blur', handleCheat);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) handleCheat();
});

function selectMode(modeName, element) {
    gameState.mode = modeName;
    document.querySelectorAll('.mode-card').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');
}

function startQuickGame() {
    document.querySelectorAll('input[name="diff"], input[name="theme"], input[name="qtype"]').forEach(el => el.checked = true);
    gameState.customFilters = {
        difficulties: ['1', '2', '3', '4', '5'],
        themes: ['geographie', 'histoire', 'science', 'cinema', 'general', 'literature', 'art', 'music'],
        types: ['flag', 'slider', 'boolean', 'qcm', 'text', 'order', 'map_pin']
    };
    gameState.isCustomGame = false;
    startGame();
}

function openCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) modal.classList.add('hidden');
}

function startCustomGame() {
    const selectedDifficulties = Array.from(document.querySelectorAll('input[name="diff"]:checked')).map(el => el.value);
    const selectedThemes = Array.from(document.querySelectorAll('input[name="theme"]:checked')).map(el => el.value);
    const selectedTypes = Array.from(document.querySelectorAll('input[name="qtype"]:checked')).map(el => el.value);

    if (selectedDifficulties.length === 0 || selectedThemes.length === 0 || selectedTypes.length === 0) {
        document.getElementById('modal-err').innerText = 'Coche au moins une case dans chaque groupe.';
        return;
    }

    gameState.customFilters = {
        difficulties: selectedDifficulties,
        themes: selectedThemes,
        types: selectedTypes
    };

    gameState.isCustomGame = true;
    closeCustomModal();
    startGame();
}

window.addEventListener('keydown', (e) => {
    if (gameState.isAnswered) return;
    // A B C D ou 1 2 3 4 : appuie sur la touche de réponse correspondante
    const k = e.key.toLowerCase(), idx = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
    const tiles = document.querySelectorAll('#options-box .opt-btn, #options-box .duel-card-btn');
    if (idx >= 0 && tiles[idx] && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); tiles[idx].click(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey || e.key === 'Tab') return;

    const screenGame = document.getElementById('screen-game');
    if (!screenGame || screenGame.classList.contains('hidden')) return;

    const exactInput = document.getElementById('exact-input');
    const textInput = document.getElementById('text-answer');
    if (exactInput || document.activeElement === textInput) return;

    if (gameState.currentQuestion && gameState.currentQuestion.type === 'slider') {
        if ((e.key >= '0' && e.key <= '9') || e.key === '-') {
            e.preventDefault();
            openExactInput(e.key);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('quiz_username') || 'Joueur_' + Math.floor(Math.random() * 1000);
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.value = savedUser;
    updateProfileBadge(savedUser);
    showDailyBest();
    fetchLeaderboard('home-leaderboard');
});

function updateProfileBadge(name) {
    const best = localStorage.getItem('quiz_best_score') || 0;
    const badge = document.getElementById('profile-badge');
    if (badge) badge.innerText = `${name} · record ${Number(best).toLocaleString('fr-FR')}`;
}

function startGame() {
    const usernameInput = document.getElementById('username');
    const inputName = (usernameInput && usernameInput.value.trim()) ? usernameInput.value.trim() : 'Joueur';
    
    gameState.username = inputName;
    localStorage.setItem('quiz_username', inputName);
    updateProfileBadge(inputName);

    gameState.score = 0;
    gameState.streak = 0;
    gameState.multiplier = 1;
    gameState.tier = 1;
    gameState.questionCount = 0;
    gameState.correct = 0;
    gameState.answers = [];
    gameState.seenIds = [];

    if (gameState.mode === 'sudden') {
        gameState.lives = 1;
        gameState.maxQuestions = null;
    } else if (gameState.mode === 'sprint') {
        gameState.lives = 99;
        gameState.maxQuestions = 10;
    } else if (gameState.mode === 'daily') {
        gameState.lives = 99;
        gameState.maxQuestions = 10;
    } else {
        gameState.lives = 3;
        gameState.maxQuestions = null;
    }

    document.getElementById('screen-home').classList.add('hidden');
    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');

    fetchNextQuestion();
}

async function fetchNextQuestion() {
    if (gameState.lives <= 0 || (gameState.maxQuestions && gameState.questionCount >= gameState.maxQuestions)) {
        showGameOver();
        return;
    }

    gameState.isAnswered = false;
    gameState.selectedOptionBtn = null;
    document.getElementById('feedback-container').innerHTML = '';

    try {
        const queryParams = new URLSearchParams({
            seenIds: JSON.stringify(gameState.seenIds),
            difficulties: JSON.stringify(gameState.customFilters.difficulties),
            themes: JSON.stringify(gameState.customFilters.themes),
            types: JSON.stringify(gameState.customFilters.types)
        });
        if (gameState.mode === 'daily' && !gameState.isCustomGame) { queryParams.set('daily', todayKey()); queryParams.set('n', String(gameState.questionCount)); }

        const response = await fetch(`/api/question?${queryParams.toString()}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById('feedback-container').innerHTML = `<div class="feedback feedback-red">${data.error}</div>`;
            setTimeout(showGameOver, 1800);
            return;
        }

        gameState.currentQuestion = data;
        gameState.questionCount++;
        gameState.seenIds.push(data.id);

        let baseTime = 15;
        if (data.type === 'slider' || data.type === 'order' || data.type === 'map_pin') {
            baseTime = 25;
        } else if (data.type === 'qcm' || data.type === 'boolean' || data.type === 'flag') {
            baseTime = 12;
        } else if (data.type === 'text') {
            baseTime = 18;
        }

        gameState.maxTime = Math.max(8, baseTime - Math.floor(gameState.tier / 3));
        gameState.timeLeft = gameState.maxTime;

        renderQuestion();
        startTimer();
    } catch (err) {
        console.error('Erreur :', err);
        document.getElementById('feedback-container').innerHTML = '<div class="feedback feedback-red">Impossible de charger la question.</div>';
    }
}

function renderQuestion() {
    updateHUD();
    const q = gameState.currentQuestion;
    const container = document.getElementById('question-container');
    
    const THEMES = { geographie: 'géographie', histoire: 'histoire', science: 'science', cinema: 'cinéma', general: 'culture générale', literature: 'littérature', art: 'art', music: 'musique' };
    let html = `<p class="q-meta mono">(${String(gameState.questionCount).padStart(2, '0')}) ${THEMES[String(q.theme).toLowerCase()] || q.theme} · niveau ${q.difficulty}</p>`;
    html += `<p class="q-text">${q.question_text}</p>`;

    if (q.type === 'flag') {
        const flagCode = String(q.flag_code || (q.id && q.id.startsWith('flag_') ? q.id.replace('flag_', '') : 'fr')).toLowerCase().trim();
        html += `<div class="flag-card-container">
                    <img src="https://flagcdn.com/w640/${flagCode}.png" class="flag-img" alt="Drapeau ${flagCode}">
                 </div>`;
        
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        html += `<div class="opts" id="options-box"></div>`;
        container.innerHTML = html;

        const optionsBox = document.getElementById('options-box');
        if (options && Array.isArray(options)) {
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.textContent = opt;
                btn.onclick = () => submitChoiceAnswer(btn, opt);
                optionsBox.appendChild(btn);
            });
        }
    }
    else if (q.type === 'qcm' || q.type === 'boolean') {
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        html += `<div class="opts" id="options-box"></div>`;
        container.innerHTML = html;

        const optionsBox = document.getElementById('options-box');
        if (options && Array.isArray(options)) {
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.textContent = opt;
                btn.onclick = () => submitChoiceAnswer(btn, opt);
                optionsBox.appendChild(btn);
            });
        }
    }
    else if (q.type === 'slider') {
        const middleValue = Math.round((q.min_val + q.max_val) / 2);
        html += `<div class="hint-banner">Glisse le curseur, ou tape la valeur au clavier</div>
                 <div class="slider-container" id="slider-wrapper-container">
                    <div id="slider-value-bubble" onclick="openExactInput()">${middleValue.toLocaleString()}<small>saisir</small></div>
                    <div class="slider-custom-thumb" id="slider-custom-thumb"></div>
                    <input type="range" id="slider-answer" min="${q.min_val}" max="${q.max_val}" step="1" value="${middleValue}" oninput="updateSliderBubble(this)">
                 </div>
                 <div class="slider-labels-container">
                    <div class="slider-extreme-card">
                        <div class="extreme-tag">min</div>
                        <div class="extreme-label">${q.min_label || ''}</div>
                        <div class="extreme-value">${q.min_val.toLocaleString()}</div>
                    </div>
                    <div class="slider-extreme-card r">
                        <div class="extreme-tag">max</div>
                        <div class="extreme-label">${q.max_label || ''}</div>
                        <div class="extreme-value">${q.max_val.toLocaleString()}</div>
                    </div>
                 </div>
                 <button id="validate-btn" onclick="submitSliderAnswer()">Valider</button>`;
        container.innerHTML = html;
        const sliderEl = document.getElementById('slider-answer');
        if (sliderEl) updateSliderBubble(sliderEl);
    } 
    else if (q.type === 'text') {
        html += `<input type="text" id="text-answer" placeholder="Ta réponse" autocomplete="off" onkeypress="if(event.key === 'Enter') submitTextAnswer()">
                 <button id="validate-btn" onclick="submitTextAnswer()">Valider</button>`;
        container.innerHTML = html;
        const textInput = document.getElementById('text-answer');
        if (textInput) textInput.focus();
    }
    else if (q.type === 'order') {
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        
        let shuffled = [...options];
        let isAlreadySorted;
        do {
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            isAlreadySorted = JSON.stringify(shuffled) === JSON.stringify(options);
        } while (isAlreadySorted && options.length > 1);

        gameState.currentOrder = shuffled;

        html += `<div class="hint-banner">Glisse les lignes ou utilise les flèches</div>
                 <div id="order-box" class="order-list"></div>
                 <button id="validate-btn" onclick="submitOrderAnswer()">Valider l'ordre</button>`;
        container.innerHTML = html;
        renderOrderItems();
    }
    else if (q.type === 'map_pin') {
        html += `<div class="hint-banner">Glisse, zoome, puis clique sur le pays</div>
                 <div id="leaflet-map-container"></div>`;
        container.innerHTML = html;

        window.isGameAnswered = () => gameState.isAnswered;

        initLeafletMap('leaflet-map-container', q.correct_answer, (selectedCountry) => {
            submitMapAnswer(selectedCountry);
        });
    }
    else if (q.type === 'duel' || q.type === 'egg_chicken') {
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        html += `<div class="hint-banner">Lequel est apparu en premier ?</div>
                 <div class="duel-container" id="options-box"></div>`;
        container.innerHTML = html;

        const optionsBox = document.getElementById('options-box');
        if (options && Array.isArray(options)) {
            options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.className = 'duel-card-btn';
                btn.innerHTML = `<span class="k">(${index + 1})</span><strong>${opt}</strong>`;
                btn.onclick = () => submitChoiceAnswer(btn, opt);
                optionsBox.appendChild(btn);
            });
        }
    }
}

function submitMapAnswer(clickedCountryId) {
    if (gameState.isAnswered) return;
    lockInputs();
    evaluateAnswer(clickedCountryId);
}

function openExactInput(initialChar = null) {
    if (gameState.isAnswered) return;
    const bubble = document.getElementById('slider-value-bubble');
    const slider = document.getElementById('slider-answer');
    if (!bubble || !slider || slider.disabled) return;

    const parent = bubble.parentNode;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'exact-input';
    input.min = slider.min;
    input.max = slider.max;
    
    input.style.left = bubble.style.left;

    parent.replaceChild(input, bubble);
    input.value = initialChar !== null ? initialChar : slider.value;

    setTimeout(() => {
        input.focus();
        if (initialChar === null) input.select();
    }, 10);

    const applyValue = () => {
        let newVal = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        if (isNaN(newVal)) return;
        if (newVal < min) newVal = min;
        if (newVal > max) newVal = max;

        slider.value = newVal;
        updateSliderBubble(slider);
        const customThumb = document.getElementById('slider-custom-thumb');
        if (customThumb) {
            input.style.left = customThumb.style.left;
        }
    };

    input.addEventListener('input', applyValue);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyValue();
            submitSliderAnswer();
        }
    });

    input.addEventListener('blur', () => {
        if (gameState.isAnswered) return;
        applyValue();

        const newBubble = document.createElement('div');
        newBubble.id = 'slider-value-bubble';
        newBubble.onclick = () => openExactInput();
        newBubble.innerHTML = `${parseFloat(slider.value).toLocaleString()}<small>saisir</small>`;

        if (input.parentNode) parent.replaceChild(newBubble, input);
        updateSliderBubble(slider);
    });
}

function renderOrderItems() {
    const box = document.getElementById('order-box');
    if (!box) return;
    box.innerHTML = '';

    gameState.currentOrder.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.id = `order-card-${index}`;
        
        div.innerHTML = `
            <div class="order-text-content" draggable="true">
                <strong>${index + 1}.</strong> ${item}
            </div>
            <div class="order-actions">
                <button class="order-btn" onclick="moveOrder(${index}, -1)" title="Monter">▲</button>
                <button class="order-btn" onclick="moveOrder(${index}, 1)" title="Descendre">▼</button>
            </div>`;

        const textContent = div.querySelector('.order-text-content');
        textContent.addEventListener('dragstart', (e) => {
            if (!gameState.isAnswered) {
                draggedIndex = index;
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            if (gameState.isAnswered || draggedIndex === null || draggedIndex === index) return;
            
            const movedItem = gameState.currentOrder.splice(draggedIndex, 1)[0];
            gameState.currentOrder.splice(index, 0, movedItem);
            draggedIndex = null;
            renderOrderItems();

            const card = document.getElementById(`order-card-${index}`);
            if (card) {
                card.classList.add('card-moved');
                setTimeout(() => card.classList.remove('card-moved'), 400);
            }
        });

        box.appendChild(div);
    });
}

function moveOrder(index, direction) {
    if (gameState.isAnswered) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gameState.currentOrder.length) return;
    
    const temp = gameState.currentOrder[index];
    gameState.currentOrder[index] = gameState.currentOrder[newIndex];
    gameState.currentOrder[newIndex] = temp;
    
    renderOrderItems();

    [index, newIndex].forEach(idx => {
        const card = document.getElementById(`order-card-${idx}`);
        if (card) {
            card.classList.add('card-moved');
            setTimeout(() => card.classList.remove('card-moved'), 400);
        }
    });
}

function submitChoiceAnswer(btn, opt) { 
    if (!gameState.isAnswered) { 
        gameState.selectedOptionBtn = btn; 
        btn.classList.add('clicked'); 
        lockInputs(); 
        evaluateAnswer(opt); 
    } 
}
function submitTextAnswer() { if (!gameState.isAnswered) { lockInputs(); evaluateAnswer(document.getElementById('text-answer').value.trim()); } }
function submitSliderAnswer() { if (!gameState.isAnswered) { lockInputs(); evaluateAnswer(document.getElementById('slider-answer').value); } }
function submitOrderAnswer() { if (!gameState.isAnswered) { lockInputs(); evaluateAnswer(gameState.currentOrder); } }

function updateSliderBubble(slider) {
    const bubble = document.getElementById('slider-value-bubble');
    const exactInput = document.getElementById('exact-input');
    const targetEl = bubble || exactInput;
    const container = document.getElementById('slider-wrapper-container');
    if (!slider) return;

    const val = parseFloat(slider.value);
    if (bubble) {
        bubble.innerHTML = `${val.toLocaleString()}<small>saisir</small>`;
    }

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const percent = (max > min) ? ((val - min) / (max - min)) * 100 : 0;

    const thumbWidth = 26;
    const containerWidth = container ? container.offsetWidth : 300;
    const ratio = (containerWidth - thumbWidth) / containerWidth;
    const adjustedPercent = (percent * ratio) + (thumbWidth / 2 / containerWidth * 100);

    if (container) {
        container.style.setProperty('--thumb-percent', `${adjustedPercent}%`);
    }
    if (targetEl) {
        targetEl.style.left = `${adjustedPercent}%`;
    }
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    const timerBar = document.getElementById('timer-bar');
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft -= 0.1;
        if (timerBar) timerBar.style.width = `${(gameState.timeLeft / gameState.maxTime) * 100}%`;
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            lockInputs();
            evaluateAnswer(null, true);
        }
    }, 100);
}

function lockInputs() {
    gameState.isAnswered = true;
    const btn = document.getElementById('validate-btn');
    if (btn) btn.style.display = 'none';
    document.querySelectorAll('.opt-btn, .order-btn').forEach(b => b.disabled = true);
}

async function evaluateAnswer(userAnswer, isTimeout = false, isCheat = false) {
    clearInterval(gameState.timerInterval);
    const valToSend = (userAnswer !== null) ? userAnswer : '';

    const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            questionId: gameState.currentQuestion.id,
            userAnswer: valToSend,
            isTimeout: isTimeout,
            isCheat: isCheat
        })
    });
    const data = await response.json();
    const feedbackEl = document.getElementById('feedback-container');

    if (gameState.selectedOptionBtn) {
        gameState.selectedOptionBtn.classList.add(data.isCorrect ? 'is-right' : 'is-wrong');
        // erreur : la bonne touche s'allume aussi
        if (!data.isCorrect && data.correct != null) document.querySelectorAll('#options-box .opt-btn, #options-box .duel-card-btn').forEach((b) => { if (b.textContent.trim().toLowerCase() === String(data.correct).trim().toLowerCase() || b.querySelector('strong')?.textContent.trim().toLowerCase() === String(data.correct).trim().toLowerCase()) b.classList.add('is-right'); });
    }

    if (gameState.currentQuestion.type === 'slider' && data.targetValue !== undefined) {
        const slider = document.getElementById('slider-answer');
        const bubble = document.getElementById('slider-value-bubble');

        if (slider) {
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const target = parseFloat(data.targetValue);
            const amplitude = max - min;
            const targetPercent = amplitude > 0 ? ((target - min) / amplitude) * 100 : 50;

            const thumbWidth = 26;
            const containerWidth = slider.offsetWidth || 300;
            const ratio = (containerWidth - thumbWidth) / containerWidth;
            const targetAdjustedPercent = (targetPercent * ratio) + (thumbWidth / 2 / containerWidth * 100);

            const gStart = Math.max(0, targetAdjustedPercent - 2);
            const gEnd = Math.min(100, targetAdjustedPercent + 2);
            const yStart = Math.max(0, targetAdjustedPercent - 5);
            const yEnd = Math.min(100, targetAdjustedPercent + 5);
            const oStart = Math.max(0, targetAdjustedPercent - 9);
            const oEnd = Math.min(100, targetAdjustedPercent + 9);

            if (bubble) {
                const colorMap = { green: '#2e9d5b', yellow: '#c9a227', orange: '#c9a227', red: '#d9472b' };
                bubble.style.background = colorMap[data.tierColor] || '#ef4444';
            }

            slider.style.background = `linear-gradient(to right, 
                #ef4444 0%, #ef4444 ${oStart}%, 
                #f59e0b ${oStart}%, #f59e0b ${yStart}%, 
                #eab308 ${yStart}%, #eab308 ${gStart}%, 
                #10b981 ${gStart}%, #10b981 ${gEnd}%, 
                #eab308 ${gEnd}%, #eab308 ${yEnd}%, 
                #f59e0b ${yEnd}%, #f59e0b ${oEnd}%, 
                #ef4444 ${oEnd}%, #ef4444 100%)`;
        }
    }

    if (gameState.currentQuestion.type === 'map_pin') {
        const targetIso = String(data.targetValue || gameState.currentQuestion.correct_answer).toLowerCase().trim();
        const countryName = countryNamesMap[targetIso] || targetIso.toUpperCase();

        if (isCheat) {
            data.feedback = `Tu as changé d'onglet. Il fallait cliquer sur <b>${countryName}</b>.`;
        } else if (isTimeout) {
            data.feedback = `Temps écoulé. Il fallait cliquer sur <b>${countryName}</b>.`;
        } else if (!data.isCorrect) {
            data.feedback = `Raté. Il fallait cliquer sur <b>${countryName}</b>.`;
        } else {
            data.feedback = `Bien vu, c'est bien <b>${countryName}</b>.`;
        }

        initLeafletMap('leaflet-map-container', gameState.currentQuestion.correct_answer, () => {}, targetIso);
    }

    const tierColorClass = `feedback-${data.tierColor || 'red'}`;

    if (data.isCorrect) {
        gameState.streak++;
        gameState.multiplier = 1 + Math.floor(gameState.streak / 3);
        const timeBonus = 1 + ((gameState.timeLeft / gameState.maxTime) * 0.5);
        let points = Math.round(100 * gameState.multiplier * (data.scoreMultiplier || 1) * timeBonus);
        if (gameState.mode === 'sudden') points *= 2;
        gameState.score += points;
        gameState.correct++;
        (gameState.answers ||= []).push('■');
        gameState.tier++;
        feedbackEl.innerHTML = `<div class="feedback ${tierColorClass}">${data.feedback} <span class="mono mu"> +${points}</span></div>`;
    } else {
        gameState.streak = 0;
        gameState.multiplier = 1;
        (gameState.answers ||= []).push('□');
        if (gameState.mode !== 'sprint' && gameState.mode !== 'daily') gameState.lives--;
        updateHUD();
        feedbackEl.innerHTML = `<div class="feedback ${tierColorClass}">${data.feedback}</div>`;
    }

    setTimeout(fetchNextQuestion, 2500);
}

async function showGameOver() {
    document.getElementById('screen-game').classList.add('hidden');
    document.getElementById('screen-gameover').classList.remove('hidden');

    const leaderboardWrapper = document.getElementById('leaderboard-container-wrapper');

    if (gameState.isCustomGame) {
        if (leaderboardWrapper) leaderboardWrapper.classList.add('hidden');
        document.getElementById('best-score-badge').innerText = 'Partie sur mesure : score non classé.';
        document.getElementById('final-stats').innerText = `${gameState.score.toLocaleString('fr-FR')} points`;
    } else {
        if (leaderboardWrapper) leaderboardWrapper.classList.remove('hidden');

        const best = parseInt(localStorage.getItem('quiz_best_score') || 0);
        if (gameState.score > best) {
            localStorage.setItem('quiz_best_score', gameState.score);
            document.getElementById('best-score-badge').innerText = `${gameState.correct} bonnes réponses sur ${gameState.questionCount}. Nouveau record sur cet appareil.`;
        } else {
            document.getElementById('best-score-badge').innerText = `${gameState.correct} bonnes réponses sur ${gameState.questionCount}. Record : ${best.toLocaleString('fr-FR')} points.`;
        }

        document.getElementById('final-stats').innerText = `${gameState.score.toLocaleString('fr-FR')} points`;
        if (gameState.mode === 'daily') {
            const key = 'quiz_daily_' + todayKey();
            const prev = JSON.parse(localStorage.getItem(key) || 'null');
            if (!prev || gameState.score > prev.score) localStorage.setItem(key, JSON.stringify({ score: gameState.score, correct: gameState.correct }));
            document.getElementById('go-label').innerText = `Défi du ${todayLabel()}`;
            document.getElementById('share-btn').classList.remove('hidden');
        }
        updateProfileBadge(gameState.username);

        // record : si le score entre dans les dix meilleurs, on entre ses initiales (trois lettres, comme sur une borne)
        let initials = gameState.username;
        try {
            const top = await (await fetch('/api/leaderboard')).json();
            if (gameState.score > 0 && (top.length < 10 || gameState.score > top[top.length - 1].score)) initials = await askInitials(gameState.username);
        } catch (e) { /* */ }
        try {
            await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: initials,
                    score: gameState.score,
                    mode: gameState.mode,
                    theme: 'Partie Rapide'
                })
            });
        } catch (e) {
            console.error("Erreur enregistrement score serveur", e);
        }

        fetchLeaderboard('gameover-leaderboard');
    }
}

async function fetchLeaderboard(targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    try {
        const response = await fetch('/api/leaderboard');
        const scores = await response.json();

        if (!scores || scores.length === 0) {
            container.innerHTML = `<p class="empty">Aucun score pour l'instant. À toi de jouer.</p>`;
            return;
        }

        let html = '';
        scores.forEach((item, index) => {
            html += `
                <div class="leader-item">
                    <span><span class="rank">(${String(index + 1).padStart(2, '0')})</span>${item.username}<small>${MODES[item.mode] || item.mode}</small></span>
                    <span class="score-val">${Number(item.score).toLocaleString('fr-FR')}</span>
                </div>`;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error("Erreur leaderboard :", err);
        container.innerHTML = `<p class="empty">Classement indisponible.</p>`;
    }
}

function resetToHome() {
    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('screen-home').classList.remove('hidden');
    document.getElementById('share-btn').classList.add('hidden');
    document.getElementById('go-label').innerText = 'Game over';
    showDailyBest();
    fetchLeaderboard('home-leaderboard');
}

function updateHUD() {
    const noLives = gameState.mode === 'sprint' || gameState.mode === 'daily';
    document.getElementById('stat-lives').innerHTML = noLives ? '' : `vies <b>${Math.max(0, gameState.lives)}</b>`;
    document.getElementById('stat-score').innerHTML = `<b>${gameState.score.toLocaleString('fr-FR')}</b> pts`;
    document.getElementById('stat-multiplier').innerHTML = gameState.multiplier > 1 ? `série <b>×${gameState.multiplier}</b>` : '';
    document.getElementById('stat-progress').innerHTML = `question <b>${String(gameState.questionCount + (gameState.isAnswered ? 0 : 0)).padStart(2, '0')}</b>${gameState.maxQuestions ? ' / ' + gameState.maxQuestions : ''}`;
}

// ---------- défi du jour : dix questions tirées d'après la date, les mêmes pour tout le monde ----------
const MODES = { daily: 'défi du jour', infini: 'infini', sudden: 'mort subite', sprint: 'sprint' };
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function todayLabel() { return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); }
function showDailyBest() {
    const el = document.getElementById('daily-best'); if (!el) return;
    const r = JSON.parse(localStorage.getItem('quiz_daily_' + todayKey()) || 'null');
    const n = streak();
    el.innerText = (r ? `Défi du ${todayLabel()} : déjà joué, ${r.correct}/10 et ${r.score.toLocaleString('fr-FR')} points. Tu peux retenter.` : '') + (n > 1 ? `${r ? ' · ' : ''}Série : ${n} jours d'affilée.` : '');
}
function shareDaily() {
    const marks = gameState.answers ? gameState.answers.join('') : '';
    const text = `Quiz-O-Matic · défi du ${todayLabel()}\n${gameState.correct}/10 · ${gameState.score.toLocaleString('fr-FR')} points ${marks}\nkerningkastle.com/lab`;
    const btn = document.getElementById('share-btn');
    const done = () => { btn.innerText = 'Copié'; setTimeout(() => (btn.innerText = 'Copier mon résultat'), 1600); };
    if (navigator.share && matchMedia('(pointer: coarse)').matches) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(done, done);
}


// série : jours d'affilée où le défi du jour a été joué (jusqu'à aujourd'hui, ou jusqu'à hier si pas encore joué aujourd'hui)
function streak() {
    const key = (d) => 'quiz_daily_' + `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const d = new Date(); if (!localStorage.getItem(key(d))) d.setDate(d.getDate() - 1);
    let n = 0; while (localStorage.getItem(key(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
}

// initiales de borne : trois cases, lettres au clavier, Entrée pour valider (ou le bouton)
function askInitials(fallback) {
    return new Promise((resolve) => {
        const box = document.createElement('div'); box.className = 'initials';
        box.innerHTML = `<p class="mono">New record ! Tes initiales</p><div class="ini"><span></span><span></span><span></span></div><button class="btn-quick" type="button">OK <i>+</i></button>`;
        document.getElementById('final-stats').after(box);
        const cells = [...box.querySelectorAll('.ini span')]; let v = '';
        const paint = () => cells.forEach((c, k) => { c.textContent = v[k] || ''; c.classList.toggle('cur', k === v.length); });
        const done = () => { removeEventListener('keydown', key, true); box.remove(); resolve(v.length ? v.padEnd(3, '-') : String(fallback || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'AAA'); };
        const key = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); done(); return; }
            if (e.key === 'Backspace') { v = v.slice(0, -1); paint(); e.preventDefault(); return; }
            const ch = e.key.toUpperCase();
            if (/^[A-Z0-9]$/.test(ch) && v.length < 3) { v += ch; paint(); e.preventDefault(); }
        };
        addEventListener('keydown', key, true);
        box.querySelector('button').onclick = done;
        paint();
    });
}
