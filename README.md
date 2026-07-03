# HVAC Runtime

HVAC Runtime is a Home Assistant Lovelace custom card that shows a vertical runtime timeline for a climate entity. It was extracted from a working `ac-runtime-card` setup and renamed for a standalone repo.

This card can be installed manually or through HACS as a custom repository.

## HACS custom repository install

1. In HACS, open **Custom repositories**.
2. Add `https://github.com/bishwashere/hvac-runtime`.
3. Select category **Lovelace**.
4. Install the card.
5. Add the card to your dashboard using `custom:hvac-runtime`.

After install, the resource should point to the installed JavaScript file managed by HACS.

## Local install while developing

Copy `dist/hvac-runtime.js` into Home Assistant:

```bash
cp dist/hvac-runtime.js /config/www/hvac-runtime.js
```

Add it as a Lovelace resource:

```yaml
url: /local/hvac-runtime.js
type: module
```

## Example card

```yaml
type: custom:hvac-runtime
entity: climate.dining_room
title: HVAC Runtime (12h)
hours: 12
height: 240
color: var(--primary-color)
```

## Notes

- Uses the Home Assistant history API from the browser.
- Treats `hvac_action: cooling` and `hvac_action: heating` as runtime by default.
- Keeps the original timeline behavior: run blocks, off gaps, and total runtime summary.

## Status

- Local repo scaffolded
- Existing AC runtime logic ported to `custom:hvac-runtime`
- HACS custom repository metadata added
- Needs testing in the live dashboard before release packaging
