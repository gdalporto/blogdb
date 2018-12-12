"use strict";

const mongoose = require('mongoose');

mongoose.Promise=global.Promise;

// Schema to represent a blog post
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {
    firstName: String, 
    lastName: String
  },
  content: {type: String, required: true},
  created: {type:Date, default: Date.now}
});

// define "virtual" to represent first and last name concatentated together.

blogSchema.virtual("authorString").get(function(){
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.virtual("id").get(function(){
  return `${this._id}`.trim();
});

blogSchema.methods.serialize = function () {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString,
    created: this.created
  };
};



// Create a model "Blog" for the "blogs" collection 
// in the database. The ".model" makes a copy of the schema.
const BlogPosts = mongoose.model("Blog",blogSchema)

module.exports = {BlogPosts};