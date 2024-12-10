import * as THREE from 'three';
import PhysicsObject from '/src/utils/PhysicsObject.js';
/* A temp player class, which can later be replaced with an import model */
/* Should probably treat like an object pool and reset positin when player falls off the map */
class Player {
    constructor(scene, inputHandler, physicsEngine) {
        this.scene = scene;
        this.inputHandler = inputHandler;
        this.physicsEngine = physicsEngine;

        this.size = new THREE.Vector3(5, 10, 5);
        this.position = new THREE.Vector3(35, 5, 10);
        this.speed = 25;

        this.maxSpeed = 25;
        this.maxJumps = 2;
        this.jumpCount = 0;
        
        this.isGrounded = false;

        // Create the visual representation of physics body
        this.mesh = this.createPlayerMesh();

        // Create the physics object for the player
        this.physicsObject = new PhysicsObject(this.scene, this.mesh, true, false, 'player');

        // Add the physics object to the physics engine
        this.physicsEngine.addObject(this.physicsObject);
    }

    createPlayerMesh() {
        // Basic box for now
        var geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }


    updateMovement() {
        var moveDirection = new THREE.Vector3(0, 0, 0);

        // Check if the forward key is pressed
        if (this.inputHandler.moveForward) moveDirection.z -= 1;
        // Check if the backward key is pressed
        if (this.inputHandler.moveBackward) moveDirection.z += 1;
        // Check if the left key is pressed
        if (this.inputHandler.moveLeft) moveDirection.x -= 1;
        // Check if the right key is pressed
        if (this.inputHandler.moveRight) moveDirection.x += 1;

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

        // Clamp the velocity to maxSpeed
        var velocity = this.physicsObject.velocity;
        var horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2); 
        if (horizontalSpeed > this.maxSpeed) {
            var scalingFactor = this.maxSpeed / horizontalSpeed;
            velocity.x *= scalingFactor;
            velocity.z *= scalingFactor;
        }

        // Handle jumping if spacebar is pressed and jump count is less than max jumps
        if (this.inputHandler.jump && this.jumpCount < this.maxJumps) {
            console.log(`Player is Jumping. Jump Count: ${this.jumpCount + 1}`);
            this.physicsObject.velocity.y = 15;
            this.jumpCount++;
            this.inputHandler.jump = false;
        }

        // Reset jump count when player lands (is grounded)
        if (this.physicsObject.velocity.y === 0 && !this.isGrounded) {
            this.isGrounded = true;
            this.jumpCount = 0; // Reset jumps after landing
            console.log('Player landed, resetting jump count.');
        } else if (this.physicsObject.velocity.y !== 0) {
            this.isGrounded = false;
        }
    }        

    update() {
        // Update player movement based on input
        this.updateMovement();
        // Update the physics object (this will update position, apply gravity, etc.)
        this.physicsObject.update();

        // Update mesh position based on physics object position
        this.mesh.position.copy(this.physicsObject.position);
    }
}

export default Player;
