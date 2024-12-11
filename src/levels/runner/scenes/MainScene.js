import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"; // Add this import
import Camera from "../core/Camera.js";
import Player from "../objects/Player.js";
import Buildings from "../objects/Buildings.js";
import {
    AmbientLight,
    DirectionalLight,
    DirectionalLightHelper,
    RectAreaLight,
} from "three";
import RainEffect from "../shaders/RainEffect.js";
import GlowingParticles from "../shaders/GlowingParticles.js";
import Background from "../objects/Background.js";
import Obstacles from "../objects/Obstacles.js";

class MainScene {
    constructor(renderer) {
        this.lastTime = performance.now(); // Initialize lastTime for deltaTime calculation

        // Initialize core elements
        this.container = document.getElementById("canvas");
        this.renderer = renderer;
        this.camera = new Camera();
        this.scene = new THREE.Scene();
        this.player = new Player(this.scene);
        this.buildings = new Buildings();
        this.obstacles = new Obstacles();
        this.scene.add(this.obstacles);

        // Set up event listeners and other initializations
        this.lastJumpState = false;
        this.lastSlideState = false;

        this.ambientLight = new AmbientLight(0xffffff, 0.2); // Existing ambient light

        // Create front RectAreaLight
        this.rectAreaLightFront = new RectAreaLight(0x0000ff, 2, 10, 10); // (color, intensity, width, height)
        this.rectAreaLightFront.position.set(10, 10, 15);
        this.rectAreaLightFront.lookAt(0, 0, 0); // Make it face the scene's center

        // Create rear RectAreaLight
        this.rectAreaLightRear = new RectAreaLight(0xff0000, 2, 10, 10); // (color, intensity, width, height)
        this.rectAreaLightRear.position.set(-10, 10, 15);
        this.rectAreaLightRear.lookAt(0, 0, 0); // Make it face the scene's center

        // Create moonlight
        this.moonLight = new DirectionalLight(0xfcfcd7, 0.5); // Soft yellow moonlight (color, intensity)
        this.moonLight.position.set(100, 50, -50); // Position high above and angled

        this.moonLight.castShadow = true; // Ensure the light casts shadows

        // Set the shadow properties (optional but recommended)
        this.moonLight.shadow.mapSize.width = 2048;
        this.moonLight.shadow.mapSize.height = 2048;
        this.moonLight.shadow.camera.near = 0.1;
        this.moonLight.shadow.camera.far = 2000;

        // Add lights and helpers to the scene
        this.scene.add(this.ambientLight);

        this.scene.add(this.rectAreaLightFront);
        this.scene.add(this.rectAreaLightRear);

        this.scene.add(this.moonLight);

        this.scene.add(this.player);
        this.scene.add(this.buildings);

        this.background = new Background(this.scene);
        this.scene.add(this.background);

        this.rain = new RainEffect(this.scene);
        this.glowingParticles = new GlowingParticles(this.scene);

        // Initialize post-processing
        this.setupComposer();

        this.started = false;
    }

    // Define init method for setup logic
    init() {
        console.log("Initializing MainScene...");

        // Put your setup logic here (e.g., set initial player position, etc.)
        this.started = false;
    }

    setupComposer() {
        // Create the composer for post-processing
        this.composer = new EffectComposer(this.renderer);

        // Add a render pass to the composer
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // Set up the Bloom pass
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), // Resolution
            10, // Bloom strength (higher value means more glow)
            1.4, // Bloom radius
            0.2 // Bloom threshold (lower value means more parts of the scene will bloom)
        );

        // Add the bloom pass to the composer
        this.composer.addPass(bloomPass);
    }

    addEventListeners() {
        window.addEventListener("resize", this.handleResize.bind(this));
    }

    handleResize() {
        this.camera.resize();
        this.renderer.resize();
    }

    checkCollisions() {
        const playerBox = this.player.getCollisionBox(); // This should return a Box3

        // Iterate over obstacles
        this.obstacles.children.forEach((obstacle) => {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle); // Create a Box3 for the obstacle

            // Check if the player's Box3 intersects the obstacle's Box3
            if (playerBox.intersectsBox(obstacleBox)) {
                // Check if the obstacle has a hole and if the player is not below the hole
                if (obstacle.hasHole) {
                    // Check if player is above the hole
                    if (playerBox.max.y <= 2) {
                        // If the player's top is above y<2, treat as a valid pass-through
                        console.log("Player passes through hole.");
                    }
                } else {
                    // If the obstacle doesn't have a hole, a collision is detected
                    console.log("Collision detected with obstacle!");
                }
            }
        });
    }

    animate() {
        // Calculate deltaTime
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Time in seconds
        this.lastTime = now;

        // Update and render the scene
        this.update(deltaTime);
        this.composer.render(); // Ensure post-processing is done here
        this.render(); // Explicitly call render if needed

        // Continue the animation loop
        requestAnimationFrame(this.animate.bind(this)); // Continuously call animate
    }

    update(deltaTime) {
        if (this.started) {
            this.player.update(deltaTime);
            this.buildings.update(deltaTime);
            this.obstacles.update(deltaTime);

            const isJumping = this.player.isJumping;
            const isSliding = this.player.isSliding;

            this.rain.update(deltaTime);
            this.glowingParticles.update(deltaTime);

            // Update camera with player's current actions
            this.camera.update(deltaTime, isJumping, isSliding);

            // Check for collisions
            this.checkCollisions();
        }
    }

    start() {
        console.log("Starting the Runner game...");
        this.started = true;
    }

    render() {
        this.composer.render();
    }

    clear() {
        console.log("Clearing the scene...");

        // Dispose geometries and materials of objects in the scene
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            this.scene.remove(child);
        }

        console.log("Scene cleared.");
    }
}

export default MainScene;
