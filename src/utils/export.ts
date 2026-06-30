import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";
import { Presentation, Slide, THEMES } from "../types";

// Map theme properties to pptxgen style structures
function getThemeHexes(themeId: string) {
  switch (themeId) {
    case 'professional':
      return { bg: "F8FAFC", text: "0F172A", accent: "475569", accentText: "0F172A" };
    case 'creative':
      return { bg: "FFF1F2", text: "1C1917", accent: "F43F5E", accentText: "F43F5E" };
    case 'elegant':
      return { bg: "022C22", text: "F5F5F4", accent: "F59E0B", accentText: "F59E0B" }; // Emerald luxury is dark
    case 'tech':
      return { bg: "09090B", text: "10B981", accent: "10B981", accentText: "10B981" }; // Dark tech green
    case 'modern':
    default:
      return { bg: "F8FAFC", text: "0F172A", accent: "4F46E5", accentText: "4F46E5" };
  }
}

export async function exportToPPTX(presentation: Presentation) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  const styles = getThemeHexes(presentation.theme);

  // Set presentation title metadata
  pptx.title = presentation.topic;

  presentation.slides.forEach((slide, index) => {
    const pptxSlide = pptx.addSlide();
    
    // Slide Background
    pptxSlide.background = { fill: styles.bg };

    // Draw Slide Number
    pptxSlide.addText(`Slide ${index + 1} of ${presentation.slides.length}`, {
      x: 11.5,
      y: 0.3,
      w: 1.5,
      fontSize: 10,
      color: styles.accent,
      align: "right"
    });

    // Presentation Brand Header
    pptxSlide.addText("AuraSlides AI", {
      x: 0.5,
      y: 0.3,
      w: 4.0,
      fontSize: 12,
      bold: true,
      color: styles.accent
    });

    // Slide Layout Configuration
    if (slide.layout === 'title' || index === 0) {
      // Title slide layout
      pptxSlide.addText(slide.title, {
        x: 1.0,
        y: 2.0,
        w: 11.3,
        fontSize: 36,
        bold: true,
        color: styles.text,
        align: "center"
      });

      if (slide.bullets && slide.bullets.length > 0) {
        pptxSlide.addText(slide.bullets.join("\n\n"), {
          x: 1.5,
          y: 3.8,
          w: 10.3,
          fontSize: 16,
          color: styles.accentText,
          align: "center"
        });
      }
    } else if (slide.layout === 'split' && slide.imageUrl) {
      // Split layout with Image Left, Content Right
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 1.0,
        w: 12.3,
        fontSize: 28,
        bold: true,
        color: styles.text
      });

      // Insert image (simulated with box / link or try catch base64 proxy)
      try {
        if (slide.imageUrl.startsWith("data:")) {
          pptxSlide.addImage({
            data: slide.imageUrl,
            x: 0.5,
            y: 1.8,
            w: 5.5,
            h: 4.5
          });
        } else {
          pptxSlide.addImage({
            path: slide.imageUrl,
            x: 0.5,
            y: 1.8,
            w: 5.5,
            h: 4.5
          });
        }
      } catch (e) {
        // Fallback placeholder if image load fails
        pptxSlide.addShape(pptx.ShapeType.rect, {
          fill: { color: "E2E8F0" },
          x: 0.5,
          y: 1.8,
          w: 5.5,
          h: 4.5
        });
        pptxSlide.addText("[ Presentation Visual Image ]", {
          x: 0.5,
          y: 3.5,
          w: 5.5,
          fontSize: 14,
          align: "center",
          color: "64748B"
        });
      }

      // Add Bullet points right
      const bulletsText = slide.bullets.map(b => "• " + b).join("\n\n");
      pptxSlide.addText(bulletsText, {
        x: 6.5,
        y: 1.8,
        w: 6.3,
        fontSize: 14,
        color: styles.text
      });
    } else if (slide.layout === 'quote') {
      // Clean quote slide centered
      pptxSlide.addText(`“${slide.title}”`, {
        x: 1.0,
        y: 2.2,
        w: 11.3,
        fontSize: 26,
        italic: true,
        bold: true,
        color: styles.accentText,
        align: "center"
      });

      if (slide.bullets && slide.bullets.length > 0) {
        pptxSlide.addText(slide.bullets.join(" — "), {
          x: 1.5,
          y: 4.5,
          w: 10.3,
          fontSize: 14,
          color: styles.text,
          align: "center"
        });
      }
    } else {
      // Bullets / default standard layout
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 1.0,
        w: 12.3,
        fontSize: 28,
        bold: true,
        color: styles.text
      });

      const bulletsText = slide.bullets.map(b => "• " + b).join("\n\n");
      pptxSlide.addText(bulletsText, {
        x: 0.5,
        y: 1.8,
        w: 12.3,
        fontSize: 16,
        color: styles.text
      });
    }

    // Set presenter speaker notes on the slide object
    if (slide.speakerNotes) {
      pptxSlide.addNotes(slide.speakerNotes);
    }
  });

  // Save/Download PPTX File
  pptx.writeFile({ fileName: `${presentation.topic.toLowerCase().replace(/\s+/g, "_")}_presentation.pptx` });
}

