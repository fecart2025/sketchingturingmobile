// ==========================
// script.js — Lógica do Jogo Corrigida
// ==========================

// Objeto que armazena dados do jogo
const gameData = {
    themes: {
        "pre-history": {
            title: "Pré-História",
            suggestions:["Fogo", "Caverna", "Dinossauro", "Lança", "Osso"]
        },
        "world-wars": {
            title: "Guerras Mundiais",
            suggestions:["Arma", "Avião", "Kit Médico", "Bomba", "Muralha"]
        },
        "antiquity": {
            title: "Antiguidade",
            suggestions: ["Pirâmide", "Cavalo", "Espada", "Escudo", "Cruz"]
        }
    },
    // URLs dos modelos do Teachable Machine por tema (vêm de tm-config.js)
    modelUrls: (window.TM_CONFIG && window.TM_CONFIG.modelUrls) ? window.TM_CONFIG.modelUrls : {},
    // Mapa opcional de rótulos (vêm de tm-config.js)
    labelMap: (window.TM_CONFIG && window.TM_CONFIG.labelMap) ? window.TM_CONFIG.labelMap : {},
    currentTheme: null,
    playerName: "",
    timer: 30,
    timerInterval: null,
    score: 0,
    currentDrawing: [],
    drawings: [],
    aiGuess: null,
    gameState: "home", // home, playing, guessing, ranking
    ranking: [],
    predictionInterval: null,
    isPredicting: false,
    hasGivenFeedback: false,
    allowEarlyFeedback: false
};

// Elementos DOM
let homePage, themePage, gamePage, rankingPage, playerNameInput, themeTitle, suggestionItems;
let timerElement, aiGuessElement, correctGuessContainer, correctGuessElement;
let playerResultName, playerScoreElement, rankingList, clearBtn, undoBtn;
let correctBtn, wrongBtn, btnsFeedback, timeUpSound;

let p5Instance = null;
let currentRound = 1;
const maxRounds = 3;

// Cache de modelos carregados por tema
const loadedModels = {
    // exemplo: 'pre-history': { model: tmImage.CustomMobileNet, maxPredictions: number, labels: [] }
};


// Função para tocar som de aviso (1 segundo antes do tempo acabar)
function playTimeUpSound() {
    console.log('Tentando tocar som de aviso...');
    
    if (timeUpSound) {
        // Reiniciar o áudio para o início
        timeUpSound.currentTime = 0;
        
        // Definir volume
        timeUpSound.volume = 0.7;
        
        // Tentar reproduzir o arquivo MP3
        timeUpSound.play().then(() => {
            console.log('Som de aviso reproduzido com sucesso');
        }).catch(error => {
            console.log('Erro ao reproduzir som.mp3:', error);
            // Se falhar, tentar criar um novo elemento de áudio
            playFallbackSound();
        });
    } else {
        console.log('Elemento de áudio não encontrado');
        playFallbackSound();
    }
}

// Função de fallback caso o elemento principal falhe
function playFallbackSound() {
    try {
        const audio = new Audio('som.mp3');
        audio.volume = 0.7;
        audio.play().then(() => {
            console.log('Som de aviso (fallback) reproduzido');
        }).catch(error => {
            console.log('Erro no fallback de áudio:', error);
        });
    } catch (error) {
        console.log('Erro ao criar áudio de fallback:', error);
    }
}


// Função para formatar respostas da IA com maiúsculas e acentos corretos
function formatAIResponse(response) {
    // Mapeamento de palavras comuns para versões com acentos e maiúsculas
    const wordMap = {
        'aviao': 'Avião',
        'arma': 'Arma',
        'bomba': 'Bomba',
        'cavalo': 'Cavalo',
        'cruz': 'Cruz',
        'dinossauro': 'Dinossauro',
        'escudo': 'Escudo',
        'espada': 'Espada',
        'fogo': 'Fogo',
        'kit medico': 'Kit Médico',
        'kit-médico': 'Kit Médico',
        'kitmedico': 'Kit Médico',
        'lanca': 'Lança',
        'muralha': 'Muralha',
        'osso': 'Osso',
        'piramide': 'Pirâmide',
        'caverna': 'Caverna',
        'não reconhecido': 'Não Reconhecido',
        'unknown': 'Não Reconhecido'
    };
    
    // Converter para minúsculas para comparação
    const lowerResponse = response.toLowerCase().trim();
    
    // Verificar se existe no mapeamento
    if (wordMap[lowerResponse]) {
        return wordMap[lowerResponse];
    }
    
    // Se não estiver no mapeamento, capitalizar primeira letra
    return response.charAt(0).toUpperCase() + response.slice(1).toLowerCase();
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    loadRanking();
    setupEventListeners();
});

