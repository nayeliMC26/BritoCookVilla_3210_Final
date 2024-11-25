import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import InputHandler from '../utils/InputHandler.js';
import Player from '../entities/Player.js';
import Platform from '../entities/Platform.js';
import PhysicsEngine from '../utils/PhysicsEngine.js';

class Game {
    constructor(renderer) {
        // Renderer will be passed in from main
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Temporary for debugging
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Create an inputHandler instance
        this.inputHandler = new InputHandler();
        this.inputHandler.keyboardControls();

        // Create a new physics engine instance
        this.physicsEngine = new PhysicsEngine();

        // three body problem ??? ez !

        // Create player and add to the physics engine
        this.player = new Player(this.scene, this.inputHandler, this.physicsEngine);

        // Create some platforms and addthem  to the physics engine
        this.platform = new Platform(this.scene, 0, 0, 0, 30, 1, 20, this.physicsEngine);

        this.platform2 = new Platform(this.scene, 40, 2, 0, 20, 1, 20, this.physicsEngine)

        this.physicsEngine.addObject(this.player.physicsObject);
        this.physicsEngine.addObject(this.platform.physicsObject);
        this.physicsEngine.addObject(this.platform2.physicsObject)

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

        // Optionally, add a grid helper to visualize the ground
        var gridHelper = new THREE.GridHelper(100, 20);
        this.scene.add(gridHelper);
    }

    // Initialize any asynchronous tasks 
    async init() {
        try {
            console.log('Initializing game...');

            // Initialize the scene (camera, lighting, etc.)
            this.sceneSetup();

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error during game initialization:', error);
        }
    }

    update(deltaTime) {
        // Update the player and other game logic
        this.player.update(deltaTime, this.physicsEngine.objects);
    }


    start() {
        var gameLoop = () => {
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
