#!/bin/bash

# ==========================================================================
# ML Mudeli käivitamise skript erinevate võimalustega
# ==========================================================================

# Konstante
ML_SERVICE_DIR="/Users/sass/Documents/GitHub/Abstracter-project/ml_service"
VENV_ACTIVATE="$ML_SERVICE_DIR/venv/bin/activate"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BASE_LOG_DIR="$ML_SERVICE_DIR/logs"
mkdir -p "$BASE_LOG_DIR"

# Värvid terminalile
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== Abifunktsioonid =====

show_help() {
    echo -e "${BLUE}=== ML Mudeli käivitamise skript ===${NC}"
    echo "Kasutus: $0 [valik]"
    echo ""
    echo "Valikud:"
    echo "  -h, --help            Näita seda abiinfot"
    echo "  -s, --simple          Käivita lihtsa monitooringuga"
    echo "  -v, --venv            Käivita virtuaalkeskkonna spetsiifiliselt"
    echo "  -d, --debug           Käivita põhjaliku importide jälgimisega"
    echo "  -a, --advanced        Käivita täieliku diagnostikaga"
    echo ""
    echo "Näide: $0 --debug"
}

check_venv() {
    echo -e "${BLUE}=== Virtuaalkeskkonna kontrollimine ===${NC}"
    
    if [ ! -f "$VENV_ACTIVATE" ]; then
        echo -e "${RED}Venv aktiveerimise skripti ei leitud: $VENV_ACTIVATE${NC}"
        find "$ML_SERVICE_DIR" -name "activate" | head -n 3
        return 1
    fi
    
    echo "Venv leitud asukohas: $VENV_ACTIVATE"
    return 0
}

activate_venv() {
    echo -e "${BLUE}=== Virtuaalkeskkonna aktiveerimine ===${NC}"
    
    # shellcheck disable=SC1090
    source "$VENV_ACTIVATE" || { 
        echo -e "${RED}Virtuaalkeskkonna aktiveerimine ebaõnnestus!${NC}"
        return 1
    }
    
    if [[ "$(which python)" == *"/venv/"* ]]; then
        echo -e "${GREEN}Python kasutab virtuaalkeskkonda: $(which python)${NC}"
    else
        echo -e "${YELLOW}HOIATUS: Python EI kasuta virtuaalkeskkonda!${NC}"
        echo "Praegune Python: $(which python)"
        echo "Eeldatav venv Python: $ML_SERVICE_DIR/venv/bin/python"
        return 1
    fi
    
    return 0
}

prepare_environment() {
    echo -e "${BLUE}=== Keskkonna seadistamine ===${NC}"
    
    # Liigume projekti kausta
    cd "$ML_SERVICE_DIR" || { 
        echo -e "${RED}Ei saanud liikuda kataloogi $ML_SERVICE_DIR${NC}"
        return 1
    }
    
    # Seadistame keskkonna muutujad
    export TF_CPP_MIN_LOG_LEVEL=0  # 0 = kõik logid, 1 = INFO, 2 = HOIATUSED, 3 = ERROR
    export PYTHONUNBUFFERED=1      # Jooksutab väljundi puhverdamata
    export PYTHONDONTWRITEBYTECODE=1  # Ei loo .pyc faile
    
    echo -e "${GREEN}Keskkond edukalt seadistatud${NC}"
    return 0
}

show_system_info() {
    echo -e "${BLUE}=== Süsteemi info ===${NC}"
    uname -a
    
    echo -e "\n${BLUE}=== Python versioon ja asukoht ===${NC}"
    which python
    python --version
    
    echo -e "\n${BLUE}=== Installitud paketid ===${NC}"
    pip list
    
    echo -e "\n${BLUE}=== TensorFlow info ===${NC}"
    python -c "import tensorflow as tf; print(f'TF version: {tf.__version__}'); print(f'TF devices: {tf.config.list_physical_devices()}'); print(f'TF built with CUDA: {tf.test.is_built_with_cuda()}');" 2>/dev/null || echo "TensorFlow info ei ole saadaval"
    
    echo -e "\n${BLUE}=== NumPy info ===${NC}"
    python -c "import numpy as np; print(f'NumPy version: {np.__version__}');" 2>/dev/null || echo "NumPy info ei ole saadaval"
    
    echo -e "\n${BLUE}=== Keras info ===${NC}"
    python -c "import keras; print(f'Keras version: {keras.__version__}');" 2>/dev/null || echo "Keras info ei ole saadaval"
}

# ===== Käivitusfunktsioonid =====

run_simple() {
    echo -e "${BLUE}=== Lihtsustatud mudeli käivitamine ===${NC}"
    LOG_FILE="$BASE_LOG_DIR/ml_model_simple_$TIMESTAMP.log"
    echo "Logifail: $LOG_FILE"
    
    python ml_model.py 2>&1 | tee "$LOG_FILE"
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE${NC}"
        echo "Viimased 20 rida logist:"
        tail -n 20 "$LOG_FILE"
    else
        echo -e "${GREEN}Mudeli käivitamine õnnestus!${NC}"
    fi
}

