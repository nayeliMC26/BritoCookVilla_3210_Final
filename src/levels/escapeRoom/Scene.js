import * as THREE from 'three';
import Room from './Room'
import Player from './Player'
import Raycaster from './Raycaster';

class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene;
        this.camera;
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(230, 65, 170);
        this.room = new Room(this.scene);
        this.player = new Player(this.scene, this.camera, this.room.areaBB, this.room.objectsBB);
        this.raycaster = new Raycaster(this.scene, this.camera, this.player.controls, this.room.interactiveOb);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.raycaster.update(deltaTime);
    }


    clear() {
        console.log('Clearing the scene...');

        // Dispose geometries and materials of objects in the scene
        this.scene.children.forEach((object) => {
            if (object.isGroup) {
                this.#removeGroup(object);
            } else if (object.isMesh) {
                this.#removeMesh(object);
            } else if (object.isLight) {
                this.#removeLight(object);
            } else if (object.isObject3D) {
                // Dispose of any object that doesn't fall into previous categories
                object.dispose();
            }
        });

        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            var child = this.scene.children[0];
            this.scene.remove(child);
        }

        this.player.clear();

        // Nullify references to prevent memory leaks
        this.scene = null;
        this.camera = null;
        this.clock = null;
        this.player.controls = null;
        this.player = null;

        console.log('Scene cleared.');
    }

    #removeMesh(object) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
    }

    #removeLight(object) {
        object.dispose();
    }

    #removeGroup(object) {
        const children = object.children;
        children.forEach((child) => {
            if (child.isMesh) {
                this.#removeMesh(child);
            }
            if (child.isLight) {
                this.#removeLight(child);
            }
        })
    }

}

export default Scene;