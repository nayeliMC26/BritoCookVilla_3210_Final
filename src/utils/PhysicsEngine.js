import PhysicsObject from './PhysicsObject';

class PhysicsEngine {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        console.log(this.objects);
    }
    /**
     * A function to add objects to the physics engine
     * @param {PhysicsObject} object - Adds physics objects to the scene
     */
    addObject(object) {
        this.objects.push(object);
    }
    /**
     * A function to remove objects from the physics engine
     * @param {PhysicsObject} object - Removes physics objects and their meshes from the scene 
     */
    removeObject(object) {
        // Remove the mesh from the scene
        if (object.mesh) {
            try {
                this.scene.remove(object.mesh);
                object.mesh = null;
            } catch (error) {
                console.error("Error removing mesh:", error);
            }
        } else {
            console.warn("Attempted to remove an object without a mesh:", object);
        }

        // Remove the bounding box helper from the scene
        if (object.boundingBoxHelper) {
            try {
                this.scene.remove(object.boundingBoxHelper); // Remove helper
                object.boundingBoxHelper = null; // Nullify the reference
            } catch (error) {
                console.error("Error removing bounding box helper:", error);
            }
        }

        // Remove the object from the physics engine's list
        var index = this.objects.indexOf(object);
        if (index !== -1) {
            this.objects.splice(index, 1);
        } else {
            console.warn("Attempted to remove an object that was not found in the physics engine:", object);
        }
    }

    /**
     * A function to handle collisions between objects that are part of the physics engine
     */
    handleCollisions() {
        // Loop through every pair of objects and check for collisions
        for (let i = 0; i < this.objects.length; i++) {
            var object = this.objects[i];
            for (let j = i + 1; j < this.objects.length; j++) {
                var otherObject = this.objects[j];
                // Check for collision using the updated bounding box
                if (object.checkCollision(otherObject)) {
                    // Resolve collision without relying on deltaTime
                    object.resolveCollision(otherObject);
                    otherObject.resolveCollision(object);
                }
            }
        }
    }

    /**
     * A function to update all physics objects in the scene
     */
    update() {
        this.objects.forEach(object => {
            object.update();
        });

        // Handle collisions after updating physics
        this.handleCollisions();
    }
    /**
     * A function to remove all physics objects from the scene
     */
    clear() {
        // Loop through all objects and remove them from the scene
        this.objects.forEach((object) => {
            // Remove the mesh from the scene and dispose of it
            if (object.mesh) {
                try {
                    this.scene.remove(object.mesh);
                    if (object.mesh.geometry) object.mesh.geometry.dispose();
                    if (object.mesh.material) {
                        if (Array.isArray(object.mesh.material)) {
                            object.mesh.material.forEach((material) => material.dispose());
                        } else {
                            object.mesh.material.dispose();
                        }
                    }
                    object.mesh = null; // Nullify the reference
                } catch (error) {
                    console.error("Error removing mesh during clear:", error);
                }
            }

            // Remove the bounding box helper from the scene
            if (object.boundingBoxHelper) {
                try {
                    this.scene.remove(object.boundingBoxHelper);
                    object.boundingBoxHelper = null;
                } catch (error) {
                    console.error("Error removing bounding box helper during clear:", error);
                }
            }
        });

        // Clear the objects array
        this.objects = [];
        console.log("Physics engine cleared.");
    }

}
export default PhysicsEngine;
