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
        <main className='feed-page' >
            <Nav/>
            <div className="feed">
                <div className="posts">
                    {feed.map(post => (
                        <Post
                        key={post._id}
                        user={post.user}
                        post={post}
                        />
                    ))}
                </div>
            </div>
        </main>
    )
}

export default Feed
