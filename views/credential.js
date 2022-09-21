const uuid = require("uuid")
const bcrypt = require("bcrypt")
const DatabaseMongoose = require("../repository/database")


class Credential {
    constructor(id,username, password) {
        this.id = id
        this.username = username
        this.password = password
    }

    static async createCredential(username,password){
        const db = new DatabaseMongoose()
        const id = uuid.v4()
        const newCredentialObject=new Credential(id,username,password)
        await newCredentialObject.getPasswordHashed()
        const  [newCredentialRecord,message] = await db.insertCredential(newCredentialObject)
        return [newCredentialObject,message]  
    }

    static reCreatedCredentialObject(record){
        console.log(record)
        const reCreatedCredentialObject = new Credential(record.id,record.username,record.password)
        return reCreatedCredentialObject
    }


    async getPasswordHashed() {
        this.password = await bcrypt.hash(this.password, 10)
    }

    async ComparePasspassword(password) {
        const isMatch = await bcrypt.compare(password, this.password)
        return isMatch
    }
  
    async changePassword(newPassword){
        const db = new DatabaseMongoose()
        this.password = await bcrypt.hash(newPassword, 10)
        const [isDone,message] = await db.replaceCredential(this)
        return isDone
    }
}

module.exports = Credential