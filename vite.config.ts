import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/anttp-0': {
				target: 'http://localhost:18888',
				changeOrigin: true
			}
		}
	}
});
