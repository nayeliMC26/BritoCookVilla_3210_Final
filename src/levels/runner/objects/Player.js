import * as THREE from 'three';

class Player extends THREE.Group {
    constructor() {
        super();

        // Create a texture loader to load PNG images
        this.textureLoader = new THREE.TextureLoader();

        // Arrays to hold the textures and normal maps
        this.textures = [];
        this.normalMaps = [];
        this.metalnessMaps = [];  // Array for metalness maps
        this.currentFrame = 0;

        // Load the textures (assuming PNG images are named as 'frame1.png', 'frame2.png', ..., 'frameN.png')
        let loadedTextures = 0;
        const totalFrames = 10; // Adjust the number of frames accordingly

        for (let i = 1; i <= totalFrames; i++) {
            // Load the base texture (for diffuse)
            const texture = this.textureLoader.load(
                `textures/animationframes/frame${i}.PNG`,
                () => {
                    loadedTextures++;
                    if (loadedTextures === totalFrames) {
                        this.startAnimation(); // Start animation after all textures are loaded
                    }
                },
                undefined, // Progress callback (optional)
                (err) => {
                    console.error(`Error loading texture: textures/animationframes/frame${i}.PNG`);
                }
            );
            texture.encoding = THREE.LinearEncoding;
            this.textures.push(texture);

            // Load normal maps (assuming they're named normal_frame1.png, normal_frame2.png, ...)
            const normalMap = this.textureLoader.load(
                `textures/animationframes/normal_frame${i}.PNG`,
                () => {
                    loadedTextures++;
                },
                undefined,
                (err) => console.error(`Error loading normal map: normal_frame${i}.PNG`)
            );
            normalMap.encoding = THREE.LinearEncoding;
            this.normalMaps.push(normalMap);

            // Load metalness maps (assuming they're named metal_frame1.png, metal_frame2.png, ...)
            const metalnessMap = this.textureLoader.load(
                `textures/animationframes/metal_frame${i}.PNG`,
                () => {
                    loadedTextures++;
                },
                undefined,
                (err) => console.error(`Error loading metalness map: metal_frame${i}.PNG`)
            );
            metalnessMap.encoding = THREE.LinearEncoding;
            this.metalnessMaps.push(metalnessMap);
        }

        // Create the material with the first frame texture
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures[0], // Set the first frame as the initial texture
            normalMap: this.normalMaps[0], // Set the first normal map
            metalnessMap: this.metalnessMaps[0], // Set the first metalness map
            transparent: true,
            roughness: 0.7,
            metalness: 0.6,
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
        // Update the texture and normal/metalness maps every 1/12th of a second
        setInterval(() => {
            // Update the current frame
            this.currentFrame = (this.currentFrame + 1) % this.textures.length; // Loop back to the first frame after the last one

            // Update the material's textures and maps
            this.material.map = this.textures[this.currentFrame];
            this.material.normalMap = this.normalMaps[this.currentFrame];
            this.material.metalnessMap = this.metalnessMaps[this.currentFrame];

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
