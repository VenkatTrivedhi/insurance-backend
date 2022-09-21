const uuid = require("uuid")
const DatabaseMongoose = require("../repository/database")
const planType = require("./planType")

class Plan {
    constructor(
        id,
        type,
        scheme,
        minimumTerm,
        maximumTerm,
        maximumAge,
        minimumAge,
        minimumInvestment,
        maximumInvestment,
        profitRatio, 
        isActive
        ){
            this.id = id
            this.type = type
            this.scheme=scheme
            this.minimumTerm = minimumTerm
            this.maximumTerm = maximumTerm
            this.minimumAge = minimumAge
            this.maximumAge = maximumAge
            this.minimumInvestment = minimumInvestment
            this.maximumInvestment = maximumInvestment
            this.profitRatio = profitRatio
            this.isActive = isActive
    }

    static db = new DatabaseMongoose()

    static async createPlan(
        type_Id,scheme_Id,minimumTerm, maximumTerm, maximumAge, minimumAge,
        minimumInvestment, maximumInvestment, profitRatio ,isActive
    ) {

        const id = uuid.v4()
        const newPlan = new Plan(id, type_Id,scheme_Id,minimumTerm, maximumTerm, maximumAge, minimumAge,
            minimumInvestment, maximumInvestment, profitRatio,isActive)
        const [planRecord, message] = await Plan.db.insertPlan(newPlan)
        if (!planRecord) {
            return [planRecord, message]
        }
        await Plan.db.addPlan(planRecord._id)
        return [newPlan, "plan created successfully"]
    }

    static reCreatePlan(record) {
        return new Plan(
            record.id, record.type,record.scheme,record.minimumTerm, record.maximumTerm,
            record.maximumAge, record.minimumAge, record.maximumInvestment,
            record.maximumInvestment, record.profitRatio, record.isActive)
    }



}

module.exports = Plan