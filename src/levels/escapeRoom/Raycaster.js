import * as THREE from 'three';

class Raycaster {
    constructor(scene, camera, controls, objects) {
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.objects = objects;

        this.raycaster, this.direction, this.intersections;
        this.highlightObject;
        this.action, this.states, this.materials;
        this.completedPuzzle;
        this.animationState, this.animationTime;


        this.mouseControls();
        this.#init();
    }

    #init() {
        this.raycaster = new THREE.Raycaster();
        this.direction = new THREE.Vector3();
        this.intersections = [];
        this.action = -1;
        this.states = [
            true, false, false, // Initial buttons (m-l-r)
            false, false, false, // Pipes (m-l-r)
            false, // Exit button
            false, // Stairs
        ];
        this.completedPuzzle = [false, false, false, false];
        this.animationState = [false, false, false];
        this.animationTime = [0, 0, 0];
    }

    #checkInteraction() {
        if (this.intersections.length === 0) return;
        if (this.intersections[0].object.parent instanceof THREE.Group) {
            var object = this.intersections[0].object.parent;
        } else {
            var object = this.intersections[0].object
        }
        this.action = this.objects.indexOf(object) + 1;
    }

    #handleInteraction() {
        switch (this.action) {
            case 1: // Middle button
                if (this.states[0]) {
                    this.objects[0].material.color.set(0xff0000);
                } else {
                    this.objects[0].material.color.set(0x500000);
                }
                this.states[0] = !this.states[0];
                break;
            case 2: // Left button
                if (this.states[1]) {
                    this.objects[1].material.color.set(0x00ff00);
                } else {
                    this.objects[1].material.color.set(0x005000);
                }
                this.states[1] = !this.states[1];
                break;
            case 3: // Right button
                if (this.states[2]) {
                    this.objects[2].material.color.set(0x0000ff);
                } else {
                    this.objects[2].material.color.set(0x000050);
                }
                this.states[2] = !this.states[2];
                break;
            case 4: // Exit button
                // if (!(this.states[4] && this.states[5] && this.states[6])) break;
                if (this.states[3]) {
                    this.objects[3].material.color.set(0x00ffff);
                    this.objects[8].visible = false;

                } else {
                    this.objects[3].material.color.set(0x005050);
                    this.objects[8].visible = true;

                }
                this.states[3] = !this.states[3]
                break;
            case 5: // Middle Pipe
                // if (!(this.states[0] && this.states[1] && this.states[2])) break;
                this.states[4] = !this.states[4];
                this.animationState[0] = true;
                break;
            case 6: // Left Pipe
                // if (!(this.states[0] && this.states[1] && this.states[2])) break;
                this.states[5] = !this.states[5];
                this.animationState[1] = true;
                break;
            case 7: // Right Pipe
                // if (!(this.states[0] && this.states[1] && this.states[2])) break;
                this.states[6] = !this.states[6];
                this.animationState[2] = true;
                break;
            case 8:
                // if (!this.states[3]) break;
                if (this.states[7]) {
                    this.objects[7].position.z += -10
                } else {
                    this.objects[7].position.z += 10
                }
                this.states[7] = !this.states[7];


                break;
        }
        this.#updatePuzzles();
        this.action = -1
    }

    #updatePuzzles() {
        this.completedPuzzle[0] = (this.states[0] && this.states[1] && this.states[2]) ? true : false;
        this.completedPuzzle[1] = (this.states[3] && this.states[4] && this.states[5]) ? true : false;
        this.completedPuzzle[2] = this.states[6];
        this.completedPuzzle[3] = this.states[7];
    }

    #rotateValve(object, index) {
        const direction = (this.states[index + 4]) ? -1 : 1;
        const rotation = direction * this.animationTime[index] * 5;
        object.rotation.z += rotation;
        this.animationState[index] = (0 > object.rotation.z && object.rotation.z > -Math.PI) ? true : false;
    }



    /**
     * A function to handle raycasting and highlighting
     * @param {Array} objects - The array of objects to raycast 
     * @param {THREE.Color} highlightColor - The color to use for highlighting
     */
    highlightObjects() {
        if (this.intersections.length === 0) {
            this.resetHighlight();
            return;
        }

        if (this.highlightObject != this.intersections[0]) {
            this.resetHighlight()
            this.highlightObject = this.intersections[0];
            this.highlightObject.material.color.set(
                this.highlightObject.material.color * 0.5
            );
        }


        // for (var mesh of objects) {
        //     this.mesh = mesh;
        //     var intersection = this.raycaster.intersectObject(mesh);
        //     if (intersection.length > 0) {
        //         this.instanceId = intersection[0].instanceId;
        //         if (this.instanceId !== undefined) {
        //             if (this.currentHighlight.mesh !== mesh || this.currentHighlight.instanceId !== this.instanceId) {
        //                 this.resetHighlight();
        //                 mesh.setColorAt(this.instanceId, highlightColor);
        //                 mesh.instanceColor.needsUpdate = true;
        //                 this.currentHighlight.mesh = mesh;
        //                 this.currentHighlight.instanceId = this.instanceId;
        //             }
        //         }
        //     } else if (this.currentHighlight.mesh === mesh) {

        //         this.resetHighlight();
        //     }
        // }
    }

    /**
     * A function to reset the highlight so blocks aren't continuously being highlighted even when no longer cast upon
     */
    resetHighlight() {
        if (this.currentHighlight.mesh && this.currentHighlight.instanceId !== null) {
            var defaultColor = new THREE.Color();
            this.currentHighlight.mesh.setColorAt(this.currentHighlight.instanceId, defaultColor);
            this.currentHighlight.mesh.instanceColor.needsUpdate = true;
            this.currentHighlight.mesh.geometry.dispose();

            this.currentHighlight.mesh = null;
            this.currentHighlight.instanceId = null;
        }
    }

    /**
     * Method to update the raycasting
     */
    update(deltaTime) {
        if (!this.controls.isLocked) return;
        for (let i = 0; i < this.animationState.length; i++) {
            this.animationTime[i] = deltaTime;

            if (this.animationState[i]) {
                this.#rotateValve(this.objects[i + 4], i);
            }
        }
        highlightObjects();
    }

    mouseControls() {
        document.body.addEventListener("click", () => {
            if (!this.controls.isLocked) return;
            this.#checkInteraction();
            this.#handleInteraction();
            console.log(this.action);
        });

        document.addEventListener('mousemove', () => {
            this.camera.getWorldDirection(this.direction);
            this.raycaster.set(this.camera.position, this.direction);
            this.intersections = this.raycaster.intersectObjects(this.objects);
        });
    }

}

export default Raycaster;
