import itemModel from "../models/itemModel.js";
import fs from "fs";
import algoliasearch from "algoliasearch";

// add item
export const addItem = async (req, res) => {
    let image_filename = `${req.file.filename}`;
    const item  = new itemModel({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        image: image_filename,
        quantity: req.body.quantity
    })
    try{
        await item.save();
        res.json({success:true,message:"Item added successfully"})
    } catch(error){
        res.json({success:false,message:"Item could not be added"})
    }
}

//list item

export const listItems = async (req, res) => {
try{
    const items = await itemModel.find({});
    res.json({success:true,data:items});
}catch(error){
    res.json({success:false,message:"Items could not be fetched"})
}

}

//delete item

export const removeItem = async (req, res) => {
    try {
        const item = await itemModel.findById(req.body.id);
        fs.unlink(`uploads/${item.image}`,()=>{});

        await itemModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: "Item could not be deleted" });
    }
    }

//update item
export const updateItem = async (req, res) => {
    try {
        
        const item = await itemModel.findById(req.body.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        
        item.name = req.body.name || item.name;
        item.description = req.body.description || item.description;
        item.category = req.body.category || item.category;
        item.price = req.body.price || item.price;
        item.quantity = req.body.quantity || item.quantity;

        
        if (req.file) {
            
            if (item.image) {
                fs.unlink(`uploads/${item.image}`, (err) => {
                    if (err) console.error("Failed to delete old image:", err);
                });
            }

           
            item.image = req.file.filename;
        }

        
        await item.save();
        res.json({ success: true, message: "Item updated successfully" });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ success: false, message: "Item could not be updated" });
    }
};

//search items

export const search_item = async (req, res) => {
    try {
      const data = await itemModel.find({}); // Fetch data from your database
  
      const records = data.map((item) => ({
        objectID: item._id,
        item_image: `${process.env.BACKENDBASEURL}/images/${item.image}`  , // Use _id from MongoDB as objectID
        ...item.toObject(), // Spread the rest of the document fields
      }));
  
      const client = algoliasearch(
        process.env.APPID,
        process.env.WRITEAPI
      );
  
      const index = client.initIndex("tilda_items");
  
      await index.saveObjects(records, { autoGenerateObjectIDIfNotExist: true });
  
      res.json({ success: true, message: "Items successfully indexed in Algolia" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Items could not be searched", error: error.message });
    }
  };