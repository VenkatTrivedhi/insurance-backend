const uuid = require("uuid")
const Credential = require("./credential")
const Document = require("./document")
const State = require("./state")
const City = require("./city")
const DatabaseMongoose = require('../repository/database')
const Transaction = require("./transaction")
const paginater = require("../paginater")
const PlanType = require("./planType")
const Plan = require("./plan")
const Policy = require("./policy")
const Scheme = require("./scheme")

class User {

    constructor(
        id, firstName,lastName,fullName,Dob, credential, role, isActive, email,
        address, state, city, pincode, mobileNumber,
        documents, status,nominee, nomineeRelation,referenceId,
        referedBy,customers,qualification) {

            this.id = id
            this.firstName = firstName
            this.lastName = lastName
            this.fullName = fullName
            this.Dob = Dob
            this.credential = credential //required
            this.role = role 
            this.isActive = isActive 
            this.email = email 
            this.address = address 
            this.state = state
            this.city = city
            this.pincode = pincode
            this.mobileNumber = mobileNumber
            this.nominee = nominee
            this.nomineeRelation = nomineeRelation
            this.documents = documents
            this.status = status
            this.referenceId = referenceId //field of agent
            this.referedBy = referedBy// field of customer
            this.customers =  customers
            this.qualification = qualification
        }

    static db = new DatabaseMongoose()


    static async createSuperUser(
        firstname, lastname,username,password,email) {
                
            const [superuserRecord, messageOfFetch] = await User.db.fetchCredential("admin")
            if (superuserRecord==[]) {
                console.log("wrongg")
                return [null, "cannot duplicate superuser"]
            }
            const id = uuid.v4()
            const fullName =  User.getFullName(firstname,lastname)
            const [newCredentialObject, messageOfCredentialCreate] =
                await Credential.createCredential(username, password)
            const [newCredentialRecord, messageOfFetchCredential] = await User.db.fetchCredential(username)

            
            const [AdminRecord , messageOfAdmin] = await User.db.fetchRole("Admin")
            console.log("admin record  "+ AdminRecord)
            const newUser = new User(id, firstname , lastname,fullName,undefined,
                newCredentialRecord._id, AdminRecord._id, true, email,
                undefined, undefined, undefined, undefined, 7032268259,
                undefined, undefined,undefined, undefined,undefined,
                undefined,undefined)
            const [newUserRecord, messageOfUser] = await User.db.insertUser(newUser)
            return [newUser, "new user created success"]
    }

    async createUser(
        firstname, lastname,Dob,username, password, role ,email,
        address, state, city, pincode, mobileNumber,
        documentType,documentFile,status,nominee, nomineeRelation,
        referedBy,qualification) {

            const [fetchedCredentialRecord, msgOfCredentialFetch] =
            await User.db.fetchCredential(username)
                       
            if (!fetchedCredentialRecord) {
                const id = uuid.v4()
                const fullName = User.getFullName(firstname,lastname)
                const [newCredentialObject, messageOfCreatingCredential] =
                    await Credential.createCredential(username, password)
                const [newCredentialRecord, messageOfnewCredentialRecord] =
                    await User.db.fetchCredential(username)
                if (!newCredentialRecord) {
                    return [newCredentialRecord, messageOfCreatingCredential]
                }

                const [roleRecord,messageOfRole] = await User.db.fetchRole(role)

                let agentId
                if(referedBy){
                    agentId = await User.findAgentId(referedBy)
                }
                let referenceID
                if(role=="Agent"){
                    referenceID =  uuid.v4()//create reference
                }
                const newUserObject = new User(
                    id,
                    firstname,
                    lastname,
                    fullName, 
                    Dob,
                    newCredentialRecord._id, 
                    roleRecord._id , 
                    true ,
                    email,
                    address, 
                    state, 
                    city,
                    pincode,
                    mobileNumber,
                    [],
                    status,
                    nominee, 
                    nomineeRelation,referenceID,
                    agentId,[],qualification)
                
                const [newUserRecord, messageOfNewUserRecord] =
                    await User.db.insertUser(newUserObject)

                if (!newUserRecord) {
                    return [newUserRecord, messageOfNewUserRecord]
                }
                const [fetcehdUserRecord, messageOfFetchedUserRecord] =
                    await User.db.fetchUser(newCredentialRecord)
                const newUser = User.reCreateUserObject(fetcehdUserRecord)
                //await newUser.addDocument(documentType,documentFile)
                return [newUser, messageOfNewUserRecord]
            }
            const [userObject, messageOfUser] =
                await User.findUserInAll(username)

            if (!userObject.isActive) {
                return userObject.#reactivateUser()
            }
            return [null, "username already exist,try new one"]
    }
    
