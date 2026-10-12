#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../assets"))
os.makedirs(ASSETS_DIR, exist_ok=True)

# 폰트 로드 헬퍼 (macOS 기본 폰트)
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

    # 둥근 모서리 사각형 배경 (토스 블루 그라데이션 시뮬레이션)
    draw.rounded_rectangle([20, 20, 580, 580], radius=120, fill=(49, 130, 246, 255))

    # 내부 3D 룸 평면도 그래픽 (아이소메트릭 그리드 및 가구 블록)
    # 바닥면
    draw.polygon([(300, 150), (480, 250), (300, 350), (120, 250)], fill=(30, 41, 59, 255))
    # 벽면 (후면 좌/우)
    draw.polygon([(120, 250), (300, 150), (300, 100), (120, 200)], fill=(71, 85, 105, 255))
    draw.polygon([(300, 150), (480, 250), (480, 200), (300, 100)], fill=(51, 65, 85, 255))

    # 3D 침대 블록
    draw.polygon([(260, 210), (360, 265), (310, 295), (210, 240)], fill=(241, 245, 249, 255))
    draw.polygon([(210, 240), (310, 295), (310, 315), (210, 260)], fill=(203, 213, 225, 255))
    draw.polygon([(310, 295), (360, 265), (360, 285), (310, 315)], fill=(148, 163, 184, 255))

    # 3D 책상 블록
    draw.polygon([(170, 260), (220, 230), (240, 240), (190, 270)], fill=(245, 158, 11, 255))

    # 하단 텍스트 "RoomFit"
    font_title = get_font(52, bold=True)
    draw.text((300, 420), "RoomFit", fill=(255, 255, 255, 255), font=font_title, anchor="mm")

    font_sub = get_font(28, bold=True)
    draw.text((300, 475), "원룸 가구 배치 3D", fill=(219, 234, 254, 255), font=font_sub, anchor="mm")

    logo_path = os.path.join(ASSETS_DIR, "logo_600x600.png")
    img.save(logo_path, "PNG")
    print(f"✓ Logo generated: {logo_path}")

# 2. screenshot 헬퍼 (636 x 1048 px)
def generate_screenshot(filename, header_badge, title, subtitle, render_content_fn):
    W, H = 636, 1048
    img = Image.new("RGB", (W, H), (249, 250, 251))
    draw = ImageDraw.Draw(img)

    # 상단 헤더 영역
    draw.rounded_rectangle([24, 40, 160, 75], radius=12, fill=(239, 246, 255))
    font_badge = get_font(18, bold=True)
    draw.text((92, 57), header_badge, fill=(49, 130, 246), font=font_badge, anchor="mm")

    font_h1 = get_font(36, bold=True)
    draw.text((28, 125), title, fill=(15, 23, 42), font=font_h1)

    font_h2 = get_font(21)
    draw.text((28, 175), subtitle, fill=(100, 116, 139), font=font_h2)

    # 메인 컨텐츠 카드 프레임
    card_box = [28, 230, W - 28, H - 50]
    draw.rounded_rectangle(card_box, radius=28, fill=(255, 255, 255), outline=(226, 232, 240), width=2)

    # 컨텐츠 그리기 콜백
    render_content_fn(draw, 28, 230, W - 56, H - 280)

    out_path = os.path.join(ASSETS_DIR, filename)
    img.save(out_path, "PNG")
    print(f"✓ Screenshot generated: {out_path}")

