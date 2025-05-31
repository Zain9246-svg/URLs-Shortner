import { Router } from 'express';
import { postURLShortner,getURLShortner,redirectShortCode,postdeleteAllLinks} from '../controllers/postShortner.controller.js';


const PORT = 3000;
const router = Router();

router.post("/", postURLShortner);
router.get("/:shortCode",redirectShortCode);
router.get('/', getURLShortner );
router.post('/delete-all',postdeleteAllLinks);

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


// GET: Homepage

// DELETE: Clear all saved links


// ! default export
// export default router;

// ? Named export is the best practice for modularity
export const shortnerRouter = router;
