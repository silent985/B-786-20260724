// --- Player Controller ---
// Encapsulates pointer-lock look controls, WASD/arrow movement, sliding wall
// collision and goal detection. All movement state lives on the instance rather
// than in module-level globals.

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { MOVEMENT_SPEED, PLAYER_HEIGHT, MAZE_SIZE, MAZE_SCALE, WIN_DISTANCE, START_CELL } from './config.js';
import { gridToWorld } from './coordinates.js';
import { checkCollision } from './collision.js';

export class Player {
    /**
     * @param {THREE.PerspectiveCamera} camera
     * @param {HTMLElement} domElement  Element that captures pointer lock.
     */
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);

        this.move = { forward: false, backward: false, left: false, right: false };

        // Reused scratch vectors to avoid per-frame allocations.
        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._moveVec = new THREE.Vector3();

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
    }

    /** The controls object that must be added to the scene graph. */
    get object() {
        return this.controls.getObject();
    }

    get isLocked() {
        return this.controls.isLocked;
    }

    lock() { this.controls.lock(); }
    unlock() { this.controls.unlock(); }

    _onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': this.move.forward = true; break;
            case 'ArrowLeft': case 'KeyA': this.move.left = true; break;
            case 'ArrowDown': case 'KeyS': this.move.backward = true; break;
            case 'ArrowRight': case 'KeyD': this.move.right = true; break;
        }
    }

    _onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': this.move.forward = false; break;
            case 'ArrowLeft': case 'KeyA': this.move.left = false; break;
            case 'ArrowDown': case 'KeyS': this.move.backward = false; break;
            case 'ArrowRight': case 'KeyD': this.move.right = false; break;
        }
    }

    /** Place the player at the maze start cell. */
    resetToStart() {
        const sx = gridToWorld(START_CELL.x, MAZE_SIZE, MAZE_SCALE);
        const sz = gridToWorld(START_CELL.y, MAZE_SIZE, MAZE_SCALE);
        this.camera.position.set(sx, PLAYER_HEIGHT, sz);
    }

    /**
     * Advance the player by one frame. Applies sliding collision against the
     * maze grid so the player never clips through walls.
     * @param {number[][]} grid  Current maze grid.
     * @param {number} delta  Seconds since the last frame.
     */
    update(grid, delta) {
        const { camera } = this;

        camera.getWorldDirection(this._forward);
        this._forward.y = 0;
        this._forward.normalize();

        this._right.crossVectors(this._forward, camera.up).normalize();

        this._moveVec.set(0, 0, 0);
        if (this.move.forward) this._moveVec.add(this._forward);
        if (this.move.backward) this._moveVec.sub(this._forward);
        if (this.move.right) this._moveVec.add(this._right);
        if (this.move.left) this._moveVec.sub(this._right);

        if (this._moveVec.lengthSq() === 0) return;

        this._moveVec.normalize();
        const distance = MOVEMENT_SPEED * delta;
        const nextX = camera.position.x + this._moveVec.x * distance;
        const nextZ = camera.position.z + this._moveVec.z * distance;

        // Resolve each axis independently for smooth wall sliding.
        if (!checkCollision(grid, nextX, camera.position.z)) camera.position.x = nextX;
        if (!checkCollision(grid, camera.position.x, nextZ)) camera.position.z = nextZ;
    }

    /**
     * Whether the player is within winning distance of the goal cell.
     * @param {{x:number,y:number}} end  Goal cell.
     */
    hasReachedGoal(end) {
        const gx = gridToWorld(end.x, MAZE_SIZE, MAZE_SCALE);
        const gz = gridToWorld(end.y, MAZE_SIZE, MAZE_SCALE);
        const dx = this.camera.position.x - gx;
        const dz = this.camera.position.z - gz;
        return Math.sqrt(dx * dx + dz * dz) < WIN_DISTANCE;
    }
}
