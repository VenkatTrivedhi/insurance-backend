const uuid = require("uuid")
const DatabaseMongoose = require("./repository/database")

class Roles {
    constructor(id,role,canCreate,canGet,canUpdate,canDelete) {
        this.id = id
        this.role = role
        this.canCreate = canCreate
        this.canGet = canGet
        this.canUpdate = canUpdate
        this.canDelete = canDelete
    }
    static db = new DatabaseMongoose();

    static async addRole(role) {
        const id = uuid.v4()
        const newRole = new Roles(id, role , [],[],[],[])
        const [newRoleRecord, message] = await Roles.db.insertRole(newRole)
        if (!newRoleRecord) {
            return [null, message]
        }
        return [newRoleRecord, message]
    }

    static reCreateRole(record) {
        const roleObject = new Roles(
            record.id, record.role,
            record.canCreate,record.canGet,
            record.canUpdate,record.canDelete)
        return roleObject
    }

    async addToBeCreated(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.canCreate.length; i++) {
                if(this.canCreate[i]==roles[index]){
                return
            }
            }
            this.canCreate.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    async addToBeGet(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.canGet.length; i++) {
                if(this.canGet[i]==roles[index]){
                return
            }
            }
            this.canGet.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    async addToBeUpdated(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.canUpdate.length; i++) {
                if(this.canUpdate[i]==roles[index]){
                return
            }
            }
            this.canUpdate.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    async addToBeDeleted(roles) {
       
        for (let index = 0; index < roles.length; index++) {
            for (let i = 0; i < this.canDelete.length; i++) {
                if(this.canDelete[i]==roles[index]){
                return
            }
            }
            this.canDelete.push(roles[index])            
        }
        await Roles.db.replaceRole(this)   
    }

    hasPermissionToCreate(role) {
        for (let index = 0; index < this.canCreate.length; index++) {
            if (this.canCreate[index] == role) {
                return true
            }
        }
        return false
    }

    hasPermissionToGet(role) {
        for (let index = 0; index < this.canGet.length; index++) {
            if (this.canGet[index] == role) {
                return true
            }
        }
        return false
    }
    
    hasPermissionToUpdate(role) {
        for (let index = 0; index < this.canUpdate.length; index++) {
            if (this.canUpdate[index] == role) {
                return true
            }
        }
        return false
    }

    hasPermissionToDelete(role) {
        for (let index = 0; index < this.canDelete.length; index++) {
            if (this.canDelete[index] == role) {
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
        await admin.addToBeCreated(["Employee","Agent","Admin"])
        await admin.addToBeGet(["Employee","Agent","Customer"])
        await admin.addToBeUpdated(["Employee","Agent","Customer"])
        await admin.addToBeDeleted(["Employee","Agent","Customer"])
    
        const [employeeRecord,messageEmploye] = await Roles.addRole("Employee")
        const employee = Roles.reCreateRole(employeeRecord)
        employee.addToBeCreated(["Agent"])
        employee.addToBeGet(["Agent","Customer"])
        employee.addToBeUpdated(["Agent","Customer"])
        employee.addToBeDeleted(["Agent","Customer"])

        const [agentRecord,messageAgent]= await Roles.addRole("Agent")
        const agent  = Roles.reCreateRole(agentRecord)
        agent.addToBeCreated(["Customer"])

        const customerRecord = await Roles.addRole("Customer")

    }
}

Roles.createDefaultRoles()

module.exports = Roles