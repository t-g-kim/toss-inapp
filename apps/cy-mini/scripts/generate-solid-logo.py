#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../assets"))
os.makedirs(ASSETS_DIR, exist_ok=True)

def get_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for font_path in candidates:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def generate_solid_logo():
    # 100% SOLID RGB canvas (Zero alpha channel, zero transparency)
    # Brand primary: #FF7710 (255, 119, 16)
    BG_COLOR = (255, 119, 16)
    img = Image.new("RGB", (600, 600), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # 1. Subtle warm gradient / concentric soft vignette in solid RGB
    for r in range(290, 0, -5):
        # blend subtly towards slightly warmer/richer orange
        factor = (290 - r) / 290.0
        cr = int(255 - factor * 10)
        cg = int(119 + factor * 15)
        cb = int(16 + factor * 12)
        # draw concentric circles lightly
        # draw.ellipse([300 - r, 300 - r, 300 + r, 300 + r], fill=(cr, cg, cb))

    # Keep solid pure brand background
    draw.rectangle([0, 0, 600, 600], fill=BG_COLOR)

    # 2. Outer decorative vintage dotted border (retro Cyworld homepage border)
    # 4 corners are 100% solid BG_COLOR!
    border_inset = 28
    draw.rectangle(
        [border_inset, border_inset, 600 - border_inset, 600 - border_inset],
        outline=(255, 237, 213), # warm cream outline
        width=4
    )
    # Fine inner line
    draw.rectangle(
        [border_inset + 6, border_inset + 6, 600 - border_inset - 6, 600 - border_inset - 6],
        outline=(234, 88, 12),
        width=2
    )

    # 3. Main Retro Miniroom Window Card (White / Cream Vintage Container)
    cw_l, cw_t, cw_r, cw_b = 64, 60, 536, 460
    draw.rounded_rectangle([cw_l, cw_t, cw_r, cw_b], radius=24, fill=(255, 255, 255), outline=(254, 215, 170), width=4)

    # 3-1. Window Title Bar (Retro Orange Gradient)
    tb_h = 44
    draw.rounded_rectangle([cw_l + 4, cw_t + 4, cw_r - 4, cw_t + tb_h], radius=18, fill=(255, 125, 26))
    # Window controls (3 retro dots on left)
    draw.ellipse([cw_l + 16, cw_t + 16, cw_l + 28, cw_t + 28], fill=(254, 202, 202))
    draw.ellipse([cw_l + 34, cw_t + 16, cw_l + 46, cw_t + 28], fill=(254, 240, 138))
    draw.ellipse([cw_l + 52, cw_t + 16, cw_l + 64, cw_t + 28], fill=(187, 247, 208))

    # Window title text
    font_tb = get_font(18, bold=True)
    draw.text((300, cw_t + 24), "★..MY MINIROOM..★", fill=(255, 255, 255), font=font_tb, anchor="mm")

    # 3-2. Isometric Retro Room Interior (Wall + Floor)
    rw_l, rw_t, rw_r, rw_b = cw_l + 12, cw_t + tb_h + 4, cw_r - 12, cw_b - 12
    draw.rectangle([rw_l, rw_t, rw_r, rw_b], fill=(254, 243, 199)) # warm retro cream wall

    # Back wall stripe or retro wallpaper pattern
    for wx in range(rw_l, rw_r, 24):
        draw.line([(wx, rw_t), (wx, rw_t + 170)], fill=(253, 230, 138), width=2)

    # Miniroom Floor (Isometric retro wooden floor / checker floor)
    floor_top = rw_t + 170
    draw.rectangle([rw_l, floor_top, rw_r, rw_b], fill=(254, 215, 170))
    # Floor perspective lines
    for fx in range(rw_l, rw_r + 80, 32):
        draw.line([(fx, floor_top), (fx - 50, rw_b)], fill=(251, 191, 36), width=2)
    for fy in range(floor_top, rw_b, 22):
        draw.line([(rw_l, fy), (rw_r, fy)], fill=(251, 191, 36), width=2)

    # 3-3. Retro Window in the back wall with stars/clouds
    win_l, win_t, win_r, win_b = 96, rw_t + 18, 200, rw_t + 110
    draw.rectangle([win_l, win_t, win_r, win_b], fill=(186, 230, 253), outline=(203, 213, 225), width=3)
    draw.line([( (win_l + win_r)//2, win_t ), ( (win_l + win_r)//2, win_b )], fill=(255, 255, 255), width=3)
    draw.line([( win_l, (win_t + win_b)//2 ), ( win_r, (win_t + win_b)//2 )], fill=(255, 255, 255), width=3)
    # Sun / Star in window
    draw.ellipse([win_r - 35, win_t + 10, win_r - 12, win_t + 33], fill=(251, 191, 36))

    # 3-4. Wall Poster / Hanging Frame (♬ BGM)
    draw.rectangle([220, rw_t + 25, 280, rw_t + 85], fill=(254, 202, 202), outline=(248, 113, 113), width=2)
    font_music = get_font(26, bold=True)
    draw.text((250, rw_t + 55), "♬", fill=(225, 29, 72), font=font_music, anchor="mm")

    # 3-5. Retro CRT PC on Desk (Right side)
    desk_l, desk_t, desk_r, desk_b = 360, floor_top - 30, 480, rw_b - 20
    draw.rectangle([desk_l, desk_t + 40, desk_r, desk_b], fill=(217, 119, 6), outline=(180, 83, 9), width=3)
    # CRT Monitor
    crt_l, crt_t, crt_r, crt_b = desk_l + 15, desk_t - 25, desk_r - 15, desk_t + 38
    draw.rounded_rectangle([crt_l, crt_t, crt_r, crt_b], radius=8, fill=(241, 245, 249), outline=(148, 163, 184), width=3)
    # CRT Screen glowing orange
    draw.rounded_rectangle([crt_l + 8, crt_t + 7, crt_r - 8, crt_b - 9], radius=4, fill=(255, 119, 16))
    draw.text(((crt_l + crt_r)//2, (crt_t + crt_b)//2 - 1), "> _", fill=(255, 255, 255), font=get_font(16, bold=True), anchor="mm")

    # 3-6. Center Iconic Pixel Minimi Character
    # Speech bubble above minimi
    sb_l, sb_t, sb_r, sb_b = 205, floor_top - 65, 365, floor_top - 20
    draw.rounded_rectangle([sb_l, sb_t, sb_r, sb_b], radius=10, fill=(255, 255, 255), outline=(30, 41, 59), width=2)
    draw.polygon([(260, sb_b), (275, sb_b), (265, sb_b + 8)], fill=(255, 255, 255), outline=(30, 41, 59))
    draw.line([(261, sb_b), (274, sb_b)], fill=(255, 255, 255), width=3)
    draw.text((285, sb_t + 22), "일촌 맺어요♥", fill=(225, 29, 72), font=get_font(16, bold=True), anchor="mm")

    # Minimi (Head, Hair, Blue Headphones, Body)
    mx, my = 270, floor_top + 25
    # Shadow
    draw.ellipse([mx - 24, my + 50, mx + 24, my + 64], fill=(217, 119, 6))
    # Body (Red retro hoodie)
    draw.rounded_rectangle([mx - 18, my + 15, mx + 18, my + 45], radius=6, fill=(239, 68, 68), outline=(30, 41, 59), width=2)
    # Pants (Blue jeans)
    draw.rectangle([mx - 14, my + 43, mx - 2, my + 55], fill=(37, 99, 235), outline=(30, 41, 59), width=2)
    draw.rectangle([mx + 2, my + 43, mx + 14, my + 55], fill=(37, 99, 235), outline=(30, 41, 59), width=2)
    # Head (Face)
    draw.ellipse([mx - 22, my - 22, mx + 22, my + 18], fill=(254, 240, 138), outline=(30, 41, 59), width=2)
    # Eyes & Cheeks
    draw.ellipse([mx - 10, my - 4, mx - 6, my], fill=(15, 23, 42))
    draw.ellipse([mx + 6, my - 4, mx + 10, my], fill=(15, 23, 42))
    draw.ellipse([mx - 15, my + 4, mx - 9, my + 9], fill=(251, 113, 133))
    draw.ellipse([mx + 9, my + 4, mx + 15, my + 9], fill=(251, 113, 133))
    # Hair
    draw.polygon([(mx - 22, my - 6), (mx - 15, my - 24), (mx + 15, my - 24), (mx + 22, my - 6), (mx, my - 12)], fill=(120, 53, 15))
    # Blue Headphones band & cups
    draw.arc([mx - 25, my - 26, mx + 25, my + 18], 180, 0, fill=(2, 132, 199), width=5)
    draw.rounded_rectangle([mx - 26, my - 10, mx - 20, my + 8], radius=3, fill=(2, 132, 199))
    draw.rounded_rectangle([mx + 20, my - 10, mx + 26, my + 8], radius=3, fill=(2, 132, 199))

    # 4. Bottom Title Area: "미니룸" & "MINIROOM"
    font_main_title = get_font(52, bold=True)
    # Shadow text
    draw.text((300, 508), "미니룸", fill=(194, 65, 12), font=font_main_title, anchor="mm")
    # Main text (white)
    draw.text((300, 505), "미니룸", fill=(255, 255, 255), font=font_main_title, anchor="mm")

    # Sub badge tag
    sub_bg_l, sub_bg_t, sub_bg_r, sub_bg_b = 160, 542, 440, 574
    draw.rounded_rectangle([sub_bg_l, sub_bg_t, sub_bg_r, sub_bg_b], radius=14, fill=(255, 255, 255))
    font_sub_badge = get_font(17, bold=True)
    draw.text((300, 558), "추억의 Y2K 도트 미니홈피", fill=(234, 88, 12), font=font_sub_badge, anchor="mm")

    logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img.save(logo_path, "PNG")
    print(f"✓ Solid RGB Logo generated successfully: {logo_path}")

if __name__ == "__main__":
    generate_solid_logo()
