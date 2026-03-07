import puppeteer from 'puppeteer';
import fs from 'fs/promises';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
        
    try {
        // Start from the first URL
        let url = 'https://www.wattpad.com/story/385211174-paul-and-veronica';

        while (url) {

            // Navigate to the current page and wait for the DOM to be ready
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 160000 // Set a generous timeout
            });
            
            // Get the text content from the chapter heading
            const headingText = await page.evaluate(() => {
                const headingElement = document.querySelector('.panel.panel-reading.text-center h1');
                if (headingElement) {
                    return headingElement.textContent.trim();
                }
                return null;
            });
            
            // Append the heading to the file if it exists
            if (headingText) {
                await fs.appendFile('bookP.txt', `\n\n--- ${headingText} ---\n\n`);
                console.log(`Wrote heading: ${headingText}`);
            }

            // Scroll to the end of the page to load all content
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let lastScrollHeight = 0;
                    const interval = setInterval(() => {
                        const newScrollHeight = document.body.scrollHeight;
                        if (newScrollHeight === lastScrollHeight) {
                            clearInterval(interval);
                            resolve();
                        }
                        lastScrollHeight = newScrollHeight;
                        window.scrollTo(0, lastScrollHeight);
                    }, 5000); // Check and scroll every 500ms
                });
            });

            // Wait for at least one <pre> tag to appear
            await page.waitForSelector('pre', { timeout: 90000 });

            // Get the text content from all <p> tags inside <pre> tags on the current page
            const allPText = await page.evaluate(() => {
                const pElements = document.querySelectorAll('pre p');
                let combinedText = '';

                pElements.forEach(p => {
                    // Extract text from child nodes directly to ignore nested divs
                    let pText = '';
                    p.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            pText += node.textContent;
                        }
                    });
                    combinedText += pText.trim() + '\n\n';
                });

                return combinedText;
            });

            // Append the extracted text to a file. Use fs.appendFile to add content without overwriting.
            await fs.appendFile('bookP.txt', allPText);
            console.log(`Successfully wrote content to bookP.txt`);

            // Find the "Next Part" button/link to navigate to the next chapter
            const nextButton = await page.$('a.next-part');

            if (nextButton) {
                // Get the URL of the next page and click the button
                url = await page.evaluate(btn => btn.href, nextButton);
            } else {
                // If there is no next button, the loop will terminate
                url = null;
            }

            // Add a small delay to mimic human behavior and avoid being blocked
            await new Promise(resolve => setTimeout(resolve, 2000));
        }


    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        await browser.close();
    }
})();