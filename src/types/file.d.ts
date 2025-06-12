import { Request } from 'express';
import multer from 'multer';

 interface MulterRequest extends Request {
  file?: Express.Multer.File;
}