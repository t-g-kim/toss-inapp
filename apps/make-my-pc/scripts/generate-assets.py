#!/usr/bin/env python3
"""
Apps in Toss 공식 에셋 생성 스크립트:
- 규격: 600 x 600 px PNG
- 토스 심사 규정 100% 준수:
  1. 투명 배경(Alpha channel) 완전 금지 (RGB 모드 100% 불투명 솔리드 배경)
  2. 캔버스 외곽 둥근 모서리 마스킹 금지 (토스 앱이 자체적으로 squircle 마스킹을 수행하므로 전체 600x600 직각 채움 필수)
  3. 브랜드 대표 컬러(#3182F6) 또는 순백색(#FFFFFF) 전체 배경 사용
"""

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

def draw_pc_setup(draw, is_white=True):
    # 테마별 색상 팔레트
    if is_white:
        card_fill = (248, 250, 252)      # Slate-50
        card_border = (226, 232, 240)    # Slate-200
        text_primary = (15, 23, 42)      # Slate-900
        text_secondary = (37, 99, 235)   # Blue-600
        fps_bg = (37, 99, 235)           # Blue-600
    else:
        card_fill = (15, 23, 42)         # Slate-900
        card_border = (59, 130, 246)     # Blue-500
        text_primary = (255, 255, 255)   # White
        text_secondary = (191, 219, 254) # Blue-200
        fps_bg = (37, 99, 235)

    # 1. 내부 무대 카드 (중앙에만 은은한 라운딩, 외곽은 전체 캔버스 배경 유지)
    draw.rounded_rectangle([36, 36, 564, 456], radius=44, fill=card_fill, outline=card_border, width=2)

    # 2. 게이밍 모니터 (좌측 후면)
    # 모니터 베젤
    draw.rounded_rectangle([75, 95, 370, 290], radius=14, fill=(30, 41, 59), outline=(71, 85, 105), width=3)
    # 모니터 화면 (토스 블루)
    draw.rounded_rectangle([86, 106, 359, 279], radius=8, fill=fps_bg)
    # 모니터 내 벤치마크 FPS 그래프 곡선
    draw.line([(100, 235), (150, 195), (205, 225), (260, 150), (345, 170)], fill=(147, 197, 253), width=5)
    draw.text((220, 125), "165 FPS", fill=(255, 255, 255), font=get_font(20, bold=True), anchor="mm")
    # 모니터 스탠드 & 받침대
    draw.rectangle([210, 290, 238, 340], fill=(71, 85, 105))
    draw.rounded_rectangle([165, 335, 285, 352], radius=6, fill=(100, 116, 139))

    # 3. 데스크톱 게이밍 PC 본체 타워 (우측 전면 입체 배치)
    # 케이스 본체 바디
    draw.rounded_rectangle([305, 120, 495, 400], radius=18, fill=(15, 23, 42), outline=(49, 130, 246), width=4)
    # 전면부 프론트 패널
    draw.rounded_rectangle([455, 128, 487, 392], radius=8, fill=(30, 41, 59))
    draw.ellipse([466, 140, 476, 150], fill=(59, 130, 246)) # 전원 LED
    # 측면 투명 강화유리 패널
    draw.rounded_rectangle([315, 130, 450, 388], radius=10, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
    # 상단 배기 RGB 쿨링팬
    draw.ellipse([355, 150, 410, 205], outline=(236, 72, 153), width=4)
    draw.ellipse([370, 165, 395, 190], fill=(236, 72, 153))
    # 중앙 타워형 CPU 쿨러
    draw.ellipse([355, 218, 410, 273], outline=(59, 130, 246), width=4)
    draw.ellipse([370, 233, 395, 258], fill=(59, 130, 246))
    # 그래픽카드 (RTX)
    draw.rounded_rectangle([325, 290, 440, 320], radius=6, fill=(30, 41, 59), outline=(16, 185, 129), width=2)
    draw.text((382, 305), "RTX 4070", fill=(16, 185, 129), font=get_font(11, bold=True), anchor="mm")
    # 하단 파워서플라이 슈라우드
    draw.rectangle([315, 340, 450, 388], fill=(30, 41, 59))
    draw.text((382, 365), "850W GOLD", fill=(148, 163, 184), font=get_font(11, bold=True), anchor="mm")

    # 4. 하단 게이밍 키보드 & 마우스 실루엣
    draw.rounded_rectangle([90, 365, 270, 382], radius=4, fill=(51, 65, 85))
    draw.rounded_rectangle([282, 363, 298, 384], radius=6, fill=(51, 65, 85))

    # 5. 하단 타이포그래피 "PC 조립"
    font_title = get_font(52, bold=True)
    draw.text((300, 495), "PC 조립", fill=text_primary, font=font_title, anchor="mm")

    font_sub = get_font(23, bold=True)
    draw.text((300, 550), "가상 견적 & 게임 벤치마크", fill=text_secondary, font=font_sub, anchor="mm")

def build_logos():
    # 1. 메인 로고 (순백색 #FFFFFF 불투명 솔리드 배경 - 토스 심사 최고 통과율)
    img_white = Image.new("RGB", (600, 600), (255, 255, 255))
    draw_pc_setup(ImageDraw.Draw(img_white), is_white=True)
    
    logo_main_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img_white.save(logo_main_path, "PNG")
    print(f"✓ 메인 로고(순백색 불투명 600x600) 생성 완료: {logo_main_path}")

    # 백업용 화이트 로고
    logo_white_copy = os.path.join(ASSETS_DIR, "logo_white.png")
    img_white.save(logo_white_copy, "PNG")

    # 2. 브랜드 블루(#3182F6) 로고 (대체 옵션)
    img_blue = Image.new("RGB", (600, 600), (49, 130, 246))
    draw_pc_setup(ImageDraw.Draw(img_blue), is_white=False)
    
    logo_blue_path = os.path.join(ASSETS_DIR, "logo_blue.png")
    img_blue.save(logo_blue_path, "PNG")
    print(f"✓ 브랜드 블루 로고(토스블루 불투명 600x600) 생성 완료: {logo_blue_path}")

if __name__ == "__main__":
    build_logos()
