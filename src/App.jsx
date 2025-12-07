import React, { useState, useEffect } from 'react';
import { 
  Send, History, Folder, Plus, Trash2, Save, 
  ChevronRight, ChevronDown, Clock, Globe, Database,
  Moon, Sun, Copy, Download, Upload, Settings, User,
  LogOut, LogIn, UserPlus, Eye, EyeOff, Check, X,
  Play, Pause, Zap, Shield, Key, Server, Cpu,
  AlertCircle, Loader2, RefreshCw, ExternalLink,
  HardDrive, Layers, Grid, Hash, Bell, BellOff
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Enhanced JSON Viewer Component
const EnhancedJSONViewer = ({ data, depth = 0, onCopy }) => {
  const [collapsed, setCollapsed] = useState(depth > 1);

  if (data === null || data === undefined) {
    return <span className="text-purple-400">null</span>;
  }

  if (typeof data === 'string') {
    return (
      <span className="text-green-400 group relative">
        "{data}"
        <button
          onClick={() => onCopy && onCopy(data)}
          className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy value"
        >
          <Copy size={12} />
        </button>
      </span>
    );
  }

  if (typeof data === 'number') {
    return <span className="text-blue-400">{data}</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-yellow-400">{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-400">[]</span>;
    }
    
    return (
      <div className="ml-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-gray-400 hover:text-white mb-1"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          <span className="text-blue-300">Array [{data.length}]</span>
        </button>
        {!collapsed && (
          <div className="border-l border-gray-600 ml-2 pl-4">
            {data.slice(0, 20).map((item, index) => (
              <div key={index} className="flex items-start mb-1">
                <span className="text-purple-400 mr-2 min-w-6">{index}:</span>
                <EnhancedJSONViewer 
                  data={item} 
                  depth={depth + 1} 
                  onCopy={onCopy}
                />
              </div>
            ))}
            {data.length > 20 && (
              <div className="text-gray-500 text-sm">
                ... and {data.length - 20} more items
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-gray-400">{'{}'}</span>;
    }

    return (
      <div className="ml-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-gray-400 hover:text-white mb-1"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          <span className="text-blue-300">Object {'{'} {entries.length} {'}'}</span>
        </button>
        {!collapsed && (
          <div className="border-l border-gray-600 ml-2 pl-4">
            {entries.slice(0, 20).map(([key, value]) => (
              <div key={key} className="flex items-start mb-1">
                <span className="text-yellow-400 mr-2">"{key}":</span>
                <EnhancedJSONViewer 
                  data={value} 
                  depth={depth + 1}
                  onCopy={onCopy}
                />
              </div>
            ))}
            {entries.length > 20 && (
              <div className="text-gray-500 text-sm">
                ... and {entries.length - 20} more properties
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return <span>{JSON.stringify(data)}</span>;
};

function App() {
  // State Management
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([
    { id: 1, key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [params, setParams] = useState([]);
  const [body, setBody] = useState('{\n  "title": "Test Post",\n  "body": "This is a test",\n  "userId": 1\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  
  // UI States
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showEnvironments, setShowEnvironments] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  
  // Environment States
  const [environments, setEnvironments] = useState({
    dev: { 
      name: 'Development', 
      variables: { 
        baseUrl: 'https://dev.api.example.com',
        apiKey: 'dev_123456',
        token: ''
      } 
    },
    staging: { 
      name: 'Staging', 
      variables: { 
        baseUrl: 'https://staging.api.example.com',
        apiKey: 'staging_123456',
        token: ''
      } 
    },
    prod: { 
      name: 'Production', 
      variables: { 
        baseUrl: 'https://api.example.com',
        apiKey: 'prod_123456',
        token: ''
      } 
    }
  });
  const [activeEnvironment, setActiveEnvironment] = useState('dev');
  const [showPassword, setShowPassword] = useState(false);

  // Load history and collections on mount
  useEffect(() => {
    loadHistory();
    loadCollections();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Environment variable replacement
  const replaceEnvVars = (text) => {
    if (!text) return text;
    const envVars = environments[activeEnvironment]?.variables || {};
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return envVars[key] !== undefined ? envVars[key] : match;
    });
  };

  // API Functions
  const loadHistory = async () => {
    try {
      const userId = isAuthenticated && user ? user.id : 'anonymous';
      const res = await fetch(`${API_BASE_URL}/history?user_id=${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const userId = isAuthenticated && user ? user.id : 'anonymous';
      const res = await fetch(`${API_BASE_URL}/collections?user_id=${userId}`);
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      // Validate URL
      const processedUrl = replaceEnvVars(url);
      if (!processedUrl.trim()) {
        throw new Error('URL is required');
      }
      
      if (!processedUrl.startsWith('http')) {
        throw new Error('URL must start with http:// or https://');
      }

      // Validate JSON body for POST/PUT/PATCH
      let parsedBody;
      if (method !== 'GET' && body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          throw new Error('Invalid JSON in request body');
        }
      }

      // Prepare request data
      const requestData = {
        url: processedUrl,
        method,
        headers: headers.reduce((acc, h) => {
          if (h.enabled && h.key.trim()) {
            acc[h.key] = replaceEnvVars(h.value);
          }
          return acc;
        }, {}),
        params: params.reduce((acc, p) => {
          if (p.enabled && p.key.trim()) {
            acc[p.key] = replaceEnvVars(p.value);
          }
          return acc;
        }, {}),
        body: parsedBody
      };

      // Send request through proxy
      const startTime = Date.now();
      const proxyRes = await fetch(`${API_BASE_URL}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const responseData = await proxyRes.json();
      const endTime = Date.now();
      
      // Add timing information
      responseData.localTime = endTime - startTime;
      setResponse(responseData);

      // Save to history
      const userId = isAuthenticated && user ? user.id : 'anonymous';
      await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          user_id: userId
        }),
      });

      loadHistory();
      
    } catch (error) {
      setResponse({
        error: error.message,
        time: 0,
        size: 0,
        status: 'Error',
        headers: {},
        body: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Header Management
  const addHeader = () => {
    setHeaders([...headers, { 
      id: Date.now(), 
      key: '', 
      value: '', 
      enabled: true 
    }]);
  };

  const updateHeader = (id, field, value) => {
    setHeaders(headers.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const toggleHeader = (id) => {
    setHeaders(headers.map(h => 
      h.id === id ? { ...h, enabled: !h.enabled } : h
    ));
  };

  const removeHeader = (id) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  // Parameter Management
  const addParam = () => {
    setParams([...params, { 
      id: Date.now(), 
      key: '', 
      value: '', 
      enabled: true 
    }]);
  };

  const updateParam = (id, field, value) => {
    setParams(params.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const toggleParam = (id) => {
    setParams(params.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const removeParam = (id) => {
    setParams(params.filter(p => p.id !== id));
  };

  // History Management
  const loadRequestFromHistory = (item) => {
    setUrl(item.url);
    setMethod(item.method);
    setBody(item.body ? JSON.stringify(item.body, null, 2) : '');
    
    if (item.headers) {
      setHeaders(Object.entries(item.headers).map(([key, value], idx) => ({
        id: idx,
        key,
        value,
        enabled: true
      })));
    }
    
    if (item.params) {
      setParams(Object.entries(item.params).map(([key, value], idx) => ({
        id: idx + 1000,
        key,
        value,
        enabled: true
      })));
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Clear all history?')) {
      try {
        await fetch(`${API_BASE_URL}/clear`, { method: 'DELETE' });
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  // Collection Management
  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      const userId = isAuthenticated && user ? user.id : 'anonymous';
      await fetch(`${API_BASE_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: '',
          user_id: userId
        }),
      });
      setNewCollectionName('');
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const saveRequestToCollection = async (collectionId) => {
    try {
      await fetch(`${API_BASE_URL}/collections/${collectionId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method,
          headers: headers.reduce((acc, h) => {
            if (h.enabled && h.key.trim()) acc[h.key] = h.value;
            return acc;
          }, {}),
          params: params.reduce((acc, p) => {
            if (p.enabled && p.key.trim()) acc[p.key] = p.value;
            return acc;
          }, {}),
          body: body ? JSON.parse(body) : undefined,
          name: `${method} ${new URL(url).pathname}`
        }),
      });
      alert('✅ Request saved to collection!');
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  // Authentication Functions
  const handleAuth = async () => {
    // Simulated authentication
    if (authMode === 'login') {
      if (authData.email && authData.password) {
        setIsAuthenticated(true);
        setUser({
          id: 'user_' + Date.now(),
          email: authData.email,
          name: authData.name || 'User'
        });
        setShowAuth(false);
        setAuthData({ email: '', password: '', name: '' });
      }
    } else {
      if (authData.email && authData.password && authData.name) {
        setIsAuthenticated(true);
        setUser({
          id: 'user_' + Date.now(),
          email: authData.email,
          name: authData.name
        });
        setShowAuth(false);
        setAuthData({ email: '', password: '', name: '' });
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setHistory([]);
    setCollections([]);
  };

  // Environment Management
  const updateEnvironmentVariable = (envKey, varKey, value) => {
    setEnvironments(prev => ({
      ...prev,
      [envKey]: {
        ...prev[envKey],
        variables: {
          ...prev[envKey].variables,
          [varKey]: value
        }
      }
    }));
  };

  // Utility Functions
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `api-history-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importHistory = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        setHistory(importedData);
        alert(`✅ Imported ${importedData.length} history items`);
      } catch (error) {
        alert('❌ Error importing file. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl`}>
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={24} />
              <span>Sending request to {url.split('/')[2]}...</span>
            </div>
            <div className="mt-3 text-sm opacity-75">
              {method} request to {url.substring(0, 50)}...
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button onClick={() => setShowAuth(false)}>
                <X size={20} />
              </button>
            </div>
            
            {authMode === 'signup' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleAuth}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            
            <div className="mt-3 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-blue-500 hover:underline text-sm"
              >
                {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Environments Modal */}
      {showEnvironments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-3/4 max-w-4xl max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Server size={20} />
                Environment Variables
              </h2>
              <button onClick={() => setShowEnvironments(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(environments).map(([key, env]) => (
                <button
                  key={key}
                  onClick={() => setActiveEnvironment(key)}
                  className={`p-4 rounded-lg border ${
                    activeEnvironment === key 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      key === 'prod' ? 'bg-red-500' :
                      key === 'staging' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="font-medium">{env.name}</span>
                  </div>
                  <div className="text-sm mt-2 opacity-75">
                    {Object.keys(env.variables).length} variables
                  </div>
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">
                {environments[activeEnvironment].name} Variables
              </h3>
              {Object.entries(environments[activeEnvironment].variables).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateEnvironmentVariable(activeEnvironment, key, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col transition-colors duration-200`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Globe size={20} />
              API Testing Tool
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`px-2 py-0.5 text-xs rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {activeEnvironment.toUpperCase()}
              </div>
              {isAuthenticated && (
                <div className="text-xs text-blue-500 flex items-center gap-1">
                  <User size={12} />
                  {user?.name}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Authentication</span>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      handleLogout();
                    } else {
                      setShowAuth(true);
                      setAuthMode('login');
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    isAuthenticated 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isAuthenticated ? (
                    <span className="flex items-center gap-1">
                      <LogOut size={14} />
                      Logout
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <LogIn size={14} />
                      Login
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Environment</span>
                <button
                  onClick={() => setShowEnvironments(true)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                >
                  <Server size={14} />
                  Manage
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Export/Import</span>
                <div className="flex gap-2">
                  <button
                    onClick={exportHistory}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Export history"
                  >
                    <Download size={14} />
                  </button>
                  <label className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" title="Import history">
                    <Upload size={14} />
                    <input
                      type="file"
                      accept=".json"
                      onChange={importHistory}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-1 overflow-auto`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <History size={16} />
              Request History
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {history.length}
              </span>
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-600"
                title="Clear all history"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-60 overflow-auto custom-scrollbar">
            {history.length === 0 ? (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <History size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No requests yet</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadRequestFromHistory(item)}
                  className={`p-3 text-sm rounded cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      item.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      item.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {item.method}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock size={10} />
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="truncate text-xs font-mono">{item.url}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collections Section */}
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Folder size={16} />
              Collections
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {collections.length}
              </span>
            </h2>
          </div>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New collection..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className={`flex-1 px-3 py-1.5 text-sm border rounded ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <button
                onClick={createCollection}
                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {collections.length === 0 ? (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Folder size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No collections yet</p>
                <p className="text-xs mt-1">Create collections to organize your APIs</p>
              </div>
            ) : (
              collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="font-medium mb-2 flex items-center justify-between">
                    <span>{collection.name}</span>
                    <button
                      onClick={() => saveRequestToCollection(collection.id)}
                      className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 flex items-center gap-1"
                      title="Save current request to this collection"
                    >
                      <Save size={12} />
                      Save
                    </button>
                  </div>
                  {collection.description && (
                    <p className="text-xs opacity-75 mb-2">{collection.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Request Configuration */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
          <div className="flex gap-3 mb-6">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`px-4 py-2 border rounded min-w-32 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className={`flex-1 px-4 py-2 border rounded ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-300'
              }`}
            />
            
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>
          </div>

          {/* Request Tabs */}
          <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'params'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('params')}
            >
              Query Parameters
              {params.filter(p => p.enabled && p.key.trim()).length > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                  {params.filter(p => p.enabled && p.key.trim()).length}
                </span>
              )}
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'headers'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('headers')}
            >
              Headers
              {headers.filter(h => h.enabled && h.key.trim()).length > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                  {headers.filter(h => h.enabled && h.key.trim()).length}
                </span>
              )}
            </button>
            {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'body'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('body')}
              >
                Body
              </button>
            )}
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'env'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
              onClick={() => setShowEnvironments(true)}
            >
              <span className="flex items-center gap-1">
                <Zap size={14} />
                Env: {activeEnvironment.toUpperCase()}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'params' && (
              <div>
                <h3 className="font-medium mb-3">Query Parameters</h3>
                <div className="space-y-3">
                  {params.map((param) => (
                    <div key={param.id} className="flex gap-3 items-center">
                      <button
                        onClick={() => toggleParam(param.id)}
                        className={`p-2 rounded ${
                          param.enabled
                            ? 'text-green-500 hover:text-green-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                        title={param.enabled ? 'Disable parameter' : 'Enable parameter'}
                      >
                        {param.enabled ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <input
                        type="text"
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        } ${!param.enabled ? 'opacity-50' : ''}`}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        } ${!param.enabled ? 'opacity-50' : ''}`}
                      />
                      <button
                        onClick={() => removeParam(param.id)}
                        className="p-2 text-red-500 hover:text-red-600 rounded"
                        title="Remove parameter"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addParam}
                  className={`mt-3 px-4 py-2 rounded flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Plus size={14} />
                  Add Parameter
                </button>
              </div>
            )}

            {activeTab === 'headers' && (
              <div>
                <h3 className="font-medium mb-3">Headers</h3>
                <div className="space-y-3">
                  {headers.map((header) => (
                    <div key={header.id} className="flex gap-3 items-center">
                      <button
                        onClick={() => toggleHeader(header.id)}
                        className={`p-2 rounded ${
                          header.enabled
                            ? 'text-green-500 hover:text-green-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                        title={header.enabled ? 'Disable header' : 'Enable header'}
                      >
                        {header.enabled ? <Check size={16} /> : <X size={16} />}
                      </button>
                      <input
                        type="text"
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        } ${!header.enabled ? 'opacity-50' : ''}`}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        } ${!header.enabled ? 'opacity-50' : ''}`}
                      />
                      <button
                        onClick={() => removeHeader(header.id)}
                        className="p-2 text-red-500 hover:text-red-600 rounded"
                        title="Remove header"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addHeader}
                  className={`mt-3 px-4 py-2 rounded flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Plus size={14} />
                  Add Header
                </button>
              </div>
            )}

            {activeTab === 'body' && (
              <div>
                <h3 className="font-medium mb-3">Request Body</h3>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className={`w-full px-4 py-3 border rounded font-mono text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder='{"key": "value"}'
                />
              </div>
            )}
          </div>
        </div>

        {/* Response Section */}
        <div className="flex-1 p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database size={18} />
            Response
            {response && (
              <button
                onClick={() => copyToClipboard(JSON.stringify(response.body, null, 2))}
                className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <Copy size={14} />
                Copy Response
              </button>
            )}
          </h2>
          
          {response ? (
            <div className="space-y-6">
              {/* Response Status Bar */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`px-4 py-2 rounded text-white ${getStatusColor(response.status)}`}>
                    Status: {response.status} {response.statusText || ''}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ⏱️ Time: {response.time || response.localTime || 0}ms
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📦 Size: {response.size || 0} bytes
                    </div>
                    {response.localTime && (
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        🔌 Network: {response.localTime - (response.time || 0)}ms
                      </div>
                    )}
                  </div>
                </div>
                
                {response.error && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5" size={18} />
                    <div>
                      <div className="font-medium text-red-700 dark:text-red-400">Error</div>
                      <div className="text-sm text-red-600 dark:text-red-300">{response.error}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Headers */}
              {response.headers && Object.keys(response.headers).length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center justify-between">
                    <span>Headers</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(response.headers, null, 2))}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Copy size={12} />
                      Copy Headers
                    </button>
                  </h3>
                  <div className={`rounded p-4 font-mono text-sm ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <EnhancedJSONViewer 
                      data={response.headers} 
                      onCopy={copyToClipboard}
                    />
                  </div>
                </div>
              )}

              {/* Response Body */}
              <div>
                <h3 className="font-medium mb-3 flex items-center justify-between">
                  <span>Body</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(response.body, null, 2))}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                    <button
                      onClick={() => window.open(`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(response.body, null, 2))}`, '_blank')}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      Open
                    </button>
                  </div>
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-auto max-h-96">
                  {response.error ? (
                    <div className="text-red-400 p-4">{response.error}</div>
                  ) : typeof response.body === 'object' ? (
                    <EnhancedJSONViewer 
                      data={response.body} 
                      onCopy={copyToClipboard}
                    />
                  ) : (
                    <pre className="text-green-400 whitespace-pre-wrap p-4">{response.body}</pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-medium mb-2">No Response Yet</h3>
              <p>Send a request to see the response here</p>
              <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium">Quick Start</div>
                  <div className="text-xs mt-1 opacity-75">Try a sample API request</div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-sm font-medium">Collections</div>
                  <div className="text-xs mt-1 opacity-75">Organize your APIs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;