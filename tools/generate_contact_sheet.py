import asyncio
import base64
import io
import os
import time
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

POSES = [
    {"id": "natural", "name": "Natural", "icon": "🌿", "desc": "Relaxed contrapposto, inward palms"},
    {"id": "chic-hip", "name": "Chic Hip", "icon": "🌸", "desc": "Editorial left hip IK, flared elbow"},
    {"id": "hands-waist", "name": "Hands on Waist", "icon": "💖", "desc": "Hourglass dual waist IK & cupped grip"},
    {"id": "cute-wave", "name": "Cute Wave", "icon": "👋", "desc": "Greeting wave, live momentum"},
    {"id": "cute-peace", "name": "Cute Peace", "icon": "✌️", "desc": "Kawaii cheek peace sign & tilt"},
    {"id": "runway-glam", "name": "Runway Glam", "icon": "✨", "desc": "Mid-stride catwalk walk & twist"},
    {"id": "arms-crossed", "name": "Arms Crossed", "icon": "🙅‍♀️", "desc": "Confident crossed chest IK"},
    {"id": "hands-pockets", "name": "Hands in Pockets", "icon": "👖", "desc": "Slouch posture, front pocket IK"},
    {"id": "over-shoulder", "name": "Over-the-Shoulder", "icon": "💃", "desc": "3/4 photoshoot turn, look back"},
    {"id": "hair-touch", "name": "Hair Touch", "icon": "💇‍♀️", "desc": "Right hand hair touch near temple"},
]

CONFIGS = [
    {
        "id": "female_dress",
        "label": "Female Dress",
        "config": {
            "gender": 0,
            "clothes": ["toigo_halter_dress_midi", "shoes02"],
            "hair": "toigo_curled_under_bob",
            "skin": "young_caucasian_female"
        }
    },
    {
        "id": "female_jeans",
        "label": "Female Jeans",
        "config": {
            "gender": 0,
            "clothes": ["female_casualsuit01", "shoes02"],
            "hair": "toigo_curled_under_bob",
            "skin": "young_caucasian_female"
        }
    },
    {
        "id": "male_suit",
        "label": "Male Suit",
        "config": {
            "gender": 1,
            "clothes": ["toigo_male_suit_3", "shoes01"],
            "hair": "culturalibre_hair_02",
            "skin": "young_caucasian_male"
        }
    },
    {
        "id": "male_jeans",
        "label": "Male Jeans",
        "config": {
            "gender": 1,
            "clothes": ["male_casualsuit01", "shoes01"],
            "hair": "culturalibre_hair_02",
            "skin": "young_caucasian_male"
        }
    },
]

async def capture_all():
    print("Launching Playwright to capture contact sheet renders...")
    renders = {} # (config_id, pose_id, angle) -> Image

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        for cfg in CONFIGS:
            cfg_id = cfg["id"]
            print(f"Setting up configuration: {cfg['label']}...")
            
            # Navigate to prime storage
            await page.goto("http://localhost:3000/avatar-studio/", wait_until="networkidle")
            await page.evaluate(f"""(config) => {{
                localStorage.setItem('otd-avatar-pro-v1', JSON.stringify(config));
            }}""", cfg["config"])
            
            # Reload with new config
            await page.goto("http://localhost:3000/avatar-studio/", wait_until="networkidle")
            await page.wait_for_function("() => window.__avatarControl && window.__avatarControl.isReady()", timeout=30000)
            
            # Ensure Body view
            body_btn = page.locator(".hf-view-seg button", has_text="Body")
            if await body_btn.count() > 0:
                await body_btn.click()
                await page.wait_for_timeout(300)

            for pose in POSES:
                pose_id = pose["id"]
                pose_name = pose["name"]
                
                # Click pose button
                btn = page.locator(".hf-pose-bar button", has_text=pose_name)
                if await btn.count() > 0:
                    await btn.click()
                else:
                    await page.evaluate(f"() => window.__avatarControl.setPose('{pose_id}')")
                
                # Wait for transition to complete
                await page.wait_for_timeout(600)
                
                # Front angle (yaw = 0)
                await page.evaluate("() => window.__avatarControl.setYaw(0)")
                await page.wait_for_timeout(100)
                front_data = await page.evaluate("() => window.__avatarControl.snapshot()")
                
                # 3/4 angle (yaw = 0.55 rad ~ 32 deg)
                await page.evaluate("() => window.__avatarControl.setYaw(0.55)")
                await page.wait_for_timeout(100)
                three_quarter_data = await page.evaluate("() => window.__avatarControl.snapshot()")
                
                for angle, data_url in [("front", front_data), ("three_quarter", three_quarter_data)]:
                    raw_bytes = base64.b64decode(data_url.split(",")[1])
                    im = Image.open(io.BytesIO(raw_bytes))
                    # Center crop body
                    w, h = im.size
                    crop_box = (int(w * 0.22), 0, int(w * 0.78), h)
                    cropped = im.crop(crop_box)
                    renders[(cfg_id, pose_id, angle)] = cropped
                
                print(f"  [OK] {cfg['label']} - {pose_name} (Front & 3/4)")

        await browser.close()

    print("All captures complete! Generating contact sheet composite...")
    build_composite(renders)

