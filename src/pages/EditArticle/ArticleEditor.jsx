import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import './ArticleEditor.css';

const ArticleEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editorRef = useRef(null);
  
  const initialTitle = searchParams.get('title') || '';
  const importedContent = location.state?.importedContent || 'Start writing lore here...';

  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // If slug exists, we are editing an existing article
  useEffect(() => {
    if (slug) {
      // Functional mock fetch for demonstration
      const fetchArticle = async () => {
        try {
          const res = await fetch(`/api/wiki/articles/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title);
            editorRef.current.getInstance().setMarkdown(data.content);
          }
        } catch (err) {
          console.error("Failed to fetch article", err);
        }
      };
      fetchArticle();
    } else if (importedContent) {
      editorRef.current.getInstance().setMarkdown(importedContent);
    }
  }, [slug, importedContent]);

  /**
   * Intercepts image pastes/drops in Toast UI and uploads them to the backend.
   * The backend route /api/wiki/upload-image will interface with Mike's PHP Image handler.
   */
  const handleImageUpload = async (blob, callback) => {
    try {
      const formData = new FormData();
      // 'image' is standard for typical multer/image handlers
      formData.append('image', blob, blob.name || 'uploaded_image.png');

      const response = await fetch('/api/wiki/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image upload failed on the server.');
      }

      const data = await response.json();
      // The backend should return the public URL of the uploaded image
      const imageUrl = data.url; 
      
      // Insert the image into the editor via the callback
      callback(imageUrl, blob.name || 'Image');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      // Pass null to cancel the insertion
      callback(null);
    }
  };

  const handleSave = async (status) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    const editorInstance = editorRef.current.getInstance();
    const markdown = editorInstance.getMarkdown();
    
    if (!title.trim()) {
      setError('Article title is required.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        title,
        content: markdown,
        status // 'draft' or 'published'
      };

      console.log(`[STATE LOG] Triggering Save...`, payload);

      const endpoint = slug ? `/api/wiki/articles/${slug}` : '/api/wiki/articles';
      const method = slug ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to save article as ${status}.`);
      }
      
      const responseData = await res.json();
      setSuccess(`Article successfully saved as ${status}!`);
      
      // If it was a new creation and we published, redirect to viewer
      if (status === 'published' && !slug && responseData.slug) {
        navigate(`/article/${responseData.slug}`);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="article-editor-container">
      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}
      
      <div className="editor-header">
        <input 
          type="text" 
          className="title-input" 
          placeholder="Article Title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="editor-wrapper">
        <Editor
          ref={editorRef}
          initialValue="Start writing lore here..."
          previewStyle="vertical"
          height="600px"
          initialEditType="markdown"
          useCommandShortcut={true}
          theme="dark"
          hooks={{
            addImageBlobHook: handleImageUpload
          }}
        />
      </div>

      <div className="editor-actions">
        <button 
          className="btn-outline" 
          onClick={() => navigate('/')}
          disabled={isSaving}
        >
          Cancel
        </button>
        <div className="primary-actions">
          <button 
            className="btn-secondary" 
            onClick={() => handleSave('draft')}
            disabled={isSaving}
          >
            Save as Draft
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleSave('published')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
