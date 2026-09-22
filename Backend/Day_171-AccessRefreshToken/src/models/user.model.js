import { default as mongoose } from "mongoose";

let userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);



let UserModel = mongoose.model("users", userSchema);
export default UserModel;