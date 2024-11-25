import * as THREE from 'three';
import PhysicsObject from './PhysicsObject';
class PhysicsEngine {
    constructor() {
        this.objects = []; // List of objects in the world
    }
    /**
     * A function to add objects to the physics engine
     * @param {PhysicsObject} object 
     */
    addObject(object) {
        this.objects.push(object);
    }

    /**
     * A function to handle collisions between objects that are part of the physics engine
     * @param {number} deltaTime 
     */
    handleCollisions(deltaTime) {
        // Loop through every pair of objects and check for collisions
        for (let i = 0; i < this.objects.length; i++) {
            var object = this.objects[i];
            for (let j = i + 1; j < this.objects.length; j++) {
                var otherObject = this.objects[j];
                // Check for collision using the updated bounding box
                if (object.checkCollision(otherObject)) {
                    object.resolveCollision(otherObject, deltaTime);
                    otherObject.resolveCollision(object, deltaTime);
                }
            }
        }
    }
    
    /**
     * Update method for all objects in the scene 
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        // Update all objects 
        this.objects.forEach(object => {
            object.update(deltaTime); 
        });

        // Handle collisions after updating physics
        this.handleCollisions(deltaTime);
    }
    
    

}

export default PhysicsEngine;
