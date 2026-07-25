// --- Minimap ---
// Owns the top-down orthographic camera and the red player marker, and renders a
// small overhead map into the bottom-left corner of the screen.

import * as THREE from 'three';
import { MAZE_SIZE, MAZE_SCALE, WALL_HEIGHT } from './config.js';

const MAP_SIZE = 200; // Pixel size of the square minimap viewport.
const MAP_PADDING = 20;
const MAP_BACKGROUND = new THREE.Color(0xEEEEEE);

/**
 * Create the orthographic camera and player marker used for the minimap.
 * @returns {{ camera: THREE.OrthographicCamera, marker: THREE.Mesh }}
 */
export function createMinimap(scene) {
    const viewSize = MAZE_SIZE * MAZE_SCALE + 20;
    const camera = new THREE.OrthographicCamera(
        -viewSize / 2, viewSize / 2,
        viewSize / 2, -viewSize / 2,
        1, 1000);
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
    camera.rotation.z = Math.PI; // Match the main view's orientation.

    // Red marker floating above the player; only made visible while the minimap
    // renders so the first-person camera never sees it.
    const marker = new THREE.Mesh(
        new THREE.CircleGeometry(4, 16),
        new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
    marker.rotation.x = -Math.PI / 2;
    marker.name = 'minimapMarker';
    marker.visible = false;
    scene.add(marker);

    return { camera, marker };
}

/**
 * Render the minimap in the bottom-left corner. Temporarily removes the fog,
 * swaps the background to a light grey and reveals the player marker, restoring
 * all scene state afterwards.
 */
export function renderMinimap(renderer, scene, minimap, playerPosition) {
    const { camera, marker } = minimap;

    renderer.setViewport(MAP_PADDING, window.innerHeight - MAP_SIZE - MAP_PADDING, MAP_SIZE, MAP_SIZE);
    renderer.setScissor(MAP_PADDING, window.innerHeight - MAP_SIZE - MAP_PADDING, MAP_SIZE, MAP_SIZE);
    renderer.setScissorTest(true);

    const savedFog = scene.fog;
    const savedBackground = scene.background;
    scene.fog = null;
    scene.background = MAP_BACKGROUND;

    marker.position.set(playerPosition.x, WALL_HEIGHT + 2, playerPosition.z);
    marker.visible = true;
    renderer.render(scene, camera);
    marker.visible = false;

    scene.fog = savedFog;
    scene.background = savedBackground;
}
