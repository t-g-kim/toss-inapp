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

def generate_pc_logo():
    """
    600 x 600 px PC 조립 전문 아이콘
    - 데스크탑 게이밍 PC 본체 타워 + 강화유리 + RGB 쿨러 팬 + 듀얼 모니터 실루엣
    - 세련된 토스 블루 & 다크 섀도우 그라데이션
    """
    img = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. 둥근 모서리 사각형 배경 (세련된 다크 블루-네이비 #0F172A)
    draw.rounded_rectangle([20, 20, 580, 580], radius=120, fill=(15, 23, 42, 255))

    # 내부 은은한 블루 그라디언트 링
    draw.rounded_rectangle([28, 28, 572, 572], radius=112, outline=(49, 130, 246, 120), width=3)

    # 2. 데스크탑 모니터 (좌측/중앙 뒤쪽)
    # 모니터 화면 (외곽 베젤)
    draw.rounded_rectangle([70, 110, 390, 310], radius=16, fill=(30, 41, 59, 255), outline=(71, 85, 105, 255), width=4)
    # 모니터 디스플레이 (토스 블루 빛)
    draw.rounded_rectangle([82, 122, 378, 298], radius=10, fill=(37, 99, 235, 255))
    # 모니터 화면 안의 게임 FPS 그래프 라인
    draw.line([(100, 250), (160, 210), (220, 240), (280, 160), (360, 180)], fill=(147, 197, 253, 255), width=5)
    draw.text((230, 140), "165 FPS", fill=(255, 255, 255, 255), font=get_font(22, bold=True), anchor="mm")
    # 모니터 스탠드 & 받침대
    draw.rectangle([215, 310, 245, 360], fill=(71, 85, 105, 255))
    draw.rounded_rectangle([170, 355, 290, 372], radius=6, fill=(100, 116, 139, 255))

    # 3. 게이밍 PC 본체 케이스 (우측 앞쪽으로 입체 배치)
    # 타워 본체 외곽
    draw.rounded_rectangle([320, 140, 510, 430], radius=18, fill=(30, 41, 59, 255), outline=(49, 130, 246, 255), width=5)
    # 전면 패널 (우측)
    draw.rounded_rectangle([470, 148, 502, 422], radius=8, fill=(15, 23, 42, 255))
    # 전면 전원 버튼
    draw.ellipse([481, 160, 491, 170], fill=(59, 130, 246, 255))

    # 내부 투명 강화유리 영역
    draw.rounded_rectangle([330, 150, 465, 415], radius=10, fill=(15, 23, 42, 255), outline=(71, 85, 105, 255), width=2)

    # 내부 RGB 쿨링팬 3개 (빛나는 네온 링)
    # 상단 쿨러
    draw.ellipse([370, 170, 425, 225], outline=(236, 72, 153, 255), width=4)
    draw.ellipse([385, 185, 410, 210], fill=(236, 72, 153, 255))
    # 중앙 CPU 쿨러
    draw.ellipse([370, 240, 425, 295], outline=(59, 130, 246, 255), width=4)
    draw.ellipse([385, 255, 410, 280], fill=(59, 130, 246, 255))
    # 그래픽카드 실루엣
    draw.rounded_rectangle([340, 315, 455, 345], radius=6, fill=(51, 65, 85, 255), outline=(16, 185, 129, 255), width=2)
    draw.text((397, 330), "RTX", fill=(16, 185, 129, 255), font=get_font(12, bold=True), anchor="mm")
    # 하단 파워 슈라우드
    draw.rectangle([330, 365, 465, 415], fill=(30, 41, 59, 255))
    draw.text((397, 390), "850W", fill=(148, 163, 184, 255), font=get_font(13, bold=True), anchor="mm")

    # 4. 하단 타이틀 타이포그래피 "PC 조립"
    font_title = get_font(52, bold=True)
    draw.text((300, 480), "PC 조립", fill=(255, 255, 255, 255), font=font_title, anchor="mm")

    font_sub = get_font(24, bold=True)
    draw.text((300, 535), "가상 견적 & 3D 벤치마크", fill=(147, 197, 253, 255), font=font_sub, anchor="mm")

    logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img.save(logo_path, "PNG")
    print(f"✓ New PC Logo generated: {logo_path}")

if __name__ == "__main__":
    generate_pc_logo()
