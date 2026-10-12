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

# 1. logo_600x600.png
def generate_logo():
    img = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 둥근 모서리 사각형 배경 (싸이월드 시그니처 오렌지 #FF7710)
    draw.rounded_rectangle([20, 20, 580, 580], radius=120, fill=(255, 119, 16, 255))

    # 내부 레트로 미니홈피 창 프레임
    draw.rounded_rectangle([90, 90, 510, 430], radius=30, fill=(255, 255, 255, 255))
    # 헤더 바 (주황 라인)
    draw.rounded_rectangle([105, 105, 495, 150], radius=12, fill=(254, 215, 170, 255))
    draw.text((300, 127), "TODAY 482 | TOTAL 13,850", fill=(194, 65, 12, 255), font=get_font(20, bold=True), anchor="mm")

    # 미니룸 도트 캐릭터 & 말풍선
    # 말풍선
    draw.rounded_rectangle([170, 170, 430, 240], radius=16, fill=(248, 250, 252, 255), outline=(30, 41, 59, 255), width=3)
    draw.text((300, 205), "ㄴr는 ㄱr끔 눈물을...", fill=(15, 23, 42, 255), font=get_font(22, bold=True), anchor="mm")

    # 도트 미니미 캐릭터 (머리, 눈, 헤드폰)
    draw.ellipse([250, 260, 350, 360], fill=(254, 240, 138, 255), outline=(15, 23, 42, 255), width=4)
    # 헤어
    draw.polygon([(260, 290), (300, 250), (340, 290), (300, 270)], fill=(120, 53, 15, 255))
    # 헤드폰
    draw.arc([235, 245, 365, 365], 180, 0, fill=(2, 132, 199, 255), width=8)
    draw.rectangle([235, 280, 255, 330], fill=(2, 132, 199, 255))
    draw.rectangle([345, 280, 365, 330], fill=(2, 132, 199, 255))

    # 하단 텍스트 "싸이감성"
    font_title = get_font(52, bold=True)
    draw.text((300, 480), "싸이감성", fill=(255, 255, 255, 255), font=font_title, anchor="mm")

    font_sub = get_font(26, bold=True)
    draw.text((300, 535), "미니홈피 & 도트 미니룸", fill=(254, 215, 170, 255), font=font_sub, anchor="mm")

    logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img.save(logo_path, "PNG")
    print(f"✓ Logo generated: {logo_path}")

# 2. screenshot 헬퍼 (636 x 1048 px)
def generate_screenshot(filename, header_badge, title, subtitle, render_content_fn):
    W, H = 636, 1048
    img = Image.new("RGB", (W, H), (244, 244, 244))
    draw = ImageDraw.Draw(img)

    # 상단 오렌지 헤더 배지
    draw.rounded_rectangle([24, 40, 160, 75], radius=12, fill=(255, 237, 213))
    font_badge = get_font(18, bold=True)
    draw.text((92, 57), header_badge, fill=(234, 88, 12), font=font_badge, anchor="mm")

    font_h1 = get_font(36, bold=True)
    draw.text((28, 125), title, fill=(15, 23, 42), font=font_h1)

    font_h2 = get_font(21)
    draw.text((28, 175), subtitle, fill=(100, 116, 139), font=font_h2)

    # 메인 컨텐츠 카드 프레임
    card_box = [28, 230, W - 28, H - 50]
    draw.rounded_rectangle(card_box, radius=28, fill=(255, 255, 255), outline=(226, 232, 240), width=2)

    render_content_fn(draw, 28, 230, W - 56, H - 280)

    out_path = os.path.join(ASSETS_DIR, filename)
    img.save(out_path, "PNG")
    print(f"✓ Screenshot generated: {out_path}")

# 스크린샷 1: 미니룸 & 홈 화면
def render_ss1(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    # 미니홈피 창 프레임
    draw.rounded_rectangle([x + 20, y + 20, x + w - 20, y + 420], radius=20, fill=(228, 231, 235), outline=(148, 163, 184), width=2)

    # TODAY 바
    draw.rounded_rectangle([x + 35, y + 35, x + w - 35, y + 75], radius=10, fill=(248, 250, 252))
    draw.text((x + 50, y + 55), "TODAY 482 | TOTAL 13,850", fill=(225, 29, 72), font=get_font(14, bold=True), anchor="lm")
    draw.text((x + w - 50, y + 55), "▶ BGM: 프리스타일 - Y", fill=(180, 83, 9), font=get_font(13, bold=True), anchor="rm")

    # 미니룸 캔버스
    draw.rounded_rectangle([x + 35, y + 85, x + w - 35, y + 400], radius=14, fill=(254, 215, 170))
    # 마룻바닥
    draw.rectangle([x + 35, y + 250, x + w - 35, y + 400], fill=(217, 119, 6))

    # 캐릭터 & 말풍선
    draw.rounded_rectangle([x + 150, y + 130, x + 430, y + 195], radius=14, fill=(255, 255, 255), outline=(15, 23, 42), width=2)
    draw.text((x + 290, y + 162), "ㄴr는 ㄱr끔 눈물을 흘린ㄷr...💧", fill=(15, 23, 42), font=get_font(16, bold=True), anchor="mm")

    # 미니미
    draw.ellipse([x + 250, y + 215, x + 330, y + 295], fill=(254, 240, 138), outline=(15, 23, 42), width=2)
    draw.rectangle([x + 265, y + 295, x + 315, y + 350], fill=(59, 130, 246), outline=(15, 23, 42), width=2)

    # 소품 (CRT 모니터 & 곰인형)
    draw.rectangle([x + 60, y + 260, x + 130, y + 330], fill=(226, 232, 240), outline=(71, 85, 105), width=2)
    draw.text((x + 95, y + 295), "🖥️", font=get_font(30), anchor="mm")
    draw.text((x + w - 90, y + 295), "🧸", font=get_font(34), anchor="mm")

    # 하단 일촌평 카드
    draw.rounded_rectangle([x + 20, y + 445, x + w - 20, y + 680], radius=18, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    draw.text((x + 40, y + 475), "💌 일촌평 (3)", fill=(15, 23, 42), font=font_lg)

    comments = [
        ("[영혼의 단짝] 짱구", "야 오늘 방과후에 노래방 가서 버즈 부를 사람? ㅋㅋㅋ"),
        ("[첫사랑] 유진", "들렀다 간다~ BGM 선곡 대박이네 ^^ 감기 조심해!"),
        ("[동네 친구] 철수", "퍼가요~♡ 도토리 1개 쐈다! 일촌평 남기고 감"),
    ]
    cy = y + 510
    for author, ctext in comments:
        draw.rounded_rectangle([x + 40, cy, x + w - 40, cy + 46], radius=10, fill=(255, 255, 255), outline=(226, 232, 240))
        draw.text((x + 55, cy + 23), f"{author}: {ctext}", fill=(30, 41, 59), font=get_font(13), anchor="lm")
        cy += 54

# 스크린샷 2: 미니룸 도트 가구 꾸미기
def render_ss2(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    draw.text((x + 40, y + 30), "🛋️ 미니룸 테마 & 도트 소품 배치", fill=(15, 23, 42), font=font_lg)
    draw.text((x + 40, y + 60), "클릭 한 번으로 레트로 소품을 방에 배치해 보세요", fill=(100, 116, 139), font=font_sm)

    # 테마 선택 카드들
    themes = [("시그니처 오렌지", "인기 1위", (254, 215, 170)), ("하늘색 꿈", "Y2K 감성", (186, 230, 253)), ("딸기우유 핑크", "러블리", (251, 207, 232)), ("미드나잇 사이버", "새벽 감성", (30, 27, 75))]
    tx, ty = x + 30, y + 95
    for tname, ttag, color in themes:
        draw.rounded_rectangle([tx, ty, tx + 245, ty + 70], radius=14, fill=(255, 255, 255), outline=(234, 88, 12) if "오렌지" in tname else (226, 232, 240), width=2 if "오렌지" in tname else 1)
        draw.text((tx + 20, ty + 25), tname, fill=(15, 23, 42), font=get_font(15, bold=True))
        draw.text((tx + 20, ty + 48), ttag, fill=(100, 116, 139), font=get_font(12))
        draw.ellipse([tx + 195, ty + 20, tx + 225, ty + 50], fill=color, outline=(148, 163, 184))
        if tx + 260 < x + w - 50:
            tx += 265
        else:
            tx = x + 30
            ty += 85

    # 소품 그리드
    draw.text((x + 40, ty + 20), "🎮 소품 보관함 (8종)", fill=(15, 23, 42), font=font_lg)
    props = [("🖥️", "배불뚝이 CRT 모니터"), ("📻", "LP 오디오 턴테이블"), ("🧸", "특대형 테디베어"), ("🎸", "통기타 스탠드"), ("🛏️", "체크무늬 싱글 침대"), ("🪞", "감성 전신 거울")]
    px, py = x + 30, ty + 55
    for icon, pname in props:
        draw.rounded_rectangle([px, py, px + 245, py + 65], radius=12, fill=(240, 253, 244), outline=(16, 185, 129), width=1)
        draw.text((px + 20, py + 32), icon, font=get_font(24), anchor="lm")
        draw.text((px + 60, py + 32), pname, fill=(15, 23, 42), font=get_font(13, bold=True), anchor="lm")
        if px + 260 < x + w - 50:
            px += 265
        else:
            px = x + 30
            py += 75

# 스크린샷 3: BGM 주크박스 & 다이어리
def render_ss3(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    draw.text((x + 40, y + 30), "📻 2000년대 전설의 싸이 BGM 선곡", fill=(15, 23, 42), font=font_lg)
    draw.text((x + 40, y + 60), "미니홈피 대표곡을 설정하면 사운드웨이브가 재생됩니다", fill=(100, 116, 139), font=font_sm)

    tracks = [
        ("Y (Please Tell Me Why)", "프리스타일 (2004)", True),
        ("Fly (feat. Amin. J)", "에픽하이 (2005)", False),
        ("사랑했나봐", "윤도현 (2005)", False),
        ("She Is", "클래지콰이 (2005)", False),
    ]
    ty = y + 95
    for title, artist, is_curr in tracks:
        draw.rounded_rectangle([x + 30, ty, x + w - 30, ty + 55], radius=14, fill=(255, 247, 237) if is_curr else (255, 255, 255), outline=(234, 88, 12) if is_curr else (226, 232, 240), width=2 if is_curr else 1)
        draw.text((x + 50, ty + 20), title, fill=(15, 23, 42), font=get_font(15, bold=True))
        draw.text((x + 50, ty + 40), artist, fill=(100, 116, 139), font=get_font(12))
        draw.text((x + w - 60, ty + 27), "재생중" if is_curr else "설정", fill=(234, 88, 12) if is_curr else (148, 163, 184), font=get_font(13, bold=True), anchor="rm")
        ty += 65

    # 감성 다이어리 카드
    draw.rounded_rectangle([x + 30, ty + 20, x + w - 30, ty + 260], radius=18, fill=(30, 41, 59))
    draw.text((x + 50, ty + 45), "📖 2005.10.12 WED · 감성 다이어리", fill=(148, 163, 184), font=get_font(13))
    draw.text((x + 50, ty + 90), '"ㄴr는 ㄱr끔 눈물을 흘린ㄷr...\n소리 없이 흐르는 눈물이 내 맘을 전해줄까...\n음악만이 나라가 허락하는 유일한 마약이니까..."', fill=(255, 255, 255), font=get_font(16), spacing=10)
    draw.text((x + w - 50, ty + 225), "- 반짝이는별의 일기장에서 -", fill=(148, 163, 184), font=get_font(13), anchor="rm")

def main():
    generate_logo()
    generate_screenshot("screenshot_1.png", "CYWORLD", "싸이감성 미니홈피 & 미니룸", "그 시절 우리가 사랑했던 레트로 SNS 감성", render_ss1)
    generate_screenshot("screenshot_2.png", "미니룸", "도트 캐릭터 & 가구 소품 꾸미기", "CRT 모니터·턴테이블·곰인형으로 나만의 방 완성", render_ss2)
    generate_screenshot("screenshot_3.png", "BGM", "전설의 싸이월드 BGM 주크박스", "프리스타일 Y·에픽하이 Fly 명곡 감성 소환", render_ss3)
    print("🎉 All CyMini assets generated successfully!")

if __name__ == "__main__":
    main()
