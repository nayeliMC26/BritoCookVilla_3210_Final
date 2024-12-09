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
        this.animationState, this.rotation;

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
        this.completedPuzzle = [false, false, false, false];
        // Message State
        this.message = false;
        // Animation states for objects
        this.animationState = [false, false, false];
        // Tracks how much to rotate valves
        this.rotation = [0, 0, 0];
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
                if (!this.completedPuzzle[1] || this.completedPuzzle[2]) break;
                this.#toggleButtonColor(3, 0x005050, 0x00ffff)
                this.objects[8].visible = !this.objects[8].visible;
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
            case 7: // Stairs
                if (!this.completedPuzzle[2] || this.completedPuzzle[3]) break;
                // Change this to ending game later
                this.#toggleStairs(7);
                break;
        }
        this.#updatePuzzles(); // Update puzzle states

        // Changes the message when the first puzzle is completed
        if (this.completedPuzzle[0] && !this.message) {
            this.message = true;
            this.objects[9].material.color.set(0x505050)
            this.objects[10].material.color.set(0x505050)
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
                this.#rotateValve(this.objects[i + 4], i);
            }
        }
        this.#highlightObjects(); // Handle object highlighting
    }

    /**
     * Animates the rotation of a valve object
     * @param {THREE.Object3D} object - The valve object
     * @param {number} index - Index of the valve
     */
    #rotateValve(object, index) {
        const direction = this.states[index + 4] ? -1 : 1; // Direction based on state
        const rotation = direction * this.rotation[index] * 5; // Rotation amount
        object.rotation.z += rotation; // Apply rotation
        this.animationState[index] = object.rotation.z > -Math.PI && object.rotation.z < 0;
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
        this.completedPuzzle[0] = this.states[0] && this.states[1] && this.states[2];
        this.completedPuzzle[1] = this.states[4] && this.states[5] && this.states[6];
        this.completedPuzzle[2] = this.states[3];
        this.completedPuzzle[3] = this.states[7];
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
    }

    /**
     * Toggles the state of a valve and sets it for animation
     * @param {number} stateIndex - Index of the pipe state
     * @param {number} animationIndex - Index of the animation state
     */
    #toggleValve(stateIndex) {
        this.states[stateIndex] = !this.states[stateIndex];
        console.log(this.states[stateIndex])
        this.animationState[stateIndex - 4] = true;
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
            this.camera.getWorldDirection(this.direction);
            this.raycaster.set(this.camera.position, this.direction);
            this.intersections = this.raycaster.intersectObjects(this.objects.slice(0, 8));
        });
    }
}

export default Raycaster;