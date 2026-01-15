export default defineConfig({
  plugins: [
    base44({
      visualEditAgent: false,
      navigationNotifier: false,
      hmrNotifier: false
    }),
    react(),
  ]
})
