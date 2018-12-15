"use strict";

const express = require ("express");
const app = express();

const morgan = require('morgan');
app.use(morgan("common"));

// bring in database and start mongoose
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// import PORT, DATABASE_URL and BlogPosts.
const {PORT, DATABASE_URL} = require('./config');
const {BlogPosts, Authors} = require('./models');

// bring in parsing function
app.use(express.json());


// Handle GET requests that do not specify ID
app.get("/blog-posts", (req,res)=>{
    console.log("GET request with no ID parameter");
    BlogPosts.find()
        .limit(10)
        .then(blogposts => {
            res.json({
                blogposts: blogposts.map(blogpost => blogpost.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.get("/authors", (req,res)=>{
    console.log("GET request with no ID parameter");
    Authors.find()
        .limit(10)
        .then(authors => {
            res.json(authors.map(author => {
              return {
                id: author._id,
                name: `${author.firstName} ${author.lastName}`,
                userName: author.userName
              };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});


app.get("/blog-posts/:id", (req,res)=>{
    BlogPosts
 //       .find({_id:`ObjectId("${req.params.id}")`})
        .findById(req.params.id)
        .then(blogpost => {
            console.log("Blogpost content", blogpost);
            res.json(blogpost.serializeComments());
        
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.post("/blog-posts", (req, res)=>{
    const requiredFields = ["title", "author_id", "content"];
    console.log(req.body.author_id);
    for (let i=0; i<requiredFields.length; i++){
        if(!(requiredFields[i] in req.body)){
            const message = `Missing \`${requiredFields[i]}\` in request body`;
            console.error(message);
            return res.status(400).json({message: message});
        }
        
        console.log(i);
    }
    Authors.findOne({"_id":req.body.author_id})
        .then(post => {
            if((post == null)) {
                return res.status(400).json({message:"Error, author ID not found"});
            };
            return BlogPosts
                .create({
                    title: req.body.title,
                    author: req.body.author_id,
                    content: req.body.content 
                })
                .then(blogpost => res.status(201).json(blogpost.serialize()))
        })
        .catch(err=>{
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        })
});

app.post("/authors", (req,res) => {
    const requiredFields = ["firstName", "lastName", "userName"];
    // validate has fields
    for (let i=0; i<requiredFields.length; i++){
        if(!(requiredFields[i] in req.body)) {
            return res.status(400).json({message: `Error, ${requiredFields[i]} is missing`})
        }
        console.log (i);
    }
    // make sure there's not a duplicate
    Authors
        .findOne({"userName":req.body.userName})
        .then((userNameCheck) => {
            if(!(userNameCheck == null)) {
                const message = `Error, username ${userNameCheck.userName} already exists`
                return res.status(400).json({message:message});
            }
            else return Authors
                .create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    userName: req.body.userName
                })
                .then((newAuthor) => {
                    res.status(201).json({
                        _id: author.id,
                        name: `${newAuthor.firstName} ${newAuthor.lastName}`,
                        userName: author.userName                    });
                })
        })
        .catch(err => {
            const message = `We Caught a Server Error`;
            return res.status(500).json({message:message});
        })
})

app.put("/blog-posts/:id",(req,res)=>{
    // check that the id in params and body are the same 
    // and that it exists in the db
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Error: Parameter id:${req.params.id} must equal body id: ${req.body.id}`
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ["title","content"];
    updateableFields.forEach(field => {
        if(field in req.body){
            toUpdate[field] = req.body[field];
        }
    });
    console.log(toUpdate);
    return BlogPosts
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .then(()=>{
            return BlogPosts.findById(req.params.id);
        })
        .then((newPost) => {
            console.log("Success", newPost.serialize());
            res.status(201).json(newPost.serialize());
        })
        .catch(err => res.status(500).json({message: "Internal server error."}));
});

app.put("/authors/:id", (req,res) =>{
    console.log("Step 1: check IDs match");
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Error: Parameter id:${req.params.id} must equal body id: ${req.body.id}`
        console.error(message);
        return res.status(400).json({message: message});
    }

    console.log("Step 2: fields to update");
    const toUpdate = {};
    const updateableFields = ["firstName","lastName","userName"];
    updateableFields.forEach(field =>{
        if(field in req.body) {
            toUpdate[field] = req.body[field];
            console.log(toUpdate[field]);
        }
    });
    console.log(toUpdate);
    console.log("Step 3: update record");
    Authors
        .findOne({"userName":req.body.userName})
        .then(usernameCheck => {
            if(!(usernameCheck==null)) {
                const message = `Error, username ${userNameCheck.userName} already exists`
                return res.status(400).json({message:message});
            }
            else return Authors
            .findByIdAndUpdate(req.params.id,{$set: toUpdate})
            .then(()=>{
                return Authors.findById(req.params.id);
            })
            .then((author) =>{
                console.log ("Success, author record updated");
                res.status(201).json({author:author});
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Failed to Update"});
        });
});

app.delete("/blog-posts/:id",(req,res) => {
    BlogPosts
        .findByIdAndRemove(req.params.id)
        .then(blogpost => res.status(202).json({message:"success. record deleted"}))
        .catch(err => res.status(500).json({message:"Internal server error"}));
});

app.delete("/authors/:id", (req,res)=>{
    Authors
        .findByIdAndRemove(req.params.id)
        // delete associated blog posts
        .then(()=>{
            BlogPosts
                .findAndRemove({"author": req.params.id})
                .then(()=>{
                    console.log("Blog Posts With Removed Author Deleted");
                    res.status(204).json({message:"successfully deleted record"});
                })
        })
        .catch(err => res.status(500).json({message:"Internal server error"}));
})


// catch - all endpoint
app.use("*", function(req,res){
    res.status(404).json({message:"Not Found"});
});


// Create server object to be opened / closed.
let server;

// connect to our database then start the server

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app
                .listen(port,()=>{
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err);
                });
        })
    });
};

// use this function to close server and return a promise. 
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve,reject)=>{
            console.log("Closing server");
            server.close(err => {
                if(err){
                    return reject(err);
                }
                resolve();
            });
        });
    });
};
    


if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};



