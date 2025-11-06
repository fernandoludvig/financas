import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Bill {
  description: string
  amount: number
  dueDate: Date
  paidDate?: Date | null
  type: 'INCOME' | 'EXPENSE'
  status: string
  category?: string | null
  categoryColor?: string | null
  receiptUrl?: string | null
}

export async function generateMonthlyReport(
  year: number,
  month: number,
  bills: Bill[],
  userName: string
) {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text('Relatório Financeiro Mensal', 14, 22)
  
  doc.setFontSize(12)
  doc.text(`Período: ${month}/${year}`, 14, 32)
  doc.text(`Usuário: ${userName}`, 14, 38)
  
  const income = bills
    .filter(b => b.type === 'INCOME' && b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0)
    
  const expenses = bills
    .filter(b => b.type === 'EXPENSE' && b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0)
    
  const balance = income - expenses
  
  doc.setFontSize(14)
  doc.text('Resumo:', 14, 50)
  doc.setFontSize(11)
  doc.text(`Receitas: R$ ${income.toFixed(2)}`, 14, 58)
  doc.text(`Despesas: R$ ${expenses.toFixed(2)}`, 14, 64)
  doc.text(`Saldo: R$ ${balance.toFixed(2)}`, 14, 70)
  
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'PAID': 'Pago',
    'OVERDUE': 'Vencido',
    'CANCELLED': 'Cancelado'
  }

  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [59, 130, 246]
  }

  // Legenda de cores das categorias
  const uniqueCategories = Array.from(
    new Map(
      bills
        .filter(b => b.category && b.categoryColor)
        .map(b => [b.category, { category: b.category, color: b.categoryColor || '#3b82f6' }])
    ).values()
  )
  
  let tableStartY = 80
  if (uniqueCategories.length > 0) {
    let legendY = 80
    doc.setFontSize(12)
    doc.text('Legenda de Cores por Categoria:', 14, legendY)
    legendY += 8
    
    doc.setFontSize(10)
    uniqueCategories.forEach((item: any) => {
      const rgb = hexToRgb(item.color)
      doc.setFillColor(rgb[0], rgb[1], rgb[2])
      doc.rect(14, legendY - 3, 5, 5, 'F')
      doc.setTextColor(0, 0, 0)
      doc.text(`${item.category}`, 22, legendY)
      legendY += 6
      
      if (legendY > 250) {
        doc.addPage()
        legendY = 20
      }
    })
    
    tableStartY = legendY + 5
  }

  const tableData = bills.map(bill => {
    const receiptText = bill.receiptUrl 
      ? 'Sim (ver URL abaixo)' 
      : 'Não'
    
    return [
      format(bill.dueDate, 'dd/MM/yyyy', { locale: ptBR }),
      bill.paidDate ? format(bill.paidDate, 'dd/MM/yyyy', { locale: ptBR }) : '-',
      bill.description,
      bill.category || '-',
      bill.type === 'INCOME' ? 'Receita' : 'Despesa',
      `R$ ${bill.amount.toFixed(2)}`,
      statusMap[bill.status] || bill.status,
      receiptText
    ]
  })
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Vencimento', 'Data Pagamento', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status', 'Comprovante']],
    body: tableData,
    theme: 'plain',
    headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
    didParseCell: function(data: any) {
      if (data.section === 'body' && data.row.index < bills.length) {
        const bill = bills[data.row.index]
        const color = bill.categoryColor || '#3b82f6'
        const rgb = hexToRgb(color)
        data.cell.styles.fillColor = [rgb[0], rgb[1], rgb[2]]
        data.cell.styles.textColor = [255, 255, 255]
        
        // Adiciona link para comprovante se existir
        if (data.column.index === 7 && bill.receiptUrl) {
          data.cell.text = [{ text: 'Ver', link: bill.receiptUrl, color: [255, 255, 255] }]
        }
      }
    }
  })
  
  // Adiciona seção com URLs dos comprovantes no final do PDF
  const billsWithReceipt = bills.filter(b => b.receiptUrl)
  if (billsWithReceipt.length > 0) {
    try {
      const table = (doc as any).lastAutoTable
      let currentY = table && table.finalY ? table.finalY + 20 : 200
      
      // Verifica se precisa de nova página
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFontSize(12)
      doc.text('URLs dos Comprovantes:', 14, currentY)
      currentY += 8
      
      doc.setFontSize(9)
      billsWithReceipt.forEach((bill) => {
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }
        doc.setTextColor(0, 0, 255)
        const text = `${bill.description}:`
        doc.text(text, 14, currentY)
        currentY += 4
        
        // Quebra URL longa em múltiplas linhas se necessário
        const url = bill.receiptUrl || ''
        const maxWidth = 180
        const urlLines = doc.splitTextToSize(url, maxWidth)
        doc.text(urlLines, 14, currentY)
        currentY += (urlLines.length * 4) + 2
      })
    } catch (error) {
      console.error('Erro ao adicionar URLs dos comprovantes:', error)
      // Continua mesmo se houver erro ao adicionar URLs
    }
  }
  
  return doc.output('arraybuffer')
}

