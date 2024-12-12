import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import Game from "../core/Game.js";

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

        // Start game loop
        this.game.start();

        this.clock = new THREE.Clock();

        // Handle window resizing

        window.addEventListener("resize", this.onResize.bind(this));

        // Automatically hide the startup message after 3 seconds
        setTimeout(() => {
            const startupMessage = document.getElementById("startup-message");
            if (startupMessage) {
                startupMessage.style.display = "none";
            }
        }, 3000);
    }

    onResize() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.game.onResize(width, height);
    }

    animation(time) {
        this.stats.begin();
        const deltaTime = this.clock.getDelta();
        this.escapeRoom.render(time / 1000, deltaTime);
        this.stats.end();
        requestAnimationFrame(this.animation.bind(this));
    }
}
// App entry
new Main();
