import * as THREE from 'three';
import Room from './Room'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(150, 60, 90);
        this.camera.lookAt(150, 60, 0)

        this.room = new Room(this.scene);




        // const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const axesHelper = new THREE.AxesHelper(120);
        this.scene.add(axesHelper);
    }



    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {

    }
}

export default Scene;