# pororoca

A Node.js CLI tool for creating and publishing Twitter thread storms. Pororoca automatically splits long text into tweet-sized chunks, formats them with numbering, and can optionally publish them to Twitter.

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

The easiest way to run this project is using Docker, which handles all dependencies automatically.

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

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

- Node.js (v14 or higher recommended)
- Yarn package manager

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

## Dependencies

- `commander` - CLI framework
- `twitter-text` - Twitter text utilities
- `chalk` - Terminal styling
- `mustache` - Template rendering
- `promptly` - Interactive prompts
- `request` - HTTP client
- `progress` - Progress bars
- `q` - Promise library

## Note

This is a legacy project showcasing Node.js CLI development patterns. The Twitter API integration is not fully implemented in this version.

## License

Apache License 2.0 - See [LICENSE](LICENSE) file for details
