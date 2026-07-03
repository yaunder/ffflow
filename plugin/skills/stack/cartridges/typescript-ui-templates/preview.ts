import type { Preview } from '@storybook/react' // swap to '@storybook/web-components' in the WC lane

// Import the SAME built design tokens the app consumes, so stories and app never diverge.
// `just tokens` (style-dictionary) generates this from src/tokens/.
import '../src/tokens/build/tokens.css'

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' }, // fail the story on a11y violations at L2+
  },
  // Every component should be exercised in both themes — a "reasonable state" per the rulebook.
  globalTypes: {
    theme: {
      description: 'Design-token theme',
      defaultValue: 'light',
      toolbar: { icon: 'circlehollow', items: ['light', 'dark'] },
    },
  },
}

export default preview
