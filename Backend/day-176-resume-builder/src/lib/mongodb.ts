import mongoose from "mongoose"

export const connectDB = async () => {
     try {
          await mongoose.connect(process.env.MONGo_URI!)
          console.log("mongodb connact")
     } catch (error) {
          console.log("error in connation db", error)
     }
}
