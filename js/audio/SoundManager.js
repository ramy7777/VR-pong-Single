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

            // Wall bounce: sharp click (B5) - shorter and crisper
            wallBounce: this.createSound({
                midiNote: 83,
                duration: 0.05,
                waveform: 'square',
                attack: 0.001,
                decay: 0.05,
                gain: 0.15
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
            }),

            // Miss sound: descending notes
            miss: this.createDescendingNotes([67, 64, 60], 0.3),

            // Point sound: ascending notes
            point: this.createAscendingNotes([60, 64, 67], 0.3),

            // Lose sound: quick descending minor third with vibrato
            lose: this.createSound({
                midiNote: 70,  // Bb4
                duration: 0.25,
                waveform: 'sawtooth',
                attack: 0.01,
                decay: 0.25,
                gain: 0.25,
                pitchBend: {
                    endNote: 65,  // F4
                    time: 0.25
                },
                vibrato: {
                    frequency: 12,
                    amplitude: 10
                }
            })
        };
    }

    createSound({ midiNote, duration, waveform, attack, decay, gain, pitchBend, vibrato }) {
        const startFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                // Set oscillator properties
                osc.type = waveform;
                osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
                
                // Add pitch bend if specified
                if (pitchBend) {
                    const endFreq = 440 * Math.pow(2, (pitchBend.endNote - 69) / 12);
                    osc.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + pitchBend.time);
                }

                // Add vibrato if specified
                if (vibrato) {
                    const vibratoOsc = this.audioContext.createOscillator();
                    const vibratoGain = this.audioContext.createGain();
                    
                    vibratoOsc.frequency.value = vibrato.frequency;
                    vibratoGain.gain.value = vibrato.amplitude;
                    
                    vibratoOsc.connect(vibratoGain);
                    vibratoGain.connect(osc.frequency);
                    
                    vibratoOsc.start();
                    vibratoOsc.stop(this.audioContext.currentTime + duration);
                }
                
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

    createDescendingNotes(midiNotes, duration) {
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                masterGain.connect(this.audioContext.destination);

                midiNotes.forEach((note, index) => {
                    setTimeout(() => {
                        const osc = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        const frequency = 440 * Math.pow(2, (note - 69) / 12);
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                        
                        osc.connect(gainNode);
                        gainNode.connect(masterGain);
                        
                        osc.start();
                        osc.stop(this.audioContext.currentTime + 0.2);
                    }, index * 100);
                });
            }
        };
    }

    createAscendingNotes(midiNotes, duration) {
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                masterGain.connect(this.audioContext.destination);

                midiNotes.forEach((note, index) => {
                    setTimeout(() => {
                        const osc = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        const frequency = 440 * Math.pow(2, (note - 69) / 12);
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                        
                        osc.connect(gainNode);
                        gainNode.connect(masterGain);
                        
                        osc.start();
                        osc.stop(this.audioContext.currentTime + 0.2);
                    }, index * 100);
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

    playMiss() {
        this.sounds.miss.play();
    }

    playPoint() {
        this.sounds.point.play();
    }

    playLose() {
        this.sounds.lose.play();
    }
}
