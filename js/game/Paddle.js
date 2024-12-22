import * as THREE from 'three';

export class Paddle {
    constructor(scene) {
        this.scene = scene;
        this.createPaddle();
    }

    createPaddle() {
        const paddleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
        const paddleMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.1
        });
        this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.paddle.position.set(0, 0.9, -0.1); // Position paddle at near end of table
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
}
