import * as THREE from 'three';
import PhysicsObject from '../../../levels/platformer/utils/PhysicsObject';

class Platform {
    constructor(scene, x, y, z, width, height, depth, physicsEngine, id, minY = null, maxY = null, speed = 0) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.size = new THREE.Vector3(width, height, depth);
        this.physicsEngine = physicsEngine;
        this.id = id;

        this.minY = minY; 
        this.maxY = maxY;
        this.speed = speed; 
        this.direction = 1;

        // Create the platform mesh
        this.mesh = this.createPlatformMesh();

        // Create the physics object for the platform (static)
        this.physicsObject = new PhysicsObject(this.scene, this.mesh, false, false, id);

        // Add the physics object to the physics engine
        this.physicsEngine.addObject(this.physicsObject);
    }

    /* A function to create the visual representation of our physics body */
    createPlatformMesh() {
        var geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.castShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    update() {
        if (this.minY !== null && this.maxY !== null && this.speed > 0) {
            // Reverse direction if bounds are hit
            if (this.mesh.position.y >= this.maxY) {
                this.direction = -1;
            } else if (this.mesh.position.y <= this.minY) {
                this.direction = 1;
            }

            // Move the platform
            this.mesh.translateY(this.speed * this.direction);
        }
    }
}

export default Platform;
