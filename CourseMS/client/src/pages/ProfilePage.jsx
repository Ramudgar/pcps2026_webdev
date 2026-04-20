import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, changePassword } from "../services/userApi";
import { API_BASE_URL } from "../config/api.config";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  if (!token) { navigate("/login", { state: { from: "/profile" } }); return null; }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });
  const [passLoading, setPassLoading] = useState(false);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile(token);
      const u = data.user || data;
      setUser(u);
      setProfileForm({ name: u.name || "", phone: u.phone || "", address: u.address || "" });
      if (u.avatar) setAvatarPreview(`${API_BASE_URL}${u.avatar}`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: "", type: "" });
    try {
      const data = await updateProfile(token, profileForm);
      const u = data.user || data;
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || "Update failed", type: "error" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setProfileMsg({ text: "Only JPEG, PNG, GIF, WEBP images are allowed", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ text: "File size must be under 5MB", type: "error" });
      return;
    }

    setAvatarLoading(true);
    try {
      const data = await uploadAvatar(token, file);
      const avatarUrl = data.user?.avatar || data.avatar;
      setAvatarPreview(`${API_BASE_URL}${avatarUrl}`);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.avatar = avatarUrl;
      localStorage.setItem("user", JSON.stringify(stored));
      setUser((prev) => ({ ...prev, avatar: avatarUrl }));
      setProfileMsg({ text: "Avatar updated!", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || "Avatar upload failed", type: "error" });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      await deleteAvatar(token);
      setAvatarPreview(null);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.avatar = null;
      localStorage.setItem("user", JSON.stringify(stored));
      setUser((prev) => ({ ...prev, avatar: null }));
      setProfileMsg({ text: "Avatar removed", type: "success" });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || "Failed to remove avatar", type: "error" });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNew) {
      setPassMsg({ text: "New passwords do not match", type: "error" });
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassMsg({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }
    setPassLoading(true);
    setPassMsg({ text: "", type: "" });
    try {
      await changePassword(token, {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassMsg({ text: "Password changed successfully!", type: "success" });
      setPassForm({ currentPassword: "", newPassword: "", confirmNew: "" });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || "Password change failed", type: "error" });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: "profile", label: "Edit Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" },
    { id: "avatar", label: "Photo", icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" },
    { id: "password", label: "Security", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  ];

  const MsgBox = ({ msg }) => msg.text && (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className={`px-4 py-3 rounded-xl border text-sm mb-5 ${
        msg.type === "success"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-600"
      }`}
    >
      {msg.text}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-[1100px] mx-auto px-5 py-8"
    >
      <div className="flex flex-col md:flex-row gap-7">
        <aside className="w-full md:w-[280px] shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-gray-200 mb-4"
          >
            <div className="relative w-[100px] h-[100px] mx-auto mb-4">
              {avatarPreview ? (
                <motion.img
                  key={avatarPreview}
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  src={avatarPreview} alt={user?.name}
                  className="w-[100px] h-[100px] rounded-full object-cover border-[3px] border-gray-200"
                />
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-4xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{user?.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
            <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-500 text-xs font-semibold capitalize">
              {user?.role}
            </span>
          </motion.div>

          <div className="bg-white rounded-2xl p-2 border border-gray-200">
            {menuItems.map((item) => (
              <motion.button
                key={item.id} onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-colors cursor-pointer border-none ${
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "bg-transparent text-gray-500 hover:bg-gray-50"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                  {item.id === "profile" && <circle cx="12" cy="7" r="4" />}
                  {item.id === "avatar" && <circle cx="12" cy="13" r="4" />}
                </svg>
                {item.label}
              </motion.button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              {activeTab === "profile" && (
                <>
                  <h2 className="text-[22px] font-bold text-gray-900 mb-1">Edit Profile</h2>
                  <p className="text-sm text-gray-500 mb-6">Update your personal information</p>
                  <MsgBox msg={profileMsg} />
                  <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Full Name</label>
                        <input type="text" value={profileForm.name} required
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Email</label>
                        <input type="email" value={user?.email || ""} disabled
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-100 cursor-not-allowed outline-none" />
                        <span className="text-[11px] text-gray-400">Email cannot be changed</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Phone</label>
                        <input type="tel" value={profileForm.phone} placeholder="Your phone number"
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Role</label>
                        <input type="text" value={user?.role || ""} disabled
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-100 cursor-not-allowed capitalize outline-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Address</label>
                      <textarea value={profileForm.address} rows={3} placeholder="Your address"
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y" />
                    </div>

                    <motion.button type="submit" disabled={profileLoading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="self-start px-8 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border-none">
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </form>
                </>
              )}

              {activeTab === "avatar" && (
                <>
                  <h2 className="text-[22px] font-bold text-gray-900 mb-1">Profile Photo</h2>
                  <p className="text-sm text-gray-500 mb-6">Upload or change your profile picture</p>
                  <MsgBox msg={profileMsg} />

                  <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-[180px] h-[180px] rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0"
                    >
                      {avatarPreview ? (
                        <motion.img
                          key={avatarPreview}
                          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          src={avatarPreview} alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <p className="text-gray-400 text-[13px] mt-2">No photo</p>
                        </div>
                      )}
                    </motion.div>

                    <div className="flex flex-col gap-3 pt-2">
                      <input type="file" ref={fileInputRef}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange} className="hidden" />

                      <motion.button
                        onClick={() => fileInputRef.current?.click()} disabled={avatarLoading}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 border-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {avatarLoading ? "Uploading..." : "Upload Photo"}
                      </motion.button>

                      {avatarPreview && (
                        <motion.button
                          onClick={handleDeleteAvatar} disabled={avatarLoading}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="px-5 py-2.5 bg-transparent border border-red-200 rounded-xl text-red-600 text-[13px] font-medium cursor-pointer">
                          Remove Photo
                        </motion.button>
                      )}

                      <div className="text-xs text-gray-400 leading-relaxed">
                        <p>Accepted formats: JPEG, PNG, GIF, WEBP</p>
                        <p>Max file size: 5MB</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "password" && (
                <>
                  <h2 className="text-[22px] font-bold text-gray-900 mb-1">Change Password</h2>
                  <p className="text-sm text-gray-500 mb-6">Keep your account secure by updating your password</p>
                  <MsgBox msg={passMsg} />

                  <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Current Password</label>
                      <input type="password" value={passForm.currentPassword} required
                        onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">New Password</label>
                        <input type="password" value={passForm.newPassword} required minLength={6}
                          onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
                        <input type="password" value={passForm.confirmNew} required
                          onChange={(e) => setPassForm({ ...passForm, confirmNew: e.target.value })}
                          className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                      </div>
                    </div>
                    <motion.button type="submit" disabled={passLoading}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="self-start px-8 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border-none">
                      {passLoading ? "Changing..." : "Update Password"}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
