import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.COHERE_API_TOKEN': JSON.stringify(process.env.COHERE_API_TOKEN),
	},
});
