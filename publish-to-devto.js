#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fm = require('front-matter');
const FormData = require('form-data');

// Check if API key is provided
const apiKey = process.env.DEVTO_API_KEY;
if (!apiKey) {
  console.error('Error: DEVTO_API_KEY environment variable is required');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dryRun');
const folderArg = args.indexOf('--folder');
const fileArg = args.indexOf('--file');

// Get the folder or file path
let folder = 'blog-posts';
let specificFile = null;

if (folderArg !== -1 && args.length > folderArg + 1) {
  folder = args[folderArg + 1];
}

if (fileArg !== -1 && args.length > fileArg + 1) {
  specificFile = args[fileArg + 1];
}

// Find all markdown files in the specified folder
function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Upload local assets images to dev.to and update markdown references
async function uploadImagesForArticle(filePath, markdown) {
  // Skip image uploads during dry run
  if (dryRun) return markdown;
  const dir = path.dirname(filePath);
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) return markdown;
  let updated = markdown;
  const regex = /!\[(.*?)\]\((?:\.\/)?assets\/([^\)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const alt = match[1];
    const imgName = match[2];
    const fullPath = path.join(assetsDir, imgName);
    if (fs.existsSync(fullPath)) {
      const form = new FormData();
      form.append('image', fs.createReadStream(fullPath));  // Use 'image' per DEV.TO API docs
      try {
        const res = await axios.post('https://dev.to/api/images', form, {
          headers: { 'api-key': apiKey, ...form.getHeaders() }
        });
        const url = Array.isArray(res.data.image) ? res.data.image[0] : res.data.image;
        updated = updated.replace(match[0], `![${alt}](${url})`);
      } catch (err) {
        console.error(`Image upload failed for ${fullPath}: ${err.message}`);
      }
    }
  }
  return updated;
}

async function publishArticle(file) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = await uploadImagesForArticle(file, content);
    const { attributes, body } = fm(content);

    // Normalize tags: support both YAML array and comma-separated string
    const tags = Array.isArray(attributes.tags)
      ? attributes.tags
      : (attributes.tags ? attributes.tags.split(',').map(tag => tag.trim()) : []);

    const article = {
      article: {
        title: attributes.title,
        published: attributes.published,
        body_markdown: content,
        tags: tags,
      }
    };
    
    if (attributes.cover_image) {
      article.article.main_image = attributes.cover_image;
    }
    
    if (attributes.canonical_url) {
      article.article.canonical_url = attributes.canonical_url;
    }
    
    if (attributes.series) {
      article.article.series = attributes.series;
    }
    
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Publishing article: ${attributes.title}`);
    
    if (!dryRun) {
      try {
        const response = await axios.post('https://dev.to/api/articles', article, {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Successfully published: ${response.data.url}`);
        return {
          success: true,
          url: response.data.url,
          title: attributes.title
        };
      } catch (error) {
        console.error(`Error publishing article: ${error.message}`);
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      console.log('Article would be published with:');
      console.log(JSON.stringify(article, null, 2));
      return {
        success: true,
        dryRun: true,
        title: attributes.title
      };
    }
  } catch (error) {
    console.error(`Error processing file ${file}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function run() {
  try {
    let files = [];

    if (specificFile) {
      // Use a specific file
      if (!fs.existsSync(specificFile)) {
        console.error(`Error: File ${specificFile} does not exist`);
        process.exit(1);
      }
      
      if (!specificFile.endsWith('.md')) {
        console.error('Error: Only markdown (.md) files are supported');
        process.exit(1);
      }
      
      files = [specificFile];
      console.log(`Publishing single file: ${specificFile}`);
    } else {
      // Find markdown files in the folder
      console.log(`Looking for markdown files in ${folder}...`);
      files = findMarkdownFiles(folder);
      console.log(`Found ${files.length} markdown files to process`);
    }
    
    if (files.length === 0) {
      console.log('No markdown files found to publish.');
      return;
    }
    
    const results = {
      successful: [],
      failed: []
    };
    
    for (const file of files) {
      const result = await publishArticle(file);
      if (result.success) {
        results.successful.push({
          file,
          title: result.title,
          url: result.url,
          dryRun: !!result.dryRun
        });
      } else {
        results.failed.push({
          file,
          error: result.error
        });
      }
    }
    
    // Print summary
    console.log('\n======= PUBLISHING SUMMARY =======');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\nFailed articles:');
      results.failed.forEach(item => {
        console.log(`- ${item.file}: ${item.error}`);
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Install dependencies if needed
try {
  require.resolve('axios');
  require.resolve('front-matter');
} catch (e) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install axios front-matter');
  console.log('Dependencies installed.');
}

run();