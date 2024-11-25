import * as THREE from 'three';
/* A class for physics object that can be added to the physics engine */
class PhysicsObject {
    // Physics objects can be either static or dynamic
    constructor(scene, x, y, z, width, height, depth, isDynamic = true) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.size = new THREE.Vector3(width, height, depth);
        this.isDynamic = isDynamic;
        this.velocity = new THREE.Vector3(0, 0, 0); // Velocity for dynamic objects

        // Create a Box3 for collision detection
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(this.position, this.size);

        // Create Box3Helper to visualize the bounding box
        this.boundingBoxHelper = new THREE.Box3Helper(this.boundingBox, 0xff0000); // Red color
        this.scene.add(this.boundingBoxHelper); 
    }

    updateBoundingBox() {
        // Update the Box3 with the current position and size
        this.boundingBox.setFromCenterAndSize(this.position, this.size);
    }

    update(deltaTime) {
        // Apply gravity if it's a dynamic object, (we don't want falling platforms for now)
        if (this.isDynamic) {
            this.velocity.y -= 9.81 * deltaTime; // Simple gravity effect
        }

        // Update position based on velocity
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Update the bounding box and its visual representation
        this.updateBoundingBox();
    }

    applyForce(force) {
        // No forces need to be applied on static objects 
        if (this.isDynamic) {
            this.velocity.add(force); 
        }
    }

    // Check for collisions betwen objects in the engine
    checkCollision(otherObject) {
        return this.boundingBox.intersectsBox(otherObject.boundingBox);
    }

    // For now mainly resolves collisions on the y, may have to think about x and z later 
    resolveCollision(otherObject, deltaTime) {
        if (this.checkCollision(otherObject)) {
            if (this.isDynamic && !otherObject.isDynamic) {
                // Check if the player is falling (downward velocity) and is colliding with a platform
                if (this.velocity.y < 0) {
                    this.velocity.y = 0; // Stop downward velocity

                    this.position.y = otherObject.position.y + otherObject.size.y / 2 + this.size.y / 2;
                }
            }
        } 
    }

}

export default PhysicsObject;
