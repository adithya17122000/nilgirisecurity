import axios from 'axios';
async function getGPTResponse(apiEndpoint: string, apiKey: string, systemPrompt: string, userPrompt: string): Promise<string>
 {
    try {
        // console.log(`Calling API: ${apiEndpoint}`);  // Debugging line

        const response = await axios.post<{ choices: { message: { content: string } }[] }>(
            apiEndpoint,
            {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                    'Region': 'eastus2'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', (error as Error).message);
        throw error;
    }
}

module.exports = {getGPTResponse}