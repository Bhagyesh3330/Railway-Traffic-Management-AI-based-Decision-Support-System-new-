// frontend/pages/login.jsx
import { useState } from 'react';
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessage({ type: 'success', text: 'Login successful — welcome ' + data.user.username });
        // Here you can redirect to dashboard: router.push('/dashboard')
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network or server error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="absolute top-6 left-6 text-lg font-semibold">
        <span className="mr-2">[LOGO]</span>
        Indian Railways Intelligent Control System
      </div>

      {/* background image - replace src with your asset */}
      <div className="fixed inset-0 opacity-30">
        <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('/train-bg.jpg')"}} />
      </div>

      <div className="z-10 max-w-md w-full p-6 bg-black/60 rounded-2xl shadow-2xl border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-center">Login to Portal</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300">Username</label>
            <input
              className="mt-1 w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="mt-1 w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin@123"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300">Role</label>
            <select
              className="mt-1 w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Admin</option>
              <option>Operator</option>
              <option>Controller</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-right text-sm text-gray-400 hover:underline cursor-pointer">
            Forgot Password?
          </div>

          {message && (
            <div className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          © 2025 Indian Railways
        </div>
      </div>
    </div>
  );
}
