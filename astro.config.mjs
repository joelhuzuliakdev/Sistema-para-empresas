// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
    output: 'server',
    adapter: isDev ? node({ mode: 'standalone' }) : vercel(),
    vite: {
        plugins: [tailwindcss()]
    }
});