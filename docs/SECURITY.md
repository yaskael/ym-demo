# Tietoturva-analyysi

**Päivämäärä:** 2025-12-08
**Tarkastetut tiedostot:** index.html, app.js, wheel.js, storage.js

---

## Yhteenveto

| Kategoria | Tila |
|-----------|------|
| XSS (Cross-Site Scripting) | ✅ Turvallinen |
| Verkkoliikenne | ✅ Ei yhteyksiä |
| LocalStorage | ⚠️ Pieniä puutteita |
| Syötteen validointi | ⚠️ Osittainen |
| Kokonaisriski | 🟢 Matala |

---

## Positiiviset havainnot

### 1. XSS-suojaus toteutettu oikein

**Sijainti:** `js/app.js:81`

```javascript
resultDiv.textContent = `🎉 ${text} 🎉`;
```

Käytetään `textContent`-ominaisuutta `innerHTML`:n sijaan. Tämä estää XSS-hyökkäykset, koska käyttäjän syöte ei tulkita HTML:nä.

### 2. Canvas API on turvallinen

**Sijainti:** `js/wheel.js:141`

```javascript
ctx.fillText(displayText, textRadius, 0);
```

Canvas `fillText()` piirtää tekstin kuvana eikä tulkitse HTML- tai JavaScript-koodia.

### 3. Ei verkkoyhteyksiä

Sovellus ei tee lainkaan verkkokyselyitä:
- Ei `fetch()` tai `XMLHttpRequest`-kutsuja
- Ei ulkoisia skriptejä tai CDN-linkkejä
- Kaikki resurssit ovat paikallisia

### 4. JSON-käsittely try-catch-blokeissa

**Sijainti:** `js/storage.js:30-40`

```javascript
try {
    const parsed = JSON.parse(data);
    return parsed.sectors || null;
} catch (e) {
    console.warn('LocalStorage lataus epäonnistui:', e);
    return null;
}
```

Virheellinen JSON ei kaada sovellusta.

---

## Havaitut puutteet

### 1. LocalStorage-datan validointi puutteellinen

**Sijainti:** `js/app.js:56-65`

**Ongelma:** Ladattua dataa ei validoida riittävästi.

```javascript
function loadSavedData() {
    const saved = Storage.load();
    if (saved && Array.isArray(saved)) {
        saved.forEach((text, i) => {
            if (i < inputs.length && text) {
                inputs[i].value = text;  // Ei tarkisteta tyyppiä
            }
        });
    }
}
```

**Riski:** Matala
**Kuvaus:** Jos joku muokkaa LocalStoragen sisältöä manuaalisesti (Developer Tools), sovellus saattaa käyttäytyä odottamattomasti.

**Suositus:** Lisää tyypintarkistus:
```javascript
if (typeof text === 'string') {
    inputs[i].value = text;
}
```

### 2. Syötteen pituuden validointi vain HTML:ssä

**Sijainti:** `index.html:29`

```html
<input type="text" maxlength="20" ...>
```

**Riski:** Matala
**Kuvaus:** `maxlength` toimii vain selaimessa. LocalStoragesta ladattu data voi olla pidempi.

**Suositus:** Lisää JavaScript-validointi:
```javascript
const sanitized = text.substring(0, 20);
```

### 3. Ei Content Security Policy (CSP) -otsaketta

**Sijainti:** `index.html` (puuttuu)

**Riski:** Informatiivinen
**Kuvaus:** CSP-otsake lisäisi suojakerroksen XSS-hyökkäyksiä vastaan.

**Suositus:** Lisää meta-tagi:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self'">
```

### 4. Satunnaislukugeneraattori ei ole kryptografisesti turvallinen

**Sijainti:** `js/wheel.js:175-176`

```javascript
const extraSpins = 5 + Math.random() * 5;
const randomAngle = Math.random() * 2 * Math.PI;
```

**Riski:** Matala
**Kuvaus:** `Math.random()` on ennustettavissa. Tämä ei ole ongelma viihdesovelluksessa, mutta oikeassa rahapelissä tämä olisi kriittinen haavoittuvuus.

**Huomautus:** Viihdesovellukselle tämä on hyväksyttävää.

---

## Ei havaittu näitä ongelmia

| Haavoittuvuus | Tila |
|---------------|------|
| `eval()` käyttö | ❌ Ei käytetä |
| `innerHTML` käyttö | ❌ Ei käytetä |
| `document.write()` | ❌ Ei käytetä |
| Dynaamiset script-tagit | ❌ Ei luoda |
| SQL-injektio | N/A (ei tietokantaa) |
| CSRF | N/A (ei palvelinta) |

---

## Suositukset prioriteettijärjestyksessä

### Korkea prioriteetti
*Ei kriittisiä korjauksia tarvita*

### Keskitaso
1. **Lisää LocalStorage-datan tyypintarkistus** - Estää odottamattoman käytöksen

### Matala prioriteetti
2. **Lisää CSP meta-tagi** - Syväpuolustus
3. **Lisää JavaScript-puolen pituusvalidointi** - Johdonmukaisuus

---

## Johtopäätös

Sovellus on tietoturvan kannalta **hyvin toteutettu** viihdesovellukseksi:

- ✅ XSS-hyökkäykset estetty oikein
- ✅ Ei verkkoyhteyksiä tai ulkoisia riippuvuuksia
- ✅ Virheenkäsittely toteutettu
- ⚠️ Pieniä parannusmahdollisuuksia LocalStorage-validoinnissa

**Kokonaisarvio:** Sovellus on turvallinen käyttää.