// Inicializar elementos DOM
function initializeElements() {
    homePage = document.getElementById('home-page');
    themePage = document.getElementById('theme-page');
    gamePage = document.getElementById('game-page');
    rankingPage = document.getElementById('ranking-page');
    playerNameInput = document.getElementById('player-name');
    themeTitle = document.getElementById('theme-title');
    suggestionItems = document.getElementById('suggestion-items');
    timerElement = document.getElementById('timer');
    aiGuessElement = document.getElementById('ai-guess');
    correctGuessContainer = document.getElementById('correct-guess-container');
    correctGuessElement = document.getElementById('correct-guess');
    playerResultName = document.getElementById('player-result-name');
    playerScoreElement = document.getElementById('player-score');
    rankingList = document.getElementById('ranking-list');
    clearBtn = document.getElementById('clear-btn');
    undoBtn = document.getElementById('undo-btn');
    correctBtn = document.getElementById('btn-correct');
    wrongBtn = document.getElementById('btn-wrong');
    btnsFeedback = document.getElementById('btns-feedback');
    timeUpSound = document.getElementById('timeUpSound');
}

// Carregar ranking do localStorage
function loadRanking() {
    const savedRanking = localStorage.getItem('sketchTuringRanking');
    if (savedRanking) {
        gameData.ranking = JSON.parse(savedRanking);
    }
}

// Configurar event listeners
function setupEventListeners() {
    clearBtn.addEventListener('click', clearCanvas);
    // Botão desfazer foi removido da página
    // Proteger caso elemento não exista
    if (undoBtn) {
        undoBtn.addEventListener('click', undoLastStroke);
    }
    correctBtn.addEventListener('click', () => handleGuessFeedback(true));
    wrongBtn.addEventListener('click', () => handleGuessFeedback(false));
}

// Habilita/Desabilita os botões de feedback
function setGuessButtonsEnabled(isEnabled) {
    if (!correctBtn || !wrongBtn) return;
    correctBtn.disabled = !isEnabled;
    wrongBtn.disabled = !isEnabled;
    // Reforço de acessibilidade e interação para evitar estados presos
    const pe = isEnabled ? '' : 'none';
    const tabIndexVal = isEnabled ? '0' : '-1';
    [correctBtn, wrongBtn].forEach(btn => {
        btn.setAttribute('aria-disabled', String(!isEnabled));
        btn.style.pointerEvents = pe;
        btn.tabIndex = parseInt(tabIndexVal, 10);
    });
}

// Iniciar jogo
function startGame(theme) {
    // Garantir que o nome foi definido na etapa anterior
    if (!gameData.playerName || gameData.playerName.trim() === '') {
        const typed = playerNameInput.value.trim();
        if (!typed) {
            alert('Por favor, digite seu nome para começar.');
            showPage('home');
            return;
        }
        gameData.playerName = typed;
    }

    // Resetar dados do jogo
    gameData.currentTheme = theme;
    gameData.score = 0;
    gameData.currentDrawing = [];
    gameData.drawings = [];
    currentRound = 1;
    gameData.gameState = "playing";
    gameData.allowEarlyFeedback = false;
    gameData.hasGivenFeedback = false;

    // Configurar interface
    themeTitle.textContent = gameData.themes[theme].title;
    setupSuggestions(theme);
    
    // Mostrar página do jogo (sai da seleção de tema)
    showPage('game');
    
    // Durante a rodada, bloquear feedback
    setGuessButtonsEnabled(false);

    // Iniciar canvas (removendo instância anterior se existir)
    initSketch();
    
    // Iniciar timer
    startTimer();
    
    // Mostrar mensagem inicial
    aiGuessElement.textContent = "Desenhe alguma das opções!";
    aiGuessElement.style.display = 'flex'; // Garantir que o elemento da análise da IA esteja visível
    btnsFeedback.classList.add('hidden');
    correctGuessContainer.classList.add('hidden');

    // Garantir que o modelo do tema esteja carregado em background
    ensureModelLoaded(theme).catch((err) => {
        console.error("Erro ao carregar modelo:", err);
        aiGuessElement.textContent = "Falha ao carregar IA para o tema.";
    });

    // Iniciar loop de predição contínua (1s)
    startPredictionLoop();
}

