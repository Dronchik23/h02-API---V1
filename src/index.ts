import express, {Request, Response} from 'express'
import bodyParser from 'body-parser'
import {body} from "express-validator";
import {inputValidationMiddleware} from "./middlewares/input-validation-middleware";
import {basicAuthMiddleware} from "./middlewares/basic-auth-middleware";

const app = express()

app.use(bodyParser.json())
app.use(express.json())

let blogs: any[] = []
let posts: any[] = []


const port = process.env.PORT || 2000

// Validations333666

const nameValidation = body('name').trim().isLength({min: 1, max: 15}).notEmpty().isString()
const youtubeUrlValidation = body('youtubeUrl').trim().isLength({min: 1, max: 100}).notEmpty().isString().matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
const titleValidation = body('title').trim().isLength({min: 1, max: 30}).notEmpty().isString()
const shortDescriptionValidation = body('shortDescription').trim().isLength({min: 1, max: 100}).notEmpty().isString()
const contentValidation = body('content').trim().isLength({min: 1, max: 1000}).notEmpty().isString()
const blogIdValidation = body('blogId').trim().isLength({min: 13, max: 13}).notEmpty().isString()

// Blog
app.get('/blogs', (req: Request, res: Response) => {
    return res.send(blogs)
})

app.get('/blogs/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    const blog = blogs.find(b => b.id == id)
    if (blog) {
        res.send(blog)
    } else {
        res.sendStatus(404)
        return;
    }
})

app.post('/blogs', basicAuthMiddleware, nameValidation, youtubeUrlValidation, inputValidationMiddleware,  (req: Request, res: Response) => {

    const name = req.body.name
    const youtubeUrl = req.body.youtubeUrl

    const newBlog = {
        "id": (+(new Date())).toString(),
        "name": name,
        "youtubeUrl": youtubeUrl,
        "createdAt": new Date()
    }

    blogs.push(newBlog)

    return res.status(201).send(newBlog)
})

app.put('/blogs/:blogId',  basicAuthMiddleware, nameValidation, youtubeUrlValidation, inputValidationMiddleware, (req: Request, res: Response) => {

    const name = req.body.name
    const youtubeUrl = req.body.youtubeUrl

    const id = req.params.blogId
    const blog = blogs.find(b => b.id === id)
    if (blog) {
        blog.name = name
        blog.youtubeUrl = youtubeUrl
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return;
    }
})

app.delete('/blogs/:blogId', basicAuthMiddleware, (req: Request, res: Response) => {
    const id = req.params.blogId

    const newBlogs = blogs.filter(b => b.id !== id)
    if (newBlogs.length < blogs.length) {
        blogs = newBlogs
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})


// Posts

app.get('/posts', (req: Request, res: Response) => {
    return res.send(posts)
})

app.post('/posts', basicAuthMiddleware, titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation, inputValidationMiddleware,  (req: Request, res: Response) => {

    // ???????????? ?????????????? ???????????????? ??????
    const title = req.body.title
    const shortDescription = req.body.shortDescription
    const content = req.body.content
    const blogId = req.body.blogId


    // ???????? ???????? ?? ?????????? ?????????????? ????????????
    const blog = blogs.find(b => b.id === blogId)
    if (!blog) {
        return res.status(401).send({
            "errorsMessages": [
                {
                    "message": "string",
                    "field": "blogId"
                }
            ]
        })
    }

    // ???????????????????????????? ???????????? ?????? ????????????????????
    const newPost = {
        "id": (+(new Date())).toString(),
        "title": title,
        "shortDescription": shortDescription,
        "content": content,
        "blogId": blogId,
        "blogName": blog.name,
        "createdAt": new Date()
    }

    // ?????????????????? ???????????? ?? ????????????
    posts.push(newPost)

    return res.status(201).send(newPost)
})

app.get('/posts/:id', (req: Request, res: Response) => {
    const id = +req.params.id;
    const post = posts.find(p => p.id == id)
    if (post) {
        res.send(post)
    } else {
        res.sendStatus(404)
        return;
    }
})

app.put('/posts/:id', basicAuthMiddleware, titleValidation, shortDescriptionValidation, contentValidation, blogIdValidation, inputValidationMiddleware,  (req: Request, res: Response) => {

    const title = req.body.title
    const shortDescription = req.body.shortDescription
    const content = req.body.content
    const blogId = req.body.blogId

    const id = req.params.id
    const post = posts.find(p => p.id === id)
    if (post) {
        post.title = title
        post.shortDescription = shortDescription
        post.content = content
        post.blogId = blogId
        res.sendStatus(204)
        return
    } else {
        res.sendStatus(404)
        return;
    }
})

app.delete('/posts/:id', basicAuthMiddleware, (req: Request, res: Response) => {
    const id = req.params.id
    const newPosts = posts.filter(p => p.id !== id)
    if (newPosts.length < posts.length) {
        posts = newPosts
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})

app.delete('/testing/all-data', (req: Request, res: Response) => {
    posts = []
    res.sendStatus(204)
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
