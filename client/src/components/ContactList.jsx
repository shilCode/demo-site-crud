import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchContacts, deleteContact } from "../api/contacts";
import ConfirmDialog from "./ConfirmDialog";

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const loadContacts = async (query = "") => {
    setLoading(true);
    try {
      const data = await fetchContacts(query);
      setContacts(data);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadContacts(search);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteContact(deleteTarget.id);
    setDeleteTarget(null);
    loadContacts(search);
  };

  return (
    <div data-testid="contact-list-page">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6" data-testid="search-form">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="search-input"
        />
        <button
          type="submit"
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
          data-testid="search-button"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p data-testid="loading-indicator" className="text-gray-500">Loading...</p>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-gray-500 text-lg">No contacts found.</p>
          <Link
            to="/contacts/new"
            className="text-blue-600 hover:underline mt-2 inline-block"
            data-testid="empty-state-add-link"
          >
            Add your first contact
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded" data-testid="contacts-table">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                  data-testid={`contact-row-${contact.id}`}
                >
                  <td className="px-4 py-3" data-testid={`contact-name-${contact.id}`}>
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td className="px-4 py-3" data-testid={`contact-email-${contact.id}`}>
                    {contact.email}
                  </td>
                  <td className="px-4 py-3 text-gray-500" data-testid={`contact-phone-${contact.id}`}>
                    {contact.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                      className="text-blue-600 hover:underline"
                      data-testid={`edit-contact-${contact.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(contact)}
                      className="text-red-600 hover:underline"
                      data-testid={`delete-contact-${contact.id}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Contact"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}?`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
