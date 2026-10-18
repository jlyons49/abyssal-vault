/**
 * Sprite & Graphic Rendering Helpers
 * Draws high-detail 16-bit retro pixel-art entities directly onto the canvas.
 */

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

export class SpriteRenderer {
    constructor() {
        this.cache = {};
    }

    /**
     * Draw the Explorer Submarine (High-Detail 16-Bit Pixel Submersible)
     */
    drawSubmarine(ctx, x, y, options = {}) {
        const {
            facing = 1, // 1 for right, -1 for left
            propellerAngle = 0,
            isBoosting = false,
            damaged = false,
            lightsOn = true,
            pitch = 0,
            skin = null,
            light = null
        } = options;

        const isDamageFlash = damaged && Math.floor(Date.now() / 90) % 2 === 0;
        const hullColor = isDamageFlash ? '#ef4444' : (skin?.hullColor || '#facc15');
        const hullDark = isDamageFlash ? '#991b1b' : (skin?.hullDark || '#d97706');
        const trimColor = isDamageFlash ? '#7f1d1d' : (skin?.trimColor || '#92400e');
        const domeColor = skin?.domeColor || '#38bdf8';

        // Draw volumetric headlight cone behind hull details so light originates naturally
        if (lightsOn) {
            this.drawHeadlightBeam(ctx, x, y, facing, pitch, light);
        }

        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);
        ctx.rotate(pitch);

        // =========================================
        // 1. THRUSTER & PROPELLER ASSEMBLY (Rear x = -30)
        // =========================================
        ctx.save();
        ctx.translate(-29, 0);

        // Multi-stage plasma/bubble jet when boosting
        if (isBoosting) {
            const flicker = Math.random() * 10;
            // Outer cyan hydro-plasma cone
            const boostGrad = ctx.createLinearGradient(-4, 0, -34 - flicker, 0);
            boostGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
            boostGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.6)');
            boostGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
            ctx.fillStyle = boostGrad;
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.lineTo(-32 - flicker, -12);
            ctx.lineTo(-26 - flicker * 0.5, 0);
            ctx.lineTo(-32 - flicker, 12);
            ctx.lineTo(-2, 6);
            ctx.closePath();
            ctx.fill();

            // Inner white-hot core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-2, -3);
            ctx.lineTo(-16 - Math.random() * 6, 0);
            ctx.lineTo(-2, 3);
            ctx.closePath();
            ctx.fill();

            // Golden shock rings
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
            ctx.lineWidth = 1.5;
            const ringOffset = (Date.now() / 30) % 14;
            ctx.beginPath();
            ctx.ellipse(-6 - ringOffset, 0, 2, 6 + ringOffset * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Tail cone shroud & drive shaft
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, -5, 6, 10);
        ctx.fillStyle = trimColor;
        ctx.fillRect(-3, -4, 5, 8);

        // Spinning Twin Brass Propeller Blades
        const b1 = 13 * Math.sin(propellerAngle);
        const b2 = 13 * Math.cos(propellerAngle);

