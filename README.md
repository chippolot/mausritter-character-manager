# Mausritter Character Manager

A modern, interactive character manager for the Mausritter tabletop RPG, built with React and TypeScript.

## Features

- **Character Management**: Create, edit, and manage multiple mouse characters
- **Random Character Generation**: Step-by-step wizard following official Mausritter rules
- **Tactile Inventory System**: Drag-and-drop grid-based inventory with multiple item sizes (1x1, 2x1, 1x2, 2x2)
- **Complete Character Details**: Track stats, background, appearance, equipment, and hirelings
- **Character Status**: Mark characters as alive/dead with visual indicators
- **Persistent Storage**: Characters saved automatically to local storage

## Getting Started

### Prerequisites

- Node.js (version 20.19+ or 22.12+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chippolot/mausritter-character-manager.git
   cd mausritter-character-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Deployment to GitHub Pages

```bash
npm run deploy
```

## Usage

1. **Creating Characters**: Use the "Generate Random Character" button for rule-compliant generation, or "Create Blank Character" for manual setup
2. **Inventory Management**: Drag items between inventory slots, scratch area, and character equipment
3. **Character Details**: Edit all character information directly in the interface
4. **Multiple Characters**: Switch between characters using the character selector

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **@dnd-kit** - Drag and drop functionality

## Legal

This work is based on [Mausritter](https://mausritter.com), a product of Losing Games and Isaac Williams, and is licensed for use under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) licence.

Compatible with Mausritter.

## License

MIT License - see LICENSE file for details.