# 스크린샷 1: 2D 인터랙티브 평면도
def render_ss1(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    # 탭 메뉴
    draw.rounded_rectangle([x + 20, y + 20, x + 160, y + 65], radius=14, fill=(239, 246, 255), outline=(49, 130, 246))
    draw.text((x + 90, y + 42), "7평 표준 원룸", fill=(49, 130, 246), font=font_sm, anchor="mm")

    draw.rounded_rectangle([x + 175, y + 20, x + 300, y + 65], radius=14, fill=(241, 245, 249))
    draw.text((x + 237, y + 42), "5평 컴팩트", fill=(100, 116, 139), font=font_sm, anchor="mm")

    # 평면도 캔버스 시뮬레이션
    canvas_box = [x + 20, y + 85, x + w - 20, y + 480]
    draw.rounded_rectangle(canvas_box, radius=20, fill=(15, 23, 42))

    # 방 바닥면
    draw.rounded_rectangle([x + 40, y + 105, x + w - 40, y + 460], radius=8, fill=(248, 250, 252))

    # 창문 채광
    draw.rectangle([x + 120, y + 100, x + 340, y + 108], fill=(56, 189, 248))
    draw.text((x + 230, y + 85), "☀️ 창문 채광 (210cm)", fill=(56, 189, 248), font=get_font(13), anchor="mm")

    # 가구들 배치
    # 침대
    draw.rounded_rectangle([x + 240, y + 130, x + 360, y + 330], radius=6, fill=(226, 232, 240), outline=(100, 116, 139), width=2)
    draw.text((x + 300, y + 230), "슈퍼싱글\n110×200", fill=(15, 23, 42), font=get_font(14, bold=True), anchor="mm", align="center")

    # 책상
    draw.rounded_rectangle([x + 60, y + 130, x + 180, y + 200], radius=6, fill=(71, 85, 105), outline=(30, 41, 59), width=2)
    draw.text((x + 120, y + 165), "컴퓨터책상\n120×60", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="mm", align="center")

    # 옷장
    draw.rounded_rectangle([x + 60, y + 240, x + 140, y + 360], radius=6, fill=(51, 65, 85), outline=(15, 23, 42), width=2)
    draw.text((x + 100, y + 300), "2문옷장\n80×60", fill=(255, 255, 255), font=get_font(13, bold=True), anchor="mm", align="center")

    # 문 개폐 호 (현관문 90cm)
    draw.arc([x + 140, y + 360, x + 320, y + 540], 180, 270, fill=(16, 185, 129), width=3)
    draw.text((x + 230, y + 435), "✓ 현관문 (안전)", fill=(16, 185, 129), font=get_font(13, bold=True), anchor="mm")

    # 하단 쾌적도 카드
    draw.rounded_rectangle([x + 20, y + 505, x + w - 20, y + 680], radius=18, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    draw.text((x + 40, y + 535), "✨ 공간 쾌적도 진단 통과", fill=(15, 23, 42), font=font_lg)
    draw.text((x + 40, y + 565), "가구 점유율 32% (쾌적) · 여유 공간 4.6평 확보", fill=(100, 116, 139), font=font_sm)

    # 프로그레스 바
    draw.rounded_rectangle([x + 40, y + 600, x + w - 40, y + 616], radius=8, fill=(226, 232, 240))
    draw.rounded_rectangle([x + 40, y + 600, x + 210, y + 616], radius=8, fill=(16, 185, 129))
    draw.text((x + 40, y + 645), "✓ 문 열림 간섭 0건 · 보행 동선 80cm 충분", fill=(16, 185, 129), font=font_sm)

# 스크린샷 2: 3D 아이소메트릭 룸 뷰어
def render_ss2(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    # 3D 룸 캔버스 영역
    room_box = [x + 20, y + 20, x + w - 20, y + 460]
    draw.rounded_rectangle(room_box, radius=22, fill=(15, 23, 42))

    # 3D 룸 아이소메트릭 렌더링 시뮬레이션
    cx, cy = x + w // 2, y + 260
    # 마룻바닥
    draw.polygon([(cx, cy - 120), (cx + 200, cy - 20), (cx, cy + 100), (cx - 200, cy - 20)], fill=(236, 220, 200))
    # 후면 벽들
    draw.polygon([(cx - 200, cy - 20), (cx, cy - 120), (cx, cy - 220), (cx - 200, cy - 120)], fill=(241, 245, 249))
    draw.polygon([(cx, cy - 120), (cx + 200, cy - 20), (cx + 200, cy - 120), (cx, cy - 220)], fill=(203, 213, 225))

    # 창문 빛
    draw.polygon([(cx - 80, cy - 180), (cx + 60, cy - 150), (cx + 60, cy - 90), (cx - 80, cy - 120)], fill=(56, 189, 248))

    # 3D 침대
    draw.polygon([(cx + 40, cy - 70), (cx + 140, cy - 20), (cx + 90, cy + 20), (cx - 10, cy - 30)], fill=(255, 255, 255))
    draw.polygon([(cx - 10, cy - 30), (cx + 90, cy + 20), (cx + 90, cy + 40), (cx - 10, cy - 10)], fill=(203, 213, 225))

    # 3D 책상
    draw.polygon([(cx - 140, cy - 60), (cx - 60, cy - 100), (cx - 40, cy - 90), (cx - 120, cy - 50)], fill=(71, 85, 105))

    draw.text((cx, y + 50), "3D 룸 자유 궤도 회전", fill=(255, 255, 255), font=get_font(17, bold=True), anchor="mm")

    # 4가지 앵글 프리셋 버튼들
    draw.rounded_rectangle([x + 20, y + 490, x + w - 20, y + 680], radius=18, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    draw.text((x + 40, y + 520), "🎮 4대 시점 프리셋 즉시 전환", fill=(15, 23, 42), font=font_lg)

    buttons = ["아이소 45°", "탑뷰 90°", "정면 시점", "창가 시점"]
    bx = x + 35
    for b in buttons:
        draw.rounded_rectangle([bx, y + 555, bx + 115, y + 605], radius=12, fill=(239, 246, 255) if "45" in b else (255, 255, 255), outline=(49, 130, 246) if "45" in b else (226, 232, 240), width=1)
        draw.text((bx + 57, y + 580), b, fill=(49, 130, 246) if "45" in b else (100, 116, 139), font=get_font(14, bold=True), anchor="mm")
        bx += 130

    draw.text((x + 40, y + 645), "손가락 터치 드래그로 원하는 각도에서 가구 높이감 확인", fill=(100, 116, 139), font=font_sm)

# 스크린샷 3: 간섭 진단 & 990원 체크리스트
def render_ss3(draw, x, y, w, h):
    font_lg = get_font(20, bold=True)
    font_sm = get_font(15)

    # 간섭 경고 알림 박스 시뮬레이션
    draw.rounded_rectangle([x + 20, y + 25, x + w - 20, y + 175], radius=18, fill=(254, 242, 242), outline=(254, 202, 202), width=1)
    draw.text((x + 40, y + 55), "🚨 방문 개폐 반경 간섭 감지", fill=(153, 27, 27), font=font_lg)
    draw.text((x + 40, y + 90), "화장실문(75cm) 열림 반경에 2문 옷장이 걸려 있습니다.", fill=(185, 28, 28), font=font_sm)
    draw.text((x + 40, y + 120), "→ 옷장을 40cm 좌측으로 이동하거나 90° 회전해 주세요.", fill=(185, 28, 28), font=font_sm)

    # 원터치 황금 배치 카드
    draw.rounded_rectangle([x + 20, y + 200, x + w - 20, y + 370], radius=18, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    draw.text((x + 40, y + 230), "⚡ 원터치 황금 인테리어 배치", fill=(15, 23, 42), font=font_lg)
    draw.text((x + 40, y + 260), "실제 자취생들이 가장 만족한 검증된 가구 구조", fill=(100, 116, 139), font=font_sm)

    presets = [("꿀잠 힐링형", "창가 침대"), ("재택 집중형", "와이드 데스크"), ("라운지형", "소파+다이닝")]
    px = x + 35
    for title, sub in presets:
        draw.rounded_rectangle([px, y + 295, px + 155, y + 355], radius=12, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        draw.text((px + 77, y + 317), title, fill=(15, 23, 42), font=get_font(14, bold=True), anchor="mm")
        draw.text((px + 77, y + 337), sub, fill=(100, 116, 139), font=get_font(12), anchor="mm")
        px += 170

    # 990원 자취방 입주 체크리스트
    draw.rounded_rectangle([x + 20, y + 395, x + w - 20, y + 580], radius=18, fill=(255, 251, 235), outline=(254, 243, 199), width=1)
    draw.text((x + 40, y + 425), "📋 자취방 입주 50대 체크리스트 (990원)", fill=(146, 64, 14), font=font_lg)
    draw.text((x + 40, y + 460), "1. 싱크대 & 화장실 세면대 수압 동시 점검", fill=(180, 83, 9), font=font_sm)
    draw.text((x + 40, y + 490), "2. 창틀 실리콘 및 결로 곰팡이 흔적 확인", fill=(180, 83, 9), font=font_sm)
    draw.text((x + 40, y + 520), "3. 에어컨 및 보일러 제조년월일 10년 초과 여부", fill=(180, 83, 9), font=font_sm)

def main():
    generate_logo()
    generate_screenshot("screenshot_1.png", "간섭 진단", "원룸 평수별 가구 가상 배치", "문 안 걸리고 들어갈지 1초 만에 확인", render_ss1)
    generate_screenshot("screenshot_2.png", "3D 룸", "실시간 3D 아이소메트릭 룸", "내 방 인테리어를 4가지 앵글로 자유 회전", render_ss2)
    generate_screenshot("screenshot_3.png", "동선 점검", "방문·화장실문 개폐 간섭 진단", "이삿날 낭패 없는 100% 안전 동선 점검", render_ss3)
    print("🎉 All RoomFit assets generated successfully!")

if __name__ == "__main__":
    main()
