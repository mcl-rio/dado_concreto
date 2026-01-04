#!/usr/bin/env python3
"""Script para remover fundos brancos das logomarcas"""

from PIL import Image
import os

def remove_white_background(input_path, output_path, tolerance=30):
    """Remove fundo branco de uma imagem PNG"""
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Se o pixel for branco ou quase branco, torna transparente
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            new_data.append((255, 255, 255, 0))  # Transparente
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processado: {input_path} -> {output_path}")

def remove_light_background(input_path, output_path, tolerance=240):
    """Remove fundo claro (branco e cinza claro) de uma imagem PNG"""
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Se o pixel for muito claro (branco ou cinza claro), torna transparente
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            new_data.append((255, 255, 255, 0))  # Transparente
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processado: {input_path} -> {output_path}")

# Diretório das logomarcas
supporters_dir = "/home/ubuntu/geopolitical-analyst/client/public/supporters"

# Logomarcas que precisam de remoção de fundo branco
logos_to_process = [
    ("control-risks.png", 30),  # Fundo branco
    ("kroll.png", 30),          # Fundo branco
    ("fgv.png", 30),            # Fundo branco
    ("mi6.png", 240),           # Fundo cinza claro
    ("cia.png", 30),            # Fundo branco
]

for logo, tolerance in logos_to_process:
    input_path = os.path.join(supporters_dir, logo)
    output_path = input_path  # Sobrescrever o arquivo original
    
    if os.path.exists(input_path):
        if tolerance > 100:
            remove_light_background(input_path, output_path, tolerance)
        else:
            remove_white_background(input_path, output_path, tolerance)
    else:
        print(f"Arquivo não encontrado: {input_path}")

print("\nProcessamento concluído!")
