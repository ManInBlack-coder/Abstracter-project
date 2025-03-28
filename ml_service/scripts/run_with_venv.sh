#!/bin/bash

# Täismääratletud rajad
ML_SERVICE_DIR="/Users/sass/Documents/GitHub/Abstracter-project/ml_service"
VENV_ACTIVATE="$ML_SERVICE_DIR/venv/bin/activate"

# Kontrollime, et virtuaalne keskkond on olemas
if [ ! -f "$VENV_ACTIVATE" ]; then
    echo "Error: Venv aktiveerimise skripti ei leitud rajalt: $VENV_ACTIVATE"
    exit 1
fi

# Liigume projekti kausta
cd "$ML_SERVICE_DIR" || { echo "Error: Ei saanud liikuda kataloogi $ML_SERVICE_DIR"; exit 1; }

echo "=== Aktiveerime Python virtuaalkeskkonna ==="
# shellcheck disable=SC1090
source "$VENV_ACTIVATE"

echo "=== Süsteemi info ==="
uname -a

echo "=== Python versioon ja asukoht ==="
which python
python --version

echo "=== Virtuaalkeskkond aktiveeritud ==="
if [[ "$(which python)" == *"/venv/"* ]]; then
    echo "Python kasutab virtuaalkeskkonda: $(which python)"
else
    echo "HOIATUS: Python EI kasuta virtuaalkeskkonda!"
    echo "Praegune Python: $(which python)"
    echo "Eeldatav venv Python: $ML_SERVICE_DIR/venv/bin/python"
fi

echo "=== Installitud paketid ==="
pip list

# Seadistame keskkonna 
export TF_CPP_MIN_LOG_LEVEL=0
export PYTHONUNBUFFERED=1

echo ""
echo "=== Käivitame ML mudeli importide monitooringuga ==="

# Unikaalne logifail iga käivitamise jaoks
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
IMPORT_LOG="ml_model_imports_$TIMESTAMP.log"
FULL_LOG="ml_model_full_$TIMESTAMP.log"

echo "Importide logi: $IMPORT_LOG"
echo "Täielik logi: $FULL_LOG"

# Python käivitus importide jälgimisega
(
    echo "=== IMPORT TRACE START ===" 
    python -vv ml_model.py 2>&1 | grep -E "import |ImportError|ModuleNotFoundError" 
    echo "=== IMPORT TRACE END ===" 
) | tee "$IMPORT_LOG" &

# Käivitame täieliku logimisega
(
    echo "=== FULL LOG START ==="
    python ml_model.py 2>&1
    echo "=== FULL LOG END ==="
) | tee "$FULL_LOG"

# Kontrollime käivitamise tulemust
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "=== Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE ==="
    
    echo ""
    echo "=== TensorFlow'i probleemide analüüsimine ==="
    echo "Võimalikud vead:"
    grep -i "error\|exception\|fail\|could not" "$FULL_LOG" | tail -n 20
    
    echo ""
    echo "Importidega seotud probleemid:"
    grep -i "import\|module" "$IMPORT_LOG" | grep -i "error\|warn\|except\|fail\|not found" | tail -n 20
else
    echo ""
    echo "=== Mudeli käivitamine õnnestus! ==="
fi

echo ""
echo "Logid on saadaval:"
echo "- Importide logi: $IMPORT_LOG"
echo "- Täielik logi: $FULL_LOG" 