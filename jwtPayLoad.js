const Jwt = require("jsonwebtoken")
const User = require("./views/user")

class JwtPayload{
    static secret = "123abc"

    constructor(user){
        this.username = user.credential.username
        this.role = user.role.role
        this.fullname = user.fullname
        this.isActive = user.isActive
    }

    createtoken(){
        return Jwt.sign(JSON.stringify(this),JwtPayload.secret)
    }
    
    static verifyCookies(cookie){        
        const Payload = Jwt.verify(cookie,JwtPayload.secret)
        return Payload
    }


    static async isValidAdmin(req,resp){
        const myToken = req.cookies["mytoken"]
        if(!myToken){
            resp.status(401).send({"message":"login required"})
            return [false,null,null]
        }
        const newPayload = JwtPayload.verifyCookies(myToken)
        if(newPayload.role!="Admin"){
            resp.status(403).send({"message":"Admin only have access"})
            return [false,null,null]
        }
        const [user, message] = await User.findUser(newPayload.username) 
        if(!user){
            resp.clearCookie("mytoken")
            resp.status(401).send({"message":"authenticated user is deleted"})
            return [false,null,null]
        }
        return [true,newPayload,user]
    }

    static async isValidSelfUser(req,resp){
        const myToken = req.cookies["mytoken"]
        
        if(!myToken){
            resp.status(401).send({"message":"login required"})
            return [false,null,null]
        }

        const newPayload = JwtPayload.verifyCookies(myToken)

        if(newPayload.username!=req.params["username"]){
            resp.status(403).send({"message":"User not permited"})
            return [false,null,null]
        }
        
        const [user, message] = await User.findUser(req.params["username"])

        if(!user){
            resp.status(403).send({"message":"authenticated is deleted"})
            return [false,null,null]
        }
        return [true,newPayload,user]
    }

    static async isValidAdminOrSelf(req,resp){
        const myToken = req.cookies["mytoken"]
        if(!myToken){
            resp.status(401).send({"message":"login required"})
            return [false,null,null]
        }
        const newPayload = JwtPayload.verifyCookies(myToken)
        const username = req.params.username

        let isAdminOrSelf = newPayload.role=="Admin"|| newPayload.username==username
        if(!isAdminOrSelf){
            resp.status(403).send({"message":"User not permitted"})
            return [false,null,null]
        }
        const [autheenticatedUser, messageOfauthenticated] = await User.findUser(newPayload.username)
        if(!autheenticatedUser){
            resp.status(403).send({"message":"authenticated user is deleted"})
            return [false,null,null]
        }
        const [user, message] = await User.findUser(username)
        if(!user){
            resp.status(403).send({"message":"User does not exist"})
            return [false,null,null]
        }
        return [true,newPayload,user]
    }

    static async isValidUser(req,resp){
        const myToken = req.cookies["mytoken"]
        if(!myToken){
            resp.status(401).send({"message":"login required"})
            return [false,null,null]
        }
        const newPayload = JwtPayload.verifyCookies(myToken)
        const [user, message] = await User.findUser(newPayload.username)
        if(!user){
            resp.status(403).send({"message":"authenticated user is deleted"})
            return [false,null,null]
        }
        if(user.isActive!=true){
            resp.status(403).send({"message":"authenticated user deleted"})
            return [false,null,null]
        }
        return [true,newPayload,user]
    }
    static async loggedInUser(req,resp){
        const myToken = req.cookies["mytoken"]
        if(!myToken){
            resp.status(200).send({"data":null,"message":"login required"})
            return [false,null,null]
        }
        const newPayload = JwtPayload.verifyCookies(myToken)
        const [user, message] = await User.findUser(newPayload.username)
        if(!user){
            resp.status(200).send({"data":null,"message":"authenticated is not valid anymore"})
            return [false,null,null]
        }
        if(user.isActive!=true){
            resp.status(200).send({"data":null,"message":"authenticated  user is not active"})
            return [false,null,null]
        }
        return [true,newPayload,user]
    }

    

}

module.exports = JwtPayload