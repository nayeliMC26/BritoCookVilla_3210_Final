import { Group, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Obstacles extends Group {
    constructor() {
        super();

        this.loader = new GLTFLoader();
        this.pool = []; // Pool of obstacles
        this.activeObstacles = []; // Obstacles currently in the scene
        this.timeElapsed = 0; // Initialize timeElapsed for speed calculation
        this.speedFactor = 0.1; // Initial speed
        this.speedIncreaseRate = 0.001; // Rate at which speed increases
        this.resetThreshold = -34; // X position to reset obstacles
        this.spawnInterval = 30; // Average interval between obstacles

        this.initPool(5); // Initialize the pool with 5 blocks
    }

    initPool(size) {
        const modelPaths = ["../models/box.glb", "../models/hole.glb"];
        const models = [];

        // Load box.glb
        this.loader.load(modelPaths[0], (gltf) => {
            this.applyMetalnessToModel(gltf.scene); // Apply metalness to the box model
            models.push({ scene: gltf.scene, hasHole: false });// Store the box model
            this.checkModelsLoaded(size, models);
        });

        // Load hole.glb
        this.loader.load(modelPaths[1], (gltf) => {
            this.applyMetalnessToModel(gltf.scene); // Apply metalness to the box model
            models.push({ scene: gltf.scene, hasHole: true }); // Store the hole model
            this.checkModelsLoaded(size, models);
        });
    }

    // Method to apply metalness to all meshes in a scene
    applyMetalnessToModel(scene) {
        scene.traverse((child) => {
            if (child.isMesh) {
                // If the material is not already a MeshStandardMaterial, we create one
                if (!(child.material instanceof MeshStandardMaterial)) {
                    child.material = new MeshStandardMaterial();
                }
                
                // Set metalness and other properties (you can customize these values)
                child.material.metalness = 0.2; // Set the metalness to a high value
                child.material.roughness = 0.5; // Set the roughness to a lower value for a shinier appearance
                child.material.envMapIntensity = 1; // Optional: Set the environment map intensity
            }
        });
    }

    // Check if both models are loaded before initializing the pool
    checkModelsLoaded(size, models) {
        if (models.length === 2) {
            // Proceed with creating the pool of obstacles
            for (let i = 0; i < size; i++) {
                // Randomly pick a model from the loaded ones
                const randomModel = models[Math.floor(Math.random() * models.length)];
                const obstacleClone = randomModel.scene.clone();
                obstacleClone.scale.set(4, 4, 4); // Same scaling as before
                obstacleClone.castShadow = true;
                obstacleClone.receiveShadow = true;

                obstacleClone.hasHole = randomModel.hasHole;

                this.pool.push(obstacleClone);
            }

            console.log(`Obstacle pool initialized with ${this.pool.length} obstacles.`);
        }
    }

    addObstacle() {
        if (this.pool.length > 0) {
            const obstacle = this.pool.pop();

            // Set random position along the X-axis and fixed Y position
            obstacle.position.set(
                Math.random() * 100 + 34, // Random X position
                1, // Fixed Y position
                0 // Fixed Z position
            );

            this.add(obstacle);
            this.activeObstacles.push(obstacle);
            console.log("Obstacle added at:", obstacle.position);
        } else {
            console.log("No obstacles left in pool to add.");
        }
    }

    recycleObstacle(obstacle) {
        console.log("Recycling obstacle at:", obstacle.position);
        this.remove(obstacle);
        this.pool.push(obstacle);
    }

    update(deltaTime) {
        this.timeElapsed += deltaTime;
        this.speedFactor += this.speedIncreaseRate * deltaTime; // Speed up with time

        // Move active obstacles and recycle if necessary
        this.activeObstacles.forEach((obstacle) => {
            obstacle.position.x -= this.speedFactor;

            if (obstacle.position.x < this.resetThreshold) {
                this.recycleObstacle(obstacle);
            }
        });

        // Remove recycled obstacles from the active array
        this.activeObstacles = this.activeObstacles.filter(
            (obstacle) => obstacle.position.x >= this.resetThreshold
        );

        // Randomly add new obstacles based on interval
        if (Math.random() < 1 / this.spawnInterval) {
            this.addObstacle();
        }
    }
}

export default Obstacles;
