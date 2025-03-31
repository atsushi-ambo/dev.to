# Dev.to Article Images

To include images with your dev.to articles, follow these steps:

## Option 1: Local Images (Recommended)

1. Create an `assets` folder in the same directory as your article.md file
2. Add your images to this folder
3. Reference them in your markdown using relative paths

Example directory structure:
```
blog-posts/
  └── my-article/
      ├── article.md
      └── assets/
          ├── image1.png
          ├── image2.jpg
          └── screenshot.gif
```

In your article.md, reference images like this:
```markdown
![Image description](./assets/image1.png)
```

## Option 2: Using dev.to's Image Hosting

When you publish to dev.to, the platform will automatically upload any local images to their CDN.
The URLs will be replaced in your published article.

For example, a local reference like this:
```markdown
![Image description](./assets/image1.png)
```

Will be transformed into something like this:
```markdown
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/abcd1234.png)
```

## Option 3: Direct URL References

You can also link directly to images hosted elsewhere:

```markdown
![Image description](https://example.com/path/to/image.jpg)
```

## Important Notes

- Make sure your images are appropriately sized (not too large)
- Use descriptive alt text for accessibility
- If you're using the GitHub Actions workflow to publish, it will handle the image uploads automatically
- For cover images, you can specify them in the front matter:

```yaml
---
title: "My Article"
published: false
cover_image: "./assets/cover.jpg"  # Local image
# OR
cover_image: "https://example.com/cover.jpg"  # Remote image
---
```

## For Your Current Articles

For your "Vibe Coding" articles, create assets folders with the images from your original Zenn posts:

```
/Users/usr0200783/atsushi/personal/github/dev.to/blog-posts/vibe-coding-replit/assets/
/Users/usr0200783/atsushi/personal/github/dev.to/blog-posts/vibe-coding-experience/assets/
```

Then update the image references in your articles to use these local paths.