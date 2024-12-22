import * as THREE from 'three';

export class Paddle {
    constructor(scene, isAI = false) {
        this.scene = scene;
        this.isAI = isAI;
        this.targetPosition = new THREE.Vector3();
        this.smoothSpeed = 0.15; // Increased for faster response
        this.lastPredictedX = 0;
        this.lastUpdateTime = 0;
        this.updateInterval = 50; // Update more frequently
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

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    updateAI(ball, difficulty = 0.15) { // Increased base difficulty
        if (!this.isAI) return;

        const currentTime = performance.now();
        const targetX = ball.position.x;

        // Update prediction less frequently
        if (currentTime - this.lastUpdateTime > this.updateInterval) {
            // Calculate base target position
            let newTargetX = targetX;

            // Add very small random offset for natural movement
            const randomOffset = (Math.random() - 0.5) * 0.01; // Reduced randomness
            newTargetX += randomOffset;

            // Smooth transition to new target
            this.lastPredictedX = this.lerp(
                this.lastPredictedX,
                newTargetX,
                0.5 // Faster target updating
            );

            this.lastUpdateTime = currentTime;
        }

        // Calculate smooth movement
        const currentX = this.paddle.position.x;
        const diff = this.lastPredictedX - currentX;
        
        // Use quadratic easing for smoother acceleration/deceleration
        const direction = Math.sign(diff);
        const distance = Math.abs(diff);
        let speed = Math.min(distance * distance * 4, difficulty); // Increased acceleration

        // Move towards target
        if (Math.abs(diff) > 0.001) {
            const movement = direction * speed;
            const newX = this.lerp(
                currentX,
                currentX + movement,
                this.smoothSpeed
            );

            // Apply position with constraints
            this.paddle.position.x = THREE.MathUtils.clamp(
                newX,
                -0.6,
                0.6
            );
        }
    }
}
