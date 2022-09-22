const uuid = require("uuid")
const DatabaseMongoose = require("../repository/database")

class Commission {
    constructor(id, policyNumber, agent, date, customer, scheme, amount) {
        this.id = id
        this.policyNumber = policyNumber
        this.agent = agent
        this.date = date
        this.customer = customer
        this.scheme = scheme
        this.amount = amount
    }

    static db = DatabaseMongoose()

    static async createCommission(policyNumber, agent, date, customer, scheme, amount){
        const id = uuid.v4()
        const newCommission = new Commission(id,policyNumber, agent, date, customer, scheme, amount)
        const[commissionRecord,message] = await Commission.db.insertCommission(newCommission)
        if(commissionRecord){
            return [null,"commission "]
        }
    }

    
}