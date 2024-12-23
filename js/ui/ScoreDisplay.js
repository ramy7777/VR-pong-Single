import * as THREE from 'three';

export class ScoreDisplay {
    constructor(scene, position, rotation) {
        this.score = 0;
        this.scene = scene;

        // Create canvas for the score texture
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.context = this.canvas.getContext('2d');

        // Create texture from canvas
        this.texture = new THREE.CanvasTexture(this.canvas);
        
        // Create material with the texture
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Create plane geometry for the score display
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        // Position and rotate the score display
        this.mesh.position.copy(position);
        this.mesh.rotation.copy(rotation);
        
        this.scene.add(this.mesh);
        
        // Initial render
        this.updateDisplay();
    }

    updateScore(newScore) {
        this.score = newScore;
        this.updateDisplay();
    }

    updateDisplay() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set text properties
        this.context.fillStyle = '#4444ff';
        this.context.font = 'bold 300px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        // Draw the score
        this.context.fillText(this.score.toString(), 
            this.canvas.width / 2, 
            this.canvas.height / 2
        );
        
        // Add glow effect
        this.context.shadowColor = '#4444ff';
        this.context.shadowBlur = 30;
        this.context.fillStyle = '#ffffff';
        this.context.fillText(this.score.toString(), 
            this.canvas.width / 2, 
            this.canvas.height / 2
        );
        
        // Update the texture
        this.texture.needsUpdate = true;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.texture.dispose();
        this.scene.remove(this.mesh);
    }
}
