const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const day = require(__dirname+"/date.js");
const app = express();
require("dotenv").config();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.am4sgae.mongodb.net/todolist`);

const todolistSchema = new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",todolistSchema);

const item1 = new Item({
    name:"Welcome todolist"
});
const item2 = new Item({
    name:"click '+' to add new items"
});
const item3 = new Item({
    name:"<-- click here to delete items"
});

const listSchema = new mongoose.Schema({
    name:String,
    items: [todolistSchema]
})

const List = mongoose.model("List",listSchema);

const defaultitems = [item1,item2,item3];
// Item.insertMany([item1,item2,item3]).then(
//     ()=>{
//         console.log("insert success");
//     }
// )

// const checklist = ["Search game","Buy game","Play game"];
// const worklist =[];


app.get("/",function(req,res){
    
    // const dayname = day.getDay();
    Item.find({}).then(
        function(items){
            if(items.length==0){
                Item.insertMany(defaultitems).then(
                    ()=>"Default items inserted"
                )
                res.redirect("/")
            }else{
                res.render("list",{Listtitle:"Today",checklist:items});
            }
        }
    ).catch(function(err){
        console.log(err)
    })
    
    
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then(
        function(foundlist){
            if(!foundlist){
                const list = new List({
                    name:customListName,
                    items:defaultitems
                })
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{Listtitle:customListName,checklist:foundlist.items});
            }
        }
    ).catch(function(err){
        console.log(err);
    })
    
    // list.save();
});



app.post("/",function(req,res){
    const itemname = req.body.item;
    const listname = req.body.list_type;

    const new_item = new Item({
        name:itemname
    })

    if(listname==="Today"){
        new_item.save();
        res.redirect("/");

    }else{
        List.findOne({name:listname}).then(
            function(foundlist){
                foundlist.items.push(new_item);
                foundlist.save();
                res.redirect("/"+listname);
            }
        )
    }

});

app.post("/delete",function(req,res){
    const checkbox_id = req.body.checkbox;
    const listname = req.body.listname;
    console.log(checkbox_id,listname);

    if(listname==="Today"){
        Item.deleteOne({_id:checkbox_id}).then(
            ()=>{
                res.redirect("/")
            }
        )
    }else{
        List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkbox_id}}}).then(
            ()=>{
                res.redirect("/"+listname)
            }
        ).catch((err)=>{console.log(err)});
    }
    
})



// app.post("/work",function(req,res){
//     const item = req.body.item;
//     worklist.push(item);
//     res.redirect("/work");
// });



app.listen(3000,function(){
    console.log("server running at 3000");
});