// Configurar sugestões
function setupSuggestions(theme) {
    suggestionItems.innerHTML = '';
    gameData.themes[theme].suggestions.forEach(item => {
        const suggestion = document.createElement('div');
        suggestion.className = 'bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm';
        suggestion.textContent = item;
        suggestionItems.appendChild(suggestion);
    });
}

// Mostrar página específica
function showPage(pageName) {
    homePage.classList.add('hidden');
    themePage.classList.add('hidden');
    gamePage.classList.add('hidden');
    rankingPage.classList.add('hidden');
    
    switch(pageName) {
        case 'home':
            homePage.classList.remove('hidden');
            break;
        case 'theme':
            themePage.classList.remove('hidden');
            break;
        case 'game':
            gamePage.classList.remove('hidden');
            break;
        case 'ranking':
            rankingPage.classList.remove('hidden');
            break;
    }
}

// Fluxo: nome -> seleção de tema
function proceedToTheme() {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Por favor, digite seu nome para continuar.');
        return;
    }
    gameData.playerName = name;
    showPage('theme');
}

// Inicializar canvas com p5.js
function initSketch() {
    // Remover instância anterior se existir
    if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
    }
    
    // Criar nova instância
    p5Instance = new p5(sketch, 'sketch-container');
}

// Função sketch do p5.js
function sketch(p) {
    p.setup = function() {
        const container = document.getElementById('sketch-container');
        const width = container ? container.clientWidth : 800;
        const height = Math.min(500, window.innerHeight * 0.4); // Altura maior e mais responsiva
        const canvas = p.createCanvas(width, height);
        canvas.parent('sketch-container');
        canvas.elt.style.touchAction = 'none'; // Prevenir zoom/scroll no canvas
        p.background(255);
        p.stroke(0);
        p.strokeWeight(4);
    };

    p.draw = function() {
        // Desenhar apenas se estiver no estado de jogo
        if (gameData.gameState === "playing") {
            if (p.mouseIsPressed) {
                p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
                
                // Armazenar coordenadas do desenho atual
                gameData.currentDrawing.push({
                    x: p.mouseX,
                    y: p.mouseY,
                    pmouseX: p.pmouseX,
                    pmouseY: p.pmouseY
                });
            }
        }
    };

    // Melhorar suporte a touch para dispositivos móveis
    p.touchStarted = function() {
        if (gameData.gameState === "playing") {
            p.mouseX = p.touches[0].x;
            p.mouseY = p.touches[0].y;
            p.pmouseX = p.mouseX;
            p.pmouseY = p.mouseY;
            return false; // Prevenir comportamento padrão
        }
    };

    p.touchMoved = function() {
        if (gameData.gameState === "playing" && p.touches.length > 0) {
            p.mouseX = p.touches[0].x;
            p.mouseY = p.touches[0].y;
            return false; // Evitar rolagem em dispositivos móveis
        }
        return false;
    };

    p.touchEnded = function() {
        return false; // Prevenir comportamento padrão
    };

    // Ajustar tamanho do canvas quando a janela for redimensionada
    p.windowResized = function() {
        const container = document.getElementById('sketch-container');
        if (!container) return;
        const width = container.clientWidth;
        const height = Math.min(500, window.innerHeight * 0.4);
        p.resizeCanvas(width, height);
        redrawCanvas();
    };
}

// Limpar canvas
function clearCanvas() {
    if (p5Instance) {
        p5Instance.background(255);
        gameData.currentDrawing = [];
    }
}

// Desfazer último traço
function undoLastStroke() {
    if (gameData.currentDrawing.length > 0) {
        gameData.currentDrawing.pop();
        redrawCanvas();
    }
}

// Redesenhar canvas
function redrawCanvas() {
    if (!p5Instance) return;
    
    p5Instance.background(255);
    p5Instance.stroke(0);
    p5Instance.strokeWeight(4);
    
    // Redesenhar todos os traços
    for (let i = 0; i < gameData.currentDrawing.length - 1; i++) {
        const current = gameData.currentDrawing[i];
        const next = gameData.currentDrawing[i + 1];
        p5Instance.line(current.x, current.y, next.x, next.y);
    }
}

