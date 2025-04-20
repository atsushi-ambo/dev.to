# Dev.to Articles Repository

This repository contains articles for publication on [dev.to](https://dev.to). Articles are automatically published via GitHub Actions when pushed to the main branch.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) must be installed on your machine.
- [Git](https://git-scm.com/) for cloning the repository.
- A [dev.to](https://dev.to) account and API key from [dev.to/settings/extensions](https://dev.to/settings/extensions).

### Step 1: Clone the Repository

```bash
git clone https://github.com/YourUsername/dev.to.git
cd dev.to
```

### Step 2: Set Up Your API Key

```bash
cp .env.example .env
# Edit .env with your favorite editor, for example:
nano .env
# Change DEVTO_API_KEY=your_devto_api_key_here to your actual key
```

## Repository Structure

```
.
├── blog-posts/
│   ├── article-folder-1/
│   │   ├── article.md
│   │   └── assets/
│   └── article-folder-2/
│       ├── article.md
│       └── assets/
├── .github/
│   └── workflows/
│       └── publish.yml
├── publish-to-devto.js    # Local publishing script
├── Dockerfile             # Docker environment for publishing
└── package.json           # Dependencies and scripts
```

## Writing and Publishing Articles with Docker

### Step 1: Build the Docker Image

Build the Docker image (only needed once or after Dockerfile changes):

```bash
docker build -t devto-publisher .
```

### Step 2: Create a New Article

1. Create a new folder for your article in the `blog-posts` directory:

```bash
mkdir -p blog-posts/my-new-article/assets
```

2. Create an article.md file in the new folder with proper front matter:

```bash
touch blog-posts/my-new-article/article.md
```

3. Edit your article using your preferred editor, starting with this template:

```markdown
---
title: "My New Article Title"
published: false
tags:
  - tag1
  - tag2
---

# My Article Heading

Article content goes here...

![Image Description](assets/my-image.png)
```

4. Add any images to the assets folder (they will be automatically resized).

### Step 3: Test and Publish

1. Run the container with your workspace mounted:

```bash
docker run --rm -it \
  -v "$PWD":/app \
  --env-file .env \
  devto-publisher
```

2. Inside the container, test your article in dry-run mode:

```bash
# Test the specific article
node publish-to-devto.js --file blog-posts/my-new-article/article.md --dryRun

# Or test all articles
npm run publish:dry
```

3. When ready to publish, either:

- Inside the container:
```bash
node publish-to-devto.js --file blog-posts/my-new-article/article.md
```

- Or commit and push to trigger the GitHub Action:
```bash
# Exit the container first with Ctrl+D or 'exit'
git add blog-posts/my-new-article
git commit -m "Add new article: My New Article Title"
git push origin main
```

## Image References and Automation

- All images in any `assets` folder are automatically resized to a maximum of 4096x4096 pixels by the GitHub Actions workflow before publishing. You do not need to manually resize images.
- When your article is published, the GitHub Actions workflow will:
  1. Find all image references in your Markdown file
  2. Automatically resize images in assets folders to fit within 4096x4096 pixels
  3. Upload the images to dev.to's CDN (if API allows)
  4. Replace the references with the CDN URLs in the published article

## Article Front Matter Example

Each article should have front matter at the top, for example:

```yaml
---
title: My Article Title
published: false  # Change to true when ready to publish
description: A short description of the article
tags: tag1, tag2, tag3
cover_image: https://url-to-cover-image.jpg  # Optional
canonical_url: https://your-blog.com/original-post  # Optional
---
```