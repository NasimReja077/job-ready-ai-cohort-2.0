import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: [true, "Name is required"],
          },
          email: {
               type: String,
               required: [true, "Email is required"],
          },
          password: {
               type: String,
               required: [true, "Password is required"],
          },
          refreshToken: {
               type: String,
          },
     },
  { timestamps: true, }
);

const UserModel = mongoose.model("users", userSchema);
export default UserModel;
