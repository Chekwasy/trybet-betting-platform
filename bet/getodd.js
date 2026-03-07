import { promises as fs } from 'fs';

export async function searchAndPrintLastChars(searchString, filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const lines = data.split('\n');

        const strings = searchString.split('='); // This assumes searchString will always contain '='

        // Use a for...of loop instead of forEach
        for (const line of lines) {
            // Ensure both parts of the split string are present in the line
            if (line.includes(strings[0]) && line.includes(strings[1])) {
                return line;
            }
        }

        // If no matching line is found after checking all lines
        return '';

    } catch (err) {
        // Log the error for debugging purposes
        console.error(`Error reading file "${filePath}": ${err}`);
        return ''; // Return an empty string in case of an error
    }
}

// --- Example Usage ---

// Wrap the call in an IIFE (Immediately Invoked Function Expression)
// or an async main function to use 'await' at the top level.
// (async () => {
//     // Call the function and await its result
//     const extractedString = await searchAndPrintLastChars('Basel Copenhagen', 'output.txt');
//     console.log(extractedString); // This will now log the actual string
// })();

// Note: Ensure 'output.txt' exists and has content that matches your search criteria
// For example, if 'output.txt' contains:
// ID: 31609 Aston Villa Newcastle 2.31 3.77 3.11
// ID: 31637 Brighton Fulham 1.97 3.85 3.95
//
// And you search for 'ID:', it would return: "3.113.95"