import * as THREE from 'three';

class Fabric {
    constructor(scene) {
        this.scene = scene;
        this.pool = []; // Pool of planes
        this.activePlanes = []; // Currently active planes
        this.spawnCooldown = 0; // Cooldown for spawning new planes
        this.spawnInterval = THREE.MathUtils.randFloat(1, 3); // Random spawn interval
        this.init();
    }

    init() {
        const planeCount = 5;

        for (let i = 0; i < planeCount; i++) {
            const geometry = new THREE.PlaneGeometry(1, 1, 20, 20);
            const material = new THREE.MeshStandardMaterial({
                color: 0xfff7e3,
                side: THREE.DoubleSide,
                emissive: 0x000000, // Ensure no emission
                emissiveIntensity: 0, // Disable emissive glow
            });
            const plane = new THREE.Mesh(geometry, material);

            // Start off-screen
            plane.position.set(34, THREE.MathUtils.randFloatSpread(10), 0);

            plane.userData = {
                xSpeed: -THREE.MathUtils.randFloat(20, 25),
                crinkleFrequency: Math.random() * 2 + 1,
                crinkleAmplitude: Math.random() * 0.2 + 0.1,
                warpFrequencyX: Math.random() * 1.5 + 0.5,
                warpFrequencyY: Math.random() * 1.5 + 0.5,
                warpAmplitude: Math.random() * 0.3 + 0.2,
            };

            plane.layers.enable(0); // Papers in the default layer

            this.pool.push(plane); // Add to pool
        }
    }

    spawnPlane() {
        if (this.pool.length > 0) {
            const plane = this.pool.pop();

            // Reset position and add to active planes
            plane.position.set(34, THREE.MathUtils.randFloat(3, 10), THREE.MathUtils.randFloat(-5, 5));
            this.activePlanes.push(plane);
            this.scene.add(plane);
        }
    }

    updatePlanes(deltaTime) {
        const time = performance.now() * 0.001;

        for (let i = this.activePlanes.length - 1; i >= 0; i--) {
            const plane = this.activePlanes[i];
            const { xSpeed, crinkleFrequency, crinkleAmplitude, warpFrequencyX, warpFrequencyY, warpAmplitude } =
                plane.userData;

            // Update position
            plane.position.x += xSpeed * deltaTime;
            plane.position.y += Math.sin(time * 2) * 0.05;
            plane.position.z += Math.cos(time * 2) * 0.05;

            // Update rotation
            plane.rotation.x += Math.sin(deltaTime) * 0.01;
            plane.rotation.y += Math.cos(deltaTime) * 0.01;
            plane.rotation.z += Math.sin(deltaTime) * 0.01;

            // Update geometry crinkles
            const position = plane.geometry.attributes.position;
            for (let j = 0; j < position.count; j++) {
                const x = position.getX(j);
                const y = position.getY(j);
                const crinkle = Math.sin(time * crinkleFrequency + x + y) * crinkleAmplitude;
                const warp = Math.sin(time * warpFrequencyX + x) * warpAmplitude +
                             Math.cos(time * warpFrequencyY + y) * warpAmplitude;
                position.setZ(j, crinkle + warp);
            }
            position.needsUpdate = true;

            // Recycle plane if it moves out of bounds
            if (plane.position.x < -34) {
                this.scene.remove(plane);
                this.activePlanes.splice(i, 1);
                this.pool.push(plane); // Return to pool
            }
        }
    }

    update(deltaTime) {
        this.spawnCooldown -= deltaTime;
        if (this.spawnCooldown <= 0) {
            this.spawnPlane();
            this.spawnCooldown = THREE.MathUtils.randFloat(1, 3); // Reset spawn interval
        }

        this.updatePlanes(deltaTime);
    }
}

export default Fabric;
