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
const {BlogPosts} = require('./models');

const uuid = require('uuid');

// bring in parsing function
app.use(express.json());


// Handle GET requests that do not specify ID
app.get("/blog-posts", (req,res)=>{
    console.log("no ID parameter", req.params.id);
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

app.get("/blog-posts/:id", (req,res)=>{
    BlogPosts
 //       .find({_id:`ObjectId("${req.params.id}")`})
        .findById(req.params.id)
        .then(blogposts => {
            res.json(blogposts.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
});

app.post("/blog-posts", (req, res)=>{
    const requiredFields = ["title", "author", "content"];
    for (let i=0; i<requiredFields.length; i++){
        if(!(requiredFields[i] in req.body)){
            const message = `Missing \`${requiredFields[i]}\` in request body`;
            console.error(message);
            return res.status(400).send(message);

        };
        console.log(i);
    };
    BlogPosts.create({
//        id: uuid.v4(),
        title: req.body.title,
        author: req.body.author,
        content: req.body.content 
    })
    .then(blogpost => res.status(201).json(blogpost.serialize()))
    .catch(err=>{
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    })
})

app.put("/blog-posts/:id",(req,res)=>{
    // check that the id in params and body are the same 
    // and that it exists in the db
    if(!(req.params.id===req.body.id)) {
        const message = `Error: Parameter id:${req.params.id} must equal body id: ${req.body.id}`
        console.error(message);
        return res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ["title","author","content"];
    updateableFields.forEach(field => {
        if(field in req.body){
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts.findByIdAndUpdate({id: req.params.id}, {$set: toUpdate})
        .then(restaurant => res.status(204).end())
        .catch(err => res.status(500).json({message: "Internal server error."}));
});

app.delete("/blog-posts/:id",(req,res) => {
    BlogPosts.findByIdAndRemove({id:req.params.id})
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({message:"Internal server error"}))
});

// catch - all endpoint
app.use("*", function(req,res){
    res.status(400).json({message:"Not Found"});
})


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



