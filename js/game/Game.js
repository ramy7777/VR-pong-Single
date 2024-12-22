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
                { x: 0, y: 0, z: -0.4 },
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
        this.table = this.environment.getTable();
        this.scene.add(this.table);

        this.ball = new Ball(this.scene);
        this.playerPaddle = new Paddle(this.scene, false);
        this.aiPaddle = new Paddle(this.scene, true);
        
        // Track last hit time to prevent multiple haptics
        this.lastHitTime = 0;
        this.hitCooldown = 100; // 100ms cooldown between haptics
    }

    triggerPaddleHaptics(intensity = 1.0, duration = 100) {
        const currentTime = performance.now();
        if (currentTime - this.lastHitTime < this.hitCooldown) {
            return;
        }

        const session = this.renderer.xr.getSession();
        if (!session) return;

        // Try both controllers
        session.inputSources.forEach(inputSource => {
            if (inputSource.gamepad?.hapticActuators?.[0]) {
                inputSource.gamepad.hapticActuators[0].pulse(intensity, duration);
            }
        });

        this.lastHitTime = currentTime;
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

            // Store previous ball position
            const prevBallZ = this.ball.getBall().position.z;
            const prevBallX = this.ball.getBall().position.x;

            // Update AI paddle
            this.aiPaddle.updateAI(this.ball.getBall());

            // Update ball physics
            this.ball.update(delta, this.playerPaddle.getPaddle(), this.aiPaddle.getPaddle());

            // Check for paddle hits and trigger haptics
            const currentBallZ = this.ball.getBall().position.z;
            
            // Front paddle hit
            if (prevBallZ > -0.2 && currentBallZ <= -0.2) {
                const ballSpeed = this.ball.ballVelocity.length();
                const normalizedSpeed = Math.min(ballSpeed / this.ball.maxSpeed, 1.0);
                this.triggerPaddleHaptics(normalizedSpeed * 0.8 + 0.2, 50);
            }
            
            // Side paddle hit
            if (Math.abs(this.ball.getBall().position.x - prevBallX) > 0.01 &&
                currentBallZ > -0.2 && currentBallZ < 0) {
                this.triggerPaddleHaptics(0.3, 50); // Lighter haptics for side hits
            }

            this.renderer.render(this.scene, this.camera);
        });
    }
}
