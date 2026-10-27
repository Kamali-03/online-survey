
import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [rating, setRating] = useState(0);

  const [feedback, setFeedback] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  function handleChange(e) {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await axios.post(`${API}/feedback`, {
        ...feedback,
        rating,
      });

      setSuccess("Your feedback has been submitted successfully!");
      setFeedback({
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
      });
      setRating(0);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to submit feedback. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setSuccess("");
  }

  return (
    <div className="survey-page">
      <nav className="navbar">
        <a className="brand" href="/">Pulse<span>Survey</span></a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="http://localhost:5173/getAllData">Admin Dashboard</a>
          <button className="nav-button" onClick={() => setOpen(true)}>
            Give Feedback
          </button>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <span className="eyebrow">✦ YOUR VOICE MATTERS</span>
          <h1>Every opinion makes us <span>better.</span></h1>
          <p>
            Share your experience, help us understand what works,
            and inspire better sessions for everyone.
          </p>

          <div className="hero-actions">
            <button className="primary-button" onClick={() => setOpen(true)}>
              Share Your Feedback ↗
            </button>
            <a className="secondary-button" href="#about">
              Learn more
            </a>
          </div>

          <div className="trust-note">
            <span className="trust-icon">✓</span>
            Quick to complete · Your feedback matters
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card card-top">
            <span className="bubble-icon">✦</span>
            <div>
              <strong>Your voice</strong>
              <small>Creates positive change</small>
            </div>
          </div>

          <div className="survey-art">
            <div className="art-orbit orbit-one"></div>
            <div className="art-orbit orbit-two"></div>
            <div className="art-center">
              <span>✳</span>
            </div>
            <div className="art-star star-one">✦</div>
            <div className="art-star star-two">✧</div>
            <div className="art-dot dot-one"></div>
            <div className="art-dot dot-two"></div>
          </div>

          <div className="floating-card card-bottom">
            <span className="bubble-icon">♡</span>
            <div>
              <strong>Make an impact</strong>
              <small>One response at a time</small>
            </div>
          </div>
        </div>
      </main>

      <section id="about" className="benefits">
        <div>
          <span className="benefit-icon">✎</span>
          <h3>Easy to share</h3>
          <p>Answer a few simple questions in minutes.</p>
        </div>
        <div>
          <span className="benefit-icon">☆</span>
          <h3>Rate your experience</h3>
          <p>Tell us how helpful your session was.</p>
        </div>
        <div>
          <span className="benefit-icon">↗</span>
          <h3>Make a difference</h3>
          <p>Your suggestions help improve future sessions.</p>
        </div>
      </section>

      <footer>© 2026 PulseSurvey · Feedback that moves us forward.</footer>

      {open && (
        <div className="modal-overlay" onClick={closeModal}>
          <section
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" onClick={closeModal}>
              ×
            </button>

            <div className="modal-heading">
              <span className="eyebrow">WE'RE LISTENING</span>
              <h2 id="modal-title">Share your thoughts</h2>
              <p>Your honest feedback helps us improve.</p>
            </div>

            {success ? (
              <div className="success-panel">
                <div className="success-check">✓</div>
                <h3>Thank you!</h3>
                <p>{success}</p>
                <button className="primary-button" onClick={closeModal}>
                  Done
                </button>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <label>
                  Your name
                  <input
                    name="q1"
                    value={feedback.q1}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </label>

                <label>
                  Department
                  <input
                    name="q2"
                    value={feedback.q2}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    required
                  />
                </label>

                <label>
                  Session title
                  <input
                    name="q3"
                    value={feedback.q3}
                    onChange={handleChange}
                    placeholder="Which session did you attend?"
                    required
                  />
                </label>

                <label>
                  How was your experience?
                  <div className="rating-stars" aria-label="Rate your experience">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={star <= rating ? "star active" : "star"}
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                    <span>{rating ? `${rating}/5` : "Choose a rating"}</span>
                  </div>
                </label>

                <label>
                  Your feedback
                  <textarea
                    name="q4"
                    value={feedback.q4}
                    onChange={handleChange}
                    placeholder="What did you like about the session?"
                    required
                    rows="3"
                  />
                </label>

                <label>
                  Suggestions for improvement
                  <textarea
                    name="q5"
                    value={feedback.q5}
                    onChange={handleChange}
                    placeholder="What could we do better?"
                    rows="2"
                  />
                </label>

                <button
                  className="primary-button submit-button"
                  type="submit"
                  disabled={loading || rating === 0}
                >
                  {loading ? "Submitting..." : "Submit Feedback ↗"}
                </button>
                {rating === 0 && (
                  <small className="rating-hint">
                    Please select a star rating before submitting.
                  </small>
                )}
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
