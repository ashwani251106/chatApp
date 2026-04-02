import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function Message({ selectedGroup, socket }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [connectedUsers, setConnectedUsers] = useState([])
    const [typingUsers, setTypingUsers] = useState(new Set())
    const [showReactions, setShowReactions] = useState(null) // message id
    const [reactionDetails, setReactionDetails] = useState(null) // message obj

    const messageEndRef = useRef(null)
    const typingTimeOutRef = useRef(null)

    const currentUser = JSON.parse(localStorage.getItem("User-Info") || '{}')

    const fetchMessages = async () => {
        const groupId = selectedGroup?._id || selectedGroup?.id;
        try {
            const { data } = await axios.get(`http://localhost:5000/message/${groupId}`, {
                withCredentials: true
            })
            setMessages(data)
            
            // Mark all fetched messages as seen if not already
            data.forEach(msg => {
                if (!msg.seenBy?.find(u => u._id === currentUser.id || u === currentUser.id)) {
                    handleMarkSeen(msg._id);
                }
            });
            scrollToBottom()
        } catch (error) {
            console.log(error.message);
        }
    }

    const handleMarkSeen = async (msgId) => {
        try {
            const { data } = await axios.put(`http://localhost:5000/message/${msgId}/seen`, {}, {
                withCredentials: true
            });
            socket.emit("message updated", data);
            setMessages(prev => prev.map(m => m._id === data._id ? data : m));
        } catch (error) {}
    }

    useEffect(() => {
        const groupId = selectedGroup?._id || selectedGroup?.id;
        if (selectedGroup && socket && groupId) {
            fetchMessages()
            socket.emit('join room', groupId)

            const handleMessageReceive = (receivedMessage) => {
                if (receivedMessage.group === groupId) {
                    setMessages(prev => [...prev, receivedMessage])
                    handleMarkSeen(receivedMessage._id)
                    scrollToBottom()
                }
            }
            
            const handleMessageUpdated = (updatedMessage) => {
                if(updatedMessage.group === groupId) {
                    setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m))
                }
            }

            socket.on("message received", handleMessageReceive)
            socket.on("message updated", handleMessageUpdated)

            // Inline system notifications 
            const handleNotification = (notif) => {
                setMessages(prev => [...prev, {
                    isSystemMessage: true,
                    content: notif.message,
                    _id: Date.now() + Math.random() + ""
                }])
                scrollToBottom()
            }
            socket.on("notification", handleNotification)

            socket.on("users in room", (users) => {
                setConnectedUsers(users)
            })
            socket.on("user joined", (user) => {
                setConnectedUsers(prev => {
                    if(!prev.find(u => u.user?.id === user.user?.id || u.id === user.id)) return [...prev, user]
                    return prev
                })
            })
            socket.on("user left", (userId) => {
                setConnectedUsers(prev => prev.filter(user => user?.user?.id !== userId && user?.id !== userId))
            })
            socket.on("user typing", ({ userName }) => {
                setTypingUsers(prev => {
                    const newSet = new Set(prev)
                    newSet.add(userName)
                    return newSet
                })
                scrollToBottom()
            })
            socket.on("user stop typing", ({ userName }) => {
                setTypingUsers(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(userName)
                    return newSet
                })
            })

            return () => {
                socket.emit("leave room", groupId)
                socket.off('message received', handleMessageReceive)
                socket.off('message updated', handleMessageUpdated)
                socket.off('users in room')
                socket.off('user joined')
                socket.off('user left')
                socket.off('user typing')
                socket.off('user stop typing')
                socket.off('notification', handleNotification)
            }
        }
    }, [selectedGroup, socket])

    const scrollToBottom = () => {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }

    const handleTyping = (e) => {
        setNewMessage(e.target.value)

        const groupId = selectedGroup?._id || selectedGroup?.id;
        if (!socket || !groupId) return

        socket.emit("typing", groupId, currentUser.name || currentUser.userName)

        if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current)

        typingTimeOutRef.current = setTimeout(() => {
            socket.emit(" stop typing", groupId)
        }, 2000)
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const groupId = selectedGroup?._id || selectedGroup?.id;
        if (!groupId) return;

        try {
            socket.emit(" stop typing", groupId)
            const { data } = await axios.post("http://localhost:5000/message", {
                content: newMessage,
                group: groupId
            }, {
                withCredentials: true
            })

            setNewMessage("")
            setMessages(prev => [...prev, data])
            socket.emit("new message", data)
            scrollToBottom()
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleReact = async (msgId, emoji) => {
        try {
            const { data } = await axios.put(`http://localhost:5000/message/${msgId}/react`, { emoji }, {
                withCredentials: true
            });
            setShowReactions(null);
            setMessages(prev => prev.map(m => m._id === data._id ? data : m));
            socket.emit("message updated", data);
        } catch(error) {
            console.log(error.message);
        }
    }

    const handleDeleteGroup = async () => {
        if (!window.confirm(`Are you sure you want to permanently delete #${selectedGroup.name}?`)) return;
        
        const groupId = selectedGroup?._id || selectedGroup?.id;
        try {
            await axios.delete(`http://localhost:5000/groups/delete/${groupId}`, {
                withCredentials: true
            });
            window.location.reload(); // Hard reset state effectively
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            alert("Failed to delete group");
        }
    };

    const isAdmin = selectedGroup?.admin === currentUser.id || selectedGroup?.admin?._id === currentUser.id;

    return (
        <div className="message-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>#{selectedGroup.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>
                       {connectedUsers.length} Online {connectedUsers.length > 0 && `(${connectedUsers.map(u => u.user?.userName || u.userName || u.user?.name || u.name).filter(Boolean).join(', ')})`}
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={handleDeleteGroup}
                            style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', padding: '3px 8px', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                            title="Delete this channel permanently"
                        >
                            DELETE CHANNEL
                        </button>
                    )}
                </div>
            </div>

            <div className="message-feed" style={{ flex: 1, paddingBottom: '10px' }}>
                {messages.map((m, i) => {
                    const isMyMessage = (m.sender?._id || m.sender) === currentUser.id;
                    const date = new Date(m.createdAt);
                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const reactionCounts = (m.reactions || []).reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                    }, {});

                    const seenCount = m.seenBy ? m.seenBy.length : 0;

                    if (m.isSystemMessage) {
                        return (
                            <div key={m._id || i} style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                                <span style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-muted)', fontSize: '11px', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', fontStyle: 'italic' }}>
                                    {m.content}
                                </span>
                            </div>
                        )
                    }

                    const myReaction = m.reactions?.find(r => (r.user?._id || r.user) === currentUser.id);
                    const handleDoubleClick = () => {
                        if (myReaction?.emoji === '❤️') {
                            handleReact(m._id, ''); // Unlike if already liked
                        } else {
                            handleReact(m._id, '❤️'); // Like
                        }
                    };

                    return (
                        <div key={m._id || i} className={`message-wrapper ${isMyMessage ? 'outgoing' : 'incoming'}`} style={{ position: 'relative', marginBottom: '16px', maxWidth: '85%' }}>
                            <div className={`message-bubble ${isMyMessage ? 'outgoing' : 'incoming'}`} onDoubleClick={handleDoubleClick} style={{ cursor: 'pointer' }} title="Double click to ❤️">
                                {!isMyMessage && <div style={{ fontSize: '10px', color: 'var(--cyan)', marginBottom: '4px', fontWeight: 'bold' }}>{m.sender?.userName || 'User'}</div>}
                                
                                <div>{m.content}</div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', gap: '15px', fontSize: '9px', opacity: 0.7 }}>
                                    <span>{timeString}</span>
                                    {isMyMessage && (
                                        <span title={`Seen by ${seenCount} users`}>
                                            <span style={{color: seenCount > 0 ? '#38bdf8' : 'inherit'}}>
                                                {seenCount > 0 ? '✓✓' : '✓'}
                                            </span>
                                        </span>
                                    )}
                                </div>
                                
                                {/* Display specific emojis WhatsApp style */}
                                {Object.keys(reactionCounts).length > 0 && (
                                    <div 
                                        onClick={() => setReactionDetails(m)}
                                        style={{ position: 'absolute', bottom: '-8px', right: isMyMessage ? '0px' : 'auto', left: isMyMessage ? 'auto' : '0px', display: 'flex', alignItems: 'center', gap: '2px', background: isMyMessage ? 'var(--cyan-dim)' : '#1f2937', border: '1px solid var(--border-subtle)', padding: '2px 5px', borderRadius: '12px', zIndex: 5, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', cursor: 'pointer' }}
                                        title="Click to see who reacted"
                                    >
                                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                                            <span key={emoji} style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                                                {emoji} {count > 1 && <span style={{opacity: 0.8, marginLeft: '2px', fontSize: '9px', fontWeight: 'bold'}}>{count}</span>}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="react-action-wrapper" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isMyMessage ? 'left' : 'right']: '-30px', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>
                                <span onClick={() => setShowReactions(showReactions === m._id ? null : m._id)}>☻</span>
                                {showReactions === m._id && (
                                    <div style={{ position: 'absolute', top: '-40px', [isMyMessage ? 'right' : 'left']: '0', background: 'var(--glass-bg)', padding: '5px', borderRadius: '20px', display: 'flex', gap: '8px', zIndex: 10, border: '1px solid var(--border-subtle)' }}>
                                        {REACTION_EMOJIS.map(emoji => (
                                            <span key={emoji} onClick={(e) => { e.stopPropagation(); handleReact(m._id, emoji); }} style={{ cursor: 'pointer', transition: 'transform 0.2s', userSelect: 'none' }}>{emoji}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                
                {typingUsers.size > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '20px' }}>
                        {Array.from(typingUsers).join(", ")} {typingUsers.size > 1 ? 'are' : 'is'} typing...
                    </div>
                )}
                <div ref={messageEndRef} />
            </div>

            {/* Reaction Details Modal */}
            {reactionDetails && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }} onClick={() => setReactionDetails(null)}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '20px', minWidth: '250px', border: '1px solid var(--cyan)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Reactions</h3>
                            <button onClick={() => setReactionDetails(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {reactionDetails.reactions.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '20px' }}>{r.emoji}</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{r.user?.userName || 'User'}</div>
                                </div>
                            ))}
                            {(!reactionDetails.reactions || reactionDetails.reactions.length === 0) && (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reactions yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', padding: '15px 20px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-subtle)' }}>
                <input 
                    className="form-input"
                    type="text" 
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    style={{ flex: 1, margin: 0 }}
                />
                <button type="submit" className="btn btn-primary" style={{flexShrink: 0}}>Send</button>
            </form>
        </div>
    )
}

export default Message