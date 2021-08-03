//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //mongoose
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-ayush:<test123>@cluster0.fxa6i.mongodb.net/todolistdb?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true } );
//mongoose

const itemschema = {
  name: String
};
const Item = mongoose.model("Item", itemschema); //collection/model

const item1 = new Item({ //item1 points to the first item
  name: "Ayush"
});
const item2 = new Item({
  name: "Advait"
});
const item3 = new Item({
  name: "Aryan"
});
const defaultitems = [item1, item2, item3];

const listschema = {
  name: String,
  items: [itemschema]  //Feel this as a array of a specified datatype itemschema.
};


const List = mongoose.model("List", listschema); //note that here the first letter casing should be upper
app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) { //all the entries in the collection Item moves to the array of object founditemss
    if (founditems.length === 0) {
      Item.insertMany(defaultitems, function(err) //putting in the default items if only the array is empty (VERY IMP)
        {
          if (err) {
            console.log(err);
          } else {
            console.log("success");
          }
        });
      res.redirect("/"); //initially when the array is emp 3 items inserted but would not be rendered as the else block is not entered thus we render back
      // to the homepage ans now we would enter the else block as the array has 3 items now.
      //jeva to second time homepage la rediresct hoil teva array chi length 0 nasel.
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      }); //basically rendering the database items.
    }
  });
});

app.post("/", function(req, res) {

  const itemname = req.body.newItem; //extracting from the body of the form.
  const listname=req.body.list; //what triggered the form to send a post request
  const item = new Item({
    name: itemname
  });
  if(listname==="Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist)  //foundlist is the object of the colllection List
  {//Do not get confused a customlist is alredy created
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+listname);
  });
  }


});

app.post("/delete", function(req, res) {
  //console.log(req.body.checkbox);
  const checkitemid = req.body.checkbox; //if checkitemid is on then its going to be deleted
  const listname=req.body.listname;
  //console.log(listname);
  if(listname==="Today")
  {
    Item.findByIdAndRemove(checkitemid, function(err) {
      if (!err) {
        console.log("success");
        res.redirect("/"); //to display the list after deleting
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkitemid}}},function(err,foundlist)
  {
    if(!err)
    {
      res.redirect("/"+listname);
    }

  });
  }


});
 app.get("/:customlist", function(req, res) {
   const customlist = req.params.customlist;

   List.findOne({name:customlist},function(err,foundlist){
     if(!err)
     {
       if(!foundlist)
       {
         //Create a new list
        // console.log(customlist);
         const list=new List({
            name:customlist,
            items:defaultitems
         });
         list.save();
         res.redirect("/"+customlist); //so that once the list is firstly created we are also displayed it
       }
       else{
        //Show the list because it already exists
        res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
       }
     }
   });



 });



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//onchange="this.form.submit" :Triggers the delete form to make a post request
//Note that everything is added to the collection lists.
//When we create work in it its bascically the ne dataentry with name work and then items would be added to its items array(of object)
