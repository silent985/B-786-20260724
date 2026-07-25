// --- Main Orchestrator ---
// Wires the scene, maze, player, minimap and UI together and drives the render
// loop. This is the only module that owns the mutable game state.

import * as THREE from 'three';
import { createScene } from './scene.js';
import { buildMazeGeometry } from './mazeRenderer.js';
import { createMinimap, renderMinimap } from './minimap.js';
import { Player } from './player.js';
import { GameUI } from './ui.js';
import { generateMaze } from './maze.js';

const { scene, camera, renderer } = createScene();
const player = new Player(camera, document.body);
const minimap = createMinimap(scene);
scene.add(player.object);

// Mutable game state, owned here rather than scattered across globals.
const state = {
    grid: [],
    end: { x: 0, y: 0 },
    active: false,
};

let prevTime = performance.now();

const ui = new GameUI({
    onStart: () => player.lock(),
    onRestart: () => {
        resetGame();
        player.lock();
    },
});

player.controls.addEventListener('lock', () => {
    ui.showGame();
    state.active = true;
});

player.controls.addEventListener('unlock', () => {
    // On a win the game is already inactive, so we leave the win screen up;
    // otherwise treat the unlock as a pause.
    if (state.active) ui.showPause();
});

/** Generate a fresh maze level and rebuild its geometry. */
function loadNewLevel() {
    const maze = generateMaze();
    state.grid = maze.grid;
    state.end = maze.end;
    buildMazeGeometry(scene, state.grid, state.end);
    player.resetToStart();
}

/** Start a brand new game from the restart button. */
function resetGame() {
    loadNewLevel();
    state.active = true;
    ui.hideWin();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function animate() {
    requestAnimationFrame(animate);

    if (player.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;
        prevTime = time;

        player.update(state.grid, delta);

        if (state.active && player.hasReachedGoal(state.end)) {
            state.active = false;
            player.unlock(); // Release the mouse so the win menu is usable.
            ui.showWin();
        }
    } else {
        prevTime = performance.now(); // Avoid a large delta jump after pausing.
    }

    render();
}

function render() {
    // Main first-person view fills the whole canvas.
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);
    renderer.render(scene, camera);

    // Overhead minimap in the corner.
    renderMinimap(renderer, scene, minimap, camera.position);
}

// Boot.
loadNewLevel();
animate();
