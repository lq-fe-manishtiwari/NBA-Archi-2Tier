import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TeacherIdCard({ onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);

    const input = cardRef.current;

    // ✅ Capture content but skip .pdf-buttons
    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      scrollY: 0,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      ignoreElements: (el) => el.classList.contains("pdf-buttons"), // 👈 Key line
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let remainingHeight = imgHeight;
    let position = 0;

    while (remainingHeight > 0) {
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      remainingHeight -= pdfHeight;
      if (remainingHeight > 0) pdf.addPage();
      position -= pdfHeight;
    }

    pdf.save("Teacher_ID_Card.pdf");
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-2xl w-[400px] md:w-[420px] max-h-[90vh] overflow-y-auto relative flex flex-col scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      >
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition text-xl"
        >
          ✕
        </button>

        {/* ---------- FRONT SIDE ---------- */}
        <div className="p-4 bg-gradient-to-b from-red-100 to-white text-center border-b border-gray-300">
          <img
            src="https://via.placeholder.com/90"
            alt="College Logo"
            className="mx-auto mb-2 w-20"
          />
          <h6 className="text-[11px] font-semibold text-gray-800">
            Vishweshwar Education Society's
          </h6>
          <h2 className="text-xl font-bold text-red-700 leading-tight">
            WESTERN COLLEGE OF COMMERCE <br /> & BUSINESS MANAGEMENT
          </h2>
          <p className="text-[10px] font-semibold text-gray-700 mt-1">
            (Affiliated to University of Mumbai & Govt. of Maharashtra)
          </p>

          <div className="bg-red-700 text-white text-lg font-semibold py-1 mt-3 rounded-md">
            STAFF ID CARD
          </div>

          <div className="flex flex-col items-center mt-4">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="w-36 h-40 border-2 border-black object-cover"
            />
            <h4 className="text-xl font-bold text-red-700 mt-2">Aarav Kumar</h4>
            <p className="text-gray-800 font-semibold text-sm">
              Assistant Professor
            </p>
            <p className="text-gray-700 text-sm font-semibold mt-1">
              Emp. Code : <span className="font-bold text-black">EMP001</span>
            </p>
          </div>

          <div className="flex items-end justify-between mt-4 px-6">
            <div className="flex flex-col items-center">
              <div className="w-40 h-10 overflow-hidden">
                <img
                  src="https://barcode.tec-it.com/barcode.ashx?data=EMP001&code=Code128&dpi=96&hidehrt=True"
                  alt="Barcode"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-black font-bold mt-1">
                Emp. Code: EMP001
              </p>
            </div>
            <div className="flex flex-col items-end">
              <img
                src="https://via.placeholder.com/100x40"
                alt="Signature"
                className="h-12"
              />
              <p className="text-xs font-bold text-black mt-1">
                Principal Signature
              </p>
            </div>
          </div>
        </div>

        {/* ---------- BACK SIDE ---------- */}
        <div className="p-5 bg-gradient-to-t from-red-100 to-white text-black">
          <div className="space-y-2 text-[15px] font-semibold">
            <p>
              <strong>Blood Group:</strong> B+
            </p>
            <p>
              <strong>Date of Birth:</strong> 10-03-1998
            </p>
            <p>
              <strong>Contact:</strong> +91 98765 43210
            </p>
            <p>
              <strong>Address:</strong> 123, Palm Street, Navi Mumbai, 400705
            </p>
            <p>
              <strong>Emergency Contact:</strong> +91 99999 88888
            </p>
          </div>

          <h4 className="text-center font-bold text-lg mt-4 underline">
            IF FOUND PLEASE RETURN TO
          </h4>

          <div className="text-center text-sm font-semibold mt-2 leading-5">
            <p>Vishweshwar Education Society's</p>
            <p className="text-red-700 font-bold text-lg leading-tight">
              Western College of Commerce & <br />
              Business Management
            </p>
            <p>Plot No. 2, Sector - 9, Sanpada, Navi Mumbai - 400705</p>
            <p>Tel.: +91 22 2775 3226 / 7 / 8</p>
            <p>Email: info@wccbm.ac.in</p>
          </div>

          <div className="bg-red-700 text-white font-bold text-center py-1 mt-4 text-sm rounded-md">
            www.wccbm.ac.in
          </div>
        </div>

        {/* ---------- BUTTONS (Visible in UI, Ignored in PDF) ---------- */}
        <div className="pdf-buttons flex justify-center gap-3 p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`px-4 py-2 rounded-lg font-medium text-white transition ${
              downloading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
