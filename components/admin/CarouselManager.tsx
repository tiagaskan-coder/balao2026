"use client";

import { useState, useEffect } from "react";
import { CarouselImage } from "@/lib/utils";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function CarouselManager() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/carousel");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch images", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = async () => {
    if (!newImageUrl) return;
    setAdding(true);
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newImageUrl, title: newImageTitle }),
      });
      if (res.ok) {
        setNewImageUrl("");
        setNewImageTitle("");
        fetchImages();
      }
    } catch (error) {
      console.error("Failed to add image", error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta imagem?")) return;
    try {
      await fetch(`/api/carousel/${id}`, { method: "DELETE" });
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleToggleActive = async (image: CarouselImage) => {
    try {
      await fetch(`/api/carousel/${image.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !image.active }),
      });
      setImages(images.map(img => img.id === image.id ? { ...img, active: !img.active } : img));
    } catch (error) {
      console.error("Failed to toggle", error);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap in local state for instant feedback
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Update display_order based on new index
    // We essentially just swap the display_order values of the two items
    const itemA = newImages[index];
    const itemB = newImages[targetIndex];
    
    // Optimistic update
    setImages(newImages);

    try {
        // We need to update both items in DB
        await Promise.all([
            fetch(`/api/carousel/${itemA.id}`, {
                method: "PATCH",
                body: JSON.stringify({ display_order: itemA.display_order }),
            }),
            fetch(`/api/carousel/${itemB.id}`, {
                method: "PATCH",
                body: JSON.stringify({ display_order: itemB.display_order }),
            })
        ]);
        // Ideally we should refetch to be sure, but let's trust the optimistic update for now
        // Or actually, swapping display_order values:
        // But wait, the display_order might not be sequential 0,1,2... 
        // A safer way is to just fetch everything again after swapping orders.
        // Let's just re-fetch to be safe and ensure consistent state.
        fetchImages();
    } catch (error) {
        console.error("Failed to move", error);
        fetchImages(); // Revert on error
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ImageIcon size={24} />
        Gerenciador de Carrossel
      </h2>

      {/* Add New */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Nova Imagem</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="URL da Imagem (https://...)"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Título (Opcional)"
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
            value={newImageTitle}
            onChange={(e) => setNewImageTitle(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newImageUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 justify-center"
          >
            {adding ? "Adicionando..." : <><Plus size={18} /> Adicionar</>}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando imagens...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Nenhuma imagem no carrossel.
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((img, index) => (
            <div key={img.id} className={`flex items-center gap-4 p-3 border rounded-md bg-white ${!img.active ? 'opacity-60 bg-gray-50' : ''}`}>
              <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <Image src={img.image_url} alt={img.title || "img"} fill className="object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{img.title || "Sem título"}</p>
                <p className="text-xs text-gray-500 truncate" title={img.image_url}>{img.image_url}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 mr-2">
                    <button 
                        onClick={() => handleMove(index, 'up')} 
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                        title="Mover para cima"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button 
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                        title="Mover para baixo"
                    >
                        <ArrowDown size={16} />
                    </button>
                </div>

                <button
                  onClick={() => handleToggleActive(img)}
                  className={`p-2 rounded-md ${img.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={img.active ? "Ocultar" : "Mostrar"}
                >
                  {img.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>

                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Remover"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
