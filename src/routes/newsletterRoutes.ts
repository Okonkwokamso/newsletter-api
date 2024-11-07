import { Router } from 'express';
import {
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
} from '../controllers/newsletterController';
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

router.post('/', createNewsletter);
router.get('/', getAllNewsletters);
router.get('/:id', getNewsletterById);
router.patch('/:id', updateNewsletter);
router.delete('/:id', deleteNewsletter);

export default router;
