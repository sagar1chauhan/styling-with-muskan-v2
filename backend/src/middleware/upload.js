import multer from "multer";

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
  else cb(null, false);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
