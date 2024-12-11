import SplashParticleSystem from "./SplashParticleSystem";
import * as THREE from 'three';

class SplashEffect {
    constructor(scene) {
        this.scene = scene;
        this.splashSystem = new SplashParticleSystem(scene);
        this.lastSplashTime = 0;
        this.splashInterval = 1;  // Time between splash spawns (in seconds)
        this.objects = [];  // To store objects suitable for splash generation

        // Traverse the scene initially to register objects
        this.traverseScene();
    }

    traverseScene() {
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                // Assuming that only mesh objects are relevant for splash effects
                this.registerObjectForSplash(object);
            }
        });
    }

    registerObjectForSplash(object) {
        this.objects.push(object);
    }

    spawnSplashOnTop(object) {
        const boundingBox = new THREE.Box3().setFromObject(object);
        const topY = boundingBox.max.y;

        // Randomly place a splash on the top of the object
        const randomX = Math.random() * (boundingBox.max.x - boundingBox.min.x) + boundingBox.min.x;
        const randomZ = Math.random() * (boundingBox.max.z - boundingBox.min.z) + boundingBox.min.z;
        const position = new THREE.Vector3(randomX, topY, randomZ);

        // Spawn splash at the calculated position
        this.splashSystem.spawnSplash(position);
    }

    update(deltaTime) {
        this.lastSplashTime += deltaTime;

        if (this.lastSplashTime >= this.splashInterval) {
            // Pick a random object from the registered objects
            const randomObject = this.objects[Math.floor(Math.random() * this.objects.length)];

            // Spawn splash on top of the selected object
            this.spawnSplashOnTop(randomObject);

            // Reset the splash timer
            this.lastSplashTime = 0;
        }

        // Update the splash particle system
        this.splashSystem.update(deltaTime);
    }
}

export default SplashEffect;