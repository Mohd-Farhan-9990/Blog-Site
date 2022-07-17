const blogModel = require("../models/blogModel")
const { default: mongoose, isValidObjectId } = require("mongoose")
const moment = require('moment');
const jwt = require('jsonwebtoken')



//======================================================creatingBlog====================================================

    const createBlog = async function(req,res){
       try{
            let res1  = req.body
            if(Object.keys(res1).length==0){
                return   res.status(400).send({status:false,msg:"Empty Body"})
            }
            let{title,body,tags,category,subcategory} = res1
            let id = req.body.authorId                                                          //Getting the authorId from Body
            let token = req.headers["x-api-key"];
            let decodedToken = jwt.verify(token, 'Group 17/blog-project-1')
            let authorLoggedIn = decodedToken.authorid
           
                if(!id){                                                                         //Checking If Id is there or not
                    return res.status(400).send({status:false,msg:"AuthorId should Not be Empty"})

                }else  if(id!== authorLoggedIn){
                    res.status(400).send({status:false,msg:"AuthorId not matched with loggedIn author"})
                }                                                             
                   else if(!title || !isNaN(title)){
                        return res.status(400).send({status:false,msg:"Title Should Not Be empty or should not be a Number"})
                    }
                    else if(!body || !isNaN(body)){
                        return res.status(400).send({status:false,msg:"Body Should Not Be Empty or should not be a number"})
                    }
                    else if(!tags){
                        return res.status(400).send({status:false,msg:"Tags Should Not Be Empty"})
                    }else if(!category || !isNaN(category)){
                        return res.status(400).send({status:false,msg:"Bcategory Should Not Be Empty"})
                    }else if(!subcategory){
                        return res.status(400).send({status:false,msg:"subCategory Should Not Be Empty"})
                    }else{
                            let finaldata = await blogModel.create(res1)                    //Creating Blog
                    return res.status(201).send({data:finaldata})
                    }
                
            
            
       }
       catch(err){
            return res.status(500).send({status:false,msg:err.message})
       }
    }

//====================================================GET BLOGS ======================================================
 
const getBlog =  async function(req,res){

    try{
                 let quer = req.query                                                           //getting the data from querry
                 let filterQuerry = {isDeleted:false,deletedAt:null,isPublished:true}

                 if(!quer){
                    return res.status(400).send({status:false,msg:"Provide Some data in querry"})
                 }
                 const{authorId,category,tags,subcategory} = quer                              //destructing data
                 let token = req.headers["x-api-key"];
                let decodedToken = jwt.verify(token, 'Group 17/blog-project-1')
                let authorLoggedIn = decodedToken.authorid
                if(!authorId){
                    return res.status(400).send({status:false,msg:"authorId Should Not Be Empty"})
                }else if(authorId!==authorLoggedIn){
                    return res.status(403).send({status:false,msg:"authorId Should Match With LoggedIn Author's Id"})

                }
                    if(isValidObjectId(authorId)){
                        filterQuerry['authorId'] =authorId
                    }else{
                        return res.status(400).send({status:false,msg:"Invalid authorId"})

                    }
                    if(category){
                        filterQuerry['category'] = category
                    }else{
                        return res.status(400).send({status:false,msg:"Category Should Not Be Empty"})

                    }

                    if(tags){
                        const tagsArr =tags.trim().split(",").map(tag=> tag.trim())
                        filterQuerry['tags'] ={$all:tagsArr}
                    }else{
                        return res.status(400).send({status:false,msg:"Tags Should Not Be Empty"})

                    }
                    if(subcategory){
                        const subcatArr = subcategory.trim().split(",").map(subcat => subcat.trim())
                        filterQuerry['subcategory'] = {$all:subcatArr}
                    }else{
                        return res.status(400).send({status:false,msg:"Subcategory Should Not Be Empty"})

                    }
                        //Fetching Data
                    const getD = await blogModel.find(filterQuerry).populate('authorId')
                    
                    
                    if(getD.length>0){
                        return res.status(200).send({status:true,msg:"Blog Found",data:getD})

                    }
                    else{
                        return res.status(200).send({status:false,msg:"No Blog Found With These Querry"})

                    }
               
         }
        catch(err){
            return res.status(500).send({status:false,msg:err.message})
        }    


    
}

//====================================================Updating Blogs==================================================

    const updateBlog = async function(req,res){
        try{
                let id = req.params.blogId                                      //getting the id
                let data2 = req.body                                                //Storing body data in data2 object
                const{title,body,tags,subCategory,isDeleted,isPublished} = data2              //destructing the data2
                let date = Date.now()                                                //getting timestamps value 
                let date1 = moment(date).format('YYYY-MM-DD, h:mm:ss')          //formatting timestamps value in correct form
                    
                    let result = await blogModel.findById(id)    
                    if(!result){
                        res.status(400).send({status:false,msg:"data not found with this id"})
                    } else{
                    let updatedData = await blogModel.findOneAndUpdate(         
                            {_id:id,isDeleted:false},                                                       //Condition in FindAnd Update           
                            {$set:{title:title,body:body,publishedAt:date1,isPublished:isPublished,isDeleted:isDeleted},$push:{tags:tags,subCategory:subCategory}},         //Updation
                            {new: true}                                                                                                  //returning new updated value
                    ) 
               
                        if(Object.keys(updatedData).length>0){                                                            //Checking if data is upadated or not for isDeleted False
                                    return res.status(201).send({data:updatedData})
                        }else{
                            return res.status(200).send({status:false,msg:"No Updation Done"})
                        }
                        
                    
                    }
        }
        catch(err)
        {
           return res.status(500).send(err.message)
        }
    }




    //==========================================DELETE BY BLOG-ID AS PARAMS===========================================

const deleteBlogsById = async function (req, res) {
    try {
            let blogId = req.params.blogId;
            let result = await blogModel.findOne({_id: blogId,isDeleted: false});
            if (!result) return res.status(404).send({status: false,msg: "Blog is already deleted" })
            else{
                let updated = await blogModel.findByIdAndUpdate(
                {  _id: blogId,isDeleted: false},
                {isDeleted: true,deletedAt: Date()},
                {new: true})
        
                return res.status(200).send({status: true,data:updated });
            }
            
       
    } catch (error) {
              res.status(500).send({status: false,msg:error.message});
    }

};



//===============================================DELETE BY QUERY=======================================================


const deleteBlogsByQuery = async function (req, res) {
    try {
          let quer = req.query
          const{category,authorId,tags,subcategory}= quer
          let deleted = await blogModel.find({authorId:authorId,isDeleted:true})
            if(deleted.length>0){
                 res.status(200).send({status:true,msg:"Blog is Already Deleted"})
                }
                else{
                        let result = await blogModel.updateMany(
                        {category:category, authorId:authorId, tags:[tags], subcategory:[subcategory]},
                            {$set:{isDeleted:true,deletedAt:Date()}},
                            {new:true})
                    
                    
                    return res.status(200).send({status:true,data:result})
                 }
        }
       
        catch (error) {
        res.status(500).send({status: false, msg: error.message});
    }
};







 module.exports={createBlog,updateBlog,getBlog,deleteBlogsById,deleteBlogsByQuery}
   

