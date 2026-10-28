import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../api/products.api";
import type { CreateProductInput } from "../../types/types.bd";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 5 * 1024 * 1024;

export function CreateProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(`/products/${product.id}`, { replace: true });
    },
  });

  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  function selectImage(file?: File) {
    setImageError("");
    if (!file) {
      setImage(null);
      return;
    }
    if (!acceptedImageTypes.includes(file.type)) {
      setImageError("Elige una imagen JPEG, PNG o WebP.");
      return;
    }
    if (file.size > maxImageBytes) {
      setImageError("La imagen debe pesar 5 MB o menos.");
      return;
    }
    setImage(file);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) {
      setImageError("Agrega una imagen para publicar tu artículo.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const input: CreateProductInput = {
      title: String(data.get("title")).trim(),
      description: String(data.get("description")).trim(),
      initialPrice: Number(data.get("initialPrice")),
      image,
    };
    mutation.mutate(input);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-900" to="/"><ArrowLeft size={15} /> Volver al catálogo</Link>
      <div className="mt-7 max-w-2xl">
        <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800">Comparte algo especial</span>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Publica tu <span className="font-serif font-normal italic text-emerald-800">artículo.</span></h1>
        <p className="mt-2 text-sm text-slate-500">Cuéntale a la comunidad qué hace único a tu artículo.</p>
      </div>

      <form className="mt-8 grid gap-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[1fr_.8fr]" onSubmit={submit}>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700" htmlFor="product-title">Nombre del artículo</label>
            <input className="w-full rounded-lg border border-stone-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" id="product-title" name="title" placeholder="Ej. Cámara analógica Minolta" required minLength={1} maxLength={120} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700" htmlFor="product-description">Descripción</label>
            <textarea className="w-full resize-y rounded-lg border border-stone-200 px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" id="product-description" name="description" placeholder="Describe su historia, estado y detalles que debería conocer quien lo encuentre..." required minLength={1} maxLength={5000} rows={6} />
            <span className="mt-1 block text-[10px] text-slate-400">Hasta 5.000 caracteres.</span>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700" htmlFor="product-price">Precio inicial (S/)</label>
            <input className="w-full rounded-lg border border-stone-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" id="product-price" name="initialPrice" type="number" placeholder="0.00" required min="0.01" step="0.01" />
          </div>
          {mutation.isError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-800" role="alert">{mutation.error.message}</p>}
          <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-5">
            <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-5 py-3 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <><LoaderCircle className="animate-spin" size={16} /> Publicando...</> : <><UploadCloud size={16} /> Publicar artículo</>}
            </button>
            <span className="text-[10px] text-slate-400">La imagen se subirá a MinIO.</span>
          </div>
        </div>

        <aside>
          <label className="mb-2 block text-xs font-semibold text-slate-700" htmlFor="product-image">Fotografía del artículo</label>
          <label className={`relative flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed ${imageError ? "border-rose-300 bg-rose-50/40" : "border-stone-300 bg-stone-50 hover:border-emerald-700 hover:bg-emerald-50/40"}`} htmlFor="product-image">
            {previewUrl ? (
              <>
                <img className="absolute inset-0 h-full w-full object-contain" src={previewUrl} alt="Vista previa del artículo" />
                <span className="absolute bottom-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-emerald-900 shadow">Cambiar imagen <ImagePlus size={14} /></span>
              </>
            ) : (
              <span className="flex flex-col items-center px-5 text-center">
                <span className="mb-3 grid size-12 place-items-center rounded-xl bg-emerald-100 text-emerald-900"><ImagePlus size={22} /></span>
                <strong className="text-sm text-slate-800">Agrega una fotografía</strong>
                <span className="mt-1 text-xs text-slate-500">Haz clic para buscar en tu dispositivo</span>
                <small className="mt-3 text-[10px] text-slate-400">JPG, PNG o WebP · Máximo 5 MB</small>
              </span>
            )}
          </label>
          <input className="sr-only" id="product-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(event.currentTarget.files?.[0])} />
          {image && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs text-slate-600">
              <span className="truncate">{image.name} <small className="ml-1 text-slate-400">{(image.size / 1024 / 1024).toFixed(2)} MB</small></span>
              <button className="ml-2 grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-stone-100 hover:text-rose-700" type="button" onClick={() => selectImage()} aria-label="Quitar imagen"><X size={15} /></button>
            </div>
          )}
          {imageError && <p className="mt-2 text-xs text-rose-700" role="alert">{imageError}</p>}
          <p className="mt-4 rounded-lg bg-stone-50 p-3 text-[11px] leading-5 text-slate-500"><span className="mr-1 text-emerald-700">✦</span> Una buena foto ayuda a que cada detalle cuente. Usa luz natural y muestra el artículo con claridad.</p>
        </aside>
      </form>
    </section>
  );
}
