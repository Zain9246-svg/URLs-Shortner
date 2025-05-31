import fs from 'fs/promises';
import path from 'path';
import { Router } from 'express';
import { postURLShortner } from '../controllers/postShortner.controller.js';


const PORT = 3000;
const router = Router();

router.post("/", postURLShortner(saveLinks, loadLinks));


// router.get("/report", async (req, res) => {
//     // res.send(`<h1>Report Page</h1>`)
//     const students =[
//         { name: 'John Doe', age: 20, grade: 'A'},
//         { name: 'Jane Smith', age: 22, grade: 'B'},
//         { name: 'Alice Johnson', age: 21, grade: 'C'},
//         { name: 'Bob Brown', age: 23, grade: 'B+'},
//         { name: 'Charlie White', age: 19, grade: 'A-'}
//     ]
//     res.render('report', {students});
// });

// GET: Redirect from short code
router.get("/:shortCode", async (req, res) => {
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
router.get('/', async (req, res) => {
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
});
// DELETE: Clear all saved links
router.post('/delete-all', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify({}));
    console.log('All links deleted');
    return res.redirect('/');
  } catch (err) {
    console.error('Error deleting links:', err);
    return res.status(500).send('Internal Server Error');
  }
});

// ! default export
// export default router;

// ? Named export is the best practice for modularity
export const shortnerRouter = router;
