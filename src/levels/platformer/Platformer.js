import * as THREE from 'three';
import PhysicsEngine from '../../utils/PhysicsEngine.js';
import Player from '../../levels/platformer/Player.js';
import Platform from '../../entities/Platform.js';
import PhysicsObject from '../../utils/PhysicsObject.js';
import AssetLoader from '../../utils/AssetLoader';
import Spores from './Spores';

class Platformer {
    constructor(inputHandler) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, 5, 60);

        this.inputHandler = inputHandler;
        this.clock = new THREE.Clock();
        this.assetLoader = new AssetLoader();
        this.physicsEngine = new PhysicsEngine(this.scene);
        this.platforms = [];

        this.loadAssets();
    }

    init() {
        this.player = new Player(this.scene, this.inputHandler, this.physicsEngine);

        this.addFog();
        this.addLights();
        this.addGridHelper();
        this.addGround();
        this.addOuterWall();
        this.addCeiling();
        this.addPlatforms();
        this.addRopes();
        this.addBoxes();

        this.spores = new Spores(this.scene);
    }



    addFog() {
        this.scene.fog = new THREE.FogExp2(0x000000, 0.005);
    }

    addGridHelper() {
        var gridHelper = new THREE.GridHelper(960, 480);
        gridHelper.position.set(480, 480, -11);
        gridHelper.rotation.x = Math.PI / 2;
        // this.scene.add(gridHelper);
    }

    addLights() {
        // Add ambient light
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
    
        var spotlights = [
            { x: 350, y: 200, z: 10, color: 0xffa21d, angle: Math.PI / 16, intensity: 100000, target: { x: 250, y: 0, z: 10 }, withCone: false },
            { x: 250, y: 200, z: 10, color: 0xffa21d, angle: Math.PI / 16, intensity: 100000, target: { x: 100, y: 0, z: 10 }, withCone: false },
            { x: 900, y: 200, z: 30, color: 0x78eeff, angle: Math.PI / 16, intensity: 70000, target: { x: 900, y: 0, z: 30 }, withCone: true },
            { x: 775, y: 200, z: 30, color: 0x78eeff, angle: Math.PI / 16, intensity: 70000, target: { x: 775, y: 0, z: 30 }, withCone: true },
            { x: 100, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 7000, target: { x: 100, y: 0, z: 10 }, withCone: false },
            { x: 300, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 5000, target: { x: 300, y: 0, z: 10 }, withCone: false },
            { x: 500, y: 200, z: 50, color: 0xffa21d, angle: Math.PI / 6, intensity: 2000, target: { x: 500, y: 0, z: 10 }, withCone: false }
        ];
    
        // Add spotlights to the scene
        spotlights.forEach(({ x, y, z, color, angle, intensity, target, withCone }) => {
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
    

    addGround() {
        var groundGeometry = new THREE.PlaneGeometry(1920, 54);
        var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x4b76b6});

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.set(960, 0, 25);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;

        this.scene.add(ground);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, ground, false, 'ground'));
    }

    addOuterWall() {
        var groundGeometry = new THREE.PlaneGeometry(1920, 108);
        var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x4b76b6, visible: false });

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.set(960, 54, 51);
        ground.receiveShadow = true;

        this.scene.add(ground);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, ground, false, 'ground'));
    }

    addCeiling() {
        var ceilingGeometry = new THREE.BoxGeometry(1152, 1, 108);
        var ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0x4b76b6 });

        var ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(576, 110, 45);

        this.scene.add(ceiling);
        this.physicsEngine.addObject(new PhysicsObject(this.scene, ceiling, false, 'ceiling'));
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
        rope.position.set(275, 0, 10);
        this.scene.add(rope);
    }

    addBoxes() {
        var positions = [
            { x: 220, y: 5, z: 15.5, width: 15, height: 15, depth: 10 },
            { x: 235, y: 10, z: 15.5, width: 15, height: 25, depth: 15 },
            { x: 420, y: 67.5, z: 15.5, width: 20, height: 15, depth: 15 },
            { x: 332, y: 25, z: 15.5, width: 20, height: 50, depth: 15 }
        ];

        positions.forEach((pos) => {
            var boxGeometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
            var boxMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff,
            shininess: 90, specular: 0xffffff});

            var box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(pos.x, pos.y, pos.z);

            this.physicsEngine.addObject(new PhysicsObject(this.scene, box, false, 'box'));
            this.scene.add(box);
        });
    }

    addPlatforms() {
        var positions = [
            { x: 170, y: 15, z: 15.5, width: 70, height: 1, depth: 20 },
            { x: 275, y: 35, z: 15.5, width: 50, height: 1, depth: 20 },
            { x: 400, y: 60, z: 15.5, width: 90, height: 1, depth: 20 },
            { x: 535, y: 45, z: 15.5, width: 110, height: 1, depth: 20 }
        ];

        positions.forEach((pos) => {
            var platform = new Platform(
                this.scene,
                pos.x, pos.y, pos.z,
                pos.width, pos.height, pos.depth,
                this.physicsEngine,
                'platform'
            );
            this.platforms.push(platform);
            for (var platform of this.platforms) {
                platform.castShadow = true;
                platform.receiveShadow = true;
            }
        });
    }

    async loadAssets() {
        try {
            await this.assetLoader.loadAllAssets();

            var mapTexture = this.assetLoader.getAsset('map');
            var wallMesh = this.assetLoader.getAsset('wall');
            wallMesh.receiveShadow = true;
            wallMesh.position.set(35, 8.5, -12);
            wallMesh.scale.set(4, 15, 14);
            wallMesh.rotation.y = -Math.PI / 2;
            wallMesh.children.forEach((child) => {
                if (child.material) child.material.color.set(0x4b76b6);
            });

            this.scene.add(wallMesh);

            var mapMaterial = new THREE.MeshBasicMaterial({
                map: mapTexture,
                side: THREE.DoubleSide,
                opacity: 0.5,
                transparent: true,
            });

            this.createMapPlane(mapMaterial);
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }

    createMapPlane(mapMaterial) {
        var mapGeometry = new THREE.PlaneGeometry(960, 108);
        var mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
        mapPlane.position.set(480, 35, -5);
        this.scene.add(mapPlane);
    }

    update(deltaTime) {
        this.player.update(deltaTime);
        this.physicsEngine.update(deltaTime);
        this.scene.fog.density = 0.0005 + (this.player.mesh.position.x / 96000);
        this.updateCamera();
    }

    updateCamera() {
        this.camera.position.x = this.player.mesh.position.x;
        this.camera.position.y = this.player.mesh.position.y + 10;
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