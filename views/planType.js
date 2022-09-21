const uuid  = require("uuid")
const DatabaseMongoose = require("../repository/database")
const Plan = require("./plan")

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

    async getAllPlans(){
        const currentPage = [] 
        for (let index = 0; index < this.plans.length; index++) {
            if(this.plans[index].isActive){
                let plan = Plan.reCreatePlan(this.plans[index])
                currentPage.push(plan)    
            }
        }
        return [currentPage,this.plans.length]
    }
    
    async getAllPlans(age){
        const currentPage = [] 
        for (let index = 0; index < this.plans.length; index++) {
            let plan = this.plans[index] 
            if(plan.isActive && plan.minimumAge>=age&&plan.maximumAge>=age){
                let planObject = Plan.reCreatePlan(plan)
                currentPage.push(planObject)    
            }
        }
        return [currentPage,this.plans.length]
    }
  
}

module.exports = PlanType