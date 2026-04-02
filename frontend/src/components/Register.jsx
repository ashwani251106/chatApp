import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Register() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState({
        userName: "",
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setUserData((old) => {
            return {
                ...old,
                [name]: value
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post("http://localhost:5000/register", userData, { withCredentials: true })
            console.log(res.data)
            setLoading(false)
            setUserData({ userName: "", email: "", password: "" })
            navigate("/login")
        } catch (error) {
            setLoading(false)
            console.log(error.response.data.message)
            navigate("/login")
        }
    }

    return (
        <div className="page-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">🔮</div>
                    </div>
                    <h1 className="auth-title">Initialize</h1>
                    <p className="auth-subtitle">// NEW_USER_REGISTRATION</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="userName">Display Name</label>
                        <input
                            className="form-input"
                            type="text"
                            name="userName"
                            id="userName"
                            placeholder="your_alias"
                            required
                            value={userData.userName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email Address</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            id="reg-email"
                            placeholder="you@nexus.io"
                            required
                            value={userData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            id="reg-password"
                            placeholder="••••••••••••"
                            required
                            value={userData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        className="btn btn-primary btn-full"
                        type="submit"
                        id="register-submit-btn"
                        disabled={loading}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? '◌ Initializing...' : '+ Create Account'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">OR</span>
                    <div className="divider-line"></div>
                </div>

                <div className="auth-footer">
                    Already have access?{' '}
                    <a href="/login">Sign in →</a>
                </div>
            </div>
        </div>
    )
}

export default Register