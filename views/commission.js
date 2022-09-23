const uuid = require("uuid")
const DatabaseMongoose = require("../repository/database")
const paginater = require("../paginater")


class Commission {
    constructor(id, policy, agent, date, customer, scheme, amount) {
        this.id = id
        this.policy = policy
        this.agent = agent
        this.date = date
        this.customer = customer
        this.scheme = scheme
        this.amount = amount
    }

    static db = new DatabaseMongoose()

    static async createCommission(policy, agent, date, customer, scheme, amount){
        const id = uuid.v4()
        const newCommission = new Commission(id,policy, agent, date, customer, scheme, amount)
        const[commissionRecord,message] = await Commission.db.insertCommission(newCommission)
        if(!commissionRecord){
            return [null,"commission "]
        }
        return [newCommission,"commsison added"]
    }

    static reCreateCommission(record) {
        return new Commission(
            record.id, record.policy, record.agent, record.date, record.customer,
            record.scheme, record.amount)
    }

    static async getAllCommission(limit,page){
        const [allCommissionRecords,] = await Commission.db.fetchAllCommission()
        const currentCommissionRecord = paginater(allCommissionRecords, limit, page)
        let currentPage = []
        for (let index = 0; index < currentCommissionRecord.length; index++) {
            let commissionObject = Commission.reCreateCommission(currentCommissionRecord[index])
            currentPage.push(commissionObject)
        }
        return [allCommissionRecords.length, currentPage]
    }

}

module.exports = Commission
