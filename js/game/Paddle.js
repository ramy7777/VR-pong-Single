import * as THREE from 'three';

export class Paddle {
    constructor(scene, isAI = false) {
        this.scene = scene;
        this.isAI = isAI;
        this.reactionDelay = 0;
        this.lastTargetX = 0;
        this.targetPosition = new THREE.Vector3();
        this.smoothSpeed = 0.15; // Reduced for smoother movement
        this.lastPredictedX = 0; // Store last prediction
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
        this.targetPosition.copy(this.paddle.position);
        
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

    updateAI(ball, difficulty = 0.1) {
        if (!this.isAI) return;

        // Get the ball's position
        const targetX = ball.position.x;
        
        // Only update prediction occasionally to reduce jitter
        if (Math.abs(this.lastTargetX - targetX) > 0.1) {
            this.lastPredictedX = targetX + (Math.random() - 0.5) * 0.05; // Smaller random offset
            this.lastTargetX = targetX;
        }

        // Calculate the difference using smoothed prediction
        const diff = this.lastPredictedX - this.paddle.position.x;
        
        // Calculate movement speed based on distance
        let speed = difficulty;
        
        // Gradual speed adjustment based on distance
        if (Math.abs(diff) < 0.1) {
            speed *= Math.abs(diff) * 5; // Proportional speed
        }

        // Calculate target position
        const movement = Math.sign(diff) * Math.min(Math.abs(diff), speed);
        
        this.targetPosition.x = THREE.MathUtils.clamp(
            this.paddle.position.x + movement,
            -0.6,
            0.6
        );

        // Smoothly interpolate to target position
        this.paddle.position.x += (this.targetPosition.x - this.paddle.position.x) * this.smoothSpeed;

        // Constrain paddle movement
        const tableHalfWidth = 0.75;
        this.paddle.position.x = THREE.MathUtils.clamp(
            this.paddle.position.x,
            -tableHalfWidth + 0.15,
            tableHalfWidth - 0.15
        );
    }
}
