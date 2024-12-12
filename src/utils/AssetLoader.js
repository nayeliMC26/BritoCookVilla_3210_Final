import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
/* Temp class to potentially be used for aync loading */
class AssetLoader {
    constructor() {
        // Store assets
        this.assets = {};

        // Initialize our loaders 
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        this.audioLoader = new THREE.AudioLoader();
    }

    /**
     * A function which takes in a string for the texture's path and loads the texture
     * @param {String} path 
     * @returns {Promise<THREE.Texture>}
     */
    loadTexture(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    resolve(texture);
                },
                undefined,
                (error) => {
                    reject(`Error loading texture at ${path}: ${error}`);
                }
            );
        });
    }

    /**
    * A function which takes in a string for the model's path and loads the model
    * @param {String} path 
    * @returns {Promise<THREE.Object3D>}
    */
    loadGLTFModel(path) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    reject(`Error loading GLTF model at ${path}: ${error}`);
                }
            );
        });
    }

    /**
     * A function which takes in a string for the audio's path and loads the audio buffer
     * @param {String} path 
     * @returns {Promise<THREE.AudioBuffer>}
     */
    loadAudio(path) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                path,
                (audioBuffer) => {
                    resolve(audioBuffer);
                },
                undefined,
                (error) => {
                    reject(`Error loading audio at ${path}: ${error}`);
                }
            );
        });
    }


    /**
     * A function to load all assets asynchronously
     */
    async loadAllAssets() {
        try {
            // Replace with asset paths
            var mapSketch = this.loadTexture('/assets/textures/map sketch.png');
            var modelPromise = this.loadGLTFModel('./models/wall.gltf')

            // Wait for all assets to load
            var results = await Promise.all([mapSketch, modelPromise]);

            // Store loaded assets
            this.assets.map = results[0];
            this.assets.wall = results[1];

            console.log('All assets loaded:', this.assets);
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }

    // Retrieve an asset once it's loaded
    getAsset(key) {
        return this.assets[key];
    }
}

export default AssetLoader;
