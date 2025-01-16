# SvelteKit TipTap Text Editor with AI Integration

This project integrates a TipTap text editor into a SvelteKit application with AI-powered text generation using Cohere's API.

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- npm (included with Node.js)

---
## Setup and Installation

1. **Create or Clone the Project**:

   ```bash
   npx sv create sveltekit-tiptap-text-editor
   ```

2. **Navigate to the Project Directory:**:
   -cd sveltekit-tiptap-text-editor

3. **Install Project Dependencies:**:

- npm install

4. **Install Additional Required Packages:**:

- npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-bold @tiptap/extension-italic svelte/store
- npm install -D tailwindcss postcss autoprefixer dotenv

5. **Navigate to the Project Directory:**:

- cd sveltekit-tiptap-text-editor

5. **Initialize TailwindCSS:**:

- npx tailwindcss init

5. **Configure Tailwind: Update the tailwind.config.js file with the following configuration:**:
   /** @type {import('tailwindcss').Config} \*/
   module.exports = {
   content: ['./src/**/\*.{html,js,svelte,ts}'],
   theme: {
   extend: {}
   },
   plugins: []
   };

6. **Set Up Cohere API Key:**:

- Obtain your API key from Cohere's Dashboard.

- Create a .env file in the root of the project and add your API key:

- env
- Copy
- Edit
- COHERE_API_TOKEN=your_api_key_here

5. **Run the Development Server:**:

- npm run dev

5. \*\*Features
   Rich Text Editing
   The TipTap text editor includes the following functionalities:

Bold Text: Apply bold styling to selected text.
Italic Text: Apply italic styling to selected text.
Strikethrough: Add strikethrough styling.
Dynamic Content Replacement: AI responses dynamically replace selected text or append content.
AI Integration
Text Generation: Cohere API generates contextual text based on editor content.
Custom Prompts: Customize prompts for specific AI behavior.
Error Handling: Clear feedback for invalid API keys, empty prompts, or connection errors.
UI and UX
Responsive Design: Tailored for different screen sizes using TailwindCSS.
Dynamic Error Messages: Highlight issues like missing API keys or invalid input.
Smooth Animations: Loading indicators for generating AI responses.
Usage Instructions
Edit Text:

Use the TipTap editor to write or format text.
Buttons for Bold, Italic, and Strike are available to style content.
Select and Generate:

Highlight text and click Generate with AI to replace it with AI-generated content.
Leave the text unselected to append generated content at the end.
Custom AI Prompts:

Enter a custom prompt in the input field to tailor AI responses to specific needs.
If no custom prompt is provided, a default prompt will be used.
Clear Editor Content:

Use the Clear All button to reset the editor content to the placeholder: "Write your prompt here...".
API Key and Environment Variables
Security Best Practices:

Store the API key in the .env file to avoid exposing it in client-side code.
Use a server-side proxy for API calls in production environments to enhance security.
Error Scenarios:

Invalid API keys or expired tokens will trigger an error message.
Ensure that your API token has sufficient access and is valid for your account.
Example Code
Editor Component Setup
Here’s an example of how the editor and AI generation logic are implemented:

svelte
Copy
Edit
"

<script lang="ts">
  import { writable } from "svelte/store";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";

  let editorContainer: HTMLDivElement | null = null;
  let editor: Editor | null = null;

  const initializeEditor = (container: HTMLDivElement | null): Editor => {
    return new Editor({
      element: container || undefined,
      extensions: [StarterKit],
      content: "Write your prompt here...",
    });
  };

  onMount(() => {
    editor = initializeEditor(editorContainer);
    return () => editor?.destroy();
  });
</script>

<div bind:this={editorContainer} class="editor-container"></div>"
AI Response Handler
ts
Copy
Edit
const cohereResponse = async (): Promise<void> => {
  const response = await cohere.chat({
    model: "command-r-plus",
    messages: [{ role: "user", content: "Your prompt here..." }],
  });

if (response?.message?.content) {
editor.commands.insertContent(response.message.content);
}
};
Troubleshooting
Editor Does Not Initialize:

Ensure that the editor container (bind:this) is correctly bound.
Check that all dependencies, including TipTap, are installed.
AI Response Fails:

Verify that the COHERE_API_TOKEN in the .env file is valid.
Check your internet connection and Cohere API quotas.
Text Formatting Issues:

Ensure the appropriate extensions (e.g., StarterKit, Bold, Italic) are imported and included during editor initialization.
Resources
SvelteKit Documentation
TipTap Documentation
Cohere API Documentation
TailwindCSS Documentation
Copy
Edit
\*\*:
