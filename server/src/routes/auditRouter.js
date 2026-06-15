const express = require('express');
const router = express.Router();

// Simulated Database to store legal audit trails securely
const auditLogsStore = new Map();

// MIDDLEWARE LOGGING UTILITY: Captures signer identity metrics automatically
const logAuditTrailMiddleware = (req, res, next) => {
  // Capture transaction metadata before finishing the response
  res.on('finish', () => {
    // Only log successful signing completions
    if (res.statusCode === 200 && req.path === '/api/sign-pdf') {
      const { targetPageNumber } = req.body;
      const fileId = req.headers['x-document-id'] || 'doc_default_101';
      const signerEmail = req.headers['x-signer-email'] || 'anonymous@client.com';
      
      // Capture network properties safely
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const auditRecord = {
        fileId,
        signerEmail,
        ipAddress,
        userAgent,
        targetPageNumber: targetPageNumber || 1,
        timestamp: new Date().toISOString(),
        action: "DOCUMENT_DIGITALLY_SIGNED",
        status: "SUCCESS"
      };

      // Store record linked directly to the specific file ID index channel
      auditLogsStore.set(fileId, auditRecord);
      console.log(`[Day 10 Audit Logger]: Audit record securely pinned for File ID: ${fileId}`);
    }
  });
  next();
};

// MANDATORY DAY 10 ROUTE: Fetch the legal audit details for a specific file
router.get('/api/audit/:fileId', (req, res) => {
  const { fileId } = req.params;
  const record = auditLogsStore.get(fileId);

  if (!record) {
    return res.status(404).json({ 
      error: `No secure audit logs found matching the file signature tracker: ${fileId}` 
    });
  }

  return res.status(200).json({
    message: "Audit trail certificate compiled successfully",
    auditTrail: record
  });
});

// Export both the router and our automatic logger middleware tool
module.exports = {
  auditRouter: router,
  logAuditTrailMiddleware
};
