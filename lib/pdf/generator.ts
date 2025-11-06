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

  const tableData = bills.map(bill => [
    format(bill.dueDate, 'dd/MM/yyyy', { locale: ptBR }),
    bill.paidDate ? format(bill.paidDate, 'dd/MM/yyyy', { locale: ptBR }) : '-',
    bill.description,
    bill.category || '-',
    bill.type === 'INCOME' ? 'Receita' : 'Despesa',
    `R$ ${bill.amount.toFixed(2)}`,
    statusMap[bill.status] || bill.status
  ])
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Vencimento', 'Data Pagamento', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status']],
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
      }
    }
  })
  
  return doc.output('arraybuffer')
}

interface ExtratoItem {
  vencimento: Date | string
  dataPagamento: Date | string | null
  valor: number
  descricao: string
  comprovante: string | null
  tipo: 'INCOME' | 'EXPENSE'
}

export async function generateExtratoContabilidade(
  startDate: Date | string,
  endDate: Date | string,
  items: ExtratoItem[],
  userName: string
) {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text('Extrato Contabilidade', 14, 22)
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  doc.setFontSize(12)
  doc.text(
    `Período: ${format(start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`,
    14,
    32
  )
  doc.text(`Usuário: ${userName}`, 14, 38)
  
  const tableData = items.map(item => {
    const vencimento = typeof item.vencimento === 'string' 
      ? new Date(item.vencimento) 
      : item.vencimento
    
    const dataPagamento = item.dataPagamento
      ? (typeof item.dataPagamento === 'string' 
          ? new Date(item.dataPagamento) 
          : item.dataPagamento)
      : null
    
    const valorFormatado = item.tipo === 'INCOME' 
      ? `+R$ ${item.valor.toFixed(2)}`
      : `-R$ ${item.valor.toFixed(2)}`
    
    const comprovante = item.comprovante ? 'Sim' : 'Não'
    
    return [
      format(vencimento, 'dd/MM/yyyy', { locale: ptBR }),
      dataPagamento ? format(dataPagamento, 'dd/MM/yyyy', { locale: ptBR }) : '-',
      valorFormatado,
      item.descricao,
      comprovante
    ]
  })
  
  autoTable(doc, {
    startY: 50,
    head: [['Vencimento', 'Data do Pagamento', 'Valor', 'Descrição', 'Comprovante']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 30 }
    }
  })
  
  return doc.output('arraybuffer')
}