    async #reactivateUser() {
        this.isActive = true
        const [result, messageOfResult] = await User.db.replaceUser(this)
        if (!result) {
            return [null, messageOfResult]
        }
        if (result.modifiedCount == 0) {
            return [null, messageOfResult]
        }
        const [userRecord, messageOfUserRecord] = await User.db.fetchUser(fetchedCredentialRecord)
        const updatedUser = User.reCreateUserObject(userRecord)
        return [updatedUser, messageOfResult]
    }

    static async registerCustomer(
        firstname, lastname,Dob,username,password,email,
        address, state, city, pincode, mobileNumber,
        documentType,documentFile,nominee, nomineeRelation,
        referedBy,qualification) {
                
            const [fetchedCredentialRecord, msgOfCredentialFetch] =
            await User.db.fetchCredential(username)

            if (!fetchedCredentialRecord) {
                const id = uuid.v4()

                fullName =User.getFullName(firstname,lastname)

                const [newCredentialObject, messageOfCreatingCredential] =
                    await Credential.createCredential(username, password)
                const [newCredentialRecord, messageOfnewCredentialRecord] =
                    await User.db.fetchCredential(username)
                if (!newCredentialRecord) {
                    return [newCredentialRecord, messageOfCreatingCredential]
                }

                const [roleRecord,messageOfRole] = await User.db.fetchRole("Customer")
                const agentId = await User.findAgentId(referedBy)
                const newUserObject = new User(
                    id, firstname,lastname,fullName,Dob,newCredentialRecord._id, 
                    roleRecord._id , true ,email,
                    address, state, city, pincode, mobileNumber,
                    [], "awaiting",nominee, nomineeRelation,null,
                    agentId,undefined,qualification)
                
                const [newUserRecord, messageOfNewUserRecord] =
                    await User.db.insertUser(newUserObject)

                if (!newUserRecord) {
                    return [newUserRecord, messageOfNewUserRecord]
                }
                const [fetcehdUserRecord, messageOfFetchedUserRecord] =
                    await User.db.fetchUser(newCredentialRecord)
                const newUser = User.reCreateUserObject(fetcehdUserRecord)
                await newUser.addDocument(documentType,documentFile)
                return [newUser, messageOfNewUserRecord]
            }

            return [null, "username already exist,try new one"]
    
    }

    async changeReferenceId(){
        if(!this.role.role=="Agent"){
            return 
        }
        this.referenceId = uuid.v4()
        await User.db.replaceUser(this)
    } 

    async addCustomer(customer_Id){
        if(!this.role.role=="Agent"){
            return 
        }
        this.customers.push(customer_Id)
        await User.db.replaceUser(this)
    }   

    static reCreateUserObject(record) {
        const UserObject = new User(
            record.id,  
            record.firstName,
            record.lastName,
            record.fullName,
            record.Dob,
            record.credential,
            record.role,
            record.isActive,
            record.email,
            record.address,
            record.state, 
            record.city,
            record.pincode,
            record.mobileNumber,
            record.documents,
            record.status,
            record.nominee, 
            record.nomineeRelation,
            record.referenceId,
            record.referedBy,
            record.customers,
            record.qualification
            )
        return UserObject
    }

    static getFullName(firstName,lastName){
        let name
        if(firstName){
            name = firstName
        }
        if(lastName){
            name = name+" "+lastName
        }

        return name
    }

    static async findAgentId(referenceId){
        const [agentRecord,message] = await User.fetchaAgent(referenceId)
        return agentRecord._id
    }


    static async findUser(username) {
        const [fetchedCredentialRecord, messageOfFetchCredential] = await User.db.fetchCredential(username)
        if (!fetchedCredentialRecord) {
            return [null, "user not found"]
        }
        const [fetchedUserRecord, msgOfUserFetch] = await User.db.fetchUser(fetchedCredentialRecord)
        console.log(fetchedCredentialRecord)
        if (fetchedUserRecord.isActive != true) {
            return [null, "user is not active"]
        }

        const userObject = User.reCreateUserObject(fetchedUserRecord)
        return [userObject, "user found"]
    }

    static async findUserInAll(username) {
        const [fetchedCredentialRecord, msgOfCredentialFetch] =
            await User.db.fetchCredential(username)

        if (!fetchedCredentialRecord) {
            return [null, "username not found"]
        }

        const [fetchedUserRecord, msgOfUserFetch] = await User.db.fetchUser(fetchedCredentialRecord)
        const userObject = User.reCreateUserObject(fetchedUserRecord)
        return [userObject, "user found"]  
    }

    static async validateCredential(username, password) {

        const [userObject, message] = await User.findUser(username)
        if (!userObject) {
            return [false, null, "invalid credential"]
        }
        console.log("problem"+userObject)
        const CredentialObject = Credential.reCreatedCredentialObject(userObject.credential)
        if (await CredentialObject.ComparePasspassword(password)) {
            return [true, userObject, "valid credential"]
        }

        return [false, null, "invalid credential"]
    }

    
    async getAllUsersWithRole(role,limit,page){

        const [roleRecord,messageOfRole] = await User.db.fetchRole(role)
        //can be changed later
        const [allUsersRecord,msgOfallUsersRecord] = 
            await User.db.fetchUsersWitheRole(roleRecord)
        const currentUsersRecord = paginater(allUsersRecord,limit,page)
        let currentPage = []
        for (let index = 0; index < currentUsersRecord.length; index++) {
            let userObject =  User.reCreateUserObject(currentUsersRecord[index])
            currentPage.push(userObject)
        }
        return [allUsersRecord.length,currentPage] 
    }


    async getAllUsernames() {
        const [listOfUsernames, message] = await User.db.fetchUsernames(this.credential.username)
        return listOfUsernames
    }

    static getAge(Dob){

        let birthMonth = parseInt(Dob.slice(3,5))
        let birthYear = parseInt(Dob.slice(6,10))
        
        const currentDate = new Date()
        let currentMonth = currentDate.getMonth()
        let currentYear = currentDate.getFullYear()

        let yearsofAge;
        let monthsofAge ;
        let monthProportionofAge;

        if (currentMonth < birthMonth) {
            yearsofAge = currentYear - birthYear - 1
            monthsofAge = 12 + currentMonth -birthMonth
        }

        if (currentMonth >= birthMonth) {
            yearsofAge = currentYear - birthYear
            monthsofAge = currentMonth - birthMonth
        }

        monthProportionofAge = monthsofAge / 12
        monthsofAge = monthProportionofAge.toFixed(1)
        let age = parseInt(yearsofAge) + parseFloat(monthsofAge)
        return age
    }

    async changePassword(newPassword){
        const credential = Credential.reCreatedCredentialObject(this.credential)
        return await credential.changePassword(newPassword)
    }

    //document
    findDocumentType(type){
        for (let index = 0; index < this.documents.length; index++) {
            if(this.documents[index].type==type){
                return [true,index]
            }
        }
        return [false,-1]
    }

    findDocumentId(id){
        for (let index = 0; index < this.documents.length; index++) {
            if(this.documents[index].id==id){
                return [true,index]
            }
        }
        return [false,-1]
    }
    
    async addDocument(type, file) {
        if(!file){
            return ["file is required",null]
        }
        const [isDocumentTypeExist,message] =  this.findDocumentType(type)
        if(!isDocumentTypeExist){
            return ['document type already exist',null]
        }
        const [document, messageOfDocument] = await Document.createDocument(type, file)
        const [documentRecord, messageOfRecord] = await User.db.fetchDocument(document.id)
        this.documents.push(documentRecord.id)
        await User.db.replaceUser(this)
        return ['document added successfully',document]
    }

    async deleteDocument(type) {
        const [isDocumentExist, index] = this.findDocumentType(type)
        if(!isDocumentExist){
            return ["no such document exist",null]
        }
        const [documentDeleteRecord, messageOfDelete] =
            await User.db.deleteDocument(this.documents[index].id)
        this.documents[index].isActive=false
        const document = Document.reCreateDocumentObject(this.documents[index])
        return ["document deactivated successfully",document]
    }

    async getAllDocuments(){
        currentPage = []
        for (let index = 0; index < this.documents.length; index++) {
            currentPage.push(Document.reCreateDocumentObject(this.documents[index]))
        }
        return currentPage
    }

    async changeDocument(type,file){
        const [isDocumentExist, index] = this.findDocumentType(type)
        if(!isDocumentExist){
            return ["no such document exist",null]
        }
        const [documentChangeRecord, messageOfChange] =
            await User.db.changeDocument(this.documents[index].id,file)
        const [documentFetched, messageOfFetch] =
            await User.db.fetchDocument(this.documents[index].id)
        this.documents[index]= documentFetched
        const document = Document.reCreateDocumentObject(this.documents[index]) 
        return ["document updated successfully",document]
    }

    //states
    async createState(){
        if(!this.role.role=="Admin"){
            return [null,"only admin can create states"]
        }
        
    }

    //city//

    // PlanType
    async createPlanType(title){
        if(!this.role.role=="Admin"){
            return [null, "only admin create plan type"]
        }
        return await PlanType.createPlanType(title)
    }

    async getAllPlanTypes(){
        return await PlanType.getAllPlanTypes()
    }

    async updatePlanType(id,type){
        this.type= type
        const [response, message] = await PlanType.db.replacePlanType(id,type)
        if(response.modifiedCount==1){
            return [this,"plane type updated successfully"]
        }
        const [planeTypefetched,messageOfFetch] = await PlanType.db.fetchPlaneType(id)
        const planeType =PlanType.reCreatePlaneType(planeTypefetched)
        return [planeType,"plan type could not be updated"]       
    }

    async deletePlanType(id){
        return await PlanType.db.deletePlanType(this.id)
    }

