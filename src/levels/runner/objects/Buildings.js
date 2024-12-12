import {
    Group,
    TextureLoader,
    MeshStandardMaterial,
    CylinderGeometry,
    Mesh,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class Buildings extends Group {
    constructor() {
        super();

        this.loader = new GLTFLoader();
        this.textureLoader = new TextureLoader();
        this.pool = [];
        this.activeBuildings = [];
        this.collisionBoxes = [];
        this.timeElapsed = 0; // Initialize timeElapsed for speed calculation
        this.speedFactor = 0.1; // Initial speed
        this.speedIncreaseRate = 0.001; // Rate at which speed increases

        // Load the roughness map
        const roughnessMap = this.textureLoader.load(
            "../textures/gr1_roughnessmap.jpg"
        );

        // Preload the ground model
        this.loader.load("../models/block1.glb", (gltf) => {
            const groundModel = gltf.scene;

            // Apply roughness and puddle maps to the ground model
            groundModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    const existingMaterial = child.material;

                    child.material = new MeshStandardMaterial({
                        map: existingMaterial.map, // Base color map
                        color: existingMaterial.color, // Base color
                        roughnessMap: roughnessMap, // Add roughness map
                        roughness: 1.0, // Roughness for base
                        metalness: 0.01,
                        depthWrite: true,
                    });
                }

                // Enable shadows for the mesh
                child.castShadow = true;
                child.receiveShadow = true;
            });

            // Preload walls and ground into the pool
            this.loader.load("../models/windowCollection1.glb", (wallGltf1) => {
                const wallModel1 = wallGltf1.scene;
                this.applyEmissiveMaterial(wallModel1);

                this.loader.load(
                    "../models/windowCollection2.glb",
                    (wallGltf2) => {
                        const wallModel2 = wallGltf2.scene;
                        this.applyEmissiveMaterial(wallModel2);

                        this.loader.load(
                            "../models/windowCollection3.glb",
                            (wallGltf3) => {
                                const wallModel3 = wallGltf3.scene;
                                this.applyEmissiveMaterial(wallModel3);

                                this.loader.load(
                                    "../models/windowCollection4.glb",
                                    (wallGltf4) => {
                                        const wallModel4 = wallGltf4.scene;
                                        this.applyEmissiveMaterial(wallModel4);

                                        // Create 10 buildings (ground + walls)
                                        for (let i = 0; i < 10; i++) {
                                            const groundClone =
                                                groundModel.clone();
                                            groundClone.scale.set(10, 1, 7);
                                            groundClone.position.set(
                                                i * 10,
                                                0,
                                                0
                                            );

                                            // Add puddles to the ground
                                            this.addPuddles(groundClone);

                                            const wallClone =
                                                this.getRandomWallClone(
                                                    wallModel1,
                                                    wallModel2,
                                                    wallModel3,
                                                    wallModel4
                                                );
                                            wallClone.scale.set(0.49, 3, 1);
                                            wallClone.position.set(0, -4, -0.4);

                                            groundClone.add(wallClone);

                                            this.pool.push(groundClone);
                                        }

                                        // Add 10 buildings to the scene after everything is loaded
                                        for (let i = 0; i < 10; i++) {
                                            this.addBuilding();
                                        }
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    }

    getRandomWallClone(wallModel1, wallModel2, wallModel3, wallModel4) {
        const walls = [wallModel1, wallModel2, wallModel3, wallModel4];
        const randomIndex = Math.floor(Math.random() * walls.length);
        return walls[randomIndex].clone();
    }

    addPuddles(groundModel) {
        const puddleMaterial = new MeshStandardMaterial({
            color: 0x0aaaaa, // Slightly blue tint for the water
            metalness: 0.9, // High reflectivity
            roughness: 0.0, // Very smooth surface
            transparent: true, // Allow slight transparency
            alphaTest: true,
            opacity: 0.2, // Slightly transparent
            depthWrite: true,
            depthTest: true,
        });

        const puddleCount = 10; // Number of puddles to create
        const groundBounds = { x: 34, z: 0.5 }; // Adjust based on ground size

        for (let i = 0; i < puddleCount; i++) {
            const radius = Math.random() * 0.1 + 0.1; // Random radius between 0.5 and 1.0
            const puddleGeometry = new CylinderGeometry(
                radius,
                radius,
                0.01,
                32
            ); // Thin cylinder
            const puddle = new Mesh(puddleGeometry, puddleMaterial);

            // Randomize puddle position
            puddle.position.set(
                Math.random() * groundBounds.x - groundBounds.x / 10,
                0.01, // Slightly above ground level to avoid z-fighting
                Math.random() * groundBounds.z - groundBounds.z / 2
            );

            // Enable shadow receiving for puddles
            puddle.receiveShadow = true;

            groundModel.add(puddle);
        }
    }

    // Apply emissive material to the walls
    applyEmissiveMaterial(wallModel) {
        wallModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const existingMaterial = child.material;

                child.material = new MeshStandardMaterial({
                    map: existingMaterial.map, // Base texture
                    color: existingMaterial.color, // Base color
                    alphaTest: true,
                    transparent: true,
                    depthTest: true,
                    depthWrite: true,
                });
            }

            // Enable shadows for the wall model
            child.castShadow = true;
            child.receiveShadow = true;
        });
    }

    addBuilding() {
        if (this.pool.length > 0) {
            const building = this.pool.pop();
            building.position.set(this.activeBuildings.length * 34, 0, 0);

            this.add(building);
            this.activeBuildings.push(building);
        }
    }

    update(deltaTime) {
        // Increase the speed over time
        this.timeElapsed += deltaTime;
        this.speedFactor += this.speedIncreaseRate * deltaTime; // Speed up with time

        const resetPositionX = (this.activeBuildings.length * 34) / 2;

        this.activeBuildings.forEach((building) => {
            // Apply the speed factor to building movement
            building.position.x -= this.speedFactor;

            if (building.position.x < -resetPositionX) {
                building.position.x = resetPositionX;
            }
        });
    }
}

export default Buildings;
