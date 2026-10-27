import os
from PIL import Image, ImageDraw, ImageFont

ASSET_DIR = "/Users/tgkim/Project/toss-inapp/apps/face-fit/assets"
os.makedirs(ASSET_DIR, exist_ok=True)

# Helper font loader
def get_font(size, bold=False):
    # Try system fonts on macOS
    font_paths = [
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/SFPro.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

# ----------------------------------------------------
# 1. LOGO: 600 x 600 (Strictly 100% Square, No Rounded Corners!)
# ----------------------------------------------------
def create_logo():
    img = Image.new("RGB", (600, 600), color="#1B64DA")
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(600):
        r = int(27 + (49 - 27) * (y / 600))
        g = int(100 + (130 - 100) * (y / 600))
        b = int(218 + (246 - 218) * (y / 600))
        draw.line([(0, y), (600, y)], fill=(r, g, b))

    # Decorative subtle circles
    draw.ellipse([(-100, -100), (300, 300)], fill=(255, 255, 255, 15))
    draw.ellipse([(350, 350), (750, 750)], fill=(255, 255, 255, 10))

    # Center Avatar Silhouette / Stylized Face & Eyewear & Hair
    # Head contour (White silhouette)
    draw.ellipse([(190, 160), (410, 420)], fill="#FFFFFF")
    # Neck
    draw.rectangle([(260, 400), (340, 480)], fill="#FFFFFF")

    # Hair (Dark contrast #1E293B)
    draw.chord([(175, 130), (425, 380)], start=180, end=360, fill="#1E293B")
    # Hair bangs
    draw.polygon([(200, 230), (240, 260), (280, 240), (330, 265), (370, 235), (400, 220), (300, 170), (200, 210)], fill="#1E293B")

    # Eyewear (Signature Toss Blue #3182F6 Arnel frames)
    # Left rim
    draw.rounded_rectangle([(215, 270), (285, 325)], radius=12, outline="#3182F6", width=8)
    # Right rim
    draw.rounded_rectangle([(315, 270), (385, 325)], radius=12, outline="#3182F6", width=8)
    # Bridge
    draw.line([(285, 290), (315, 290)], fill="#3182F6", width=7)
    # Temples
    draw.line([(215, 290), (195, 285)], fill="#3182F6", width=6)
    draw.line([(385, 290), (405, 285)], fill="#3182F6", width=6)

    # Sparkle stars
    star_font = get_font(42, bold=True)
    draw.text((120, 150), "✦", fill="#FDE047", font=star_font)
    draw.text((430, 170), "✨", fill="#FFFFFF", font=star_font)

    # Bottom App Name text
    name_font = get_font(52, bold=True)
    draw.text((300, 520), "페이스핏", fill="#FFFFFF", font=name_font, anchor="mm")

    out_path = os.path.join(ASSET_DIR, "logo_600x600.png")
    img.save(out_path, "PNG")
    print("Created logo:", out_path)

# ----------------------------------------------------
# 2. SCREENSHOT 1: 636 x 1048 (가상 피팅룸 & 얼굴형 맞춤 분석)
# ----------------------------------------------------
def create_screenshot_1():
    img = Image.new("RGB", (636, 1048), color="#F9FAFB")
    draw = ImageDraw.Draw(img)

    # Header Card
    draw.rectangle([(0, 0), (636, 110)], fill="#FFFFFF")
    draw.text((40, 48), "페이스핏", fill="#191F28", font=get_font(34, bold=True))
    draw.text((580, 52), "공유", fill="#3182F6", font=get_font(22, bold=True), anchor="rm")
    draw.line([(0, 110), (636, 110)], fill="#E5E8EB", width=2)

    # Big Title Banner
    draw.text((40, 140), "내 얼굴형에 딱 맞는", fill="#8B95A1", font=get_font(26))
    draw.text((40, 180), "인생 헤어 & 안경 1초 피팅", fill="#191F28", font=get_font(36, bold=True))

    # Face Canvas Card
    draw.rounded_rectangle([(40, 245), (596, 680)], radius=24, fill="#FFFFFF", outline="#E5E8EB", width=2)
    # Canvas inner portrait background
    draw.rounded_rectangle([(60, 265), (576, 660)], radius=18, fill="#F2F4F6")

    # Avatar Silhouette inside viewer
    draw.ellipse([(240, 340), (396, 520)], fill="#FFDFC9") # Face
    draw.chord([(220, 310), (416, 480)], start=180, end=360, fill="#1C1917") # Hair
    # Arnel Glasses
    draw.rounded_rectangle([(255, 410), (310, 450)], radius=8, outline="#18181B", width=5)
    draw.rounded_rectangle([(326, 410), (381, 450)], radius=8, outline="#18181B", width=5)
    draw.line([(310, 424), (326, 424)], fill="#18181B", width=4)

    # Floating Match Badge
    draw.rounded_rectangle([(380, 285), (555, 335)], radius=16, fill="#191F28")
    draw.text((420, 310), "98점", fill="#3182F6", font=get_font(22, bold=True), anchor="mm")
    draw.text((490, 310), "찰떡 매치", fill="#FFFFFF", font=get_font(18, bold=True), anchor="mm")

    # Score summary card
    draw.rounded_rectangle([(40, 705), (596, 840)], radius=20, fill="#FFFFFF", outline="#E5E8EB", width=2)
    draw.rounded_rectangle([(60, 725), (200, 760)], radius=8, fill="#E8F3FF")
    draw.text((130, 742), "계란형 × 아넬 뿔테", fill="#3182F6", font=get_font(16, bold=True), anchor="mm")
    draw.text((60, 775), "이목구비 단점을 완벽히 커버하고", fill="#191F28", font=get_font(20, bold=True))
    draw.text((60, 805), "지적이고 또렷한 황금 비율을 연출해요.", fill="#6B7684", font=get_font(18))

    # Bottom Category Selector (얼굴형 | 헤어 | 안경 | 추천세트)
    draw.rounded_rectangle([(40, 865), (596, 935)], radius=16, fill="#E5E8EB")
    draw.rounded_rectangle([(44, 869), (180, 931)], radius=14, fill="#FFFFFF")
    draw.text((112, 900), "🥚 얼굴형", fill="#191F28", font=get_font(18, bold=True), anchor="mm")
    draw.text((250, 900), "💇 헤어", fill="#6B7684", font=get_font(18, bold=True), anchor="mm")
    draw.text((390, 900), "👓 안경", fill="#6B7684", font=get_font(18, bold=True), anchor="mm")
    draw.text((520, 900), "✨ 세트", fill="#6B7684", font=get_font(18, bold=True), anchor="mm")

    # Bottom Sticky Action Button
    draw.rounded_rectangle([(40, 955), (596, 1020)], radius=16, fill="#3182F6")
    draw.text((318, 987), "친구에게 어울리는지 투표받기", fill="#FFFFFF", font=get_font(22, bold=True), anchor="mm")

    out_path = os.path.join(ASSET_DIR, "screenshot_1.png")
    img.save(out_path, "PNG")
    print("Created screenshot 1:", out_path)

# ----------------------------------------------------
# 3. SCREENSHOT 2: 636 x 1048 (10초 얼굴형 자가진단 & 어울림 점수)
# ----------------------------------------------------
def create_screenshot_2():
    img = Image.new("RGB", (636, 1048), color="#F9FAFB")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (636, 110)], fill="#FFFFFF")
    draw.text((40, 48), "10초 얼굴형 자가진단", fill="#191F28", font=get_font(34, bold=True))
    draw.line([(0, 110), (636, 110)], fill="#E5E8EB", width=2)

    # Big Title
    draw.text((40, 140), "질문 3개로 바로 찾는", fill="#8B95A1", font=get_font(26))
    draw.text((40, 180), "나만의 퍼스널 얼굴형 진단", fill="#191F28", font=get_font(36, bold=True))

    # Diagnosis Result Card
    draw.rounded_rectangle([(40, 245), (596, 750)], radius=24, fill="#FFFFFF", outline="#E5E8EB", width=2)
    # Emoji
    draw.text((318, 320), "🥚", font=get_font(72), anchor="mm")

    # Badge & Result Name
    draw.rounded_rectangle([(230, 380), (406, 415)], radius=8, fill="#E8F3FF")
    draw.text((318, 397), "이상적인 황금 비율", fill="#3182F6", font=get_font(16, bold=True), anchor="mm")

    draw.text((318, 450), "당신의 얼굴형은 '계란형'입니다!", fill="#191F28", font=get_font(26, bold=True), anchor="mm")
    draw.text((318, 490), "이마와 턱의 균형이 완벽하고 턱선이 부드럽게 좁아져", fill="#6B7684", font=get_font(18), anchor="mm")
    draw.text((318, 520), "어떤 헤어와 안경도 찰떡같이 소화해요.", fill="#6B7684", font=get_font(18), anchor="mm")

    # Proportions Box
    draw.rounded_rectangle([(65, 560), (571, 630)], radius=14, fill="#F2F4F6")
    draw.text((95, 582), "가로세로 비율", fill="#8B95A1", font=get_font(15))
    draw.text((95, 608), "세로 1.4 : 가로 1.0 (황금비)", fill="#191F28", font=get_font(17, bold=True))
    draw.text((340, 582), "턱선 윤곽", fill="#8B95A1", font=get_font(15))
    draw.text((340, 608), "매끄러운 브이라인", fill="#191F28", font=get_font(17, bold=True))

    # Prescriptions
    draw.rounded_rectangle([(65, 650), (571, 725)], radius=14, fill="#ECFDF5", outline="#A7F3D0", width=1)
    draw.text((85, 672), "💇 추천 헤어: 시스루 댄디컷, 가일컷, 레이어드 C컬", fill="#065F46", font=get_font(17, bold=True))
    draw.text((85, 700), "👓 추천 안경: 아넬형 뿔테, 크라운판토, 원형 메탈", fill="#065F46", font=get_font(17))

    # 5 Face Shapes Preview Strip
    draw.text((40, 780), "5대 대표 얼굴형", fill="#191F28", font=get_font(22, bold=True))
    draw.rounded_rectangle([(40, 815), (596, 920)], radius=20, fill="#FFFFFF", outline="#E5E8EB", width=2)
    shapes = [("🥚", "계란형"), ("🌕", "둥근형"), ("🔲", "각진형"), ("💖", "하트형"), ("📏", "긴형")]
    for idx, (em, nm) in enumerate(shapes):
        sx = 60 + idx * 105
        draw.text((sx + 35, 850), em, font=get_font(30), anchor="mm")
        draw.text((sx + 35, 890), nm, fill="#191F28", font=get_font(16, bold=True), anchor="mm")

    # Bottom Button
    draw.rounded_rectangle([(40, 955), (596, 1020)], radius=16, fill="#3182F6")
    draw.text((318, 987), "이 얼굴형으로 즉시 가상 피팅하기", fill="#FFFFFF", font=get_font(22, bold=True), anchor="mm")

    out_path = os.path.join(ASSET_DIR, "screenshot_2.png")
    img.save(out_path, "PNG")
    print("Created screenshot 2:", out_path)