run_with_venv() {
    echo -e "${BLUE}=== Käivitamine virtuaalkeskkonnaga ===${NC}"
    
    check_venv || return 1
    activate_venv || return 1
    prepare_environment || return 1
    show_system_info
    
    LOG_FILE="$BASE_LOG_DIR/ml_model_venv_$TIMESTAMP.log"
    echo -e "\n${BLUE}=== Käivitame mudeli ===${NC}"
    echo "Logifail: $LOG_FILE"
    
    python ml_model.py 2>&1 | tee "$LOG_FILE"
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE${NC}"
        echo "Viimased 20 rida logist:"
        tail -n 20 "$LOG_FILE"
    else
        echo -e "${GREEN}Mudeli käivitamine õnnestus!${NC}"
    fi
}

run_debug_mode() {
    echo -e "${BLUE}=== Käivitamine importide jälgimisega ===${NC}"
    
    check_venv || return 1
    activate_venv || return 1
    prepare_environment || return 1
    
    IMPORT_LOG="$BASE_LOG_DIR/ml_model_imports_$TIMESTAMP.log"
    FULL_LOG="$BASE_LOG_DIR/ml_model_full_$TIMESTAMP.log"
    
    echo "Importide logi: $IMPORT_LOG"
    echo "Täielik logi: $FULL_LOG"
    
    # Paralleelsed protsessid: Importide jälgimine ja täielik käivitus
    (
        echo "=== IMPORT TRACE START ===" 
        python -vv ml_model.py 2>&1 | grep -E "import |ImportError|ModuleNotFoundError" 
        echo "=== IMPORT TRACE END ===" 
    ) | tee "$IMPORT_LOG" &
    
    (
        echo "=== FULL LOG START ==="
        python ml_model.py 2>&1
        echo "=== FULL LOG END ==="
    ) | tee "$FULL_LOG"
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE${NC}"
        
        echo -e "\n${YELLOW}=== TensorFlow'i probleemide analüüsimine ===${NC}"
        echo "Võimalikud vead:"
        grep -i "error\|exception\|fail\|could not" "$FULL_LOG" | tail -n 10
        
        echo -e "\n${YELLOW}Importidega seotud probleemid:${NC}"
        grep -i "import\|module" "$IMPORT_LOG" | grep -i "error\|warn\|except\|fail\|not found" | tail -n 10
    else
        echo -e "${GREEN}Mudeli käivitamine õnnestus!${NC}"
    fi
    
    echo -e "\nLogid on saadaval:"
    echo "- Importide logi: $IMPORT_LOG"
    echo "- Täielik logi: $FULL_LOG"
}

run_advanced_mode() {
    echo -e "${BLUE}=== Käivitamine täieliku diagnostikaga ===${NC}"
    
    check_venv || return 1
    activate_venv || return 1
    prepare_environment || return 1
    show_system_info
    
    IMPORT_LOG="$BASE_LOG_DIR/ml_model_imports_adv_$TIMESTAMP.log"
    FULL_LOG="$BASE_LOG_DIR/ml_model_full_adv_$TIMESTAMP.log"
    TRACE_LOG="$BASE_LOG_DIR/ml_model_trace_adv_$TIMESTAMP.log"
    
    echo -e "\n${BLUE}=== Käivitame ML mudeli täieliku jälgimisega ===${NC}"
    echo "Importide logi: $IMPORT_LOG"
    echo "Täielik logi: $FULL_LOG"
    echo "Trace logi: $TRACE_LOG"
    
    # Paralleelsed protsessid: Importide jälgimine, täielik käivitus ja trace
    (
        echo "=== IMPORT TRACE START ===" 
        python -vvv ml_model.py 2>&1 | grep -E "import |ImportError|ModuleNotFoundError|tensorflow|keras" 
        echo "=== IMPORT TRACE END ===" 
    ) | tee "$IMPORT_LOG" &
    
    (
        echo "=== TRACE LOG START ==="
        python -m trace --trace ml_model.py 2>&1
        echo "=== TRACE LOG END ==="
    ) | tee "$TRACE_LOG" &
    
    (
        echo "=== FULL LOG START ==="
        python ml_model.py 2>&1
        echo "=== FULL LOG END ==="
    ) | tee "$FULL_LOG"
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE${NC}"
        
        echo -e "\n${YELLOW}=== TensorFlow'i probleemide analüüsimine ===${NC}"
        echo "Võimalikud vead:"
        grep -i "error\|exception\|fail\|could not" "$FULL_LOG" | tail -n 20
        
        echo -e "\n${YELLOW}Importidega seotud probleemid:${NC}"
        grep -i "import\|module" "$IMPORT_LOG" | grep -i "error\|warn\|except\|fail\|not found" | tail -n 20
        
        echo -e "\n${YELLOW}Trace analüüs:${NC}"
        grep -i "error\|exception\|tensorflow\|keras" "$TRACE_LOG" | tail -n 20
    else
        echo -e "${GREEN}Mudeli käivitamine õnnestus!${NC}"
    fi
    
    echo -e "\nLogid on saadaval:"
    echo "- Importide logi: $IMPORT_LOG"
    echo "- Täielik logi: $FULL_LOG"
    echo "- Trace logi: $TRACE_LOG"
}

# ===== Põhiprogramm =====

# Kui ühtegi argumenti pole antud, näita abi
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# Parsi käsurea argumendid
case "$1" in
    -h|--help)
        show_help
        ;;
    -s|--simple)
        prepare_environment && run_simple
        ;;
    -v|--venv)
        run_with_venv
        ;;
    -d|--debug)
        run_debug_mode
        ;;
    -a|--advanced)
        run_advanced_mode
        ;;
    *)
        echo -e "${RED}Tundmatu valik: $1${NC}"
        show_help
        exit 1
        ;;
esac

exit 0 