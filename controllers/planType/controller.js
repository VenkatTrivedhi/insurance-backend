const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")


const createPlanType = async (req, resp) => {
    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if(!isAdmin){
        return
    }
    const missingInput = checkForRequiredInputs(req, ["title","status"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {title,status} = req.body
    const [planType,message] = await admin.createPlanType(title,status)
    if(!planType){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": planType, "message": message })
}

const getAllPlanTypes = async (req, resp) => {
    const [isLoggedIn, payload, user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedIn){
        return
    }
    const [list,message] = await user.getAllPlanTypes()
    if(!list){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": list, "message": message })
}
const deletePlanType = async (req, resp) => {
    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if(!isAdmin){
        return
    }

    const missingInput = checkForRequiredInputs(req, [],["id"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {id} = req.params
    const [isUpdated,message] = await admin.deletePlanType(id)
    if(!isUpdated){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": plan, "message": message })
}

const updatePlanType = async (req, resp) => {
    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if(!isAdmin){
        return
    }

    const missingInput = checkForRequiredInputs(req, ["title"],["id"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {title} = req.body
    const {id} = req.params
    const [isUpdated,message] = await admin.updatePlanType(id,title)
    if(!isUpdated){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": plan, "message": message })
}





module.exports = {
    createPlanType,getAllPlanTypes,updatePlanType,deletePlanType 
}