        // Blade 1
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(-3, b1 * 0.5, 2.5, Math.abs(b1) * 0.55 + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blade 2
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(-3, -b2 * 0.5, 2, Math.abs(b2) * 0.55 + 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Propeller spinner cap
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // =========================================
        // 2. REAR STABILIZER FINS / RUDDERS
        // =========================================
        ctx.fillStyle = '#0f172a';
        // Top fin
        ctx.beginPath();
        ctx.moveTo(-26, -8);
        ctx.lineTo(-31, -19);
        ctx.lineTo(-19, -19);
        ctx.lineTo(-14, -10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.beginPath();
        ctx.moveTo(-25, -9);
        ctx.lineTo(-29, -17);
        ctx.lineTo(-20, -17);
        ctx.lineTo(-16, -10);
        ctx.closePath();
        ctx.fill();

        // Bottom fin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-26, 8);
        ctx.lineTo(-31, 19);
        ctx.lineTo(-19, 19);
        ctx.lineTo(-14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.beginPath();
        ctx.moveTo(-25, 9);
        ctx.lineTo(-29, 17);
        ctx.lineTo(-20, 17);
        ctx.lineTo(-16, 10);
        ctx.closePath();
        ctx.fill();

        // =========================================
        // 3. CONNING TOWER (SAIL) & PERISCOPE MAST
        // =========================================
        // Periscope Mast & Strobe Antenna
        ctx.fillStyle = '#334155';
        ctx.fillRect(-8, -28, 2, 10); // Radio antenna
        // Blinking navigation beacon on antenna tip
        const navBlink = Math.sin(Date.now() / 220) > 0.2;
        ctx.fillStyle = navBlink ? '#ef4444' : '#7f1d1d';
        ctx.fillRect(-9, -30, 4, 3);
        if (navBlink) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
            ctx.beginPath();
            ctx.arc(-7, -29, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main Brass Periscope
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-2, -28, 5, 9);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-1, -27, 3, 8);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, -28, 7, 5);
        ctx.fillStyle = domeColor;
        ctx.fillRect(4, -27, 3, 3); // Periscope glass lens

        // Conning Tower Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-11, -21, 20, 10, 3);
        ctx.fill();

        ctx.fillStyle = hullDark;
        ctx.beginPath();
        ctx.roundRect(-9, -19, 16, 8, 2);
        ctx.fill();

        ctx.fillStyle = hullColor;
        ctx.fillRect(-8, -19, 12, 5);

        // Tower top hatch ring
        ctx.fillStyle = trimColor;
        ctx.fillRect(-7, -21, 12, 2);

        // =========================================
        // 4. MAIN PRESSURE HULL & KEEL
        // =========================================
        // Outer dark pixel outline
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(-27, -15, 54, 30, 14);
        ctx.fill();

        // Shaded lower hull
        ctx.fillStyle = hullDark;
        ctx.beginPath();
        ctx.roundRect(-25, -13, 50, 26, 12);
        ctx.fill();

        // Main mid-upper hull body
        ctx.fillStyle = hullColor;
        ctx.beginPath();
        ctx.roundRect(-25, -13, 50, 18, 11);
        ctx.fill();

        // Specular metallic highlight band along upper hull
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.roundRect(-18, -11, 34, 3, 1.5);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(-12, -11, 14, 1.5);

        // Vertical hull structural seam bands
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(-12, -13, 2, 26);
        ctx.fillRect(0, -13, 2, 26);

        // Heavy reinforced bottom keel & ballast vents
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-20, 10, 40, 5);
        ctx.fillStyle = trimColor;
        ctx.fillRect(-19, 10, 38, 3);
        ctx.fillStyle = '#090d16';
        for (let vx = -15; vx <= 12; vx += 7) {
            ctx.fillRect(vx, 11, 4, 2); // Ballast flood slots
        }

        // 3D Rivets along top and bottom seams
        for (let rx = -19; rx <= 17; rx += 6) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(rx, -8, 2, 2);
            ctx.fillRect(rx, 6, 2, 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(rx, -9, 1, 1);
        }

        // Rear auxiliary porthole window
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-18, -1, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.beginPath();
        ctx.arc(-18, -1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = domeColor;
        ctx.beginPath();
        ctx.arc(-18, -1, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-19, -2, 1.5, 1.5);

        // =========================================
        // 5. PANORAMIC OBSERVATION DOME & EXPLORER CAPTAIN
        // =========================================
        // Outer brass bolt flange
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(10, -1, 10.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = trimColor;
        ctx.beginPath();
        ctx.arc(10, -1, 9.2, 0, Math.PI * 2);
        ctx.fill();

        // Dome bolts
        ctx.fillStyle = '#fef08a';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            ctx.fillRect(
                Math.round(10 + Math.cos(a) * 8.2) - 0.5,
                Math.round(-1 + Math.sin(a) * 8.2) - 0.5,
                1.5,
                1.5
            );
        }

        // Interior cabin backdrop
        const domeGrad = ctx.createRadialGradient(8, -3, 1, 10, -1, 8);
        domeGrad.addColorStop(0, '#bae6fd');
        domeGrad.addColorStop(0.55, domeColor);
        domeGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(10, -1, 7.6, 0, Math.PI * 2);
        ctx.fill();

        // Explorer Captain inside the cockpit!
        ctx.save();
        ctx.beginPath();
        ctx.arc(10, -1, 7.4, 0, Math.PI * 2);
        ctx.clip();

        // Shoulders / Diving suit
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(5, 2, 9, 6);
        ctx.fillStyle = '#f97316'; // Orange life-vest / diving collar
        ctx.fillRect(6, 2, 7, 2);

        // Explorer Head
        ctx.fillStyle = '#fed7aa'; // Skin tone
        ctx.fillRect(7, -4, 6, 6);

        // Captain's Cap / Diving Goggles on forehead
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, -6, 8, 2.5);
        ctx.fillStyle = '#facc15'; // Gold cap badge
        ctx.fillRect(10, -6, 2, 1.5);

        // Expressive Eyes (looking forward)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, -2, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11.5, -2, 1, 1);

        // Curved glass specular glare
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(7, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(5, -2, 1.5, 3);
        ctx.restore();

        // =========================================
        // 6. BOW FLOODLIGHT & SALVAGE MANIPULATOR CLAW
        // =========================================
        // Mechanical Salvage Arm under the bow
        ctx.fillStyle = '#334155';
        ctx.fillRect(14, 9, 8, 3);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(20, 8, 5, 4);
        // Open pincer claws
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(25, 7);
        ctx.lineTo(30, 5);
        ctx.lineTo(29, 9);
        ctx.moveTo(25, 11);
        ctx.lineTo(30, 13);
        ctx.lineTo(29, 9);
        ctx.fill();

        // Forward Bow Searchlight Housing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(21, -9, 7, 7);
        ctx.fillStyle = trimColor;
        ctx.fillRect(22, -8, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(26, -8, 2.5, 5);
        // Glowing lens bulb
        ctx.fillStyle = light?.inner || '#fef08a';
        ctx.beginPath();
        ctx.arc(28, -5.5, 3, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Volumetric Dual-Beam Headlight Cone with Floating Dust Motes
     */
    drawHeadlightBeam(ctx, x, y, facing, pitch, light = null) {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);
        ctx.rotate(pitch);

        const inner = light?.inner || 'rgba(254, 240, 138, 0.55)';
        const mid = light?.mid || 'rgba(253, 224, 71, 0.24)';
        const outer = light?.outer || 'rgba(56, 189, 248, 0.06)';

        // Main wide floodbeam
        const beamGrad = ctx.createRadialGradient(26, -4, 4, 210, 0, 240);
        beamGrad.addColorStop(0, inner);
        beamGrad.addColorStop(0.32, mid);
        beamGrad.addColorStop(0.72, outer);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(26, -6);
        ctx.lineTo(275, -78);
        ctx.lineTo(275, 78);
        ctx.lineTo(26, -2);
        ctx.closePath();
        ctx.fill();

        // Inner focused spotlight core
        const coreGrad = ctx.createLinearGradient(26, -5, 190, 0);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        coreGrad.addColorStop(0.5, mid);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.moveTo(27, -6);
        ctx.lineTo(195, -26);
        ctx.lineTo(195, 22);
        ctx.lineTo(27, -4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw Shipwreck Variations:
     * - 'pirate': The Cursed Pirate Galleon ("The Black Barnacle")
     * - 'titanic': The Sunken R.M.S. Titanic
     * - 'plane': Downed WWII B-17 Flying Fortress Bomber
     */
    drawShipwreck(ctx, x, y, progress = 0, shipType = 'pirate') {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));

        if (shipType === 'titanic') {
            this.drawTitanicShipwreck(ctx, progress);
        } else if (shipType === 'plane') {
            this.drawPlaneShipwreck(ctx, progress);
        } else {
            this.drawPirateShipwreck(ctx, progress);
        }

        ctx.restore();
    }

    /**
     * 1. The Cursed Pirate Galleon ("The Black Barnacle")
     */
    drawPirateShipwreck(ctx, progress) {
        const now = Date.now();

        // --- Background Foremast & Rigging Shrouds ---
        ctx.strokeStyle = 'rgba(30, 20, 15, 0.7)';
        ctx.lineWidth = 1.5;
        for (let r = -35; r <= 15; r += 10) {
            ctx.beginPath();
            ctx.moveTo(-12, -155);
            ctx.lineTo(r, -25);
            ctx.stroke();
        }

        // Main Timber Mast & Foremast
        ctx.fillStyle = '#1c1311';
        ctx.fillRect(-18, -175, 14, 155); // Main mast
        ctx.fillStyle = '#2e1f1b';
        ctx.fillRect(-15, -175, 6, 155); // Mast highlight

        // Crow's Nest Basket on Main Mast
        ctx.fillStyle = '#1c1311';
        ctx.fillRect(-26, -152, 30, 12);
        ctx.fillStyle = '#432d27';
        ctx.fillRect(-24, -150, 26, 8);

        // Broken Foremast (tilted forward)
        ctx.save();
        ctx.translate(-95, -25);
        ctx.rotate(-0.22);
        ctx.fillStyle = '#1c1311';
        ctx.fillRect(-5, -110, 10, 110);
        ctx.fillStyle = '#2e1f1b';
        ctx.fillRect(-3, -110, 4, 110);
        ctx.fillRect(-38, -80, 76, 6); // Fore yardarm
        ctx.restore();

        // Main Yardarm Spar
        ctx.fillStyle = '#1c1311';
        ctx.fillRect(-72, -122, 125, 8);
        ctx.fillStyle = '#432d27';
        ctx.fillRect(-70, -120, 121, 4);

        // Billowing Tattered Sails with Jolly Roger
        const sailSway = Math.sin(now / 800) * 4;
        ctx.fillStyle = '#332d29'; // Shadow sail layer
        ctx.beginPath();
        ctx.moveTo(-66, -114);
        ctx.quadraticCurveTo(-10, -96, 46, -114);
        ctx.lineTo(42 + sailSway, -52);
        ctx.lineTo(18 + sailSway, -68);
        ctx.lineTo(-5 + sailSway, -48);
        ctx.lineTo(-32 + sailSway, -66);
        ctx.lineTo(-60 + sailSway, -50);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#57534e'; // Weathered canvas
        ctx.beginPath();
        ctx.moveTo(-62, -114);
        ctx.quadraticCurveTo(-10, -98, 42, -114);
        ctx.lineTo(38 + sailSway, -56);
        ctx.lineTo(16 + sailSway, -70);
        ctx.lineTo(-5 + sailSway, -52);
        ctx.lineTo(-30 + sailSway, -68);
        ctx.lineTo(-56 + sailSway, -54);
        ctx.closePath();
        ctx.fill();

        // Pixel-Art Jolly Roger Skull & Crossbones on Main Sail
        ctx.save();
        ctx.translate(-10 + sailSway * 0.5, -84);
        // Crossed bones
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, -10);
        ctx.lineTo(16, 12);
        ctx.moveTo(16, -10);
        ctx.lineTo(-16, 12);
        ctx.stroke();
        // Skull cranium
        ctx.fillStyle = '#e7e5e4';
        ctx.beginPath();
        ctx.arc(0, -3, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-5, 3, 10, 6); // Jaw
        // Eye sockets & nose
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-5, -5, 3.5, 3.5);
        ctx.fillRect(1.5, -5, 3.5, 3.5);
        ctx.fillRect(-1, -1, 2, 3);
        // Teeth lines
        ctx.fillRect(-3, 5, 1, 3);
        ctx.fillRect(0, 5, 1, 3);
        ctx.fillRect(3, 5, 1, 3);
        ctx.restore();

        // --- Bowsprit & Carved Golden Figurehead at Left Bow ---
        ctx.save();
        ctx.translate(-135, -32);
        ctx.rotate(-0.35);
        ctx.fillStyle = '#1c1311';
        ctx.fillRect(-65, -4, 70, 8);
        ctx.fillStyle = '#432d27';
        ctx.fillRect(-63, -2, 66, 4);
        ctx.restore();

        // Golden Figurehead under bowsprit
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(-132, -32);
        ctx.lineTo(-154, -40);
        ctx.lineTo(-148, -22);
        ctx.lineTo(-125, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-150, -37, 8, 5); // Figurehead crown/head

        // --- Main Galleon Wooden Hull ---
        // Dark outer silhouette
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(-162, 82);
        ctx.lineTo(-136, -38);
        ctx.lineTo(-70, -28);
        ctx.lineTo(55, -24);
        ctx.lineTo(78, -62); // High Stern Castle step
        ctx.lineTo(164, -76); // Poop deck stern
        ctx.lineTo(176, 82);
        ctx.closePath();
        ctx.fill();

        // Base timber hull body
        const hullGrad = ctx.createLinearGradient(0, -70, 0, 80);
        hullGrad.addColorStop(0, '#4a3525');
        hullGrad.addColorStop(0.5, '#362419');
        hullGrad.addColorStop(1, '#1c120c');
        ctx.fillStyle = hullGrad;
        ctx.beginPath();
        ctx.moveTo(-156, 78);
        ctx.lineTo(-132, -34);
        ctx.lineTo(-70, -24);
        ctx.lineTo(58, -20);
        ctx.lineTo(80, -58);
        ctx.lineTo(160, -71);
        ctx.lineTo(170, 78);
        ctx.closePath();
        ctx.fill();

        // Ornate Gold Trim Railings along Gunwale & Stern Castle
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-132, -34, 65, 5);
        ctx.fillRect(-67, -25, 126, 5);
        ctx.fillRect(80, -64, 82, 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-130, -33, 62, 2);
        ctx.fillRect(82, -63, 78, 2);

        // Horizontal Hull Planking Seams & Nails
        ctx.strokeStyle = '#170f0a';
        ctx.lineWidth = 2;
        for (let py = -12; py <= 68; py += 12) {
            ctx.beginPath();
            ctx.moveTo(-142 + py * 0.2, py);
            ctx.lineTo(166, py);
            ctx.stroke();
        }

        // Jagged Hull Breach Hole (mid-ship) showing dark interior ribs
        ctx.fillStyle = '#090605';
        ctx.beginPath();
        ctx.moveTo(-55, 10);
        ctx.lineTo(-32, 4);
        ctx.lineTo(-22, 22);
        ctx.lineTo(-30, 42);
        ctx.lineTo(-60, 36);
        ctx.closePath();
        ctx.fill();
        // Exposed wooden ship ribs inside breach
        ctx.fillStyle = '#291a12';
        for (let rx = -50; rx <= -30; rx += 8) {
            ctx.fillRect(rx, 6, 3, 34);
        }

        // Row of Open Gunports with Iron Cannons
        for (let gx = -112; gx <= 32; gx += 36) {
            // Gunport recess
            ctx.fillStyle = '#090605';
            ctx.fillRect(gx, -10, 14, 12);
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(gx, -10, 14, 12);

            // Protruding iron cannon barrel
            ctx.fillStyle = '#334155';
            ctx.fillRect(gx - 4, -6, 12, 6);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(gx - 4, -6, 12, 2);
            ctx.fillStyle = '#020617';
            ctx.fillRect(gx - 5, -5, 2, 4); // Muzzle
        }

        // Eerie Glowing Stern Castle Gallery Windows
        for (let wx = 95; wx <= 145; wx += 18) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(wx, -52, 12, 18);
            const winGlow = 0.65 + Math.sin(now / 500 + wx) * 0.2;
            ctx.fillStyle = `rgba(52, 211, 153, ${winGlow})`;
            ctx.fillRect(wx + 2, -50, 8, 14);
            // Mullion crossbars
            ctx.fillStyle = '#1c1311';
            ctx.fillRect(wx + 5, -50, 2, 14);
            ctx.fillRect(wx + 2, -44, 8, 2);
        }

