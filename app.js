import { readFile, writeFile } from 'fs/promises';
import { createServer } from 'http';
import { join } from 'path';
import { parse } from 'url';

const PORT = 3000;
const DATA_FILE = join('data', 'links.json');

const serveFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

const loadingLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        console.error('Error loading links:', error);
        return {};
    }
};

const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
    console.log('Links saved successfully');
};

const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);

    if (req.method === 'GET') {
        if (parsedUrl.pathname === '/') {
            return serveFile(res, join("public", "index.html"), "text/html");
        } else if (parsedUrl.pathname === '/style.css') {
            return serveFile(res, join("public", "style.css"), "text/css");
        } else {
            // Check if short link exists
            const links = await loadingLinks();
            const code = parsedUrl.pathname.slice(1); // Remove leading slash
            if (links[code]) {
                res.writeHead(302, { Location: links[code] });
                return res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                return res.end('Short URL not found');
            }
        }
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/submit') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { url, shortCode } = JSON.parse(body);
                if (!url || !shortCode) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Both URL and shortCode are required.' }));
                }

                const links = await loadingLinks();
                if (links[shortCode]) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Short code already exists.' }));
                }

                links[shortCode] = url;
                await saveLinks(links);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Short URL created', shortUrl: `http://localhost:${PORT}/${shortCode}` }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    
});
