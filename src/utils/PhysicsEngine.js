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
}

export default PhysicsEngine;
