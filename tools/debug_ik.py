import asyncio
from playwright.async_api import async_playwright

async def debug_ik():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        await page.goto("http://localhost:3000/avatar-studio/", wait_until="networkidle")
        await page.wait_for_function("() => window.__avatarControl && window.__avatarControl.isReady()")
        
        res = await page.evaluate("""() => {
            const avatar = window.__avatarControl.getAvatar();
            window.__avatarControl.setPose('hands-waist');
            
            const rArm = avatar.skeleton.bones.find(b => b.name === 'mixamorig:RightArm');
            const rForeArm = avatar.skeleton.bones.find(b => b.name === 'mixamorig:RightForeArm');
            const rHand = avatar.skeleton.bones.find(b => b.name === 'mixamorig:RightHand');
            
            const rArmPos = rArm.getWorldPosition(new (rArm.position.constructor)());
            const rForeArmPos = rForeArm.getWorldPosition(new (rForeArm.position.constructor)());
            const rHandPos = rHand.getWorldPosition(new (rHand.position.constructor)());
            
            const lArm = avatar.skeleton.bones.find(b => b.name === 'mixamorig:LeftArm');
            const lForeArm = avatar.skeleton.bones.find(b => b.name === 'mixamorig:LeftForeArm');
            const lHand = avatar.skeleton.bones.find(b => b.name === 'mixamorig:LeftHand');
            
            const lArmPos = lArm.getWorldPosition(new (lArm.position.constructor)());
            const lForeArmPos = lForeArm.getWorldPosition(new (lForeArm.position.constructor)());
            const lHandPos = lHand.getWorldPosition(new (lHand.position.constructor)());
            
            return {
                left: { arm: [lArmPos.x, lArmPos.y, lArmPos.z], foreArm: [lForeArmPos.x, lForeArmPos.y, lForeArmPos.z], hand: [lHandPos.x, lHandPos.y, lHandPos.z] },
                right: { arm: [rArmPos.x, rArmPos.y, rArmPos.z], foreArm: [rForeArmPos.x, rForeArmPos.y, rForeArmPos.z], hand: [rHandPos.x, rHandPos.y, rHandPos.z] }
            };
        }""")
        print("Debug IK:")
        print("Left:", res["left"])
        print("Right:", res["right"])
        await browser.close()

asyncio.run(debug_ik())
