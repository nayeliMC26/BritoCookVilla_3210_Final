import * as THREE from "three";

class Skyscrapers {
    constructor(scene) {
        this.scene = scene;
        this.pool = [];
        this.activePlanes = [];
        this.planeCount = 200; // Number of planes
        this.textures = [];
        this.xBounds = { min: -200, max: 200 }; // Reset bounds for planes
        this.yBounds = { min: -50, max: 0 }; // Vertical spawn range
        this.zBounds = { min: -200, max: -50 }; // Depth range
        this.lightsPerPlane = 100;
        this.init();
    }

    init() {
        // Load textures
        const loader = new THREE.TextureLoader();
        this.textures.push(loader.load("../textures/building1.png"));
        this.textures.push(loader.load("../textures/building2.png"));
        this.textures.push(loader.load("../textures/building3.png"));
        this.textures.push(loader.load("../textures/building4.png"));

        // Preload planes into the pool
        for (let i = 0; i < this.planeCount; i++) {
            const material = new THREE.MeshStandardMaterial({
                map: this.getRandomTexture(),
                side: THREE.DoubleSide,
                transparent: true,
            });

            const geometry = new THREE.PlaneGeometry(1, 1);
            const plane = new THREE.Mesh(geometry, material);

            // Set initial random properties
            const randomHeight = Math.random() * 40 + 70; // Height between 10 and 30
            plane.scale.set(20, randomHeight, 20);
            plane.position.set(
                Math.random() * (this.xBounds.max - this.xBounds.min) +
                    this.xBounds.min,
                Math.random() * (this.yBounds.max - this.yBounds.min) +
                    this.yBounds.min,
                Math.random() * (this.zBounds.max - this.zBounds.min) +
                    this.zBounds.min
            );

            plane.castShadow = true;
            plane.receiveShadow = true;

            this.pool.push(plane);
        }

        // Spawn initial active planes
        for (let i = 0; i < this.planeCount; i++) {
            this.addPlane();
        }
    }

    getRandomTexture() {
        const index = Math.floor(Math.random() * this.textures.length);
        return this.textures[index];
    }

    addPlane() {
        if (this.pool.length > 0) {
            const plane = this.pool.pop();
            plane.position.x =
                Math.random() * (this.xBounds.max - this.xBounds.min) +
                this.xBounds.min;
            this.scene.add(plane);
            this.activePlanes.push(plane);
        }
    }

    update(deltaTime) {
        this.activePlanes.forEach((plane) => {
            // Move the plane
            plane.position.x -= deltaTime * 5; // Adjust speed as needed

            // Reset the plane if it moves out of bounds
            if (plane.position.x < this.xBounds.min) {
                plane.position.x = this.xBounds.max;
                plane.position.y =
                    Math.random() * (this.yBounds.max - this.yBounds.min) +
                    this.yBounds.min;
                plane.position.z =
                    Math.random() * (this.zBounds.max - this.zBounds.min) +
                    this.zBounds.min;
            }
        });
    }
}

export default Skyscrapers;
