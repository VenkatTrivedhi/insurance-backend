const uuid = require("uuid")
const DatabaseMongoose = require("../repository/database")
const paginater = require("../paginater")


class CommissionWithDrawl {
    constructor(id, agent,doneAt,amount) {
        this.id = id
        this.agent = agent
        this.doneAt = doneAt
        this.amount = amount
    }

    static db = new DatabaseMongoose()

    static async createCommissionWithDrawl(agent, doneAt, amount){
        const id = uuid.v4()
        const newCommissionWithDrawl = new CommissionWithDrawl(id,agent,doneAt,amount)
        const[CommissionWithDrawlRecord,message] = await CommissionWithDrawl.db.insertCommissionWithDrawl(newCommissionWithDrawl)
        if(!CommissionWithDrawlRecord){
            return [null,"CommissionWithDrawl not stored"]
        }
        return [newCommissionWithDrawl,"commsison withDrawn"]
    }

    static reCreateCommissionWithDrawl(record) {
        return new CommissionWithDrawl(
            record.id,record.agent.record.doneAt.record.amount)
    }

    static async getAllCommissionWithDrawl(limit,page){
        const [allCommissionWithDrawlRecords,] = await CommissionWithDrawl.db.fetchAllCommissionWithDrawl()
        const currentCommissionWithDrawlRecord = paginater(allCommissionWithDrawlRecords, limit, page)
        let currentPage = []
        for (let index = 0; index < currentCommissionWithDrawlRecord.length; index++) {
            let CommissionWithDrawlObject = CommissionWithDrawl.reCreateCommissionWithDrawl(currentCommissionWithDrawlRecord[index])
            currentPage.push(CommissionWithDrawlObject)
        }
        return [allCommissionWithDrawlRecords.length, currentPage]
    }

    


}

module.exports = CommissionWithDrawl