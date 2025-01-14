import { json } from '@sveltejs/kit';
import { CohereClientV2 } from 'cohere-ai';

const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || '',
});

export async function POST({ request }) {
    const { text, prompt } = await request.json();

    if (!text) {
        return json({ error: 'No text provided' }, { status: 400 });
    }

    const defaultPrompt = prompt || `Generate text based on this: ${text}`;

    try {
        const response = await cohere.chat({
            model: 'command-r-plus',
            messages: [{ role: 'user', content: defaultPrompt }],
        });

        const generatedText = response?.message?.content;

        if (generatedText) {
            return json({ text: generatedText });
        } else {
            return json({ error: 'No response from AI' }, { status: 500 });
        }
    } catch (err) {
        console.error(err);
        return json({ error: 'Failed to fetch AI response' }, { status: 500 });
    }
}
