import Platform from '../entities/Platform';
class LevelManager {
    /**
     * Creates an instance of LevelManager.
     * @param {THREE.Scene} scene - The scene where game objects are rendered.
     * @param {Object} player - The player object, which contains properties such as mesh and physics.
     * @param {PhysicsEngine} physicsEngine - The physics engine to handle physics interactions for game objects.
     */
    constructor(scene, player, physicsEngine) {
        this.scene = scene;
        this.player = player;
        this.physicsEngine = physicsEngine;
        this.levels = [];
        this.currentLevelIndex = 0;
    }
    /**
     * A function to add level data to the tracked array of levels
     * @param {Object} levelData -An object which carries the object data for each level
     */
    addLevel(levelData) {
        this.levels.push(levelData);
    }

    /**
     * A function to load a level by its index, clearing the current level and adding the new one
     * @param {number} levelIndex - The index of the level to be loaded from the levels array
     */
    loadLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= this.levels.length) {
            console.error("Invalid level index");
            return;
        }

        console.log(`Loading level ${levelIndex}...`);

        // Clear the current level's objects from the scene and physics engine
        this.clearLevel();

        this.platformCounter = 1;

        var levelData = this.levels[levelIndex];
        this.currentLevelIndex = levelIndex;

        // Load platforms and objects for the current level
        levelData.platforms.forEach(platformData => {
            var id = `platform_${this.platformCounter}_level_${this.currentLevelIndex}`;
            var platform = new Platform(
                this.scene,
                platformData.x,
                platformData.y,
                platformData.z,
                platformData.width,
                platformData.height,
                platformData.depth,
                this.physicsEngine,
                id
            );
            // Add platform to the physics engine and scene
            this.physicsEngine.addObject(platform.physicsObject);
            this.scene.add(platform.mesh);
            this.platformCounter++
        });

        // Position the player at the spawn point
        var spawn = levelData.spawnPoint;
        this.player.physicsObject.position.set(spawn.x, spawn.y, spawn.z);

        // Add player to the scene and physics engine
        this.physicsEngine.addObject(this.player.physicsObject);
        this.scene.add(this.player.mesh);

        console.log(`Level ${levelIndex} loaded successfully.`);
    }

    /**
     * A function to clear all objects from the scene and physics engine for the current level
     */
    clearLevel() {
        console.log("Clearing level...");

        // Remove all objects from the scene
        this.physicsEngine.objects.forEach(obj => {
            if (obj.mesh) {
                console.log("Removing object:", obj);
                this.physicsEngine.removeObject(obj); // Removes the mesh and physics object
            }
        });

        // Remove the player if needed
        if (this.player && this.player.physicsObject.mesh) {
            console.log("Removing player object:", this.player.physicsObject);
            this.physicsEngine.removeObject(this.player.physicsObject); 
        }

        // Reset the objects list in the physics engine
        this.physicsEngine.objects = [];
        console.log("Level cleared.");
    }

}

export default LevelManager;