
import React, { useRef } from "react";
const Form2 = () => {

     const inputRef = useRef({})
     console.log(inputRef)

     // useRef - Hook for creating a reference to a DOM element, It allows you to access and manipulate the properties and methods of a DOM element directly from your React component.
     
     // In this code, the useRef hook is used to create a reference to an object that will hold references to multiple input elements in the form. The inputRef.current object will store references to the name, age, and email input fields.

     // The ref attribute is used on each input element to assign the corresponding reference to the inputRef.current object. This allows you to access the values of the input fields directly through the inputRef.current object without needing to use state or event handlers.

     // The inputRef.current object will be updated with the current values of the input fields whenever the user interacts with them. This way, you can easily retrieve the values of the input fields when needed, such as when submitting the form or performing other actions.
     return (
          <div className="w-full h-screen flex items-center justify-center">
               <form 
               onSubmit={(e) => e.preventDefault()}
               className="w-60 h-60 bg-gray-300 rounded-md flex flex-col items-center justify-center gap-5">
                    <input
                         name="name"
                         ref={(e) => inputRef.current.name = e}
                         className="border p-2 rounded-md"
                         type="text"
                         placeholder="Enter your Name"
                    />
                    <input
                         name="age"
                         ref={(e) => inputRef.current.age = e}
                         className="border p-2 rounded-md"
                         type="number"
                         placeholder="Enter Your Age"
                    />
                    <input
                         name="email"
                         ref={(e) => inputRef.current.email = e}
                         className="border p-2 rounded-md"
                         type="email"
                         placeholder="Enter Your Email"
                    />
                    <input
                         className="px-8 active:scale-95 py-3 bg-blue-500 rounded-md"
                         type="submit"
   
                    />
               </form>
               <div>
                    <h1 className="text-2xl font-bold">Form Data:</h1>
                    <p>Name: {inputRef.current.name?.value}</p>
                    <p>Age: {inputRef.current.age?.value}</p>
                    <p>Email: {inputRef.current.email?.value}</p>
               </div>
          </div>
          );
     };

export default Form2;
