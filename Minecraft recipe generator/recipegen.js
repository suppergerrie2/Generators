/* global createInput */
/* global createSelect */
/* global createButton */
/* global createDiv */
var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

var input;
var selectRecipeType;

var addItemButton;

var shapedDiv;
var itemSelects = [];
var itemInputs = [];
var itemInputsDiv;
var buttonRemove;
var buttonRemove2;
var warningShaped;

var output;

var generateButton;

var shaped = true;

function setup(){
    selectRecipeType = createSelect();
    selectRecipeType.option("Shaped recipe");
    selectRecipeType.option("Shapeless recipe");
    selectRecipeType.changed(recipeTypeChanged);
    selectRecipeType.position(5,5);
    
    /*input = createInput();
    input.input(inputEvent);
    input.position(5,30);    */
    
    addItemButton = createButton("Add item");
    addItemButton.mousePressed(addItem);
    addItemButton.position(5, 30);
    
    shapedDiv = createDiv("");
    shapedDiv.position(5, 60);
    
    itemInputsDiv = createDiv("");
    itemInputsDiv.position(5, 140);
    
    for(var x = 0; x < 3; x++){
        for (var y = 0; y < 3; y++) {
            var tmp = createSelect().parent(shapedDiv);
            tmp.position(x*80, y*25);
            tmp.size(75, 20);
            tmp.option("");
            itemSelects.push(tmp);
        }
    }
    
    addItem();
    
    buttonRemove = createButton("-");
    buttonRemove.parent(itemInputsDiv);
    buttonRemove.position(itemInputs[0].width+5, 0);
    buttonRemove.mousePressed(removeItem);
    
    buttonRemove2 = createButton("-").parent(itemInputsDiv).position(itemInputs[0].width+5, 0).mousePressed(removeItem);
    
    if(itemInputs.length<=2){
        buttonRemove.hide();
        buttonRemove2.hide();
    }
    
    output = createInput();
    console.log(shapedDiv.width);
    output.position(3*80 + 5, 60+1*25);
    
    generateButton = createButton("Generate recipe");
    generateButton.position(3*80 + 5, 140);
    generateButton.mousePressed(generate);
    
    warningShaped = createP("Shaped recipes smaller then 3x3 may not work correctly!").position(5,180);
}

function draw(){
    
}

function addItem(){
    if(itemInputs.length<9){
     // var div = createDiv("");
        var tmp = createInput();
       
   //     div.parent(itemInputsDiv);
    //    div.position(0, itemInputs.length*25);
        
        tmp.parent(itemInputsDiv);
        tmp.position(0, itemInputs.length*25);
        tmp.input(itemNameChanged);
        
        itemInputs.push(tmp);
    }
    
    if(buttonRemove){
        buttonRemove.show();
        buttonRemove2.show();
        buttonRemove.position(itemInputs[0].width+5, (itemInputs.length-1)*25);
    }
}

function removeItem(){
    if(itemInputs.length>1){
        itemInputs.pop().remove();
        if(buttonRemove){
            buttonRemove.position(itemInputs[0].width+5, (itemInputs.length-1)*25);
            
            if(itemInputs.length<2){
                buttonRemove.hide();
                buttonRemove2.hide();
            }
        }
        itemNameChanged();
    } 
}

function itemNameChanged() {
    for (var i = 0; i < itemSelects.length; i++) {
        var pos = itemSelects[i].position();
        
        itemSelects[i].remove();
        itemSelects[i] = createSelect().parent(shapedDiv);
        itemSelects[i].position(pos.x, pos.y);
        itemSelects[i].size(75, 20);
        itemSelects[i].option("");
        
        for(var j = 0; j < itemInputs.length; j++){
            if(itemInputs[j].value().length>0){
                itemSelects[i].option(itemInputs[j].value());
            }
        }
    }
}


function recipeTypeChanged(){
    console.log(this.value());
    
    if(this.value()=="Shaped recipe"){
        shapedDiv.show();
        warningShaped.show();
        shaped = true;
    } else {
        shapedDiv.hide();
        warningShaped.hide();
        shaped = false;
    }
}

