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
        // Create the main ball
        const ballGeometry = new THREE.SphereGeometry(0.02, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            metalness: 1.0,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8
        });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.resetPosition();
        this.scene.add(this.ball);

        // Create point light for ball reflection
        this.ballLight = new THREE.PointLight(0x00ffff, 2.0, 0.5);
        this.ballLight.position.copy(this.ball.position);
        this.ballLight.position.y -= 0.1; // Position light slightly below ball
        this.scene.add(this.ballLight);
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
        const prevX = this.ball.position.x;
        const prevZ = this.ball.position.z;
        
        this.ball.position.add(this.ballVelocity);
        
        // Update light position to follow ball
        this.ballLight.position.copy(this.ball.position);
        this.ballLight.position.y -= 0.1; // Keep light slightly below ball

        // Side wall collision
        if (this.ball.position.x > 0.7 || this.ball.position.x < -0.7) {
            this.ball.position.x = Math.sign(this.ball.position.x) * 0.7;
            this.ballVelocity.x *= -1;
        }

        // Player paddle collision
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
                return 'player';
            }
        }

        // AI paddle collision
        if (this.ball.position.z < -1.8 && this.ball.position.z > -2.0) {
            if (this.checkPaddleCollision(aiPaddle)) {
                this.ballVelocity.z *= -1;
                this.ballVelocity.x += (Math.random() - 0.5) * 0.005;
                
                this.hits++;
                if (this.hits % 2 === 0) {
                    this.increaseSpeed();
                }
                return 'ai';
            }
        }

        if (this.ball.position.z > 0 || this.ball.position.z < -2.0) {
            this.resetPosition();
        }

        return false;
    }
}
