import axios from 'axios'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import '../App.css'

/* ── Valorant-style staggered item hook ───────────────────── */
function useStaggerReveal(items) {
  const [revealed, setRevealed] = useState([])
  useEffect(() => {
    setRevealed([])
    if (!items.length) return
    items.forEach((_, i) => {
      setTimeout(() => setRevealed(r => [...r, i]), i * 120 + 60)
    })
  }, [items.length]) // eslint-disable-line
  return revealed
}

/* ── Particle burst on JOIN ───────────────────────────────── */
function ParticleBurst({ active }) {
  if (!active) return null
  return (
    <div className="particle-burst" aria-hidden>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="particle" style={{ '--i': i }} />
      ))}
    </div>
  )
}

/* ── Radar sweep animation ────────────────────────────────── */
function RadarScanner({ scanning }) {
  return (
    <div className={`radar-wrap ${scanning ? 'active' : ''}`} aria-hidden>
      <div className="radar-ring r1" />
      <div className="radar-ring r2" />
      <div className="radar-ring r3" />
      <div className="radar-sweep" />
      <div className="radar-dot center-dot" />
    </div>
  )
}

function SearchAndJoinGroup({ onSelectGroup }) {
  const [name, setName] = useState("")
  const [groups, setGroups] = useState([])
  const [joinSuccess, setJoinSuccess] = useState("")
  const [joinType, setJoinType] = useState("success")
  const [allGroup, setAllGroup] = useState([])
  const [scanning, setScanning] = useState(false)
  const [joiningId, setJoiningId] = useState(null)
  const [burstId, setBurstId] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [leavingId, setLeavingId] = useState(null)
  const [currentUser, setCurrentUser] = useState({})
  const progressRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem("User-Info") || '{}'))
  }, [])

  const revealedResults = useStaggerReveal(groups)

  const fetchMyGroups = useCallback(async () => {
    try {
      const res = await axios.post("http://localhost:5000/groups", {}, { withCredentials: true })
      if (res.data) setAllGroup(res.data)
    } catch (error) {
      console.error("Fetch groups failed:", error.message)
    }
  }, [])

  useEffect(() => { fetchMyGroups() }, [fetchMyGroups])

  // Listen for group creation event from CreateGroup.jsx
  useEffect(() => {
    const handleGroupCreated = () => fetchMyGroups();
    window.addEventListener('groupCreated', handleGroupCreated);
    return () => window.removeEventListener('groupCreated', handleGroupCreated);
  }, [fetchMyGroups]);

  // Autocomplete / Search suggestions on type
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!name.trim() || scanning) {
        if (!name.trim() && !scanning) setGroups([]);
        return;
      }
      try {
        const res = await axios.post("http://localhost:5000/groups/get", { name: name.trim() }, { withCredentials: true })
        // Filter out groups the user has already joined
        const suggestions = res.data.filter(g => !allGroup.find(myG => myG.id === g._id));
        setGroups(suggestions);
      } catch (error) {
        setGroups([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [name, allGroup, scanning]);


 
  const runScanProgress = () => {
    setScanProgress(0)
    let p = 0
    progressRef.current = setInterval(() => {
      p += Math.random() * 18 + 4
      if (p >= 92) { clearInterval(progressRef.current); p = 92 }
      setScanProgress(Math.min(p, 92))
    }, 120)
  }

  const finishScanProgress = () => {
    clearInterval(progressRef.current)
    setScanProgress(100)
    setTimeout(() => setScanProgress(0), 800)
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (scanning) return
    setScanning(true)
    setGroups([])
    setJoinSuccess("")
    runScanProgress()
    const searchName = name
    setName("")
    try {
      const response = await axios.post("http://localhost:5000/groups/get", { name: searchName }, { withCredentials: true })
      finishScanProgress()
      setGroups(response.data)
    } catch (error) {
      finishScanProgress()
      const msg = error.response?.data?.message || 'No results found'
      setJoinSuccess(msg)
      setJoinType("error")
      setTimeout(() => setJoinSuccess(""), 3000)
    } finally {
      setScanning(false)
    }
  }

  const handleJoinGroup = async (e, groupId, idx) => {
    e.preventDefault()
    setJoiningId(groupId)
    try {
      const joinGroup = await axios.post(`http://localhost:5000/groups/join/${groupId}`, {}, { withCredentials: true })
      // Burst effect
      setBurstId(idx)
      setTimeout(() => setBurstId(null), 900)
      setJoinSuccess(joinGroup.data.message)
      setJoinType("success")
      setTimeout(() => setJoinSuccess(""), 3000)
      setAllGroup(prev => [...prev, joinGroup.data])
      // Remove from search results after delay
      setTimeout(() => setGroups(prev => prev.filter(g => g._id !== groupId)), 600)
    } catch (error) {
      setJoinSuccess(error.response?.data?.message || 'Failed to join')
      setJoinType("error")
      setTimeout(() => setJoinSuccess(""), 3000)
    } finally {
      setJoiningId(null)
    }
  }

  const handleLeave = async (groupId) => {
    setLeavingId(groupId)
    try {
      await axios.post(`http://localhost:5000/groups/leave/${groupId}`, {}, { withCredentials: true })
      setTimeout(() => {
        setAllGroup(prev => prev.filter(g => g.id !== groupId))
        setLeavingId(null)
      }, 400)
    } catch (error) {
      console.log(error.message)
      setLeavingId(null)
    }
  }

  const handleDeleteGroup = async (e, groupId, groupName) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to permanently delete #${groupName}?`)) return
    setLeavingId(groupId)
    try {
      await axios.delete(`http://localhost:5000/groups/delete/${groupId}`, { withCredentials: true })
      setAllGroup(prev => prev.filter(g => g.id !== groupId))
      setLeavingId(null)
      window.location.reload() // hard reset
    } catch (error) {
      console.log(error.message)
      setLeavingId(null)
      alert("Failed to delete channel")
    }
  }

  return (
    <div className="saj-root">

      {/* ── My Groups ─────────────────────────────────── */}
      {allGroup.length > 0 && (
        <div className="my-groups-section">
          {allGroup.map((group, idx) => (
            <div
              key={idx}
              id={`my-group-${idx}`}
              className={`group-item ${leavingId === group.id ? 'leaving' : ''}`}
              onClick={() => onSelectGroup && onSelectGroup(group)}
            >
              <div className="group-item-avatar">
                {group.name?.charAt(0)?.toUpperCase() || '#'}
              </div>
              <div className="group-item-info">
                <div className="group-item-name">{group.name}</div>
                <div className="group-item-desc">{group.description || 'No description'}</div>
              </div>
              <div className="group-item-action">
                {group.admin === currentUser.id || group.admin?._id === currentUser.id ? (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}
                    onClick={(e) => handleDeleteGroup(e, group.id || group._id, group.name)}
                    title="Delete channel permanently"
                  >
                    🗑
                  </button>
                ) : (
                  <button
                    className="btn btn-danger btn-sm"
                    id={`leave-group-${idx}`}
                    onClick={(e) => { e.stopPropagation(); handleLeave(group.id); }}
                    title="Leave group"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search Panel ──────────────────────────────── */}
      <div className="search-panel-valo" id="search-panel-valo">

        {/* Panel Header */}
        <div className="spv-header">
          <div className="spv-title-row">
            <div className="spv-title-icon">🔍</div>
            <span className="spv-title">FIND CHANNELS</span>
            <div className={`spv-scan-indicator ${scanning ? 'scanning' : ''}`}>
              <span className="scan-dot" /><span className="scan-dot" /><span className="scan-dot" />
            </div>
          </div>

          {/* Scan progress bar */}
          <div className="scan-progress-track">
            <div
              className={`scan-progress-fill ${scanProgress > 0 ? 'active' : ''}`}
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="spv-form">
          <div className="spv-input-row">
            <div className={`spv-input-wrapper ${scanning ? 'is-scanning' : ''}`}>
              <span className="spv-input-prefix">&gt;_</span>
              <input
                ref={inputRef}
                className="spv-input"
                type="text"
                id="searchGroup"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="enter channel name..."
                autoComplete="off"
                required
              />
              {scanning && <span className="spv-input-cursor" />}
            </div>
            <button
              type="submit"
              id="search-group-btn"
              className={`spv-search-btn ${scanning ? 'is-scanning' : ''}`}
              disabled={scanning}
            >
              {scanning
                ? <span className="scanning-text">SCANNING<span className="dot-cycle" /></span>
                : <span>SCAN ⌕</span>
              }
            </button>
          </div>
        </form>

        {/* Radar — shows while scanning */}
        {scanning && (
          <div className="radar-container">
            <RadarScanner scanning={scanning} />
            <div className="radar-status-text">
              <span className="radar-status-line">SCANNING NETWORK</span>
              <span className="radar-status-sub">searching for: <em>{name || '...'}</em></span>
            </div>
          </div>
        )}

        {/* ── Search Results ───────────────────────────── */}
        {groups.length > 0 && !scanning && (
          <div className="valo-results">
            <div className="valo-results-header">
              <div className="valo-results-line" />
              <span className="valo-results-count">{groups.length} CHANNEL{groups.length !== 1 ? 'S' : ''} FOUND</span>
              <div className="valo-results-line" />
            </div>

            <div className="valo-result-list">
              {groups.map((group, idx) => {
                const isRevealed = revealedResults.includes(idx)
                const isJoining  = joiningId === group._id
                const hasBurst   = burstId === idx
                return (
                  <div
                    key={idx}
                    id={`search-result-${idx}`}
                    className={`valo-result-item ${isRevealed ? 'revealed' : 'hidden'} ${isJoining ? 'joining' : ''}`}
                    style={{ '--reveal-delay': `${idx * 0.12}s` }}
                  >
                    {/* Corner accents — Valorant-style */}
                    <div className="vri-corner tl" />
                    <div className="vri-corner tr" />
                    <div className="vri-corner bl" />
                    <div className="vri-corner br" />

                    <div className="vri-avatar">
                      {group.name?.charAt(0)?.toUpperCase() || '#'}
                    </div>

                    <div className="vri-info">
                      <div className="vri-name">{group.name}</div>
                      <div className="vri-desc">{group.description || 'No description available'}</div>
                    </div>

                    <div className="vri-action">
                      <ParticleBurst active={hasBurst} />
                      <button
                        className={`vri-join-btn ${isJoining ? 'joining' : ''}`}
                        id={`join-group-btn-${idx}`}
                        onClick={e => handleJoinGroup(e, group._id, idx)}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <span className="join-spinner" />
                        ) : (
                          <>
                            <span className="join-plus">+</span>
                            <span>JOIN</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Status Banner */}
        {joinSuccess !== "" && (
          <div className={`status-banner ${joinType}`} id="join-status-banner">
            <span className="status-banner-icon">{joinType === 'success' ? '✓' : '✕'}</span>
            {joinSuccess}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchAndJoinGroup