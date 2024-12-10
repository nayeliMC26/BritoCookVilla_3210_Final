import { PerspectiveCamera, MathUtils } from "three";

class Camera extends PerspectiveCamera {
    constructor() {
        super(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.position.set(0, 5, 17);  // Initial position
        this.lookAt(0, 5, 0);

        // Wobble settings
        this.wobbleAmount = 0.2;  // Moderate wobble intensity
        this.wobbleSpeed = 2;     // Wobble speed (adjust for noticeable but not jerky effect)

        // Track player states
        this.lastJumpState = false;
        this.lastSlideState = false;

        // Store the initial position for wobble reset
        this.initialPosition = this.position.clone();

        // Time variable for wobble
        this.time = 0;
    }

    // Apply wobble effect to the camera
    applyWobble(deltaTime) {
        // Accumulate time to scale wobble movement
        this.time += deltaTime;

        // Apply wobble to both X and Y positions with controlled amounts
        this.position.x = this.initialPosition.x + Math.sin(this.time * this.wobbleSpeed) * this.wobbleAmount;
        this.position.y = this.initialPosition.y + Math.cos(this.time * this.wobbleSpeed) * this.wobbleAmount;

        // Optional slight wobble in the Z axis for a back-and-forth motion
        this.position.z = this.initialPosition.z + Math.sin(this.time * this.wobbleSpeed * 0.5) * this.wobbleAmount;

        // Log the camera position for debugging
        // console.log(this.position);  // Check position updates
    }

    // Update camera position and rotation based on player's actions
    update(deltaTime) {
        this.applyWobble(deltaTime);  // Apply the wobble effect

        // Ensure the camera always looks at the player's position
        if (this.player) {
            this.lookAt(this.player.position);  // Make the camera look at the player
        }
    }

    // Resize the camera on window resize
    resize() {
        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();
    }
}

export default Camera;
