const User = require("../../Views/user")
const JwtPayload = require("../../jwtPayLoad")
const checkForRequiredInputs = require("../../checkForRequiredInputs")
const Roles = require("../../role")
const registerCustomer =  async (req,resp)=>{
    
    const missingInput = checkForRequiredInputs(req, [
        "firstName","lastName","Dob","username", "password", "role","email",
        "address", "state", "city", "pincode", "mobileNumber",
        "documentType","documentFile","nominee", "nomineeRelation",
        "referedBy"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required`})
        return `${missingInput} is required`
    }
    const [newUser, message] = await User.registerCustomer(
        firstName, lastName,Dob,username, password, role ,email,
        address, state, city, pincode, mobileNumber,
        documentType,documentFile,nominee, nomineeRelation,reference,
        referedBy)
    if (!newUser) {
        resp.status(500).send({ "message": message })
        return
    }
    resp.status(201).send({ "data": newUser, "message": message })
    return
    
}

const createUser = async (req, resp) => {
    const [isLoggedIn, userPayload, user] = await JwtPayload.loggedInUser(req, resp)
    if (!isLoggedIn) {
        return
    }

    const {role} = req.body
    if (!role) {
        resp.status(401).send({ "message": `role is required` })
        return `role is required`
    }

    if (role == "Agent") {
        const missingInput = checkForRequiredInputs(req, [
            "firstName","lastName","Dob","userName", "password", "role","email",
            "address","mobileNumber","qualification","status"])
        if (missingInput) {
            resp.status(401).send({ "message": `${missingInput} is required`})
            return `${missingInput} is required`
        }
    }

    if (role == "Employee"||role=="Admin") {
        const missingInput = checkForRequiredInputs(req, [
            "firstName","userName", "password", "role","status"
            ])
        if (missingInput) {
            resp.status(401).send({ "message": `${missingInput} is required` })
            return `${missingInput} is required`
        }
    }

    const { 
        firstName,lastName, userName, password,Dob,email,address,
        state,city,pincode,mobileNumber,documentType,documentFile,status,nominee,
        nomineeRelation,reference,referedBy,qualification} = req.body
    const userRole = Roles.reCreateRole(user.role) 

    if (!userRole.hasPermissionToCreateRole(role)) {
        resp.status(403).send({ "message": "User not permitted" })
        return
    }
    const [newUser, message] = await user.createUser(
        firstName, lastName,Dob,userName, password, role ,email,
        address, state, city, pincode, mobileNumber,
        documentType,documentFile,status,nominee, nomineeRelation,
        referedBy,qualification)
    if (!newUser) {
        resp.status(500).send({ "message": message })
        return
    }
    resp.status(201).send({ "data": newUser, "message": message })
    return
}

const getAllUser = async (req, resp) => {
    const [isAdmin, adminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)
    if (!isAdmin) {
        return "unauthorized access"
    }

    const { limit, page } = req.query
    const [length, currentPage] = await admin.getAllUserObjects(limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })
}
  
const getAllAgents = async (req, resp) => {
    const [isLoggedIn, userPayload, user] = await JwtPayload.loggedInUser(req, resp)
    if (!isLoggedIn) {
        return
    }
    console.log(user)
    const userRole = Roles.reCreateRole(user.role) 

    if (!userRole.hasPermissionToGetRole("Agent")) {
        resp.status(403).send({ "message": "User not permitted" })
        return
    }
    const { limit, page } = req.query
    const [length, currentPage] = await user.getAllUsersWithRole("Agent",limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })
}

const getAllEmployees = async (req, resp) => {
    const [isLoggedIn, userPayload, user] = await JwtPayload.loggedInUser(req, resp)
    if (!isLoggedIn) {
        return
    }
    console.log(user)
    const userRole = Roles.reCreateRole(user.role) 

    if (!userRole.hasPermissionToGetRole("Employee")) {
        resp.status(403).send({ "message": "User not permitted" })
        return
    }
    const { limit, page } = req.query
    const [length, currentPage] = await user.getAllUsersWithRole("Employee",limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })
}

const changePassword= async (req,res) =>{
    const [isSelfUser, selfPayload, selfUser] = await JwtPayload.isValidSelfUser(req, res)
    if (!isSelfUser) {
        return "unauthorized access"
    }
 
    const {oldPassword,newPassword}= req.body

    const [isValid,user,message] = await User.validateCredential(selfPayload.username,oldPassword)
    if(!isValid){
        res.status(401).send("old password is wrong")
    }
    const isSuccess = await selfUser.changePassword(newPassword)
    if(!isSuccess){
        res.status(401).send("failed  to change password")
    }

    res.status(200).send("password changed successfully")
}

const getAllAdmins = async (req, resp) => {
    const [isLoggedIn, userPayload, user] = await JwtPayload.loggedInUser(req, resp)
    if (!isLoggedIn) {
        return
    }
    console.log(user)
    const userRole = Roles.reCreateRole(user.role) 

    if (!userRole.hasPermissionToGetRole("Employee")) {
        resp.status(403).send({ "message": "User not permitted" })
        return
    }
    const { limit, page } = req.query
    const [length, currentPage] = await user.getAllUsersWithRole("Admin",limit, page)
    resp.status(200).send({ "length": length, "data": currentPage })
}

const getUser = async (req, resp) => {
    const [isAdmin, AdminPayload, admin] = await JwtPayload.isValidAdmin(req, resp)

    const [selfUser, SelfPayload, messageOfSelfUser] = await JwtPayload.isValidSelfUser(req, resp)

    if (!isAdmin) {
        return "unauthorized access"
    }

    const [user, messgeOfUser] = await User.findUserInAll(req.params.username)
    if (!user) {
        resp.status(404).send({ "message": "user not exist" })
    }
    if (user.role == "Admin") {
        if (!selfUser) {
            resp.status(401).send({ "message": "admin cannot get other admin" })
        }
    }
    resp.status(200).send({ "data": user, "message": "user fetched" })
}

const updateUser = async (req, resp) => {
    const [iSAdminOrSelf, adminOrSelfPayload, user] = await JwtPayload.isValidAdminOrSelf(req, resp)
    if (!iSAdminOrSelf) {
        return "unauthorized access"
    }
    const { username, propertyTobeUpdated, value } = req.body
    const missingInput = checkForRequiredInputs(req, ["propertyTobeUpdated", "value"], ["username"])
    if (missingInput) {
        resp.status(401).send({ "message": `${missingInput} is required` })
        return `${missingInput} is required`
    }

    const [isUpdated, UpdatedUser] = await user.updateUser(propertyTobeUpdated, value)
    if (!isUpdated) {
        resp.status(500).send({ "message": "user not updated" })
        return "internal error"
    }
    resp.status(200).send({ "data": UpdatedUser, "message": "user updated successfully" })
    return "updated successfully"
}
const deleteUser = async (req, resp) => {

    const [isAdminOrSelf, adminOrSelfPayload, user] = await JwtPayload.isValidAdminOrSelf(req, resp)
    if (!isAdminOrSelf) {
        return "unauthorized access"
    }
    const isDeleted = user.deleteUser()

    if (!isDeleted) {
        resp.status(500).send({ "message": "not deleted" })
        return "no deleted"
    }
    resp.status(200).send({ "message": "user deleted successfully" })
    return "deleted successfully"
}

const getBalance = async (req, resp) => {
    const [isSelfUser, selfPayload, selfUser] = await JwtPayload.isValidSelfUser(req, resp)
    if (!isSelfUser) {
        return "unauthorized access"
    }
    const [balance, message] = await selfUser.getBalance()
    resp.status(200).send({ "data": balance, "message": message })
    return "balance fetched"
}

module.exports = {
    registerCustomer,createUser, getAllUser,
    getUser, updateUser, deleteUser, getBalance,getAllAgents ,getAllEmployees,getAllAdmins,
    changePassword

}