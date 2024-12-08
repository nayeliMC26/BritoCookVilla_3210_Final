import { PerspectiveCamera, Vector2 } from "three";

class Camera extends PerspectiveCamera {
    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.position.set(0, 5, 7);
        this.lookAt(0, 5, 0);

        // Distortion parameters
        this.distortionStrength = 0.2; // Adjust distortion intensity
    }

    applyDistortion(renderer) {
        // Apply distortion as a shader override in the render loop
        renderer.getContext().canvas.style.filter = `distort(${this.distortionStrength})`;
    }

    resize() {
        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();
    }
}

export default Camera;
