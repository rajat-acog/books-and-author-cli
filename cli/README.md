# 📚 book-cli

A modern CLI tool to search books and generate summaries using Open Library and Google Gemini.

---

## 🚀 Features

* 🔍 Search books by author
* 📖 Generate summaries for any book
* 🎲 Get a random book + summary
* ✍️ Multiple summary styles (funny, pirate, haiku, etc.)
* 🧠 AI-powered summaries using Gemini
* 🖼️ Fetch book cover images
* 📝 Fetch and trim book descriptions
* 📦 JSON output support

---

## 🛠️ Tech Stack

* TypeScript (ESM)
* Commander.js
* Pino (logging)
* Ora (spinner)
* Open Library API
* Google Gemini via `@ai-sdk/google`
* `@aganitha/atk-config`

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd book-cli
npm install
```

---

## 🔑 Setup

Create `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## ▶️ Usage

Run using Bun:

```bash
bun run cli <command>
```

---

## 🔍 Commands

### 1. Search Books

```bash
bun run cli search --author "Rowling"
```

Options:

* `--author <name>` (required)
* `--limit <number>`
* `--json`

---

### 2. Book Summary

```bash
bun run cli summary --title "1984" --author "George Orwell"
```

Options:

* `--title <title>` (required)
* `--author <name>` (optional but recommended)
* `--style <style>`
* `--json`

---

### 🎭 Available Styles

* `funny`
* `pirate`
* `haiku`
* `shashi tharoor`
* `drseuss`

---

### 3. Random Book

```bash
bun run cli random --author "Dan Brown"
```

Options:

* `--author <name>`
* `--style <style>`

---

## 🧪 Example Outputs

### JSON Output

```bash
bun run cli summary --title "Home" --author "Toni Morrison" --json
```

```json
{
  "title": "Home",
  "author": "Toni Morrison",
  "authors": ["Toni Morrison"],
  "year": 2012,
  "coverUrl": "https://covers.openlibrary.org/b/id/xxxxx-L.jpg",
  "description": "Short trimmed description...",
  "summary": "AI generated summary..."
}
```

---

## 🧠 How it Works

1. Fetch books using Open Library API
2. Filter by title + author (exact match)
3. Fetch book details (description + cover)
4. Trim description for better UX
5. Generate summary using Gemini AI

---

## ⚠️ Notes

* Some books may not exist in Open Library → CLI returns "No book found"
* LLM summaries may vary for lesser-known books
* Always prefer using `--author` for accurate results

---

## 📌 Future Improvements

* 🔄 Caching layer
* 🎨 Better CLI UI (colors, formatting)
* 🤖 Smarter suggestions ("Did you mean?")
* 🌐 Frontend using Next.js
* 📊 Analytics & logging enhancements

---

## 🙌 Author

Built as part of CLI learning + real-world backend drills.

---

## 📜 License

MIT
