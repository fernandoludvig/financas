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

  const tableData = bills.map(bill => [
    format(bill.dueDate, 'dd/MM/yyyy', { locale: ptBR }),
    bill.paidDate ? format(bill.paidDate, 'dd/MM/yyyy', { locale: ptBR }) : '-',
    bill.description,
    bill.category || '-',
    bill.type === 'INCOME' ? 'Receita' : 'Despesa',
    `R$ ${bill.amount.toFixed(2)}`,
    statusMap[bill.status] || bill.status
  ])
  
  const alternateRowStyles = bills.map((bill) => {
    const color = bill.categoryColor || '#3b82f6'
    const rgb = hexToRgb(color)
    return {
      fillColor: [rgb[0], rgb[1], rgb[2]],
      textColor: [255, 255, 255]
    }
  })
  
  autoTable(doc, {
    startY: 80,
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

