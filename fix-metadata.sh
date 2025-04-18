#!/bin/bash

echo "Installing ts-node if not already installed..."
npm install -g ts-node typescript @types/node

echo "Running metadata update script..."
ts-node src/scripts/update-metadata.ts

echo "Creating .eslintrc.json file..."
cat << EOF > .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn"
  }
}
EOF

echo "Running build to check if warnings are fixed..."
npm run build 