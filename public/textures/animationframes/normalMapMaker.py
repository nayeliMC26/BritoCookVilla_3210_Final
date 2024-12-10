import os
from PIL import Image
import numpy as np

def create_normal_map(image_path, intensity=1.0):
    image = Image.open(image_path).convert('L')
    image_data = np.asarray(image, dtype=np.float32)
    
    # Calculate gradients
    grad_x, grad_y = np.gradient(image_data)
    
    # Scale gradients by intensity
    grad_x = (grad_x / 255.0) * intensity
    grad_y = (grad_y / 255.0) * intensity
    
    # Calculate normal map components
    normal_x = grad_x
    normal_y = grad_y
    normal_z = np.sqrt(1.0 - grad_x**2 - grad_y**2)
    
    # Stack components into a normal map
    normal_map = np.stack((normal_x, normal_y, normal_z), axis=-1)
    normal_map = ((normal_map + 1.0) * 0.5 * 255).astype(np.uint8)
    
    return Image.fromarray(normal_map)

def process_textures_folder(folder_path, intensity=1.0):
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.png', '.PNG', '.jpg', '.jpeg')):
                image_path = os.path.join(root, file)
                normal_map = create_normal_map(image_path, intensity)
                
                normal_map_path = os.path.join(root, f'normal_{file}')
                normal_map.save(normal_map_path)
                print(f'Normal map saved to {normal_map_path}')

if __name__ == '__main__':
    textures_folder = os.path.dirname(os.path.abspath(__file__))
    process_textures_folder(textures_folder, intensity=2.0)  # Adjust the intensity value as needed