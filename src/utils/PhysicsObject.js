import * as THREE from 'three';
/* A class for physics object that can be added to the physics engine */
class PhysicsObject {
    // Physics objects can be either static or dynamic
    constructor(scene, mesh, isDynamic = true, isCollectible = false, id = null) {
        this.scene = scene;
        this.mesh = mesh;
        this.id = id;
        this.timestep = 1 / 60;
        this.isDynamic = isDynamic;
        this.isCollectible = isCollectible;
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

    resolveCollision(otherObject) {

        if (this.checkCollision(otherObject)) {
            if (otherObject.isCollectible == true) {
                this.collectObject(otherObject);
                console.log("collect me!")

            }
        }
        if (this.checkCollision(otherObject)) {
            if (this.isDynamic && !otherObject.isDynamic) {
                // Calculate the differences in positions along each axis
                var dx = this.position.x - otherObject.position.x;
                var dy = this.position.y - otherObject.position.y;
                var dz = this.position.z - otherObject.position.z;

                // Calculate the overlap on each axis
                var overlapX = (this.size.x + otherObject.size.x) / 2 - Math.abs(dx);
                var overlapY = (this.size.y + otherObject.size.y) / 2 - Math.abs(dy);
                var overlapZ = (this.size.z + otherObject.size.z) / 2 - Math.abs(dz);

                // Resolve collision based on smallest overlap
                if (overlapX < overlapY && overlapX < overlapZ) {
                    // Handle collision on the X-axis
                    if (dx > 0) {
                        this.position.x += overlapX;
                    } else {
                        this.position.x -= overlapX;
                    }
                    this.velocity.x = 0;  // Stop horizontal velocity
                } else if (overlapY < overlapZ) {
                    // Handle collision on the Y-axis
                    if (dy > 0) {
                        this.position.y += overlapY;
                        if (this.velocity.y < 0) {
                            this.velocity.y = 0; // Stop downward velocity
                        }
                    } else {
                        this.position.y -= overlapY;  // Move downward
                        if (this.velocity.y > 0) {
                            this.velocity.y = 0;  // Stop upward movement
                        }
                    }
                } else {
                    // Handle collision on the Z-axis
                    if (dz > 0) {
                        this.position.z += overlapZ;
                    } else {
                        this.position.z -= overlapZ;
                    }
                    this.velocity.z = 0;  // Stop forward/backward velocity
                }
            }
        }
    }

    /**
     * A function to remove the mesh for collectible items and dispose of their geometries and meshes 
     * @param {Collectible} THREE.Object3D 
     */
    collectObject(collectible) {
        this.scene.remove(collectible.mesh)
        collectible.mesh.geometry.dispose();
        collectible.mesh.material.dispose();
        console.log("i've been collected")
    }
}

export default PhysicsObject;
