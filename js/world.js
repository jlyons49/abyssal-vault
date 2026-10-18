/**
 * World & Ocean Environment Manager
 * Handles depth zones, terrain caverns, particles, collectibles, hazards, and torpedoes.
 */

export class World {
    constructor(shipType = 'pirate') {
        this.width = 720;
        this.height = 2400;
        this.surfaceY = 60;
        this.seafloorY = 2260;
        this.shipType = shipType;
        this.shipwreck = {
            x: 360,
            y: 2160,
            dockRadius: 75,
            looted: false,
            type: shipType
        };

        this.particles = [];
        this.collectibles = [];
        this.hazards = [];
        this.torpedoes = [];
        this.marineLife = [];
        this.caverns = [];
        this.oxygenVents = [];

        this.initWorld(shipType);
    }

    initWorld(shipType = 'pirate') {
        this.shipType = shipType;
        this.shipwreck = {
            x: 360,
            y: 2160,
            dockRadius: 75,
            looted: false,
            type: shipType
        };

        this.particles = [];
        this.collectibles = [];
        this.hazards = [];
        this.torpedoes = [];
        this.marineLife = [];
        this.caverns = [];
        this.oxygenVents = [
            { x: 150, y: 460, radius: 50 },
            { x: 560, y: 920, radius: 50 },
            { x: 190, y: 1400, radius: 50 },
            { x: 530, y: 1880, radius: 50 }
        ];

        // Ambient marine snow particles
        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: 0.2 + Math.random() * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.6 + 0.2,
                type: 'snow'
            });
        }

        // Generate Cavern Pillars / Rocky Outcrops
        // Level design provides clear navigation paths with strategic obstacles
        const pillarYPositions = [280, 520, 800, 1080, 1360, 1640, 1880];
        pillarYPositions.forEach((py, idx) => {
            // Alternate left wall, right wall, or center floating spire
            if (idx % 3 === 0) {
                // Left rocky shelf
                this.caverns.push({
                    x: 0,
                    y: py,
                    width: 140 + Math.random() * 50,
                    height: 80,
                    color: '#1e293b'
                });
            } else if (idx % 3 === 1) {
                // Right rocky shelf
                const w = 150 + Math.random() * 50;
                this.caverns.push({
                    x: this.width - w,
                    y: py,
                    width: w,
                    height: 80,
                    color: '#1e293b'
                });
            } else {
                // Center floating spire / sea arch
                this.caverns.push({
                    x: 240 + (idx % 2 === 0 ? 60 : -60),
                    y: py,
                    width: 120,
                    height: 65,
                    color: '#0f172a'
                });
            }
        });

        // Spawn Collectibles (Coins, Oxygen, Repair kits, Torpedo ammo)
        for (let y = 180; y < 2050; y += 75) {
            // Gold coins
            const coinCount = Math.floor(Math.random() * 2) + 1;
            for (let c = 0; c < coinCount; c++) {
                this.collectibles.push({
                    x: 60 + Math.random() * (this.width - 120),
                    y: y + Math.random() * 40,
                    type: 'coin',
                    collected: false
                });
            }

            // Oxygen Canisters (frequent along descent for easy recharge)
            if (y % 150 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y,
                    type: 'oxygen',
                    collected: false
                });
            }

            // Repair toolkits
            if (y % 300 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y + 20,
                    type: 'repair',
                    collected: false
                });
            }

            // Torpedo ammo crates
            if (y % 450 === 0) {
                this.collectibles.push({
                    x: 80 + Math.random() * (this.width - 160),
                    y: y,
                    type: 'torpedo_pickup',
                    collected: false
                });
            }
        }

        // Spawn Hazards (Spiked Sea Mines in deeper waters)
        for (let y = 450; y < 2000; y += 170) {
            this.hazards.push({
                x: 80 + Math.random() * (this.width - 160),
                y: y,
                originX: 80 + Math.random() * (this.width - 160),
                type: 'mine',
                radius: 14,
                floatSpeed: 0.02 + Math.random() * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                health: 1
            });
        }

        // Spawn Marine Life
        // Sunlit zone: colorful fish
        for (let i = 0; i < 18; i++) {
            this.marineLife.push({
                x: Math.random() * this.width,
                y: 100 + Math.random() * 450,
                vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'fish',
                color: ['#f97316', '#eab308', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 4)]
            });
        }

        // Twilight zone: Jellyfish
        for (let i = 0; i < 12; i++) {
            this.marineLife.push({
                x: 60 + Math.random() * (this.width - 120),
                y: 600 + Math.random() * 800,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.3 + (Math.random() - 0.5) * 0.2,
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'jelly'
            });
        }

        // Abyssal zone: Anglerfish
        for (let i = 0; i < 7; i++) {
            this.marineLife.push({
                x: 60 + Math.random() * (this.width - 120),
                y: 1500 + Math.random() * 600,
                vx: (Math.random() > 0.5 ? 1 : -1) * 0.6,
                facing: 1,
                animTimer: Math.random() * 10,
                type: 'angler'
            });
        }
    }

    addBubble(x, y, vx = 0, vy = -1, size = 3) {
        this.particles.push({
            x,
            y,
            vx: vx + (Math.random() - 0.5) * 0.6,
            vy: vy - Math.random() * 0.8,
            size: size + Math.random() * 2,
            alpha: 0.8,
            type: 'bubble'
        });
    }

    addSparkles(x, y, count = 8, color = '#fef08a') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1.5 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: Math.random() * 3 + 2,
                alpha: 1.0,
                color,
                type: 'sparkle'
            });
        }
    }

    fireTorpedo(sub) {
        if (sub.torpedoes <= 0) return false;
        sub.torpedoes--;

        const angle = sub.facing === 1 ? 0 : Math.PI;
        const speed = 7.5;
        this.torpedoes.push({
            x: sub.x + (sub.facing * 28),
            y: sub.y + 4,
            vx: Math.cos(angle) * speed,
            vy: (Math.random() - 0.5) * 0.3,
            life: 140
        });
        return true;
    }

    update(dt = 1) {
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'snow') {
                if (p.y > this.height) p.y = 0;
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
            } else if (p.type === 'bubble') {
                p.alpha -= 0.015 * dt;
                p.size = Math.max(0.5, p.size - 0.02 * dt);
                if (p.alpha <= 0 || p.y < 0) {
                    this.particles.splice(i, 1);
                }
            } else if (p.type === 'sparkle') {
                p.alpha -= 0.03 * dt;
                p.vx *= 0.94;
                p.vy *= 0.94;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Update Marine Life
        this.marineLife.forEach(creature => {
            creature.x += creature.vx * dt;
            if (creature.vy) creature.y += creature.vy * dt;
            creature.animTimer += 0.05 * dt;

            if (creature.vx !== 0) {
                creature.facing = creature.vx > 0 ? 1 : -1;
            }

            // Boundary bounce
            if (creature.x < 20) {
                creature.x = 20;
                creature.vx *= -1;
            } else if (creature.x > this.width - 20) {
                creature.x = this.width - 20;
                creature.vx *= -1;
            }
        });

        // Update Hazards (Mines floating gently)
        this.hazards.forEach(h => {
            if (h.type === 'mine') {
                h.floatOffset += h.floatSpeed * dt;
                h.y += Math.sin(h.floatOffset) * 0.4;
            }
        });

        // Oxygen vents emit bubble columns
        this.oxygenVents.forEach(vent => {
            if (Math.random() < 0.35) {
                this.addBubble(
                    vent.x + (Math.random() - 0.5) * 20,
                    vent.y - 4,
                    (Math.random() - 0.5) * 0.4,
                    -2.5 - Math.random() * 1.5,
                    3.5
                );
            }
        });

        // Update Torpedoes
        for (let i = this.torpedoes.length - 1; i >= 0; i--) {
            const t = this.torpedoes[i];
            t.x += t.vx * dt;
            t.y += t.vy * dt;
            t.life -= dt;

            // Bubble wake
            if (Math.random() < 0.5) {
                this.addBubble(t.x - t.vx, t.y, -t.vx * 0.2, 0, 2);
            }

            if (t.life <= 0 || t.x < 0 || t.x > this.width || t.y < 0 || t.y > this.height) {
                this.torpedoes.splice(i, 1);
            }
        }
    }

    /**
     * Check collisions between submarine, caverns, hazards, and items
     */
    checkCollisions(sub, onCollect, onDamage, onMineExplode) {
        // Check Hydrothermal Oxygen Vents and surface aeration
        let inOxygenZone = false;
        this.oxygenVents.forEach(vent => {
            const dist = Math.hypot(sub.x - vent.x, sub.y - vent.y);
            if (dist < vent.radius + 28) {
                inOxygenZone = true;
                sub.replenishOxygen(0.85);
                if (Math.random() < 0.2) {
                    this.addSparkles(sub.x, sub.y, 2, '#38bdf8');
                }
            }
        });

        if (sub.y <= 90) {
            inOxygenZone = true;
            sub.replenishOxygen(1.2);
        }

        sub.isRechargingOxygen = inOxygenZone;

        // Collectibles
        this.collectibles.forEach(item => {
            if (!item.collected) {
                const dist = Math.hypot(sub.x - item.x, sub.y - item.y);
                if (dist < 26) {
                    item.collected = true;
                    this.addSparkles(item.x, item.y, 8, item.type === 'coin' ? '#fef08a' : '#38bdf8');
                    onCollect(item);
                }
            }
        });

        // Cavern Walls / Spires / Solid Blocks (Impassable Solid Barriers)
        const halfW = sub.width / 2;
        const halfH = sub.height / 2;

        this.caverns.forEach(c => {
            const overlapLeft = (sub.x + halfW) - c.x;
            const overlapRight = (c.x + c.width) - (sub.x - halfW);
            const overlapTop = (sub.y + halfH) - c.y;
            const overlapBottom = (c.y + c.height) - (sub.y - halfH);

            if (overlapLeft > 0 && overlapRight > 0 && overlapTop > 0 && overlapBottom > 0) {
                // Determine minimum penetration depth to push submarine completely out of block
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft) {
                    sub.x = c.x - halfW;
                    if (sub.vx > 0) sub.vx = 0;
                } else if (minOverlap === overlapRight) {
                    sub.x = c.x + c.width + halfW;
                    if (sub.vx < 0) sub.vx = 0;
                } else if (minOverlap === overlapTop) {
                    sub.y = c.y - halfH;
                    if (sub.vy > 0) sub.vy = 0;
                } else if (minOverlap === overlapBottom) {
                    sub.y = c.y + c.height + halfH;
                    if (sub.vy < 0) sub.vy = 0;
                }

                // Inflict contact collision damage
                const damaged = sub.takeDamage(12);
                if (damaged) {
                    onDamage('rock');
                }
            }
        });

        // Seafloor sand solid barrier
        if (sub.y + halfH > this.seafloorY) {
            sub.y = this.seafloorY - halfH;
            if (sub.vy > 0) sub.vy = 0;
        }

        // Hazards (Mines: 2x Lethal Damage = 50 dmg)
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const h = this.hazards[i];
            const dist = Math.hypot(sub.x - h.x, sub.y - h.y);
            if (dist < h.radius + 18) {
                // Detonate mine!
                this.addSparkles(h.x, h.y, 22, '#f97316');
                this.hazards.splice(i, 1);

                // Explosive blast knockback
                const blastAngle = Math.atan2(sub.y - h.y, sub.x - h.x);
                sub.vx += Math.cos(blastAngle) * 5;
                sub.vy += Math.sin(blastAngle) * 5;

                // 2x damage: 50 damage (half max hull integrity!)
                sub.takeDamage(50);
                onMineExplode(h);
            }
        }

        // Torpedoes vs Hazards & Caverns
        for (let ti = this.torpedoes.length - 1; ti >= 0; ti--) {
            const t = this.torpedoes[ti];
            let exploded = false;

            // Torpedo vs Mine
            for (let hi = this.hazards.length - 1; hi >= 0; hi--) {
                const h = this.hazards[hi];
                if (Math.hypot(t.x - h.x, t.y - h.y) < h.radius + 12) {
                    this.addSparkles(h.x, h.y, 14, '#ef4444');
                    this.hazards.splice(hi, 1);
                    exploded = true;
                    onMineExplode(h);
                    break;
                }
            }

            // Torpedo vs Caverns
            if (!exploded) {
                for (const c of this.caverns) {
                    if (t.x >= c.x && t.x <= c.x + c.width && t.y >= c.y && t.y <= c.y + c.height) {
                        this.addSparkles(t.x, t.y, 8, '#94a3b8');
                        exploded = true;
                        break;
                    }
                }
            }

            if (exploded) {
                this.torpedoes.splice(ti, 1);
            }
        }
    }

    /**
     * Check if submarine has reached the shipwreck docking zone
     */
    isSubmarineAtShipwreck(sub) {
        if (this.shipwreck.looted) return false;
        const dist = Math.hypot(sub.x - (this.shipwreck.x + 85), sub.y - (this.shipwreck.y - 20));
        return dist < this.shipwreck.dockRadius;
    }

    /**
     * Draw Background Water Gradient, Sky Horizon, Soft God-Rays, Parallax Reefs & Seafloor
     */
    drawBackground(ctx, cameraY, viewportHeight) {
        const now = Date.now();

        // 1. Deep Multi-Stop Ocean Depth Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0.0, '#38bdf8'); // Surface turquoise
        grad.addColorStop(0.03, '#0ea5e9'); // Shallow sunlit reef
        grad.addColorStop(0.15, '#0284c7'); // Upper pelagic blue
        grad.addColorStop(0.35, '#0369a1'); // Mesopelagic twilight
        grad.addColorStop(0.60, '#0f172a'); // Midnight bathypelagic
        grad.addColorStop(0.85, '#020617'); // Abyssal trench
        grad.addColorStop(1.0, '#01030a'); // Hadal seafloor

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Sky, Clouds, Distant Island & Animated Waves above y = 52
        if (cameraY < 200) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 54);
            skyGrad.addColorStop(0, '#0284c7');
            skyGrad.addColorStop(0.6, '#7dd3fc');
            skyGrad.addColorStop(1, '#fef08a');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, this.width, 54);

            // Distant Volcanic Island & Lighthouse Silhouette on Horizon
            ctx.fillStyle = '#0369a1';
            ctx.beginPath();
            ctx.moveTo(490, 52);
            ctx.lineTo(525, 28);
            ctx.lineTo(555, 36);
            ctx.lineTo(585, 22);
            ctx.lineTo(630, 52);
            ctx.closePath();
            ctx.fill();

            // Tiny pixel lighthouse on island peak
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(582, 12, 5, 11);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(582, 15, 5, 3);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(583, 10, 3, 2);

            // Pixelated Fluffy Horizon Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            const cloudDrift = (now / 120) % this.width;
            for (let cx = -100; cx < this.width + 100; cx += 160) {
                const xPos = (cx + cloudDrift) % (this.width + 120) - 60;
                ctx.fillRect(xPos, 14, 38, 6);
                ctx.fillRect(xPos + 6, 10, 24, 4);
                ctx.fillRect(xPos + 12, 7, 12, 3);
            }
        }

        // 3. Soft Diagonal Volumetric Sunbeams (no harsh vertical stripes!)
        if (cameraY < 580) {
            ctx.save();
            const fade = Math.max(0, 1 - cameraY / 580);
            for (let i = 0; i < 6; i++) {
                const bx = 55 + i * 115;
                const sway = Math.sin(now / 1800 + i * 1.3) * 18;
                const topW = 24 + (i % 2) * 14;
                const botW = topW * 2.8;

                const rayGrad = ctx.createLinearGradient(bx, 50, bx + 95, 520);
                rayGrad.addColorStop(0, `rgba(254, 249, 195, ${0.22 * fade})`);
                rayGrad.addColorStop(0.45, `rgba(186, 230, 253, ${0.10 * fade})`);
                rayGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

                ctx.fillStyle = rayGrad;
                ctx.beginPath();
                ctx.moveTo(bx, 50);
                ctx.lineTo(bx + topW, 50);
                ctx.lineTo(bx + 110 + botW + sway, 520);
                ctx.lineTo(bx + 110 + sway, 520);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }

        // 4. Animated Surface Waves & Seafoam Crest (y = 48 to 56)
        if (cameraY < 220) {
            ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
            ctx.beginPath();
            ctx.moveTo(0, 60);
            for (let wx = 0; wx <= this.width; wx += 16) {
                const wy = 51 + Math.sin(now / 320 + wx * 0.08) * 3;
                ctx.lineTo(wx, wy);
            }
            ctx.lineTo(this.width, 60);
            ctx.closePath();
            ctx.fill();

            // Crisp white pixel seafoam highlights
            ctx.fillStyle = '#ffffff';
            for (let rx = 0; rx < this.width; rx += 18) {
                const wy = 50 + Math.sin(now / 320 + rx * 0.08) * 3;
                ctx.fillRect(rx, wy, 10, 2);
            }
        }

        // 5. Distant Background Trench Silhouettes (Atmospheric Depth)
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
        for (let py = 350; py < 2100; py += 380) {
            const isLeft = (py / 380) % 2 === 0;
            ctx.beginPath();
            if (isLeft) {
                ctx.moveTo(0, py - 90);
                ctx.lineTo(95, py - 40);
                ctx.lineTo(65, py + 50);
                ctx.lineTo(0, py + 110);
            } else {
                ctx.moveTo(this.width, py - 90);
                ctx.lineTo(this.width - 95, py - 40);
                ctx.lineTo(this.width - 65, py + 50);
                ctx.lineTo(this.width, py + 110);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // 6. Detailed Seafloor Dunes, Volcanic Rocks, Corals & Kelp (y = 2260)
        // Background sand dune layer
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        for (let sx = 0; sx <= this.width; sx += 30) {
            const dune = Math.sin(sx * 0.025 + 1.2) * 14;
            ctx.lineTo(sx, this.seafloorY - 12 + dune);
        }
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fill();

        // Foreground seafloor sediment & basalt crust
        const floorGrad = ctx.createLinearGradient(0, this.seafloorY - 8, 0, this.height);
        floorGrad.addColorStop(0, '#44403c');
        floorGrad.addColorStop(0.25, '#292524');
        floorGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        for (let bx = 0; bx <= this.width; bx += 20) {
            const hill = Math.sin(bx * 0.04) * 8 + Math.cos(bx * 0.09) * 4;
            ctx.lineTo(bx, this.seafloorY + hill);
        }
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fill();

        // Seafloor Coral Fans, Glowing Abyssal Crystals & Pebbles
        for (let fx = 35; fx < this.width - 30; fx += 65) {
            const baseY = this.seafloorY + Math.sin(fx * 0.04) * 7;

            // Basalt cobble stone
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.arc(fx + 14, baseY + 6, 7, Math.PI, 0);
            ctx.fill();

            if (fx % 130 === 35) {
                // Glowing Cyan Abyssal Crystal Cluster
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.moveTo(fx - 4, baseY + 2);
                ctx.lineTo(fx - 8, baseY - 14);
                ctx.lineTo(fx, baseY + 2);
                ctx.fill();

                ctx.fillStyle = '#67e8f9';
                ctx.beginPath();
                ctx.moveTo(fx, baseY + 2);
                ctx.lineTo(fx + 3, baseY - 19);
                ctx.lineTo(fx + 7, baseY + 2);
                ctx.fill();
            } else {
                // Deep-Sea Crimson / Magenta Gorgonian Coral Fan
                ctx.strokeStyle = '#db2777';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(fx, baseY + 2);
                ctx.lineTo(fx - 7, baseY - 12);
                ctx.moveTo(fx, baseY - 3);
                ctx.lineTo(fx + 8, baseY - 14);
                ctx.moveTo(fx, baseY + 2);
                ctx.lineTo(fx, baseY - 16);
                ctx.stroke();
            }
        }
    }

    /**
     * Draw Chiseled Cavern Rock Formations, Spiked Naval Mines, Vents & Torpedoes
     */
    drawCavernsAndHazards(ctx, sprites = null) {
        const now = Date.now();

        // 1. Hydrothermal Oxygen Vents
        if (sprites && sprites.drawOxygenVent) {
            this.oxygenVents.forEach(vent => {
                sprites.drawOxygenVent(ctx, vent);
            });
        }

        // 2. Chiseled Multi-Layered Cavern Rock Shelves & Stalactites
        this.caverns.forEach((c, idx) => {
            ctx.save();

            // Hanging Stalactites along the bottom underside of the rock block
            ctx.fillStyle = '#090d16';
            for (let sx = c.x + 14; sx < c.x + c.width - 14; sx += 22) {
                const stalH = 8 + ((sx * 7 + idx * 13) % 14);
                ctx.beginPath();
                ctx.moveTo(sx - 5, c.y + c.height - 2);
                ctx.lineTo(sx, c.y + c.height + stalH);
                ctx.lineTo(sx + 5, c.y + c.height - 2);
                ctx.closePath();
                ctx.fill();
            }

            // Outer Dark Rock Silhouette
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.roundRect(c.x, c.y, c.width, c.height, 10);
            ctx.fill();

            // Main Stratified Rock Body Gradient
            const rockGrad = ctx.createLinearGradient(c.x, c.y, c.x, c.y + c.height);
            rockGrad.addColorStop(0, '#334155');
            rockGrad.addColorStop(0.35, '#1e293b');
            rockGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = rockGrad;
            ctx.beginPath();
            ctx.roundRect(c.x + 2, c.y + 2, c.width - 4, c.height - 4, 8);
            ctx.fill();

            // Top Chiseled Ledge Highlight
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.roundRect(c.x + 4, c.y + 3, c.width - 8, 10, 4);
            ctx.fill();

            // Horizontal Geological Strata & Craggy Fractures
            ctx.strokeStyle = 'rgba(2, 6, 23, 0.55)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(c.x + 8, c.y + c.height * 0.45);
            ctx.lineTo(c.x + c.width * 0.6, c.y + c.height * 0.52);
            ctx.lineTo(c.x + c.width - 8, c.y + c.height * 0.42);
            ctx.moveTo(c.x + 16, c.y + c.height * 0.72);
            ctx.lineTo(c.x + c.width - 14, c.y + c.height * 0.68);
            ctx.stroke();

            // Bio-Moss, Barnacles & Glowing Crystals on Top Ledge
            ctx.fillStyle = c.y > 1200 ? '#0d9488' : '#059669';
            for (let mx = c.x + 10; mx < c.x + c.width - 18; mx += 18) {
                const mw = 10 + (mx % 8);
                ctx.fillRect(mx, c.y + 1, mw, 4);
            }

            // Decorative Coral or Glowing Crystal on the Shelf
            if (c.y < 1100) {
                // Orange/Pink Tube Coral on upper shelves
                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(c.x + 22, c.y - 8, 4, 9);
                ctx.fillRect(c.x + 28, c.y - 11, 4, 12);
                ctx.fillRect(c.x + 34, c.y - 6, 4, 7);
            } else {
                // Glowing Bioluminescent Crystal Shards on deep shelves
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(c.x + 24, c.y + 2);
                ctx.lineTo(c.x + 28, c.y - 12);
                ctx.lineTo(c.x + 33, c.y + 2);
                ctx.fill();
                ctx.fillStyle = '#bae6fd';
                ctx.beginPath();
                ctx.moveTo(c.x + 31, c.y + 2);
                ctx.lineTo(c.x + 36, c.y - 8);
                ctx.lineTo(c.x + 39, c.y + 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // 3. High-Yield Spiked Naval Mines (2x Damage Threat)
        this.hazards.forEach(h => {
            if (h.type === 'mine') {
                ctx.save();
                ctx.translate(Math.round(h.x), Math.round(h.y));

                // Faint Pulsing Red Proximity Danger Aura
                const pulse = 0.15 + Math.sin(now / 220) * 0.1;
                ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, h.radius + 11, 0, Math.PI * 2);
                ctx.stroke();

                // Heavy Stud-Link Anchor Chain descending into the dark
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 3]);
                ctx.beginPath();
                ctx.moveTo(0, h.radius);
                ctx.lineTo(0, 68);
                ctx.stroke();
                ctx.setLineDash([]);

                // 8 Conical Contact Horns / Spikes around the perimeter
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                    const cos = Math.cos(a);
                    const sin = Math.sin(a);
                    ctx.fillStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.moveTo(cos * (h.radius - 2) - sin * 3.5, sin * (h.radius - 2) + cos * 3.5);
                    ctx.lineTo(cos * (h.radius + 7), sin * (h.radius + 7));
                    ctx.lineTo(cos * (h.radius - 2) + sin * 3.5, sin * (h.radius - 2) - cos * 3.5);
                    ctx.closePath();
                    ctx.fill();

                    // Red warning tip on each contact horn
                    ctx.fillStyle = '#dc2626';
                    ctx.beginPath();
                    ctx.arc(cos * (h.radius + 6), sin * (h.radius + 6), 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Cast-Iron Spherical Casing with 3D Metallic Shading
                ctx.fillStyle = '#090d16';
                ctx.beginPath();
                ctx.arc(0, 0, h.radius + 1, 0, Math.PI * 2);
                ctx.fill();

                const mineGrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, h.radius);
                mineGrad.addColorStop(0, '#64748b');
                mineGrad.addColorStop(0.55, '#334155');
                mineGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = mineGrad;
                ctx.beginPath();
                ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
                ctx.fill();

                // Equatorial bolted flange seam
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-h.radius + 1, 0);
                ctx.lineTo(h.radius - 1, 0);
                ctx.stroke();

                // Center Armed Proximity Sensor Lens
                const blink = Math.sin(now / 160) > 0;
                ctx.fillStyle = '#090d16';
                ctx.beginPath();
                ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();

                if (blink) {
                    ctx.fillStyle = '#fef08a';
                    ctx.fillRect(-1.5, -1.5, 2, 2);
                }

                ctx.restore();
            }
        });

        // 4. Active Sonic Torpedo Projectiles
        this.torpedoes.forEach(t => {
            const dir = t.vx >= 0 ? 1 : -1;
            ctx.save();
            ctx.translate(Math.round(t.x), Math.round(t.y));
            ctx.scale(dir, 1);

            // Trailing sonic cavitation ring
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(-12, 0, 3, 6, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Stabilizer tail fins
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.moveTo(-10, -6);
            ctx.lineTo(-5, -3);
            ctx.lineTo(-5, 3);
            ctx.lineTo(-10, 6);
            ctx.closePath();
            ctx.fill();

            // Metallic torpedo body
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(-8, -3, 14, 6);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(-8, -1, 14, 2);

            // Glowing sonic warhead nose cone
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(6, -3);
            ctx.lineTo(12, 0);
            ctx.lineTo(6, 3);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Draw Particles (marine snow, specular bubbles, 4-point sparkles)
     */
    drawParticles(ctx) {
        this.particles.forEach(p => {
            if (p.type === 'snow') {
                ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha})`;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            } else if (p.type === 'bubble') {
                ctx.save();
                ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
                ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha * 0.25})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Tiny specular bubble highlight dot
                if (p.size >= 2.5) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                    ctx.fillRect(p.x - p.size * 0.4, p.y - p.size * 0.4, 1.2, 1.2);
                }
                ctx.restore();
            } else if (p.type === 'sparkle') {
                ctx.save();
                ctx.fillStyle = p.color || '#fef08a';
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
                ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
                ctx.restore();
            }
        });
    }

    /**
     * Draw Sonar Wave Overlay
     */
    drawSonar(ctx, sub) {
        if (!sub.sonarActive) return;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sub.x, sub.y, sub.sonarRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sub.x, sub.y, Math.max(0, sub.sonarRadius - 22), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
