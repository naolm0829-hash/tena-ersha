import { useState, useEffect } from "react";
import { MessageSquare, Send, ArrowLeft, ThumbsUp, Plus } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ReportButton from "@/components/ReportButton";
import ImageUpload from "@/components/ImageUpload";

interface Post {
  id: string;
  title: string;
  body: string;
  category: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string | null } | null;
  reply_count?: number;
}

interface Reply {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

const categories = [
  { value: "general", en: "General", am: "ጠቅላላ" },
  { value: "crops", en: "Crops", am: "ሰብል" },
  { value: "livestock", en: "Livestock", am: "እንስሳ" },
  { value: "market", en: "Market", am: "ገበያ" },
  { value: "weather", en: "Weather", am: "አየር" },
];

const Forum = () => {
  const { lang } = useLang();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [postImage, setPostImage] = useState("");

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch reply counts
      const postsWithCounts = await Promise.all(
        data.map(async (post: any) => {
          const { count } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          return { ...post, reply_count: count || 0 };
        })
      );
      setPosts(postsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchReplies = async (postId: string) => {
    const { data } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setReplies(data || []);
  };

  const openPost = (post: Post) => {
    setSelectedPost(post);
    fetchReplies(post.id);
  };

  const createPost = async () => {
    if (!user || !title.trim() || !body.trim()) return;
    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
      category,
      image_url: postImage || null,
    } as any);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setBody(""); setShowNew(false);
    fetchPosts();
    toast.success(lang === "am" ? "ጥያቄ ተልኳል!" : "Post created!");
  };

  const sendReply = async () => {
    if (!user || !selectedPost || !replyText.trim()) return;
    const { error } = await supabase.from("forum_replies").insert({
      post_id: selectedPost.id,
      user_id: user.id,
      body: replyText.trim(),
    });
    if (error) { toast.error(error.message); return; }
    setReplyText("");
    fetchReplies(selectedPost.id);
  };

  const userName = (p: any) => p?.profiles?.full_name || p?.profiles?.email?.split("@")[0] || "Farmer";
  const filteredPosts = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  // Post detail view
  if (selectedPost) {
    return (
      <div className="container py-8 max-w-2xl space-y-4">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> {lang === "am" ? "ተመለስ" : "Back"}
        </button>
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {categories.find(c => c.value === selectedPost.category)?.[lang === "am" ? "am" : "en"]}
          </span>
          <h2 className="text-xl font-bold">{selectedPost.title}</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{selectedPost.body}</p>
          {(selectedPost as any).image_url && (
            <img src={(selectedPost as any).image_url} alt="" className="rounded-lg max-h-64 object-cover" />
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              — {userName(selectedPost)} · {new Date(selectedPost.created_at).toLocaleDateString()}
            </p>
            <ReportButton targetType="forum_post" targetId={selectedPost.id} />
          </div>
        </div>

        <h3 className="font-bold">{lang === "am" ? "መልሶች" : "Replies"} ({replies.length})</h3>
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{r.body}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  — {userName(r)} · {new Date(r.created_at).toLocaleDateString()}
                </p>
                <ReportButton targetType="forum_reply" targetId={r.id} />
              </div>
            </div>
          ))}
        </div>

        {user ? (
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={lang === "am" ? "መልስ ይጻፉ..." : "Write a reply..."}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
            />
            <button onClick={sendReply} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              <Send className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="block text-center text-sm text-primary hover:underline">
            {lang === "am" ? "ለመመለስ ይግቡ" : "Log in to reply"}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary">
          💬 {lang === "am" ? "የገበሬ መድረክ" : "Community Forum"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "am" ? "ጥያቄ ይጠይቁ ፣ ልምድ ያጋሩ" : "Ask questions, share farming tips"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {lang === "am" ? "ሁሉም" : "All"}
        </button>
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filter === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {lang === "am" ? c.am : c.en}
          </button>
        ))}
      </div>

      {/* New post button */}
      {user && (
        <button
          onClick={() => setShowNew(!showNew)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          <Plus className="h-5 w-5" />
          {lang === "am" ? "አዲስ ጥያቄ ጠይቅ" : "Ask a Question"}
        </button>
      )}

      {/* New post form */}
      {showNew && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{lang === "am" ? c.am : c.en}</option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lang === "am" ? "ርዕስ" : "Title"}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={lang === "am" ? "ጥያቄዎን ይጻፉ..." : "Write your question..."}
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
          />
          <ImageUpload folder="forum" onUpload={setPostImage} />
          <button onClick={createPost} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            {lang === "am" ? "ላክ" : "Post"}
          </button>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">{lang === "am" ? "እየጫነ..." : "Loading..."}</p>
      ) : filteredPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {lang === "am" ? "ገና ጥያቄ የለም" : "No posts yet. Be the first to ask!"}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {categories.find(c => c.value === post.category)?.[lang === "am" ? "am" : "en"]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userName(post)} · {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> {post.reply_count} {lang === "am" ? "መልሶች" : "replies"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!user && (
        <Link to="/auth" className="block text-center text-sm text-primary hover:underline">
          {lang === "am" ? "ለመጠየቅ ይግቡ" : "Log in to post questions"}
        </Link>
      )}
    </div>
  );
};

export default Forum;
