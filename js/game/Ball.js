import * as THREE from 'three';

export class Ball {
    constructor(scene) {
        this.scene = scene;
        this.initialSpeed = 0.005; // Reduced initial speed from 0.01 to 0.005
        this.speedIncrease = 1.1; // Speed multiplier
        this.maxSpeed = 0.03; // Maximum speed cap
        this.hits = 0; // Count paddle hits
        // Ball physics - slower initial speed
        this.ballVelocity = new THREE.Vector3(this.initialSpeed, 0, this.initialSpeed);
        this.createBall();
    }

    createBall() {
        const ballGeometry = new THREE.SphereGeometry(0.02);
        const ballMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.resetPosition();
        this.scene.add(this.ball);
    }

    resetPosition() {
        this.ball.position.set(0, 0.9, -1.0); // Start ball at center of table
        this.hits = 0;
        // Reset with initial speed in a random x direction
        const randomDir = Math.random() > 0.5 ? 1 : -1;
        this.ballVelocity.set(this.initialSpeed * randomDir, 0, this.initialSpeed);
    }

    getBall() {
        return this.ball;
    }

    increaseSpeed() {
        const currentSpeed = this.ballVelocity.length();
        if (currentSpeed < this.maxSpeed) {
            this.ballVelocity.multiplyScalar(this.speedIncrease);
            // Cap the speed at maxSpeed
            if (this.ballVelocity.length() > this.maxSpeed) {
                this.ballVelocity.normalize().multiplyScalar(this.maxSpeed);
            }
        }
    }

    update(delta, playerPaddle, aiPaddle) {
        // Update ball position
        this.ball.position.add(this.ballVelocity);

        // Ball-table collision (adjusted for table size)
        if (this.ball.position.x > 0.7 || this.ball.position.x < -0.7) {
            this.ballVelocity.x *= -1;
        }

        // Ball-player paddle collision
        if (this.ball.position.z > -0.2 && this.ball.position.z < 0) {
            if (Math.abs(this.ball.position.x - playerPaddle.position.x) < 0.2) {
                this.ballVelocity.z *= -1;
                // Add some random x velocity for variety (reduced)
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
                this.hits++;
                if (this.hits % 2 === 0) { // Increase speed every other hit
                    this.increaseSpeed();
                }
            }
        }

        // Ball-AI paddle collision
        if (this.ball.position.z < -1.8 && this.ball.position.z > -2.0) {
            if (Math.abs(this.ball.position.x - aiPaddle.position.x) < 0.2) {
                this.ballVelocity.z *= -1;
                // Add some random x velocity for variety (reduced)
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
                this.hits++;
                if (this.hits % 2 === 0) { // Increase speed every other hit
                    this.increaseSpeed();
                }
            }
        }

        // Reset ball if it goes past either paddle
        if (this.ball.position.z > 0 || this.ball.position.z < -2.0) {
            this.resetPosition();
        }

        // Keep ball at constant height
        this.ball.position.y = 0.9;
    }
}
