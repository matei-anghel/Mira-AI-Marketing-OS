export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

export function extractDominantColors(img: HTMLImageElement, topK: number = 3): string[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return ["#000000", "#ffffff"];

    const w = 64;
    const h = 64;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;
    const quant = 43;
    const buckets: Record<string, { count: number; r: number; g: number; b: number }> = {};

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${Math.floor(r / quant)},${Math.floor(g / quant)},${Math.floor(b / quant)}`;

        if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
        buckets[key].count++;
        buckets[key].r += r;
        buckets[key].g += g;
        buckets[key].b += b;
    }

    const sorted = Object.values(buckets).sort((a, b) => b.count - a.count).slice(0, topK);
    return sorted.map(b => {
        const r = Math.round(b.r / b.count);
        const g = Math.round(b.g / b.count);
        const b_val = Math.round(b.b / b.count);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b_val).toString(16).slice(1)}`;
    });
}

export async function overlayAdCopy(
    baseImageBase64: string,
    headline: string,
    subheadline: string,
    cta: string,
    position: string,
    palette: string[]
): Promise<string> {
    const img = await loadImage(baseImageBase64);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas init failed");

    ctx.drawImage(img, 0, 0);

    const W = canvas.width;
    const H = canvas.height;
    const padding = Math.max(16, W * 0.05);

    const hSize = Math.max(24, W * 0.06);
    const sSize = Math.max(16, W * 0.035);
    const cSize = Math.max(18, W * 0.04);

    let x = padding;
    let y = padding;

    if (position.includes("Bottom")) y = H - (H * 0.35);
    if (position.includes("Center")) { x = W / 2; y = H / 2; }
    if (position.includes("Right")) x = W - (W * 0.4);

    const fsFill = "white";

    function drawText(text: string, size: number, bold: boolean, offY: number) {
        ctx!.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
        ctx!.fillStyle = fsFill;
        ctx!.strokeStyle = "rgba(0,0,0,0.5)";
        ctx!.lineWidth = size * 0.1;

        const lines = text.split('\n');
        const maxW = W * 0.7;
        const words = text.split(' ');
        let line = '';
        let dy = offY;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx!.measureText(testLine);
            if (metrics.width > maxW && n > 0) {
                ctx!.strokeText(line, x, dy);
                ctx!.fillText(line, x, dy);
                line = words[n] + ' ';
                dy += size * 1.2;
            } else {
                line = testLine;
            }
        }
        ctx!.strokeText(line, x, dy);
        ctx!.fillText(line, x, dy);
        return dy + size * 1.2;
    }

    let curY = y;
    curY = drawText(headline, hSize, true, curY);
    curY += padding * 0.5;
    curY = drawText(subheadline, sSize, false, curY);
    curY += padding * 0.8;

    ctx.font = `bold ${cSize}px sans-serif`;
    const ctaW = ctx.measureText(cta).width + padding;
    const ctaH = cSize * 1.5;

    ctx.fillStyle = palette[0] || "#000000";
    ctx.roundRect ? ctx.roundRect(x, curY, ctaW, ctaH, 8) : ctx.fillRect(x, curY, ctaW, ctaH);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "none";
    ctx.fillText(cta, x + padding / 2, curY + cSize);

    return canvas.toDataURL("image/png");
}
