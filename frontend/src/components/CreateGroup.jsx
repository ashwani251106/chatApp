import axios from 'axios'
import React, { useEffect, useState } from 'react'
import '../App.css'

function CreateGroup() {
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [group, setGroup] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("User-Info")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleChange = (e) => {
    const { value, name } = e.target
    setGroup((old) => ({
      ...old,
      [name]: value
    }))
  }

  // Admin only
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:5000/groups/create",
        group,
        { withCredentials: true }
      )
      console.log(response.data)
      setGroup({ name: "", description: "" })
      setShowForm(false)
      // Broadcast event so My Channels list updates!
      window.dispatchEvent(new CustomEvent('groupCreated'))
    } catch (error) {
      console.log(error.response?.message?.data)
    } finally {
      setLoading(false)
    }
  }

  // Removed admin check

  return (
    <div>
      <button
        className={`btn ${showForm ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
        id="toggle-create-group-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '✕ Cancel' : '+ New Group'}
      </button>

      {showForm && (
        <div className="create-group-panel" style={{ position: 'absolute', top: '70px', right: '24px', zIndex: 100 }}>
          <div className="create-group-panel-title">
            <span>🛸</span> Create Channel
          </div>

          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label className="form-label" htmlFor="group-name">Channel Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                id="group-name"
                placeholder="nexus-general"
                value={group.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="group-description">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                id="group-description"
                placeholder="Describe the purpose of this channel..."
                value={group.description}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              type="submit"
              id="create-group-submit-btn"
              disabled={loading}
            >
              {loading ? '◌ Creating...' : '🛸 Launch Channel'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default CreateGroup