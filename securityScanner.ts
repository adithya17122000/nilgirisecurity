
import dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import unzipper from 'unzipper';
import * as readline from 'readline';
import { OpenAI } from 'openai';
import { platform } from 'os';
import { generateHTML } from './generateReport';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT;

if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

if (!OPENAI_API_ENDPOINT) {
    console.error('Error: OPENAI_API_ENDPOINT is not set in the environment variables.');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: OPENAI_API_ENDPOINT, // Use the custom endpoint here
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};


function parseJsonFile(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const results = [];
        
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line.trim());
                    if (parsed) {
                        results.push(parsed);
                    }
                } catch (parseError) {
                    console.warn(`Warning: Skipping invalid JSON line: ${line.substring(0, 50)}...`);
                }
            }
        }

        const summary = {
            totalRequests: results.length,
            statusCodes: {} as Record<string, number>,
            findings: results.map(result => ({
                url: result.url || result.target || '',
                status: result.status_code || result.status || 0,
                contentLength: result.content_length || result.length || 0,
                contentType: result.content_type || result.type || '',
            })),
        };

        results.forEach(result => {
            const status = result.status_code || result.status || 0;
            summary.statusCodes[status] = (summary.statusCodes[status] || 0) + 1;
        });

        return summary;
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return {
            totalRequests: 0,
            statusCodes: {},
            findings: [],
        };
    }
}

async function analyzeWithOpenAI(scanData: any, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const analysis = `Please analyze these security scan results and provide insights:
                Total Requests: ${scanData.totalRequests}
                Status Code Distribution: ${JSON.stringify(scanData.statusCodes)}
                Notable Findings: ${scanData.findings.length > 0 ? JSON.stringify(scanData.findings.slice(0, 5)) : 'None'}`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a security expert analyzing scan results and providing actionable insights.',
                    },
                    {
                        role: 'user',
                        content: analysis,
                    },
                ],
                max_tokens: 1000,
            });

            return response.choices[0]?.message?.content || 'No analysis generated.';
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt === retries) {
                return 'Error: Unable to generate security analysis after multiple attempts.';
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
    return 'Error: Unable to generate security analysis.';
}

async function downloadFeroxbuster(): Promise<string> {
    const os = platform();
    let downloadUrl: string;
    let filename: string;

    switch(os) {
        case 'win32':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-windows-feroxbuster.exe.zip';
            filename = 'feroxbuster.exe';
            break;
        case 'darwin':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-macos-feroxbuster.zip';
            filename = 'feroxbuster';
            break;
        case 'linux':
            downloadUrl = 'https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-linux-feroxbuster.zip';
            filename = 'feroxbuster';
            break;
        default:
            throw new Error(`Unsupported operating system: ${os}`);
    }

    const zipPath = path.join(process.cwd(), 'feroxbuster.zip');

    try {
        console.log('Downloading Feroxbuster...');
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
            writer.on('finish', () => resolve());
            writer.on('error', reject);
        });

        return zipPath;
    } catch (error) {
        console.error('Error downloading Feroxbuster:', error);
        throw error;
    }
}


async function unzipFeroxbuster(zipPath: string): Promise<string> {
    const extractPath = process.cwd();
    const executablePath = path.join(extractPath, platform() === 'win32' ? 'feroxbuster.exe' : 'feroxbuster');

    try {
        console.log('Extracting Feroxbuster...');
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise();

        if (platform() !== 'win32') {
            execSync(`chmod +x ${executablePath}`);
        }

        fs.unlinkSync(zipPath);
        return executablePath;
    } catch (error) {
        console.error('Error extracting Feroxbuster:', error);
        throw error;
    }
}

function runFeroxbuster(url: string, wordlistPath: string, executablePath: string): void {
    try {
        console.log('Running Feroxbuster scan...');
        const command = `"${executablePath}" -u ${url} -w ${wordlistPath} --json -o feroxbuster_report.json --silent`;
        
        console.log(`Executing command: ${command}`);
        execSync(command, { 
            stdio: 'inherit',
            encoding: 'utf8'
        });
    } catch (error) {
        console.error('Error running Feroxbuster:', error);
        throw error;
    }
}

async function generateReports() {
    const jsonReportPath = 'feroxbuster_report.json';
    const securityReportPath = 'security_analysis.json';
    const htmlReportPath = 'security_analysis.html';

    if (!fs.existsSync(jsonReportPath)) {
        console.error('Error: JSON report file not found!');
        return;
    }

    console.log('Parsing scan results...');
    const scanData = parseJsonFile(jsonReportPath);

    if (scanData.totalRequests === 0) {
        console.error('Error: No valid scan results found in the report file.');
        return;
    }

    console.log('Analyzing results with OpenAI...');
    const aiAnalysis = await analyzeWithOpenAI(scanData);

    const analysisReport = {
        scanSummary: scanData,
        aiAnalysis: aiAnalysis,
        generatedAt: new Date().toISOString(),
    };

    // Save JSON report
    fs.writeFileSync(securityReportPath, JSON.stringify(analysisReport, null, 2));
    console.log(`Security analysis JSON report generated: ${securityReportPath}`);

    console.log('Generating HTML report...');
    const htmlReport = generateHTML(scanData, aiAnalysis);

    // Save HTML report
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`Security analysis HTML report generated: ${htmlReportPath}`);
}

async function main() {
    try {
        const url = await question('Enter the URL of the website to scan: ');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('Invalid URL. Please include http:// or https://');
        }

        const wordlistUrl = 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt';
        const wordlistPath = 'common.txt';

        if (!fs.existsSync(wordlistPath)) {
            console.log('Downloading wordlist...');
            const response = await axios.get(wordlistUrl, { responseType: 'text' });
            fs.writeFileSync(wordlistPath, response.data);
            console.log('Wordlist downloaded.');
        }

        const zipPath = await downloadFeroxbuster();
        const executablePath = await unzipFeroxbuster(zipPath);
        
        runFeroxbuster(url, wordlistPath, executablePath);

        await generateReports();
    } catch (error) {
        console.error('An error occurred:', error instanceof Error ? error.message : String(error));
    } finally {
        rl.close();
    }
}

main();
