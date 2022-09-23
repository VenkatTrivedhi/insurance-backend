const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")


const createCommission = async (req, resp) => {
    const [isLoggedIn, userPayload, user] = await JwtPayload.loggedInUser(req, resp)
    if (!isLoggedIn) {
        return
    }
    
    const commission = await user.addCommission(req)
    resp.status(201).send({ "data":commission})
}

const getAllCommission = async (req, resp) => {
    const [isLoggedIn, adminPayload, user] = await JwtPayload.loggedInUser(req,resp)
    if (!isLoggedIn) {
        return "unauthorized access"
    }
    const isPermitted =  user.isUserRole(["Admin","Employee"])
    if(!isPermitted){
        resp.status(403).send({"message":"User not permitted"})
    }
    const { limit, page } = req.query
    const [length, currentPage] = await user.getAllCommission(limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })
}


module.exports = {
    createCommission,getAllCommission
}