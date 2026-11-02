/**
 * Минималистичная библиотека 2D-графиков на Canvas без зависимостей.
 * Используется компонентами <FunctionPlot> и <Notebook>.
 */
export interface Series {
  xs: ArrayLike<number>;
  ys: ArrayLike<number>;
  label?: string;
  color?: string;
  kind?: 'line' | 'scatter';
}
export interface PlotOptions {
  xRange?: [number, number];
  yRange?: [number, number];
  xLabel?: string;
  yLabel?: string;
  height?: number;
}
export interface PlotHandle {
  toData(px: number, py: number): [number, number];
  toPx(x: number, y: number): [number, number];
  inside(px: number, py: number): boolean;
}

const cssVar = (name: string, el: Element = document.documentElement) =>
  getComputedStyle(el).getPropertyValue(name).trim();

export function palette(): string[] {
  const dark = cssVar('color-scheme') === 'dark';
  return [cssVar('--accent'), cssVar('--warm'), dark ? '#4fd1b5' : '#16877a', dark ? '#e879c6' : '#b02b8a', dark ? '#9ad35a' : '#4d7c0f'];
}

function niceStep(span: number, target = 6): number {
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

function fmt(v: number, step: number): string {
  if (Math.abs(v) < step * 1e-6) return '0';
  const d = Math.max(0, -Math.floor(Math.log10(step)));
  const s = Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(1) : v.toFixed(d);
  return s.replace('-', '−');
}

function extent(series: Series[], key: 'xs' | 'ys'): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const s of series) for (let i = 0; i < s[key].length; i++) {
    const v = s[key][i];
    if (Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
  }
  if (!Number.isFinite(lo)) return [0, 1];
  if (lo === hi) return [lo - 1, hi + 1];
  if (key === 'ys') { const p = (hi - lo) * 0.08; return [lo - p, hi + p]; }
  return [lo, hi];
}

export function drawPlot(canvas: HTMLCanvasElement, series: Series[], opts: PlotOptions = {}): PlotHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth || 600;
  const H = opts.height ?? (canvas.clientHeight || 320);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const ink3 = cssVar('--ink-3'), line = cssVar('--line'), ink2 = cssVar('--ink-2');
  const colors = palette();
  const [x0, x1] = opts.xRange ?? extent(series, 'xs');
  const [y0, y1] = opts.yRange ?? extent(series, 'ys');

  const m = { l: 48, r: 14, t: 14, b: opts.xLabel ? 44 : 30 };
  const pw = W - m.l - m.r, ph = H - m.t - m.b;
  const toPx = (x: number, y: number): [number, number] => [m.l + ((x - x0) / (x1 - x0)) * pw, m.t + (1 - (y - y0) / (y1 - y0)) * ph];
  const toData = (px: number, py: number): [number, number] => [x0 + ((px - m.l) / pw) * (x1 - x0), y0 + (1 - (py - m.t) / ph) * (y1 - y0)];

  // Сетка и подписи
  ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
  ctx.lineWidth = 1;
  const sx = niceStep(x1 - x0, Math.max(3, Math.round(pw / 90)));
  const sy = niceStep(y1 - y0, Math.max(3, Math.round(ph / 60)));
  ctx.strokeStyle = line; ctx.fillStyle = ink3;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let x = Math.ceil(x0 / sx) * sx; x <= x1 + 1e-9; x += sx) {
    const [px] = toPx(x, 0);
    ctx.beginPath(); ctx.moveTo(Math.round(px) + .5, m.t); ctx.lineTo(Math.round(px) + .5, m.t + ph); ctx.stroke();
    ctx.fillText(fmt(x, sx), px, m.t + ph + 8);
  }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let y = Math.ceil(y0 / sy) * sy; y <= y1 + 1e-9; y += sy) {
    const [, py] = toPx(0, y);
    ctx.beginPath(); ctx.moveTo(m.l, Math.round(py) + .5); ctx.lineTo(m.l + pw, Math.round(py) + .5); ctx.stroke();
    ctx.fillText(fmt(y, sy), m.l - 8, py);
  }
  // Оси через ноль
  ctx.strokeStyle = ink3;
  if (y0 < 0 && y1 > 0) { const [, py] = toPx(0, 0); ctx.beginPath(); ctx.moveTo(m.l, Math.round(py) + .5); ctx.lineTo(m.l + pw, Math.round(py) + .5); ctx.stroke(); }
  if (x0 < 0 && x1 > 0) { const [px] = toPx(0, 0); ctx.beginPath(); ctx.moveTo(Math.round(px) + .5, m.t); ctx.lineTo(Math.round(px) + .5, m.t + ph); ctx.stroke(); }
  if (opts.xLabel) { ctx.fillStyle = ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(opts.xLabel, m.l + pw / 2, H - 4); }
  if (opts.yLabel) { ctx.save(); ctx.fillStyle = ink2; ctx.translate(12, m.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }

  // Данные
  ctx.save();
  ctx.beginPath(); ctx.rect(m.l, m.t, pw, ph); ctx.clip();
  series.forEach((s, i) => {
    const c = s.color ?? colors[i % colors.length];
    ctx.strokeStyle = c; ctx.fillStyle = c;
    if (s.kind === 'scatter') {
      for (let k = 0; k < s.xs.length; k++) {
        const [px, py] = toPx(s.xs[k], s.ys[k]);
        if (Number.isFinite(py)) { ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill(); }
      }
      return;
    }
    ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    let pen = false;
    const span = (y1 - y0) * 50;
    for (let k = 0; k < s.xs.length; k++) {
      const y = s.ys[k];
      if (!Number.isFinite(y) || Math.abs(y - y0) > span) { pen = false; continue; }
      const [px, py] = toPx(s.xs[k], y);
      pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      pen = true;
    }
    ctx.stroke();
  });
  ctx.restore();

  // Легенда
  const labeled = series.filter((s) => s.label);
  if (labeled.length) {
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let lx = m.l + 10;
    series.forEach((s, i) => {
      if (!s.label) return;
      const c = s.color ?? colors[i % colors.length];
      ctx.fillStyle = c; ctx.fillRect(lx, m.t + 12, 14, 3);
      ctx.fillStyle = ink2; ctx.fillText(s.label, lx + 20, m.t + 13);
      lx += 20 + ctx.measureText(s.label).width + 18;
    });
  }

  return { toData, toPx, inside: (px, py) => px >= m.l && px <= m.l + pw && py >= m.t && py <= m.t + ph };
}

/** Равномерная сетка из n точек на [a, b] */
export function linspace(a: number, b: number, n = 400): number[] {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}
