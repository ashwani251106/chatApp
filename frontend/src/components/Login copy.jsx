import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post("http://localhost:5000/login", {
                email,
                password
            }, {
                withCredentials: true
            })
            setLoading(false)
            localStorage.setItem("User-Info", JSON.stringify(response.data))
            navigate("/chat")
        } catch (error) {
            setLoading(false)
            console.log(error.response?.data.message)
        }
    }

    return (
        <div className="page-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">⚡</div>
                    </div>
                    <h1 className="auth-title">NexusChat</h1>
                    <p className="auth-subtitle">// ACCESS_TERMINAL_v2.0</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            className="form-input"
                            type="text"
                            name="email"
                            id="email"
                            placeholder="user@nexus.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="btn btn-primary btn-full"
                        type="submit"
                        id="login-submit-btn"
                        disabled={loading}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? '◌ Authenticating...' : '→ Access Portal'}
                    </button>
                </form>

                <div className="auth-footer">
                    No account?{' '}
                    <a href="/register">Initialize one →</a>
                </div>
            </div>
        </div>
    )
}

export default Login