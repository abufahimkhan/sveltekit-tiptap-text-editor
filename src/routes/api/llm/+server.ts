import { json } from '@sveltejs/kit';
import { CohereClientV2 } from 'cohere-ai';

// Initialize the Cohere client
const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || '',
});

// Helper function to handle errors
const handleError = (err: unknown): string => {
    if (err instanceof Error) {
        if (err.message.includes('invalid API key')) {
            return 'Invalid API key. Please check your credentials.';
        }
        if (err.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        return err.message;
    }
    return 'An unexpected error occurred. Please try again.';
};

export async function POST({ request }) {
    try {
        const { text, prompt } = await request.json();

        // Ensure custom prompt is provided
        if (!text && !prompt) {
            return json(
                { error: 'Please provide a custom prompt or some text to process.' },
                { status: 400 }
            );
        }

        // Construct the default prompt
        const finalPrompt = text
            ? `Replace the selected text: '${text}' based on: '${prompt}'.`
            : `Generate text based on: '${prompt}'.`;

        // Send the request to Cohere's chat endpoint
        const response = await cohere.chat({
            model: 'command-r-plus-08-2024', // Use the appropriate model
            messages: [{ role: 'user', content: finalPrompt }],
        });

        const generatedText = response?.message?.content;

        if (generatedText) {
            return json({ text: generatedText });
        } else {
            return json(
                { error: 'AI could not generate a meaningful response. Please try again.' },
                { status: 500 }
            );
        }
    } catch (err) {
        console.error(err);
        return json({ error: handleError(err) }, { status: 500 });
    }
}
