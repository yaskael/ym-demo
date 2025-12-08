# Ominaisuudet

## Ydinominaisuudet

### 1. Mukautettava onnenpyörä

**Kuvaus:** Käyttäjä voi muokata jokaisen sektorin tekstiä.

**Toiminnallisuus:**
- 8 sektoria oletuksena (laajennettavissa)
- Jokainen sektori näyttää käyttäjän syöttämän tekstin
- Tyhjät sektorit näyttävät oletustekstin "Vaihtoehto X"
- Tekstit päivittyvät pyörään reaaliajassa

**Käyttötapaus:**
```
1. Käyttäjä kirjoittaa ensimmäiseen kenttään "Pizza"
2. Pyörän ensimmäinen sektori päivittyy näyttämään "Pizza"
3. Käyttäjä jatkaa muiden vaihtoehtojen täyttämistä
```

### 2. Pyöritysanimaatio

**Kuvaus:** Nappia painamalla pyörä pyörii animoidusti ja pysähtyy satunnaiseen kohtaan.

**Toiminnallisuus:**
- Pyöritys kestää 3-5 sekuntia
- Luonnollinen hidastuminen (ease-out)
- Satunnainen lopetuskulma
- Nappi estetään pyörityksen aikana

**Animaation vaiheet:**
```
1. Alkukiihdytys (0-0.5s)
2. Tasainen pyöriminen (0.5s-2s)
3. Hidastuminen (2s-4s)
4. Pysähtyminen ja tuloksen näyttö
```

### 3. Tulosnäyttö

**Kuvaus:** Pyörityksen päättyessä voittaja näytetään selkeästi.

**Toiminnallisuus:**
- Osoitin pyörän yläreunassa
- Voittajan teksti korostetaan
- Visuaalinen palaute (esim. vilkkuminen)
- Ääniefekti (valinnainen)

### 4. Tietojen tallennus

**Kuvaus:** Käyttäjän syöttämät tekstit tallentuvat automaattisesti.

**Toiminnallisuus:**
- Tallennus selaimen localStorageen
- Automaattinen lataus sivun avautuessa
- Ei vaadi kirjautumista
- Tiedot säilyvät selaimen sulkemisen jälkeen

## Käyttöliittymävaatimukset

### Syöttökentät

| Ominaisuus | Kuvaus |
|------------|--------|
| Määrä | 8 kenttää (laajennettavissa) |
| Placeholder | "Vaihtoehto 1", "Vaihtoehto 2"... |
| Maksimipituus | 20 merkkiä |
| Validointi | Ei tyhjiä erikoismerkkejä |

### Pyöritä-nappi

| Ominaisuus | Kuvaus |
|------------|--------|
| Teksti | "Pyöritä!" |
| Tila pyörityksen aikana | Disabled + "Pyörii..." |
| Väri | Vihreä/sininen, kutsuva |

### Canvas-elementti

| Ominaisuus | Kuvaus |
|------------|--------|
| Koko | 400x400 pikseliä (responsiivinen) |
| Osoitin | Kolmio yläreunassa |
| Tekstin fontti | Skaalautuva sektorin koon mukaan |

## Lisäominaisuudet (myöhemmin)

### Valinnainen: Sektorien määrän muutos
- Käyttäjä voi valita 4-12 sektoria
- Värit ja tekstit mukautuvat automaattisesti

### Valinnainen: Teemavärit
- Valmiit väriteemapaketit
- Mukautetut värit jokaiselle sektorille

### Valinnainen: Historia
- Näyttää aiemmat pyöritystulokset
- Tilastot voittajista

### Valinnainen: Ääniefektit
- Pyörimisen ääni
- Voittoääni
- Mute-nappi

## Reunaehdot

### Ei verkkoyhteyttä
- Kaikki resurssit paikallisia
- Ei CDN-linkkejä
- Ei API-kutsuja

### Selaintuki
- Moderni HTML5-selain vaaditaan
- Canvas-tuki pakollinen
- LocalStorage-tuki pakollinen

### Suorituskyky
- Sivun lataus < 1 sekunti
- Animaatio 60 FPS
- Ei muistivuotoja
