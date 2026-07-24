import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CONFIG } from './config.js';
import { generateMaze } from './maze.js';
import { gridToWorld } from './coords.js';
import { SceneRenderer } from './renderer.js';
import { PlayerController } from './player.js';
import { GameUI } from './ui.js';

const WIN_DISTANCE = 6;

const renderer = new SceneRenderer();
const controls = new PointerLockControls(renderer.camera, document.body);
renderer.scene.add(controls.getObject());

let currentMaze = generateMaze(CONFIG.MAZE_SIZE);
renderer.buildMaze(currentMaze);

const player = new PlayerController(renderer.camera, controls);

const ui = new GameUI({
  onStart: () => controls.lock(),
  onRestart: () => {
    currentMaze = generateMaze(CONFIG.MAZE_SIZE);
    renderer.buildMaze(currentMaze);
    ui.resetForNewGame();
    player.resetClock();
    controls.lock();
  },
});

controls.addEventListener('lock', () => ui.onLock());
controls.addEventListener('unlock', () => ui.onUnlock());

function checkWin() {
  const { x: gx, z: gz } = gridToWorld(currentMaze.end.x, currentMaze.end.y);
  const dist = Math.hypot(renderer.camera.position.x - gx, renderer.camera.position.z - gz);
  if (dist < WIN_DISTANCE && ui.isActive) {
    controls.unlock();
    ui.showWin();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const moved = player.update(currentMaze.grid);
  renderer.updateMarker(renderer.camera.position.x, renderer.camera.position.z);
  if (moved) checkWin();
  renderer.render();
}

window.addEventListener('resize', () => renderer.resize());

animate();