        // Spilled Gold Coins & Treasure on the Seabed around the Hull
        ctx.fillStyle = '#eab308';
        for (let tx = 40; tx <= 130; tx += 9) {
            const moundH = Math.sin(tx) * 4 + 6;
            ctx.beginPath();
            ctx.arc(tx, 76, moundH, Math.PI, 0);
            ctx.fill();
        }
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(55, 72, 4, 3);
        ctx.fillRect(82, 71, 5, 3);
        ctx.fillRect(108, 73, 4, 3);

        // Foreground Swaying Sea Kelp Fronds
        const sway = Math.sin(now / 650) * 7;
        for (let kx = -140; kx <= 150; kx += 42) {
            ctx.strokeStyle = '#065f46';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(kx, 80);
            ctx.quadraticCurveTo(kx + sway, 38, kx - sway * 0.6, -5);
            ctx.stroke();

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(kx + 1, 80);
            ctx.quadraticCurveTo(kx + sway + 1, 38, kx - sway * 0.6 + 1, -5);
            ctx.stroke();
        }

        // Glowing Captain's Vault Chamber
        this.drawVaultAirlock(ctx, 85, -20, 'chest', progress, 'CURSED CHEST');
    }

    /**
     * 2. The Sunken R.M.S. Titanic
     */
    drawTitanicShipwreck(ctx, progress) {
        const now = Date.now();

        // --- Iconic Fallen & Tilted White Star Line Funnels ---
        // Funnel 1 (Tilted forward with escaping bubble plume)
        ctx.save();
        ctx.translate(-45, -62);
        ctx.rotate(0.28);
        // Funnel casing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-18, -82, 36, 82);
        ctx.fillStyle = '#d97706'; // White Star Buff Ochre
        ctx.fillRect(-16, -60, 32, 60);
        ctx.fillStyle = '#f59e0b'; // Highlight side
        ctx.fillRect(-14, -60, 10, 60);
        ctx.fillStyle = '#090d16'; // Black top collar
        ctx.fillRect(-16, -80, 32, 22);
        // Steam whistle pipe
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-19, -72, 3, 55);
        ctx.restore();

        // Funnel 2 (Collapsed into the seabed on the right)
        ctx.save();
        ctx.translate(60, 35);
        ctx.rotate(-1.18);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-15, -58, 30, 65);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-13, -40, 26, 46);
        ctx.fillStyle = '#020617';
        ctx.fillRect(-13, -56, 26, 18);
        ctx.restore();

        // --- White Promenade & Bridge Superstructure ---
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-102, -68, 194, 42);
        // A-Deck & B-Deck white steel walls
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-100, -66, 190, 18);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-100, -46, 190, 18);
        // Deck divider molding
        ctx.fillStyle = '#475569';
        ctx.fillRect(-102, -48, 194, 3);

        // Promenade Deck Windows
        for (let wx = -92; wx <= 80; wx += 12) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(wx, -62, 7, 10);
            ctx.fillRect(wx, -42, 7, 10);
            if (wx % 24 === 0) {
                ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
                ctx.fillRect(wx + 1, -61, 5, 8);
            }
        }

        // Curved White Lifeboat Davits along top deck
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        for (let dx = -85; dx <= 65; dx += 50) {
            ctx.beginPath();
            ctx.moveTo(dx, -66);
            ctx.lineTo(dx, -80);
            ctx.arc(dx - 6, -80, 6, 0, Math.PI, true);
            ctx.stroke();
        }

        // --- Massive Riveted Steel Hull ---
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(-186, 82);
        ctx.lineTo(-156, -32);
        ctx.lineTo(148, -32);
        // Jagged torn steel stern break!
        ctx.lineTo(165, -48);
        ctx.lineTo(155, -15);
        ctx.lineTo(178, 10);
        ctx.lineTo(162, 42);
        ctx.lineTo(188, 82);
        ctx.closePath();
        ctx.fill();

        // Upper Black Steel Hull Plates
        const steelGrad = ctx.createLinearGradient(0, -30, 0, 35);
        steelGrad.addColorStop(0, '#1e293b');
        steelGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = steelGrad;
        ctx.beginPath();
        ctx.moveTo(-172, 34);
        ctx.lineTo(-152, -28);
        ctx.lineTo(152, -28);
        ctx.lineTo(172, 34);
        ctx.closePath();
        ctx.fill();

        // Iconic White Star Gold/White Sheer Stripe
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-153, -24, 305, 3);

        // Lower Oxide-Red Anti-Fouling Keel
        const keelGrad = ctx.createLinearGradient(0, 34, 0, 80);
        keelGrad.addColorStop(0, '#991b1b');
        keelGrad.addColorStop(1, '#450a0a');
        ctx.fillStyle = keelGrad;
        ctx.fillRect(-180, 34, 358, 45);

        // Vertical Steel Plate Seams & Rusticles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        for (let sx = -140; sx <= 140; sx += 28) {
            ctx.fillRect(sx, -28, 2, 106);
            // Hanging orange-brown rusticles
            ctx.fillStyle = 'rgba(180, 83, 9, 0.65)';
            ctx.beginPath();
            ctx.moveTo(sx - 3, -22);
            ctx.lineTo(sx + 1, 15 + (Math.abs(sx) % 20));
            ctx.lineTo(sx + 5, -22);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        }

        // Illuminated Porthole Rows (D-Deck & E-Deck)
        for (let px = -136; px <= 134; px += 18) {
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.arc(px, -10, 4, 0, Math.PI * 2);
            ctx.arc(px, 8, 4, 0, Math.PI * 2);
            ctx.fill();

            const flicker = 0.6 + Math.sin(now / 400 + px) * 0.25;
            ctx.fillStyle = `rgba(254, 240, 138, ${flicker})`;
            ctx.beginPath();
            ctx.arc(px, -10, 2.5, 0, Math.PI * 2);
            ctx.arc(px, 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Heavy Bower Anchor & Stud-Link Chain at Bow
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(-148, -14);
        ctx.lineTo(-172, 68);
        ctx.stroke();
        ctx.setLineDash([]);

        // Purser's Office Heavy Safe Vault
        this.drawVaultAirlock(ctx, 85, -20, 'safe', progress, "PURSER'S SAFE");
    }

    /**
     * 3. Downed WWII B-17 Flying Fortress Bomber
     */
    drawPlaneShipwreck(ctx, progress) {
        // --- High Vertical Tail Fin (Empannage) at Rear Right ---
        ctx.fillStyle = '#052e16';
        ctx.beginPath();
        ctx.moveTo(105, 8);
        ctx.lineTo(148, -75);
        ctx.lineTo(175, -75);
        ctx.lineTo(172, 35);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#166534'; // Olive drab tail fin
        ctx.beginPath();
        ctx.moveTo(110, 8);
        ctx.lineTo(150, -71);
        ctx.lineTo(171, -71);
        ctx.lineTo(168, 32);
        ctx.closePath();
        ctx.fill();

        // Squadron Serial Number on Tail Fin ("42-319")
        ctx.fillStyle = '#facc15';
        ctx.fillRect(148, -58, 18, 4);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(152, -58, 2, 4);
        ctx.fillRect(158, -58, 2, 4);

        // --- Swept Main Wing & Twin Radial Engines ---
        ctx.fillStyle = '#052e16';
        ctx.beginPath();
        ctx.moveTo(-88, 5);
        ctx.lineTo(-36, -104);
        ctx.lineTo(44, -96);
        ctx.lineTo(36, 15);
        ctx.closePath();
        ctx.fill();

        const wingGrad = ctx.createLinearGradient(-30, -100, 10, 10);
        wingGrad.addColorStop(0, '#15803d');
        wingGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(-82, 4);
        ctx.lineTo(-33, -99);
        ctx.lineTo(40, -92);
        ctx.lineTo(32, 12);
        ctx.closePath();
        ctx.fill();

        // Wing Panel Ribs & Aileron Seams
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-55, -45);
        ctx.lineTo(35, -38);
        ctx.moveTo(-12, -96);
        ctx.lineTo(-28, 5);
        ctx.moveTo(14, -93);
        ctx.lineTo(4, 8);
        ctx.stroke();

        // Radial Engine Nacelles (#1 & #2 on wing)
        const drawEngine = (ex, ey) => {
            ctx.save();
            ctx.translate(ex, ey);
            // Engine cowling
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.roundRect(-14, -10, 28, 22, 5);
            ctx.fill();
            // Radial cylinder fins
            ctx.fillStyle = '#475569';
            ctx.fillRect(-11, -8, 22, 6);
            // Red engine cowl band
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-13, -3, 26, 3);
            // Bent 3-Blade Hamilton Standard Propeller
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-22, -28);
            ctx.moveTo(0, -10);
            ctx.lineTo(24, -22);
            ctx.moveTo(0, -10);
            ctx.lineTo(4, -34);
            ctx.stroke();
            // Yellow propeller safety tips
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-23, -29, 4, 4);
            ctx.fillRect(22, -24, 4, 4);
            // Chrome spinner hub
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(0, -10, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        drawEngine(-16, -98);
        drawEngine(22, -92);

        // USAF Star-and-Bars Insignia on Main Wing
        ctx.save();
        ctx.translate(-6, -48);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-22, -5, 44, 10);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-22, -5, 44, 10);
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        // 5-Point White Star
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
        ctx.restore();

        // --- Main Bomber Fuselage ---
        ctx.fillStyle = '#052e16';
        ctx.beginPath();
        ctx.moveTo(-172, 74);
        ctx.lineTo(-162, 5); // B-17 nose cone
        ctx.lineTo(-132, -20); // Pilot cockpit roof
        ctx.lineTo(-40, -26);
        ctx.lineTo(165, 22);
        ctx.lineTo(174, 80);
        ctx.closePath();
        ctx.fill();

        // Olive Drab Upper Fuselage
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(-166, 48);
        ctx.lineTo(-158, 8);
        ctx.lineTo(-130, -16);
        ctx.lineTo(-40, -22);
        ctx.lineTo(162, 25);
        ctx.lineTo(168, 55);
        ctx.closePath();
        ctx.fill();

        // Neutral Grey Underbelly
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(-168, 76);
        ctx.lineTo(-165, 44);
        ctx.lineTo(166, 52);
        ctx.lineTo(170, 78);
        ctx.closePath();
        ctx.fill();

        // Dorsal Bendix Top Gun Turret Dome & Twin .50-Cal Barrels
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-68, -22, 11, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Twin turret machine guns
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-62, -31, 18, 3);

        // Framed Plexiglass Bombardier Nose Cone & Pilot Cockpit
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-158, 10);
        ctx.lineTo(-130, -16);
        ctx.lineTo(-92, -18);
        ctx.lineTo(-98, 6);
        ctx.closePath();
        ctx.fill();

        // Cockpit glass reflections & framing bars
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(-130, -12, 14, 6);
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 2;
        for (let cx = -145; cx <= -100; cx += 14) {
            ctx.beginPath();
            ctx.moveTo(cx, -16);
            ctx.lineTo(cx - 6, 10);
            ctx.stroke();
        }

        // Riveted Fuselage Formers & Waist Gunner Window
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.5;
        for (let fx = -110; fx <= 135; fx += 28) {
            ctx.beginPath();
            ctx.moveTo(fx, -18 + fx * 0.14);
            ctx.lineTo(fx - 12, 74);
            ctx.stroke();
        }

        // Yellow Nose Art / Squadron Band near Cockpit
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-85, -18, 8, 62);

        // Armored Flight Recorder Vault Chamber
        this.drawVaultAirlock(ctx, 85, -15, 'military', progress, 'FLIGHT VAULT');
    }

    /**
     * Draw Glowing Salvage Vault Chamber & Relic Container
     */
    drawVaultAirlock(ctx, x, y, style, progress, label) {
        const now = Date.now();
        const glowPulse = 0.55 + Math.sin(now / 350) * 0.25;

        // Outer golden volumetric aura
        const goldGlow = ctx.createRadialGradient(x, y, 4, x, y, 62);
        goldGlow.addColorStop(0, `rgba(254, 240, 138, ${glowPulse})`);
        goldGlow.addColorStop(0.45, `rgba(234, 179, 8, ${glowPulse * 0.6})`);
        goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = goldGlow;
        ctx.beginPath();
        ctx.arc(x, y, 62, 0, Math.PI * 2);
        ctx.fill();

        // Vault Archway Frame
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(x - 24, y - 28, 48, 54, 6);
        ctx.fill();

        ctx.strokeStyle = progress >= 1 ? '#22c55e' : '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 22, y - 26, 44, 50);

        if (style === 'safe') {
            // Titanic Purser's Heavy Steel Bank Vault
            ctx.fillStyle = '#334155';
            ctx.fillRect(x - 16, y - 18, 32, 36);
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(x, y, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 4-Spoke Vault Wheel Handle
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            const wheelAngle = progress >= 1 ? 1.2 : 0;
            for (let a = 0; a < Math.PI; a += Math.PI / 2) {
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(a + wheelAngle) * -8, y + Math.sin(a + wheelAngle) * -8);
                ctx.lineTo(x + Math.cos(a + wheelAngle) * 8, y + Math.sin(a + wheelAngle) * 8);
                ctx.stroke();
            }
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (style === 'military') {
            // B-17 Armored Black-Box / Flight Recorder Lockbox
            ctx.fillStyle = '#365314';
            ctx.fillRect(x - 16, y - 14, 32, 28);
            // High-visibility orange/yellow hazard stripes
            ctx.fillStyle = '#f97316';
            ctx.fillRect(x - 14, y - 12, 28, 6);
            ctx.fillStyle = '#facc15';
            ctx.fillRect(x - 14, y + 6, 28, 4);
            // Digital keypad & blinking transponder light
            ctx.fillStyle = '#090d16';
            ctx.fillRect(x - 8, y - 4, 16, 8);
            ctx.fillStyle = Math.sin(now / 180) > 0 ? '#22c55e' : '#ef4444';
            ctx.fillRect(x + 3, y - 2, 3, 4);
        } else {
            // Pirate Ornate Gold-Banded Cursed Chest
            // Chest base
            ctx.fillStyle = '#78350f';
            ctx.fillRect(x - 16, y - 8, 32, 20);
            // Arched chest lid
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.roundRect(x - 16, y - 15, 32, 10, 4);
            ctx.fill();
            // Gold straps & rivets
            ctx.fillStyle = '#facc15';
            ctx.fillRect(x - 16, y - 7, 32, 3);
            ctx.fillRect(x - 12, y - 15, 4, 27);
            ctx.fillRect(x + 8, y - 15, 4, 27);
            // Center ruby/gold lock plate
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x - 4, y - 9, 8, 9);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(x - 2, y - 7, 4, 5);
        }

        // Floating HUD Docking Beacon if not yet looted
        if (progress < 1) {
            const bob = Math.sin(now / 220) * 4;
            const by = y - 48 + bob;

            // Pill background for crisp readability
            ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(x - 68, by - 11, 136, 18, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`▼ DOCK: ${label} ▼`, x, by - 1);
        }
    }

    /**
     * Draw Hydrothermal Oxygen Vent / Volcanic Bubble Geyser
     */
    drawOxygenVent(ctx, vent) {
        const now = Date.now();
        ctx.save();
        ctx.translate(Math.round(vent.x), Math.round(vent.y));

        //Rising Shimmering Oxygen Column Aura
        const colGrad = ctx.createLinearGradient(0, 15, 0, -65);
        colGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        colGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)');
        colGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = colGrad;
        ctx.beginPath();
        ctx.moveTo(-18, 15);
        ctx.lineTo(-28, -65);
        ctx.lineTo(28, -65);
        ctx.lineTo(18, 15);
        ctx.closePath();
        ctx.fill();

        // Craggy Volcanic Chimney Cone
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(-36, 32);
        ctx.lineTo(-26, 4);
        ctx.lineTo(-16, -4);
        ctx.lineTo(16, -4);
        ctx.lineTo(26, 4);
        ctx.lineTo(36, 32);
        ctx.closePath();
        ctx.fill();

        // Basalt rock ridges
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-32, 30);
        ctx.lineTo(-22, 4);
        ctx.lineTo(-14, -2);
        ctx.lineTo(14, -2);
        ctx.lineTo(22, 4);
        ctx.lineTo(32, 30);
        ctx.closePath();
        ctx.fill();

        // Glowing Cyan/Emerald Mineral Fissures on Chimney
        const ventPulse = 0.65 + Math.sin(now / 260) * 0.35;
        ctx.strokeStyle = `rgba(56, 189, 248, ${ventPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 2);
        ctx.lineTo(-18, 22);
        ctx.moveTo(0, 2);
        ctx.lineTo(3, 26);
        ctx.moveTo(12, 2);
        ctx.lineTo(18, 20);
        ctx.stroke();

        // Glowing Crater Rim
        const vGlow = ctx.createRadialGradient(0, -2, 2, 0, -2, 28);
        vGlow.addColorStop(0, '#ffffff');
        vGlow.addColorStop(0.4, `rgba(56, 189, 248, ${ventPulse})`);
        vGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = vGlow;
        ctx.beginPath();
        ctx.ellipse(0, -2, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated rising mini-bubbles inside the plume
        ctx.fillStyle = '#e0f2fe';
        for (let b = 0; b < 4; b++) {
            const by = -((now / 18 + b * 16) % 55);
            const bx = Math.sin(now / 200 + b * 2) * 10;
            ctx.beginPath();
            ctx.arc(bx, by, 2 + (b % 2), 0, Math.PI * 2);
            ctx.fill();
        }

        // Crisp Label Badge
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-34, 32, 68, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#7dd3fc';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🫧 O₂ VENT', 0, 39);

        ctx.restore();
    }

    /**
     * Draw the Sea Monster (The Abyssal Leviathan — 16-Bit Boss Serpent)
     */
    drawMonster(ctx, monster) {
        if (!monster || !monster.active) return;

        const { x, y, segments = [], jawAngle = 0, facing = 1, rageMode = false, stunTimer = 0 } = monster;
        const now = Date.now();
        const isStunned = stunTimer > 0;

        // =========================================
        // 1. ARTICULATED SERPENTINE BODY & TAIL FLUKE
        // =========================================
        for (let i = segments.length - 1; i >= 0; i--) {
            const seg = segments[i];
            const prev = i > 0 ? segments[i - 1] : { x, y };
            const segAngle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
            const size = 32 * (1 - i / (segments.length * 1.45));

            ctx.save();
            ctx.translate(Math.round(seg.x), Math.round(seg.y));
            ctx.rotate(segAngle);

            // Tail fin fluke on the very last segment
            if (i === segments.length - 1) {
                ctx.fillStyle = rageMode ? '#991b1b' : '#047857';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-26, -16);
                ctx.lineTo(-18, 0);
                ctx.lineTo(-26, 16);
                ctx.closePath();
                ctx.fill();
            }

            // Dorsal fin spine & webbing
            ctx.fillStyle = rageMode ? '#f87171' : '#34d399';
            ctx.beginPath();
            ctx.moveTo(-size * 0.5, -size * 0.7);
            ctx.lineTo(-size * 0.2, -size * 1.55);
            ctx.lineTo(size * 0.4, -size * 0.8);
            ctx.closePath();
            ctx.fill();

            // Outer armored scale carapace
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.arc(0, 0, size + 2, 0, Math.PI * 2);
            ctx.fill();

            const segGrad = ctx.createRadialGradient(-size * 0.2, -size * 0.3, size * 0.1, 0, 0, size);
            if (rageMode) {
                segGrad.addColorStop(0, '#dc2626');
                segGrad.addColorStop(0.7, '#7f1d1d');
                segGrad.addColorStop(1, '#450a0a');
            } else {
                segGrad.addColorStop(0, '#10b981');
                segGrad.addColorStop(0.65, '#065f46');
                segGrad.addColorStop(1, '#022c22');
            }
            ctx.fillStyle = segGrad;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();

            // Ventral belly scutes (overlapping armor plates)
            ctx.fillStyle = rageMode ? '#fca5a5' : '#6ee7b7';
            ctx.beginPath();
            ctx.arc(0, size * 0.45, size * 0.48, 0, Math.PI);
            ctx.fill();

            // Pulsing Bioluminescent Lateral Node (travels like a wave down the body)
            const bioPulse = 0.4 + Math.max(0, Math.sin(now / 180 - i * 0.7)) * 0.6;
            ctx.fillStyle = rageMode
                ? `rgba(254, 240, 138, ${bioPulse})`
                : `rgba(56, 189, 248, ${bioPulse})`;
            ctx.beginPath();
            ctx.arc(0, -size * 0.1, size * 0.24, 0, Math.PI * 2);
            ctx.fill();

            // Stunned Electric Lightning Arcs
            if (isStunned && (i + Math.floor(now / 60)) % 2 === 0) {
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size, -size * 0.5);
                ctx.lineTo(0, size * 0.8);
                ctx.lineTo(size, -size * 0.3);
                ctx.stroke();
            }

            ctx.restore();
        }

        // =========================================
        // 2. MENACING LEVIATHAN HEAD & HINGED JAWS
        // =========================================
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.scale(facing, 1);

        // Swept-Back Cranial Horns & Frill Crest
        ctx.fillStyle = rageMode ? '#450a0a' : '#022c22';
        ctx.beginPath();
        ctx.moveTo(-12, -22);
        ctx.lineTo(-56, -64);
        ctx.lineTo(-28, -16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = rageMode ? '#ef4444' : '#10b981';
        ctx.beginPath();
        ctx.moveTo(8, -24);
        ctx.lineTo(-14, -68);
        ctx.lineTo(-6, -20);
        ctx.closePath();
        ctx.fill();

        // Gullet / Open Mouth Interior Glow
        const mouthGrad = ctx.createRadialGradient(20, 4, 2, 20, 4, 34);
        mouthGrad.addColorStop(0, rageMode ? '#fef08a' : '#f43f5e');
        mouthGrad.addColorStop(1, '#4c0519');
        ctx.fillStyle = mouthGrad;
        ctx.beginPath();
        ctx.arc(16, 4, 22, -0.4, 0.8);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();

        // Forked Bioluminescent Abyssal Tongue
        const tongueFlick = Math.sin(now / 120) * 4;
        ctx.strokeStyle = rageMode ? '#fef08a' : '#fb7185';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, 5);
        ctx.quadraticCurveTo(28, 3 + tongueFlick, 46, 6 + tongueFlick);
        ctx.lineTo(54, 2 + tongueFlick);
        ctx.moveTo(46, 6 + tongueFlick);
        ctx.lineTo(54, 11 + tongueFlick);
        ctx.stroke();

        // --- Lower Hinged Jaw ---
        ctx.save();
        ctx.translate(-6, 8);
        ctx.rotate(jawAngle);

        // Lower jawbone
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(52, 6);
        ctx.lineTo(44, 22);
        ctx.lineTo(-6, 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = rageMode ? '#7f1d1d' : '#064e3b';
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(49, 7);
        ctx.lineTo(42, 19);
        ctx.lineTo(-4, 14);
        ctx.closePath();
        ctx.fill();

        // Chin spike
        ctx.fillStyle = rageMode ? '#fca5a5' : '#6ee7b7';
        ctx.beginPath();
        ctx.moveTo(32, 18);
        ctx.lineTo(40, 29);
        ctx.lineTo(44, 17);
        ctx.fill();

        // Lower Curved Ivory Fangs
        ctx.fillStyle = '#f8fafc';
        for (let bx = 4; bx <= 42; bx += 8) {
            const fangH = bx > 30 ? 11 : 8;
            ctx.beginPath();
            ctx.moveTo(bx, 4);
            ctx.lineTo(bx + 2, 4 - fangH);
            ctx.lineTo(bx + 6, 5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // --- Upper Skull & Snout ---
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.ellipse(6, -12, 47, 29, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(54, 4);
        ctx.lineTo(-38, 4);
        ctx.closePath();
        ctx.fill();

        const headGrad = ctx.createLinearGradient(0, -38, 0, 6);
        if (rageMode) {
            headGrad.addColorStop(0, '#dc2626');
            headGrad.addColorStop(1, '#7f1d1d');
        } else {
            headGrad.addColorStop(0, '#059669');
            headGrad.addColorStop(1, '#064e3b');
        }
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(6, -12, 44, 26, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(51, 3);
        ctx.lineTo(-35, 3);
        ctx.closePath();
        ctx.fill();

        // Upper Razor Fangs
        ctx.fillStyle = '#f8fafc';
        for (let tx = 2; tx <= 46; tx += 9) {
            const fangLen = tx > 32 ? 13 : 9;
            ctx.beginPath();
            ctx.moveTo(tx, 3);
            ctx.lineTo(tx + 3, 3 + fangLen);
            ctx.lineTo(tx + 7, 3);
            ctx.closePath();
            ctx.fill();
        }

        // Glowing Gill Slits behind cheek
        ctx.fillStyle = rageMode ? '#fef08a' : '#38bdf8';
        for (let gx = -26; gx <= -14; gx += 6) {
            ctx.fillRect(gx, -14, 2, 10);
        }

        // Primary Hunter Eye & Smaller Secondary Eye
        // Eye socket
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(16, -17, 10, 0, Math.PI * 2);
        ctx.fill();

        // Glowing iris
        ctx.fillStyle = isStunned ? '#93c5fd' : (rageMode ? '#fef08a' : '#fbbf24');
        ctx.beginPath();
        ctx.arc(16, -17, 7.5, 0, Math.PI * 2);
        ctx.fill();

        // Vertical slit pupil
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(15, -23, 3, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(15.5, -21, 2, 8);

        // Specular eye glint
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(18, -21, 2.5, 2.5);

        // Secondary smaller forward eye
        ctx.fillStyle = rageMode ? '#fef08a' : '#34d399';
        ctx.beginPath();
        ctx.arc(32, -12, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.fillRect(31.5, -14, 1.5, 4);

        // Armored Brow Ridge above Eye
        ctx.fillStyle = rageMode ? '#991b1b' : '#047857';
        ctx.beginPath();
        ctx.moveTo(4, -23);
        ctx.lineTo(18, -28);
        ctx.lineTo(28, -20);
        ctx.lineTo(6, -19);
        ctx.closePath();
        ctx.fill();

        // Sonic Roar Shockwaves when Raging
        if (rageMode) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 3;
            const waveR = 25 + ((now / 15) % 35);
            ctx.beginPath();
            ctx.arc(48, 2, waveR, -Math.PI / 2.8, Math.PI / 2.8);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw Swimming Marine Life (Clownfish, Blue Tang, Butterflyfish, Jellyfish, Anglerfish)
     */
    drawFish(ctx, fish) {
        ctx.save();
        ctx.translate(Math.round(fish.x), Math.round(fish.y));
        ctx.scale(fish.facing, 1);

        if (fish.type === 'jelly') {
            // =========================================
            // BIOLUMINESCENT DEEP-SEA JELLYFISH
            // =========================================
            const pulse = Math.sin(fish.animTimer * 1.4) * 0.18 + 1;

            // Trailing sinuous tentacles with glowing nematocyst nodes
            for (let ti = -9; ti <= 9; ti += 3) {
                const wave1 = Math.sin(fish.animTimer * 2.2 + ti) * 5;
                const wave2 = Math.cos(fish.animTimer * 1.8 + ti) * 6;
                ctx.strokeStyle = ti % 6 === 0 ? 'rgba(244, 114, 182, 0.7)' : 'rgba(192, 132, 252, 0.55)';
                ctx.lineWidth = ti % 6 === 0 ? 2 : 1.2;
                ctx.beginPath();
                ctx.moveTo(ti, 0);
                ctx.quadraticCurveTo(ti + wave1, 13, ti + wave2, 27);
                ctx.stroke();

                // Glowing stinging bead
                ctx.fillStyle = '#f9a8d4';
                ctx.fillRect(ti + wave2 - 1, 25, 2, 2);
            }

            // Outer Bell Umbrella Aura
            const bellGrad = ctx.createRadialGradient(0, -6, 2, 0, -2, 16 * pulse);
            bellGrad.addColorStop(0, '#fdf4ff');
            bellGrad.addColorStop(0.45, 'rgba(232, 121, 249, 0.85)');
            bellGrad.addColorStop(0.85, 'rgba(147, 51, 234, 0.7)');
            bellGrad.addColorStop(1, 'rgba(88, 28, 135, 0.2)');

            ctx.fillStyle = bellGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 15 * pulse, Math.PI, 0);
            // Scalloped bottom margin of the bell
            for (let sx = 15 * pulse; sx >= -15 * pulse; sx -= 6 * pulse) {
                ctx.quadraticCurveTo(sx - 3 * pulse, 3, sx - 6 * pulse, 0);
            }
            ctx.closePath();
            ctx.fill();

            // Glowing radial canals inside bell
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            for (let a = Math.PI + 0.5; a < Math.PI * 2 - 0.5; a += 0.55) {
                ctx.beginPath();
                ctx.moveTo(0, -10 * pulse);
                ctx.lineTo(Math.cos(a) * 13 * pulse, Math.sin(a) * 13 * pulse);
                ctx.stroke();
            }
        } else if (fish.type === 'angler') {
            // =========================================
            // ABYSSAL ANGLERFISH PREDATOR
            // =========================================
            const tailSwing = Math.sin(fish.animTimer * 3) * 3;

            // Spiny Caudal Tail Fin
            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-28, -11 + tailSwing);
            ctx.lineTo(-23, tailSwing * 0.5);
            ctx.lineTo(-28, 11 + tailSwing);
            ctx.closePath();
            ctx.fill();

            // Dorsal spines
            ctx.fillStyle = '#4338ca';
            ctx.beginPath();
            ctx.moveTo(-10, -11);
            ctx.lineTo(-15, -19);
            ctx.lineTo(-3, -12);
            ctx.fill();

            // Main gnarled dark body
            const bodyGrad = ctx.createRadialGradient(2, -2, 2, 0, 0, 19);
            bodyGrad.addColorStop(0, '#312e81');
            bodyGrad.addColorStop(0.7, '#1e1b4b');
            bodyGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Arched Illicium Lure Stalk
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(8, -10);
            ctx.quadraticCurveTo(18, -26, 24, -14);
            ctx.stroke();

            // Bioluminescent Esca Lantern Bulb
            const lurePulse = 9 + Math.sin(fish.animTimer * 4) * 3;
            const lureGrad = ctx.createRadialGradient(24, -14, 1, 24, -14, lurePulse);
            lureGrad.addColorStop(0, '#ffffff');
            lureGrad.addColorStop(0.4, '#38bdf8');
            lureGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = lureGrad;
            ctx.beginPath();
            ctx.arc(24, -14, lurePulse, 0, Math.PI * 2);
            ctx.fill();

            // Milky Abyssal Eye
            ctx.fillStyle = '#e0e7ff';
            ctx.beginPath();
            ctx.arc(9, -5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#020617';
            ctx.fillRect(9.5, -6, 1.5, 2);

            // Protruding Underbite Jaw & Translucent Needle Fangs
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(2, 3);
            ctx.lineTo(20, 1);
            ctx.lineTo(17, 11);
            ctx.lineTo(2, 9);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#e2e8f0';
            for (let fx = 6; fx <= 18; fx += 3.5) {
                ctx.beginPath();
                ctx.moveTo(fx, 2);
                ctx.lineTo(fx + 1, -4);
                ctx.lineTo(fx + 2.5, 2);
                ctx.fill();
            }
        } else {
            // =========================================
            // TROPICAL CORAL REEF FISH (Striped & Finned)
            // =========================================
            const primary = fish.color || '#f97316';
            const tailWiggle = Math.sin(fish.animTimer * 5) * 3.5;

            // Forked Tail Fin
            ctx.fillStyle = primary === '#06b6d4' ? '#facc15' : primary;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-19, -8 + tailWiggle);
            ctx.lineTo(-15, tailWiggle * 0.4);
            ctx.lineTo(-19, 8 + tailWiggle);
            ctx.closePath();
            ctx.fill();

            // Dorsal & Ventral Fins
            ctx.fillStyle = primary;
            ctx.beginPath();
            ctx.moveTo(-6, -6);
            ctx.lineTo(-10, -12);
            ctx.lineTo(4, -6);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-5, 6);
            ctx.lineTo(-8, 11);
            ctx.lineTo(2, 6);
            ctx.closePath();
            ctx.fill();

            // Main Fish Body
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(0, 0, 13, 8.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = primary;
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tropical Patterning (Clownfish White Bands or Tang Stripes)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 7.5, 0, 0, Math.PI * 2);
            ctx.clip();

            if (primary === '#f97316') {
                // Clownfish white vertical bands with black trim
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(-6, -8, 5, 16);
                ctx.fillRect(3, -8, 4, 16);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-5, -8, 3, 16);
                ctx.fillRect(4, -8, 2, 16);
            } else {
                // Iridescent dorsal shimmer & stripe
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.fillRect(-10, -7, 20, 3);
                ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
                ctx.fillRect(-8, -1, 14, 2);
            }
            ctx.restore();

            // Cute Expressive Fish Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6.5, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.arc(7, -2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw Collectibles (Pirate Gold Doubloons, Twin O2 Tanks, Repair Cases, Sonic Torpedoes)
     */
    drawCollectible(ctx, item) {
        const now = Date.now();
        const bob = Math.sin(now / 300 + item.x) * 2.5;

        ctx.save();
        ctx.translate(Math.round(item.x), Math.round(item.y + bob));

        if (item.type === 'coin') {
            // =========================================
            // SPINNING GOLD PIRATE DOUBLOON
            // =========================================
            const spin = Math.cos(now / 180 + item.y * 0.05);
            const absSpin = Math.max(0.22, Math.abs(spin));

            // Subtle golden halo
            ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.scale(absSpin, 1);

            // Coin edge thickness when turned
            ctx.fillStyle = '#854d0e';
            ctx.beginPath();
            ctx.arc(spin < 0 ? 1.5 : -1.5, 0, 8.5, 0, Math.PI * 2);
            ctx.fill();

            // Outer gold rim
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
            ctx.fill();

            // Inner recessed face
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
            ctx.fill();

            // Embossed pirate cross/crown motif
            ctx.fillStyle = '#b45309';
            ctx.fillRect(-1.5, -4, 3, 8);
            ctx.fillRect(-4, -1.5, 8, 3);
            ctx.restore();

            // Twinkling 4-point starlight sparkle
            if (absSpin > 0.85) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(3, -7, 5, 1.5);
                ctx.fillRect(4.75, -8.75, 1.5, 5);
            }
        } else if (item.type === 'oxygen') {
            // =========================================
            // PRESSURIZED O2 SCUBA CYLINDER
            // =========================================
            // Cyan aura
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            // Brass valve manifold at top
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(-3, -12, 6, 4);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-6, -11, 12, 2);

            // Tank Cylinder Body
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-8, -8, 16, 18, 5);
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.roundRect(-6.5, -6.5, 13, 15, 4);
            ctx.fill();

            // Specular highlight & white shoulder band
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(-6.5, -3, 13, 7);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(-5, -6, 3, 14);

            // Crisp O2 Label
            ctx.fillStyle = '#0369a1';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('O₂', 0.5, 1);
        } else if (item.type === 'repair') {
            // =========================================
            // ARMORED SALVAGE REPAIR TOOLCASE
            // =========================================
            ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            // Top carrying handle
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.strokeRect(-4, -10, 8, 4);

            // Case body
            ctx.fillStyle = '#052e16';
            ctx.beginPath();
            ctx.roundRect(-10, -7, 20, 15, 3);
            ctx.fill();

            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.roundRect(-8.5, -5.5, 17, 12, 2);
            ctx.fill();

            // Glowing White Repair Cross Emblem
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -3.5, 4, 8);
            ctx.fillRect(-4, -1.5, 8, 4);
        } else if (item.type === 'torpedo_pickup') {
            // =========================================
            // SONIC TORPEDO AMMO CRATE / WARHEAD
            // =========================================
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();

            // Rear stabilizer fins
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.moveTo(-11, -7);
            ctx.lineTo(-6, -3);
            ctx.lineTo(-6, 3);
            ctx.lineTo(-11, 7);
            ctx.closePath();
            ctx.fill();

            // Steel torpedo body
            ctx.fillStyle = '#475569';
            ctx.fillRect(-8, -4.5, 15, 9);
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-8, -3.5, 15, 3);

            // Armed Red & Gold Warhead Nose Cone
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(7, -4.5);
            ctx.lineTo(14, 0);
            ctx.lineTo(7, 4.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#facc15';
            ctx.fillRect(4, -4.5, 3, 9);
        }

        ctx.restore();
    }
}
