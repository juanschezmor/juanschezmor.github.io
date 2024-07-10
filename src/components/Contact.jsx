import React, { useState } from 'react';
import '../styles/contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    comment: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <article id="contact" className="contact">
      <div className="container">
        <div className="col-lg-8">
          <h6 className="text-brand">CONTACT</h6>
          <h1>Reach me out!</h1>
        </div>
        <div className="form-container">
          <form
            id="survey-form"
            action="https://formspree.io/f/mqkvgody"
            method="POST"
          >
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label id="name-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label id="email-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label id="company-label" htmlFor="company">
                    Company <small>(optional)</small>
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    className="form-control"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <label htmlFor="comments">Leave Message</label>
                  <textarea
                    id="comments"
                    className="form-control"
                    name="comment"
                    placeholder="Enter your comment here..."
                    value={formData.comment}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <button
                  type="submit"
                  id="submit"
                  className="btn btn-primary btn-block"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
}

export default Contact;
