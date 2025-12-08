# Toteutussuunnitelma

## Vaihe 1: Perusrakenne

### Tehtävät

1. **Luo tiedostorakenne**
   ```
   mkdir -p css js
   touch index.html css/style.css js/wheel.js js/storage.js js/app.js
   ```

2. **HTML-pohja (index.html)**
   - DOCTYPE ja meta-tagit
   - Canvas-elementti pyörälle
   - Lomake tekstikentille
   - Pyöritä-nappi
   - Tulosnäyttö

### HTML-rakenne

```html
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Onnenpyörä</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <main class="container">
        <h1>Onnenpyörä</h1>

        <div class="wheel-container">
            <canvas id="wheel" width="400" height="400"></canvas>
            <div class="pointer"></div>
        </div>

        <div class="controls">
            <div class="inputs">
                <!-- 8 tekstikenttää -->
            </div>
            <button id="spin-btn">Pyöritä!</button>
        </div>

        <div id="result" class="result"></div>
    </main>

    <script src="js/storage.js"></script>
    <script src="js/wheel.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

## Vaihe 2: CSS-tyylitys

### Tehtävät

1. **Perustyylitys**
   - Sivun asettelu (flexbox/grid)
   - Värit ja fontit
   - Responsiivisuus

2. **Pyörän tyylitys**
   - Keskitys
   - Osoittimen muotoilu (CSS-kolmio)
   - Varjostus

3. **Lomakkeen tyylitys**
   - Syöttökenttien muotoilu
   - Napin hover/active-tilat
   - Disabled-tila

### CSS-rakenne

```css
/* Perus-reset ja fontit */
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Pääasettelu */
.container { }

/* Pyörän container ja osoitin */
.wheel-container { position: relative; }
.pointer { /* CSS-kolmio */ }

/* Lomake ja kontrollit */
.controls { }
.inputs { display: grid; }
input { }
button { }
button:disabled { }

/* Tulosnäyttö */
.result { }
.result.winner { /* Korostus */ }
```

## Vaihe 3: JavaScript - Storage-moduuli

### Tehtävät

1. **storage.js**
   ```javascript
   const Storage = {
       KEY: 'fortuneWheel',

       save(data) {
           localStorage.setItem(this.KEY, JSON.stringify(data));
       },

       load() {
           const data = localStorage.getItem(this.KEY);
           return data ? JSON.parse(data) : null;
       },

       clear() {
           localStorage.removeItem(this.KEY);
       }
   };
   ```

## Vaihe 4: JavaScript - Wheel-moduuli

### Tehtävät

1. **Pyörän luokka**
   - Constructor: canvas, asetukset, värit
   - Piirtometodi
   - Animaatiometodi

2. **Piirtoalgoritmi**
   ```javascript
   draw() {
       const sectorAngle = (2 * Math.PI) / this.sectors.length;

       this.sectors.forEach((sector, i) => {
           // Aloituskulma
           const startAngle = i * sectorAngle + this.rotation;
           const endAngle = startAngle + sectorAngle;

           // Piirrä sektori
           ctx.beginPath();
           ctx.moveTo(centerX, centerY);
           ctx.arc(centerX, centerY, radius, startAngle, endAngle);
           ctx.fillStyle = this.colors[i];
           ctx.fill();

           // Piirrä teksti
           ctx.save();
           ctx.translate(centerX, centerY);
           ctx.rotate(startAngle + sectorAngle / 2);
           ctx.fillText(sector.text, radius * 0.6, 0);
           ctx.restore();
       });
   }
   ```

3. **Animaatioalgoritmi**
   ```javascript
   spin() {
       const spinAngle = Math.random() * 360 + 720; // Vähintään 2 kierrosta
       const duration = 4000; // 4 sekuntia
       const startTime = performance.now();

       const animate = (currentTime) => {
           const elapsed = currentTime - startTime;
           const progress = Math.min(elapsed / duration, 1);

           // Ease-out hidastus
           const easeOut = 1 - Math.pow(1 - progress, 3);
           this.rotation = easeOut * spinAngle * (Math.PI / 180);

           this.draw();

           if (progress < 1) {
               requestAnimationFrame(animate);
           } else {
               this.onComplete();
           }
       };

       requestAnimationFrame(animate);
   }
   ```

## Vaihe 5: JavaScript - App-moduuli

### Tehtävät

1. **Alustus**
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
       const canvas = document.getElementById('wheel');
       const wheel = new FortuneWheel(canvas);

       // Lataa tallennetut tiedot
       const saved = Storage.load();
       if (saved) {
           wheel.updateSectors(saved.sectors);
           populateInputs(saved.sectors);
       }
   });
   ```

2. **Tapahtumankäsittelijät**
   ```javascript
   // Tekstikenttien muutokset
   inputs.forEach((input, i) => {
       input.addEventListener('input', (e) => {
           wheel.updateSector(i, e.target.value);
           Storage.save({ sectors: wheel.getSectorTexts() });
       });
   });

   // Pyöritysnappi
   spinBtn.addEventListener('click', () => {
       spinBtn.disabled = true;
       spinBtn.textContent = 'Pyörii...';

       wheel.spin(() => {
           const winner = wheel.getWinner();
           showResult(winner);
           spinBtn.disabled = false;
           spinBtn.textContent = 'Pyöritä!';
       });
   });
   ```

## Vaihe 6: Testaus ja viimeistely

### Tehtävät

1. **Toiminnallisuustestaus**
   - [ ] Tekstien muokkaus toimii
   - [ ] Pyöritys käynnistyy
   - [ ] Animaatio on sulava
   - [ ] Voittaja näytetään oikein
   - [ ] Tiedot tallentuvat
   - [ ] Tiedot latautuvat sivun päivityksessä

2. **Reunatapaukset**
   - [ ] Tyhjät tekstikentät
   - [ ] Pitkät tekstit (katkaisu)
   - [ ] Nopea moninkertainen klikkaus
   - [ ] LocalStorage täynnä/estetty

3. **Responsiivisuus**
   - [ ] Mobiili (< 480px)
   - [ ] Tabletti (480-768px)
   - [ ] Desktop (> 768px)

4. **Suorituskyky**
   - [ ] Animaatio 60 FPS
   - [ ] Ei muistivuotoja
   - [ ] Nopea lataus

## Aikataulu (ehdotettu järjestys)

| Vaihe | Kuvaus | Riippuvuudet |
|-------|--------|--------------|
| 1 | Perusrakenne | - |
| 2 | CSS-tyylitys | Vaihe 1 |
| 3 | Storage-moduuli | - |
| 4 | Wheel-moduuli | Vaihe 1 |
| 5 | App-moduuli | Vaiheet 1, 3, 4 |
| 6 | Testaus | Kaikki |

## Tuotokset

Valmiin projektin tulee sisältää:

```
onnenpyora/
├── index.html          ✓ Valmis HTML-sivu
├── css/
│   └── style.css       ✓ Kaikki tyylitys
├── js/
│   ├── wheel.js        ✓ Pyörän piirto ja animaatio
│   ├── storage.js      ✓ LocalStorage-käsittely
│   └── app.js          ✓ Pääsovelluksen logiikka
└── docs/
    ├── ARCHITECTURE.md ✓ (Tämä dokumentti)
    ├── FEATURES.md     ✓
    └── IMPLEMENTATION.md ✓
```
