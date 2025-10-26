import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  './uploads/invoices',
  './uploads/documents',
  './uploads/temp'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for invoice PDFs
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/invoices');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `invoice_${timestamp}_${sanitizedName}`);
  }
});

// File filter - only allow PDFs
const pdfFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Invoice upload middleware
export const uploadInvoice = multer({
  storage: invoiceStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Document upload middleware (more flexible)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documents');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `doc_${timestamp}_${sanitizedName}`);
  }
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  }
});
