import * as THREE from 'three';
import PhysicsObject from '../utils/PhysicsObject';
/* A temp class to create basic platforms using box geometry */
class Platform {
    constructor(scene, x , y, z, width, height, depth) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.size = new THREE.Vector3(width, height, depth);

        // Create the physics object for the platform (static)
        this.physicsObject = new PhysicsObject(this.scene, this.position.x, this.position.y, this.position.z, this.size.x, this.size.y, this.size.z, false);

        // Create the platform mesh
        this.createPlatformMesh();
    }

    /* A function to create the visual representation of our physics body */
    createPlatformMesh() {
        var geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update() {
        // Update the platform's bounding box position based on the platform's position for collision detection
        this.physicsObject.updateBoundingBox();

        // Update mesh position based on physics object
        this.mesh.position.copy(this.physicsObject.position);
    }
}

export default Platform;
