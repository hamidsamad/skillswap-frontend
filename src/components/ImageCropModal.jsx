import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Move,
  Crop,
  Sparkles,
  Camera
} from 'lucide-react';

const CROP_SIZE = 280; // Size of the square crop viewport in pixels
const OUTPUT_SIZE = 400; // Final exported square image size (high-DPI crisp quality)

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onApply,
  title = 'Adjust Profile Picture',
  aspectRatio = 1
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewDataUrl, setPreviewDataUrl] = useState('');

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Compute effective width & height based on rotation
  const isRotated90or270 = rotation % 180 !== 0;
  const effectiveW = isRotated90or270 ? naturalSize.height : naturalSize.width;
  const effectiveH = isRotated90or270 ? naturalSize.width : naturalSize.height;

  // Base scale to cover the crop viewport
  const baseScale = effectiveW > 0 && effectiveH > 0
    ? Math.max(CROP_SIZE / effectiveW, CROP_SIZE / effectiveH)
    : 1;

  // Clamping pan to ensure the image always covers the crop area
  const getClampedPan = useCallback(
    (x, y, currentZoom, currentRotation) => {
      if (!naturalSize.width || !naturalSize.height) return { x: 0, y: 0 };
      const rotated = currentRotation % 180 !== 0;
      const curEffW = rotated ? naturalSize.height : naturalSize.width;
      const curEffH = rotated ? naturalSize.width : naturalSize.height;
      const bScale = Math.max(CROP_SIZE / curEffW, CROP_SIZE / curEffH);
      const renderedW = curEffW * bScale * currentZoom;
      const renderedH = curEffH * bScale * currentZoom;

      const maxPanX = Math.max(0, (renderedW - CROP_SIZE) / 2);
      const maxPanY = Math.max(0, (renderedH - CROP_SIZE) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y))
      };
    },
    [naturalSize]
  );

  // Reset state whenever a new image source is passed
  useEffect(() => {
    if (isOpen && imageSrc) {
      setImageLoaded(false);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setPreviewDataUrl('');

      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Generate live preview data URL when pan/zoom/rotation change
  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return;

    const timer = setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const ratio = 160 / CROP_SIZE;
        ctx.translate(80, 80);
        ctx.translate(pan.x * ratio, pan.y * ratio);
        ctx.scale(zoom, zoom);
        ctx.rotate((rotation * Math.PI) / 180);

        const img = imageRef.current;
        const baseW = naturalSize.width * baseScale * ratio;
        const baseH = naturalSize.height * baseScale * ratio;
        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);

        setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.8));
      } catch (err) {
        console.error('Failed to generate crop preview:', err);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [imageLoaded, zoom, rotation, pan, baseScale, naturalSize]);

  // Handle Mouse Dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan(getClampedPan(newX, newY, zoom, rotation));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Touch Dragging (Mobile / Tablet)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPan(getClampedPan(newX, newY, zoom, rotation));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel Zoom support
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    const nextZoom = Math.min(3, Math.max(1, zoom + delta));
    setZoom(nextZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, nextZoom, rotation));
  };

  // Quick Zoom +/- Handlers
  const handleZoomIn = () => {
    const nextZoom = Math.min(3, +(zoom + 0.15).toFixed(2));
    setZoom(nextZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, nextZoom, rotation));
  };

  const handleZoomOut = () => {
    const nextZoom = Math.max(1, +(zoom - 0.15).toFixed(2));
    setZoom(nextZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, nextZoom, rotation));
  };

  const handleZoomSlider = (e) => {
    const nextZoom = parseFloat(e.target.value);
    setZoom(nextZoom);
    setPan((prev) => getClampedPan(prev.x, prev.y, nextZoom, rotation));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    setPan((prev) => getClampedPan(prev.x, prev.y, zoom, nextRotation));
  };

  // Reset to default
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Export final cropped image on Apply
  const handleApply = () => {
    if (!imageRef.current || !naturalSize.width) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const ratio = OUTPUT_SIZE / CROP_SIZE;
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
      ctx.translate(pan.x * ratio, pan.y * ratio);
      ctx.scale(zoom, zoom);
      ctx.rotate((rotation * Math.PI) / 180);

      const img = imageRef.current;
      const baseW = naturalSize.width * baseScale * ratio;
      const baseH = naturalSize.height * baseScale * ratio;
      ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);

      const croppedResult = canvas.toDataURL('image/jpeg', 0.92);
      onApply(croppedResult);
      onClose();
    } catch (err) {
      console.error('Error applying cropped avatar:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0E1526] rounded-3xl border border-[#E5EAE7] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center border border-[#07866D]/20 shadow-2xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white leading-tight font-display">
                {title}
              </h3>
              <p className="text-xs text-[#708096] dark:text-slate-400">
                Drag to reposition • Scroll or use slider to zoom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#708096] hover:text-[#102B50] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Interactive Crop Viewport (col-span-7) */}
            <div className="md:col-span-7 flex flex-col items-center w-full">
              <div className="w-full flex items-center justify-center overflow-hidden">
                <div className="scale-[0.8] xs:scale-[0.92] sm:scale-100 origin-center -my-5 xs:-my-2 sm:my-0">
                  <div
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onWheel={handleWheel}
                    style={{ width: CROP_SIZE, height: CROP_SIZE }}
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 shadow-inner select-none touch-none border-2 border-[#07866D]/30 ${
                      isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                {/* Source Image with CSS Transform */}
                {imageSrc && (
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Source for cropping"
                    draggable={false}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: `${naturalSize.width * baseScale}px`,
                      height: `${naturalSize.height * baseScale}px`,
                      transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* SVG Overlay: Semi-transparent dark frame with circular cutout guide */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${CROP_SIZE} ${CROP_SIZE}`}
                >
                  <defs>
                    <mask id="avatar-crop-mask">
                      {/* White fills everything (opaque) */}
                      <rect width={CROP_SIZE} height={CROP_SIZE} fill="white" />
                      {/* Black circle cuts a transparent hole */}
                      <circle
                        cx={CROP_SIZE / 2}
                        cy={CROP_SIZE / 2}
                        r={CROP_SIZE / 2 - 8}
                        fill="black"
                      />
                    </mask>
                  </defs>

                  {/* Dark mask outside circle */}
                  <rect
                    width={CROP_SIZE}
                    height={CROP_SIZE}
                    fill="rgba(8, 11, 20, 0.65)"
                    mask="url(#avatar-crop-mask)"
                  />

                  {/* Circular border highlight */}
                  <circle
                    cx={CROP_SIZE / 2}
                    cy={CROP_SIZE / 2}
                    r={CROP_SIZE / 2 - 8}
                    fill="none"
                    stroke="#07866D"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />

                  {/* Inner subtle rule-of-thirds grid lines */}
                  <line
                    x1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.5}
                    y1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.86}
                    x2={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.5}
                    y2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.86}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                  <line
                    x1={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.5}
                    y1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.86}
                    x2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.5}
                    y2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.86}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                  <line
                    x1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.86}
                    y1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.5}
                    x2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.86}
                    y2={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.5}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                  <line
                    x1={CROP_SIZE / 2 - (CROP_SIZE / 2 - 8) * 0.86}
                    y1={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.5}
                    x2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.86}
                    y2={CROP_SIZE / 2 + (CROP_SIZE / 2 - 8) * 0.5}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                  />
                </svg>

                {/* Move Indicator Badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                  <Move className="w-3 h-3" />
                  <span>Drag to reposition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom & Quick Controls */}
          <div className="w-full max-w-[280px] mt-2 xs:mt-4 space-y-3">
                {/* Zoom Slider Row */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="p-1.5 rounded-lg text-[#708096] hover:text-[#07866D] dark:text-slate-400 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={handleZoomSlider}
                    className="flex-1 accent-[#07866D] cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700"
                    aria-label="Zoom level"
                  />

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-1.5 rounded-lg text-[#708096] hover:text-[#07866D] dark:text-slate-400 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 min-w-[38px] text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Rotate & Reset Buttons Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="flex-1 py-1.5 px-2.5 rounded-xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#131B2E] text-xs font-bold text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-1.5 px-3 rounded-xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#131B2E] text-xs font-bold text-[#708096] dark:text-slate-400 hover:text-[#DC5555] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset to default orientation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview & Tips (col-span-5) */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#FAF9F5] dark:bg-[#131B2E] p-4 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102B50] dark:text-white">
                  <Sparkles className="w-4 h-4 text-[#07866D] dark:text-emerald-400" />
                  <span>Live Preview</span>
                </div>

                {/* 2 Preview Sizes: Profile Avatar (Large) and Chat Avatar (Small) */}
                <div className="flex items-center gap-4">
                  {/* Large Profile Preview (76px) */}
                  <div className="text-center">
                    <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-[#07866D] ring-2 ring-[#07866D]/20 shadow-md mx-auto relative">
                      {previewDataUrl ? (
                        <img
                          src={previewDataUrl}
                          alt="Live avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Preview
                        </div>
                      )}
                    </div>
                    <span className="block text-[10px] font-bold text-[#708096] dark:text-slate-400 mt-1.5">
                      Profile Card
                    </span>
                  </div>

                  {/* Small Navbar / Chat Preview (40px) */}
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-[#07866D] shadow-sm mx-auto relative">
                      {previewDataUrl ? (
                        <img
                          src={previewDataUrl}
                          alt="Live small preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[9px]">
                          Chat
                        </div>
                      )}
                    </div>
                    <span className="block text-[10px] font-bold text-[#708096] dark:text-slate-400 mt-1.5">
                      Navbar / Chat
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#708096] dark:text-slate-400 leading-relaxed border-t border-[#E5EAE7] dark:border-slate-700/80 pt-2.5 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07866D]" />
                    <span>Center your face within the circle</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#07866D]" />
                    <span>Saved in crisp, optimized 400×400 resolution</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 xs:px-5 py-3 sm:px-6 border-t border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5]/70 dark:bg-[#0A0F1D]/60 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:w-auto px-4 py-2.5 min-h-[42px] text-xs font-bold text-[#708096] hover:text-[#102B50] dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="w-full xs:w-auto btn-emerald !py-2.5 !px-5 !text-xs min-h-[42px] !shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply &amp; Save Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
}
