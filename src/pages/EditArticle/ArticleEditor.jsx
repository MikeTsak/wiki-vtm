import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import api from '../../utils/api';
import './ArticleEditor.css';

const ArticleEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editorRef = useRef(null);

  const customToolbarItems = React.useMemo(() => {
    const button = document.createElement('button');
    button.className = 'toastui-editor-toolbar-icons';
    button.style.backgroundImage = 'none';
    button.style.margin = '0';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';
    button.style.width = 'auto';
    button.style.padding = '0 5px';
    button.innerHTML = 'IBX';
    button.title = 'Insert Infobox';
    button.addEventListener('click', () => {
      if (editorRef.current) {
        const editorInstance = editorRef.current.getInstance();
        const boilerplate = `
<aside class="infobox">
  <div class="infobox-title">Article Title</div>
  <img src="https://via.placeholder.com/250" class="infobox-image" alt="Image description" />
  <div class="infobox-caption">Optional caption</div>
  <div class="infobox-content">
    <table>
      <tbody>
        <tr><th>Category 1</th><td>Value 1</td></tr>
        <tr><th>Category 2</th><td>Value 2</td></tr>
      </tbody>
    </table>
  </div>
</aside>
`;
        editorInstance.insertText(boilerplate);
      }
    });
    
    return [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      [
        {
          el: button,
          command: 'insertInfobox',
          tooltip: 'Insert Infobox'
        }
      ]
    ];
  }, []);

  
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
          const res = await api.get(`/api/wiki/articles/${slug}`);
          const data = res.data;
          setTitle(data.article.title);
          editorRef.current.getInstance().setMarkdown(data.article.content);
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

      const response = await api.post('/api/wiki/upload-image', formData);
      const imageUrl = response.data.url; 
      
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

      const res = await (slug ? api.put(endpoint, payload) : api.post(endpoint, payload));
      
      const responseData = res.data;
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
          toolbarItems={customToolbarItems}
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
