import app from "./src/app.js"
// ".js" is added because the module system is set to "NodeNext" in tsconfig.json

const PORT = 3000;

app.listen(PORT, () => {
     console.log(`Server is running on Port ${PORT}`);
})
