import * as THREE from 'three';
import { gridToWorld } from './coordinates.js';
import {
  MAZE_SCALE,
  MAZE_SIZE,
  WALL_HEIGHT,
  WALL_COLOR,
  FLOOR_COLOR,
  BG_COLOR,
  AMBIENT_LIGHT_INTENSITY,
  DIR_LIGHT_INTENSITY,
  FOG_NEAR,
  FOG_FAR,
  MINIMAP_SIZE,
  MINIMAP_PADDING,
} from './config.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);
  scene.fog = new THREE.Fog(BG_COLOR, FOG_NEAR, FOG_FAR);
  return scene;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  return camera;
}

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function setupLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, DIR_LIGHT_INTENSITY);
  dirLight.position.set(50, 100, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 500;
  const d = 100;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);
}

export function clearMazeMeshes(scene) {
  const toRemove = [];
  scene.traverse((child) => {
    if (child.userData && (child.userData.isMazePart || child.userData.isGoal)) {
      toRemove.push(child);
    }
  });
  toRemove.forEach((obj) => scene.remove(obj));
}

export function buildMazeGeometry(scene, grid, endPos) {
  clearMazeMeshes(scene);

  const wallGeometry = new THREE.BoxGeometry(MAZE_SCALE, WALL_HEIGHT, MAZE_SCALE);
  const wallMaterial = new THREE.MeshLambertMaterial({ color: WALL_COLOR });

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
        const { x: posX, z: posZ } = gridToWorld(x, y, MAZE_SIZE, MAZE_SCALE);
        dummy.position.set(posX, WALL_HEIGHT / 2, posZ);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i++, dummy.matrix);
      }
    }
  }
  scene.add(instancedMesh);

  const floorGeo = new THREE.PlaneGeometry(MAZE_SIZE * MAZE_SCALE, MAZE_SIZE * MAZE_SCALE);
  const floorMat = new THREE.MeshLambertMaterial({ color: FLOOR_COLOR });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.userData.isMazePart = true;
  scene.add(floor);

  const castleGroup = buildCastle();
  const { x: gX, z: gZ } = gridToWorld(endPos.x, endPos.y, MAZE_SIZE, MAZE_SCALE);
  castleGroup.position.set(gX, 0, gZ);
  scene.add(castleGroup);
}

function buildCastle() {
  const group = new THREE.Group();
  group.userData.isGoal = true;

  const towerGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
  const towerMat = new THREE.MeshLambertMaterial({ color: 0x6e85b2 });
  const roofGeo = new THREE.ConeGeometry(2, 4, 8);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xb22222 });

  const offsets = [
    { x: 0, z: -2 },
    { x: -2, z: 2 },
    { x: 2, z: 2 },
  ];
  offsets.forEach((off) => {
    const t = new THREE.Mesh(towerGeo, towerMat);
    t.position.set(off.x, 4, off.z);
    t.castShadow = true;
    const r = new THREE.Mesh(roofGeo, roofMat);
    r.position.set(off.x, 9, off.z);
    group.add(t);
    group.add(r);
  });

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  pole.position.set(0, 9, -2);
  group.add(pole);

  const flag = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  flag.position.set(1, 11, -2);
  group.add(flag);

  return group;
}

export function setupMinimap() {
  const viewSize = MAZE_SIZE * MAZE_SCALE + 20;
  const mapCamera = new THREE.OrthographicCamera(
    -viewSize / 2,
    viewSize / 2,
    viewSize / 2,
    -viewSize / 2,
    1,
    1000
  );
  mapCamera.position.set(0, 100, 0);
  mapCamera.lookAt(0, 0, 0);
  mapCamera.rotation.z = Math.PI;
  return mapCamera;
}

export function ensurePlayerMarker(scene) {
  let marker = scene.getObjectByName('minimapMarker');
  if (!marker) {
    marker = new THREE.Mesh(
      new THREE.CircleGeometry(4, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.name = 'minimapMarker';
    scene.add(marker);
  }
  return marker;
}

export function renderMainView(renderer, scene, camera) {
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, camera);
}

export function renderMinimap(renderer, scene, mapCamera, camera, marker) {
  const size = MINIMAP_SIZE;
  const pad = MINIMAP_PADDING;
  renderer.setViewport(pad, window.innerHeight - size - pad, size, size);
  renderer.setScissor(pad, window.innerHeight - size - pad, size, size);
  renderer.setScissorTest(true);

  const oldFog = scene.fog;
  const oldBg = scene.background;
  scene.fog = null;
  scene.background = new THREE.Color(0xeeeeee);

  marker.position.set(camera.position.x, WALL_HEIGHT + 2, camera.position.z);
  marker.visible = true;
  renderer.render(scene, mapCamera);
  marker.visible = false;

  scene.fog = oldFog;
  scene.background = oldBg;
}
