import { FlatCompat } from "@eslint/eslintrc";
import { fixupPluginRules } from "@eslint/compat";
import tseslint from "typescript-eslint";

const compat = new FlatCompat();

const compatConfig = compat.extends("next/core-web-vitals");

const patchedConfig = compatConfig.map((entry) => {
  if (entry.plugins) {
    for (const [key, plugin] of Object.entries(entry.plugins)) {
      entry.plugins[key] = fixupPluginRules(plugin);
    }
  }
  return entry;
});

const config = [
  ...patchedConfig,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Add any TypeScript-specific rules here
    },
  },
  {
    ignores: [".next/*", "out/*","node_modules/*",
      "**/components/ui/**"]
  },
];

export default config;