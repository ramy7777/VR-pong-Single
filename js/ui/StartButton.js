import * as THREE from 'three';

export class StartButton {
    constructor(scene) {
        this.scene = scene;
        this.isPressed = false;
        this.createButton();
    }

    createButton() {
        // Create button geometry
        const buttonGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000, // Red color
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        this.button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        this.button.position.set(0, 1.3, -1.0); // Position above the table

        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(0.32, 0.12, 0.06);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000, // Red color
            transparent: true,
            opacity: 0.3
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.button.add(this.glow);

        // Create text
        const loader = new THREE.TextureLoader();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#ffffff'; // White text
        context.fillText('START', canvas.width / 2, canvas.height / 2);

        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        const textGeometry = new THREE.PlaneGeometry(0.25, 0.08);
        this.text = new THREE.Mesh(textGeometry, textMaterial);
        this.text.position.z = 0.026;
        this.button.add(this.text);

        this.scene.add(this.button);
    }

    checkIntersection(controller) {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);

        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObject(this.button);
        return intersects.length > 0;
    }

    highlight() {
        this.button.material.color.setHex(0x00ff00); // Green color
        this.button.material.emissive.setHex(0x00ff00);
        this.button.material.emissiveIntensity = 1.0;
        this.glow.material.color.setHex(0x00ff00);
        this.glow.material.opacity = 0.5;
    }

    unhighlight() {
        this.button.material.color.setHex(0xff0000); // Back to red
        this.button.material.emissive.setHex(0xff0000);
        this.button.material.emissiveIntensity = 0.5;
        this.glow.material.color.setHex(0xff0000);
        this.glow.material.opacity = 0.3;
    }

    press() {
        this.isPressed = true;
        this.button.position.z += 0.02;
        this.button.material.color.setHex(0x00ff00);
        this.button.material.emissive.setHex(0x00ff00);
        this.button.material.emissiveIntensity = 1.0;
        this.glow.material.color.setHex(0x00ff00);
        this.glow.material.opacity = 0.7;
    }

    reset() {
        this.isPressed = false;
        this.button.position.z = -1.0;
        this.unhighlight();
    }
}
