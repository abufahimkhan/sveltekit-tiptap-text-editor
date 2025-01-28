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

some custom pompts that can be used: (copy and add)
// Construct a highly dynamic and robust prompt with diverse AI capabilities
const prompt = selectedText
? `
Based on the following instruction: '${$customPrompt}', process the selected text as per the user's request.
Selected Text: '${selectedText}'

    Here are the possible actions the AI can perform:
    1. **Replace Text**: Modify the selected text based on the provided instruction.
       Example: Replace '${selectedText}' with '${$customPrompt}' throughout the entire AI-generated response.
    2. **Remove Similar Words**: Identify and remove all redundant or similar words from the selected text.
    3. **Delete Text**: Completely delete the selected text if requested.
    4. **Rewrite Text**: Rewrite the selected text in a different tone, style, or format (e.g., formal, casual, technical, persuasive, etc.).
    5. **Summarize Text**: Condense the selected text into a brief summary, retaining the most important information.
    6. **Expand Text**: Add more details, explanations, or examples to the selected text.
    7. **Paraphrase Text**: Rewrite the selected text with different phrasing while retaining its original meaning.
    8. **Fix Grammar and Spelling**: Correct any grammar, punctuation, and spelling errors in the selected text.
    9. **Detect Redundancies**: Identify and remove repetitive or redundant phrases or words from the selected text.
    10. **Improve Readability**: Adjust the selected text to improve its readability and flow.
    11. **Change Tone**: Alter the tone of the selected text (e.g., formal to casual, serious to humorous).
    12. **Translate**: Translate the selected text into another language or make it bilingual.
    13. **Extract Keywords**: Identify and list the key points, themes, or important terms from the selected text.
    14. **Make Bullet Points**: Transform the selected text into a bullet-point list for better clarity and organization.
    15. **Remove Jargon**: Simplify complex or technical terms in the selected text.
    16. **Highlight Key Points**: Identify and highlight the most important parts of the selected text.
    17. **Analyze Sentiment**: Detect the sentiment (positive, negative, or neutral) of the selected text.
    18. **Provide Feedback**: Offer constructive feedback on the selected text's writing style, content, and tone.
    19. **Adapt to Target Audience**: Modify the selected text to better suit a specific audience (e.g., kids, professionals, students).
    20. **Shorten Content**: Make the selected text more concise without losing key information.
    21. **Add Examples**: Enrich the selected text with real-world examples or scenarios.
    22. **Explain Complex Terms**: Simplify complex phrases or terms in the selected text.
    23. **Generate Variants**: Provide multiple alternative versions of the selected text.
    24. **Apply Formatting**: Add formatting (HTML, Markdown) to the selected text (e.g., headers, lists, bold, italics).
    25. **Critique Text**: Identify weaknesses in the selected text and suggest improvements.
    26. **Remove Offensive Content**: Detect and remove any potentially offensive or inappropriate language from the selected text.
    27. **Detect Bias**: Identify bias or subjectivity in the selected text and suggest neutral alternatives.
    28. **Convert Passive Voice to Active**: Rewrite the selected text to use active voice for a more direct tone.
    29. **Generate Synonyms**: Replace words in the selected text with synonyms for variety or better word choice.
    30. **Align with a Specific Style Guide**: Rewrite the selected text to align with a particular style guide (e.g., APA, MLA, Chicago).
    31. **Replace Name**: Replace all instances of the name 'Shanto' with 'Luna' throughout the entire text.
       Example: Replace 'Shanto' with 'Luna' wherever it appears in the story.

    Please interpret the user's instruction and perform the appropriate action(s) on the selected text.

` :`
Based on the following instruction: '${$customPrompt}', generate or modify content as needed.

    Here are the possible actions the AI can perform:
    1. **Write Content from Scratch**: Generate new content based on the provided instruction.
    2. **Suggest Titles or Headlines**: Create catchy titles or headlines based on the instruction.
    3. **Generate Questions**: Formulate thought-provoking or quiz-style questions related to the topic.
    4. **Write Dialogues**: Generate conversations or scripts for fictional or real scenarios.
    5. **Create Stories or Narratives**: Write creative or fictional pieces.
    6. **Generate Explanations**: Provide detailed explanations or descriptions of a concept.
    7. **Write Poems or Songs**: Compose creative pieces like poetry, lyrics, or rhymes.
    8. **Create Analogies**: Use comparisons to explain complex ideas simply.
    9. **Generate Outlines**: Create an outline for essays, reports, or presentations.
    10. **Provide Inspiration**: Generate motivational or inspirational messages related to the instruction.
    11. **Write Introductions**: Draft introductory paragraphs for articles or essays.
    12. **Conclude Content**: Summarize or create impactful conclusions.
    13. **Analyze Data**: Provide insights or interpretations of data-based text.
    14. **Format for SEO**: Write content optimized for search engines (e.g., keyword-rich text).
    15. **Tag Generation**: Suggest tags, keywords, or hashtags related to the content.
    16. **Brainstorm Ideas**: Provide a list of creative ideas for a given topic.
    17. **Craft Campaigns**: Write promotional or marketing campaigns.
    18. **Generate Quotes or Sayings**: Come up with unique quotes or proverbs related to the topic.
    19. **Write Descriptions**: Generate concise descriptions for products, services, or ideas.
    20. **Provide Humor**: Add jokes, puns, or lighthearted elements to the content.

    Please interpret the user's instruction and perform the appropriate action(s) as requested.
`;
