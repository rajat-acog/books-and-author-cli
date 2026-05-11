# BookHub - A Professional Book and Author Website

A modern, production-ready website built with Astro for showcasing books and their authors. Features a clean, professional design with responsive layouts and excellent user experience.

## ✨ Features

- **Modern UI/UX**: Clean, professional design with Tailwind CSS
- **Responsive Design**: Optimized for all device sizes
- **Fast Performance**: Built with Astro for optimal loading speeds
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Content Collections**: Organized book and author data
- **Dynamic Routing**: Individual pages for each book and author

## 🚀 Getting Started

### Prerequisites

- Node.js 22.12.0 or later
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. Open [http://localhost:4321](http://localhost:4321) in your browser

### Build for Production

```bash
npm run build
# or
bun run build
```

Preview the production build:

```bash
npm run preview
# or
bun run preview
```

## 📁 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── authors/
│   │   │   ├── george-orwell.md
│   │   │   └── william-gay.md
│   │   └── books/
│   │       ├── animal-farm.md
│   │       ├── nineteen-eighty-four.md
│   │       └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── authors/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── books/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
└── tsconfig.json
```

## 🎨 Design System

- **Colors**: Indigo and purple gradient theme
- **Typography**: Clean, readable fonts
- **Components**: Card-based layouts with hover effects
- **Navigation**: Fixed header with smooth transitions

## 📚 Content Management

Books and authors are managed through Astro's content collections:

### Adding a New Book

Create a new `.md` file in `src/content/books/` with frontmatter:

```yaml
---
title: "Book Title"
author: "Author Name"
year: 2024
summary: |
  A brief description of the book.
coverUrl: "https://example.com/cover.jpg" # optional
---
```

### Adding a New Author

Create a new `.md` file in `src/content/authors/` with frontmatter:

```yaml
---
name: "Author Name"
bio: "A brief biography of the author."
---
```

## 🛠️ Technologies Used

- **Astro**: Static site generator
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **Content Collections**: Built-in content management

## 📱 Pages

- **Home (/)**: Hero section, featured authors and books
- **Authors (/authors)**: List of all authors
- **Author Detail (/authors/[slug])**: Individual author page with their books
- **Books (/books)**: List of all books
- **Book Detail (/books/[slug])**: Individual book page with details

## 🚀 Deployment

The site can be deployed to any static hosting service like:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Simply run `npm run build` and upload the `dist/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `bun install`         | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
