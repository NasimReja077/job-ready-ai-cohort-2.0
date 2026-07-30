import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
     try {
          const { title, description, priceAmount, priceCurrency = "INR" } = req.body;
          const seller = req.user;

          if (!req.files || req.files.length === 0) {
               return res.status(400).json({ 
                    message: "At least one image is required", 
                    success: false 
               });
          }

          // Upload all images
          const images = await Promise.all(
               req.files.map(async (file) => {
                    return await uploadFile({
                         buffer: file.buffer,
                         fileName: file.originalname,
                         mimeType: file.mimetype
                    });
               })
          );

          const product = await productModel.create({
               title,
               description,
               price: { 
                    amount: Number(priceAmount), 
                    currency: priceCurrency 
               },
               images,
               seller: seller._id
          });

          res.status(201).json({ 
               message: "Product Created Successfully", 
               success: true, 
               product 
          });

     } catch (err) {
          console.error("createProduct failed:", err);
          res.status(500).json({
               message: "Failed to create product",
               success: false,
               error: err.message
          });
     }
}

export async function getSellerProducts(req, res) {
     const seller = req.user;

     if (!seller) {
          return res.status(401).json({ message: "Unauthorized" });
     }

     const products = await productModel.find({ seller: seller._id });

     res.status(200).json({
          message: "Products fetched successfully",
          success: true,
          products
     })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })

}

export async function getAllProducts(req, res) {
     const products = await productModel.find()

     return res.status(200).json({
          message: "Products fetched successfully",
          success: true,
          products
     })
}

export async function addProductVariant(req, res){
     const productId = req.params.productId;

     const product = await productModel.findOne({
          _id: productId,
          seller: req.user._id
     });

     if(!product){
          return res.status(404).json({
               message: "Product not found",
               success: false
          })
     }
     const files = req.files;
     const images = []
     if (files || files.length !== 0){
          (await Promise.all(files.map(async (file) => {
               const image = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
               })
               return image
          }))).map(image => images.push(image))
     }

     const price = req.body.priceAmount
     const stock = req.body.stock
     const attributes = JSON.parse(req.body.attributes || "{}")

     console.log(price)

     product.variants.push({
          images,
          price: {
               amount: Number(price) || product.price.amount,
               currency: req.body.priceCurrency || product.price.currency
          },
        stock,
        attributes
     })
     await product.save();
     return res.status(200).json({
          message: "Product variant added successfully",
          success: true,
          product
     })
}