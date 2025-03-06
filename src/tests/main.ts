import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import unzipper from 'unzipper';
// import { getGPTResponse } from '../utils/AI';
const {getGPTResponse} = require('../utils/AI')
import { systemPrompt, userPrompt } from '../utils/AIprompts';
import { generateHTML } from '../utils/generateReport';

async function downloadFeroxbuster() {
    const url = "https://github.com/epi052/feroxbuster/releases/latest/download/x86_64-windows-feroxbuster.exe.zip";
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
    fs.writeFileSync("feroxbuster.zip", Buffer.from(response.data));
}

async function unzipFeroxbuster() {
    const extractPath = path.resolve('./feroxbuster');
    if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });

    return new Promise<void>((resolve, reject) => {
        fs.createReadStream("feroxbuster.zip")
            .pipe(unzipper.Extract({ path: extractPath }))
            .on('close', () => {
                fs.unlinkSync("feroxbuster.zip");
                resolve();
            })
            .on('error', reject);
    });
}

async function ensureFeroxbusterExists() {
    const exePath = path.resolve('./feroxbuster/feroxbuster.exe');
    if (!fs.existsSync(exePath)) {
        await downloadFeroxbuster();
        await unzipFeroxbuster();
    }
}

async function ensureWordlistExists() {
    const wordlistPath = path.resolve('./common.txt');
    const wordlistUrl = "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt";
    if (!fs.existsSync(wordlistPath)) {
        const response = await axios.get<string>(wordlistUrl, { responseType: 'text' });
        fs.writeFileSync(wordlistPath, response.data);
    }
}

async function parseJsonFile(filePath: string) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const results = fileContent.split('\n').map(line => {
            try { return JSON.parse(line); } catch { return null; }
        }).filter(item => item);

        const summary = {
            totalRequests: results.length,
            statusCodes: {} as Record<string, number>,
            findings: results.map(result => ({
                url: result.url || result.target,
                status: result.status_code || result.status,
                contentLength: result.content_length || result.length,
                contentType: result.content_type || result.type
            }))
        };

        results.forEach(result => {
            const status = result.status_code || result.status;
            summary.statusCodes[status] = (summary.statusCodes[status] || 0) + 1;
        });

        return summary;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return { totalRequests: 0, statusCodes: {}, findings: [] };
    }
}

async function runFeroxbuster(url: string, wordlistPath: string) {
    const exePath = path.resolve('./feroxbuster/feroxbuster.exe');
    const jsonReportPath = path.resolve('./feroxbuster_report.json');
    if (!fs.existsSync(exePath)) throw new Error("Feroxbuster executable not found");
    if (fs.existsSync(jsonReportPath)) fs.unlinkSync(jsonReportPath);
    execSync(`"${exePath}" -u ${url} -w ${wordlistPath} --json -o "${jsonReportPath}"`, { stdio: 'inherit' });
    if (!fs.existsSync(jsonReportPath)) throw new Error('Feroxbuster did not generate JSON report.');
}

async function generateReports(apiKey: string, apiEndpoint: string) {
    const scanData = await parseJsonFile('./feroxbuster_report.json');
    // console.log("Generated Scan Data:", scanData); // Debugging output
    const analysis = await getGPTResponse(apiEndpoint, apiKey, systemPrompt, userPrompt(scanData));
    fs.writeFileSync("security_analysis.html", generateHTML(scanData, analysis));
}

async function runFeroxbusterAnalysis(apiEndpoint: string, apiKey: string, url: string) {
    if (!apiKey || !apiEndpoint || !url.startsWith('http')) {
        throw new Error('Invalid input. Please provide valid API key, endpoint, and URL.');
    }
    await ensureFeroxbusterExists();
    await ensureWordlistExists();
    await runFeroxbuster(url, './common.txt');
    await generateReports(apiKey, apiEndpoint);
}

export  {runFeroxbusterAnalysis}

