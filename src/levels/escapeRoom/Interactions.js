import * as THREE from 'three';

class Interactions {
    constructor(objects) {
        this.objects = objects;

    }

    #init() {
        this.raycaster = new THREE.Raycaster();
        this.direction = new THREE.Vector3();
        this.action = -1;
    }

    #checkInteraction() {
        this.raycaster.set(this.camera.position, this.direction);
        const intersections = this.raycaster.intersectObjects(this.objects);
        if (intersections.length == 0) return;
        if (intersections[0].object.parent instanceof THREE.Group) {
            var object = intersections[0].object.parent;
        } else {
            var object = intersections[0].object
        }
        this.action = this.objects.indexOf(object);
    }

    #handleInteraction() {

    }
    /**
     * A function to handle raycasting and highlighting
     * @param {Array} objects - The array of objects to raycast 
     * @param {THREE.Color} highlightColor - The color to use for highlighting
     */
    highlightObjects(objects, highlightColor) {
        for (var mesh of objects) {
            this.mesh = mesh;
            var intersection = this.raycaster.intersectObject(mesh);
            if (intersection.length > 0) {
                this.instanceId = intersection[0].instanceId;
                if (this.instanceId !== undefined) {
                    if (this.currentHighlight.mesh !== mesh || this.currentHighlight.instanceId !== this.instanceId) {
                        this.resetHighlight();
                        mesh.setColorAt(this.instanceId, highlightColor);
                        mesh.instanceColor.needsUpdate = true;
                        this.currentHighlight.mesh = mesh;
                        this.currentHighlight.instanceId = this.instanceId;
                    }
                }
            } else if (this.currentHighlight.mesh === mesh) {

                this.resetHighlight();
            }
        }
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
    //** Removes tha object that's highlighthed */
    removeObject() {
        // If no object highlighthed return
        if ((this.currentHighlight.mesh === null) && (this.currentHighlight.instanceId === null)) return;
        const mesh = this.currentHighlight.mesh;
        const id = this.currentHighlight.instanceId;
        // Current tranformation matrix
        const matrix = new THREE.Matrix4()
        mesh.getMatrixAt(id, matrix)
        // If object is art of the bottom layer (checks current y axis)
        if (matrix.elements[13] > 0) {
            // Update the hight at the block
            this.terrain.updateHeight(matrix.elements[12], matrix.elements[14]);
            // Moves it back to the origin
            matrix.makeTranslation(0, 0, 0);
            mesh.setMatrixAt(id, matrix);
            mesh.instanceMatrix.needsUpdate = true;
        }

    }

    /**
     * Method to update the raycasting
     */
    update() {
        if (!this.controls.isLocked) return;

        this.raycaster.set(this.camera.position, this.camera.getWorldDirection(new THREE.Vector3()));
        this.highlightObjects(this.terrain.mesh.children, new THREE.Color(0xff0000));
        for (var tree of this.trees) {
            this.highlightObjects(tree.mesh.children, new THREE.Color(0x00ffff));
        }

    }

    mouseControls() {
        document.body.addEventListener("click", () => {
            if (!this.controls.isLocked) return;
            this.#checkInteraction();
            console.log(this.action);
        });

        document.addEventListener('mousemove', () => {
            this.camera.getWorldDirection(this.direction);
        });
    }

}

export default Interactions;
