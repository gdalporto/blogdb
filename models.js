"use strict";

const mongoose = require('mongoose');

mongoose.Promise=global.Promise;

// Schema to represent a blog post
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  content: {type: String, required: true},
  created: {type:Date, default: Date.now},
  comments: [{content:String}]
});

const authorSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userName: {type: String, unique: true}
})


blogSchema.pre('findOne', function(next){
  this.populate('author');
  next();
});

blogSchema.pre('find', function(next){
  this.populate('author');
  next();
});



// define "virtual" to represent first and last name concatentated together.

blogSchema.virtual("authorString").get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.virtual("id").get(function(){
  return `${this._id}`.trim();
});

authorSchema.virtual("authorString").get(function(){
  return `${this.firstName} ${this.lastName}`.trim();
});

blogSchema.methods.serialize = function () {
  return {
    title: this.title,
    content: this.content,
    author: this.authorString,
    created: this.created
  };
};

authorSchema.methods.serialize = function () {
  return {
    _id: this._id,
    name: authorString,
    userName: this.userName
  };
};


blogSchema.methods.serializeComments = function () {
  return {
    title: this.title,
    content: this.content,
    author: this.authorString,
    created: this.created,
    comments: this.comments,
  };
};


// Create a model "Blog" for the "blogs" collection 
// in the database. The ".model" makes a copy of the schema.
const BlogPosts = mongoose.model("Blog",blogSchema);
const Authors = mongoose.model("Author", authorSchema);

module.exports = {BlogPosts, Authors};