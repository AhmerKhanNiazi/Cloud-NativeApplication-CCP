import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState(null);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  
  // Filter state
  const [filterSeverity, setFilterSeverity] = useState('All');

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (authKey.length > 4) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Security Clearance Key");
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(`${API_URL}/incidents`);
      // Sort by timestamp if available
      const sorted = response.data.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      setIncidents(sorted);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      let imageUrl = "";

      if (file) {
        const urlRes = await axios.get(`${API_URL}/generate-upload-url`, {
          params: { filename: file.name, filetype: file.type }
        });
        const { upload_url, url } = urlRes.data;
        
        await axios.put(upload_url, file, {
          headers: { 'Content-Type': file.type }
        });
        imageUrl = url;
      }

      const res = await axios.post(`${API_URL}/incidents`, { 
        title, severity, description, location, image_url: imageUrl 
      });
      
      if (severity.toLowerCase() === 'critical') {
        alert("🚨 EMERGENCY PROTOCOL INITIATED: Alerts dispatched to response units!");
      }
      
      setTitle('');
      setSeverity('Medium');
      setDescription('');
      setLocation('');
      setFile(null);
      await fetchIncidents();
    } catch (error) {
      console.error(error);
      alert("Deployment failed. Ensure backend API and S3 permissions are configured.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/incidents/${id}`);
      fetchIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="scanline"></div>
        <div className="login-container glass-panel">
          <div className="auth-logo">AEGIS</div>
          <p className="header-subtitle" style={{marginBottom: '2rem'}}>Authorized Personnel Only</p>
          <form onSubmit={handleLogin} className="input-group">
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter Security Clearance Key..." 
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Initiate Handshake</button>
          </form>
        </div>
      </>
    );
  }

  const filteredIncidents = filterSeverity === 'All' 
    ? incidents 
    : incidents.filter(inc => (inc.severity || '').toLowerCase() === filterSeverity.toLowerCase());

  return (
    <>
      <div className="scanline"></div>
      
      <div className="app-container">
        <div className="header-container">
          <h1 className="header-title">AEGIS: Crisis Grid</h1>
          <p className="header-subtitle">Global Disaster Response & Resource Management</p>
        </div>

        <div className="glass-panel">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="input-group">
              <label className="input-label">Incident Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Severity Level</label>
              <select className="input-field" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="Critical">Critical (Immediate Response)</option>
                <option value="High">High (Major Asset Risk)</option>
                <option value="Medium">Medium (Standard Protocol)</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Location Coordinates / Sector</label>
              <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Situation Report (SITREP)</label>
              <textarea className="input-field" rows="3" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>
            
            <div className="upload-zone" onClick={() => document.getElementById('file-upload').click()}>
              <input id="file-upload" type="file" style={{display: 'none'}} onChange={handleFileChange} accept="image/*" />
              {file ? (
                <div className="upload-text">Target Locked: {file.name}</div>
              ) : (
                <div className="upload-text">CLICK TO UPLOAD TACTICAL IMAGERY (S3 DIRECT)</div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isDeploying}>
              {isDeploying ? 'TRANSMITTING TO GRID...' : 'LOG INCIDENT TO DYNAMODB'}
            </button>
          </form>
        </div>

        <div className="filter-container" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <label className="input-label">Filter Sector:</label>
          <select 
            className="input-field" 
            style={{ width: '200px', background: 'var(--panel-bg)' }}
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="All">All Incidents</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
          </select>
        </div>

        <div className="incidents-grid">
          {filteredIncidents.map(inc => {
            const safeSeverity = inc.severity || 'Medium';
            const safeTitle = inc.title || inc.name || 'Unknown Incident';
            const safeLocation = inc.location || 'Unknown Sector';
            const formattedTime = inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'System Reboot';
            const reporter = inc.reporter_id || 'UNKNOWN-OP';
            
            return (
              <div key={inc.id} className={`incident-card severity-${safeSeverity.toLowerCase()}`}>
                <div className="incident-header">
                  <span className="incident-title">{safeTitle}</span>
                  <span className={`badge badge-${safeSeverity.toLowerCase()}`}>{safeSeverity}</span>
                </div>
                <div className="incident-location" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>📍 {safeLocation}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>OP: {reporter}</span>
                </div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  🕒 {formattedTime}
                </div>
                {inc.image_url && <img src={inc.image_url} alt="Tactical" className="incident-image" />}
                <div className="incident-desc">{inc.description}</div>
                <button className="btn-delete" onClick={() => handleDelete(inc.id)}>RESOLVE</button>
              </div>
            );
          })}
          {filteredIncidents.length === 0 && (
             <div className="incident-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
               No incidents reported in this sector.
             </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
