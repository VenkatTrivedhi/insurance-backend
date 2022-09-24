let mongoose = require('mongoose');
const UserModel = require("../models/userModel");
const CredentialModel = require("../models/crendentialModel");
const RoleModel = require("../models/roleModel");
const PlanTypeModel = require("../models/planTypeModel")
const PlanModel = require("../models/planModel")
const SchemeModel = require("../models/schemeModel")
const PremiumModel = require("../models/premiumModel")
const CommissionModel = require("../models/commissionModel")
const TransactionModel = require("../models/transactionModel");
const PolicyModel = require("../models/policyModel");
const CommissionWithDrawlModel = require('../models/commissionWithDrawlModel');

const url = "mongodb://localhost:27017/insurance"

class DatabaseMongoose {

    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(url)
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
    }

    static hadleError = (err) => {
        if (err.name === 'ValidationError') {
            let field = Object.keys(err.errors)[0]
            console.log(`${field} is required`)
            return [null, `${field} is required`];
        }

        if (err.code && err.code == 11000) {
            let field = Object.keys(err.keyValue)
            console.log(`${field} already exist,try new one`)
            return [null, `${field} already exist,try new one`]
        }

        else {
            return [null, `unknown error in database `]
        }
    }

    //credential
    async insertCredential(credential) {
        try {
            let newRecord = await CredentialModel.create(credential)
            return [newRecord, "credential created successfully"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async fetchCredential(username) {
        try {
            let record = await CredentialModel.findOne({ username: username })
            return [record, "credentils fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllCredential() {
        try {
            let record = await CredentialModel.find()
            return [record, "credentils fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchUsernames(username) {
        try {
            console.log(username)
            let record = await CredentialModel.find({}, { username: 1, _id: 0 })
            return [record, "user fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async replaceCredential(credential) {

        try {
            let record = await CredentialModel.updateOne({ username: credential.username }, credential)
            if (record.modifiedCount == 1) {
                return [true, "user updated successfully"]
            }

            if (record.modifiedCount == 0) {
                return [false, "user not updated"]
            }

            if (record.modifiedCount > 1) {
                return [true, "many users updated successfully"]
            }
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    //user
    async insertUser(user) {
        try {
            let newRecord = await UserModel.create(user)
            return [newRecord, "user created successfully"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchUser(credential) {
        try {
            let record = await UserModel.findOne({ credential: credential }).populate("credential role referedBy")
            return [record, "user fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async fetchAllUsers() {
        try {
            let record = await UserModel.find().populate("credential role referedBy")
            return [record, "user fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchUsersWitheRole(role) {

        try {
            let record = await UserModel.find({ role: role }).populate("credential role")
            return [record, `user with ${role} role fetched`]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async replaceUser(userObject) {
        // warning : not to be used to change credential

        try {
            let record = await UserModel.updateOne({ credential: userObject.credential }, userObject)
            if (record.modifiedCount == 1) {
                return [record, "user updated successfully"]
            }

            if (record.modifiedCount == 0) {
                return [record, "user updated successfully"]
            }

            if (record.modifiedCount > 1) {
                return [record, "many users updated successfully"]
            }
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAgent(_id) {
        try {
            let record = await UserModel.findOne({ _id: _id})
            return [record, "user fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    //plantype
    async insertPlanType(planeType) {
        try {
            let newRecord = await PlanTypeModel.create(planeType)
            return [newRecord, "planType created successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllPlaneTypes() {
        try {
            let newRecord = await PlanTypeModel.find()
            return [newRecord, "plan types fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async fetchPlanTypeById(id) {
        console.log("$$$$$$",id)

        try {
            let newRecord = await PlanTypeModel.findOne({ id: id })
            return [newRecord, "plan type fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async replacePlanType(id,type){
        
        try {
            let record = await PlanTypeModel.updateOne({ id:id}, type)
            if (record.modifiedCount == 1) {
                return [true, "replace updated successfully"]
            }

            if (record.modifiedCount == 0) {
                return [false, "replace not updated"]
            }

            if (record.modifiedCount > 1) {
                return [true, "replace updated successfully"]
            }
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        } 
    
    }

    //scheme
    async insertScheme(scheme) {
        try {
            let newRecord = await SchemeModel.create(scheme)
            return [newRecord, "scheme created successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllSchemes() {
        try {
            let newRecord = await SchemeModel.find().populate("type")
            return [newRecord, "shemes fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchSchemeById(id) {
        try {
            let newRecord = await SchemeModel.findOne({ id: id }).populate("type")
            let base64=newRecord.image.data.toString("base64");
            newRecord.image.data = base64
            return [newRecord, "schemes fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async replaceScheme(scheme) {

        try {
            let record = await SchemeModel.updateOne({ id:scheme.id}, scheme)
            if (record.modifiedCount == 1) {
                return [true, "scheme updated successfully"]
            }

            if (record.modifiedCount == 0) {
                return [false, "scheme not updated"]
            }

            if (record.modifiedCount > 1) {
                return [true, "scheme updated successfully"]
            }
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        } 
    }

    //plans
    async insertPlan(plan) {
        try {
            let newRecord = await PlanModel.create(plan)
            return [newRecord, "Plan created successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllPlans() {
        try {
            let newRecord = await PlanModel.find().populate("type scheme")
            return [newRecord, "plan types fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async fetchPlanById(id) {

        try {
            let newRecord = await PlanModel.findOne({ id: id }).populate("type scheme")
            return [newRecord, "plan  fetched successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }

    }

    async replacePlan(plan) {

        try {
            let record = await PlanModel.updateOne({ id:plan.id}, plan)
            if (record.modifiedCount == 1) {
                return [true, "plan updated successfully"]
            }

            if (record.modifiedCount == 0) {
                return [false, "plan not updated"]
            }

            if (record.modifiedCount > 1) {
                return [true, "plan users updated successfully"]
            }
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        } 
    }

    async pushTransaction(account, id) {
        try {
            let record = await AccountModel.updateOne({ account_no: account.account_no }, { $push: { "transactions": id } })
            return [record, "account updated successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }


    //Transaction
    async insertTransaction(transaction) {

        try {
            let newRecord = await TransactionModel.create(transaction)
            return [newRecord, "transaction added successfully"]
        }
        catch (err) {
            console.log(err)
            return DatabaseMongoose.hadleError(err)
        }
    }


    //roles
    async insertRole(roleObject) {
        try {
            let newRecord = await RoleModel.create(roleObject)
            return [newRecord, "role added successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }
    async fetchAllRoles() {
        try {
            let record = await RoleModel.find()
            return [record, "roles fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchRole(role) {
        try {
            let record = await RoleModel.findOne({ role: role })
            return [record, "roles fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async replaceRole(role) {
        try {
            let record = await RoleModel.updateOne({ id: role.id }, role)
            return [record, "role updated successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    //commssions
    async insertCommission(commssion){
        try {
            let newRecord = await CommissionModel.create(commssion)
            return [newRecord, "commssion added successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllCommission() {
        try {
            let record = await CommissionModel.find().populate(
                "policy agent customer scheme")
            return [record, "roles fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    //policy

    async insertPolicy(policy){
        try {
            let newRecord = await PolicyModel.create(policy)
            return [newRecord, "Policy added successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }
    
    async fetchAllPolicy() {
        try {
            let record = await PolicyModel.find().populate("premiums")
            return [record,"policies fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }
    async fetchAllPolicyForCustomer(customer) {
        try {
            let record = await PolicyModel.find({customer:customer}).populate("premiums")
            return [record,"policies fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    //premium
    async insertPremium(newPremium){
        try {
            let newRecord = await PremiumModel.create(newPremium)
            return [newRecord, "premium added successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchPremium(payId) {
        try {
            let record = await PremiumModel.find({id:payId}).populate()
            return [record,"premiums fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllPremiums() {
        try {
            let record = await PremiumModel.find()
            return [record,"premiums fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async replacePremium(premium) {
        try {
            let record = await PremiumModel.updateOne({ id: premium.id }, premium)
            return [record, "premium updated successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchPremiumWith_Id(_id){
        try {
            let record = await PremiumModel.findOne({_id:_id}).populate()
            return [record,"premiums fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }


    async fetchAllCommissionOfAgent(agent) {
        try {
            let record = await CommissionModel.find({agent:agent}).populate("policy agent customer scheme")
            return [record,"policies fetched"]
        }
        
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    //withdrwal
    async insertCommissionWithDrawl(newCommissionWithDrawl){
        try {
            let newRecord = await CommissionWithDrawlModel.create(newCommissionWithDrawl)
            return [newRecord, "commissionWithDraw added successfully"]
        }
        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllCommissionWithDrawl() {
        try {
            let record = await CommissionWithDrawlModel.find().populate("agent")
            return [record,"commisssion withdrwl fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }

    async fetchAllCommissionWithDrawlOfAgent(agent) {
        try {
            let record = await CommissionWithDrawlModel.find({agent:agent}).populate("agent")
            return [record,"withdrwl fetched"]
        }

        catch (err) {
            return DatabaseMongoose.hadleError(err)
        }
    }
    
}



module.exports = DatabaseMongoose 