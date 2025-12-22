export default {
  "assets-src/**/*.{js,jsx,mjs,cjs,ts,mts,css,scss}": ["prettier --write"],
  "**/*.php": ["pnpm run format:php", "pnpm run analyse:php"],
};
