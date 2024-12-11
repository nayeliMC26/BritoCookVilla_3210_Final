import * as THREE from 'three';
import { Group, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, ShaderMaterial } from 'three';

class Background extends Group {
    constructor(scene) {
        super();

        // Set the background color of the scene to black
        scene.background = new THREE.Color(0x000000);

        // Define how many stars you want
        const numStars = 1000;  // Number of stars

        // Create a BufferGeometry to hold the stars' positions
        const starsGeometry = new BufferGeometry();
        const positions = new Float32Array(numStars * 3); // Each star has x, y, z coordinates

        // Randomly distribute stars inside a spherical volume (large radius)
        const radius = 1000; // Size of the sky sphere
        for (let i = 0; i < numStars; i++) {
            // Randomly distribute stars within the sphere
            const theta = Math.random() * Math.PI * 2; // Random angle
            const phi = Math.acos(2 * Math.random() - 1); // Random inclination
            const x = radius * Math.sin(phi) * Math.cos(theta); // Cartesian X
            const y = radius * Math.sin(phi) * Math.sin(theta); // Cartesian Y
            const z = radius * Math.cos(phi); // Cartesian Z

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        // Add positions to geometry
        starsGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

        // Create a PointsMaterial with a small size and a white color for the stars
        const material = new PointsMaterial({
            color: 0xffffff, // White stars
            size: 0.5,       // Size of each star
            transparent: true, // Transparent background for particles
            opacity: 0.8,      // Slight opacity for a more subtle effect
        });

        // Create the Points object, which will represent the stars
        const stars = new Points(starsGeometry, material);
        this.add(stars);
    }

    // No need for an update function as the stars are static
}

export default Background;
