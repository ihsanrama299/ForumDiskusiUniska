import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import NavbarMenu from "./pages/components/NavbarMenu";

// pages
import Home from "./pages/Home";
import News from "./pages/News";
import Admin from "./pages/Admin";
import Post from "./pages/Post";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NewsPost from "./pages/NewsPost";
import SearchResult from "./pages/SearchResult";
import NotFound from "./pages/NotFound";

import Ad from "./pages/Ad";

import AdminUsers from "./pages/AdminUsers";
import AdminPosts from "./pages/AdminPosts";
import AdminAds from "./pages/AdminAds";
import AdminCategories from "./pages/AdminCategories";
import AdminReporteds from "./pages/AdminReporteds";
import SandBox from "./pages/SandBox";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sort, setSort] = useState(1);

  const [user, setUser] = useState({});

  function getToken() {
    const cookie = new Cookies();
    const decoded = cookie.get("token") ? jwt(cookie.get("token")) : null;
    if (decoded != null) {
      setUser(decoded.user[0]);
    } else {
      if (location.pathname === "/") {
        return navigate("/login");
      }
    }
  }

  useEffect(getToken, [navigate, location.pathname]);

  const [posts, setPosts] = useState([{}]);

  function getPosts() {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/post/${sort}`);
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchPost();
  }

  useEffect(getPosts, [sort]);

  const [categoryFilter, setCategoryFilter] = useState("all");

  return (
    <>
      <NavbarMenu user={user} />

      <Routes>
        <Route path="/sandbox" element={<SandBox />} />
        <Route
          path="/"
          element={
            <Home
              posts={posts}
              user={user}
              getPosts={getPosts}
              setSort={setSort}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          }
        />
        <Route path="/news" element={<News user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search/:query" element={<SearchResult user={user} />} />
        <Route path="/profile/:id" element={<Profile user={user} />} />

        <Route
          path="/post/:name/:id/"
          element={<Post user={user} refreshPosts={getPosts} />}
        />
        <Route path="/news/:id" element={<NewsPost user={user} />} />
        <Route path="/admin" element={<Admin user={user} />} />
        <Route path="/admin/dashboard" element={<Admin user={user} />} />
        <Route path="/admin/users" element={<AdminUsers user={user} />} />
        <Route path="/admin/posts" element={<AdminPosts user={user} />} />
        <Route path="/admin/ads" element={<AdminAds user={user} />} />
        <Route
          path="/admin/categories"
          element={<AdminCategories user={user} />}
        />
        <Route
          path="/admin/reporteds"
          element={<AdminReporteds user={user} />}
        />
        <Route path="/admin-login" element={<Login user={user} />} />

        <Route path="/ad" element={<Ad />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
