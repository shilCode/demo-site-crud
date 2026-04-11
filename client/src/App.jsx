import { Routes, Route, Link } from "react-router-dom";
import ContactList from "./components/ContactList";
import ContactForm from "./components/ContactForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow" data-testid="navbar">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900" data-testid="nav-home">
            Contact Manager
          </Link>
          <Link
            to="/contacts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            data-testid="nav-add-contact"
          >
            + Add Contact
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ContactList />} />
          <Route path="/contacts/new" element={<ContactForm />} />
          <Route path="/contacts/:id/edit" element={<ContactForm />} />
        </Routes>
      </main>
    </div>
  );
}
