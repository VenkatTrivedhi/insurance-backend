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
    ) {
        this.id = id
        this.type = type
        this.scheme = scheme
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
        type_Id, scheme_Id, minimumTerm, maximumTerm, maximumAge, minimumAge,
        minimumInvestment, maximumInvestment, profitRatio, isActive
    ) {

        const id = uuid.v4()
        const newPlan = new Plan(id, type_Id, scheme_Id, minimumTerm, maximumTerm, maximumAge, minimumAge,
            minimumInvestment, maximumInvestment, profitRatio, isActive)
        const [planRecord, message] = await Plan.db.insertPlan(newPlan)
        if (!planRecord) {
            return [planRecord, message]
        }
        return [newPlan, "plan created successfully"]
    }

    static reCreatePlan(record) {
        return new Plan(
            record.id, record.type, record.scheme, record.minimumTerm, record.maximumTerm,
            record.maximumAge, record.minimumAge, record.maximumInvestment,
            record.maximumInvestment, record.profitRatio, record.isActive)
    }

    async updatePlan(propertTobeUpdated, value) {

        switch (propertTobeUpdated) {
            case ("minimumTerm"): {
                this.minimumTerm = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "minimumTerm could not be updated"]
                }
                return [this, `minimumTerm updated successfully`]
            }

            case ("maximumTerm"): {
                this.maximumTerm = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "maximumTerm could not be updated"]
                }
                return [this, `maximumTerm updated successfully`]

            }
            case ("maximumAge"): {
                this.maximumAge = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "maximumAge could not be updated"]
                }
                return [this, `maximumAge updated successfully`]
            }

            case ("minimumAge"): {
                this.maximumAge = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "minimumAge could not be updated"]
                }
                return [this, `minimumAge updated successfully`]

            }
            case ("minimumInvestment"): {
                this.minimumInvestment = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "minimumInvestment could not be updated"]
                }
                return [this, `minimumInvestment updated successfully`]
            }
            case ("maximumInvestment"): {
                this.maximumAge = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "maximumInvestment could not be updated"]
                }
                return [this, `minimumInvestment updated successfully`]
            }
            case ("profitRatio"): {
                this.profitRatio = value
                const [isDone, msg] = await Plan.db.replacePlan(this)
                if (!isDone) {
                    return [null, "pofitRatio could not be updated"]
                }
                return [this, `profitRatio updated successful`]
            }

            default: {
                return [null, "field can not be updated"]
            }

        }
    }
}




module.exports = Plan