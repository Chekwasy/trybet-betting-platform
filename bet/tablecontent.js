import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to the story's main page
        await page.goto('https://www.wattpad.com/story/271288977-mafia-arranged-marriage', {
            waitUntil: 'networkidle2', // Wait until all network connections have settled
            timeout: 60000
        });

        // Wait for the story parts list to load
        await page.waitForSelector('ul[aria-label="story-parts"]', { timeout: 60000 });

        // Get all href attributes from <a> tags within the specified ul
        const allLinks = await page.evaluate(() => {
            const listSelector = 'ul[aria-label="story-parts"] li a';
            const linkElements = document.querySelectorAll(listSelector);

            // Use Array.from and map to get an array of href attributes
            const links = Array.from(linkElements).map(a => a.href);
            return links;
        });

        // Log the extracted links to your Node.js console
        console.log("--- Extracted Story Part Links ---");
        console.log(allLinks);
        console.log("----------------------------------");

    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        await browser.close();
    }
})();
