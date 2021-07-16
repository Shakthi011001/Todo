//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express(); //creating app constant
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs"); // always before app.set and it's to use ejs with express

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")) //to use stylesheet css

mongoose.connect("mongodb+srv://admin-shakthi:Test123@cluster0.nicwl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true},{useUnifiedToplology: true});

const itemsSchema = {
name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your Todolist!"
});
const item2 = new Item({
  name: "Hit plus button to add a new item"
});
const item3 = new Item({
  name: "Hit checkbox to delete an item"
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length == 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfulyy added to database");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today",newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function(req,res){
const customListName = _.capitalize(req.params.customListName);

List.findOne({name:customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      //create new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      //shows existing list
      res.render("list",{listTitle: foundList.name ,newListItems: foundList.items })
    }
  }
});

});

app.post("/", function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName=== "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Successfully deleted item");
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle: "Work List", newListItems:foundItems});
    }
  });
}
else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
  });
}

});


app.get("/about", function(req,res){
res.render("about");
})
const port = process.env.PORT || 3000;


app.listen(port, function() {
  console.log("Server has started on port 3000");
})
