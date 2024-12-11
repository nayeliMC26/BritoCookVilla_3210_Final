import * as THREE from "three";

class GlowingParticles {
    constructor(scene) {
        this.scene = scene;
        this.rainCount = 1500; // Number of particles
        this.pool = []; // Pool of particles
        this.xVelocity = 20; // Fixed horizontal velocity
        this.yAmplitude = 10; // Amplitude of vertical oscillation
        this.yFrequency = 1; // Frequency of vertical oscillation
        this.xBounds = [-200, 800]; // X bounds for recall and respawn
        this.init();
    }

    init() {
        // Geometry and material for the particles
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xa069ff,
            size: 0.3,
            transparent: true,
            opacity: 1,
            depthWrite: true,
            emissive: 0xa069ff, // Set emissive color (glowing)
            emissiveIntensity: 2, // Set the intensity of the glow
        });

        // Particle geometry
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(this.rainCount * 3); // Store positions

        // Initialize particles
        for (let i = 0; i < this.rainCount; i++) {
            particlePositions[i * 3] =
                Math.random() * (this.xBounds[1] - this.xBounds[0]) +
                this.xBounds[0]; // X position
            particlePositions[i * 3 + 1] = Math.random() * 400 - 200; // Y position
            particlePositions[i * 3 + 2] = Math.random() * 400 - 200; // Z position
        }

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(particlePositions, 3)
        );

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);

        // Add particles to the pool
        for (let i = 0; i < this.rainCount; i++) {
            this.pool.push({
                position: new THREE.Vector3(
                    particlePositions[i * 3],
                    particlePositions[i * 3 + 1],
                    particlePositions[i * 3 + 2]
                ),
                initialY: particlePositions[i * 3 + 1], // Store the initial Y for oscillation
            });
        }
    }

    update(deltaTime) {
        const positions = this.particles.geometry.attributes.position.array;
        const time = performance.now() * 0.001; // Current time in seconds for oscillation

        for (let i = 0; i < this.pool.length; i++) {
            const drop = this.pool[i];
            const position = drop.position;

            // Move the particle leftwards
            position.x -= this.xVelocity * deltaTime;

            // Add sinusoidal vertical movement
            position.y =
                drop.initialY +
                Math.sin(time * this.yFrequency + i) * this.yAmplitude;

            // Reset particle if it moves too far left
            if (position.x < this.xBounds[0]) {
                position.x = this.xBounds[1]; // Respawn ahead
                position.y = Math.random() * 400 - 200; // Random Y
                position.z = Math.random() * 400 - 200; // Random Z
                drop.initialY = position.y; // Update the initial Y for oscillation
            }

            // Update position in geometry
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;
        }

        // Mark the position attribute as needing an update
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}

export default GlowingParticles;
