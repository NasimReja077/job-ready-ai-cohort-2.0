import gsap from "gsap";
import "./style.css";


gsap.set(".box", {
    x: -300,
});

gsap.to('.box', {
    x: 1500,
    duration: 1.5,
    delay: 0.6,
    ease: 'power2.inOut',
    repeat: -1,// infenety, 2,5 // numer of animation
    yoyo: true // revase 

})


// Callbacks

gsap.to('.box', {
    x: 500,
    duration: 1.4,
    delay: 0.5,
    ease: 'power2.inOut',

    onUpdate: ()=>{
        console.log('FRAMES')
    }
})