import puppeteer from 'puppeteer';


// (async () => {
//     const browser = await puppeteer.launch({ headless: true }); // Set to false to see the browser
//     const page = await browser.newPage();

//     // Navigate to a URL (replace with the page you want to inspect)
//     await page.goto('https://www.sportybet.com/ng/sport/football/upcoming?time=0');

//     // Get all text content from the body of the page
//     const allPageText = await page.evaluate(() => {
//         return document.body.textContent;
//     });

//     // Log the extracted text to your Node.js console
//     console.log("--- All Text Content of the Page ---");
//     console.log(allPageText);
//     console.log("------------------------------------");

//     await browser.close();
// })();

import fs from 'fs/promises';



const getcontent = async (link) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
        
    try {
        // Start from the first URL
        let url = link;

        while (url) {

            // Navigate to the current page and wait for the DOM to be ready
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 60000 // Set a generous timeout
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
                await fs.appendFile('book.txt', `\n\n--- ${headingText} ---\n\n`);
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
                    }, 500); // Check and scroll every 500ms
                });
            });

            // Wait for at least one <pre> tag to appear
            await page.waitForSelector('pre', { timeout: 30000 });

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
            await fs.appendFile('book.txt', allPText);
            console.log(`Successfully wrote content to book.txt`);

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
};
(async () => {
    const links = [
        'https://www.wattpad.com/1076247807-mafia-arranged-marriage-%E2%80%A2author%27s-note%E2%80%A2',
        'https://www.wattpad.com/1076249369-mafia-arranged-marriage-%E2%80%A2characters%E2%80%A2',
        'https://www.wattpad.com/1076502383-mafia-arranged-marriage-%E2%80%A201%E2%80%A2',
        'https://www.wattpad.com/1076705656-mafia-arranged-marriage-%E2%80%A202%E2%80%A2',
        'https://www.wattpad.com/1076755230-mafia-arranged-marriage-%E2%80%A203%E2%80%A2',
        'https://www.wattpad.com/1077004754-mafia-arranged-marriage-%E2%80%A204%E2%80%A2',
        'https://www.wattpad.com/1077151424-mafia-arranged-marriage-%E2%80%A205%E2%80%A2',
        'https://www.wattpad.com/1077193161-mafia-arranged-marriage-%E2%80%A206%E2%80%A2',
        'https://www.wattpad.com/1077422197-mafia-arranged-marriage-%E2%80%A207%E2%80%A2',
        'https://www.wattpad.com/1077491538-mafia-arranged-marriage-%E2%80%A208%E2%80%A2',
        'https://www.wattpad.com/1077628940-mafia-arranged-marriage-%E2%80%A209%E2%80%A2',
        'https://www.wattpad.com/1078058471-mafia-arranged-marriage-%E2%80%A210%E2%80%A2',
        'https://www.wattpad.com/1079134468-mafia-arranged-marriage-%E2%80%A211%E2%80%A2',
        'https://www.wattpad.com/1079187460-mafia-arranged-marriage-%E2%80%A212%E2%80%A2',
        'https://www.wattpad.com/1080047418-mafia-arranged-marriage-%E2%80%A213%E2%80%A2',
        'https://www.wattpad.com/1080579017-mafia-arranged-marriage-%E2%80%A214%E2%80%A2',
        'https://www.wattpad.com/1083793598-mafia-arranged-marriage-%E2%80%A215%E2%80%A2',
        'https://www.wattpad.com/1083851429-mafia-arranged-marriage-%E2%80%A216%E2%80%A2',
        'https://www.wattpad.com/1083876001-mafia-arranged-marriage-%E2%80%A217%E2%80%A2',
        'https://www.wattpad.com/1084176148-mafia-arranged-marriage-%E2%80%A218%E2%80%A2',
        'https://www.wattpad.com/1084289600-mafia-arranged-marriage-%E2%80%A219%E2%80%A2',
        'https://www.wattpad.com/1086685425-mafia-arranged-marriage-%E2%80%A220%E2%80%A2',
        'https://www.wattpad.com/1086717618-mafia-arranged-marriage-%E2%80%A221%E2%80%A2',
        'https://www.wattpad.com/1087139547-mafia-arranged-marriage-%E2%80%A222%E2%80%A2',
        'https://www.wattpad.com/1087208445-mafia-arranged-marriage-%E2%80%A223%E2%80%A2',
        'https://www.wattpad.com/1088183799-mafia-arranged-marriage-%E2%80%A224%E2%80%A2',
        'https://www.wattpad.com/1089619821-mafia-arranged-marriage-%E2%80%A225%E2%80%A2',
        'https://www.wattpad.com/1090184397-mafia-arranged-marriage-%E2%80%A226%E2%80%A2',
        'https://www.wattpad.com/1093013304-mafia-arranged-marriage-%E2%80%A227%E2%80%A2',
        'https://www.wattpad.com/1094677848-mafia-arranged-marriage-%E2%80%A228%E2%80%A2',
        'https://www.wattpad.com/1097632327-mafia-arranged-marriage-%E2%80%A229%E2%80%A2',
        'https://www.wattpad.com/1097666756-mafia-arranged-marriage-%E2%80%A230%E2%80%A2',
        'https://www.wattpad.com/1097924476-mafia-arranged-marriage-%E2%80%A231%E2%80%A2',
        'https://www.wattpad.com/1098066859-mafia-arranged-marriage-%E2%80%A232%E2%80%A2',
        'https://www.wattpad.com/1099877010-mafia-arranged-marriage-%E2%80%A233%E2%80%A2',
        'https://www.wattpad.com/1104479003-mafia-arranged-marriage-%E2%80%A234%E2%80%A2',
        'https://www.wattpad.com/1104492393-mafia-arranged-marriage-%E2%80%A235%E2%80%A2',
        'https://www.wattpad.com/1105013851-mafia-arranged-marriage-%E2%80%A236%E2%80%A2',
        'https://www.wattpad.com/1105811768-mafia-arranged-marriage-%E2%80%A237%E2%80%A2',
        'https://www.wattpad.com/1106728070-mafia-arranged-marriage-%E2%80%A238%E2%80%A2',
        'https://www.wattpad.com/1113332179-mafia-arranged-marriage-%E2%80%A239%E2%80%A2',
        'https://www.wattpad.com/1113350812-mafia-arranged-marriage-%E2%80%A240%E2%80%A2',
        'https://www.wattpad.com/1322843518-mafia-arranged-marriage-one-million-reads-note',
        'https://www.wattpad.com/1323260195-mafia-arranged-marriage-epilogue',
        'https://www.wattpad.com/1113350812-mafia-arranged-marriage-%E2%80%A240%E2%80%A2',
        'https://www.wattpad.com/1322843518-mafia-arranged-marriage-one-million-reads-note',
        'https://www.wattpad.com/1323260195-mafia-arranged-marriage-epilogue'
    ];
    for (let i = 0; i < links.length; i++) {
        await getcontent(links[i]);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Finished scraping page.`);
    }
})();