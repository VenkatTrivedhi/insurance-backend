const uuid  = require("uuid")
const DatabaseMongoose = require("../repository/database")
const Plan = require("./plan")
const paginater = require("../paginater")

class PlanType{
    constructor(id,title,isActive){
    this.id = id
    this.title = title
    this.plans = []
    this.isActive = isActive
    }
    static db = new DatabaseMongoose() 

    static async createPlanType(title,status){
        const id= uuid.v4()
        const newPlanType = new PlanType(id,title,status)
        const [PlaneTypeRecord, message] = await PlanType.db.insertPlanType(newPlanType)
        if(!PlaneTypeRecord){
            return[null, message]
        }
        return [newPlanType,message]
    }

    static reCreatePlanType(record){
        return new PlanType(record.id,record.title,record.plans,record.isActive)
    }

    static async getAllPlanTypes(){   
        const [allPlanType,message] =  await PlanType.db.fetchAllPlaneTypes()
        if(!allPlanType){
            return [allPlanType,message]
        }
        const  list = []
        for (let index = 0; index < allPlanType.length; index++) {
            let object = PlanType.reCreatePlanType(allPlanType[index])
            list.push(object)
        }
        return [list,message]
    }

    async getAllPlans(limit,page){
        let list = paginater(this.plans,limit,page)
        const currentPage = [] 
        for (let index = 0; index < list.length; index++) {
            if(list[index].isActive){
                let plan = Plan.reCreatePlan(list[index])
                currentPage.push(plan)    
            }
        }
        return [currentPage,this.plans.length]
    }
    
    async getAllPlansWithAge(age,limit,page){
        
        const eligiblePlans = [] 
        for (let index = 0; index < this.plans.length; index++) {
            let plan = this.plans[index] 
            if(plan.isActive && plan.minimumAge>=age&&plan.maximumAge>=age){
                eligiblePlans.push(plan)    
            }
        }
        let list = paginater(eligiblePlans,limit,page)
        
        currentPage = []
        for (let index = 0; index < list.length; index++) {
            let plan = Plan.reCreatePlan(list[index])
            currentPage.push(plan)
        }
        return [currentPage,eligiblePlans.length]
    }
  
}

module.exports = PlanType