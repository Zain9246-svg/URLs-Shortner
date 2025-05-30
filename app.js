import fs from 'fs/promises';
import { join } from 'path';
import express from 'express';
import crypto from 'crypto';

const PORT = 3000;
const DATA_FILE = join('data', 'links.json');
const app = express();

app.use(express.static(join('public')));
app.use(express.urlencoded({ extended: true }));

// Load links from JSON
const loadLinks = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    console.error('Error loading links:', error);
    return {};
  }
};

// Save links to JSON
const saveLinks = async (links) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
  console.log('Links saved successfully');
};

// POST: Create short link
app.post("/", async (req, res) => {
  try {
    const { url, shortCode } = req.body;

    if (!url) {
      return res.status(400).send("URL is required");
    }

    const links = await loadLinks();
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    if (links[finalShortCode]) {
      return res.status(400).send("Short code already exists. Please choose another.");
    }

    links[finalShortCode] = url;
    await saveLinks(links);

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

// GET: Redirect from short code
app.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const links = await loadLinks();

    if (!links[shortCode]) {
      return res.status(404).send("404 - Short code not found");
    }

    return res.redirect(links[shortCode]);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

// GET: Homepage
app.get('/', async (req, res) => {
  try {
    const file = await fs.readFile(join('views', 'index.html'), 'utf-8');
    const links = await loadLinks();
    // console.log("Loaded links:", links);  // Debug line

    const content = file.replaceAll(
      '{{shortened-urls}}',
      Object.entries(links)
        .map(([shortCode, url]) => `<li><a href="/${shortCode}" target="_blank">http://localhost:${PORT}${shortCode} </a>${url}</li>`)
        .join('')
    );

    res.send(content);
  } catch (error) {
    console.error('Error loading index page:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
