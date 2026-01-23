"use client";

import { useState, useEffect } from "react";
import { CarouselImage } from "@/lib/utils";
import { Trash2, Eye, EyeOff, GripVertical, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableItem({ image, onDelete, onToggle }: { image: CarouselImage; onDelete: (id: string) => void; onToggle: (img: CarouselImage) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm ${!image.active ? 'opacity-60 bg-gray-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600 text-gray-400">
        <GripVertical size={20} />
      </div>
      
      <div className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.image_url}
          alt={image.title || "Carousel"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-800">{image.title || "Sem título"}</p>
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{image.image_url}</p>
        {image.metadata && (
             <p className="text-xs text-blue-500 mt-1">
                {image.metadata.width}x{image.metadata.height} • {image.metadata.format}
             </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(image)}
          className={`p-2 rounded-full hover:bg-gray-100 ${image.active ? 'text-green-600' : 'text-gray-400'}`}
          title={image.active ? "Ocultar" : "Mostrar"}
        >
          {image.active ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
        <button
          onClick={() => onDelete(image.id)}
          className="p-2 rounded-full hover:bg-red-50 text-red-500"
          title="Remover"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [validationError, setValidationError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/carousel");
      if (res.ok) {
        const data = await res.json();
        // Ensure sorted by display_order
        const sorted = data.sort((a: CarouselImage, b: CarouselImage) => a.display_order - b.display_order);
        setImages(sorted);
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

  const validateImage = (url: string): Promise<{ width: number; height: number; format: string }> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
              // Basic validation: ensure it's not tiny
              if (img.width < 100 || img.height < 100) {
                  reject("Imagem muito pequena. Use alta resolução.");
                  return;
              }
              resolve({
                  width: img.width,
                  height: img.height,
                  format: url.split('.').pop()?.toUpperCase() || 'UNKNOWN'
              });
          };
          img.onerror = () => reject("Não foi possível carregar a imagem. Verifique a URL.");
          img.src = url;
      });
  };

  const handleAdd = async () => {
    if (!newImageUrl) return;
    setValidationError("");
    setAdding(true);
    
    try {
      // Validate image before adding
      const metadata = await validateImage(newImageUrl);
      
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            imageUrl: newImageUrl, 
            title: newImageTitle,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                device_origin: "web_import"
            }
        }),
      });
      if (res.ok) {
        setNewImageUrl("");
        setNewImageTitle("");
        fetchImages();
      }
    } catch (error: any) {
      console.error("Failed to add image", error);
      setValidationError(typeof error === 'string' ? error : "Erro ao validar/adicionar imagem.");
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        // We update all items with their new index as display_order
        const updates = newItems.map((item, index) => ({
            id: item.id,
            display_order: index
        }));

        // Send updates in background
        Promise.all(updates.map(u => 
            fetch(`/api/carousel/${u.id}`, {
                method: "PATCH",
                body: JSON.stringify({ display_order: u.display_order })
            })
        )).catch(err => console.error("Failed to update order", err));

        return newItems;
      });
    }
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800">Gerenciar Carrossel</h3>
            <span className="text-xs text-gray-500">Arraste para reordenar</span>
        </div>

        {/* Add New Image Form */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2 border rounded text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Título (Opcional)</label>
                    <input
                        type="text"
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        placeholder="Promoção de Verão"
                        className="w-full p-2 border rounded text-sm"
                    />
                </div>
            </div>
            
            {validationError && (
                <div className="mb-4 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {validationError}
                </div>
            )}

            <button
                onClick={handleAdd}
                disabled={adding || !newImageUrl}
                className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {adding ? "Validando..." : "Adicionar ao Carrossel"}
                <ImageIcon size={16} />
            </button>
            <p className="mt-2 text-xs text-gray-500">
                Suporta JPEG, PNG, WebP, AVIF, SVG. A imagem será validada antes de adicionar.
            </p>
        </div>

        {/* List */}
        {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando imagens...</div>
        ) : (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={images.map(img => img.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {images.map((image) => (
                            <SortableItem
                                key={image.id}
                                image={image}
                                onDelete={handleDelete}
                                onToggle={handleToggleActive}
                            />
                        ))}
                        {images.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed">
                                Nenhuma imagem no carrossel.
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        )}
    </div>
  );
}
