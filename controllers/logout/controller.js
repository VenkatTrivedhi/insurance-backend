
const logut=(req,resp)=>{
    resp.clearCookie("myBankToken").status(200).send("Successfully logged out")
}

module.exports = logut