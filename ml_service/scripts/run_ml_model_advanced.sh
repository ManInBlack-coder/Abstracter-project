#!/bin/bash

# Määrame skripti asukohta
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "=== Aktiveerime Python virtuaalkeskkonna ==="
source venv/bin/activate

echo "=== Süsteemi info ==="
uname -a

echo "=== Python versioon ==="
python --version

echo "=== Installitud paketid ja versioonid ==="
pip list

echo "=== TensorFlow info ==="
python -c "import tensorflow as tf; print(f'TF version: {tf.__version__}'); print(f'TF devices: {tf.config.list_physical_devices()}'); print(f'TF built with CUDA: {tf.test.is_built_with_cuda()}'); print(f'TF GPU available: {tf.test.is_gpu_available()}');" 2>/dev/null || echo "TensorFlow info ei ole saadaval"

echo "=== NumPy info ==="
python -c "import numpy as np; print(f'NumPy version: {np.__version__}');" 2>/dev/null || echo "NumPy info ei ole saadaval"

echo "=== Keras info ==="
python -c "import keras; print(f'Keras version: {keras.__version__}');" 2>/dev/null || echo "Keras info ei ole saadaval"

echo "=== Virtuaalkeskkonna tee ==="
which python

# Lisame keskkonna muutujad, mis võivad aidata TensorFlow'i käivitamisel
export TF_CPP_MIN_LOG_LEVEL=0  # 0 = kõik logid, 1 = INFO, 2 = HOIATUSED, 3 = ERROR
export PYTHONUNBUFFERED=1      # Jooksutab väljundi puhverdamata
export PYTHONDONTWRITEBYTECODE=1  # Ei loo .pyc faile 

echo ""
echo "=== Käivitame mudeli verbose režiimis pakkide jälgimiseks ==="
echo "Logitakse faili: ml_model_debug_$(date +%Y%m%d_%H%M%S).log"
echo ""

# Salvestame detailse jälgimise logifaili
LOG_FILE="ml_model_debug_$(date +%Y%m%d_%H%M%S).log"

# Käivitame Python skripti koos paketide jälgimisega
# -vv annab väga detailset jälgimisinfot
python -vv ml_model.py 2>&1 | tee "$LOG_FILE"

# Kontrollime käivitamise tulemust
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "=== Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE ==="
    echo "Viimased 30 rida logist:"
    tail -n 30 "$LOG_FILE"
    
    echo ""
    echo "=== TensorFlow'i probleemide analüüsimine ==="
    # Otsime logist võimalikke vihjeid probleemidele
    echo "Võimalikud vead:"
    grep -i "error\|exception\|fail\|could not" "$LOG_FILE" | tail -n 10
    
    echo ""
    echo "TensorFlow-spetsiifilised teated:"
    grep -i "tensorflow\|keras\|tf." "$LOG_FILE" | grep -i "error\|warn\|fail" | tail -n 10
else
    echo ""
    echo "=== Mudeli käivitamine õnnestus! ==="
fi

echo ""
echo "Täielik logi on saadaval: $LOG_FILE" 