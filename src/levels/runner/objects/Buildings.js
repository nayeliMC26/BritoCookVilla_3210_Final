import {
    Group,
    BoxGeometry,
    Mesh,
    MeshStandardMaterial,
    PlaneGeometry,
    DoubleSide,
    Box3,
    Vector3,
} from "three";

class Buildings extends Group {
    constructor() {
        super();

        this.pool = [];
        this.activeBuildings = [];
        this.collisionBoxes = []; // Array to store collision boxes for all cubes

        const buildingMaterial = new MeshStandardMaterial({
            color: 0x808080,
            side: DoubleSide,
        });

        for (let i = 0; i < 10; i++) {
            const building = new Mesh(
                new PlaneGeometry(10, 1, 1),
                buildingMaterial
            );
            building.rotation.x = Math.PI / 2;
            building.position.set(i * 10, 0, 0);
            this.pool.push(building);
        }

        // Initialize active buildings
        for (let i = 0; i < 10; i++) {
            this.addBuilding();
        }
    }

    addBuilding() {
        if (this.pool.length > 0) {
            const building = this.pool.pop();
            building.position.set(this.activeBuildings.length * 10, 0, 0);

            // Add a random cube as a child of the building
            const cube = this.createRandomCube();
            building.add(cube);

            // Create and store a collision box for the cube
            const collisionBox = new Box3().setFromObject(cube);
            this.collisionBoxes.push(collisionBox);

            this.add(building);
            this.activeBuildings.push(building);
        }
    }

    createRandomCube() {
        const cubeSize = Math.random() * 1.5 + 0.5; // Size between 0.5 and 2

        const cubeGeometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new MeshStandardMaterial({ color: 0xff0000 });
        const cube = new Mesh(cubeGeometry, cubeMaterial);

        // Position the cube relative to the rotated plane
        cube.position.set(
            Math.random() * 8 - 4, // Random x offset relative to the plane, between -4 and 4
            cubeSize / 2, // Set y to half the cube's height to sit on the plane
            0 // z remains 0 since it's aligned with the plane's surface
        );

        return cube;
    }

    update() {
        this.activeBuildings.forEach((building, index) => {
            building.position.x -= 0.1;

            if (building.position.x < -50) {
                building.position.x = 50; // Reset position for an infinite effect
            }

            // Update the collision box for the cube
            const cube = building.children[0]; // Assuming the first child is the cube
            if (cube) {
                this.collisionBoxes[index].setFromObject(cube);
            }
        });
    }

    checkCollisions(player) {
        // Create a bounding box for the player
        const playerBox = new Box3().setFromObject(player);

        for (const box of this.collisionBoxes) {
            if (box.intersectsBox(playerBox)) {
                // Find the direction of the collision
                const cubeCenter = new Vector3();
                const playerCenter = new Vector3();
                box.getCenter(cubeCenter);
                playerBox.getCenter(playerCenter);

                // Determine relative position
                const relativePosition = cubeCenter.sub(playerCenter);

                if (
                    Math.abs(relativePosition.x) > Math.abs(relativePosition.z)
                ) {
                    if (relativePosition.x > 0) {
                        return "right"; // Cube is to the player's right
                    } else {
                        return "left"; // Cube is to the player's left
                    }
                } else {
                    if (relativePosition.z > 0) {
                        return "front"; // Cube is in front of the player
                    } else {
                        return "back"; // Cube is behind the player
                    }
                }
            }
        }

        return null; // No collision detected
    }
}

export default Buildings;