// Iniciar timer
function startTimer() {
    gameData.timer = 30;
    timerElement.textContent = `${gameData.timer}s`;
    timerElement.classList.remove('timer-warning');
    // Bloquear feedback antecipado no início da rodada
    gameData.allowEarlyFeedback = false;
    
    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
    }
    
    gameData.timerInterval = setInterval(() => {
        gameData.timer--;
        timerElement.textContent = `${gameData.timer}s`;
        
        // Após 5s decorridos (restando 25s), habilitar feedback durante o jogo
        if (!gameData.allowEarlyFeedback && gameData.gameState === 'playing' && gameData.timer <= 25) {
            gameData.allowEarlyFeedback = true;
            setGuessButtonsEnabled(true);
        }

        if (gameData.timer <= 10) {
            timerElement.classList.add('timer-warning');
        }
        
        // Tocar som de aviso 1 segundo antes de acabar
        if (gameData.timer === 1) {
            playTimeUpSound();
        }
        
        if (gameData.timer <= 0) {
            clearInterval(gameData.timerInterval);
            endRound();
        }
    }, 1000);
}

// Finalizar rodada
function endRound() {
    gameData.gameState = "guessing";
    // Resetar trava de múltiplos cliques para a nova fase de feedback
    gameData.hasGivenFeedback = false;
    
    // Salvar desenho atual
    if (gameData.currentDrawing.length > 0) {
        gameData.drawings.push([...gameData.currentDrawing]);
    }
    
    // Habilitar feedback apenas após o tempo encerrar
    setGuessButtonsEnabled(true);

    // Rodar análise da IA real do Teachable Machine e exibir botões de feedback
    runAIAnalysis(true).catch((err) => {
        console.error(err);
        aiGuessElement.textContent = "Erro na análise da IA.";
        btnsFeedback.classList.remove('hidden');
    });
}

// Carrega o modelo do tema se necessário
async function ensureModelLoaded(themeKey) {
    if (loadedModels[themeKey]) return loadedModels[themeKey];
    if (!window.tmImage) throw new Error("Biblioteca Teachable Machine não carregada.");
    const urls = gameData.modelUrls[themeKey];
    if (!urls || !urls.model || !urls.metadata) throw new Error("URLs do modelo não configuradas para o tema.");
    const model = await tmImage.load(urls.model, urls.metadata);
    const maxPredictions = model.getTotalClasses();
    const labels = [];
    for (let i = 0; i < maxPredictions; i++) {
        labels.push(model.getClassLabels ? model.getClassLabels()[i] : `Classe ${i+1}`);
    }
    loadedModels[themeKey] = { model, maxPredictions, labels };
    return loadedModels[themeKey];
}

// Executa a inferência da IA no canvas desenhado
async function runAIAnalysis(showFeedbackButtons = true) {
    // Verificar se o usuário desenhou algo
    if (!gameData.currentDrawing || gameData.currentDrawing.length < 2) {
        const formattedResponse = formatAIResponse("Não reconhecido");
        aiGuessElement.textContent = formattedResponse;
        aiGuessElement.classList.add('not-recognized');
        gameData.aiGuess = formattedResponse;
        
        if (showFeedbackButtons) {
            // Desabilitar botões de feedback quando não há desenho
            setGuessButtonsEnabled(false);
            btnsFeedback.classList.remove('hidden');
            
            // Pular automaticamente para próxima rodada após 4 segundos
            setTimeout(() => {
                nextRound();
            }, 4000);
        }
        return;
    }

    aiGuessElement.textContent = "Analisando seu desenho...";
    const themeKey = gameData.currentTheme;
    const { model } = await ensureModelLoaded(themeKey);
    const canvasEl = document.querySelector('#sketch-container canvas');
    if (!canvasEl) throw new Error("Canvas não encontrado");

    // Reduz ruído: cria uma versão reduzida em tons de cinza se necessário
    // Teachable Machine Image aceita elemento canvas diretamente
    const predictions = await model.predict(canvasEl);
    // Ordena por probabilidade
    predictions.sort((a, b) => b.probability - a.probability);
    const best = predictions[0];
    const rawLabel = best.className || best.label || "?";
    const bestLabel = gameData.labelMap[rawLabel] || rawLabel;
    const probability = best.probability;

    // Formatar a resposta da IA
    const formattedLabel = formatAIResponse(bestLabel);
    gameData.aiGuess = formattedLabel;
    
    // Verificar se a IA não reconhece o desenho (probabilidade baixa ou resposta "Não reconhecido")
    const isNotRecognized = probability < 0.3 || bestLabel.toLowerCase().includes('não reconhecido') || 
                           bestLabel.toLowerCase().includes('unknown') || bestLabel.toLowerCase().includes('?');
    
    if (isNotRecognized) {
        const formattedResponse = formatAIResponse("Não reconhecido");
        aiGuessElement.textContent = formattedResponse;
        aiGuessElement.classList.add('not-recognized');
        gameData.aiGuess = formattedResponse;
        
        if (showFeedbackButtons) {
            // Desabilitar botões de feedback quando não reconhecido
            setGuessButtonsEnabled(false);
            btnsFeedback.classList.remove('hidden');
            
            // Pular automaticamente para próxima rodada após 4 segundos
            setTimeout(() => {
                nextRound();
            }, 4000);
        }
    } else {
        aiGuessElement.textContent = ` ${formattedLabel} (${(probability*100).toFixed(0)}%)`;
        aiGuessElement.classList.remove('not-recognized');
        if (showFeedbackButtons) {
            btnsFeedback.classList.remove('hidden');
        }
    }
}

