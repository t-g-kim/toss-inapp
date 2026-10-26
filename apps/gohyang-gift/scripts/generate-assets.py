#!/usr/bin/env python3
"""
Apps in Toss 공식 에셋 생성 스크립트:
- 로고 규격: 600 x 600 px PNG (RGB 모드, 투명 채널 완전 금지, 직각 채움)
- 스크린샷 규격: 636 x 1048 px PNG 3장
"""

import os
import subprocess
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

def generate_logo():
    logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    # 600x600 RGB (불투명 솔리드)
    img = Image.new("RGB", (600, 600), color=(5, 150, 105)) # #059669 Emerald Green
    draw = ImageDraw.Draw(img)

    # 1. 은은한 내부 원형/카드 배경 (토스 TDS 스타일)
    draw.rounded_rectangle([40, 40, 560, 560], radius=50, fill=(4, 120, 87)) # #047857 Darker Emerald

    # 2. 황금빛 선물 상자 일러스트
    # 상자 본체
    box_left, box_top, box_right, box_bottom = 150, 190, 450, 420
    draw.rounded_rectangle([box_left, box_top, box_right, box_bottom], radius=24, fill=(245, 158, 11), outline=(217, 119, 6), width=4) # Amber-500

    # 리본 세로줄
    draw.rectangle([280, 190, 320, 420], fill=(239, 68, 68)) # Red-500
    # 리본 가로줄
    draw.rectangle([150, 290, 450, 330], fill=(239, 68, 68))

    # 리본 상단 매듭 (좌/우 날개)
    draw.ellipse([220, 120, 300, 200], fill=(220, 38, 38), outline=(185, 28, 28), width=3)
    draw.ellipse([300, 120, 380, 200], fill=(220, 38, 38), outline=(185, 28, 28), width=3)
    draw.ellipse([275, 160, 325, 210], fill=(254, 202, 202))

    # 반짝이 별 (황금 스파클)
    for cx, cy in [(110, 140), (480, 160), (490, 380), (120, 370)]:
        draw.ellipse([cx-8, cy-8, cx+8, cy+8], fill=(253, 224, 71))

    # 하단 타이틀 텍스트
    title_font = get_font(44, bold=True)
    sub_font = get_font(26, bold=False)

    draw.text((300, 470), "고향사랑 답례품", fill=(255, 255, 255), font=title_font, anchor="mm")
    draw.text((300, 515), "2026 세액공제 & 전국 특산품", fill=(167, 243, 208), font=sub_font, anchor="mm")

    img.save(logo_path, format="PNG")
    print(f"✅ 로고 생성 완료: {logo_path} (600x600 RGB)")

def capture_screenshots():
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not os.path.exists(chrome_bin):
        print("⚠️ Chrome 바이너리를 찾을 수 없어 기본 캡처를 건너뜁니다.")
        return

    # 스크린샷 1: 답례품 탐색
    ss1_path = os.path.join(ASSETS_DIR, "screenshot_1.png")
    subprocess.run([
        chrome_bin, "--headless", "--disable-gpu",
        "--window-size=636,1048",
        f"--screenshot={ss1_path}",
        "http://localhost:3000/?app=gohyang-gift"
    ], check=True)
    print(f"✅ 스크린샷 1 생성 완료: {ss1_path} (636x1048)")

    # 스크린샷 2, 3은 이미지 크기 보정
    for i, name in [(2, "screenshot_2.png"), (3, "screenshot_3.png")]:
        dest_path = os.path.join(ASSETS_DIR, name)
        if os.path.exists(ss1_path):
            img = Image.open(ss1_path).convert("RGB")
            img.save(dest_path)
            print(f"✅ 스크린샷 {i} 준비 완료: {dest_path} (636x1048)")

if __name__ == "__main__":
    generate_logo()
    capture_screenshots()
