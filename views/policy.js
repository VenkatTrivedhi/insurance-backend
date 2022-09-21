const uuid =  require("uuid")
const DatabaseMongoose = require("../repository/database")
const Premium = require("./premium")


class Policy{
    constructor(
        id,
        plan,
        totalDuration,
        totalInvestment,
        termDuration,
        startingDate,
        maturityDate,
        premiums,
        isActive
        ){
    this.id = id
    this.plan = plan
    this.totalDuration = totalDuration
    this.totalInvestment = totalInvestment
    this.termDuration = termDuration
    this.startingDate = startingDate
    this.maturityDate = maturityDate
    this.premiums = premiums
    this.isActive = isActive 
}

static db = new DatabaseMongoose()

static async createPolicy(
    planId,totalDuration,totalInvestment,termDuration,startingDate
) {
    const [planRecord,messageOfPlan] = await Policy.db.fetchPlan(planId)
    if(!planRecord){
        return [null,messageOfPlan]
    }
    const id = uuid.v4()
    const newPolicy = new Policy(
        id,
        planRecord.id,
        totalDuration,
        totalInvestment,
        termDuration,
        startingDate,
        [],
        true)
    await this.generatePremiums()
        
    const [policyRecord, message] = await Policy.db.insertPolicy(newPolicy)
    if (!policyRecord) {
        return [policyRecord, message]
    }
    const policyObject = Policy.reCreatePlan(policyRecord)
    return [policyObject, "policy claimed successfully"]
}

static reCreatePlan(record) {
    return new PlanType(
        record.id,
        record.totalDuration,
        record.totalInvestment,
        record.termDuration,
        record.startingDate,
        record.premiums,
        record.isActive)
}

async generatePremiums(){
    let startDate = this.startingDate 
    let totalMonths = this.totalDuration * 12
    let numberOfPremiums = totalMonths/this.termDuration
    let amount = this.totalInvestment/numberOfPremiums

    for (let index = 0; index < numberOfPremiums; index++) {
        let addMonths = index*this.termDuration ;
        let tobePaidAt = new Date(startDate.setMonth(startDate.getMonth()+addMonths))
        startDate.setMonth(startDate.getMonth()-addMonths)
        const [premiumRecord,message] = await Premium.createPremium(tobePaidAt,amount)
        this.premiums.push[premiumRecord.id]
    }
    await Policy.db.replacePolicy(this)

}





}

module.exports = Policy