import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { VRController } from '../controllers/VRController.js';
import { GameEnvironment } from '../environment/GameEnvironment.js';
import { Paddle } from './Paddle.js';
import { Ball } from './Ball.js';
import { SoundManager } from '../audio/SoundManager.js';
import { StartButton } from '../ui/StartButton.js';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';
import { Timer } from '../ui/Timer.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.isGameStarted = false;

        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);
        this.playerGroup.add(this.camera);

        // Initialize sound manager
        this.soundManager = new SoundManager();

        // Initialize timer
        this.timer = new Timer(this.scene, 120); // 2 minutes timer

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
        this.startButton = new StartButton(this.scene);
        
        this.lastHitTime = 0;
        this.hitCooldown = 100;

        // Track previous ball position for sound triggers
        this.prevBallZ = this.ball.getBall().position.z;
        this.prevBallX = this.ball.getBall().position.x;

        // Initialize score displays
        this.playerScoreDisplay = new ScoreDisplay(
            this.scene,
            new THREE.Vector3(1.90, 1.5, -1),  // Player score on right wall
            new THREE.Euler(0, -Math.PI / 2, 0)
        );
        
        this.aiScoreDisplay = new ScoreDisplay(
            this.scene,
            new THREE.Vector3(-1.90, 1.5, -1),  // AI score on left wall
            new THREE.Euler(0, Math.PI / 2, 0)
        );
    }

    triggerPaddleHaptics(intensity = 1.0, duration = 100) {
        const currentTime = performance.now();
        if (currentTime - this.lastHitTime < this.hitCooldown) {
            return;
        }

        const session = this.renderer.xr.getSession();
        if (!session) return;

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

            const prevBallZ = this.ball.getBall().position.z;
            const prevBallX = this.ball.getBall().position.x;

            if (!this.isGameStarted) {
                const leftIntersects = this.startButton.checkIntersection(this.vrController.controllers[0]);
                const rightIntersects = this.startButton.checkIntersection(this.vrController.controllers[1]);
                
                if (leftIntersects || rightIntersects) {
                    this.startButton.highlight();
                    if (this.vrController.controllers[0].userData.isSelecting || 
                        this.vrController.controllers[1].userData.isSelecting) {
                        this.startButton.press();
                        this.isGameStarted = true;
                        // Reset scores when game starts
                        this.playerScore = 0;
                        this.aiScore = 0;
                        this.playerScoreDisplay.updateScore(0);
                        this.aiScoreDisplay.updateScore(0);
                        // Start ball and timer
                        this.ball.start();
                        this.timer.start();
                        this.startButton.hide();
                    }
                } else {
                    this.startButton.unhighlight();
                }
            }

            if (this.isGameStarted) {
                this.aiPaddle.updateAI(this.ball.getBall());
                const collision = this.ball.update(delta, this.playerPaddle.getPaddle(), this.aiPaddle.getPaddle());

                // Update timer
                if (this.timer.update()) {
                    // Timer finished
                    this.isGameStarted = false;
                    this.startButton.show();
                    this.ball.reset();
                }

                // Handle collisions
                if (collision === 'player') {
                    this.soundManager.playPaddleHit();
                    const session = this.renderer.xr.getSession();
                    if (session) {
                        session.inputSources.forEach(inputSource => {
                            if (inputSource.handedness === 'right' && inputSource.gamepad?.hapticActuators?.[0]) {
                                inputSource.gamepad.hapticActuators[0].pulse(1.0, 100);
                            }
                        });
                    }
                } else if (collision === 'ai') {
                    this.soundManager.playAIHit();
                    const session = this.renderer.xr.getSession();
                    if (session) {
                        session.inputSources.forEach(inputSource => {
                            if (inputSource.handedness === 'right' && inputSource.gamepad?.hapticActuators?.[0]) {
                                inputSource.gamepad.hapticActuators[0].pulse(0.5, 50);
                            }
                        });
                    }
                } else if (collision === 'player_score') {
                    // Player scores (ball went past AI's bounds)
                    this.playerScore++;
                    this.playerScoreDisplay.updateScore(this.playerScore);
                    this.environment.flashRail('right');  // Flash right rail
                    
                    this.soundManager.playLose();
                    const session = this.renderer.xr.getSession();
                    if (session) {
                        session.inputSources.forEach(inputSource => {
                            if (inputSource.handedness === 'right' && inputSource.gamepad?.hapticActuators?.[0]) {
                                inputSource.gamepad.hapticActuators[0].pulse(0.7, 100);
                            }
                        });
                    }
                    // Reset and start the ball after a delay
                    setTimeout(() => {
                        if (this.isGameStarted) {
                            this.ball.start();
                        }
                    }, 1000);
                } else if (collision === 'ai_score') {
                    // AI scores (ball went past player's bounds)
                    this.aiScore++;
                    this.aiScoreDisplay.updateScore(this.aiScore);
                    this.environment.flashRail('left');  // Flash left rail
                    
                    this.soundManager.playLose();
                    const session = this.renderer.xr.getSession();
                    if (session) {
                        session.inputSources.forEach(inputSource => {
                            if (inputSource.handedness === 'right' && inputSource.gamepad?.hapticActuators?.[0]) {
                                inputSource.gamepad.hapticActuators[0].pulse(0.7, 100);
                            }
                        });
                    }
                    // Reset and start the ball after a delay
                    setTimeout(() => {
                        if (this.isGameStarted) {
                            this.ball.start();
                        }
                    }, 1000);
                }

                const currentBallX = this.ball.getBall().position.x;

                // Wall bounce
                if (Math.abs(currentBallX) > 0.65 && Math.abs(prevBallX) <= 0.65) {
                    this.soundManager.playWallBounce();
                    const session = this.renderer.xr.getSession();
                    if (session) {
                        session.inputSources.forEach(inputSource => {
                            if (inputSource.handedness === 'right' && inputSource.gamepad?.hapticActuators?.[0]) {
                                inputSource.gamepad.hapticActuators[0].pulse(0.3, 50);
                            }
                        });
                    }
                }
            }

            this.renderer.render(this.scene, this.camera);
        });
    }
}
