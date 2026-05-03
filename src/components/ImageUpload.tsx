import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
}

const ImageUpload = ({ onUpload, folder = "general" }: ImageUploadProps) => {
  const { user } = useAuth();
  const { lang } = useLang();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) {
      setPreview(null);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="upload preview" className="h-20 w-20 object-cover rounded-lg border border-border" />
          <button
            onClick={() => { setPreview(null); onUpload(""); }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
          {uploading && <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center text-xs">...</div>}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
          {lang === "am" ? "ፎቶ ያክሉ" : "Add photo"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
};

export default ImageUpload;
