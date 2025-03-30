#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fm = require('front-matter');

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
const folder = folderArg !== -1 && args.length > folderArg + 1 ? args[folderArg + 1] : 'blog-posts';

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

async function publishArticle(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const { attributes, body } = fm(content);
    
    const article = {
      article: {
        title: attributes.title,
        published: attributes.published,
        body_markdown: content,
        tags: attributes.tags ? attributes.tags.split(',').map(tag => tag.trim()) : [],
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
      } catch (error) {
        console.error(`Error publishing article: ${error.message}`);
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
    } else {
      console.log('Article would be published with:');
      console.log(JSON.stringify(article, null, 2));
    }
  } catch (error) {
    console.error(`Error processing file ${file}: ${error.message}`);
  }
}

async function run() {
  try {
    console.log(`Looking for markdown files in ${folder}...`);
    const files = findMarkdownFiles(folder);
    console.log(`Found ${files.length} markdown files to process`);
    
    for (const file of files) {
      await publishArticle(file);
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