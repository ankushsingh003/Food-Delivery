import multer, { MulterError } from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, publicPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage });