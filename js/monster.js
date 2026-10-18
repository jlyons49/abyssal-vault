/**
 * Sea Monster Manager & Behaviors
 * Multi-archetype predatory bosses:
 * - 'leviathan': The Abyssal Leviathan (Trench Dragon Serpent)
 * - 'kraken': The Kraken (Colossal Abyssal Squid)
 * - 'seaeater': The Sea Eater (Devourer of the Deep / Colossal Maw)
 */

export const MONSTER_TYPES = {
    leviathan: {
        id: 'leviathan',
        name: 'ABYSSAL LEVIATHAN',
        subtitle: 'ANCIENT TRENCH SERPENT',
        speed: 2.4,
        chargeSpeed: 6.2,
        chargeWarningDuration: 70,
        chargeDuration: 90,
        stunDuration: 120,
        segmentCount: 12,
        segmentSpacing: 22,
        hitRadius: 46,
        colorTheme: {
            primary: '#065f46',
            secondary: '#10b981',
            glow: '#38bdf8',
            ragePrimary: '#991b1b',
            rageSecondary: '#ef4444',
            eye: '#fbbf24'
        },
        description: 'An armored 12-segment dragon serpent with razor fangs and bioluminescent scutes.'
    },
    kraken: {
        id: 'kraken',
        name: 'THE KRAKEN',
        subtitle: 'COLOSSAL ABYSSAL SQUID',
        speed: 2.6,
        chargeSpeed: 6.9,
        chargeWarningDuration: 60,
        chargeDuration: 85,
        stunDuration: 110,
        segmentCount: 10,
        segmentSpacing: 18,
        hitRadius: 52,
        colorTheme: {
            primary: '#4c1d95',
            secondary: '#a855f7',
            glow: '#06b6d4',
            ragePrimary: '#831843',
            rageSecondary: '#f43f5e',
            eye: '#facc15'
        },
        description: 'A monstrous deep-sea cephalopod with a colossal mantle, hypnotic eye, and grasping tentacles.'
    },
    seaeater: {
        id: 'seaeater',
        name: 'THE SEA EATER',
        subtitle: 'DEVOURER OF THE DEEP',
        speed: 2.15,
        chargeSpeed: 7.8, // Devastating burst vacuum charge!
        chargeWarningDuration: 80,
        chargeDuration: 95,
        stunDuration: 130,
        segmentCount: 11,
        segmentSpacing: 24,
        hitRadius: 50,
        colorTheme: {
            primary: '#0f172a',
            secondary: '#ea580c',
            glow: '#ef4444',
            ragePrimary: '#7c2d12',
            rageSecondary: '#fb923c',
            eye: '#dc2626'
        },
        description: 'A colossal nightmarish maw lined with triple-row glowing fangs and an expanding gullet.'
    }
};

export class SeaMonster {
    constructor(type = null) {
        this.reset(type);
    }

    reset(preferredType = null) {
        this.active = false;
        this.x = 240;
        this.y = 2200; // starts deep below
        this.vx = 0;
        this.vy = 0;
        this.jawAngle = 0;
        this.facing = 1;
        this.jawCycle = 0;

        // Pick monster type (randomize between leviathan, kraken, seaeater if not specified)
        const typeKeys = Object.keys(MONSTER_TYPES);
        if (preferredType && MONSTER_TYPES[preferredType]) {
            this.type = preferredType;
        } else {
            this.type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        }

        const data = MONSTER_TYPES[this.type];
        this.name = data.name;
        this.subtitle = data.subtitle;
        this.speed = data.speed;
        this.chargeSpeed = data.chargeSpeed;
        this.chargeWarningDuration = data.chargeWarningDuration;
        this.chargeDuration = data.chargeDuration;
        this.stunDuration = data.stunDuration;
        this.hitRadius = data.hitRadius;
        this.colorTheme = data.colorTheme;

        // Segments for undulating body / tentacles
        this.segments = [];
        this.segmentSpacing = data.segmentSpacing;
        for (let i = 0; i < data.segmentCount; i++) {
            this.segments.push({
                x: this.x,
                y: this.y + (i + 1) * this.segmentSpacing
            });
        }

        // Special boss particle effects (ink clouds, vacuum bubbles)
        this.bossParticles = [];

        // State machine: 'stalking', 'warning', 'charging', 'stunned'
        this.state = 'stalking';
        this.stateTimer = 0;
        this.rageMode = false;
        this.stunTimer = 0;
    }

