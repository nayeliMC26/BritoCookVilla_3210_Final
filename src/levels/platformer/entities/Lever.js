import * as THREE from 'three';

class Lever extends THREE.Group {
    constructor(inputHandler) {
        super();
        this.inputHandler = inputHandler;
        this.isPulled = false;

        // Lever Base
        var baseGeometry = new THREE.BoxGeometry(5, 7.5, 2.5);
        var baseMaterial = new THREE.MeshPhongMaterial({ color: 0xc8c8c8 });
        var base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        this.add(base);

        // Lever Arm
        var leverGeometry = new THREE.BoxGeometry(1.5, 7.5, 1.5);
        var leverMaterial = new THREE.MeshPhongMaterial({ color: 0x272727 });
        this.lever = new THREE.Mesh(leverGeometry, leverMaterial);
        this.lever.castShadow = true;
        this.lever.receiveShadow = true;
        this.lever.rotation.set(-65, 0, 0);
        this.lever.position.set(0, 0.5, 2);
        this.targetRotation = THREE.MathUtils.degToRad(65);

        this.add(this.lever);
        this.createMessageElement();
    }

    createMessageElement() {
        this.messageElement = document.createElement('div');
        this.messageElement.style.position = 'absolute';
        this.messageElement.style.top = '10px';
        this.messageElement.style.right = '10px';
        this.messageElement.style.padding = '5px';
        this.messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.messageElement.style.color = 'white';
        this.messageElement.style.fontSize = '16px';
        this.messageElement.style.borderRadius = '5px';
        this.messageElement.style.display = 'none'; // Hide by default
        document.body.appendChild(this.messageElement);
    }

    displayInstruction(player) {
        var leverPosition = this.position;
        var playerPosition = player.position;
        var distance = leverPosition.distanceTo(playerPosition);

        if (distance < 10) {
            this.messageElement.textContent = "Press 'E' to interact with the lever";
            this.messageElement.style.display = 'block'; // Show message
        } else {
            this.messageElement.style.display = 'none'; // Hide message
        }
    }

    rotateLever() {
        if (this.inputHandler.interact) {
            this.isPulled = !this.isPulled;
            // Target rotation (e.g., lever pulled down to -90 degrees)
            this.lever.rotation.x = this.isPulled
                ? THREE.MathUtils.degToRad(-90)
            // Reset rotation (e.g., lever returns to -65 degrees)
                : THREE.MathUtils.degToRad(65);
            console.log("flipping lever");
        }
    }

    // Update method to smoothly rotate the lever
    update() {
        this.rotateLever();

    }
}

export default Lever;
