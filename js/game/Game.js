import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { VRController } from '../controllers/VRController.js';
import { GameEnvironment } from '../environment/GameEnvironment.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);
        this.playerGroup.add(this.camera);

        this.init();
        this.setupVR();
        this.createGameElements();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton.createButton(this.renderer));

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupVR() {
        this.renderer.xr.addEventListener('sessionstart', () => {
            console.log('Setting up VR session');
            
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const transform = new THREE.XRRigidTransform(
                { x: 0, y: 0, z: -0.4 }, // Spawn point 0.4m behind paddle end
                { x: 0, y: 0, z: 0, w: 1 }
            );
            this.renderer.xr.setReferenceSpace(
                referenceSpace.getOffsetReferenceSpace(transform)
            );
        });

        this.vrController = new VRController(this.renderer, this.playerGroup);
    }

    createGameElements() {
        this.environment = new GameEnvironment(this.scene);
        this.playerPaddle = new Paddle(this.scene, false); // Player paddle
        this.aiPaddle = new Paddle(this.scene, true);     // AI paddle
        this.ball = new Ball(this.scene);
    }

    animate() {
        this.renderer.setAnimationLoop(() => {
            const delta = this.clock.getDelta();

            // Update controller states
            if (this.vrController) {
                this.vrController.checkControllerState(
                    this.vrController.controllers[0],
                    'left',
                    this.playerPaddle.getPaddle()
                );
                this.vrController.checkControllerState(
                    this.vrController.controllers[1],
                    'right',
                    this.playerPaddle.getPaddle()
                );
            }

            // Update AI paddle
            this.aiPaddle.updateAI(this.ball.getBall());

            // Update ball physics
            this.ball.update(delta, this.playerPaddle.getPaddle(), this.aiPaddle.getPaddle());

            this.renderer.render(this.scene, this.camera);
        });
    }
}
