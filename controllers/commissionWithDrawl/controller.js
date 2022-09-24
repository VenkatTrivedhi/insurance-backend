const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")

const WithDrawCommission = async (req, resp) => {
    const [isLoggedIn, Payload, user] = 
        await JwtPayload.loggedInUser(req,resp)
    if (!isLoggedIn) {
        return "unauthorized access"
    }
    const { username } = req.params
    const {amount} = req.body
    const[withdraw, message] = 
        await user.withDrawCommission(amount)
    if(!isDone){
        resp.status(401).send({  "data":withdraw, "message": message })
    }
    resp.status(200).send({ "data":withdraw,"message":message })
}

const getAllCommissionWithDrawl = async (req, resp) => {
    const [isLoggedIn, adminPayload, user] = await JwtPayload.loggedInUser(req,resp)
    if (!isLoggedIn) {
        return "unauthorized access"
    }
    const isPermitted =  user.isUserRole(["Admin","Employee"])
    if(!isPermitted){
        resp.status(403).send({"message":"User not permitted"})
    }
    const { limit, page } = req.query
    const [length, currentPage] = await user.getAllCommissionWithDrawl(limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })

}

const getAllCommissionWithDrawlOfAgent = async (req, resp) => {
    const [isLoggedIn, adminPayload, user] = 
        await JwtPayload.loggedInUser(req,resp)
    if (!isLoggedIn) {
        return "unauthorized access"
    }
    const { limit, page } = req.query
    const { username } = req.params
    const [currentPage,msg] = 
        await user.getAllCommissionWithDrawlOfAgent(username,limit, page)

    resp.status(200).send({ "message": msg, "data": currentPage })
}

module.exports = {
    getAllCommissionWithDrawl,getAllCommissionWithDrawlOfAgent,WithDrawCommission
}