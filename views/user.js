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
        id, firstName, lastName, fullName, Dob, credential, role, isActive, email,
        address, state, city, pincode, mobileNumber,
        documents, status, nominee, nomineeRelation, referenceId,
        referedBy, customers, qualification, commission) {

        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.fullName = fullName
        this.Dob = Dob  //not storing age as it is continuously changing
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
        this.customers = customers
        this.qualification = qualification
    }

    static db = new DatabaseMongoose()


    static async createSuperUser(
        firstname, lastname, username, password, email) {

        const [superuserRecord, messageOfFetch] = await User.db.fetchCredential("admin")
        if (superuserRecord == []) {
            console.log("wrongg")
            return [null, "cannot duplicate superuser"]
        }
        const id = uuid.v4()
        const fullName = User.getFullName(firstname, lastname)
        const [newCredentialObject, messageOfCredentialCreate] =
            await Credential.createCredential(username, password)
        const [newCredentialRecord, messageOfFetchCredential] = await User.db.fetchCredential(username)


        const [AdminRecord, messageOfAdmin] = await User.db.fetchRole("Admin")
        console.log("admin record  " + AdminRecord)
        const newUser = new User(id, firstname, lastname, fullName, undefined,
            newCredentialRecord._id, AdminRecord._id, true, email,
            undefined, undefined, undefined, undefined, 7032268259,
            undefined, undefined, undefined, undefined, undefined,
            undefined, undefined)
        const [newUserRecord, messageOfUser] = await User.db.insertUser(newUser)
        return [newUser, "new user created success"]
    }

    async createUser(
        firstname, lastname, Dob, username, password, role, email,
        address, state, city, pincode, mobileNumber,
        documentType, documentFile, status, nominee, nomineeRelation,
        referedBy, qualification) {

        const [fetchedCredentialRecord, msgOfCredentialFetch] =
            await User.db.fetchCredential(username)

        if (!fetchedCredentialRecord) {
            const id = uuid.v4()
            const fullName = User.getFullName(firstname, lastname)
            const [newCredentialObject, messageOfCreatingCredential] =
                await Credential.createCredential(username, password)
            const [newCredentialRecord, messageOfnewCredentialRecord] =
                await User.db.fetchCredential(username)
            if (!newCredentialRecord) {
                return [newCredentialRecord, messageOfCreatingCredential]
            }

            const [roleRecord, messageOfRole] = await User.db.fetchRole(role)

            let agentId
            if (referedBy) {
                agentId = await User.findAgentId(referedBy)
            }
            let referenceID
            if (role == "Agent") {
                referenceID = uuid.v4()//create reference
            }
            const newUserObject = new User(
                id,
                firstname,
                lastname,
                fullName,
                Dob,
                newCredentialRecord._id,
                roleRecord._id,
                true,
                email,
                address,
                state,
                city,
                pincode,
                mobileNumber,
                [],
                status,
                nominee,
                nomineeRelation, referenceID,
                agentId, [], qualification)

            newUserObject.generateReferenceId
            newUserObject.createCommission

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

    async generateReferenceId() {
        if (!this.role == "Agent") {
            return false
        }
        let id = uuid.v4()
        let referenceId = id.slice(-4,)
        this.referenceId = referenceId
        return true
    }

    async createCommission() {
        if (!this.role == "Agent") {
            return false
        }

        this.commission = []
        return true
    }

    static async registerCustomer(
        firstname, lastname, Dob, username, password, email,
        address, state, city, pincode, mobileNumber,
        documentType, documentFile, nominee, nomineeRelation,
        referedBy, qualification) {

        const [fetchedCredentialRecord, msgOfCredentialFetch] =
            await User.db.fetchCredential(username)

        if (!fetchedCredentialRecord) {
            const id = uuid.v4()

            fullName = User.getFullName(firstname, lastname)

            const [newCredentialObject, messageOfCreatingCredential] =
                await Credential.createCredential(username, password)
            const [newCredentialRecord, messageOfnewCredentialRecord] =
                await User.db.fetchCredential(username)
            if (!newCredentialRecord) {
                return [newCredentialRecord, messageOfCreatingCredential]
            }

            const [roleRecord, messageOfRole] = await User.db.fetchRole("Customer")
            const agentId = await User.findAgentId(referedBy)
            const newUserObject = new User(
                id, firstname, lastname, fullName, Dob, newCredentialRecord._id,
                roleRecord._id, true, email,
                address, state, city, pincode, mobileNumber,
                [], "awaiting", nominee, nomineeRelation, null,
                agentId, undefined, qualification)

            const [newUserRecord, messageOfNewUserRecord] =
                await User.db.insertUser(newUserObject)

            if (!newUserRecord) {
                return [newUserRecord, messageOfNewUserRecord]
            }
            const [fetcehdUserRecord, messageOfFetchedUserRecord] =
                await User.db.fetchUser(newCredentialRecord)
            const newUser = User.reCreateUserObject(fetcehdUserRecord)
            await newUser.addDocument(documentType, documentFile)
            return [newUser, messageOfNewUserRecord]
        }

        return [null, "username already exist,try new one"]

    }

    async changeReferenceId() {
        if (!this.role.role == "Agent") {
            return
        }
        this.referenceId = uuid.v4()
        await User.db.replaceUser(this)
    }

    async addCustomer(customer_Id) {
        if (!this.role.role == "Agent") {
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

    static getFullName(firstName, lastName) {
        let name
        if (firstName) {
            name = firstName
        }
        if (lastName) {
            name = name + " " + lastName
        }

        return name
    }

    static async findAgentId(referenceId) {
        const [agentRecord, message] = await User.fetchaAgent(referenceId)
        return agentRecord._id
    }


    static async findUser(username) {
        const [fetchedCredentialRecord, messageOfFetchCredential] = await User.db.fetchCredential(username)
        if (!fetchedCredentialRecord) {
            return [null, "user not found"]
        }
        const [fetchedUserRecord, msgOfUserFetch] = await User.db.fetchUser(fetchedCredentialRecord)
        if (!fetchedUserRecord) {
            return [null, 'usrename exist but , user not exist']
        }
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
        if (!fetchedUserRecord) {
            return [null, 'usrename exist but , user not exist']
        }
        const userObject = User.reCreateUserObject(fetchedUserRecord)
        return [userObject, "user found"]
    }

    static async validateCredential(username, password) {

        const [userObject, message] = await User.findUser(username)
        if (!userObject) {
            return [false, null, "invalid credential"]
        }
        console.log("problem" + userObject)
        const CredentialObject = Credential.reCreatedCredentialObject(userObject.credential)
        if (await CredentialObject.ComparePasspassword(password)) {
            return [true, userObject, "valid credential"]
        }

        return [false, null, "invalid credential"]
    }


    async getAllUsersWithRole(role, limit, page) {

        const [roleRecord, messageOfRole] = await User.db.fetchRole(role)
        //can be changed later
        const [allUsersRecord, msgOfallUsersRecord] =
            await User.db.fetchUsersWitheRole(roleRecord)
        const currentUsersRecord = paginater(allUsersRecord, limit, page)
        let currentPage = []
        for (let index = 0; index < currentUsersRecord.length; index++) {
            let userObject = User.reCreateUserObject(currentUsersRecord[index])
            currentPage.push(userObject)
        }
        return [allUsersRecord.length, currentPage]
    }

    async getAllUsernames() {
        const [listOfUsernames, message] = await User.db.fetchUsernames(this.credential.username)
        return listOfUsernames
    }

    static getAge(Dob) {

        let birthMonth = parseInt(Dob.slice(3, 5))
        let birthYear = parseInt(Dob.slice(6, 10))

        const currentDate = new Date()
        let currentMonth = currentDate.getMonth()
        let currentYear = currentDate.getFullYear()

        let yearsofAge;
        let monthsofAge;
        let monthProportionofAge;

        if (currentMonth < birthMonth) {
            yearsofAge = currentYear - birthYear - 1
            monthsofAge = 12 + currentMonth - birthMonth
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

    isUserRole(list) {
        for (let index = 0; index < list.length; index++) {
            if (this.role.role == list[index]) {
                return true
            };
        }
        return false
    }

    async changePassword(newPassword) {
        const credential = Credential.reCreatedCredentialObject(this.credential)
        return await credential.changePassword(newPassword)
    }

    #autoUpdateFullName() {
        const fullName = User.getFullName(this.firstName, this.lastName)
        this.fullName = fullName
    }

    async updateUser(propertTobeUpdated, value) {
        switch (propertTobeUpdated) {
            case ("firstName"): {
                this.firstName=value
                this.#autoUpdateFullName()
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("lastName"): {
                this.lastName = value;
                this.#autoUpdateFullName()
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }


            case ("status"): {
                this.status = value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }


            case ("nomineeRelation"): {
                this.#autoUpdateFullName()
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("nominee"): {
                this.nominee =value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("mobileNumber"): {
                this.mobileNumber = value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("pincode"): {
                this.pincode = value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("city"): {
                this.city =  value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("state"): {
                this.state = state
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("address"): {
                this.address == value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }

            case ("email"): {
                this.email == value
                const [result, message] = await User.db.replaceUser(this);
                if (!result) {
                    return [false, null]
                }
                if (result.modifiedCount == 0) {
                    return [false, null]
                }
                return [true, this]
            }
            default: return [false, null]
        }
    }

    async updateProfile(propertTobeUpdated,value){

    }

    async deleteUser() {
        this.isActive = false
        this.status = "inActive"
        const [record, message] = await User.db.replaceUser(this)
        if (record.modifiedCount == 1) {
            return true
        }
        return false
    }

    //document
    findDocumentType(type) {
        for (let index = 0; index < this.documents.length; index++) {
            if (this.documents[index].type == type) {
                return [true, index]
            }
        }
        return [false, -1]
    }

    findDocumentId(id) {
        for (let index = 0; index < this.documents.length; index++) {
            if (this.documents[index].id == id) {
                return [true, index]
            }
        }
        return [false, -1]
    }

    async addDocument(type, file) {
        if (!file) {
            return ["file is required", null]
        }
        const [isDocumentTypeExist, message] = this.findDocumentType(type)
        if (!isDocumentTypeExist) {
            return ['document type already exist', null]
        }
        const [document, messageOfDocument] = await Document.createDocument(type, file)
        const [documentRecord, messageOfRecord] = await User.db.fetchDocument(document.id)
        this.documents.push(documentRecord.id)
        await User.db.replaceUser(this)
        return ['document added successfully', document]
    }

    async deleteDocument(type) {
        const [isDocumentExist, index] = this.findDocumentType(type)
        if (!isDocumentExist) {
            return ["no such document exist", null]
        }
        const [documentDeleteRecord, messageOfDelete] =
            await User.db.deleteDocument(this.documents[index].id)
        this.documents[index].isActive = false
        const document = Document.reCreateDocumentObject(this.documents[index])
        return ["document deactivated successfully", document]
    }

    async getAllDocuments() {
        currentPage = []
        for (let index = 0; index < this.documents.length; index++) {
            currentPage.push(Document.reCreateDocumentObject(this.documents[index]))
        }
        return currentPage
    }

    async changeDocument(type, file) {
        const [isDocumentExist, index] = this.findDocumentType(type)
        if (!isDocumentExist) {
            return ["no such document exist", null]
        }
        const [documentChangeRecord, messageOfChange] =
            await User.db.changeDocument(this.documents[index].id, file)
        const [documentFetched, messageOfFetch] =
            await User.db.fetchDocument(this.documents[index].id)
        this.documents[index] = documentFetched
        const document = Document.reCreateDocumentObject(this.documents[index])
        return ["document updated successfully", document]
    }

    //states
    async createState() {
        if (!this.role.role == "Admin") {
            return [null, "only admin can create states"]
        }

    }

    //city//

    // PlanType
    async createPlanType(title,status) {
        if (!this.role.role == "Admin") {
            return [null, "only admin create plan type"]
        }
        return await PlanType.createPlanType(title,status)
    }

    async getAllPlanTypes() {
        return await PlanType.getAllPlanTypes()
    }

    async updatePlanType(id, type) {
        this.type = type
        const [response, message] = await User.db.replacePlanType(id, this)
        if (response) {
            return [this, "plane type updated successfully"]
        }
        return [null, "plan type could not be updated"]
    }

    async deletePlanType(id) {
        this.isActive = false
        const [response, message] = await User.db.replacePlanType(id, this)
        if (response) {
            return [this, "plane type delete successfully"]
        }
        return [null, "plan type could not be deleted"]
    }

    //scheme
    async createScheme(img, type, agentCommission, notes, status) {
        if (!this.role.role == "Admin") {
            return [null, "only admin create plan type"]
        }
        const [planTypeRecord, messageOfType] = await User.db.fetchPlanTypeById(type)
        if (!planTypeRecord) {
            return [null, "plan type is not available"]
        }
        return await Scheme.createScheme(
            img, planTypeRecord._id,
            agentCommission, notes, status)
    }

    async getAllSchemes() {
        return await Scheme.getAllSchemes()
    }

    async updateScheme(id) {
        const [schemeRecord,message] = await User.db.fetchSchemeById(id)
        const scheme =  Scheme.reCreatePlan(schemeRecord)
        return await scheme.updatePlan(propertyTobeUpdated,value)
    }

    async deleteScheme(id) {
        const [schemeRecord,message] = await User.db.fetchSchemeById(id)
        schemeRecord.isActive = false
        const [isDelete,msg] = await User.db.replaceScheme(schemeRecord)
        if(!isDelete){
            return false
        }
        return true
    }

    //Plan
    async createPlan(
        typeId, schemeId, minimumTerm, maximumTerm, maximumAge, minimumAge,
        minimumInvestment, maximumInvestment, profitRatio, isActive
    ) {
        if (!this.role.role === "Employee") {
            return [null, "only employee can create plan"]
        }
        const [planeTypeRecord, messageOfType] = await User.db.fetchPlanTypeById(typeId)
        if (!planeTypeRecord) {
            return [null, "no such type plan exist"]
        }
        const [schemeRecord, messageOfScheme] = await User.db.fetchSchemeById(schemeId)
        if (!schemeRecord) {
            return [null, "no such type plan exist"]
        }
        return await Plan.createPlan(planeTypeRecord._id, schemeRecord._id, minimumTerm, maximumTerm, maximumAge, minimumAge,
            minimumInvestment, maximumInvestment, profitRatio, isActive)
    }

    async getPlansForAdmin(typeId,limit,page) {
        if (!this.role.role == "Admin") {
            return [null, "only admin can fetch"]
        }

        const [planTypeRecord, messageOfType] = await User.db.fetchPlanType(typeId)
        if (!planTypeRecord) {
            return [null, "no such type plan exist"]
        }
        const planType = PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans(limit,page)
    }

    async getPlansForEmployee(typeId,limit,page) {
        if (!this.role.role == "Employee") {
            return [null, "only employee can fetch"]
        }

        const [planTypeRecord, messageOfType] = await User.db.fetchPlanType(typeId)
        if (!planTypeRecord) {
            return [null, "no such type plan exist"]
        }
        const planType = PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans(limit,page)
    }

    async getPlansForAgent(typeId,limit,page) {
        if (!this.role.role == "Agent") {
            return [null, "only Agent can fetch"]
        }

        const [planTypeRecord, messageOfType] = await User.db.fetchPlanType(typeId)
        if (!planTypeRecord) {
            return [null, "no such type plan exist"]
        }
        const planType = PlanType.reCreatePlanType(planTypeRecord)
        return await planType.getAllPlans(limit,page)
    }

    async getPlansForCustomer(typeId,limit,page) {
        

        const [planTypeRecord, messageOfType] = await User.db.fetchPlanType(typeId)
        if (!planTypeRecord) {
            return [null, "no such type plan exist"]
        }
        const planType = PlanType.reCreatePlanType(planTypeRecord)
        const age = this.getAge(this.Dob)
        return await planType.getAllPlansWithAge(age,limit,page)
    }

    async getPlansByType(typeId,limit,page) {
        if (this.role.role === "Admin") {
            return await this.getPlansForAdmin(typeId,limit,page)
        }

        if (this.role.role === "Employee") {
            return await this.getPlansForEmployee(typeId,limit,page)
        }

        if (this.role.role === "Agent") {
            return await this.getPlansForAgent(typeId,limit,page)
        }

        if (this.role.role === "Customer") {
            return await this.getPlansForCustomer(typeId,limit,page)
        }
        return [null, "unauthorized access"]
    }

    async getAllPlans(limit, page) {
        const [allPlanRecord, msgOfPlanRecord] = await User.db.fetchAllPlans()
        const currentPlanRecord = paginater(allPlanRecord, limit, page)
        let currentPage = []
        for (let index = 0; index < currentPlanRecord.length; index++) {
            let planObject = Plan.reCreatePlan(currentPlanRecord[index])
            currentPage.push(planObject)
        }
        return [allPlanRecord.length, currentPage]
    }

    async deletePlan(id) {
        const [planRecord,message] = await User.db.fetchPlanById(id)
        planRecord.isActive = false
        const [isDelete,msg] = await User.db.replacePlan(planRecord)
        if(!isDelete){
            return false
        }
        return true
    }

    async updatePlan(id,propertyTobeUpdated,value) {
        const [planRecord,message] = await User.db.fetchPlanById(id)
        const plan =  Plan.reCreatePlan(planRecord)
        return await plan.updatePlan(propertyTobeUpdated,value)
    }

    //polacy
    // async createPolicy() {
    //     const [] = await Policy.createPolicy(plan, totalDuration, totalInvestment, termDuration, startingDate)
    // }

}
console.log(User.createSuperUser("super", "user", "admin", "admin@123", "k.s.venkat614@gmail.com"))
module.exports = User

