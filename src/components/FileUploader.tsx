import React, { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
    label: string;
    accept: string;
    multiple?: boolean;
    maxFiles?: number;
    onFiles?: (files: File[]) => void;
    onFile?: (file: File | null) => void;
}

export function FileUploader({ label, accept, multiple = false, maxFiles = 4, onFiles, onFile }: FileUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            previews.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [previews]);

    const updateFiles = (nextFiles: File[]) => {
        const limited = nextFiles.slice(0, maxFiles);
        setFiles(limited);

        previews.forEach((u) => URL.revokeObjectURL(u));

        const newPreviews = limited.map(f => URL.createObjectURL(f));
        setPreviews(newPreviews);

        if (multiple && onFiles) {
            onFiles(limited);
        } else if (!multiple && onFile) {
            onFile(limited[0] || null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length) {
            if (multiple) {
                updateFiles([...files, ...dropped]);
            } else {
                updateFiles([dropped[0]]);
            }
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length) {
            if (multiple) {
                updateFiles([...files, ...selected]);
            } else {
                updateFiles([selected[0]]);
            }
        }
    };

    const removeAt = (idx: number) => {
        const next = files.filter((_, i) => i !== idx);
        updateFiles(next);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition ${dragOver ? 'border-brand-400 bg-brand-50/40' : 'border-neutral-200'
                }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-brand-600" />
                <p className="text-sm text-neutral-600">
                    {label} {multiple && `(up to ${maxFiles})`}
                </p>
                <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    id={label}
                    multiple={multiple}
                    onChange={handleSelect}
                />
                <label
                    htmlFor={label}
                    className="text-sm px-3 py-1.5 rounded-md bg-brand-600 text-white cursor-pointer hover:bg-brand-700"
                >
                    Choose file{multiple ? 's' : ''}
                </label>

                {previews.length > 0 && (
                    <div className={`mt-3 ${multiple ? 'grid grid-cols-4 gap-2' : ''}`}>
                        {previews.map((u, i) => (
                            <div key={i} className="relative">
                                <img
                                    src={u}
                                    alt={`Preview ${i}`}
                                    className={`${multiple ? 'h-28 w-28' : 'max-h-56'} object-cover rounded border border-neutral-200`}
                                />
                                <button
                                    type="button"
                                    className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black"
                                    onClick={() => removeAt(i)}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
