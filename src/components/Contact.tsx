import { useState } from "react";
import "../styles/contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    comment: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("https://formspree.io/f/mqkvgody", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", comment: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <article id="contact" className="contact">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h6 className="text-brand text-sm font-semibold tracking-widest mb-2">
            CONTACT
          </h6>
          <h1 className="text-3xl font-bold">Reach me out!</h1>
        </div>

        <div className="form-container">
          <form
            id="survey-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <label htmlFor="name" className="block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block mb-1">
                Company <small className="text-gray-500">(optional)</small>
              </label>
              <input
                type="text"
                name="company"
                id="company"
                placeholder="Company name"
                className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="comments" className="block mb-1">
                Leave Message
              </label>
              <textarea
                id="comments"
                name="comment"
                placeholder="Enter your comment here..."
                className="form-control w-full px-4 py-2 border rounded-md h-32 resize-none focus:outline-none focus:ring focus:ring-indigo-400"
                value={formData.comment}
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary btn-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition w-full sm:w-auto"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </div>

            {status === "success" && (
              <p className="text-green-600 text-sm mt-2">
                Message sent successfully! 💌
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-sm mt-2">
                Oops! Something went wrong. Try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </article>
  );
}

export default Contact;
