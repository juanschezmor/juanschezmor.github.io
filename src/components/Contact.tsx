import { useState } from "react";
import "../styles/contact.css";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function Contact() {
  const { t } = useTranslation();
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
        toast.success(t("contact.toastSuccess"), {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        setStatus("error");
        toast.error(t("contact.toastError"), {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      console.error("Error submitting the form:", err);
      setStatus("error");
      toast.error(t("contact.toastUnexpected"));
    }
  };

  const openToRoles = t("contact.openTo", { returnObjects: true }) as string[];

  return (
    <article id="contact" className="contact">
      <div className="section-shell contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h2 className="title">{t("contact.title")}</h2>
          <p className="section-copy">{t("contact.copy")}</p>
          <div className="contact-highlights panel-card">
            <div>
              <span>{t("contact.labels.email")}</span>
              <p>juanschezmor@gmail.com</p>
            </div>
            <div>
              <span>{t("contact.labels.basedIn")}</span>
              <p>Spain</p>
            </div>
            <div>
              <span>{t("contact.labels.openTo")}</span>
              <div className="contact-open-to">
                {openToRoles.map((role) => (
                  <span key={role}>{role}</span>
                ))}
              </div>
            </div>
          </div>
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
                  {t("contact.labels.name")}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder={t("contact.placeholders.name")}
                  className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block mb-1">
                  {t("contact.labels.emailInput")}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t("contact.placeholders.email")}
                  className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block mb-1">
                {t("contact.labels.company")}{" "}
                <small className="text-gray-500">{t("contact.labels.optional")}</small>
              </label>
              <input
                type="text"
                name="company"
                id="company"
                placeholder={t("contact.placeholders.company")}
                className="form-control w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="comments" className="block mb-1">
                {t("contact.labels.message")}
              </label>
              <textarea
                id="comments"
                name="comment"
                placeholder={t("contact.placeholders.message")}
                className="form-control w-full px-4 py-2 border rounded-md h-32 resize-none focus:outline-none focus:ring focus:ring-indigo-400"
                value={formData.comment}
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary btn-block w-full sm:w-auto"
                disabled={status === "sending"}
              >
                {status === "sending" ? t("contact.sending") : t("contact.send")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
}

export default Contact;
