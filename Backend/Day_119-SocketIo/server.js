import { Socket } from "dgram";
import app from "./src/app.js"
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer(app)
const io = new Server(httpServer, { /* options */ })

io.on("connection", (Socket) => {
     console.log("new connection created")

     Socket.on("message", (msg) => {
          console.log('user fired message event')
          console.log(msg)
          io.emit("abc", msg)
     })
})

httpServer.listen(3000, () => {
    console.log("server is running on port 3000")
});


// io => server
// socket => single user
// on => event ko listen
// emit => event ko fire krna
// io → server instance
// socket → connected client
// emit → send event
// on → receive event
// broadcast → send to others
// rooms → group users

// socket.emit() 
// 👉 Send event only to the current client (sender itself) || “Sirf usi user ko bhejo jisne event trigger kiya”
// Example: socket.emit("message", "Hello from server");
// Flow: User A → Server → User A (only)


// socket.broadcast().emit()
// 👉 Send event to ALL users EXCEPT sender || “Sabko bhejo, lekin jisne bheja usko nahi”
// Example: socket.broadcast.emit("message", "User joined");
// Flow: User A → Server → User B, C, D (NOT A)

// io.emit()
// 👉 Send event to ALL users INCLUDING sender || “Sabko bhejo, including sender”
// Example: io.emit("message", "New message");
// Flow: User A → Server → A, B, C, D (everyone)