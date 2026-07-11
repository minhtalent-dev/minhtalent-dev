const fs = require('fs');
const path = require('path');

async function updateReadme() {
  const url = process.env.MINLAB_API_URL || 'https://minlab.top/api/blog/latest';
  console.log(`Fetching latest posts from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();
    console.log(`Successfully fetched ${posts.length} posts.`);

    let postsMarkdown = '';
    
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        const title = post.titleEn || post.title;
        const localePath = post.titleEn ? 'en' : 'vi';
        const postUrl = `https://minlab.top/${localePath}/blog/${post.slug}`;
        
        let dateStr = '';
        try {
          if (post.createdAt) {
            const date = new Date(post.createdAt);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            dateStr = ` - *${day}/${month}/${year}*`;
          }
        } catch (e) {
          console.warn('Failed to parse date:', post.createdAt, e);
        }

        postsMarkdown += `* [${title}](${postUrl})${dateStr}\n`;
      });
    } else {
      postsMarkdown += '* Chưa có bài viết mới nào.\n';
    }

    const readmePath = path.join(__dirname, '..', 'README.md');
    if (!fs.existsSync(readmePath)) {
      throw new Error('README.md does not exist!');
    }
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    const startMarker = '<!-- START_BLOG_POSTS -->';
    const endMarker = '<!-- END_BLOG_POSTS -->';

    const startIndex = readmeContent.indexOf(startMarker);
    const endIndex = readmeContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Markers <!-- START_BLOG_POSTS --> and <!-- END_BLOG_POSTS --> not found in README.md');
    }

    const updatedContent = 
      readmeContent.substring(0, startIndex + startMarker.length) + 
      '\n' + postsMarkdown + '\n' + 
      readmeContent.substring(endIndex);

    fs.writeFileSync(readmePath, updatedContent, 'utf8');
    console.log('README.md updated successfully!');
  } catch (error) {
    console.error('Error updating README.md:', error);
    process.exit(1);
  }
}

updateReadme();
