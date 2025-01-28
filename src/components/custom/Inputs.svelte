<script>
  export let value = "";
  export let placeholder = "";
  export let className = "";
</script>

<input
  bind:value
  class={`bg-neutral-700 text-white p-3 rounded-full focus:ring-2 focus:ring-blue-500 ${className}`}
  placeholder={placeholder}
/>
