const uuid =  require("uuid")
const DatabaseMongoose = require("../repository/database")
const Commission = require("./commission")
const Premium = require("./premium")
const User = require("./user")


class Policy{
    constructor(
        id,
        customer,
        plan,
        totalDuration,
        totalInvestment,
        sumAssured,
        termDuration,
        startingDate,
        maturityDate,
        premiums,
        isActive
        ){
    this.id = id
    this.customer = customer
    this.plan = plan
    this.totalDuration = totalDuration
    this.totalInvestment = totalInvestment
    this.sumAssured = sumAssured
    this.termDuration = termDuration
    this.startingDate = startingDate
    this.maturityDate = maturityDate
    this.premiums = premiums
    this.isActive = isActive
}

static db = new DatabaseMongoose()


static async createPolicy(
    user,planId,totalDuration,totalInvestment,termDuration,
    cardNumber,cvv,amount
) {
    const [planRecord,messageOfPlan] = await Policy.db.fetchPlanById(planId)
    if(!planRecord){
        return [null,"no such plan available"]
    }
    const [userRecord,messageOfUser] = await Policy.db.fetchUser(user.credential)
    if(!userRecord){
        return [null,"no such custumer available"]
    }
    let startingDate = new Date()
    const maturityDate =Policy.getMaturityDate(new Date(),totalDuration)
    const sumAssured = Policy.addPercentage(planRecord.profitRatio,totalInvestment)
    const id = uuid.v4()
    const newPolicy = new Policy(
        id,
        userRecord._id,
        planRecord._id,
        totalDuration,
        totalInvestment,
        sumAssured,
        termDuration,
        startingDate,
        maturityDate,
        [],
        true)
    await newPolicy.generatePremiums()
    const [premiumRec,msgPre] = await Policy.db.fetchPremiumWith_Id(newPolicy.premiums[0]) 
    const premium = Premium.reCreatePremium(premiumRec)
    const [payment,transaction,msg] = await premium.payPremium(cardNumber,cvv,amount)
    if(payment.status!="paid"){
        return[null,transaction,"can not proceed payment declined"]
    }
    const [policyRecord, message] = await Policy.db.insertPolicy(newPolicy)
    if (!policyRecord) {
        return [policyRecord,message]
    }
    

    const amountCommission =planRecord.scheme.agentCommission*amount/100

    const [commsison,mes] = await Commission.createCommission(
        policyRecord, userRecord, planRecord, amountCommission)

    const policyObject = Policy.reCreatePolicy(policyRecord)
    return [policyObject,transaction,"policy claimed successfully"]
}

static  addPercentage(profitRatio,totalInvestment){
    let profit = profitRatio*totalInvestment/100
    const total = totalInvestment + profit
    return total
}

static reCreatePolicy(record) {
    return new Policy(
        record.id, 
        record.customer,
        record.plan,
        record.totalDuration,
        record.totalInvestment,
        record.sumAssured,
        record.termDuration,
        record.startingDate,
        record.maturityDate,
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
        const premiumRecord = await Premium.createPremium(tobePaidAt,amount)
        console.log(this,"%%%%%%%%%%%%%%%%%%%%")
        this.premiums.push(premiumRecord._id)
    }
}


static getMaturityDate(startDate,years){
    return new Date(startDate.setYear(startDate.getYear()+years))
} 


}

module.exports = Policy