# HVAC Runtime

HVAC Runtime is a Home Assistant Lovelace custom card that shows a vertical runtime timeline for a climate entity. It highlights run sessions, off gaps, and total runtime over a selected time window.

## Installation

### HACS custom repository

1. In Home Assistant, open **HACS**.
2. Click the top-right three-dot menu.
3. Open **Custom repositories**.
4. Add this repository URL:

   `https://github.com/bishwashere/hvac-runtime`

5. Set **Type** to **Dashboard**.
6. Click **Add**.
7. Go back to HACS and search for **HVAC Runtime**.
8. Open **HVAC Runtime**.
9. Click the top-right three-dot menu.
10. Click **Download**.
11. Refresh your browser after HACS finishes installing it.

### Manual install

1. Download `dist/hvac-runtime.js` from this repository.
2. Copy it to your Home Assistant `www` folder as:

   `/config/www/hvac-runtime.js`

3. Add it as a Lovelace resource:

```yaml
url: /local/hvac-runtime.js
type: module
```

4. Refresh your browser.

## Basic Example

```yaml
type: custom:hvac-runtime
entity: climate.living_room
title: HVAC Runtime (12h)
hours: 12
```

For Home Assistant sections dashboards, you can match another card width with `grid_options`:

```yaml
type: custom:hvac-runtime
entity: climate.living_room
title: HVAC Runtime (12h)
hours: 12
grid_options:
  columns: 6
  rows: 4
```

## Configuration

| Option | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `custom:hvac-runtime`. |
| `entity` | Yes | Climate entity to read history from. |
| `title` | No | Card title. Defaults to `HVAC Runtime`. |
| `hours` | No | Number of hours to show. Defaults to `3`. |
| `height` | No | Timeline height in pixels. Defaults to `240`. |
| `color` | No | Runtime block color. Defaults to Home Assistant primary color. |
| `running_actions` | No | HVAC actions counted as runtime. Defaults to `cooling` and `heating`. |
| `refresh_seconds` | No | How often the card refreshes history. Defaults to `60`. |

## Notes

- Uses the Home Assistant history API from the browser.
- Requires history to be enabled for the selected climate entity.
- Counts `hvac_action: cooling` and `hvac_action: heating` as runtime by default.

---

## Local Development

Copy the current development file into Home Assistant:

```bash
cp dist/hvac-runtime.js /config/www/hvac-runtime.js
```

Then add or update the Lovelace resource:

```yaml
url: /local/hvac-runtime.js
type: module
```

## Project Status

- Standalone JavaScript custom card
- HACS custom repository metadata included
- Tested in a live Home Assistant dashboard
- Visual editor and full build pipeline are not included yet
