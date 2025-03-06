
<p align="center">
  <img src="./logo/NilgiriSecurity.png" alt="Nilgiri Security Logo" width="200"/>
</p>
<h1 align="center">Nilgiri Framework</h1>
<p align="center">
    <!-- NPM badges -->
    <!-- <a href="https://www.npmjs.com/package/nilgirisecurity"> -->
        <!-- <img src="https://img.shields.io/npm/v/nilgirisecurity.svg" alt="npm version"> -->
    </a>
    <!-- <a href="https://www.npmjs.com/package/nilgirisecurity"> -->
        <!-- <img src="https://img.shields.io/npm/dm/nilgirisecurity.svg" alt="npm downloads"> -->
    </a>
</p>

<h2>nilgiri-security: A Core Component of the Nilgiri Framework</h2>

<p>
The <code>nilgiri-security</code> module leverages the power of <strong>Feroxbuster</strong> for web security scanning and integrates <strong>AI-driven</strong> insights for advanced analysis. It simplifies security testing by scanning target URLs for common vulnerabilities and generating detailed reports in both JSON and HTML formats. With AI-generated insights, it highlights critical findings such as unauthorized access points, helping teams strengthen their application security. Perfect for teams aiming to automate, analyze, and enhance their security testing workflows with ease.
</p>

<h2>Why Wordlist Matters?</h2>

<p>
The <strong>wordlist</strong> plays a crucial role in the scanning process by guiding Feroxbuster to search for common paths, files, and endpoints within a target URL. It acts as a dictionary of potential locations where vulnerabilities or sensitive information might exist. The <code>nilgiri-security</code> module uses the widely recognized wordlist from the <a href="https://github.com/danielmiessler/SecLists" target="_blank">SecLists repository</a> to ensure comprehensive coverage during scanning. By default, the module utilizes the following wordlist:
</p>

<pre><code>https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt</code></pre>

<p>
This wordlist increases the efficiency and accuracy of the scan, helping identify potential security gaps that might otherwise go unnoticed.
</p>

<h1 align="center">How to Setup ?</h1>

Before we go to Setup Lets See what are the prerequisites 
### Prerequisites

1. **Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **IDE**: This project is written in TypeScript, so you'll need to IDE Which Supports NodeJs, For Example : VScode , Intelli ,Etc.
4. **AI API Key and EndPoint**: This Project is AI-driven,Hence User are requested to get ready with AI API Auth Key and End Point .

## Setup : Install and Run

**Install Depencency**:

   ```bash
   npm install nilgirisecurity --save -d
   ```

### Parameters

<table border="1">
    <thead>
        <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Description</th>
            <th>Example</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>systemUrl</code></td>
            <td>string</td>
            <td>The URL of the target system to be scanned.</td>
            <td><code>'https://example.com'</code></td>
        </tr>
        <tr>
            <td><code>apiKey</code></td>
            <td>string</td>
            <td>The API key for authenticating with the AI service. Required for generating AI-based insights in the report.</td>
            <td><code>'sk-xxxxxx12345'</code></td>
        </tr>
        <tr>
            <td><code>apiEndpoint</code></td>
            <td>string</td>
            <td>The endpoint URL of the AI service (e.g., OpenAI API) where AI analysis requests are sent.</td>
            <td><code>'https://api.openai.com/v1/completions'</code></td>
        </tr>
    </tbody>
</table>


<h1 align="center">How to Run the Application ?</h1>

**Running the Application**

To run the runFeroxbusterAnalysis method, you need to import and call the method in your script.

Example: `testFile.ts`

```bash
import { runFeroxbusterAnalysis } from "./src/tests/main";

const aiEndpoint = 'https://api.openai.com/v1/completions';
const aiApiKey = 'sk-xxxxxx12345';
const systemUnderTestUrl = 'https://example.com';

runFeroxbusterAnalysis(aiEndpoint, aiApiKey, systemUnderTestUrl)
  .then(() => console.log('Feroxbuster analysis completed!'))
  .catch(err => console.error('Error during analysis:', err));
``` 
**Run the File**

If you’re using Node.js, you can run the file by executing the following command in your terminal:
```bash
node <your-file-name>.js
```
#### If you are running your file in Type Script then follow this Step 

### Prerequisites
1. Ensure you have **Node.js** and **TypeScript** installed on your machine.
   - You can download Node.js from [here](https://nodejs.org/).
   - To install TypeScript globally, run the following command:
     ```bash
     npm install -g typescript
     ```

### Steps to Run

1. **Compile the TypeScript file**:
   In your terminal, navigate to the project folder and run the following command to compile the TypeScript file:
   ```bash
   tsc <your-file-name>.ts
   node <your-file-name>.js
   ts-node <your-file-name>.ts

<h2>Features</h2>
<ul>
  <li>Scans a target URL for potential security issues using the <strong>Feroxbuster</strong> tool.</li>
  <li>Downloads and unzips the <strong>Feroxbuster</strong> executable.</li>
  <li>Uses a customizable wordlist for comprehensive endpoint discovery.</li>
  <li>Generates two types of reports:
    <ul>
      <li><strong>JSON Report:</strong> Contains detailed findings and scan summary.</li>
      <li><strong>HTML Report:</strong> A human-readable report with comprehensive security analysis.</li>
    </ul>
  </li>
  <li>Integrates with AI to analyze scan results and generate actionable insights for security improvements.</li>
  <li>Automates the process of scanning, analyzing, and reporting, reducing manual effort.</li>
</ul>

<p>Thank you for choosing <strong>nilgiri-security</strong> as part of the Nilgiri framework for your Node.js utility needs!</p>

<p align="center">&copy; 2025 Tricon Infotech</p>
