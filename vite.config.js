import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub project sites are served from /<repository>/, while local and
  // custom-domain deployments are served from the domain root.
  base: process.env.GITHUB_ACTIONS ? '/FinTeens/' : '/',
});
