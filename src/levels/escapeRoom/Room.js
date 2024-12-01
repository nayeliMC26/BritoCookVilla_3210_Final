import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

class Room {
    constructor(scene) {
        this.scene = scene;
        // Struture objects
        this.floor, this.walls, this.ceilling;

        this.table, this.letter, this.alphabet;
        this.pipes, this.valves;
        this.buttons;
        this.staircase, this.exitBorder;
        this.lights;

        this.interactiveOb;

        // Array of bounding boxes tha make up the room
        this.areaBB, this.objectsBB;

        this.#roomSetUp();
        this.#addObjects();
        this.#setUpBoundignBoxes();
    }

    #roomSetUp() {
        // Floor setup
        var geometry = new THREE.PlaneGeometry(300, 220);
        var material = new THREE.MeshBasicMaterial({ color: 0x404040 });
        this.floor = new THREE.Mesh(geometry, material);
        this.floor.rotateX(-Math.PI / 2);
        this.floor.position.set(150, 0, 110);
        this.scene.add(this.floor);

        // Ceiling setup
        this.ceilling = this.floor.clone();
        this.ceilling.material = this.ceilling.material.clone();
        this.ceilling.rotateX(Math.PI);
        this.ceilling.position.y += 100;
        this.scene.add(this.ceilling);

        // Walls verices and indices
        const vertices = [
            0, 0, 120, 0, 100, 120,
            0, 0, 220, 0, 100, 220,
            300, 0, 220, 300, 100, 220,
            300, 0, 0, 300, 100, 0,
            160, 0, 0, 160, 100, 0,
            160, 0, 120, 160, 100, 120
        ];
        const indices = [
            0, 1, 3, 0, 3, 2,
            2, 3, 5, 2, 5, 4,
            4, 5, 7, 4, 7, 6,
            6, 7, 9, 6, 9, 8,
            8, 9, 11, 8, 11, 10,
            10, 11, 1, 10, 1, 0
        ];

        // Walls setup
        geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        var material = new THREE.MeshBasicMaterial({ color: 0x909090 });
        this.walls = new THREE.Mesh(geometry, material);
        this.scene.add(this.walls);


        // Entrace setup
        geometry = new THREE.PlaneGeometry(60, 60);
        material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.entrance = new THREE.Mesh(geometry, material);
        this.entrance.rotateX(Math.PI / 2);
        this.entrance.position.set(230, 99.9, 170);
        this.scene.add(this.entrance);

        // Exit setup
        geometry = new THREE.TorusGeometry(30, 2.5, 2, 4);
        material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.exitBorder = new THREE.Mesh(geometry, material);
        this.exitBorder.rotateX(Math.PI / 2);
        this.exitBorder.rotateZ(Math.PI / 4);
        this.exitBorder.position.set(80, 99.9, 142.5);
        this.scene.add(this.exitBorder);
        this.exit = new THREE.RectAreaLight(0xffffff, 1, 40, 40);
        this.exit.rotateX(-Math.PI / 2);
        this.exit.position.copy(this.exitBorder.position);
        this.scene.add(this.exit);

