import {
    Group,
    TextureLoader,
    MeshStandardMaterial,
    Box3,
    Vector3,
    Color,
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

        // Load the roughness map
        const roughnessMap = this.textureLoader.load(
            "../public/textures/roughnessMap.jpg"
        );

        // Preload the ground model
        this.loader.load("../public/models/block1.glb", (gltf) => {
            const groundModel = gltf.scene;

            // Apply roughness to the ground model
            groundModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    const existingMaterial = child.material;

                    child.material = new MeshStandardMaterial({
                        map: existingMaterial.map,
                        color: existingMaterial.color,
                        roughness: 1.0,
                        roughnessMap: roughnessMap,
                        normalMap: existingMaterial.normalMap,
                        metalness: existingMaterial.metalness,
                        metalnessMap: existingMaterial.metalnessMap,
                    });
                }
            });

            // Load both window collections
            this.loader.load(
                "../public/models/windowCollection1.glb",
                (wallGltf1) => {
                    const wallModel1 = wallGltf1.scene;
                    this.applyEmissiveMaterial(wallModel1); // Apply emissive material

                    this.loader.load(
                        "../public/models/windowCollection2.glb",
                        (wallGltf2) => {
                            const wallModel2 = wallGltf2.scene;
                            this.applyEmissiveMaterial(wallModel2); // Apply emissive material

                            // Preload the combined ground and wall into the pool
                            for (let i = 0; i < 3; i++) {
                                const groundClone = groundModel.clone();
                                groundClone.scale.set(10, 1, 7); // Adjust scale for ground
                                groundClone.position.set(i * 10, 0, 0);

                                // Randomly pick between wallModel1 and wallModel2
                                const wallClone =
                                    Math.random() > 0.5
                                        ? wallModel1.clone()
                                        : wallModel2.clone();
                                wallClone.scale.set(0.49, 3, 1); // Adjust scale for walls
                                wallClone.position.set(0, -4, -0.4); // Position walls relative to the ground

                                // Add walls as a child of the ground clone
                                groundClone.add(wallClone);

                                this.pool.push(groundClone);
                            }

                            // Initialize active buildings
                            for (let i = 0; i < 3; i++) {
                                this.addBuilding();
                            }
                        }
                    );
                }
            );
        });
    }

    // Apply emissive material to the walls
    applyEmissiveMaterial(wallModel) {
        wallModel.traverse((child) => {
            if (child.isMesh && child.material) {
                const existingMaterial = child.material;

                // Create a material with emissive properties
                child.material = new MeshStandardMaterial({
                    map: existingMaterial.map, // Base texture
                    color: existingMaterial.color, // Base color
                    emissive: new Color(0xffffff), // White emission
                    emissiveIntensity: 1, // Adjust brightness
                    emissiveMap: existingMaterial.map, // Use the same texture for emission
                    roughness: existingMaterial.roughness,
                    metalness: existingMaterial.metalness,
                });
            }
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

    update() {
        const resetPositionX = this.activeBuildings.length * 34 / 2; // Position where buildings should reset

        // Move all active buildings
        this.activeBuildings.forEach((building, index) => {
            building.position.x -= 0.1;

            // If the building goes past the left side of the screen, reset it to the right
            if (building.position.x < -resetPositionX) {
                // Reset the position of the building based on the index, but add a constant offset to make it move offscreen
                building.position.x = resetPositionX;
            }
        });
    }

    checkCollisions(player) {
        // Create a bounding box for the player
        const playerBox = new Box3().setFromObject(player);

        for (const box of this.collisionBoxes) {
            if (box.intersectsBox(playerBox)) {
                // Find the direction of the collision
                const cubeCenter = new Vector3();
                const playerCenter = new Vector3();
                box.getCenter(cubeCenter);
                playerBox.getCenter(playerCenter);

                // Determine relative position
                const relativePosition = cubeCenter.sub(playerCenter);

                if (
                    Math.abs(relativePosition.x) > Math.abs(relativePosition.z)
                ) {
                    if (relativePosition.x > 0) {
                        return "right"; // Cube is to the player's right
                    } else {
                        return "left"; // Cube is to the player's left
                    }
                } else {
                    if (relativePosition.z > 0) {
                        return "front"; // Cube is in front of the player
                    } else {
                        return "back"; // Cube is behind the player
                    }
                }
            }
        }

        return null; // No collision detected
    }
}

export default Buildings;
