import os
import subprocess
import requests
from datetime import datetime
from tkinter import Tk, messagebox

# ==========================================
# CONFIGURAÇÕES
# ==========================================

URL_JSON = (
    "https://sistemas.anac.gov.br/"
    "dadosabertos/Aeronaves/RAB/"
    "dados_aeronaves.json"
)

PASTA_PROJETO = (
    r"C:\Users\BrunoScotton\consulta-rab-anac"
)

ARQUIVO_DESTINO = os.path.join(
    PASTA_PROJETO,
    "public",
    "dados_aeronaves.json"
)

# ==========================================
# JANELA TKINTER
# ==========================================

root = Tk()
root.withdraw()

# ==========================================
# SCRIPT
# ==========================================

try:

    print("\n==============================")
    print("INICIANDO ATUALIZAÇÃO ANAC")
    print("==============================\n")

    # ======================================
    # BAIXA JSON
    # ======================================

    print("Baixando JSON da ANAC...")

    response = requests.get(
        URL_JSON,
        timeout=300
    )

    response.raise_for_status()

    # ======================================
    # SALVA ARQUIVO
    # ======================================

    print("Salvando arquivo...")

    with open(
        ARQUIVO_DESTINO,
        "wb"
    ) as f:

        f.write(response.content)

    print(
        "Arquivo atualizado!"
    )

    # ======================================
    # GITHUB
    # ======================================

    os.chdir(PASTA_PROJETO)

    data_commit = datetime.now().strftime(
        "%d/%m/%Y %H:%M:%S"
    )

    commit_msg = (
        f"Update ANAC DB "
        f"{data_commit}"
    )

    comandos = [

        "git add .",

        f'git commit -m "{commit_msg}"',

        "git push"

    ]

    for comando in comandos:

        print(f"> {comando}")

        resultado = subprocess.run(
            comando,
            shell=True,
            text=True,
            capture_output=True
        )

        print(resultado.stdout)

        if resultado.stderr:
            print(resultado.stderr)

    # ======================================
    # SUCESSO
    # ======================================

    messagebox.showinfo(
        "Atualização",
        "DB ANAC atualizado"
    )

except Exception as e:

    print("\nERRO:")
    print(e)

    # ======================================
    # ERRO
    # ======================================

    messagebox.showerror(
        "Erro",
        "Erro no script de atualização"
    )