export async function exportToPDF(presentation: Presentation) {
  // Setup landscrape PDF (A4 size: 297mm x 210mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const styles = THEMES[presentation.theme];
  const isElegant = presentation.theme === 'elegant';
  const isTech = presentation.theme === 'tech';

  const hexStyles = getThemeHexes(presentation.theme);
  const rgbBg = isElegant ? [2, 44, 34] : isTech ? [9, 9, 11] : [248, 250, 252];
  const rgbText = isElegant || isTech ? [245, 245, 244] : [15, 23, 42];
  const rgbAccent = isElegant ? [245, 158, 11] : isTech ? [16, 185, 129] : [79, 70, 229];

  presentation.slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // Slide Background
    doc.setFillColor(rgbBg[0], rgbBg[1], rgbBg[2]);
    doc.rect(0, 0, 297, 210, "F");

    // Header branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
    doc.text("AuraSlides AI", 15, 15);

    // Slide tracker
    doc.text(`Slide ${index + 1} of ${presentation.slides.length}`, 282, 15, { align: "right" });

    // Dividers or subtle accent
    doc.setDrawColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
    doc.setLineWidth(0.3);
    doc.line(15, 18, 282, 18);

    if (slide.layout === 'title' || index === 0) {
      // Title slide Centered
      doc.setFontSize(28);
      doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
      const titleLines = doc.splitTextToSize(slide.title, 240);
      doc.text(titleLines, 148.5, 90, { align: "center" });

      if (slide.bullets && slide.bullets.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
        doc.text(slide.bullets.join("   •   "), 148.5, 130, { align: "center" });
      }
    } else if (slide.layout === 'split' && slide.imageUrl) {
      // Split Layout: Slide title and split visual
      doc.setFontSize(22);
      doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
      doc.text(slide.title, 15, 30);

      // Left Image Area Box
      doc.setFillColor(226, 232, 240);
      doc.rect(15, 38, 120, 145, "F");
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text("[ Visual Slide Image Included ]", 75, 110, { align: "center" });

      // Right Bullet content
      doc.setFontSize(13);
      doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
      let currentY = 45;
      slide.bullets.forEach((bullet) => {
        const bulletLines = doc.splitTextToSize("• " + bullet, 130);
        doc.text(bulletLines, 145, currentY);
        currentY += bulletLines.length * 7 + 5;
      });
    } else if (slide.layout === 'quote') {
      // Quote layout
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(20);
      doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
      const quoteLines = doc.splitTextToSize(`“${slide.title}”`, 220);
      doc.text(quoteLines, 148.5, 95, { align: "center" });

      if (slide.bullets && slide.bullets.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
        doc.text(slide.bullets.join("  |  "), 148.5, 140, { align: "center" });
      }
    } else {
      // Standard layout
      doc.setFontSize(22);
      doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
      doc.text(slide.title, 15, 30);

      doc.setFontSize(13);
      let currentY = 45;
      slide.bullets.forEach((bullet) => {
        const bulletLines = doc.splitTextToSize("• " + bullet, 250);
        doc.text(bulletLines, 15, currentY);
        currentY += bulletLines.length * 8 + 4;
      });
    }

    // Draw Footer Accent
    doc.setDrawColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
    doc.line(15, 195, 282, 195);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by AuraSlides Presentation Suite", 15, 202);
  });

  // Save PDF
  doc.save(`${presentation.topic.toLowerCase().replace(/\s+/g, "_")}_slides.pdf`);
}
