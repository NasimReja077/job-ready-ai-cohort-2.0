const About = () => {
  console.log('About Rendaring')
  return (
    <div>
      About
    </div>
  )
}

export default About

// why about is re-render
// react hass rule if parent componet re-render then also child componte re-render
// re-render = mins Vercual DOM update
// React.memo- funtanal component memoriz
// useCallbback- function memorize
// useMemo - valu memorize