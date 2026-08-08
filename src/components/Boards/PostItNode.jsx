import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import api from '../../utils/api';
import './PostItNode.css';

export default function PostItNode({ data, isConnectable }) {
  const [text, setText] = useState(data.text || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Keep internal state in sync if data changes from outside (e.g., initial load)
  useEffect(() => {
    setText(data.text || '');
  }, [data.text]);

  const onChangeText = (e) => {
    setText(e.target.value);
    if (data.onChangeData) {
      data.onChangeData({ text: e.target.value });
    } else if (data.onChange) {
      data.onChange(e.target.value);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file, file.name);

      const response = await api.post('/api/wiki/upload-image', formData);
      const imageUrl = response.data.url;
      
      if (data.onChangeData) {
        data.onChangeData({ imageUrl });
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="post-it-node" style={{ backgroundColor: data.color || '#fef3bd' }}>
      <div className="push-pin"></div>
      
      {/* Top Handles (Source & Target stacked) */}
      <Handle type="target" position={Position.Top} id="t-target" isConnectable={isConnectable} className="handle handle-top target-handle" />
      <Handle type="source" position={Position.Top} id="t-source" isConnectable={isConnectable} className="handle handle-top source-handle" />
      
      {/* Right Handles */}
      <Handle type="target" position={Position.Right} id="r-target" isConnectable={isConnectable} className="handle handle-right target-handle" />
      <Handle type="source" position={Position.Right} id="r-source" isConnectable={isConnectable} className="handle handle-right source-handle" />
      
      <div className="post-it-content">
        {data.imageUrl && (
          <img 
            src={data.imageUrl} 
            alt="Post-it attachment" 
            className="post-it-image nodrag" 
          />
        )}
        <textarea
          value={text}
          onChange={onChangeText}
          className="post-it-textarea nodrag"
          placeholder="Write something..."
        />
        <div className="post-it-actions nodrag">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
          <button className="upload-btn" onClick={triggerUpload} disabled={isUploading} title="Attach Image">
            {isUploading ? '⌛' : '📷'}
          </button>
        </div>
      </div>

      {/* Bottom Handles */}
      <Handle type="target" position={Position.Bottom} id="b-target" isConnectable={isConnectable} className="handle handle-bottom target-handle" />
      <Handle type="source" position={Position.Bottom} id="b-source" isConnectable={isConnectable} className="handle handle-bottom source-handle" />
      
      {/* Left Handles */}
      <Handle type="target" position={Position.Left} id="l-target" isConnectable={isConnectable} className="handle handle-left target-handle" />
      <Handle type="source" position={Position.Left} id="l-source" isConnectable={isConnectable} className="handle handle-left source-handle" />
    </div>
  );
}
