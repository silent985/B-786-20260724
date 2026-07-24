import * as THREE from 'three';
import { CONFIG } from './config.js';
import { collidesAt } from './collision.js';

export class PlayerController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.prevTime = performance.now();

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  resetClock() {
    this.prevTime = performance.now();
  }

  update(grid) {
    if (!this.controls.isLocked) {
      this.prevTime = performance.now();
      return false;
    }

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    const move = new THREE.Vector3();
    if (this.moveForward) move.add(forward);
    if (this.moveBackward) move.sub(forward);
    if (this.moveRight) move.add(right);
    if (this.moveLeft) move.sub(right);
    move.normalize();

    let moved = false;
    if (move.lengthSq() > 0) {
      const distance = CONFIG.MOVEMENT_SPEED * delta;
      const next = this.camera.position.clone().addScaledVector(move, distance);

      const allowX = !collidesAt(grid, CONFIG, next.x, this.camera.position.z);
      const allowZ = !collidesAt(grid, CONFIG, this.camera.position.x, next.z);

      if (allowX) this.camera.position.x = next.x;
      if (allowZ) this.camera.position.z = next.z;
      moved = true;
    }

    this.prevTime = time;
    return moved;
  }

  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
}
