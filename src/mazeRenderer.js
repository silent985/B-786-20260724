// --- Maze Renderer ---
// Turns a maze grid into Three.js geometry: instanced walls, the floor plane and
// the castle goal. All generated meshes are tagged with userData.isMazePart so a
// rebuild (on reset) can remove the previous level cleanly.

import * as THREE from 'three';
import { MAZE_SIZE, MAZE_SCALE, WALL_HEIGHT } from './config.js';
import { gridToWorld } from './coordinates.js';

/** Remove every mesh tagged as part of a previously built maze. */
function clearPreviousMaze(scene) {
    const stale = scene.children.filter(child => child.userData.isMazePart);
    stale.forEach(child => scene.remove(child));
}

/** Build the green walls as a single InstancedMesh for performance. */
function buildWalls(scene, grid) {
    const wallGeometry = new THREE.BoxGeometry(MAZE_SCALE, WALL_HEIGHT, MAZE_SCALE);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x4DBD33 });

    let wallCount = 0;
    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (grid[y][x] === 1) wallCount++;
        }
    }

    const instancedMesh = new THREE.InstancedMesh(wallGeometry, wallMaterial, wallCount);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMesh.userData.isMazePart = true;

    let i = 0;
    const dummy = new THREE.Object3D();
    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (grid[y][x] === 1) {
                dummy.position.set(
                    gridToWorld(x, MAZE_SIZE, MAZE_SCALE),
                    WALL_HEIGHT / 2,
                    gridToWorld(y, MAZE_SIZE, MAZE_SCALE),
                );
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i++, dummy.matrix);
            }
        }
    }
    scene.add(instancedMesh);
}

/** Build the white floor plane. */
function buildFloor(scene) {
    const floorGeo = new THREE.PlaneGeometry(MAZE_SIZE * MAZE_SCALE, MAZE_SIZE * MAZE_SCALE);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.isMazePart = true;
    scene.add(floor);
}

/** Build the stylised castle marking the goal at the end cell. */
function buildCastle(scene, end) {
    const castleGroup = new THREE.Group();
    castleGroup.userData.isGoal = true;
    castleGroup.userData.isMazePart = true;

    const towerGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
    const towerMat = new THREE.MeshLambertMaterial({ color: 0x6E85B2 }); // Blueish stone
    const roofGeo = new THREE.ConeGeometry(2, 4, 8);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xB22222 }); // Red roof

    const offsets = [{ x: 0, z: -2 }, { x: -2, z: 2 }, { x: 2, z: 2 }];
    offsets.forEach(off => {
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(off.x, 4, off.z);
        tower.castShadow = true;

        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(off.x, 9, off.z);

        castleGroup.add(tower);
        castleGroup.add(roof);
    });

    // Flag pole and pennant on the central tower.
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 6),
        new THREE.MeshStandardMaterial({ color: 0x333333 }));
    pole.position.set(0, 9, -2);
    castleGroup.add(pole);

    const flag = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.5, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
    flag.position.set(1, 11, -2);
    castleGroup.add(flag);

    castleGroup.position.set(
        gridToWorld(end.x, MAZE_SIZE, MAZE_SCALE),
        0,
        gridToWorld(end.y, MAZE_SIZE, MAZE_SCALE),
    );
    scene.add(castleGroup);
}

/**
 * Rebuild all maze geometry for the given grid and goal cell, replacing any
 * previously built level.
 */
export function buildMazeGeometry(scene, grid, end) {
    clearPreviousMaze(scene);
    buildWalls(scene, grid);
    buildFloor(scene);
    buildCastle(scene, end);
}
