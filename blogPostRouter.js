//bring in express

const express = require('express');
const {BlogPosts}=require('./models');
const router=express.Router();

// put some data in there

BlogPosts.create("First Blog Post", "This is the CMS' first blog post", "Gabe", "11/01/2018");
BlogPosts.create("Second Blog Post", "This is the CMS' second blog post", "Gabe", "11/01/2018");

router.get('/',(req,res)=>{
    const item = BlogPosts.get(req.params.id);
    res.status(201).json(item);
});


router.delete('/:id',(req,res)=>{
    const item = BlogPosts.delete(req.params.id);
    console.log(`Deleted item id ${req.params.id}`);
    res.status(201).send(item);
});


router.post('/',(req,res)=>{
    const reqFields = ["title", "content", "author"];
    for(let i=0;i<reqFields.length;i++){
        if(!(reqFields[i] in req.body)) {
            const errMsg= `Error, ${reqFields[i]} is required.`;
            console.error(errMsg);
            return res.status(400).send(errMsg);
        };
    };
    const item = BlogPosts.create({
        title: req.body.title,
        content: req.body.content, 
        author: req.body.author, 
        pusblishDate: req.body.publishDate || null });
    res.status(201).json(item);
});


router.put('/:id',(req,res)=>{
    const reqFields = ["id","title","content","author","publishDate"];
    // check that id, name and ingredients variables present
    for(let i=0; i<reqFields.length; i++){
      if(!(reqFields[i] in req.body)){
        const message = `Error, ${varList[i]} parameter not found in body`;
        console.error(message);
        return res.status(400).send(message);
      };
    };
  
  
    if (!(req.params.id === req.body.id)){
        const message = `Error id in params list ${req.params.id} must equal id in body ${req.body.id}`;
        console.error(message);
        return res.status(400).send(message);
    }
  
    console.log(`updateing blog post list for id ${req.body.id}`);
    const item=BlogPosts.update(
//        {
        req.body
//        id: req.body.id,
//        title: req.body.title,
//        content: req.body.content,
//        author: req.body.author,
//        publishDate: req.body.publishDate
//    }
);
    return res.status(204).json(item);  
  });

module.exports = router;



