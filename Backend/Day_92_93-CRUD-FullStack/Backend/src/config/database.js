import { connect } from 'mongoose';

function connectDB(){
     
     connect(process.env.MONGO_URI)
     .then(() => {
          console.log("Database Connected Successfully✅")
     })
     .catch((err) => {
          console.log('Error:', err);
     })
}

export default connectDB;