def build_composite(renders):
    cell_w = 200
    cell_h = 280
    label_w = 240
    header_h = 130
    col_header_h = 45

    num_rows = len(POSES)
    num_cols = 8 # 4 configs * 2 angles

    total_w = label_w + num_cols * cell_w + 30
    total_h = header_h + col_header_h + num_rows * cell_h + 30

    sheet = Image.new("RGB", (total_w, total_h), color=(244, 245, 247))
    draw = ImageDraw.Draw(sheet)

    # Use default or system fonts
    try:
        title_font = ImageFont.truetype("arialbd.ttf", 26)
        subtitle_font = ImageFont.truetype("arial.ttf", 15)
        col_font = ImageFont.truetype("arialbd.ttf", 13)
        col_sub_font = ImageFont.truetype("arial.ttf", 11)
        pose_title_font = ImageFont.truetype("arialbd.ttf", 16)
        pose_desc_font = ImageFont.truetype("arial.ttf", 11)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = title_font
        col_font = title_font
        col_sub_font = title_font
        pose_title_font = title_font
        pose_desc_font = title_font

    # Draw Header Banner
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(28, 28, 34))
    draw.text((24, 22), "OTD 3D AVATAR STUDIO — V1 FASHION POSE CONTACT SHEET", fill=(255, 255, 255), font=title_font)
    draw.text((24, 58), "Quality Gate Release Verification: 10 Natural Fashion Poses · Analytical 2-Bone IK · Contrapposto Weight Shift · grounded feet", fill=(210, 215, 225), font=subtitle_font)
    draw.text((24, 82), "Matrix: Front & 3/4 Views · Both Genders (Feminine & Masculine) · Two Outfits Each (Dress/Suit & Jeans+Shirt)", fill=(160, 168, 185), font=subtitle_font)

    # Column Headers
    cols_meta = [
        ("Female Dress", "Front (0°)"),
        ("Female Dress", "3/4 (35°)"),
        ("Female Jeans", "Front (0°)"),
        ("Female Jeans", "3/4 (35°)"),
        ("Male Suit", "Front (0°)"),
        ("Male Suit", "3/4 (35°)"),
        ("Male Jeans", "Front (0°)"),
        ("Male Jeans", "3/4 (35°)"),
    ]

    header_y = header_h + 8
    draw.rectangle([(15, header_y), (label_w, header_y + col_header_h)], fill=(230, 233, 238))
    draw.text((25, header_y + 12), "POSE / SPEC", fill=(50, 55, 65), font=col_font)

    for c_idx, (outfit_name, angle_name) in enumerate(cols_meta):
        cx = label_w + c_idx * cell_w + 5
        bg_col = (238, 240, 245) if c_idx % 2 == 0 else (230, 233, 240)
        draw.rectangle([(cx, header_y), (cx + cell_w - 4, header_y + col_header_h)], fill=bg_col)
        draw.text((cx + 10, header_y + 6), outfit_name, fill=(20, 24, 32), font=col_font)
        draw.text((cx + 10, header_y + 24), angle_name, fill=(100, 105, 115), font=col_sub_font)

    # Render Rows
    cfg_order = [
        ("female_dress", "front"),
        ("female_dress", "three_quarter"),
        ("female_jeans", "front"),
        ("female_jeans", "three_quarter"),
        ("male_suit", "front"),
        ("male_suit", "three_quarter"),
        ("male_jeans", "front"),
        ("male_jeans", "three_quarter"),
    ]

    for r_idx, pose in enumerate(POSES):
        ry = header_h + col_header_h + 12 + r_idx * cell_h

        # Row Background & Card
        draw.rectangle([(15, ry), (label_w - 5, ry + cell_h - 6)], fill=(255, 255, 255), outline=(220, 224, 230), width=1)
        
        # Pose Info
        draw.text((25, ry + 16), f"{pose['icon']} {pose['name']}", fill=(20, 24, 32), font=pose_title_font)
        draw.text((25, ry + 42), f"ID: {pose['id']}", fill=(110, 115, 125), font=col_sub_font)
        draw.text((25, ry + 60), "Source: Procedural IK", fill=(37, 99, 235), font=col_sub_font)
        
        # Word wrap description
        words = pose["desc"].split(" ")
        line1 = " ".join(words[:4])
        line2 = " ".join(words[4:])
        draw.text((25, ry + 82), line1, fill=(80, 85, 95), font=pose_desc_font)
        if line2:
            draw.text((25, ry + 98), line2, fill=(80, 85, 95), font=pose_desc_font)

        # Draw Cells
        for c_idx, (cfg_id, angle) in enumerate(cfg_order):
            cx = label_w + c_idx * cell_w + 5
            draw.rectangle([(cx, ry), (cx + cell_w - 4, ry + cell_h - 6)], fill=(255, 255, 255), outline=(220, 224, 230), width=1)
            
            img = renders.get((cfg_id, pose["id"], angle))
            if img:
                thumb = img.resize((cell_w - 8, cell_h - 10), Image.Resampling.LANCZOS)
                sheet.paste(thumb, (cx + 2, ry + 2))

    os.makedirs("docs", exist_ok=True)
    out_path = os.path.join("docs", "pose-contact-sheet.png")
    sheet.save(out_path, quality=95)
    print(f"Successfully generated contact sheet at {out_path} ({total_w}x{total_h}px)!")

if __name__ == "__main__":
    asyncio.run(capture_all())
