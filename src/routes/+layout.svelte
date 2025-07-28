<script>
import "../app.css";
import { onMount } from "svelte";
import { theme } from "$lib/theme";

onMount(() => {
	theme.init();
});
</script>

<slot />
