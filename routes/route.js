const express = require('express');
const router = express.Router();
const blogController = require("../controllers/blogController.js")          //importing blog Controller
const authorController = require("../controllers/authorController")         //importing author Controller
const mid = require("../middleware/auth")


//== Author's Apis
router.post("/authors",authorController.createAuthor)           // Api for author's data Creation
router.post("/login",authorController.loginAuthor) 

//Blog's Apis
router.post("/blogs",mid.authenticate,blogController.createBlog)                 //Api for blogs data creation
router.get("/blogs",mid.authenticate,blogController.getBlog)                     
router.put("/blogs/:blogId",mid.authenticate,mid.authorisation,blogController.updateBlog)
router.delete("/blogs/:blogId",mid.authenticate,mid.authorisation,blogController.deleteBlogsById)
router.delete("/blogs",mid.authenticate,blogController.deleteBlogsByQuery)       

router.all("/****",function(req,res){
    res.status(404).send({status:false, msg:"Make sure Endpoint Is Correct Or Not"})
} )
module.exports = router