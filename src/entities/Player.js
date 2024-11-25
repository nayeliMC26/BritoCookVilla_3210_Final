import * as THREE from 'three';
import PhysicsObject from '../utils/PhysicsObject';
/* A temp player class, which can later be replaced with an import model */
/* Should probably treat like an object pool and reset positin when player falls off the map */
class Player {
    constructor(scene, inputHandler, physicsEngine) {
        this.scene = scene;
        this.inputHandler = inputHandler;
        this.physicsEngine = physicsEngine;

        this.size = new THREE.Vector3(5, 10, 5);
        this.position = new THREE.Vector3(0, 10, 0);
        this.speed = 0.1;

        // Create the physics object for the player
        this.physicsObject = new PhysicsObject(this.scene, this.position.x, this.position.y, this.position.z, this.size.x, this.size.y, this.size.z);

        // Create the visual representation of physics body 
        this.createPlayerMesh();
    }

    createPlayerMesh() {
        // Basic box for now 
        var geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    updateMovement() {
        var moveDirection = new THREE.Vector3(0, 0, 0);

        // Check if the forward key is pressed
        if (this.inputHandler.moveForward) {
            moveDirection.z -= 1; // Move forward
        }

        // Check if the backward key is pressed
        if (this.inputHandler.moveBackward) {
            moveDirection.z += 1; // Move backward
        }

        // Check if the left key is pressed
        if (this.inputHandler.moveLeft) {
            moveDirection.x -= 1; // Move left
        }

        // Check if the right key is pressed
        if (this.inputHandler.moveRight) {
            moveDirection.x += 1; // Move right
        }

        // Normalize the direction to prevent faster diagonal movement
        moveDirection.normalize();

        // Apply the movement force if there is movement direction
        if (moveDirection.length() > 0) {
            this.physicsObject.applyForce(moveDirection.multiplyScalar(this.speed));
        } else {
            // Stop horizontal movement when no key is pressed
            this.physicsObject.velocity.x = 0;
            this.physicsObject.velocity.z = 0;
        }

        // Handle jumping if spacebar is pressed and player is grounded
        // Need to apply an upper bound on jumping but im too eepy
        // Also need to consider if we want double jumping or not 
        if (this.inputHandler.jump) {
            this.physicsObject.velocity.y = 5; // Simple jump force
        }
    }

    update(deltaTime) {
    
        // Update player movement based on input
        this.updateMovement(deltaTime);
    
        // Update the physics object (this will update position, apply gravity, etc.)
        this.physicsObject.update(deltaTime);
    
        // Resolve collision with all objects
        this.physicsEngine.objects.forEach(otherObject => {
            if (otherObject !== this.physicsObject) {
                // Resolve collisions using the resolveCollision method in PhysicsObject
                this.physicsObject.resolveCollision(otherObject, deltaTime);
            }
        });
    
        // Update mesh position based on physics object position
        this.mesh.position.copy(this.physicsObject.position);
    
        // Update bounding box helper position and size
        this.physicsObject.updateBoundingBox(); 
    }
    


}

export default Player;