        const rectLightHelper = new RectAreaLightHelper(this.exit);
        this.exit.add(rectLightHelper);

    }

    #addObjects() {
        this.interactiveOb = [];

        // Table setup
        var geometry = new THREE.BoxGeometry(50, 30, 25);
        var material = new THREE.MeshBasicMaterial({ color: 0x606060 });
        this.table = new THREE.Mesh(geometry, material);
        this.table.rotateY(-Math.PI / 2);
        this.table.position.set(287.5, 15, 60);
        this.scene.add(this.table);

        // Letter setup
        geometry = new THREE.PlaneGeometry(9, 14);
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.letter = new THREE.Mesh(geometry, material);
        this.letter.rotateX(-Math.PI / 2);
        this.letter.rotateZ(-Math.PI / 2);
        this.letter.position.copy(this.table.position);
        this.letter.position.y += 16.01;
        this.interactiveOb.push(this.letter.uuid);
        this.scene.add(this.letter);

        // Alphabet setup
        geometry = new THREE.PlaneGeometry(18, 24);
        material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.alphabet = new THREE.Mesh(geometry, material);
        this.alphabet.rotateY(-Math.PI / 2);
        this.alphabet.position.set(299.9, 65, 60);
        this.scene.add(this.alphabet);

        // Buttons set up
        this.buttons = [];
        // Button 1 (midle)
        geometry = new THREE.BoxGeometry(9, 14, 5);
        material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.buttons[0] = new THREE.Mesh(geometry, material);
        this.buttons[0].position.set(230, 55, 2.5);
        // Button 2 (left)
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.buttons[1] = new THREE.Mesh(geometry, material);
        this.buttons[1].position.copy(this.buttons[0].position);
        this.buttons[1].position.x += -28;
        // Button 3 (right)
        material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.buttons[2] = new THREE.Mesh(geometry, material);
        this.buttons[2].position.copy(this.buttons[0].position);
        this.buttons[2].position.x += 28;
        // Button 4 (Exit)
        material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.buttons[3] = new THREE.Mesh(geometry, material);
        this.buttons[3].rotateY(Math.PI / 2);
        this.buttons[3].position.set(2.5, 55, 200);
        this.buttons.forEach((button) => this.interactiveOb.push(button.uuid));
        this.scene.add(...this.buttons);

        // Pipes setup
        this.pipes = [];
        geometry = new THREE.CylinderGeometry(10, 10, 100, 32);
        material = new THREE.MeshBasicMaterial({ color: 0x505050 });
        // Middle 
        this.pipes[0] = new THREE.Mesh(geometry, material);
        this.pipes[0].position.set(160, 50, 60);
        // Left
        this.pipes[1] = this.pipes[0].clone();
        this.pipes[1].position.z += -30;
        // Right
        this.pipes[2] = this.pipes[0].clone();
        this.pipes[2].position.z += 30;
        this.scene.add(...this.pipes);

        // Valves setup
        this.valves = []
        this.valves[0] = this.#makeValve();
        this.valves[0].rotateY(Math.PI / 2);
        this.valves[0].position.set(170.1, 50, 60);
        this.valves[1] = this.valves[0].clone();
        this.valves[1].position.z += -30;
        this.valves[2] = this.valves[0].clone();
        this.valves[2].position.z += 30;
        this.valves.forEach((valve) => this.interactiveOb.push(valve.uuid));
        this.scene.add(...this.valves);

        // Stairs setup
        this.staircase = this.#makeStaircase();
        this.staircase.position.set(80, 50, 122.5);
        this.interactiveOb.push(this.staircase.uuid);
        this.scene.add(this.staircase);

        // Light setup
        this.lights = [];
        // Left
        this.lights[0] = this.#makeLight();
        this.lights[0].position.set(50, 99.9, 170);
        // Middle
        this.lights[1] = this.lights[0].clone();
        this.lights[1].position.x += 100;
        this.lights[2] = this.lights[1].clone();
        // Small room 
        this.lights[2].position.x += 100;
        this.lights[2].position.z += -100;
        // Broken
        this.lights[3] = this.lights[1].clone();
        this.lights[3].children[1].visible = false;
        this.lights[3].position.x += 100;
        this.lights[3].position.y += -95;
        this.lights[3].rotateZ(-2.035);
        this.scene.add(...this.lights);

    }

    #setUpBoundignBoxes() {
        // The room bounding box
        this.areaBB = [
            new THREE.Box3(new THREE.Vector3(0.2, 0, 120.2), new THREE.Vector3(299.8, 100, 219.8)), // Hallway
            new THREE.Box3(new THREE.Vector3(160.2, 0, 0.2), new THREE.Vector3(299.8, 100, 120.2)) // Small room
        ];
        this.objectsBB = [];

        // Table bounding box
        var tempBB = new THREE.Box3().setFromObject(this.table);
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        // Middle button bounding box
        tempBB = new THREE.Box3().setFromObject(this.buttons[0]);
        tempBB.min.y = 0;
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        // Left button bounding box
        tempBB = new THREE.Box3().setFromObject(this.buttons[1]);
        tempBB.min.y = 0;
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        // Roght button bounding box
        tempBB = new THREE.Box3().setFromObject(this.buttons[2]);
        tempBB.min.y = 0;
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        // Exit button bounding box
        tempBB = new THREE.Box3().setFromObject(this.buttons[3]);
        tempBB.min.y = 0;
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        // Pipes bounding box
        tempBB = new THREE.Box3().setFromCenterAndSize(this.pipes[0].position, new THREE.Vector3(25, 100, 80));
        this.objectsBB.push(tempBB);

        // Staircase bounding box
        tempBB = new THREE.Box3().setFromCenterAndSize(this.staircase.position, new THREE.Vector3(35, 100, 5));
        this.objectsBB.push(tempBB);

        // Floor light bounding box
        tempBB = new THREE.Box3().setFromObject(this.lights[3]);
        tempBB.max.y = 100;
        this.objectsBB.push(tempBB);

        const helper = new THREE.Box3Helper(this.areaBB[0], 0xffff00);
        const helper2 = new THREE.Box3Helper(this.areaBB[1], 0xff00ff);
        const helper3 = new THREE.Box3Helper(this.objectsBB[7], 0x00ffff);
        this.scene.add(helper);
        this.scene.add(helper2);
        this.scene.add(helper3);
    }

    #makeValve() {
        // Create a group to hold all parts of the valve
        const valve = new THREE.Group();

        // Create the ring part of the valve
        var geometry = new THREE.TorusGeometry(10, 2, 16, 100);
        var material = new THREE.MeshBasicMaterial({ color: 0x555555 });
        var ring = new THREE.Mesh(geometry, material);

        // Create the first bar 
        geometry = new THREE.CylinderGeometry(2, 2, 16, 32);
        var bar = new THREE.Mesh(geometry, material);
        bar.rotateZ(Math.PI / 4);

        // Create the second bar 
        var bar2 = new THREE.Mesh(geometry, material.clone());
        bar2.material.color.set(0xff00ff);
        bar2.rotateZ(-Math.PI / 4);

        // Create a small black sphere for the center of the valve
        geometry = new THREE.SphereGeometry(3, 32);
        var sphere = new THREE.Mesh(geometry, material.clone());
        sphere.material.color.set(0x000000);

        valve.add(ring, bar, bar2, sphere);
        return valve;
    }


    #makeStaircase() {
        // Create a group to hold all parts of the staircase
        var staircase = new THREE.Group();

        // Create the the handrails
        var geometry = new THREE.CylinderGeometry(2.5, 2.5, 100, 32);
        var material = new THREE.MeshBasicMaterial({ color: 0x777777 });
        var leftHandrail = new THREE.Mesh(geometry, material);
        leftHandrail.position.x += -15;
        var rightHandrail = leftHandrail.clone();
        rightHandrail.position.x += 30;

        // Initialize an array to hold the steps
        var steps = [];

        // Create the steps
        geometry = new THREE.CylinderGeometry(2.5, 2.5, 30, 32);
        steps[0] = new THREE.Mesh(geometry, material);
        steps[0].rotateZ(Math.PI / 2);
        steps[0].position.y += -30;

        // Create additional steps by cloning the first step
        for (let i = 1; i < 4; i++) {
            steps[i] = steps[0].clone();
            steps[i].position.y += i * 20;
        }

        staircase.add(leftHandrail, rightHandrail, ...steps);
        return staircase;
    }

    #makeLight(light) {
        // Create a group to hold the cone and point light
        var light = new THREE.Group();

        // Create the cone 
        var geometry = new THREE.ConeGeometry(10, 20, 32, 1, true);
        var material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        var shell = new THREE.Mesh(geometry, material);

        // Add the cone shell to the group
        light.add(shell);

        // Add a point light to the group if the "light" parameter is not false
        if (light != false) {
            const pointLight = new THREE.PointLight(0xff0000, 1, 100);
            light.add(pointLight);
        }

        return light;
    }

}

export default Room