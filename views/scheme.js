const uuid  = require("uuid")
const DatabaseMongoose = require("../repository/database")
const Plan = require("./plan")

class Scheme{
    constructor(id,image,imgPath,type,agentCommission,notes,isActive){
    this.id = id
    this.image = image
    this.imagePath = imgPath
    this.type = type
    this.agentCommission = agentCommission
    this.notes = notes
    this.isActive = isActive
    this.plans = []
    }
    static db = new DatabaseMongoose() 

    static async createScheme(image,imgPath,type,agentCommission,notes,isActive){
        const id= uuid.v4()
        const newScheme = new Scheme(id,image,imgPath,type,agentCommission,notes,isActive,[])
        const [schemeRecord, message] = await Scheme.db.insertScheme(newScheme)
        if(!schemeRecord){
            return[null, message]
        }
        return [newScheme,message]
    }

    static reCreateScheme(record){
        return new Scheme(
            record.id, record.image,record.imagePath,
            record.type,record.agentCommission,
            record.notes, record.isActive,record.plans)
    }

    static async getAllSchemes(){   
        const [allScheme,message] =  await Scheme.db.fetchAllSchemes()
        if(!allScheme){
            return [allScheme,message]
        }
        const  list = []
        for (let index = 0; index < allScheme.length; index++) {
            let object = Scheme.reCreateScheme(allScheme[index])
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

    async updatePlan(propertTobeUpdated,value){

        switch (propertTobeUpdated) {
            case ("agentCommission"): {
                this.agentCommission=value
                const [isDone,msg] =await Plan.db.replacePlan(this)
                if(!isDone){
                    return [null,"agentCommission could not be updated"]
                }
                return [this,`agentCommission updated successfully`]
            }

            case ("notes"): {
                this.notes=value
                const [isDone,msg] =await Plan.db.replacePlan(this)
                if(!isDone){
                    return [null,"notes could not be updated"]
                }
                return [this,`notes updated successfully`]

            }
        
            default:{
                return [null,"field can not be updated"]
            }
           
        }
    }
  
}

module.exports = Scheme