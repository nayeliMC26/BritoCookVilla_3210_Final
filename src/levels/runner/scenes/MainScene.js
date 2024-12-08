import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// import DistortionShader from "../shaders/DistortionShader.js";
import Camera from "../core/Camera.js";
import Player from "../objects/Player.js";
import Buildings from "../objects/Buildings.js";
import { AmbientLight, DirectionalLight, DirectionalLightHelper } from "three";

class MainScene {
    constructor(renderer) {
        this.lastTime = performance.now(); // Initialize lastTime for deltaTime calculation

        // Initialize core elements
        this.container = document.getElementById("canvas");
        this.renderer = renderer;
        this.camera = new Camera();
        this.scene = new THREE.Scene();
        this.player = new Player();
        this.buildings = new Buildings();

        // Set up event listeners and other initializations
        this.lastJumpState = false;
        this.lastSlideState = false;

        // Add lighting
        this.ambientLight = new AmbientLight(0xffffff, 0.5);
        this.directionalLight = new DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 10, 7.5);
        this.lightHelper = new DirectionalLightHelper(this.directionalLight, 5);

        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);
        this.scene.add(this.lightHelper);
        this.scene.add(this.player);
        this.scene.add(this.buildings);

        // Initialize post-processing
        this.setupComposer();

        this.started = false;
    }

    // Define init method for setup logic
    init() {
        // This is the method that gets called when the level is activated
        console.log("Initializing MainScene...");

        // Put your setup logic here (e.g., set initial player position, etc.)
        this.started = false;
    }

    setupComposer() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // this.effect = new ShaderPass(DistortionShader());
        // this.composer.addPass(this.effect);
        // this.effect.renderToScreen = true;

        // this.configureDistortion();
    }

    // No longer in use
    // configureDistortion() {
    //     const horizontalFOV = 140;
    //     const strength = 0.3;
    //     const cylindricalRatio = 2;

    //     const height =
    //         Math.tan(THREE.MathUtils.degToRad(horizontalFOV) / 2) /
    //         this.camera.aspect;

    //     this.camera.fov = (Math.atan(height) * 2 * 180) / Math.PI;
    //     this.camera.updateProjectionMatrix();

    //     this.effect.uniforms["strength"].value = strength;
    //     this.effect.uniforms["height"].value = height;
    //     this.effect.uniforms["aspectRatio"].value = this.camera.aspect;
    //     this.effect.uniforms["cylindricalRatio"].value = cylindricalRatio;
    // }

    addEventListeners() {
        window.addEventListener("resize", this.handleResize.bind(this));
    }

    handleResize() {
        this.camera.resize();
        this.renderer.resize();
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
            this.player.update();
            this.buildings.update();

            const isJumping = this.player.isJumping;
            const isSliding = this.player.isSliding;

            // Update camera with player's current actions
            this.camera.update(deltaTime, isJumping, isSliding);

            // Check collisions
            console.log(this.buildings.checkCollisions(this.player));
        }
    }

    start() {
        console.log("Starting the Runner game...");
        this.started = true;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
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
