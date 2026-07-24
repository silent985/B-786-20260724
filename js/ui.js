export class GameUI {
  constructor({ onStart, onRestart } = {}) {
    this.startScreen = document.getElementById('start-screen');
    this.winScreen = document.getElementById('win-screen');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.gameActive = false;

    this.startBtn.addEventListener('click', () => {
      if (onStart) onStart();
    });
    this.restartBtn.addEventListener('click', () => {
      if (onRestart) onRestart();
    });
  }

  onLock() {
    this.startScreen.classList.add('hidden');
    this.winScreen.classList.add('hidden');
    this.gameActive = true;
  }

  onUnlock() {
    if (this.gameActive) {
      this.startScreen.classList.remove('hidden');
      this.startBtn.innerText = 'RESUME';
    }
  }

  resetForNewGame() {
    this.gameActive = true;
    this.winScreen.classList.add('hidden');
  }

  showWin() {
    this.gameActive = false;
    this.winScreen.classList.remove('hidden');
  }

  get isActive() {
    return this.gameActive;
  }
}
