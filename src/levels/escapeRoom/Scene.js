import * as THREE from 'three';
import Room from '../../levels/escapeRoom/Room.js'
import Player from '../../levels/escapeRoom/Player.js'

class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(230, 65, 170);
        this.camera.updateProjectionMatrix();

    }

    init(){
        this.room = new Room(this.scene);
        this.player = new Player(this.scene, this.camera, this.room.areaBB, this.room.objectsBB);

        // const controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.camera.lookAt(this.camera.position);
        const axesHelper = new THREE.AxesHelper(120);
        this.scene.add(axesHelper);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
    }

    render(time, deltaTime) {
        this.animate(time, deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    clear() {
        console.log('Clearing the scene...');

        // Dispose geometries and materials of objects in the scene
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            var child = this.scene.children[0];
            this.scene.remove(child);
        }

        // Nullify references to prevent memory leaks
        this.scene = null;
        this.camera = null;
        this.clock = null;
        this.player.controls.unlock();
        this.player.controls = null;
        this.player = null;


        console.log('Scene cleared.');
    }


    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}

export default Scene;