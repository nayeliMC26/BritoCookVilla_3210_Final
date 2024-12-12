import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class Player {
    constructor(scene, camera, playArea, objectArea) {
        this.scene = scene;
        this.camera = camera;
        // Bounding boxes that make up the room
        this.playArea = playArea;
        this.objectArea = objectArea;
        // Player parameters
        this.controls, this.nextPos, this.speed, this.bobCounter;
        // Moving flags
        this.moveForward, this.moveBackward, this.moveLeft, this.moveRight;
        // Directions
        this.moveDirection, this.forward, this.right, this.up;
        // Binded event listener functions
        this.bindedKeydown, this.bindedKeyup, this.bindedClick;

        this.#init();
        this.#addCrosshair();
        this.#addEventListener();
    }

    #init() {
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

        // Binding the event listener functions to this document
        this.bindedKeydown = this.#keydown.bind(this);
        this.bindedKeyup = this.#keyup.bind(this);
        this.bindedClick = this.#click.bind(this);

    }

    #handleAreaCollision() {
        // Get the player's potential next position based on movement
        this.nextPos.add(this.moveDirection);

        // Check if the next position is outside the bounds or intersects with objects
        const outsideArea = this.playArea.every((box) => box.containsPoint(this.nextPos) === false);
        const inObject = this.objectArea.slice(0, 7).some((box) => box.containsPoint(this.nextPos) === true);

        // If the player is inside the bounds and not colliding with objects, move them
        if (!outsideArea && !inObject) {
            this.camera.position.add(this.moveDirection);
        }

        // Reset the next position to the current position
        this.nextPos.copy(this.camera.position);
    }

    #addCrosshair() {
        // Create a div for the crosshair
        const crosshair = document.createElement("div");
        crosshair.id = "crosshair";
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

    #removeCrosshair() {
        const crosshair = document.getElementById("crosshair");
        document.body.removeChild(crosshair);
    }

    #addEventListener() {
        document.addEventListener("keydown", this.bindedKeydown);
        document.addEventListener("keyup", this.bindedKeyup);
        document.addEventListener("click", this.bindedClick);
    }

    #removeEventListener() {
        document.removeEventListener("keydown", this.bindedKeydown);
        document.removeEventListener("keyup", this.bindedKeyup);
        document.removeEventListener("click", this.bindedClick);
    }

    #keydown(event) {
        if (!this.controls.isLocked) return;
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
    }

    #keyup(event) {
        if (!this.controls.isLocked) return;
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
    }

    #click() {
        if (!this.controls.isLocked) this.controls.lock();
    }

    update(deltaTime) {
        const velocity = this.speed * deltaTime;
        this.moveDirection.set(0, 0, 0);

        // Determine the player's movement direction
        this.camera.getWorldDirection(this.forward); // Forward direction
        // Prevent vertical movement
        this.forward.y = 0;

        this.right.crossVectors(this.forward, this.up);

        // Add movement based on input
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

        // Apply velocity to the movement direction
        this.moveDirection.normalize().multiplyScalar(velocity);

        this.#handleAreaCollision();

        // Add bobbing effect while moving
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            this.bobCounter += 10 * deltaTime;
            this.bobCounter %= Math.PI * 2; // Keep bobCounter within one full cycle
            this.camera.position.y += Math.sin(this.bobCounter) / 16; // Bobbing effect
        }
    }

    /**
     * Removes controls, user interactions, and crosshair
     */
    clear() {
        this.controls.unlock();
        this.controls.dispose();
        this.#removeEventListener();
        this.#removeCrosshair();
    }
}

export default Player;