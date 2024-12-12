import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import Text from './Text.js';
import AssetLoader from './EscapeRoomAssetLoader.js';


class Room {
    constructor(scene) {
        this.scene = scene;
        // Struture objects
        this.floor, this.walls, this.ceilling;

        this.table, this.letter, this.alphabet;
        this.pipes, this.valves, this.Lshapes;
        this.buttons, this.text;
        this.staircase, this.exitBorder;
        this.lights;
        this.textures;
        this.fontLoader;
        this.textureLoader;
        this.assetLoader;

        this.interactiveOb;

        // Array of bounding boxes tha make up the room
        this.areaBB, this.objectsBB;
        this.#init();
        this.#roomSetUp();
        this.#addObjects();
        this.#setUpBoundignBoxes();

    }

    #init() {
        this.pipes = [];
        this.valves = [];
        this.Lshapes = [];
        this.buttons = [];
        this.text = [];
        this.lights = [];
        this.interactiveOb = [];
        this.areaBB = [];
        this.objectsBB = [];
        this.textures = [];
        this.fontLoader = new FontLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.assetLoader = new AssetLoader();

        this.concrete = new THREE.MeshStandardMaterial({ color: 0x808080 });

    }

    #roomSetUp() {
        console.log("second")

        var textures = [];
        textures[0] = this.textureLoader.load('/assets/textures/grainy-concrete-bl/grainy-concrete_albedo.png');
        textures[1] = this.textureLoader.load('/assets/textures/grainy-concrete-bl/grainy-concrete_roughness.png');
        textures[2] = this.textureLoader.load('/assets/textures/grainy-concrete-bl/grainy-concrete_metallic.png');
        textures[3] = this.textureLoader.load('/assets/textures/grainy-concrete-bl/grainy-concrete_ao.png');

        // Floor setup
        var geometry = new THREE.PlaneGeometry(300, 220);
        this.concrete = new THREE.MeshStandardMaterial({
            color: 0x808080,
            map: textures[0],
            roughnessMap: textures[1],
            metalnessMap: textures[2],
            aoMap: textures[3],
        });
        this.floor = new THREE.Mesh(geometry, this.concrete);

        this.floor.rotateX(-Math.PI / 2);
        this.floor.position.set(150, 0, 110);
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        // Ceiling setup
        this.ceilling = this.floor.clone();
        this.ceilling.material = this.ceilling.material.clone();
        this.ceilling.rotateX(Math.PI);
        this.ceilling.position.y += 100;
        this.ceilling.receiveShadow = true;
        this.scene.add(this.ceilling);

        textures[0] = this.textureLoader.load('/assets/textures/harshbricks-bl/harshbricks-albedo.png');
        textures[1] = this.textureLoader.load('/assets/textures/harshbricks-bl/harshbricks-roughness.png');
        textures[2] = this.textureLoader.load('/assets/textures/harshbricks-bl/harshbricks-normal.png');
        textures[3] = this.textureLoader.load('/assets/textures/harshbricks-bl/harshbricks-ao2.png');

        this.walls = [];
        geometry = new THREE.PlaneGeometry(100, 100);
        this.bricks = new THREE.MeshStandardMaterial({
            color: 0x909090,
            side: THREE.DoubleSide,
            map: textures[0],
            roughnessMap: textures[1],
            normalMap: textures[2],
            aoMap: textures[3]
        });
        this.walls[0] = new THREE.Mesh(geometry, this.bricks);
        this.walls[0].rotateY(Math.PI / 2);
        this.walls[0].position.set(0, 50, 170);

        geometry = new THREE.PlaneGeometry(300, 100);
        this.walls[1] = new THREE.Mesh(geometry, this.bricks);
        this.walls[1].position.set(150, 50, 220);

        geometry = new THREE.PlaneGeometry(220, 100);
        this.walls[2] = new THREE.Mesh(geometry, this.bricks);
        this.walls[2].rotateY(Math.PI / 2);
        this.walls[2].position.set(300, 50, 110);

        geometry = new THREE.PlaneGeometry(140, 100);
        this.walls[3] = new THREE.Mesh(geometry, this.bricks);
        this.walls[3].position.set(230, 50, 0);

        geometry = new THREE.PlaneGeometry(120, 100);
        this.walls[4] = new THREE.Mesh(geometry, this.bricks);
        this.walls[4].rotateY(Math.PI / 2);
        this.walls[4].position.set(160, 50, 60);

        geometry = new THREE.PlaneGeometry(160, 100);
        this.walls[5] = new THREE.Mesh(geometry, this.bricks);
        this.walls[5].position.set(80, 50, 120);
        this.scene.add(...this.walls);

        // Entrace setup
        geometry = new THREE.PlaneGeometry(60, 60);
        var material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        this.entrance = new THREE.Mesh(geometry, material);
        this.entrance.rotateX(Math.PI / 2);
        this.entrance.position.set(230, 99.9, 170);
        this.scene.add(this.entrance);

        // Exit setup
        geometry = new THREE.ConeGeometry(30, 210, 32);
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
        this.exitBorder = new THREE.Mesh(geometry, material);
        this.exitBorder.position.set(80, 100, 142.5);
        this.exitBorder.visible = false;
        this.exit = new THREE.SpotLight(0xffffff, 100000, 250, 0.15);
        this.exit.translateY(100);
        this.exit.target.position.set(80, 0, 142.5);
        this.exit.visible = false;
        this.exitBorder.add(this.exit);
        this.scene.add(this.exitBorder);


    }

    #addObjects() {

        // Table setup
        var geometry = new THREE.BoxGeometry(50, 30, 25);
        var material = new THREE.MeshStandardMaterial({
            color: 0x606060,
            map: this.textureLoader.load('/assets/textures/agedplanks1-bl/agedplanks1-albedo.png'),
            roughnessMap: this.textureLoader.load('/assets/textures/agedplanks1-bl/agedplanks1-roughness.png'),
            normalMap: this.textureLoader.load('/assets/textures/agedplanks1-bl/agedplanks1-normal4-ogl.png'),
            aoMap: this.textureLoader.load('/assets/textures/agedplanks1-bl/agedplanks1-ao.png'),
        });
        this.table = new THREE.Mesh(geometry, material);
        this.table.rotateY(-Math.PI / 2);
        this.table.position.set(287.5, 15, 60);
        this.table.castShadow = true;
        this.table.receiveShadow = true;
        this.scene.add(this.table);

        // Letter setup
        geometry = new THREE.PlaneGeometry(9, 14);
        material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.textureLoader.load('/assets/textures/swj.png')
        });
        this.letter = new THREE.Mesh(geometry, material);
        this.letter.rotateX(-Math.PI / 2);
        this.letter.rotateZ(-Math.PI / 2);
        this.letter.position.copy(this.table.position);
        this.letter.position.y += 16.01;
        this.letter.castShadow = true;
        this.letter.receiveShadow = true;
        this.scene.add(this.letter);

        // Alphabet setup
        geometry = new THREE.PlaneGeometry(18, 24);
        material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: this.textureLoader.load('/assets/textures/livelaughlove.png')
        });
        this.alphabet = new THREE.Mesh(geometry, material);
        this.alphabet.rotateY(-Math.PI / 2);
        this.alphabet.position.set(299.9, 65, 60);
        this.alphabet.castShadow = true;
        this.alphabet.receiveShadow = true;
        this.scene.add(this.alphabet);

        this.textures[0] = this.textureLoader.load('public/assets/textures/metal-shipping-container-bl/metal-shipping-container_albedo.png')
        this.textures[1] = this.textureLoader.load('public/assets/textures/metal-shipping-container-bl/metal-shipping-container_roughness.png')
        this.textures[2] = this.textureLoader.load('public/assets/textures/metal-shipping-container-bl/metal-shipping-container_metallic.png')
        this.textures[3] = this.textureLoader.load('public/assets/textures/metal-shipping-container-bl/metal-shipping-container_normal-ogl.png')
        this.textures[4] = this.textureLoader.load('public/assets/textures/metal-shipping-container-bl/metal-shipping-container_ao.png')

        this.buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            map: this.textures[0],
            roughnessMap: this.textures[1],
            metalnessMap: this.textures[2],
            normalMap: this.textures[3],
            aoMap: this.textures[4]
        });

        // Buttons set up
        // Button 1 (middle)
        geometry = new THREE.BoxGeometry(9, 14, 5);
        material = new THREE.MeshStandardMaterial({ color: 0x505050 });
        this.buttons[0] = new THREE.Mesh(geometry, this.buttonMaterial);
        this.buttons[0].position.set(230, 55, 2.5);
        this.buttons[0].castShadow = true;
        this.buttons[0].receiveShadow = true;
        this.text[0] = new Text(this, this.scene, "W", "B", 5);
        this.text[0].position.copy(this.buttons[0].position);
        // this.text[0].translateY(14);
        this.text[0].translateZ(2.5);
        // Button 2 (left)
        this.buttons[1] = new THREE.Mesh(geometry, this.buttonMaterial);
        this.buttons[1].position.copy(this.buttons[0].position);
        this.buttons[1].position.x += -28;
        this.buttons[1].castShadow = true;
        this.buttons[1].receiveShadow = true;
        this.text[1] = new Text(this, this.scene, "H", "S", 5);
        this.text[1].position.copy(this.buttons[1].position);
        // this.text[0].translateY(14);
        this.text[1].translateZ(2.5);
        // Button 3 (right)
        this.buttons[2] = new THREE.Mesh(geometry, this.buttonMaterial);
        this.buttons[2].position.copy(this.buttons[0].position);
        this.buttons[2].position.x += 28;
        this.buttons[2].castShadow = true;
        this.buttons[2].receiveShadow = true;
        this.text[2] = new Text(this, this.scene, "F", "J", 5);
        this.text[2].position.copy(this.buttons[2].position);
        // this.text[0].translateY(14);
        this.text[2].translateZ(2.5);
        // Button 4 (Exit)
        this.buttons[3] = new THREE.Mesh(geometry, this.buttonMaterial);
        this.buttons[3].rotateY(Math.PI / 2);
        this.buttons[3].position.set(2.5, 55, 200);
        this.buttons[3].castShadow = true;
        this.buttons[3].receiveShadow = true;
        this.scene.add(...this.buttons);

        this.textures[0] = this.textureLoader.load('/assets/textures/grimy-metal-bl/grimy-metal-albedo.png')
        this.textures[1] = this.textureLoader.load('/assets/textures/grimy-metal-bl/grimy-metal-metalness.png')
        this.textures[2] = this.textureLoader.load('/assets/textures/grimy-metal-bl/grimy-metal-roughness.png')
        this.textures[3] = this.textureLoader.load('public/assets/textures/grimy-metal-bl/grimy-metal-normal-ogl.png')

        this.metal = new THREE.MeshStandardMaterial({
            color: 0x505050,
            map: this.textures[0],
            metalnessMap: this.textures[1],
            roughnessMap: this.textures[2],
            normalMap: this.textures[3],
        });


        // Pipes setup
        geometry = new THREE.CylinderGeometry(10, 10, 100, 32);
        material = new THREE.MeshStandardMaterial({ color: 0x505050 });
        // Middle 
        this.pipes[0] = new THREE.Mesh(geometry, this.metal);
        this.pipes[0].position.set(160, 50, 60);
        this.pipes[0].castShadow = true;
        this.pipes[0].receiveShadow = true;
        // Left
        this.pipes[1] = this.pipes[0].clone();
        this.pipes[1].position.z += 30;
        this.pipes[1].castShadow = true;
        this.pipes[1].receiveShadow = true;
        // Right
        this.pipes[2] = this.pipes[0].clone();
        this.pipes[2].position.z += -30;
        this.pipes[2].castShadow = true;
        this.pipes[2].receiveShadow = true;
        this.scene.add(...this.pipes);

        // Valves setup
        // Middle
        this.valves[0] = this.#makeValve();
        this.valves[0].rotateY(Math.PI / 2);
        this.valves[0].position.set(170.1, 50, 60);
        // Left
        this.valves[1] = this.#makeValve();
        this.valves[1].rotateY(Math.PI / 2);
        this.valves[1].position.set(170.1, 50, 90);

        // Right
        this.valves[2] = this.#makeValve();
        this.valves[2].rotateY(Math.PI / 2);
        this.valves[2].position.set(170.1, 50, 30);
        this.scene.add(...this.valves);

        // L setup
        // Middle
        this.Lshapes[0] = this.#makeLShape();
        this.Lshapes[0].position.copy(this.valves[0].position);
        this.Lshapes[0].translateY(20);
        this.Lshapes[0].rotateZ(Math.PI / 2);
        // Left
        this.Lshapes[1] = this.#makeLShape();
        this.Lshapes[1].position.copy(this.valves[1].position);
        this.Lshapes[1].translateY(20);
        this.Lshapes[1].rotateZ(Math.PI);
        // Right
        this.Lshapes[2] = this.#makeLShape();
        this.Lshapes[2].position.copy(this.valves[2].position);
        this.Lshapes[2].translateY(20);
        this.Lshapes[2].rotateZ(-Math.PI / 2);
        this.scene.add(...this.Lshapes);

        // Stairs setup
        this.staircase = this.#makeStaircase();
        this.staircase.position.set(80, 50, 122.5);
        this.scene.add(this.staircase);

        // Light setup
        // Left
        this.lights[0] = this.#makeLight();
        this.lights[0].position.set(50, 105, 170);
        this.lights[0].children[2].target.position.set(50, 0, 170);

        // Middle
        this.lights[1] = this.#makeLight();
        this.lights[1].position.set(150, 105, 170);
        this.lights[1].children[2].target.position.set(150, 0, 170);

        // Small room
        this.lights[2] = this.#makeLight();
        this.lights[2].position.set(230, 105, 70);
        this.lights[2].children[2].target.position.set(230, 0, 70);

        // Hole
        this.lights[3] = this.#makeLight();
        this.lights[3].position.set(230, 105, 170);
        this.lights[3].children[0].visible = false
        this.lights[3].children[1].visible = false
        this.scene.add(...this.lights);

        this.buttons.forEach((button) => this.interactiveOb.push(button));
        this.valves.forEach((valve) => this.interactiveOb.push(valve));
        this.interactiveOb.push(this.staircase);
        this.Lshapes.forEach((valve) => this.interactiveOb.push(valve));
        this.interactiveOb.push(this.exitBorder, this.letter, this.alphabet);

    }

    #setUpBoundignBoxes() {
        // The room bounding box
        var tempBB = new THREE.Box3(new THREE.Vector3(0.2, 0, 120.2), new THREE.Vector3(299.8, 100, 219.8)); // Hallway
        this.areaBB.push(tempBB);
        tempBB = new THREE.Box3(new THREE.Vector3(160.2, 0, 0.2), new THREE.Vector3(299.8, 100, 120.2)); // Small room
        this.areaBB.push(tempBB);

        // Table bounding box
        tempBB = new THREE.Box3().setFromObject(this.table);
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

        // Right button bounding box
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
    }

    #makeValve() {
        // Create a group to hold all parts of the valve
        const valve = new THREE.Group();

        // Create the ring part of the valve
        var geometry = new THREE.TorusGeometry(10, 2, 16, 100);
        var material = this.metal.clone();
        material.color.set(0x555555);
        var ring = new THREE.Mesh(geometry, material);

        // Create the first bar 
        geometry = new THREE.CylinderGeometry(2, 2, 16, 32);
        var bar = new THREE.Mesh(geometry, material);
        bar.rotateZ(Math.PI / 4);

        // Create the second bar 
        var bar2 = new THREE.Mesh(geometry, material);
        bar2.rotateZ(-Math.PI / 4);

        // Create a small black sphere for the center of the valve
        geometry = new THREE.SphereGeometry(3, 32);
        var sphere = new THREE.Mesh(geometry, material.clone());
        sphere.material.color.set(0x000000);

        valve.add(ring, bar, bar2, sphere);
        valve.children.forEach((children) => {
            children.castShadow = true;
            children.receiveShadow = true;
        })

        return valve;
    }

    #makeStaircase() {
        // Create a group to hold all parts of the staircase
        var staircase = new THREE.Group();

        // Create the the handrails
        var geometry = new THREE.CylinderGeometry(2.5, 2.5, 100, 32);
        var material = this.metal.clone()
        material.color.set(0x777777);
        var leftHandrail = new THREE.Mesh(geometry, material);
        leftHandrail.position.x += -15;
        leftHandrail.castShadow = true;
        leftHandrail.receiveShadow = true;
        var rightHandrail = leftHandrail.clone();
        rightHandrail.position.x += 30;
        rightHandrail.castShadow = true;
        rightHandrail.receiveShadow = true;

        // Initialize an array to hold the steps
        var steps = [];

        // Create the steps
        geometry = new THREE.CylinderGeometry(2.5, 2.5, 30, 32);
        steps[0] = new THREE.Mesh(geometry, material);
        steps[0].rotateZ(Math.PI / 2);
        steps[0].position.y += -30;
        steps[0].castShadow = true;
        steps[0].receiveShadow = true;

        // Create additional steps by cloning the first step
        for (let i = 1; i < 4; i++) {
            steps[i] = steps[0].clone();
            steps[i].position.y += i * 20;
            steps[i].castShadow = true;
            steps[i].receiveShadow = true;
        }

        staircase.add(leftHandrail, rightHandrail, ...steps);
        return staircase;
    }

    #makeLight() {
        // Create a group to hold the bulb and spot light
        var light = new THREE.Group();

        // Create the light bulb 
        var geometry = new THREE.SphereGeometry(15, 32, 16, 0, Math.PI * 2, 0, 1.57);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        var bulb = new THREE.Mesh(geometry, material);
        bulb.rotateX(Math.PI)
        light.add(bulb);

        // Add the light to the group
        const spotLight = new THREE.SpotLight(0xffffff, 70000, 150, Math.PI / 2, 0.3, 2.5);
        const pointLight = new THREE.PointLight(0xffffff, 1000);
        // Higher resolution shadows
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        pointLight.castShadow = true;
        pointLight.castShadow = true;
        pointLight.translateY(-6);
        light.add(pointLight);
        light.add(spotLight);
        // light.add(spotLight.target);

        return light;
    }

    #makeLShape() {
        const Lshape = new THREE.Group();

        var geometry = new THREE.BoxGeometry(1.5, 10, 1);
        var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        var vL = new THREE.Mesh(geometry, material);
        vL.translateX(-2.25);
        vL.translateZ(1);

        geometry = new THREE.BoxGeometry(6, 1.5, 1);
        var hL = new THREE.Mesh(geometry, material);
        hL.translateY(-4.25);
        hL.translateZ(1);

        Lshape.add(vL, hL);
        Lshape.children.forEach((children) => {
            children.castShadow = true;
            children.receiveShadow = true;
        })
        Lshape.rotateY(Math.PI / 2);


        return Lshape;
    }

    addIntercaticeObject(object) {
        this.interactiveOb.push(object);
        // return texture;
    }

}

export default Room