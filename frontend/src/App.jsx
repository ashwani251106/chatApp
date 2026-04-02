import React from 'react'
import './App.css'
import Login from './components/Login copy'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Chat from './components/Chat'
import Register from './components/Register'


const router = createBrowserRouter([
  { path: "/login",    element: <Login /> },
  { path: "/chat",     element: <Chat /> },
  { path: "/register", element: <Register /> },
])

function App() {
  return (
  
      <div>
        <RouterProvider router={router} />
      </div>
  
  )
}

export default App