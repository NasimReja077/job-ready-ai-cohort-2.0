import React from "react"
// const About1 = React.memo(() => {
//      console.log(`About rendring...`)
//      return(
//           <div>
//                About from Reactmemo
//                <p>About not re-render</p>
//           </div>
//      )
// })
// export default About1



// const About1=()=> {
//      console.log(`About rendring...`)
//      return(
//           <div>
//                About from Reactmemo
//           </div>
//      )
// }
// export default React.memo(About1) 


const About1 = () => {
     console.log(`About rendring...`)
     return(
          <div>
               About from Reactmemo
               <p>About not re-render</p>
          </div>
     )
}
export default React.memo(About1, (prevProp, nextProp) => {
     // const same = prev.user.id === next.user.id;
     // const same = prev.user.name === next.user.name;
     // console.log(same ? " no re-render" : "re-render");
     // return same

     return prevProp.user.id === nextProp.user.id
})