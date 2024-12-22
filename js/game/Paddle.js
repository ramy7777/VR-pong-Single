import * as THREE from 'three';

export class Paddle {
    constructor(scene, isAI = false) {
        this.scene = scene;
        this.isAI = isAI;
        this.createPaddle();
    }

    createPaddle() {
        const paddleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
        const paddleMaterial = new THREE.MeshStandardMaterial({
            color: this.isAI ? 0xff0000 : 0x00ff00,
            emissive: this.isAI ? 0xff0000 : 0x00ff00,
            emissiveIntensity: 0.5
        });
        this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        
        // Position paddle based on whether it's AI or player
        const zPosition = this.isAI ? -1.9 : -0.1; // AI paddle at far end
        this.paddle.position.set(0, 0.9, zPosition);
        
        this.scene.add(this.paddle);
    }

    getPaddle() {
        return this.paddle;
    }

    getPosition() {
        return this.paddle.position;
    }

    setPosition(position) {
        this.paddle.position.copy(position);
    }

    updateAI(ball, difficulty = 0.02) {
        if (!this.isAI) return;

        // Get the ball's position
        const targetX = ball.position.x;
        const currentX = this.paddle.position.x;

        // Calculate the difference
        const diff = targetX - currentX;

        // Move towards the ball with some delay (for difficulty)
        this.paddle.position.x += Math.sign(diff) * Math.min(Math.abs(diff), difficulty);

        // Constrain paddle movement
        const tableHalfWidth = 0.75;
        this.paddle.position.x = THREE.MathUtils.clamp(
            this.paddle.position.x,
            -tableHalfWidth + 0.15,
            tableHalfWidth - 0.15
        );
    }
}
