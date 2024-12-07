import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class Player {
    constructor(scene, camera, playArea, objectArea) {
        this.scene = scene;
        this.camera = camera;
        // Bouunding boxes tha tmake up the room
        this.playArea = playArea;
        this.objectArea = objectArea;
        // Player parameters
        this.controls, this.nextPos, this.speed, this.bobCounter;
        // Moving flags
        this.moveForward, this.moveBackward, this.moveLeft, this.moveRight;
        // Directions
        this.moveDirection, this.forward, this.right, this.up;

        // this.createFlashlight();
        this.#initPlayer();
        //this.#addCrosshair();
        this.keyboardControls();
    }

    #initPlayer() {
        // Set the initial position of the camera (spawn location)
        this.camera.position.set(230, 65, 170);
        this.camera.lookAt(this.camera.position);

        // Set the player's movement speed
        this.speed = 58;

        // Initialize a vector to track movement directions
        this.moveDirection = new THREE.Vector3();

        // Clone the camera's current position to track future positions
        this.nextPos = this.camera.position.clone();

        // Pointer lock controls for FPS-style movement
        this.controls = new PointerLockControls(this.camera, document.body);

        // Flags for directional movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Initialize vectors for movement directions (forward, right, up)
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        this.up = new THREE.Vector3(0, 1, 0); // Up vector is along the y-axis

        // Counter for bobbing effect
        this.bobCounter = 0;

        // Enable or disable debug mode for the player
        this.debugMode = false;
        this.cameraOffset = new THREE.Vector3(0, 20, -30);
    }

    update(deltaTime) {
        const velocity = this.speed * deltaTime;
        this.moveDirection.set(0, 0, 0);

        this.camera.getWorldDirection(this.forward); // Forward direction
        this.forward.y = 0; // Prevent flying up or down

        this.right.crossVectors(this.forward, this.up)

        // Checking which dirrections the player wants to move
        if (this.moveForward) {
            this.moveDirection.add(this.forward);
        }
        if (this.moveBackward) {
            this.moveDirection.sub(this.forward);
        }
        if (this.moveLeft) {
            this.moveDirection.sub(this.right);
        }
        if (this.moveRight) {
            this.moveDirection.add(this.right);
        }

        // Apply velocity to move dirrection
        this.moveDirection.multiplyScalar(velocity);

        // 
        this.#handleAreaCollision();


        // If moving in any direction
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            this.bobCounter += 10 * deltaTime;
            this.bobCounter %= Math.PI * 2; // Mod to not increase indefenetely 
            this.camera.position.y += Math.sin(this.bobCounter) / 16
        }
    }

    #handleAreaCollision() {
        // Getting where the player woudl be if they moved
        this.nextPos.add(this.moveDirection);
        // Cheking to see if that next position is out of bounds
        const outsideArea = this.playArea.every((box) => box.containsPoint(this.nextPos) === false)
        const inObject = this.objectArea.some((box) => box.containsPoint(this.nextPos) === true)
        // If player is inside the bounds 
        if (!outsideArea && !inObject) {
            this.camera.position.add(this.moveDirection);
        }
        // Set next position to the current position
        this.nextPos.copy(this.camera.position);
    }

    #addCrosshair() {
        // Create a div for the crosshair
        var crosshair = document.createElement("div");
        crosshair.style.position = "absolute";
        crosshair.style.top = "50%";
        crosshair.style.left = "50%";
        crosshair.style.transform = "translate(-50%, -50%)";
        crosshair.style.width = "25px";
        crosshair.style.height = "25px";
        crosshair.style.backgroundImage = "url(EscapeRoomCrosshair.png)";
        crosshair.style.backgroundSize = "contain";
        crosshair.style.backgroundRepeat = "no-repeat";
        crosshair.style.pointerEvents = "none";
        document.body.appendChild(crosshair);
    }

    requestPointerLock() {
        this.controls.lock();
    }

    onPointerLockChange() {
        this.mouseLookEnabled = document.pointerLockElement === document.body;
    }

    keyboardControls() {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "w":
                    this.moveForward = true;
                    break;
                case "s":
                    this.moveBackward = true;
                    break;
                case "a":
                    this.moveLeft = true;
                    break;
                case "d":
                    this.moveRight = true;
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "w":
                    this.moveForward = false;
                    break;
                case "s":
                    this.moveBackward = false;
                    break;
                case "a":
                    this.moveLeft = false;
                    break;
                case "d":
                    this.moveRight = false;
                    break;
            }
        });

        document.body.addEventListener("click", () => {
            if (!this.mouseLookEnabled) {
                this.requestPointerLock();
            }
        });

        document.addEventListener(
            "pointerlockchange",
            this.onPointerLockChange.bind(this)
        );
    }

    createFlashlight() {
        var flashlightMesh = new THREE.Group();
        this.flashlightMesh = flashlightMesh;
        var flashlightBodyGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
        var flashlightHeadGeometry = new THREE.BoxGeometry(2, 1, 2);
        var flashlightMaterial = new THREE.MeshPhongMaterial({
            color: 0x404040,
        });

        var flashlightHead = new THREE.Mesh(
            flashlightHeadGeometry,
            flashlightMaterial
        );
        flashlightHead.position.set(5, -3, -7);
        flashlightHead.rotation.set(0, Math.PI / 2, Math.PI / 2);

        var flashlightBody = new THREE.Mesh(
            flashlightBodyGeometry,
            flashlightMaterial
        );
        flashlightBody.position.set(5, -3, -5);
        flashlightBody.rotation.set(0, Math.PI / 2, Math.PI / 2);

        flashlightMesh.add(flashlightHead);
        flashlightMesh.add(flashlightBody);
        this.camera.add(flashlightMesh);

        this.illumination = new THREE.SpotLight(
            0xfff4bd,
            10000,
            1000,
            Math.PI / 6,
            0.5,
            2
        );
        this.camera.add(this.illumination);
        this.camera.add(this.illumination.target);
        this.illumination.position.set(0, 0, 0);
        this.illumination.target.position.set(0, 0, -1);

        this.illumination.visible = false;
        for (var mesh of this.camera.children) {
            mesh.visible = false;
        }
    }
}

export default Player;