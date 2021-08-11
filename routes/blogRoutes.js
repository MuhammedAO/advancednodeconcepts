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
  const redis = require("redis")
  const redisUrl = "redis://127.0.0.1:16379"
  const client = redis.createClient(redisUrl)
  const util = require("util")

  client.get = util.promisify(client.get)

  //check for cached data in redis related to this query.
  const cachedBlog = await client.get(req.user.id)

  if (cachedBlog) {
    console.log('Serving from cache')

    return res.send(JSON.parse(cachedBlog))
  }

  //if no, respond to the request normally and update the cache by storing the data
  const blogs = await Blog.find({ _user: req.user.id })
  console.log('Serving from mongoDB')
  res.send(blogs)

  client.set(req.user.id, JSON.stringify(blogs))
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
