import * as THREE from 'three';

export class GameEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.createLighting();
        this.createWalls();
        this.createTable();
    }

    createLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 5, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.7,
            metalness: 0.1
        });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 0.1),
            wallMaterial
        );
        backWall.position.set(0, 1.5, -2);
        this.scene.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3, 4),
            wallMaterial
        );
        leftWall.position.set(-2, 1.5, 0);
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3, 4),
            wallMaterial
        );
        rightWall.position.set(2, 1.5, 0);
        this.scene.add(rightWall);
    }

    createTable() {
        // Create table (standard dining table is about 1.5m x 0.9m)
        const tableGeometry = new THREE.BoxGeometry(1.5, 0.1, 2);
        const tableMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            roughness: 0.7,
            metalness: 0.1
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = 0.8; // Standard table height
        this.table.position.z = -1.0; // Table 1m in front of spawn point
        this.scene.add(this.table);
    }

    getTable() {
        return this.table;
    }
}
