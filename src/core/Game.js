import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import InputHandler from "../levels/platformer/utils/InputHandler.js";
import Platformer from "../levels/platformer/Platformer.js";
import EscapeRoom from "../levels/escapeRoom/Scene.js";
import Runner from "../levels/runner/scenes/MainScene.js";


class Game {
    constructor(renderer) {
        // Renderer will be passed in from main
        this.renderer = renderer;
        // Enable shadows in the renderer
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // Create an inputHandler instance
        this.inputHandler = new InputHandler();
        this.inputHandler.keyboardControls();

        this.levelIndex = 0;
        // Create new levels
        this.levels = [
            new Platformer(this.inputHandler),
            new EscapeRoom(this.renderer),
            new Runner(this.renderer),
        ];
        // Switch/start with level 0
        this.switchLevel(0);
        // Clock for deltaTime
        this.clock = new THREE.Clock();
    }

    /**
     * A function to switch levels based on its index
     * @param {*} index
     */
    switchLevel(index) {
        // If there is an active level, clear it first
        /* Note as of now I don't have a way of switching back without resetting up the scene */
        if (this.activeLevel) {
            console.log(`Clearing active level ${this.levelIndex}`);
            this.activeLevel.clear();
        }

        // Set the active level again
        this.activeLevel = this.levels[index];
        this.levelIndex = index;

        console.log(`Switched to level ${index}`);

        // Call init to initialize the new level
        this.activeLevel.init();
        console.log(`Scene setup completed for level ${index}`);

        // If the new level is the Runner level, start its movement
        if (this.activeLevel instanceof Runner) {
            this.activeLevel.start(); // Start the Runner game when it becomes active
        }

        // Add orbit controls for debugging
        // if (this.activeLevel.camera) {
        // this.controls = new OrbitControls(this.activeLevel.camera, this.renderer.domElement);
        // this.controls.update();
        // }
    }

    update(deltaTime) {
        // Handle level switching
        if (this.inputHandler.key1 && this.levelIndex !== 0) {
            console.log("Switching to level 0");
            this.switchLevel(0);
        } else if (this.inputHandler.key2 && this.levelIndex !== 1) {
            console.log("Switching to level 1");
            this.switchLevel(1);
        } else if (
            this.inputHandler.key3 &&
            this.levelIndex !== 2 &&
            this.levels[2]
        ) {
            console.log("Switching to level 2");
            this.switchLevel(2);
        }

        if (this.activeLevel) {
            this.activeLevel.update(deltaTime);
        }
    }

    start() {
        var gameLoop = () => {
            this.stats.update();
            var deltaTime = this.clock.getDelta();

            // Update active level
            this.update(deltaTime);

            // Render active level scene
            if (this.activeLevel) {
                this.renderer.render(
                    this.activeLevel.scene,
                    this.activeLevel.camera
                );
            }

            // Request the next frame
            requestAnimationFrame(gameLoop);
        };
        // Start the game loop
        gameLoop();
    }

    onResize(width, height) {
        if (this.activeLevel) {
            this.activeLevel.camera.aspect = width / height;
            this.activeLevel.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(width, height);
    }
}

export default Game;
