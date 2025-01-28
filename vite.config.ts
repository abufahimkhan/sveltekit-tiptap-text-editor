import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import dotenv from 'dotenv';
import path from "path";
dotenv.config();

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib"),
		},
	},
	plugins: [sveltekit()],
	define: {
		'process.env.COHERE_API_TOKEN': JSON.stringify(process.env.COHERE_API_TOKEN),
	},
});
