import * as THREE from "three";

class Player extends THREE.Group {
    constructor() {
        super();

        // Create the plane geometry for the player
        const geometry = new THREE.PlaneGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.playerMesh = new THREE.Mesh(geometry, material);

        this.add(this.playerMesh);
        this.position.y = 1; // Initial position at ground level

        // Physics properties for jumping
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.007;
        this.jumpCounter = 0;

        // Sliding properties
        this.isSliding = false;
        this.targetY = 1; // Target Y position for sliding

        this.keyPress();
    }

    keyPress() {
        window.addEventListener("keydown", (event) => {
            if (event.key === "w" && this.jumpCounter < 2) {
                this.jumpCounter++;
                this.isJumping = true;
                this.jumpVelocity = 0.2; // Initial upward velocity
                this.playerMesh.scale.set(0.5, 1.25, 1);
            }

            if (event.key === "s") {
                this.isSliding = true;
                this.playerMesh.scale.set(1.25, 0.5, 1); // Flatten the player mesh for sliding
                this.targetY = 0.5; // Lower player when sliding
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "s") {
                this.isSliding = false;
                this.playerMesh.scale.set(1, 1, 1); // Reset scale after sliding
                this.targetY = 1; // Restore player position when sliding ends
            }
        });
    }

    update() {
        // Handle jump and gravity
        if (this.isJumping) {
            this.position.y += this.jumpVelocity; // Move up
            this.jumpVelocity += (this.isSliding) ? this.gravity * 2 : this.gravity; // Apply gravity, double if sliding

            if (this.position.y <= 1) {
                this.position.y = 1; // Reset to ground level
                this.isJumping = false;
                this.jumpCounter = 0; // Reset double-jump counter
                this.jumpVelocity = 0; // Reset velocity
                if (!this.isSliding) {
                    this.playerMesh.scale.set(1, 1, 1);
                }
            }
        }

        // Smoothly move to the target Y position for sliding
        if (!this.isJumping && this.position.y !== this.targetY) {
            this.position.y += (this.targetY - this.position.y) * 0.1; // Smooth transition
        }
    }
}

export default Player;
