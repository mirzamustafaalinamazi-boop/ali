import asyncio
import json
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto("http://localhost:3000/avatar-studio/", wait_until="networkidle")
        await page.wait_for_function("() => window.__avatarControl && window.__avatarControl.isReady()")
        
        info = await page.evaluate("""() => {
            const avatar = window.__avatarControl.getAvatar();
            const bones = avatar.skeleton.bones;
            const res = {};
            for (const b of bones) {
                if (b.name.includes('Arm') || b.name.includes('Hand') || b.name.includes('Shoulder')) {
                    const wp = b.getWorldPosition(new (b.position.constructor)());
                    res[b.name] = {
                        pos: [b.position.x, b.position.y, b.position.z],
                        worldPos: [wp.x, wp.y, wp.z],
                        quat: [b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w]
                    };
                }
            }
            return res;
        }""")
        print(json.dumps(info, indent=2))
        await browser.close()

asyncio.run(inspect())
