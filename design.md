# Design — 客户资源管理系统

A locked design system for this management application. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- **Public pages** (login): Workbench — centered card, minimal chrome
- **App pages** (admin/dept/my): Workbench — data-first, tables + forms + filters, sidebar nav
- **Content pages**: N/A (no standalone content pages in this app)

## Theme
Palette: neutral paper + Ant Design Pro blue. Enterprise admin systems
(Ant Design Pro, Arco Design Pro, Feishu Admin) universally use blue.
It signals trust, institutional authority, and operational precision.

- `--color-paper`      #f5f7fa   /* off-white page bg */
- `--color-paper-2`    #eef1f6   /* subtle surface lift */
- `--color-ink`        #1d2129   /* near-black text */
- `--color-ink-2`      #86909c   /* secondary / placeholder text */
- `--color-rule`       #e5e8ef   /* dividers and borders */
- `--color-accent`     #1677ff   /* Ant Design Pro blue — primary actions */
- `--color-accent-ink` #ffffff   /* text on accent */
- `--color-focus`      #1677ff   /* focus ring — same as accent */

## Typography
- Display: Inter, weight 600, style normal
- Body: Inter, weight 400
- Mono: JetBrains Mono, weight 400
- Display tracking: -0.02em
- Type scale anchor: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)

## Spacing
4-point named scale. Values in `tokens.css`. Pages use named tokens (`var(--space-md)`), never raw values.

- --space-3xs: 0.25rem (4px)
- --space-2xs: 0.5rem (8px)
- --space-xs: 0.75rem (12px)
- --space-sm: 1rem (16px)
- --space-md: 1.5rem (24px)
- --space-lg: 2rem (32px)
- --space-xl: 3rem (48px)
- --space-2xl: 4.5rem (72px)
- --space-3xl: 7rem (112px)

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) named `--ease-out`
- Reveal pattern: none — data appears immediately
- Reduced-motion fallback: opacity-only, ≤150ms
- Motion stance: **motion-cut** (no framer-motion, no decorative animations)

## Microinteractions stance
- Silent success — table refresh is confirmation, no toasts for saves
- Hover delay 800ms · focus delay 0ms
- Optimistic updates for safe operations (status toggles, inline edits)
- Confirmation modals only for destructive irreversible actions

## CTA voice
- Primary CTA: teal fill (`--color-accent`), 6px radius, 8px/16px padding, medium weight
- Secondary CTA: teal outline 1px, same radius/padding, hover background tint

## Per-page allowances
- Public pages (login): centered card, no enrichment, typography only
- App pages: ProTable + Drawer + Modal + Form — no enrichment, function over form
- All pages: no hero images, no decorative illustrations, no abstract backgrounds

## What pages MUST share
- The teal accent (`--color-accent`) at ≤5% per viewport
- Inter display + body fonts
- Button voice (6px radius, consistent padding)
- Sidebar navigation via ProLayout
- Silent microinteractions (no celebratory toasts)

## What pages MAY differ on
- Table column configurations
- Form field layouts (drawer vs modal, field arrangement)
- Filter panel organization

## Ant Design integration
This app uses Ant Design + ProComponents. The design system integrates via:
- `ConfigProvider` theme override in `main.tsx`
- Custom `tokens.css` for layout elements outside Ant Design
- ProLayout for app chrome (sidebar, header, avatar)

## Exports

### tokens.css
```css
:root {
  --color-paper:      oklch(98% 0.004 200);
  --color-paper-2:    oklch(96% 0.006 200);
  --color-ink:        oklch(20% 0.01 200);
  --color-ink-2:      oklch(50% 0.012 200);
  --color-rule:       oklch(88% 0.008 200);
  --color-accent:     oklch(62% 0.14 195);
  --color-accent-ink: oklch(98% 0.004 195);
  --color-focus:      oklch(62% 0.14 195);

  --font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono:    "JetBrains Mono", "SF Mono", Consolas, monospace;

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs:  0.75rem;
  --space-sm:  1rem;
  --space-md:  1.5rem;
  --space-lg:  2rem;
  --space-xl:  3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;

  --text-xs:  0.75rem;
  --text-sm:  0.875rem;
  --text-md:  1rem;
  --text-lg:  1.125rem;
  --text-xl:  1.375rem;
  --text-2xl: 1.75rem;
  --text-3xl: 2.25rem;

  --ease-out:  cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 150ms;
  --dur-med:   220ms;

  --radius-sm:    4px;
  --radius-md:    6px;
  --radius-lg:    8px;
  --radius-pill:  999px;
}
```

### Ant Design ConfigProvider theme
```typescript
{
  token: {
    colorPrimary: 'oklch(62% 0.14 195)',      // --color-accent
    colorBgBase: 'oklch(98% 0.004 200)',      // --color-paper
    colorTextBase: 'oklch(20% 0.01 200)',     // --color-ink
    colorBorder: 'oklch(88% 0.008 200)',      // --color-rule
    borderRadius: 6,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      primaryShadow: 'none',
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
    },
    Table: {
      borderColor: 'oklch(88% 0.008 200)',
    },
  },
}
```
