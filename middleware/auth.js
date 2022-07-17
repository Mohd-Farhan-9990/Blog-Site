const jwt = require('jsonwebtoken')
const authorModel = require("../models/authorModel")
const authorController = require("../controllers/authorController");
const blogModel = require('../models/blogModel');
const { isValidObjectId } = require('mongoose');


const authenticate = async function(req, res, next) {
  try{  
    
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["x-api-key"];
    
        //If no token is present in the request header return error
       
        if(!token){
                return res.status(400).send({status: false, msg: "token must be present in the request header"})
            }
            let decodedToken = jwt.verify(token, 'Group 17/blog-project-1')

        if(!decodedToken) {
            return res.status(401).send({status: false, msg:"token is not valid"})
        }

        return  next()
    }
    catch(err){
        res.status(500).send({status:false,msg:err.message})
    }
}

const authorisation = async function(req,res,next){
    try{
        let header= req.headers
        let token = header["x-api-key"]||header['X-API-KEY'];
        let decodedToken = jwt.verify(token, 'Group 17/blog-project-1')

        let blogtobeModified = req.params.blogId
        
        let res1 =await blogModel.findById({_id:blogtobeModified})
        if(!res1){res.status(400).send({status:false,msg:"No data with this id"})}
        else{
                    let id = res1.authorId.toString()
                    let authorLoggedIn = decodedToken.authorid
                            if(id !== authorLoggedIn) {
                                    return res.status(403).send({status: false, msg: 'Author logged is not allowed to modify the blog'})
                                }       

                
                
                return next()
                }     
    }
    
    catch(err){
            res.status(500).send({status:false,msg:err.message})
    }
}


module.exports={authenticate,authorisation}
