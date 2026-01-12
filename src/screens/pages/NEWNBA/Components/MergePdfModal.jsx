// src/screens/pages/NEWNBA/MergePdfModal.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Download, FileText, CheckSquare, Square, Settings, Image, ChevronDown, ChevronRight } from "lucide-react";
import { nbaPDFService } from "../Services/NBA-PDF.service";

const MergePdfModal = ({ isOpen, onClose, pdfFiles = [], onMergeComplete, onFileAdd }) => {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [merging, setMerging] = useState(false);
  const [filename, setFilename] = useState("merged_document.pdf");
  const [mergeOption, setMergeOption] = useState("basic");
  const [mergeOptions, setMergeOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Image selection for stamps, signatures, headers/footers
  const [selectedStampImage, setSelectedStampImage] = useState(null);
  const [selectedSignatureImage, setSelectedSignatureImage] = useState(null);
  const [selectedHeaderImage, setSelectedHeaderImage] = useState(null);
  const [selectedFooterImage, setSelectedFooterImage] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);
  const [showFileAssignment, setShowFileAssignment] = useState(false);

  // Set hardcoded merge options on component mount
  useEffect(() => {
    if (isOpen) {
      setMergeOptions([
        { value: 'basic', label: 'Basic Merge', description: 'Simple PDF merge without any additional formatting' },
        { value: 'header_footer', label: 'With Header Footer', description: 'Merge with header and footer on each page' },
        { value: 'header_footer_stamp', label: 'Header Footer Stamp', description: 'Merge with header, footer, and institutional stamp' },
        { value: 'stamp_signature', label: 'Stamp and Signature', description: 'Merge with official stamp and signature' }
      ]);
      setLoadingOptions(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!pdfFiles || pdfFiles.length === 0) {
      setFiles([]);
      setAvailableImages([]);
      return;
    }

    // Filter PDF and image files for merging
    const mergeableFiles = pdfFiles.filter(f => {
      const fname = f.filename || f.name || "";
      const ext = fname.toLowerCase();
      return ext.endsWith(".pdf") || ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".gif");
    });

    console.log("Filtered mergeable files:", mergeableFiles);

    // Only update if the ids actually changed
    const incomingIds = mergeableFiles.map(f => f.id).join(",");
    const currentIds = files.map(f => f.id).join(",");

    if (incomingIds !== currentIds) {
      const sorted = mergeableFiles.map(f => ({ ...f, checked: true }));
      setFiles(sorted);
      setSelected(new Set(sorted.map(f => f.id)));
    }

    // Add all files (PDFs + Images) to available images for visual selection
    setAvailableImages(mergeableFiles);
  }, [pdfFiles]);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === files.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(files.map(f => f.id)));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setFiles(items);
  };


  const merge = async () => {
    const toMerge = files.filter(f => selected.has(f.id));
    if (toMerge.length < 2) {
      alert("Select at least 2 PDFs to merge");
      return;
    }

    setMerging(true);
    try {
      console.log(`Using API merge with option: ${mergeOption}`);
      
      // Arrange files in correct sequence based on merge option
      let orderedUrls = [];
      
      if (mergeOption === 'header_footer') {
        // Sequence: Header, PDFs, Footer
        if (selectedHeaderImage && selectedHeaderImage.s3Url) {
          orderedUrls.push(selectedHeaderImage.s3Url);
        }
        // Add PDF URLs
        const pdfUrls = toMerge.map(f => f.s3Url).filter(url => url);
        orderedUrls.push(...pdfUrls);
        // Add footer at the end
        if (selectedFooterImage && selectedFooterImage.s3Url) {
          orderedUrls.push(selectedFooterImage.s3Url);
        }
      }
      else if (mergeOption === 'header_footer_stamp') {
        // Sequence: Header, PDFs, Stamp, Footer
        if (selectedHeaderImage && selectedHeaderImage.s3Url) {
          orderedUrls.push(selectedHeaderImage.s3Url);
        }
        // Add PDF URLs
        const pdfUrls = toMerge.map(f => f.s3Url).filter(url => url);
        orderedUrls.push(...pdfUrls);
        // Add stamp before footer
        if (selectedStampImage && selectedStampImage.s3Url) {
          orderedUrls.push(selectedStampImage.s3Url);
        }
        // Add footer at the end
        if (selectedFooterImage && selectedFooterImage.s3Url) {
          orderedUrls.push(selectedFooterImage.s3Url);
        }
      }
      else if (mergeOption === 'stamp_signature') {
        // Sequence: PDFs, Stamp+Signature (combined as one image at the end)
        const pdfUrls = toMerge.map(f => f.s3Url).filter(url => url);
        orderedUrls.push(...pdfUrls);
        // Add stamp+signature as last item (use stamp image as the combined stamp+signature)
        if (selectedStampImage && selectedStampImage.s3Url) {
          orderedUrls.push(selectedStampImage.s3Url);
        }
      }
      else {
        // Basic merge - just PDFs
        orderedUrls = toMerge.map(f => f.s3Url).filter(url => url);
      }
      
      if (orderedUrls.length === 0) {
        throw new Error("No valid file URLs found for merging.");
      }
      
      console.log("Ordered URLs for merge:", orderedUrls);
      console.log("Merge sequence:", {
        mergeOption,
        header: selectedHeaderImage?.filename,
        footer: selectedFooterImage?.filename,
        stamp: selectedStampImage?.filename,
        signature: selectedSignatureImage?.filename
      });
      
      // Call API service for merge with ordered URLs
      const response = await nbaPDFService.mergePDFs(orderedUrls, mergeOption, {});
      
      console.log("API merge successful, response:", response);
      
      // Extract the merged PDF URL from response
      const mergedPdfUrl = response.download_url || response.merged_pdf_url || response;
      
      if (mergedPdfUrl && typeof mergedPdfUrl === 'string') {
        // Create merged document object to add to file list
        const mergedDocument = {
          id: `merged_${Date.now()}`,
          filename: filename || "merged_document.pdf",
          s3Url: mergedPdfUrl,
          description: `Merged PDF (${mergeOptions.find(opt => opt.value === mergeOption)?.label})`,
          uploadedAt: new Date().toISOString(),
          isMerged: true
        };
        
        // Add merged document to file list if callback is provided
        if (onFileAdd) {
          onFileAdd(mergedDocument);
        }
        
        // Show success message with option to save
        alert(`PDF merge completed successfully! The merged document "${filename}" has been added to your files.`);
      } else {
        throw new Error("Invalid response from merge API - no URL received");
      }

      onClose();
    } catch (e) {
      console.error("Merge failed:", e);
      
      // Enhanced error handling
      let errorMessage = "PDF merge failed. ";
      
      if (e.message) {
        errorMessage += e.message;
      } else if (e.response) {
        // Handle HTTP response errors
        errorMessage += `Server error: ${e.response.status} ${e.response.statusText}`;
      } else if (e.name === 'TypeError') {
        errorMessage += "Network error - please check your connection.";
      } else {
        errorMessage += "Unknown error occurred.";
      }
      
      alert(errorMessage);
    } finally {
      setMerging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        <div className="p-6 bg-[#2163c1] text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" /> Merge PDFs ({selected.size} selected)
            </h2>
            {!loadingOptions && mergeOptions.length > 0 && (
              <p className="text-blue-100 text-sm mt-1">
                Mode: {mergeOptions.find(opt => opt.value === mergeOption)?.label || 'Basic Merge'}
              </p>
            )}
          </div>
          <button onClick={onClose}><X className="w-8 h-8" /></button>
        </div>

        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No PDF files to merge</p>
              <p className="text-sm mt-2">Upload PDF files to enable merging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <button onClick={toggleAll} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {selected.size === files.length ? <CheckSquare /> : <Square />} {selected.size === files.length ? "Deselect" : "Select"} All
              </button>
              <span className="text-sm text-gray-600">{files.length} PDF file(s) available</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="merge-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {files.map((file, i) => (
                        <Draggable key={file.id} draggableId={file.id} index={i}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}
                              className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${selected.has(file.id) ? "bg-purple-50 border-purple-500" : "bg-gray-50 border-gray-300"} ${snapshot.isDragging ? "shadow-2xl" : ""}`}>
                              <div {...provided.dragHandleProps} className="cursor-grab"><GripVertical className="w-6 h-6 text-gray-500" /></div>
                              <button onClick={() => toggle(file.id)} className="flex-shrink-0">
                                {selected.has(file.id) ? 
                                  <CheckSquare className="w-6 h-6 text-purple-600" /> : 
                                  <Square className="w-6 h-6 text-gray-400" />
                                }
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{file.filename || file.name}</p>
                                {file.description && <p className="text-sm text-gray-600 truncate">{file.description}</p>}
                              </div>
                              {(file.filename || file.name || "").toLowerCase().endsWith('.pdf') ? (
                                <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                              ) : (
                                <Image className="w-5 h-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </>
        )}

        {files.length > 0 && (
          <div className="p-6 border-t bg-gray-50 space-y-4">
            {/* Merge Options Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Merge Options</label>
              </div>
              
              {loadingOptions ? (
                <div className="text-sm text-gray-500">Loading merge options...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mergeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        mergeOption === option.value
                          ? 'border-[#2163c1] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setMergeOption(option.value)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                          mergeOption === option.value
                            ? 'border-[#2163c1] bg-[#2163c1]'
                            : 'border-gray-300'
                        }`}>
                          {mergeOption === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{option.label}</h4>
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible File Assignment for Headers/Footers/Stamps/Signatures */}
            {mergeOption !== 'basic' && availableImages.length > 0 && (
              <div className="space-y-3">
                {/* Toggle Button */}
                <button
                  onClick={() => setShowFileAssignment(!showFileAssignment)}
                  className="flex items-center gap-2 w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showFileAssignment ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                  <Image className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Configure Files for {mergeOptions.find(opt => opt.value === mergeOption)?.label}
                  </span>
                  {/* Show selected count */}
                  {(selectedHeaderImage || selectedFooterImage || selectedStampImage || selectedSignatureImage) && (
                    <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {[selectedHeaderImage, selectedFooterImage, selectedStampImage, selectedSignatureImage].filter(Boolean).length} selected
                    </span>
                  )}
                </button>

                {/* Collapsible Content */}
                {showFileAssignment && (
                  <>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      <div className="divide-y divide-gray-100">
                        {availableImages.map((file) => {
                          const isImage = file.filename?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/);
                          
                          return (
                            <div key={file.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                {isImage ? (
                                  <Image className="w-3 h-3 text-green-600 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-3 h-3 text-red-600 flex-shrink-0" />
                                )}
                                <span className="text-xs truncate" title={file.filename || file.name}>
                                  {file.filename || file.name}
                                </span>
                              </div>
                              
                              {/* Compact Assignment Buttons */}
                              <div className="flex gap-1">
                                {/* Header Button */}
                                {(mergeOption === 'header_footer' || mergeOption === 'header_footer_stamp') && (
                                  <button
                                    onClick={() => setSelectedHeaderImage(selectedHeaderImage?.id === file.id ? null : file)}
                                    className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                      selectedHeaderImage?.id === file.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    title="Use as Header"
                                  >
                                    H
                                  </button>
                                )}
                                
                                {/* Footer Button */}
                                {(mergeOption === 'header_footer' || mergeOption === 'header_footer_stamp') && (
                                  <button
                                    onClick={() => setSelectedFooterImage(selectedFooterImage?.id === file.id ? null : file)}
                                    className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                      selectedFooterImage?.id === file.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    title="Use as Footer"
                                  >
                                    F
                                  </button>
                                )}
                                
                                {/* Stamp Button */}
                                {(mergeOption === 'header_footer_stamp' || mergeOption === 'stamp_signature') && (
                                  <button
                                    onClick={() => setSelectedStampImage(selectedStampImage?.id === file.id ? null : file)}
                                    className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                      selectedStampImage?.id === file.id
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    title="Use as Stamp"
                                  >
                                    S
                                  </button>
                                )}
                                
                                {/* Signature Button */}
                                {mergeOption === 'stamp_signature' && (
                                  <button
                                    onClick={() => setSelectedSignatureImage(selectedSignatureImage?.id === file.id ? null : file)}
                                    className={`w-6 h-6 text-xs rounded flex items-center justify-center ${
                                      selectedSignatureImage?.id === file.id
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    title="Use as Signature"
                                  >
                                    G
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Compact Selected Files Summary */}
                    {(selectedHeaderImage || selectedFooterImage || selectedStampImage || selectedSignatureImage) && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex flex-wrap gap-3">
                        {selectedHeaderImage && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">H: {selectedHeaderImage.filename}</span>}
                        {selectedFooterImage && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">F: {selectedFooterImage.filename}</span>}
                        {selectedStampImage && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">S: {selectedStampImage.filename}</span>}
                        {selectedSignatureImage && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">G: {selectedSignatureImage.filename}</span>}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Filename Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Output Filename</label>
              <input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value || "merged.pdf")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="merged_document.pdf"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={onClose}
                disabled={merging}
                className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={merge}
                disabled={merging || selected.size < 2 || loadingOptions}
                className="px-8 py-3 bg-[#2163c1] text-white font-bold rounded-lg hover:bg-[#1a4a9e] disabled:opacity-50 transition flex items-center gap-3"
              >
                {merging ? "Merging..." : <><Download className="w-5 h-5" /> Merge PDFs</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MergePdfModal;