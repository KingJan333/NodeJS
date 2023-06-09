import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors"

import { registerValidation, LoginValidation, postCreateValidation } from "./validations.js";
import {checkAuth, handleValidationErrors} from './utils/index.js'
import { UserController, PostController } from './controllers/index.js';


mongoose
  .connect(
    "mongodb+srv://kukuchu:12345@cluster0.gkt7nt3.mongodb.net/blog?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB OK"))
  .catch((err) => console.log("DB error", err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({storage});

app.use(express.json());
app.use(cors())
app.use('/uploads/', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/auth/login", LoginValidation, handleValidationErrors, UserController.login);
app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  });
});

app.get('/tags', PostController.getLastTags)

app.get('/posts', PostController.getAllPosts)
app.get('/posts/:id', PostController.getOnePost)
app.get('/posts/tags', PostController.getLastTags)
app.post('/posts',checkAuth, postCreateValidation, handleValidationErrors, PostController.createPost)
app.delete('/posts/:id',checkAuth, PostController.deletePost)
app.patch('/posts/:id',checkAuth, postCreateValidation, handleValidationErrors, PostController.updatePost)

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
