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



app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`)
});
