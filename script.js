// Déclarations des variables principales du jeu
let gameActive, currentPlayer, board, ctx, statusText, startButton, victorySound; 
let playAgainstComputer = false; // Booléen pour déterminer si le joueur joue contre l'ordinateur
const cellSize = 100; // Taille d'une cellule du jeu en pixels
const gameState = Array(9).fill(null); // État initial du plateau de jeu (9 cellules vides)
const circleColor = '#3498db'; // Couleur des cercles
const crossColor = '#e74c3c'; // Couleur des croix
const winningLineColor = '#2ecc71'; // Couleur de la ligne de victoire
const lineWidth = 2; // Épaisseur de la ligne
// Événement déclenché lorsque le contenu du DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    initDOM(); // Initialisation des éléments du DOM
    startButton.addEventListener('click', () => { 
        playAgainstComputer = false; // Désactive le mode de jeu contre l'ordinateur
        startGame(); // Démarre le jeu
    });
    board.addEventListener('click', handleBoardClick); // Gestion des clics sur le plateau

    // Contrôle du volume du son de victoire
    const volumeControl = document.getElementById('volumeControl');
    victorySound.volume = volumeControl.value; // Réglage du volume initial

    // Mise à jour du volume en fonction de l'input utilisateur
    volumeControl.addEventListener('input', () => {
        victorySound.volume = volumeControl.value;
})
});

    // Mise à jour du volume en fonction de l'input utilisateur
    volumeControl.addEventListener('input', () => {
        victorySound.volume = volumeControl.value;
    });

    // Fonction pour initialiser les éléments du DOM
    function initDOM() {
        board = document.getElementById('board'); // Obtention de l'élément du plateau
        ctx = board.getContext('2d'); // Contexte 2D pour le dessin
        statusText = document.getElementById('status'); // Élément de texte d'état
        startButton = document.getElementById('startButton'); // Bouton de démarrage
        victorySound = document.getElementById('victorySound'); // Son de victoire
        const computerPlayButton = document.getElementById('computerPlayButton'); // Bouton pour jouer contre l'ordinateur
        computerPlayButton.addEventListener('click', () => {
            playAgainstComputer = true; // Activation du mode contre l'ordinateur
            startGame(); // Démarrage du jeu
        });
    }

    // Fonction pour démarrer une nouvelle partie
    function startGame() {
        gameActive = true; // Activation du jeu
        currentPlayer = Math.random() < 0.5 ? 'circle' : 'cross'; // Choix aléatoire du joueur initial (cercle ou croix)
        gameState.fill(null); // Réinitialisation de l'état du jeu
        updateStatusText(); // Mise à jour du texte d'état
        startButton.classList.add('hidden'); // Cacher le bouton de démarrage
        resetBoard(); // Réinitialisation du plateau
        drawBoard(); // Dessin du plateau

        // Si le joueur joue contre l'ordinateur et que c'est le tour de l'ordinateur
        if (playAgainstComputer && currentPlayer === 'cross') {
            setTimeout(computerMakeMove, 100); // L'ordinateur effectue un mouvement après un délai
        }
    }

    // Fonction pour que l'ordinateur effectue un mouvement
    function computerMakeMove() {
        const bestMove = findBestMove(gameState); // Trouver le meilleur mouvement
        if (bestMove !== -1) {
            handleCellClick(bestMove); // Effectuer le mouvement
        }
    }

    // Fonction pour trouver le meilleur mouvement possible pour l'ordinateur
    function findBestMove(board) {
        let bestVal = -1000; // Valeur initiale pour le meilleur mouvement
        let bestMove = -1; // Index du meilleur mouvement

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) { // Si la cellule est vide
                board[i] = 'cross'; // L'ordinateur place une croix
                let moveVal = minimax(board, 0, false); // Évaluation du mouvement
                board[i] = null; // Réinitialisation de la cellule

                if (moveVal > bestVal) { // Si le mouvement est meilleur que le meilleur actuel
                    bestMove = i; // Mise à jour du meilleur mouvement
                    bestVal = moveVal; // Mise à jour de la valeur du meilleur mouvement
                }
            }
        }
        return bestMove; // Retourne l'index du meilleur mouvement
    }

    // Fonction pour réinitialiser le plateau
    function resetBoard() {
        ctx.clearRect(0, 0, board.width, board.height); // Efface le contenu du canvas
    }

    // Fonction pour gérer les clics sur le plateau
    function handleBoardClick(event) {
        if (!gameActive) return; // Si le jeu n'est pas actif, ne rien faire

        // Calcul de la cellule cliquée
        const rect = board.getBoundingClientRect();
        const clickedCell = getClickedCell(event.clientX - rect.left, event.clientY - rect.top);

        if (gameState[clickedCell] === null) { // Si la cellule est vide
            handleCellClick(clickedCell); // Gérer le clic sur la cellule
        }
    }

    // Fonction pour obtenir l'index de la cellule cliquée
    function getClickedCell(x, y) {
        return Math.floor(y / cellSize) * 3 + Math.floor(x / cellSize); // Calcul de l'index basé sur la position x, y
    }

    // Fonction pour gérer un clic sur une cellule
    function handleCellClick(index) {
        gameState[index] = currentPlayer; // Mise à jour de l'état de la cellule avec le joueur actuel
        drawSymbol(index); // Dessiner le symbole du joueur dans la cellule
        processGameTurn(index); // Traitement du tour de jeu
    }

    // Fonction pour dessiner le plateau de jeu
    function drawBoard() {
        ctx.strokeStyle = '#000'; // Couleur de la ligne
        ctx.lineWidth = lineWidth; // Épaisseur de la ligne
        drawGridLines(); // Dessin des lignes de la grille
    }

    // Fonction pour dessiner les lignes de la grille
    function drawGridLines() {
        for (let i = 1; i <= 2; i++) {
            drawLine(i * cellSize, 0, i * cellSize, board.height); // Ligne verticale
            drawLine(0, i * cellSize, board.width, i * cellSize); // Ligne horizontale
        }
    }

    // Fonction pour dessiner une ligne
    function drawLine(startX, startY, endX, endY) {
        ctx.beginPath(); // Commencer un nouveau chemin
        ctx.moveTo(startX, startY); // Point de départ de la ligne
        ctx.lineTo(endX, endY); // Point de fin de la ligne
        ctx.stroke(); // Dessiner la ligne
    }

    // Fonction pour dessiner le symbole dans une cellule
    function drawSymbol(index) {
        const x = (index % 3) * cellSize; // Position X de la cellule
        const y = Math.floor(index / 3) * cellSize; // Position Y de la cellule

        // Dessiner un cercle ou une croix en fonction du joueur actuel
        if (currentPlayer === 'circle') {
            drawCircle(x + cellSize / 2, y + cellSize / 2); // Dessiner un cercle
        } else {
            drawCross(x, y); // Dessiner une croix
        }
    }

    // Fonction pour dessiner un cercle
    function drawCircle(x, y) {
        ctx.strokeStyle = circleColor; // Couleur du cercle
        ctx.beginPath(); // Commencer un nouveau chemin
        ctx.arc(x, y, cellSize / 3, 0, 2 * Math.PI); // Dessiner l'arc de cercle
        ctx.stroke(); // Dessiner le cercle
    }

    function drawCross(x, y) {
        ctx.strokeStyle = crossColor; // Définit la couleur du crayon pour dessiner la croix.
        ctx.beginPath(); // Commence un nouveau chemin pour le dessin.
        ctx.moveTo(x + 20, y + 20); // Déplace le crayon au point de départ du premier segment de la croix.
        ctx.lineTo(x + cellSize - 20, y + cellSize - 20); // Dessine une ligne diagonale pour la croix.
        ctx.moveTo(x + cellSize - 20, y + 20); // Déplace le crayon au point de départ du second segment de la croix.
        ctx.lineTo(x + 20, y + cellSize - 20); // Dessine la deuxième ligne diagonale, complétant la croix.
        ctx.stroke(); // Applique le tracé sur le canevas.
    }
    
    function processGameTurn(index) {
        gameState[index] = currentPlayer; // Met à jour l'état du jeu avec le joueur actuel.
        drawSymbol(index); // Dessine le symbole (cercle ou croix) sur le plateau.
    
        const winningCombination = checkForWin(currentPlayer); // Vérifie si le joueur actuel a gagné.
        if (winningCombination) {
            endGame(true); // Termine le jeu si le joueur a gagné.
            highlightWinningCells(winningCombination); // Met en évidence les cellules gagnantes.
        } else if (checkForDraw()) {
            endGame(false); // Termine le jeu s'il y a match nul.
        } else {
            changePlayer(); // Change le joueur actuel.
            updateStatusText(); // Met à jour le texte d'état.
            if (playAgainstComputer && currentPlayer === 'cross') {
                computerMakeMove(); // Si c'est le tour de l'ordinateur, il fait son mouvement.
            }
        }
    }
    
    function checkForWin(player) {
        // Vérifie si le joueur spécifié a une combinaison gagnante.
        return getWinningCombinations().find(combination => {
            return combination.every(index => gameState[index] === player);
        });
    }
    
    function checkForDraw() {
        // Vérifie si toutes les cellules sont remplies, ce qui indiquerait un match nul.
        return gameState.every(cell => cell !== null);
    }
    
    function endGame(win) {
        gameActive = false; // Désactive le jeu.
        statusText.textContent = win ? `Joueur ${getPlayerNumber()} a gagné!` : "Match nul!"; // Affiche le résultat du jeu.
        if (win) playVictorySound(); // Joue le son de victoire si le joueur a gagné.
        startButton.textContent = "Recommencer la partie"; // Change le texte du bouton de démarrage pour une nouvelle partie.
        startButton.classList.remove('hidden'); // Affiche le bouton de démarrage.
    }
    
    function highlightWinningCells(combination) {
        ctx.strokeStyle = winningLineColor; // Définit la couleur de la ligne pour les cellules gagnantes.
        ctx.lineWidth = 5; // Définit l'épaisseur de la ligne.
        combination.forEach(index => {
            const x = (index % 3) * cellSize; // Calcule la position x de la cellule.
            const y = Math.floor(index / 3) * cellSize; // Calcule la position y de la cellule.
            if (gameState[index] === 'circle') {
                drawCircle(x + cellSize / 2, y + cellSize / 2); // Dessine un cercle pour les cellules gagnantes.
            } else {
                drawCross(x, y); // Dessine une croix pour les cellules gagnantes.
            }
        });
    }
    
    function changePlayer() {
        // Change le joueur actuel.
        currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
    }
    
    function updateStatusText() {
        // Met à jour le texte d'état pour indiquer le tour du joueur.
        statusText.textContent = `Tour du Joueur ${getPlayerNumber()}`;
    }
    
    function getPlayerNumber() {
        // Retourne le numéro du joueur actuel (1 ou 2).
        return currentPlayer === 'circle' ? '1' : '2';
    }
    
    function playVictorySound() {
        // Joue le son de victoire.
        victorySound.play();
    }
    
    function getWinningCombinations() {
        // Retourne un tableau des combinaisons gagnantes possibles.
        return [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
    }
    
    function minimax(board, depth, isMaximizingPlayer) {
        // Implémentation de l'algorithme Minimax pour le jeu de morpion.
        let score = evaluateBoard(board); // Évalue l'état actuel du plateau.
    
        // Vérifie les conditions terminales (victoire, défaite, match nul).
        if (score === 10) return score - depth;
        if (score === -10) return score + depth;
        if (isMovesLeft(board) === false) return 0;
    
        // Maximise ou minimise le score selon le joueur.
        if (isMaximizingPlayer) {
            let best = -1000;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'cross'; // Tente un coup pour le joueur 'cross'.
                    best = Math.max(best, minimax(board, depth + 1, false)); // Choisis le meilleur coup.
                    board[i] = null; // Annule le coup pour tester d'autres possibilités.
                }
            }
            return best;
        } else {
            let best = 1000;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'circle'; // Tente un coup pour le joueur 'circle'.
                    best = Math.min(best, minimax(board, depth + 1, true)); // Choisis le pire coup pour l'adversaire.
                    board[i] = null; // Annule le coup pour tester d'autres possibilités.
                }
            }
            return best;
        }
    }
    
    function evaluateBoard(board) {
        // Évalue l'état du plateau pour identifier un gagnant.
        const winningCombinations = getWinningCombinations();
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                // Retourne un score positif ou négatif selon le joueur gagnant.
                return board[a] === 'cross' ? 10 : -10;
            }
        }
        return 0; // Retourne 0 si aucun joueur n'a gagné.
    }
    
    function isMovesLeft(board) {
        // Vérifie s'il reste des mouvements possibles sur le plateau.
        return board.includes(null);
    }
    
    function computerMakeMove() {
        // Permet à l'ordinateur de faire un mouvement.
        setTimeout(() => {
            const bestMove = findBestMove(gameState); // Trouve le meilleur coup à jouer.
            if (bestMove !== -1) {
                handleCellClick(bestMove); // Joue le coup sur le plateau.
            }
        }, 500); // Attend 500ms avant de faire le mouvement.
    }
    
    function findBestMove(board) {
        // Trouve le meilleur coup à jouer pour l'ordinateur.
        let bestVal = -1000;
        let bestMove = -1;
    
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'cross'; // Tente un coup pour l'ordinateur.
                let moveVal = minimax(board, 0, false); // Évalue le coup avec l'algorithme Minimax.
                board[i] = null; // Annule le coup.
    
                if (moveVal > bestVal) {
                    bestMove = i; // Met à jour le meilleur coup si nécessaire.
                    bestVal = moveVal;
                }
            }
        }
        return bestMove; // Retourne le meilleur coup trouvé.
    }
    