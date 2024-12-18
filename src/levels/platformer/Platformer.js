import * as THREE from 'three';
import PhysicsEngine from '../../levels/platformer/utils/PhysicsEngine.js';
import Player from '../../levels/platformer/Player.js';
import Platform from './entities/Platform.js';
import PhysicsObject from '../../levels/platformer/utils/PhysicsObject.js';
import AssetLoader from '../../levels/platformer/utils/AssetLoader.js';
import Spores from './Spores';
import Mushrooms from './entities/Mushrooms.js';
import Lever from './entities/Lever.js';
import playerData from './utils/playerData.js';

class Platformer {
    constructor(inputHandler) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(30, 10, 65);

        this.inputHandler = inputHandler;
        this.clock = new THREE.Clock();
        this.assetLoader = new AssetLoader();
        this.physicsEngine = new PhysicsEngine(this.scene);
        this.platforms = [];
        this.gameOver = false;

        this.loadAssets();

        this.gameOverCameraStartX = this.camera.position.x;
        this.gameOverCameraEndX = 1920; // The end of the scene (or a designated far point)
        this.gameOverDuration = 3000; // Time in milliseconds for the pan
        this.startTime = null;
    }

    init() {
        this.player = new Player(this.scene, this.inputHandler, this.physicsEngine);
        this.camera.lookAt(this.player.mesh.position)


        this.addFog();
        this.addLights();
        this.addGridHelper();
        this.addGround();
        this.addOuterWall();
        this.addCeiling();
        this.addPlatforms();
        this.addRopes();
        this.addDynamicBoxes();
        this.addStaticBoxes();
        this.addGates();
        this.addMushrooms();
        this.addLevers();
        this.addGlassCase();

        this.spores = new Spores(this.scene);
    }

    addLevers() {
        this.lever = new Lever(this.inputHandler);
        this.lever.position.set(425, 67.5, 1)
        this.scene.add(this.lever)
        console.log(this.lever)
    }



    addFog() {
        this.scene.fog = new THREE.FogExp2(0x000000, 0.1);
    }

    addGridHelper() {
        var gridHelper = new THREE.GridHelper(960, 480);
        gridHelper.position.set(480, 480, -11);
        gridHelper.rotation.x = Math.PI / 2;
        // this.scene.add(gridHelper);
    }

    addLights() {
        // Add ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.ambientLight.intensity = 0.2;
        this.scene.add(this.ambientLight);

        this.spotlights = [
            { x: 350, y: 200, z: 10, color: 0xffa21d, angle: Math.PI / 16, intensity: 20000, target: { x: 250, y: 0, z: 10 }, withCone: false },
            { x: 250, y: 200, z: 10, color: 0xffa21d, angle: Math.PI / 16, intensity: 20000, target: { x: 100, y: 0, z: 10 }, withCone: false },
            { x: 900, y: 200, z: 30, color: 0x78eeff, angle: Math.PI / 16, intensity: 35000, target: { x: 900, y: 0, z: 30 }, withCone: true },
            { x: 775, y: 200, z: 30, color: 0x78eeff, angle: Math.PI / 16, intensity: 35000, target: { x: 775, y: 0, z: 30 }, withCone: true },
            { x: 1025, y: 200, z: 30, color: 0x78eeff, angle: Math.PI / 16, intensity: 35000, target: { x: 775, y: 0, z: 30 }, withCone: true },
            { x: 100, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 3500, target: { x: 100, y: 0, z: 10 }, withCone: false },
            { x: 300, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 2500, target: { x: 300, y: 0, z: 10 }, withCone: false },
            { x: 500, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 1000, target: { x: 500, y: 0, z: 10 }, withCone: false }
        ];

        // Add spotlights to the scene
        this.spotlights.forEach(({ x, y, z, color, angle, intensity, target, withCone }) => {
            var spotlight = new THREE.SpotLight(color, intensity);
            spotlight.angle = angle;
            spotlight.penumbra = 0.5;
            spotlight.decay = 2;
            spotlight.position.set(x, y, z);

            var targetObject = new THREE.Object3D();
            targetObject.position.set(target.x, target.y, target.z);
            this.scene.add(targetObject);
            spotlight.target = targetObject;

            spotlight.castShadow = true;
            this.scene.add(spotlight);

            // Add spotlight cone mesh to show the cone of the light for dramatic effect
            if (withCone) {
                var coneGeometry = new THREE.ConeGeometry(35, 130, 32);
                var coneMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    opacity: 0.2,
                    transparent: true
                });
                var coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
                coneMesh.position.set(x, 50, z);
                this.scene.add(coneMesh);
            }
        });
    }

    addMushrooms() {
        this.mushrooms = [];

        var positions = [
            { x: 240, y: 30, z: 10 },
            { x: 350, y: 10, z: 10 },
            { x: 837.5, y: 40, z: 10 },
            { x: 1100, y: 65, z: 10 },
            { x: 1350, y: 65, z: 10 }
        ];

        positions.forEach((pos) => {
            var mushroom = new Mushrooms(this.scene, new THREE.Vector3(pos.x, pos.y, pos.z), 2, this.physicsEngine);
            this.mushrooms.push(mushroom);
        });
    }

    addGround() {
        var groundGeometry = new THREE.PlaneGeometry(2000, 54);
        var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x3a4043 });

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.set(1000, 0, 25);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;

        this.scene.add(ground);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, ground, false, false, 'ground'));
    }

    addOuterWall() {
        var wallGeometry = new THREE.PlaneGeometry(1920, 108);
        var wallMaterial = new THREE.MeshPhongMaterial({ color: 0x3a4043, visible: false });

        var wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(960, 54, 20);
        wall.receiveShadow = true;

        this.scene.add(wall);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, wall, false, false, 'innerWall'));

        var wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall2.position.set(960, 54, 0);
        wall2.receiveShadow = true;

        this.scene.add(wall2);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, wall2, false, false, 'outerWall'));
    }

    addCeiling() {
        var ceilingGeometry = new THREE.BoxGeometry(1152, 1, 108);
        var ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0x3a4043 });

        var ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(775, 110, 45);

        this.scene.add(ceiling);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, ceiling, false, false, 'ceiling'));
    }

    addRopes() {
        var ropePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 110, -12),
            new THREE.Vector3(54, 70, -12),
            new THREE.Vector3(108, 110, -12),
        ]);

        var ropeGeometry = new THREE.TubeGeometry(ropePath, 100, 1, 8, false);
        var ropeMaterial = new THREE.MeshBasicMaterial({ color: 0x272727 });

        var rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope.position.set(275, 0, 15);
        this.scene.add(rope);
    }



    addDynamicBoxes() {
        var textureLoader = new THREE.TextureLoader();
        var texturePath = './textures/Crate.png';
        var positions = [
            // { x: 420, y: 5, z: 10, width: 20, height: 15, depth: 15 },
            // { x: 535, y: 5, z: 10, width: 20, height: 15, depth: 15 },
            // { x: 550, y: 5, z: 10, width: 20, height: 25, depth: 15 },
            // { x: 565, y: 50, z: 10, width: 20, height: 15, depth: 15 },
            { x: 1000, y: 50, z: 10, width: 20, height: 15, depth: 15 },
            { x: 1020, y: 50, z: 10, width: 20, height: 25, depth: 15 },
            { x: 1040, y: 50, z: 10, width: 20, height: 35, depth: 15 }
        ];

        positions.forEach((pos) => {
            var boxGeometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            var boxMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load(texturePath),
                color: 0xb9874e,
                shininess: 90, specular: 0xffffff
            });

            var box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(pos.x, pos.y, pos.z);
            box.castShadow = true;

            this.physicsEngine.addObject(new PhysicsObject(this.scene, box, true, false, 'box'));
            this.scene.add(box);
        });
    }

    addStaticBoxes() {
        var textureLoader = new THREE.TextureLoader();
        var texturePath = './textures/Crate.png';
        var positions = [
            { x: 225, y: 5, z: 10, width: 15, height: 15, depth: 15 },
            { x: 240, y: 10, z: 10, width: 15, height: 25, depth: 15 },
            { x: 332, y: 25, z: 10, width: 20, height: 50, depth: 15 },
            // { x: 565, y: 50, z: 10, width: 20, height: 15, depth: 15 },
        ];

        positions.forEach((pos) => {
            var boxGeometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            var boxMaterial = new THREE.MeshPhongMaterial({
                map: textureLoader.load(texturePath),
                color: 0x7e5210,
                shininess: 90, specular: 0xffffff
            });

            var box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(pos.x, pos.y, pos.z);
            box.castShadow = true;

            this.physicsEngine.addObject(new PhysicsObject(this.scene, box, false, false, 'box'));
            this.scene.add(box);
        });
    }

    addPlatforms() {
        var texturePath = './textures/metallic/Metal062C_1K-JPG_Color.jpg';
        var positions = [
            { x: 170, y: 15, z: 10, width: 70, height: 1, depth: 20, minY: 10, maxY: 30, speed: 0.25 },
            { x: 283.5, y: 35, z: 10, width: 50, height: 1, depth: 20, minY: 25, maxY: 45, speed: 0.25 },
            { x: 400, y: 60, z: 10, width: 90, height: 1, depth: 15, minY: 25, maxY: 60, speed: 0.25 },
            { x: 535, y: 45, z: 10, width: 110, height: 1, depth: 20, minY: 10, maxY: 25, speed: 0.25 },
            { x: 837.5, y: 35, z: 10, width: 50, height: 1, depth: 20, minY: 10, maxY: 25, speed: 0.2 },
            { x: 1250, y: 35, z: 10, width: 50, height: 1, depth: 20, minY: 10, maxY: 45, speed: 0.2 },
            { x: 1350, y: 50, z: 10, width: 50, height: 1, depth: 20, minY: 10, maxY: 25, speed: 0 }
        ];

        positions.forEach((pos) => {
            // Create the platform with movement properties
            var platform = new Platform(
                this.scene,
                pos.x, pos.y, pos.z,
                pos.width, pos.height, pos.depth,
                this.physicsEngine,
                'platform',
                pos.minY,
                pos.maxY,
                pos.speed,
                texturePath
            );

            platform.mesh.castShadow = true;
            platform.mesh.receiveShadow = true;

            this.platforms.push(platform);
        });
    }

    addGates() {
        var positions = [
            { x: 698.5, y: 45, z: 20 }];

        positions.forEach((pos) => {
            var geo = new THREE.PlaneGeometry(60, 108);
            var mat = new THREE.MeshPhongMaterial({ color: 0xffffff, visible: false });
            this.gate = new THREE.Mesh(geo, mat);
            this.gate.position.set(pos.x, pos.y, pos.z)
            this.gate.rotation.y = -Math.PI / 2;
            this.scene.add(this.gate);
            this.physicsEngine.addObject(new PhysicsObject(this.scene, this.gate, false, false, 'gate'));
        })
    }

    addGlassCase() {
        // Simple geometry and material for the glass object
        var glassGeometry = new THREE.BoxGeometry(10, 10, 10);
        var glassMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true,
            wireframe: true,
            emissive: 0x888888 // Adding subtle emission for a breaking effect
        });

        this.glassObject = new THREE.Mesh(glassGeometry, glassMaterial);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, this.glassObject, false, false, 'glass'));
        this.glassObject.position.set(1350, 65, 10);
        this.scene.add(this.glassObject);

    }


    async loadAssets() {
        try {
            await this.assetLoader.loadAllAssets();

            var mapTexture = this.assetLoader.getAsset('map');
            this.wallMesh = this.assetLoader.getAsset('wall');
            this.gateModel = this.assetLoader.getAsset('gate');

            this.gateModel.position.set(700, 0, 35);
            this.gateModel.scale.set(5, 7.6, 4);
            this.scene.add(this.gateModel);
            //console.log(this.gateModel);


            this.wallMesh.receiveShadow = true;
            this.wallMesh.position.set(35, 8.5, -7);
            this.wallMesh.scale.set(4, 15, 24.5);
            this.wallMesh.rotation.y = -Math.PI / 2;
            this.wallMesh.children.forEach((child) => {
                if (child.material) child.material.color.set(0x3a4043);
            });

            this.scene.add(this.wallMesh);

            var mapMaterial = new THREE.MeshBasicMaterial({
                map: mapTexture,
                side: THREE.DoubleSide,
                opacity: 0.5,
                transparent: true,
            });

            // this.createMapPlane(mapMaterial);
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }

    createMapPlane(mapMaterial) {
        var mapGeometry = new THREE.PlaneGeometry(960, 108);
        var mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
        mapPlane.position.set(480, 35, 0);
        this.scene.add(mapPlane);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.physicsEngine.update(deltaTime);
        this.scene.fog.density = 0.0005 + (this.player.mesh.position.x / 96000);
        this.updateCamera();
        this.updateLights();
        if (this.player.mesh.position.x > 415 && this.player.mesh.position.x < 435) {
            this.lever.update();
            this.lever.displayInstruction(this.player.mesh)
            if (this.lever.isPulled) {
                var targetHeight = this.gate.position.y + 45;
                this.gate.position.y = THREE.MathUtils.lerp(this.gate.position.y, targetHeight, 0.35); // Adjust the lerp factor as needed
                this.gateModel.position.y = THREE.MathUtils.lerp(this.gateModel.position.y, targetHeight, 0.1); // Adjust the lerp factor as needed
            }
        }

        this.platforms.forEach(platform => {
            platform.update(); // Update movement for platforms with minY, maxY, and speed
        });

        // Check for end game condition
        if (playerData.mushroomCount === 5) {
            this.gameOver = true;
        }
    }

    updateCamera() {
        // Check if the game is over before panning the camera
        if (this.gameOver === true) {
            this.camera.position.y = 15;
            var panSpeed = 15; // Adjust the speed of the pan
            var targetX = Math.max(30, this.camera.position.x - panSpeed); // Stop the camera at x: 30
            this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.1); // Adjust the lerp factor for slower movement
        } else {
            this.camera.position.x = this.player.mesh.position.x;
            this.camera.position.y = this.player.mesh.position.y + 10;
        }
    }

    updateLights(){
            if(this.gameOver === true){
                this.ambientLight.intensity = THREE.MathUtils.lerp(this.ambientLight.intensity, 2, 0.1)
                for (var spotlight of this.spotlights){
                    spotlight.intensity = THREE.MathUtils.lerp(spotlight.intensity, 750000, 10000)
                }
            }
    }
    

    render(renderer) {
        renderer.render(this.scene, this.camera);
    }

    clear() {
        console.log('Clearing the scene...');

        // Dispose geometries and materials of objects in the scene
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });

        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            var child = this.scene.children[0];
            this.scene.remove(child);
        }

        // Clear physics objects if applicable
        if (this.physicsEngine) {
            this.physicsEngine.clear(); // Ensure this properly removes physics objects
        }

        // Nullify references to prevent memory leaks
        this.scene = null;
        this.camera = null;
        this.clock = null;
        this.assetLoader = null;
        this.physicsEngine = null;
        this.player = null;
        this.platforms = null;
        this.spores = null;

        console.log('Scene cleared.');
    }
}

export default Platformer;
