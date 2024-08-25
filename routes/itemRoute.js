import express from 'express';
import  {addItem,listItems,removeItem,updateItem,search_item}  from '../controllers/itemController.js';
import multer from 'multer';

const itemRouter = express.Router();
//image Storage engine
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}_${file.originalname}`)
    }

})

const upload = multer({storage:storage})

itemRouter.post('/add',upload.single("image"),addItem)
itemRouter.get('/list',listItems)
itemRouter.post("/remove",removeItem)
itemRouter.post("/update",upload.single("image"),updateItem)
itemRouter.post("/search",search_item)









export default itemRouter;