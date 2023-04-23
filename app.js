const express = require("express");
const bodyParser = require("body-parser");
const day = require(__dirname+"/date.js");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
const checklist = ["Search game","Buy game","Play game"];
const worklist =[];


app.get("/",function(req,res){
    
    const dayname = day.getDay();
    res.render("list",{Listtitle:dayname,checklist:checklist});
});

app.post("/",function(req,res){
    console.log(req.body);
    if(req.body.list_type === "Work"){
        worklist.push(req.body.item);
        res.redirect("/work")
    }else{
        checklist.push(req.body.item);
        res.redirect("/");
    }

});

app.get("/work",function(req,res){
    res.render("list",{Listtitle:"Work",checklist:worklist})
});

app.post("/work",function(req,res){
    const item = req.body.item;
    worklist.push(item);
    res.redirect("/work");
});



app.listen(3000,function(){
    console.log("server running at 3000");
});