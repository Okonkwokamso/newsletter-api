import { Router } from 'express';
import {
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
} from '../controllers/newsletterController';
//import { NewsletterInput, NewsletterSchema } from "../schemas/newsletterSchema";
import { validateRequest } from "../middleware/validateRequest";
import { verifyJwt } from "../middleware/verifyJwt";
import { validateId } from "../middleware/validateId";

const router = Router();

//router.post('/', validateRequest(NewsletterInput), createNewsletter);
router.post('/', verifyJwt, createNewsletter);
router.get('/', getAllNewsletters);
router.get('/:id', validateId, getNewsletterById);
router.patch('/:id', verifyJwt, validateId, updateNewsletter);
router.delete('/:id', verifyJwt, validateId, deleteNewsletter);

export default router;
