import axios from "axios"
import { useEffect, useState } from "react"

const API = "http://localhost:3000/api/notes"

const App = () => {

  const [notes, setNotes] = useState([])
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState("")

  /* ================= FETCH NOTES ================= */
  function fetchNotes() {
    axios.get(API)
      .then(res => {
        setNotes(res.data.notes)
      })
      .catch(err => {
        console.log("Error fetching notes:", err)
      })
  }

  useEffect(() => {
    fetchNotes()
  }, [])


  /* ================= CREATE NOTE ================= */
  function handleSubmit(e) {
    e.preventDefault()

    const { title, description } = e.target.elements

    axios.post(API, {
      title: title.value,
      description: description.value
    })
      .then(() => {
        fetchNotes()
        e.target.reset() // clear form
      })
      .catch(err => {
        console.log("Error creating note:", err)
      })
  }


  /* ================= DELETE NOTE ================= */
  function handleDeleteNote(noteId) {
    axios.delete(`${API}/${noteId}`)
      .then(() => {
        fetchNotes()
      })
      .catch(err => {
        console.log("Error deleting note:", err)
      })
  }


  /* ================= UPDATE NOTE ================= */
  function handleUpdate(noteId) {
    axios.patch(`${API}/${noteId}`, {
      description: editText
    })
      .then(() => {
        setEditId(null)
        setEditText("")
        fetchNotes()
      })
      .catch(err => {
        console.log("Error updating note:", err)
      })
  }


  return (
    <>
      {/* ================= CREATE FORM ================= */}
      <form className='note-create-form' onSubmit={handleSubmit}>
        <input name='title' type="text" placeholder='Enter title' required />
        <input name='description' type="text" placeholder='Enter description' required />
        <button>Create note</button>
      </form>


      {/* ================= NOTES LIST ================= */}
      <div className="notes">
        {
          notes.map(note => (
            <div className="note" key={note._id}>

              <h2>{note.title}</h2>

              {
                editId === note._id ? (
                  <>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={() => handleUpdate(note._id)}>
                      Save
                    </button>
                    <button onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>{note.description}</p>
                    <button onClick={() => {
                      setEditId(note._id)
                      setEditText(note.description)
                    }}>
                      Edit
                    </button>
                  </>
                )
              }

              <button onClick={() => handleDeleteNote(note._id)}>
                Delete
              </button>

            </div>
          ))
        }
      </div>
    </>
  )
}

export default App