function generate(){
  if(output.value().length<3){
      alert("Please enter an output item.");
      console.log("Please enter an output item.");
      return;
  }
  if(output.value().indexOf(":")==-1){
      alert("output is not valid, output must contain a (mod)id, a \":\" and an item name");
      return;
  }
  var l=0;
  if(shaped){
      for (var i = 0; i < itemSelects.length; i++) {
          l+=itemSelects[i].value().length;
      }
  } else {
      for (var i = 0; i < itemInputs.length; i++) {
          l+=itemInputs[i].value().length;
      }
  }
  if(l<1){
      if(shaped){
          alert("Please specify a recipe.");
      } else {
          alert("Please specify input items.");
      }
      return;
  }
  
  var type;
  if(shaped){
      type="minecraft:crafting_shaped";
  } else {
      type="minecraft:crafting_shapeless";
  }
  
  var items = [];
  if(shaped){
      for (var i = 0; i < itemSelects.length; i++) {
          items.push(itemSelects[i].value());
      }
  } else {
      for (var i = 0; i < itemInputs.length; i++) {
          items.push(itemInputs[i].value());
      }
  }
  
  var counts = {};
  for (var i = 0; i < items.length; i++) {
      counts[items[i]] = 1 + (counts[items[i]] || 0);
  }
  
  console.log(counts);
  
  var key = "";
  var itemToLetter = {};
  
  var ingredients = "";
  for(var id in counts){
      ingredients+="{\n";
      if(id.length>1){
          ingredients+="  \"item\": \"" + id.toLowerCase() + "\",\n  \"data\": 0\n},";
      }
  }
  ingredients = ingredients.substr(0, ingredients.length-1);
  
  var j = 0;
  for(id in counts){
          if(id.length>1){
          key+=(
          "\"" + letters[j] + "\": [\n" +
          "      {\n"+
          "        \"item\": \"" + id.toLowerCase() + "\",\n"+
          "        \"data\": 0\n"+
          "      }\n"+
          "    ],\n    ");
          
          itemToLetter[id]=letters[j];
          
          j++;
      }
  }
  key=key.substring(0, key.length-6);
  key+="\n";
  
  var pattern = "\"";
  
  var lastHasKey = 0;
  for (var y = 0; y < 3; y++) {
      var containsKey = 0;
      for (var x = 0; x < 3; x++) {
          console.log(itemSelects[y+x*3].value());
          if(itemSelects[y+x*3].value().length>1){
              if(x==2){
                  lastHasKey++;
              }
              containsKey++;
              console.log(itemSelects[y+x*3].value());
              pattern+=itemToLetter[itemSelects[y + x*3].value()];
          } else {
              pattern+=" ";
          }
      }
      if(y!=1 && containsKey==0){
          pattern=pattern.substr(0,pattern.length-3);
      } else {
          pattern+="\",\n    \"";
      }
  }
  
  if(lastHasKey==0){
    pattern = "\"";
    for (var y = 0; y < 3; y++) {
      var containsKey = 0;
      for (var x = 0; x < 2; x++) {
          console.log(itemSelects[y+x*3].value());
          if(itemSelects[y+x*3].value().length>1){
              containsKey++;
              pattern+=itemToLetter[itemSelects[y + x*3].value()];
          } else {
              pattern+=" ";
          }
      }
      if(y!=1 && containsKey==0){
          pattern=pattern.substr(0,pattern.length-2);
      } else {
          pattern+="\",\n    \"";
      }
  }
  }
  
  pattern = pattern.substring(0,pattern.length-7);
  var fileContents
  if(shaped){
      fileContents = 
      "{ \n"+
      "  \"type\": \"" + type + "\",\n"+
      "  \"pattern\": [\n    "+
        pattern+
      "  ],\n"+
      "  \"key\": {\n    "+
        key+
      "  },\n"+
      "  \"result\": {\n"+
      "    \"item\": \"" + output.value().toLowerCase() + "\",\n"+
      "    \"data\": 0\n"+
      "  }\n"+
      "}";
  } else {
      fileContents = 
      "{ \n"+
      "  \"type\": \"" + type + "\",\n"+
      "  \"ingredients\": [\n"+
      ingredients+
      "  ],\n"+
      "  \"result\": {\n"+
      "    \"item\": \"" + output.value().toLowerCase() + "\",\n"+
      "    \"data\": 0\n"+
      "  }\n"+
      "}";
  }
  
    console.log(fileContents);
    
    var link = createA(makeTextFile(fileContents), "test");
    link.position(3*80+25, 165);
    link.attribute("download", output.value().split(":")[1] + ".json");
    link.elt.click();
    console.log(link.html());
    link.remove();
}

var textFile = null,
makeTextFile = function (text) {
    var data = new Blob([text], {type: 'application/json'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
};