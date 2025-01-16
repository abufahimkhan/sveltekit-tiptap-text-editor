<script lang="ts">
  import "../app.css";
  import Editor from "./Editor.svelte";
  import GenerateButton from "./GenerateButton.svelte";
  import ButtonGroup from "./ButtonGroup.svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import { writable } from "svelte/store";
  import { CohereClientV2 } from "cohere-ai";

  const isLoading = writable(false);
  const errorMessage = writable("");
  const aiErrorMessage = writable("");
  const customPrompt = writable("");

  const cohere = new CohereClientV2({
    token: process.env.COHERE_API_TOKEN || "",
  });

  let editor: import("@tiptap/core").Editor | null = null;

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

    let prompt = $customPrompt || "Generate text based on the content.";

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    );

    if (selectedText) {
      prompt =
        $customPrompt || `Generate text based on this: '${selectedText}'`;
    }

    if (!selectedText && editor.state.doc.textContent.trim() === "") {
      errorMessage.set(
        "Please enter some text or select text before generating AI content.",
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
        if (selectedText) {
          editor.commands.insertContentAt(
            {
              from: editor.state.selection.from,
              to: editor.state.selection.to,
            },
            generatedText,
          );
        } else {
          editor.commands.insertContent(generatedText);
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
    editor?.commands.setContent("Write your prompt here...");
  };
</script>

<div class="max-w-4xl mx-auto p-8 space-y-6">
  <Editor bind:editor />
  <ErrorMessage errorMessage={$errorMessage} aiErrorMessage={$aiErrorMessage} />
  <ButtonGroup {editor} clearContent={clearEditorContent} />
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
  <GenerateButton isLoading={$isLoading} onClick={cohereResponse} />
</div>
