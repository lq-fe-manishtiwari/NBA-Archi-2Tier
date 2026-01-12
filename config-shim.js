// src/config-shim.js
// This replaces the broken Node.js "config" package in the browser

const configShim = {
    get: (key) => {
      // Try multiple prefixes – covers all old code
      return (
        import.meta.env[key] ||
        import.meta.env['VITE_' + key] ||
        import.meta.env['REACT_APP_' + key] ||
        null
      );
    },
    has: (key) => configShim.get(key) !== null,
    // Some old code uses config.get('app.url') style
    app: {
      url: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    },
    // Add anything else your old code uses
  };
  
  export default configShim;