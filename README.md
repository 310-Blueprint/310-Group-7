# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Color palette

The project's color palette lives in [`src/styles/preset.css`](src/styles/preset.css), imported by `src/index.css`. Tailwind v4 doesn't have a JS `theme.extend` config, so the palette is defined with Tailwind's CSS-based `@theme` equivalent, which generates matching utility classes (e.g. `bg-brand-blue`, `text-brand-pink`).

| Name   | Utility prefix | Hex       |
| ------ | --------------- | --------- |
| Blue   | `brand-blue`    | `#A6C2D2` |
| Pink   | `brand-pink`    | `#D9BFB1` |
| Green  | `brand-green`   | `#B8D2C7` |
| Yellow | `brand-yellow`  | `#F5E0AE` |
| Black  | `brand-black`   | `#615F5F` |
| Background | `brand-bg`  | `#F4F4F2` |

Example usage: `<div className="bg-brand-bg text-brand-black">`.
