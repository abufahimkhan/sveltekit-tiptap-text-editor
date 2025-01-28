<!-- Button.svelte -->
<script>
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";
</script>

<div
  class="w-full max-w-[800px] transition-all duration-300"
  in:fly={{ y: -50, duration: 300, easing: cubicOut }}
  out:fly={{ y: -50, duration: 300, easing: cubicOut }}
>
  <Textarea placeholder="Type your message here." class="w-full h-dvh text-lg bg-slate-400" />
</div>
