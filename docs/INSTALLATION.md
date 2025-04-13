
# Installation Guide

## 🛠 Prerequisites
- Node.js (v18+ recommended)
- npm, yarn, or bun
- Git

## 🔧 Installation & Setup

### Local Development

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to project directory
cd ai-productivity-assistant

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in the `.env` file.

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Troubleshooting

### Common Issues

1. **Build fails with dependency errors**
   - Try removing `node_modules` and reinstalling dependencies:
     ```bash
     rm -rf node_modules
     npm install
     ```

2. **TypeScript errors**
   - Make sure your TypeScript version matches the project requirements
   - Run `npm run type-check` to identify issues

3. **Vite configuration issues**
   - Check your Vite configuration in `vite.config.ts`
   - Ensure all paths and plugins are correctly configured

For additional help, refer to our [TroubleshootPage](/src/pages/TroubleshootPage.tsx) or open an issue on GitHub.
