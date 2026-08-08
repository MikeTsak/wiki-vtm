import React, { useState } from 'react';
import './InfoboxEditor.css';

const InfoboxEditor = ({ data, onChange, onImageUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFieldChange = (index, key, value) => {
    const newFields = [...data.fields];
    newFields[index][key] = value;
    onChange({ ...data, fields: newFields });
  };

  const handleAddField = () => {
    onChange({ ...data, fields: [...(data.fields || []), { key: '', value: '' }] });
  };

  const handleRemoveField = (index) => {
    const newFields = data.fields.filter((_, i) => i !== index);
    onChange({ ...data, fields: newFields });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !onImageUpload) return;
    
    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      if (url) {
        onChange({ ...data, image: url });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="infobox-sidebar-panel">
      <div className="infobox-panel-header">
        <h2><i className="fa-solid fa-table"></i> Infobox Configuration</h2>
      </div>
      
      <div className="infobox-panel-body">
          <div className="form-group">
            <label>Image URL or Upload</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="https://.../image.png" 
                value={data.image || ''} 
                onChange={e => onChange({...data, image: e.target.value})} 
                style={{ flex: 1 }}
              />
              <label className="btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                {isUploading ? <><i className="fa-solid fa-spinner fa-spin" style={{marginRight: '0.5rem'}}></i> Uploading...</> : <><i className="fa-solid fa-upload" style={{marginRight: '0.5rem'}}></i> Upload Image</>}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Image Caption</label>
            <input 
              type="text" 
              placeholder="A beautiful vampire..." 
              value={data.caption || ''} 
              onChange={e => onChange({...data, caption: e.target.value})} 
            />
          </div>
          
          <div className="fields-section">
            <div className="fields-header">
              <h3>Fields</h3>
              <button className="btn-secondary btn-sm" onClick={handleAddField}>+ Add Field</button>
            </div>
            
            {(!data.fields || data.fields.length === 0) && <p className="text-muted">No fields added yet.</p>}
            
            {(data.fields || []).map((field, index) => (
              <div key={index} className="field-row">
                <input 
                  type="text" 
                  placeholder="Category (e.g. Clan)" 
                  value={field.key} 
                  onChange={e => handleFieldChange(index, 'key', e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="Value (e.g. Tzimisce)" 
                  value={field.value} 
                  onChange={e => handleFieldChange(index, 'value', e.target.value)} 
                />
                <button className="remove-btn" onClick={() => handleRemoveField(index)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default InfoboxEditor;
