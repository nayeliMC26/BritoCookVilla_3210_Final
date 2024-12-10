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
                        roughness: 1.0, // Roughness for base
                        roughnessMap: roughnessMap, // Add roughness map
                        depthWrite: true,
                    });
                }
            });

            // Preload walls and ground into the pool
            this.loader.load(
                "../models/windowCollection1.glb",
                (wallGltf1) => {
                    const wallModel1 = wallGltf1.scene;
                    this.applyEmissiveMaterial(wallModel1);

                    this.loader.load(
                        "../models/windowCollection2.glb",
                        (wallGltf2) => {
                            const wallModel2 = wallGltf2.scene;
                            this.applyEmissiveMaterial(wallModel2);

                            for (let i = 0; i < 10; i++) {
                                const groundClone = groundModel.clone();
                                groundClone.scale.set(10, 1, 7);
                                groundClone.position.set(i * 10, 0, 0);

                                // Add puddles to the ground
                                this.addPuddles(groundClone);

                                const wallClone =
                                    Math.random() > 0.5
                                        ? wallModel1.clone()
                                        : wallModel2.clone();
                                wallClone.scale.set(0.49, 3, 1);
                                wallClone.position.set(0, -4, -0.4);

                                groundClone.add(wallClone);

                                this.pool.push(groundClone);
                            }

                            for (let i = 0; i < 10; i++) {
                                this.addBuilding();
                            }
                        }
                    );
                }
            );
        });
    }

    addPuddles(groundModel) {
        const puddleMaterial = new MeshStandardMaterial({
            color: 0xffffff, // Slightly blue tint for the water
            metalness: 0.9, // High reflectivity
            roughness: 0.0, // Very smooth surface
            transparent: true, // Allow slight transparency
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
        const resetPositionX = (this.activeBuildings.length * 34) / 2;

        this.activeBuildings.forEach((building) => {
            building.position.x -= 0.1;

            if (building.position.x < -resetPositionX) {
                building.position.x = resetPositionX;
            }
        });
    }
}

export default Buildings;
