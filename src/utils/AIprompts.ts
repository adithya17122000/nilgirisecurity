export const systemPrompt = `You are a penetration tester and security expert specializing in web application security assessments. Your task is to:
1. Analyze web directory enumeration results from Feroxbuster scans
2. Identify potential security vulnerabilities and exposure risks
3. Provide actionable remediation steps
4. Generate clear, professional reports suitable for both technical and non-technical stakeholders

Format your analysis using semantic HTML5 with clear sections. Use tables for structured data and appropriate heading levels for hierarchy. Include severity ratings based on CVSS scoring where applicable.`;

export const userPrompt = (scanData: any) => `Analyze these Feroxbuster scan results and generate a comprehensive security report. Structure it as follows:

EXECUTIVE SUMMARY
- Scan scope and target
- High-level risk assessment
- Key statistics: total URLs scanned, unique findings, critical issues
- Risk score (High/Medium/Low) with justification

TECHNICAL FINDINGS
1. Exposure Analysis
   - Discovered sensitive endpoints (admin interfaces, API endpoints, etc.)
   - Exposed technology indicators (server headers, framework fingerprints)
   - Information disclosure instances
   - Each finding should include:
     * URL
     * Status code
     * Risk level
     * Potential impact

2. Pattern Analysis
   - Common URL patterns discovered
   - Interesting file extensions (.bak, .config, .env, etc.)
   - Directory structure insights
   - Authentication/authorization gaps (403s vs 404s patterns)

3. Detailed Statistics
   - Status code distribution with interpretation
   - Content-type analysis
   - Response size anomalies
   - Scan coverage metrics

RECOMMENDATIONS
- Prioritized list of security improvements
- Specific configuration changes needed
- Web server hardening steps
- Access control improvements
- References to relevant security best practices

Raw Scan Data:
Total Requests: ${scanData.totalRequests}
Status Codes: ${JSON.stringify(scanData.statusCodes)}
Notable Findings: ${scanData.findings.length > 0 ? JSON.stringify(scanData.findings.slice(0, 5)) : 'None'}`;