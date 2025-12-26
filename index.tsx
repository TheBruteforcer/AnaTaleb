
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const errorDisplay = document.getElementById('error-display');
const errorMsg = document.getElementById('error-message');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error("Critical Render Error:", error);
  if (errorDisplay && errorMsg) {
    errorDisplay.style.display = 'block';
    errorMsg.innerText = error.message || "حدث خطأ غير متوقع أثناء تشغيل التطبيق.";
  }
}

// Global error handler for uncaught module errors
window.onerror = function(message, source, lineno, colno, error) {
  if (errorDisplay && errorMsg) {
    errorDisplay.style.display = 'block';
    errorMsg.innerText = `Error: ${message}\nSource: ${source}`;
  }
  return false;
};
