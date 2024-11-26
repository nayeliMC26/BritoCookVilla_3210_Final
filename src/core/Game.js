import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import InputHandler from '../utils/InputHandler.js';
import Player from '../entities/Player.js';
import PhysicsEngine from '../utils/PhysicsEngine.js';
import LevelManager from '../levels/LevelManager.js';
import Stats from 'three/examples/jsm/libs/stats.module'

class Game {
    constructor(renderer) {
        // Renderer will be passed in from main
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Temporary for debugging
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom)


        // Create an inputHandler instance
        this.inputHandler = new InputHandler();
        this.inputHandler.keyboardControls();

        // Create a new physics engine instance
        this.physicsEngine = new PhysicsEngine(this.scene);

        // three body problem ??? ez !

        // Create player and add to the physics engine
        this.player = new Player(this.scene, this.inputHandler, this.physicsEngine);

        // Initialize the level manager
        this.levelManager = new LevelManager(this.scene, this.player, this.physicsEngine);
        this.sceneSetup();

        // Set up levels
        this.initLevels();

        // Clock for deltaTime
        this.clock = new THREE.Clock();
    }

    // Set up the scene (camera, lights, etc.)
    sceneSetup() {
        // Set the camera position
        this.camera.position.set(0, 10, 50);
        this.camera.lookAt(new THREE.Vector3(0, 5, 0));

        // Add ambient lighting to the scene
        var ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);

        // Add a directional light
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 30, 10);
        this.scene.add(directionalLight);

        var gridHelper = new THREE.GridHelper(100, 20);
        this.scene.add(gridHelper);
    }


    initLevels() {
        // Define and add levels to the level manager
        this.levelManager.addLevel({
            spawnPoint: { x: 0, y: 10, z: 0 },
            platforms: [
                { x: 0, y: 0, z: 0, width: 30, height: 1, depth: 20 },
                { x: 40, y: 2, z: 0, width: 20, height: 1, depth: 20 },
            ],
        });

        this.levelManager.addLevel({
            spawnPoint: { x: -30, y: 15, z: 0 },
            platforms: [
                { x: -10, y: 0, z: 0, width: 40, height: 1, depth: 20 },
                { x: -30, y: 5, z: 0, width: 15, height: 1, depth: 10 },
                {x: 10, y: 12, z: 2, width: 5, height: 2, depth: 10 }
            ],
        });

        this.levelManager.addLevel({
            spawnPoint: { x: 15, y: 20, z: 0 },
            platforms: [
                { x: 20, y: 0, z: 0, width: 50, height: 1, depth: 30 },
                { x: 15, y: 10, z: 0, width: 10, height: 1, depth: 10 },
            ],
        });

        // Load the first level by default
        this.levelManager.loadLevel(0);
    }

    update(deltaTime) {
        // Update the player and other game logic
        this.player.update(deltaTime, this.physicsEngine.objects);

        // Handle level switching
        if (this.inputHandler.key1) {
            this.levelManager.loadLevel(0);
        }
        if (this.inputHandler.key2) {
            this.levelManager.loadLevel(1);
        }
        if (this.inputHandler.key3) {
            this.levelManager.loadLevel(2);
        }
    }


    start() {
        var gameLoop = () => {
            this.stats.update();
            var deltaTime = this.clock.getDelta();

            // Update the physics engine and game state
            this.physicsEngine.update(deltaTime);
            this.update(deltaTime);

            // Render the scene
            this.renderer.render(this.scene, this.camera);

            // Request the next frame
            requestAnimationFrame(gameLoop);
        };

        // Start the game loop
        requestAnimationFrame(gameLoop);
    }

    onResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

export default Game;