// Processar feedback do usuário sobre o palpite da IA
function handleGuessFeedback(isCorrect) {
    // Permitir cliques apenas se estiver na fase de avaliação
    // ou, durante a fase de jogo, após 10s do início (allowEarlyFeedback)
    const isEarlyAllowed = (gameData.gameState === 'playing' && gameData.allowEarlyFeedback);
    const isGuessingPhase = (gameData.gameState === 'guessing');
    if (!(isGuessingPhase || isEarlyAllowed)) return;
    // Evitar múltiplos cliques na mesma rodada
    if (gameData.hasGivenFeedback) return;
    gameData.hasGivenFeedback = true;
    setGuessButtonsEnabled(false);
    
    // Se o clique ocorrer antes do fim, parar o cronômetro
    if (gameData.timerInterval && gameData.gameState === 'playing') {
        clearInterval(gameData.timerInterval);
    }

    if (isCorrect) {
        // Verificar se a IA está no estado "não reconhecido"
        const isNotRecognized = gameData.aiGuess && (
            gameData.aiGuess.toLowerCase().includes('não reconhecido') || 
            gameData.aiGuess.toLowerCase().includes('unknown') ||
            gameData.aiGuess.toLowerCase().includes('?')
        );
        
        if (isNotRecognized) {
            // Se a IA não reconheceu, o usuário não marca pontos
            // Não mostrar mensagem de parabéns, apenas avançar para próxima rodada
            setTimeout(() => {
                nextRound();
            }, 1000);
        } else {
            // Pontuação base da rodada (sem bônus): 30
            let pointsToAdd = 30;

            // Bônus por rapidez quando clicado antes do tempo acabar
            // Regras: >19s -> +20, >14s -> +15, >9s -> +10, caso contrário 0
            if (gameData.gameState === 'playing') {
                const remaining = gameData.timer; // segundos restantes no momento do clique
                let bonus = 0;
                if (remaining >= 20) {
                    bonus = 20;
                } else if (remaining > 14) {
                    bonus = 15;
                } else if (remaining > 9) {
                    bonus = 10;
                }
                pointsToAdd += bonus; // possíveis valores finais: 55, 50, 45 ou 30
            }

            gameData.score += pointsToAdd;
            const roundPointsEl = document.getElementById('round-points');
            if (roundPointsEl) {
                roundPointsEl.textContent = String(pointsToAdd);
            }
            correctGuessElement.textContent = gameData.aiGuess || '';
            correctGuessContainer.classList.remove('hidden');
            
            // Ocultar o texto da análise da IA para mostrar apenas a mensagem de acerto
            aiGuessElement.style.display = 'none';
            
            setTimeout(() => {
                nextRound();
            }, 4000);
        }
    } else {
        // Penalidade/sem pontos permanece como está: avançar para a próxima rodada
        nextRound();
    }
}

