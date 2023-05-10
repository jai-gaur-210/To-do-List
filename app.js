const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const mongoose = require("mongoose");
const { removeAllListeners } = require("nodemon");
const _ = require("lodash")


let workItems = [];

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set('view engine', 'ejs')


mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
  }
)

// mongoose.connection.dropDatabase()



const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to your To-do List"
})

const item2 = new Item({
    name: "Hit the + button to add new item"
})

const item3 = new Item({
    name: "<-- hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

listSchema ={
    name: String ,
    items: [itemsSchema]
}

const List = mongoose.model("List" , listSchema)

List.collection.drop()

app.get("/", (req, res) => {
    Item.find({}).then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems)
            res.redirect("/")
        }else{
            res.render('list', { listTitle: "Today", newlistItems: foundItems });
        }
    })
})


app.post("/", (req, res) => {
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save()
        res.redirect("/")
    }
    else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName )
        })
    }
    
})


app.get("/:customListName" , function(req, res){
    const customListName =  _.capitalize(req.params.customListName)

    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect("/" + customListName)
        }
        else{
            res.render("list" , {listTitle: foundList.name , newlistItems: foundList.items} )
        }
    })
})

app.post('/work', (req, res) => {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work")
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.post("/delete" , function(req,res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({_id:checkedItem}).then(()=>{
            res.redirect("/")
        })
    }
    else{
        List.findOneAndUpdate({name: listName} , {$pull: {items:{_id:checkedItem}}}).then(()=>{
            res.redirect("/" + listName)
        })
    }

    
})



app.listen(3000, () => {
    console.log("run hora hai")
})