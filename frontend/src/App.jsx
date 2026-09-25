import { useState } from "react";

import ReactMarkdown from "react-markdown";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");

  const uploadPDF = async () => {
    if (!file) {
      setMessage("Please select a PDF first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setAnswer("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setMessage(
        `✓ ${data.filename} uploaded successfully. ${data.chunks} chunks created.`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      setMessage("Please enter a question.");
      return;
    }

    setAsking(true);
    setMessage("");
    setAnswer("");

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get answer.");
      }

      if (data.error) {
        setMessage(data.error);
      } else {
        setAnswer(data.answer);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAsking(false);
    }
  };

  const handleQuestionKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">AI</div>

        <div>
          <h1>AI Study Assistant</h1>
          <p>Learn from your study materials using AI</p>
        </div>
      </header>

      <main className="container">
        <section className="card upload-card">
          <div className="section-title">
            <span className="icon">📄</span>
            <div>
              <h2>Upload Study Material</h2>
              <p>Upload a PDF and ask questions about its content.</p>
            </div>
          </div>

          <label className="file-box">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setFile(event.target.files[0]);
                setMessage("");
              }}
            />

            <span className="upload-icon">↑</span>

            <strong>
              {file ? file.name : "Choose a PDF file"}
            </strong>

            <small>
              {file
                ? "PDF selected"
                : "Click here to select your study material"}
            </small>
          </label>

          <button
            className="primary-button"
            onClick={uploadPDF}
            disabled={uploading || !file}
          >
            {uploading ? "Processing PDF..." : "Upload PDF"}
          </button>
        </section>

        <section className="card question-card">
          <div className="section-title">
            <span className="icon">💬</span>
            <div>
              <h2>Ask a Question</h2>
              <p>Ask something related to your uploaded study material.</p>
            </div>
          </div>

          <div className="question-box">
            <input
              type="text"
              placeholder="What is inheritance?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleQuestionKeyDown}
            />

            <button
              className="ask-button"
              onClick={askQuestion}
              disabled={asking || !question.trim()}
            >
              {asking ? "Thinking..." : "Ask"}
            </button>
          </div>

          <small className="hint">
            Press Enter to ask your question
          </small>
        </section>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {answer && (
          <section className="card answer-card">
            <div className="section-title">
              <span className="icon">✨</span>
              <div>
                <h2>AI Answer</h2>
                <p>Generated from your uploaded study material.</p>
              </div>
            </div>

            <div className="answer">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </section>
        )}
      </main>

      <footer>
        AI Study Assistant • RAG-based learning application
      </footer>
    </div>
  );
}

export default App;