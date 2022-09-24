const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")
const { getAllUsernames } = require("../options/controller")


const createPolicy = async (req, resp) => {
    const [isLoggedIn, payload, user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedIn){
        return
    }
    const isPermited = user.isUserRole(["Customer"])

    if(!isPermited){
        resp.status(401).send({ "message": "user not permited" })
        return
    }

    const missingInput = checkForRequiredInputs(req, [
        "planId","totalDuration","totalInvestment","termDuration",
        "cardNumber","cvv","amount"],[])
    
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }

    const {
        planId,totalDuration,totalInvestment,termDuration,
        cardNumber,cvv,amount} = req.body

    
    const [Policy,message] = await user.createPolicy(
        planId,totalDuration,totalInvestment,termDuration,
        cardNumber,cvv,amount)
    if(!Policy){
            resp.status(401).send({"policy": Policy ,"message": message })
        }
    resp.status(200).send({ "policy": Policy ,"message": message })
}

const getAllPolicy = async (req, resp) => {
    const [isLoggedIn, payload, user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedIn){
        return
    }
    const isPermited = user.isUserRole(["Admin","Employee"])

    if(!isPermited){
        resp.status(401).send({ "message": "user not permited" })
        return
    }
    const [list,message] = await user.getAllPolicys()
    if(!list){
            resp.status(401).send({ "message": message })
            return
        }
    resp.status(200).send({ "data": list, "message": message })
}

const getAllPolicyOfCustomer = async (req, resp) => {
    const [isLoggedIn, payload, user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedIn){
        return
    }
    const missingInput = checkForRequiredInputs(req, [],["username"])
    
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {username} =  req.params
    const [list,message] = await user.getAllPolicysOfCustomer(username)
    if(!list){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": list, "message": message })
}

// const deletePolicy = async (req, resp) => {
//     const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
//     if(!isAdmin){
//         return
//     }

//     const missingInput = checkForRequiredInputs(req, [],["id"])
//     if (missingInput) {
//         resp.status(401).send({ "message": `${missingInput} is required`})
//         return `${missingInput} is required`
//     }
//     const {id} = req.params
//     console.log("@!!!!!!!!!!!!!@@@@@@@@@@@@@@@id,id",id)
//     const [isUpdated,message] = await admin.deletePolicy(id)
//     if(!isUpdated){
//             resp.status(401).send({ "message": message })
//         }
//     resp.status(200).send({ "message": message })
// }

// const updatePolicy = async (req, resp) => {
//     const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
//     if(!isAdmin){
//         return
//     }

//     const missingInput = checkForRequiredInputs(req, ["title"],["id"])
//     if (missingInput) {
//         resp.status(401).send({ "message": `${missingInput} is required`})
//         return `${missingInput} is required`
//     }
//     const {title} = req.body
//     const {id} = req.params
//     const [isUpdated,message] = await admin.updatePolicy(id,title)
//     if(!isUpdated){
//             resp.status(401).send({ "message": message })
//         }
//     resp.status(200).send({"message": message })
// }


module.exports = {
    createPolicy,getAllPolicy,getAllPolicyOfCustomer
}
