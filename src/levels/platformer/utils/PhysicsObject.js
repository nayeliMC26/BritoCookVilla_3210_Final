import * as THREE from 'three';
import playerData from './playerData';

/* A class for physics object that can be added to the physics engine */
class PhysicsObject {
    // Physics objects can be either static or dynamic
    constructor(scene, mesh, isDynamic = false, isCollectible = false, id = null) {
        this.scene = scene;
        this.mesh = mesh;
        this.id = id;
        this.timestep = 1 / 60;
        this.isDynamic = isDynamic;
        this.isCollected = false;
        this.isCollectible = isCollectible;
        this.velocity = new THREE.Vector3(0, 0, 0); // Velocity for dynamic objects

        // Set position and size based on the mesh
        this.position = this.mesh.position;
        var { x, y, z } = new THREE.Box3().setFromObject(this.mesh).getSize(new THREE.Vector3());
        this.size = new THREE.Vector3(x, y, z);

        // Create a Box3 for collision detection
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(this.position, this.size);
        // console.log(this.boundingBox)

        // Create Box3Helper to visualize the bounding box
        this.boundingBoxHelper = new THREE.Box3Helper(this.boundingBox, 0xff0000);
        //this.scene.add(this.boundingBoxHelper);

        this.mushroomCount = 0;

        // UI Element for displaying the count (Add this)
        this.uiElement = document.getElementById("mushroom-count");

        this.endGameTriggered = false; 
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

    /**
     * A function which handles the different kinds of collisions between physics objects 
     * @param {PhysicsObject} otherObject 
     */
    resolveCollision(otherObject) {
        if (!this.checkCollision(otherObject)) return;
        // Calculate the differences in positions along each axis
        var dx = this.position.x - otherObject.position.x;
        var dy = this.position.y - otherObject.position.y;
        var dz = this.position.z - otherObject.position.z;

        // Calculate the overlap on each axis
        var overlapX = (this.size.x + otherObject.size.x) / 2 - Math.abs(dx);
        var overlapY = (this.size.y + otherObject.size.y) / 2 - Math.abs(dy);
        var overlapZ = (this.size.z + otherObject.size.z) / 2 - Math.abs(dz);

        // Resolve collision based on smallest overlap
        if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return;

        // Determine the axis with the smallest overlap
        var axis;
        var overlap;
        if (overlapX < overlapY && overlapX < overlapZ) {
            axis = 'x';
            overlap = overlapX;
        } else if (overlapY < overlapZ) {
            axis = 'y';
            overlap = overlapY;
        } else {
            axis = 'z';
            overlap = overlapZ;
        }

        var delta;
        if (axis === 'x') {
            delta = dx;
        } else if (axis === 'y') {
            delta = dy;
        } else {
            delta = dz;
        }

        var direction;
        if (delta > 0) {
            direction = 1;
        } else {
            direction = -1;
        }


        if (this.isDynamic && !otherObject.isDynamic) {
            // Dynamic object collides with static object
            this.position[axis] += direction * overlap;
            if (axis === 'y') {
                this.velocity[axis] = 0; // Y-axis velocity always reset
            } else {
                this.velocity[axis] = 0; // Stop movement on other axes
            }
        } else if (this.isDynamic && otherObject.isDynamic) {
            // Dynamic object collides with another dynamic object
            this.position[axis] += direction * (overlap / 2);
            otherObject.position[axis] -= direction * (overlap / 2);

            if (axis === 'y') {
                this.velocity[axis] = 0;
                otherObject.velocity[axis] = 0;
            } else {
                this.velocity[axis] *= 0.8; // Apply friction
                otherObject.velocity[axis] *= 0.8; // Apply friction
            }
        } else if (this.id === 'player' && otherObject.isDynamic) {
            // Player collides with a dynamic object
            this.position[axis] += direction * overlap;
            otherObject.position[axis] -= direction * overlap;

            if (axis === 'y') {
                this.velocity[axis] = 0;
                otherObject.velocity[axis] = 0;
            } else {
                this.velocity[axis] *= 0.8; // Apply friction
                otherObject.velocity[axis] *= 0.8; // Apply friction
            }
        } else if (this.id === 'player' && !otherObject.isDynamic) {
            // Player collides with a static object
            this.position[axis] += direction * overlap;
            if (axis === 'y') {
                this.velocity[axis] = 0; // Y-axis velocity always reset
            } else {
                this.velocity[axis] = 0; // Stop movement on other axes
            }
        }

        if (this.id === 'player' && otherObject.id == 'glass') {
            otherObject.isDynamic = true;
        }

        if (this.id === 'player' && otherObject.isCollectible) {
            this.collectObject(otherObject);
            this.mushroomCount++
            playerData.mushroomCount++
            console.log(playerData.mushroomCount)


            this.uiElement.textContent = `${this.mushroomCount} / 5`;
        }
    }

    /**
     * A function to remove the mesh for collectible items and dispose of their geometries and meshes 
     * @param {Collectible} THREE.Object3D 
     */
    collectObject(collectible) {
        this.isCollected == true;
        this.scene.remove(collectible.mesh)
        collectible.mesh.geometry.dispose();
        collectible.mesh.material.dispose();
        console.log('I have been collected!')
    }
}

export default PhysicsObject;
