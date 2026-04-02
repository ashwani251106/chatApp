import React, { useEffect, useState } from 'react'
import SearchAndJoinGroup from './SearchAndJoinGroup'
import CreateGroup from './CreateGroup'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'
import Message from './message'
import io from "socket.io-client"
const ENDPOINT = "http://localhost:5000"

function Chat() {
  const [selectedGroup,setSelectedGroup] = useState(null)
  const [socket,setSocket] = useState(null)

   useEffect(()=>{
               const userInfo = JSON.parse(localStorage.getItem("User-Info") || {})
      const newSocket = io(ENDPOINT,{
          auth: {user:userInfo}
      })
      setSocket(newSocket)
      return ()=>{
          if(newSocket){
              newSocket.disconnect()
          }
      }},[])
     
     
  
  const navigate = useNavigate()
  const name = JSON.parse(localStorage.getItem("User-Info")).name
  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("http://localhost:5000/logout", {}, { withCredentials: true })
      console.log(res.data.message)
      navigate("/login")
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="chat-layout">
     
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">⚡</div>
            <span className="sidebar-brand-name">NexusChat</span>
          </div>
          <span className="chip chip-cyan">LIVE</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">My Channels</p>
          <SearchAndJoinGroup onSelectGroup={setSelectedGroup} />
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-info-name">{name}</div>
            <div className="user-info-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            id="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────── */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-header-info">
            <div>
              <h2 className="chat-header-title">Command Center</h2>
              <div className="chat-header-meta">
                <span className="status-dot"></span>
                System operational
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
          
          
            <CreateGroup />
          </div>
        </header>

        {selectedGroup ? (
          socket && <Message selectedGroup={selectedGroup} socket={socket}/>
        ) : (
          <div className="message-feed">
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3 className="empty-state-title">No channel selected</h3>
              <p className="empty-state-desc">
                Join or search for a group to start messaging in the NexusChat network.
              </p>
            </div>
          </div>
        )} 
      </main>
    </div>
  )
}

export default Chat