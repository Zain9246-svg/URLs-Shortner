import crypto from 'crypto';

export const postURLShortner=(saveLinks,loadLinks)=> 
    async (req, res) => {
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
}
