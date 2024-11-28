import * as THREE from 'three';
import Room from './Room'
import Player from './Player'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(230, 65, 170);
        this.camera.updateProjectionMatrix();

        this.room = new Room(this.scene);
        this.player = new Player(this.scene, this.camera, this.room.roomBB);

        // const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const axesHelper = new THREE.AxesHelper(120);
        this.scene.add(axesHelper);
    }



    render(time, deltaTime) {
        this.animate(time, deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    animate(time, deltaTime) {
        this.player.update(deltaTime);

    }
}

export default Scene;