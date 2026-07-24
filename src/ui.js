export function createUIState() {
  const elements = {
    startScreen: document.getElementById('start-screen'),
    winScreen: document.getElementById('win-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
  };

  return { elements, active: false };
}

export function showStart(uiState, resume = false) {
  uiState.elements.startScreen.classList.remove('hidden');
  uiState.elements.winScreen.classList.add('hidden');
  uiState.elements.startBtn.innerText = resume ? 'RESUME' : 'PLAY';
}

export function showWin(uiState) {
  uiState.elements.winScreen.classList.remove('hidden');
  uiState.elements.startScreen.classList.add('hidden');
}

export function hideOverlays(uiState) {
  uiState.elements.startScreen.classList.add('hidden');
  uiState.elements.winScreen.classList.add('hidden');
}
