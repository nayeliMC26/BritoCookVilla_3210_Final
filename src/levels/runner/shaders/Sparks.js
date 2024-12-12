import * as THREE from "three";

class Sparks {
    constructor(scene) {
        this.scene = scene;
        this.sparksCount = 200; // Number of sparks
        this.pool = []; // Pool of sparks
        this.spawnPoint = new THREE.Vector3(1.8, 0, 0); // Spawn point for sparks (player's position)
        this.xVelocityRange = [-5, 1]; // Range of horizontal velocities
        this.yVelocityRange = [5, 10]; // Range of vertical velocities
        this.zVelocityRange = [-2, 2]; // Range of forward/backward velocities
        this.gravity = -0.3; // Gravity affecting sparks
        this.init();
    }

    init() {
        // Geometry and material for the sparks
        const sparkMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaf26, // Spark color (orange)
            transparent: true,
            opacity: 0.5,
            emissive: 0xff9021,
            emissiveIntensity: 2,
        });

        // Create spark mesh for each spark
        for (let i = 0; i < this.sparksCount; i++) {
            const spark = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), sparkMaterial);
            spark.visible = false; // Sparks start invisible
            this.scene.add(spark);
            this.pool.push({
                mesh: spark,
                velocity: new THREE.Vector3(), // Velocity of each spark
                initialPosition: new THREE.Vector3(), // Initial position of the spark
            });
        }
    }

    spawnSparks() {
        // Pick a spark from the pool that is not visible
        const spark = this.pool.find(s => !s.mesh.visible);

        if (spark) {
            // Set the spark's position to the spawn point (player's position)
            spark.mesh.position.set(this.spawnPoint.x, this.spawnPoint.y, this.spawnPoint.z);

            // Set a random velocity for the spark
            spark.velocity.set(
                Math.random() * (this.xVelocityRange[1] - this.xVelocityRange[0]) + this.xVelocityRange[0], // Random x velocity
                Math.random() * (this.yVelocityRange[1] - this.yVelocityRange[0]) + this.yVelocityRange[0], // Random y velocity
                Math.random() * (this.zVelocityRange[1] - this.zVelocityRange[0]) + this.zVelocityRange[0]  // Random z velocity
            );

            // Make the spark visible
            spark.mesh.visible = true;
        }
    }

    update(deltaTime) {
        // Update the sparks' positions and apply gravity
        this.pool.forEach(spark => {
            if (spark.mesh.visible) {
                // Update position based on velocity
                spark.mesh.position.add(spark.velocity.clone().multiplyScalar(deltaTime));

                // Apply gravity to the vertical velocity
                spark.velocity.y += this.gravity;

                // If the spark reaches y <= 0, reset it
                if (spark.mesh.position.y <= 0) {
                    // Reset spark position
                    spark.mesh.position.set(this.spawnPoint.x, this.spawnPoint.y, this.spawnPoint.z);

                    // Reset the velocity
                    spark.velocity.set(
                        Math.random() * (this.xVelocityRange[1] - this.xVelocityRange[0]) + this.xVelocityRange[0],
                        Math.random() * (this.yVelocityRange[1] - this.yVelocityRange[0]) + this.yVelocityRange[0],
                        Math.random() * (this.zVelocityRange[1] - this.zVelocityRange[0]) + this.zVelocityRange[0]
                    );

                    // Reset visibility to make it reusable
                    spark.mesh.visible = false;
                }
            }
        });
    }
}

export default Sparks;
