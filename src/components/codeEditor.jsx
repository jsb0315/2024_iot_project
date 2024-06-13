import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import cpp from 'highlight.js/lib/languages/cpp';
import './codeEditor.css';

hljs.registerLanguage('cpp', cpp);

const useTypeText = (text, delay = 25) => {
  const [animatedText, setAnimatedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (text) {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setAnimatedText((prevText) => prevText + text[currentIndex]);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }, delay);

        return () => clearTimeout(timer);
      }
    } else {
      setAnimatedText('');
      setCurrentIndex(0);
    }
  }, [currentIndex, text, delay]);

  return animatedText;
};

export default function CodeEditor({ code }) {
  if (code)
    code = code.replaceAll(';',';\n').replaceAll('{','{\n').replaceAll('}','}\n')
  const animatedCode = useTypeText(code || '');
  const highlightedCode = hljs.highlight(animatedCode, { language: 'cpp' }).value;

  return (
    <div className="code-editor-container">
      <pre className="code-editor-content">
        {code ? <code dangerouslySetInnerHTML={{ __html: highlightedCode }} /> : <code/>}
        {animatedCode !== code && <span className="cursor"></span>}
      </pre>
    </div>
  );
}