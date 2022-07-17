const authorModel = require("../src/models/authorModel.js.js")
const jwt = require('jsonwebtoken')


//=====================================================CreatingAuthor==================================================

const createAuthor = async function(req,res){
    try{
        let data1 = req.body                                //Extracting Body
        if(Object.keys(data1).length == 0){                                       //Validating Request Body If Data is Present
            return res.status(400).send({status:false, msg:"Empty Body"})
        }
        const{fname,lname,title,email,password} = data1                             //Destructing data1 object
        let unique = await authorModel.findOne({email})   
        const titleValid = function(title){
            return ['Mr','Mrs','Miss'].indexOf(title) !== -1
        }    
         
        //Validation Start Form Here
        if(!fname || !isNaN(fname)){
            return res.status(400).send({status:false, msg:"Fname Should Not be empty and should not be a Number"})
        }
        else if(!lname || !isNaN(lname) ){
            return res.status(400).send({status:false, msg:"lname Should Not be empty and should not be a Number"})
        }
        else if(!title){
            return res.status(400).send({status:false, msg:"title Should Not be Empty"})
        }
        else if(!titleValid(title)){
            return res.status(400).send({status :false, msg:"Title should be:- 'Mr','Mrs','Miss'"})
        }
        else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return res.status(400).send({status:false, msg:"Invalid Email Syntax"})
        }else if(unique){
            return res.status(400).send({status:false,msg:"Email Id is already registered"})

        }
        else if(!password){
            return res.status(400).send({status:false, msg:"Password Should Not be Empty"})

        }
        //Creting Author Data 
       else{ 
        let finaldata = await authorModel.create(data1)
        return res.status(201).send({status:true,data:finaldata})}
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
}


//=======================================================logging In ======================================================
const loginAuthor = async (req,res)=>{
    try{
            let{email,password}=req.body
            //email and password empty or not
            if(!email || !password) {
              return res.status(400).send({status:false,msg:"email and password required"})
            }
            //email valid or not
            if(!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))){
              return res.status(400).send({status:false,msg:"Enter a valid Email"})
            }
            let authorDetail=await authorModel.findOne({email,password})
            if(authorDetail){
            
            let token=jwt.sign(                                             //generating Token
                {
                authorid:authorDetail._id.toString()
                },"Group 17/blog-project-1"
            )
            res.setHeader("x-api-key",token)  
            return res.status(200).send({status:true,msg:"Author Logged in Succesfully",data:token})
            }
            else{
                return res.status(400).send({status:false,msg:"email or password is invalid"})
            }
    }
  
    catch(err){
            return res.status(500).send({status:false,msg:err.message})
        }
  
      }
  

module.exports={createAuthor,loginAuthor}
