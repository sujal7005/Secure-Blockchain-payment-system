// Frontend/src/components/activity.jsx
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function RecentActivity({ transactions }) {
  
  // Calculate totals
  const totalReceived = transactions
    .filter(tx => tx.amount.includes('+'))
    .reduce((sum, tx) => sum + parseFloat(tx.amount.replace(/[^0-9.-]/g, '')), 0);
  
  const totalSent = transactions
    .filter(tx => tx.amount.includes('-'))
    .reduce((sum, tx) => sum + parseFloat(tx.amount.replace(/[^0-9.-]/g, '')), 0);

  const downloadPDF = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Transaction Report', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleString();
    doc.text(`Generated on: ${currentDate}`, 14, 30);
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Received: ₹${totalReceived.toLocaleString()}`, 14, 55);
    doc.text(`Total Sent: ₹${totalSent.toLocaleString()}`, 14, 62);
    doc.text(`Net Balance: ₹${(totalReceived - totalSent).toLocaleString()}`, 14, 69);
    doc.text(`Total Transactions: ${transactions.length}`, 14, 76);
    
    // Create transactions table
    const tableColumn = ["S.No", "Title", "Amount", "Category", "Date", "Status"];
    const tableRows = [];
    
    transactions.forEach((transaction, index) => {
      const transactionData = [
        index + 1,
        transaction.title,
        transaction.amount,
        transaction.tag,
        new Date().toLocaleDateString(),
        transaction.amount.includes('+') ? 'Credit' : 'Debit'
      ];
      tableRows.push(transactionData);
    });
    
    // Add table to PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 85 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'This is a system-generated document. For any queries, please contact support.',
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    doc.save(`transaction_report_${new Date().toISOString().slice(0,19)}.pdf`);
  };

  const downloadDetailedPDF = () => {
    // Create new PDF document with more details
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Header with gradient effect
    doc.setFillColor(0, 20, 40);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('NETRA PE', 14, 25);
    
    doc.setFontSize(12);
    doc.text('Transaction History Report', 14, 35);
    
    // Company info
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Secure Blockchain Payment System', 14, 42);
    
    // Reset position
    yPosition = 60;
    
    // Transaction Summary Box
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPosition, 182, 50, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, yPosition, 182, 50);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Transaction Summary', 20, yPosition + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPosition + 22);
    doc.text(`Total Transactions: ${transactions.length}`, 20, yPosition + 32);
    doc.text(`Date Range: ${new Date().toLocaleDateString()} - ${new Date().toLocaleDateString()}`, 20, yPosition + 42);
    
    yPosition += 70;
    
    // Financial Summary
    doc.setFillColor(240, 255, 240);
    doc.rect(14, yPosition, 88, 40, 'F');
    doc.setFillColor(255, 240, 240);
    doc.rect(108, yPosition, 88, 40, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(0, 100, 0);
    doc.text('Total Received', 20, yPosition + 12);
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 0);
    doc.text(`₹${totalReceived.toLocaleString()}`, 20, yPosition + 28);
    
    doc.setFontSize(11);
    doc.setTextColor(150, 0, 0);
    doc.text('Total Sent', 114, yPosition + 12);
    doc.setFontSize(14);
    doc.setTextColor(200, 0, 0);
    doc.text(`₹${totalSent.toLocaleString()}`, 114, yPosition + 28);
    
    yPosition += 55;
    
    // Net Balance
    const netBalance = totalReceived - totalSent;
    doc.setFillColor(230, 240, 255);
    doc.rect(14, yPosition, 182, 25, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 100);
    doc.text('Net Balance:', 20, yPosition + 17);
    doc.setFontSize(16);
    doc.setTextColor(netBalance >= 0 ? [0, 100, 0] : [150, 0, 0]);
    doc.text(`₹${netBalance.toLocaleString()}`, 80, yPosition + 17);
    
    yPosition += 40;
    
    // Detailed Transactions Table
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Detailed Transactions', 14, yPosition);
    
    const tableColumn = ["S.No", "Title", "Amount", "Category", "Date", "Time", "Status"];
    const tableRows = [];
    
    transactions.forEach((transaction, index) => {
      const currentTime = new Date().toLocaleTimeString();
      const transactionData = [
        index + 1,
        transaction.title,
        transaction.amount,
        transaction.tag,
        new Date().toLocaleDateString(),
        currentTime,
        transaction.amount.includes('+') ? 'Completed' : 'Completed'
      ];
      tableRows.push(transactionData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPosition + 10,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { left: 14, right: 14 }
    });
    
    // Add category breakdown
    const finalY = doc.lastAutoTable.finalY + 10;
    
    if (finalY < 250) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Category Breakdown', 14, finalY);
      
      // Get unique categories
      const categories = {};
      transactions.forEach(tx => {
        if (!categories[tx.tag]) {
          categories[tx.tag] = { count: 0, total: 0 };
        }
        categories[tx.tag].count++;
        categories[tx.tag].total += parseFloat(tx.amount.replace(/[^0-9.-]/g, ''));
      });
      
      let categoryY = finalY + 10;
      Object.entries(categories).forEach(([category, data]) => {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`${category}:`, 14, categoryY);
        doc.text(`${data.count} transactions - ₹${data.total.toLocaleString()}`, 60, categoryY);
        categoryY += 7;
      });
    }
    
    // Add footer with QR code placeholder
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, doc.internal.pageSize.height - 20, 196, doc.internal.pageSize.height - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        '© 2024 NETRA PE - Secure Blockchain Payment System',
        14,
        doc.internal.pageSize.height - 12
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 12
      );
      
      // Add disclaimer
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(
        'This document contains confidential transaction information.',
        14,
        doc.internal.pageSize.height - 7
      );
    }
    
    // Save the detailed PDF
    doc.save(`detailed_transaction_report_${new Date().toISOString().slice(0,19)}.pdf`);
  };
  
  const shareReport = () => {
    if (navigator.share) {
      // Create a blob from the PDF
      const doc = new jsPDF();
      doc.text('Transaction Report', 14, 20);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Total Transactions: ${transactions.length}`, 14, 40);
      doc.text(`Total Received: ₹${totalReceived.toLocaleString()}`, 14, 50);
      doc.text(`Total Sent: ₹${totalSent.toLocaleString()}`, 14, 60);
      
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], `transaction_report_${Date.now()}.pdf`, { type: 'application/pdf' });
      
      navigator.share({
        title: 'Transaction Report',
        text: 'Here is your transaction report',
        files: [file]
      }).catch(console.error);
    } else {
      alert('Share feature is not supported in this browser');
    }
  };

  return (
    <div className="bg-white/5 h-full backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
        <button className="text-gray-400 text-xs hover:text-white transition">
          View All
        </button>
      </div>
      
      <div className="space-y-3 flex-1">
        {transactions.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${tx.color.split(' ')[0]}`}></div>
              <div>
                <p className="text-white text-sm font-medium">{tx.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${tx.color}`}>
                  {tx.tag}
                </span>
              </div>
            </div>
            <p className={`text-sm font-semibold ${tx.amount.includes('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {tx.amount}
            </p>
          </div>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 text-center mb-3">
          <div className="bg-white/5 rounded-xl p-2">
            <p className="text-emerald-400 font-bold text-sm">+₹{totalReceived.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Total Received</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <p className="text-red-400 font-bold text-sm">-₹{totalSent.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Total Sent</p>
          </div>
        </div>

        {/* PDF Download Options at the Bottom */}
        <div className="space-y-2">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>
          <p className="text-gray-400 text-xs text-center mb-2">Export Report</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={downloadPDF}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-2 transition group"
              title="Download Basic PDF"
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-[10px] text-gray-400 group-hover:text-white transition">Basic</span>
              </div>
            </button>
            
            <button 
              onClick={downloadDetailedPDF}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-2 transition group"
              title="Download Detailed PDF"
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[10px] text-gray-400 group-hover:text-white transition">Detailed</span>
              </div>
            </button>
            
            <button 
              onClick={shareReport}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-2 transition group"
              title="Share Report"
            >
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-[10px] text-gray-400 group-hover:text-white transition">Share</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;