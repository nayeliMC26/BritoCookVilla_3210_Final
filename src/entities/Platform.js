import * as THREE from 'three';
import PhysicsObject from '../utils/PhysicsObject';
/* A temp class to create basic platforms using box geometry */
class Platform {
    constructor(scene, x, y, z, width, height, depth, physicsEngine, id) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, z);
        this.size = new THREE.Vector3(width, height, depth);
        this.physicsEngine = physicsEngine;
        this.id = id;

        // Create the platform mesh
        this.mesh = this.createPlatformMesh();

        // Create the physics object for the platform (static)
        this.physicsObject = new PhysicsObject(this.scene, this.mesh, false, id);

        // Add the physics object to the physics engine
        this.physicsEngine.addObject(this.physicsObject);
    }

    /* A function to create the visual representation of our physics body */
    createPlatformMesh() {
        var geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        this.scene.add(mesh);
        return mesh;
    }

    update() {
        // Update the platform's bounding box position based on the platform's position for collision detection
        this.physicsObject.updateBoundingBox();
    }
}

export default Platform;
