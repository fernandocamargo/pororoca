# pororoca

A [Node.js](https://nodejs.org/) CLI tool for creating and publishing Twitter thread storms. Pororoca automatically splits long text into tweet-sized chunks, formats them with numbering, and can optionally publish them to Twitter.

## What is Pororoca?

"Pororoca" is a Brazilian term referring to a tidal bore - a natural phenomenon where river waters meet ocean tides, creating powerful waves. In the context of social media, it represents the wave of tweets that make up a thread storm.

## Features

- Split long text into tweet-sized chunks (respecting Twitter's character limit)
- Automatic tweet numbering and formatting
- Support for custom prefixes and suffixes
- Read content from files, URLs, or direct input
- Interactive CLI with prompts
- Progress indicators

## Quick Start with Docker (Recommended)

The easiest way to run this project is using [Docker](https://www.docker.com/), which handles all dependencies automatically.

### Prerequisites

- [Docker](https://www.docker.com/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/) (optional, but recommended)

### Using Docker Compose

1. **Build the image:**
   ```bash
   docker-compose build
   ```

2. **Run the CLI:**
   ```bash
   docker-compose run --rm pororoca create --help
   ```

3. **Example - Create a thread from a file:**
   ```bash
   docker-compose run --rm pororoca create -r ./sample/lipsum.txt
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t pororoca .
   ```

2. **Run the CLI:**
   ```bash
   docker run --rm -v $(pwd):/data -w /data pororoca create --help
   ```

3. **Example - Create a thread from a file:**
   ```bash
   docker run --rm -v $(pwd):/data -w /data pororoca create -r ./sample/lipsum.txt
   ```

## Usage

### Commands

```bash
pororoca create [options]
```

### Options

- `-u, --username <username>` - Twitter username (for publishing)
- `-p, --password <password>` - Twitter password (for publishing)
- `-r, --resource <text|file|url>` - Tweet content source (text string, file path, or URL)
- `-P, --publish` - Publish to Twitter (requires credentials)
- `-pr, --prefix <prefix>` - Custom prefix for tweet numbering
- `-sf, --suffix <suffix>` - Custom suffix for tweet numbering

### Examples

**Create a thread from text:**
```bash
docker-compose run --rm pororoca create -r "Your long text here that will be split into multiple tweets..."
```

**Create a thread from a file:**
```bash
docker-compose run --rm pororoca create -r ./sample/lipsum.txt
```

**Create a thread from a URL:**
```bash
docker-compose run --rm pororoca create -r "https://example.com/article.txt"
```

**Custom formatting:**
```bash
docker-compose run --rm pororoca create -r ./sample/lipsum.txt -pr "Thread" -sf "📝"
```

## Traditional Installation (Without Docker)

If you prefer to run without Docker:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [Yarn](https://yarnpkg.com/) package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pororoca
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Link the CLI globally:**
   ```bash
   yarn link
   ```

4. **Run the CLI:**
   ```bash
   pororoca create --help
   ```

## Project Structure

```
pororoca/
├── index.js          # Main CLI application
├── locale.json       # Internationalization strings
├── sample/           # Sample text files for testing
│   └── lipsum.txt
├── package.json      # Project dependencies and metadata
├── Dockerfile        # Docker configuration
└── docker-compose.yml # Docker Compose configuration
```

**Key Files:**
- [`index.js`](https://github.com/fernandocamargo/pororoca/blob/master/index.js) - Main CLI application (212 lines)
- [`locale.json`](https://github.com/fernandocamargo/pororoca/blob/master/locale.json) - Internationalization strings
- [`package.json`](https://github.com/fernandocamargo/pororoca/blob/master/package.json) - Project dependencies and metadata
- [`Dockerfile`](https://github.com/fernandocamargo/pororoca/blob/master/Dockerfile) - Docker configuration
- [`docker-compose.yml`](https://github.com/fernandocamargo/pororoca/blob/master/docker-compose.yml) - Docker Compose setup
- [`CODE_ANALYSIS.md`](https://github.com/fernandocamargo/pororoca/blob/master/CODE_ANALYSIS.md) - Technical analysis document

## Dependencies

- [`commander`](https://github.com/tj/commander.js) - CLI framework
- [`twitter-text`](https://github.com/twitter/twitter-text) - Twitter text utilities
- [`chalk`](https://github.com/chalk/chalk) - Terminal styling
- [`mustache`](https://github.com/janl/mustache.js) - Template rendering
- [`promptly`](https://github.com/moxystudio/node-promptly) - Interactive prompts
- [`request`](https://github.com/request/request) - HTTP client (deprecated)
- [`progress`](https://github.com/visionmedia/node-progress) - Progress bars
- [`q`](https://github.com/kriskowal/q) - Promise library

## Note

This is a legacy project showcasing Node.js CLI development patterns. The Twitter API integration is not fully implemented in this version.

## Code Quality & Architecture

This project demonstrates advanced [functional programming](https://en.wikipedia.org/wiki/Functional_programming) principles in JavaScript, featuring:

- **[Point-free (tacit) programming](https://en.wikipedia.org/wiki/Tacit_programming)** - Extensive use of `.bind()` for partial application and composition
- **[Higher-order functions](https://eloquentjavascript.net/05_higher_order.html)** - Functions as first-class citizens with sophisticated composition patterns
- **[Promise pipelines](https://javascript.info/promise-chaining)** - Declarative async flow using [Q promises](https://github.com/kriskowal/q)
- **[Design patterns](https://www.patterns.dev/posts/classic-design-patterns/)** - Module, Strategy, Factory, and Pipeline patterns
- **Configuration-driven design** - Centralized defaults and externalized i18n strings
- **ES6+ features** - Early adoption of modern JavaScript (arrow functions, const/let, template literals, destructuring)

### Technical Highlights

- **Paradigm:** Functional programming with declarative data transformations
- **Style:** Point-free composition and immutable data flows
- **Async:** Promise-based control flow (pre-async/await era)
- **Architecture:** Separation of concerns with utility factories and configuration objects

**📊 For a comprehensive analysis of coding style, design patterns, and software development practices, see [CODE_ANALYSIS.md](CODE_ANALYSIS.md)**

The analysis document includes:
- Detailed design pattern breakdowns
- Functional programming techniques with examples
- Historical context (circa 2016)
- 40+ references to books, articles, and documentation
- Comparison with modern FP libraries (Ramda, Lodash/FP)

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) - See [LICENSE](LICENSE) file for details
