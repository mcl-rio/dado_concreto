#!/usr/bin/env python3
"""
Script para remover o fundo preto do carimbo vermelho,
mantendo apenas os elementos vermelhos com fundo transparente.
"""

from PIL import Image
import numpy as np

def remove_black_background(input_path, output_path):
    """Remove o fundo preto de uma imagem, tornando-o transparente."""
    
    # Abrir a imagem
    img = Image.open(input_path)
    
    # Converter para RGBA se necessário
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Converter para array numpy
    data = np.array(img)
    
    # Extrair canais
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Identificar pixels pretos ou muito escuros (fundo)
    # Pixels onde R, G e B são todos baixos (próximos de preto)
    is_black = (r < 50) & (g < 50) & (b < 50)
    
    # Tornar pixels pretos transparentes
    data[:,:,3] = np.where(is_black, 0, a)
    
    # Criar nova imagem
    result = Image.fromarray(data, 'RGBA')
    
    # Salvar
    result.save(output_path, 'PNG')
    print(f"Imagem salva em: {output_path}")

if __name__ == "__main__":
    input_file = "/home/ubuntu/geopolitical-analyst/client/public/stamps/rejeitada.png"
    output_file = "/home/ubuntu/geopolitical-analyst/client/public/stamps/rejeitada_transparent.png"
    
    remove_black_background(input_file, output_file)
