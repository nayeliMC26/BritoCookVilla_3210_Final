import * as THREE from 'three';

class Room {
    constructor(scene) {
        this.scene = scene;
        this.floor, this.walls, this.ceilling;
        this.roomBB;


        this.#roomSetUp();
    }

    #roomSetUp() {
        // Create the floor of the room
        var geometry = new THREE.PlaneGeometry(300, 240);
        var material = new THREE.MeshBasicMaterial({ color: 0x404040 });
        this.floor = new THREE.Mesh(geometry, material); 
        this.floor.rotateX(-Math.PI / 2); 
        this.floor.position.set(150, 0, 120); 
        this.scene.add(this.floor);
    
        // Create the ceiling by cloning the floor
        this.ceilling = this.floor.clone(); 
        this.ceilling.material = this.ceilling.material.clone(); // Clone material to make it independent from the floor
        this.ceilling.rotateX(Math.PI); 
        this.ceilling.translateZ(-100); 
        this.scene.add(this.ceilling); 
    
        // Define the vertices of the walls
        const vertices = [
            0, 0, 120, 0, 100, 120,       
            0, 0, 220, 0, 100, 220,       
            300, 0, 220, 300, 100, 220,   
            300, 0, 0, 300, 100, 0,       
            160, 0, 0, 160, 100, 0,       
            160, 0, 120, 160, 100, 120    
        ];
    
        // Define the indices for the walls
        const indices = [
            0, 1, 3, 0, 3, 2,     
            2, 3, 5, 2, 5, 4,     
            4, 5, 7, 4, 7, 6,     
            6, 7, 9, 6, 9, 8,     
            8, 9, 11, 8, 11, 10,  
            10, 11, 1, 10, 1, 0   
        ];
    
        // Wall geometry using vertices and indices
        geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices); 
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
        // Create wall material and assign it to the wall mesh
        this.walls = new THREE.Mesh(geometry, material.clone());
        this.walls.material.color.set(0x909090); 
        this.scene.add(this.walls); 
    
        // Define bounding boxes for collision or spatial limitations
        this.roomBB = [
            new THREE.Box3(new THREE.Vector3(1, 0, 121), new THREE.Vector3(299, 100, 219)), // Hallway bounding box
            new THREE.Box3(new THREE.Vector3(161, 0, 1), new THREE.Vector3(299, 100, 121))  // Small room bounding box
        ];
    
        // Helpers to visualize bounding boxes
        const helper = new THREE.Box3Helper(this.roomBB[0], 0xffff00);
        const helper2 = new THREE.Box3Helper(this.roomBB[1], 0xff00ff);
        this.scene.add(helper); 
        this.scene.add(helper2);
    }
    
}

export default Room