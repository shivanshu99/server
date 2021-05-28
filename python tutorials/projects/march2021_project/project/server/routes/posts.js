import express from 'express';

import { getPosts, forgotPassword, createPost, updatePost,DislikePost, likePost, deletePost,updatePassword } from '../controllers/posts.js';

const router = express.Router();
import auth from "../middleware/auth.js";

router.get('/', getPosts);
router.post("/forgotPassword", forgotPassword);
router.post("/updatePassword", updatePassword);
router.post('/',auth,  createPost);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.patch("/:id/DislikePost", auth, DislikePost);

export default router;