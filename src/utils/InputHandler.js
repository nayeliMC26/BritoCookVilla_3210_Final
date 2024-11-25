class InputHandler {
    constructor() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.isJumping = false;

        this.keyboardControls();
    }

    keyboardControls() {
        document.addEventListener("keydown", (event) => {
            // DEBUG: console.log(`Key Down: ${event.code}`);
            switch (event.code) {
                case "KeyW":
                    this.moveForward = true;
                    break;
                case "KeyS":
                    this.moveBackward = true;
                    break;
                case "KeyA":
                    this.moveLeft = true;
                    break;
                case "KeyD":
                    this.moveRight = true;
                    break;
                case "Space":
                    if (!this.isJumping) {
                        this.jump = true; 
                        this.isJumping = true; 
                    }
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            console.log(`Key Up: ${event.code}`);
            switch (event.code) {
                case "KeyW":
                    this.moveForward = false;
                    break;
                case "KeyS":
                    this.moveBackward = false;
                    break;
                case "KeyA":
                    this.moveLeft = false;
                    break;
                case "KeyD":
                    this.moveRight = false;
                    break;
                case "Space":
                    this.jump = false; 
                    this.isJumping = false; 
                    break;
            }
        });
    }
}

export default InputHandler;
