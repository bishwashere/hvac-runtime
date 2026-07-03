class HvacRuntime extends HTMLElement {
  static getStubConfig() {
    return {
      entity: 'climate.living_room',
      title: 'HVAC Runtime (12h)',
      hours: 12,
      grid_options: {
        columns: 6,
        rows: 4,
      },
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error('hvac-runtime: entity is required');
    this._config = {
      title: 'HVAC Runtime',
      hours: 12,
      color: 'var(--primary-color, #2196f3)',
      height: 240,
      running_actions: ['cooling', 'heating'],
      refresh_seconds: 60,
      ...config,
    };
    this._lastFetch = 0;
  }

  set hass(hass) {
    this._hass = hass;
    const now = Date.now();
    if (now - this._lastFetch > this._config.refresh_seconds * 1000) {
      this._lastFetch = now;
      this._fetchAndRender();
    }
  }

  async _fetchAndRender() {
    const cfg = this._config;
    const end = new Date();
    const start = new Date(end.getTime() - cfg.hours * 3600000);
    let history;
    try {
      history = await this._hass.callApi(
        'GET',
        `history/period/${start.toISOString()}?filter_entity_id=${cfg.entity}` +
          `&end_time=${end.toISOString()}&significant_changes_only=0`
      );
    } catch (error) {
      this._renderError(`History fetch failed: ${error.message || error}`);
      return;
    }

    const states = (history && history[0]) || [];
    const sessions = this._computeSessions(states, start.getTime(), end.getTime());
    this._render(sessions, start.getTime(), end.getTime());
  }

  _isRunning(state) {
    const action = state.attributes && state.attributes.hvac_action;
    return this._config.running_actions.includes(action);
  }

  _computeSessions(states, startMs, endMs) {
    const points = states
      .map((state, idx) => {
        const updated = new Date(state.last_updated || state.last_changed).getTime();
        const changed = new Date(state.last_changed || state.last_updated).getTime();
        return {
          t: idx === 0 && changed < startMs ? startMs : updated,
          on: this._isRunning(state),
          idx,
        };
      })
      .filter((point) => Number.isFinite(point.t) && point.t <= endMs)
      .sort((a, b) => a.t - b.t || a.idx - b.idx);

    const compact = [];
    for (const point of points) {
      const last = compact[compact.length - 1];
      if (last && last.t === point.t) {
        last.on = point.on;
        last.idx = point.idx;
      } else if (!last || last.on !== point.on) {
        compact.push({ ...point });
      }
    }

    const sessions = [];
    let runStart = null;
    for (const point of compact) {
      if (point.on && runStart === null) runStart = Math.max(point.t, startMs);
      if (!point.on && runStart !== null) {
        sessions.push({ from: runStart, to: Math.min(point.t, endMs) });
        runStart = null;
      }
    }
    if (runStart !== null) sessions.push({ from: runStart, to: endMs, ongoing: true });

    const merged = [];
    for (const session of sessions) {
      const last = merged[merged.length - 1];
      if (last && session.from - last.to < 60000) {
        last.to = session.to;
        last.ongoing = session.ongoing;
      } else {
        merged.push({ ...session });
      }
    }
    return merged.filter((session) => session.to > session.from);
  }

  _fmtTime(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  _fmtDur(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
  }

  _renderError(message) {
    this._shell(`<div class="error">${this._escape(message)}</div>`);
  }

  _render(sessions, startMs, endMs) {
    const height = this._config.height;
    const span = endMs - startMs;
    const y = (time) => ((time - startMs) / span) * height;

    let ticks = '';
    const tickHours = Math.max(1, Math.round(this._config.hours / 6));
    const tickMs = tickHours * 3600000;
    const firstTick = Math.ceil(startMs / tickMs) * tickMs;
    for (let time = firstTick; time <= endMs; time += tickMs) {
      ticks += `<div class="tick" style="top:${y(time)}px"><span>${this._fmtTime(time)}</span></div>`;
    }

    let blocks = '';
    let previousEnd = startMs;
    for (const session of sessions) {
      const gap = session.from - previousEnd;
      if (gap > 0) {
        const gapHeight = y(session.from) - y(previousEnd);
        if (gapHeight >= 14) {
          blocks += `<div class="gap" style="top:${y(previousEnd)}px;height:${gapHeight}px"><span>off ${this._fmtDur(gap)}</span></div>`;
        }
      }

      const top = y(session.from);
      const blockHeight = Math.max(2, y(session.to) - top);
      const label = `${this._fmtTime(session.from)} - ${session.ongoing ? 'now' : this._fmtTime(session.to)} · ${this._fmtDur(session.to - session.from)}`;
      blocks += `
        <div class="run" style="top:${top}px;height:${blockHeight}px" title="${this._escape(label)}">
          ${blockHeight >= 16 ? `<span class="runlabel">${this._escape(label)}</span>` : ''}
        </div>`;
      previousEnd = session.to;
    }

    const tailGap = endMs - previousEnd;
    if (tailGap > 0 && y(endMs) - y(previousEnd) >= 14) {
      blocks += `<div class="gap" style="top:${y(previousEnd)}px;height:${y(endMs) - y(previousEnd)}px"><span>off ${this._fmtDur(tailGap)}</span></div>`;
    }

    const total = sessions.reduce((sum, session) => sum + (session.to - session.from), 0);
    const percent = Math.round((total / span) * 100);

    this._shell(`
      <div class="summary">ran ${this._fmtDur(total)} of last ${this._config.hours}h (${percent}%)</div>
      <div class="timeline" style="height:${height}px">
        <div class="axis">${ticks}</div>
        <div class="track">${blocks}</div>
      </div>`);
  }

  _shell(body) {
    this.innerHTML = `
      <ha-card header="${this._escape(this._config.title)}">
        <style>
          hvac-runtime .summary { padding: 0 16px 8px; font-size: 12px; color: var(--secondary-text-color); }
          hvac-runtime .timeline { display: flex; margin: 0 16px 16px; position: relative; }
          hvac-runtime .axis { position: relative; width: 54px; flex: none; }
          hvac-runtime .tick { position: absolute; right: 8px; transform: translateY(-50%); font-size: 11px; color: var(--secondary-text-color); }
          hvac-runtime .track { position: relative; flex: 1; background: var(--divider-color, rgba(127,127,127,.15)); border-radius: 6px; overflow: hidden; }
          hvac-runtime .run { position: absolute; left: 0; right: 0; background: ${this._config.color}; border-radius: 3px; display: flex; align-items: center; justify-content: center; }
          hvac-runtime .runlabel { font-size: 10px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
          hvac-runtime .gap { position: absolute; left: 0; right: 0; display: flex; align-items: center; justify-content: center; }
          hvac-runtime .gap span { font-size: 10px; color: var(--secondary-text-color); }
          hvac-runtime .error { padding: 16px; color: var(--error-color, #db4437); }
        </style>
        ${body}
      </ha-card>`;
  }

  _escape(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  getCardSize() {
    return 4;
  }
}

if (!customElements.get('hvac-runtime')) {
  customElements.define('hvac-runtime', HvacRuntime);
}
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hvac-runtime',
  name: 'HVAC Runtime',
  description: 'Vertical runtime timeline for HVAC and other climate entities.',
});
