import * as THREE from 'three';

class Lever extends THREE.Group {
    constructor(inputHandler) {
        super();
        this.inputHandler = inputHandler;

        // Lever Base
        var baseGeometry = new THREE.BoxGeometry(5, 7.5, 2.5);
        var baseMaterial = new THREE.MeshPhongMaterial({ color: 0xc8c8c8 });
        var base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        this.add(base);

        // Lever Arm
        var leverGeometry = new THREE.BoxGeometry(1.5, 7.5, 1.5);
        this.lever = new THREE.Mesh(leverGeometry, baseMaterial);
        this.lever.castShadow = true;
        this.lever.receiveShadow = true;
        this.lever.rotation.set(-65, 0, 0)
        this.lever.position.set(0, 0.5, 2); 
        this.targetRotation = THREE.MathUtils.degToRad(65); 

        this.add(this.lever);

    }

    rotateLever(){
        if (this.inputHandler.interact) {
            // Target rotation (e.g., lever pulled down to -90 degrees)
            this.lever.rotation.x = THREE.MathUtils.degToRad(-90);
            console.log("flipping lever")
            this.lever.rotation.x += (this.targetRotation - this.lever.rotation.x) * 0.1; 

        } else {
            // Reset rotation (e.g., lever returns to -65 degrees)
            this.lever.rotation.x = THREE.MathUtils.degToRad(65);
        }

        // Smoothly interpolate rotation

    }

    // Update method to smoothly rotate the lever
    update() {
        this.rotateLever();

    }
}

export default Lever;
