// src/screens/pages/NEWNBA/Services/NBA-PDF.service.js

import { apiNBARequest } from "../../../../_services/api";

export const nbaPDFService = {
  /**
   * Merge PDFs with different options using S3 URLs
   * @param {Array} s3Urls - Array of S3 URLs to merge
   * @param {string} mergeType - Type of merge: 'basic', 'header_footer', 'header_footer_stamp', 'stamp_signature'
   * @param {Object} imageHeaders - Object containing image URLs for stamps, signatures, headers, footers
   * @returns {Promise} - Promise resolving to merged PDF URL
   */
  async mergePDFs(s3Urls, mergeType = 'basic', imageHeaders = {}) {
    try {
      // Map merge types to correct API endpoints
      const endpointMap = {
        'basic': '/files/merge',
        'header_footer': '/files/merge-header-footer',
        'header_footer_stamp': '/files/merge-header-footer-stamp-sign',
        'stamp_signature': '/files/merge-stamp-sign'
      };

      const endpoint = endpointMap[mergeType] || endpointMap['basic'];
      
      console.log("API endpoint:", endpoint);
      console.log("Ordered URLs payload:", s3Urls);
      
      // Use correct apiNBARequest format: (url, options)
      const response = await apiNBARequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(s3Urls)
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Parse response - backend returns plain text URL
      const result = await response.text();
      
      // Validate that we got a URL
      if (!result || !result.trim()) {
        throw new Error("Empty response from merge API");
      }
      
      const mergedUrl = result.trim();
      console.log("Received merged PDF URL:", mergedUrl);
      
      // Backend returns the merged PDF URL directly as a string
      return {
        download_url: mergedUrl,
        merged_pdf_url: mergedUrl
      };
    } catch (error) {
      console.error('PDF merge failed:', error);
      
      // Enhanced error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - unable to connect to server');
      } else if (error.message.includes('API Error')) {
        throw error; // Re-throw API errors as-is
      } else {
        throw new Error(`Merge failed: ${error.message}`);
      }
    }
  }
};