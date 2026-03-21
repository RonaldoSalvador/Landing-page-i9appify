import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173
        await page.goto("http://localhost:5173")
        
        # -> Navigate to /crm/atendimentos (explicit navigation as specified in the test steps) and then inspect the page for interactive elements.
        await page.goto("http://localhost:5173/crm/atendimentos")
        
        # -> Dismiss the cookie banner by clicking 'Aceitar', then open the first conversation in the list by clicking the first conversation button.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[3]/div/div/div[3]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the conversations list to open it so the messages area and message input appear.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the conversations list to open it so the messages area and message input become visible (click element index 2190).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the list to open it and reveal the messages area and message input.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'Pausar IA' button to pause automatic agent replies (index 3909) so the manual message input and Send button become available, then locate the message input.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div[2]/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click a different conversation in the list (not the one repeatedly clicked) to open it and attempt to reveal the messages area and message input (click element index 4181).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Refresh the conversation pane by clicking 'Atualizar' (index 4799), wait for the UI to update, then scroll the right conversation pane (index 4788) to the bottom to reveal the message input and Send button.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div[2]/div/div[2]/button[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the conversations list to open it so the messages area and message input can become visible (click element index 3952).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the list to attempt to open it and reveal the messages area and message input (use button index 4836). If selection succeeds, next actions will be to verify message area and send a test message.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the first conversation in the conversations list to open it and reveal the messages area and message input (click button index 6405).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/main/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert '/crm/atendimentos' in current_url
        assert await frame.locator("xpath=//*[contains(., 'Mensagens')]").nth(0).is_visible(), "Expected 'Mensagens' to be visible"
        assert await frame.locator("xpath=//*[contains(., 'Mensagem de teste - envio local')]").nth(0).is_visible(), "Expected 'Mensagem de teste - envio local' to be visible"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    