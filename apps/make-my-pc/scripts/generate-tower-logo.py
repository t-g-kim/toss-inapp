#!/usr/bin/env python3
"""
Desktop PC 본체 중심의 토스 앱 아이콘 생성기:
- 규격: 600 x 600 px PNG (RGB 100% 불투명 솔리드 배경)
- 모니터, 키보드, 텍스트 없이 "게이밍 PC 본체 타워"에만 100% 집중
- 60x60 모바일 아이콘 크기에서도 한눈에 데스크톱 PC 타워임을 식별할 수 있는 높은 시인성
"""

import os
import math
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

def draw_pc_tower_logo(draw, W=600, H=600, is_white=True):
    # 배경 채우기 (토스 심사 규정: 100% 불투명 RGB)
    bg_color = (255, 255, 255) if is_white else (49, 130, 246)
    draw.rectangle([0, 0, W, H], fill=bg_color)

    # 1. 은은한 바닥 접지 그림자 (Ground Soft Shadow)
    shadow_w, shadow_h = 350, 40
    shadow_cx, shadow_cy = 300, 532
    for i in range(12, 0, -1):
        color = (215, 225, 238) if is_white else (28, 78, 160)
        draw.ellipse(
            [
                shadow_cx - shadow_w // 2 - i * 2,
                shadow_cy - shadow_h // 2 - i,
                shadow_cx + shadow_w // 2 + i * 2,
                shadow_cy + shadow_h // 2 + i,
            ],
            fill=color,
        )

    # 2. 케이스 받침대 피트 (Chassis Rubber Feet)
    foot_color = (30, 41, 59)
    draw.rounded_rectangle([160, 516, 215, 534], radius=6, fill=foot_color)
    draw.rounded_rectangle([385, 516, 440, 534], radius=6, fill=foot_color)

    # 본체 좌표: X=135 ~ 465 (폭 330), Y=70 ~ 520 (높이 450)
    # 3. 본체 메인 섀시 프레임 (Chassis Outer Shell)
    chassis_bg = (15, 23, 42)      # 슬레이트 900 (#0F172A)
    border_blue = (49, 130, 246)   # 토스 블루 (#3182F6) 외곽 테두리 강조
    
    draw.rounded_rectangle([135, 70, 465, 520], radius=26, fill=chassis_bg, outline=border_blue, width=4)

    # 상단 탑 패널 & 배기 메쉬
    draw.rounded_rectangle([145, 78, 455, 102], radius=10, fill=(30, 41, 59))
    # 전원 버튼 (네온 시안 LED 링)
    draw.ellipse([430, 84, 444, 96], fill=(56, 189, 248))
    # 상단 I/O 포트들
    draw.rounded_rectangle([405, 88, 418, 92], radius=2, fill=(100, 116, 139))
    draw.rounded_rectangle([386, 88, 399, 92], radius=2, fill=(100, 116, 139))
    # 상단 쿨링 배기 슬릿 도트들
    for mx in range(165, 370, 18):
        draw.ellipse([mx, 88, mx + 5, 92], fill=(51, 65, 85))

    # 4. 전면부 프론트 패널 (우측 X=390 ~ 455, Y=108 ~ 512)
    draw.line([(390, 102), (390, 520)], fill=(51, 65, 85), width=3)
    draw.rounded_rectangle([393, 108, 455, 512], radius=12, fill=(24, 33, 47))
    
    # 전면 세로 에어로 다이내믹 RGB 스트립 라인
    draw.line([(404, 125), (404, 495)], fill=(56, 189, 248), width=3)
    # 전면 통풍 에어벤트 그릴 슬릿들
    for slit_y in range(130, 495, 18):
        draw.rounded_rectangle([415, slit_y, 446, slit_y + 8], radius=4, fill=(15, 23, 42))

    # 5. 측면 파노라믹 쇼케이스 강화유리 윈도우 (좌측 X=145 ~ 385, Y=108 ~ 512)
    draw.rounded_rectangle([145, 108, 385, 512], radius=14, fill=(10, 15, 28), outline=(51, 65, 85), width=2)

    # 6. 하단 파워서플라이 체임버 슈라우드 (PSU Chamber Deck)
    # X=145 ~ 385, Y=428 ~ 512
    draw.rounded_rectangle([145, 428, 385, 512], radius=8, fill=(19, 27, 44), outline=(30, 41, 59), width=2)
    # 골드 인증 뱃지 & 텍스트
    draw.rounded_rectangle([165, 455, 202, 485], radius=6, fill=(217, 119, 6), outline=(251, 191, 36), width=2)
    draw.text((183, 470), "80+", fill=(255, 255, 255), font=get_font(12, bold=True), anchor="mm")
    draw.text((275, 470), "850W GOLD ATX 3.0", fill=(148, 163, 184), font=get_font(13, bold=True), anchor="mm")

    # 7. 내부 하드웨어 - 메탈릭 그래픽카드 (GeForce RTX High-End GPU)
    # X=155 ~ 378, Y=315 ~ 375
    draw.rounded_rectangle([155, 315, 378, 375], radius=10, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
    # GPU 상단 메탈 백플레이트 립 & PCIe 골드 커넥터
    draw.rectangle([155, 312, 195, 315], fill=(245, 158, 11))
    # GPU 측면 네온 ARGB 스트립 라인 (시안 & 퍼플)
    draw.rounded_rectangle([165, 323, 368, 331], radius=4, fill=(56, 189, 248))
    # GPU 엠블럼 텍스트
    draw.text((245, 352), "GEFORCE RTX 4070", fill=(255, 255, 255), font=get_font(14, bold=True), anchor="mm")
    # GPU 처짐 방지 알루미늄 지지대 (우측 수직 실린더)
    draw.rounded_rectangle([356, 335, 368, 428], radius=3, fill=(148, 163, 184))

    # 8. 내부 하드웨어 - 수랭 CPU 쿨러 워터블록 (Infinity Mirror Pump)
    cx, cy = 235, 212
    # 외곽 마젠타 네온 링
    draw.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=(15, 23, 42), outline=(236, 72, 153), width=4)
    # 중간 일렉트릭 블루 링
    draw.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], outline=(56, 189, 248), width=3)
    # 중앙 네온 코어
    draw.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=(59, 130, 246))
    # 수랭 슬리빙 튜브 호스 2가닥 (상단 라디에이터로 연결)
    draw.arc([195, 115, 285, 220], 195, 345, fill=(71, 85, 105), width=6)
    draw.arc([210, 120, 300, 225], 195, 345, fill=(51, 65, 85), width=6)

    # 9. 내부 하드웨어 - DDR5 듀얼 ARGB 메모리 (RAM)
    for idx, rx in enumerate([305, 324]):
        # RAM 방열판 바디
        draw.rounded_rectangle([rx, 165, rx + 12, 260], radius=4, fill=(51, 65, 85))
        # 상단 ARGB 디퓨저 바
        glow_color = (244, 114, 182) if idx == 0 else (56, 189, 248)
        draw.rounded_rectangle([rx, 165, rx + 12, 192], radius=4, fill=glow_color)

    # 10. 상단 2열 배기 ARGB 쿨링 팬 (Dual 120mm Exhaust Fans)
    fan_y = 138
    for fx, f_color in [(210, (56, 189, 248)), (295, (236, 72, 153))]:
        fr = 25
        # 네온 링
        draw.ellipse([fx - fr, fan_y - fr, fx + fr, fan_y + fr], outline=f_color, width=3)
        # 중심 허브
        draw.ellipse([fx - 9, fan_y - 9, fx + 9, fan_y + 9], fill=f_color)
        # 블레이드 살
        for angle in [0, 90, 180, 270]:
            rad = math.radians(angle)
            bx = fx + math.cos(rad) * 17
            by = fan_y + math.sin(rad) * 17
            draw.line([(fx, fx_y := fan_y), (bx, by)], fill=(224, 242, 254), width=2)

    # 11. 후면 120mm 배기 팬 (좌측 X=168, Y=212)
    rf_x, rf_y = 166, 212
    rf_r = 18
    draw.ellipse([rf_x - rf_r, rf_y - rf_r, rf_x + rf_r, rf_y + rf_r], outline=(56, 189, 248), width=3)
    draw.ellipse([rf_x - 7, rf_y - 7, rf_x + 7, rf_y + 7], fill=(56, 189, 248))

    # 12. 강화유리 엣지 베벨 및 슬림 하이라이트 (시야 방해 없는 투명 광택)
    # 우측 상단 모서리 쪽 섬세한 광택 라인만 적용
    draw.line([(150, 114), (380, 114)], fill=(71, 85, 105), width=2)
    draw.line([(380, 114), (380, 424)], fill=(71, 85, 105), width=2)
    draw.line([(320, 118), (378, 176)], fill=(148, 163, 184), width=2)

def generate_all():
    W, H = 600, 600
    
    # 1. 메인 로고 (순백색 #FFFFFF 불투명 솔리드 배경 - 토스 심사 최고 통과율)
    img_white = Image.new("RGB", (W, H), (255, 255, 255))
    draw_pc_tower_logo(ImageDraw.Draw(img_white), W, H, is_white=True)
    
    main_logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img_white.save(main_logo_path, "PNG")
    print(f"✓ 메인 PC본체 로고(600x600 순백색) 생성 완료: {main_logo_path}")

    # 백업용 화이트
    white_path = os.path.join(ASSETS_DIR, "logo_white.png")
    img_white.save(white_path, "PNG")

    # 2. 브랜드 블루 버전
    img_blue = Image.new("RGB", (W, H), (49, 130, 246))
    draw_pc_tower_logo(ImageDraw.Draw(img_blue), W, H, is_white=False)
    blue_path = os.path.join(ASSETS_DIR, "logo_blue.png")
    img_blue.save(blue_path, "PNG")
    print(f"✓ 브랜드 블루 로고(600x600 토스블루) 생성 완료: {blue_path}")

if __name__ == "__main__":
    generate_all()
