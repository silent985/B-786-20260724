import * as THREE from 'three';

export function createInputState() {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
}

export function setupKeyboardListeners(inputState) {
  const onKeyDown = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        inputState.forward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inputState.left = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inputState.backward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inputState.right = true;
        break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        inputState.forward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inputState.left = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inputState.backward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inputState.right = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  };
}

export function computeMoveVector(camera, inputState) {
  const forwardDir = new THREE.Vector3();
  camera.getWorldDirection(forwardDir);
  forwardDir.y = 0;
  forwardDir.normalize();

  const rightDir = new THREE.Vector3();
  rightDir.crossVectors(forwardDir, camera.up).normalize();

  const moveVec = new THREE.Vector3();
  if (inputState.forward) moveVec.add(forwardDir);
  if (inputState.backward) moveVec.sub(forwardDir);
  if (inputState.right) moveVec.add(rightDir);
  if (inputState.left) moveVec.sub(rightDir);
  moveVec.normalize();

  return moveVec;
}
