import React, { useEffect } from 'react'
import "../style/feed.scss"
import Post from '../components/Post.jsx'
import { usePost } from '../hook/usePost.js'
import Nav from '../../shared/components/Nav'


const Feed = () => {
     const { feed, handleGetFeed, loading, handleLike, handleUnLike } = usePost()

    useEffect(() => {
        handleGetFeed()
    }, [])

     if(loading || !feed){
          return (
               <main><h1>Feed is Loading...</h1></main>
          )
     }
     console.log(feed)


     return (
        <>
         <Nav/>
        <main className='feed-page' >
            <div className="feed">
                <div className="posts">
                    {feed.map(post => (
                        <Post
                        key={post._id}
                        user={post.user}
                        post={post}
                        handleLike={handleLike}
                        handleUnLike={handleUnLike}
                        />
                    ))}
                </div>
            </div>
        </main>
        </>
    )
}

export default Feed
