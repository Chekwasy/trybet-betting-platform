import fs from 'fs/promises'; // For asynchronous file operations
import path from 'path';     // For path manipulation

async function processFileAndExtractData(inputFile, outputFile) {
    try {
        const inputFilePath = path.resolve(inputFile);
        const outputFilePath = path.resolve(outputFile);

        const data = await fs.readFile(inputFilePath, 'utf8');
        const lines = data.split('\n');

        let outputLines = [];
        let captureMode = false;
        let linesToCaptureCount = 0;
        let currentCapturedBlock = [];

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('ID:')) {
                // If we were in capture mode from a previous ID block,
                // and it wasn't fully captured, save it.
                // This handles cases where an ID: line appears before 6 lines are captured.
                if (captureMode && linesToCaptureCount > 0) {
                    outputLines.push(currentCapturedBlock.join(' '));
                }
                
                // Start a new capture block
                captureMode = true;
                linesToCaptureCount = 6; // We need to capture the ID line + next 6 lines
                currentCapturedBlock = [trimmedLine]; // Add the ID line itself
            } else if (captureMode && linesToCaptureCount > 0) {
                // Only add non-empty lines to the captured block,
                // and if we are still capturing.
                if (trimmedLine !== '') {
                    currentCapturedBlock.push(trimmedLine);
                }
                linesToCaptureCount--;

                // If this was the last line to capture for the current block
                if (linesToCaptureCount === 0) {
                    outputLines.push(currentCapturedBlock.join(' '));
                    captureMode = false; // Stop capturing until next ID:
                    currentCapturedBlock = []; // Reset for the next block
                }
            }
        }

        // Handle the last captured block if the file ends after an ID: section
        if (captureMode && currentCapturedBlock.length > 0) {
            outputLines.push(currentCapturedBlock.join(' '));
        }

        // Write the processed data to the output file, each block on a new line
        await fs.writeFile(outputFilePath, outputLines.join('\n') + '\n', 'utf8');

        console.log(`Successfully processed '${inputFile}' and saved results to '${outputFile}'`);
    } catch (error) {
        console.error(`Error processing file: ${error.message}`);
    }
}

// --- Usage ---
const inputFile = 'pup.txt';
const outputFile = 'output.txt';

processFileAndExtractData(inputFile, outputFile);