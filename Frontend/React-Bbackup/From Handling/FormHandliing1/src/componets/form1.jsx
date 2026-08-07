import React from "react";
import { useState } from "react";

const Form1 = () => {
     const [formData, setFormData] = useState({
          name: "",
          age: "",
          email: ""
     });

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setFormData((prevData) => ({
               ...prevData,
               [name]: value
          }));
     };

     const handleSubmit = (e) => {
          e.preventDefault();
          console.log(formData);
     };

     return (
          <div className="w-full h-screen flex items-center justify-center">
               <form className="w-60 h-60 bg-gray-300 rounded-md flex flex-col items-center justify-center gap-5" onSubmit={handleSubmit}>
                    <input
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         className="border p-2 rounded-md"
                         type="text"
                         placeholder="Enter your Name"
                    />
                    <input
                         name="age"
                         value={formData.age}
                         onChange={handleInputChange}
                         className="border p-2 rounded-md"
                         type="number"
                         placeholder="Enter Your Age"
                    />
                    <input
                         name="email"
                         value={formData.email}
                         onChange={handleInputChange}
                         className="border p-2 rounded-md"
                         type="email"
                         placeholder="Enter Your Email"
                    />
                    <input
                         className="px-8 active:scale-95 py-3 bg-blue-500 rounded-md"
                         type="submit"
                         value="Submit"
                    />
               </form>
               <div>
                    <h1 className="text-2xl font-bold">Form Data:</h1>
                    <p>Name: {formData.name}</p>
                    <p>Age: {formData.age}</p>
                    <p>Email: {formData.email}</p>
               </div>
          </div>
          );
     };

export default Form1;
