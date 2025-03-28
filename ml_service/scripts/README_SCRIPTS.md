# ML Mudeli käivitamise skriptid

See dokument kirjeldab TensorFlow põhineva ML mudeli käivitamise võimalusi ja skripti kasutamist.

## Eesmärk

ML mudeli käivitamise skriptid on loodud selleks, et muuta mudeli käivitamine lihtsamaks ja pakkuda erinevaid monitooringu võimalusi. Kõik skriptid on nüüd organiseeritud `scripts` kataloogi ja neid saab käivitada läbi peaskripti `run.sh`.

## Peaskripti kasutamine

Peaskript `run.sh` on loodud selleks, et lihtsustada erinevate skriptide käivitamist. Skripti kasutatakse järgnevalt:

```bash
./run.sh [skript] [parameetrid]
```

Saadaval olevad skriptid:

| Käsk | Skript | Kirjeldus |
|------|--------|-----------|
| `ml` | `run_ml_scripts.sh` | Käivita ML mudel põhifunktsionaalsusega |
| `monitor` | `run_monitor.sh` | Käivita lihtsustatud monitooring |
| `venv` | `run_with_venv.sh` | Käivita virtuaalkeskkonna põhine skript |
| `service` | `run_ml_service.sh` | Käivita ML teenus |
| `model` | `run_ml_model.sh` | Käivita baas mudeli skript |
| `advanced` | `run_ml_model_advanced.sh` | Käivita täiustatud diagnostikaga |

Näiteks:
```bash
./run.sh ml --debug     # Käivita ML mudel debug režiimis
./run.sh model          # Käivita lihtne mudeli skript
./run.sh advanced       # Käivita täiustatud mudeli skript
```

## ML skripti režiimid

ML skripti (`ml`) saab käivitada erinevates režiimides:

```bash
./run.sh ml --simple    # Lihtne käivitus
./run.sh ml --venv      # Virtuaalkeskkonna põhine käivitus
./run.sh ml --debug     # Importide jälgimisega käivitus
./run.sh ml --advanced  # Täieliku diagnostikaga käivitus
```

### Lihtne režiim (--simple)

Põhiline mudeli käivitamine ilma spetsiifilise seadistuseta. Sobib, kui mudel käivitub probleemideta.

```bash
./run.sh ml --simple
```

### Virtuaalkeskkonna režiim (--venv)

Käivitab mudeli kasutades spetsiifiliselt virtuaalkeskkonda, kontrollib et virtuaalkeskkond oleks korrektselt aktiveeritud.

```bash
./run.sh ml --venv
```

### Debug režiim (--debug)

Käivitab mudeli koos importide jälgimisega, luues kaks logifaili:
- Importide logi, mis näitab kõiki imporditavaid mooduleid
- Täielik käivitamise logi

```bash
./run.sh ml --debug
```

### Täielik diagnostika (--advanced)

Kõige põhjalikum jälgimise režiim, mis loob kolm logifaili:
- Importide logi suurema detailsusega
- Täieliku käivitamise logi
- Python trace logi, mis näitab koodi täitmise järjekorda

```bash
./run.sh ml --advanced
```

## Logifailid

Kõik logifailid salvestatakse `logs` kausta ML teenuse direktooriumis ajatemplitega nimedega.

## Kasutamise näited

1. **Tavaline käivitus (ilma impordijälgimiseta):**
   ```bash
   ./run.sh ml --simple
   ```

2. **Käivitus importide jälgimisega (TensorFlow'i probleemide diagnoosimiseks):**
   ```bash
   ./run.sh ml --debug
   ```

3. **Täielik diagnostika kõige põhjalikuma jälgimisega:**
   ```bash
   ./run.sh ml --advanced
   ```

4. **Lihtsa monitooringu käivitamine:**
   ```bash
   ./run.sh monitor
   ```

5. **Virtuaalkeskkonna põhise skripti käivitamine:**
   ```bash
   ./run.sh venv
   ```

## Lisainformatsioon

Skript loob iga käivituse korral uue ajatempliga logifaili, et eelmised logid ei lähe kaotsi. Logid on saadaval `logs` kataloogis.

Kui tekib probleeme, soovitame kasutada `./run.sh ml --debug` või `./run.sh ml --advanced` režiimi, et saada rohkem infot probleemi kohta. 