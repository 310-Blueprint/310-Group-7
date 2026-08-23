# UI and layout

Shared components, design tokens, artwork layering, and responsive behaviour.
The feature documents cover what each page does;
this covers how everything looks and holds together.

## Shared components

All in `src/components/`. Each one owns how it looks; the caller owns where it
sits, with spacing coming in via `className`.

**`AuthCard`** is the shared shell for the four auth pages: page background,
logo, heading, the card itself, and all four decorative images. Takes `title`
and `children`. A page using it only has to describe its own form.

**`Field`** is a label plus an input. `id` is required and must be unique on the
page: it wires the `<label htmlFor>` to the input, which is what makes clicking
the label focus the field and lets screen readers announce them as a pair.
Anything else you pass (`type`, `placeholder`, `autoComplete`, `value`,
`onChange`) is spread onto the `<input>`.

**`AuthButton`** is the yellow submit button. Defaults to `type="submit"` and to
the spacing every auth card wants.

**`AuthFooter`** is the "Already have an account? Log in" row. Takes `prompt`,
`linkText` and `to`.

**`FormMessage`** is an inline error or success line. Takes `tone` (`'error'` by
default, or `'success'`) and children. It exists as a component rather than a
repeated `<p>` because the ARIA role, `alert` for errors and `status` for
success, is the part that four separate pages would forget, and it is what makes
a screen reader announce the message when it appears.

**`Logo`** is the Pipeline wordmark: the beaver mark from
`src/assets/pipelinelogo.png` next to the word "Pipeline". `className` sets the
text size, which the wordmark inherits, and `markClassName` sizes the image. The
mark is `aria-hidden` with an empty `alt`, because the word beside it already
carries the name. It is shared by the sidebar, the auth card, and the
route-loading screen, so changing it changes all three.

**`Sidebar`** is the app navigation for the dashboard and documents pages, and
carries the sign-out control.

**`RouteLoading`** is the placeholder shown by both route guards while the
session is being restored.

## Favicon and branding

`index.html` points at `/favicon.png`, served from `public/favicon.png`. The
older `public/favicon.svg` is no longer referenced and should be removed; see
[ROADMAP.md](ROADMAP.md).

## The layering

The one genuinely non-obvious part of the auth pages. The heading sits behind
the card, the beaver is split across it, and the grass sits in front:

```
heading  ->  beaver body (z-0)  ->  card (z-10)  ->  grass + beaver arms (z-20)
```

Two things this depends on:

- **The beaver is a sibling of the card, not a child.** A child element can
  never paint behind its own parent's background, no matter its z-index. This is
  why the two beaver images live outside the card's `<div>`.
- **`z-index` needs a positioned element.** Everything in that chain carries
  `relative` or `absolute`; adding a z-index to a static element does nothing.

The two beaver images share `BEAVER_POSITION` so they cannot drift apart. They
are one piece of artwork split in half, and any difference in position shows up
as a visible seam. The dashboard and documents pages use the same constant for
the same reason.

Nothing in the chain may have `overflow-hidden`, or the grass and beaver get
clipped where they hang past the card's edges.

## Colours and fonts

Design tokens live in `src/styles/preset.css`, inside Tailwind v4's `@theme`
block. Tailwind v4 has no JS config file; this is its equivalent. Defining
`--color-link` there generates `text-link`, `bg-link`, `border-link` and so on.

**`preset.css` is the single source of truth for the palette.** Do not copy hex
values into other files or into documentation, or they drift silently.

Use a token when a colour has a role that recurs: `--color-link`,
`--color-input-bg`, `--color-error`, `--color-success`. One-off decorative
values can stay inline.

Poppins is loaded in `index.html` and set as `--font-sans`, so it applies
everywhere without a `font-sans` class.

## Responsive layout

The smallest supported viewport width is 320px. Layout is keyed to Tailwind's
default breakpoints rather than to device names, because the navigation and the
column count change at different widths.

| Breakpoint | From | Behaviour |
| --- | --- | --- |
| base | 320px | Top navigation bar with icons only, stacked headers and actions, one dashboard column |
| `sm` | 640px | Navigation labels appear, wider controls and typography, two dashboard columns |
| `md` | 768px | Navigation becomes the vertical left sidebar |
| `xl` | 1280px | Four dashboard columns, decorative artwork shown |

### Navigation

`Sidebar.jsx` is a horizontal bar above the page content on mobile and a
vertical left sidebar from `md`. Labels are hidden on the narrowest screens
while the icons remain visible, and appear from `sm`. Active and hover states are
preserved at every size.

### Dashboard

`DashboardPage.jsx` has no fixed minimum width and no fixed viewport height, so
the page grows and scrolls when its content is taller than the viewport.

- The heading and the Add application button stack on mobile, and the button
  fills the available width.
- Status columns go one, then two, then four, per the table above.
- Each status column has a minimum height so empty workflow stages remain
  visible as drop targets.
- The split beaver and grass artwork is hidden below `xl` to prevent it
  overlapping content.

### Documents page

`DocumentsPage.jsx`, `DocumentCard.jsx`, and `DocumentDropzone.jsx` adjust to
narrow screens.

- The page header and the Add document button stack on mobile.
- The documents panel uses smaller padding and corner radii on mobile, and the
  shared `bg-brand-blue` token so it matches the "To apply" column.
- Long filenames truncate instead of creating horizontal overflow.
- Document and download icons scale down on small screens.
- The drop zone has a practical minimum height and responsive icon and text
  sizes.

### Authentication pages

The shared auth components support narrow screens without changing the form
structure, so this applies to login, sign-up, and both password reset pages at
once.

- Card padding decreases on mobile and returns to the original spacing on larger
  screens.
- Page headings use fluid font sizing.
- Primary buttons use the full available width on mobile.
- Footer text wraps cleanly.
- Decorative grass and beaver artwork scales down on mobile.
- Visible keyboard focus styles are provided for primary actions.

### Application modal

`ApplicationModal.jsx` stays usable on short and narrow screens.

- The dialog scrolls vertically when its form does not fit in the viewport.
- Outer padding, heading size, card spacing, and form gaps decrease on mobile.
- Form controls stay within the available width.
- The Submit button fills the modal width on mobile and returns to its compact
  size on larger screens.

The modal heading sits above and slightly overlapping the dark card to match the
original mockup, achieved with a negative margin on the card plus explicit
z-index stacking so the heading renders above rather than behind it.

## Conventions

- **Tokens for values, components for markup.** We deliberately avoid `@apply`
  and shared CSS classes. A CSS class carries only the styling, so a caller can
  still get the structure or the `htmlFor` and `id` pairing wrong. A component
  carries all three.
- **Long `className` strings are accepted.** Tailwind class lists routinely run
  past 100 characters, and breaking them up hurts readability more than it
  helps. Everything else stays within normal line lengths.
- **Icons are Figma-exported PNGs** rendered via `<img>`, kept in `src/assets/`.

## Verification

There are no automated tests. Alongside `npm run lint`, `npm run build`, and
`git diff --check`, review layouts by hand at representative widths:

- 375px mobile
- 768px tablet
- 1440px desktop

## Future work

- `beaver.png` (651 KB) and `beaverArms.png` (205 KB) are most of the bundle and
  should be re-exported as SVG, like the grass already is.
- `src/assets/leaf1.png`, `leaf2.png`, and `logo.png` are imported nowhere. They
  do not reach the bundle, but they are around 500 KB of dead weight in the
  repository.
- `public/favicon.svg` is no longer referenced and should be removed.
- `src/App.css` is tracked but imported nowhere.

See [ROADMAP.md](ROADMAP.md) for the full list.
