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

    checkPaddleCollision(paddle) {
        const paddleBox = new THREE.Box3().setFromObject(paddle);
        const ballBox = new THREE.Box3().setFromObject(this.ball);
        
        // Expand the paddle's collision box slightly for better gameplay
        paddleBox.min.z -= 0.01;  
        paddleBox.max.z += 0.01;  
        
        if (ballBox.intersectsBox(paddleBox)) {
            const isSideHit = Math.abs(this.ball.position.x - paddle.position.x) > paddle.scale.x / 2;
            
            if (isSideHit) {
                this.ballVelocity.x *= -0.8;
                return false;
            }

            return true;
        }

        return false;
    }

    update(delta, playerPaddle, aiPaddle) {
        this.ball.position.add(this.ballVelocity);

        if (this.ball.position.x > 0.7 || this.ball.position.x < -0.7) {
            this.ballVelocity.x *= -1;
        }

        if (this.ball.position.z > -0.2 && this.ball.position.z < 0) {
            if (this.checkPaddleCollision(playerPaddle)) {
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

        if (this.ball.position.z < -1.8 && this.ball.position.z > -2.0) {
            if (this.checkPaddleCollision(aiPaddle)) {
                this.ballVelocity.z *= -1;
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
                
                this.hits++;
                if (this.hits % 2 === 0) {
                    this.increaseSpeed();
                }
            }
        }

        if (this.ball.position.z > 0 || this.ball.position.z < -2.0) {
            this.resetPosition();
        }

        this.ball.position.y = 0.9;
    }
}
