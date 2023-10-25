const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

module.exports = router;

// ADMIN - Login page


router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            descr: 'This is my admin panel'
        }

        res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
});

// ADMIN - check if youre logged in

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {
        const decoder = jwt.verify(token, jwtSecret);
        req.userId = decoder.userId;
        next();
    } catch (error) {
        res.sttus(401).json({ message: 'Unauthorized' })
    }
}


// POST - ADMIN - Check Login 

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard')

        // res.redirect('/admin')
        // res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
});

// POST - ADMIN - Dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard',
            descr: 'This is my admin panel'
        }
        const data = await Post.find();
        res.render('admin/dashboard', { locals, data, layout: adminLayout })

    } catch (error) {
        console.log(error);
    }
});
// ADMIN - Create New Post

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add Post',
            descr: 'This is my admin panel'
        }
        const data = await Post.find();
        res.render('admin/add-post', { locals, layout: adminLayout })

    } catch (error) {
        console.log(error);
    }
});


// ADMIN Post - Create New Post

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        console.log(req.body);

        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
                photo: req.photo
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

// ADMIN GET - Edit Post

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        const locals = {
            title: 'Add Post',
            descr: 'This is my admin panel'
        }
        const data = await Post.findOne({ _id: req.params.id })
        res.render('admin/edit-post', { locals, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});


// ADMIN PUT - Edit Post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/dashboard`);
    } catch (error) {
        console.log(error);
    }
});

// ADMIN DELETE - DELETE Post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id })
        res.redirect(`/dashboard`);
    } catch (error) {
        console.log(error);
    }
});

// ADMIN GET - Logout Post == clean cookie

router.get('/logout', (req, res) => {
    try {
        res.clearCookie('token');
        // res.json({ message: 'Logout successful.'})
        res.redirect('/')
    } catch (error) {
        console.log(error);
    }
});





// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         console.log(req.body);

//         if (req.body.username === 'admin') {
//             res.send(`You're logged in`)
//         } else {
//             res.send(`Wrong Username`)
//         }

//         // res.redirect('/admin')
//         // res.render('admin/index', { locals, layout: adminLayout })
//     } catch (error) {
//         console.log(error);
//     }
// });

// POST - ADMIN - REGISTER 

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' })
            }
            res.status(500).json({ message: 'Internal Server Error' })
        }
        // res.redirect('/admin')
        // res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error);
    }
});