//scheme
    async createScheme(img,type,agentCommission,notes,status){
        if(!this.role.role=="Admin"){
            return [null, "only admin create plan type"]
        }
        const [planTypeRecord,messageOfType] = await User.db.fetchPlanTypeById(type)
        if(!planTypeRecord){
            return [null,"plan type is not available"]
        }
        return await Scheme.createScheme(
            img,planTypeRecord._id,
            agentCommission,notes,status)
    }

    async getAllSchemes(){
        return await Scheme.getAllSchemes()
    }

    async updateScheme(id){
        this.type= type
        const [response, message] = await PlanType.db.replacePlanType(id,type)
        if(response.modifiedCount==1){
            return [this,"plane type updated successfully"]
        }
        const [planeTypefetched,messageOfFetch] = await PlanType.db.fetchPlaneType(id)
        const planeType =PlanType.reCreatePlaneType(planeTypefetched)
        return [planeType,"plan type could not be updated"]       
    }

    async deleteScheme(id){
        return await PlanType.db.deletePlanType(this.id)
    }

    //Plan
    async createPlan(
        typeId,schemeId,minimumTerm, maximumTerm, maximumAge, minimumAge,
        minimumInvestment, maximumInvestment, profitRatio ,isActive
        ){
            if(!this.role.role==="Employee"){
                return  [null, "only employee can create plan"]
            }
            const [planeTypeRecord,messageOfType] = await User.db.fetchPlanTypeById(typeId)
            if(!planeTypeRecord){
                return [null, "no such type plan exist"]
            }
            const [schemeRecord,messageOfScheme] = await User.db.fetchSchemeById(schemeId)
            if(!schemeRecord){
                return [null, "no such type plan exist"]
            }
            return await Plan.createPlan(planeTypeRecord._id,schemeRecord._id, minimumTerm, maximumTerm,maximumAge,minimumAge,
                minimumInvestment,maximumInvestment,profitRatio)
    }

    async getPlansForAdmin(typeId){
        if(!this.role.role=="Admin"){
            return [null,"only admin can fetch"]
        }
       
        const [planTypeRecord,messageOfType] = await User.db.fetchPlanType(typeId)
        if(!planTypeRecord){
            return [null, "no such type plan exist"]
        }
        const planType= PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans()
    }

    async getPlansForEmployee(typeId){
        if(!this.role.role=="Employee"){
            return [null,"only employee can fetch"]
        }
       
        const [planTypeRecord,messageOfType] = await User.db.fetchPlanType(typeId)
        if(!planTypeRecord){
            return [null, "no such type plan exist"]
        }
        const planType= PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans()
    }

    async getPlansForAgent(typeId){
        if(!this.role.role=="Agent"){
            return [null,"only Agent can fetch"]
        }
       
        const [planTypeRecord,messageOfType] = await User.db.fetchPlanType(typeId)
        if(!planTypeRecord){
            return [null, "no such type plan exist"]
        }
        const planType= PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans()
    }

    async getPlansForCustomer(typeId){
        if(!this.role.role=="Agent"){
            return [null,"only Agent can fetch"]
        }
       
        const [planTypeRecord,messageOfType] = await User.db.fetchPlanType(typeId)
        if(!planTypeRecord){
            return [null, "no such type plan exist"]
        }
        const planType= PlanType.reCreatePlanType(planTypeRecord)
        const age = this.getAge(this.Dob)
        return await planType.getAllPlans(age)
    }

    async getPlans(typeId){
        if(this.role.role==="Admin"){
            return await this.getPlansForAdmin()
        }

        if(this.role.role==="Employee"){
            return await this.getPlansForEmployee()
        }

        if(this.role.role==="Agent"){
            return await this.getPlansForAgent()
        }

        if(this.role.role==="Customer"){
            return await this.getPlansForCustomer()
        }
        return [null,"unauthorized access"]
    }

    async deletPlan(){

    }

    async updatePlan(){

    }

    //polacy
    async createPolicy(){
        const  []  = await Policy.createPolicy(plan,totalDuration,totalInvestment,termDuration,startingDate)
    }
  
}
console.log(User.createSuperUser("super", "user", "admin", "admin@123","k.s.venkat614@gmail.com"))
module.exports = User

