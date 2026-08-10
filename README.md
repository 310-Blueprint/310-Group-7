# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Color scheme

This project uses **Tailwind CSS v4**, which reads custom colors from an `@theme` block instead of a `tailwind.config.js` file. The palette is defined in [`src/index.css`](src/index.css):

| Token | Hex | Usage |
| --- | --- | --- |
| `blue` | `#A6C2D2` | `bg-blue`, `text-blue`, `border-blue` |
| `pink` | `#D9BFB1` | `bg-pink`, `text-pink`, `border-pink` |
| `green` | `#B8D2C7` | `bg-green`, `text-green`, `border-green` |
| `yellow` | `#F5E0AE` | `bg-yellow`, `text-yellow`, `border-yellow` |
| `black` | `#615F5F` | `bg-black`, `text-black`, `border-black` |
| `background` | `#F4F4F2` | `bg-background`; also applied globally to `<body>` |

Each `--color-*` variable in the `@theme` block automatically generates the matching Tailwind utility classes (no extra config needed). Use them directly in JSX:

```jsx
<div className="bg-background text-black">
  <button className="bg-blue hover:bg-green">Click me</button>
</div>
```

**Notes:**
- `black` overrides Tailwind's built-in `black` (`#000`) with the palette's softer `#615F5F`. Tailwind's pure black is no longer available under that name.
- The background token is named `background` rather than `bg` to avoid confusion with Tailwind's `bg-` utility prefix (`bg-bg` would be ambiguous).
- To add or change a color, edit the `@theme` block in `src/index.css`; Tailwind picks up the new utilities automatically on save.
