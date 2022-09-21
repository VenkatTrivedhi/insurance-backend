const uuid = require("uuid")
const DatabaseMongoose = require("./repository/database")

class Roles {
    constructor(id, role,rolesThatCanBeCreated,rolesThatCanBeGet) {
        this.id = id
        this.role = role
        this.rolesThatCanBeCreated = rolesThatCanBeCreated
        this.rolesThatCanBeGet = rolesThatCanBeGet
        
    }
    static db = new DatabaseMongoose();

    static async addRole(role) {
        const id = uuid.v4()
        const newRole = new Roles(id, role , [],[])
        const [newRoleRecord, message] = await Roles.db.insertRole(newRole)
        if (!newRoleRecord) {
            return [null, message]
        }
        return [newRoleRecord, message]
    }

    static reCreateRole(record) {
        const roleObject = new Roles(
            record.id, record.role, record.rolesThatCanBeCreated,record.rolesThatCanBeGet)
        return roleObject
    }

    async addRolesToBeCreated(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.rolesThatCanBeCreated.length; i++) {
                if(this.rolesThatCanBeCreated[i]==roles[index]){
                return
            }
            }
            this.rolesThatCanBeCreated.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    async addRolesToBeGet(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.rolesThatCanBeCreated.length; i++) {
                if(this.rolesThatCanBeGet[i]==roles[index]){
                return
            }
            }
            this.rolesThatCanBeGet.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    hasPermissionToCreateRole(role) {
        for (let index = 0; index < this.rolesThatCanBeCreated.length; index++) {
            if (this.rolesThatCanBeCreated[index] == role) {
                return true
            }
        }
        return false
    }

    hasPermissionToGetRole(role) {
        for (let index = 0; index < this.rolesThatCanBeCreated.length; index++) {
            if (this.rolesThatCanBeGet[index] == role) {
                return true
            }
        }
        return false
    }

    getRolesToCreate() {
        return this.rolesThatCanBeCreated
    }   

    static async createDefaultRoles() {
        
        const [adminRecord,messageAdmin] = await Roles.addRole("Admin")
  
        if(!adminRecord){
            return
        }
        const admin = Roles.reCreateRole(adminRecord)
        await admin.addRolesToBeCreated(["Employee","Agent","Admin"])
        await admin.addRolesToBeGet(["Employee","Agent","Customer"])
    
        const [employeeRecord,messageEmploye] = await Roles.addRole("Employee")
        const employee = Roles.reCreateRole(employeeRecord)
        employee.addRolesToBeCreated(["Agent"])
        employee.addRolesToBeGet(["Agent","Customer"])

        const [agentRecord,messageAgent]= await Roles.addRole("Agent")
        const agent  = Roles.reCreateRole(agentRecord)
        agent.addRolesToBeCreated(["Customer"])

        const customerRecord = await Roles.addRole("Customer")

    }
}

Roles.createDefaultRoles()

module.exports = Roles