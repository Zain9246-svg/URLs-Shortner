import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PORT } from '../app.js';
 // Assuming PORT is exported from app.js
import { DATA_FILE } from '../models/shortner.model.js';
import { loadLinks, saveLinks } from '../models/shortner.model.js';


export const getURLShortner = async (req, res) => {
    try {
        const file = await fs.readFile(path.join('views', 'index.ejs'), 'utf-8');
        const links = await loadLinks();
        // console.log("Loaded links:", links);  // Debug line

        const content = file.replaceAll(
            '{{shortened-urls}}',
            Object.entries(links)
                .map(([shortCode, url]) => `<li><a href="/${shortCode}" target="_blank"><span>ShortCode:</span> http://localhost:${PORT}${shortCode} </a>${url}</li>`)
                .join('')
        );

        res.send(content);
    } catch (error) {
        console.error('Error loading index page:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const postURLShortner = async (req, res) => {
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
};

export const redirectShortCode = async (req, res) => {
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
}

export const postdeleteAllLinks = async (req, res) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
        console.log('All links deleted');
        return res.redirect('/');
    } catch (err) {
        console.error('Error deleting links:', err);
        return res.status(500).send('Internal Server Error');
    }
}
