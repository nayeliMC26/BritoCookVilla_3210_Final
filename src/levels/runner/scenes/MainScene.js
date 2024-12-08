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
        // Initialize core elements
        this.container = document.getElementById("canvas");
        this.renderer = renderer
        // this.container.appendChild(this.renderer.domElement);

        this.camera = new Camera();
        this.scene = new THREE.Scene();

        // Add objects
        this.player = new Player();
        this.buildings = new Buildings();

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

        // Event handlers and animation loop
        this.addEventListeners();
        this.animate();
    }

    setupComposer() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        // this.effect = new ShaderPass(DistortionShader());
        // this.composer.addPass(this.effect);
        // this.effect.renderToScreen = true;

        // this.configureDistortion();
    }

    configureDistortion() {
        const horizontalFOV = 140;
        const strength = 0.3;
        const cylindricalRatio = 2;

        const height =
            Math.tan(THREE.MathUtils.degToRad(horizontalFOV) / 2) / this.camera.aspect;

        this.camera.fov = (Math.atan(height) * 2 * 180) / Math.PI;
        this.camera.updateProjectionMatrix();

        this.effect.uniforms["strength"].value = strength;
        this.effect.uniforms["height"].value = height;
        this.effect.uniforms["aspectRatio"].value = this.camera.aspect;
        this.effect.uniforms["cylindricalRatio"].value = cylindricalRatio;
    }

    addEventListeners() {
        window.addEventListener("resize", this.handleResize.bind(this));
    }

    handleResize() {
        this.camera.resize();
        this.renderer.resize();
    }

    animate() {
        // Update and render the scene
        this.update();
        this.composer.render();

        // Apply simple distortion directly on the camera
        // this.camera.applyDistortion(this.renderer.renderer);

        requestAnimationFrame(this.animate.bind(this));
    }

    update() {
        this.player.update();
        this.buildings.update();

        // Check collisions
        console.log(this.buildings.checkCollisions(this.player));
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
