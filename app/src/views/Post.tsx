import { useEffect, useRef, useState } from 'react'
import { ActionFunctionArgs, Form } from 'react-router-dom'
import { fetchWithErrorHandling } from '../helpers/fetchWithErrorHandling'
import { ErrorPage } from './ErrorPage'

type FeedData = {
  id: number,
  author: string,
  createdAt: Date,
  content: string,
  image?: string
}[]

export async function feedLoader() {
  const response = await fetch('/api/v1/post')
  if (response.status === 401) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return (await response.json()) as FeedData
}

export async function addPostAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const post = await fetchWithErrorHandling('/api/v1/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: formData.get('content'),
    }),
  })
  return { post }
}

export function Post() {
  const [data, setData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortedData = data?.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })

  const hasFetched = useRef(false)
  useEffect(() => {
    if (hasFetched.current) {
      return
    }

    async function load() {
      setLoading(true)
      try {
        setData(await fetchWithErrorHandling(`/api/v1/post`))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
      setLoading(false)
    }

    load()
    hasFetched.current = true
  }, [])

  if (loading || !data) {
    return <div>Loading...</div>
  }

  if (error) {
    return <ErrorPage />
  }

  return (
    <>
      <h1>Post</h1>

      <p id="connected">Connected as: </p>
    
      <div id="server-status"></div>
      
      <div className="post-list-container">
        <h2>Posts</h2>
        <ul id="post-list">
          {sortedData?.map((post) => (
            <li className="single-post" key={post.id}>
              <div className="single-post-author">{post.author}</div>
              <div className="single-post-date">{new Date(post.createdAt).toLocaleString('fr-FR', {
                day: 'numeric',
                year: 'numeric',
                month: 'numeric', 
                hour: 'numeric',
                minute: 'numeric',
              })}</div>
              <div className="single-post-content">
                {post.content.replace('\n', '<br>')}
              </div>
              {post.image &&
                <div className="single-post-image-container">
                  <img src={'/api/img/post_image/' + post.image} alt={post.image} className="single-post-image" />
                </div>
              }
            </li>
          ))}
        </ul>
        {/* <Form id="post-form" method="post" encType="multipart/form-data"> */}
        <Form id="post-form" method="post">
          <div className="row">
            <label htmlFor="content">Content: </label>
            <textarea name="content" id="content" cols={100} rows={15} placeholder="Your publication" />
          </div>
          {/* <div className="row">
            <label htmlFor="image">Image (max 8 MB): </label>
            <input type="file" name="image" id="image" accept="image/png, image/jpeg, image/jpg" />
          </div> */}
          <button type="submit">Post</button>
        </Form>
      </div>
    </>
  )
}