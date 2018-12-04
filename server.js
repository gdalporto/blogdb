// start server

const express = require ("express");
const app = express();
const morgan = require('morgan');
app.use(morgan("common"));


// bring in parsing function
const bodyParser = require ('body-parser');
const jsonParser = bodyParser;
app.use(express.json());


// modularize route appropriate requests there
const blogPostRouter = require('./blogPostRouter');
app.use('/blog-posts', blogPostRouter);

function runServer() {
    const port = process.env.PORT || 8080
    return new Promise((resolve,reject)=>{
        server = app
            .listen(port, function(){
                console.log(`Your app is listening on ${port}`);
                resolve(server);
            })
            .on("error",err =>{
                reject(err);
            });
    });
};

function closeServer() {
    return new Promise((resolve,reject)=>{
        console.log("Closing server");
        server.close(err=>{
            if(err){
                reject(err);
                return
            }
            resolve();
        });
    });
};



if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};



