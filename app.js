import express from 'express';
import path from 'path';
import {shortnerRouter} from './Routes/shortner.routes.js';

const PORT = 3000;

const app = express();

app.use(express.static(path.join('public')));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(shortnerRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});