# HVAC Runtime

HVAC Runtime is a Home Assistant Lovelace custom card that shows a vertical runtime timeline for a climate entity. It highlights run sessions, off gaps, and total runtime over a selected time window.

## Installation

### HACS custom repository

1. In Home Assistant, open **HACS**.
2. Open **Custom repositories**.
3. Add this repository URL:

   `https://github.com/bishwashere/hvac-runtime`

4. Select category **Lovelace**.
5. Install **HVAC Runtime**.
6. Refresh your browser.

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
