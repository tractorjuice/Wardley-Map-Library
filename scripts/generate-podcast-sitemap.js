#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { parseString } = require('xml2js');

class PodcastSitemapGenerator {
    constructor() {
        this.rssUrl = 'https://podcast.wardleymaps.ai/feed.xml';
        this.outputPath = path.join(process.cwd(), 'public', 'sitemap-podcast.xml');
    }

    async fetchRSSFeed() {
        return new Promise((resolve, reject) => {
            console.log('📡 Fetching podcast RSS feed...');
            
            https.get(this.rssUrl, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    console.log('✅ RSS feed fetched successfully');
                    resolve(data);
                });
                
                response.on('error', (error) => {
                    console.error('❌ Error fetching RSS feed:', error);
                    reject(error);
                });
            }).on('error', (error) => {
                console.error('❌ HTTP request error:', error);
                reject(error);
            });
        });
    }

    async parseRSSFeed(rssData) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Parsing RSS feed XML...');
            
            parseString(rssData, { trim: true }, (err, result) => {
                if (err) {
                    console.error('❌ Error parsing RSS XML:', err);
                    reject(err);
                    return;
                }
                
                try {
                    const channel = result.rss.channel[0];
                    const items = channel.item || [];
                    
                    console.log(`📊 Found ${items.length} episodes in RSS feed`);
                    resolve(items);
                } catch (parseError) {
                    console.error('❌ Error extracting items from RSS:', parseError);
                    reject(parseError);
                }
            });
        });
    }

    extractEpisodeData(items) {
        console.log('📝 Extracting episode data...');
        
        const episodes = [];
        const seenUrls = new Set();
        
        items.forEach((item, index) => {
            try {
                const link = item.link?.[0];
                const pubDate = item.pubDate?.[0];
                const title = item.title?.[0];
                
                if (!link || !pubDate) {
                    console.log(`⚠️ Skipping item ${index + 1}: missing link or pubDate`);
                    return;
                }
                
                // Clean the URL and avoid duplicates
                const cleanUrl = link.trim().replace(/\/$/, '') + '/';
                
                if (seenUrls.has(cleanUrl)) {
                    console.log(`⚠️ Skipping duplicate URL: ${cleanUrl}`);
                    return;
                }
                
                seenUrls.add(cleanUrl);
                
                // Parse publication date
                const parsedDate = new Date(pubDate);
                const lastmod = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                
                episodes.push({
                    url: cleanUrl,
                    lastmod: lastmod,
                    title: title || 'Unknown Episode'
                });
                
            } catch (error) {
                console.log(`⚠️ Error processing item ${index + 1}:`, error.message);
            }
        });
        
        // Sort by URL for consistent ordering
        episodes.sort((a, b) => a.url.localeCompare(b.url));
        
        console.log(`✅ Processed ${episodes.length} unique episodes`);
        return episodes;
    }

    generateSitemapXML(episodes) {
        console.log('🗺️ Generating sitemap XML...');
        
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Generate episode URLs
        const episodeUrls = episodes.map(episode => {
            return `  <url>
    <loc>${episode.url}</loc>
    <lastmod>${episode.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join('\n\n');
        
        // Generate sitemap content
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>https://podcast.wardleymaps.ai/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- RSS Feed -->
  <url>
    <loc>https://podcast.wardleymaps.ai/feed.xml</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Episode Pagination Pages -->
  <url>
    <loc>https://podcast.wardleymaps.ai/page/2/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/3/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/4/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/5/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/6/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/7/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/8/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/9/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/10/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/11/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/12/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/13/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/14/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/15/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/16/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://podcast.wardleymaps.ai/page/17/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Individual Episode Pages -->
${episodeUrls}

</urlset>`;

        return sitemapContent;
    }

    async saveSitemap(sitemapContent) {
        try {
            await fs.writeFile(this.outputPath, sitemapContent, 'utf8');
            console.log(`✅ Podcast sitemap saved to: ${this.outputPath}`);
        } catch (error) {
            console.error('❌ Error saving sitemap:', error);
            throw error;
        }
    }

    async run() {
        console.log('🚀 Starting podcast sitemap generation...\n');
        
        try {
            // Fetch and parse RSS feed
            const rssData = await this.fetchRSSFeed();
            const items = await this.parseRSSFeed(rssData);
            
            // Extract episode data
            const episodes = this.extractEpisodeData(items);
            
            // Generate sitemap
            const sitemapContent = this.generateSitemapXML(episodes);
            
            // Save sitemap
            await this.saveSitemap(sitemapContent);
            
            console.log('\n✅ Podcast sitemap generation completed successfully!');
            console.log(`📊 Total URLs: ${17 + 2 + episodes.length} (17 pagination pages + 2 core pages + ${episodes.length} episodes)`);
            console.log('🌐 Accessible at: https://podcast.wardleymaps.ai/sitemap.xml');
            
        } catch (error) {
            console.error('\n❌ Podcast sitemap generation failed:', error);
            process.exit(1);
        }
    }
}

// Run the generator if this script is executed directly
if (require.main === module) {
    const generator = new PodcastSitemapGenerator();
    generator.run();
}

module.exports = PodcastSitemapGenerator;