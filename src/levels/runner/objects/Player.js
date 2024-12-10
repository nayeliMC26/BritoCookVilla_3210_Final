import * as THREE from "three";

class Player extends THREE.Group {
    constructor() {
        super();

        // Create a texture loader to load PNG images
        this.textureLoader = new THREE.TextureLoader();

        // Array to hold the textures for the animation
        this.textures = [];
        this.currentFrame = 0;

        // Load the textures (assuming PNG images are named as 'frame1.png', 'frame2.png', ..., 'frameN.png')
        let loadedTextures = 0;
        const totalFrames = 10; // Adjust the number of frames accordingly

        for (let i = 1; i <= totalFrames; i++) {
            const texture = this.textureLoader.load(
                `textures/animationframes/frame${i}.PNG`,
                () => {
                    // Success callback
                    loadedTextures++;
                    if (loadedTextures === totalFrames) {
                        this.startAnimation(); // Start animation after all textures are loaded
                    }
                },
                undefined, // Progress callback (optional)
                (err) => {
                    // Error callback
                    console.error(
                        `Error loading texture: textures/animationframes/frame${i}.PNG`
                    );
                }
            );

            texture.encoding = THREE.LinearEncoding;

            this.textures.push(texture);
        }

        // Create the material with the first frame texture
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures[0], // Set the first frame as the initial texture
            transparent: true,
            roughness: 0.5,
            metalness: 0.1,
        });

        // Create the geometry for the player
        const geometry = new THREE.PlaneGeometry(4, 4);

        // Create the mesh for the player
        this.playerMesh = new THREE.Mesh(geometry, this.material);
        this.add(this.playerMesh);

        // Set the initial position for the player
        this.position.y = 2;

        // Physics properties for jumping
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.007;
        this.jumpCounter = 0;

        // Sliding properties
        this.isSliding = false;
        this.targetY = 2; // Default Y position for sliding

        // Add event listeners for keypress handling
        this.keyPress();
    }

    keyPress() {
        window.addEventListener("keydown", (event) => {
            if (event.key === "w" && this.jumpCounter < 2) {
                this.jumpCounter++;
                this.isJumping = true;
                this.jumpVelocity = 0.2; // Initial upward velocity
                this.playerMesh.scale.set(0.5, 1.25, 1); // Stretch the player when jumping
            }

            if (event.key === "s") {
                this.isSliding = true;
                this.playerMesh.scale.set(1.25, 0.5, 1); // Flatten the player for sliding
                this.targetY = 1; // Lower player Y position when sliding
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "s") {
                this.isSliding = false;
                this.playerMesh.scale.set(1, 1, 1); // Reset scale after sliding
                this.targetY = 2; // Restore default Y position when sliding ends
            }
        });
    }

    startAnimation() {
        // Update the texture every 1/12th of a second
        setInterval(() => {
            // Update the current frame
            this.currentFrame = (this.currentFrame + 1) % this.textures.length; // Loop back to the first frame after the last one

            // Update the material's texture
            this.material.map = this.textures[this.currentFrame];
            this.material.needsUpdate = true; // Ensure material is updated
        }, 1000 / 12); // 12 frames per second
    }

    update() {
        // Handle jump and gravity
        if (this.isJumping) {
            this.position.y += this.jumpVelocity; // Move up
            this.jumpVelocity += this.gravity; // Apply gravity

            if (this.position.y <= 2) {
                this.position.y = 2; // Reset to ground level
                this.isJumping = false;
                this.jumpCounter = 0; // Reset double-jump counter
                this.jumpVelocity = 0; // Reset velocity
                if (!this.isSliding) {
                    this.playerMesh.scale.set(1, 1, 1); // Reset scale
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
