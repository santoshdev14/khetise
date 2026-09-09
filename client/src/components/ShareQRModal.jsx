import React, { useState } from "react";
import { X, QrCode, Copy, Check, Smartphone, ExternalLink, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";

export default function ShareQRModal() {
  const { isQRModalOpen, setIsQRModalOpen, showToast } = useCart();
  const { storeName, tagline, whatsappNumber } = useSettings();
  const [copied, setCopied] = useState(false);

  if (!isQRModalOpen) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://khetise.farm";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        if (showToast) showToast("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = `Order 100% farm-fresh vegetables directly to your home with ${storeName || "KhetiSe"}! Visit: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsQRModalOpen(false)}>
      <div
        className="qr-scanner-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="qr-modal-header">
          <div className="qr-header-title-box">
            <div className="qr-icon-circle">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="qr-modal-title">Scan to Open {storeName || "KhetiSe"}</h2>
              <p className="qr-modal-subtitle">Instant mobile access directly on any phone</p>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsQRModalOpen(false)}
            aria-label="Close QR modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body with QR Code */}
        <div className="qr-modal-body">
          <div className="qr-code-frame">
            <QRCodeSVG
              value={currentUrl}
              size={210}
              level="H"
              includeMargin={true}
              fgColor="#0a2a16"
              bgColor="#ffffff"
            />
            <div className="qr-center-pill">
              <span className="dot-green" />
              <span>LIVE STORE</span>
            </div>
          </div>

          <div className="qr-instruction-box">
            <Smartphone size={18} className="qr-phone-icon" />
            <p className="qr-instruction-text">
              Point your smartphone camera at this code to open the <strong>{storeName || "KhetiSe"}</strong> catalog immediately. No app download needed!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="qr-action-buttons">
            <button
              type="button"
              className="qr-btn-action btn-copy-link"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              type="button"
              className="qr-btn-action btn-share-wa"
              onClick={handleShareWhatsApp}
            >
              <Share2 size={16} />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
