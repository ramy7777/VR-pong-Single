export class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            // Player paddle hit: bright, high-pitched ping (E5)
            paddleHit: this.createSound({
                midiNote: 76,
                duration: 0.1,
                waveform: 'triangle',
                attack: 0.01,
                decay: 0.1,
                gain: 0.3
            }),

            // Wall bounce: low thud (G2)
            wallBounce: this.createSound({
                midiNote: 43,
                duration: 0.15,
                waveform: 'sine',
                attack: 0.01,
                decay: 0.15,
                gain: 0.4
            }),

            // Score: triumphant chord (C major arpeggio)
            score: this.createChord([60, 64, 67, 72], 0.4),

            // AI hit: metallic sound (A4)
            aiHit: this.createSound({
                midiNote: 69,
                duration: 0.1,
                waveform: 'square',
                attack: 0.01,
                decay: 0.1,
                gain: 0.2
            })
        };
    }

    createSound({ midiNote, duration, waveform, attack, decay, gain }) {
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                // Set oscillator properties
                osc.type = waveform;
                osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                // Create envelope
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(gain, this.audioContext.currentTime + attack);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                // Connect nodes
                osc.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // Play sound
                osc.start();
                osc.stop(this.audioContext.currentTime + duration);
            }
        };
    }

    createChord(midiNotes, duration) {
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                // Create master gain
                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                masterGain.connect(this.audioContext.destination);

                // Play each note with slight delay for arpeggio effect
                midiNotes.forEach((note, index) => {
                    setTimeout(() => {
                        const osc = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        const frequency = 440 * Math.pow(2, (note - 69) / 12);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration - 0.1);
                        
                        osc.connect(gainNode);
                        gainNode.connect(masterGain);
                        
                        osc.start();
                        osc.stop(this.audioContext.currentTime + duration);
                    }, index * 50); // 50ms delay between notes
                });
            }
        };
    }

    playPaddleHit() {
        this.sounds.paddleHit.play();
    }

    playWallBounce() {
        this.sounds.wallBounce.play();
    }

    playScore() {
        this.sounds.score.play();
    }

    playAIHit() {
        this.sounds.aiHit.play();
    }
}
