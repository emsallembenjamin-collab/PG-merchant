"use client";

import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "goldpayMerchantAvatar";
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_STORE_DIM = 512;

async function fileToResizedDataUrl(
  file: File,
  maxDim: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    img.src = objectUrl;
  });
}

export function UploadPhotoForm() {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingBlobRef = useRef<string | null>(null);
  const [savedDataUrl, setSavedDataUrl] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const revokePendingBlob = useCallback(() => {
    if (pendingBlobRef.current) {
      URL.revokeObjectURL(pendingBlobRef.current);
      pendingBlobRef.current = null;
    }
  }, []);

  const clearPending = useCallback(() => {
    revokePendingBlob();
    setPendingUrl(null);
    setPendingFile(null);
  }, [revokePendingBlob]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw?.startsWith("data:image")) {
        setSavedDataUrl(raw);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => () => revokePendingBlob(), [revokePendingBlob]);

  const applyFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file (PNG, JPG, or GIF).");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("Image must be 2MB or smaller.");
        return;
      }
      revokePendingBlob();
      const url = URL.createObjectURL(file);
      pendingBlobRef.current = url;
      setPendingUrl(url);
      setPendingFile(file);
    },
    [revokePendingBlob],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    applyFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pendingFile) {
      setError("Choose a photo first, or use Cancel.");
      return;
    }
    try {
      const dataUrl = await fileToResizedDataUrl(pendingFile, MAX_STORE_DIM);
      localStorage.setItem(STORAGE_KEY, dataUrl);
      setSavedDataUrl(dataUrl);
      clearPending();
    } catch {
      setError("Could not save the image. Try another file.");
    }
  };

  const handleCancel = () => {
    setError(null);
    clearPending();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = () => {
    setError(null);
    clearPending();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSavedDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openPicker = () => fileInputRef.current?.click();

  const displaySrc = pendingUrl ?? savedDataUrl;

  return (
    <ShowcaseSection title="Your Photo" className="!p-7">
      <form onSubmit={handleSave}>
        <div className="mb-4 flex items-center gap-3">
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs / blob URLs from user upload
            <img
              src={displaySrc}
              width={55}
              height={55}
              alt=""
              className="size-14 rounded-full object-cover ring-2 ring-line"
            />
          ) : (
            <Image
              src="/images/user/user-03.png"
              width={55}
              height={55}
              alt="User"
              className="size-14 rounded-full object-cover"
              quality={90}
            />
          )}

          <div>
            <span className="mb-1.5 font-medium text-ink dark:text-white">
              Edit your photo
            </span>
            <span className="flex gap-3">
              <button
                type="button"
                className="text-body-sm text-ink-muted hover:text-red"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="text-body-sm text-ink-muted hover:text-primary"
                onClick={openPicker}
              >
                Update
              </button>
            </span>
          </div>
        </div>

        <div
          className="relative mb-5.5 block w-full rounded-[24px] border border-dashed border-line-strong bg-surface-soft hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="profilePhoto"
            id={inputId}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={handleInputChange}
          />

          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-line bg-white shadow-card dark:border-dark-3 dark:bg-gray-dark">
              <UploadIcon />
            </div>

            <p className="mt-2.5 text-body-sm font-medium text-ink-secondary">
              <span className="text-primary">Click to upload</span> or drag and
              drop
            </p>

            <p className="mt-1 text-body-xs text-ink-muted">
              PNG, JPG, GIF or WebP (max 2MB; stored up to {MAX_STORE_DIM}px)
            </p>
          </label>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {hydrated && pendingFile && (
          <p className="mb-3 text-sm text-ink-muted">
            Unsaved preview — click Save to keep it on this browser.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            className="merchant-secondary-button"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button className="merchant-primary-button" type="submit">
            Save
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
