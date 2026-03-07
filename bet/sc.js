import { promises as fs } from 'fs'; // Using promises for async file operations

async function get10BetMatchWinnerBets(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        const jsonData = JSON.parse(data);

        const matchWinnerBetsFrom10Bet = [];

        if (jsonData && jsonData.response && Array.isArray(jsonData.response)) {
            for (const fixtureData of jsonData.response) {
                if (fixtureData.bookmakers && Array.isArray(fixtureData.bookmakers)) {
                    for (const bookmaker of fixtureData.bookmakers) {
                        // Filter for the "10Bet" bookmaker specifically
                        if (bookmaker.name === '10Bet' && bookmaker.bets && Array.isArray(bookmaker.bets)) {
                            for (const bet of bookmaker.bets) {
                                // Filter for "Match Winner" bet
                                if (bet.name === 'Match Winner') {
                                    matchWinnerBetsFrom10Bet.push({
                                        league: fixtureData.league,
                                        fixture: fixtureData.fixture,
                                        bookmaker: {
                                            id: bookmaker.id,
                                            name: bookmaker.name
                                        },
                                        bet: bet
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        return matchWinnerBetsFrom10Bet;
    } catch (error) {
        console.error("Error reading or parsing file:", error);
        return [];
    }
}

// Example usage:
// Make sure your Node.js environment supports ES Modules (e.g., by using .mjs extension or "type": "module" in package.json)
get10BetMatchWinnerBets('h.txt')
    .then(bets => {
        if (bets.length > 0) {
            console.log("Found 'Match Winner' bets from 10Bet:", JSON.stringify(bets, null, 2));
        } else {
            console.log("No 'Match Winner' bets found from 10Bet in the file.");
        }
    })
    .catch(err => console.error("An error occurred during execution:", err));