import * as THREE from "three";

class RainEffect {
    constructor(scene) {
        this.scene = scene;
        this.rainCount = 15000; // Number of raindrops
        this.pool = []; // Pool of raindrops
        this.velocity = 100; // Fixed fall velocity for all raindrops
        this.init();
    }

    init() {
        // Geometry and material for the raindrops
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.5,
            depthWrite: true,
        });

        // Rain particles
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(this.rainCount * 3); // Store positions

        // Initialize raindrops
        for (let i = 0; i < this.rainCount; i++) {
            rainPositions[i * 3] = Math.random() * 400 - 200; // X position
            rainPositions[i * 3 + 1] = Math.random() * 500 + 200; // Y position (starts above)
            rainPositions[i * 3 + 2] = Math.random() * 400 - 200; // Z position
        }

        rainGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(rainPositions, 3)
        );

        this.rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(this.rain);

        // Add raindrops to the pool
        for (let i = 0; i < this.rainCount; i++) {
            this.pool.push({
                position: new THREE.Vector3(
                    rainPositions[i * 3],
                    rainPositions[i * 3 + 1],
                    rainPositions[i * 3 + 2]
                ),
            });
        }
    }

    update(deltaTime) {
        const positions = this.rain.geometry.attributes.position.array;

        // Update each raindrop position with a fixed velocity
        for (let i = 0; i < this.pool.length; i++) {
            // Get the current position
            const drop = this.pool[i];
            const position = drop.position;

            // Move the raindrop
            position.y -= this.velocity * deltaTime; // Use fixed velocity

            // Check if the raindrop has fallen below the reset Y position
            if (position.y < -100) {
                // Reset raindrop position to a random location above the scene
                position.y = Math.random() * 200 + 200; // Random Y above the scene
                position.x = Math.random() * 400 - 200; // Random X
                position.z = Math.random() * 400 - 200; // Random Z
            }

            // Update position in geometry
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
        }

        // Mark the position attribute as needing an update
        this.rain.geometry.attributes.position.needsUpdate = true;
    }
}

export default RainEffect;
