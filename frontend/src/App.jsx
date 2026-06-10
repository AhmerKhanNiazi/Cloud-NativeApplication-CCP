import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axios.post(`${API_URL}/items`, { name, description });
      setName('');
      setDescription('');
      await fetchItems();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      
      <div className="app-container">
        <div className="glass-panel">
          <h1 className="header-title">Cloud Native Nexus</h1>
          <p className="header-subtitle">Next-Generation Serverless Data Management</p>
          
          <form onSubmit={handleCreate}>
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="Module Name (e.g. EC2 Instance)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                className="input-field"
                placeholder="Description or Specifications"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isAdding}
              >
                {isAdding ? 'Deploying...' : 'Deploy Module'}
              </button>
            </div>
          </form>

          <div className="items-grid">
            {items.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                No active modules deployed. Start by deploying a new module above.
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.description}</div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    title="Terminate Module"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
