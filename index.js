const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const uuid= require("uuid")
const JwtPayLoad = require("./jwtPayLoad")
const {upload} = require("./middleWares/schemeImage")
const path =require("path")
const fs =require("fs")

const {login,loggedInUser} = require("./controllers/login/controller")
const logout = require("./controllers/logout/controller")

const { 
    registerCustomer,createUser,
    getAllAgents,getAllEmployees,getAllAdmins,
    getAllCustomers,changePassword,
    getProfile, updateProfile, getAllUser, 
    getUser ,updateUser, deleteUser} = require("./controllers/user/controller")
    
const { 
    createPlanType,getAllPlanTypes,
    updatePlanType,deletePlanType} = require("./controllers/planType/controller")
    
const { 
    createScheme,getAllSchemes,
    updateScheme,deleteScheme} = require("./controllers/scheme/controller")
    
const { 
    createPlan,getAllPlans,getAllPlansByType,
    updatePlan,deletePlan} = require("./controllers/plan/controller")

const {
    roles,limitOfPage,
    getAllUsernames,statusOptions,
    employeeTypes} =require("./controllers/options/controller")

const { getAllCommission, getAllCommissionOfAgent } = require("./controllers/commission/controller")
const { createPolicy,getAllPolicy,getAllPolicyOfCustomer} = require("./controllers/policy/controller")
const { getAllCommissionWithDrawlOfAgent, WithDrawCommission,
    getAllCommissionWithDrawl } = require("./controllers/commissionWithDrawl/controller")


const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(cookieParser())

app.post("/api/v1/login",(req,resp)=>login(req,resp))
app.post("/api/v1/logout",(req,resp)=>logout(req,resp))
app.put("/api/v1/changePassword",(req,resp)=>changePassword(req,resp))
app.get("/api/v1/getProfile",(req,resp)=>getProfile(req,resp))
app.put("/api/v1/updateProfile",(req,resp)=>updateProfile(req,resp))

app.get("/api/v1/loggedInUser",async (req, resp) => await loggedInUser(req, resp))
app.get("/api/v1/roles", async (req, resp) => await roles(req, resp))
app.get("/api/v1/limitOfPage",async (req, resp) => await limitOfPage(req, resp))
app.get("/api/v1/getAllUsernames/:username",async (req, resp) => await getAllUsernames(req, resp))
app.get("/api/v1/statusOption",async (req, resp) => await statusOptions(req, resp))
app.get("/api/v1/employeeTypes",async (req, resp) => await employeeTypes(req, resp))

//plantype
app.post("/api/v1/createPlanType",async (req,resp) => await createPlanType(req,resp))
app.get("/api/v1/getAllPlanTypes",async (req,resp) => await getAllPlanTypes(req,resp))
app.put("/api/v1/updatePlanType/:id",async (req,resp) => await updatePlanType(req,resp))
app.delete("/api/v1/deletePlanType/:id",async (req,resp) => await deletePlanType(req,resp))

//scheme
app.post("/api/v1/createScheme",upload.single('shemeImage'),async (req,resp) =>{
const img =  {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/png'
}
const pathImage = path.join(__dirname + req.file.path)
return await createScheme(req,resp,img,pathImage)})

app.get("/api/v1/getAllSchemes",async (req,resp) => await getAllSchemes(req,resp))
app.put("/api/v1/updateScheme/:id",async (req,resp) => await updateScheme(req,resp))
app.delete("/api/v1/deleteScheme/:id",async (req,resp) => await deleteScheme(req,resp))

//Plan
app.post("/api/v1/createPlan",async (req,resp) => await createPlan(req,resp))
app.get("/api/v1/getAllPlans",async (req,resp) => await getAllPlans(req,resp))
app.get("/api/v1/getAllPlansByType/:typeId",async (req,resp) => await getAllPlansByType(req,resp))
app.put("/api/v1/updatePlan/:id",async (req,resp) => await updatePlan(req,resp))
app.delete("/api/v1/deletePlan/:id",async (req,resp) => await deletePlan(req,resp))

//user
app.post("/api/v1/createUser",(req,resp)=>createUser(req,resp))
app.get("/api/v1/getAllAgents",(req,resp)=>getAllAgents(req,resp))
app.get("/api/v1/getAllAdmins",(req,resp)=>getAllAdmins(req,resp))
app.get("/api/v1/getAllEmployees",(req,resp)=>getAllEmployees(req,resp))
app.get("/api/v1/getAllCustomers",(req,resp)=>getAllCustomers(req,resp))
app.post("/api/v1/registerCustomer",(req,resp)=>registerCustomer(req,resp))
app.put("/api/v1/updateUser/:username",async (req,resp) => await updateUser(req,resp))
app.delete("/api/v1/deleteUser/:username",async (req,resp) => await deleteUser(req,resp))

//policies
app.post("/api/v1/createPolicy",(req,resp)=>createPolicy(req,resp))

//getAllPolicies //insurance account
app.get("/api/v1/getAllPolicy",(req,resp)=>getAllPolicy (req,resp))//admin
app.get("/api/v1/getAllPolicy/:username",(req,resp)=>getAllPolicyOfCustomer(req,resp))//customer

//Premium//
app.get("/api/v1/getAllPremium/:policyId",(req,resp)=>getAllPremiums(req,resp))

//app.post("/api/v1/createCommission",(req,resp)=>createCommission(req,resp))//fake
app.get("/api/v1/getAllCommission",(req,resp)=>getAllCommission(req,resp))
app.get("/api/v1/getAllCommission/:username",(req,resp)=>getAllCommissionOfAgent(req,resp))

//commssionWithDraw
app.post("/api/v1/withDrawCommission/:username",(req,resp)=>WithDrawCommission(req,resp))//agent/
app.get("/api/v1/getAllWithdrawlOfAgent/:username",(req,resp)=>getAllCommissionWithDrawlOfAgent(req,resp))//customer
app.get("/api/v1/getAllWithdrawl",(req,resp)=> getAllCommissionWithDrawl(req,resp))//admin


//Queries
app.post("/api/v1/postQueries/",(req,resp)=>createPolicy(req,resp))///
app.get("/api/v1/getAllQueries",(req,resp)=>getAllQueries(req,resp))

//reply
app.post("/api/v1/replyQuery/:id",(req,resp)=>createPolicy(req,resp))


//state
app.post("/api/v1/createState",(req,resp)=>createState(req,resp))
app.get("/api/v1/getAllState",(req,resp)=>getAllStates(req,resp))

app.post("/api/v1/createCity/:state",(req,resp)=>createCity(req,resp))
app.get("/api/v1/getAllState/:state",(req,resp)=>getAllCity(req,resp))


//server
app.listen(8000,()=>{
    console.log("server running at 8000")
})
