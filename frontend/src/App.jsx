import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, UploadCloud, MapPin, Clock, Database, Radio, CheckCircle, ShieldAlert, Key } from 'lucide-react';
import Analytics from './Analytics';

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
  const [userRole, setUserRole] = useState('');
  
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [activeTab, setActiveTab] = useState('LIVE_FEED');

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
      const interval = setInterval(fetchIncidents, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authKey]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (authKey === "admin123") {
      setUserRole("Admin");
      setIsAuthenticated(true);
    } else if (authKey === "responder123") {
      setUserRole("Responder");
      setIsAuthenticated(true);
    } else {
      alert("Invalid Security Clearance Key");
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(`${API_URL}/incidents`, {
        headers: { 'X-Auth-Key': authKey }
      });
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
          params: { filename: file.name, filetype: file.type },
          headers: { 'X-Auth-Key': authKey }
        });
        const { upload_url, url } = urlRes.data;
        
        await axios.put(upload_url, file, {
          headers: { 'Content-Type': file.type }
        });
        imageUrl = url;
      }

      await axios.post(`${API_URL}/incidents`, { 
        title, severity, description, location, image_url: imageUrl 
      }, {
        headers: { 'X-Auth-Key': authKey }
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
      await axios.delete(`${API_URL}/incidents/${id}`, {
        headers: { 'X-Auth-Key': authKey }
      });
      fetchIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="scanline"></div>
        <div className="login-container glass-panel">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="auth-logo"
          >
            <ShieldAlert size={48} color="#00ffff" /> AEGIS
          </motion.div>
          <p className="header-subtitle" style={{marginBottom: '2rem'}}>Authorized Personnel Only</p>
          <form onSubmit={handleLogin} className="input-group">
            <div style={{ position: 'relative' }}>
              <Key size={20} color="#00ffff" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="input-field" 
                style={{ paddingLeft: '3rem', width: '100%' }}
                placeholder="Enter Security Clearance Key..." 
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                required
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="btn-primary" 
              style={{marginTop: '1rem'}}
            >
              Initiate Handshake
            </motion.button>
          </form>
        </div>
      </motion.div>
    );
  }

  const filteredIncidents = filterSeverity === 'All' 
    ? incidents 
    : incidents.filter(inc => (inc.severity || '').toLowerCase() === filterSeverity.toLowerCase());

  return (
    <>
      <div className="scanline"></div>
      
      <div className="app-container">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="header-container"
        >
          <h1 className="header-title">AEGIS: Crisis Grid</h1>
          <p className="header-subtitle">Global Disaster Response & Resource Management</p>
        </motion.div>

        {/* Custom Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'LIVE_FEED' ? 'active' : ''}`}
            onClick={() => setActiveTab('LIVE_FEED')}
          >
            <Radio size={20} /> Live Feed
            {activeTab === 'LIVE_FEED' && <motion.div layoutId="indicator" className="tab-indicator" />}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ANALYTICS' ? 'active' : ''}`}
            onClick={() => setActiveTab('ANALYTICS')}
          >
            <Database size={20} /> Analytics
            {activeTab === 'ANALYTICS' && <motion.div layoutId="indicator" className="tab-indicator" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'LIVE_FEED' ? (
            <motion.div 
              key="live_feed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-panel" style={{ marginBottom: '2rem' }}>
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
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="upload-zone" 
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <input id="file-upload" type="file" style={{display: 'none'}} onChange={handleFileChange} accept="image/*" />
                    <UploadCloud size={40} color="#00ffff" />
                    {file ? (
                      <div className="upload-text">Target Locked: {file.name}</div>
                    ) : (
                      <div className="upload-text">CLICK TO UPLOAD TACTICAL IMAGERY (S3 DIRECT)</div>
                    )}
                  </motion.div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn-primary" 
                    disabled={isDeploying}
                  >
                    {isDeploying ? <><Radio className="animate-spin" size={20} /> TRANSMITTING TO GRID...</> : <><Target size={20} /> LOG INCIDENT TO DYNAMODB</>}
                  </motion.button>
                </form>
              </div>

              <div className="filter-container" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
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

              <motion.div 
                className="incidents-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                <AnimatePresence>
                  {filteredIncidents.map(inc => {
                    const safeSeverity = inc.severity || 'Medium';
                    const safeTitle = inc.title || inc.name || 'Unknown Incident';
                    const safeLocation = inc.location || 'Unknown Sector';
                    const formattedTime = inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'System Reboot';
                    const reporter = inc.reporter_id || 'UNKNOWN-OP';
                    
                    return (
                      <motion.div 
                        key={inc.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ y: -5 }}
                        className={`incident-card severity-${safeSeverity.toLowerCase()}`}
                      >
                        <div className="incident-header">
                          <span className="incident-title">{safeTitle}</span>
                          <span className={`badge badge-${safeSeverity.toLowerCase()}`}>{safeSeverity}</span>
                        </div>
                        <div className="incident-location" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {safeLocation}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>OP: {reporter}</span>
                        </div>
                        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {formattedTime}
                        </div>
                        {inc.image_url && <img src={inc.image_url} alt="Tactical" className="incident-image" />}
                        <div className="incident-desc">{inc.description}</div>
                        {userRole === "Admin" && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-delete" 
                            onClick={() => handleDelete(inc.id)}
                          >
                            <CheckCircle size={16} /> RESOLVE
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredIncidents.length === 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="incident-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                     No incidents reported in this sector.
                   </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Analytics incidents={incidents} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
