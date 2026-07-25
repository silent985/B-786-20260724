import * as THREE from 'three';
import { CONFIG } from './config.js';
import { gridToWorld } from './coords.js';

const MINIMAP_SIZE = 200;
const MINIMAP_PAD = 20;

export class SceneRenderer {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.fog = new THREE.Fog(0xffffff, 20, 150);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this._setupLights();
    this._setupMinimap();
    this._setupPlayerMarker();
  }

  _setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(50, 100, 50);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 500;
    const d = 100;
    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;
    this.scene.add(dir);
  }

  _setupMinimap() {
    const viewSize = CONFIG.MAZE_SIZE * CONFIG.MAZE_SCALE + 20;
    this.mapCamera = new THREE.OrthographicCamera(
      -viewSize / 2,
      viewSize / 2,
      viewSize / 2,
      -viewSize / 2,
      1,
      1000
    );
    this.mapCamera.position.set(0, 100, 0);
    this.mapCamera.lookAt(0, 0, 0);
    this.mapCamera.rotation.z = Math.PI;
  }

  _setupPlayerMarker() {
    this.playerMarker = new THREE.Mesh(
      new THREE.CircleGeometry(4, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    this.playerMarker.rotation.x = -Math.PI / 2;
    this.playerMarker.visible = false;
    this.scene.add(this.playerMarker);
  }

  _removeMazeParts() {
    const toRemove = [];
    this.scene.traverse((obj) => {
      if (obj.userData && obj.userData.isMazePart) toRemove.push(obj);
    });
    for (const obj of toRemove) this.scene.remove(obj);
  }

  buildMaze(maze) {
    this._removeMazeParts();

    const { grid, start, end } = maze;
    this._buildWalls(grid);
    this._buildFloor();
    this.scene.add(this._buildCastle(end));

    const { x: sx, z: sz } = gridToWorld(start.x, start.y);
    this.camera.position.set(sx, CONFIG.PLAYER_HEIGHT, sz);
    this.playerMarker.position.set(sx, CONFIG.WALL_HEIGHT + 2, sz);
  }

  _buildWalls(grid) {
    const wallGeo = new THREE.BoxGeometry(
      CONFIG.MAZE_SCALE,
      CONFIG.WALL_HEIGHT,
      CONFIG.MAZE_SCALE
    );
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x4dbd33 });

    let wallCount = 0;
    for (let y = 0; y < CONFIG.MAZE_SIZE; y++) {
      for (let x = 0; x < CONFIG.MAZE_SIZE; x++) {
        if (grid[y][x] === 1) wallCount++;
      }
    }

    const instanced = new THREE.InstancedMesh(wallGeo, wallMat, wallCount);
    instanced.castShadow = true;
    instanced.receiveShadow = true;
    instanced.userData.isMazePart = true;

    const dummy = new THREE.Object3D();
    let i = 0;
    for (let y = 0; y < CONFIG.MAZE_SIZE; y++) {
      for (let x = 0; x < CONFIG.MAZE_SIZE; x++) {
        if (grid[y][x] === 1) {
          const { x: px, z: pz } = gridToWorld(x, y);
          dummy.position.set(px, CONFIG.WALL_HEIGHT / 2, pz);
          dummy.updateMatrix();
          instanced.setMatrixAt(i++, dummy.matrix);
        }
      }
    }
    this.scene.add(instanced);
  }

  _buildFloor() {
    const worldSpan = CONFIG.MAZE_SIZE * CONFIG.MAZE_SCALE;
    const floorGeo = new THREE.PlaneGeometry(worldSpan, worldSpan);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.isMazePart = true;
    this.scene.add(floor);
  }

  _buildCastle(end) {
    const group = new THREE.Group();
    group.userData.isMazePart = true;

    const towerGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
    const towerMat = new THREE.MeshLambertMaterial({ color: 0x6e85b2 });
    const roofGeo = new THREE.ConeGeometry(2, 4, 8);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xb22222 });

    const offsets = [
      { x: 0, z: -2 },
      { x: -2, z: 2 },
      { x: 2, z: 2 },
    ];
    for (const off of offsets) {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(off.x, 4, off.z);
      t.castShadow = true;
      const r = new THREE.Mesh(roofGeo, roofMat);
      r.position.set(off.x, 9, off.z);
      group.add(t);
      group.add(r);
    }

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

    const { x: gx, z: gz } = gridToWorld(end.x, end.y);
    group.position.set(gx, 0, gz);
    return group;
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateMarker(x, z) {
    this.playerMarker.position.set(x, CONFIG.WALL_HEIGHT + 2, z);
  }

  render() {
    const { renderer, scene, camera, mapCamera, playerMarker } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    renderer.setScissorTest(true);
    playerMarker.visible = false;
    renderer.render(scene, camera);

    renderer.setViewport(MINIMAP_PAD, h - MINIMAP_SIZE - MINIMAP_PAD, MINIMAP_SIZE, MINIMAP_SIZE);
    renderer.setScissor(MINIMAP_PAD, h - MINIMAP_SIZE - MINIMAP_PAD, MINIMAP_SIZE, MINIMAP_SIZE);
    renderer.setScissorTest(true);

    const oldFog = scene.fog;
    scene.fog = null;

    playerMarker.visible = true;
    renderer.render(scene, mapCamera);
    playerMarker.visible = false;

    const oldBg = scene.background;
    scene.background = new THREE.Color(0xeeeeee);
    playerMarker.visible = true;
    renderer.render(scene, mapCamera);
    playerMarker.visible = false;

    scene.fog = oldFog;
    scene.background = oldBg;
  }
}
