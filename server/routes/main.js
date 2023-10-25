const express = require('express');
const router = express.Router();
const Post = require('../models/Post');




//Routes HOME
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'Blog',
            descr: 'This is my first Blog'
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const lastPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage) || lastPage >= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            lastPage: hasNextPage ? lastPage : null,
            // currentRoute: '/'
        })
    } catch (error) {
        console.log(error);
    }

});


router.get('/about', (req, res) => {
    res.render('about', {
        // currentRoute: '/about'
    })
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        // currentRoute: '/contact'

    })
})

module.exports = router;


// GET / Post :id
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            descr: 'This is my first Blog',
            // currentRoute: `/post/${slug}`

        }

        res.render('post', { locals, data })
    } catch (error) {
        console.log(error);
    }

});

// POST / Post - searchTerm

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'Search',
            descr: 'This is my first Blog'
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '')
        const data = await Post.find({
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                {body: { $regex: new RegExp(searchNoSpecialChar, 'i')}}
            ]
        });
        res.render('search', { data, locals })
    } catch (error) {
        console.log(error);
    }
});






// router.get('', async (req, res) => {
//     const locals = {
//         title: data.title,
//         descr: 'This is my first Blog'
//     }
//     try {
//         const data = await Post.find();
//         res.render('index', { locals, data })
//     } catch (error) {
//         console.log(error);
//     }
// });


// function insertPostData() {
//     Post.insertMany([
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         },
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         },
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         },
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         },
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         },
//         {
//             title: 'Buiding a Blog',
//             body: 'Body Text'
//         }
//     ])
// }
// insertPostData();
