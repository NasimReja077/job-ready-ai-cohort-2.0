import axios from "axios";

const productApiInstance = axios.create({
     baseURL: "/api/products",
     withCredentials: true,
})

function normalizeImage(image) {
     if (!image || typeof image !== "object") return image;

     const imageUrl = image.url || image.URL || image.secure_url || image.link || "";

     return {
          ...image,
          url: imageUrl,
     };
}

function normalizeVariant(variant) {
     if (!variant || typeof variant !== "object") return variant;

     return {
          ...variant,
          images: Array.isArray(variant.images)
               ? variant.images.map(normalizeImage)
               : [],
     };
}

function normalizeProduct(product) {
     if (!product || typeof product !== "object") return product;

     return {
          ...product,
          images: Array.isArray(product.images)
               ? product.images.map(normalizeImage)
               : [],
          variants: Array.isArray(product.variants)
               ? product.variants.map(normalizeVariant)
               : [],
     };
}

function normalizeProducts(products) {
     if (!Array.isArray(products)) return [];
     return products.map(normalizeProduct);
}

export async function createProduct(formData){
     const response = await productApiInstance.post("/", formData)
     return {
          ...response.data,
          product: normalizeProduct(response.data?.product),
     }
}

export async function getSellerProduct(){
     const response = await productApiInstance.get("/seller")
     return {
          ...response.data,
          products: normalizeProducts(response.data?.products),
     }
}

export async function getAllProducts() {
     const response = await productApiInstance.get("/")
     return {
          ...response.data,
          products: normalizeProducts(response.data?.products),
     }
}

export async function getProductById(productId){
     const response = await productApiInstance.get(`/detail/${productId}`)
     return {
          ...response.data,
          product: normalizeProduct(response.data?.product),
     }
}

export async function addProductVariant(productId, newProductVariant) {
     console.log(newProductVariant)

     const formData = new FormData()

     newProductVariant.images.forEach((image) => {
          formData.append('images', image.file)
     })

     formData.append("stock", newProductVariant.stock)
     formData.append("priceAmount", newProductVariant.price)
     formData.append("attributes", JSON.stringify(newProductVariant.attributes))

     const response = await productApiInstance.post(`/${productId}/variants`, formData)
     return response.data
}