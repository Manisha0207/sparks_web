import express from "express";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const _dirname = dirname(fileURLToPath(import.meta.url));
const postsFilePath = path.join(_dirname, "posts.json");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(_dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});


app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/profile", (req, res) => {
  res.render("profile", { posts: readPostsFromFile() });
});

const readPostsFromFile = () => {
  if (!fs.existsSync(postsFilePath)) {
    return [];
  }
  const data = fs.readFileSync(postsFilePath);
  return JSON.parse(data);
};

const writePostsToFile = (posts) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

app.get('/posts/new', (req, res) => {
  res.render("create");
});

app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: Date.now().toString(), title, content, createdAt: new Date() };

  const posts = readPostsFromFile();
  posts.push(newPost);
  writePostsToFile(posts);

  res.redirect("/posts");
});

app.get("/posts", (req, res) => {
  const posts = readPostsFromFile();
  res.render("profile", { posts });
});

app.get('/posts/:id', (req, res) => {
  const posts = readPostsFromFile();
  const post = posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  res.render("post", { post });
});

app.post('/posts/:id/delete', (req, res) => {
  let posts = readPostsFromFile();
  posts = posts.filter(p => p.id !== req.params.id);
  writePostsToFile(posts);

  res.redirect('/posts');
});

app.get('/posts/:id/edit', (req, res) => {
  const posts = readPostsFromFile();
  const post = posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.status(404).send('Post not found');
  }

  res.render("edit", { post });
});

app.post('/posts/:id/edit', (req, res) => {
  const { title, content } = req.body;
  const posts = readPostsFromFile();
  const postIndex = posts.findIndex(p => p.id === req.params.id);

  if (postIndex === -1) {
    return res.status(404).send('Post not found');
  }

  posts[postIndex] = { ...posts[postIndex], title, content, updatedAt: new Date() };
  writePostsToFile(posts);

  res.redirect(`/posts/${req.params.id}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
