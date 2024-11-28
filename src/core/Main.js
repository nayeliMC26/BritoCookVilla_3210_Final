import * as THREE from 'three';
import Game from '../core/Game.js';
import EscapeRoom from '../levels/escapeRoom/Scene.js'

/* Entry point for the app */
class Main {
    constructor() {
        // Initialize the WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x272727);
        document.body.appendChild(this.renderer.domElement);

        // Initialize the Game instance
        // this.game = new Game(this.renderer);

        // Game initialization (async loading, scene setup)
        // this.game.init();
        // Start game loop
        // this.game.start();

        this.escapeRoom = new EscapeRoom(this.renderer);


        // Handle window resizing
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.game.onResize(window.innerWidth, window.innerHeight);
        });

        this.animation();
    }

    animation() {
        this.escapeRoom.render();
        requestAnimationFrame(this.animation.bind(this));
    }

}
// App entry
new Main();
