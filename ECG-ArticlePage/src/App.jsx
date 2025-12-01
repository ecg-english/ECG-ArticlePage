import React, { useState, useEffect } from 'react';
import { BookOpen, PenTool, Search, User, Globe, Calendar, ChevronLeft, Send, Menu, X, Tag, Image as ImageIcon } from 'lucide-react';

// --- GAS API URL ---
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby7DlTI_iddr3Vbf5HYyuPRZM8dc6xhoyG0FPLzlKvfCp6olKiVttjiZRBAAstyXU2Kwg/exec';

// --- メインコンポーネント ---
export default function ECGCommunityApp() {
  const [view, setView] = useState('home'); // home, article, admin
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- データの読み込み (GAS API) ---
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(GAS_API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        
        const data = await response.json();
        // GASから配列が返ってくる場合と、オブジェクトでラップされている場合に対応
        const articlesData = Array.isArray(data) ? data : (data.articles || data.data || []);
        setArticles(articlesData);
      } catch (err) {
        console.error('記事の取得エラー:', err);
        setError('記事の読み込みに失敗しました。しばらくしてから再度お試しください。');
        // エラー時は空配列を設定
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // --- 記事の保存 (新規作成) ---
  const handleSaveArticle = async (newArticle) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'create',
          article: newArticle
        }),
      });

      if (!response.ok) {
        throw new Error('記事の保存に失敗しました');
      }

      const result = await response.json();
      
      // 成功したら記事一覧を再取得
      const refreshResponse = await fetch(GAS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const articlesData = Array.isArray(data) ? data : (data.articles || data.data || []);
        setArticles(articlesData);
      }
      
      setView('home');
    } catch (err) {
      console.error('記事の保存エラー:', err);
      setError('記事の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 記事の削除 ---
  const handleDeleteArticle = async (id) => {
    if (!window.confirm("本当にこの記事を削除しますか？")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'delete',
          id: id
        }),
      });

      if (!response.ok) {
        throw new Error('記事の削除に失敗しました');
      }

      // 成功したら記事一覧を再取得
      const refreshResponse = await fetch(GAS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const articlesData = Array.isArray(data) ? data : (data.articles || data.data || []);
        setArticles(articlesData);
      }
    } catch (err) {
      console.error('記事の削除エラー:', err);
      setError('記事の削除に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 画面遷移ヘルパー ---
  const openArticle = (article) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView('home');
    setSelectedArticle(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900">ECG <span className="text-gray-500 font-normal text-sm ml-1">Community Hub</span></h1>
          </div>

          {/* PC Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={goHome} className={`text-sm font-medium ${view === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              Community Feed
            </button>
            <button 
              onClick={() => { setView('admin'); setIsAdminMode(true); }} 
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <PenTool size={14} />
              Staff Write
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 shadow-lg">
            <button onClick={() => { goHome(); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700">Community Feed</button>
            <button onClick={() => { setView('admin'); setIsAdminMode(true); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-blue-600 font-medium">Staff Login (Write)</button>
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">エラー</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              閉じる
            </button>
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="mb-4 text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 text-sm">読み込み中...</p>
          </div>
        )}

        {view === 'home' && (
          <PublicFeed 
            articles={articles} 
            onArticleClick={openArticle}
            isLoading={isLoading}
          />
        )}

        {view === 'article' && selectedArticle && (
          <ArticleDetail 
            article={selectedArticle} 
            onBack={goHome} 
            isAdmin={isAdminMode}
            onDelete={() => { handleDeleteArticle(selectedArticle.id); goHome(); }}
          />
        )}

        {view === 'admin' && (
          <AdminEditor 
            onSave={handleSaveArticle} 
            onCancel={goHome}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 English Gym ECG. All rights reserved.</p>
          <p className="mt-2 text-xs">Empowering Global Citizens.</p>
        </div>
      </footer>
    </div>
  );
}

// --- 閲覧用画面 (メンバーが見る画面) ---
function PublicFeed({ articles, onArticleClick, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  // 全タグを抽出
  const allTags = ["All", ...new Set(articles.flatMap(a => a.tags || []))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || (article.tags && article.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome to ECG Article</h2>
          <p className="text-blue-100 mb-6 max-w-xl">
            スタッフやコーチが発信する英語学習のヒント、異文化体験、イベント情報をチェックしよう。
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="気になるキーワードで検索..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* 装飾 */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-5 transform skew-x-12 translate-x-10"></div>
      </div>

      {/* タグフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {allTags.map(tag => (
          <button 
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${selectedTag === tag ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 記事グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <article 
            key={article.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
            onClick={() => onArticleClick(article)}
          >
            <div className="h-48 overflow-hidden bg-gray-200 relative">
              {article.image ? (
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-800 shadow-sm">
                {article.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Calendar size={12} />
                <span>{article.date}</span>
                <span className="mx-1">•</span>
                <User size={12} />
                <span>{article.author}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                {article.content}
              </p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {article.tags && article.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && filteredArticles.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>記事が見つかりませんでした。</p>
        </div>
      )}
    </div>
  );
}

// --- 記事詳細画面 ---
function ArticleDetail({ article, onBack, isAdmin, onDelete }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ChevronLeft size={20} />
        Back to Feed
      </button>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {article.image && (
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-6 md:p-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{article.category}</span>
            <span className="text-gray-400 text-sm">{article.date}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>

          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{article.author}</p>
              <p className="text-xs text-gray-500">ECG Staff Member</p>
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Tag size={16} /> Related Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags && article.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {isAdmin && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onDelete}
            className="text-red-600 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded transition-colors"
          >
            この記事を削除 (管理者のみ)
          </button>
        </div>
      )}
    </div>
  );
}

// --- 管理者用：記事作成画面 (スタッフ用) ---
function AdminEditor({ onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'General',
    content: '',
    tags: '',
    image: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newArticle = {
      id: Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      date: new Date().toISOString().split('T')[0]
    };
    onSave(newArticle);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <PenTool className="text-blue-600" />
          New Article
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例: 今週の英会話Tips"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input 
              required
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="例: Kairi"
            />
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="General">General</option>
              <option value="English Tips">English Tips</option>
              <option value="Events">Events</option>
              <option value="Culture">Culture</option>
              <option value="Staff Voice">Staff Voice</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea 
            required
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="ここに記事の内容を書いてください..."
          />
        </div>

        {/* Image URL & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
            <input 
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
            <input 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="英語, イベント, 初心者"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                Publish Article
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

