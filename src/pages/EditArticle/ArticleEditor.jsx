import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import InfoboxEditor from '../../components/Wiki/InfoboxEditor';
import SEO from '../../components/Common/SEO';
import './ArticleEditor.css';

const ArticleEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editorRef = useRef(null);

  const [articleId, setArticleId] = useState(null);
  const [infoboxData, setInfoboxData] = useState({ image: '', caption: '', fields: [] });

  const customToolbarItems = React.useMemo(() => {
    return [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock']
    ];
  }, []);

  const { isAdmin } = useAuth();

  const initialTitle = searchParams.get('title') || '';
  const importedContent = location.state?.importedContent || 'Start writing lore here...';

  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('published');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [draftFound, setDraftFound] = useState(null);
  const [lastAutosave, setLastAutosave] = useState(null);

  useEffect(() => {
    if (slug) {
      const fetchArticle = async () => {
        try {
          const res = await api.get(`/api/wiki/articles/${slug}`);
          const data = res.data;
          setArticleId(data.article.id);
          setTitle(data.article.title);
          setTags(data.article.tags || '');
          setVisibility(data.article.status || 'published');
          
          let content = data.article.content;
          const ibxMatch = content.match(/\[INFOBOX\](.*?)\[\/INFOBOX\]/s);
          if (ibxMatch) {
            try {
              setInfoboxData(JSON.parse(ibxMatch[1]));
            } catch(e) { console.error('Failed to parse infobox', e); }
            content = content.replace(/\[INFOBOX\](.*?)\[\/INFOBOX\]/s, '').trim();
          }

          editorRef.current.getInstance().setMarkdown(content);
        } catch (err) {
          console.error('Failed to fetch article', err);
        }
      };
      fetchArticle();
    } else if (importedContent) {
      editorRef.current.getInstance().setMarkdown(importedContent);
    }

    // Check for drafts
    const draftKey = `wiki_draft_${slug || 'new'}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDraftFound(parsed);
      } catch(e) {}
    }
  }, [slug, importedContent]);

  // Autosave interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef.current) {
        const draftKey = `wiki_draft_${slug || 'new'}`;
        const markdown = editorRef.current.getInstance().getMarkdown();
        if (markdown.length > 10 || title.length > 0) {
          localStorage.setItem(draftKey, JSON.stringify({
            title,
            markdown,
            infoboxData,
            timestamp: Date.now()
          }));
          setLastAutosave(new Date());
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [slug, title, infoboxData]);

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

  const handleInfoboxImageUpload = async (blob) => {
    const formData = new FormData();
    formData.append('image', blob, blob.name || 'uploaded_image.png');
    const response = await api.post('/api/wiki/upload-image', formData);
    return response.data.url;
  };

  const handleSave = async (statusOverride) => {
    const status = statusOverride || visibility;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    const editorInstance = editorRef.current.getInstance();
    let markdown = editorInstance.getMarkdown();
    
    if (infoboxData.image || infoboxData.fields.length > 0) {
      markdown += `\n\n[INFOBOX]${JSON.stringify(infoboxData)}[/INFOBOX]`;
    }
    
    if (!title.trim()) {
      setError('Article title is required.');
      setIsSaving(false);
      return;
    }

    try {
      const computedSlug = slug || title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const payload = { id: articleId, title, slug: computedSlug, content: markdown, status, tags };

      const res = await api.post('/api/wiki/articles', payload);
      
      const responseData = res.data;
      setSuccess(`Article saved as "${status}"!`);
      
      // Clear draft on successful save
      localStorage.removeItem(`wiki_draft_${slug || 'new'}`);
      setDraftFound(null);

      if (status === 'published' && !slug && responseData.slug) {
        navigate(`/article/${responseData.slug}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="article-editor-container">
      <SEO 
        title={slug ? `Editing: ${title}` : 'Create New Article'} 
        description="Edit article on Erebus Wiki" 
        noindex={true}
      />

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {draftFound && (
        <div className="info-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>You have an unsaved draft from {new Date(draftFound.timestamp).toLocaleString()}.</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => {
              setTitle(draftFound.title);
              setInfoboxData(draftFound.infoboxData);
              editorRef.current.getInstance().setMarkdown(draftFound.markdown);
              setDraftFound(null);
            }}>Restore Draft</button>
            <button className="btn-outline" onClick={() => {
              localStorage.removeItem(`wiki_draft_${slug || 'new'}`);
              setDraftFound(null);
            }}>Discard</button>
          </div>
        </div>
      )}
      
      <div className="editor-header">
        <input 
          type="text" 
          className="title-input" 
          placeholder="Article Title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editor-meta-row">
          <input 
            type="text" 
            className="tags-input" 
            placeholder="Tags (comma separated)..." 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {isAdmin && (
            <div className="visibility-selector">
              <label>Visibility</label>
              <div className="vis-options">
                <label className={`vis-opt ${visibility === 'published' ? 'active' : ''}`}>
                  <input type="radio" name="visibility" value="published" checked={visibility === 'published'} onChange={() => setVisibility('published')} />
                  <i className="fa-solid fa-globe"></i> Public
                </label>
                <label className={`vis-opt ${visibility === 'draft' ? 'active' : ''}`}>
                  <input type="radio" name="visibility" value="draft" checked={visibility === 'draft'} onChange={() => setVisibility('draft')} />
                  <i className="fa-solid fa-pen"></i> Draft
                </label>
                <label className={`vis-opt ${visibility === 'private' ? 'active' : ''}`}>
                  <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} />
                  <i className="fa-solid fa-lock"></i> Admin Only
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="editor-wrapper" style={{ display: 'flex', gap: '1rem', flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Editor
            ref={editorRef}
            initialValue="Start writing lore here..."
            previewStyle="vertical"
            height="600px"
            initialEditType="wysiwyg"
            hideModeSwitch={true}
            useCommandShortcut={true}
            theme="dark"
            toolbarItems={customToolbarItems}
            hooks={{
              addImageBlobHook: handleImageUpload
            }}
          />
        </div>
        <InfoboxEditor 
          data={infoboxData} 
          onChange={setInfoboxData} 
          onImageUpload={handleInfoboxImageUpload}
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
          {!isAdmin && (
            <button 
              className="btn-secondary" 
              onClick={() => handleSave('draft')}
              disabled={isSaving}
            >
              Save as Draft
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : visibility === 'private' ? <><i className="fa-solid fa-lock"></i> Save Private</> : visibility === 'draft' ? 'Save Draft' : 'Publish'}
          </button>
        </div>
      </div>
      {lastAutosave && (
        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Last autosaved at {lastAutosave.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
