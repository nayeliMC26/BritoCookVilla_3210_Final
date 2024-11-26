import * as THREE from 'three';
/* A class for physics object that can be added to the physics engine */
class PhysicsObject {
    // Physics objects can be either static or dynamic
    constructor(scene, mesh, isDynamic = true, id = null) {
        this.scene = scene;
        this.mesh = mesh;
        this.id = id;
        this.timestep = 1 / 60;
        this.isDynamic = isDynamic;
        this.velocity = new THREE.Vector3(0, 0, 0); // Velocity for dynamic objects

        // Set position and size based on the mesh
        this.position = this.mesh.position;
        var { x, y, z } = new THREE.Box3().setFromObject(this.mesh).getSize(new THREE.Vector3());
        this.size = new THREE.Vector3(x, y, z);

        // Create a Box3 for collision detection
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(this.position, this.size);

        // Create Box3Helper to visualize the bounding box
        this.boundingBoxHelper = new THREE.Box3Helper(this.boundingBox, 0xff0000);
        this.scene.add(this.boundingBoxHelper);
    }

    updateBoundingBox() {
        // Update the Box3 with the current position and size
        this.boundingBox.setFromCenterAndSize(this.position, this.size);
    }

    update() {
        // Apply gravity if it's a dynamic object, (we don't want falling platforms for now)
        if (this.isDynamic) {
            this.velocity.y -= 9.81 * this.timestep;
        }

        // Update position based on velocity
        this.position.add(this.velocity.clone().multiplyScalar(this.timestep)); // Fixed step

        // Update the bounding box and its visual representation
        this.updateBoundingBox();
    }


    applyForce(force) {
        // No forces need to be applied on static objects 
        if (this.isDynamic) {
            this.velocity.add(force); 
        }
    }
    /**
     * A function to check collisions against other objects 
     */
    checkCollision(otherObject) {
        return this.boundingBox.intersectsBox(otherObject.boundingBox);
    }

    // For now mainly resolves collisions on the y, may have to think about x and z later 
    resolveCollision(otherObject) {
        if (this.checkCollision(otherObject)) {
            if (this.isDynamic && !otherObject.isDynamic) {
                // Check if the player is falling (downward velocity) and is colliding with a platform
                if (this.velocity.y < 0) {
                    this.velocity.y = 0; // Stop downward velocity
                    // Adjust position to sit on top of the platform, may have to be changed
                    this.position.y = otherObject.position.y +
                        otherObject.size.y / 2 +
                        this.size.y / 2;
                }
            }
        } 
    }

}

export default PhysicsObject;
