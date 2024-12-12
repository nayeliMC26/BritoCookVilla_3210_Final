import * as THREE from 'three';

/**
 * Raycaster class to handle mouse interactions, highlighting, and animations for objects in a scene
 */
class Raycaster {
    constructor(scene, camera, controls, objects) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.objects = objects;

        // Variables for raycasting
        this.raycaster, this.direction, this.intersections;
        // Current highlighthed object 
        this.highlightObject;
        // Variables to track intercations
        this.action, this.states, this.completedPuzzle, this.message;
        // Variables to handle valve animations
        this.animationState, this.rotation, this.rotationCount;

        this.winningArea;

        // Initialize mouse controls and setup
        this.#mouseControls();
        this.#init();
    }

    /**
     * Initializes variables and states for the raycaster
     */
    #init() {
        this.raycaster = new THREE.Raycaster();
        this.direction = new THREE.Vector3();
        this.highlightObject = null;
        this.intersections = [];
        this.action = -1;
        // Intercation states
        this.states = [
            true, false, false, // Buttons (middle-left-right)
            false, false, false, // Pipes (middle-left-right)
            false, // Exit button
            false, // Stairs
        ];
        // Puzzle completion states
        this.completedPuzzle = [false, false, false];
        // Message State
        this.message = false;
        // Animation states for objects
        this.animationState = [false, false, false];
        // Tracks how much to rotate valves
        this.rotation = [0, 0, 0];
        this.rotationCount = [0, 0, 0];
        this.winningArea = new THREE.Box3().setFromObject(this.objects[11]);
    }

    /**
     * Checks which object is being interacted with and sets the action based on its index
     */
    #checkInteraction() {
        if (this.intersections.length === 0) return; // No intersections, return early
        let object = this.intersections[0].object.parent instanceof THREE.Group
            ? this.intersections[0].object.parent
            : this.intersections[0].object;
        this.action = this.objects.indexOf(object); // Set action index
    }

    /**
     * Handles interactions based on the current action index
     */
    #handleInteraction() {
        switch (this.action) {
            case 0: // Middle button
                if (this.completedPuzzle[0]) break;
                this.#toggleButtonColor(0, 0x500000, 0xff0000);

                break;
            case 1: // Left button
                if (this.completedPuzzle[0]) break;
                this.#toggleButtonColor(1, 0x005000, 0x00ff00);
                break;
            case 2: // Right button
                if (this.completedPuzzle[0]) break;
                this.#toggleButtonColor(2, 0x000050, 0x0000ff);
                break;
            case 3: // Exit button
                // if (!this.completedPuzzle[1] || this.completedPuzzle[2]) break;
                this.#toggleButtonColor(3, 0x005050, 0x00ffff)
                this.objects[11].visible = true;
                this.objects[11].children[0].visible = true;
                this.objects[11].geometry.computeBoundingBox();
                break;
            case 4: // Middle pipe
                if (!this.completedPuzzle[0] || this.completedPuzzle[1]) break;
                this.#toggleValve(4);
                break;
            case 5: // Left pipe
                if (!this.completedPuzzle[0] || this.completedPuzzle[1]) break;
                this.#toggleValve(5);
                break;
            case 6: // Right pipe
                if (!this.completedPuzzle[0] || this.completedPuzzle[1]) break;
                this.#toggleValve(6);
                break;
        }
        this.#updatePuzzles(); // Update puzzle states

        // Changes the message when the first puzzle is completed
        if (this.completedPuzzle[0] && !this.message) {
            this.message = true;
            this.objects[12].material.color.set(0x505050)
            this.objects[13].material.color.set(0x505050)
        }
        this.action = -1; // Reset action
    }

    /**
     * Updates animations and raycasting logic
     * @param {number} deltaTime - Time since the last frame
     */
    update(deltaTime) {
        // Checking which valve to animate
        for (let i = 0; i < this.animationState.length; i++) {
            this.rotation[i] = deltaTime;
            if (this.animationState[i]) {
                this.#rotateValve(i);
            }
        }
        // this.#highlightObjects(); // Handle object highlighting
        if (this.completedPuzzle[2] && this.winningArea.containsPoint(this.camera.position)) {
            return true;
        }
    }

    /**
     * Animates the rotation of a valve object
     * @param {THREE.Object3D} object - The valve object
     * @param {number} index - Index of the valve
     */
    #rotateValve(index) {
        const rotation = -this.rotation[index] * 5; // Rotation amount
        this.objects[index + 4].rotation.z += rotation; // Apply rotation
        this.objects[index + 8].rotation.z += rotation; // Apply rotation
        // console.log(object);
        this.animationState[index] = (this.objects[index + 4].rotation.z > ((-Math.PI / 2) * this.rotationCount[index]))
    }

    /**
     * Highlights Current intersected object
     */
    #highlightObjects() {
        if (this.intersections.length === 0) {
            this.#resetHighlight();
            return;
        }

        if (this.highlightObject !== this.intersections[0].object) {
            this.#resetHighlight();
            this.highlightObject = this.intersections[0].object;
            // Brighten color
            this.highlightObject.material.color.addScalar(0.2);
        }
    }

    /**
     * Resets the highlight effect on the currently highlighted object
     */
    #resetHighlight() {
        if (this.highlightObject === null) return;
        // Revert color
        this.highlightObject.material.color.addScalar(-0.2);
        this.highlightObject = null;
    }

    /**
     * Updates the state of puzzles based on current interactions
     */
    #updatePuzzles() {
        // Check if all button are on the correct letter
        this.completedPuzzle[0] = this.states[0] && this.states[1] && this.states[2];
        // Checking roattion of the L's
        this.states[4] = ((this.rotationCount[0] + 3) % 4 === 0);
        this.states[5] = ((this.rotationCount[1] + 2) % 4 === 0);
        this.states[6] = ((this.rotationCount[2] + 1) % 4 === 0);
        // Checking if all are correct
        this.completedPuzzle[1] = this.states[4] && this.states[5] && this.states[6];
        // Checking if exit button was pressed
        this.completedPuzzle[2] = this.states[3];
    }

    /**
     * Toggles a button's color based on its current state
     * @param {number} index - Index of the button
     * @param {number} activeColor - Color when active
     * @param {number} inactiveColor - Color when inactive
     */
    #toggleButtonColor(index, activeColor, inactiveColor) {
        this.states[index] = !this.states[index];
        this.objects[index].material.color.set(this.states[index] ? activeColor : inactiveColor);
        // Adjust for highlight
        this.objects[index].material.color.addScalar(0.2);
        if (index === 3) return;
        this.objects[index + 14].changeText();
    }

    /**
     * Toggles the state of a valve and sets it for animation
     * @param {number} index - Index of the pipe
     */
    #toggleValve(index) {
        console.log(index)
        this.states[index] = !this.states[index];
        this.rotationCount[index - 4]++;
        this.animationState[index - 4] = true;
    }

    /**
     * Toggles the position of stairs based on their state
     * @param {number} index - Index of the stairs
     */
    #toggleStairs(index) {
        this.states[index] = !this.states[index];
        this.objects[index].position.z += this.states[index] ? 10 : -10;
    }

    /**
     * Sets up mouse controls for interaction and raycasting
     */
    #mouseControls() {
        document.body.addEventListener("click", () => {
            if (!this.controls.isLocked) return;
            this.#checkInteraction();
            this.#handleInteraction();
        });

        document.addEventListener('mousemove', () => {
            if (!this.controls.isLocked) return;
            this.camera.getWorldDirection(this.direction);
            this.raycaster.set(this.camera.position, this.direction);
            this.intersections = this.raycaster.intersectObjects(this.objects.slice(0, 7));
        });
    }
}

export default Raycaster;