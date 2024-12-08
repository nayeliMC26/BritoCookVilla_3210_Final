import { WebGLRenderer } from "three";

class Renderer {
    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000);
    }

    get domElement() {
        return this.renderer.domElement;
    }

    get instance() {
        return this.renderer; // Return the actual WebGLRenderer instance
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default Renderer;
