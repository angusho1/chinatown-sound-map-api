import express from 'express';
import submissionController from '../controllers/submission.controller';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'src/public/clips');
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null , file.originalname );
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);
router.post('/submissions', upload.single('recording'), submissionController.postSubmissions);

export default router;