/**
 * FortuneWheel - Onnenpyörän piirto ja animaatio
 */
class FortuneWheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;

        // Sektorien oletustekstit
        this.sectors = [
            'Vaihtoehto 1',
            'Vaihtoehto 2',
            'Vaihtoehto 3',
            'Vaihtoehto 4',
            'Vaihtoehto 5',
            'Vaihtoehto 6',
            'Vaihtoehto 7',
            'Vaihtoehto 8'
        ];

        // Väripaletti
        this.colors = [
            '#FF6B6B', // punainen
            '#4ECDC4', // turkoosi
            '#45B7D1', // sininen
            '#96CEB4', // vihreä
            '#FFEAA7', // keltainen
            '#DDA0DD', // violetti
            '#98D8C8', // minttu
            '#F7DC6F'  // kulta
        ];

        // Animaation tila
        this.rotation = 0;
        this.isSpinning = false;
        this.onCompleteCallback = null;

        // Piirrä alkutila
        this.draw();
    }

    /**
     * Päivittää yhden sektorin tekstin
     * @param {number} index - Sektorin indeksi (0-7)
     * @param {string} text - Uusi teksti
     */
    updateSector(index, text) {
        if (index >= 0 && index < this.sectors.length) {
            this.sectors[index] = text || `Vaihtoehto ${index + 1}`;
            this.draw();
        }
    }

    /**
     * Päivittää kaikki sektorit
     * @param {string[]} texts - Sektorien tekstit
     */
    updateAllSectors(texts) {
        texts.forEach((text, i) => {
            if (i < this.sectors.length) {
                this.sectors[i] = text || `Vaihtoehto ${i + 1}`;
            }
        });
        this.draw();
    }

    /**
     * Palauttaa sektorien tekstit
     * @returns {string[]}
     */
    getSectorTexts() {
        return [...this.sectors];
    }

    /**
     * Piirtää pyörän
     */
    draw() {
        const ctx = this.ctx;
        const numSectors = this.sectors.length;
        const sectorAngle = (2 * Math.PI) / numSectors;

        // Tyhjennä canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Piirrä jokainen sektori
        this.sectors.forEach((text, i) => {
            const startAngle = i * sectorAngle + this.rotation - Math.PI / 2;
            const endAngle = startAngle + sectorAngle;

            // Piirrä sektorin kaari
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();

            // Täytä väri
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.fill();

            // Reunaviiva
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Piirrä teksti
            this.drawSectorText(text, startAngle, sectorAngle);
        });

        // Piirrä keskipiste
        this.drawCenter();
    }

    /**
     * Piirtää sektorin tekstin
     */
    drawSectorText(text, startAngle, sectorAngle) {
        const ctx = this.ctx;
        const textAngle = startAngle + sectorAngle / 2;
        const textRadius = this.radius * 0.65;

        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(textAngle);

        // Tekstin tyyli
        ctx.fillStyle = '#2d3436';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Lyhennä pitkät tekstit
        let displayText = text;
        if (text.length > 12) {
            displayText = text.substring(0, 11) + '…';
        }

        ctx.fillText(displayText, textRadius, 0);
        ctx.restore();
    }

    /**
     * Piirtää pyörän keskipisteen
     */
    drawCenter() {
        const ctx = this.ctx;

        // Ulompi ympyrä
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#2d3436';
        ctx.fill();

        // Sisempi ympyrä
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
    }

    /**
     * Käynnistää pyöritysanimaation
     * @param {function} onComplete - Callback kun pyöritys päättyy
     */
    spin(onComplete) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.onCompleteCallback = onComplete;

        // Satunnainen pyörimismäärä: 5-10 kierrosta + satunnainen kulma
        const extraSpins = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalRotation = extraSpins * 2 * Math.PI + randomAngle;

        const duration = 4000; // 4 sekuntia
        const startTime = performance.now();
        const startRotation = this.rotation;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic hidastus
            const easeOut = 1 - Math.pow(1 - progress, 3);

            this.rotation = startRotation + totalRotation * easeOut;
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                // Normalisoi kulma välille [0, 2π]
                this.rotation = this.rotation % (2 * Math.PI);
                this.onSpinComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Kutsutaan kun pyöritys päättyy
     */
    onSpinComplete() {
        const winner = this.getWinner();
        if (this.onCompleteCallback) {
            this.onCompleteCallback(winner);
        }
    }

    /**
     * Määrittää voittajan nykyisen kulman perusteella
     * @returns {object} Voittajan tiedot {index, text}
     */
    getWinner() {
        const numSectors = this.sectors.length;
        const sectorAngle = (2 * Math.PI) / numSectors;

        // Osoitin on yläreunassa (0°), joten lasketaan mikä sektori on siellä
        // Rotation on negatiivinen suunta (myötäpäivään), joten käännetään
        let normalizedRotation = (2 * Math.PI - (this.rotation % (2 * Math.PI))) % (2 * Math.PI);

        // Lasketaan sektori-indeksi
        const winnerIndex = Math.floor(normalizedRotation / sectorAngle);

        return {
            index: winnerIndex,
            text: this.sectors[winnerIndex]
        };
    }

    /**
     * Onko pyörä pyörimässä
     * @returns {boolean}
     */
    spinning() {
        return this.isSpinning;
    }
}
