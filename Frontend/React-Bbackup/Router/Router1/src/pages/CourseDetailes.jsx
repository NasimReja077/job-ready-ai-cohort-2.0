import { useParams } from 'react-router'

const CourseDetailes = () => {
  const params = useParams() // useParams is a hook provided by react-router that allows you to access the parameters of the current route. In this case, it will give you access to the courseId parameter from the URL.
  console.log(params)

  return (
    <div className='text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-x-1/2' >CourseDetailes</div>
  )
}

export default CourseDetailes