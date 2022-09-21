const uuid = require("uuid")
const DatabaseMongoose = require("../repository/database")
const Transaction = require("./transaction")

class Premium{
    constructor(id,tobePaidAt,paidAt,amount,status,transactions){
        this.id = id
        this.tobePaidAt = tobePaidAt
        this.paidAt = paidAt
        this.amount = amount
        this.status = status
        this.transactions = transactions
    }
    
    static db = new DatabaseMongoose()

    static async createPremium(tobePaidAt,amount){
        const id = uuid.v4()
        const newPremium = new Premium(id,tobePaidAt,null,amount,"pending",[])
        const [premiumRecord,messageOfInsert] =  await Premium.insertPremium(newPremium)
        if(!premiumRecord){
            return null
        }
        return premiumRecord
    }

    static reCreatePremium(record){
        new Premium(record.id,record.tobePaidAt,record.paidAt,record.amount,record.status,record.transactions)
    }

    async payPremium(cardNumber,cvv,amount){
        const transactionRecord = Transaction.createTransaction(cardNumber,cvv,amount)
        this.transactions.push(transactionRecord._id)
        
        
        if(transactionRecord.status=="success"){
            this.status = "paid"
            this.paidAt = transactionRecord.doneAt
        }
        await Premium.db.replacePremium(this)
        return [this,"premium paid successfully"]
    }
}

module.exports = Premium