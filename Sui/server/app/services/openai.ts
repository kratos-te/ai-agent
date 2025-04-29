import { Configuration, OpenAIApi } from 'openai';
import { OPEN_AI_KEY } from '../constants';
let configuration: any, openAI: any;

// =============================OPENAI API=============================
export function newOpenAI() {
    if (!configuration || !openAI) {
        configuration = new Configuration({
            basePath: 'https://free.gpt.ge/v1',
            apiKey: OPEN_AI_KEY
        });
        openAI = new OpenAIApi(configuration);
    }
    return { configuration, openAI };
}

export async function getCompletion(messages: object): Promise<any> {
    let { openAI } = newOpenAI();

    // Function to create a promise that rejects after a timeout
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after " + ms + " ms")), ms));

    try {
        // Race the API call against the timeout
        const response = await Promise.race([
            openAI.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0
            }),
            timeout(20000)  // 10 seconds timeout
        ]);

        return response.data;
    } catch (error) {
        // Handle timeout and other errors
        console.error(error)
        throw error;
    }
}

export async function getCompletionGTP4(messages: object): Promise<any> {
    let { openAI } = newOpenAI();

    // Function to create a promise that rejects after a timeout
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after " + ms + " ms")), ms));

    try {
        // Race the API call against the timeout
        const response = await Promise.race([
            openAI.createChatCompletion({
                model: 'gpt-4',
                messages: messages,
                temperature: 0
            }),
            timeout(10000)  // 10 seconds timeout
        ]);

        return response.data;
    } catch (error) {
        // Handle timeout and other errors
        console.error(error)
        throw error;
    }
}

// =============================Logic FUNC=============================
export async function translateToEn(data: string): Promise<Object> {
    const translateToEn = `
Please translate my text, which is delimited by triple #, into English and just output the translated text without anything else, here is the text: 

Example:
###
你好。
###

Output:
Hi

Here is my text:
###
${data}
###
`;
console.log(translateToEn);
    try {
        const message = [
            { role: 'system', content: 'You are my language assistant.' },
            { role: 'user', content: translateToEn }
        ];
        let res = await getCompletion(message);
        let result = res.choices[0].message.content;
        console.log(result);
        return result;
    } catch (error) {
        throw error;
    }
}