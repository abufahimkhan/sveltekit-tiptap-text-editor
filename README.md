# SvelteKit TipTap Text Editor with AI Integration

This project integrates a TipTap text editor into a SvelteKit application with AI-powered text generation using Cohere's API.

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- npm (included with Node.js)

---

## Setup and Installation

1. **Clone or Create the Project**:

   ```bash
   npx sv create sveltekit-tiptap-text-editor
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd sveltekit-tiptap-text-editor
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Install Required Packages**:

   ```bash
   npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-bold @tiptap/extension-italic
   npm install -D tailwindcss postcss autoprefixer
   ```

5. **Initialize TailwindCSS**:

   ```bash
   npx tailwindcss init
   ```

6. **Configure Tailwind**:
   Update the `tailwind.config.js` file with the following:

   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: ['./src/**/*.{html,js,svelte,ts}'],
     theme: {
       extend: {}
     },
     plugins: []
   }
   ```

7. **Set Up Cohere API Key**:
   Obtain your API key from [Cohere's Dashboard](https://docs.cohere.com/reference/about#typescript).

   Create a `.env` file in the root of the project and add:

   ```env
   COHERE_API_KEY=your_api_key_here
   ```

8. **Run the Development Server**:
   ```bash
   npm run dev -- --open
   ```

---

## Using the Plugin within the Editor

1. **Select Text**: Highlight any portion of the text within the editor.
2. **Generate AI Content**: Use the "Regenerate with AI" button to replace the selected text with AI-generated content.
3. **Customize Prompt**: Enter a custom prompt in the input field for more specific AI responses.

---

## Features

- **Rich Text Editing**:
  - Bold
  - Italics
  - Text Styles
- **AI Integration**:
  - Text generation using Cohere's API.
  - Inline replacement of selected text.
- **Dynamic UI**:
  - Smooth loading animations.
  - Error feedback for better user experience.

---

## Notes on API Key Setup

1. Ensure the API key is valid and correctly set in the `.env` file.
2. Never expose the API key in client-side code; always use environment variables or secure back-end services.
3. If the API key is invalid or the request fails, the application will display an error message.

---

For more details, refer to the [Cohere Documentation](https://docs.cohere.com/).
