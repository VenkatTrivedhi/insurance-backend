const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")

const login= async (req,resp) => {
    const missingInput = checkForRequiredInputs(req,["username","password"])
    
    if(missingInput){
        resp.status(401).send({"message":`${missingInput} is required`})
        return
    }

    const username = req.body.username
    const password = req.body.password
    const [isValid,user,message] = await User.validateCredential(username,password)
    if(!isValid){
        resp.status(401).send({"message":message})
        return
    }
    const newPayload = new JwtPayload(user)
    const newToken =  newPayload.createtoken()
    resp.cookie("mytoken",newToken)
    resp.status(200).send({"data":newPayload})
}


const loggedInUser= async (req,resp) => {
    const  [isLoggedInUser,Payload,user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedInUser){
        return
    }
    resp.status(200).send({"data":Payload,"message":"user authenticated"})
}

module.exports = {login,loggedInUser}