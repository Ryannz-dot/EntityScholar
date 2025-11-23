#!/usr/bin/env python3
"""
Generate placeholder icons for EntityScholar Chrome Extension
Run this script to create icons in multiple sizes
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os

    def create_icon(size, output_path):
        """Create a simple icon with the ES logo"""
        # Create image with gradient background
        img = Image.new('RGB', (size, size), color='#1a73e8')
        draw = ImageDraw.Draw(img)

        # Draw white circle
        margin = size // 8
        draw.ellipse(
            [margin, margin, size - margin, size - margin],
            fill='white',
            outline='#0d47a1',
            width=max(1, size // 32)
        )

        # Add "ES" text
        try:
            # Try to use a nice font
            font_size = size // 2
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

        text = "ES"

        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Center text
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - bbox[1]

        draw.text((x, y), text, fill='#1a73e8', font=font)

        # Save
        img.save(output_path, 'PNG')
        print(f"Created {output_path}")

    # Create icons directory
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    # Generate icons
    sizes = {
        'icon16.png': 16,
        'icon48.png': 48,
        'icon128.png': 128
    }

    for filename, size in sizes.items():
        output_path = os.path.join(icons_dir, filename)
        create_icon(size, output_path)

    print("\nIcons generated successfully!")
    print("Icons are located in:", icons_dir)

except ImportError:
    print("Error: PIL (Pillow) is not installed.")
    print("Install it with: pip install Pillow")
    print("\nAlternatively, you can create icons manually using any graphics editor.")
    print("Required sizes: 16x16, 48x48, 128x128")
