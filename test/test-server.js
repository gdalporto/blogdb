const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

describe ("Test Blog Post Functions", function(){

    before(function(){
        return runServer();
    })

    after(function(){
        return closeServer();
    })

    it("should list posts on GET", function(){
        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res){
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                expect(res.body.length).to.be.all.least(1);
                const expectedFields = ["title", "content", "author"];
                res.body.forEach(function(item){
                    expect(item).to.include.keys(expectedFields);
                    expect(item).to.be.a("object");
                })
            });
    });
    it("should delete posts",function(){
        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res) {
                return chai.request(app).delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res){
                expect(res).to.have.status(204);
            })
    });
    it("should post new blogs", function(){
        const newPost = {
            title: "Narwals", 
            content: "are strange", 
            author: "Gabe"
        }

        return chai
            .request(app)
            .post("/blog-posts")
            .send(newPost)
            .then(function(res){
                console.log(res.body, "Hello");
                expect(res).to.be.json;
                expect(res).to.have.status(201);
                expect(res.body).to.include.keys(newPost);
            });
    })
    it("should update existing blogs", function(){
        const updateData = {
            title: "Blah",
            content: "boring stuff",
            author: "Gabe",
            publishDate: 11/01/2001
        };
        return chai
            .request(app)
            .get("/blog-posts")
            .then(function(res){
                console.log(res.body);
                updateData.id=res.body[0].id;
                console.log("id",updateData.id);
                return chai
                .request(app)
                .put(`/blog-posts/${updateData.id}`)
                .send(updateData)
            })
            .then(function(res){
                console.log(res.body, "Hello");
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.include.keys("title", "content", "author");
                expect(res).to.be.a("object");
                expect(res.body).to.deep.equal(updateData);
            })
    });

});