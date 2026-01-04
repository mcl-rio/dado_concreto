#!/usr/bin/env python3
"""
Script para remover o fundo branco/cinza claro do carimbo verde,
mantendo apenas os elementos verdes com fundo transparente.
"""

from PIL import Image
import numpy as np

def remove_white_background(input_path, output_path):
    """Remove o fundo branco/cinza de uma imagem, tornando-o transparente."""
    
    # Abrir a imagem
    img = Image.open(input_path)
    
    # Converter para RGBA se necessário
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Converter para array numpy
    data = np.array(img)
    
    # Extrair canais
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Abordagem: manter apenas pixels que têm componente verde significativo
    # e remover tudo que é branco/cinza
    
    # Calcular a saturação (diferença entre max e min dos canais RGB)
    max_rgb = np.maximum(np.maximum(r, g), b).astype(float)
    min_rgb = np.minimum(np.minimum(r, g), b).astype(float)
    saturation = max_rgb - min_rgb
    
    # Calcular brilho
    brightness = (r.astype(float) + g.astype(float) + b.astype(float)) / 3
    
    # Pixels a manter: têm alguma saturação (não são cinza/branco puro)
    # OU são pixels verdes (G > R e G > B)
    has_color = saturation > 15
    is_green = (g > r) & (g > b)
    
    # Pixels a remover: muito claros E baixa saturação
    is_too_light = brightness > 200
    is_low_saturation = saturation < 40
    
    # Tornar transparente se: muito claro E baixa saturação
    should_be_transparent = is_too_light & is_low_saturation
    
    # Aplicar transparência
    new_alpha = np.where(should_be_transparent, 0, a)
    data[:,:,3] = new_alpha
    
    # Criar nova imagem
    result = Image.fromarray(data)
    
    # Salvar
    result.save(output_path, 'PNG')
    print(f"Imagem salva em: {output_path}")

if __name__ == "__main__":
    input_file = "/home/ubuntu/upload/ChatGPTImage31dedez.de2025,22_18_22.png"
    output_file = "/home/ubuntu/geopolitical-analyst/client/public/stamps/aprovada.png"
    
    remove_white_background(input_file, output_file)
