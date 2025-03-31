# Dev.to Articles Repository

This repository contains articles for publication on [dev.to](https://dev.to). Articles are automatically published via GitHub Actions when pushed to the main branch.

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
└── package.json           # Dependencies and scripts
```

## How to Create a New Article

1. Create a new folder in the `blog-posts` directory with a name related to your article
2. Add a markdown file (like `article.md`) with your article content
3. Include any images in an `assets` subfolder
4. Push to main branch to trigger automatic publication

## Article Front Matter

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

## Image References

There are two supported formats for referencing images in your articles:

```markdown
![Image description](assets/image_name.png)
```

or

```markdown
![Image description](./assets/image_name.png)
```

When your article is published, the GitHub Actions workflow will:
1. Find all image references in your Markdown file
2. Upload the images to dev.to's CDN
3. Replace the references with the CDN URLs in the published article

## Setting Up the GitHub Integration

1. Get your DEV.TO API key from [dev.to/settings/extensions](https://dev.to/settings/extensions)
2. Add this key as a repository secret named `DEVTO_API_KEY` in your GitHub repository settings
3. When you push changes to the main branch, the GitHub Action will publish your articles

## Deploying with GitHub Actions

You can manually trigger the GitHub Actions workflow to publish your articles:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Publish to dev.to" workflow
3. Click "Run workflow" dropdown
4. Select the branch containing your articles (usually "main")
5. Click "Run workflow" button

This will run the workflow in dry-run mode, showing what would be published without actually publishing.
To publish for real, you need to push your changes to the main branch.

## Local Testing

To test this workflow locally:

1. Install dependencies:
```bash
npm install
```

2. Run the publishing script in dry-run mode:
```bash
DEVTO_API_KEY=your_api_key npm run publish:dry
```

3. When ready to publish for real:
```bash
DEVTO_API_KEY=your_api_key npm run publish
```

You can also specify a custom directory:
```bash
DEVTO_API_KEY=your_api_key node publish-to-devto.js --folder custom-folder --dryRun
```

Or publish a single file:
```bash
DEVTO_API_KEY=your_api_key npm run publish:single -- blog-posts/your-article/article.md
```