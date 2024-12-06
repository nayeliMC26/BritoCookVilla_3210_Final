import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module.js";
import Game from '../core/Game.js';
import EscapeRoom from "../levels/escapeRoom/Scene.js"

/* Entry point for the app */
class Main {
    constructor() {
        // Initialize the WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x272727);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
        // Initialize the Game instance
        this.game = new Game(this.renderer); 

        // this.game = new Game(this.renderer);

        // Game initialization (async loading, scene setup)
        this.game.init();

        // Start game loop
        // this.game.start();
        this.clock = new THREE.Clock();;



        // Handle window resizing

        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.game.onResize(width, height);
    }

}
// App entry
new Main();
