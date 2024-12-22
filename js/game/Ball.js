import * as THREE from 'three';

export class Ball {
    constructor(scene) {
        this.scene = scene;
        this.initialSpeed = 0.005;
        this.speedIncrease = 1.1;
        this.maxSpeed = 0.03;
        this.hits = 0;
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
        this.ball.position.set(0, 0.9, -1.0);
        this.hits = 0;
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
            if (this.ballVelocity.length() > this.maxSpeed) {
                this.ballVelocity.normalize().multiplyScalar(this.maxSpeed);
            }
        }
    }

    calculateReflectionAngle(hitPosition, paddlePosition) {
        const hitOffset = this.ball.position.x - paddlePosition.x;
        const normalizedOffset = hitOffset / 0.15;
        const maxAngle = Math.PI / 4;
        const angle = normalizedOffset * maxAngle;
        const speed = this.ballVelocity.length();
        const zDirection = this.ballVelocity.z > 0 ? -1 : 1;
        const xComponent = Math.sin(angle) * speed;
        const zComponent = Math.cos(angle) * speed * zDirection;
        return new THREE.Vector3(xComponent, 0, zComponent);
    }

    checkPaddleCollision(paddlePosition, isFrontPaddle) {
        const paddleWidth = 0.3;
        const paddleDepth = 0.1;
        const ballRadius = 0.02;

        // Check if ball is at paddle's height (y-axis)
        if (Math.abs(this.ball.position.y - paddlePosition.y) > paddleDepth) {
            return false;
        }

        // Calculate distances
        const dx = Math.abs(this.ball.position.x - paddlePosition.x);
        const dz = Math.abs(this.ball.position.z - paddlePosition.z);
        
        // Check if we're within paddle bounds
        if (dx > (paddleWidth/2 + ballRadius) || dz > (paddleDepth/2 + ballRadius)) {
            return false;
        }

        // Determine if it's a side hit or front/back hit
        const isSideHit = dx > paddleWidth/2;
        
        if (isSideHit) {
            // For side hits, just slightly adjust the x velocity
            this.ballVelocity.x *= -0.8;
            return false; // Don't count as a paddle hit
        }

        return true; // Front/back hit
    }

    update(delta, playerPaddle, aiPaddle) {
        // Update ball position
        this.ball.position.add(this.ballVelocity);

        // Ball-table collision
        if (this.ball.position.x > 0.7 || this.ball.position.x < -0.7) {
            this.ballVelocity.x *= -1;
        }

        // Ball-player paddle collision
        if (this.ball.position.z > -0.2 && this.ball.position.z < 0) {
            if (this.checkPaddleCollision(playerPaddle.position, true)) {
                this.ballVelocity.copy(this.calculateReflectionAngle(
                    this.ball.position,
                    playerPaddle.position
                ));
                
                this.hits++;
                if (this.hits % 2 === 0) {
                    this.increaseSpeed();
                }
            }
        }

        // Ball-AI paddle collision
        if (this.ball.position.z < -1.8 && this.ball.position.z > -2.0) {
            if (this.checkPaddleCollision(aiPaddle.position, false)) {
                this.ballVelocity.z *= -1;
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
                
                this.hits++;
                if (this.hits % 2 === 0) {
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
