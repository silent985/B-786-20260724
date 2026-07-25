import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { generateMaze } from './maze.js';
import { gridToWorld } from './coordinates.js';
import { checkCollision, checkWin } from './collision.js';
import {
  createScene,
  createCamera,
  createRenderer,
  setupLights,
  buildMazeGeometry,
  setupMinimap,
  ensurePlayerMarker,
  renderMainView,
  renderMinimap,
} from './renderer.js';
import { createInputState, setupKeyboardListeners, computeMoveVector } from './player.js';
import { createUIState, showStart, showWin, hideOverlays } from './ui.js';
import {
  MAZE_SIZE,
  MAZE_SCALE,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  MOVEMENT_SPEED,
  WIN_DISTANCE,
} from './config.js';

export class MazeGame {
  constructor() {
    this.scene = createScene();
    this.camera = createCamera();
    this.renderer = createRenderer();
    this.mapCamera = setupMinimap();
    this.inputState = createInputState();
    this.uiState = createUIState();

    this.controls = new PointerLockControls(this.camera, document.body);
    this.scene.add(this.controls.getObject());

    this.mazeData = null;
    this.endWorld = { x: 0, z: 0 };
    this.prevTime = performance.now();
    this.gameActive = false;

    setupLights(this.scene);
    this.playerMarker = ensurePlayerMarker(this.scene);

    this.cleanupKeyboard = setupKeyboardListeners(this.inputState);
    this.bindUI();
    this.bindResize();

    this.generateNewMaze();
  }

  bindUI() {
    const { startBtn, restartBtn } = this.uiState.elements;

    startBtn.addEventListener('click', () => this.controls.lock());
    restartBtn.addEventListener('click', () => {
      this.resetGame();
      this.controls.lock();
    });

    this.controls.addEventListener('lock', () => {
      hideOverlays(this.uiState);
      this.gameActive = true;
    });

    this.controls.addEventListener('unlock', () => {
      if (this.gameActive) showStart(this.uiState, true);
    });
  }

  bindResize() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  generateNewMaze() {
    this.mazeData = generateMaze(MAZE_SIZE);
    buildMazeGeometry(this.scene, this.mazeData.grid, this.mazeData.end);
    this.endWorld = gridToWorld(this.mazeData.end.x, this.mazeData.end.y, MAZE_SIZE, MAZE_SCALE);
    this.placePlayerAtStart();
  }

  placePlayerAtStart() {
    const start = this.mazeData.start;
    const { x, z } = gridToWorld(start.x, start.y, MAZE_SIZE, MAZE_SCALE);
    this.camera.position.set(x, PLAYER_HEIGHT, z);
  }

  resetGame() {
    this.generateNewMaze();
    this.gameActive = true;
    hideOverlays(this.uiState);
  }

  update(delta) {
    if (!this.controls.isLocked) return;

    const moveVec = computeMoveVector(this.camera, this.inputState);
    if (moveVec.lengthSq() > 0) {
      const distance = MOVEMENT_SPEED * delta;
      const nextPos = this.camera.position.clone().addScaledVector(moveVec, distance);
      const grid = this.mazeData.grid;

      const allowX = !checkCollision(
        grid,
        nextPos.x,
        this.camera.position.z,
        MAZE_SIZE,
        MAZE_SCALE,
        PLAYER_RADIUS
      );
      const allowZ = !checkCollision(
        grid,
        this.camera.position.x,
        nextPos.z,
        MAZE_SIZE,
        MAZE_SCALE,
        PLAYER_RADIUS
      );

      if (allowX) this.camera.position.x = nextPos.x;
      if (allowZ) this.camera.position.z = nextPos.z;

      if (
        this.gameActive &&
        checkWin(this.camera.position.x, this.camera.position.z, this.endWorld.x, this.endWorld.z, WIN_DISTANCE)
      ) {
        this.gameActive = false;
        this.controls.unlock();
        showWin(this.uiState);
      }
    }
  }

  frame() {
    requestAnimationFrame(() => this.frame());

    const time = performance.now();
    if (this.controls.isLocked) {
      const delta = (time - this.prevTime) / 1000;
      this.update(delta);
      this.prevTime = time;
    } else {
      this.prevTime = time;
    }

    this.render();
  }

  render() {
    renderMainView(this.renderer, this.scene, this.camera);
    renderMinimap(this.renderer, this.scene, this.mapCamera, this.camera, this.playerMarker);
  }

  start() {
    this.frame();
  }

  destroy() {
    this.cleanupKeyboard?.();
    window.removeEventListener('resize', () => this.onResize());
  }
}
