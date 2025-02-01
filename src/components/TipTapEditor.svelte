<script lang="ts">
  // Import styles and components
  import "../app.css";
  import GenerateButton from "./custom/GenerateButton.svelte"; // Custom generate button
  import ButtonGroup from "./custom/ButtonGroup.svelte"; // Custom button group for editing actions
  import ErrorMessage from "./custom/ErrorMessage.svelte"; // Error message display
  import Inputs from "./custom/Inputs.svelte"; // Custom input field for AI prompt
  import { writable } from "svelte/store"; // Reactive state management with Svelte store
  import { CohereClientV2 } from "cohere-ai"; // Cohere API client
  import { Highlight } from "@tiptap/extension-highlight"; // Tiptap extension for highlighting text
  import { Editor as TiptapEditor } from "@tiptap/core"; // Tiptap editor
  import StarterKit from "@tiptap/starter-kit"; // Tiptap starter kit with basic functionalities
  import { onMount } from "svelte"; // Svelte lifecycle hook to run after component is mounted
  import { Circle2 } from "svelte-loading-spinners"; // Loading spinner for async actions
  import { navigating } from "$app/stores"; // Svelte store for navigation status

  // Reactive state variables for UI state
  const isLoading = writable(false); // Track loading state for async operations
  const errorMessage = writable(""); // Store error message
  const aiErrorMessage = writable(""); // Store AI error message
  const customPrompt = writable(""); // Custom prompt for the AI

  // Initialize Cohere API client
  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || "", // API key from environment variable for security
  });

  // Editor instance reference
  let editor: TiptapEditor | null = null; // Store the editor instance
  let editorContainer: HTMLDivElement | null = null; // Reference to the editor container DOM element

  // Floating toolbar state and position
  const selectionToolbarVisible = writable(false); // Track if the toolbar should be visible
  const selectionPosition = writable({ top: 0, left: 0 }); // Position of the toolbar
  let selectionHovered = writable(false); // Track if the toolbar is being hovered

  // Error handling function for API errors
  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes("invalid API key")) {
        return "Invalid API key. Please check your credentials."; // Handle invalid API key error
      }
      if (err.message.includes("timeout")) {
        return "Request timed out. Please try again."; // Handle timeout error
      }
      return err.message; // Return the error message if not a known type
    }
    return "An unexpected error occurred. Please try again."; // Default error message
  };

  // Reset UI state variables
  const resetState = () => {
    isLoading.set(false); // Reset loading state
    errorMessage.set(""); // Clear error message
    aiErrorMessage.set(""); // Clear AI-related error message
  };

  // Function to send selected text and custom prompt to Cohere AI for processing
  const cohereResponse = async (): Promise<void> => {
    if (!editor) return; // If editor is not initialized, do nothing

    // Ensure that a custom prompt is provided before sending the request
    if (!$customPrompt.trim()) {
      errorMessage.set("Please provide a custom prompt or select some text.");
      return;
    }

    // Get the selected text from the editor's current selection
    const selectedText: string = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );

    // Construct the prompt by combining selected text with the custom prompt
    const prompt = selectedText
      ? `Modify the following text based on this instruction: '${$customPrompt}'. Text: '${selectedText}'`
      : `Write or generate content based on this instruction: '${$customPrompt}'.`;

    resetState(); // Reset the state before making the request
    isLoading.set(true); // Set loading state to true while waiting for the response

    try {
      // Send the prompt to the Cohere API to get a response
      const response = await cohere.chat({
        model: "command-r-plus-08-2024", // Specify the AI model to use
        messages: [{ role: "user", content: prompt }], // Send the prompt as a user message
      });

      const generatedText = response?.message?.content;

      if (generatedText) {
        editor.commands.unsetHighlight(); // Remove any previous highlights

        if (selectedText) {
          // If text is selected, replace it with the generated content
          editor.commands.insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            generatedText,
          );
        } else {
          // If no text is selected, insert the generated content at the cursor position
          editor.commands.insertContent(generatedText);
          editor.commands.insertContent(`<br><br>`); // Add extra space after insertion
        }
      } else {
        aiErrorMessage.set(
          "AI could not generate a meaningful response. Please try again.",
        );
      }
    } catch (err) {
      errorMessage.set(handleError(err)); // Set the error message if the request fails
    } finally {
      isLoading.set(false); // Reset loading state once the request is complete
    }
  };

  // Clear editor content (reset to empty)
  const clearEditorContent = () => {
    editor?.commands.setContent(""); // Clear the editor content using Tiptap's command API
  };

  // Initialize the Tiptap editor with the Highlight extension and toolbar behavior
  onMount(() => {
    if (!editorContainer) return; // Ensure editorContainer is not null

    // Initialize Tiptap editor
    editor = new TiptapEditor({
      element: editorContainer as HTMLDivElement, // Cast editorContainer to HTMLDivElement for type safety
      extensions: [StarterKit, Highlight.configure({ multicolor: true })], // Include necessary extensions
      onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection;

        if (from !== to) {
          // Remove all previous highlights before adding new highlight
          editor
            .chain()
            .focus()
            .command(({ tr, state }) => {
              tr.doc.descendants((node, pos) => {
                if (node.marks.some((mark) => mark.type.name === "highlight")) {
                  tr.removeMark(
                    pos,
                    pos + node.nodeSize,
                    state.schema.marks.highlight,
                  );
                }
              });
              return true;
            })
            .run();

          // Get the bounding box of the selected text to position the toolbar
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calculate toolbar position based on selected text
            const midpointTop = rect.top + window.scrollY - 100; // Adjust position for toolbar
            const midpointLeft =
              rect.left + window.scrollX + rect.width / 2 - 60; // Center toolbar horizontally

            // Prevent the toolbar from going off-screen
            let top =
              midpointTop < 10 ? rect.bottom + window.scrollY + 5 : midpointTop;
            let left = midpointLeft < 5 ? 5 : midpointLeft;
            if (left + 100 > window.innerWidth) left = window.innerWidth - 120;

            selectionPosition.set({ top, left }); // Update the position store
            selectionToolbarVisible.set(true); // Make the toolbar visible
          }

          // Apply new highlight with default color (yellow)
          editor.chain().focus().setMark("highlight", { color: "" }).run();
        } else {
          selectionToolbarVisible.set(false); // Hide toolbar when no text is selected
        }
      },
    });

    // Scroll event listener to handle toolbar repositioning during scrolling
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // Hide toolbar if the selected text goes out of the viewport
          if (rect.top < 0 || rect.bottom > 0) {
            selectionToolbarVisible.set(false);
          } else {
            // Reposition toolbar if it's still visible
            let top = rect.top + window.scrollY - 0;
            let left = rect.left + window.scrollX + rect.width / 2 - 60;

            // Adjust toolbar position based on screen boundaries
            if (top < 10) top = rect.bottom + window.scrollY + 5;
            if (left < 5) left = 5;
            if (left + 120 > window.innerWidth) left = window.innerWidth - 120;

            selectionPosition.set({ top, left });
          }
        }
      });
    };

    document.addEventListener("scroll", handleScroll, true); // Attach scroll listener

    // Hide toolbar when clicking outside of the editor
    document.addEventListener("click", (event) => {
      const toolbar = document.getElementById("toolbar-popup");
      if (
        editorContainer &&
        !editorContainer.contains(event.target as Node) &&
        toolbar &&
        !toolbar.contains(event.target as Node)
      ) {
        selectionToolbarVisible.set(false); // Hide toolbar if clicked outside
      }
    });

    // Cleanup function to remove event listeners when the component is destroyed
    return () => {
      if (editor) {
        editor.destroy(); // Clean up the editor instance
        editor = null;
      }
      document.removeEventListener("scroll", handleScroll, true); // Remove scroll listener
      document.removeEventListener(
        "click",
        () => selectionToolbarVisible.set(false), // Remove click listener
      );
    };
  });
</script>

<!-- UI Components -->
<!-- UI Components -->
<div
  class="bg-black flex flex-col h-screen max-w-7xl mx-auto p-8 space-y-6 mt-2"
>
  <h1 class="text-white text-2xl animate-pulse font-mono">Greetings...</h1>
  <p class="text-white text-[10px] animate-pulse font-mono">
    AI chat-bot at your service
  </p>

  <!-- Editor Container -->
  <div
    bind:this={editorContainer}
    class="tiptap-editor flex-1 overflow-y-auto border-none bg-gray-900 text-gray-200 rounded-lg p-8 shadow-md"
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
      class="fixed bg-gray-800 text-white rounded-lg shadow-lg p-2 flex space-x-2"
      style="top: {$selectionPosition.top}px; left: {$selectionPosition.left}px; z-index: 9999;"
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
