// --- User Interface ---
// Manages the start / win overlay screens and wires their buttons to callbacks.
// Keeps all DOM lookups in one place so the game loop stays free of element ids.

export class GameUI {
    /**
     * @param {object} handlers
     * @param {() => void} handlers.onStart   Called when PLAY / RESUME is clicked.
     * @param {() => void} handlers.onRestart Called when PLAY AGAIN is clicked.
     */
    constructor({ onStart, onRestart }) {
        this.startScreen = document.getElementById('start-screen');
        this.winScreen = document.getElementById('win-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');

        this.startBtn.addEventListener('click', onStart);
        this.restartBtn.addEventListener('click', onRestart);
    }

    /** Hide both overlays (game is running). */
    showGame() {
        this.startScreen.classList.add('hidden');
        this.winScreen.classList.add('hidden');
    }

    /** Show the start overlay as a pause menu with a RESUME label. */
    showPause() {
        this.startScreen.classList.remove('hidden');
        this.startBtn.innerText = 'RESUME';
    }

    /** Show the win overlay. */
    showWin() {
        this.winScreen.classList.remove('hidden');
    }

    /** Hide the win overlay (used on restart). */
    hideWin() {
        this.winScreen.classList.add('hidden');
    }
}
