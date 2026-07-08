import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
    title: String,
    description: String 
})

const noteModel = model('notes', noteSchema);
export default noteModel;