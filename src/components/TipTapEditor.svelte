<script lang="ts">
  import "../app.css";
  import GenerateButton from "./GenerateButton.svelte";
  import ButtonGroup from "./ButtonGroup.svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import { writable } from "svelte/store";
  import { CohereClientV2 } from "cohere-ai";
  import { Highlight } from "@tiptap/extension-highlight";
  import { Editor as TiptapEditor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { onMount } from "svelte";
  import { Circle2 } from "svelte-loading-spinners";
  import { navigating } from "$app/stores";
  import Inputs from "./custom/Inputs.svelte";

  const isLoading = writable(false);
  const errorMessage = writable("");
  const aiErrorMessage = writable("");
  const customPrompt = writable("");

  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || "",
  });

  let editor: TiptapEditor | null = null;
  let editorContainer: HTMLDivElement | null = null;

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes("invalid API key")) {
        return "Invalid API key. Please check your credentials.";
      }
      if (err.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      return err.message;
    }
    return "An unexpected error occurred. Please try again.";
  };

  const resetState = () => {
    isLoading.set(false);
    errorMessage.set("");
    aiErrorMessage.set("");
  };

  const cohereResponse = async (): Promise<void> => {
    if (!editor) return;

    // Ensure a custom prompt is provided
    if (!$customPrompt.trim()) {
      errorMessage.set("Please provide a custom prompt or select some text.");
      return;
    }

    // Get the selected text from the editor
    const selectedText: string = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );

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
  `
      : `
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

    resetState();
    isLoading.set(true);

    try {
      // Send the request to Cohere's chat endpoint
      const response = await cohere.chat({
        model: "command-r-plus-08-2024", // Use your model
        messages: [{ role: "user", content: prompt }],
      });

      const generatedText = response?.message?.content;

      if (generatedText) {
        editor.commands.unsetHighlight();

        if (selectedText) {
          // Replace the selected text with AI-generated content
          editor.commands.insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            generatedText,
          );
        } else {
          // If no selection, insert the content at the current cursor
          editor.commands.insertContent(generatedText);
          editor.commands.insertContent(`<br><br>`);
        }
      } else {
        aiErrorMessage.set(
          "AI could not generate a meaningful response. Please try again.",
        );
      }
    } catch (err) {
      errorMessage.set(handleError(err));
    } finally {
      isLoading.set(false);
    }
  };

  const clearEditorContent = () => {
    editor?.commands.setContent("");
  };

  // Initialize the editor with Highlight extension and other configurations
  onMount(() => {
    if (editorContainer) {
      editor = new TiptapEditor({
        element: editorContainer,
        extensions: [StarterKit, Highlight.configure({ multicolor: true })],
        onSelectionUpdate: ({ editor }) => {
          const { from, to } = editor.state.selection;
          if (from !== to) {
            // Automatically highlight when text is selected
            editor.chain().focus().toggleHighlight().run();
          }
        },
      });
    }

    return () => {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    };
  });

  // Function to highlight the selected text
  const highlightSelection = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().toggleHighlight().run();
      }
    }
  };
</script>

<div class="bg-black max-w-4xl mx-auto p-8 space-y-6 mt-24">
  <h1 class="text-white text-3xl animate-pulse font-mono">Greetings.......</h1>

  <!-- Response Area (Scrollable) -->
  <div
    bind:this={editorContainer}
    class="font-mono max-w-5xl overflow-y-auto border border-none bg-gray-900 text-gray-200 rounded-lg p-4 shadow-md"
    style="max-height: 400px;"
  >
    <!-- Loading Spinner Above Input -->
    {#if $isLoading || $navigating}
      <div class="flex justify-end mt-0">
        <Circle2 size="30" />
      </div>
    {/if}
  </div>

  <!-- Error Messages -->
  <ErrorMessage errorMessage={$errorMessage} aiErrorMessage={$aiErrorMessage} />
  <ButtonGroup {editor} clearContent={clearEditorContent} />

  <!-- AI Custom Prompt Section -->
  <div class="mt-4">
    <label for="editor" class="font-mono block text-gray-400 mb-2"
      >AI Custom Prompt:</label
    >
    <div class="flex items-center space-x-4">
      <Inputs
        bind:value={$customPrompt}
        placeholder="Customize the prompt for AI..."
        className="w-full sm:w-3/4 font-mono"
      />
      <GenerateButton isLoading={$isLoading} onClick={cohereResponse} />
    </div>
  </div>
</div>
