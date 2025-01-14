<script lang="ts">
  import "../app.css";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import { CohereClientV2 } from "cohere-ai";

  // State Management
  const isLoading = writable(false);
  const errorMessage = writable("");
  const aiErrorMessage = writable("");
  const customPrompt = writable("");

  // API Client Setup
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || "",
  });

  // Editor Variables
  let editorContainer: HTMLDivElement | null = null;
  let editor: Editor | null = null;
  let isFirstLoad = true;

  // Initialize TipTap Editor
  const initializeEditor = (container: HTMLDivElement | null): Editor => {
    return new Editor({
      element: container || undefined,
      extensions: [StarterKit],
      content: `Write your prompt here...`,
      onSelectionUpdate: ({ editor }) => {
        if (isFirstLoad) {
          isFirstLoad = false;
          editor.commands.setContent(""); // Clear content when typing starts
        }
      },
    });
  };

  // Handle Errors
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

  // Reset State
  const resetState = () => {
    isLoading.set(false);
    errorMessage.set("");
    aiErrorMessage.set("");
  };

  // Regenerate Text with LLM
  const cohereResponse = async (): Promise<void> => {
    if (!editor) return;

    let prompt = $customPrompt || "Generate text based on the content.";

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (selectedText) {
      prompt = $customPrompt || `Generate text based on this: '${selectedText}'`;
    }

    if (!selectedText && editor.state.doc.textContent.trim() === "") {
      errorMessage.set(
        "Please enter some text or select text before generating AI content."
      );
      return;
    }

    resetState();
    isLoading.set(true);

    try {
      const response = await cohere.chat({
        model: "command-r-plus",
        messages: [{ role: "user", content: prompt }],
      });

      const generatedText = response?.message?.content;

      if (generatedText) {
        // If text is selected, replace the selected content with the AI response
        if (selectedText) {
          editor.commands.insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            generatedText
          );
        } else {
          // If no text is selected, append the generated text at the end
          editor.commands.insertContent(generatedText);
        }
      } else {
        aiErrorMessage.set(
          "AI could not generate a meaningful response. Please try again."
        );
      }
    } catch (err) {
      errorMessage.set(handleError(err));
    } finally {
      isLoading.set(false);
    }
  };

  // Clear Editor Content
  const clearEditorContent = () => {
    editor?.commands.setContent("Write your prompt here...");
  };

  // Mount Editor
  onMount(() => {
    editor = initializeEditor(editorContainer);
    editor.commands.focus("start");
    return () => editor?.destroy();
  });
</script>

<div class="max-w-4xl mx-auto p-8 space-y-6">
  <!-- Editor Container -->
  <div
    class="editor-container border border-gray-700 bg-gray-900 text-gray-200 rounded-lg p-4 shadow-md"
    bind:this={editorContainer}
  ></div>

  <!-- Error Messages -->
  {#if $aiErrorMessage}
    <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
      {$aiErrorMessage}
    </div>
  {/if}
  {#if $errorMessage}
    <div class="text-red-700">
      {$errorMessage}
    </div>
  {/if}

  <!-- Button Group -->
  <div class="flex items-center gap-2 mt-4">
    <button
      on:click={() => editor?.chain().focus().toggleBold().run()}
      class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
      Bold
    </button>
    <button
      on:click={() => editor?.chain().focus().toggleItalic().run()}
      class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
      Italic
    </button>
    <button
      on:click={() => editor?.chain().focus().toggleStrike().run()}
      class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
      Strike
    </button>
    <button
      on:click={clearEditorContent}
      class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
    >
      Clear All
    </button>
  </div>

  <!-- AI Custom Prompt Input -->
  <div class="mt-4">
    <label for="editor" class="block text-gray-400 mb-2"
      >AI Custom Prompt:</label
    >
    <input
      type="text"
      bind:value={$customPrompt}
      placeholder="Customize the prompt for AI..."
      class="w-1/2 text-gray-200 p-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
    />
  </div>

  <!-- Generate Button -->
  <button
    on:click={cohereResponse}
    class="mt-4 w-fit py-2 px-5 text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
    disabled={$isLoading}
  >
    {#if $isLoading}
      <span class="loading-spinner"></span> Generating...
    {/if}
    {#if !$isLoading}
      Generate with AI
    {/if}
  </button>
</div>
