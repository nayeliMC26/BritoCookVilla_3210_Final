import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

class Text extends THREE.Group {
    constructor(room, scene, text, altText, size) {
        super()
        this.room = room;
        this.scene = scene;
        this.text = text;
        this.altText = altText;
        this.size = size;
        this.mesh, this.material;
        this.fontLoader;
        this.#init();
    }

    #init() {
        this.fontLoader = new FontLoader();
        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.fontLoader.load('/assets/fonts/KG Corner of the Sky_Regular.json', (font) => {
            this.#createText(this.text, font);
        });
    }

    #createText(text, font) {
        if (this.mesh) {
            this.#clear();
        }
        const geometry = new TextGeometry(text, {
            font: font,
            size: this.size,
            depth: 1
        });
        geometry.computeBoundingBox();
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.translateX(-geometry.boundingBox.max.x / 2);
        this.mesh.translateY(-geometry.boundingBox.max.y / 2);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.add(this.mesh);
        this.scene.add(this);
        this.room.addIntercaticeObject(this);
    }

    #clear() {
        this.mesh.geometry.dispose();
        this.remove(this.mesh);
    }

    changeText() {
        var temp = this.text;
        this.text = this.altText
        this.altText = temp;
        this.fontLoader.load('/assets/fonts/KG Corner of the Sky_Regular.json', (font) => {
            this.#createText(this.text, font);
        });
    }
}

export default Text;