# ----------------------------------------------------
# 4. SCREENSHOT 3: 636 x 1048 (친구 공유 투표 카드 & 스타일 가이드)
# ----------------------------------------------------
def create_screenshot_3():
    img = Image.new("RGB", (636, 1048), color="#F9FAFB")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (636, 110)], fill="#FFFFFF")
    draw.text((40, 48), "친구 공유 & 투표", fill="#191F28", font=get_font(34, bold=True))
    draw.line([(0, 110), (636, 110)], fill="#E5E8EB", width=2)

    # Big Title
    draw.text((40, 140), "어떤 스타일이 더 잘 어울려?", fill="#8B95A1", font=get_font(26))
    draw.text((40, 180), "인스타·카톡 친구 투표 카드", fill="#191F28", font=get_font(36, bold=True))

    # Share Photocard Mockup
    draw.rounded_rectangle([(100, 245), (536, 750)], radius=24, fill="#FFFFFF", outline="#CBD5E1", width=3)
    # Card Header
    draw.rounded_rectangle([(120, 265), (516, 320)], radius=14, fill="#F2F4F6")
    draw.text((140, 280), "토스 페이스핏", fill="#3182F6", font=get_font(17, bold=True))
    draw.text((496, 292), "98점 매치", fill="#191F28", font=get_font(17, bold=True), anchor="rm")

    # Card Avatar
    draw.rounded_rectangle([(120, 335), (516, 560)], radius=16, fill="#E2E8F0")
    draw.ellipse([(250, 380), (386, 520)], fill="#FFDFC9")
    draw.chord([(235, 360), (401, 480)], start=180, end=360, fill="#1C1917")
    draw.rounded_rectangle([(260, 430), (305, 465)], radius=6, outline="#18181B", width=4)
    draw.rounded_rectangle([(330, 430), (375, 465)], radius=6, outline="#18181B", width=4)
    draw.line([(305, 442), (330, 442)], fill="#18181B", width=3)

    # Card Specs
    draw.text((130, 585), "얼굴형: 계란형 | 헤어: 시스루 댄디컷", fill="#191F28", font=get_font(18, bold=True))
    draw.text((130, 615), "안경: 아넬형 뿔테 (매트 블랙)", fill="#6B7684", font=get_font(16))

    # Voting Poll Box
    draw.rounded_rectangle([(120, 645), (516, 730)], radius=14, fill="#3182F6")
    draw.text((318, 672), "💬 친구야, 이 스타일 나한테 어울려?", fill="#FFFFFF", font=get_font(17, bold=True), anchor="mm")
    draw.text((318, 702), "1번: 완전 찰떡! 👍  vs  2번: 다른거 해봐 🤔", fill="#FFFFFF", font=get_font(16), anchor="mm")

    # Action Buttons
    draw.rounded_rectangle([(40, 775), (596, 840)], radius=16, fill="#3182F6")
    draw.text((318, 807), "카카오톡 & 토스 친구에게 공유하기", fill="#FFFFFF", font=get_font(22, bold=True), anchor="mm")

    draw.rounded_rectangle([(40, 855), (305, 920)], radius=16, fill="#F2F4F6", outline="#E5E8EB", width=2)
    draw.text((172, 887), "📸 포토카드 저장", fill="#191F28", font=get_font(19, bold=True), anchor="mm")

    draw.rounded_rectangle([(330, 855), (596, 920)], radius=16, fill="#F2F4F6", outline="#E5E8EB", width=2)
    draw.text((463, 887), "📋 투표 문구 복사", fill="#191F28", font=get_font(19, bold=True), anchor="mm")

    # Bottom notice
    draw.text((318, 980), "인스타그램 스토리와 카카오톡에서 친구들의 반응을 확인해보세요!", fill="#8B95A1", font=get_font(16), anchor="mm")

    out_path = os.path.join(ASSET_DIR, "screenshot_3.png")
    img.save(out_path, "PNG")
    print("Created screenshot 3:", out_path)

if __name__ == "__main__":
    create_logo()
    create_screenshot_1()
    create_screenshot_2()
    create_screenshot_3()
    print("All face-fit assets created successfully!")
