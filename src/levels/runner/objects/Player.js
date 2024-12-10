import * as THREE from "three";

class Player extends THREE.Group {
    constructor() {
        super();

        // Create a texture loader to load PNG images
        this.textureLoader = new THREE.TextureLoader();

        // Arrays to hold the textures, normal maps, and metalness maps
        this.textures = [];
        this.normalMaps = [];
        this.metalnessMaps = [];
        this.currentFrame = 0;

        // Jump frames
        this.jumpFrame1 = this.textureLoader.load(
            "textures/animationframes/jump_frame1.PNG"
        );
        this.jumpFrame2 = this.textureLoader.load(
            "textures/animationframes/jump_frame2.PNG"
        );

        // Metal maps for jump
        this.metalJumpFrame1 = this.textureLoader.load(
            "textures/animationframes/metal_jump_frame1.PNG"
        );
        this.metalJumpFrame2 = this.textureLoader.load(
            "textures/animationframes/metal_jump_frame2.PNG"
        );

        // normal maps for jump
        this.normalJumpFrame1 = this.textureLoader.load(
            "textures/animationframes/normal_jump_frame1.PNG"
        );
        this.normalJumpFrame2 = this.textureLoader.load(
            "textures/animationframes/normal_jump_frame2.PNG"
        );

        // Slide frames
        this.slideFrame = this.textureLoader.load(
            "textures/animationframes/slide_frame.PNG"
        );
        this.metalSlideFrame = this.textureLoader.load(
            "textures/animationframes/metal_slide_frame.PNG"
        );
        this.normalSlideFrame = this.textureLoader.load(
            "textures/animationframes/normal_slide_frame.PNG"
        );

        // Load the textures for running animation
        let loadedTextures = 0;
        const totalFrames = 10; // Adjust the number of frames accordingly

        for (let i = 1; i <= totalFrames; i++) {
            const texture = this.textureLoader.load(
                `textures/animationframes/frame${i}.PNG`,
                () => {
                    loadedTextures++;
                    if (loadedTextures === totalFrames) {
                        this.startAnimation(); // Start animation after all textures are loaded
                    }
                },
                undefined,
                (err) =>
                    console.error(
                        `Error loading texture: textures/animationframes/frame${i}.PNG`
                    )
            );
            texture.encoding = THREE.LinearEncoding;
            this.textures.push(texture);

            const normalMap = this.textureLoader.load(
                `textures/animationframes/normal_frame${i}.PNG`,
                undefined,
                undefined,
                (err) =>
                    console.error(
                        `Error loading normal map: normal_frame${i}.PNG`
                    )
            );
            normalMap.encoding = THREE.LinearEncoding;
            this.normalMaps.push(normalMap);

            const metalnessMap = this.textureLoader.load(
                `textures/animationframes/metal_frame${i}.PNG`,
                undefined,
                undefined,
                (err) =>
                    console.error(
                        `Error loading metalness map: metal_frame${i}.PNG`
                    )
            );
            metalnessMap.encoding = THREE.LinearEncoding;
            this.metalnessMaps.push(metalnessMap);
        }

        // Create the material with the first running frame
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures[0],
            normalMap: this.normalMaps[0],
            metalnessMap: this.metalnessMaps[0],
            transparent: true,
            roughness: 0.3,
            metalness: 0.5,
        });

        // Create the geometry and mesh
        const geometry = new THREE.PlaneGeometry(4, 4);
        this.playerMesh = new THREE.Mesh(geometry, this.material);
        this.add(this.playerMesh);

        // Player position and state variables
        this.position.y = 2;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.007;
        this.jumpCounter = 0;

        // Sliding properties
        this.isSliding = false;
        this.targetY = 2; // Default Y position for sliding

        // Animation control
        this.animationInterval = null;
        this.keyPress();
    }

    keyPress() {
        window.addEventListener("keydown", (event) => {
            if (event.key === "w" && this.jumpCounter < 2) {
                this.jumpCounter++;
                this.isJumping = true;
                this.jumpVelocity = 0.2;
                this.playJumpAnimation(); // Trigger jump animation
            }

            if (event.key === "s" && !this.isSliding) {
                this.isSliding = true;
                this.playSlideAnimation(); // Trigger slide animation
                this.targetY = 2; // Lower Y position when sliding
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "s") {
                this.isSliding = false; // Reset sliding state
                this.targetY = 2; // Restore Y position after sliding

                // Return to running animation if not jumping
                if (!this.isJumping) {
                    this.startAnimation();
                }
            }
        });
    }

    playJumpAnimation() {
        // Switch to jump_frame1
        this.material.map = this.jumpFrame1;
        this.material.metalnessMap = this.metalJumpFrame1;
        this.material.normalMap = this.normalJumpFrame1;
        this.material.needsUpdate = true;

        // After 0.2 seconds, switch to jump_frame2
        setTimeout(() => {
            this.material.map = this.jumpFrame2;
            this.material.metalnessMap = this.metalJumpFrame2;
            this.material.normalMap = this.normalJumpFrame2;
            this.material.needsUpdate = true;
        }, 100);
    }

    // Add the playSlideAnimation method
    playSlideAnimation() {
        // Switch to the slide frame
        this.material.map = this.slideFrame;
        this.material.metalnessMap = this.metalSlideFrame;
        this.material.normalMap = this.normalSlideFrame;
        this.material.needsUpdate = true;

        // The slide animation remains until the "s" key is released,
        // so no automatic return to running animation here.
    }

    startAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = setInterval(() => {
            if (!this.isJumping) {
                // Update running frames only if not jumping
                this.currentFrame =
                    (this.currentFrame + 1) % this.textures.length;
                this.material.map = this.textures[this.currentFrame];
                this.material.normalMap = this.normalMaps[this.currentFrame];
                this.material.metalnessMap =
                    this.metalnessMaps[this.currentFrame];
                this.material.needsUpdate = true;
            }
        }, 1000 / 12); // 12 frames per second
    }

    update() {
        // Handle jump and gravity
        if (this.isJumping) {
            this.position.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;

            if (this.position.y <= 2) {
                this.position.y = 2;
                this.isJumping = false;
                this.jumpCounter = 0;
                this.jumpVelocity = 0;

                if (!this.isSliding) {
                    this.playerMesh.scale.set(1, 1, 1); // Reset scale
                    // Return to running animation
                    this.startAnimation();
                }
            }
        }

        // Smoothly move to target Y position for sliding
        if (!this.isJumping && this.position.y !== this.targetY) {
            this.position.y += (this.targetY - this.position.y) * 0.1; // Smooth transition
        }

        // Ensure slide animation persists while sliding
        if (this.isSliding) {
            this.playSlideAnimation(); // Keep the slide animation active
        }
    }
}

export default Player;
