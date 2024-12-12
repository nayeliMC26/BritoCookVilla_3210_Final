import * as THREE from 'three';
import PhysicsObject from '../../../levels/platformer/utils/PhysicsObject';

class Mushrooms {
    constructor(scene, position, size, physicsEngine) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;

        var geometry = new THREE.SphereGeometry(size, 16, 16);
        var material = new THREE.MeshStandardMaterial({ color: 0x69f6f5 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;

        this.scene.add(this.mesh);

        this.physicsEngine.addObject(new PhysicsObject(scene, this.mesh, false, true, 'mushroom'));

    }
}
export default Mushrooms;