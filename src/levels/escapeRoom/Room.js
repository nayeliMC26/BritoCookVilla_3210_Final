import * as THREE from 'three';

class Room {
    constructor(scene) {
        this.scene = scene;
        this.floor, this.walls, this.ceilling;
        this.#roomSetUp();
    }

    #roomSetUp() {
        var geometry = new THREE.PlaneGeometry(180, 120);
        var material = new THREE.MeshBasicMaterial({ color: 0x404040 });
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.rotateX(-Math.PI / 2);
        this.floor.position.set(90, 0, 60);
        this.scene.add(this.floor);

        this.ceilling = this.floor.clone();
        // Cloning material so that its independent from the floor material
        this.ceilling.material = this.ceilling.material.clone();
        this.ceilling.rotateX(Math.PI);
        this.ceilling.translateZ(-100);
        this.scene.add(this.ceilling);

        const vertices = [
            0, 0, 60, 0, 100, 60,
            0, 0, 120, 0, 100, 120,
            180, 0, 120, 180, 100, 120,
            180, 0, 0, 180, 100, 0,
            120, 0, 0, 120, 100, 0,
            120, 0, 60, 120, 100, 60
        ]

        const indices = [
            0, 1, 3, 0, 3, 2,
            2, 3, 5, 2, 5, 4,
            4, 5, 7, 4, 7, 6,
            6, 7, 9, 6, 9, 8,
            8, 9, 11, 8, 11, 10,
            10, 11, 1, 10, 1, 0
        ]

        geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.walls = new THREE.Mesh(geometry, material.clone());
        this.walls.material.color.set(0x909090);
        this.scene.add(this.walls);
    }
}

export default Room