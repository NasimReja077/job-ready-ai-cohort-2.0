import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post.jsx'
import { usePost } from '../hook/usePost.js/index.js'

const Feed = () => {
     const { feed, handleGetFeed, loading } = usePost()

     useEffect(() => {
          handleGetFeed()
     }, [ handleGetFeed])

     if(loading || !feed){
          return (
               <main><h1>Feed is Loading...</h1></main>
          )
     }
     console.log(feed)


     return (
        <main className='feed-page' >
            <div className="feed">
                <div className="posts">
                    {feed.map(post=>{
                        return <Post user={post.user} post={post} />
                    })}
                </div>
            </div>
        </main>
    )
}

export default Feed
