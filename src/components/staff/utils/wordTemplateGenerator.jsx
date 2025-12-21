import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export async function generateWordTemplate(order) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          children: [
            new TextRun({
              text: '---> WORD TEMPLATE',
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),

        // Order number and date
        new Paragraph({
          children: [
            new TextRun({
              text: `FUND TRANSFER ORDER № ${order.order_number || '___________'}`,
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 200 },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: `DATE: ${order.created_date ? new Date(order.created_date).toLocaleDateString('en-GB').replace(/\//g, '/') : '___________'}`,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),

        // Customer line
        new Paragraph({
          children: [
            new TextRun({
              text: `By this Order, the Customer, `,
              size: 22,
            }),
            new TextRun({
              text: order.client_id || '___________',
              bold: true,
              highlight: 'yellow',
              size: 22,
            }),
            new TextRun({
              text: ` <-- join from `,
              size: 22,
            }),
            new TextRun({
              text: 'CL1',
              bold: true,
              highlight: 'yellow',
              size: 22,
            }),
            new TextRun({
              text: ' clients',
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        }),

        // Transfer details header
        new Paragraph({
          children: [
            new TextRun({
              text: 'TRANSFER DETAILS:',
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        }),

        // Transfer amount
        createDetailParagraph('Transfer amount', order.amount?.toString() || '___________', true),
        createDetailParagraph('Currency', order.currency || '___________', true),
        createDetailParagraph('Beneficiary name', order.beneficiary_name || '___________', true),
        createDetailParagraph('Beneficiary address', order.beneficiary_address || '___________', true),
        createDetailParagraph('Beneficiary country', order.country_bank || '___________', true),
        createDetailParagraph('Beneficiary registration number', '___________'),
        createDetailParagraph('Beneficiary bank', order.bank_name || '___________'),
        createDetailParagraph('BIC', order.bic || '___________', true),
        createDetailParagraph('Bank address', order.bank_address || '___________'),
        createDetailParagraph('Account number', order.destination_account || '___________', true),
        createDetailParagraph('Payment purpose:', order.transaction_remark || '___________', true),
        createDetailParagraph('Payment type (Payment, Prepayment)', 'Payment'),
        createDetailParagraph('Subject of payment', '___________'),
        createDetailParagraph('(Goods, Services)', ''),
        createDetailParagraph('Document basis (Contract, Invoice)', ''),
        createDetailParagraph('Document number', '___________'),
        createDetailParagraph('Document date', '___________'),

        // Order's terms
        new Paragraph({
          children: [
            new TextRun({
              text: "ORDER'S TERMS:",
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 300, after: 100 },
        }),

        createDetailParagraph('Remuneration (% of Transfer amount)', order.remuneration_percent ? `${order.remuneration_percent}%` : '___________', true),
        createDetailParagraph('Remuneration amount', order.sum_to_be_paid ? (order.amount * (order.remuneration_percent / 100)).toFixed(2) : '___________', true),
        createDetailParagraph('Total amount of payment in favor', '___________'),
        createDetailParagraph('- in words', '___________'),
        createDetailParagraph('- currency', order.currency_to_be_paid || order.currency || '___________'),
        createDetailParagraph('Currency of monetary settlement', '___________'),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'If, within the specified period, the...',
              size: 20,
              italics: true,
            }),
          ],
          spacing: { before: 200 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

function createDetailParagraph(label, value, highlight = false) {
  const children = [
    new TextRun({
      text: `${label}${label.endsWith(':') ? ' ' : ''}`,
      size: 22,
    }),
  ];

  if (value) {
    children.push(new TextRun({
      text: value,
      bold: true,
      highlight: highlight ? 'yellow' : undefined,
      size: 22,
    }));
  }

  return new Paragraph({
    children,
    spacing: { after: 100 },
  });
}

export async function downloadWordTemplate(order) {
  const blob = await generateWordTemplate(order);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Fund_Transfer_Order_${order.order_number || order.id}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}