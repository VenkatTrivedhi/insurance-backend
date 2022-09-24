const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")

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

const getAllCommissionOfAgent = async (req, resp) => {
    const [isLoggedIn, adminPayload, user] = 
        await JwtPayload.loggedInUser(req,resp)
    if (!isLoggedIn) {
        return "unauthorized access"
    }
    const { limit, page } = req.query
    const { username } = req.params
    const [length, currentPage] = 
        await user.getAllCommissionOfAgent(username,limit, page)

    resp.status(200).send({ "length": length, "data": currentPage })
}

module.exports = {
    getAllCommission,getAllCommissionOfAgent
}