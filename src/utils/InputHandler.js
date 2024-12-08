class InputHandler {
    constructor() {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.isJumping = false;

        // Level switching keys
        this.key1 = false;
        this.key2 = false;
        this.key3 = false;

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
                    this.jump = true;
                    break;

                // Level switching keys
                case "Digit1":
                    this.key1 = true;
                    break;
                case "Digit2":
                    this.key2 = true;
                    break;
                case "Digit3":
                    this.key3 = true;
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            // DEBUG: console.log(`Key Up: ${event.code}`);
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
                    break;

                case "Digit1":
                    this.key1 = false;
                    break;
                case "Digit2":
                    this.key2 = false;
                    break;
                case "Digit3":
                    this.key3 = false;
                    break;
            }
        });
    }
}

export default InputHandler;
