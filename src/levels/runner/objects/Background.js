import { Group, PlaneGeometry, Mesh, MeshBasicMaterial } from "three";

class Background extends Group {
    constructor() {
        super();

        const geometry = new PlaneGeometry(50, 50);
        const material = new MeshBasicMaterial({ color: 0xadd8e6 });
        const plane = new Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Flat on the ground
        this.add(plane);
    }

    update() {
        // Optional background animation logic
    }
}

export default Background;