    spawn(initialX, initialY, type = null) {
        if (type && MONSTER_TYPES[type]) {
            this.reset(type);
        }
        this.active = true;
        this.x = initialX;
        this.y = initialY;
        this.segments.forEach((seg, i) => {
            seg.x = this.x;
            seg.y = this.y + (i + 1) * this.segmentSpacing;
        });
        this.state = 'stalking';
        this.stateTimer = 0;
        this.rageMode = false;
        this.stunTimer = 0;
    }

    update(targetSub, worldBounds, dt = 1) {
        if (!this.active) return;

        this.jawCycle += 0.08 * dt;
        if (this.type === 'seaeater') {
            // Sea eater mouth gapes wider and pulses
            this.jawAngle = Math.sin(this.jawCycle) * 0.45 + 0.35;
        } else if (this.type === 'kraken') {
            // Beak clicks and mantle pulses
            this.jawAngle = Math.sin(this.jawCycle * 1.5) * 0.25 + 0.15;
        } else {
            // Leviathan biting cycle
            this.jawAngle = Math.sin(this.jawCycle) * 0.35 + 0.1;
        }

        // Update Boss Particles (Ink clouds, suction bubbles)
        for (let i = this.bossParticles.length - 1; i >= 0; i--) {
            const p = this.bossParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= 0.015 * dt;
            p.size += 0.2 * dt;
            if (p.alpha <= 0) {
                this.bossParticles.splice(i, 1);
            }
        }

        // State handling
        if (this.state === 'stalking') {
            this.rageMode = false;
            // Chase player steadily upward
            const dx = targetSub.x - this.x;
            const dy = (targetSub.y + 110) - this.y; // try to stay right below/behind
            const dist = Math.hypot(dx, dy);

            this.facing = dx >= 0 ? 1 : -1;

            if (dist > 10) {
                this.vx += (dx / dist) * 0.15 * dt;
                this.vy += (dy / dist) * 0.18 * dt;
            }

            // Cap stalking speed
            const currentSpeed = Math.hypot(this.vx, this.vy);
            if (currentSpeed > this.speed) {
                this.vx = (this.vx / currentSpeed) * this.speed;
                this.vy = (this.vy / currentSpeed) * this.speed;
            }

            this.stateTimer += dt;
            // Charge trigger every ~5-8 seconds
            if (this.stateTimer > 280) {
                this.state = 'warning';
                this.stateTimer = 0;
            }

        } else if (this.state === 'warning') {
            // Telegraphed roar / preparing lunge
            this.rageMode = true;
            this.vx *= 0.85;
            this.vy *= 0.85;

            // Face target directly
            this.facing = (targetSub.x - this.x) >= 0 ? 1 : -1;

            if (this.type === 'seaeater') {
                this.jawAngle = 0.85 + Math.random() * 0.25; // Gaping colossal vacuum maw
            } else if (this.type === 'kraken') {
                this.jawAngle = 0.5 + Math.random() * 0.2; // Beak snaps open
            } else {
                this.jawAngle = 0.55 + Math.random() * 0.2; // Wide open serpent jaws
            }

            this.stateTimer += dt;
            if (this.stateTimer >= this.chargeWarningDuration) {
                this.state = 'charging';
                this.stateTimer = 0;

                // Burst toward player's current location with massive speed
                const cdx = targetSub.x - this.x;
                const cdy = targetSub.y - this.y;
                const cDist = Math.hypot(cdx, cdy) || 1;
                this.vx = (cdx / cDist) * this.chargeSpeed;
                this.vy = (cdy / cDist) * this.chargeSpeed;

                // Archetype specific burst particles
                if (this.type === 'kraken') {
                    // Release dark ink cloud burst
                    for (let k = 0; k < 12; k++) {
                        this.bossParticles.push({
                            x: this.x + (Math.random() - 0.5) * 40,
                            y: this.y + 20 + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 2,
                            vy: 0.5 + Math.random() * 2,
                            size: 14 + Math.random() * 16,
                            alpha: 0.85,
                            color: 'rgba(15, 23, 42, 0.92)'
                        });
                    }
                } else if (this.type === 'seaeater') {
                    // Suction bubble distortion
                    for (let s = 0; s < 14; s++) {
                        this.bossParticles.push({
                            x: this.x + (Math.random() - 0.5) * 50,
                            y: this.y - 30 + (Math.random() - 0.5) * 30,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -1 - Math.random() * 3,
                            size: 6 + Math.random() * 10,
                            alpha: 0.7,
                            color: 'rgba(234, 88, 12, 0.75)'
                        });
                    }
                }
            }

        } else if (this.state === 'charging') {
            this.rageMode = true;
            if (this.type === 'seaeater') {
                this.jawAngle = 0.75;
            } else {
                this.jawAngle = 0.45;
            }

            // Spawn trailing wake particles while charging
            if (Math.random() < 0.4) {
                this.bossParticles.push({
                    x: this.x + (Math.random() - 0.5) * 30,
                    y: this.y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: 1 + Math.random() * 2,
                    size: 8 + Math.random() * 12,
                    alpha: 0.6,
                    color: this.type === 'kraken' ? 'rgba(76, 29, 149, 0.7)' : 'rgba(239, 68, 68, 0.6)'
                });
            }

            this.stateTimer += dt;
            if (this.stateTimer >= this.chargeDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
            }

        } else if (this.state === 'stunned') {
            this.rageMode = false;
            this.vx *= 0.9;
            this.vy = 1.0; // Slowly sinks backwards

            this.stunTimer = Math.max(0, this.stunTimer - dt);
            this.stateTimer += dt;
            if (this.stateTimer >= this.stunDuration) {
                this.state = 'stalking';
                this.stateTimer = 0;
                this.stunTimer = 0;
            }
        }

        // Move Head
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Keep horizontal within world
        this.x = Math.max(30, Math.min(worldBounds.width - 30, this.x));

        // Update body segments following each other like a chain
        let prevX = this.x;
        let prevY = this.y;

        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const sx = prevX - seg.x;
            const sy = prevY - seg.y;
            const dist = Math.hypot(sx, sy) || 1;

            if (dist > this.segmentSpacing) {
                const angle = Math.atan2(sy, sx);
                seg.x = prevX - Math.cos(angle) * this.segmentSpacing;
                seg.y = prevY - Math.sin(angle) * this.segmentSpacing;
            }

            prevX = seg.x;
            prevY = seg.y;
        }
    }

    stun() {
        this.state = 'stunned';
        this.stateTimer = 0;
        this.stunTimer = this.stunDuration;
        this.rageMode = false;
    }

    checkPlayerCollision(sub) {
        if (!this.active || this.state === 'stunned') return false;

        // Check head collision
        const headDist = Math.hypot(this.x - sub.x, this.y - sub.y);
        if (headDist < this.hitRadius) {
            return true;
        }

        // Check front body segments / tentacles
        const checkCount = Math.min(4, this.segments.length);
        for (let i = 0; i < checkCount; i++) {
            const seg = this.segments[i];
            const segDist = Math.hypot(seg.x - sub.x, seg.y - sub.y);
            if (segDist < this.hitRadius * 0.75) {
                return true;
            }
        }

        return false;
    }
}
