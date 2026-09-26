"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Home as HomeIcon,
  Users,
  MessageCircle,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import LoginPrompt from "@/components/LoginPrompt";
import PostCard from "@/components/PostCard";
import { request } from "@/lib/api-client";

export default function Feed() {
  const router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      try {
        const result = await request("/api/posts");
        if (!cancelled) {
          setPosts(result.posts ?? []);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
        }
      }
    };

    loadPosts();

    const onFocus = () => loadPosts();

    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStories = async () => {
      if (!isLoggedIn) return;

      try {
        const result = await request("/api/stories");
        if (!cancelled) {
          setStories(result.stories ?? []);
        }
      } catch {
        if (!cancelled) {
          setStories([]);
        }
      }
    };

    loadStories();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const requireLogin = (action) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    action();
  };

  const profilePhoto =
    user?.profilePhoto ||
    user?.avatar ||
    user?.profilePicture ||
    `https://i.pravatar.cc/100?u=${user?.id || "user"}`;

  const userName = user?.name || "Student";

  const userBranch =
    user?.branch ||
    user?.department ||
    user?.course ||
    "CSE";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          hidden
          h-screen
          w-[240px]
          flex-col
          border-r
          border-slate-200
          bg-white
          lg:flex
        "
      >
        {/* LOGO */}

        <div className="px-8 pt-12">
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900">
            Uni<span className="text-indigo-500">Link</span>
          </h1>

          <p className="mt-1 text-[12px] text-slate-500">
            Ideas. People. Opportunities.
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="mt-16 px-4">

          {/* HOME */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              flex
              h-[52px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <HomeIcon size={22} />
            <span>Home</span>
          </button>

          {/* SEARCH */}

          <button
            type="button"
            onClick={() => router.push("/search")}
            className="
              mt-2
              flex
              h-[52px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <Search size={22} />
            <span>Search</span>
          </button>

          {/* CREATE */}

          <button
            type="button"
            onClick={() =>
              requireLogin(() => router.push("/create"))
            }
            className="
              mt-2
              flex
              h-[52px]
              w-full
              items-center
              gap-4
              rounded-xl
              bg-gradient-to-r
              from-indigo-500
              to-violet-500
              px-4
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:opacity-95
            "
          >
            <Plus size={22} />
            <span>Create</span>
          </button>

          {/* MESSAGES */}

          <button
            type="button"
            onClick={() =>
              requireLogin(() => router.push("/messages"))
            }
            className="
              mt-2
              flex
              h-[52px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <MessageCircle size={22} />
            <span>Messages</span>
          </button>

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              requireLogin(() => router.push("/profile"))
            }
            className="
              mt-2
              flex
              h-[52px]
              w-full
              items-center
              gap-4
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <User size={22} />
            <span>Profile</span>
          </button>

        </nav>

        {/* USER */}

        <div className="mt-auto border-t border-slate-200 px-5 py-5">

          <button
            type="button"
            onClick={() =>
              requireLogin(() => router.push("/profile"))
            }
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              p-2
              text-left
              transition
              hover:bg-slate-50
            "
          >
            <img
              src={profilePhoto}
              alt={userName}
              className="size-11 rounded-full object-cover"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {userName}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {userBranch}
              </p>
            </div>
          </button>

        </div>
      </aside>

      {/* =====================================================
          EVERYTHING TO THE RIGHT OF SIDEBAR
      ====================================================== */}

      <div className="lg:ml-[240px]">

        {/* =================================================
            TOP NAVBAR
        ================================================== */}

        <header
          className="
            sticky
            top-0
            z-40
            h-[64px]
            border-b
            border-slate-200
            bg-white/95
            backdrop-blur-md
          "
        >
          <div
            className="
              mx-auto
              flex
              h-full
              w-full
              max-w-[1000px]
              items-center
              justify-end
              px-5
            "
          >

            {/* NOTIFICATIONS */}

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="
                flex
                size-9
                items-center
                justify-center
                rounded-full
                text-slate-600
                transition
                hover:bg-slate-100
              "
            >
              <Bell size={20} />
            </button>

          </div>
        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <main
          className="
            mx-auto
            w-full
            max-w-[1000px]
            px-4
            pb-24
            pt-5
            sm:px-6
            lg:px-8
          "
        >

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={20}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              placeholder="Search posts, people, opportunities..."
              onClick={() => router.push("/search")}
              readOnly
              className="
                h-[48px]
                w-full
                cursor-pointer
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-12
                pr-4
                text-sm
                text-slate-700
                outline-none
                placeholder:text-slate-400
                transition
                hover:border-slate-300
              "
            />

          </div>

          {/* =================================================
              STORIES
          ================================================== */}

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">

            <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">

              {/* YOUR STORY */}

              <button
                type="button"
                onClick={() =>
                  requireLogin(() => router.push("/create"))
                }
                className="flex min-w-[58px] flex-col items-center"
              >

                <div className="relative">

                  <img
                    src={profilePhoto}
                    alt="Your story"
                    className="
                      size-[58px]
                      rounded-full
                      border-2
                      border-slate-200
                      object-cover
                    "
                  />

                  <span
                    className="
                      absolute
                      bottom-0
                      right-0
                      flex
                      size-5
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-indigo-500
                      text-white
                    "
                  >
                    <Plus size={12} />
                  </span>

                </div>

                <span
                  className="
                    mt-2
                    max-w-[65px]
                    truncate
                    text-[11px]
                    font-medium
                    text-slate-700
                  "
                >
                  Your story
                </span>

              </button>

              {/* STORIES */}

              {stories.map((story) => (
                <button
                  type="button"
                  key={story.id}
                  className="
                    flex
                    min-w-[58px]
                    flex-col
                    items-center
                  "
                >
                  <div
                    className="
                      rounded-full
                      bg-gradient-to-tr
                      from-indigo-500
                      via-violet-500
                      to-pink-500
                      p-[2px]
                    "
                  >

                    <div className="rounded-full bg-white p-[2px]">

                      <img
                        src={
                          story.user?.profilePhoto ||
                          `https://i.pravatar.cc/100?u=${story.user?.id || "story"}`
                        }
                        alt={story.user?.fullName || "Story"}
                        className="
                          size-[54px]
                          rounded-full
                          object-cover
                        "
                      />

                    </div>

                  </div>

                  <span
                    className="
                      mt-2
                      max-w-[65px]
                      truncate
                      text-[11px]
                      font-medium
                      text-slate-700
                    "
                  >
                    {story.user?.fullName || "Story"}
                  </span>

                </button>
              ))}

            </div>

          </section>

          {/* =================================================
              FEED
          ================================================== */}

          <section className="mt-5 space-y-5">

            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))
            ) : (

              /* EMPTY FEED */

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-6
                  py-16
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    size-14
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-50
                    text-indigo-500
                  "
                >
                  <Users size={26} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Your feed is empty
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-sm
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Connect with people and share something
                  with your college network.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className="
                    mt-5
                    rounded-xl
                    bg-indigo-500
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-indigo-600
                  "
                >
                  Find People
                </button>

              </div>

            )}

          </section>

        </main>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}

      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* LOGIN PROMPT */}

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />

    </div>
  );
}