// Próxima rodada
function nextRound() {
    currentRound++;
    
    if (currentRound <= maxRounds) {
        // Preparar próxima rodada
        gameData.gameState = "playing";
        gameData.hasGivenFeedback = false;
        gameData.timer = 30;
        gameData.allowEarlyFeedback = false;
        gameData.currentDrawing = [];
        
        // Limpar interface
        clearCanvas();
        btnsFeedback.classList.add('hidden');
        correctGuessContainer.classList.add('hidden');
        aiGuessElement.textContent = `Rodada ${currentRound}/${maxRounds} - Desenhe algo relacionado ao tema!`;
        aiGuessElement.classList.remove('not-recognized');
        aiGuessElement.style.display = 'flex'; // Mostrar novamente o elemento da análise da IA
        
        // Bloquear feedback durante o desenho
        setGuessButtonsEnabled(false);

        // Reiniciar timer
        startTimer();
    } else {
        // Jogo acabou
        endGame();
    }
}

// Finalizar jogo
function endGame() {
    gameData.gameState = "ranking";
    
    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
    }
    
    // Atualizar interface
    playerResultName.textContent = gameData.playerName;
    playerScoreElement.textContent = gameData.score;
    
    // Adicionar ao ranking
    addToRanking(gameData.playerName, gameData.score);
    
    // Mostrar página de ranking
    showPage('ranking');

    // Parar predições contínuas
    if (gameData.predictionInterval) {
        clearInterval(gameData.predictionInterval);
        gameData.predictionInterval = null;
    }
}

// Adicionar jogador ao ranking
function addToRanking(name, score) {
    gameData.ranking.push({ name, score });
    gameData.ranking.sort((a, b) => b.score - a.score);
    
    // Manter apenas top 20
    if (gameData.ranking.length > 20) {
        gameData.ranking = gameData.ranking.slice(0, 10);
    }
    
    // Salvar no localStorage
    localStorage.setItem('sketchTuringRanking', JSON.stringify(gameData.ranking));
    
    // Exibir ranking
    displayRanking();
}

// Exibir ranking
function displayRanking() {
    rankingList.innerHTML = '';
    
    gameData.ranking.forEach((player, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2';
        
        const rankPosition = document.createElement('span');
        rankPosition.className = 'font-bold text-blue-600 w-12';
        rankPosition.textContent = `${index + 1}º`;
        
        const rankName = document.createElement('span');
        rankName.className = 'text-gray-800 flex-1 text-center';
        rankName.textContent = player.name;
        
        const rankScore = document.createElement('span');
        rankScore.className = 'font-semibold text-green-800 w-16 text-right'; // cor do ponto
        rankScore.textContent = player.score;
        
        rankItem.appendChild(rankPosition);
        rankItem.appendChild(rankName);
        rankItem.appendChild(rankScore);
        
        rankingList.appendChild(rankItem);
    });
}

// Voltar para página inicial
function backToHome() {
    // Resetar dados do jogo
    gameData.currentTheme = null;
    gameData.timer = 30;
    gameData.score = 0;
    gameData.currentDrawing = [];
    gameData.drawings = [];
    gameData.aiGuess = null;
    gameData.gameState = "home";
    currentRound = 1;
    gameData.hasGivenFeedback = false;
    
    // Limpar timer
    if (gameData.timerInterval) {
        clearInterval(gameData.timerInterval);
    }
    
    // Limpar input
    playerNameInput.value = '';
    
    // Remover instância do p5.js
    if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
    }
    // Parar predições contínuas
    if (gameData.predictionInterval) {
        clearInterval(gameData.predictionInterval);
        gameData.predictionInterval = null;
    }
    
    // Mostrar página inicial
    showPage('home');

    // Garantir que os botões fiquem desabilitados fora do jogo
    setGuessButtonsEnabled(false);
}

// Expor funções usadas pelos botões no HTML para o escopo global
// Garante funcionamento mesmo em ambientes que isolam o escopo de scripts
window.startGame = startGame;
window.backToHome = backToHome;
window.proceedToTheme = proceedToTheme;

// Inicia predições a cada 1 segundo durante o estado "playing"
function startPredictionLoop() {
    if (gameData.predictionInterval) {
        clearInterval(gameData.predictionInterval);
        gameData.predictionInterval = null;
    }
    gameData.predictionInterval = setInterval(async () => {
        if (gameData.gameState !== 'playing') return;
        if (gameData.isPredicting) return;
        // Só predizer se houver algo desenhado
        if (!gameData.currentDrawing || gameData.currentDrawing.length < 2) return;
        gameData.isPredicting = true;
        try {
            await runAIAnalysis(false);
        } catch (e) {
            // Evita spam de erros no console a cada segundo
            if (console && console.debug) console.debug('Predição periódica falhou:', e);
        } finally {
            gameData.isPredicting = false;
        }
    }, 1000);
}

