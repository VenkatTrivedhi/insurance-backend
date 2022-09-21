const uuid = require("uuid")

class Document{
    constructor(id,type,file){
        this.id= id
        this.type = type
        this.file = file
    }

    static async createDocument(type,file){
        const id = uuid.v4()
        const newDocument = new Document(id,type,file)
        return [newDocument,'document added successfully']
    }

    static reCreateDocumentObject(record){
        return new Document(record.id,record.type,record.file)
    }

}

module.exports = Document