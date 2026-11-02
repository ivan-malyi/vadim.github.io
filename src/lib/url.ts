/** Собирает ссылку с учётом base-пути (нужно для GitHub Pages вида user.github.io/repo). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\/|\/$/g, '');
  if (!clean) return `${base}/`;
  // Файлы (с расширением) — без слэша, страницы — со слэшем на конце
  return /\.[a-z0-9]+$/i.test(clean) ? `${base}/${clean}` : `${base}/${clean}/`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function readingTime(text = ''): number {
  const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
