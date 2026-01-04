#!/usr/bin/env python3
"""
Script para processar e fazer upload da nova foto do Marlos Correia Lima
"""

from PIL import Image
import io
import os
import sys

# Adicionar o diretório do projeto ao path
sys.path.insert(0, '/home/ubuntu/geopolitical-analyst')

def process_image():
    """Processa a imagem do Marlos para otimização"""
    
    input_path = '/home/ubuntu/upload/marlos_square.png'
    output_path = '/home/ubuntu/upload/marlos_coordination.jpg'
    
    # Abrir imagem
    img = Image.open(input_path)
    print(f"Imagem original: {img.size}, modo: {img.mode}")
    
    # Converter para RGB se necessário (remover canal alpha)
    if img.mode == 'RGBA':
        # Criar fundo branco
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # 3 é o canal alpha
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Redimensionar para 600x600 se necessário (manter proporção)
    target_size = 600
    if img.size[0] != target_size or img.size[1] != target_size:
        img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Salvar como JPEG com boa qualidade
    img.save(output_path, 'JPEG', quality=90, optimize=True)
    
    # Verificar tamanho do arquivo
    file_size = os.path.getsize(output_path)
    print(f"Imagem processada: {img.size}, tamanho: {file_size/1024:.1f}KB")
    
    return output_path

if __name__ == '__main__':
    output = process_image()
    print(f"Imagem salva em: {output}")
