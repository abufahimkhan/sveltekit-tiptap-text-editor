<script>
  export let onClick;
  export let disabled = false;
  export let variant = "default";
</script>

<button
  class={`px-4 py-2 rounded-lg ${
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-gray-600 hover:bg-gray-700"
  } disabled:opacity-50`}
  on:click={onClick}
  disabled={disabled}
>
  <slot />
</button>
