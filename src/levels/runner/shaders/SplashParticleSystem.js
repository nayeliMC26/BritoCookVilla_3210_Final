import * as THREE from 'three';

class SplashParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.splashes = [];
        this.maxParticles = 100;

        // Create a simple cube material
        this.material = new THREE.MeshStandardMaterial({
            color: 0x00aaff, // Splash color (light blue)
            roughness: 0.5,
            metalness: 0.5,
        });

        // Create cubes for the splash particles
        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Small cubes

        // Create and position cubes
        for (let i = 0; i < this.maxParticles; i++) {
            const cube = new THREE.Mesh(this.geometry, this.material);
            cube.visible = false; // Start as invisible
            this.scene.add(cube);
            this.splashes.push({
                cube,
                velocity: new THREE.Vector3(0, 0, 0),
                lifetime: Math.random() * 1.5 + 0.5, // Random lifetime
                isActive: false, // Whether the particle is currently active
            });
        }
    }

    spawnSplash(position) {
        // Find an inactive splash and activate it
        const splash = this.splashes.find(splash => !splash.isActive);

        if (splash) {
            splash.cube.position.set(position.x, position.y, position.z);
            splash.velocity.set(
                Math.random() * 0.5 - 0.25, // Random horizontal velocity
                Math.random() * 0.5 + 1,     // Random vertical upward velocity
                Math.random() * 0.5 - 0.25   // Random horizontal velocity
            );
            splash.isActive = true;
            splash.cube.visible = true; // Make it visible once spawned
        }
    }

    update(deltaTime) {
        this.splashes.forEach(splash => {
            if (splash.isActive) {
                // Apply gravity
                splash.velocity.y -= 9.8 * deltaTime; // Gravity effect (falling)

                // Move the splash cube
                splash.cube.position.add(splash.velocity.clone().multiplyScalar(deltaTime));

                // Check if the splash has hit the ground (y <= 0)
                if (splash.cube.position.y <= 0) {
                    splash.cube.position.y = 0; // Ensure it stays on the ground
                    splash.velocity.set(0, 0, 0); // Stop movement once it hits the ground
                    splash.isActive = false; // Recycle this particle
                    splash.cube.visible = false; // Make it invisible again
                }
            }
        });
    }
}

export default SplashParticleSystem;
