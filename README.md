# Личный сайт исследователя

Статический сайт на [Astro](https://astro.build): «Обо мне», блог, научные труды.
Поддерживает формулы LaTeX (KaTeX), WebGL-шейдеры, интерактивные графики и
рабочие книги, которые выполняются прямо в браузере. Сервер не нужен, поэтому
сайт можно бесплатно разместить на GitHub Pages, Cloudflare Pages или Netlify.

## Быстрый старт

Нужен [Node.js](https://nodejs.org) версии 20 или новее.

```bash
npm install      # один раз
npm run dev      # локальный сервер: http://localhost:4321
npm run build    # сборка в папку dist/
```

## Что и где редактировать

| Что | Где |
|---|---|
| Имя, должность, e-mail, профили (Scholar, ORCID, GitHub…) | `src/config.ts` (помечено `TODO`) |
| Текст «Обо мне» | `src/data/about.md` |
| Хронология, навыки, фото | `src/config.ts` → `TIMELINE`, `SKILLS`, `PHOTO` |
| Научные труды | `src/data/publications.yaml` |
| PDF статей | положить в `public/papers/` и указать `pdf: papers/file.pdf` |
| Записи блога | `src/content/blog/*.md` или `*.mdx` |
| Цвета и шрифты | `src/styles/global.css` (блок `:root`) |

### Новая запись в блоге

Создайте файл `src/content/blog/my-post.md`:

```markdown
---
title: 'Заголовок'
description: 'Краткое описание для списка и поисковиков'
date: 2026-11-02
tags: [численные-методы]
---

Текст с формулой $E = mc^2$ и выключной:

$$ \int_0^1 x^2\,dx = \tfrac13 $$
```

Для интерактивных блоков используйте расширение `.mdx` и подключите компоненты.
Готовые примеры всех трёх есть в `src/content/blog/interactive-demo.mdx`:

- `<FunctionPlot>` — график функции с ползунками параметров;
- `<ShaderCanvas>` — любой фрагментный шейдер WebGL (формат Shadertoy);
- `<Notebook>` — рабочая книга с ячейками JavaScript, `plot()`, `table()`, `print()`.

Черновик: `draft: true` во frontmatter, и запись не попадёт на сайт.

## Бесплатный хостинг

### Вариант 1. GitHub Pages (рекомендуется)

Всё уже настроено в `.github/workflows/deploy.yml`: сайт пересобирается сам при каждом `git push`.

1. Создайте аккаунт на [github.com](https://github.com) и новый **публичный** репозиторий,
   например `vadim-site`. Если назвать его `<логин>.github.io`, сайт будет жить
   по адресу `https://<логин>.github.io/` без подпути.
2. Загрузите код:
   ```bash
   git init
   git add .
   git commit -m "Первая версия сайта"
   git branch -M main
   git remote add origin https://github.com/<логин>/vadim-site.git
   git push -u origin main
   ```
3. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Через 1–2 минуты (вкладка **Actions**) сайт откроется по адресу
   `https://<логин>.github.io/vadim-site/`.

Дальше любые правки: `git add . && git commit -m "..." && git push`, и сайт обновится сам.

### Вариант 2. Cloudflare Pages

Подходит, если нужен быстрый доступ из любой страны или свой домен с бесплатным SSL.

1. Залейте код на GitHub (шаги 1–2 выше).
2. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**.
3. Настройки сборки: Framework preset: **Astro**, Build command `npm run build`,
   Output directory `dist`. Переменная окружения `SITE` = адрес сайта
   (например `https://vadim-site.pages.dev`).
4. Сайт будет доступен на `https://<проект>.pages.dev` и обновляется при каждом push.

Netlify и Vercel настраиваются так же: импорт репозитория, команда `npm run build`, папка `dist`.

### Свой домен (по желанию)

Домен покупается у регистратора (примерно от 200–1000 ₽ в год). Затем:
- **GitHub Pages:** Settings → Pages → Custom domain, а у регистратора добавить
  CNAME-запись на `<логин>.github.io`;
- **Cloudflare Pages:** Custom domains → Set up a domain.

Если используете свой домен на GitHub Pages, создайте файл `public/CNAME` с именем домена.
