import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  './uploads/invoices',
  './uploads/documents',
  './uploads/temp',
  './uploads/imports'
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

// File filter - allow PDFs and images for invoices
const invoiceFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPG, PNG) are allowed'));
  }
};

// Invoice upload middleware
export const uploadInvoice = multer({
  storage: invoiceStorage,
  fileFilter: invoiceFilter,
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
    fileSize: 50 * 1024 * 1024, // 50MB max for documents
  }
});

// CSV import upload middleware
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/imports');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `import_${timestamp}_${sanitizedName}`);
  }
});

const csvFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  const isCSV = file.mimetype.includes('csv') || file.originalname.endsWith('.csv');

  if (allowedTypes.includes(file.mimetype) || isCSV) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for CSV
  }
});
