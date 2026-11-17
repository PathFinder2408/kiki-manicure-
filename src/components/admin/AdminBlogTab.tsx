import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabase";
import type { BlogPost } from "@/types/salon";

interface AdminBlogTabProps {
  posts: BlogPost[];
  onRefresh: () => void;
}

export const AdminBlogTab = ({ posts, onRefresh }: AdminBlogTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    categoria: "cosmetologia",
    resumen: "",
    contenido: "",
    dato_pro: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `${form.titulo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

    const { error } = await supabase.from("blog_posts").insert({
      slug,
      titulo: form.titulo.trim(),
      categoria: form.categoria,
      resumen: form.resumen.trim(),
      contenido: form.contenido.trim(),
      dato_pro: form.dato_pro.trim(),
      publicado: true,
    });

    if (error) {
      toast.error("Error al publicar artículo");
      return;
    }

    toast.success("Artículo publicado en el Blog y el Carrusel");
    setForm({ titulo: "", categoria: "cosmetologia", resumen: "", contenido: "", dato_pro: "" });
    setShowForm(false);
    onRefresh();
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ publicado: !post.publicado })
      .eq("id", post.id);
    if (error) {
      toast.error("No se pudo actualizar");
      return;
    }
    toast.success(post.publicado ? "Artículo ocultado" : "Artículo publicado");
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Artículo eliminado");
    onRefresh();
  };

  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Blog de Cosmetología, Spa & Dermatología
          </h2>
          <p className="text-xs text-muted-foreground">
            Todo lo que publiques aquí actualiza automáticamente el carrusel del Inicio y la página /blog.
          </p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4" /> Nuevo Artículo
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-xl border bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Título del artículo</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej. Beneficios de la parafina tibia"
                className="mt-1 rounded-xl"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Categoría</Label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-sm"
              >
                <option value="cosmetologia">Cosmetología</option>
                <option value="dermatologia">Dermatología</option>
                <option value="spa">Spa & Bienestar</option>
                <option value="tendencias">Tendencias</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Resumen (se muestra en el carrusel del Inicio)</Label>
            <Input
              value={form.resumen}
              onChange={(e) => setForm({ ...form, resumen: e.target.value })}
              placeholder="Breve descripción atractiva..."
              className="mt-1 rounded-xl"
              required
            />
          </div>

          <div>
            <Label className="text-xs">Contenido completo del artículo</Label>
            <Textarea
              value={form.contenido}
              onChange={(e) => setForm({ ...form, contenido: e.target.value })}
              rows={4}
              placeholder="Desarrollo completo..."
              className="mt-1 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Label className="text-xs">Dato Pro (opcional)</Label>
              <Input
                value={form.dato_pro}
                onChange={(e) => setForm({ ...form, dato_pro: e.target.value })}
                placeholder="Tip corto destacado..."
                className="mt-1 rounded-xl"
              />
            </div>
            <Button type="submit" className="rounded-xl">Publicar</Button>
          </div>
        </form>
      )}

      <div className="divide-y">
        {posts.map((post) => (
          <div key={post.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{post.titulo}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted capitalize shrink-0">
                  {post.categoria}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{post.resumen}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant={post.publicado ? "outline" : "secondary"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => handleTogglePublish(post)}
              >
                {post.publicado ? "Publicado" : "Borrador"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
