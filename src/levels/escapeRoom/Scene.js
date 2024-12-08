import * as THREE from 'three';
import Room from './Room';
import Player from './Player';
import Raycaster from './Raycaster';

class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene;
        this.camera;
    }

    init() {
        // Initialize the scene
        this.scene = new THREE.Scene();

        // Set up a perspective camera
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Position the camera at a specific spawn location
        this.camera.position.set(230, 65, 170);

        // Create the room object and add it to the scene
        this.room = new Room(this.scene);

        // Create the player object, passing the scene, camera, and bounding boxes
        this.player = new Player(this.scene, this.camera, this.room.areaBB, this.room.objectsBB);

        // Create the raycaster to handle object interaction
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
                // Dispose objects in the group
                this.#removeGroup(object);
            } else if (object.isMesh) {
                // Dispose mesh geometries and materials
                this.#removeMesh(object);
            } else if (object.isLight) {
                // Dispose light objects
                this.#removeLight(object);
            } else if (object.isObject3D) {
                // Dispose of any other type of Object3D
                object.dispose();
            }
        });

        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            this.scene.remove(child);
        }

        // Clear player-specific resources
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
        // Dispose of the geometry and material of a mesh
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            object.material.dispose();
        }
    }

    #removeLight(object) {
        // Dispose of a light object
        object.dispose();
    }

    #removeGroup(object) {
        // Dispose of all children within a group
        const children = object.children;
        children.forEach((child) => {
            if (child.isMesh) {
                this.#removeMesh(child); // Dispose mesh children
            }
            if (child.isLight) {
                this.#removeLight(child); // Dispose light children
            }
        });
    }
}

export default Scene;