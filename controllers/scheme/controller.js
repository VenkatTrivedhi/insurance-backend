const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")
const fs =require("fs")
const path =require("path")


const createScheme = async (req, resp,img ) => {

    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if(!isAdmin){
        return
    }
    const missingInput = checkForRequiredInputs(req, ["type","agentCommission","notes","status"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {type,agentCommission,notes,status} = req.body

    const [scheme,message] = await admin.createScheme(img,type,agentCommission,notes,status)
    if(!scheme){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": scheme, "message": message })
}

const getAllSchemes = async (req, resp) => {
    const [isLoggedIn, payload, user] = await JwtPayload.loggedInUser(req,resp)
    if(!isLoggedIn){
        return
    }
    const [list,message] = await user.getAllSchemes()
    if(!list){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": list, "message": message })
}
const deleteScheme = async (req, resp) => {
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
    const [isUpdated,message] = await admin.deleteScheme(id)
    if(!isUpdated){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": plan, "message": message })
}

const updateScheme = async (req, resp) => {
    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if(!isAdmin){
        return
    }

    const missingInput = checkForRequiredInputs(req, ["propertyToBeUpdated","value"],["id"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const {propertyToBeUpdated,value} = req.body
    const {id} = req.params
    const [isUpdated,message] = await admin.updateScheme(id,propertyToBeUpdated,value)
    if(!isUpdated){
            resp.status(401).send({ "message": message })
        }
    resp.status(200).send({ "data": plan, "message": message })
}







module.exports = {createScheme,getAllSchemes,updateScheme,deleteScheme} 