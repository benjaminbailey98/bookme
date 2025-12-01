
'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import getCroppedImg from '@/lib/crop-image';

interface ImageCropDialogProps {
  onImageCropped: (image: string | null) => void;
  onOpenChange: (open: boolean) => void;
}

export function ImageCropDialog({ onImageCropped, onOpenChange }: ImageCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
    }
  };

  function readFile(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  }

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(
          imageSrc,
          croppedAreaPixels
        );
        onImageCropped(croppedImage);
      }
    } catch (e) {
      console.error(e);
      onImageCropped(null);
    }
  }, [imageSrc, croppedAreaPixels, onImageCropped]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Crop your new profile picture</DialogTitle>
        <DialogDescription>
          Upload an image and crop it to fit perfectly as your headshot.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {!imageSrc ? (
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Picture</Label>
                <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" />
            </div>
        ) : (
          <div className="relative h-96 w-full bg-muted">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>
        )}
        {imageSrc && (
          <div className="space-y-2">
            <Label>Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={showCroppedImage} disabled={!imageSrc}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
