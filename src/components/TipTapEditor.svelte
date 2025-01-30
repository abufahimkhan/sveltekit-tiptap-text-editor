<script lang="ts">
  // Import styles and components
  import "../app.css";
  import GenerateButton from "./custom/GenerateButton.svelte";
  import ButtonGroup from "./custom/ButtonGroup.svelte";
  import ErrorMessage from "./custom/ErrorMessage.svelte";
  import Inputs from "./custom/Inputs.svelte";
  import { writable } from "svelte/store";
  import { CohereClientV2 } from "cohere-ai";
  import { Highlight } from "@tiptap/extension-highlight";
  import { Editor as TiptapEditor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { onMount } from "svelte";
  import { Circle2 } from "svelte-loading-spinners";
  import { navigating } from "$app/stores";

  // Reactive state variables for UI state
  const isLoading = writable(false);
  const errorMessage = writable("");
  const aiErrorMessage = writable("");
  const customPrompt = writable("");

  // Initialize Cohere API client
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || "", // API key from environment variable
  });

  // Editor instance reference
  let editor: TiptapEditor | null = null;
  let editorContainer: HTMLDivElement | null = null;

  // Floating toolbar state
  const selectionToolbarVisible = writable(false);
  const selectionPosition = writable({ top: 0, left: 0 });
  // Store hover state for toolbar visibility
  let selectionHovered = writable(false);

  // Error handling function
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

  // Reset states
  const resetState = () => {
    isLoading.set(false);
    errorMessage.set("");
    aiErrorMessage.set("");
  };

  // Function to send selected text and custom prompt to Cohere AI
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

    // Construct the prompt based on selection
    const prompt = selectedText
      ? `Modify the following text based on this instruction: '${$customPrompt}'. Text: '${selectedText}'`
      : `Write or generate content based on this instruction: '${$customPrompt}'.`;

    resetState();
    isLoading.set(true);

    try {
      // Send request to Cohere API
      const response = await cohere.chat({
        model: "command-r-plus-08-2024",
        messages: [{ role: "user", content: prompt }],
      });

      const generatedText = response?.message?.content;

      if (generatedText) {
        editor.commands.unsetHighlight(); // Remove previous highlights

        if (selectedText) {
          // Replace selected text with AI-generated content
          editor.commands.insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            generatedText,
          );
        } else {
          // If no selection, insert at cursor position
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

  // Clear editor content
  const clearEditorContent = () => {
    editor?.commands.setContent("");
  };

  // Initialize the editor with Highlight extension and floating toolbar logic
  onMount(() => {
    if (editorContainer) {
      editor = new TiptapEditor({
        element: editorContainer,
        extensions: [StarterKit, Highlight.configure({ multicolor: true })],
        onSelectionUpdate: ({ editor }) => {
          const { from, to } = editor.state.selection;

          if (from !== to) {
            editor
              .chain()
              .focus()
              .command(({ tr, state }) => {
                // Remove ALL previous highlights
                tr.doc.descendants((node, pos) => {
                  if (
                    node.marks.some((mark) => mark.type.name === "highlight")
                  ) {
                    tr.removeMark(
                      pos,
                      pos + node.nodeSize,
                      state.schema.marks.highlight,
                    );
                  }
                });
                return true;
              })
              .setMark("highlight", { color: "" })
              .run(); // Apply new highlight

            // Show the toolbar at the selected text position
            // Get the bounding box of selected text
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();

              let top = rect.top + window.scrollY - 1; // Place toolbar above text
              let left = rect.left + window.scrollX + rect.width / 2 - 60; // Center align

              // Ensure toolbar doesn't go off-screen
              if (top < 10) top = rect.bottom + window.scrollY + 5; // Move below if too high
              if (left < 5) left = 5; // Keep within left boundary
              if (left + 120 > window.innerWidth)
                left = window.innerWidth - 120; // Keep within right boundary

              selectionPosition.set({ top, left });
              selectionToolbarVisible.set(true);
            }
          } else {
            // Hide toolbar when no text is selected
            selectionToolbarVisible.set(false);
          }
        },
      });
    }

    // Hide toolbar when clicking outside
    document.addEventListener("click", (event) => {
      const toolbar = document.getElementById("toolbar-popup");

      if (
        editorContainer &&
        !editorContainer.contains(event.target as Node) &&
        toolbar &&
        !toolbar.contains(event.target as Node)
      ) {
        selectionToolbarVisible.set(false);
      }
    });

    return () => {
      if (editor) {
        editor.destroy();
        editor = null;
      }
      document.removeEventListener("click", () =>
        selectionToolbarVisible.set(false),
      );
    };
  });
</script>

<!-- UI Components -->
<div class="bg-black max-w-4xl mx-auto p-8 space-y-6 mt-5">
  <h1 class="text-white text-3xl animate-pulse font-mono">Greetings...</h1>
  <p class="text-white text-[10px] animate-pulse font-mono">
    AI chat-bot at your service
  </p>

  <!-- Editor Container -->
  <div
    bind:this={editorContainer}
    class="font-mono max-w-5xl overflow-y-auto border border-none bg-gray-900 text-gray-200 rounded-lg p-4 shadow-md"
    style="max-height: 400px;"
  >
    {#if $isLoading || $navigating}
      <div class="flex justify-end mt-0">
        <Circle2 size="30" />
      </div>
    {/if}
  </div>

  <!-- Floating Toolbar for Text Formatting -->
  {#if $selectionToolbarVisible}
    <div
      class="absolute bg-gray-800 text-white rounded-lg shadow-lg p-2 flex space-x-2"
      style="top: {$selectionPosition.top}px; left: {$selectionPosition.left}px;"
    >
      <button
        class="px-2 py-1"
        on:click={() => editor?.chain().focus().toggleBold().run()}>Bold</button
      >
      <button
        class="px-2 py-1"
        on:click={() => editor?.chain().focus().toggleItalic().run()}
        >Italic</button
      >
      <button
        class="px-2 py-1"
        on:click={() => editor?.chain().focus().toggleStrike().run()}
        >Strike</button
      >
    </div>
  {/if}

  <!-- Error Messages -->
  <ErrorMessage errorMessage={$errorMessage} aiErrorMessage={$aiErrorMessage} />
  <ButtonGroup {editor} clearContent={clearEditorContent} />

  <!-- AI Custom Prompt Section -->
  <div class="mt-4">
    <label for="editor" class="font-mono block text-gray-400 mb-2">
      AI Custom Prompt:
    </label>
    <div
      class="flex flex-col space-y-2 lg:space-y-0 items-center lg:flex-row space-x-4"
    >
      <Inputs
        bind:value={$customPrompt}
        placeholder="Customize the prompt for AI..."
        className="w-full sm:w-3/4 font-mono"
      />
      <GenerateButton isLoading={$isLoading} onClick={cohereResponse} />
    </div>
  </div>
</div>
