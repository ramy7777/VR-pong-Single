import * as THREE from 'three';

export class Ball {
    constructor(scene) {
        this.scene = scene;
        // Ball physics - slower initial speed
        this.ballVelocity = new THREE.Vector3(0.01, 0, 0.01);
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
        this.ballVelocity.set(0.01, 0, 0.01); // Reset with initial speed
    }

    getBall() {
        return this.ball;
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
            }
        }

        // Ball-AI paddle collision
        if (this.ball.position.z < -1.8 && this.ball.position.z > -2.0) {
            if (Math.abs(this.ball.position.x - aiPaddle.position.x) < 0.2) {
                this.ballVelocity.z *= -1;
                // Add some random x velocity for variety (reduced)
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
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
