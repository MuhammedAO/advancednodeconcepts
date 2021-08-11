const mongoose = require("mongoose")
const express = require("express")
const requireLogin = require("../middlewares/requireLogin")
const Blog = mongoose.model("Blog")

const router = express.Router()

router.get("/:id", requireLogin, async (req, res) => {
  const blog = await Blog.findOne({
    _user: req.user.id,
    _id: req.params.id,
  })

  res.send(blog)
})

router.get("/", requireLogin, async (req, res) => {

  const blogs = await Blog.find({ _user: req.user.id })
  
  res.send(blogs)
})

router.post("/", requireLogin, async (req, res) => {
  const { title, content } = req.body

  const blog = new Blog({
    title,
    content,
    _user: req.user.id,
  })

  try {
    await blog.save()
    res.send(blog)
  } catch (err) {
    res.send(400, err)
  }
})

module.exports = router
