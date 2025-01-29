<script lang="ts">
  import "../app.css";
  import GenerateButton from "./custom/GenerateButton.svelte";
  import ButtonGroup from "./custom/ButtonGroup.svelte";
  import ErrorMessage from "./custom/ErrorMessage.svelte";
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

    // Construct a dynamic prompt
    const prompt = selectedText
      ? `Modify the following text based on this instruction: '${$customPrompt}'. Text: '${selectedText}'`
      : `Write or generate content based on this instruction: '${$customPrompt}'.`;

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
  <h1 class="text-white text-3xl animate-pulse font-mono">Greetings...</h1>
  <p class="text-white text-[10px] animate-pulse font-mono">
    ai chat-bot at your service
  </p>

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
