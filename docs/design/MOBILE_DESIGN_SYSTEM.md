# CourierDash Mobile Design System

## Status and evidence

This document records the accepted local Mobile Design Foundation. It is not a
pixel-perfect Web specification. Repository-backed rules are authoritative only
where implemented; Web parity requires direct reference review per screen.

## Design principles

- Financial first: primary values must be scannable quickly.
- Native first: preserve safe areas, native keyboard/date interactions, and
  practical touch targets.
- Low visual noise: use semantic surfaces, limited accents, and clear spacing.
- Consistency: shared presentation belongs in `src/components/ui/`.
- One dominant action per screen; secondary and destructive actions need a
  distinct treatment.
- Localized, accessible UI must remain safe in `pl`, `uk`, `en`, and `ru`.

## Accepted repository-backed rules

- Appearance is dark-only.
- Current colors: background `#121212`; surface `#1e1e24`; elevated surface
  `#252530`; border `#2c2c38`; primary text `#ffffff`; secondary text
  `#a0a0a0`; accent `#00e5ff`; pressed accent `#00b8cc`; disabled `#5a5a66`.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32.
- Radius scale: 8, 12, 16, full.
- `Screen` owns safe-area-aware full-screen background treatment.
- Interactive shared controls retain a minimum 48px height.
- User-visible text and accessibility labels use typed localization.
- Work date and numeric entry preserve native picker/keyboard behavior.

## Shared components

### AppCard — accepted

Non-pressable surface wrapper with default/elevated surface and controlled
padding. It owns border/radius/surface treatment, not navigation or business
meaning. A pressable card is a separate future decision.

### AppMetricCard — accepted

Displays caller-supplied label/value strings, optional secondary content, and
an explicit or composed accessibility label. It does not calculate, format, or
round financial values.

### AppSegmentedControl — accepted

Controlled generic tab control. Callers own values, localized labels, period
semantics, and filtering. It preserves tab/tablist accessibility semantics and
wrapping behavior.

### AppStateSurface — accepted

Composable state layout with caller-supplied title, description, action,
children, and optional loading indicator. It is not a state machine and does
not provide generic product copy or own `Screen`.

### AppButton — accepted with provisional danger treatment

`primary` preserves the existing cyan action. `secondary` and `ghost` use
existing neutral tokens. `danger` is intentionally neutral and distinct from
primary until a semantic destructive color is approved; it must not be treated
as final destructive visual identity. Loading disables presses and exposes busy
accessibility state. Icons are outside this component.

## Provisional or unresolved decisions

- Exact destructive, success, warning, informational, chart, and navigation
  colors.
- Icon system and icon library.
- Chart palette and chart library.
- Elevation/shadow policy.
- Screen-specific Web parity, custom fonts, FAB, and animation tokens.

## Usage boundary

Shared primitives may consolidate exact presentation duplication. They must not
own providers, routing, Supabase calls, financial formulas, period filtering,
or localized business copy. Consult this document for local presentation work;
do not treat a provisional item as a product or backend contract.
