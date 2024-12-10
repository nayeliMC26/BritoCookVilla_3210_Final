import * as THREE from 'three';

class Spores {
    constructor(scene) {
        this.scene = scene;
        this.init();
        
    }

    init() {
        var sporeCount = 500;
    
        var sporeMaterial = new THREE.MeshStandardMaterial({
            emissive: 0x69f6f5, 
            emissiveIntensity: 1.5, 
        });
    
        var sporeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    
        this.spores = [];

        // Loop to create particles/spores
        for (let i = 0; i < sporeCount; i++) {
            var spore = new THREE.Mesh(sporeGeometry, sporeMaterial);
            // Some random scaling factor between 0.5 and 3.5 
            var sizeFactor = Math.random() * 3 + 0.5; 
    
            spore.scale.set(sizeFactor, sizeFactor, sizeFactor);
    
            spore.position.set(
                900 + Math.random() * 500 - 250,   // Random x position around 900 (range -100 to +100)
                Math.random() * 100 + 20,           
                Math.random() * 50 - 25           
            );
    
            this.scene.add(spore);
    
            this.spores.push(spore);
        }
    
        this.update();
    }
    

    update() {
        var speed = 0.01;
        var driftSpeed = 0.02;

        var animate = () => {
            requestAnimationFrame(animate);

            // Update the position of each spore
            this.spores.forEach(spore => {
                spore.position.y -= speed + (Math.random() * 0.03);  
                spore.position.x += (Math.random() - 0.5) * driftSpeed;  
                spore.position.z += (Math.random() - 0.5) * driftSpeed;  

                // Reset position if the spore falls below the ground
                if (spore.position.y < 0) {
                    spore.position.y = Math.random() * 100 + 20;
                }
            });
        };

        animate();
    }
}

export default Spores;
